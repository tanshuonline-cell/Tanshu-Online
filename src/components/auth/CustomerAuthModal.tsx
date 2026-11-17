import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Mail, CheckCircle2, AlertCircle, Lock, LogOut, Crown, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

type CustomerSession = {
  authenticated: boolean;
  customer?: { id: string; email: string };
  subscription?: { plan_code: string; amount_inr: number; starts_at: string; expires_at: string } | null;
  latestPayment?: { amount_inr: number; status: string; notes: string; reference: string; created_at: string } | null;
};
type Plan = { plan_code: string; amount_inr: number; duration_days: number };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdminNavigate?: () => void;
}

export const CustomerAuthModal: React.FC<Props> = ({ isOpen, onClose, onAdminNavigate }) => {
  const { isHindi } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('basic');

  const copy = {
    title: 'Customer Access',
    customer: isHindi ? 'ग्राहक लॉगिन' : 'Customer Login',
    admin: isHindi ? 'एडमिन लॉगिन' : 'Admin Login',
    intro: isHindi ? 'अपनी Gmail ID से सुरक्षित लॉगिन करें।' : 'Sign in securely using your Gmail address.',
    send: isHindi ? 'Gmail पर OTP भेजें' : 'Send OTP to Gmail',
    verify: isHindi ? 'OTP सत्यापित करें' : 'Verify OTP',
    portal: isHindi ? 'आपका Customer Portal' : 'Your Customer Portal',
    plan: isHindi ? 'सक्रिय Membership' : 'Active Membership',
    noPlan: isHindi ? 'अभी कोई सक्रिय paid plan नहीं है।' : 'You do not have an active paid plan yet.',
    request: isHindi ? 'इस प्लान के लिए अनुरोध भेजें' : 'Request this plan',
    logout: isHindi ? 'लॉगआउट' : 'Log out',
    close: isHindi ? 'बंद करें' : 'Close',
  };

  const loadSession = async () => {
    const response = await fetch('/api/csp/auth/session', { credentials: 'include', cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to check customer session.');
    setSession(data);
    if (data.authenticated) {
      const planResponse = await fetch('/api/csp/plans', { cache: 'no-store' });
      const planData = await planResponse.json();
      if (planResponse.ok && Array.isArray(planData.plans)) { setPlans(planData.plans); setSelectedPlan((current: string) => planData.plans.some((plan: Plan) => plan.plan_code === current) ? current : (planData.plans[0]?.plan_code || 'basic')); }
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setMessage('');
    void loadSession().catch(() => setSession({ authenticated: false }));
  }, [isOpen]);

  if (!isOpen) return null;

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/csp/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not send OTP.');
      setSent(true); setMessage(data.message || 'OTP sent to your Gmail address.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send OTP.');
    } finally { setBusy(false); }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/csp/auth/verify-otp', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'OTP verification failed.');
      await loadSession();
      setMessage(isHindi ? 'Gmail सत्यापित हो गया।' : 'Gmail verified successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'OTP verification failed.');
    } finally { setBusy(false); }
  };

  const requestPlan = async () => {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/csp/membership/request', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planCode: selectedPlan })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not submit membership request.');
      setMessage(data.message || 'Membership request submitted.');
      await loadSession();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not submit membership request.');
    } finally { setBusy(false); }
  };

  const logout = async () => {
    await fetch('/api/csp/auth/session', { method: 'POST', credentials: 'include' });
    setSession({ authenticated: false }); setEmail(''); setOtp(''); setSent(false); setMessage('');
  };

  const planLabel = (code?: string) => ({ basic: 'BASIC', advanced: 'ADVANCED', premium: 'PREMIUM' } as Record<string, string>)[code || ''] || (isHindi ? 'कोई नहीं' : 'None');

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="customer-access-title">
        <div className="flex items-center justify-between bg-[#0A1324] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600"><ShieldCheck className="h-5 w-5" /></div>
            <div><h2 id="customer-access-title" className="text-sm font-black">{copy.title}</h2><p className="text-[10px] text-slate-300">TANSHU ONLINE · Secure Portal</p></div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label={copy.close}><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50 p-3">
          <div className="rounded-lg bg-white px-3 py-2 text-center text-xs font-extrabold text-blue-800 shadow-sm"><Mail className="mr-1 inline h-3.5 w-3.5" />{copy.customer}</div>
          <button type="button" onClick={() => { onClose(); onAdminNavigate?.(); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-800"><Lock className="mr-1 inline h-3.5 w-3.5" />{copy.admin}</button>
        </div>
        <div className="p-5 sm:p-6">
          {session?.authenticated && session.customer ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-emerald-900"><CheckCircle2 className="h-4 w-4" />{copy.portal}</div>
                <p className="mt-1 text-xs text-emerald-800">{session.customer.email}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{copy.plan}</p>
                <p className="mt-1 text-lg font-black text-slate-900">{planLabel(session.subscription?.plan_code)}</p>
                {session.subscription ? <p className="mt-1 text-xs text-slate-600">{isHindi ? 'समाप्ति:' : 'Expires:'} {new Date(session.subscription.expires_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}</p> : <p className="mt-1 text-xs text-slate-600">{copy.noPlan}</p>}
              </div>
              {session.latestPayment && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><strong>{isHindi ? 'भुगतान अनुरोध:' : 'Payment request:'}</strong> ₹{session.latestPayment.amount_inr} · {session.latestPayment.status.toUpperCase()}<p className="mt-1">{session.latestPayment.notes}</p></div>}
              {!session.subscription && plans.length > 0 && <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-700">{isHindi ? 'Membership Plan चुनें' : 'Choose a membership plan'}</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800">
                  {plans.map(plan => <option key={plan.plan_code} value={plan.plan_code}>{planLabel(plan.plan_code)} · ₹{plan.amount_inr} / {plan.duration_days} days</option>)}
                </select>
                <button type="button" disabled={busy} onClick={() => void requestPlan()} className="w-full rounded-xl bg-rose-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" /> : <Crown className="mr-2 inline h-4 w-4" />}{copy.request}</button>
                <p className="text-[11px] leading-5 text-slate-500">{isHindi ? 'भुगतान की पुष्टि एडमिन द्वारा होने के बाद ही paid tools खुलेंगे।' : 'Paid tools unlock only after the admin verifies payment.'}</p>
              </div>}
              {!session.subscription && plans.length === 0 && <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">{isHindi ? 'अभी कोई सक्रिय प्लान उपलब्ध नहीं है।' : 'No active membership plans are configured yet.'}</p>}
              <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><LogOut className="h-3.5 w-3.5" />{copy.logout}</button>
            </div>
          ) : (
            <>
              <div className="mb-4"><h3 className="text-base font-black text-slate-900">{copy.customer}</h3><p className="mt-1 text-xs text-slate-500">{copy.intro} {isHindi ? 'केवल @gmail.com ईमेल स्वीकार्य है।' : 'Gmail addresses only.'}</p></div>
              <form onSubmit={sent ? verifyOtp : sendOtp} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Gmail ID<input type="email" required pattern="[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@gmail\.com" value={email} onChange={e => setEmail(e.target.value)} disabled={sent} placeholder="yourname@gmail.com" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500" /></label>
                {sent && <label className="block text-xs font-bold text-slate-700">6-digit OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm tracking-[.35em] outline-none focus:border-blue-500" /></label>}
                <button disabled={busy} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-extrabold text-white hover:bg-blue-800 disabled:opacity-50">{busy ? <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" /> : <Mail className="mr-2 inline h-4 w-4" />}{sent ? copy.verify : copy.send}</button>
                {sent && <button type="button" onClick={() => { setSent(false); setOtp(''); setMessage(''); }} className="w-full py-1 text-xs font-semibold text-slate-500">{isHindi ? 'Gmail बदलें' : 'Change Gmail address'}</button>}
              </form>
              <p className="mt-4 text-[11px] leading-5 text-slate-500">{isHindi ? 'OTP 10 मिनट में समाप्त हो जाएगा। अपना OTP किसी से साझा न करें।' : 'OTP expires in 10 minutes. Never share your code with anyone.'}</p>
            </>
          )}
          {message && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">{isHindi ? 'ग्राहक और एडमिन के लॉगिन अलग-अलग सुरक्षित हैं।' : 'Customer and administrator access are separately secured.'}</div>
        </div>
      </div>
    </div>
  );
};
