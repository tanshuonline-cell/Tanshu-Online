import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import type { SevaService } from './serviceCatalog';
import { SEVA_SERVICES } from './serviceCatalog';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';
import { getAutoPaymentQuote } from './autoPaymentPricing';
import BookingPolicyConsent, { TERMS_POLICY_VERSION, REFUND_POLICY_VERSION } from './BookingPolicyConsent';

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: '_modal' }) => Promise<any>;
    };
  }
}

async function loadCashfreeSdk(): Promise<void> {
  if (window.Cashfree) return;
  await new Promise<void>((resolve, reject) => {
    const source = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    let script = document.querySelector<HTMLScriptElement>(`script[src="${source}"]`);
    const created = !script;
    if (!script) script = document.createElement('script');
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Cashfree Checkout could not be loaded. Please check your connection and retry.')), { once: true });
    if (created) { script.src = source; script.async = true; document.head.appendChild(script); }
  });
  if (!window.Cashfree) throw new Error('Cashfree Checkout did not initialise. Please retry.');
}

export interface PrepaidDigitalSevaPayment {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  consent: true;
  termsAccepted: true;
  termsAcceptedAt: string;
  refundPolicyAccepted: true;
  refundAcceptedAt: string;
}

interface Props {
  language: 'en' | 'hi';
  onClose: () => void;
  initialServiceId?: string;
  onPaid: (service: SevaService, payment: PrepaidDigitalSevaPayment) => void;
}

export default function DigitalSevaPayNow({ language, onClose, initialServiceId, onPaid }: Props) {
  const hi = language === 'hi';
  const [selectedId, setSelectedId] = useState(initialServiceId || 'pan-new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundAccepted, setRefundAccepted] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState('');
  const [refundAcceptedAt, setRefundAcceptedAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState('');
  const [cashfreeMode, setCashfreeMode] = useState<'sandbox' | 'production'>('sandbox');

  const selected = useMemo(() => SEVA_SERVICES.find((service) => service.id === selectedId) || null, [selectedId]);
  const quote = selected ? getAutoPaymentQuote(selected) : null;
  const disclosure = selected ? getServiceFeeDisclosure(selected) : null;
  const enabledServices = SEVA_SERVICES;

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem('tanshu-ds-pending-checkout-v1');
      if (!saved) return;
      const data = JSON.parse(saved) as { orderId?: string; serviceId?: string; name?: string; phone?: string; email?: string; termsAcceptedAt?: string; refundAcceptedAt?: string };
      if (!data.orderId || !data.serviceId || !SEVA_SERVICES.some((service) => service.id === data.serviceId)) return;
      setSelectedId(data.serviceId);
      setName(data.name || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setPendingOrderId(data.orderId);
      setContactConsent(true);
      setTermsAccepted(true);
      setRefundAccepted(true);
      setTermsAcceptedAt(data.termsAcceptedAt || new Date().toISOString());
      setRefundAcceptedAt(data.refundAcceptedAt || new Date().toISOString());
    } catch { /* invalid recovery data is ignored */ }
  }, []);
  const verifyAndContinue = async (orderId: string) => {
    const response = await fetch('/api/digital-seva/verify-checkout', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.paid) {
      throw new Error(data.error || (hi ? 'भुगतान अभी Cashfree से पुष्टि नहीं हुआ है। दोबारा भुगतान न करें; कुछ देर बाद जाँचें।' : 'Cashfree has not confirmed this payment yet. Do not pay again; check again shortly.'));
    }
    if (!selected || data.serviceId !== selected.id) throw new Error('The verified payment does not match the selected service.');
    const payment: PrepaidDigitalSevaPayment = {
      orderId,
      customerName: name.trim(),
      customerPhone: phone.replace(/\D/g, ''),
      customerEmail: email.trim(),
      consent: true,
      termsAccepted: true,
      termsAcceptedAt: termsAcceptedAt || new Date().toISOString(),
      refundPolicyAccepted: true,
      refundAcceptedAt: refundAcceptedAt || new Date().toISOString()
    };
    try { window.sessionStorage.setItem('tanshu-ds-paid-checkout-v1', JSON.stringify({ serviceId: selected.id, payment })); window.sessionStorage.removeItem('tanshu-ds-pending-checkout-v1'); } catch { /* session storage is optional */ }
    onPaid(selected, payment);
  };

  const pay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!selected || !quote) {
      setError(hi ? 'इस सेवा का निश्चित ऑनलाइन शुल्क अभी सक्रिय नहीं है।' : 'A fixed online price is not enabled for this service yet.');
      return;
    }
    if (!name.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, '')) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(hi ? 'कृपया सही नाम, 10 अंकों का मोबाइल और ईमेल भरें।' : 'Enter your name, a valid 10-digit mobile number and email.');
      return;
    }
    if (!contactConsent || !termsAccepted || !refundAccepted) {
      setError(hi ? 'आगे बढ़ने से पहले संपर्क सहमति, नियम और रिफंड नीति स्वीकार करें।' : 'Accept the contact consent, Terms & Conditions and Refund Policy before continuing.');
      return;
    }
    setBusy(true);
    try {
      let orderId = pendingOrderId;
      if (!orderId) {
        const idempotencyKey = window.crypto.randomUUID();
        const response = await fetch('/api/digital-seva/checkout', {
          method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selected.id, customerName: name.trim(), customerPhone: phone.replace(/\D/g, ''),
            customerEmail: email.trim(), idempotencyKey, consent: contactConsent,
            termsAccepted, termsPolicyVersion: TERMS_POLICY_VERSION,
            refundPolicyAccepted: refundAccepted, refundPolicyVersion: REFUND_POLICY_VERSION
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success || !data.orderId || !data.paymentSessionId) throw new Error(data.error || 'Could not prepare secure payment.');
        orderId = String(data.orderId);
        setPendingOrderId(orderId);
        setCashfreeMode(data.cashfreeMode === 'production' ? 'production' : 'sandbox');
        try { window.sessionStorage.setItem('tanshu-ds-pending-checkout-v1', JSON.stringify({ orderId, serviceId: selected.id, name: name.trim(), phone, email: email.trim(), termsAcceptedAt, refundAcceptedAt })); } catch { /* session storage is optional */ }
      }
      await loadCashfreeSdk();
      const sessionResponse = await fetch('/api/digital-seva/checkout', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selected.id, customerName: name.trim(), customerPhone: phone.replace(/\D/g, ''), customerEmail: email.trim(), idempotencyKey: orderId.replace(/^ds_/, '').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'), consent: contactConsent, termsAccepted, termsPolicyVersion: TERMS_POLICY_VERSION, refundPolicyAccepted: refundAccepted, refundPolicyVersion: REFUND_POLICY_VERSION })
      });
      const session = await sessionResponse.json().catch(() => ({}));
      if (!sessionResponse.ok || !session.paymentSessionId) throw new Error(session.error || 'Could not restore the secure payment session. Please use payment recovery before retrying.');
      const checkout = window.Cashfree!({ mode: cashfreeMode });
      const result = await checkout.checkout({ paymentSessionId: String(session.paymentSessionId), redirectTarget: '_modal' });
      if (result?.error) {
        setError(result.error.message || (hi ? 'भुगतान पूरा नहीं हुआ। यदि राशि कट गई है तो दोबारा भुगतान न करें; भुगतान जाँचें।' : 'Payment was not completed. If money was deducted, do not pay again; check payment status.'));
        return;
      }
      await verifyAndContinue(orderId);
    } catch (e: any) {
      setError(e?.message || (hi ? 'भुगतान की पुष्टि नहीं हो सकी। दोबारा भुगतान करने से पहले स्थिति जाँचें।' : 'Payment could not be confirmed. Check its status before trying again.'));
    } finally { setBusy(false); }
  };

  return (
    <div className="ds-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="ds-detail-modal ds-paynow-modal" role="dialog" aria-modal="true" aria-label={hi ? 'अभी भुगतान करें' : 'Pay Now'} onClick={(event) => event.stopPropagation()}>
        <button className="ds-modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <span className="ds-kicker">{hi ? 'एक सुरक्षित भुगतान केंद्र' : 'ONE SECURE PAYMENT CENTER'}</span>
        <h2>{hi ? 'अपनी सर्विस चुनें और भुगतान करें' : 'Choose your service and pay'}</h2>
        <p>{hi ? 'एक बार में एक सर्विस चुनें। भुगतान सफल होने पर उसी सर्विस का आवेदन फॉर्म खुलेगा।' : 'Choose one service per payment. Its application form opens after Cashfree confirms payment.'}</p>
        <form onSubmit={(event) => void pay(event)}>
          <label className="ds-paynow-field">{hi ? 'अपनी सर्विस चुनें' : 'Select your service'}
            <select value={selectedId} disabled={Boolean(pendingOrderId)} onChange={(event) => { setSelectedId(event.target.value); setError(''); }}>
              {enabledServices.map((service) => <option key={service.id} value={service.id}>{hi ? service.hindi : service.name}{getAutoPaymentQuote(service) ? '' : (hi ? ' — शुल्क पुष्टि बाकी' : ' — quote required')}</option>)}
            </select>
          </label>
          {selected && disclosure && <div className="ds-booking-fee-summary">
            <strong>{hi ? selected.hindi : selected.name}</strong>
            <p><b>{hi ? 'सरकारी / प्रदाता शुल्क:' : 'Government / provider fee:'}</b> {quote && quote.governmentFee > 0 ? `₹${quote.governmentFee}` : disclosure.governmentFee}</p>
            <p><b>{hi ? 'TANSHU ONLINE सेवा शुल्क:' : 'TANSHU ONLINE service fee:'}</b> {quote ? `₹${quote.tanshuFee}` : disclosure.serviceFee}</p>
            {quote ? <p className="ds-paynow-total"><b>{hi ? 'कुल देय राशि:' : 'Total payable:'} ₹{quote.totalAmount}</b></p> : <p className="ds-booking-help">{hi ? 'इस सर्विस की फीस या सरकारी शुल्क अभी निश्चित नहीं है। सही कोटेशन तय होने के बाद भुगतान उपलब्ध होगा।' : 'The exact price or official fee for this service needs confirmation. Payment will be enabled after an approved quote is configured.'}</p>}
            {quote?.note && <p>{quote.note}</p>}
            {quote && <p className="ds-important-note">{hi ? 'कृपया ऊपर दिखाई गई पूरी राशि ही भुगतान करें। Cashfree में राशि पहले से तय है; कम भुगतान स्वीकार नहीं होगा और भुगतान की पुष्टि के बाद ही आवेदन फॉर्म खुलेगा।' : 'Please pay the exact full amount shown above. The Cashfree amount is fixed; an underpayment will not be accepted, and the application form opens only after full payment is verified.'}</p>}
          </div>}
          <div className="ds-paynow-contact">
            <label>{hi ? 'आपका नाम' : 'Your name'}<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
            <label>{hi ? 'मोबाइल नंबर' : 'Mobile number'}<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" maxLength={10} autoComplete="tel" required /></label>
            <label>{hi ? 'ईमेल' : 'Email address'}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          </div>
          <label className="ds-paynow-contact-consent"><input type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} /> <span>{hi ? 'मैं इस अनुरोध के संबंध में TANSHU ONLINE से संपर्क प्राप्त करने की अनुमति देता/देती हूँ।' : 'TANSHU ONLINE may contact me about this service request.'}</span></label>
          <BookingPolicyConsent language={language} termsAccepted={termsAccepted} refundAccepted={refundAccepted} onTermsChange={(value) => { setTermsAccepted(value); if (value) setTermsAcceptedAt(new Date().toISOString()); }} onRefundChange={(value) => { setRefundAccepted(value); if (value) setRefundAcceptedAt(new Date().toISOString()); }} />
          {error && <p className="ds-booking-error" role="alert">{error}</p>}
          {pendingOrderId && <p className="ds-booking-help">{hi ? 'यदि भुगतान हो चुका है तो “भुगतान जाँचें” दबाएँ। दोबारा भुगतान न करें।' : 'If you already completed payment, check it before attempting another payment.'}</p>}
          <div className="ds-modal-actions">
            <button className="ds-modal-book" type="submit" disabled={busy || !quote}>{busy ? (hi ? 'कृपया प्रतीक्षा करें…' : 'Please wait…') : <>{hi ? 'Pay Now' : 'Pay Now'} <CreditCard size={16} /></>}</button>
            {pendingOrderId && <button className="ds-modal-done" type="button" disabled={busy} onClick={() => void verifyAndContinue(pendingOrderId)}><CheckCircle2 size={15} /> {hi ? 'भुगतान जाँचें' : 'Check payment'}</button>}
            <button className="ds-modal-done" type="button" onClick={onClose}>{hi ? 'बंद करें' : 'Close'}</button>
          </div>
          <p className="ds-booking-help"><ShieldCheck size={14} /> {hi ? 'कोई ऑटो-डिडक्शन नहीं। ग्राहक खुद Cashfree पर भुगतान करता है।' : 'No automatic deduction. The customer manually approves payment in Cashfree.'}</p>
        </form>
      </section>
    </div>
  );
}
