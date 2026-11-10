import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ToolItem } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { TOOL_HINDI_TRANSLATIONS } from '../data/toolTranslations';
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
  const { t, isHindi } = useLanguage();
  // Exactly the six featured tools from the confirmed tools list
  const featuredOrder = [
    'advanced-passport-photo-studio',
    'pdf-to-pvc-card-auto-cropper',
    'photo-signature-resizer',
    'pdf-ocr-text-extractor',
    'auto-document-cropper',
    'document-scanner-image-rectifier',
    'id-card-front-back-print-layout-maker',
    'invoice-generator',
  ];
  const featuredTools = CONFIRMED_TOOLS
    .filter((tool) => tool.isFeatured)
    .sort((a, b) => featuredOrder.indexOf(a.id) - featuredOrder.indexOf(b.id))
    .slice(0, 8);

  const getToolImage = (id: string) => {
    switch (id) {
      case 'multiple-id-cards-print':
        return getToolPreviewImage('multiple-id-cards-print', 'Multiple ID Cards Print on A4 (5-in-1)', 'ID Card & Print');
      case 'pdf-ocr-text-extractor':
        return getToolPreviewImage('pdf-ocr-text-extractor', 'PDF OCR & Text Extractor (Hindi & Eng)', 'PDF Tools');
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
      <style>{`
@keyframes premium-border-flow { 0% { background-position: -110% 0, 110% 100%, 0 110%, 100% -110%; } 100% { background-position: 110% 0, -110% 100%, 0 -110%, 100% 110%; } }
@keyframes premium-halo-pulse { from { opacity: .32; filter: blur(10px); } to { opacity: .68; filter: blur(16px); } }
.future-tool-glow, .video49-active-glow { position: relative; isolation: isolate; border-color: rgba(103,232,249,.78) !important; box-shadow: 0 0 0 1px rgba(103,232,249,.16), 0 0 22px rgba(34,211,238,.18), 0 0 38px rgba(168,85,247,.12); }
.future-tool-glow::before, .video49-active-glow::before { content: ""; position: absolute; inset: -5px; z-index: -1; border-radius: inherit; background: linear-gradient(115deg, rgba(34,211,238,.62), rgba(167,139,250,.52), rgba(244,114,182,.42), rgba(56,189,248,.58)); animation: premium-halo-pulse 3.6s ease-in-out infinite alternate; pointer-events: none; }
.future-tool-glow::after, .video49-active-glow::after { content: ""; position: absolute; inset: 0; z-index: 3; border-radius: inherit; padding: 2px; background-image: linear-gradient(90deg, transparent 0%, rgba(34,211,238,.98) 24%, rgba(167,139,250,.98) 62%, transparent 100%), linear-gradient(270deg, transparent 0%, rgba(244,114,182,.98) 28%, rgba(56,189,248,.98) 70%, transparent 100%), linear-gradient(180deg, transparent 0%, rgba(167,139,250,.98) 28%, rgba(34,211,238,.98) 70%, transparent 100%), linear-gradient(0deg, transparent 0%, rgba(103,232,249,.98) 28%, rgba(192,132,252,.98) 70%, transparent 100%); background-size: 220% 2px, 220% 2px, 2px 220%, 2px 220%; background-position: -110% 0, 110% 100%, 0 110%, 100% -110%; background-repeat: no-repeat; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: premium-border-flow 5.2s linear infinite; pointer-events: none; }
.future-tool-glow:hover, .video49-active-glow:hover { box-shadow: 0 0 0 1px rgba(103,232,249,.28), 0 0 30px rgba(34,211,238,.28), 0 0 44px rgba(192,132,252,.18); }
@media (prefers-reduced-motion: reduce) { .future-tool-glow::before, .video49-active-glow::before, .future-tool-glow::after, .video49-active-glow::after { animation: none; } }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#C62828] mb-1">
              {t('featured.kicker', 'Popular Daily Utilities')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#C62828] tracking-tight">
              {t('featured.title', 'Featured Tools')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {t(
              'featured.desc',
              'Popular tools for photo resizing, photo printing, smart card preparation, document scanning, and retail billing.'
            )}
          </p>
          <a
            href="https://52868321.tanshu-online.pages.dev/digital-seva"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C62828]/20 bg-white px-3 py-2 text-xs font-bold text-[#C62828] shadow-sm transition-colors hover:bg-red-50 whitespace-nowrap"
          >
            Tanshu Digital Center <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Featured tools; the new Photo & Signature Resizer appears first. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 sm:gap-4">
          {featuredTools.map((tool) => {
            const previewImg = getToolImage(tool.id);
            const hindiCopy = isHindi ? TOOL_HINDI_TRANSLATIONS[tool.id] : undefined;
            const displayName = tool.id === 'pdf-to-pvc-card-auto-cropper'
              ? 'Multi-Printer Auto Print'
              : (hindiCopy?.name || tool.name);
            const displayDescription = hindiCopy?.description || tool.description;
            const isActiveFutureTool = tool.id === 'advanced-passport-photo-studio' || tool.id === 'photo-signature-resizer';
            return (
              <div
                key={tool.id}
                className={`bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-xl hover:border-red-300 hover:-translate-y-1.5 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none ${isActiveFutureTool ? "future-tool-glow" : ""}`}
              >
                <div>
                  {/* Image-based preview in the upper section */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5 border border-slate-200/80 shadow-2xs">
                    <img
                      src={previewImg}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Tool Title */}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight mb-1 line-clamp-2 leading-snug group-hover:text-[#C62828] transition-colors">
                    {displayName}
                  </h3>

                  {/* Tool Description */}
                  <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {displayDescription}
                  </p>
                </div>

                {/* Open Tool Button — Strictly preserved text, black default, blue hover */}
                <button
                  onClick={() => onOpenTool(tool)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#C62828] hover:bg-[#A61F2A] text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto shadow-2xs"
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
