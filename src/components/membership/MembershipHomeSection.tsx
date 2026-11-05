import React from 'react';
import { ArrowRight, Check, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props { onViewPlans: () => void; }
const plans = [
  { name: 'Basic', price: 49, hi: 'शुरुआत करने के लिए', en: 'A simple way to get started' },
  { name: 'Standard', price: 149, hi: 'नियमित सहायता के लिए', en: 'For regular guidance and support' },
  { name: 'Premium', price: 249, hi: 'अधिक सहायता चाहने वालों के लिए', en: 'For members who need more support' },
  { name: 'Professional', price: 499, hi: 'सभी उपलब्ध वेबसाइट टूल्स सहित', en: 'Includes all available website tools' },
];

export const MembershipHomeBanner: React.FC<Props> = ({ onViewPlans }) => {
  const { isHindi } = useLanguage();
  return (
    <section className="bg-[#07152b] px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#102b50] to-indigo-950 p-4 shadow-lg sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300"><MessageCircle className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">{isHindi ? 'TANSHU ONLINE सदस्यता' : 'TANSHU ONLINE MEMBERSHIP'}</p>
            <h2 className="mt-0.5 text-sm font-extrabold sm:text-base">{isHindi ? 'Unlimited निजी Admin Chat और सहायता — ₹49/महीना से' : 'Unlimited private Admin chat & support — from ₹49/month'}</h2>
            <p className="mt-1 text-[11px] text-blue-100/75">{isHindi ? 'Text, Photo और PDF के साथ वेबसाइट के अंदर सुरक्षित बातचीत।' : 'Secure conversations on the website with text, photo and PDF.'}</p>
          </div>
        </div>
        <button onClick={onViewPlans} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-950 transition hover:bg-blue-50 sm:w-auto">{isHindi ? 'योजनाएँ देखें' : 'View Plans'} <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
};

export const MembershipHomePlans: React.FC<Props> = ({ onViewPlans }) => {
  const { isHindi } = useLanguage();
  return (
    <section id="membership-plans" className="scroll-mt-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-800"><ShieldCheck className="h-3.5 w-3.5" />{isHindi ? 'सदस्यता योजनाएँ' : 'MEMBERSHIP PLANS'}</span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{isHindi ? 'आपकी सहायता के लिए एक सदस्यता' : 'Membership built around your support needs'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{isHindi ? 'हर योजना में Admin के साथ निजी चैट और जानकारी संबंधी सहायता शामिल है।' : 'Every plan includes private Admin chat and information support.'}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <article key={plan.name} className={`relative flex min-h-[300px] flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${index === 3 ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'}`}>
              {index === 3 && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold text-amber-800"><Sparkles className="h-3 w-3" />{isHindi ? 'टूल्स सहित' : 'TOOLS INCLUDED'}</span>}
              <div className="text-sm font-extrabold text-slate-900">{plan.name}</div>
              <p className="mt-1 min-h-8 pr-2 text-[11px] leading-5 text-slate-500">{isHindi ? plan.hi : plan.en}</p>
              <div className="mt-4 flex items-end gap-1"><span className="text-3xl font-black tracking-tight text-slate-950">₹{plan.price}</span><span className="pb-1 text-[11px] font-medium text-slate-500">{isHindi ? '/ महीना' : '/ month'}</span></div>
              <div className="my-4 h-px bg-slate-100" />
              <ul className="flex-1 space-y-2.5 text-[11px] leading-5 text-slate-600">
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? 'Unlimited निजी Admin Chat' : 'Unlimited private Admin chat'}</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? 'Text, Photo और PDF' : 'Text, photo and PDF'}</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{isHindi ? 'Admin से निजी वीडियो' : 'Private videos from Admin'}</li>
                {index === 3 && <li className="flex gap-2 font-bold text-blue-800"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{isHindi ? 'सभी उपलब्ध वेबसाइट टूल्स' : 'All available website tools'}</li>}
              </ul>
              <button onClick={onViewPlans} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${index === 3 ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-900 text-white hover:bg-blue-700'}`}>{isHindi ? 'योजना की जानकारी' : 'Plan Details'} <ArrowRight className="h-3.5 w-3.5" /></button>
            </article>
          ))}
        </div>
        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-600 sm:grid-cols-2 sm:p-5">
          <div className="flex gap-2"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" /><p>{isHindi ? 'भुगतान की सर्वर-साइड पुष्टि के बाद ही सदस्यता और Chat Access सक्रिय होगा।' : 'Membership and chat access activate only after server-side payment verification.'}</p></div>
          <div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" /><p>{isHindi ? 'मासिक Auto-renewal लागू होगा। अगली बिलिंग से पहले Auto-renewal रद्द किया जा सकता है।' : 'Monthly auto-renewal applies. You can cancel before the next billing cycle.'}</p></div>
        </div>
        <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">{isHindi ? 'यह अभी Preview है। Login और भुगतान Backend तैयार होने तक खरीदारी बंद रहेगी। Admin उपलब्धता के अनुसार जवाब देंगे; 24×7 तत्काल जवाब की गारंटी नहीं है।' : 'Preview only. Purchases remain disabled until secure login and payment services are ready. Admin replies as available; 24×7 instant replies are not guaranteed.'}</p>
      </div>
    </section>
  );
};
