import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { SEVA_SERVICES } from './serviceCatalog';
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
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as ApplicationDetails : {};
  } catch { return {}; }
}

const FIELD_LABELS: Record<string, string> = {
  docRelationName: "Father's name",
  hofRelation: 'Relationship to Head of Family',
  hofName: 'Head of Family name',
  aadhaarHouse: 'House / Building / Apartment',
  aadhaarVillage: 'Village / Town / City',
  aadhaarDistrict: 'District',
  aadhaarState: 'State',
  aadhaarPin: 'PIN Code',
  aadhaarArea: 'Area / Locality / Sector',
  aadhaarLandmark: 'Landmark',
  aadhaarPostOffice: 'Post Office',
  panApplicantName: 'Applicant name',
  panFatherName: "Father's name",
  panMotherName: "Mother's name",
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

function humanizeKey(key: string): string {
  return FIELD_LABELS[key] || key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function displayOptionValue(key: string, value: unknown): string {
  const text = String(value ?? '').trim();
  if (key === 'addressChoice') return text === 'NEW' ? 'New Address' : text === 'OLD' ? 'Old Address — keep the current online address unchanged' : text;
  const options: Record<string, Record<string, string>> = {
    hofRelation: { FATHER: 'Father', MOTHER: 'Mother', GUARDIAN: 'Legal guardian', SPOUSE: 'Spouse', CHILD: 'Child / ward', SIBLING: 'Sibling' },
    panParentPrint: { FATHER: 'Father', MOTHER: 'Mother' },
    level: { CO: 'CO / Revenue Officer', SDO: 'SDO', DM: 'DM' },
    residenceType: { PERMANENT: 'Permanent', TEMPORARY: 'Temporary' },
    applicationType: { GENERAL: 'General', TATKAL: 'Tatkal' }
  };
  return options[key]?.[text] || text;
}


function escapeSlipHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

function maskSlipValue(key: string, value: unknown): string {
  const text = String(value ?? '').trim();
  const normalized = key.toLowerCase();
  if (/aadhaar|uid/.test(normalized)) return text.replace(/\D/g, '').length >= 4 ? `XXXX XXXX ${text.replace(/\D/g, '').slice(-4)}` : text;
  if (/pan(number|no)?$|existingpan/.test(normalized)) return text.length >= 4 ? `XXXXXX${text.slice(-4)}` : text;
  return text;
}

function formatSlipTime(value?: string | null): string {
  if (!value) return 'Not recorded';
  const date = new Date(value.endsWith('Z') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

function printBookingSlip(booking: Booking, serviceName: string) {
  const popup = window.open('', '_blank');
  if (!popup) return false;
  const details = parseApplicationDetails(booking.application_details_json);
  const values = { ...(details.fieldValues || {}), ...(details.serviceOptions || {}) };
  const addressOrder = ['aadhaarHouse', 'aadhaarVillage', 'aadhaarDistrict', 'aadhaarState', 'aadhaarPin', 'aadhaarArea', 'aadhaarLandmark', 'aadhaarPostOffice'];
  const orderedKeys = [...addressOrder.filter((key) => String(values[key] ?? '').trim()), ...Object.keys(values).filter((key) => !addressOrder.includes(key) && String(values[key] ?? '').trim())];
  const correctionOptions = CORRECTION_OPTIONS[booking.service_id] || [];
  const correctionLabels = (details.corrections || []).map((id) => correctionOptions.find((item) => item.id === id)?.label || id);
  const documentOptions = getServiceDocumentOptions(booking.service_id, details.corrections || []);
  const documentLabels = (details.selectedDocuments || []).map((id) => id === 'other' ? details.otherDocumentName || 'Other document' : documentOptions.find((item) => item.id === id)?.label || id);
  const fieldRows = orderedKeys.map((key) => `<tr><th>${escapeSlipHtml(humanizeKey(key))}</th><td>${escapeSlipHtml(maskSlipValue(key, values[key]))}</td></tr>`).join('');
  const correctionsHtml = correctionLabels.length ? `<section><h2>Selected Work / चुना गया कार्य</h2><p>${correctionLabels.map(escapeSlipHtml).join(' · ')}</p></section>` : '';
  const docsHtml = documentLabels.length ? `<section><h2>Documents Submitted / जमा दस्तावेज़</h2><p>${documentLabels.map(escapeSlipHtml).join(' · ')}</p></section>` : '';
  const taskHtml = details.taskDetails ? `<section><h2>Customer Instructions / ग्राहक के निर्देश</h2><p class="preserve">${escapeSlipHtml(details.taskDetails)}</p></section>` : '';
  const mobile = booking.customer_phone ? `${booking.customer_phone.slice(0, 2)}XXXXXX${booking.customer_phone.slice(-2)}` : '—';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeSlipHtml(booking.booking_reference)}_TANSHU_ONLINE</title><style>
    *{box-sizing:border-box}body{margin:0;padding:22px;background:#f4f4f4;color:#171717;font-family:Arial,"Noto Sans Devanagari",sans-serif;font-size:12px}.sheet{max-width:790px;margin:0 auto;background:#fff;padding:30px 34px;border:1px solid #ddd;box-shadow:0 4px 24px #00000012}.brand{text-align:center;border-bottom:2px solid #a51f32;padding-bottom:13px}.brand h1{margin:0;color:#a51f32;font-size:27px;letter-spacing:1.5px}.brand p{margin:5px 0 0;color:#555;font-size:10px;letter-spacing:.5px}.heading{text-align:center;margin:16px 0}.heading h2{margin:0;color:#222;font-size:17px;letter-spacing:.5px}.heading p{margin:4px 0 0;color:#666;font-size:11px}.ref{display:flex;justify-content:space-between;gap:12px;border:1px solid #e2d5d5;background:#fffafa;padding:9px 11px;margin:13px 0}.ref strong{color:#a51f32}.section{margin-top:15px}section h2{margin:0 0 8px;padding:7px 9px;background:#f8eeee;border-left:3px solid #a51f32;color:#84202e;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e3e3e3;padding:8px 10px;text-align:left;vertical-align:top;line-height:1.45}th{width:38%;background:#fafafa;color:#444;font-weight:600}td{color:#111;font-weight:600;overflow-wrap:anywhere}.customer{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px}.cell{border:1px solid #e3e3e3;padding:9px}.cell small{display:block;color:#777;font-size:9px;margin-bottom:4px;text-transform:uppercase}.cell b{font-size:12px;color:#111}.audit{margin-top:14px;border:1px solid #e3e3e3;padding:10px;display:grid;gap:7px}.audit p{margin:0;line-height:1.5}.status{display:inline-block;padding:4px 8px;border-radius:20px;background:#e8f4ec;color:#21663b;font-weight:700;font-size:10px}.foot{text-align:center;border-top:1px solid #ddd;margin-top:18px;padding-top:10px;color:#666;font-size:9px;line-height:1.6}.preserve{white-space:pre-wrap;line-height:1.6}.no-print{display:flex;justify-content:center;gap:10px;margin:14px auto}.no-print button{border:0;border-radius:7px;padding:9px 14px;background:#922331;color:white;font-weight:700;cursor:pointer}@page{size:A4;margin:12mm}@media print{body{padding:0;background:#fff}.sheet{max-width:none;border:0;box-shadow:none;padding:0}.no-print{display:none}section,table,.audit{break-inside:avoid}}@media(max-width:560px){body{padding:0}.sheet{padding:18px 14px}.customer{grid-template-columns:1fr}.ref{flex-direction:column}}
  </style></head><body><main class="sheet"><header class="brand"><h1>TANSHU ONLINE</h1><p>RELIABLE • SECURE • PROFESSIONAL SERVICE</p></header><div class="heading"><h2>DIGITAL SEVA APPLICATION RECEIPT</h2><p>डिजिटल सेवा आवेदन एवं अनुरोध रसीद</p></div><div class="ref"><span>Booking Reference / बुकिंग संदर्भ</span><strong>${escapeSlipHtml(booking.booking_reference)}</strong></div><section><h2>01. Customer Details / ग्राहक की जानकारी</h2><div class="customer"><div class="cell"><small>Customer Name / ग्राहक का नाम</small><b>${escapeSlipHtml(booking.customer_name)}</b></div><div class="cell"><small>Mobile Number / मोबाइल नंबर</small><b>${escapeSlipHtml(mobile)}</b></div><div class="cell"><small>Service / सेवा</small><b>${escapeSlipHtml(serviceName)}</b></div><div class="cell"><small>Email / ईमेल</small><b>${escapeSlipHtml(booking.customer_email || '—')}</b></div></div></section>${correctionsHtml}<section><h2>02. Application Details / आवेदन का विवरण</h2><table><tbody>${fieldRows || '<tr><td colspan="2">No additional service details recorded.</td></tr>'}</tbody></table></section>${docsHtml}${taskHtml}<section><h2>03. Application Status / आवेदन की स्थिति</h2><p><span class="status">${escapeSlipHtml(booking.status.replaceAll('_', ' '))}</span></p></section><div class="audit"><p><b>Contact Consent:</b> ${escapeSlipHtml(formatSlipTime(booking.consent_at))}</p><p><b>Terms &amp; Conditions Accepted:</b> ${escapeSlipHtml(formatSlipTime(booking.terms_accepted_at))} · ${escapeSlipHtml(booking.terms_policy_version || 'Version not recorded')}</p><p><b>Refund Policy Accepted:</b> ${escapeSlipHtml(formatSlipTime(booking.refund_policy_accepted_at))} · ${escapeSlipHtml(booking.refund_policy_version || 'Version not recorded')}</p><p><b>Application Submitted:</b> ${escapeSlipHtml(formatSlipTime(booking.created_at))}</p></div><footer class="foot">This is a TANSHU ONLINE service request receipt, not proof that a government application has been filed.<br>यह TANSHU ONLINE की सेवा अनुरोध रसीद है, सरकारी आवेदन जमा होने का प्रमाण नहीं।</footer></main><div class="no-print"><button onclick="window.print()">Download / Save as PDF / Print</button></div></body></html>`;
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
  const rows = Object.entries(fieldValues).filter(([, value]) => String(value ?? '').trim());
  const optionRows = Object.entries(serviceOptions).filter(([, value]) => String(value ?? '').trim());
  const correctionLabels = corrections.map((id) => correctionOptions.find((item) => item.id === id)?.label || id);
  const documentLabels = selectedDocuments.map((id) => {
    if (id === 'other') return details.otherDocumentName || 'Other document';
    return documentOptions.find((item) => item.id === id)?.label || id.replace(/-/g, ' ');
  });

  return <div className="dsa-detail-panel">
    {correctionLabels.length > 0 && <section><h3>Selected corrections</h3><div className="dsa-detail-chips">{correctionLabels.map((label, index) => <span key={index}>{label}</span>)}</div></section>}
    {rows.length > 0 && <section><h3>Customer-provided details</h3><dl className="dsa-detail-grid">{rows.map(([key, value]) => <div key={key}><dt>{humanizeKey(key)}</dt><dd>{String(value)}</dd></div>)}</dl></section>}
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
    const status = draftStatuses[booking.id];
    if (!status || status === booking.status) return;
    setSavingId(booking.id);
    setError('');
    try {
      const response = await fetch('/api/digital-seva/admin', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, status }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Status update failed.');
      await loadBookings();
    } catch (e: any) { setError(e?.message || 'Status update failed.'); }
    finally { setSavingId(''); }
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

  return <div className="dsa-shell"><header className="dsa-header"><div><span className="ds-kicker">TANSHU ONLINE • DIGITAL SEVA</span><h1><ClipboardList size={25} /> Booking Admin</h1><p><ShieldCheck size={15} /> Private administrator workspace</p></div><div className="dsa-header-actions"><button onClick={() => void loadBookings()} disabled={loading}><RefreshCw size={15} /> Refresh</button><button onClick={() => void logout()}><LogOut size={15} /> Sign out</button></div></header><div className="dsa-toolbar"><input aria-label="Search bookings" placeholder="Search reference, name, mobile or service…" value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} of {bookings.length} requests</span></div>{error && <p className="dsa-error" role="alert">{error}</p>}{loading && <p>Loading booking requests…</p>}{!loading && filtered.length === 0 && <div className="dsa-empty"><ClipboardList size={30} /><h2>No booking requests found</h2><p>New customer requests will appear here once submitted.</p></div>}<div className="dsa-booking-list">{filtered.map((booking) => <article className="dsa-booking-card" key={booking.id}><div className="dsa-booking-card-top"><strong>{booking.booking_reference}</strong><span>{new Date(booking.created_at + (booking.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString()}</span></div><h2>{serviceNames.get(booking.service_id) || booking.service_id}</h2><div className="dsa-slip-action"><button type="button" onClick={() => downloadSlip(booking)}>Download Application Slip / Print PDF</button></div><div className="dsa-customer-grid"><div><small>Applicant / Customer</small><b>{booking.customer_name}</b></div><div><small>Applicant mobile</small><b>{booking.customer_phone}</b></div>{booking.customer_email && <div><small>Applicant email</small><b>{booking.customer_email}</b></div>}<div><small>Submitted by</small><b>{booking.requester_type || 'Legacy request'} · {booking.application_for || '—'}</b></div>{booking.operator_name && <div><small>Operator / Agent</small><b>{booking.operator_name} · {booking.operator_phone} · {booking.operator_email}</b></div>}{booking.centre_name && <div><small>Centre</small><b>{booking.centre_name} · {booking.centre_address}</b></div>}{booking.agency_name && <div><small>Agency</small><b>{booking.agency_name} · {booking.agency_address}</b></div>}</div><details className="dsa-application-details"><summary>Service details &amp; selected documents</summary><BookingApplicationDetails booking={booking} /></details><section className="dsa-documents"><h3>Customer documents ({(booking.documents || []).length})</h3>{(booking.documents || []).length === 0 ? <p>No files uploaded.</p> : <div className="dsa-document-list">{booking.documents!.map((document) => <div className="dsa-document-row" key={document.id}><div><b>{document.fileName}</b><small>{document.documentType} · {document.contentType} · {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</small></div><div><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>View</button><button type="button" onClick={() => void openDocument(document, true)} disabled={documentActionId === document.id}>Download</button><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>Print</button><button type="button" className="dsa-document-delete" onClick={() => void removeDocument(document)} disabled={documentActionId === document.id}>Delete</button></div></div>)}</div>}</section><div className="dsa-policy-audit"><span><b>Terms:</b> {booking.terms_accepted_at ? `Accepted · ${booking.terms_accepted_at} UTC · ${booking.terms_policy_version || 'version missing'}` : 'Not recorded'}</span><span><b>Refund Policy:</b> {booking.refund_policy_accepted_at ? `Accepted · ${booking.refund_policy_accepted_at} UTC · ${booking.refund_policy_version || 'version missing'}` : 'Not recorded'}</span></div><div className="dsa-status-row"><label>Status<select value={draftStatuses[booking.id] || booking.status} onChange={(e) => setDraftStatuses((old) => ({ ...old, [booking.id]: e.target.value as BookingStatus }))}>{STATUS_OPTIONS.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><button onClick={() => void updateStatus(booking)} disabled={savingId === booking.id || draftStatuses[booking.id] === booking.status}>{savingId === booking.id ? 'Saving…' : 'Save status'}</button></div></article>)}</div><footer className="dsa-footer"><a href="/digital-seva">← Back to Digital Seva</a><span>Booking records are private. Do not share customer contact details.</span></footer></div>;
}
