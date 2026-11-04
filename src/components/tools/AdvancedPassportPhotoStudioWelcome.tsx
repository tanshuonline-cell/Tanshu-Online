import React, { useState } from 'react';
import {
  ArrowRight, Camera, CheckCircle2, Crop, Download, Eraser, ImagePlus,
  Layers, LayoutGrid, Monitor, Move, Palette, PenTool, Printer, ShieldCheck,
  Smartphone, Sparkles, WandSparkles, ZoomIn
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

const featureItems = [
  { icon: Eraser, title: 'AI Background Removal', text: 'फोटो का बैकग्राउंड हटाएँ और नया रंग चुनें।' },
  { icon: Crop, title: 'Crop, Move & Resize', text: 'फोटो को पकड़कर अपनी पसंद की जगह और साइज पर सेट करें।' },
  { icon: PenTool, title: 'Signature Cleaner', text: 'सिग्नेचर का पेपर बैकग्राउंड साफ करके तैयार करें।' },
  { icon: LayoutGrid, title: '4×6 & A4 Photo Sheets', text: 'एक शीट पर कई फोटो व्यवस्थित करें।' },
  { icon: Move, title: 'Manual + Auto Arrange', text: 'एक क्लिक में लेआउट बनाएँ या हर फोटो खुद सेट करें।' },
  { icon: Printer, title: 'High-Resolution Export', text: 'प्रिंट के लिए तैयार फाइल डाउनलोड करें।' }
];

export const AdvancedPassportPhotoStudioWelcome: React.FC<Props> = ({ onStart }) => {
  const [comparison, setComparison] = useState(54);
  const [paper, setPaper] = useState<'4x6' | 'A4'>('4x6');
  const [copies, setCopies] = useState(8);
  const [signatureBg, setSignatureBg] = useState<'transparent' | 'white' | 'blue'>('transparent');

  const slots = Math.min(copies, paper === '4x6' ? 12 : 24);

  return (
    <main className="w-full bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-4 py-10 text-white sm:px-8 sm:py-14 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
              <Sparkles className="h-4 w-4 text-amber-300" /> TANSHU ONLINE PHOTO STUDIO
            </div>
            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Passport Photo &amp; Signature Maker
            </h1>
            <p className="mt-3 text-lg font-semibold text-blue-100 sm:text-xl">पासपोर्ट फोटो और सिग्नेचर मेकर</p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/90 sm:text-base">
              Create professional passport photos and clean signatures in minutes. मोबाइल और कंप्यूटर पर, बिना Photoshop इंस्टॉल किए।
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-blue-50">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">✓ Photo Editing</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">✓ Signature Cleaning</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">✓ Print Layouts</span>
            </div>
            <button onClick={onStart} className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40">
              Start Creating Photos <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-xs text-blue-100/70">पहले फीचर्स देखें, फिर अपनी फोटो एडिट करना शुरू करें।</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Before / After Preview</p>
                <p className="text-xs text-blue-100/75">Sample photo transformation</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Interactive Demo</span>
            </div>
            <div className="relative mx-auto aspect-[4/4.3] max-w-[340px] overflow-hidden rounded-xl border-4 border-white/80 bg-white shadow-xl">
              <PortraitArtwork background="#f8fafc" />
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}>
                <PortraitArtwork background="#a1a1aa" muted />
              </div>
              <span className="absolute left-2 top-2 rounded-md bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">BEFORE</span>
              <span className="absolute right-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">AFTER</span>
              <div className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white shadow-lg" style={{ left: `${comparison}%` }}>
                <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg">↔</span>
              </div>
            </div>
            <div className="mx-auto mt-4 max-w-[340px]">
              <label className="mb-2 flex items-center justify-between text-xs font-medium text-blue-100">
                <span>Before</span><span>Slide to compare</span><span>After</span>
              </label>
              <input aria-label="Compare before and after sample" type="range" min="8" max="92" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} className="w-full accent-amber-400" />
            </div>
            <p className="mt-2 text-center text-[10px] text-blue-100/70">Illustrative sample preview — अपनी फोटो का एडिट आप स्टूडियो में करेंगे।</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Explore the Studio</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">इस स्टूडियो में आपको क्या मिलेगा?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">फोटो एडिटिंग से लेकर प्रिंट शीट तैयार करने तक — सभी जरूरी टूल एक ही जगह।</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
              <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Signature Studio</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Signature को साफ करें और मनचाहा बैकग्राउंड चुनें</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">सिग्नेचर की इमेज तैयार करें, पेपर बैकग्राउंड हटाने का विकल्प इस्तेमाल करें और अपनी जरूरत के अनुसार प्रीव्यू देखें।</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(['transparent', 'white', 'blue'] as const).map((choice) => (
                <button key={choice} onClick={() => setSignatureBg(choice)} className={`rounded-lg border px-3 py-2 text-xs font-bold capitalize transition ${signatureBg === choice ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
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
          <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-700">Print Sheet Preview</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">एक क्लिक में 4×6 या A4 फोटो शीट</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Auto Arrange से शीट बनाएँ या एडिटर में हर फोटो को Drag, Move और Resize करके खुद सेट करें।</p>
        </div>

        <div className="grid items-center gap-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPaper('4x6')} className={`rounded-lg px-4 py-2 text-sm font-bold ${paper === '4x6' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`}>4×6 Inch</button>
              <button onClick={() => setPaper('A4')} className={`rounded-lg px-4 py-2 text-sm font-bold ${paper === 'A4' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`}>A4 Sheet</button>
            </div>
            <p className="mt-5 text-sm font-bold text-slate-800">Demo में फोटो की संख्या चुनें</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[4, 8, 12, 20].map((count) => (
                <button key={count} onClick={() => setCopies(count)} className={`h-9 min-w-10 rounded-lg border px-3 text-sm font-bold ${copies === count ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>{count}</button>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multiple photo copies</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Manual positioning &amp; resizing</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Print-ready export options</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 sm:p-5">
            <div className={`mx-auto grid gap-1.5 rounded-md border border-slate-300 bg-white p-3 shadow-md ${paper === 'A4' ? 'aspect-[1/1.414] max-w-[310px] grid-cols-4' : 'aspect-[6/4] max-w-[390px] grid-cols-4'}`}>
              {Array.from({ length: slots }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-[2px] border border-slate-200 bg-slate-50">
                  <PortraitArtwork background="#f8fafc" />
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
