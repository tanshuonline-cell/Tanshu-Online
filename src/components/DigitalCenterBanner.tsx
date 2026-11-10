import React from 'react';
import { TANSHU_PROFILE_PHOTO } from './Header';

const DIGITAL_SEVA_URL = 'https://52868321.tanshu-online.pages.dev/digital-seva';

export const DigitalCenterBanner: React.FC = () => (
  <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-label="Tanshu Digital Center">
    <style>{`
      @property --digital-seva-angle {
        syntax: "<angle>";
        inherits: false;
        initial-value: 0deg;
      }
      @keyframes digital-seva-border-rotate {
        to { --digital-seva-angle: 360deg; }
      }
      .digital-seva-entry-card {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        border: 1px solid #e5d5b5;
        box-shadow: 0 18px 34px -18px rgba(15,23,42,.34), 0 5px 12px rgba(167,124,52,.12);
        transition: box-shadow .25s ease, border-color .25s ease;
      }
      .digital-seva-entry-card::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        padding: 2px;
        border-radius: inherit;
        background: conic-gradient(from var(--digital-seva-angle), transparent 0 62%, #c79a43 72%, #fff0b8 79%, #9c6b24 86%, transparent 96%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        animation: digital-seva-border-rotate 4.4s linear infinite;
      }
      .digital-seva-entry-card > div,
      .digital-seva-entry-card > span { position: relative; z-index: 1; }
      .digital-seva-entry-card:hover {
        border-color: #c79a43;
        box-shadow: 0 22px 40px -17px rgba(15,23,42,.38), 0 7px 18px rgba(167,124,52,.18);
      }
      @media (prefers-reduced-motion: reduce) {
        .digital-seva-entry-card::before { animation: none; }
        .digital-seva-entry-card { transition: none; }
      }
    `}</style>
    <a href={DIGITAL_SEVA_URL} className="digital-seva-entry-card group flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="flex items-start gap-4">
        <img src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" className="h-14 w-14 shrink-0 rounded-full border-2 border-amber-300 object-cover object-center shadow-md" />
        <div>
          <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest text-rose-800">Independent Digital Assistance</span>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">TANSHU DIGITAL CENTER</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Get government service and document work done through Tanshu Digital Seva assistance. Choose a service, submit your request and required documents, and our team will guide the process.</p>
          <p className="mt-1 text-sm font-medium text-slate-500">सरकारी सेवा या दस्तावेज़ संबंधी काम Tanshu Digital सेवाओं से करवाइए। सेवा चुनें और अनुरोध के साथ ज़रूरी दस्तावेज़ जमा करें। हमारी टीम आगे की प्रक्रिया में आपकी सहायता करेगी।</p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-rose-900 px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-rose-800 sm:self-center">Digital Seva Center खोलें <span aria-hidden="true">→</span></span>
    </a>
  </section>
);
