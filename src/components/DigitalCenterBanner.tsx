import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const DigitalCenterBanner: React.FC = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-11">
    <style>{`
      @keyframes digital-center-orbit {
        0% { background-position: 0% 50%; transform: rotate(0deg); }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; transform: rotate(360deg); }
      }
      @keyframes digital-center-wave {
        0%, 100% { transform: translateX(-2%) scaleY(.92); opacity: .55; }
        50% { transform: translateX(2%) scaleY(1.08); opacity: .95; }
      }
      .digital-center-frame { position: relative; isolation: isolate; border-radius: 26px; padding: 2px; background: conic-gradient(from 0deg, #22d3ee, #6366f1, #c084fc, #f472b6, #22d3ee); background-size: 200% 200%; animation: digital-center-orbit 9s linear infinite; box-shadow: 0 10px 34px rgba(59,130,246,.14), 0 0 24px rgba(34,211,238,.13); }
      .digital-center-inner { position: relative; overflow: hidden; border-radius: 24px; background: radial-gradient(ellipse at 10% 0%, rgba(34,211,238,.12), transparent 42%), radial-gradient(ellipse at 90% 100%, rgba(192,132,252,.14), transparent 45%), linear-gradient(115deg,#08172f,#102b50 55%,#111b3d); }
      .digital-center-inner::before { content: ""; position: absolute; inset: -60% -20%; pointer-events: none; background: linear-gradient(110deg, transparent 42%, rgba(255,255,255,.10) 49%, transparent 56%); animation: digital-center-wave 5s ease-in-out infinite; }
      .digital-center-inner::after { content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit; background: linear-gradient(90deg,rgba(34,211,238,.08),transparent 30%,transparent 70%,rgba(192,132,252,.08)); }
      @media (prefers-reduced-motion: reduce) { .digital-center-frame, .digital-center-inner::before { animation: none; } }
    `}</style>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <a href="/digital-seva" aria-label="Open Tanshu Digital Center" className="digital-center-frame block group focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60">
        <div className="digital-center-inner px-5 py-7 sm:px-9 sm:py-9 text-center">
          <div className="relative z-10 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-bold tracking-[.2em] text-cyan-100 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> One Stop Digital Services
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              TANSHU <span className="text-cyan-300">DIGITAL CENTER</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-blue-100">
              काम Tanshu Digital सेवाओं से करवाइए — सरकारी सेवाएँ, योजनाएँ और रोज़मर्रा के डिजिटल काम एक ही जगह।
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
              Digital Center खोलें <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </div>
  </section>
);
