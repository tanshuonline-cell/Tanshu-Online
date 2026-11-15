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

interface RecoveredDraft {
  orderId: string; serviceId: string; amount: number; customerName: string;
  customerPhone: string; customerEmail: string; savedAt: number;
  draft: Record<string, unknown>;
}

export default function DigitalSevaSlipRecovery({ language, onClose, onResumeDraft }: {
  language: 'en' | 'hi'; onClose: () => void; onResumeDraft: (draft: RecoveredDraft) => void;
}) {
  const hi = language === 'hi';
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<RecoveredBooking[]>([]);
  const [drafts, setDrafts] = useState<RecoveredDraft[]>([]);

  const recover = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError(''); setBookings([]); setDrafts([]);
    try {
      const [slipResult, draftResult] = await Promise.allSettled([
        fetch('/api/digital-seva/recover-slip', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, name, email }) }),
        fetch('/api/digital-seva/request-draft', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'recover', phone, name, email }) })
      ]);
      let foundBookings: RecoveredBooking[] = [];
      let foundDrafts: RecoveredDraft[] = [];
      if (slipResult.status === 'fulfilled') {
        const response = slipResult.value; const data = await response.json().catch(() => ({}));
        if (response.ok && data.success && Array.isArray(data.bookings)) foundBookings = data.bookings;
      }
      if (draftResult.status === 'fulfilled') {
        const response = draftResult.value; const data = await response.json().catch(() => ({}));
        if (response.ok && data.success && Array.isArray(data.drafts)) foundDrafts = data.drafts;
        else if (!response.ok && !foundBookings.length) throw new Error(data.error || 'Could not recover your saved request.');
      }
      setBookings(foundBookings); setDrafts(foundDrafts);
      if (!foundBookings.length && !foundDrafts.length) throw new Error(hi
        ? 'कोई जमा की गई स्लिप या अधूरा भुगतान-सत्यापित आवेदन नहीं मिला। तीनों विवरण जाँचें।'
        : 'No submitted slip or paid incomplete request was found. Check all three details.');
    } catch (cause: any) {
      setError(cause?.message || 'Could not recover the service request. Please try again.');
    } finally { setLoading(false); }
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
    <section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label={hi ? 'सेवा अनुरोध वापस पाएँ' : 'Recover service request'} onClick={(event) => event.stopPropagation()}>
      <button className="ds-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      <span className="ds-kicker">{hi ? 'सेवा अनुरोध रिकवरी' : 'SERVICE REQUEST RECOVERY'}</span>
      <h2>{hi ? 'अपना सेवा अनुरोध वापस पाएँ' : 'Recover your service request'}</h2>
      <p>{hi ? 'वही मोबाइल नंबर, आवेदक का नाम और ईमेल भरें जो अनुरोध के समय दिया था। जमा की गई स्लिप डाउनलोड करें या अधूरा भुगतान-सत्यापित आवेदन वहीं से जारी रखें।' : 'Enter the same mobile number, applicant name and email used for the request. Download a submitted slip or continue a paid application from where you left off.'}</p>
      <form className="ds-tracking-form" onSubmit={(event) => void recover(event)}>
        <label>{hi ? 'आवेदक का मोबाइल नंबर' : 'Applicant mobile number'}<input inputMode="numeric" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={14} required /></label>
        <label>{hi ? 'आवेदक का पूरा नाम' : 'Applicant full name'}<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></label>
        <label>{hi ? 'आवेदन में दिया गया ईमेल' : 'Email used in the application'}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
        <button className="ds-modal-book" type="submit" disabled={loading}>{loading ? (hi ? 'जाँच हो रही है…' : 'Searching…') : (hi ? 'मेरी स्लिप खोजें' : 'Find my slips')}</button>
      </form>
      {error && <p className="ds-booking-error" role="alert">{error}</p>}
      {drafts.length > 0 && <div className="ds-tracking-result">
        <h3>{hi ? 'अधूरे भुगतान-सत्यापित अनुरोध' : 'Paid requests ready to continue'}</h3>
        {drafts.map((draft) => {
          const service = SEVA_SERVICES.find((item) => item.id === draft.serviceId);
          return <div className="ds-tracking-meta" key={draft.orderId}>
            <p><b>{hi ? 'सेवा:' : 'Service:'}</b> {hi ? (service?.hindi || draft.serviceId) : (service?.name || draft.serviceId)}</p>
            <p><b>{hi ? 'भुगतान रेफरेंस:' : 'Payment reference:'}</b> {draft.orderId}</p>
            <p><b>{hi ? 'सत्यापित भुगतान:' : 'Verified payment:'}</b> ₹{Number(draft.amount).toLocaleString('en-IN')}</p>
            <button type="button" className="ds-modal-book" onClick={() => onResumeDraft(draft)}>{hi ? 'आवेदन जारी रखें' : 'Continue application'}</button>
          </div>;
        })}
        <p className="ds-booking-help">{hi ? 'भुगतान दोबारा नहीं माँगा जाएगा। दूसरे डिवाइस पर पहले चुनी गई फ़ाइलें दोबारा अपलोड करनी पड़ सकती हैं।' : 'You will not be asked to pay again. Files selected on another device may need to be attached again.'}</p>
      </div>}
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
      <p className="ds-booking-help">{hi ? 'सुरक्षा के लिए तीनों विवरण अनुरोध से बिल्कुल मेल खाने चाहिए। जमा अनुरोध की स्लिप मिलेगी और अधूरा भुगतान-सत्यापित अनुरोध जारी किया जा सकेगा। दूसरे डिवाइस पर फ़ाइलें दोबारा चुननी पड़ सकती हैं।' : 'For safety, all three details must exactly match the request. Submitted requests return a service slip; paid incomplete requests can be continued. Files may need to be reattached on another device.'}</p>
      <button className="ds-modal-done" onClick={onClose}>{hi ? 'बंद करें' : 'Close'}</button>
    </section>
  </div>;
}
