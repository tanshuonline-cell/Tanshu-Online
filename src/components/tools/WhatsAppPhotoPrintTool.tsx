import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Printer, Wand2, Sliders } from 'lucide-react';

export const WhatsAppPhotoPrintTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [copies, setCopies] = useState<number>(4);
  const [paperSize, setPaperSize] = useState<'4x6' | 'A4'>('4x6');
  const [autoEnhance, setAutoEnhance] = useState<boolean>(true);
  const [whiteBorder, setWhiteBorder] = useState<number>(3); // 3mm white photo border

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const is4x6 = paperSize === '4x6';
    canvas.width = is4x6 ? 1800 : 2480;
    canvas.height = is4x6 ? 1200 : 3508;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!imageSrc) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload WhatsApp Photo to Align & Enhance', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '16px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Fixes dark compression haze, straightens & adds photo borders', canvas.width / 2, canvas.height / 2 + 25);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Photo aspect ratio
      const photoW = 380;
      const photoH = 500;
      const borderPx = whiteBorder * 4;

      const cols = is4x6 ? Math.min(copies, 4) : 4;
      const rows = is4x6 ? 1 : Math.ceil(copies / 4);

      const startX = (canvas.width - cols * (photoW + 40)) / 2;
      const startY = (canvas.height - rows * (photoH + 40)) / 2;

      for (let i = 0; i < copies; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = startX + c * (photoW + 40);
        const y = startY + r * (photoH + 40);

        // White photo border
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, photoW, photoH);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);

        // Inner image
        ctx.save();
        if (autoEnhance) {
          ctx.filter = 'contrast(125%) brightness(108%) saturate(110%)';
        }
        ctx.drawImage(
          img,
          x + borderPx,
          y + borderPx,
          photoW - borderPx * 2,
          photoH - borderPx * 2
        );
        ctx.restore();

        // Scissors cut marks
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(x - 4, y - 4, photoW + 8, photoH + 8);
        ctx.setLineDash([]);
      }
    };
  }, [imageSrc, copies, paperSize, autoEnhance, whiteBorder]);

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const is4x6 = paperSize === '4x6';
    const doc = new jsPDF({
      orientation: is4x6 ? 'landscape' : 'portrait',
      unit: 'in',
      format: is4x6 ? [4, 6] : 'a4'
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, is4x6 ? 6 : 8.27, is4x6 ? 4 : 11.69);
    doc.save(`tanshu_whatsapp_print_${paperSize}.pdf`);
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tanshu_whatsapp_print_${paperSize}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Select WhatsApp Image</label>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Change Selected Image' : 'Upload WhatsApp Photo'}</span>
          </button>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">2. Print Layout Options</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 block mb-1">Paper Format</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="4x6">4×6" Photo Paper</option>
                <option value="A4">A4 Sheet</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 block mb-1">Number of Copies</label>
              <select
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
              >
                <option value="1">1 Copy</option>
                <option value="2">2 Copies</option>
                <option value="4">4 Copies</option>
                <option value="8">8 Copies</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnhance}
                onChange={(e) => setAutoEnhance(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto Lift WhatsApp Compression Haze</span>
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Recovers lost saturation, lifts muddy skin tones, and enhances contrast for crisp inkjet photo paper printing.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF (Ready to Print)
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Save JPEG
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Print Preview ({copies} Copies on {paperSize})</span>
          <span className="font-mono text-slate-500">300 DPI Studio Grade</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[580px]">
          <canvas
            ref={canvasRef}
            className="max-h-[520px] w-auto shadow-md bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
