import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ToolItem } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';

// Realistic preview images for the six featured tools
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
  // Exactly the six featured tools from the confirmed tools list
  const featuredTools = CONFIRMED_TOOLS.filter((t) => t.isFeatured).slice(0, 6);

  const getToolImage = (id: string) => {
    switch (id) {
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
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Popular Daily Utilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Tools
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            The six most frequently used tools for photo printing, smart card preparation, document scanning, and retail billing.
          </p>
        </div>

        {/* Exactly six featured tool cards in one row on desktop when screen permits (xl:grid-cols-6) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {featuredTools.map((tool) => {
            const previewImg = getToolImage(tool.id);
            return (
              <div
                key={tool.id}
                className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image-based preview in the upper section */}
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200/80 shadow-2xs">
                    <img
                      src={previewImg}
                      alt={tool.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Tool Title */}
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {tool.name}
                  </h3>

                  {/* Tool Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                </div>

                {/* Open Tool Button */}
                <button
                  onClick={() => onOpenTool(tool)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto"
                >
                  <span>Open Tool</span>
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
