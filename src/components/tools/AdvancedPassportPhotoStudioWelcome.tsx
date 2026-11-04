import React, { useState } from 'react';
import {
  ArrowRight, Camera, CheckCircle2, Crop, Download, Eraser, ImagePlus,
  Layers, LayoutGrid, Monitor, Move, Palette, PenTool, Printer, ShieldCheck,
  Smartphone, Sparkles, WandSparkles, ZoomIn, Copy, Trash2
} from 'lucide-react';

interface Props {
  onStart: () => void;
}

const PortraitArtwork: React.FC<{ background: string; muted?: boolean }> = ({ background, muted = false }) => (
  <svg viewBox="0 0 240 300" className="h-full w-full" role="img" aria-label="Illustrative passport photo sample">
    <rect width="240" height="300" fill={background} />
    {muted && <path d="M0 35h240M0 70h240M0 105h240M0 140h240M0 175h240M0 210h240M0 245h240M0 280h240" stroke="#94a3b8" strokeOpacity=".18" />}
    <path d="M35 300c7-62 38-91 85-91s78 29 85 91" fill="#243b53" />
    <path d="M82 221l38 37 38-37-13-22h-50z" fill="#f0c6a4" />
    <ellipse cx="120" cy="128" rx="61" ry="78" fill="#e9b995" />
    <path d="M59 126c-5-57 21-93 64-93 42 0 65 30 59 91-9-16-16-30-19-48-20 17-57 27-103 25z" fill="#263447" />
    <path d="M61 119c-12-7-16 7-10 23 4 12 10 16 16 13M179 119c12-7 16 7 10 23-4 12-10 16-16 13" fill="#e9b995" />
    <path d="M91 129h15M134 129h15" stroke="#513d35" strokeWidth="4" strokeLinecap="round" />
    <path d="M119 137l-5 25h12" stroke="#bd8e73" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M101 178c11 9 27 9 38 0" stroke="#9d5d59" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M88 111c7-7 17-9 25-5M129 106c9-4 19-2 25 5" stroke="#263447" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const SignatureArtwork: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <svg viewBox="0 0 320 110" className="h-full w-full" role="img" aria-label="Illustrative signature sample">
    <path d="M18 73c18-35 25-43 29-35 4 8-14 46-8 47 6 1 24-37 31-36 7 1-4 30 4 31 9 1 22-27 31-28 8-1-4 24 4 27 9 3 23-23 32-23 10 0 0 20 10 22 11 2 23-19 33-20 9-1 1 18 10 19 9 1 22-12 31-19 12-10 18-12 22-7 4 5-4 19 4 22 9 3 19-5 29-14" fill="none" stroke={light ? '#f8fafc' : '#172554'} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 91c78 7 174 4 264-5" stroke={light ? '#cbd5e1' : '#64748b'} strokeWidth="1.5" fill="none" />
  </svg>
);



const BEAUTY_DEMO_PHOTO = 'https://images.unsplash.com/photo-1658724683584-2ab54d31d180?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000';

const SampleScroller: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-h-[390px] space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-slate-100 p-3 pr-2 shadow-inner [scrollbar-color:#64748b_#e2e8f0] [scrollbar-width:thin]">
    {children}
  </div>
);

const SampleHeading: React.FC<{ index: string; title: string }> = ({ index, title }) => (
  <div className="mb-2 flex items-center justify-between gap-2">
    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sample {index}</span>
    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">{title}</span>
  </div>
);

export const AdvancedPassportPhotoStudioWelcome: React.FC<Props> = ({ onStart }) => {
  const [comparison, setComparison] = useState(54);
  const [paper, setPaper] = useState<'4x6' | 'A4'>('4x6');
  const [copies, setCopies] = useState(8);
  const [signatureBg, setSignatureBg] = useState<'transparent' | 'white' | 'blue'>('transparent');

  const copyOptions = paper === '4x6' ? [4, 8, 12] : [4, 8, 12, 20, 24];
  const slots = Math.min(copies, paper === '4x6' ? 12 : 24);

  return (
    <main className="w-full bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07152f]/95 px-4 py-2.5 text-white shadow-lg backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5">
          <img
            src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg"
            alt="Tanshu Online"
            className="h-9 w-9 rounded-full border-2 border-blue-400 object-cover shadow-md sm:h-10 sm:w-10"
          />
          <div className="flex items-center gap-1 font-sans tracking-tight">
            <span className="text-base font-black tracking-wide text-white sm:text-lg">TANSHU</span>
            <span className="text-base font-black tracking-wide text-blue-300 sm:text-lg">ONLINE</span>
          </div>
          <span className="hidden text-xs font-medium text-blue-100/80 sm:block">Photo &amp; Signature Studio</span>
          <button onClick={onStart} className="ml-auto inline-flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-amber-200/30 bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-950 shadow-md shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:from-amber-300 hover:to-yellow-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-200/60 sm:px-3 sm:text-xs">
            Next Page <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#07152f] via-[#102d58] to-[#155e91] px-4 py-9 text-white sm:px-8 sm:py-12 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/4 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <h1 className="whitespace-nowrap rounded-2xl border border-cyan-100/20 bg-gradient-to-r from-white/10 via-blue-300/10 to-violet-300/10 px-3 py-2 text-[clamp(0.68rem,3.2vw,2rem)] font-black leading-tight tracking-[.035em] text-white shadow-xl shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-100/40 hover:shadow-cyan-950/30">
              PROFESSIONAL PHOTO &amp; SIGNATURE STUDIO
            </h1>
            <span className="rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-emerald-100">MOBILE & DESKTOP READY</span>
          </div>
          <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_.96fr]">
            <div>
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-cyan-200 sm:text-xs">PHOTO · SIGNATURE · BACKGROUND · PRINT PROCESSING</p>
              <p className="mt-3 inline-flex max-w-full rounded-xl border border-cyan-200/20 bg-gradient-to-r from-cyan-300/15 via-blue-300/15 to-violet-300/15 px-3 py-2 text-lg font-extrabold text-cyan-50 shadow-lg shadow-blue-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-100/40 hover:shadow-cyan-950/30 sm:text-xl">पासपोर्ट फोटो और सिग्नेचर — सब एक ही जगह</p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/85 sm:text-base">
                पासपोर्ट फोटो तैयार करें, बैकग्राउंड बदलें, सिग्नेचर साफ करें और 4×6 या A4 प्रिंट शीट बनाएँ। मोबाइल और कंप्यूटर दोनों पर आसानी से इस्तेमाल करें।
              </p>
              <div className="mt-6 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { icon: Camera, title: 'Passport Photo', sub: 'फोटो एडिटिंग' },
                  { icon: PenTool, title: 'Signature', sub: 'साफ सिग्नेचर' },
                  { icon: WandSparkles, title: 'Beauty Mode', sub: 'नेचुरल रिटच' },
                  { icon: Printer, title: 'Print Sheet', sub: '4×6 और A4' }
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="group rounded-xl border border-white/15 bg-gradient-to-br from-white/[0.16] to-cyan-300/[0.06] p-3 shadow-md shadow-blue-950/10 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200/60 hover:from-white/[0.24] hover:to-cyan-300/[0.12] hover:shadow-xl hover:shadow-cyan-950/30 active:scale-[.98]">
                    <Icon className="mb-2 h-5 w-5 text-cyan-200" />
                    <p className="text-xs font-extrabold text-white">{title}</p>
                    <p className="mt-1 text-[10px] text-blue-100/75">{sub}</p>
                  </div>
                ))}
              </div>
              <button onClick={onStart} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40">
                Start Creating Photos <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-3 text-xs text-blue-100/70">फीचर्स का डेमो देखें और फिर अपनी फोटो बनाना शुरू करें।</p>
            </div>

            <div className="group/compare rounded-2xl border border-white/25 bg-gradient-to-br from-white/[0.16] via-white/[0.09] to-cyan-300/[0.08] p-3 shadow-2xl shadow-cyan-950/25 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50 hover:shadow-cyan-950/40 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold">Before / After Preview</p>
                  <p className="text-xs text-blue-100/75">Interactive sample comparison</p>
                </div>
                <span className="rounded-full border border-emerald-200/20 bg-gradient-to-r from-emerald-300/20 to-cyan-300/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-100 shadow-md">Live Demo</span>
              </div>
              <div className="relative mx-auto aspect-[4/4.3] max-w-[340px] overflow-hidden rounded-xl border-4 border-white/80 bg-white shadow-xl transition duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-cyan-950/30">
                <img src={BEAUTY_DEMO_PHOTO} alt="Illustrative passport portrait sample" className="absolute inset-0 h-full w-full object-cover object-center" style={{ filter: 'brightness(1.08) contrast(.98) saturate(1.06)' }} />
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}>
                  <img src={BEAUTY_DEMO_PHOTO} alt="Same illustrative portrait with a different preview filter" className="h-full w-full object-cover object-center" style={{ filter: 'contrast(1.12) saturate(.82) brightness(.88)' }} />
                </div>
                <span className="absolute left-2 top-2 rounded-md bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">BEFORE</span>
                <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">PREVIEW</span>
                <div className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white shadow-lg" style={{ left: `${comparison}%` }}>
                  <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg">↔</span>
                </div>
              </div>
              <div className="mx-auto mt-4 max-w-[340px]">
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-blue-100">
                  <span>Before</span><span>Slide to compare</span><span>Preview</span>
                </label>
                <input aria-label="Compare illustrative before and after sample" type="range" min="8" max="92" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} className="w-full cursor-ew-resize touch-pan-y accent-amber-400 [height:30px] [touch-action:pan-y] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-cyan-300 [&::-webkit-slider-runnable-track]:via-blue-400 [&::-webkit-slider-runnable-track]:to-amber-300 [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg" />
              </div>
              <p className="mt-2 text-center text-[10px] text-blue-100/70">Illustrative sample preview — असली एडिटिंग स्टूडियो के अंदर करें।</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/60">Explore the Studio</p>
          <h2 className="mt-2 inline-flex max-w-full items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-blue-50 to-violet-50 px-4 py-2.5 text-2xl font-black tracking-tight text-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/50 sm:text-3xl">इस स्टूडियो में आपको क्या मिलेगा?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">हर फीचर को sample के साथ देखें — फोटो एडिटिंग से लेकर प्रिंट शीट तैयार करने तक।</p>
        </div>


        <div className="space-y-7">
          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 to-cyan-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-2 pl-1 lg:order-1">
              <div className="mb-3 flex flex-wrap items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 px-2 text-lg font-black text-white shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">01</span><span className="rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Background tools · Step 01</span></div>
              <h3 className="inline-flex max-w-full rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-3 py-2 text-xl font-black text-blue-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-200/60 group-hover:text-blue-800 sm:text-2xl">AI Background Removal</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">फोटो का पुराना बैकग्राउंड हटाकर White, Blue या अपनी पसंद का नया रंग चुनें। दाईं ओर sample box के अंदर scroll करके अलग-अलग उदाहरण देखें।</p>
              <p className="mt-3 text-xs text-slate-500">Illustrative sample — वास्तविक परिणाम आपकी फोटो और editor की processing पर निर्भर करेगा।</p>
            </div>
            <div className="order-1 lg:order-2">
              <SampleScroller>
                {['Example 01','Example 02','Example 03'].map((name, i) => <div key={name} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/10"><SampleHeading index={String(i + 1).padStart(2,'0')} title={name} /><div className="grid grid-cols-3 gap-2">{[{bg:'#cbd5e1',label:'Original'},{bg:'#ffffff',label:'White BG'},{bg:'#2563eb',label:'Blue BG'}].map((item) => <div key={item.label} className={`overflow-hidden rounded-lg border p-1 ${item.label === 'Blue BG' ? 'border-blue-300 bg-blue-600' : 'border-slate-200 bg-slate-50'}`}><div className="aspect-[3/4] overflow-hidden rounded-md"><PortraitArtwork background={item.bg} /></div><p className={`mt-1 text-center text-[9px] font-bold ${item.label === 'Blue BG' ? 'text-white' : 'text-slate-600'}`}>{item.label}</p></div>)}</div></div>)}
              </SampleScroller>
            </div>
          </article>

          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-violet-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-1 lg:order-2 pl-1"><div className="mb-3 flex items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 px-2 text-lg font-black text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50">02</span><span className="rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Photo positioning · Step 02</span></div><h3 className="inline-flex max-w-full rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 px-3 py-2 text-xl font-black text-indigo-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/60 group-hover:text-indigo-800 sm:text-2xl">Crop, Move &amp; Resize</h3><p className="mt-2 text-sm leading-7 text-slate-600">फोटो को सही फ्रेम में Crop करें, अपनी पसंद की जगह पर Move करें और जरूरत के अनुसार Resize करें। sample box के अंदर scroll करके तीन crop examples देखें।</p></div>
            <SampleScroller>
              {[{label:'Face centered',scale:'scale-100',pos:'object-center'},{label:'Closer crop',scale:'scale-125',pos:'object-[50%_25%]'},{label:'Full head & shoulders',scale:'scale-90',pos:'object-[50%_35%]'}].map((item,i)=><div key={item.label} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/10"><SampleHeading index={String(i+1).padStart(2,'0')} title={item.label}/><div className="relative mx-auto aspect-[4/3] max-w-sm overflow-hidden rounded-xl border-2 border-dashed border-indigo-400 bg-white p-5"><span className="absolute left-2 top-2 z-10 rounded-md bg-slate-900/80 px-2 py-1 text-[9px] font-bold text-white">CROP AREA</span><div className="absolute inset-8 overflow-hidden rounded-lg border-2 border-indigo-400 shadow-lg"><img src={BEAUTY_DEMO_PHOTO} alt="Illustrative crop positioning sample" className={`h-full w-full object-cover ${item.scale} ${item.pos}`} /></div><span className="absolute bottom-2 right-2 rounded-md bg-indigo-700 px-2 py-1 text-[9px] font-bold text-white">3:4 PHOTO</span></div><div className="mt-2 flex justify-center gap-2 text-[10px] font-bold text-slate-600"><span className="rounded-full bg-slate-100 px-3 py-1">Crop</span><span className="rounded-full bg-slate-100 px-3 py-1">Move</span><span className="rounded-full bg-slate-100 px-3 py-1">Resize</span></div></div>)}
            </SampleScroller>
          </article>

          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-500 to-teal-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-2 pl-1 lg:order-1"><div className="mb-3 flex items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 px-2 text-lg font-black text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-50">03</span><span className="rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Signature tools · Step 03</span></div><h3 className="inline-flex max-w-full rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-3 py-2 text-xl font-black text-emerald-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-200/60 group-hover:text-emerald-800 sm:text-2xl">Signature Cleaner</h3><p className="mt-2 text-sm leading-7 text-slate-600">सिग्नेचर की फोटो से paper जैसा background साफ करने और Transparent, White या Blue background पर preview देखने का विकल्प।</p></div>
            <SampleScroller>
              {[{title:'Transparent preview',light:false},{title:'White background',light:false},{title:'Blue background',light:true}].map((item,i)=><div key={item.title} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/10"><SampleHeading index={String(i+1).padStart(2,'0')} title={item.title}/><div className={`rounded-lg border p-4 ${i===0?'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]':i===1?'bg-white':'bg-blue-700'}`}><div className="h-20"><SignatureArtwork light={item.light}/></div></div></div>)}
            </SampleScroller>
          </article>

          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-violet-500 to-fuchsia-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-1 lg:order-2 pl-1"><div className="mb-3 flex items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 px-2 text-lg font-black text-white shadow-lg shadow-violet-500/25 ring-4 ring-violet-50">04</span><span className="rounded-full border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Print layout · Step 04</span></div><h3 className="inline-flex max-w-full rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-3 py-2 text-xl font-black text-violet-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-200/60 group-hover:text-violet-800 sm:text-2xl">4×6 &amp; A4 Photo Sheets</h3><p className="mt-2 text-sm leading-7 text-slate-600">एक ही शीट पर कई पासपोर्ट फोटो व्यवस्थित करें। sample box के अंदर scroll करके अलग-अलग print layouts देखें।</p></div>
            <SampleScroller>
              {[{count:4,label:'4×6 · 4 copies',cols:2},{count:6,label:'4×6 · 6 copies',cols:3},{count:8,label:'A4 · 8 copies',cols:4}].map(item=><div key={item.label} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/10"><SampleHeading index={item.label.startsWith('4×6 · 4')?'01':item.label.startsWith('4×6 · 6')?'02':'03'} title={item.label}/><div className={`mx-auto grid aspect-[6/4] max-w-sm gap-1.5 rounded-lg border border-slate-300 bg-white p-2 shadow-inner ${item.cols === 2 ? 'grid-cols-2' : item.cols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>{Array.from({length:item.count},(_,i)=><div key={i} className="overflow-hidden rounded-sm border border-slate-200"><img src={BEAUTY_DEMO_PHOTO} alt="Illustrative print sheet photo" className="h-full w-full object-cover"/></div>)}</div></div>)}
            </SampleScroller>
          </article>

          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-500 to-orange-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-2 pl-1 lg:order-1"><div className="mb-3 flex items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-2 text-lg font-black text-white shadow-lg shadow-amber-500/25 ring-4 ring-amber-50">05</span><span className="rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Layout control · Step 05</span></div><h3 className="inline-flex max-w-full rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-3 py-2 text-xl font-black text-amber-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-200/60 group-hover:text-amber-800 sm:text-2xl">Manual + Auto Arrange</h3><p className="mt-2 text-sm leading-7 text-slate-600">Auto Arrange से फोटो को एक क्लिक में grid में लगाएँ या Manual mode में हर फोटो को खुद Move और Resize करें। जरूरत के अनुसार फोटो की कई Duplicate copies बनाएँ और किसी भी फोटो को Delete बटन से शीट से हटाएँ। ये विकल्प इस डेमो में दिखाए गए हैं।</p></div>
            <SampleScroller>
              {[{title:'Auto · Equal grid',manual:false},{title:'Manual · Free position',manual:true},{title:'Mixed · Custom layout',manual:true}].map((item,i)=><div key={item.title} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/10"><SampleHeading index={String(i+1).padStart(2,'0')} title={item.title}/><div className="mx-auto grid max-w-sm grid-cols-2 gap-2 rounded-lg bg-slate-100 p-3"><div className="rounded-lg border border-slate-200 bg-white p-2"><p className="mb-2 text-center text-[9px] font-black text-slate-500">{item.manual?'CUSTOM':'AUTO GRID'}</p><div className={`grid gap-1.5 ${item.manual?'grid-cols-2':'grid-cols-2'}`}>{Array.from({length:4},(_,j)=><img key={j} src={BEAUTY_DEMO_PHOTO} alt="Arranged photo sample" className={`aspect-[3/4] w-full rounded-sm object-cover ${item.manual&&j===1?'translate-y-2':''}`}/>)}</div></div><div className="flex flex-col justify-center gap-2 text-[10px] font-bold text-slate-600"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Move</span><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Resize</span><span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Arrange</span></div></div></div>)}
              <div className="group rounded-xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/10"><SampleHeading index="04" title="Duplicate & Delete Photo"/><div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-slate-100 p-3"><p className="mb-2 text-center text-[9px] font-black text-slate-500">PHOTO SHEET · SAMPLE CONTROLS</p><div className="grid grid-cols-4 gap-2">{Array.from({length:8},(_,j)=><div key={j} className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-0.5"><img src={BEAUTY_DEMO_PHOTO} alt="Duplicate photo sample on print sheet" className="aspect-[3/4] w-full rounded-sm object-cover"/><span className="absolute bottom-1 right-1 rounded bg-slate-900/75 px-1 text-[8px] font-bold text-white">{j+1}</span></div>)}</div><div className="mt-3 flex flex-wrap justify-center gap-2"><span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-extrabold text-white"><Copy className="h-3 w-3"/> Duplicate Photo</span><span className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-extrabold text-white"><Trash2 className="h-3 w-3"/> Delete Photo</span></div><p className="mt-2 text-center text-[9px] text-slate-500">Illustrative controls · डेमो के लिए</p></div></div>
            </SampleScroller>
          </article>

          <article className="group relative grid items-center gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-900/10 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-rose-500 to-pink-400 opacity-80 transition-all group-hover:w-2.5" />
            <div className="order-1 lg:order-2 pl-1"><div className="mb-3 flex items-center gap-2"><span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-500 px-2 text-lg font-black text-white shadow-lg shadow-rose-500/25 ring-4 ring-rose-50">06</span><span className="rounded-full border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Final output · Step 06</span></div><h3 className="inline-flex max-w-full rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 px-3 py-2 text-xl font-black text-rose-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-200/60 group-hover:text-rose-800 sm:text-2xl">High-Resolution Export</h3><p className="mt-2 text-sm leading-7 text-slate-600">तैयार फोटो या print sheet को high-resolution image के रूप में export करें। sample panel में अलग-अलग output formats देखें।</p></div>
            <SampleScroller>
              {[{file:'passport-photo-print.png',format:'PNG · High quality'},{file:'passport-photo-print.jpg',format:'JPG · Print ready'},{file:'photo-sheet-a4.png',format:'A4 · Full sheet'}].map((item,i)=><div key={item.file} className="group rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/10"><SampleHeading index={String(i+1).padStart(2,'0')} title={item.format}/><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Download className="h-6 w-6"/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-slate-800">{item.file}</p><p className="mt-1 text-[10px] text-slate-500">High-resolution · Illustrative export</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-full rounded-full bg-emerald-500"/></div></div><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600"/></div></div>)}
            </SampleScroller>
          </article>
        </div>
      </section>



      <section className="relative overflow-hidden bg-[#090d1a] px-4 py-12 text-white sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[.16em] text-violet-200">
              <WandSparkles className="h-4 w-4" /> SMART BEAUTY EDITING
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Beauty Mode — Professional Photo Retouching</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              अपनी फोटो को दें एक साफ़, नेचुरल और प्रोफेशनल लुक — बिना चेहरे की असली पहचान बदले।
              Beauty Mode में skin retouch और हल्के image adjustments को अपने नियंत्रण में रखें।
            </p>
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/30 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-sm font-extrabold">Full Portrait · Before &amp; After</p>
                  <p className="mt-1 text-xs text-slate-400">Same fictional demo subject · illustrative example</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Natural Finish</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700 to-slate-900">
                  <div className="relative aspect-[4/5]">
                    <img src={BEAUTY_DEMO_PHOTO} alt="Original portrait sample before Beauty Mode" className="absolute inset-0 z-10 h-full w-full object-cover object-center" style={{ filter: 'contrast(1.08) saturate(.88) brightness(.94)' }} loading="lazy" />
                  </div>
                  <span className="absolute left-2 top-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-extrabold tracking-wider">BEFORE</span>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-900/60 to-blue-950">
                  <div className="relative aspect-[4/5]">
                    <img src={BEAUTY_DEMO_PHOTO} alt="Same portrait sample with a subtle Beauty Mode preview finish" className="absolute inset-0 z-10 h-full w-full object-cover object-center" style={{ filter: 'brightness(1.08) contrast(.98) saturate(1.06)' }} loading="lazy" />
                    <div className="pointer-events-none absolute inset-0 z-20 bg-rose-100/5" />
                  </div>
                  <span className="absolute left-2 top-2 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-extrabold tracking-wider">AFTER</span>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">डेमो फोटो केवल फीचर समझाने के लिए हैं। आपकी फोटो का परिणाम आपकी original image और चुनी गई settings पर निर्भर करेगा।</p>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.10] to-violet-400/[0.04] p-4 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-xl hover:shadow-violet-950/30 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-amber-100/20 to-violet-300/20">
                    <img src={BEAUTY_DEMO_PHOTO} alt="Portrait skin detail sample before retouch" className="h-full w-full object-cover object-[50%_28%] scale-150" style={{ filter: 'contrast(1.1) saturate(.9)' }} loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">AI Skin Retouch</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">चेहरे की skin area पर हल्का, mask-based retouch; eyes, lips और hair को सुरक्षित रखने के लिए segmentation mask का उपयोग।</p>
                  </div>
                </div>
              </article>
              <article className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.10] to-violet-400/[0.04] p-4 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-xl hover:shadow-violet-950/30 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-100/20 to-blue-300/20">
                    <img src={BEAUTY_DEMO_PHOTO} alt="Portrait skin detail sample with a subtle retouch preview" className="h-full w-full object-cover object-[50%_28%] scale-150" style={{ filter: 'brightness(1.06) contrast(.96) saturate(1.04)' }} loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">Blemish Reduction</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">Face-skin mask के अंदर छोटे isolated blemish-जैसे spots को हल्का कम करने का control — पूरी skin को blur नहीं करता।</p>
                  </div>
                </div>
              </article>
              <article className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.10] to-violet-400/[0.04] p-4 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-xl hover:shadow-violet-950/30 sm:p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20">
                    <Sparkles className="h-8 w-8 text-violet-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold">Natural Softening</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">Softening slider से बहुत हल्का finish चुनें। जरूरत से ज्यादा smoothing से बचें ताकि फोटो natural दिखे।</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'AI Skin Retouch', detail: 'चेहरे की skin area पर targeted retouch का डेमो। इसका उद्देश्य त्वचा को साफ दिखाना है, जबकि आँखों, होंठों, बालों और चेहरे की पहचान जैसे जरूरी विवरण सुरक्षित रहें।' },
              { title: 'Blemish & Spot Reduction', detail: 'छोटे दाग-धब्बों और isolated spots को हल्का कम करने के लिए 0–60% तक adjustable strength control। जरूरत के अनुसार कम या ज्यादा प्रभाव चुनें।' },
              { title: 'Face Brightness', detail: 'चेहरे पर कम रोशनी होने पर face area को हल्का brighten करने का विकल्प, ताकि फोटो में चेहरा साफ और संतुलित दिखाई दे।' },
              { title: 'Brightness', detail: 'पूरी फोटो की overall light को adjust करें। बहुत dark या over-exposed फोटो को संतुलित करने में मदद मिलती है।' },
              { title: 'Contrast', detail: 'फोटो के light और dark हिस्सों के बीच अंतर को नियंत्रित करें, ताकि चेहरा और फोटो के details साफ दिखें।' },
              { title: 'Saturation', detail: 'रंगों की intensity कम या ज्यादा करें। Skin tone को जरूरत से ज्यादा लाल, पीला या artificial दिखने से बचाने के लिए छोटे बदलाव करें।' },
              { title: 'Natural Skin Softening', detail: 'हल्का softening effect चुनें। मकसद skin texture को पूरी तरह मिटाना नहीं, बल्कि छोटे rough areas को subtle तरीके से smooth दिखाना है।' },
              { title: 'Natural Beauty Enhancement', detail: 'Brightness, contrast और softening के संतुलित संयोजन से साफ, natural और professional look का preview देखें — चेहरे की पहचान बदले बिना।' },
              { title: 'Face Detection', detail: 'फोटो में face area पहचानने में मदद करता है, ताकि retouch सही हिस्से पर केंद्रित रहे। पहचान की गुणवत्ता फोटो और browser support पर निर्भर करती है।' },
              { title: 'Before / After Comparison', detail: 'Original photo और edited preview को साथ देखकर हर बदलाव जाँचें। जरूरत से ज्यादा editing लगे तो strength कम करें।' },
              { title: 'Undo · Redo · Reset', detail: 'आखिरी बदलाव वापस लें, redo करें या Beauty Mode की settings को शुरुआती स्थिति में reset करें।' }
            ].map(({ title, detail }, index) => (
              <article key={title} className="group rounded-2xl border border-violet-300/15 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/70 p-4 shadow-md shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-violet-300/50 hover:shadow-xl hover:shadow-violet-950/30 active:scale-[.99]">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10 text-xs font-black text-violet-200">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="text-sm font-extrabold text-white">{title}</h3>
                </div>
                <p className="text-xs leading-6 text-slate-300">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 sm:flex-row sm:items-center sm:p-5">
            <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-300" />
            <div>
              <p className="text-sm font-extrabold text-emerald-100">Your Photo, Your Privacy</p>
              <p className="mt-1 text-xs leading-6 text-slate-300">Beauty retouch processing आपके browser में locally होती है। इस retouch के लिए आपकी फोटो TANSHU ONLINE के app server पर upload नहीं की जाती। अपने browser और device की सुरक्षा बनाए रखें।</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Signature Studio</p>
            <h2 className="mt-2 inline-flex max-w-full items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-blue-50 to-violet-50 px-4 py-2.5 text-2xl font-black text-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/50 sm:text-3xl">Signature को साफ करें और मनचाहा बैकग्राउंड चुनें</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">सिग्नेचर की इमेज तैयार करें, पेपर बैकग्राउंड हटाने का विकल्प इस्तेमाल करें और अपनी जरूरत के अनुसार प्रीव्यू देखें।</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(['transparent', 'white', 'blue'] as const).map((choice) => (
                <button key={choice} onClick={() => setSignatureBg(choice)} className={`rounded-xl border px-4 py-2.5 text-xs font-extrabold capitalize shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${signatureBg === choice ? (choice === 'transparent' ? 'border-violet-500 bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-900 ring-2 ring-violet-200 shadow-violet-200/70' : choice === 'white' ? 'border-slate-400 bg-gradient-to-br from-white to-slate-100 text-slate-900 ring-2 ring-slate-200 shadow-slate-200/70' : 'border-blue-600 bg-gradient-to-br from-blue-600 to-cyan-500 text-white ring-2 ring-blue-200 shadow-blue-300/70') : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50'}`}>
                  {choice === 'transparent' ? 'Transparent' : choice === 'white' ? 'White' : 'Blue'}
                </button>
              ))}
            </div>
          </div>
          <div className={`overflow-hidden rounded-2xl border border-slate-200 p-5 shadow-inner ${signatureBg === 'transparent' ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]' : signatureBg === 'blue' ? 'bg-blue-600' : 'bg-white'}`}>
            <div className="h-28 w-full"><SignatureArtwork light={signatureBg === 'blue'} /></div>
            <p className={`mt-3 text-center text-xs font-semibold ${signatureBg === 'blue' ? 'text-white' : 'text-slate-600'}`}>{signatureBg === 'transparent' ? 'Transparent background preview' : signatureBg === 'white' ? 'White background preview' : 'Blue background preview'}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <p className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/60">Print Sheet Preview</p>
          <h2 className="mt-2 inline-flex max-w-full items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-r from-white via-blue-50 to-violet-50 px-4 py-2.5 text-2xl font-black text-slate-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/50 sm:text-3xl">एक क्लिक में 4×6 या A4 फोटो शीट</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Auto Arrange से शीट बनाएँ या एडिटर में हर फोटो को Drag, Move और Resize करके खुद सेट करें।</p>
        </div>

        <div className="grid items-center gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setPaper('4x6'); setCopies(Math.min(copies, 12)); }} className={`rounded-xl border px-4 py-2.5 text-sm font-extrabold shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${paper === '4x6' ? 'border-blue-600 bg-gradient-to-r from-blue-700 to-cyan-600 text-white ring-2 ring-blue-200 shadow-blue-300/50' : 'border-slate-200 bg-gradient-to-r from-white to-slate-100 text-slate-700 hover:border-blue-300 hover:from-blue-50 hover:to-cyan-50'}`}>4×6 Inch</button>
              <button onClick={() => setPaper('A4')} className={`rounded-xl border px-4 py-2.5 text-sm font-extrabold shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${paper === 'A4' ? 'border-blue-600 bg-gradient-to-r from-blue-700 to-cyan-600 text-white ring-2 ring-blue-200 shadow-blue-300/50' : 'border-slate-200 bg-gradient-to-r from-white to-slate-100 text-slate-700 hover:border-blue-300 hover:from-blue-50 hover:to-cyan-50'}`}>A4 Sheet</button>
            </div>
            <p className="mt-5 text-sm font-bold text-slate-800">Demo में फोटो की संख्या चुनें</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {copyOptions.map((count) => (
                <button key={count} onClick={() => setCopies(count)} className={`h-10 min-w-11 rounded-xl border px-3 text-sm font-black shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${copies === count ? 'border-emerald-600 bg-gradient-to-br from-emerald-500 to-teal-500 text-white ring-2 ring-emerald-200 shadow-emerald-300/60' : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:border-emerald-300 hover:from-emerald-50 hover:to-teal-50'}`}>{count}</button>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multiple photo copies</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Manual positioning &amp; resizing</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Print-ready export options</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 sm:p-5">
            <div className={`mx-auto grid gap-1.5 rounded-md border border-slate-300 bg-white p-3 shadow-md ${paper === 'A4' ? 'aspect-[1/1.414] max-w-[310px] grid-cols-4' : 'aspect-[6/4] max-w-[390px] grid-cols-3'}`}>
              {Array.from({ length: slots }, (_, index) => (
                <div key={index} className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-slate-200 bg-slate-50">
                  <img src={BEAUTY_DEMO_PHOTO} alt={`Sample passport photo ${index + 1}`} className="h-full w-full object-cover object-center" loading="lazy" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs font-bold text-slate-600">{paper === '4x6' ? '4×6 Inch' : 'A4'} · {slots} sample photo slots</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-10 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex items-center gap-3"><Smartphone className="h-7 w-7 text-cyan-300" /><div><p className="font-bold">Mobile Friendly</p><p className="text-xs text-slate-300">फोन पर भी आसान कंट्रोल</p></div></div>
            <div className="flex items-center gap-3"><Monitor className="h-7 w-7 text-cyan-300" /><div><p className="font-bold">Desktop Ready</p><p className="text-xs text-slate-300">कंप्यूटर पर बड़ा वर्कस्पेस</p></div></div>
            <div className="flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-emerald-300" /><div><p className="font-bold">Browser Processing</p><p className="text-xs text-slate-300">फोटो आपके ब्राउज़र में प्रोसेस होती है</p></div></div>
          </div>
          <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center sm:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><Camera className="h-6 w-6" /></div>
            <h2 className="mt-4 text-2xl font-black sm:text-3xl">अब अपनी फोटो बनाना शुरू करें!</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">अपनी फोटो अपलोड करें, एडिट करें, शीट पर सेट करें और प्रिंट के लिए डाउनलोड करें।</p>
            <button onClick={onStart} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3 text-sm font-extrabold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40">
              Open Photo Studio <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
