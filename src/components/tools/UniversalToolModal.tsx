import React, { useEffect } from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';
import { ToolItem } from '../../types';
import { PassportPhotoTool } from './PassportPhotoTool';
import { AutoDocumentCropperTool } from './AutoDocumentCropperTool';
import { DocumentScannerTool } from './DocumentScannerTool';
import { PdfToPvcTool } from './PdfToPvcTool';
import { IdCardPrintLayoutTool } from './IdCardPrintLayoutTool';
import { InvoiceGeneratorTool } from './InvoiceGeneratorTool';
import { RationCardGuideTool } from './RationCardGuideTool';
import { PerspectiveCorrectionTool } from './PerspectiveCorrectionTool';
import { WhatsAppPhotoPrintTool } from './WhatsAppPhotoPrintTool';
import { PinCodeFinderTool } from './PinCodeFinderTool';
import { MultipleIdCardsPrintTool } from './MultipleIdCardsPrintTool';
import { AffidavitPrintTool } from './AffidavitPrintTool';
import {
  AiFaceCleanerTool,
  WatermarkRemoverTool,
  PvcCoverPrintTool,
  PdfPageOrganizerTool
} from './SpecializedTools';
import { GenericInteractiveTool } from './GenericInteractiveTool';

interface Props {
  tool: ToolItem | null;
  onClose: () => void;
}

export const UniversalToolModal: React.FC<Props> = ({ tool, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tool) return null;

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'passport-size-photo-maker':
      case 'ai-selfie-passport-photo-maker':
        return <PassportPhotoTool />;
      case 'auto-document-cropper':
        return <AutoDocumentCropperTool />;
      case 'document-scanner-image-rectifier':
        return <DocumentScannerTool />;
      case 'pdf-to-pvc-card-auto-cropper':
      case 'govt-id-card-print':
        return <PdfToPvcTool />;
      case 'id-card-front-back-print-layout-maker':
        return <IdCardPrintLayoutTool />;
      case 'invoice-generator':
        return <InvoiceGeneratorTool />;
      case 'new-ration-card':
        return <RationCardGuideTool />;
      case 'perspective-correction-tool':
        return <PerspectiveCorrectionTool />;
      case 'whatsapp-photo-print-alignment':
        return <WhatsAppPhotoPrintTool />;
      case 'ai-face-cleaner':
        return <AiFaceCleanerTool />;
      case 'watermark-remover':
        return <WatermarkRemoverTool />;
      case 'pvc-cover-print':
        return <PvcCoverPrintTool />;
      case 'pincode-finder':
        return <PinCodeFinderTool />;
      case 'multiple-id-cards-print':
        return <MultipleIdCardsPrintTool />;
      case 'affidavit-print-maker':
        return <AffidavitPrintTool />;
      case 'pdf-page-organizer':
        return <PdfPageOrganizerTool />;
      default:
        return <GenericInteractiveTool tool={tool} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <span>{tool.categoryLabel}</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side In-Browser Processing
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{tool.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Tool (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
          {/* Quick Tool Instructions / Description Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{tool.description}</p>
              <p className="text-blue-800 text-[11px] mt-0.5">{tool.detailedInstructions}</p>
            </div>
          </div>

          {/* Render Interactive Tool Engine */}
          {renderToolComponent()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TANSHU ONLINE</span>
            <span>·</span>
            <span>Zero files or citizen documents are uploaded to cloud servers.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
