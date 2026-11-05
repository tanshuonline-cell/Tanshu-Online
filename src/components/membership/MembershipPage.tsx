import React from 'react';
import {
  Check,
  ShieldCheck,
  MessageCircle,
  LockKeyhole,
  CalendarClock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AadhaarBasicGuidance } from './AadhaarBasicGuidance';

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
    noteHi: '₹49 वीडियो + निजी चैट + शामिल चुनिंदा टूल्स और Aadhaar मार्गदर्शन',
    noteEn: '₹49 video + private chat + selected included tools and Aadhaar guidance',
    toolHi: 'वीडियो एक्सेस, Admin से निजी चैट और Basic में शामिल टूल्स',
    toolEn: 'Video access, private Admin chat and included Basic tools',
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
  const { isHindi } = useLanguage();

  const copy = {
    back: isHindi ? '← TANSHU ONLINE पर वापस जाएँ' : '← Back to TANSHU ONLINE',
    secure: isHindi ? 'सुरक्षित सदस्यता पोर्टल' : 'SECURE MEMBERSHIP PORTAL',
    title: 'TANSHU ONLINE MEMBERSHIP',
    intro: isHindi
      ? 'Basic Membership ₹49/month में पहले से उपलब्ध ₹49 Aadhaar वीडियो, Admin से निजी चैट और Basic में शामिल चुनिंदा टूल्स व Aadhaar मार्गदर्शन मिलेगा।'
      : 'Basic Membership ₹49/month includes the existing ₹49 Aadhaar video, private Admin chat, selected included tools and Aadhaar guidance.',
    guidance: isHindi ? 'Aadhaar की जानकारी' : 'AADHAAR INFORMATION',
    tools: isHindi ? 'केवल जानकारी' : 'INFORMATION ONLY',
    monthly: isHindi ? 'मासिक सदस्यता' : 'MONTHLY MEMBERSHIP',
    plansKicker: 'MEMBERSHIP PLANS',
    plansTitle: isHindi ? 'अपनी सदस्यता योजना चुनें' : 'Choose Your Membership Plan',
    plansDesc: isHindi
      ? 'Basic में ₹49 वाला मौजूदा वीडियो, निजी Admin Chat और घोषित Basic tools शामिल होंगे। बाकी योजनाएँ Coming Soon हैं।'
      : 'Basic will include the existing ₹49 video, private Admin Chat and the Basic tools listed before checkout. Other plans are Coming Soon.',
    month: isHindi ? '/ महीना' : '/ month',
    basicAction: isHindi ? 'Aadhaar Guide देखें' : 'View Aadhaar Guide',
    comingSoon: isHindi ? 'Coming Soon' : 'Coming Soon',
    billingTitle: isHindi ? 'लॉन्च और भुगतान की स्थिति:' : 'Launch and payment status:',
    billing: isHindi
      ? 'यह Preview है: Membership checkout, Google Login, private chat backend और recurring payment अभी सक्रिय नहीं हैं। अभी कोई भुगतान या सदस्यता शुरू नहीं होगी। सक्रिय होने पर ₹49/month की recurring billing, अगली renewal, cancellation और शामिल tools checkout से पहले साफ दिखेंगे और आपकी स्पष्ट सहमति ली जाएगी।'
      : 'This is a Preview: Membership checkout, Google Login, private chat backend and recurring payments are not active. No payment or membership can start here. Before activation, ₹49/month recurring billing, renewal, cancellation and included tools will be clearly shown at checkout and require your explicit consent.',
    verification: isHindi
      ? 'किसी भी सदस्यता को तभी सक्रिय किया जाएगा जब सुरक्षित backend भुगतान की पुष्टि कर ले। अभी इस पेज से कोई पैसा नहीं कटेगा।'
      : 'A membership will be activated only after the secure backend verifies payment. This page cannot charge you at this stage.',
    chatNote: isHindi
      ? 'Basic Membership में मौजूदा ₹49 वीडियो का सदस्यता-आधारित एक्सेस, निजी चैट और घोषित Basic tools शामिल होंगे। अलग Video Learning Center से ₹49 का One-Time Purchase केवल वीडियो देगा—Chat या Membership tools नहीं।'
      : 'Basic Membership will include subscription access to the existing ₹49 video, private chat and listed Basic tools. The separate ₹49 One-Time Video Purchase gives video access only—not Chat or Membership tools.',
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
          </div>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-blue-100 shadow-lg shadow-blue-950/20">
              <ShieldCheck className="h-4 w-4" /> {copy.secure}
            </span>
            <h1 className="mt-5 w-max max-w-none whitespace-nowrap text-[clamp(1rem,4.2vw,3.75rem)] font-black tracking-tight">{copy.title}</h1>
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
              {plan.name !== 'Basic' && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-slate-600">COMING SOON</span>
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
              {plan.name === 'Basic' ? (
                <ul className="flex-1 space-y-3 text-xs leading-5 text-slate-700">
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'पहले से उपलब्ध ₹49 Aadhaar वीडियो का एक्सेस' : 'Access to the existing ₹49 Aadhaar video'}</span></li>
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'Admin के साथ वेबसाइट पर निजी Chat' : 'Private Chat with Admin on the website'}</span></li>
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'Basic में शामिल चुनिंदा Tools और Aadhaar मार्गदर्शन' : 'Selected tools included in Basic and Aadhaar guidance'}</span></li>
                </ul>
              ) : (
                <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">{copy.comingSoon}</div>
              )}
              {plan.name === 'Basic' ? (
                <button type="button" onClick={() => document.getElementById('basic-guidance')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white shadow-md transition ${plan.buttonTone}`}>
                  {copy.basicAction} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" disabled className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 py-3 text-xs font-extrabold text-slate-600 opacity-80">{copy.comingSoon}</button>
              )}
            </article>
          ))}
        </div>

        <AadhaarBasicGuidance />

        <div className="mt-10 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-xs leading-6 text-amber-950 shadow-sm sm:p-6">
          <strong>{copy.billingTitle}</strong> {copy.billing}
          <p className="mt-2">{copy.verification}</p>
        </div>
        <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">{copy.chatNote}</p>
      </section>
    </main>
  );
};
