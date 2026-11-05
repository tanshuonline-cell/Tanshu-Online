import React from 'react';
import { ArrowRight, Check, MessageCircle, ShieldCheck, LockKeyhole } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props { onViewPlans: () => void; mode: 'banner' | 'plans'; }
const plans = [
  { name: 'Basic', price: 49, hi: 'शुरुआत करने के लिए', en: 'A simple way to get started' },
  { name: 'Standard', price: 149, hi: 'नियमित सहायता के लिए', en: 'For regular guidance and support' },
  { name: 'Premium', price: 249, hi: 'अधिक सहायता चाहने वालों के लिए', en: 'For members who need more support' },
  { name: 'Professional', price: 499, hi: 'सभी उपलब्ध वेबसाइट टूल्स सहित', en: 'Includes all available website tools' },
];

export const MembershipHomeSection: React.FC<Props> = ({ onViewPlans, mode }) => {
  const { isHindi } = useLanguage();
  if (mode === 'banner') return (
    <section className="bg-[#07152b] px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#102b50] to-indigo-950 p-4 shadow-lg sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300"><MessageCircle className="h-5 w-5" /></span><div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">TANSHU ONLINE MEMBERSHIP</p>
          <h2 className="mt-0.5 text-sm font-extrabold sm:text-base">{isHindi ? 'सरकारी सेवाओं और दस्तावेज़ों का निजी मार्गदर्शन — ₹49/महीना से' : 'Personal guidance for government services and documents — from ₹49/month'}</h2>
          <p className="mt-1 text-[11px] text-blue-100/75">{isHindi ? 'फॉर्म, आवेदन और दस्तावेज़ संबंधी जानकारी; टूल्स की सुविधा चुने गए प्लान के अनुसार।' : 'Guidance for forms, applications and documents, with tools based on the selected plan.'}</p>
        </div></div>
        <button onClick={onViewPlans} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-950 hover:bg-blue-50 sm:w-auto">{isHindi ? 'योजनाएँ देखें' : 'View Plans'} <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
  return (
    <section id="membership-plans" className="scroll-mt-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-800"><ShieldCheck className="h-3.5 w-3.5" />MEMBERSHIP PLANS</span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{isHindi ? 'अपनी सदस्यता योजना चुनें' : 'Choose your membership plan'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{isHindi ? 'हर योजना में सरकारी सेवाओं, दस्तावेज़ों और ऑनलाइन आवेदनों से जुड़ा मार्गदर्शन; टूल्स की पहुँच प्लान के अनुसार।' : 'Plans provide guidance for government services, documents and online applications, with tool access based on the tier.'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => <article key={plan.name} className={`flex min-h-[290px] flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index === 3 ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'}`}>
            <div className="text-sm font-extrabold text-slate-900">{plan.name}</div><p className="mt-1 min-h-8 text-[11px] leading-5 text-slate-500">{isHindi ? plan.hi : plan.en}</p>
            <div className="mt-4 flex items-end gap-1"><span className="text-3xl font-black text-slate-950">₹{plan.price}</span><span className="pb-1 text-[11px] text-slate-500">{isHindi ? '/ महीना' : '/ month'}</span></div><div className="my-4 h-px bg-slate-100" />
            <ul className="flex-1 space-y-2.5 text-[11px] leading-5 text-slate-600">
              <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? 'सरकारी सेवाओं, दस्तावेज़ों और आवेदन की जानकारी व मार्गदर्शन' : 'Guidance for government services, documents and applications'}</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? (index === 0 ? '1–2 चुनिंदा ऑनलाइन टूल्स' : index === 1 ? 'Basic से अधिक चुनिंदा टूल्स' : index === 2 ? 'Standard से अधिक चुनिंदा टूल्स' : 'सभी उपलब्ध वेबसाइट टूल्स') : (index === 0 ? '1–2 selected online tools' : index === 1 ? 'More selected tools than Basic' : index === 2 ? 'More selected tools than Standard' : 'All available website tools')}</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? 'Private Chat उपलब्ध होने पर अतिरिक्त माध्यम; तुरंत जवाब की गारंटी नहीं' : 'Private chat is an additional channel when available; instant replies are not guaranteed'}</li>
            </ul>
            <button onClick={onViewPlans} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold ${index === 3 ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-blue-700'}`}>{isHindi ? 'योजना की जानकारी' : 'Plan Details'} <ArrowRight className="h-3.5 w-3.5" /></button>
          </article>)}
        </div>
        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-600 sm:grid-cols-2"><p className="flex gap-2"><LockKeyhole className="h-4 w-4 shrink-0 text-blue-700" />{isHindi ? 'सदस्यता की सुविधाएँ सर्वर द्वारा भुगतान सत्यापित होने के बाद ही सक्रिय होंगी।' : 'Membership benefits activate only after server-verified payment.'}</p><p className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" />{isHindi ? 'मासिक Auto-renewal; अगली बिलिंग से पहले रद्द कर सकते हैं।' : 'Monthly auto-renewal; cancel before the next billing cycle.'}</p></div>
        <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">{isHindi ? 'यह Preview है। सुरक्षित Login और Payment Backend तैयार होने तक खरीदारी बंद रहेगी। Private Chat उपलब्धता पर निर्भर अतिरिक्त सुविधा है; यह सदस्यता केवल चैटिंग के लिए नहीं है।' : 'Preview only. Purchases stay disabled until secure login and payment are ready. Private chat is an optional additional channel when available, not the sole purpose of membership.'}</p>
      </div>
    </section>
  );
};
