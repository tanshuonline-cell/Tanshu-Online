import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { SEVA_SERVICES } from './serviceCatalog';
import { buildDigitalSevaReceiptHtml } from './digitalSevaReceipt';
import { CORRECTION_OPTIONS, getServiceDocumentOptions } from './serviceApplicationSchema';
import './digitalSeva.css';

type BookingStatus = 'RECEIVED' | 'IN_REVIEW' | 'WAITING_FOR_CUSTOMER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
interface BookingDocument { id: string; documentType: string; fileName: string; contentType: string; sizeBytes: number; createdAt: string; }
interface Booking {
  id: string;
  booking_reference: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  requester_type?: string | null;
  application_for?: string | null;
  operator_name?: string | null;
  operator_phone?: string | null;
  operator_email?: string | null;
  centre_name?: string | null;
  centre_address?: string | null;
  agency_name?: string | null;
  agency_address?: string | null;
  application_details_json?: string | null;
  consent_at?: string | null;
  terms_accepted_at?: string | null;
  terms_policy_version?: string | null;
  refund_policy_accepted_at?: string | null;
  refund_policy_version?: string | null;
  status: BookingStatus;
  estimated_completion_at?: string | null;
  payment_amount?: number | null;
  payment_status?: string | null;
  payment_link_url?: string | null;
  cashfree_link_id?: string | null;
  payment_paid_at?: string | null;
  created_at: string;
  updated_at: string;
  documents?: BookingDocument[];
}
const STATUS_OPTIONS: BookingStatus[] = ['RECEIVED', 'IN_REVIEW', 'WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

interface ApplicationDetails {
  corrections?: string[];
  selectedDocuments?: string[];
  fieldValues?: Record<string, unknown>;
  serviceOptions?: Record<string, unknown>;
  otherDocumentName?: string;
  taskDetails?: string;
}

function parseApplicationDetails(raw?: string | null): ApplicationDetails {
  if (!raw) return {};
  try {
    let parsed: any = JSON.parse(raw);
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const source = parsed.applicationDetails && typeof parsed.applicationDetails === 'object' ? parsed.applicationDetails : parsed;
    return { ...source, selectedDocuments: Array.isArray(source.selectedDocuments) ? source.selectedDocuments : Array.isArray(source.selectedDocunents) ? source.selectedDocunents : [] } as ApplicationDetails;
  } catch { return {}; }
}

const FIELD_LABELS: Record<string, string> = {
  docRelationName: "Father's name / पिता का नाम",
  aadhaarNumber: 'Aadhaar Number / आधार नंबर',
  hofAadhaarNumber: 'Head of Family Aadhaar Number / मुखिया का आधार नंबर',
  existingPanNumber: 'Existing PAN Number / मौजूदा PAN नंबर',
  hofRelation: 'Relationship to Head of Family',
  hofName: 'Head of Family name',
  aadhaarHouse: 'House / Building / Apartment',
  aadhaarStreet: 'Street / Road / Lane',
  aadhaarArea: 'Area / Locality / Mohalla',
  aadhaarLandmark: 'Landmark',
  aadhaarVillage: 'Village / Town / City',
  aadhaarBlock: 'Block',
  aadhaarSubdivision: 'Sub-division',
  aadhaarDistrict: 'District',
  aadhaarPoliceStation: 'Police Station',
  aadhaarPostOffice: 'Post Office',
  aadhaarState: 'State',
  aadhaarPin: 'PIN Code',
  panApplicantName: 'Applicant name / आवेदक का नाम',
  panFatherName: "Father's name / पिता का नाम",
  panMotherName: "Mother's name / माता का नाम",
  panDob: 'Date of birth',
  panParentPrint: 'Parent name to print',
  panAddress: 'Communication address',
  newMobile: 'New mobile number',
  newEmail: 'New email address',
  certificateDistrict: 'District',
  certificateSubdivision: 'Sub-division',
  certificateBlock: 'Block',
  certificateVillage: 'Village / Mohalla',
  certificatePin: 'PIN Code',
  residenceDistrict: 'District',
  residenceSubdivision: 'Sub-division',
  residenceBlock: 'Block',
  residenceVillageWard: 'Village / Ward',
  residencePin: 'PIN Code',
  voterDob: 'Date of birth',
  voterAddress: 'Address',
  voterRelativeName: "Relative's name",
  familyMemberCount: 'Number of family members',
  familyMemberNames: 'Family members',
  otherDocumentName: 'Other document name'
};

const FIELD_LABELS_HI: Record<string, string> = {
  aadhaarHouse: 'मकान / भवन / अपार्टमेंट',
  aadhaarStreet: 'गली / सड़क / लेन',
  aadhaarArea: 'क्षेत्र / लोकैलिटी / मोहल्ला',
  aadhaarLandmark: 'पहचान की जगह',
  aadhaarVillage: 'गाँव / कस्बा / शहर',
  aadhaarBlock: 'प्रखंड / ब्लॉक',
  aadhaarSubdivision: 'अनुमंडल / सब-डिवीजन',
  aadhaarDistrict: 'जिला',
  aadhaarPoliceStation: 'थाना',
  aadhaarPostOffice: 'डाकघर',
  aadhaarState: 'राज्य',
  aadhaarPin: 'पिन कोड'
};

function humanizeKey(key: string): string {
  const hindi = key.endsWith('Hindi');
  const baseKey = hindi ? key.slice(0, -5) : key;
  const label = FIELD_LABELS[baseKey] || baseKey.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
  return hindi ? `${label} — हिंदी` : label;
}

function displayAdminFieldValue(key: string, value: unknown): string {
  const text = String(value ?? '').trim();
  const normalized = key.toLowerCase();
  if (/aadhaar|uid/.test(normalized)) {
    const digits = text.replace(/\D/g, '');
    return digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : text.startsWith('enc:v1:') ? 'Encrypted / protected' : text;
  }
  if (/pan(number|no)?$|existingpan/.test(normalized)) return text.length >= 4 ? `XXXXXX${text.slice(-4)}` : text;
  return text.startsWith('enc:v1:') ? 'Encrypted / protected' : text;
}

function displayOptionValue(key: string, value: unknown): string {
  const text = String(value ?? '').trim();
  if (key === 'addressChoice') return text === 'NEW' ? 'New Address — new address entered below' : text === 'OLD' ? 'Old Address — existing address entered below' : text;
  const options: Record<string, Record<string, string>> = {
    hofRelation: { FATHER: 'Father', MOTHER: 'Mother', GUARDIAN: 'Legal guardian', SPOUSE: 'Spouse', CHILD: 'Child / ward', SIBLING: 'Sibling' },
    panParentPrint: { FATHER: 'Father', MOTHER: 'Mother' },
    level: { CO: 'CO / Revenue Officer', SDO: 'SDO', DM: 'DM' },
    residenceType: { PERMANENT: 'Permanent', TEMPORARY: 'Temporary' },
    applicationType: { GENERAL: 'General', TATKAL: 'Tatkal' }
  };
  return options[key]?.[text] || text;
}


function formatSlipTime(value?: string | null): string {
  if (!value) return 'Not recorded';
  const date = new Date(value.endsWith('Z') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}


function toLocalDateTimeInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function printBookingSlip(booking: Booking, serviceName: string) {
  const popup = window.open('', '_blank');
  if (!popup) return false;
  const details = parseApplicationDetails(booking.application_details_json);
  const correctionOptions = CORRECTION_OPTIONS[booking.service_id] || [];
  const correctionLabels = (details.corrections || []).map((id) => correctionOptions.find((item) => item.id === id)?.label || id);
  const documentOptions = getServiceDocumentOptions(booking.service_id, details.corrections || []);
  const documentLabels = (details.selectedDocuments || []).map((id) =>
    id === 'other' ? details.otherDocumentName || 'Other document' : documentOptions.find((item) => item.id === id)?.label || id
  );
  const html = buildDigitalSevaReceiptHtml({
    bookingReference: booking.booking_reference,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    serviceName,
    status: booking.status,
    estimatedCompletionAt: booking.estimated_completion_at,
    contactConsentAt: booking.consent_at,
    submittedAt: booking.created_at,
    termsAcceptedAt: booking.terms_accepted_at,
    termsPolicyVersion: booking.terms_policy_version,
    refundPolicyAcceptedAt: booking.refund_policy_accepted_at,
    refundPolicyVersion: booking.refund_policy_version,
    fieldValues: details.fieldValues || {},
    serviceOptions: details.serviceOptions || {},
    selectedWork: correctionLabels,
    documents: documentLabels,
    customerInstructions: details.taskDetails || ''
  });
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  return true;
}

function BookingApplicationDetails({ booking }: { booking: Booking }) {
  const details = parseApplicationDetails(booking.application_details_json);
  const fieldValues = details.fieldValues || {};
  const serviceOptions = details.serviceOptions || {};
  const corrections = Array.isArray(details.corrections) ? details.corrections : [];
  const selectedDocuments = Array.isArray(details.selectedDocuments) ? details.selectedDocuments : [];
  const correctionOptions = CORRECTION_OPTIONS[booking.service_id] || [];
  const documentOptions = getServiceDocumentOptions(booking.service_id, corrections);
  const fieldKeys = Array.from(new Set(Object.keys(fieldValues).map((key) => key.endsWith('Hindi') ? key.slice(0, -5) : key)));
  const rows = fieldKeys.filter((key) => String(fieldValues[key] ?? '').trim() || String(fieldValues[`${key}Hindi`] ?? '').trim()).map((key) => [key, fieldValues[key]] as [string, unknown]);
  const optionRows = Object.entries(serviceOptions).filter(([, value]) => String(value ?? '').trim());
  const correctionLabels = corrections.map((id) => correctionOptions.find((item) => item.id === id)?.label || id);
  const documentLabels = selectedDocuments.map((id) => {
    if (id === 'other') return details.otherDocumentName || 'Other document';
    return documentOptions.find((item) => item.id === id)?.label || id.replace(/-/g, ' ');
  });

  return <div className="dsa-detail-panel">
    {correctionLabels.length > 0 && <section><h3>Selected corrections</h3><div className="dsa-detail-chips">{correctionLabels.map((label, index) => <span key={index}>{label}</span>)}</div></section>}
    {rows.length > 0 && <section><h3>Customer-provided details / ग्राहक द्वारा दी गई जानकारी</h3><dl className="dsa-detail-grid">{rows.map(([key, value]) => { const hindiValue = String(fieldValues[`${key}Hindi`] ?? '').trim(); return <div key={key}><dt>{humanizeKey(key)}{FIELD_LABELS_HI[key] && <small className="dsa-field-label-hi">{FIELD_LABELS_HI[key]}</small>}</dt><dd>{displayAdminFieldValue(key, value) || '—'}{hindiValue && <small className="dsa-bilingual-value"><span>हिंदी</span>{hindiValue}</small>}</dd></div>; })}</dl></section>}
    {Object.entries(fieldValues).some(([key, value]) => /aadhaar|uid|pan/i.test(key) && String(value ?? '').startsWith('enc:v1:')) && <p className="dsa-no-details">Aadhaar / PAN value is encrypted and protected. Check only the masked identifier in the application slip.</p>}
    {optionRows.length > 0 && <section><h3>Service options</h3><dl className="dsa-detail-grid">{optionRows.map(([key, value]) => <div key={key}><dt>{humanizeKey(key)}</dt><dd>{displayOptionValue(key, value)}</dd></div>)}</dl></section>}
    {documentLabels.length > 0 && <section><h3>Selected documents</h3><div className="dsa-detail-chips">{documentLabels.map((label, index) => <span key={index}>{label}</span>)}</div></section>}
    {details.taskDetails && <section><h3>Customer instructions / work requested</h3><p className="dsa-task-details">{details.taskDetails}</p></section>}
    {!rows.length && !optionRows.length && !correctionLabels.length && !documentLabels.length && !details.taskDetails && <p className="dsa-no-details">No additional service details were recorded for this request.</p>}
  </div>;
}

export default function DigitalSevaAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [documentActionId, setDocumentActionId] = useState('');
  const [search, setSearch] = useState('');
  const [draftStatuses, setDraftStatuses] = useState<Record<string, BookingStatus>>({});
  const [draftEstimates, setDraftEstimates] = useState<Record<string, string>>({});
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [draftPaymentAmounts, setDraftPaymentAmounts] = useState<Record<string, string>>({});
  const [paymentSavingId, setPaymentSavingId] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  const serviceNames = useMemo(() => new Map(SEVA_SERVICES.map((service) => [service.id, service.name])), []);
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/digital-seva/admin', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { setAuthenticated(false); throw new Error('Your admin session has expired. Please sign in again.'); }
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load booking requests.');
      const rows = Array.isArray(data.bookings) ? data.bookings as Booking[] : [];
      setBookings(rows);
      setDraftStatuses(Object.fromEntries(rows.map((row) => [row.id, row.status])));
      setDraftEstimates(Object.fromEntries(rows.map((row) => [row.id, toLocalDateTimeInput(row.estimated_completion_at)])));
      setDraftPaymentAmounts(Object.fromEntries(rows.map((row) => [row.id, row.payment_amount != null ? String(row.payment_amount) : ''])));
      setDraftNotes({});
    } catch (e: any) { setError(e?.message || 'Could not load booking requests.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth', { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data?.authenticated) { setAuthenticated(true); void loadBookings(); } })
      .catch(() => {})
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadBookings]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/admin/auth', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Admin login failed.');
      setAuthenticated(true);
      setPassword('');
      await loadBookings();
    } catch (e: any) { setError(e?.message || 'Admin login failed.'); }
  };

  const openDocument = async (document: BookingDocument, download = false) => {
    const tab = window.open('about:blank', '_blank');
    if (!tab) { setError('Please allow pop-ups to open a secure document link.'); return; }
    setDocumentActionId(document.id);
    setError('');
    try {
      const response = await fetch('/api/digital-seva/admin', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id, download: download ? document.fileName : false })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.url) throw new Error(data.error || 'Could not open this document.');
      tab.location.href = String(data.url);
    } catch (e: any) {
      tab.close();
      setError(e?.message || 'Could not open this document.');
    } finally { setDocumentActionId(''); }
  };

  const downloadSlip = (booking: Booking) => {
    const serviceName = serviceNames.get(booking.service_id) || booking.service_id;
    if (!printBookingSlip(booking, serviceName)) setError('Please allow pop-ups to open the application slip. You can then choose Save as PDF in the print dialog.');
  };

  const removeDocument = async (document: BookingDocument) => {
    if (!window.confirm(`Permanently delete "${document.fileName}" from private storage?`)) return;
    setDocumentActionId(document.id);
    setError('');
    try {
      const response = await fetch('/api/digital-seva/admin', {
        method: 'DELETE', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not delete this document.');
      await loadBookings();
    } catch (e: any) { setError(e?.message || 'Could not delete this document.'); }
    finally { setDocumentActionId(''); }
  };

  const updateStatus = async (booking: Booking) => {
    const status = draftStatuses[booking.id] || booking.status;
    const estimateChanged = (draftEstimates[booking.id] || '') !== toLocalDateTimeInput(booking.estimated_completion_at);
    const note = (draftNotes[booking.id] || '').trim();
    if (!status || (status === booking.status && !estimateChanged && !note)) return;
    setSavingId(booking.id);
    setError('');
    try {
      const response = await fetch('/api/digital-seva/admin', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, status, estimatedCompletionAt: draftEstimates[booking.id] ? new Date(draftEstimates[booking.id]).toISOString() : '', note }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Status update failed.');
      await loadBookings();
    } catch (e: any) { setError(e?.message || 'Status update failed.'); }
    finally { setSavingId(''); }
  };

  const createPaymentLink = async (booking: Booking) => {
    const amount = Number(draftPaymentAmounts[booking.id] || 0);
    if (!Number.isFinite(amount) || amount < 1 || amount > 100000 || Math.round(amount * 100) !== amount * 100) {
      setError('Enter a valid service fee between ₹1 and ₹1,00,000 (up to 2 decimal places).');
      return;
    }
    setPaymentSavingId(booking.id);
    setError('');
    setPaymentMessage('');
    try {
      const response = await fetch('/api/digital-seva/admin/payment', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, amount })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.linkUrl) throw new Error(data.error || 'Could not create Cashfree payment link.');
      await loadBookings();
      setPaymentMessage(`Payment link created for ${booking.booking_reference}. Copy it below and share it with the customer.`);
    } catch (e: any) {
      setError(e?.message || 'Could not create Cashfree payment link.');
    } finally { setPaymentSavingId(''); }
  };

  const copyPaymentLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setPaymentMessage('Payment link copied. You can now share it with the customer.');
    } catch {
      setError('Could not copy automatically. Open the payment link and copy it from the address bar.');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth?action=logout', { method: 'POST', credentials: 'same-origin' }).catch(() => null);
    setAuthenticated(false);
    setBookings([]);
  };

  const filtered = bookings.filter((booking) => {
    const needle = search.trim().toLowerCase();
    return !needle || [booking.booking_reference, booking.customer_name, booking.customer_phone, booking.service_id].some((value) => String(value || '').toLowerCase().includes(needle));
  });

  if (checking) return <div className="dsa-shell"><p>Checking admin session…</p></div>;
  if (!authenticated) return <div className="dsa-shell"><div className="dsa-login"><a href="/digital-seva"><ArrowLeft size={16} /> Back to Digital Seva</a><span className="ds-kicker">RESTRICTED ADMIN AREA</span><h1>Digital Seva Admin</h1><p>Sign in with your existing TANSHU ONLINE administrator credentials.</p><form onSubmit={login}><label>Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{error && <p className="dsa-error" role="alert">{error}</p>}<button type="submit">Sign in securely</button></form></div></div>;

  return <div className="dsa-shell"><header className="dsa-header"><div><span className="ds-kicker">TANSHU ONLINE • DIGITAL SEVA</span><h1><ClipboardList size={25} /> Booking Admin</h1><p><ShieldCheck size={15} /> Private administrator workspace</p></div><div className="dsa-header-actions"><button onClick={() => void loadBookings()} disabled={loading}><RefreshCw size={15} /> Refresh</button><button onClick={() => void logout()}><LogOut size={15} /> Sign out</button></div></header><div className="dsa-toolbar"><input aria-label="Search bookings" placeholder="Search reference, name, mobile or service…" value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} of {bookings.length} requests</span></div>{error && <p className="dsa-error" role="alert">{error}</p>}{paymentMessage && <p className="dsa-payment-message" role="status">{paymentMessage}</p>}{loading && <p>Loading booking requests…</p>}{!loading && filtered.length === 0 && <div className="dsa-empty"><ClipboardList size={30} /><h2>No booking requests found</h2><p>New customer requests will appear here once submitted.</p></div>}<div className="dsa-booking-list">{filtered.map((booking) => <article className="dsa-booking-card" key={booking.id}><div className="dsa-booking-card-top"><strong>{booking.booking_reference}</strong><span>{new Date(booking.created_at + (booking.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString()}</span></div><h2>{serviceNames.get(booking.service_id) || booking.service_id}</h2><div className="dsa-slip-action"><div><strong>Application receipt</strong><small>Customer details, complete address and submitted documents</small></div><button type="button" onClick={() => downloadSlip(booking)}>Download / Print PDF · रसीद</button></div><div className="dsa-customer-grid"><div><small>Applicant / Customer</small><b>{booking.customer_name}</b></div><div><small>Applicant mobile</small><b>{booking.customer_phone}</b></div>{booking.customer_email && <div><small>Applicant email</small><b>{booking.customer_email}</b></div>}<div><small>Submitted by</small><b>{booking.requester_type || 'Legacy request'} · {booking.application_for || '—'}</b></div>{booking.operator_name && <div><small>Operator / Agent</small><b>{booking.operator_name} · {booking.operator_phone} · {booking.operator_email}</b></div>}{booking.centre_name && <div><small>Centre</small><b>{booking.centre_name} · {booking.centre_address}</b></div>}{booking.agency_name && <div><small>Agency</small><b>{booking.agency_name} · {booking.agency_address}</b></div>}</div><details className="dsa-application-details" open><summary>Service details &amp; selected documents / सेवा विवरण और चुने गए दस्तावेज़</summary><BookingApplicationDetails booking={booking} /></details><section className="dsa-documents"><h3>Customer documents ({(booking.documents || []).length})</h3>{(booking.documents || []).length === 0 ? <p>No files uploaded.</p> : <div className="dsa-document-list">{booking.documents!.map((document) => <div className="dsa-document-row" key={document.id}><div><b>{document.fileName}</b><small>{document.documentType} · {document.contentType} · {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</small></div><div><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>View</button><button type="button" onClick={() => void openDocument(document, true)} disabled={documentActionId === document.id}>Download</button><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>Print</button><button type="button" className="dsa-document-delete" onClick={() => void removeDocument(document)} disabled={documentActionId === document.id}>Delete</button></div></div>)}</div>}</section><div className="dsa-policy-audit"><span><b>Terms &amp; Conditions:</b> {booking.terms_accepted_at ? `Accepted / स्वीकार किया · ${formatSlipTime(booking.terms_accepted_at)} IST · ${booking.terms_policy_version || 'version missing'}` : 'Not recorded / दर्ज नहीं'}</span><span><b>Refund Policy:</b> {booking.refund_policy_accepted_at ? `Accepted / स्वीकार किया · ${formatSlipTime(booking.refund_policy_accepted_at)} IST · ${booking.refund_policy_version || 'version missing'}` : 'Not recorded'}</span></div><section className="dsa-payment-panel">
  <div className="dsa-payment-panel-heading"><strong>Payment &amp; Service Fee</strong><small>Review the request, set the final amount manually, then create a one-time Cashfree payment link.</small></div>
  <div className="dsa-payment-controls">
    <label>Final fee (₹)<input type="number" min="1" max="100000" step="0.01" inputMode="decimal" value={draftPaymentAmounts[booking.id] || ''} onChange={(e) => setDraftPaymentAmounts((old) => ({ ...old, [booking.id]: e.target.value }))} placeholder="Enter service fee" /></label>
    <button type="button" onClick={() => void createPaymentLink(booking)} disabled={paymentSavingId === booking.id}>{paymentSavingId === booking.id ? 'Creating link…' : 'Create Cashfree Pay Link'}</button>
  </div>
  <div className="dsa-payment-status"><span><b>Payment status:</b> {booking.payment_status || 'AWAITING PRICE'}</span>{booking.payment_amount != null && <span><b>Amount:</b> ₹{Number(booking.payment_amount).toFixed(2)}</span>}{booking.payment_paid_at && <span><b>Paid at:</b> {formatSlipTime(booking.payment_paid_at)} IST</span>}</div>
  {booking.payment_link_url && <div className="dsa-payment-link"><a href={booking.payment_link_url} target="_blank" rel="noreferrer">Open payment link</a><button type="button" onClick={() => void copyPaymentLink(String(booking.payment_link_url))}>Copy link to share</button></div>}
</section><div className="dsa-status-row"><label>Status<select value={draftStatuses[booking.id] || booking.status} onChange={(e) => setDraftStatuses((old) => ({ ...old, [booking.id]: e.target.value as BookingStatus }))}>{STATUS_OPTIONS.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><label>Estimated completion (local time)<input type="datetime-local" value={draftEstimates[booking.id] || ''} onChange={(e) => setDraftEstimates((old) => ({ ...old, [booking.id]: e.target.value }))} /></label><label>Customer update note<input value={draftNotes[booking.id] || ''} maxLength={500} placeholder="Visible to customer — short progress update" onChange={(e) => setDraftNotes((old) => ({ ...old, [booking.id]: e.target.value }))} /></label><button onClick={() => void updateStatus(booking)} disabled={savingId === booking.id || ((draftStatuses[booking.id] || booking.status) === booking.status && (draftEstimates[booking.id] || '') === toLocalDateTimeInput(booking.estimated_completion_at) && !(draftNotes[booking.id] || '').trim())}>{savingId === booking.id ? 'Saving…' : 'Save update'}</button></div></article>)}</div><footer className="dsa-footer"><a href="/digital-seva">← Back to Digital Seva</a><span>Booking records are private. Do not share customer contact details.</span></footer></div>;
}
