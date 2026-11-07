import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { SEVA_SERVICES } from './serviceCatalog';
import './digitalSeva.css';

type BookingStatus = 'RECEIVED' | 'IN_REVIEW' | 'WAITING_FOR_CUSTOMER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
interface Booking {
  id: string;
  booking_reference: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}
const STATUS_OPTIONS: BookingStatus[] = ['RECEIVED', 'IN_REVIEW', 'WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function DigitalSevaAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
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

  return <div className="dsa-shell"><header className="dsa-header"><div><span className="ds-kicker">TANSHU ONLINE • DIGITAL SEVA</span><h1><ClipboardList size={25} /> Booking Admin</h1><p><ShieldCheck size={15} /> Private administrator workspace</p></div><div className="dsa-header-actions"><button onClick={() => void loadBookings()} disabled={loading}><RefreshCw size={15} /> Refresh</button><button onClick={() => void logout()}><LogOut size={15} /> Sign out</button></div></header><div className="dsa-toolbar"><input aria-label="Search bookings" placeholder="Search reference, name, mobile or service…" value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} of {bookings.length} requests</span></div>{error && <p className="dsa-error" role="alert">{error}</p>}{loading && <p>Loading booking requests…</p>}{!loading && filtered.length === 0 && <div className="dsa-empty"><ClipboardList size={30} /><h2>No booking requests found</h2><p>New customer requests will appear here once submitted.</p></div>}<div className="dsa-booking-list">{filtered.map((booking) => <article className="dsa-booking-card" key={booking.id}><div className="dsa-booking-card-top"><strong>{booking.booking_reference}</strong><span>{new Date(booking.created_at + (booking.created_at.endsWith('Z') ? '' : 'Z')).toLocaleString()}</span></div><h2>{serviceNames.get(booking.service_id) || booking.service_id}</h2><div className="dsa-customer-grid"><div><small>Customer</small><b>{booking.customer_name}</b></div><div><small>Mobile</small><b>{booking.customer_phone}</b></div>{booking.customer_email && <div><small>Email</small><b>{booking.customer_email}</b></div>}</div><div className="dsa-status-row"><label>Status<select value={draftStatuses[booking.id] || booking.status} onChange={(e) => setDraftStatuses((old) => ({ ...old, [booking.id]: e.target.value as BookingStatus }))}>{STATUS_OPTIONS.map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label><button onClick={() => void updateStatus(booking)} disabled={savingId === booking.id || draftStatuses[booking.id] === booking.status}>{savingId === booking.id ? 'Saving…' : 'Save status'}</button></div></article>)}</div><footer className="dsa-footer"><a href="/digital-seva">← Back to Digital Seva</a><span>Booking records are private. Do not share customer contact details.</span></footer></div>;
}
