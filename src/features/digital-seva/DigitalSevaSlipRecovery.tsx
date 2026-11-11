import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { SEVA_SERVICES } from './serviceCatalog';
import { buildDigitalSevaReceiptHtml } from './digitalSevaReceipt';

interface RecoveredBooking {
  bookingReference: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  estimatedCompletionAt?: string | null;
  termsAcceptedAt?: string | null;
  termsPolicyVersion?: string | null;
  refundAcceptedAt?: string | null;
  refundPolicyVersion?: string | null;
  fieldValues: Record<string, unknown>;
  serviceOptions: Record<string, unknown>;
  corrections: string[];
  selectedDocuments: string[];
  otherDocumentName: string;
  taskDetails: string;
  feeBreakdown: { governmentFee: number; tanshuFee: number; totalAmount: number; paymentStatus: string } | null;
}

export default function DigitalSevaSlipRecovery({ language, onClose }: { language: 'en' | 'hi'; onClose: () => void }) {
  const hi = language === 'hi';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<RecoveredBooking[]>([]);

  const recover = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setBookings([]);
    try {
      const response = await fetch('/api/digital-seva/recover-slip', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, email })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.bookings)) {
        throw new Error(data.error || 'Could not find your application.');
      }
      setBookings(data.bookings);
    } catch (cause: any) {
      setError(cause?.message || 'Could not recover the application slip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSlip = (booking: RecoveredBooking) => {
    const service = SEVA_SERVICES.find((item) => item.id === booking.serviceId);
    const html = buildDigitalSevaReceiptHtml({
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      serviceName: service ? `${service.name} / ${service.hindi}` : booking.serviceId,
      status: booking.status,
      estimatedCompletionAt: booking.estimatedCompletionAt,
      contactConsentAt: booking.createdAt,
      submittedAt: booking.createdAt,
      termsAcceptedAt: booking.termsAcceptedAt,
      termsPolicyVersion: booking.termsPolicyVersion,
      refundPolicyAcceptedAt: booking.refundAcceptedAt,
      refundPolicyVersion: booking.refundPolicyVersion,
      fieldValues: booking.fieldValues,
      serviceOptions: booking.serviceOptions,
      selectedWork: booking.corrections.map((item) => item.replace(/[-_]/g, ' ')),
      documents: booking.selectedDocuments.map((item) => item === 'other' ? booking.otherDocumentName || 'Other document' : item.replace(/[-_]/g, ' ')),
      customerInstructions: booking.taskDetails,
      feeBreakdown: booking.feeBreakdown
    });
    const popup = window.open('', '_blank');
    if (!popup) {
      window.alert(hi ? 'रसीद खोलने के लिए पॉप-अप की अनुमति दें।' : 'Please allow pop-ups to open your receipt.');
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
  };

  return <div className="ds-modal-backdrop" role="presentation" onClick={onClose}>
    <section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label={hi ? 'आवेदन स्लिप वापस पाएँ' : 'Recover application slip'} onClick={(event) => event.stopPropagation()}>
      <button className="ds-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      <span className="ds-kicker">{hi ? 'स्लिप रिकवरी' : 'SLIP RECOVERY'}</span>
      <h2>{hi ? 'अपनी आवेदन स्लिप वापस पाएँ' : 'Recover your application slip'}</h2>
      <p>{hi ? 'वही मोबाइल नंबर, आवेदक का नाम और ईमेल भरें जो आवेदन जमा करते समय दिया था। OTP की जरूरत नहीं है।' : 'Enter the same mobile number, applicant name and email used when submitting your application. No OTP is required.'}</p>
      <form className="ds-tracking-form" onSubmit={(event) => void recover(event)}>
        <label>{hi ? 'आवेदक का मोबाइल नंबर' : 'Applicant mobile number'}<input inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={14} required /></label>
        <label>{hi ? 'आवेदक का पूरा नाम' : 'Applicant full name'}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></label>
        <label>{hi ? 'आवेदन में दिया गया ईमेल' : 'Email used in the application'}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
        <button className="ds-modal-book" type="submit" disabled={loading}>{loading ? (hi ? 'जाँच हो रही है…' : 'Searching…') : (hi ? 'मेरी स्लिप खोजें' : 'Find my slips')}</button>
      </form>
      {error && <p className="ds-booking-error" role="alert">{error}</p>}
      {bookings.length > 0 && <div className="ds-tracking-result">
        <h3>{hi ? 'आपके आवेदन मिल गए' : 'Your applications were found'}</h3>
        {bookings.map((booking) => {
          const service = SEVA_SERVICES.find((item) => item.id === booking.serviceId);
          return <div className="ds-tracking-meta" key={booking.bookingReference}>
            <p><b>{hi ? 'रेफरेंस:' : 'Reference:'}</b> {booking.bookingReference}</p>
            <p><b>{hi ? 'सेवा:' : 'Service:'}</b> {hi ? (service?.hindi || booking.serviceId) : (service?.name || booking.serviceId)}</p>
            <p><b>{hi ? 'स्थिति:' : 'Status:'}</b> {booking.status.replaceAll('_', ' ')}</p>
            <button type="button" className="ds-modal-book" onClick={() => downloadSlip(booking)}><FileText size={16} /> {hi ? 'स्लिप डाउनलोड / प्रिंट करें' : 'Download / Print Slip'}</button>
          </div>;
        })}
      </div>}
      <p className="ds-booking-help">{hi ? 'सुरक्षा के लिए तीनों विवरण आवेदन से बिल्कुल मेल खाने चाहिए। यह केवल आवेदन की रसीद है; पहले अपलोड की गई मूल फ़ाइलें यहाँ से डाउनलोड नहीं होंगी।' : 'For safety, all three details must exactly match the application. This recovers the application receipt only; original uploaded files are not downloaded here.'}</p>
      <button className="ds-modal-done" onClick={onClose}>{hi ? 'बंद करें' : 'Close'}</button>
    </section>
  </div>;
}
