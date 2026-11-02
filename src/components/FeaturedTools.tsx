import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { ToolItem } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { useLanguage } from '../context/LanguageContext';

import passportImg from '../assets/images/tool_passport_photos_1793211936275.jpg';
import autoCropperImg from '../assets/images/tool_auto_cropper_1793211936700.jpg';
import scannerImg from '../assets/images/tool_doc_scanner_rectifier_1793211938346.jpg';
import pvcCropperImg from '../assets/images/tool_pdf_to_pvc_cropper_1793211938406.jpg';
import idLayoutImg from '../assets/images/tool_id_front_back_layout_1793211939391.jpg';
import invoiceImg from '../assets/images/tool_invoice_generator_1793211940230.jpg';

const StudioSamplePortrait: React.FC<{ variant: 'boy' | 'girl' }> = ({ variant }) => {
  const girl = variant === 'girl';
  return (
    <svg viewBox="0 0 180 220" role="img" aria-label={girl ? 'Indian girl sample passport portrait' : 'Indian boy sample passport portrait'} className="h-full w-full">
      <defs>
        <linearGradient id={"studio-bg-" + variant} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={girl ? '#fff1e8' : '#e8f4ff'} />
          <stop offset="100%" stopColor={girl ? '#f9d8e5' : '#c7e3f7'} />
        </linearGradient>
        <linearGradient id={"studio-shirt-" + variant} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={girl ? '#e8799c' : '#2876b9'} />
          <stop offset="100%" stopColor={girl ? '#b83f72' : '#174b83'} />
        </linearGradient>
      </defs>
      <rect width="180" height="220" rx="12" fill={"url(#studio-bg-" + variant + ")"} />
      <circle cx="90" cy="82" r="62" fill="#ffffff" opacity=".24" />
      <path d="M18 220 Q24 160 65 150 L115 150 Q156 160 162 220Z" fill={"url(#studio-shirt-" + variant + ")"} />
      <path d="M70 132 L110 132 L116 164 Q90 181 64 164Z" fill="#b87952" />
      {girl ? (
        <g>
          <path d="M42 91 Q28 15 90 17 Q153 16 138 99 L132 139 Q119 157 108 149 L111 61 Q91 78 59 60 L62 145 Q48 150 39 130Z" fill="#241b1b" />
          <path d="M48 76 Q48 38 90 35 Q132 38 132 76 L126 113 Q119 143 90 145 Q61 143 54 113Z" fill="#c9855b" />
          <path d="M48 78 Q52 27 90 28 Q132 29 132 77 Q113 58 91 58 Q69 58 48 78Z" fill="#241b1b" />
          <path d="M61 87 Q72 81 81 87 M99 87 Q108 81 119 87" fill="none" stroke="#3a211c" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="72" cy="98" rx="5" ry="6" fill="#211a18" /><ellipse cx="108" cy="98" rx="5" ry="6" fill="#211a18" />
          <circle cx="90" cy="76" r="4" fill="#c83b55" />
          <path d="M88 101 L84 116 Q90 120 96 116" fill="none" stroke="#9e5f43" strokeWidth="3" strokeLinecap="round" />
          <path d="M76 128 Q90 136 104 128" fill="none" stroke="#8d3e3b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="112" r="5" fill="#f5c64b" stroke="#d69c22" strokeWidth="2" /><circle cx="132" cy="112" r="5" fill="#f5c64b" stroke="#d69c22" strokeWidth="2" />
          <path d="M62 151 L90 174 L118 151" fill="none" stroke="#fff4f7" strokeWidth="8" />
        </g>
      ) : (
        <g>
          <path d="M43 82 Q35 23 90 20 Q145 23 137 82 L129 111 Q121 134 109 133 L111 61 Q90 73 65 61 L66 133 Q50 132 45 109Z" fill="#211a19" />
          <path d="M49 75 Q49 35 90 34 Q131 35 131 75 L125 111 Q118 139 90 141 Q62 139 55 111Z" fill="#c9855b" />
          <path d="M48 76 Q50 28 90 27 Q130 28 132 76 Q114 59 91 59 Q68 59 48 76Z" fill="#211a19" />
          <path d="M62 88 Q72 82 82 88 M98 88 Q108 82 118 88" fill="none" stroke="#3a211c" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="72" cy="99" rx="5" ry="6" fill="#211a18" /><ellipse cx="108" cy="99" rx="5" ry="6" fill="#211a18" />
          <path d="M88 102 L84 116 Q90 120 96 116" fill="none" stroke="#9e5f43" strokeWidth="3" strokeLinecap="round" />
          <path d="M76 128 Q90 135 104 128" fill="none" stroke="#8d3e3b" strokeWidth="4" strokeLinecap="round" />
          <path d="M69 151 L90 174 L111 151" fill="#ffffff" />
          <path d="M90 174 L90 220" stroke="#dbeafe" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
};

const StudioSamplePreview: React.FC = () => (
  <div className="relative grid h-full grid-cols-2 gap-1.5 bg-gradient-to-br from-slate-100 to-blue-50 p-2.5">
    <div className="relative min-w-0 overflow-hidden rounded-lg border border-white/90 bg-white shadow-md">
      <StudioSamplePortrait variant="boy" />
      <span className="absolute bottom-1 left-1 right-1 rounded-md bg-white/90 px-1 py-0.5 text-center text-[9px] font-bold text-slate-700">INDIAN BOY</span>
    </div>
    <div className="relative min-w-0 overflow-hidden rounded-lg border border-white/90 bg-white shadow-md">
      <StudioSamplePortrait variant="girl" />
      <span className="absolute bottom-1 left-1 right-1 rounded-md bg-white/90 px-1 py-0.5 text-center text-[9px] font-bold text-slate-700">INDIAN GIRL</span>
    </div>
    <span className="absolute right-3 top-3 rounded-full bg-blue-700 px-2 py-1 text-[9px] font-extrabold tracking-wide text-white shadow">A4 · 8 + 8</span>
  </div>
);

interface Props {
  onOpenTool: (tool: ToolItem) => void;
}

const advancedPassportStudio: ToolItem = {
  id: 'advanced-passport-photo-studio',
  name: 'Advanced Passport Photo Studio',
  category: 'photo',
  categoryLabel: 'Photo & Signature',
  isFeatured: true,
  iconName: 'Camera',
  description: 'Advanced photo studio for multiple passport photos, precise crop, signature editing and print-ready 4×6 / A4 sheets.',
  detailedInstructions: 'Upload one or more photos, select the required document size, adjust each photo, edit a signature and export a single photo or print sheet.',
  keyFeatures: [
    'Multiple photos with independent crop and adjustment settings',
    'Passport, stamp, PAN and custom dimensions',
    'Signature crop, background and photo overlay',
    '4×6 and A4 print sheets with manual layout and PDF export'
  ]
};

export const FeaturedTools: React.FC<Props> = ({ onOpenTool }) => {
  const { t } = useLanguage();
  // Keep the new studio first; preserve the next five existing featured tools.
  const featuredTools = [advancedPassportStudio, ...CONFIRMED_TOOLS.filter((item) => item.isFeatured && item.id !== 'passport-size-photo-maker').slice(0, 5)];

  const getToolImage = (id: string) => {
    switch (id) {
      case 'advanced-passport-photo-studio':
      case 'passport-size-photo-maker':
        return passportImg;
      case 'auto-document-cropper':
        return autoCropperImg;
      case 'document-scanner-image-rectifier':
        return scannerImg;
      case 'pdf-to-pvc-card-auto-cropper':
        return pvcCropperImg;
      case 'id-card-front-back-print-layout-maker':
        return idLayoutImg;
      case 'invoice-generator':
        return invoiceImg;
      default:
        return passportImg;
    }
  };

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              {t('featured.kicker', 'Popular Daily Utilities')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Future Tools
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {t('featured.desc', 'Useful tools for photo printing, smart card preparation, document scanning, and retail billing.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {featuredTools.map((tool, index) => {
            const previewImg = getToolImage(tool.id);
            return (
              <div
                key={tool.id}
                className={`relative bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none ${index === 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200/90'}`}
              >
                {index === 0 && <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white shadow"><Sparkles className="h-3 w-3" /> NEW STUDIO</div>}
                <div>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5 border border-slate-200/80 shadow-2xs">
                    {tool.id === 'advanced-passport-photo-studio'
                      ? <StudioSamplePreview />
                      : <img src={previewImg} alt={tool.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />}
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight mb-1 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">{tool.name}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{tool.description}</p>
                </div>
                <button onClick={() => onOpenTool(tool)} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto shadow-2xs">
                  <span>Open Tool</span><ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
