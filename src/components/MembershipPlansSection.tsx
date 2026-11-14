import React, { useState } from 'react';
import { ArrowRight, Check, Crown, MessageCircle, ShieldCheck, X } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    theme: 'basic',
    eyebrow: 'A simple start',
    description: 'Essential member access for everyday needs.',
    price: '49',
    duration: '1 day',
    features: [
      'Access to tools included in the Basic plan',
      'Private member support chat',
      'Send text, photos and PDF files',
      'No chat-minute limit',
    ],
  },
  {
    name: 'Standard',
    theme: 'standard',
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
    theme: 'premium',
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
      <style>{`
        .membership-water-card { isolation: isolate; overflow: visible; }
        .membership-water-card::before,
        .membership-water-card::after {
          content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          border-radius: inherit; opacity: 0; transition: opacity .45s ease;
        }
        .membership-water-card::before {
          background:
            radial-gradient(ellipse at 12% 18%, rgba(56,189,248,.26), transparent 38%),
            radial-gradient(ellipse at 88% 78%, rgba(45,212,191,.22), transparent 42%),
            radial-gradient(ellipse at 55% 110%, rgba(255,255,255,.16), transparent 45%);
          background-size: 180% 180%; background-position: 0% 50%;
          animation: membership-card-current 5.5s ease-in-out infinite;
        }
        .membership-water-card::after {
          inset: 0; opacity: 0; overflow: hidden;
          background: linear-gradient(112deg, transparent 28%, rgba(255,255,255,.20) 46%, rgba(255,255,255,.05) 52%, transparent 70%);
          transform: translateX(-110%);
        }
        .membership-water-card:hover::before,
        .membership-water-card:focus-within::before { opacity: 1; }
        .membership-water-card:hover::after,
        .membership-water-card:focus-within::after {
          opacity: 1; animation: membership-card-sheen 2.8s ease-in-out infinite;
        }
        .membership-water-card > *:not(span) { position: relative; z-index: 1; }
        .membership-water-card > span {
          position: absolute; z-index: 2; left: 50%; top: -0.65rem;
          margin-left: 0; transform: translateX(-50%); width: max-content;
          max-width: calc(100% - 2rem); white-space: nowrap; border-radius: 9999px;
        }
        @keyframes membership-card-current {
          0%, 100% { background-position: 0% 45%; transform: translate3d(-1%, 0, 0) scale(1); }
          50% { background-position: 100% 55%; transform: translate3d(1%, -1%, 0) scale(1.035); }
        }
        @keyframes membership-card-sheen {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(110%); }
        }
        .membership-ripple-button { isolation: isolate; overflow: hidden; position: relative; }
        .membership-ripple-button::before,
        .membership-ripple-button::after {
          content: ""; position: absolute; z-index: 0; pointer-events: none;
          inset: 50% auto auto 50%; width: 18px; height: 18px; border-radius: 9999px;
          opacity: 0; transform: translate(-50%, -50%) scale(.2);
        }
        .membership-ripple-button::before {
          border: 1.5px solid currentColor;
          animation: membership-water-ring 1.65s ease-out infinite;
        }
        .membership-ripple-button::after {
          width: 34px; height: 34px;
          background: radial-gradient(circle, rgba(255,255,255,.34) 0%, rgba(255,255,255,.12) 38%, transparent 72%);
          animation: membership-water-glow 1.65s ease-out infinite .28s;
        }
        .membership-ripple-button:hover::before,
        .membership-ripple-button:hover::after,
        .membership-ripple-button:focus-visible::before,
        .membership-ripple-button:focus-visible::after { animation-play-state: running; }
        .membership-ripple-button::before,
        .membership-ripple-button::after { animation-play-state: paused; }
        .membership-ripple-button > span { position: relative; z-index: 1; }
        @keyframes membership-water-ring {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.25); }
          12% { opacity: .48; }
          78% { opacity: .16; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(17); }
        }
        @keyframes membership-water-glow {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.3); }
          18% { opacity: .72; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(11); }
        }
        @media (prefers-reduced-motion: reduce) {
          .membership-ripple-button::before, .membership-ripple-button::after,
          .membership-water-card::before, .membership-water-card::after { animation: none !important; transition: none !important; }
        }
      `}</style>
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
          {plans.map((plan) => {
            const isBasic = plan.theme === 'basic';
            const isStandard = plan.theme === 'standard';
            const isPremium = plan.theme === 'premium';

            const cardTheme = isBasic
              ? 'border-slate-700 bg-slate-900 text-white'
              : isStandard
                ? 'border-teal-400 bg-gradient-to-br from-white via-teal-50 to-cyan-50 text-slate-900 ring-1 ring-teal-300/60'
                : 'border-amber-400/80 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/70 text-white ring-2 ring-amber-400/20';

            const eyebrowTheme = isBasic
              ? 'text-blue-300'
              : isStandard
                ? 'text-teal-700'
                : 'text-amber-300';

            const descriptionTheme = isBasic
              ? 'text-slate-400'
              : isStandard
                ? 'text-slate-600'
                : 'text-slate-300';

            const dividerTheme = isBasic
              ? 'border-slate-700'
              : isStandard
                ? 'border-teal-200'
                : 'border-amber-400/30';

            const priceTheme = isPremium ? 'text-amber-300' : '';

            const durationTheme = isBasic
              ? 'text-slate-400'
              : isStandard
                ? 'text-slate-500'
                : 'text-amber-100/70';

            const checkTheme = isBasic
              ? 'bg-emerald-400/15 text-emerald-300'
              : isStandard
                ? 'bg-teal-100 text-teal-700'
                : 'bg-amber-400/15 text-amber-300';

            const featureTheme = isBasic
              ? 'text-slate-300'
              : isStandard
                ? 'text-slate-700'
                : 'text-slate-200';

            const buttonTheme = isBasic
              ? 'border border-slate-600 bg-slate-800 text-white hover:border-blue-400 hover:bg-slate-700 focus:ring-blue-400 focus:ring-offset-slate-900'
              : isStandard
                ? 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-500 focus:ring-offset-white'
                : 'border border-amber-400/60 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 focus:ring-amber-400 focus:ring-offset-slate-900';

            return (
              <article
                key={plan.name}
                className={`membership-water-card relative flex flex-col rounded-2xl border p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-6 ${cardTheme}`}
              >
                {isBasic && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-blue-300/50 bg-gradient-to-r from-slate-800 to-blue-900 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-200 shadow-lg">
                    A simple start
                  </span>
                )}
                {isStandard && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-700 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
                    Popular choice
                  </span>
                )}
                {isPremium && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-lg">
                    Premium experience
                  </span>
                )}
                <div className="mb-5">
                  <h3 className="mt-2 text-2xl font-black">{plan.name}</h3>
                  <p className={`mt-2 min-h-10 text-xs leading-relaxed ${descriptionTheme}`}>{plan.description}</p>
                  <div className={`mt-4 border-t pt-4 ${dividerTheme}`}>
                    <span className={`text-2xl font-extrabold ${priceTheme}`}>₹{plan.price}</span>
                    <p className={`mt-1 text-[11px] ${durationTheme}`}>
                      {plan.duration}{plan.note ? ` • ${plan.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${checkTheme}`}>
                        <Check className="h-3 w-3" />
                      </span>
                      <span className={`text-xs leading-relaxed ${featureTheme}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`membership-ripple-button group inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition duration-300 hover:scale-[1.015] focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonTheme}`}
                >
                  <span className="inline-flex items-center gap-2">
                    Preview {plan.name} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </article>
            );
          })}
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
