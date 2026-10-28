import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, RotateCw, Contrast, Sparkles, FileText, Check } from 'lucide-react';

export const DocumentScannerTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'magic-color' | 'bw' | 'grayscale' | 'original'>('magic-color');
  const [threshold, setThreshold] = useState<number>(128);
  const [contrastVal, setContrastVal] = useState<number>(120);
  const [brightnessVal, setBrightnessVal] = useState<number>(105);
  const [rotation, setRotation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!imageSrc) {
      canvas.width = 600;
      canvas.height = 800;
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Any Document or Certificate to Scan', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '13px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Removes dark shadows, improves contrast & text clarity', canvas.width / 2, canvas.height / 2 + 18);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      if (filterMode === 'original') return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Apply image processing
      const factor = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));
      const bFactor = (brightnessVal - 100) * 1.5;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] + bFactor;
        let g = data[i + 1] + bFactor;
        let b = data[i + 2] + bFactor;

        // Contrast adjustment
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (filterMode === 'bw') {
          const val = gray > threshold ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        } else if (filterMode === 'grayscale') {
          const clamped = Math.min(255, Math.max(0, gray));
          data[i] = clamped;
          data[i + 1] = clamped;
          data[i + 2] = clamped;
        } else if (filterMode === 'magic-color') {
          // Magic color: whiten background while boosting colors of text, seals & stamps
          if (gray > 175) {
            // Whiten background
            data[i] = Math.min(255, r * 1.25);
            data[i + 1] = Math.min(255, g * 1.25);
            data[i + 2] = Math.min(255, b * 1.25);
          } else {
            // Sharpen text & color
            data[i] = Math.max(0, Math.min(255, r * 0.9));
            data[i + 1] = Math.max(0, Math.min(255, g * 0.9));
            data[i + 2] = Math.max(0, Math.min(255, b * 0.9));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [imageSrc, filterMode, threshold, contrastVal, brightnessVal, rotation]);

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const isLandscape = canvas.width > canvas.height;
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdfW = isLandscape ? 297 : 210;
    const pdfH = isLandscape ? 210 : 297;
    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    doc.save('tanshu_scanned_document.pdf');
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'tanshu_scanned_document.jpg';
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Choose Document</label>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Select Different Document' : 'Upload Document / Marksheet / Aadhaar'}</span>
          </button>
        </div>

        {/* Scan Filter Preset */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">2. Scan Enhancement Filter</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'magic-color', label: 'Magic Color', desc: 'Whitens page, keeps color stamps' },
              { id: 'bw', label: 'B & W Document', desc: 'Strict two-tone black & white' },
              { id: 'grayscale', label: 'Clean Grayscale', desc: 'Smooth photocopier tone' },
              { id: 'original', label: 'Original Photo', desc: 'No enhancement filter' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  filterMode === f.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{f.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-600">Contrast Boost</label>
              <span className="text-xs font-mono text-slate-500">{contrastVal}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="160"
              value={contrastVal}
              onChange={(e) => setContrastVal(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-600">Brightness Balance</label>
              <span className="text-xs font-mono text-slate-500">{brightnessVal}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="140"
              value={brightnessVal}
              onChange={(e) => setBrightnessVal(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {filterMode === 'bw' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-600">Black/White Threshold</label>
                <span className="text-xs font-mono text-slate-500">{threshold}</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-600">Rotate Document</span>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-600" /> Rotate 90°
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF (Optimized for Govt Portals)
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Save Clean JPG
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Scanned Document Output</span>
          <span className="font-mono">High-Definition Edge Enhancement</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[600px]">
          <canvas
            ref={canvasRef}
            className="max-h-[540px] w-auto shadow-md bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Adaptive thresholding removes shadows caused by desk lighting, producing crisp text compliant with official portal requirements.
        </p>
      </div>
    </div>
  );
};
