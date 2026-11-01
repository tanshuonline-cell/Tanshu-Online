import React, { useState } from 'react';
import { X, ShieldCheck, Phone, Mail, Sparkles, CheckCircle2, AlertCircle, Info, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdminNavigate?: () => void;
}

export const CustomerAuthModal: React.FC<Props> = ({ isOpen, onClose, onAdminNavigate }) => {
  const { t, isHindi } = useLanguage();
  const [authMode, setAuthMode] = useState<'otp' | 'google'>('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setOtpNotice(
        isHindi
          ? 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    // Genuine environment check: No fake SMS OTP simulator
    setOtpNotice(
      isHindi
        ? 'सूचना: इस स्थानीय वातावरण में SMS गेटवे (Fast2SMS/MSG91) कॉन्फ़िगर नहीं है। प्रीमियम वीडियो का एक्सेस कैशफ्री (Cashfree) भुगतान के बाद सीधे अनलॉक होता है। सभी 89 टूल्स और फ्री गाइड्स बिना लॉगिन के 100% निशुल्क उपलब्ध हैं।'
        : 'Notice: SMS Gateway (Fast2SMS/MSG91) is not configured in this local environment. Paid video access is automatically granted upon verified Cashfree Checkout. All 89 tools and free guides remain 100% free to use without login.'
    );
  };

  const handleGoogleClick = () => {
    // Genuine environment check: No fake Google token generator
    setGoogleNotice(
      isHindi
        ? 'सूचना: Google Sign-In OAuth क्लाइंट आईडी क्लाउडफ़्लेयर प्रोडक्शन सीक्रेट्स में सेटअप होने पर सक्रिय होगी। आप बिना किसी लॉगिन के सभी टूल्स व फ्री वीडियो का उपयोग कर सकते हैं।'
        : 'Notice: Google Sign-In OAuth client credentials are not configured in this local environment. All public tools and free masterclasses are completely open and free without login.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-auth-title"
      >
        {/* Header Bar */}
        <div className="bg-[#0A1324] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="customer-auth-title" className="text-sm font-bold tracking-tight text-white">
                {isHindi ? 'ग्राहक पोर्टल एवं वीडियो एक्सेस' : 'Customer Portal & Access'}
              </h3>
              <p className="text-[10px] text-slate-400">
                TANSHU ONLINE · Citizen Utility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Public Browsing Assurance Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-5 py-3 text-emerald-900 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-emerald-950">
              {isHindi ? '100% निशुल्क सार्वजनिक उपयोग:' : '100% Free Public Browsing:'}
            </strong>{' '}
            {isHindi
              ? 'वेबसाइट, सभी 89 टूल्स, सरकारी सेवाएं और 6 फ्री वीडियो गाइड्स देखने के लिए किसी लॉगिन की आवश्यकता नहीं है।'
              : 'You do not need to log in to browse the website, use all 89 tools, or watch free video guides. Sign in is only needed to view your purchased Premium courses.'}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Method Selector Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setOtpNotice(null);
                setGoogleNotice(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'otp' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHindi ? 'मोबाइल नंबर (OTP)' : 'Mobile (OTP)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setOtpNotice(null);
                setGoogleNotice(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'google' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              <span>{isHindi ? 'Google साइन-इन' : 'Google Sign-In'}</span>
            </button>
          </div>

          {authMode === 'otp' ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'पंजीकृत मोबाइल नंबर' : 'Mobile Number'}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 bg-white overflow-hidden">
                  <span className="px-3 py-2 bg-slate-50 text-slate-600 text-xs font-semibold border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>{isHindi ? 'सत्यापन कोड (OTP) भेजें' : 'Send Verification OTP'}</span>
              </button>

              {otpNotice && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{otpNotice}</span>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full py-2.5 px-4 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold shadow-2xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isHindi ? 'Google के साथ आगे बढ़ें' : 'Continue with Google'}</span>
              </button>

              {googleNotice && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{googleNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Admin link helper */}
          {onAdminNavigate && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{isHindi ? 'प्रशासक पोर्टल:' : 'Portal Administration:'}</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAdminNavigate();
                }}
                className="text-blue-700 hover:text-blue-900 font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Login (/admin)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
