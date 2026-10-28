import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Printer, CreditCard, Check, Sliders } from 'lucide-react';

export const PdfToPvcTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetCard, setTargetCard] = useState<'aadhaar' | 'voter' | 'pan' | 'custom'>('aadhaar');
  const [printTrayMode, setPrintTrayMode] = useState<'epson-tray' | '4x6-sheet' | 'a4-sheet'>('epson-tray');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [verticalOffset, setVerticalOffset] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setVerticalOffset(0);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ISO/IEC 7810 ID-1 standard: 85.60 × 53.98 mm (Aspect ratio ~ 1.586)
    // At 300 DPI: card is 1011 × 638 pixels
    const cardW = 1011;
    const cardH = 638;

    if (printTrayMode === 'epson-tray') {
      // Epson / Canon 2-card PVC tray template: typically 1500 x 2400 px
      canvas.width = 1500;
      canvas.height = 2100;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card 1 position (Front)
      const c1X = (canvas.width - cardW) / 2;
      const c1Y = 220;

      // Card 2 position (Back)
      const c2X = (canvas.width - cardW) / 2;
      const c2Y = c1Y + cardH + 180;

      // Helper to draw PVC card slot with rounded corner guides
      const drawPvcSlot = (x: number, y: number, label: string) => {
        ctx.save();
        ctx.beginPath();
        const r = 36; // 3.18mm corner radius at 300 DPI
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + cardW, y, x + cardW, y + cardH, r);
        ctx.arcTo(x + cardW, y + cardH, x, y + cardH, r);
        ctx.arcTo(x, y + cardH, x, y, r);
        ctx.arcTo(x, y, x + cardW, y, r);
        ctx.closePath();
        ctx.clip();

        if (imageSrc) {
          const img = new Image();
          img.src = imageSrc;
          const scale = (cardW / img.width) * (zoomLevel / 100);
          const drawH = img.height * scale;
          ctx.drawImage(img, x, y + verticalOffset, cardW, drawH);
        } else {
          ctx.fillStyle = '#F8FAFC';
          ctx.fill();
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, x + cardW / 2, y + cardH / 2 - 10);
          ctx.fillStyle = '#94A3B8';
          ctx.font = '22px Plus Jakarta Sans, sans-serif';
          ctx.fillText('CR80 PVC (85.6 × 54 mm)', x + cardW / 2, y + cardH / 2 + 25);
        }
        ctx.restore();

        // Border
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      drawPvcSlot(c1X, c1Y, 'PVC Card Front (Tray Slot 1)');
      drawPvcSlot(c2X, c2Y, 'PVC Card Back (Tray Slot 2)');

      // Tray markers
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EPSON L805 / CANON PVC CARD TRAY ALIGNMENT GUIDE', canvas.width / 2, 80);
      ctx.font = '16px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Direct Card Printing Mode • 300 DPI High-Precision Millimeter Scale', canvas.width / 2, 115);
    } else {
      // 4x6 sheet layout
      canvas.width = 1800;
      canvas.height = 1200;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gap = 80;
      const startX = (canvas.width - (cardW * 2 + gap)) / 2;
      const startY = (canvas.height - cardH) / 2;

      const drawSheetSlot = (x: number, y: number, label: string) => {
        ctx.save();
        ctx.beginPath();
        const r = 36;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + cardW, y, x + cardW, y + cardH, r);
        ctx.arcTo(x + cardW, y + cardH, x, y + cardH, r);
        ctx.arcTo(x, y + cardH, x, y, r);
        ctx.arcTo(x, y, x + cardW, y, r);
        ctx.closePath();
        ctx.clip();

        if (imageSrc) {
          const img = new Image();
          img.src = imageSrc;
          const scale = (cardW / img.width) * (zoomLevel / 100);
          ctx.drawImage(img, x, y + verticalOffset, cardW, img.height * scale);
        } else {
          ctx.fillStyle = '#F8FAFC';
          ctx.fill();
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, x + cardW / 2, y + cardH / 2);
        }
        ctx.restore();

        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scissors guide mark
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(x - 10, y - 10, cardW + 20, cardH + 20);
        ctx.setLineDash([]);
      };

      drawSheetSlot(startX, startY, 'ID Front');
      drawSheetSlot(startX + cardW + gap, startY, 'ID Back');
    }
  }, [imageSrc, printTrayMode, zoomLevel, verticalOffset, targetCard]);

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const isLandscape = canvas.width > canvas.height;
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'in',
      format: printTrayMode === '4x6-sheet' ? [4, 6] : 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfW = isLandscape ? 6 : 8.27;
    const pdfH = isLandscape ? 4 : 11.69;
    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    doc.save(`tanshu_pvc_card_${printTrayMode}.pdf`);
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tanshu_pvc_card_${printTrayMode}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Upload ID Card / PDF Image</label>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Select Another Document' : 'Upload Aadhaar / Voter / E-Shram / Ayushman Card'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">2. Target Hardware / Layout</label>
          <div className="space-y-2">
            {[
              { id: 'epson-tray', title: 'PVC Card Tray (Epson L805 / Canon)', desc: 'Direct 2-card plastic tray printing template' },
              { id: '4x6-sheet', title: '4×6" Glossy Paper Sheet', desc: 'Standard side-by-side with scissors cutting lines' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPrintTrayMode(m.id as any)}
                className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  printTrayMode === m.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{m.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Scale Zoom</span>
              <span className="font-mono">{zoomLevel}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="150"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Vertical Position Shift</span>
              <span className="font-mono">{verticalOffset} px</span>
            </div>
            <input
              type="range"
              min="-200"
              max="200"
              value={verticalOffset}
              onChange={(e) => setVerticalOffset(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Print-Ready PDF
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Save 300 DPI JPEG
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">PVC Layout Canvas</span>
          <span className="font-mono">85.60 × 53.98 mm • CR80 ISO Standard</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[600px]">
          <canvas
            ref={canvasRef}
            className="max-h-[540px] w-auto shadow-md bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
