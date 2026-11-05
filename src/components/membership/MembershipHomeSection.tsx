import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, LockKeyhole } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props { onViewPlans: () => void; mode: 'banner' | 'plans'; }

const plans = [
  { name: 'Basic', price: 49, hi: 'निजी Chat + सरकारी सेवाओं की जानकारी और मार्गदर्शन', en: 'Private Chat + information and guidance on government services' },
  { name: 'Standard', price: 149, hi: 'जल्द उपलब्ध होगा', en: 'Coming soon' },
  { name: 'Premium', price: 249, hi: 'जल्द उपलब्ध होगा', en: 'Coming soon' },
  { name: 'Professional', price: 499, hi: 'जल्द उपलब्ध होगा', en: 'Coming soon' },
];

export const MembershipHomeSection: React.FC<Props> = ({ onViewPlans, mode }) => {
  const { isHindi } = useLanguage();

  if (mode === 'banner') return (
    <section className="bg-[#07152b] px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#102b50] to-indigo-950 p-4 shadow-lg sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300"><MessageCircle className="h-5 w-5" /></span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">TANSHU ONLINE MEMBERSHIP</p>
            <h2 className="mt-0.5 text-sm font-extrabold sm:text-base">{isHindi ? 'Basic Membership — ₹49/महीना' : 'Basic Membership — ₹49/month'}</h2>
            <p className="mt-1 text-[11px] text-blue-100/75">{isHindi ? 'निजी Chat, सरकारी सेवाओं की जानकारी और उपयोगी मार्गदर्शन।' : 'Private Chat, government-service information and useful guidance.'}</p>
          </div>
        </div>
        <button onClick={onViewPlans} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-blue-950 hover:bg-blue-50 sm:w-auto">{isHindi ? 'Basic प्लान देखें' : 'View Basic Plan'} <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );

  return (
    <section id="membership-plans" className="scroll-mt-24 bg-gradient-to-b from-slate-50 via-white to-blue-50/50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-800"><ShieldCheck className="h-3.5 w-3.5" />MEMBERSHIP PLANS</span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{isHindi ? 'Basic Membership: निजी Chat + सरकारी सेवाओं का मार्गदर्शन' : 'Basic Membership: Private Chat + Government Service Guidance'}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{isHindi ? 'अपनी समस्या और परिस्थिति बताकर निजी Chat में सवाल पूछें। आधार में पिता/पति के नाम या एड्रेस से जुड़ी उलझन हो, अपने दस्तावेजों के आधार पर प्रक्रिया समझनी हो या किसी अन्य सरकारी सेवा की जानकारी चाहिए—आपको उपलब्ध आधिकारिक नियमों के अनुसार स्टेप-बाय-स्टेप मार्गदर्शन मिलेगा। संबंधित विषयों पर उपयोगी वीडियो भी उपलब्ध हो सकते हैं।' : 'Ask questions in private Chat and explain your situation. Whether you have a concern about a father’s/husband’s name or address in Aadhaar, need to understand a process using your own documents, or want information about another government service, get step-by-step guidance based on available official rules. Helpful videos on relevant topics may also be available.'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <article key={plan.name} className={`flex min-h-[250px] flex-col rounded-2xl border bg-white p-5 shadow-sm ${index === 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 opacity-90'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-900">{plan.name}</div>
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>{index === 0 ? (isHindi ? 'पहला प्लान' : 'FIRST PLAN') : 'COMING SOON'}</span>
              </div>
              <p className="mt-3 min-h-12 text-[11px] leading-5 text-slate-600">{isHindi ? plan.hi : plan.en}</p>
              <div className="mt-4 flex items-end gap-1"><span className="text-3xl font-black text-slate-950">₹{plan.price}</span><span className="pb-1 text-[11px] text-slate-500">{isHindi ? '/ महीना' : '/ month'}</span></div>
              <div className="my-4 h-px bg-slate-100" />
              {index === 0 ? (
                <div className="flex-1 text-[11px] leading-5 text-slate-600">{isHindi ? 'आधार में पिता/पति के नाम से जुड़ी समस्या, नाम में मिसमैच, पिता के दस्तावेज उपलब्ध न होना या केवल एड्रेस बदलने की जरूरत—इन परिस्थितियों में संभावित विकल्प, जरूरी दस्तावेज और सही आधिकारिक प्रक्रिया समझें। PAN Card, Voter ID, Birth Certificate, Ration Card तथा बिहार सरकार और अन्य सरकारी सेवाओं की जानकारी भी पूछें। संबंधित विषयों के छोटे वीडियो उपलब्ध हो सकते हैं।' : 'Understand possible options, required documents and official procedures for concerns about a father’s/husband’s name in Aadhaar, name mismatches, unavailable parent documents or an address-only update. You can also ask about PAN Card, Voter ID, Birth Certificate, Ration Card, Bihar Government services and other public services. Short videos on relevant topics may be available.'}</div>
              ) : (
                <div className="flex-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500">{isHindi ? 'इस योजना का विवरण बाद में आएगा।' : 'Plan details will be added later.'}</div>
              )}
              {index === 0 ? (
                <button onClick={onViewPlans} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-800">{isHindi ? 'Basic की जानकारी' : 'Basic Details'} <ArrowRight className="h-3.5 w-3.5" /></button>
              ) : (
                <button type="button" disabled className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-500">Coming Soon</button>
              )}
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-5 text-blue-950">
          <strong>{isHindi ? 'सिर्फ वीडियो खरीदना चाहते हैं?' : 'Want to buy only the video?'}</strong>{' '}
          {isHindi
            ? 'Video Learning Center में ₹49 का One-Time Video Purchase अलग रहेगा: एक बार भुगतान पर सिर्फ वीडियो एक्सेस मिलेगा, Membership Chat या Basic Tools नहीं।'
            : 'The ₹49 One-Time Video Purchase in Video Learning Center remains separate: one payment gives video access only, not Membership Chat or Basic Tools.'}
        </div>

        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-600 sm:grid-cols-2">
          <p className="flex gap-2"><LockKeyhole className="h-4 w-4 shrink-0 text-blue-700" />{isHindi ? 'Basic ₹49 Membership का Sandbox checkout परीक्षणाधीन है; कोई Live भुगतान नहीं होगा।' : 'Basic ₹49 Membership Sandbox checkout is being tested; no live payment will be collected.'}</p>
          <p className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-blue-700" />{isHindi ? 'आधार नंबर, OTP या दस्तावेज़ यहाँ साझा न करें। आवेदन UIDAI के official portal/app/centre से करें।' : 'Do not share Aadhaar numbers, OTPs or documents here. Apply through UIDAI official channels.'}</p>
        </div>
      </div>
    </section>
  );
};
