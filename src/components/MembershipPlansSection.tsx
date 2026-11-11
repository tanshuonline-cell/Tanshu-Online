import React, { useState } from 'react';
import { ArrowRight, Check, Crown, MessageCircle, ShieldCheck, X } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    eyebrow: 'A simple start',
    description: 'Essential member access for everyday needs.',
    price: '49',
    duration: '1 month',
    features: [
      'Access to tools included in the Basic plan',
      'Private member support chat',
      'Send text, photos and PDF files',
      'No chat-minute limit',
    ],
  },
  {
    name: 'Standard',
    eyebrow: 'More ways to get things done',
    description: 'Expanded tools and the same private support.',
    price: '199',
    duration: '1 month',
    popular: true,
    features: [
      'Everything included in Basic',
      'Access to more member tools',
      'Private member support chat',
      'Send text, photos and PDF files',
      'No chat-minute limit',
    ],
  },
  {
    name: 'Premium',
    eyebrow: 'The complete experience',
    description: 'The widest planned access for members.',
    price: '599',
    duration: '90 days',
    note: 'No discount',
    features: [
      'Everything included in Standard',
      'Access to all tools assigned to Premium',
      'Private member support chat',
      'Send text, photos and PDF files',
      'No chat-minute limit',
    ],
  },
];

export const MembershipPlansSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <section id="membership" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Member benefits
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Choose Your Membership</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Get access to member tools and ask your questions privately. Send a message whenever you need;
            the support team will reply when available.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-5 shadow-xl transition-transform hover:-translate-y-1 sm:p-6 ${
                plan.popular
                  ? 'border-blue-400 bg-white text-slate-900 ring-2 ring-blue-400/30'
                  : 'border-slate-700 bg-slate-900 text-white'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
                  Popular choice
                </span>
              )}
              <div className="mb-5">
                <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${plan.popular ? 'text-blue-700' : 'text-blue-300'}`}>{plan.eyebrow}</p>
                <h3 className="mt-2 text-2xl font-black">{plan.name}</h3>
                <p className={`mt-2 min-h-10 text-xs leading-relaxed ${plan.popular ? 'text-slate-600' : 'text-slate-400'}`}>{plan.description}</p>
                <div className={`mt-4 border-t pt-4 ${plan.popular ? 'border-slate-200' : 'border-slate-700'}`}>
                  <span className="text-2xl font-extrabold">₹{plan.price}</span>
                  <p className={`mt-1 text-[11px] ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>
                    {plan.duration}{plan.note ? ` • ${plan.note}` : ''}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${plan.popular ? 'bg-blue-100 text-blue-700' : 'bg-emerald-400/15 text-emerald-300'}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className={`text-xs leading-relaxed ${plan.popular ? 'text-slate-700' : 'text-slate-300'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(plan.name)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  plan.popular
                    ? 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-500 focus:ring-offset-white'
                    : 'border border-slate-600 bg-slate-800 text-white hover:border-blue-400 hover:bg-slate-700 focus:ring-blue-400 focus:ring-offset-slate-900'
                }`}
              >
                Preview {plan.name} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-3xl items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
          <p className="text-xs leading-relaxed text-slate-300">
            <strong className="text-white">Private chat is included in all three plans.</strong> Members can send text,
            photos and PDFs at any time, with no minute counter. Replies are not instant; you will respond when you are available.
            Your personal phone number will not be shown in the member chat.
          </p>
        </div>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="membership-preview-title">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Crown className="h-5 w-5" />
            </div>
            <h3 id="membership-preview-title" className="text-xl font-black">{selectedPlan} Membership</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This is a design preview only. The displayed plan price and duration are shown for review.
              Login, payment and membership activation are not connected yet.
            </p>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
