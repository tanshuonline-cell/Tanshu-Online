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
  { code: 'basic', price: 99, durationDays: 30, name: 'BASIC', tools: 'Instant Passport Photo Studio', active: true },
  { code: 'advanced', price: 199, durationDays: 30, name: 'ADVANCED', tools: 'WhatsApp Selfie + PVC Card Maker', active: true },
  { code: 'premium', price: 299, durationDays: 30, name: 'PREMIUM', tools: 'Instant Multi Customer Photo Maker', active: true },
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
const popupPlanStyle: Record<string, string> = {
  basic: 'border-emerald-700 bg-[#075B46] text-white shadow-[0_18px_45px_-22px_rgba(7,91,70,0.65)] hover:shadow-[0_24px_55px_-18px_rgba(7,91,70,0.78)]',
  advanced: 'border-cyan-700 bg-[#086B83] text-white shadow-[0_18px_45px_-22px_rgba(8,107,131,0.65)] hover:shadow-[0_24px_55px_-18px_rgba(8,107,131,0.78)]',
  premium: 'border-violet-800 bg-[#59358B] text-white shadow-[0_18px_45px_-22px_rgba(89,53,139,0.68)] hover:shadow-[0_24px_55px_-18px_rgba(89,53,139,0.8)]',
};
const popupRingStyle: Record<string, string> = {
  basic: "before:bg-[conic-gradient(from_0deg,transparent_0_30%,#075B46_45%,#34D399_55%,transparent_70%_100%)]",
  advanced: "before:bg-[conic-gradient(from_0deg,transparent_0_30%,#086B83_45%,#67E8F9_55%,transparent_70%_100%)]",
  premium: "before:bg-[conic-gradient(from_0deg,transparent_0_30%,#59358B_45%,#C4B5FD_55%,transparent_70%_100%)]",
};

export const CspMembershipPlans: React.FC = () => {
  const { isHindi } = useLanguage();
  const [plans, setPlans] = useState(defaultPaidPlans);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  useEffect(() => {
    fetch('/api/csp/plans').then(r => r.json()).then(data => {
      if (data?.success && Array.isArray(data.plans)) {
        const next = plans.map(plan => {
          const price = data.plans.find((item: any) => item.plan_code === plan.code);
          return price ? { ...plan, price: Number(price.amount_inr), durationDays: Number(price.duration_days) || plan.durationDays, active: true } : { ...plan, active: false };
        });
        setPlans(next);
        setSelectedPlan(current => next.some(plan => plan.code === current && plan.active) ? current : next.find(plan => plan.active)?.code || 'basic');
      }
    }).catch(() => {});
  }, []);
  const selected = plans.find(plan => plan.code === selectedPlan && plan.active) || plans.find(plan => plan.active);
  return <div>
    <div className="grid gap-4 md:grid-cols-3">
      {plans.filter(plan => plan.active).map(plan => <button type="button" key={plan.code} onClick={() => setSelectedPlan(plan.code)} className={`group relative isolate overflow-hidden rounded-2xl p-[2px] text-left shadow-sm transition-all duration-300 before:absolute before:inset-[-150%] before:animate-[spin_4s_linear_infinite] before:content-[''] hover:-translate-y-2 hover:scale-[1.025] hover:shadow-xl ${ringStyle[plan.code]} ${selectedPlan === plan.code ? '-translate-y-1 scale-[1.02] shadow-xl ring-4 ring-offset-2 ring-slate-300' : ''}`}>
        <span className={`relative z-10 block h-full rounded-[14px] border p-5 ${planStyle[plan.code]}`}>
          <span className="flex items-center justify-between gap-2"><span className="text-xs font-black tracking-[.2em]">{isHindi ? (plan.code === 'basic' ? 'बेसिक' : plan.code === 'advanced' ? 'एडवांस्ड' : 'प्रीमियम') : plan.name}</span><span className="rounded-full border border-current/20 bg-white/60 px-2 py-1 text-[9px] font-extrabold uppercase">{isHindi ? (plan.code === 'basic' ? 'शुरुआती' : plan.code === 'advanced' ? 'एडवांस्ड' : 'प्रीमियम') : (plan.code === 'basic' ? 'STARTER' : plan.code === 'advanced' ? 'ADVANCED' : 'PREMIUM')}</span></span>
          <span className="mt-3 block text-3xl font-black">₹{plan.price}<small className="text-xs font-semibold opacity-65"> / {plan.durationDays} {isHindi ? (plan.durationDays === 30 ? 'महीना' : 'दिन') : (plan.durationDays === 30 ? 'month' : plan.durationDays === 1 ? 'day' : 'days')}</small></span>
          <span className="mt-2 block min-h-10 text-sm font-semibold leading-5">{isHindi ? (plan.code === 'basic' ? 'केवल इंस्टेंट पासपोर्ट फोटो स्टूडियो' : plan.code === 'advanced' ? 'WhatsApp सेल्फी से पासपोर्ट फोटो + इंस्टेंट PVC कार्ड मेकर' : 'इंस्टेंट मल्टी कस्टमर फोटो मेकर') : plan.tools}</span>
          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/70"><span className={`block h-full w-full rounded-full ${plan.code === 'basic' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : plan.code === 'advanced' ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : 'bg-gradient-to-r from-fuchsia-500 to-rose-500'}`} /></span>
        </span>
      </button>)}
    </div>
    {selected && <p className="mt-3 text-center text-xs font-semibold text-slate-600">{isHindi ? (selected.code === 'basic' ? 'बेसिक चुना गया' : selected.code === 'advanced' ? 'एडवांस्ड चुना गया' : 'प्रीमियम चुना गया') : selected.name + ' selected'} · ₹{selected.price} / {selected.durationDays} {isHindi ? (selected.durationDays === 30 ? 'महीना' : 'दिन') : (selected.durationDays === 30 ? 'month' : 'days')}</p>}
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
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
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
      if (data?.success && Array.isArray(data.plans)) {
        const next = availablePlans.map(plan => {
          const match = data.plans.find((item: any) => item.plan_code === plan.code);
          return match ? { ...plan, price: Number(match.amount_inr), durationDays: Number(match.duration_days) || plan.durationDays, active: true } : { ...plan, active: false };
        });
        setAvailablePlans(next);
        setSelectedPlan(current => next.some(plan => plan.code === current && plan.active) ? current : next.find(plan => plan.active)?.code || 'basic');
      }
    }).catch(() => {});
  }, [toolId]);
  const submitMembershipRequest = async () => {
    setRequestBusy(true);
    try {
      const response = await fetch('/api/csp/cashfree/order', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planCode: selectedPlan, phone: paymentPhone, returnPath: window.location.pathname }) });
      const data = await response.json();
      if (!response.ok || !data.success || !data.paymentSessionId) throw new Error(data.error || 'Could not create Cashfree payment.');
      setPhoneOpen(false); setPlansOpen(false);
      const w = window as any;
      if (!w.Cashfree) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[data-cashfree-sdk]') as HTMLScriptElement | null;
          if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('Cashfree Checkout could not load.')), { once: true }); return; }
          const script = document.createElement('script'); script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'; script.async = true; script.dataset.cashfreeSdk = 'true';
          script.onload = () => resolve(); script.onerror = () => reject(new Error('Cashfree Checkout could not load.')); document.head.appendChild(script);
        });
      }
      const cashfree = (window as any).Cashfree({ mode: data.environment === 'production' ? 'production' : 'sandbox' });
      await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not start Cashfree payment.');
      setPhoneOpen(true);
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
    const params = new URLSearchParams(window.location.search);
    const returnedOrder = params.get('csp_payment_order_id');
    if (!returnedOrder) return;
    params.delete('csp_payment_order_id');
    const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
    void (async () => {
      try {
        const response = await fetch('/api/csp/cashfree/verify', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: returnedOrder }) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Payment verification is pending.');
        if (data.paid) { await refresh(); setNotice(isHindi ? 'भुगतान सत्यापित! आपकी सदस्यता 30 दिनों के लिए सक्रिय हो गई है।' : 'Payment verified! Your membership is active for 30 days.'); }
        else setNotice(isHindi ? 'भुगतान अभी Cashfree से पुष्टि नहीं हुआ है। कुछ देर बाद Refresh करें।' : 'Cashfree has not confirmed the payment yet. Please check again shortly.');
      } catch (error) { setNotice(error instanceof Error ? error.message : 'Payment verification is pending.'); }
    })();
  }, []);
  useEffect(() => {
    const onFrameMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'CSP_PREMIUM_EXPORT_REQUEST') return;
      const source = event.source as Window | null;
      void requestExport().then(ok => { if (ok) source?.postMessage({ type: 'CSP_PREMIUM_EXPORT_ALLOWED' }, window.location.origin); });
    };
    window.addEventListener('message', onFrameMessage);
    return () => window.removeEventListener('message', onFrameMessage);
  }, [toolEnabled, toolId, isHindi]);

  // Gate real/programmatic downloads, block browser Save shortcuts, and authorize printing.
  useEffect(() => {
    const originalPrint = window.print;
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    const replayedAnchors = new WeakSet<HTMLAnchorElement>();
    const replayDownload = (anchor: HTMLAnchorElement) => {
      replayedAnchors.add(anchor);
      originalAnchorClick.call(anchor);
    };
    const authorizePrint = () => {
      void requestExport().then(ok => {
        if (!ok) return;
        document.documentElement.dataset.cspPrintAuthorized = 'true';
        originalPrint.call(window);
      });
    };
    const onAfterPrint = () => { delete document.documentElement.dataset.cspPrintAuthorized; };
    const guardedPrint = authorizePrint;
    const onSaveAndPrintShortcuts = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = (event.key || '').toLowerCase();
      const code = event.code || '';
      if (key === 's' || code === 'KeyS') {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (key === 'c') {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest('input, textarea, select, [contenteditable="true"]')) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
      }
      if (key === 'p') {
        event.preventDefault();
        event.stopImmediatePropagation();
        authorizePrint();
      }
    };
    const onProtectedContextMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('img, canvas, video')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const onProtectedDragStart = (event: DragEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('img, canvas')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const printGuardStyle = document.createElement('style');
    printGuardStyle.dataset.cspPrintGuard = 'true';
    printGuardStyle.textContent = '@media print { html:not([data-csp-print-authorized="true"]) body { display: none !important; } }';
    document.head.appendChild(printGuardStyle);
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
    document.addEventListener('click', onDownloadClick, true);
    // Capture at window before document-level tool handlers so browser Save/Print
    // accelerators are cancelled before they can trigger page-level actions.
    window.addEventListener('keydown', onSaveAndPrintShortcuts, true);
    document.addEventListener('keydown', onSaveAndPrintShortcuts, true);
    document.addEventListener('contextmenu', onProtectedContextMenu, true);
    document.addEventListener('dragstart', onProtectedDragStart, true);
    window.addEventListener('afterprint', onAfterPrint);
    window.print = guardedPrint;
    HTMLAnchorElement.prototype.click = guardedAnchorClick;
    return () => {
      document.removeEventListener('click', onDownloadClick, true);
      window.removeEventListener('keydown', onSaveAndPrintShortcuts, true);
      document.removeEventListener('keydown', onSaveAndPrintShortcuts, true);
      document.removeEventListener('contextmenu', onProtectedContextMenu, true);
      document.removeEventListener('dragstart', onProtectedDragStart, true);
      window.removeEventListener('afterprint', onAfterPrint);
      printGuardStyle.remove();
      delete document.documentElement.dataset.cspPrintAuthorized;
      if (window.print === guardedPrint) window.print = originalPrint;
      if (HTMLAnchorElement.prototype.click === guardedAnchorClick) HTMLAnchorElement.prototype.click = originalAnchorClick;
    };
  }, [toolEnabled, toolId, isHindi]);
  if (!toolEnabled) return <div className="min-h-screen grid place-items-center bg-slate-50 px-5 text-center"><div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-xl font-black">{isHindi ? 'यह टूल फिलहाल उपलब्ध नहीं है' : 'This tool is temporarily unavailable'}</h1><p className="mt-2 text-sm text-slate-600">{isHindi ? 'कृपया बाद में दोबारा प्रयास करें।' : 'Please check back later.'}</p><a href="/csc-cyber-cafe-toolkits" className="mt-4 inline-block font-bold text-rose-800">{isHindi ? 'सभी टूल देखें' : 'View all tools'}</a></div></div>;
  return <Gate.Provider value={{ requestExport }}>
    <div className="relative min-h-screen">
      {children}
    </div>
    {authOpen && <CspGmailOtpModal onClose={() => setAuthOpen(false)} onVerified={async () => { setAuthOpen(false); const verified = await refresh(); if (!verified.allowedTools?.includes(toolId)) setPhoneOpen(true); }} />}
    {phoneOpen && <div className="fixed inset-0 z-[135] grid place-items-center bg-slate-950/75 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-950">{isHindi ? 'Cashfree भुगतान के लिए मोबाइल नंबर' : 'Mobile number for Cashfree payment'}</h2><button type="button" onClick={() => setPhoneOpen(false)} className="rounded-lg px-3 py-2 text-slate-500">✕</button></div><p className="mt-2 text-sm leading-6 text-slate-600">{isHindi ? 'यह नंबर केवल भुगतान Checkout के लिए है। Gmail OTP लॉगिन में मोबाइल नंबर की जरूरत नहीं है।' : 'This number is collected only for payment checkout. Gmail OTP login does not require a mobile number.'}</p><label className="mt-4 block text-xs font-bold text-slate-700">{isHindi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}<input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={paymentPhone} onChange={e => setPaymentPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="9876543210" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" /></label><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setPhoneOpen(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold">{isHindi ? 'रद्द करें' : 'Cancel'}</button><button type="button" disabled={requestBusy || !/^[6-9]\d{9}$/.test(paymentPhone)} onClick={() => void submitMembershipRequest()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{requestBusy ? (isHindi ? 'कृपया प्रतीक्षा करें…' : 'Please wait…') : (isHindi ? 'Cashfree से भुगतान करें' : 'Pay with Cashfree')}</button></div></section></div>}
    {plansOpen && <><style>{`
      @keyframes csp-liquid-flow { 0%,100% { transform: translate3d(-8%, 7%, 0) rotate(-7deg) scale(1); } 50% { transform: translate3d(8%, -6%, 0) rotate(8deg) scale(1.16); } }
      @keyframes csp-liquid-glide { 0%,100% { transform: translate3d(10%, -10%, 0) scale(.88); } 50% { transform: translate3d(-12%, 12%, 0) scale(1.18); } }
      @keyframes csp-check-fill { 0% { transform: scale(.55); opacity:.35; } 70% { transform: scale(1.12); opacity:1; } 100% { transform:scale(1); opacity:1; } }
      @keyframes csp-arrow-pulse { 0%,100% { transform:translateX(0); box-shadow:0 0 0 0 rgba(255,255,255,0); } 50% { transform:translateX(4px); box-shadow:0 0 0 5px rgba(255,255,255,.13); } }
      .csp-liquid-card { isolation:isolate; }
      .csp-liquid-effect { position:absolute; pointer-events:none; z-index:0; inset:-22%; border-radius:42%; opacity:0; transition:opacity .45s ease; }
      .csp-liquid-card:hover .csp-liquid-effect, .csp-liquid-card:focus-visible .csp-liquid-effect { opacity:1; }
      .csp-liquid-card > span:not(.csp-liquid-effect) { position:relative; z-index:1; }
      .csp-liquid-wave { filter:blur(13px); mix-blend-mode:screen; animation:csp-liquid-flow 4.8s ease-in-out infinite; }
      .csp-liquid-glow { filter:blur(20px); mix-blend-mode:screen; animation:csp-liquid-glide 6s ease-in-out infinite; }
      .csp-liquid-basic .csp-liquid-wave { background:radial-gradient(ellipse at 30% 35%,rgba(52,211,153,.92),transparent 48%),radial-gradient(ellipse at 75% 70%,rgba(16,185,129,.72),transparent 50%); }
      .csp-liquid-basic .csp-liquid-glow { background:radial-gradient(ellipse at 65% 25%,rgba(167,243,208,.72),transparent 44%),linear-gradient(125deg,transparent 25%,rgba(16,185,129,.34),transparent 75%); }
      .csp-liquid-advanced .csp-liquid-wave { background:radial-gradient(ellipse at 30% 35%,rgba(103,232,249,.94),transparent 48%),radial-gradient(ellipse at 75% 70%,rgba(6,182,212,.76),transparent 50%); }
      .csp-liquid-advanced .csp-liquid-glow { background:radial-gradient(ellipse at 65% 25%,rgba(165,243,252,.76),transparent 44%),linear-gradient(125deg,transparent 25%,rgba(34,211,238,.36),transparent 75%); }
      .csp-liquid-premium .csp-liquid-wave { background:radial-gradient(ellipse at 30% 35%,rgba(196,181,253,.96),transparent 48%),radial-gradient(ellipse at 75% 70%,rgba(168,85,247,.78),transparent 50%); }
      .csp-liquid-premium .csp-liquid-glow { background:radial-gradient(ellipse at 65% 25%,rgba(233,213,255,.78),transparent 44%),linear-gradient(125deg,transparent 25%,rgba(192,132,252,.38),transparent 75%); }
      .csp-plan-badge { backdrop-filter:blur(8px); box-shadow:0 5px 18px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.35); transition:transform .3s ease,filter .3s ease,box-shadow .3s ease; }
      .group:hover .csp-plan-badge { transform:translateY(-2px) scale(1.04); filter:saturate(1.25); box-shadow:0 8px 22px rgba(0,0,0,.24),0 0 14px rgba(255,255,255,.2); }
      .csp-badge-basic { color:#064e3b; border-color:#a7f3d0; background:linear-gradient(135deg,#d1fae5,#6ee7b7 55%,#ecfdf5); }
      .csp-badge-advanced { color:#164e63; border-color:#a5f3fc; background:linear-gradient(135deg,#cffafe,#67e8f9 55%,#ecfeff); }
      .csp-badge-premium { color:#4c1d95; border-color:#ddd6fe; background:linear-gradient(135deg,#ede9fe,#c4b5fd 55%,#f5f3ff); }
      .csp-plan-arrow { transition:transform .28s ease,box-shadow .28s ease,background .28s ease; }
      .group:hover .csp-arrow-next { animation:csp-arrow-pulse 1.1s ease-in-out infinite; background:rgba(255,255,255,.22); border-color:rgba(255,255,255,.8); }
      .csp-arrow-selected { color:#064e3b; border-color:#a7f3d0; background:linear-gradient(135deg,#d1fae5,#34d399); box-shadow:0 0 0 3px rgba(52,211,153,.2),0 0 18px rgba(52,211,153,.35); }
      .csp-selected-check { display:inline-grid; place-items:center; width:18px; height:18px; border-radius:999px; color:#064e3b; background:linear-gradient(135deg,#d1fae5,#34d399); box-shadow:0 0 12px rgba(52,211,153,.45); animation:csp-check-fill .55s cubic-bezier(.2,.8,.2,1) both; }
      @media (prefers-reduced-motion:reduce) { .csp-liquid-wave,.csp-liquid-glow,.csp-arrow-next,.csp-selected-check { animation:none !important; } }
    `}</style><div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md"><section role="dialog" aria-modal="true" className="my-auto w-full max-w-5xl rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_35px_100px_-25px_rgba(2,6,23,0.75)] sm:p-8">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-rose-800">TANSHU ONLINE · PREMIUM PRINT</p><h2 className="mt-2 text-2xl font-black text-slate-950">{isHindi ? 'अपना Premium प्लान चुनें' : 'Choose your Premium plan'}</h2><p className="mt-2 text-sm text-slate-600">{isHindi ? 'आपका काम और प्रीव्यू सुरक्षित है। Premium डाउनलोड के लिए प्लान चुनें।' : 'Your work and preview remain available. Choose a plan to unlock premium downloads.'}</p></div><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2">✕</button></div>
      <div className="mt-7 grid items-stretch gap-5 md:grid-cols-3">{availablePlans.filter(plan => plan.active).map(plan => <button type="button" key={plan.code} onClick={() => setSelectedPlan(plan.code)} aria-pressed={selectedPlan === plan.code} className={`group relative isolate min-w-0 overflow-hidden rounded-[28px] p-[2px] text-left shadow-lg transition-all duration-300 ease-out before:absolute before:inset-[-150%] before:animate-[spin_5s_linear_infinite] before:content-[''] hover:-translate-y-3 hover:scale-[1.025] hover:shadow-2xl active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400 focus-visible:ring-offset-4 ${popupRingStyle[plan.code]} ${selectedPlan === plan.code ? '-translate-y-2 scale-[1.02] ring-4 ring-offset-2 ring-slate-300' : ''}`}><span className={`relative z-10 flex min-h-[292px] h-full flex-col rounded-[26px] border p-5 sm:p-6 ${popupPlanStyle[plan.code]} csp-liquid-card csp-liquid-${plan.code}`}><span aria-hidden="true" className="csp-liquid-effect csp-liquid-wave" /><span aria-hidden="true" className="csp-liquid-effect csp-liquid-glow" /><span className="flex items-center justify-between gap-2"><span className="text-[11px] font-black uppercase tracking-[.24em]">{isHindi ? (plan.code === 'basic' ? 'बेसिक' : plan.code === 'advanced' ? 'एडवांस्ड' : 'प्रीमियम') : plan.name}</span><span className={`csp-plan-badge rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] ${plan.code === 'basic' ? 'csp-badge-basic' : plan.code === 'advanced' ? 'csp-badge-advanced' : 'csp-badge-premium'}`}>{isHindi ? (plan.code === 'basic' ? 'शुरुआत' : plan.code === 'advanced' ? 'एडवांस' : 'विशेष') : (plan.code === 'basic' ? 'STARTER' : plan.code === 'advanced' ? 'POPULAR' : 'ELITE')}</span></span><span className="mt-7 block text-[38px] font-black leading-none tracking-tight sm:text-[42px]">₹{plan.price}</span><span className="mt-2 block text-[11px] font-bold uppercase tracking-[.18em] opacity-65">{isHindi ? '30 दिन की सदस्यता' : '30 DAY MEMBERSHIP'}</span><span className="my-5 block h-px w-full bg-current/15" /><span className="block flex-1 text-[13px] font-semibold leading-6">{isHindi ? (plan.code === 'basic' ? 'इंस्टेंट पासपोर्ट फोटो स्टूडियो का प्रीमियम डाउनलोड और प्रिंट एक्सेस' : plan.code === 'advanced' ? 'WhatsApp सेल्फी पासपोर्ट फोटो और इंस्टेंट PVC कार्ड मेकर का एक्सेस' : 'इंस्टेंट मल्टी कस्टमर फोटो मेकर का प्रीमियम एक्सेस') : plan.tools}</span><span className="csp-plan-action mt-6 flex items-center justify-between border-t border-current/20 pt-4 text-[10px] font-black uppercase tracking-[.16em]"><span className="flex items-center gap-2"><span>{selectedPlan === plan.code ? (isHindi ? 'चुना गया प्लान' : 'SELECTED PLAN') : (isHindi ? 'प्लान चुनें' : 'SELECT PLAN')}</span>{selectedPlan === plan.code && <span className="csp-selected-check" aria-hidden="true">✓</span>}</span><span className={`csp-plan-arrow grid h-8 w-8 place-items-center rounded-full border text-base ${selectedPlan === plan.code ? 'csp-arrow-selected' : 'csp-arrow-next'}`} aria-hidden="true">{selectedPlan === plan.code ? '✓' : '→'}</span></span></span></button>)}</div>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{isHindi ? 'भुगतान का तरीका:' : 'Payment method:'}</strong> {isHindi ? 'Cashfree Checkout पर UPI, कार्ड या नेट बैंकिंग से भुगतान करें। भुगतान की पुष्टि होने पर सदस्यता अपने-आप सक्रिय होगी। कोई ऑटो-डेबिट नहीं है।' : 'Pay through Cashfree Checkout using supported payment methods. Membership activates automatically only after server-side payment verification. No auto-debit.'}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setPlansOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold">{isHindi ? 'बाद में' : 'Not now'}</button><button type="button" disabled={requestBusy || !availablePlans.some(plan => plan.active)} onClick={() => { if (!session?.authenticated) { setPlansOpen(false); setAuthOpen(true); } else { setPlansOpen(false); setPhoneOpen(true); } }} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{requestBusy ? (isHindi ? 'भेज रहे हैं…' : 'Please wait…') : !availablePlans.some(plan => plan.active) ? (isHindi ? 'अभी कोई प्लान उपलब्ध नहीं है' : 'No plans currently available') : (!session?.authenticated ? (isHindi ? 'Gmail से जारी रखें' : 'Continue with Gmail') : (isHindi ? 'भुगतान के लिए आगे बढ़ें' : 'Continue to payment'))}</button></div>
    </section></div></>}
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
