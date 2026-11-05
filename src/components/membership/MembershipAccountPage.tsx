import React from 'react';
import { ArrowLeft, MessageCircle, CreditCard, ShieldCheck, UserRound, LockKeyhole, Clock3 } from 'lucide-react';

interface Props {
  onBackHome: () => void;
  onViewPlans: () => void;
}

export const MembershipAccountPage: React.FC<Props> = ({ onBackHome, onViewPlans }) => (
  <main className="min-h-screen flex-1 bg-slate-50 px-4 py-10 sm:px-6">
    <div className="mx-auto max-w-5xl">
      <button onClick={onBackHome} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" /> वेबसाइट पर वापस जाएँ
      </button>
      <div className="rounded-3xl bg-[#0A1324] p-6 text-white shadow-lg sm:p-9">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-white/10 p-3"><UserRound className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Customer Account</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Membership Dashboard</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">यहाँ Google खाते से जुड़ी सदस्यता, भुगतान की स्थिति, Renewal और Admin के साथ निजी चैट उपलब्ध होगी।</p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-blue-700"><ShieldCheck className="h-5 w-5" /></span>
            <div><h2 className="font-bold text-slate-900">Google Sign-In</h2><p className="text-xs text-slate-500">सुरक्षित अकाउंट पहचान</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Google OAuth की सर्वर-साइड configuration पूरी होने के बाद आपका verified नाम, ईमेल और प्रोफाइल फोटो यहाँ दिखाई देंगे।</p>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Login अभी सेटअप में है। इस Preview में कोई नकली Login या Customer data नहीं दिखाया जाता।</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-50 p-3 text-violet-700"><CreditCard className="h-5 w-5" /></span>
            <div><h2 className="font-bold text-slate-900">Membership & Payments</h2><p className="text-xs text-slate-500">Plan, renewal और payment history</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Active plan, अगली renewal date, auto-renewal cancellation, payment history और expiry के बाद renewal विकल्प इस सेक्शन में होंगे।</p>
          <button onClick={onViewPlans} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Membership Plans देखें <ArrowLeft className="h-4 w-4 rotate-180" /></button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><MessageCircle className="h-5 w-5" /></span>
            <div><h2 className="font-bold text-slate-900">Private Admin Chat</h2><p className="text-xs text-slate-500">Text, Photo, PDF और Admin videos</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">सक्रिय और सत्यापित सदस्यता पर ही निजी चैट खुलेगी। Expired, payment-failed या suspended account से चैट और attachments का access बंद रहेगा।</p>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs font-semibold text-slate-600"><LockKeyhole className="h-4 w-4" /> Chat access अभी backend setup तक locked है।</div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-amber-50 p-3 text-amber-700"><Clock3 className="h-5 w-5" /></span>
            <div><h2 className="font-bold text-slate-900">Account & Expiry Status</h2><p className="text-xs text-slate-500">Membership history सुरक्षित रहेगी</p></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Membership समाप्त होने के बाद भी यह Dashboard उपलब्ध रहेगा। पुरानी चैट ग्राहक को दोबारा नहीं दिखाई जाएगी; Admin के पास रिकॉर्ड सुरक्षित रहेगा।</p>
        </section>
      </div>
      <p className="mt-6 text-center text-xs leading-5 text-slate-500">यह Preview UI है। वास्तविक account data, payment actions और chat केवल secure backend जुड़ने के बाद सक्रिय होंगे।</p>
    </div>
  </main>
);
