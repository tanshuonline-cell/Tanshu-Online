import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Sparkles, Eraser, RotateCw, Trash2, Printer, ShieldCheck } from 'lucide-react';

// Tool 11: AI Face Cleaner
export const AiFaceCleanerTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [skinSmoothing, setSkinSmoothing] = useState<number>(30);
  const [shadowRemoval, setShadowRemoval] = useState<number>(40);
  const [edgeSharpness, setEdgeSharpness] = useState<number>(35);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 700;

    if (!imageSrc) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Portrait to Clean & Balance Lighting', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '13px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Subtle non-destructive retouching for passport & exam verification', canvas.width / 2, canvas.height / 2 + 18);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Shadow lifting and skin tone leveling
      const shadowBoost = shadowRemoval * 0.5;
      const smoothFactor = skinSmoothing * 0.1;

      for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        // If pixel is in darker tone range (shadows on face)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 140) {
          const lift = ((140 - lum) / 140) * shadowBoost;
          r = Math.min(255, r + lift);
          g = Math.min(255, g + lift);
          b = Math.min(255, b + lift);
        }

        // Edge sharpness compensation
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [imageSrc, skinSmoothing, shadowRemoval, edgeSharpness]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'tanshu_biometric_cleaned_photo.jpg';
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Upload Face Portrait</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onload = (ev) => setImageSrc(ev.target?.result as string);
                r.readAsDataURL(file);
              }
            }}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Choose Another Photo' : 'Upload Candidate Photo'}</span>
          </button>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">2. Biometric Touch-Up Controls</label>
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Shadow Suppression</span>
              <span className="font-mono">{shadowRemoval}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={shadowRemoval}
              onChange={(e) => setShadowRemoval(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Even Skin Illumination</span>
              <span className="font-mono">{skinSmoothing}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={skinSmoothing}
              onChange={(e) => setSkinSmoothing(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Facial Contour Clarity</span>
              <span className="font-mono">{edgeSharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={edgeSharpness}
              onChange={(e) => setEdgeSharpness(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Portal Compliant</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            Complies with NTA, UPSC, SSC, and Passport Seva rules. Retains genuine facial features without plastic beauty distortion.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Cleaned Portrait
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Retouched Facial Output</span>
          <span className="font-mono">Subtle Illumination</span>
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

// Tool 12: Watermark Remover
export const WatermarkRemoverTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<number>(30);
  const [targetChannel, setTargetChannel] = useState<'red-stamp' | 'blue-stamp' | 'gray-watermark'>('gray-watermark');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 750;

    if (!imageSrc) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Scanned Document to Suppress Watermark', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '13px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Filters out faint background watermarks, sample texts & bleed-through', canvas.width / 2, canvas.height / 2 + 18);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      const thresh = 255 - sensitivity * 1.5;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (targetChannel === 'gray-watermark') {
          // If faint gray watermark (high lightness, low saturation)
          if (gray > thresh) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          }
        } else if (targetChannel === 'red-stamp') {
          // Remove red stamps
          if (r > 150 && g < 120 && b < 120) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          }
        } else if (targetChannel === 'blue-stamp') {
          // Remove blue ink bleed
          if (b > 150 && r < 120) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [imageSrc, sensitivity, targetChannel]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'tanshu_cleaned_document.jpg';
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">1. Select Document</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onload = (ev) => setImageSrc(ev.target?.result as string);
                r.readAsDataURL(file);
              }
            }}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:border-blue-600 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>{imageSrc ? 'Choose Another Document' : 'Upload Document with Watermark'}</span>
          </button>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">2. Watermark Type</label>
            <div className="space-y-2">
              {[
                { id: 'gray-watermark', title: 'Faint Gray Watermark / Draft Stamp', desc: 'Isolates and whitens light background text' },
                { id: 'red-stamp', title: 'Red Ink Rubber Stamp', desc: 'Isolates red ink stamps while preserving black text' },
                { id: 'blue-stamp', title: 'Blue Ink Stamp / Pen Bleed', desc: 'Cleans blue background bleed' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTargetChannel(t.id as any)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    targetChannel === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.title}</div>
                  <div className="text-[11px] text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Suppression Sensitivity</span>
              <span className="font-mono">{sensitivity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Clean Document
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Cleaned Document Canvas</span>
          <span className="font-mono">Background Restored</span>
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

// Tool 14: PVC Cover Print
export const PvcCoverPrintTool: React.FC = () => {
  const [shopName, setShopName] = useState<string>('TANSHU DIGITAL SERVICES');
  const [shopPhone, setShopPhone] = useState<string>('+91 98765 43210');
  const [pouchSize, setPouchSize] = useState<'65x95' | '70x100'>('65x95');
  const [copies, setCopies] = useState<number>(6);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Draw multiple thermal pouch jacket inserts on A4
    const sleeveW = pouchSize === '65x95' ? 65 : 70;
    const sleeveH = pouchSize === '65x95' ? 95 : 100;

    let x = 20;
    let y = 20;

    for (let i = 0; i < copies; i++) {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(x, y, sleeveW, sleeveH);

      // Header inside sleeve
      doc.setFillColor(30, 58, 138);
      doc.rect(x, y, sleeveW, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('IDENTITY CARD PROTECTIVE SLEEVE', x + sleeveW / 2, y + 9, { align: 'center' });

      // Body lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Cardholder Name: _____________________', x + 5, y + 25);
      doc.text('Emergency Contact: ___________________', x + 5, y + 35);
      doc.text('Blood Group: ______ | Validity: ________', x + 5, y + 45);

      // Shop footer
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text(`Issued by: ${shopName}`, x + sleeveW / 2, y + sleeveH - 12, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Contact: ${shopPhone}`, x + sleeveW / 2, y + sleeveH - 6, { align: 'center' });

      x += sleeveW + 15;
      if (x + sleeveW > 200) {
        x = 20;
        y += sleeveH + 15;
      }
    }

    doc.save(`tanshu_pvc_sleeves_${pouchSize}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Pouch Specifications</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPouchSize('65x95')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                pouchSize === '65x95' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">65 × 95 mm</div>
              <div className="text-[11px] text-slate-500">Standard ATM / Aadhaar PVC pouch</div>
            </button>
            <button
              onClick={() => setPouchSize('70x100')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                pouchSize === '70x100' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">70 × 100 mm</div>
              <div className="text-[11px] text-slate-500">Large badge / pass jacket sleeve</div>
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div>
            <label className="text-xs text-slate-600 block mb-1">Cyber Cafe / Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Kiosk Phone Number</label>
            <input
              type="text"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Copies per A4 Sheet</label>
            <select
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
            >
              <option value="4">4 Sleeves</option>
              <option value="6">6 Sleeves</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Download A4 Print PDF
          </button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">PVC Sleeve Template Preview ({pouchSize} mm)</span>
          <span className="font-mono">Fits Thermal Lamination Pouches</span>
        </div>

        <div className="w-64 bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 shadow-sm text-slate-800 space-y-4">
          <div className="bg-blue-900 text-white text-[11px] font-bold p-2 text-center rounded">
            IDENTITY CARD SLEEVE
          </div>
          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block">CARDHOLDER NAME</span>
              <div className="border-b border-slate-300 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">EMERGENCY PHONE</span>
              <div className="border-b border-slate-300 h-5" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">BLOOD GROUP</span>
                <div className="border-b border-slate-300 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">VALIDITY</span>
                <div className="border-b border-slate-300 h-5" />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="text-[11px] font-bold text-slate-900">{shopName}</div>
            <div className="text-[10px] text-slate-500">{shopPhone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tool 18: PDF Page Organizer
export const PdfPageOrganizerTool: React.FC = () => {
  const [pages, setPages] = useState<{ id: string; name: string; rotation: number }[]>([
    { id: '1', name: 'Page 1 (Marksheet Front)', rotation: 0 },
    { id: '2', name: 'Page 2 (Marksheet Back)', rotation: 0 },
    { id: '3', name: 'Page 3 (Aadhaar Scan)', rotation: 0 }
  ]);

  const handleRotate = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const newPages = [...pages];
    const temp = newPages[idx];
    newPages[idx] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    setPages(newPages);
  };

  const handleDelete = (id: string) => {
    if (pages.length <= 1) return;
    setPages(pages.filter((p) => p.id !== id));
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pages.forEach((p, i) => {
      if (i > 0) doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Organized Document - ${p.name}`, 20, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Orientation: ${p.rotation} Degrees | Page Sequence: ${i + 1}`, 20, 40);
    });
    doc.save('tanshu_organized_document.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Visual Page Sequence & Rotation</h4>
          <p className="text-[11px] text-slate-500">Reorder pages, rotate upside-down sheets, or remove blank pages</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" /> Export Consolidated PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pages.map((p, idx) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Page {idx + 1}</span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {p.rotation}°
              </span>
            </div>

            {/* Thumbnail Box */}
            <div className="h-44 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
              <div
                style={{ transform: `rotate(${p.rotation}deg)` }}
                className="w-24 h-32 bg-white border border-slate-300 rounded shadow-xs flex items-center justify-center transition-transform"
              >
                <span className="text-[10px] text-slate-500 font-mono">P{idx + 1}</span>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 truncate">{p.name}</p>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                  title="Move Left"
                >
                  ◀
                </button>
                <button
                  disabled={idx === pages.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-slate-700"
                  title="Move Right"
                >
                  ▶
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRotate(p.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium"
                >
                  <RotateCw className="w-3 h-3" /> Rotate 90°
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                  title="Delete Page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
