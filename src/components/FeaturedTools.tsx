import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ToolItem } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { useLanguage } from '../context/LanguageContext';
import { getToolPreviewImage } from '../data/toolPreviewImages';

// Realistic preview images for the featured tools
import passportImg from '../assets/images/tool_passport_photos_1793211936275.jpg';
import autoCropperImg from '../assets/images/tool_auto_cropper_1793211936700.jpg';
import scannerImg from '../assets/images/tool_doc_scanner_rectifier_1793211938346.jpg';
import pvcCropperImg from '../assets/images/tool_pdf_to_pvc_cropper_1793211938406.jpg';
import idLayoutImg from '../assets/images/tool_id_front_back_layout_1793211939391.jpg';
import invoiceImg from '../assets/images/tool_invoice_generator_1793211940230.jpg';

interface Props {
  onOpenTool: (tool: ToolItem) => void;
}

export const FeaturedTools: React.FC<Props> = ({ onOpenTool }) => {
  const { t } = useLanguage();
  // Exactly the six featured tools from the confirmed tools list
  const featuredOrder = [
    'photo-signature-resizer',
    'advanced-passport-photo-studio',
    'auto-document-cropper',
    'document-scanner-image-rectifier',
    'pdf-to-pvc-card-auto-cropper',
    'id-card-front-back-print-layout-maker',
    'invoice-generator',
  ];
  const featuredTools = CONFIRMED_TOOLS
    .filter((tool) => tool.isFeatured)
    .sort((a, b) => featuredOrder.indexOf(a.id) - featuredOrder.indexOf(b.id))
    .slice(0, 7);

  const getToolImage = (id: string) => {
    switch (id) {
      case 'photo-signature-resizer':
        return getToolPreviewImage('photo-signature-resizer', 'Photo & Signature Resizer', 'Photo & Signature');
      case 'advanced-passport-photo-studio':
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
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              {t('featured.kicker', 'Popular Daily Utilities')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('featured.title', 'Featured Tools')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {t(
              'featured.desc',
              'Popular tools for photo resizing, photo printing, smart card preparation, document scanning, and retail billing.'
            )}
          </p>
        </div>

        {/* Featured tools; the new Photo & Signature Resizer appears first. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 sm:gap-4">
          {featuredTools.map((tool) => {
            const previewImg = getToolImage(tool.id);
            return (
              <div
                key={tool.id}
                className="bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none"
              >
                <div>
                  {/* Image-based preview in the upper section */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5 border border-slate-200/80 shadow-2xs">
                    <img
                      src={previewImg}
                      alt={tool.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Tool Title */}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight mb-1 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {tool.name}
                  </h3>

                  {/* Tool Description */}
                  <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {tool.description}
                  </p>
                </div>

                {/* Open Tool Button — Strictly preserved text, black default, blue hover */}
                <button
                  onClick={() => onOpenTool(tool)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto shadow-2xs"
                >
                  <span>{t('common.openTool', 'Open Tool')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
