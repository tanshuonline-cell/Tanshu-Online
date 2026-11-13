import React from 'react';
import { ArrowUpRight, Camera, CreditCard, Image as ImageIcon, ScanLine, Crop, MessageCircle, Smartphone, UserRound } from 'lucide-react';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { ToolItem } from '../types';
import { getToolPreviewImage } from '../data/toolPreviewImages';

interface Props {
  onOpenTool: (tool: ToolItem) => void;
}

const ACTIVE_TOOL_IDS = [
  'photo-signature-resizer',
  'document-scanner-image-rectifier',
  'auto-document-cropper',
];

const TOOL_DETAILS: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  'photo-signature-resizer': {
    title: 'PHOTO & SIGNATURE RESIZER',
    subtitle: 'Set Photo Size &amp; KB · Resize Signature · JPG / PNG · Preview &amp; Download | फोटो का साइज व KB सेट करें · सिग्नेचर रिसाइज़ करें · प्रीव्यू व डाउनलोड',
    icon: <ImageIcon className="h-4 w-4" />,
  },
  'auto-document-cropper': {
    title: 'AUTO DOCUMENT CROPPER',
    subtitle: 'Detect Document Edges · Auto Crop &amp; Straighten · Fine-Tune Corners · PNG / PDF Download | किनारे पहचानें · ऑटो क्रॉप व सीधा करें · कोने ठीक करें · डाउनलोड करें',
    icon: <Crop className="h-4 w-4" />,
  },
  'document-scanner-image-rectifier': {
    title: 'DOCUMENT SCANNER & IMAGE RECTIFIER',
    subtitle: 'Scan Document · Fix Perspective · B&amp;W / Magic Color · Under-200 KB Compression | डॉक्यूमेंट स्कैन · टेढ़ापन ठीक करें · ब्लैक-व्हाइट / मैजिक कलर · 200 KB से कम कम्प्रेशन',
    icon: <ScanLine className="h-4 w-4" />,
  },
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
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            Available to Use
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img src={getToolPreviewImage('instant-passport-photo-studio', 'Instant Passport Photo Studio', 'Photo Studio')} alt="Instant Passport Photo Studio" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-rose-700"><Camera className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT PASSPORT PHOTO STUDIO</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Upload Photo · Smart Crop &amp; Adjust · Signature Edit · 4×6 / A4 Print Sheet | फोटो अपलोड · स्मार्ट क्रॉप · सिग्नेचर एडिट · प्रिंट शीट</p>
              <a href="/advanced-photo-studio-preview" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-900">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={pvcPreview} alt="PVC Card Studio front and back print preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /></div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-amber-700"><CreditCard className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT PVC CARD MAKER</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Smart Crop · Front &amp; Back · A4 Sheet · Print Setup</p>
              <a href="/id-pvc-studio/premium-desktop-preview.html" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          {activeTools.map((tool) => {
            const details = TOOL_DETAILS[tool.id];
            const preview = getToolPreviewImage(tool.id, tool.name, tool.categoryLabel);
            return (
              <React.Fragment key={tool.id}>
              <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={preview} alt={details?.title || tool.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="mb-2 flex items-center gap-2 text-rose-700">
                    {details?.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wide">Ready to use</span>
                  </div>
                  <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">{details?.title || tool.name}</h3>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">{details?.subtitle || tool.description}</p>
                  <button type="button" onClick={() => onOpenTool(tool)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-900">
                    Open Tool <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
              {tool.id === 'photo-signature-resizer' && (
                <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl">
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-100 p-4">
                    <div className="relative flex h-[88%] w-[42%] items-center justify-center rounded-[1.35rem] border-[5px] border-slate-800 bg-white shadow-xl">
                      <div className="absolute left-1/2 top-2 h-1 w-7 -translate-x-1/2 rounded-full bg-slate-300" />
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[0.9rem] bg-gradient-to-b from-slate-50 to-emerald-50 pt-3">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><UserRound className="h-9 w-9" /></span>
                        <span className="h-2 w-16 rounded-full bg-slate-300" />
                        <span className="h-2 w-11 rounded-full bg-slate-200" />
                      </div>
                      <span className="absolute -right-7 bottom-5 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-white shadow-lg"><MessageCircle className="h-6 w-6" /></span>
                      <span className="absolute -left-7 top-7 flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md"><Camera className="h-5 w-5" /></span>
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-md bg-emerald-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">SELFIE → PASSPORT</span>
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="mb-2 flex items-center gap-2 text-emerald-700"><Smartphone className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
                    <h3 className="mb-1 text-sm font-extrabold uppercase leading-snug text-slate-900">WhatsApp Selfie to Passport Photo</h3>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Create a passport-style photo from a selfie with a guided crop and face-alignment workflow.</p>
                    <a href="/whatsapp-selfie-passport-photo" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
                  </div>
                </article>
              )}
              {tool.id === 'photo-signature-resizer' && (
                <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={getToolPreviewImage('instant-multi-customer-photo-maker', 'Instant Multi Customer Photo Maker', 'Photo Studio')}
                      alt="Instant Multi Customer Photo Maker preview"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="mb-2 flex items-center gap-2 text-sky-700"><Camera className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
                    <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">INSTANT MULTI CUSTOMER PHOTO MAKER</h3>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Add Multiple Customers · Edit Photos in One Workspace · Batch Preparation · Print-Ready Layouts | कई ग्राहक जोड़ें · एक ही जगह फोटो एडिट करें · बैच में तैयार करें · प्रिंट लेआउट</p>
                    <a href="/instant-multi-customer-photo-maker" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-sky-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
                  </div>
                </article>
              )}
              </React.Fragment>
            );
          })}


        </div>
      </div>
    </section>
  );
};
