import React from 'react';
import {
  Check,
  ShieldCheck,
  MessageCircle,
  LockKeyhole,
  CalendarClock,
  ArrowRight,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBackHome: () => void;
}

const plans = [
  {
    name: 'Basic',
    price: 49,
    tone: 'border-slate-200 bg-gradient-to-b from-slate-50 to-white',
    accent: 'bg-slate-700',
    label: 'text-slate-700',
    priceTone: 'text-slate-900',
    iconTone: 'bg-slate-100 text-slate-700',
    buttonTone: 'bg-slate-800 hover:bg-slate-700',
    noteHi: 'जानकारी व मार्गदर्शन + 1–2 चुनिंदा टूल्स',
    noteEn: 'Guidance + 1–2 selected tools',
    toolHi: '1–2 चुनिंदा ऑनलाइन टूल्स',
    toolEn: '1–2 selected online tools',
  },
  {
    name: 'Standard',
    price: 149,
    tone: 'border-blue-200 bg-gradient-to-b from-blue-50/90 to-white',
    accent: 'bg-blue-600',
    label: 'text-blue-700',
    priceTone: 'text-blue-950',
    iconTone: 'bg-blue-100 text-blue-700',
    buttonTone: 'bg-blue-700 hover:bg-blue-600',
    noteHi: 'मार्गदर्शन + Basic से अधिक चुनिंदा टूल्स',
    noteEn: 'Guidance + more selected tools than Basic',
    toolHi: 'Basic से अधिक चुनिंदा टूल्स',
    toolEn: 'More selected tools than Basic',
  },
  {
    name: 'Premium',
    price: 249,
    tone: 'border-violet-300 bg-gradient-to-b from-violet-100/90 via-white to-fuchsia-50/70 ring-1 ring-violet-200',
    accent: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    label: 'text-violet-800',
    priceTone: 'text-violet-950',
    iconTone: 'bg-violet-100 text-violet-700',
    buttonTone: 'bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-600 hover:to-fuchsia-600',
    noteHi: 'मार्गदर्शन + Standard से अधिक चुनिंदा टूल्स',
    noteEn: 'Guidance + more selected tools than Standard',
    toolHi: 'Standard से अधिक चुनिंदा टूल्स',
    toolEn: 'More selected tools than Standard',
  },
  {
    name: 'Professional',
    price: 499,
    tone: 'border-amber-300 bg-gradient-to-b from-amber-50 via-white to-orange-50/70',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
    label: 'text-amber-800',
    priceTone: 'text-amber-950',
    iconTone: 'bg-amber-100 text-amber-800',
    buttonTone: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
    noteHi: 'सभी उपलब्ध वेबसाइट टूल्स और सुविधाएँ',
    noteEn: 'All available website tools and features',
    toolHi: 'सभी उपलब्ध वेबसाइट टूल्स',
    toolEn: 'All available website tools',
  },
];

export const MembershipPage: React.FC<Props> = ({ onBackHome }) => {
  const { isHindi, setLanguage } = useLanguage();

  const copy = {
    back: isHindi ? '← TANSHU ONLINE पर वापस जाएँ' : '← Back to TANSHU ONLINE',
    secure: isHindi ? 'सुरक्षित सदस्यता पोर्टल' : 'SECURE MEMBERSHIP PORTAL',
    title: 'TANSHU ONLINE MEMBERSHIP',
    intro: isHindi
      ? 'सदस्य बनें और सरकारी सेवाओं, दस्तावेज़ों, बैंकिंग सुधारों तथा ऑनलाइन आवेदनों से जुड़ी जानकारी और मार्गदर्शन प्राप्त करें। चुने गए प्लान के अनुसार वेबसाइट टूल्स भी उपलब्ध होंगे।'
      : 'Become a member to get information and guidance for government services, documents, banking corrections and online applications. Website tools are included according to your selected plan.',
    guidance: isHindi ? 'दस्तावेज़ मार्गदर्शन' : 'DOCUMENT GUIDANCE',
    tools: isHindi ? 'प्लान के अनुसार टूल्स' : 'TOOLS BY PLAN',
    monthly: isHindi ? 'मासिक सदस्यता' : 'MONTHLY MEMBERSHIP',
    plansKicker: 'MEMBERSHIP PLANS',
    plansTitle: isHindi ? 'अपनी सदस्यता योजना चुनें' : 'Choose Your Membership Plan',
    plansDesc: isHindi
      ? 'सभी योजनाओं में सरकारी सेवाओं, दस्तावेज़ों और ऑनलाइन आवेदनों से जुड़ा मार्गदर्शन शामिल है। टूल्स की पहुँच प्लान के अनुसार अलग-अलग होगी।'
      : 'Every plan includes guidance for government services, documents and online applications. Tool access varies by membership plan.',
    month: isHindi ? '/ महीना' : '/ month',
    guidanceBenefit: isHindi
      ? 'सरकारी सेवाओं, दस्तावेज़ों, बैंकिंग सुधारों और आवेदन की जानकारी व मार्गदर्शन'
      : 'Guidance for government services, documents, banking corrections and applications',
    chatBenefit: isHindi
      ? 'Private Chat उपलब्ध होने पर अतिरिक्त माध्यम; तुरंत जवाब की गारंटी नहीं'
      : 'Private Chat is an additional channel when available; instant replies are not guaranteed',
    unavailable: isHindi ? 'सदस्यता जल्द शुरू होगी' : 'Membership Coming Soon',
    billingTitle: isHindi
      ? 'मासिक ऑटो-रिन्यूअल और भुगतान की जरूरी जानकारी:'
      : 'Monthly Auto-Renewal & Important Payment Information:',
    billing: isHindi
      ? 'सदस्यता हर महीने अपने आप रिन्यू होगी। चेकआउट के समय recurring payment की सहमति ली जाएगी। आप अगली बिलिंग रोकने के लिए auto-renewal कभी भी cancel कर सकते हैं; पहले से भुगतान की गई अवधि समाप्त होने तक चालू रहेगी। सफल भुगतान के बाद सामान्यतः refund उपलब्ध नहीं होगा; duplicate payment या असफल भुगतान में राशि कटने पर gateway verification के अनुसार समाधान होगा।'
      : 'Membership renews automatically every month. Your consent for recurring payments will be requested at checkout. You can cancel auto-renewal at any time to stop the next billing; your access will continue until the already-paid period ends. Refunds are generally not available after a successful payment. Duplicate charges or deductions after a failed payment will be resolved according to gateway verification.',
    verification: isHindi
      ? 'भुगतान की पुष्टि सर्वर द्वारा सत्यापित होने के बाद ही सदस्यता की सुविधाएँ सक्रिय होंगी। भुगतान/रिन्यूअल विफल होने पर सदस्यता-आधारित सुविधाओं का access रोक दिया जाएगा।'
      : 'Membership benefits will activate only after the server verifies the payment. Access to membership-based benefits may be paused if a payment or renewal fails.',
    chatNote: isHindi
      ? 'Private Chat उपलब्ध होने पर यह अतिरिक्त संपर्क माध्यम रहेगा। यह सदस्यता केवल चैटिंग के लिए नहीं है और 24×7 तत्काल जवाब की गारंटी नहीं देती।'
      : 'Private Chat, when available, is an additional contact channel. This membership is not solely for chatting and does not guarantee 24/7 or instant replies.',
    languageLabel: isHindi ? 'भाषा चुनें' : 'Choose language',
  };

  return (
    <main
      className="flex-1 bg-slate-50 select-none"
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
    >
      <section className="relative isolate overflow-hidden bg-[#071326] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_48%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onBackHome}
              className="text-sm font-semibold text-blue-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              {copy.back}
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1 shadow-lg backdrop-blur-md" aria-label={copy.languageLabel}>
              <Globe2 className="ml-2 h-4 w-4 text-blue-200" />
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={isHindi}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${isHindi ? 'bg-white text-slate-950 shadow' : 'text-slate-200 hover:bg-white/10'}`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={!isHindi}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${!isHindi ? 'bg-white text-slate-950 shadow' : 'text-slate-200 hover:bg-white/10'}`}
              >
                English
              </button>
            </div>
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-blue-100 shadow-lg shadow-blue-950/20">
              <ShieldCheck className="h-4 w-4" /> {copy.secure}
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{copy.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-[10px] font-bold tracking-wide text-slate-100 sm:text-xs">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 shadow-lg backdrop-blur"><MessageCircle className="h-4 w-4 text-blue-200" /> {copy.guidance}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 shadow-lg backdrop-blur"><LockKeyhole className="h-4 w-4 text-violet-200" /> {copy.tools}</span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 shadow-lg backdrop-blur"><CalendarClock className="h-4 w-4 text-amber-200" /> {copy.monthly}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-700">{copy.plansKicker}</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.plansTitle}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{copy.plansDesc}</p>
        </div>

        <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border p-6 shadow-md transition-all duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl focus-within:z-10 ${plan.tone}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 ${plan.accent}`} />
              {plan.name === 'Premium' && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-violet-700 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-white shadow-md">
                  <Sparkles className="h-3 w-3" /> {isHindi ? 'लोकप्रिय प्लान' : 'POPULAR PLAN'}
                </span>
              )}
              <div className="flex items-center gap-3 pr-16">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${plan.iconTone}`}>
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className={`text-sm font-black tracking-wide ${plan.label}`}>{plan.name}</div>
              </div>
              <p className="mt-3 min-h-10 text-xs leading-5 text-slate-600">{isHindi ? plan.noteHi : plan.noteEn}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className={`text-3xl font-black tracking-tight ${plan.priceTone}`}>₹{plan.price}</span>
                <span className="pb-1 text-xs text-slate-500">{copy.month}</span>
              </div>
              <div className="my-5 h-px bg-slate-200/80" />
              <ul className="flex-1 space-y-3 text-xs leading-5 text-slate-700">
                <li className="flex gap-2">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} />
                  <span>{copy.guidanceBenefit}</span>
                </li>
                <li className="flex gap-2">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} />
                  <span>{isHindi ? plan.toolHi : plan.toolEn}</span>
                </li>
                <li className="flex gap-2">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} />
                  <span>{copy.chatBenefit}</span>
                </li>
              </ul>
              <button
                type="button"
                disabled
                className={`mt-7 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white opacity-75 shadow-md transition ${plan.buttonTone}`}
              >
                {copy.unavailable} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-xs leading-6 text-amber-950 shadow-sm sm:p-6">
          <strong>{copy.billingTitle}</strong> {copy.billing}
          <p className="mt-2">{copy.verification}</p>
        </div>
        <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">{copy.chatNote}</p>
      </section>
    </main>
  );
};
