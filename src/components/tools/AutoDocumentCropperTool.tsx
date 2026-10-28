import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Crop, RotateCw, RefreshCw, ZoomIn, Check } from 'lucide-react';

export const AutoDocumentCropperTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropMargins, setCropMargins] = useState<{ top: number; bottom: number; left: number; right: number }>({
    top: 5,
    bottom: 5,
    left: 5,
    right: 5
  });
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setCropMargins({ top: 8, bottom: 8, left: 8, right: 8 });
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
      canvas.height = 700;
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Document to Auto-Crop', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '13px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Removes unwanted desk backgrounds, margins & shadows', canvas.width / 2, canvas.height / 2 + 18);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Calculate crop bounds in source image coordinates
      const cropL = (cropMargins.left / 100) * img.width;
      const cropR = (cropMargins.right / 100) * img.width;
      const cropT = (cropMargins.top / 100) * img.height;
      const cropB = (cropMargins.bottom / 100) * img.height;

      const sourceW = Math.max(10, img.width - cropL - cropR);
      const sourceH = Math.max(10, img.height - cropT - cropB);

      const isRotated = rotation === 90 || rotation === 270;
      canvas.width = isRotated ? sourceH : sourceW;
      canvas.height = isRotated ? sourceW : sourceH;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw cropped slice
      ctx.drawImage(
        img,
        cropL,
        cropT,
        sourceW,
        sourceH,
        -sourceW / 2,
        -sourceH / 2,
        sourceW,
        sourceH
      );
      ctx.restore();

      if (enhanceContrast) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          // Subtle level stretch
          d[i] = Math.min(255, Math.max(0, (d[i] - 30) * 1.3));
          d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 30) * 1.3));
          d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 30) * 1.3));
        }
        ctx.putImageData(imgData, 0, 0);
      }
    };
  }, [imageSrc, cropMargins, enhanceContrast, rotation]);

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const doc = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    doc.save('tanshu_cropped_document.pdf');
  };

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'tanshu_cropped_document.jpg';
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Choose File</label>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Select Another Document' : 'Upload Document to Crop'}</span>
          </button>
        </div>

        {/* Sliders for boundaries */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Border Inset Crop</label>
            <button
              onClick={() => setCropMargins({ top: 8, bottom: 8, left: 8, right: 8 })}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Auto Fit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Top Inset</span>
                <span className="font-mono">{cropMargins.top}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={cropMargins.top}
                onChange={(e) => setCropMargins({ ...cropMargins, top: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Bottom Inset</span>
                <span className="font-mono">{cropMargins.bottom}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={cropMargins.bottom}
                onChange={(e) => setCropMargins({ ...cropMargins, bottom: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Left Inset</span>
                <span className="font-mono">{cropMargins.left}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={cropMargins.left}
                onChange={(e) => setCropMargins({ ...cropMargins, left: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Right Inset</span>
                <span className="font-mono">{cropMargins.right}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={cropMargins.right}
                onChange={(e) => setCropMargins({ ...cropMargins, right: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={enhanceContrast}
                onChange={(e) => setEnhanceContrast(e.target.checked)}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span>Auto Whiten Background & Boost Ink</span>
            </label>

            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
            >
              <RotateCw className="w-3 h-3 text-blue-600" /> Rotate
            </button>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Cropped PDF
          </button>
          <button
            onClick={handleDownloadImage}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Save High-Res JPEG
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Cropped Document Output</span>
          <span className="font-mono">Clean Framing</span>
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
