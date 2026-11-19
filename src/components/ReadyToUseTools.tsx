import React from 'react';
import { ArrowUpRight, Camera, CreditCard, Image as ImageIcon, ScanLine, Crop, Smartphone, Eraser } from 'lucide-react';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { ToolItem } from '../types';
import { getToolPreviewImage } from '../data/toolPreviewImages';

interface Props {
  onOpenTool: (tool: ToolItem) => void;
}

const ACTIVE_TOOL_IDS = [
  'photo-signature-resizer',
  'auto-document-cropper',
  'photo-background-remover',
];

const TOOL_DETAILS: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  'photo-signature-resizer': { title: 'PHOTO & SIGNATURE RESIZER', subtitle: 'Set Photo Size & KB · Resize Signature · JPG / PNG · Preview & Download | फोटो का साइज व KB सेट करें · सिग्नेचर रिसाइज़ करें · प्रीव्यू व डाउनलोड', icon: <ImageIcon className="h-4 w-4" /> },
  'auto-document-cropper': { title: 'AUTO DOCUMENT CROPPER', subtitle: 'Detect Document Edges · Auto Crop & Straighten · Fine-Tune Corners · PNG / PDF Download | किनारे पहचानें · ऑटो क्रॉप व सीधा करें · कोने ठीक करें · डाउनलोड करें', icon: <Crop className="h-4 w-4" /> },
  'document-scanner-image-rectifier': { title: 'DOCUMENT SCANNER & IMAGE RECTIFIER', subtitle: 'Scan Document · Fix Perspective · B&W / Magic Color · Under-200 KB Compression | डॉक्यूमेंट स्कैन · टेढ़ापन ठीक करें · ब्लैक-व्हाइट / मैजिक कलर · 200 KB से कम कम्प्रेशन', icon: <ScanLine className="h-4 w-4" /> },
  'photo-background-remover': { title: 'PHOTO BACKGROUND REMOVER', subtitle: 'Upload Photo · One-Click AI Background Removal · Transparent / Custom Color · 300 DPI Download | फोटो अपलोड · एक क्लिक में बैकग्राउंड हटाएँ · ट्रांसपेरेंट / मनपसंद रंग · डाउनलोड', icon: <Eraser className="h-4 w-4" /> },
};

export const ReadyToUseTools: React.FC<Props> = ({ onOpenTool }) => {
  const activeTools = ACTIVE_TOOL_IDS
    .map((id) => CONFIRMED_TOOLS.find((tool) => tool.id === id))
    .filter((tool): tool is ToolItem => Boolean(tool));

  const pvcPreview = getToolPreviewImage(
    'id-card-front-back-print-layout-maker',
    'PVC Card Studio',
    'ID Card & Print',
  );

  return (
    <section className="border-b border-slate-200 bg-white py-10 sm:py-12" aria-labelledby="ready-tools-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-rose-700">
              TANSHU ONLINE · LIVE NOW
            </p>
            <h2 id="ready-tools-title" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              CSC &amp; CYBER CAFE TOOLKITS
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Essential digital service, cyber cafe and document tools — all in one place.
            </p>
            <a href="/csc-cyber-cafe-toolkits" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-800 underline-offset-4 hover:underline">Explore all 7 CSC &amp; Cyber Cafe tools <ArrowUpRight className="h-3 w-3" /></a>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Available to Use
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img src={'data:image/jpeg;base64,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'} alt="Instant Passport Photo Studio" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-rose-700"><Camera className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT PASSPORT PHOTO STUDIO</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600"><span className="block">Upload Photo · Smart Crop &amp; Adjust · Signature Edit · 4×6 / A4 Print Sheet</span><span className="mt-1 block text-[10px] leading-relaxed">फोटो अपलोड · स्मार्ट क्रॉप · सिग्नेचर एडिट · प्रिंट शीट</span></p>
              <a href="/advanced-photo-studio-preview" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-900">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={pvcPreview} alt="Instant PVC Card Maker front and back print preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /></div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-amber-700"><CreditCard className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT PVC CARD MAKER</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600"><span className="block">Smart Crop · Front &amp; Back · A4 Sheet · Print Setup</span><span className="mt-1 block text-[10px] leading-relaxed">स्मार्ट क्रॉप · फ्रंट और बैक · A4 शीट · प्रिंट सेटअप</span></p>
              <a href="/id-pvc-studio/premium-desktop-preview.html" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={getToolPreviewImage('whatsapp-selfie-passport-photo', 'WhatsApp Selfie to Passport Photo', 'Photo Studio')} alt="WhatsApp Selfie to Passport Photo" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /></div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-emerald-700"><Smartphone className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">WHATSAPP SELFIE TO PASSPORT PHOTO</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600"><span className="block">Create a passport-style photo from a selfie with guided crop and face alignment.</span><span className="mt-1 block text-[10px] leading-relaxed">सेल्फी से पासपोर्ट फोटो बनाएँ · सही क्रॉप और फेस अलाइनमेंट</span></p>
              <a href="/whatsapp-selfie-passport-photo" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={getToolPreviewImage('instant-multi-customer-photo-maker', 'Instant Multi Customer Photo Maker', 'Photo Studio')} alt="Instant Multi Customer Photo Maker" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /></div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-sky-700"><Camera className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT MULTI CUSTOMER PHOTO MAKER</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600"><span className="block">Add Multiple Customers · Edit Photos in One Workspace · Batch Preparation · Print-Ready Layouts</span><span className="mt-1 block text-[10px] leading-relaxed">कई ग्राहक जोड़ें · एक जगह फोटो एडिट करें · बैच तैयारी · प्रिंट लेआउट</span></p>
              <a href="/instant-multi-customer-photo-maker" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-sky-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          {activeTools.map((tool) => {
            const details = TOOL_DETAILS[tool.id];
            const preview = getToolPreviewImage(tool.id, tool.name, tool.categoryLabel);
            return (
              <article key={tool.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={preview} alt={details?.title || tool.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="mb-2 flex items-center gap-2 text-rose-700">
                    {details?.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wide">Ready to use</span>
                  </div>
                  <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">{details?.title || tool.name}</h3>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600"><span className="block">{details?.subtitle?.split(' | ')[0] || tool.description}</span>{details?.subtitle?.includes(' | ') && <span className="mt-1 block text-[10px] leading-relaxed">{details.subtitle.split(' | ')[1]}</span>}</p>
                  <button type="button" onClick={() => onOpenTool(tool)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-900">
                    Open Tool <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}


        </div>
      </div>
    </section>
  );
};
