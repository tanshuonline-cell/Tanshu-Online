import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Printer, RefreshCw, Scissors, Sparkles } from 'lucide-react';

export const IdCardPrintLayoutTool: React.FC = () => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'side-by-side' | 'stacked'>('side-by-side');
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'A4'>('4x6');
  const [cardGapMm, setCardGapMm] = useState<number>(4);
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [addLaminationMargin, setAddLaminationMargin] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 300 DPI: 1 inch = 300px; 1 mm = 11.811 px
    const pxPerMm = 11.811;
    const is4x6 = paperFormat === '4x6';
    
    // Canvas dimensions: 4x6 inch = 1200 x 1800 px (or 1800 x 1200 in landscape)
    canvas.width = is4x6 ? 1800 : 2480;
    canvas.height = is4x6 ? 1200 : 3508;

    // Fill white paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Standard CR80 ID card size: 85.6 mm x 53.98 mm
    const cardW = Math.round(85.6 * pxPerMm); // ~1011 px
    const cardH = Math.round(53.98 * pxPerMm); // ~638 px
    const gapPx = Math.round(cardGapMm * pxPerMm);

    // Calculate center placement
    let totalW = 0;
    let totalH = 0;

    if (layoutMode === 'side-by-side') {
      totalW = cardW * 2 + gapPx;
      totalH = cardH;
    } else {
      totalW = cardW;
      totalH = cardH * 2 + gapPx;
    }

    const startX = Math.round((canvas.width - totalW) / 2);
    const startY = Math.round((canvas.height - totalH) / 2);

    const frontX = startX;
    const frontY = startY;

    const backX = layoutMode === 'side-by-side' ? startX + cardW + gapPx : startX;
    const backY = layoutMode === 'side-by-side' ? startY : startY + cardH + gapPx;

    const drawCard = (imgSrc: string | null, x: number, y: number, label: string) => {
      // Draw white card base
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, cardW, cardH);

      if (imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        if (img.complete) {
          ctx.drawImage(img, x, y, cardW, cardH);
        } else {
          img.onload = () => {
            ctx.drawImage(img, x, y, cardW, cardH);
          };
        }
      } else {
        // Empty state guide
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(x, y, cardW, cardH);
        
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardW, cardH);

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 36px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + cardW / 2, y + cardH / 2 - 20);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '24px Plus Jakarta Sans, sans-serif';
        ctx.fillText('CR80 Standard (85.6 × 54 mm)', x + cardW / 2, y + cardH / 2 + 25);
      }

      // Outer Card Hairline Border
      if (borderWidth > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = borderWidth * 2;
        ctx.strokeRect(x, y, cardW, cardH);
      }

      // Scissors cutting guide marks
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);

      const markLen = 30;
      // Corner corner ticks
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(x - markLen, y); ctx.lineTo(x, y);
      ctx.moveTo(x, y - markLen); ctx.lineTo(x, y);
      // Top-Right
      ctx.moveTo(x + cardW, y); ctx.lineTo(x + cardW + markLen, y);
      ctx.moveTo(x + cardW, y - markLen); ctx.lineTo(x + cardW, y);
      // Bottom-Left
      ctx.moveTo(x - markLen, y + cardH); ctx.lineTo(x, y + cardH);
      ctx.moveTo(x, y + cardH); ctx.lineTo(x, y + cardH + markLen);
      // Bottom-Right
      ctx.moveTo(x + cardW, y + cardH); ctx.lineTo(x + cardW + markLen, y + cardH);
      ctx.moveTo(x + cardW, y + cardH); ctx.lineTo(x + cardW, y + cardH + markLen);
      ctx.stroke();

      ctx.setLineDash([]);
    };

    drawCard(frontImage, frontX, frontY, 'Upload Front Side');
    drawCard(backImage, backX, backY, 'Upload Back Side');

    // Fold / Cut center indicator between cards
    if (layoutMode === 'side-by-side') {
      const midX = startX + cardW + gapPx / 2;
      ctx.strokeStyle = '#CBD5E1';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(midX, startY - 20);
      ctx.lineTo(midX, startY + cardH + 20);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [frontImage, backImage, layoutMode, paperFormat, cardGapMm, borderWidth, addLaminationMargin]);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFrontImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBackImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tanshu_id_card_layout_${paperFormat}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const is4x6 = paperFormat === '4x6';
    const doc = new jsPDF({
      orientation: is4x6 ? 'landscape' : 'portrait',
      unit: 'in',
      format: is4x6 ? [4, 6] : 'a4'
    });

    const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const pdfW = is4x6 ? 6 : 8.27;
    const pdfH = is4x6 ? 4 : 11.69;

    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    doc.save(`tanshu_id_card_print_${paperFormat}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings Column */}
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">1. Upload Card Sides</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input type="file" ref={frontInputRef} onChange={handleFrontUpload} accept="image/*" className="hidden" />
              <button
                onClick={() => frontInputRef.current?.click()}
                className={`w-full py-3 px-2 border-2 border-dashed rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  frontImage ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-500'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="truncate">{frontImage ? 'Front Loaded' : 'Upload Front'}</span>
              </button>
            </div>

            <div>
              <input type="file" ref={backInputRef} onChange={handleBackUpload} accept="image/*" className="hidden" />
              <button
                onClick={() => backInputRef.current?.click()}
                className={`w-full py-3 px-2 border-2 border-dashed rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  backImage ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-500'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="truncate">{backImage ? 'Back Loaded' : 'Upload Back'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">2. Arrangement Layout</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLayoutMode('side-by-side')}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                layoutMode === 'side-by-side' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-900">Side-by-Side</span>
              </div>
              <p className="text-[11px] text-slate-500">Horizontal alignment for single pass lamination.</p>
            </button>

            <button
              onClick={() => setLayoutMode('stacked')}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                layoutMode === 'stacked' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-900">Stacked Vertical</span>
              </div>
              <p className="text-[11px] text-slate-500">Top-and-bottom arrangement with center fold mark.</p>
            </button>
          </div>
        </div>

        {/* Paper & Spacing */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-medium">Paper Sheet</label>
              <select
                value={paperFormat}
                onChange={(e) => setPaperFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="4x6">4×6" Glossy Photo Paper</option>
                <option value="A4">A4 Heavyweight Sheet</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-600 font-medium">Card Gap</label>
                <span className="text-xs font-mono text-slate-500">{cardGapMm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={cardGapMm}
                onChange={(e) => setCardGapMm(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
            <span className="font-medium">Cutting Guide Tick Marks</span>
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Enabled</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF (Ready to Print)
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Save JPEG at 300 DPI
          </button>
        </div>
      </div>

      {/* Canvas Column */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Live Alignment Preview ({paperFormat})</span>
          <span className="font-mono text-slate-500">Standard CR80: 85.6 × 53.98 mm</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[580px]">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] w-auto shadow-md bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Card sizes are calibrated to exact ISO/IEC 7810 ID-1 standard dimensions. Fits standard thermal pouches (65×95mm).
        </p>
      </div>
    </div>
  );
};
