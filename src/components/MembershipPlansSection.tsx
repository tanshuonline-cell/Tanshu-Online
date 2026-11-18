import React, { useState } from 'react';
import { ArrowRight, Check, Crown, X } from 'lucide-react';

const plans = [
  {
    code: 'basic',
    name: 'BASIC',
    price: '99',
    duration: '30 days',
    description: 'Start with the Instant Passport Photo Studio.',
    tools: ['Instant Passport Photo Studio'],
    theme: 'border-amber-300/90 bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100',
    button: 'bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800',
  },
  {
    code: 'advanced',
    name: 'ADVANCED',
    price: '199',
    duration: '30 days',
    description: 'More studio tools for regular photo and card work.',
    tools: ['Instant Passport Photo Studio', 'Instant PVC Card Maker', 'Instant Multi Customer Photo Maker'],
    theme: 'border-sky-300/90 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100',
    button: 'bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-800 hover:to-indigo-800',
    popular: true,
  },
  {
    code: 'premium',
    name: 'PREMIUM',
    price: '299',
    duration: '30 days',
    description: 'Access to all four premium photo studio tools.',
    tools: ['Instant Passport Photo Studio', 'Instant PVC Card Maker', 'WhatsApp Selfie to Passport Photo', 'Instant Multi Customer Photo Maker'],
    theme: 'border-violet-300/90 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-rose-100',
    button: 'bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-800 hover:to-fuchsia-800',
  },
];

export const MembershipPlansSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);

  return (
    <section id="membership" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-8" aria-labelledby="membership-title">
      <style>{`
        @keyframes membership-water-shimmer {
          0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
          18% { opacity: .7; }
          55% { opacity: .35; }
          100% { transform: translateX(230%) skewX(-18deg); opacity: 0; }
        }
        @keyframes membership-ripple {
          0% { transform: scale(.15); opacity: .48; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes membership-card-waves {
          0% { transform: scale(.35); opacity: .42; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes membership-section-glow {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(12deg); }
          100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        }
        .membership-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }
        .membership-section::before {
          content: "";
          position: absolute;
          inset: -35%;
          z-index: -1;
          opacity: .18;
          pointer-events: none;
          background: radial-gradient(ellipse at 18% 28%, rgba(56,189,248,.48), transparent 34%), radial-gradient(ellipse at 78% 72%, rgba(168,85,247,.42), transparent 38%), radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.12), transparent 55%);
          background-size: 180% 180%;
          transition: opacity .45s ease;
        }
        .membership-section:has(.membership-card:hover)::before {
          opacity: .62;
          animation: membership-section-glow 5s ease-in-out infinite;
        }
        .membership-card {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transition: transform .32s cubic-bezier(.2,.8,.2,1), box-shadow .32s ease, border-color .32s ease;
        }
        .membership-card::before {
          content: "";
          position: absolute;
          inset: 12% 18%;
          z-index: -1;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,.72);
          opacity: 0;
          transform: scale(.35);
          pointer-events: none;
        }
        .membership-card:hover::before {
          animation: membership-card-waves 1.7s ease-out infinite;
        }
        .membership-card::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          opacity: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255,255,255,.82), transparent 58%);
          transition: opacity .32s ease;
          pointer-events: none;
        }
        .membership-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 24px 48px -22px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.32);
        }
        .membership-card:hover::after { opacity: 1; }
        .membership-cta {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          box-shadow: 0 7px 18px -8px rgba(15,23,42,.55);
          transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
        }
        .membership-cta::before {
          content: "";
          position: absolute;
          inset: -35% auto -35% -35%;
          width: 34%;
          z-index: -1;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.62), transparent);
          transform: translateX(-130%) skewX(-18deg);
          pointer-events: none;
        }
        .membership-cta::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          left: 50%;
          top: 50%;
          border: 2px solid rgba(255,255,255,.72);
          border-radius: 9999px;
          transform: translate(-50%,-50%) scale(.15);
          opacity: 0;
          pointer-events: none;
        }
        .membership-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -9px rgba(15,23,42,.62);
          filter: saturate(1.12) brightness(1.06);
        }
        .membership-cta:hover::before { animation: membership-water-shimmer 1.15s ease-out; }
        .membership-cta:hover::after { animation: membership-ripple .8s ease-out; }
        .membership-cta:focus-visible {
          outline: 3px solid rgba(255,255,255,.9);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .membership-card, .membership-cta { transition: none; }
          .membership-section:has(.membership-card:hover)::before { animation: none; }
          .membership-card:hover::before { animation: none; }
          .membership-card:hover, .membership-cta:hover { transform: none; }
          .membership-cta:hover::before, .membership-cta:hover::after { animation: none; }
        }
      `}</style>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">TANSHU ONLINE · MEMBER ACCESS</p>
          <h2 id="membership-title" className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Membership Plans · सदस्यता प्लान</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Choose the plan that matches the photo studio tools you need.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.code} className={`membership-card relative flex flex-col rounded-2xl border p-5 text-slate-900 shadow-lg sm:p-6 ${plan.popular ? 'pt-12 sm:pt-12' : ''} ${plan.theme}`}>
              {plan.popular && <span className="absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-sky-800 px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg ring-2 ring-sky-300/60">Popular plan</span>}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black tracking-wide">{plan.name}</h3>
                {plan.code === 'premium' && <Crown className="h-5 w-5 text-violet-700" />}
              </div>
              <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-600">{plan.description}</p>
              <div className="mt-4 border-t border-slate-300/70 pt-4">
                <span className="text-3xl font-black">₹{plan.price}</span>
                <span className="ml-2 text-xs font-semibold text-slate-600">/ {plan.duration}</span>
              </div>
              <ul className="my-5 flex-1 space-y-2.5">
                {plan.tools.map((tool) => (
                  <li key={tool} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setSelectedPlan(plan)} className={`membership-cta inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white ${plan.button}`}>
                Preview {plan.name} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-slate-400">
          Plan display preview only. Payment, account activation and membership access are not connected in this homepage-only change.
        </p>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="membership-preview-title">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
            <button type="button" onClick={() => setSelectedPlan(null)} className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Close preview"><X className="h-4 w-4" /></button>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Crown className="h-5 w-5" /></div>
            <h3 id="membership-preview-title" className="text-xl font-black">{selectedPlan.name} Membership</h3>
            <p className="mt-2 text-sm text-slate-600">₹{selectedPlan.price} · {selectedPlan.duration}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">This is a homepage design preview. No payment is collected and no membership is activated from this dialog.</p>
            <button type="button" onClick={() => setSelectedPlan(null)} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">Close preview</button>
          </div>
        </div>
      )}
    </section>
  );
};
