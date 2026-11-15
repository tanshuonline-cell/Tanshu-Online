import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

type Session = { authenticated: boolean; customer?: { id: string; email: string }; subscription?: { plan_code: string; amount_inr: number; expires_at: string } | null; allowedTools?: string[] };
const paidPlans = [
  { code: 'basic', price: 99, name: 'BASIC', tools: 'Instant Passport Photo Studio' },
  { code: 'advanced', price: 199, name: 'ADVANCED', tools: 'Passport Studio + PVC Card + Multi Customer' },
  { code: 'premium', price: 299, name: 'PREMIUM', tools: 'All four premium photo tools' },
];

export const CspToolAccess: React.FC<{ toolId: string; children: React.ReactNode }> = ({ toolId, children }) => {
  const { isHindi } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const freeTools = ['photo-signature-resizer', 'auto-document-cropper', 'photo-background-remover'];

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/csp/auth/session', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      setSession(data);
    } catch { setSession({ authenticated: false }); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  const allowed = Boolean(session?.authenticated && session.allowedTools?.includes(toolId));
  const requiresFreeSignup = freeTools.includes(toolId);
  const isSignedIn = Boolean(session?.authenticated);

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">Checking secure access…</div>;
  if (allowed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="text-xs font-black uppercase tracking-[.18em] text-rose-800">TANSHU ONLINE · CSP &amp; TRAVEL CAFE</div>
        <h1 className="mt-3 text-2xl font-black">{requiresFreeSignup ? (isHindi ? 'फ्री Gmail Sign-up जरूरी है' : 'Free Gmail Sign-up Required') : (isHindi ? 'Premium Quality Print Access' : 'Premium Quality Print Access')}</h1>
        <p className="mt-3 leading-7 text-slate-600">{requiresFreeSignup
          ? (isHindi ? 'इस टूल का उपयोग और डाउनलोड शुरू करने के लिए फ्री Gmail OTP से अकाउंट बनाएं या लॉगिन करें। कोई पेड सब्सक्रिप्शन जरूरी नहीं है।' : 'Create a free account or sign in with a Gmail OTP to use this tool and download results. No paid subscription is required.')
          : (isHindi ? 'इस टूल की Premium Quality Print सुविधा के लिए सक्रिय सदस्यता जरूरी है।' : 'An active membership is required for Premium Quality Print access in this tool.')}</p>
        {session?.subscription && <p className="mt-3 text-sm text-emerald-700">Active plan: {session.subscription.plan_code.toUpperCase()} · Expires {new Date(session.subscription.expires_at).toLocaleDateString()}</p>}
        {!requiresFreeSignup && <div className="mt-6 grid gap-3 md:grid-cols-3">{paidPlans.map(plan => <div key={plan.code} className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-black tracking-widest text-slate-500">{plan.name}</div><div className="mt-2 text-2xl font-black">₹{plan.price}<span className="text-xs font-medium text-slate-500"> / month</span></div><p className="mt-2 text-xs leading-5 text-slate-600">{plan.tools}</p></div>)}</div>}
        {notice && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => setAuthOpen(true)} className="rounded-xl bg-rose-900 px-5 py-3 text-sm font-bold text-white">{isSignedIn ? (isHindi ? 'दूसरे अकाउंट से लॉगिन' : 'Sign in with another Gmail') : (isHindi ? 'फ्री Gmail OTP से लॉगिन / साइन अप' : 'Sign up / Sign in with Gmail OTP')}</button>
          <a href="/csc-cyber-cafe-toolkits" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">{isHindi ? 'सभी 7 टूल देखें' : 'View all 7 tools'}</a>
        </div>
        {!requiresFreeSignup && <p className="mt-4 text-xs leading-5 text-slate-500">Membership is activated manually after payment verification. No auto-debit or automatic renewal.</p>}
      </div>
      {authOpen && <CspGmailOtpModal onClose={() => setAuthOpen(false)} onVerified={async () => { setAuthOpen(false); await refresh(); }} />}
    </div>
  );
};

const CspGmailOtpModal: React.FC<{ onClose: () => void; onVerified: () => void }> = ({ onClose, onVerified }) => {
  const { isHindi } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/csp/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, purpose: 'signup' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send OTP.');
      setSent(true); setMessage(data.message || 'OTP sent.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not send OTP.'); }
    finally { setBusy(false); }
  };
  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/csp/auth/verify-otp', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OTP verification failed.');
      onVerified();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'OTP verification failed.'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between"><h2 className="text-lg font-black">{isHindi ? 'Gmail OTP लॉगिन / साइन अप' : 'Gmail OTP Sign up / Sign in'}</h2><button onClick={onClose} className="rounded-lg px-3 py-2 text-slate-500">✕</button></div>
      <p className="mt-2 text-sm text-slate-600">{isHindi ? 'केवल @gmail.com ईमेल। मोबाइल नंबर की जरूरत नहीं।' : 'Gmail address only. No mobile number required.'}</p>
      <form onSubmit={sent ? verifyOtp : sendOtp} className="mt-5 space-y-3">
        <label className="block text-xs font-bold text-slate-700">Gmail ID<input type="email" required pattern="[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@gmail\.com" value={email} onChange={e => setEmail(e.target.value)} disabled={sent} placeholder="yourname@gmail.com" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" /></label>
        {sent && <label className="block text-xs font-bold text-slate-700">6-digit OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="000000" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm tracking-[.35em]" /></label>}
        {message && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{message}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-rose-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Please wait…' : sent ? (isHindi ? 'OTP सत्यापित करें' : 'Verify OTP') : (isHindi ? 'OTP भेजें' : 'Send OTP')}</button>
        {sent && <button type="button" onClick={() => { setSent(false); setOtp(''); setMessage(''); }} className="w-full py-2 text-xs font-semibold text-slate-500">Change Gmail address</button>}
      </form>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">OTP expires in 10 minutes. Never share your code with anyone.</p>
    </div>
  </div>;
};
