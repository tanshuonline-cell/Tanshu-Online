import React from 'react';
import { ArrowLeft, MessageCircle, UserRound } from 'lucide-react';
import { MembershipCheckout } from './MembershipCheckout';

interface Props {
  onBackHome: () => void;
  onViewPlans: () => void;
  onOpenChat: () => void;
}

export const MembershipAccountPage: React.FC<Props> = ({ onBackHome, onViewPlans, onOpenChat }) => (
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
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Google खाते से Login करके अपनी Basic Membership, भुगतान की स्थिति और Auto-Renewal यहाँ देखें या नियंत्रित करें।</p>
      </div>

      <MembershipCheckout />

      <section className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><MessageCircle className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold text-slate-900">Private Admin Chat</h2>
            <p className="text-xs text-slate-500">यह सुविधा अलग चरण में सक्रिय की जाएगी।</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">अभी इस Dashboard में Membership Login, भुगतान स्थिति और Subscription Cancellation पर ध्यान दिया गया है। Private Chat अभी बंद है।</p>
        <button onClick={onOpenChat} className="mt-3 rounded-xl border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">Chat Preview देखें</button>
        <button onClick={onViewPlans} className="ml-2 mt-3 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800">Membership Plans देखें</button>
      </section>
    </div>
  </main>
);
