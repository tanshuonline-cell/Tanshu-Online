import React from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export const MembershipCheckout: React.FC = () => (
  <section
    id="basic-checkout"
    className="mx-auto mt-10 max-w-3xl scroll-mt-24 rounded-3xl border border-amber-200 bg-white p-6 shadow-lg sm:p-8"
  >
    <div className="flex items-start gap-3">
      <span className="rounded-xl bg-amber-100 p-3 text-amber-800">
        <LockKeyhole className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
          Membership checkout temporarily locked
        </p>
        <h3 className="mt-1 text-lg font-black text-slate-900">
          ₹49 / month · Basic Membership
        </h3>
      </div>
    </div>
    <p className="mt-4 text-sm leading-6 text-slate-700">
      Cashfree Sandbox checkout अभी सुरक्षा और recurring-consent जाँच पूरी होने तक बंद है।
      इस Preview से अभी कोई नया subscription, UPI AutoPay mandate, payment या Email/SMS
      notification शुरू नहीं किया जा सकता।
    </p>
    <p className="mt-3 text-xs leading-5 text-slate-500">
      Checkout तभी खोला जाएगा जब recurring billing की स्पष्ट सहमति, account security,
      payment verification और membership access के सभी परीक्षण पूरे हो जाएँगे।
    </p>
    <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
      अभी कोई भुगतान या mandate बनाने की आवश्यकता नहीं है।
    </div>
  </section>
);
