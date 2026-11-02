import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Upload, Download, Printer, RefreshCw,
  ShieldCheck, Sparkles, SlidersHorizontal, Trash2
} from 'lucide-react';

type Photo = { id: string; name: string; src: string };
type PhotoPreset = 'india' | 'stamp' | 'pan' | 'custom';
type Paper = 'single' | '4x6' | 'A4';
type Mode = 'official' | 'beauty';
type PhotoEdit = { zoom: number; moveX: number; moveY: number; brightness: number; contrast: number; saturation: number; smooth: number };
type SheetRect = { slot: number; photoId: string; x: number; y: number; w: number; h: number };
const DEFAULT_EDIT: PhotoEdit = { zoom: 1, moveX: 0, moveY: 0, brightness: 100, contrast: 100, saturation: 100, smooth: 0 };

const PRESETS: Record<Exclude<PhotoPreset, 'custom'>, { label: string; width: number; height: number }> = {
  india: { label: 'India Passport / Exam · 35 × 45 mm', width: 413, height: 531 },
  stamp: { label: 'Stamp Photo · 25 × 30 mm', width: 295, height: 354 },
  pan: { label: 'PAN Photo · 25 × 35 mm', width: 295, height: 413 }
};

const readFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(file);
});

export const AdvancedPassportPhotoStudio: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [draggingPhotoId, setDraggingPhotoId] = useState<string>('');
  const [photoEdits, setPhotoEdits] = useState<Record<string, PhotoEdit>>({});
  const [sheetPositions, setSheetPositions] = useState<Record<number, { x: number; y: number }>>({});
  const sheetRectsRef = useRef<SheetRect[]>([]);
  const activeSheetDragRef = useRef<{ slot: number; offsetX: number; offsetY: number } | null>(null);
  const [mode, setMode] = useState<Mode>('official');
  const [preset, setPreset] = useState<PhotoPreset>('india');
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [paper, setPaper] = useState<Paper>('single');
  const [sheetMargin, setSheetMargin] = useState(4);
  const [sheetGap, setSheetGap] = useState(2);
  const [background, setBackground] = useState('#ffffff');
  const [border, setBorder] = useState(1);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const selected = photos.find((photo) => photo.id === selectedId) || photos[0] || null;
  const selectedEdit = selected ? (photoEdits[selected.id] || DEFAULT_EDIT) : DEFAULT_EDIT;
  const updateSelectedEdit = (key: keyof PhotoEdit, value: number) => { if (!selected) return; setPhotoEdits((current) => ({ ...current, [selected.id]: { ...(current[selected.id] || DEFAULT_EDIT), [key]: value } })); };

  const dimensions = useMemo(() => {
    if (preset === 'custom') return { width: Math.max(10, customWidth) * 300 / 25.4, height: Math.max(10, customHeight) * 300 / 25.4 };
    return PRESETS[preset];
  }, [preset, customWidth, customHeight]);

  const resetAdjustments = () => {
    if (selected) setPhotoEdits((current) => ({ ...current, [selected.id]: { ...DEFAULT_EDIT } }));
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    const valid = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!valid.length) { setError('कृपया JPG, PNG या WEBP फोटो चुनें।'); return; }
    try {
      const additions = await Promise.all(valid.map(async (file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        src: await readFile(file)
      })));
      setPhotos((current) => [...current, ...additions]);
      setSelectedId((current) => current || additions[0].id);
    } catch {
      setError('फोटो लोड नहीं हो सकी। दूसरी इमेज चुनकर देखें।');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const photoW = Math.round(dimensions.width);
    const photoH = Math.round(dimensions.height);
    const isSingle = paper === 'single';
    const is4x6 = paper === '4x6';
    canvas.width = isSingle ? photoW : is4x6 ? 1200 : 2480;
    canvas.height = isSingle ? photoH : is4x6 ? 1800 : 3508;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const mmToPx = (mm: number) => mm * 300 / 25.4;
    const margin = isSingle ? 0 : mmToPx(sheetMargin);
    const gap = isSingle ? 0 : mmToPx(sheetGap);
    const cols = isSingle ? 1 : Math.max(1, Math.floor((canvas.width - margin * 2 + gap) / (photoW + gap)));
    const rows = isSingle ? 1 : Math.max(1, Math.floor((canvas.height - margin * 2 + gap) / (photoH + gap)));
    const usedW = cols * photoW + (cols - 1) * gap;
    const usedH = rows * photoH + (rows - 1) * gap;
    const startX = isSingle ? 0 : Math.max(margin, (canvas.width - usedW) / 2);
    const startY = isSingle ? 0 : Math.max(margin, (canvas.height - usedH) / 2);
    const draw = (images: Array<HTMLImageElement | null> = []) => {
      const rects: SheetRect[] = [];
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
        const slot = row * cols + col;
        const photoIndex = isSingle ? 0 : slot;
        const photo = sourcePhotos[photoIndex % Math.max(1, sourcePhotos.length)];
        const defaultX = startX + col * (photoW + gap);
        const defaultY = startY + row * (photoH + gap);
        const position = !isSingle ? sheetPositions[slot] : undefined;
        const x = position ? position.x : defaultX;
        const y = position ? position.y : defaultY;
        if (photo) rects.push({ slot, photoId: photo.id, x, y, w: photoW, h: photoH });
        ctx.save();
        ctx.fillStyle = background;
        ctx.fillRect(x, y, photoW, photoH);
        ctx.beginPath(); ctx.rect(x, y, photoW, photoH); ctx.clip();
        const img = images.length ? images[photoIndex % images.length] || undefined : undefined;
        const edit = photo ? (photoEdits[photo.id] || DEFAULT_EDIT) : DEFAULT_EDIT;
        if (img) {
          const scale = Math.max(photoW / img.width, photoH / img.height) * edit.zoom;
          const w = img.width * scale, h = img.height * scale;
          const filter = mode === 'beauty'
            ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) blur(${Math.max(0, edit.smooth) * 0.012}px)`
            : 'brightness(100%) contrast(100%) saturate(100%)';
          ctx.filter = filter;
          ctx.drawImage(img, x + (photoW - w) / 2 + edit.moveX, y + (photoH - h) / 2 + edit.moveY, w, h);
        } else {
          ctx.fillStyle = '#f1f5f9'; ctx.fillRect(x, y, photoW, photoH);
          ctx.fillStyle = '#64748b'; ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('Upload a photo', x + photoW / 2, y + photoH / 2);
        }
        ctx.restore();
        if (border > 0) { ctx.strokeStyle = '#111827'; ctx.lineWidth = border * 2; ctx.strokeRect(x, y, photoW, photoH); }
        if (!isSingle) { ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
          ctx.strokeRect(x - 5, y - 5, photoW + 10, photoH + 10); ctx.setLineDash([]); }
      }
      sheetRectsRef.current = rects;
    };
    const sourcePhotos = paper === 'single' ? (selected ? [selected] : []) : photos;
    if (!sourcePhotos.length) { draw(); return; }
    let cancelled = false;
    Promise.all(sourcePhotos.map((photo) => new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = photo.src;
    }))).then((loaded) => {
      if (cancelled) return;
      if (loaded.some((img) => img === null)) setError('कुछ फोटो लोड नहीं हो सकीं। कृपया उन्हें दोबारा चुनें।');
      draw(loaded);
    });
    return () => { cancelled = true; };
  }, [selected, photos, dimensions, paper, sheetMargin, sheetGap, background, mode, photoEdits, sheetPositions, border]);

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (paper === 'single') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
    const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
    const hit = [...sheetRectsRef.current].reverse().find((rect) => x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h);
    if (!hit) return;
    activeSheetDragRef.current = { slot: hit.slot, offsetX: x - hit.x, offsetY: y - hit.y };
    canvas.setPointerCapture(event.pointerId);
  };
  const handleSheetPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = activeSheetDragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * canvas.width / bounds.width - drag.offsetX;
    const y = (event.clientY - bounds.top) * canvas.height / bounds.height - drag.offsetY;
    const rect = sheetRectsRef.current.find((item) => item.slot === drag.slot);
    if (!rect) return;
    setSheetPositions((current) => ({ ...current, [drag.slot]: {
      x: Math.max(0, Math.min(canvas.width - rect.w, x)),
      y: Math.max(0, Math.min(canvas.height - rect.h, y))
    } }));
  };
  const handleSheetPointerUp = () => { activeSheetDragRef.current = null; };

  const downloadJpg = () => {
    if (!canvasRef.current || !selected) return;
    const link = document.createElement('a');
    link.download = `tanshu-photo-${selected.name.replace(/\.[^.]+$/, '')}-${paper}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.96);
    link.click();
  };

  const downloadPdf = () => {
    if (!canvasRef.current || !selected) return;
    const doc = paper === 'single' ? new jsPDF({ orientation: 'portrait', unit: 'mm', format: [dimensions.width * 25.4 / 300, dimensions.height * 25.4 / 300] }) : new jsPDF({ orientation: 'portrait', unit: 'in', format: paper === '4x6' ? [4, 6] : 'a4' });
    const pageW = paper === 'single' ? dimensions.width * 25.4 / 300 : paper === '4x6' ? 4 : 8.27;
    const pageH = paper === 'single' ? dimensions.height * 25.4 / 300 : paper === '4x6' ? 6 : 11.69;
    doc.addImage(canvasRef.current.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageW, pageH);
    doc.save(`tanshu-photo-sheet-${paper}.pdf`);
  };

  const reorderPhotos = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setPhotos((current) => {
      const from = current.findIndex((photo) => photo.id === sourceId);
      const to = current.findIndex((photo) => photo.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const removeSelected = () => {
    if (!selected) return;
    const next = photos.filter((photo) => photo.id !== selected.id);
    setPhotos(next); setSelectedId(next[0]?.id || '');
    setPhotoEdits((current) => { const updated = { ...current }; delete updated[selected.id]; return updated; });
  };

  const Slider = ({ label, value, min = 0, max = 200, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) => (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-xs font-semibold text-slate-700"><span>{label}</span><span className="tabular-nums text-slate-500">{value}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-blue-600" />
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Advanced Passport Photo Studio</h2>
          <p className="text-sm text-slate-500">फोटो तैयार करें, साइज सेट करें और प्रिंट शीट डाउनलोड करें।</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" /> फोटो आपके ब्राउज़र में प्रोसेस होती है</span>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,0.9fr)_minmax(320px,1.1fr)]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div>
            <div className="mb-2 flex items-center justify-between"><h3 className="font-bold text-slate-900">1. फोटो अपलोड</h3><span className="text-xs text-slate-500">{photos.length} फोटो</span></div>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { void addPhotos(event.target.files); event.currentTarget.value = ''; }} />
            <button onClick={() => uploadRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-white px-4 py-5 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Upload className="h-5 w-5" /> एक या कई फोटो चुनें</button>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            {photos.length > 0 && <><p className="mt-2 text-[11px] text-slate-500">शीट में फोटो का क्रम बदलने के लिए थंबनेल को माउस से खींचकर दूसरी फोटो पर छोड़ें।</p><div className="mt-3 grid grid-cols-4 gap-2">{photos.map((photo) => <button key={photo.id} draggable onDragStart={() => setDraggingPhotoId(photo.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorderPhotos(draggingPhotoId, photo.id); setDraggingPhotoId(''); }} onDragEnd={() => setDraggingPhotoId('')} onClick={() => setSelectedId(photo.id)} title={`Select or drag to reorder: ${photo.name}`} className={`overflow-hidden rounded-lg border-2 bg-white ${selected?.id === photo.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'} ${draggingPhotoId === photo.id ? 'opacity-40' : ''}`}><img src={photo.src} alt={photo.name} className="aspect-square w-full object-cover" /></button>)}</div></>}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 font-bold text-slate-900">2. फोटो का प्रकार</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('official')} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${mode === 'official' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}><ShieldCheck className="mr-1 inline h-4 w-4" /> Official Mode</button>
              <button onClick={() => setMode('beauty')} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${mode === 'beauty' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}><Sparkles className="mr-1 inline h-4 w-4" /> Beauty Mode</button>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{mode === 'official' ? 'सरकारी दस्तावेज़ के लिए मूल चेहरे की बनावट बनाए रखने हेतु ब्यूटी इफेक्ट बंद हैं।' : 'हल्के visual adjustments उपलब्ध हैं। आधिकारिक आवेदन में फोटो नियम पहले जाँचें।'}</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 font-bold text-slate-900">3. फोटो साइज</h3>
            <select value={preset} onChange={(event) => setPreset(event.target.value as PhotoPreset)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
              <option value="india">{PRESETS.india.label}</option><option value="stamp">{PRESETS.stamp.label}</option><option value="pan">{PRESETS.pan.label}</option><option value="custom">Custom Size</option>
            </select>
            {preset === 'custom' && <div className="mt-2 grid grid-cols-2 gap-2"><label className="text-xs text-slate-600">Width (mm)<input type="number" min="10" max="100" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label><label className="text-xs text-slate-600">Height (mm)<input type="number" min="10" max="100" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label></div>}
            <p className="mt-2 text-xs text-slate-500">चुने गए साइज का आउटपुट 300 DPI के हिसाब से तैयार होगा। हर आवेदन की फोटो गाइडलाइन अलग हो सकती है।</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 font-bold text-slate-900">4. Background & Border</h3>
            <div className="flex flex-wrap gap-2">{[{ name: 'White', value: '#ffffff' }, { name: 'Light Blue', value: '#dbeafe' }, { name: 'Light Gray', value: '#e5e7eb' }, { name: 'Cream', value: '#fff7ed' }].map((color) => <button key={color.value} onClick={() => setBackground(color.value)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${background === color.value ? 'border-blue-600 ring-1 ring-blue-200' : 'border-slate-200'}`}><span className="mr-1.5 inline-block h-3 w-3 rounded-full border border-slate-300 align-middle" style={{ background: color.value }} />{color.name}</button>)}</div>
            <p className="mt-2 text-[11px] text-slate-500">नोट: Background रंग केवल पारदर्शी हिस्सों या पहले से cut-out फोटो के पीछे दिखेगा। सामान्य JPG का बैकग्राउंड अभी अपने-आप नहीं हटता।</p>
            <div className="mt-3"><Slider label="Border width" min={0} max={4} value={border} onChange={setBorder} /></div>
          </div>

          {mode === 'beauty' && <div className="space-y-3 border-t border-slate-200 pt-4"><h3 className="flex items-center gap-2 font-bold text-slate-900"><SlidersHorizontal className="h-4 w-4" /> 5. Beauty & Enhance</h3><Slider label="Brightness" value={selectedEdit.brightness} min={50} max={150} onChange={(v) => updateSelectedEdit('brightness', v)} /><Slider label="Contrast" value={selectedEdit.contrast} min={50} max={150} onChange={(v) => updateSelectedEdit('contrast', v)} /><Slider label="Saturation" value={selectedEdit.saturation} min={0} max={200} onChange={(v) => updateSelectedEdit('saturation', v)} /><Slider label="Softening" value={selectedEdit.smooth} min={0} max={10} onChange={(v) => updateSelectedEdit('smooth', v)} /><p className="text-[11px] text-slate-500">नोट: Softening एक हल्का blur effect है; यह AI skin retouching नहीं है।</p></div>}

          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">6. Crop & Position</h3><button onClick={resetAdjustments} className="text-xs font-semibold text-blue-700"><RefreshCw className="mr-1 inline h-3 w-3" /> Reset</button></div>
            <p className="mb-2 text-xs text-slate-500">चुनी हुई फोटो की Crop अलग से सेट करें।</p>
            <div className="grid grid-cols-2 gap-3"><Slider label="Zoom" min={50} max={200} value={Math.round(selectedEdit.zoom * 100)} onChange={(v) => updateSelectedEdit('zoom', v / 100)} /><Slider label="Move left / right" min={-250} max={250} value={selectedEdit.moveX} onChange={(v) => updateSelectedEdit('moveX', v)} /></div>
            <div className="mt-3"><Slider label="Move up / down" min={-250} max={250} value={selectedEdit.moveY} onChange={(v) => updateSelectedEdit('moveY', v)} /></div>
          </div>
          {selected && <button onClick={removeSelected} className="text-xs font-semibold text-red-600 hover:text-red-700"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove selected photo</button>}
        </section>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Live Print Preview</h3><select value={paper} onChange={(e) => setPaper(e.target.value as Paper)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="single">Single Photo</option><option value="4x6">4 × 6 inch</option><option value="A4">A4 Sheet</option></select><div className="flex rounded-lg border border-slate-200 bg-white p-1"><button onClick={() => setPaper('4x6')} className={`rounded px-3 py-1.5 text-xs font-semibold ${paper === '4x6' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>4 × 6 inch</button><button onClick={() => setPaper('A4')} className={`rounded px-3 py-1.5 text-xs font-semibold ${paper === 'A4' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>A4 Sheet</button></div></div>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3"><label className="text-xs text-slate-600">Page margin (mm)<input type="number" min="0" max="15" value={sheetMargin} onChange={(e) => setSheetMargin(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full rounded-lg border p-2" /></label><label className="text-xs text-slate-600">Photo gap (mm)<input type="number" min="0" max="8" value={sheetGap} onChange={(e) => setSheetGap(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full rounded-lg border p-2" /></label><p className="col-span-2 text-[11px] text-slate-500">Auto-fit layout: चुने गए photo size के हिसाब से पेज पर जितनी फोटो फिट होंगी, उतनी अपने-आप लगेंगी। Margin और gap कम करके पेपर बचाएँ; प्रिंटर के non-printable किनारों का ध्यान रखें।</p></div><div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><canvas ref={canvasRef} onPointerDown={handleSheetPointerDown} onPointerMove={handleSheetPointerMove} onPointerUp={handleSheetPointerUp} onPointerCancel={handleSheetPointerUp} style={{ touchAction: 'none', cursor: paper === 'single' ? 'default' : 'grab' }} className="mx-auto block h-auto max-h-[720px] max-w-full bg-white shadow-lg" /></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><button onClick={downloadJpg} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4" /> {paper === "single" ? "Download Single Photo" : "Download Sheet JPG"}</button><button onClick={downloadPdf} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"><Download className="h-4 w-4" /> Download PDF</button><button onClick={() => window.print()} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"><Printer className="h-4 w-4" /> Print</button></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>ध्यान दें:</strong> यह पहला working studio build है। इसमें batch upload, crop/position, size presets, beauty sliders और print export शामिल हैं। AI background removal, manual eraser, face detection/auto-crop और signature editor अभी शामिल नहीं हैं। Background color transparent PNG या पहले से cut-out फोटो पर ही साफ़ दिखेगा; सामान्य JPG की पुरानी background अपने-आप नहीं हटेगी। सरकारी आवेदन से पहले संबंधित विभाग की latest photo specification जाँचें।</div>
        </section>
      </div>
    </div>
  );
};
