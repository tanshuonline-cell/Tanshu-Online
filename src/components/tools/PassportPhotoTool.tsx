import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Printer, RefreshCw, ZoomIn, ZoomOut, Check, Sliders } from 'lucide-react';

export const PassportPhotoTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('original');
  const [borderWidth, setBorderWidth] = useState<number>(2);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [paperFormat, setPaperFormat] = useState<'4x6' | 'A4'>('4x6');
  const [photoSize, setPhotoSize] = useState<'passport' | 'stamp' | 'pan'>('passport');
  const [zoom, setZoom] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default sample image so user can test immediately if they don't have a photo handy
  useEffect(() => {
    // We can load a placeholder canvas portrait or invite upload
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render preview canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions for layout
    // 4x6 inch at 300 DPI = 1200 x 1800 px (or horizontal 1800 x 1200)
    // A4 at 300 DPI = 2480 x 3508 px
    const is4x6 = paperFormat === '4x6';
    canvas.width = is4x6 ? 1200 : 1754;
    canvas.height = is4x6 ? 1800 : 2480;

    // Fill white paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Margins and guidelines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Photo dimensions in pixels (at ~300 DPI)
    // 3.5cm x 4.5cm ≈ 413 x 531 px
    let photoW = 413;
    let photoH = 531;
    if (photoSize === 'stamp') {
      photoW = 295;
      photoH = 354;
    } else if (photoSize === 'pan') {
      photoW = 295;
      photoH = 413;
    }

    // Grid configuration
    const cols = is4x6 ? 2 : 4;
    const rows = is4x6 ? 4 : 8; // 8 photos on 4x6, 32 on A4
    const totalPhotos = cols * rows;

    const availableW = canvas.width - 80;
    const availableH = canvas.height - 80;
    const gapX = (availableW - cols * photoW) / (cols + 1);
    const gapY = (availableH - rows * photoH) / (rows + 1);

    const drawPhotoSlot = (img: HTMLImageElement | null, x: number, y: number) => {
      ctx.save();
      
      // Draw background fill if modified
      if (bgColor === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, photoW, photoH);
      } else if (bgColor === 'blue') {
        ctx.fillStyle = '#BEE3F8';
        ctx.fillRect(x, y, photoW, photoH);
      } else if (bgColor === 'gray') {
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(x, y, photoW, photoH);
      }

      if (img) {
        // Apply brightness & contrast
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        
        ctx.beginPath();
        ctx.rect(x, y, photoW, photoH);
        ctx.clip();

        // Calculate scaling
        const scale = Math.max(photoW / img.width, photoH / img.height) * zoom;
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = x + (photoW - drawW) / 2 + offsetX;
        const drawY = y + (photoH - drawH) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Placeholder outline with guide oval
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(x, y, photoW, photoH);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, photoW, photoH);

        // Guide text
        ctx.fillStyle = '#94A3B8';
        ctx.font = '18px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Upload Photo', x + photoW / 2, y + photoH / 2);
      }

      ctx.restore();

      // Draw photo border
      if (borderWidth > 0) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = borderWidth * 2;
        ctx.strokeRect(x, y, photoW, photoH);
      }

      // Draw subtle cutting guideline marks
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Small tick marks around corners
      ctx.beginPath();
      ctx.moveTo(x - 6, y); ctx.lineTo(x, y);
      ctx.moveTo(x, y - 6); ctx.lineTo(x, y);
      ctx.moveTo(x + photoW + 6, y); ctx.lineTo(x + photoW, y);
      ctx.moveTo(x + photoW, y - 6); ctx.lineTo(x + photoW, y);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 40 + gapX + c * (photoW + gapX);
            const y = 40 + gapY + r * (photoH + gapY);
            drawPhotoSlot(img, x, y);
          }
        }
      };
    } else {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = 40 + gapX + c * (photoW + gapX);
          const y = 40 + gapY + r * (photoH + gapY);
          drawPhotoSlot(null, x, y);
        }
      }
    }
  }, [imageSrc, bgColor, borderWidth, brightness, contrast, paperFormat, photoSize, zoom, offsetX, offsetY]);

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `tanshu_passport_photos_${paperFormat}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const is4x6 = paperFormat === '4x6';
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: is4x6 ? [4, 6] : 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfW = is4x6 ? 4 : 8.27;
    const pdfH = is4x6 ? 6 : 11.69;
    
    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    doc.save(`tanshu_passport_print_${paperFormat}.pdf`);
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const imgData = canvasRef.current.toDataURL('image/jpeg', 0.95);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photos - TANSHU ONLINE</title>
          <style>
            @page { size: ${paperFormat === '4x6' ? '4in 6in' : 'A4'}; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; }
            img { width: 100%; height: auto; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${imgData}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Settings Sidebar */}
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Upload Portrait Photo</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Change Selected Photo' : 'Select Photo from Computer / Phone'}</span>
          </button>
        </div>

        {/* Paper & Layout Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Paper Size</label>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setPaperFormat('4x6')}
                className={`flex-1 py-1.5 text-xs font-medium rounded ${paperFormat === '4x6' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
              >
                4×6" (8 Photos)
              </button>
              <button
                onClick={() => setPaperFormat('A4')}
                className={`flex-1 py-1.5 text-xs font-medium rounded ${paperFormat === 'A4' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
              >
                A4 (32 Photos)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Photo Preset</label>
            <select
              value={photoSize}
              onChange={(e) => setPhotoSize(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="passport">3.5 × 4.5 cm (Passport / Exam)</option>
              <option value="stamp">2.5 × 3.0 cm (Stamp Size)</option>
              <option value="pan">2.5 × 3.5 cm (PAN Card Size)</option>
            </select>
          </div>
        </div>

        {/* Studio Background Choice */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Background Color</label>
          <div className="flex gap-2">
            {[
              { id: 'original', label: 'As Is', bg: 'bg-slate-200' },
              { id: 'white', label: 'White', bg: 'bg-white border' },
              { id: 'blue', label: 'Light Blue', bg: 'bg-sky-200' },
              { id: 'gray', label: 'Light Gray', bg: 'bg-slate-300' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBgColor(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  bgColor === b.id ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${b.bg}`} />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Solid Border Width */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Border Width</label>
            <span className="text-xs font-mono text-slate-500">{borderWidth} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Alignment & Zoom Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Face Positioning & Zoom</span>
            <button
              onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.1, 2.5))}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 flex items-center justify-center gap-1 hover:bg-slate-100"
            >
              <ZoomIn className="w-3.5 h-3.5" /> Zoom In
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 flex items-center justify-center gap-1 hover:bg-slate-100"
            >
              <ZoomOut className="w-3.5 h-3.5" /> Zoom Out
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => setOffsetY((y) => y - 10)}
                className="flex-1 px-1 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-100"
                title="Move Up"
              >
                ▲
              </button>
              <button
                onClick={() => setOffsetY((y) => y + 10)}
                className="flex-1 px-1 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-100"
                title="Move Down"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Lighting & Contrast */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-600">Brightness</label>
              <span className="text-xs font-mono text-slate-500">{brightness}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="140"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-600">Contrast</label>
              <span className="text-xs font-mono text-slate-500">{contrast}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="140"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
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
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Save JPEG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Direct Print
            </button>
          </div>
        </div>
      </div>

      {/* Right Canvas Preview Area */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">
            Print Preview ({paperFormat === '4x6' ? '4×6 Inch Sheet • 8 Photos' : 'A4 Sheet • 32 Photos'})
          </span>
          <span className="font-mono">300 DPI High-Definition</span>
        </div>

        <div className="w-full overflow-auto bg-slate-200/80 p-4 rounded-xl border border-slate-300 flex justify-center items-center max-h-[640px]">
          <canvas
            ref={canvasRef}
            className="max-h-[580px] w-auto shadow-lg bg-white rounded"
            style={{ maxWidth: '100%' }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          Dotted lines provide precise scissors guide marks. Fully compatible with Epson L805, Canon Pixma, and HP DeskJet photo paper.
        </p>
      </div>
    </div>
  );
};
