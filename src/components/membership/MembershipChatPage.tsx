import React from 'react';
import { ArrowLeft, LockKeyhole, MessageCircle, Paperclip, Send, ShieldCheck } from 'lucide-react';

interface Props { onBack: () => void; onDashboard: () => void; }

export const MembershipChatPage: React.FC<Props> = ({ onBack, onDashboard }) => (
  <main className="min-h-screen flex-1 bg-slate-50 px-4 py-8 sm:px-6">
    <div className="mx-auto max-w-4xl">
      <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft className="h-4 w-4" /> वापस जाएँ</button>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-[#0A1324] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white/10 p-2.5"><MessageCircle className="h-5 w-5" /></span>
            <div><h1 className="font-bold">Private Admin Chat</h1><p className="mt-0.5 text-[11px] text-slate-300">TANSHU ONLINE Membership Support</p></div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-100"><LockKeyhole className="h-3 w-3" /> Locked Preview</span>
        </header>
        <div className="flex min-h-[360px] flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
          <span className="rounded-2xl bg-blue-100 p-4 text-blue-700"><ShieldCheck className="h-8 w-8" /></span>
          <h2 className="mt-5 text-lg font-extrabold text-slate-900">निजी चैट सुरक्षित रूप से जल्द उपलब्ध होगी</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">Chat केवल Google से सत्यापित और सक्रिय सदस्यता वाले ग्राहक को मिलेगी। इस Preview में वास्तविक संदेश, ग्राहक डेटा या फाइलें लोड नहीं की जातीं।</p>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600">Backend तैयार होने पर Text, Photo और PDF दोनों तरफ भेजे जा सकेंगे। Admin निजी वीडियो भी भेज सकेंगे।</div>
          <button onClick={onDashboard} className="mt-6 rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800">Dashboard पर जाएँ</button>
        </div>
        <footer className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-400">
            <Paperclip className="h-4 w-4" /><span className="flex-1 text-xs">संदेश और attachment भेजना अभी बंद है</span><Send className="h-4 w-4" />
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-400">Chat access server-side membership verification के बाद ही खुलेगा।</p>
        </footer>
      </section>
    </div>
  </main>
);
