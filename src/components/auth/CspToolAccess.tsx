import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

type Session = { authenticated: boolean; customer?: { id: string; email: string }; subscription?: { plan_code: string; amount_inr: number; expires_at: string } | null; allowedTools?: string[] };
type GateContext = { requestExport: () => Promise<boolean> };
const Gate = createContext<GateContext | null>(null);
export const useCspExportGate = () => {
  const gate = useContext(Gate);
  return gate?.requestExport || (async () => false);
};

const defaultPaidPlans = [
  { code: 'basic', price: 49, durationDays: 1, name: 'BASIC', tools: 'Instant Passport Photo Studio', active: true },
  { code: 'advanced', price: 199, durationDays: 30, name: 'PROFESSIONAL', tools: 'Passport Studio + PVC Card + Multi Customer', active: true },
  { code: 'premium', price: 599, durationDays: 90, name: 'PREMIUM', tools: 'All four premium photo tools', active: true },
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
  const [selectedPlan, setSelectedPlan] = useState('basic');
  useEffect(() => {
    fetch('/api/csp/plans').then(r => r.json()).then(data => {
      if (data?.success && Array.isArray(data.plans)) setPlans(current => current.map(plan => {
        const price = data.plans.find((item: any) => item.plan_code === plan.code);
        return price ? { ...plan, price: Number(price.amount_inr), durationDays: Number(price.duration_days) || plan.durationDays, active: true } : { ...plan, active: false };
      }));
    }).catch(() => {});
  }, []);
  const selected = plans.find(plan => plan.code === selectedPlan && plan.active) || plans.find(plan => plan.active);
  return <div>
    <div className="grid gap-4 md:grid-cols-3">
      {plans.filter(plan => plan.active).map(plan => <button type="button" key={plan.code} onClick={() => setSelectedPlan(plan.code)} className={`group relative isolate overflow-hidden rounded-2xl p-[2px] text-left shadow-sm transition-all duration-300 before:absolute before:inset-[-150%] before:animate-[spin_4s_linear_infinite] before:content-[''] hover:-translate-y-2 hover:scale-[1.025] hover:shadow-xl ${ringStyle[plan.code]} ${selectedPlan === plan.code ? '-translate-y-1 scale-[1.02] shadow-xl ring-4 ring-offset-2 ring-slate-300' : ''}`}>
        <span className={`relative z-10 block h-full rounded-[14px] border p-5 ${planStyle[plan.code]}`}>
          <span className="flex items-center justify-between gap-2"><span className="text-xs font-black tracking-[.2em]">{plan.name}</span><span className="rounded-full border border-current/20 bg-white/60 px-2 py-1 text-[9px] font-extrabold uppercase">{plan.code === 'basic' ? 'STARTER' : plan.code === 'advanced' ? 'PROFESSIONAL' : 'ELITE'}</span></span>
          <span className="mt-3 block text-3xl font-black">₹{plan.price}<small className="text-xs font-semibold opacity-65"> / {plan.durationDays} day{plan.durationDays === 1 ? '' : 's'}</small></span>
          <span className="mt-2 block min-h-10 text-sm font-semibold leading-5">{plan.tools}</span>
          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/70"><span className={`block h-full w-full rounded-full ${plan.code === 'basic' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : plan.code === 'advanced' ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : 'bg-gradient-to-r from-fuchsia-500 to-rose-500'}`} /></span>
        </span>
      </button>)}
    </div>
    {selected && <p className="mt-3 text-center text-xs font-semibold text-slate-600">{selected.name} selected · {selected.tools} · {selected.price} INR / {selected.durationDays} days</p>}
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
  const refresh = async (): Promise<Session> => {
    try {
      const r = await fetch('/api/csp/auth/session', { credentials: 'include', cache: 'no-store' });
      const data = await r.json() as Session;
      setSession(data);
      return data;
    } catch {
      const data: Session = { authenticated: false };
      setSession(data);
      return data;
    }
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
        return match ? { ...plan, price: Number(match.amount_inr), durationDays: Number(match.duration_days) || plan.durationDays, active: true } : { ...plan, active: false };
      }));
    }).catch(() => {});
  }, [toolId]);
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
    const currentSession = await refresh();
    if (currentSession.allowedTools?.includes(toolId)) return true;
    setPlansOpen(true);
    return false;
  };
  useEffect(() => {
    const onFrameMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'CSP_PREMIUM_EXPORT_REQUEST') return;
      const source = event.source as Window | null;
      void requestExport().then(ok => { if (ok) source?.postMessage({ type: 'CSP_PREMIUM_EXPORT_ALLOWED' }, window.location.origin); });
    };
    window.addEventListener('message', onFrameMessage);
    return () => window.removeEventListener('message', onFrameMessage);
  }, [session, toolEnabled, toolId]);

  // Catch both real user clicks and programmatic download links, plus Ctrl/Cmd+P.
  useEffect(() => {
    const originalPrint = window.print;
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    const replayedAnchors = new WeakSet<HTMLAnchorElement>();
    const replayDownload = (anchor: HTMLAnchorElement) => {
      replayedAnchors.add(anchor);
      originalAnchorClick.call(anchor);
    };
    const guardedPrint = () => {
      void requestExport().then(ok => { if (ok) originalPrint.call(window); });
    };
    const guardedAnchorClick = function (this: HTMLAnchorElement) {
      if (!this.hasAttribute('download')) return originalAnchorClick.call(this);
      const anchor = this;
      void requestExport().then(ok => { if (ok) replayDownload(anchor); });
    };
    const onDownloadClick = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[download]') as HTMLAnchorElement | null : null;
      if (!anchor) return;
      if (replayedAnchors.has(anchor)) { replayedAnchors.delete(anchor); return; }
      event.preventDefault();
      event.stopImmediatePropagation();
      void requestExport().then(ok => { if (ok) replayDownload(anchor); });
    };
    const onPrintShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void requestExport().then(ok => { if (ok) originalPrint.call(window); });
    };
    document.addEventListener('click', onDownloadClick, true);
    document.addEventListener('keydown', onPrintShortcut, true);
    window.print = guardedPrint;
    HTMLAnchorElement.prototype.click = guardedAnchorClick;
    return () => {
      document.removeEventListener('click', onDownloadClick, true);
      document.removeEventListener('keydown', onPrintShortcut, true);
      if (window.print === guardedPrint) window.print = originalPrint;
      if (HTMLAnchorElement.prototype.click === guardedAnchorClick) HTMLAnchorElement.prototype.click = originalAnchorClick;
    };
  }, [session, toolEnabled, toolId]);
  if (!toolEnabled) return <div className="min-h-screen grid place-items-center bg-slate-50 px-5 text-center"><div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-xl font-black">{isHindi ? 'यह टूल फिलहाल उपलब्ध नहीं है' : 'This tool is temporarily unavailable'}</h1><p className="mt-2 text-sm text-slate-600">{isHindi ? 'कृपया बाद में दोबारा प्रयास करें।' : 'Please check back later.'}</p><a href="/csc-cyber-cafe-toolkits" className="mt-4 inline-block font-bold text-rose-800">{isHindi ? 'सभी टूल देखें' : 'View all tools'}</a></div></div>;
  return <Gate.Provider value={{ requestExport }}>
    <div className="relative min-h-screen">
      {children}
    </div>
    {authOpen && <CspGmailOtpModal onClose={() => setAuthOpen(false)} onVerified={async () => { setAuthOpen(false); const verified = await refresh(); if (!verified.allowedTools?.includes(toolId)) await submitMembershipRequest(); }} />}
    {plansOpen && <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-slate-950/75 p-4"><section role="dialog" aria-modal="true" className="my-auto w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-rose-800">TANSHU ONLINE · PREMIUM PRINT</p><h2 className="mt-2 text-2xl font-black text-slate-950">{isHindi ? 'अपना Premium प्लान चुनें' : 'Choose your Premium plan'}</h2><p className="mt-2 text-sm text-slate-600">{isHindi ? 'आपका काम और प्रीव्यू सुरक्षित है। Premium डाउनलोड के लिए प्लान चुनें।' : 'Your work and preview remain available. Choose a plan to unlock premium downloads.'}</p></div><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2">✕</button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">{availablePlans.filter(plan => plan.active).map(plan => <button type="button" key={plan.code} onClick={() => setSelectedPlan(plan.code)} className={`group relative isolate overflow-hidden rounded-2xl p-[2px] text-left transition-all duration-300 before:absolute before:inset-[-150%] before:animate-[spin_4s_linear_infinite] before:content-[''] hover:-translate-y-2 hover:scale-[1.025] hover:shadow-xl ${ringStyle[plan.code]} ${selectedPlan === plan.code ? 'ring-4 ring-offset-2 ring-slate-300 -translate-y-1 shadow-xl' : ''}`}><span className={`relative z-10 block h-full rounded-[14px] border p-4 ${planStyle[plan.code]}`}><span className="flex items-center justify-between gap-2"><span className="text-xs font-black tracking-widest">{plan.name}</span><span className="rounded-full border border-current/20 bg-white/60 px-2 py-1 text-[9px] font-extrabold uppercase">{plan.code === 'basic' ? 'STARTER' : plan.code === 'advanced' ? 'PROFESSIONAL' : 'ELITE'}</span></span><span className="mt-2 block text-2xl font-black">₹{plan.price}<small className="text-xs"> / {plan.durationDays} day{plan.durationDays === 1 ? '' : 's'}</small></span><span className="mt-2 block text-xs font-semibold">{plan.tools}</span></span></button>)}</div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{isHindi ? 'भुगतान का तरीका:' : 'Payment method:'}</strong> {isHindi ? 'सदस्यता मैन्युअल भुगतान सत्यापन के बाद सक्रिय होगी। कोई ऑटो-डेबिट नहीं है। भुगतान विवरण Admin से प्राप्त करें।' : 'Membership activates only after manual payment verification. No auto-debit. Obtain payment instructions from the site administrator.'}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold">{isHindi ? 'बाद में' : 'Not now'}</button><button type="button" disabled={requestBusy} onClick={() => { setPlansOpen(false); if (!session?.authenticated) setAuthOpen(true); else void submitMembershipRequest(); }} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{requestBusy ? (isHindi ? 'भेज रहे हैं…' : 'Please wait…') : (!session?.authenticated ? (isHindi ? 'Gmail से जारी रखें' : 'Continue with Gmail') : (isHindi ? 'भुगतान के लिए आगे बढ़ें' : 'Continue to payment'))}</button></div>
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
    <form onSubmit={sent ? verifyOtp : sendOtp} className="mt-5 space-y-3"><label className="block text-xs font-bold text-slate-700">Gmail ID<input type="email" required pattern="[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@gmail\.com" value={email} onChange={e => setEmail(e.target.value)} disabled={sent} placeholder="yourname@gmail.com" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" /></label>
      {sent && <label className="block text-xs font-bold text-slate-700">6-digit OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="000000" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm tracking-[.35em]" /></label>}
      {message && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{message}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-rose-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Please wait…' : sent ? (isHindi ? 'OTP सत्यापित करें' : 'Verify OTP') : (isHindi ? 'OTP भेजें' : 'Send OTP')}</button>
      {sent && <button type="button" onClick={() => { setSent(false); setOtp(''); setMessage(''); }} className="w-full py-2 text-xs font-semibold text-slate-500">Change Gmail address</button>}
    </form><p className="mt-4 text-[11px] leading-5 text-slate-500">OTP expires in 10 minutes. Never share your code with anyone.</p>
  </div></div>;
};
