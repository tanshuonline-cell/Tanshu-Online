import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, Download, FileImage,
  Gauge, ImagePlus, Monitor, ShieldCheck, Smartphone, SlidersHorizontal,
  Sparkles, Upload, WandSparkles
} from 'lucide-react';

interface Props {
  onStart: () => void;
  onBack: () => void;
}

const DemoPhoto: React.FC<{ variant?: 'original' | 'clean' }> = ({ variant = 'clean' }) => (
  <svg viewBox="0 0 180 220" className="h-full w-full" role="img" aria-label="Illustrative passport photo sample">
    <rect width="180" height="220" rx="8" fill={variant === 'original' ? '#dbeafe' : '#ffffff'} />
    {variant === 'original' && <path d="M0 0h180v220H0z" fill="#cbd5e1" opacity=".45" />}
    <path d="M28 220c5-48 28-70 62-70s57 22 62 70" fill="#1e3a5f" />
    <path d="M68 160l22 23 22-23-9-18H77z" fill="#f0c6a4" />
    <ellipse cx="90" cy="91" rx="43" ry="55" fill="#e9b995" />
    <path d="M47 91c-5-43 13-66 46-66 31 0 49 22 43 66-8-12-13-26-15-39-17 13-42 19-71 18z" fill="#263447" />
    <path d="M67 91h11m24 0h11" stroke="#513d35" strokeWidth="3" strokeLinecap="round" />
    <path d="M89 99l-4 17h10" stroke="#bd8e73" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M78 126c8 7 17 7 25 0" stroke="#9d5d59" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const DemoSignature = () => (
  <svg viewBox="0 0 320 100" className="h-full w-full" role="img" aria-label="Illustrative signature sample">
    <path d="M12 65c18-32 25-39 30-31 4 7-12 39-6 40 6 1 22-32 30-31 7 1-3 26 5 27 8 1 20-24 29-25 8-1-3 22 6 24 9 2 20-20 29-20 9 0 1 18 10 20 10 2 20-17 29-18 8-1 2 16 10 17 9 1 20-11 28-17 11-8 16-10 20-6 4 4-3 16 5 19 8 3 17-4 26-12" fill="none" stroke="#172554" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 83c83 5 174 4 280-4" stroke="#64748b" strokeWidth="1.4" fill="none" />
  </svg>
);

const features = [
  {
    step: '01',
    icon: Camera,
    title: 'पासपोर्ट / फॉर्म फोटो Resize',
    titleEn: 'Resize Passport / Form Photos',
    description: 'फोटो की Width और Height pixels में या cm, mm और inches में सेट करें। सही फ्रेम के लिए Contain या Cover चुनें।',
    descriptionEn: 'Set photo width and height in pixels, cm, mm or inches. Choose Contain or Cover to fit the required frame.',
    sample: 'photo'
  },
  {
    step: '02',
    icon: WandSparkles,
    title: 'सिग्नेचर Resize',
    titleEn: 'Resize Signatures',
    description: 'सिग्नेचर को अलग सेटिंग से तैयार करें। 140 × 60 px और 200 × 100 px जैसे पुराने उपयोगी presets भी उपलब्ध हैं।',
    descriptionEn: 'Prepare signatures with separate settings. Useful presets such as 140 × 60 px and 200 × 100 px are also available.',
    sample: 'signature'
  },
  {
    step: '03',
    icon: Gauge,
    title: 'Print DPI सेट करें',
    titleEn: 'Set Print DPI',
    description: '72, 96, 150, 200, 240 या 300 DPI चुनें। DPI प्रिंट density metadata बताता है; वास्तविक image detail pixels पर निर्भर करती है।',
    descriptionEn: 'Choose 72, 96, 150, 200, 240 or 300 DPI. DPI describes print-density metadata; actual image detail depends on pixel dimensions.',
    sample: 'dpi'
  },
  {
    step: '04',
    icon: SlidersHorizontal,
    title: 'KB / MB के अनुसार Compress',
    titleEn: 'Compress to a KB / MB Limit',
    description: '10 KB से 500 KB तक quick targets या MB चुनें। Custom maximum file size भी दर्ज करें। फाइल का आकार चुनी हुई सीमा से कम हो सकता है।',
    descriptionEn: 'Choose quick targets from 10 KB to 500 KB or switch to MB. Enter a custom maximum size; the final file may be smaller than the selected limit.',
    sample: 'size'
  },
  {
    step: '05',
    icon: ImagePlus,
    title: 'Live Crop और Preview',
    titleEn: 'Live Crop & Preview',
    description: 'Zoom और X/Y position से फोटो को फ्रेम में सेट करें। Original dimensions और framing बचाने के लिए Compress Only mode भी है।',
    descriptionEn: 'Position the photo in its frame using zoom and X/Y controls. Compress Only mode keeps the original dimensions and framing.',
    sample: 'preview'
  },
  {
    step: '06',
    icon: FileImage,
    title: 'JPG, PNG, WEBP और ZIP Download',
    titleEn: 'Download JPG, PNG, WEBP & ZIP',
    description: 'फोटो और सिग्नेचर अलग-अलग डाउनलोड करें या दोनों को ZIP में लें। Print Preview से प्रिंट लेआउट भी जाँचें।',
    descriptionEn: 'Download the photo and signature separately or together in a ZIP. Check the print layout with Print Preview.',
    sample: 'download'
  }
];

export const PhotoSignatureResizerWelcome: React.FC<Props> = ({ onStart, onBack }) => {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const hi = language === 'hi';
  const tx = (hindi: string, english: string) => hi ? hindi : english;

  return (
    <main className="min-h-full bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07152f]/95 px-4 py-3 text-white shadow-lg backdrop-blur-md sm:px-7">
        <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3">
          <button type="button" onClick={onBack} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[10px] font-extrabold text-blue-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/15"><ArrowLeft className="h-3.5 w-3.5" />{tx('होम', 'BACK')}</button>
          <img src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg" alt="Tanshu Online profile" className="h-9 w-9 shrink-0 rounded-full border-2 border-blue-400 object-cover shadow-md sm:h-10 sm:w-10" />
          <div className="min-w-0">
            <p className="text-sm font-black tracking-wide">TANSHU <span className="text-cyan-300">ONLINE</span></p>
            <p className="text-[10px] font-semibold text-blue-100/75">PHOTO &amp; SIGNATURE RESIZER STUDIO</p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/10 p-0.5">
            <button type="button" onClick={() => setLanguage('hi')} aria-pressed={hi} className={`rounded-md px-2.5 py-1.5 text-[10px] font-extrabold ${hi ? 'bg-white text-slate-900' : 'text-blue-100 hover:bg-white/10'}`}>हिंदी</button>
            <button type="button" onClick={() => setLanguage('en')} aria-pressed={!hi} className={`rounded-md px-2.5 py-1.5 text-[10px] font-extrabold ${!hi ? 'bg-white text-slate-900' : 'text-blue-100 hover:bg-white/10'}`}>EN</button>
          </div>
          <button type="button" onClick={onStart} className="ml-1 inline-flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-amber-200/30 bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1.5 text-[10px] font-black text-slate-950 shadow-md transition hover:-translate-y-0.5 hover:from-amber-300 hover:to-yellow-200 sm:px-3 sm:text-xs">{tx('आगे', 'NEXT')} <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#07152f] via-[#12345f] to-[#087e9b] px-4 py-10 text-white sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5" /> {tx('लोकल ब्राउज़र प्रोसेसिंग', 'LOCAL BROWSER PROCESSING')}
            </span>
            <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-cyan-200">{tx('Professional Photo & Signature Studio', 'Professional Photo & Signature Studio')}</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black uppercase leading-tight tracking-wide sm:text-5xl">{tx('फोटो और सिग्नेचर को सही Size में तैयार करें', 'PREPARE PHOTOS & SIGNATURES WITH PRECISION')}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/90">{tx('एडिटर खोलने से पहले इसके फीचर्स और नमूने देखें। फोटो Resize करें, सिग्नेचर सेट करें, Print DPI चुनें और KB के अनुसार फाइल तैयार करें।', 'Explore the features and sample outputs before opening the editor. Resize photos, prepare signatures, choose print DPI and compress to a target file size.')}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['📷 Photo Resize', '✍️ Signature', '🎯 KB Target', '🖨️ Print DPI'].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold text-blue-50">{item}</span>)}
            </div>
            <button type="button" onClick={onStart} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3 text-sm font-black text-slate-950 shadow-xl shadow-amber-950/20 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/40">
              {tx('Start Editing', 'Start Editing')} <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-3 text-[10px] text-blue-100/70">{tx('नमूने केवल फीचर समझाने के लिए हैं। असली काम अगले एडिटर पेज पर होगा।', 'Samples are illustrative. Your actual editing happens on the next screen.')}</p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div><p className="text-xs font-black text-white">{tx('Sample Output Preview', 'Sample Output Preview')}</p><p className="mt-1 text-[10px] text-blue-100/70">{tx('उदाहरण · वास्तविक फोटो अलग हो सकती है', 'Illustrative examples · results vary by source image')}</p></div>
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white p-3">
                <p className="mb-2 text-center text-[10px] font-extrabold text-slate-600">{tx('पासपोर्ट फोटो', 'PASSPORT PHOTO')}</p>
                <div className="mx-auto h-44 max-w-36 overflow-hidden rounded-lg border border-slate-200 shadow-sm"><DemoPhoto /></div>
                <p className="mt-2 text-center text-[10px] font-bold text-slate-700">413 × 531 px</p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-white/15 bg-white p-3">
                <p className="mb-3 text-center text-[10px] font-extrabold text-slate-600">{tx('सिग्नेचर', 'SIGNATURE')}</p>
                <div className="flex h-24 items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2"><DemoSignature /></div>
                <p className="mt-2 text-center text-[10px] font-bold text-slate-700">140 × 60 px</p>
                <div className="mt-4 rounded-lg bg-blue-50 p-2 text-center"><p className="text-lg font-black text-blue-800">300 DPI</p><p className="text-[9px] font-semibold text-blue-600">{tx('High-quality print', 'High-quality print')}</p></div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[{v:'JPG',l:tx('फॉर्म फोटो','FORM PHOTO')},{v:'50 KB',l:tx('मैक्स साइज़','MAX SIZE')},{v:'ZIP',l:tx('दोनों फाइलें','BOTH FILES')}].map((item) => <div key={item.v} className="rounded-xl border border-white/10 bg-slate-950/20 px-2 py-3"><p className="text-sm font-black text-cyan-200">{item.v}</p><p className="mt-1 text-[8px] font-bold text-blue-100/70">{item.l}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-7">
        <div className="mx-auto mb-7 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-blue-800">{tx('Explore the Studio', 'Explore the Studio')}</span>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">{tx('इस स्टूडियो में क्या-क्या कर सकते हैं?', 'What can you do in this studio?')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{tx('हर फीचर को sample के साथ समझें — Upload से लेकर Download और Print Preview तक।', 'See each feature with a sample — from upload to download and print preview.')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.step} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/70 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shadow-md">{feature.step}</span>
                  <div className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-blue-600" /><h3 className="text-sm font-extrabold text-slate-900">{tx(feature.title, feature.titleEn)}</h3></div>
                </div>
                <div className="p-4">
                  <p className="min-h-[72px] text-xs leading-6 text-slate-600">{tx(feature.description, feature.descriptionEn)}</p>
                  <div className="mt-3 max-h-[230px] space-y-3 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-slate-100 p-3 pr-2 shadow-inner [scrollbar-color:#64748b_#e2e8f0] [scrollbar-width:thin]">
                  {feature.sample === 'photo' && <div className="flex items-center justify-center gap-3 rounded-xl bg-white p-3"><div className="h-24 w-20 overflow-hidden rounded border border-slate-200 bg-white"><DemoPhoto variant="original" /></div><ArrowRight className="h-4 w-4 text-blue-500" /><div className="h-24 w-20 overflow-hidden rounded border border-slate-200 bg-white"><DemoPhoto /></div></div>}
                  {feature.sample === 'signature' && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3"><div className="h-16"><DemoSignature /></div><div className="mt-2 flex justify-between text-[9px] font-bold text-slate-500"><span>140 × 60 px</span><span>200 × 100 px</span></div></div>}
                  {feature.sample === 'dpi' && <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-3">{['72 DPI','150 DPI','200 DPI','240 DPI','300 DPI','96 DPI'].map((dpi) => <span key={dpi} className={`rounded-lg border px-2 py-2 text-center text-[10px] font-extrabold ${dpi === '300 DPI' ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{dpi}</span>)}</div>}
                  {feature.sample === 'size' && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3"><div className="flex flex-wrap gap-2">{['10 KB','20 KB','50 KB','100 KB','200 KB','500 KB'].map((size) => <span key={size} className={`rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold ${size === '50 KB' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}>{size}</span>)}</div><p className="mt-2 text-[9px] text-indigo-700">{tx('चुनी हुई सीमा अधिकतम है, exact size नहीं।', 'Selected size is a maximum, not an exact target.')}</p></div>}
                  {feature.sample === 'preview' && <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3"><div className="rounded-lg border bg-slate-50 p-2"><p className="mb-1 text-center text-[9px] font-bold text-slate-500">{tx('Original','Original')}</p><div className="h-24 overflow-hidden rounded"><DemoPhoto variant="original" /></div></div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2"><p className="mb-1 text-center text-[9px] font-bold text-emerald-700">{tx('Live Preview','Live Preview')}</p><div className="h-24 overflow-hidden rounded"><DemoPhoto /></div></div></div>}
                  {feature.sample === 'download' && <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3">{['JPG','PNG','WEBP','ZIP'].map((format) => <span key={format} className="flex items-center justify-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-2 text-[10px] font-extrabold text-emerald-800"><Download className="h-3 w-3" />{format}</span>)}</div>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-10 sm:px-7">
        <div className="mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">{tx('Simple 4-Step Workflow', 'Simple 4-Step Workflow')}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{tx('इसे इस्तेमाल करना बहुत आसान है', 'A simple workflow to get started')}</h2>
            <div className="mt-5 space-y-3">
              {[
                [Upload, tx('फोटो और सिग्नेचर अपलोड करें', 'Upload your photo and signature')],
                [SlidersHorizontal, tx('Size, DPI और KB सेट करें', 'Set dimensions, DPI and target KB')],
                [CheckCircle2, tx('Preview देखकर Resize करें', 'Review the preview and resize')],
                [Download, tx('फाइल डाउनलोड या Print करें', 'Download files or open print preview')]
              ].map(([Icon, label], index) => {
                const StepIcon = Icon as React.ElementType;
                return <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><StepIcon className="h-4 w-4" /></span><span className="text-xs font-bold text-slate-700">{label as string}</span></div>;
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-sm">
            <div className="flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-emerald-600" /><div><h3 className="text-sm font-black text-slate-900">{tx('आपकी फाइलें आपके डिवाइस पर रहती हैं', 'Your files stay on your device')}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{tx('इस टूल में फोटो और सिग्नेचर आपके browser में locally process होते हैं।', 'Photos and signatures are processed locally in your browser by this tool.')}</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 text-center shadow-sm"><Smartphone className="mx-auto h-5 w-5 text-blue-600" /><p className="mt-2 text-[10px] font-extrabold text-slate-700">{tx('मोबाइल फ्रेंडली', 'Mobile friendly')}</p></div>
              <div className="rounded-xl bg-white p-3 text-center shadow-sm"><Monitor className="mx-auto h-5 w-5 text-blue-600" /><p className="mt-2 text-[10px] font-extrabold text-slate-700">{tx('कंप्यूटर रेडी', 'Desktop ready')}</p></div>
            </div>
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">{tx('ध्यान दें: ये केवल शुरुआती presets हैं, किसी सरकारी विभाग के आधिकारिक मानक नहीं। आवेदन से पहले संबंधित फॉर्म की नवीनतम शर्तें जाँचें।', 'Note: Presets are examples, not official department specifications. Check the latest requirements on the relevant form before submitting.')}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#07152f] px-4 py-10 text-white sm:px-7">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[.06] px-5 py-9 text-center shadow-2xl sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-slate-950"><Camera className="h-7 w-7" /></div>
          <h2 className="mt-4 text-2xl font-black sm:text-3xl">{tx('अब अपनी फोटो और सिग्नेचर तैयार करें!', 'Ready to prepare your photo and signature?')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-blue-100/80">{tx('अगले पेज पर एडिटर खुलेगा। वहाँ अपनी फाइल अपलोड करके सभी सेटिंग इस्तेमाल कर सकते हैं।', 'Open the editor on the next screen, upload your files and use the available settings.')}</p>
          <button type="button" onClick={onStart} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300">
            {tx('Start Editing', 'Start Editing')} <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-[10px] text-blue-100/60">{tx('TANSHU ONLINE · Photo & Signature Resizer', 'TANSHU ONLINE · Photo & Signature Resizer')}</p>
        </div>
      </section>
    </main>
  );
};
