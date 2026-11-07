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

  return <div className="dsa-shell"><header className="dsa-header"><div><span className="ds-kicker">TANSHU ONLINE • DIGITAL SEVA</span><h1><ClipboardList size={25} /> Booking Admin</h1><p><ShieldCheck size={15} /> Private administrator workspace</p></div><div className="dsa-header-actions"><button onClick={() => void loadBookings()} disabled={loading}><RefreshCw size={15} /> Refresh</button><button onClick={() => void logout()}><LogOut size={15} /> Sign out</button></div></header><div className="dsa-toolbar"><input aria-label="Search bookings" placeholder="Search reference, name, mobile or service…" value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} of {bookings.length} requests</span></div>{error && <p className="dsa-error" role="alert">{error}</p>}{loading && <p>Loading booking requests…</p>}{!loading && filtered.length === 0 && <div className="dsa-empty"><ClipboardList size={30} /><h2>No booking requests found</h2><p>New customer requests will appear here once submitted.</p></div>}<div className="dsa-booking-list">{filtered.map((booking) => <article className="dsa-booking-card" key={booking.id}><div className="dsa-booking-card-top"><strong>{booking.booking_reference}</strong><span>{new Date(booking.created_at + (booking.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString()}</span></div><h2>{serviceNames.get(booking.service_id) || booking.service_id}</h2><div className="dsa-customer-grid"><div><small>Applicant / Customer</small><b>{booking.customer_name}</b></div><div><small>Applicant mobile</small><b>{booking.customer_phone}</b></div>{booking.customer_email && <div><small>Applicant email</small><b>{booking.customer_email}</b></div>}<div><small>Submitted by</small><b>{booking.requester_type || 'Legacy request'} · {booking.application_for || '—'}</b></div>{booking.operator_name && <div><small>Operator / Agent</small><b>{booking.operator_name} · {booking.operator_phone} · {booking.operator_email}</b></div>}{booking.centre_name && <div><small>Centre</small><b>{booking.centre_name} · {booking.centre_address}</b></div>}{booking.agency_name && <div><small>Agency</small><b>{booking.agency_name} · {booking.agency_address}</b></div>}</div><details className="dsa-application-details"><summary>Service details &amp; selected documents</summary><BookingApplicationDetails booking={booking} /></details><section className="dsa-documents"><h3>Customer documents ({(booking.documents || []).length})</h3>{(booking.documents || []).length === 0 ? <p>No files uploaded.</p> : <div className="dsa-document-list">{booking.documents!.map((document) => <div className="dsa-document-row" key={document.id}><div><b>{document.fileName}</b><small>{document.documentType} · {document.contentType} · {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB</small></div><div><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>View</button><button type="button" onClick={() => void openDocument(document, true)} disabled={documentActionId === document.id}>Download</button><button type="button" onClick={() => void openDocument(document, false)} disabled={documentActionId === document.id}>Print</button><button type="button" className="dsa-document-delete" onClick={() => void removeDocument(document)} disabled={documentActionId === document.id}>Delete</button></div></div>)}</div>}</section><div className="dsa-policy-audit"><span><b>Terms:</b> {booking.terms_accepted_at ? `Accepted · ${booking.terms_accepted_at} UTC · ${booking.terms_policy_version || 'version missing'}` : 'Not recorded'}</span><span><b>Refund Policy:</b> {booking.refund_policy_accepted_at ? `Accepted · ${booking.refund_policy_accepted_at} UTC · ${booking.refund_policy_version || 'version missing'}` : 'Not recorded'}</span></div><div className="dsa-status-row"><label>Status<select value={draftStatuses[booking.id] || booking.status} onChange={(e) => setDraftStatuses((old) => ({ ...old, [booking.id]: e.target.value as BookingStatus }))}>{STATUS_OPTIONS.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><button onClick={() => void updateStatus(booking)} disabled={savingId === booking.id || draftStatuses[booking.id] === booking.status}>{savingId === booking.id ? 'Saving…' : 'Save status'}</button></div></article>)}</div><footer className="dsa-footer"><a href="/digital-seva">← Back to Digital Seva</a><span>Booking records are private. Do not share customer contact details.</span></footer></div>;
}
