import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

type Session = { authenticated: boolean; customer?: { id: string; email: string }; subscription?: { plan_code: string; amount_inr: number; expires_at: string } | null; allowedTools?: string[] };
type GateContext = { requestExport: () => Promise<boolean> };
const Gate = createContext<GateContext | null>(null);
export const useCspExportGate = () => {
  const gate = useContext(Gate);
  return gate?.requestExport || (async () => true);
};

const defaultPaidPlans = [
  { code: 'basic', price: 99, name: 'BASIC', tools: 'Instant Passport Photo Studio', active: true },
  { code: 'advanced', price: 199, name: 'ADVANCED', tools: 'Passport Studio + PVC Card + Multi Customer', active: true },
  { code: 'premium', price: 299, name: 'PREMIUM', tools: 'All four premium photo tools', active: true },
];
const planStyle: Record<string, string> = {
  basic: 'border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 text-amber-950',
  advanced: 'border-sky-300 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-blue-950',
  premium: 'border-violet-300 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-100 text-violet-950',
};
const ringStyle: Record<string, string> = {
  basic: "before:bg-[conic-gradient(from_0deg,transparent_0_35%,#f59e0b_48%,#fcd34d_55%,transparent_68%_100%)]",
  advanced: "before:bg-[conic-gradient(from_0deg,transparent_0_35%,#0284c7_48%,#818cf8_55%,transparent_68%_100%)]",
  premium: "before:bg-[conic-gradient(from_0deg,transparent_0_35%,#a21caf_48%,#fb7185_55%,transparent_68%_100%)]",
};

export const CspMembershipPlans: React.FC = () => {
  const [plans, setPlans] = useState(defaultPaidPlans);
  useEffect(() => {
    fetch('/api/csp/plans').then(r => r.json()).then(data => {
      if (data?.success && Array.isArray(data.plans)) setPlans(current => current.map(plan => {
        const price = data.plans.find((item: any) => item.plan_code === plan.code);
        return price ? { ...plan, price: Number(price.amount_inr), active: true } : { ...plan, active: false };
      }));
    }).catch(() => {});
  }, []);
  return <div className="grid gap-4 md:grid-cols-3">
    {plans.filter(plan => plan.active).map(plan => <div key={plan.code} className={`group relative isolate overflow-hidden rounded-2xl p-[2px] shadow-sm transition-all duration-300 before:absolute before:inset-[-150%] before:animate-[spin_4s_linear_infinite] before:content-[''] hover:-translate-y-2 hover:scale-[1.025] hover:shadow-xl ${ringStyle[plan.code]}`}>
      <div className={`relative h-full rounded-[14px] border p-5 transition-all ${planStyle[plan.code]}`}>
        <div className="flex items-center justify-between gap-2"><p className="text-xs font-black tracking-[.2em]">{plan.name}</p><span className="rounded-full border border-current/20 bg-white/60 px-2 py-1 text-[9px] font-extrabold uppercase">{plan.code === 'basic' ? 'Starter' : plan.code === 'advanced' ? 'Pro' : 'Elite'}</span></div>
        <p className="mt-3 text-3xl font-black">₹{plan.price}<span className="text-xs font-semibold opacity-65"> / month</span></p>
        <p className="mt-2 min-h-10 text-sm font-semibold leading-5">{plan.tools}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/70"><div className={`h-full w-full rounded-full ${plan.code === 'basic' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : plan.code === 'advanced' ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : 'bg-gradient-to-r from-fuchsia-500 to-rose-500'}`} /></div>
      </div>
    </div>)}
  </div>;
};

export const CspToolAccess: React.FC<{ toolId: string; children: React.ReactNode }> = ({ toolId, children }) => {
  const { isHindi } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [requestBusy, setRequestBusy] = useState(false);
  const [availablePlans, setAvailablePlans] = useState(defaultPaidPlans);
  const [toolEnabled, setToolEnabled] = useState(true);
  const freeTools = ['photo-signature-resizer', 'auto-document-cropper', 'photo-background-remover'];
  const isFreeTool = freeTools.includes(toolId);
  const refresh = async () => {
    try { const r = await fetch('/api/csp/auth/session', { credentials: 'include', cache: 'no-store' }); setSession(await r.json()); }
    catch { setSession({ authenticated: false }); }
  };
  useEffect(() => {
    void refresh();
    fetch('/api/csp/tools').then(r => r.json()).then(data => {
      const item = data?.tools?.find((tool: any) => tool.tool_id === toolId);
      if (item) setToolEnabled(Number(item.enabled) === 1);
    }).catch(() => {});
    fetch('/api/csp/plans').then(r => r.json()).then(data => {
      if (data?.success && Array.isArray(data.plans)) setAvailablePlans(current => current.map(plan => {
        const match = data.plans.find((item: any) => item.plan_code === plan.code);
        return match ? { ...plan, price: Number(match.amount_inr), active: true } : { ...plan, active: false };
      }));
    }).catch(() => {});
  }, [toolId]);
  const allowed = Boolean(session?.authenticated && session.allowedTools?.includes(toolId));
  const submitMembershipRequest = async () => {
    setRequestBusy(true);
    try {
      const response = await fetch('/api/csp/membership/request', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planCode: selectedPlan }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not submit membership request.');
      setPlansOpen(false);
      setNotice(data.message || 'Membership request submitted.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not submit membership request.');
      setPlansOpen(false);
    } finally { setRequestBusy(false); }
  };
  const requestExport = async () => {
    if (!toolEnabled) { setNotice(isHindi ? 'यह टूल अभी अस्थायी रूप से बंद है।' : 'This tool is temporarily unavailable.'); return false; }
    if (!session?.authenticated) { setAuthOpen(true); setNotice(isHindi ? 'फोटो सेव करने से पहले फ्री Gmail OTP सत्यापन करें।' : 'Verify your Gmail with a free OTP before saving.'); return false; }
    if (isFreeTool || allowed) return true;
    setPlansOpen(true); return false;
  };
  useEffect(() => {
    const onFrameMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'CSP_PREMIUM_EXPORT_REQUEST') return;
      const source = event.source as Window | null;
      void requestExport().then(ok => { if (ok) source?.postMessage({ type: 'CSP_PREMIUM_EXPORT_ALLOWED' }, window.location.origin); });
    };
    window.addEventListener('message', onFrameMessage);
    return () => window.removeEventListener('message', onFrameMessage);
  }, [session, allowed, toolEnabled, isFreeTool]);
  if (!toolEnabled) return <div className="min-h-screen grid place-items-center bg-slate-50 px-5 text-center"><div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-xl font-black">{isHindi ? 'यह टूल फिलहाल उपलब्ध नहीं है' : 'This tool is temporarily unavailable'}</h1><p className="mt-2 text-sm text-slate-600">{isHindi ? 'कृपया बाद में दोबारा प्रयास करें।' : 'Please check back later.'}</p><a href="/csc-cyber-cafe-toolkits" className="mt-4 inline-block font-bold text-rose-800">{isHindi ? 'सभी टूल देखें' : 'View all tools'}</a></div></div>;
  return <Gate.Provider value={{ requestExport }}>
    <div className="relative min-h-screen">
      {!allowed && <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] grid grid-cols-3 content-center justify-items-center gap-x-16 gap-y-24 overflow-hidden opacity-[0.14]">{Array.from({ length: 12 }, (_, i) => <img key={i} src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg" alt="" className="h-14 w-14 rounded-full border-2 border-slate-700 object-cover shadow-sm sm:h-20 sm:w-20" />)}</div>}
      {children}
    </div>
    {authOpen && <CspGmailOtpModal onClose={() => setAuthOpen(false)} onVerified={async () => { setAuthOpen(false); await refresh(); if (!isFreeTool) setPlansOpen(true); }} />}
    {plansOpen && <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-slate-950/75 p-4"><section role="dialog" aria-modal="true" className="my-auto w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-rose-800">TANSHU ONLINE · PREMIUM PRINT</p><h2 className="mt-2 text-2xl font-black text-slate-950">{isHindi ? 'अपना Premium प्लान चुनें' : 'Choose your Premium plan'}</h2><p className="mt-2 text-sm text-slate-600">{isHindi ? 'आपका काम और प्रीव्यू सुरक्षित है। Premium डाउनलोड के लिए प्लान चुनें।' : 'Your work and preview remain available. Choose a plan to unlock premium downloads.'}</p></div><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2">✕</button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">{availablePlans.filter(plan => plan.active).map(plan => <button type="button" key={plan.code} onClick={() => setSelectedPlan(plan.code)} className={`rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${planStyle[plan.code]} ${selectedPlan === plan.code ? 'ring-4 ring-offset-2 ring-slate-300 -translate-y-1 shadow-xl' : ''}`}><span className="text-xs font-black tracking-widest">{plan.name}</span><span className="mt-2 block text-2xl font-black">₹{plan.price}<small className="text-xs"> / month</small></span><span className="mt-2 block text-xs font-semibold">{plan.tools}</span></button>)}</div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{isHindi ? 'भुगतान का तरीका:' : 'Payment method:'}</strong> {isHindi ? 'सदस्यता मैन्युअल भुगतान सत्यापन के बाद सक्रिय होगी। कोई ऑटो-डेबिट नहीं है। भुगतान विवरण Admin से प्राप्त करें।' : 'Membership activates only after manual payment verification. No auto-debit. Obtain payment instructions from the site administrator.'}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold">{isHindi ? 'बाद में' : 'Not now'}</button><button type="button" disabled={requestBusy} onClick={() => void submitMembershipRequest()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{requestBusy ? (isHindi ? 'भेज रहे हैं…' : 'Sending…') : (isHindi ? 'प्लान रिक्वेस्ट भेजें' : 'Request this plan')}</button></div>
    </section></div>}
    {notice && !authOpen && !plansOpen && <div role="status" className="fixed bottom-4 left-1/2 z-[140] w-[min(92vw,560px)] -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl">{notice}<button type="button" onClick={() => setNotice('')} className="ml-3 font-black text-rose-800">×</button></div>}
  </Gate.Provider>;
};

const CspGmailOtpModal: React.FC<{ onClose: () => void; onVerified: () => void }> = ({ onClose, onVerified }) => {
  const { isHindi } = useLanguage();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const response = await fetch('/api/csp/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, purpose: 'signup' }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not send OTP.'); setSent(true); setMessage(data.message || 'OTP sent.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not send OTP.'); }
    finally { setBusy(false); }
  };
  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const response = await fetch('/api/csp/auth/verify-otp', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'OTP verification failed.'); onVerified(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'OTP verification failed.'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/75 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
    <div className="flex items-center justify-between"><h2 className="text-lg font-black">{isHindi ? 'Gmail OTP लॉगिन / साइन अप' : 'Gmail OTP Sign up / Sign in'}</h2><button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-slate-500">✕</button></div>
    <p className="mt-2 text-sm text-slate-600">{isHindi ? 'केवल @gmail.com ईमेल। मोबाइल नंबर की जरूरत नहीं।' : 'Gmail address only. No mobile number required.'}</p>
    <form onSubmit={sent ? verifyOtp : sendOtp} className="mt-5 space-y-3"><label className="block text-xs font-bold text-slate-700">Gmail ID<input type="email" required pattern="[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@gmail\\.com" value={email} onChange={e => setEmail(e.target.value)} disabled={sent} placeholder="yourname@gmail.com" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" /></label>
      {sent && <label className="block text-xs font-bold text-slate-700">6-digit OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\\D/g, '').slice(0,6))} placeholder="000000" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm tracking-[.35em]" /></label>}
      {message && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{message}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-rose-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Please wait…' : sent ? (isHindi ? 'OTP सत्यापित करें' : 'Verify OTP') : (isHindi ? 'OTP भेजें' : 'Send OTP')}</button>
      {sent && <button type="button" onClick={() => { setSent(false); setOtp(''); setMessage(''); }} className="w-full py-2 text-xs font-semibold text-slate-500">Change Gmail address</button>}
    </form><p className="mt-4 text-[11px] leading-5 text-slate-500">OTP expires in 10 minutes. Never share your code with anyone.</p>
  </div></div>;
};
