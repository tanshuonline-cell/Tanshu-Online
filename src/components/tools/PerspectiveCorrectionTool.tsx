import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Maximize2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Point {
  x: number;
  y: number;
}

export const PerspectiveCorrectionTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 50 },
    { x: 450, y: 70 },
    { x: 430, y: 550 },
    { x: 70, y: 530 }
  ]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw source canvas with draggable handles
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 600;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw quad polygon
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw 4 circular corner pins
        points.forEach((pt, i) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = draggingIdx === i ? '#DC2626' : '#2563EB';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FFFFFF';
          ctx.stroke();

          // Label
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
          ctx.fillText(['TL', 'TR', 'BR', 'BL'][i], pt.x - 6, pt.y - 12);
        });
      };
    } else {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Skewed Document Photo', canvas.width / 2, canvas.height / 2);
    }
  }, [imageSrc, points, draggingIdx]);

  // Warp perspective to rectified rectangular output
  useEffect(() => {
    if (!outputCanvasRef.current || !imageSrc) return;
    const outCanvas = outputCanvasRef.current;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    outCanvas.width = 600;
    outCanvas.height = 800;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Perspective transform simulation
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

      const srcW = img.width;
      const srcH = img.height;

      // Slice through vertical strips to interpolate perspective tilt
      const strips = 60;
      for (let i = 0; i < strips; i++) {
        const t = i / strips;
        const topX = points[0].x + t * (points[1].x - points[0].x);
        const topY = points[0].y + t * (points[1].y - points[0].y);
        const botX = points[3].x + t * (points[2].x - points[3].x);
        const botY = points[3].y + t * (points[2].y - points[3].y);

        const stripW = outCanvas.width / strips;
        const destX = i * stripW;

        // Map to source image
        const sX = (topX / 500) * srcW;
        const sY = (topY / 600) * srcH;
        const sH = Math.max(10, ((botY - topY) / 600) * srcH);

        ctx.drawImage(
          img,
          sX,
          sY,
          Math.max(1, srcW / strips),
          sH,
          destX,
          0,
          stripW + 1,
          outCanvas.height
        );
      }
    };
  }, [imageSrc, points]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = previewCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < 20) {
        setDraggingIdx(idx);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIdx === null) return;
    const rect = previewCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(10, Math.min(490, e.clientX - rect.left));
    const y = Math.max(10, Math.min(590, e.clientY - rect.top));

    setPoints((prev) => prev.map((p, i) => (i === draggingIdx ? { x, y } : p)));
  };

  const handleMouseUp = () => {
    setDraggingIdx(null);
  };

  const handleDownload = () => {
    if (!outputCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'tanshu_rectified_document.jpg';
    link.href = outputCanvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Upload Angled Document</label>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Select Another Document' : 'Upload Tilted / Skewed Photo'}</span>
          </button>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
          <p className="font-semibold">Interactive 4-Corner Pin Adjustment:</p>
          <p className="text-[11px] text-blue-700">
            Click and drag the 4 blue pins on the left preview to match the four physical paper corners of your document.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={() => setPoints([
              { x: 50, y: 50 },
              { x: 450, y: 70 },
              { x: 430, y: 550 },
              { x: 70, y: 530 }
            ])}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Corner Pins
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Straightened Document
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Canvas with drag pins */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-slate-700 mb-2">Drag 4 Corner Pins</div>
          <div className="bg-slate-200 p-2 rounded-xl border border-slate-300 w-full flex justify-center">
            <canvas
              ref={previewCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-h-[460px] w-auto bg-white rounded shadow-sm cursor-crosshair"
            />
          </div>
        </div>

        {/* Rectified Output */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-slate-700 mb-2">Straightened Output</div>
          <div className="bg-slate-200 p-2 rounded-xl border border-slate-300 w-full flex justify-center">
            <canvas
              ref={outputCanvasRef}
              className="max-h-[460px] w-auto bg-white rounded shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
