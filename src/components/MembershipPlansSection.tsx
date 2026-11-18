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
    theme: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50',
    button: 'bg-amber-700 hover:bg-amber-800',
  },
  {
    code: 'advanced',
    name: 'ADVANCED',
    price: '199',
    duration: '30 days',
    description: 'More studio tools for regular photo and card work.',
    tools: ['Instant Passport Photo Studio', 'Instant PVC Card Maker', 'Instant Multi Customer Photo Maker'],
    theme: 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50',
    button: 'bg-sky-700 hover:bg-sky-800',
    popular: true,
  },
  {
    code: 'premium',
    name: 'PREMIUM',
    price: '299',
    duration: '30 days',
    description: 'Access to all four premium photo studio tools.',
    tools: ['Instant Passport Photo Studio', 'Instant PVC Card Maker', 'WhatsApp Selfie to Passport Photo', 'Instant Multi Customer Photo Maker'],
    theme: 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50',
    button: 'bg-violet-700 hover:bg-violet-800',
  },
];

export const MembershipPlansSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);

  return (
    <section id="membership" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-8" aria-labelledby="membership-title">
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
            <article key={plan.code} className={`relative flex flex-col rounded-2xl border p-5 text-slate-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-6 ${plan.theme}`}>
              {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-700 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">Popular plan</span>}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-black tracking-wide">{plan.name}</h3>
                {plan.code === 'premium' && <Crown className="h-5 w-5 text-violet-700" />}
              </div>
              <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-600">{plan.description}</p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <span className="text-3xl font-black">₹{plan.price}</span>
                <span className="ml-2 text-xs font-semibold text-slate-500">/ {plan.duration}</span>
              </div>
              <ul className="my-5 flex-1 space-y-2.5">
                {plan.tools.map((tool) => (
                  <li key={tool} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setSelectedPlan(plan)} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white transition ${plan.button}`}>
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
