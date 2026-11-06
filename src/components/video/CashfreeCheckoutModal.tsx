import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, AlertCircle, Clock, RefreshCw, X, CreditCard, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { VideoGuide } from '../../types';

interface Props {
  video: VideoGuide;
  onClose: () => void;
  onPaymentSuccess: (videoId: string, phone: string, sessionToken?: string) => void;
}

type ModalTab = 'purchase' | 'restore';
type PaymentStep = 'form' | 'creating' | 'cashfree_checkout' | 'verifying' | 'success' | 'failed';

export const CashfreeCheckoutModal: React.FC<Props> = ({ video, onClose, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('purchase');
  const [step, setStep] = useState<PaymentStep>('form');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [isGatewayLive, setIsGatewayLive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate 10-digit Indian mobile number
  const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
  const isPhoneValid = sanitizedPhone.length === 10;

  // 1. Create Cashfree Order
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setErrorMessage(null);
    setStep('creating');
    setStatusMessage('Initiating secure Cashfree payment order...');

    try {
      const response = await fetch('/api/video/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.id,
          customerPhone: sanitizedPhone,
          customerEmail: customerEmail.trim() || undefined,
          customerName: customerName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order.');
      }

      // Check if user already owned this video
      if (data.alreadyPurchased) {
        setStep('success');
        setStatusMessage('Active access found! Unlocking your masterclass now...');
        setTimeout(() => {
          onPaymentSuccess(video.id, sanitizedPhone);
        }, 1200);
        return;
      }

      setActiveOrderId(data.orderId);
      setPaymentSessionId(data.paymentSessionId);
      setIsGatewayLive(Boolean(data.gatewayConfigured));
      setStep('cashfree_checkout');

      // Attempt to load and trigger Cashfree Web SDK if in browser
      if (data.gatewayConfigured && typeof window !== 'undefined') {
        launchCashfreeSdk(data.paymentSessionId, data.orderId, data.environment);
      }
    } catch (err: any) {
      setStep('failed');
      setErrorMessage(err.message || 'Could not initiate payment order.');
    }
  };

  // Launch Cashfree SDK if available
  const launchCashfreeSdk = (sessionId: string, orderId: string, env: string) => {
    const cfScriptId = 'cashfree-js-sdk-v3';
    let script = document.getElementById(cfScriptId) as HTMLScriptElement;

    const onScriptLoaded = () => {
      const cashfreeInstance = (window as any).Cashfree?.({
        mode: env === 'PRODUCTION' ? 'production' : 'sandbox',
      });

      if (!cashfreeInstance) {
        setStep('failed');
        setErrorMessage('Cashfree checkout could not be loaded. Please check your connection and try again. No payment has been confirmed.');
        return;
      }

      cashfreeInstance.checkout({
        paymentSessionId: sessionId,
      }).then((result: any) => {
        if (result?.error) {
          setStep('failed');
          setErrorMessage(result.error.message || 'Cashfree could not open the payment page. Please try again.');
          return;
        }
        if (result?.paymentDetails) {
          handleVerifyPayment(orderId);
        }
      }).catch((error: any) => {
        setStep('failed');
        setErrorMessage(error?.message || 'Cashfree checkout could not be started. Please try again.');
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = cfScriptId;
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = onScriptLoaded;
      script.onerror = () => {
        setStep('failed');
        setErrorMessage('Cashfree checkout could not be loaded. Please check your internet connection and try again.');
      };
      document.body.appendChild(script);
    } else if ((window as any).Cashfree) {
      onScriptLoaded();
    } else {
      script.addEventListener('load', onScriptLoaded, { once: true });
      script.addEventListener('error', () => {
        setStep('failed');
        setErrorMessage('Cashfree checkout could not be loaded. Please check your internet connection and try again.');
      }, { once: true });
    }
  };

  // 2. Server-side Payment Verification
  const handleVerifyPayment = async (orderIdToVerify?: string) => {
    const targetOrderId = orderIdToVerify || activeOrderId;
    if (!targetOrderId) return;

    setStep('verifying');
    setStatusMessage('Verifying payment confirmation with Cashfree...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/video/verify-payment', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: targetOrderId,
          customerPhone: sanitizedPhone,
          customerEmail: customerEmail.trim() || undefined,
          videoId: video.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.isPaid) {
        setStep('success');
        setStatusMessage('Payment verified! Video masterclass unlocked successfully.');
        setTimeout(() => {
          onPaymentSuccess(video.id, sanitizedPhone, data.sessionToken);
        }, 1500);
      } else {
        setStep('failed');
        setErrorMessage(
          data.error ||
          data.message ||
          'Payment verification failed: The payment was not completed or was cancelled.'
        );
      }
    } catch (err: any) {
      setStep('failed');
      setErrorMessage(err.message || 'Network error verifying payment.');
    }
  };

  // 3. Secure Two-Factor OTP Restore Access Handlers
  const [restoreOtpSent, setRestoreOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');

  const handleRequestRestoreOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setErrorMessage('Please enter your 10-digit registered mobile number.');
      return;
    }

    setStep('verifying');
    setStatusMessage('Checking 2-Factor SMS OTP verification service...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/video/restore-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_otp',
          videoId: video.id,
          customerPhone: sanitizedPhone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.otpConfigured) {
        setStep('form');
        setRestoreOtpSent(true);
        setStatusMessage(data.message || 'OTP sent successfully.');
      } else {
        setStep('form');
        setErrorMessage(
          data.error ||
          'Two-Factor SMS OTP verification service is not configured on this server. To protect customer purchases from unauthorized access, restoring access by mobile number alone is strictly disabled. Please contact support at tanshuonline@gmail.com with your Cashfree payment receipt or order ID to restore your access.'
        );
      }
    } catch (err: any) {
      setStep('form');
      setErrorMessage(err.message || 'Network error checking access restoration service.');
    }
  };

  const handleVerifyRestoreOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 4 to 6 digit OTP sent to your phone.');
      return;
    }

    setStep('verifying');
    setStatusMessage('Verifying OTP code...');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/video/restore-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          videoId: video.id,
          customerPhone: sanitizedPhone,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.authorized) {
        setStep('success');
        setStatusMessage('Two-Factor identity confirmed! Loading player...');
        setTimeout(() => {
          onPaymentSuccess(video.id, sanitizedPhone, data.sessionToken);
        }, 1200);
      } else {
        setStep('form');
        setErrorMessage(data.error || 'Two-Factor verification failed. Access denied.');
      }
    } catch (err: any) {
      setStep('form');
      setErrorMessage(err.message || 'Verification service error.');
    }
  };

  const videoPrice = video.price || 99;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Tanshu Premium Video Unlock
              </div>
              <h3 className="text-sm font-extrabold text-white truncate max-w-xs">
                {video.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('purchase');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'purchase'
                ? 'border-amber-500 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Buy Masterclass (₹{videoPrice})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('restore');
              setStep('form');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center font-bold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'restore'
                ? 'border-blue-600 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Already Purchased? Restore
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Video Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-16 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 to-slate-950" />
              <Lock className="w-4 h-4 text-amber-400 relative z-10" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-500 mb-0.5">
                Instructor: {video.instructor} • {video.category}
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                {video.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="flex items-center gap-1 text-slate-500 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Full Duration: {video.duration}</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-extrabold text-emerald-700">
                  ₹{videoPrice} (One-Time)
                </span>
              </div>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* State: Form */}
          {step === 'form' && (
            <>
              {activeTab === 'purchase' ? (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3 py-2.5 bg-white border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 transition-all outline-hidden"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Your video access entitlement will be linked directly to this mobile number.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ramesh Kumar"
                        className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Receipt (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ramesh@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Payment Features Checklist */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-1.5 text-[11px] text-amber-950">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Premium video playback after payment verification</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Supported Payment Methods: UPI (PhonePe, GPay, Paytm), Cards, NetBanking</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Secured by Cashfree Payments 256-Bit SSL encryption</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isPhoneValid}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Pay ₹{videoPrice} Securely via Cashfree</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                    <strong className="block font-bold text-blue-950 mb-0.5">Account Security Policy:</strong>
                    To protect customer purchases from unauthorized viewing, access restoration requires Two-Factor SMS OTP verification to your registered mobile number.
                  </div>

                  {!restoreOtpSent ? (
                    <form onSubmit={handleRequestRestoreOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Registered Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="98765 43210"
                            className="w-full pl-12 pr-3 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 transition-all outline-hidden"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          A 2-Factor verification code will be sent to this number to verify ownership.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={!isPhoneValid}
                        className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <span>Send Verification OTP (2FA)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyRestoreOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Enter Verification OTP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-mono font-bold tracking-widest text-slate-900 placeholder:text-slate-400 transition-all outline-hidden text-center"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Sent to +91 {sanitizedPhone}
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Verify OTP & Unlock Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* State: Creating Order */}
          {step === 'creating' && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <div className="text-sm font-bold text-slate-900">Creating Order Session...</div>
              <div className="text-xs text-slate-500">{statusMessage}</div>
            </div>
          )}

          {/* State: Cashfree Checkout Active */}
          {step === 'cashfree_checkout' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Payment Order Initiated
                </h4>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  Order ID: <strong className="text-slate-900">{activeOrderId}</strong>
                </div>
                <div className="text-sm font-black text-emerald-700 mt-1">
                  Amount: ₹{videoPrice} INR
                </div>
              </div>

              {isGatewayLive ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Cashfree payment window is opening. Please complete payment using UPI QR, Card, or Netbanking.
                  </p>
                  <button
                    onClick={() => handleVerifyPayment()}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    I Have Completed Payment — Verify Now
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Gateway Credentials Pending</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Live Cashfree API keys (CASHFREE_APP_ID & CASHFREE_SECRET_KEY) are awaiting configuration in Cloudflare Pages settings. Online checkout is temporarily disabled. Simulated payments are strictly prohibited for security.
                  </p>
                  <div className="text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-amber-200">
                    For purchase inquiries or manual activation, please contact <strong className="text-slate-900">tanshuonline@gmail.com</strong>.
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
              >
                Cancel and Return
              </button>
            </div>
          )}

          {/* State: Verifying */}
          {step === 'verifying' && (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="text-sm font-bold text-slate-900">Verifying Payment...</div>
              <div className="text-xs text-slate-500">{statusMessage}</div>
            </div>
          )}

          {/* State: Success */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-3 text-emerald-700">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                Payment Confirmed & Access Granted!
              </h4>
              <p className="text-xs text-slate-600 max-w-xs">{statusMessage}</p>
            </div>
          )}

          {/* State: Failed */}
          {step === 'failed' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
