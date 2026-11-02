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

const StudioSamplePreview: React.FC = () => (
  <div className="h-full w-full overflow-hidden bg-slate-100">
    <img src={passportImg} alt="Passport photo studio sample" className="h-full w-full object-cover object-center" />
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
