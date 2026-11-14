import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Info, ArrowLeft } from 'lucide-react';
import { TANSHU_PROFILE_PHOTO } from '../Header';
import { ToolItem } from '../../types';
import { PassportPhotoTool } from './PassportPhotoTool';
import { AdvancedPassportPhotoStudio } from './AdvancedPassportPhotoStudio';
import { AdvancedPassportPhotoStudioWelcome } from './AdvancedPassportPhotoStudioWelcome';
import { PhotoSignatureResizerTool } from './PhotoSignatureResizerTool';
import { PhotoSignatureResizerWelcome } from './PhotoSignatureResizerWelcome';
import { AutoDocumentCropperTool } from './AutoDocumentCropperTool';
import { DocumentScannerTool } from './DocumentScannerTool';
import { PhotoBackgroundRemoverTool } from './PhotoBackgroundRemoverTool';
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
  const [showAdvancedStudio, setShowAdvancedStudio] = useState(false);
  const [showPhotoSignatureStudio, setShowPhotoSignatureStudio] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tool) return null;

  const isAdvancedStudio = tool.id === 'advanced-passport-photo-studio';
  const isPhotoSignatureResizer = tool.id === 'photo-signature-resizer';
  const isAutoDocumentCropper = tool.id === 'auto-document-cropper';
  const isPhotoBackgroundRemover = tool.id === 'photo-background-remover';
  const isImmersiveTool = isAdvancedStudio || isPhotoSignatureResizer || isAutoDocumentCropper || isPhotoBackgroundRemover;
  const showWelcome = (isAdvancedStudio && !showAdvancedStudio) || (isPhotoSignatureResizer && !showPhotoSignatureStudio);

  const renderToolComponent = () => {
    switch (tool.id) {
      case 'advanced-passport-photo-studio':
        return showAdvancedStudio
          ? <AdvancedPassportPhotoStudio onBack={onClose} />
          : <AdvancedPassportPhotoStudioWelcome onStart={() => setShowAdvancedStudio(true)} />;
      case 'photo-signature-resizer':
        return showPhotoSignatureStudio
          ? <PhotoSignatureResizerTool onBack={onClose} />
          : <PhotoSignatureResizerWelcome onStart={() => setShowPhotoSignatureStudio(true)} onBack={onClose} />;
      case 'ai-selfie-passport-photo-maker':
        return <PassportPhotoTool />;
      case 'auto-document-cropper':
        return <AutoDocumentCropperTool />;
      case 'document-scanner-image-rectifier':
        return <DocumentScannerTool />;
      case 'photo-background-remover':
        return <PhotoBackgroundRemoverTool />;
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
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center ${isImmersiveTool ? 'p-0' : 'p-3 sm:p-6'}`}>
      <div className={`relative w-full bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${isImmersiveTool ? 'max-w-none h-[100dvh] max-h-[100dvh] rounded-none border-0' : 'max-w-6xl rounded-2xl my-auto max-h-[92vh]'}`}>
        {isAutoDocumentCropper ? (
          <div className="flex min-h-[70px] shrink-0 items-center justify-between gap-3 border-b border-blue-950/80 bg-gradient-to-r from-[#071426] via-[#102746] to-[#123B5A] px-4 py-2.5 text-white sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <img src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" className="h-10 w-10 shrink-0 rounded-full border-2 border-cyan-300/80 object-cover" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-black tracking-wide sm:text-base">TANSHU <span className="text-cyan-300">ONLINE</span></span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />I'm Online</span>
                </div>
                <div className="text-[11px] font-semibold text-blue-100 sm:text-xs">Auto Document Cropper Studio · Browser-side processing · 4-Corner Crop · Document Framing · HD Image Export</div>
              </div>
            </div>
            <button onClick={onClose} className="shrink-0 rounded-lg p-2 text-blue-100 hover:bg-white/10 hover:text-white" title="Close Tool (Esc)"><X className="h-5 w-5" /></button>
          </div>
        ) : isPhotoBackgroundRemover ? null : (
          <div className={`flex items-center justify-between border-b border-slate-200 bg-white shrink-0 ${isImmersiveTool ? 'px-4 sm:px-7 py-3 sm:py-4' : 'px-6 py-4'}`}>
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <span>{tool.categoryLabel}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {isImmersiveTool ? 'Browser-side processing' : '100% Client-Side In-Browser Processing'}
                  </span>
                </div>
                {!isImmersiveTool && <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{tool.name}</h3>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Close Tool (Esc)">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div data-copy-allowed="true" className={`${isAdvancedStudio ? (showWelcome ? 'min-h-0 overflow-y-auto' : 'min-h-0 overflow-hidden') : (isAutoDocumentCropper || isPhotoBackgroundRemover) ? 'min-h-0 overflow-hidden' : 'min-h-0 overflow-y-auto'} flex-1 space-y-6 ${isAdvancedStudio ? (showWelcome ? 'p-0 bg-slate-50' : 'p-3 sm:p-5 lg:p-6 bg-slate-50') : (isAutoDocumentCropper || isPhotoBackgroundRemover) ? 'min-h-0 p-0 bg-[#081629]' : isPhotoSignatureResizer ? 'p-0 bg-slate-50' : 'p-6 bg-white'}`}>
          {isImmersiveTool ? (
            renderToolComponent()
          ) : (
            <>
              <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{tool.description}</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">{tool.detailedInstructions}</p>
                </div>
              </div>
              {renderToolComponent()}
            </>
          )}
        </div>

        {!isAutoDocumentCropper && !isPhotoBackgroundRemover && <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {((isAdvancedStudio && showAdvancedStudio) || (isPhotoSignatureResizer && showPhotoSignatureStudio)) && (
            <button
              type="button"
              onClick={() => {
                if (isAdvancedStudio) window.setTimeout(() => setShowAdvancedStudio(false), 600);
                if (isPhotoSignatureResizer) setShowPhotoSignatureStudio(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:border-slate-800 hover:bg-slate-800 hover:text-white hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              title="Return to Live Demo"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Demo
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TANSHU ONLINE</span><span>·</span>
            <span>{isPhotoSignatureResizer ? 'Photo and signature files are processed locally in your browser.' : isAdvancedStudio ? 'Photos are processed in your browser in this studio.' : 'Zero files or citizen documents are uploaded to cloud servers.'}</span>
          </div>
          <button onClick={onClose} className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors">Close Workspace</button>
        </div>}
      </div>
    </div>
  );
};
