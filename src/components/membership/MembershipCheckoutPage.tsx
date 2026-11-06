import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { MembershipCheckout } from './MembershipCheckout';

interface Props {
  onBackToPlans: () => void;
  onBackHome: () => void;
}

export const MembershipCheckoutPage: React.FC<Props> = ({ onBackToPlans, onBackHome }) => (
  <main className="min-h-screen flex-1 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBackToPlans} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Membership Plans पर वापस जाएँ
        </button>
        <button type="button" onClick={onBackHome} className="text-xs font-semibold text-slate-500 transition hover:text-blue-700">
          TANSHU ONLINE Home
        </button>
      </div>

      <section className="overflow-hidden rounded-3xl bg-[#071326] px-6 py-7 text-white shadow-lg sm:px-9 sm:py-9">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-blue-100">
          <ShieldCheck className="h-4 w-4" /> SECURE MEMBERSHIP CHECKOUT
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Basic Membership · ₹49/month</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          अपनी Basic Membership के लिए सुरक्षित Checkout यहाँ पूरा करें। भुगतान और recurring mandate की स्थिति Cashfree से सत्यापित होने के बाद ही Membership सक्रिय होगी।
        </p>
      </section>

      <MembershipCheckout />

      <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-5 text-slate-500">
        यह Sandbox Preview है। अभी कोई Live payment चालू नहीं है। Checkout आगे बढ़ाने से पहले Cashfree पर दिखाई गई राशि और AutoPay mandate की शर्तें ध्यान से पढ़ें।
      </p>
    </div>
  </main>
);
