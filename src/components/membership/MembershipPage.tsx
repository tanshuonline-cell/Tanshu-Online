import React from 'react';
import {
  Check,
  ShieldCheck,
  MessageCircle,
  LockKeyhole,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AadhaarBasicGuidance } from './AadhaarBasicGuidance';
import { MembershipCheckout } from './MembershipCheckout';

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
    noteHi: 'निजी Chat, Aadhaar मार्गदर्शन और सरकारी सेवाओं की जानकारी',
    noteEn: 'Private Chat, Aadhaar guidance and government-service information',
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
    noteHi: 'जल्द उपलब्ध होगा',
    noteEn: 'Coming soon',
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
    noteHi: 'जल्द उपलब्ध होगा',
    noteEn: 'Coming soon',
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
    noteHi: 'जल्द उपलब्ध होगा',
    noteEn: 'Coming soon',
  },
];

export const MembershipPage: React.FC<Props> = ({ onBackHome }) => {
  const { isHindi } = useLanguage();

  const copy = {
    back: isHindi ? '← TANSHU ONLINE पर वापस जाएँ' : '← Back to TANSHU ONLINE',
    secure: isHindi ? 'सुरक्षित सदस्यता पोर्टल' : 'SECURE MEMBERSHIP PORTAL',
    title: 'TANSHU ONLINE MEMBERSHIP',
    intro: isHindi
      ? 'Basic Membership ₹49/महीना में Aadhaar और सरकारी सेवाओं से जुड़ी जानकारी व मार्गदर्शन तथा Basic Tools का इस्तेमाल कर सकते हैं। Admin के साथ वेबसाइट पर निजी Chat की सुविधा शुरू होने पर मिल सकती है। आधार में पिता/पति के नाम से जुड़ी परेशानी, नाम में अंतर, माता-पिता के दस्तावेज उपलब्ध न होने या केवल एड्रेस बदलने जैसी स्थिति में अपनी परिस्थिति के अनुसार मार्गदर्शन पूछें.'
      : 'Basic Membership at ₹49/month provides Aadhaar and government-service information and guidance, along with access to Basic Tools. Private website Chat with Admin may be available once the feature is launched. Ask for guidance based on your situation, including concerns about a father’s or husband’s name, name mismatches, unavailable parent documents or an address-only change.',
    guidance: isHindi ? 'निजी मार्गदर्शन' : 'PRIVATE GUIDANCE',
    tools: isHindi ? 'Basic Tools का इस्तेमाल' : 'USE BASIC TOOLS',
    monthly: isHindi ? 'मासिक सदस्यता' : 'MONTHLY MEMBERSHIP',
    plansKicker: 'MEMBERSHIP PLANS',
    plansTitle: isHindi ? 'अपनी सदस्यता योजना चुनें' : 'Choose Your Membership Plan',
    plansDesc: isHindi
      ? 'Basic Membership में निजी Chat के जरिए अपनी समस्या पूछें। Aadhaar के अलावा PAN Card, Voter ID, Birth Certificate, Ration Card, बिहार सरकार और अन्य सार्वजनिक सेवाओं की जानकारी भी पूछ सकते हैं। संबंधित विषयों पर उपयोगी छोटे वीडियो उपलब्ध हो सकते हैं।'
      : 'Ask about your situation through private Chat in Basic Membership. You can also ask about PAN Card, Voter ID, Birth Certificate, Ration Card, Bihar Government and other public services. Helpful short videos on relevant topics may also be available.',
    month: isHindi ? '/ महीना' : '/ month',
    payNow: isHindi ? 'अभी भुगतान करें' : 'Pay Now',
    detailsGuide: isHindi ? 'जानकारी / गाइड' : 'Details / Guide',
    backToBasic: isHindi ? '← Basic Membership पर वापस जाएँ' : '← Back to Basic Membership',
    comingSoon: isHindi ? 'जल्द उपलब्ध होगा' : 'Coming Soon',
    billingTitle: isHindi ? 'भुगतान और सदस्यता:' : 'Payment and membership:',
    billing: isHindi
      ? 'Basic ₹49/month के लिए Cashfree Sandbox Checkout उपलब्ध है। यह केवल परीक्षण वातावरण है; वास्तविक ग्राहक भुगतान या Production billing शुरू नहीं होगी। Standard, Premium और Professional अभी बंद हैं।'
      : 'Basic ₹49/month Cashfree Sandbox Checkout is available for controlled testing only. This is not live billing; real customer payments and Production billing remain disabled. Standard, Premium and Professional remain unavailable.',
    verification: isHindi
      ? 'Google Login, सत्यापित मोबाइल नंबर और recurring payment की स्पष्ट सहमति आवश्यक है। Membership केवल Cashfree से सत्यापित सफल recurring payment के बाद सक्रिय होगी।'
      : 'Google Login, a verified mobile number and explicit recurring-payment consent are required. Membership activates only after Cashfree confirms a successful recurring payment.',
    chatNote: isHindi
      ? 'Basic Membership और ₹49 One-Time Video Purchase अलग हैं। One-Time Purchase में सिर्फ वीडियो मिलेगा—निजी Chat या Basic Tools नहीं।'
      : 'Basic Membership and the ₹49 One-Time Video Purchase are separate. One-Time Purchase provides video access only—not private Chat or Basic Tools.',
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
            <button onClick={onBackHome} className="text-sm font-semibold text-blue-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
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
            <article id={plan.name === 'Basic' ? 'basic-membership-plan' : undefined} key={plan.name} className={`group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border p-6 shadow-md transition-all duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl focus-within:z-10 ${plan.tone}`}>
              <div className={`absolute inset-x-0 top-0 h-1.5 ${plan.accent}`} />
              {plan.name !== 'Basic' && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-slate-600">COMING SOON</span>}
              <div className="flex items-center gap-3 pr-16">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${plan.iconTone}`}><ShieldCheck className="h-5 w-5" /></span>
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
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'Admin के साथ वेबसाइट पर निजी Chat की सुविधा शुरू होने पर मिल सकती है।' : 'Private website Chat with Admin may be available once the feature is launched.'}</span></li>
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'Aadhaar और सरकारी सेवाओं से जुड़ी जानकारी व मार्गदर्शन' : 'Aadhaar and government-service information and guidance'}</span></li>
                  <li className="flex gap-2"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.label}`} /><span>{isHindi ? 'Basic Tools का इस्तेमाल कर सकते हैं।' : 'You can use Basic Tools.'}</span></li>
                </ul>
              ) : (
                <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">{copy.comingSoon}</div>
              )}
              {plan.name === 'Basic' ? (
                <div className="mt-7 grid grid-cols-1 gap-2">
                  <button type="button" onClick={() => document.getElementById('basic-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white shadow-md transition ${plan.buttonTone}`}>
                    {copy.payNow} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => document.getElementById('basic-guidance')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800">
                    {copy.detailsGuide}
                  </button>
                </div>
              ) : (
                <button type="button" disabled className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 py-3 text-xs font-extrabold text-slate-600 opacity-80">{copy.comingSoon}</button>
              )}
            </article>
          ))}
        </div>

        <MembershipCheckout />
        <AadhaarBasicGuidance />
        <div className="mx-auto mt-4 max-w-3xl text-center">
          <button type="button" onClick={() => document.getElementById('basic-membership-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm transition hover:bg-blue-50">
            {copy.backToBasic}
          </button>
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
