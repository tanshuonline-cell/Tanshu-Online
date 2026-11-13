import React from 'react';
import { ArrowUpRight, Camera, CreditCard, Image as ImageIcon, ScanLine, Crop } from 'lucide-react';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { ToolItem } from '../types';
import { getToolPreviewImage } from '../data/toolPreviewImages';

interface Props {
  onOpenTool: (tool: ToolItem) => void;
}

const ACTIVE_TOOL_IDS = [
  'photo-signature-resizer',
  'auto-document-cropper',
  'document-scanner-image-rectifier',
];

const TOOL_DETAILS: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  'photo-signature-resizer': {
    title: 'Photo & Signature Resizer',
    subtitle: 'Resize, compress and prepare photos and signatures for online forms.',
    icon: <ImageIcon className="h-4 w-4" />,
  },
  'auto-document-cropper': {
    title: 'Auto Document Cropper',
    subtitle: 'Automatically crop, straighten and enhance document photos.',
    icon: <Crop className="h-4 w-4" />,
  },
  'document-scanner-image-rectifier': {
    title: 'Document Scanner & Image Rectifier',
    subtitle: 'Correct perspective and create clean document scans.',
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
              CSC ToolKit
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Everyday Digital Tools for CSC &amp; Cyber Cafés
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
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">Instant Passport Photo Studio</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Professional passport photo editing, positioning and print-ready sheets.</p>
              <a href="/advanced-photo-studio-preview" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-rose-900">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
            </div>
          </article>
          <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 via-white to-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100"><img src={pvcPreview} alt="PVC Card Studio front and back print preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /></div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-center gap-2 text-amber-700"><CreditCard className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-wide">New Studio</span></div>
              <h3 className="mb-1 text-sm font-extrabold leading-snug text-slate-900">PVC Card Studio</h3>
              <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">Smart Crop · Front &amp; Back · A4 Sheet · Print Setup</p>
              <a href="/id-pvc-studio/premium-desktop-preview.html" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-amber-800">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></a>
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
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-600">{details?.subtitle || tool.description}</p>
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
