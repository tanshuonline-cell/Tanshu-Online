import React from 'react';
import { Check, ShieldCheck, MessageCircle, LockKeyhole, CalendarClock, ArrowRight } from 'lucide-react';

interface Props {
  onBackHome: () => void;
  onSignIn: () => void;
}

const plans = [
  { name: 'Basic', price: 49, tone: 'border-slate-200', note: 'शुरुआत करने के लिए' },
  { name: 'Standard', price: 149, tone: 'border-blue-200', note: 'नियमित सहायता के लिए' },
  { name: 'Premium', price: 249, tone: 'border-violet-200', note: 'अधिक सहायता चाहने वालों के लिए' },
  { name: 'Professional', price: 499, tone: 'border-amber-300', note: 'सभी उपलब्ध वेबसाइट टूल्स और सुविधाओं सहित' },
];

export const MembershipPage: React.FC<Props> = ({ onBackHome, onSignIn }) => {
  return (
    <main className="flex-1 bg-slate-50">
      <section className="relative overflow-hidden bg-[#0A1324] text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <button onClick={onBackHome} className="mb-7 text-sm font-semibold text-blue-200 hover:text-white">← TANSHU ONLINE पर वापस जाएँ</button>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
              <ShieldCheck className="h-4 w-4" /> सुरक्षित सदस्यता पोर्टल
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">TANSHU ONLINE Membership</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              सदस्य बनें और वेबसाइट के अंदर Admin के साथ निजी चैट के माध्यम से जानकारी और सहायता प्राप्त करें।
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"><MessageCircle className="h-4 w-4" /> निजी Admin Chat</span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"><LockKeyhole className="h-4 w-4" /> निजी संदेश और फाइलें</span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2"><CalendarClock className="h-4 w-4" /> मासिक सदस्यता</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Membership Plans</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">अपनी सदस्यता योजना चुनें</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">सभी योजनाओं में Admin के साथ निजी चैट और जानकारी संबंधी सहायता शामिल है।</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className={`flex flex-col rounded-2xl border ${plan.tone} bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
              <div className="text-sm font-bold text-slate-800">{plan.name}</div>
              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{plan.note}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-black tracking-tight text-slate-950">₹{plan.price}</span>
                <span className="pb-1 text-xs text-slate-500">/ महीना</span>
              </div>
              <div className="my-5 h-px bg-slate-100" />
              <ul className="flex-1 space-y-3 text-xs leading-5 text-slate-600">
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Admin के साथ निजी चैट</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Text, Photo और PDF भेजें</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Admin से निजी वीडियो प्राप्त कर सकते हैं</li>
                {plan.name === 'Professional' && <li className="flex gap-2 font-semibold text-blue-700"><Check className="mt-0.5 h-4 w-4 shrink-0" /> वेबसाइट के सभी उपलब्ध टूल्स और सुविधाएँ</li>}
              </ul>
              <button disabled className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 py-3 text-xs font-bold text-slate-600 cursor-not-allowed">
                सदस्यता जल्द शुरू होगी <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <div className="mt-9 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-950">
          <strong>मासिक ऑटो-रिन्यूअल और भुगतान की जरूरी जानकारी:</strong> सदस्यता हर महीने अपने आप रिन्यू होगी। चेकआउट के समय recurring payment की सहमति ली जाएगी। आप अगली बिलिंग रोकने के लिए auto-renewal कभी भी cancel कर सकते हैं; पहले से भुगतान की गई अवधि समाप्त होने तक चालू रहेगी। सफल भुगतान के बाद सामान्यतः refund उपलब्ध नहीं होगा; duplicate payment या असफल भुगतान में राशि कटने पर gateway verification के अनुसार समाधान होगा।
          <p className="mt-2">भुगतान की पुष्टि सर्वर द्वारा सत्यापित होने के बाद ही सदस्यता और Chat Access सक्रिय होगा। भुगतान/रिन्यूअल विफल होने पर Chat Access तुरंत रुक जाएगा।</p>
        </div>
        <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">Admin उपलब्धता के अनुसार जवाब देंगे। यह सेवा 24×7 तत्काल जवाब की गारंटी नहीं देती।</p>
      </section>
    </main>
  );
};
