import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore @bg0/browser is a JavaScript package; its runtime API is documented by the package.
import { removeBackground } from '@bg0/browser';
import {
  Upload, Download, Image as ImageIcon, Crop, RotateCcw, RotateCw,
  Eraser, CheckCircle2, Loader2, X, Maximize2, Minimize2,
} from 'lucide-react';

type BackgroundMode = 'transparent' | 'color';
type ExportPreset = 'small' | 'medium' | 'large' | 'largest';
type CropRect = { x: number; y: number; w: number; h: number };

const PRESETS: Record<ExportPreset, { label: string; bytes: number; quality: number }> = {
  small: { label: 'Small · 20 KB', bytes: 20 * 1024, quality: 0.52 },
  medium: { label: 'Medium · 200 KB', bytes: 200 * 1024, quality: 0.78 },
  large: { label: 'Large · 2 MB', bytes: 2 * 1024 * 1024, quality: 0.9 },
  largest: { label: 'Largest · 4 MB', bytes: 4 * 1024 * 1024, quality: 0.97 },
};

const SWATCHES = ['#ffffff', '#f1f5f9', '#dbeafe', '#bfdbfe', '#dcfce7', '#fef3c7', '#fce7f3', '#e5e7eb', '#111827', '#000000'];

function safeFilename(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-') || 'photo-background-removed';
}

function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
  }
  return (crc ^ -1) >>> 0;
}

function addPngDpi(blob: Blob, dpi: number): Promise<Blob> {
  return blob.arrayBuffer().then((buffer) => {
    const source = new Uint8Array(buffer);
    const ppm = Math.round(dpi / 0.0254);
    const data = new Uint8Array(21);
    data.set([0, 0, 0, 9, 112, 72, 89, 115], 0);
    const view = new DataView(data.buffer);
    view.setUint32(8, ppm);
    view.setUint32(12, ppm);
    data[16] = 1;
    view.setUint32(17, crc32(data.subarray(4, 17)));
    const out = new Uint8Array(source.length + data.length);
    out.set(source.subarray(0, 33), 0);
    out.set(data, 33);
    out.set(source.subarray(33), 33 + data.length);
    return new Blob([out], { type: 'image/png' });
  });
}

function addJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  return blob.arrayBuffer().then((buffer) => {
    const src = new Uint8Array(buffer);
    if (src[0] !== 0xff || src[1] !== 0xd8) return blob;
    const app0 = new Uint8Array([
      0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02,
      0x01, (dpi >> 8) & 255, dpi & 255, (dpi >> 8) & 255, dpi & 255, 0x00, 0x00,
    ]);
    const out = new Uint8Array(src.length + app0.length);
    out.set(src.subarray(0, 2), 0);
    out.set(app0, 2);
    out.set(src.subarray(2), 2 + app0.length);
    return new Blob([out], { type: 'image/jpeg' });
  });
}

export const PhotoBackgroundRemoverTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('transparent');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [cropRect, setCropRect] = useState<CropRect>({ x: 4, y: 4, w: 92, h: 92 });
  const [rotation, setRotation] = useState(0);
  const [dragCorner, setDragCorner] = useState<string | null>(null);
  const [filename, setFilename] = useState('photo-background-removed');
  const [preset, setPreset] = useState<ExportPreset>('large');
  const [dpi, setDpi] = useState(300);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  const clearResult = () => {
    setResultBlob(null);
    setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    setProgress(0);
    setStatus('');
  };

  const chooseFile = (next?: File) => {
    if (!next) return;
    if (!next.type.startsWith('image/')) { setError('Please choose a JPG, PNG or WEBP photo.'); return; }
    if (next.size > 40 * 1024 * 1024) { setError('Please choose a photo smaller than 40 MB.'); return; }
    setFile(next);
    setSourceUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(next); });
    setFilename(next.name.replace(/\.[^.]+$/, '') || 'photo-background-removed');
    setCropRect({ x: 4, y: 4, w: 92, h: 92 });
    setRotation(0);
    setError('');
    clearResult();
  };

  const preparePhoto = async () => {
    if (!file) throw new Error('Upload a photo first.');
    const image = new Image();
    const originalUrl = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected photo could not be opened.'));
        image.src = originalUrl;
      });
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const radians = rotation * Math.PI / 180;
      const rotatedWidth = Math.ceil(Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians)));
      const rotatedHeight = Math.ceil(Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians)));
      const rotated = document.createElement('canvas');
      rotated.width = rotatedWidth;
      rotated.height = rotatedHeight;
      const ctx = rotated.getContext('2d');
      if (!ctx) throw new Error('Your browser could not prepare this image.');
      ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      ctx.rotate(radians);
      ctx.drawImage(image, -width / 2, -height / 2);
      const sx = Math.round(rotatedWidth * cropRect.x / 100);
      const sy = Math.round(rotatedHeight * cropRect.y / 100);
      const sw = Math.max(1, Math.round(rotatedWidth * cropRect.w / 100));
      const sh = Math.max(1, Math.round(rotatedHeight * cropRect.h / 100));
      const output = document.createElement('canvas');
      output.width = sw;
      output.height = sh;
      const out = output.getContext('2d');
      if (!out) throw new Error('Your browser could not prepare this crop.');
      out.drawImage(rotated, sx, sy, sw, sh, 0, 0, output.width, output.height);
      return await new Promise<Blob>((resolve, reject) => output.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not prepare the photo.')), 'image/png'));
    } finally {
      URL.revokeObjectURL(originalUrl);
    }
  };

  const runRemoval = async () => {
    if (!file) { setError('Upload a photo first.'); return; }
    setBusy(true);
    setError('');
    setProgress(0);
    setStatus('Preparing photo…');
    clearResult();
    try {
      const prepared = await preparePhoto();
      setStatus('Loading AI model and removing background…');
      const result = await removeBackground(prepared, {
        quality: 'quality',
        onProgress: ({ progress: value, message }) => {
          setProgress(Math.max(0, Math.min(100, Math.round(value * 100))));
          setStatus(message || 'Removing background…');
        },
      });
      setResultBlob(result.blob);
      setResultUrl(URL.createObjectURL(result.blob));
      setProgress(100);
      setStatus('Background removed successfully');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Background removal failed. Please try another photo.');
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  const exportPhoto = async () => {
    if (!resultBlob) return;
    setBusy(true);
    setError('');
    try {
      if (backgroundMode === 'transparent') {
        const png = await addPngDpi(resultBlob, dpi);
        const url = URL.createObjectURL(png);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = safeFilename(filename) + '.png';
        anchor.click();
        URL.revokeObjectURL(url);
      } else {
        const image = new Image();
        const source = URL.createObjectURL(resultBlob);
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Could not prepare the download preview.'));
          image.src = source;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Your browser could not create the download.');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        URL.revokeObjectURL(source);
        const target = PRESETS[preset].bytes;
        const encode = (quality: number) => new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('JPEG export failed.')), 'image/jpeg', quality));
        let low = 0.25;
        let high = 0.99;
        let best = await encode(PRESETS[preset].quality);
        if (best.size > target) {
          for (let i = 0; i < 9; i++) {
            const mid = (low + high) / 2;
            const candidate = await encode(mid);
            if (candidate.size <= target) { best = candidate; low = mid; } else high = mid;
          }
        }
        const jpeg = await addJpegDpi(best, dpi);
        const url = URL.createObjectURL(jpeg);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = safeFilename(filename) + '.jpg';
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export this photo.');
    } finally {
      setBusy(false);
    }
  };

  const checker = 'repeating-conic-gradient(#d8e0e9 0% 25%, #ffffff 0% 50%) 50% / 18px 18px';

  const moveCropCorner = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragCorner) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const py = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    setCropRect((current) => {
      const left = current.x;
      const top = current.y;
      const right = current.x + current.w;
      const bottom = current.y + current.h;
      const min = 8;
      if (dragCorner === 'tl') { const x = Math.min(px, right - min); const y = Math.min(py, bottom - min); return { x, y, w: right - x, h: bottom - y }; }
      if (dragCorner === 'tr') { const x = Math.max(px, left + min); const y = Math.min(py, bottom - min); return { x: left, y, w: x - left, h: bottom - y }; }
      if (dragCorner === 'bl') { const x = Math.min(px, right - min); const y = Math.max(py, top + min); return { x, y: top, w: right - x, h: y - top }; }
      const x = Math.max(px, left + min); const y = Math.max(py, top + min); return { x: left, y: top, w: x - left, h: y - top };
    });
  };

  const cropHandle = (corner: string, position: string) => (
    <button key={corner} type="button" aria-label={'Drag ' + corner + ' crop corner'} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setDragCorner(corner); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={moveCropCorner} onPointerUp={() => setDragCorner(null)} onPointerCancel={() => setDragCorner(null)} className={'absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-[3px] border-yellow-300 bg-red-500 shadow-[0_0_0_2px_rgba(0,0,0,.8)] ' + position} />
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#081629] text-slate-100">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#071426] via-[#102746] to-[#123B5A] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-wide text-blue-100 sm:text-sm">PHOTO BACKGROUND WORKSPACE <span className="ml-2 text-[10px] font-medium text-cyan-200">Upload · Remove · Customize · Download</span></div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="rounded-lg border border-white/20 p-2 text-blue-100 hover:bg-white/10" title={expanded ? 'Restore studio' : 'Expand studio'}>{expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"><Upload size={15} />{file ? 'Change Photo' : 'Add Photo'}</button>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[250px_minmax(0,1fr)_250px] lg:overflow-hidden sm:p-4">
        {!expanded && <aside className="order-2 space-y-3 lg:order-1 lg:overflow-y-auto">
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><Crop size={15} /> Crop &amp; straighten</div>
            <div className="mb-2 flex items-center justify-between text-xs text-blue-100"><span>Rotate photo</span><b>{rotation}°</b></div>
            <div className="mb-4 grid grid-cols-4 gap-1.5">
              {[{ label: '−90°', amount: -90 }, { label: '−1°', amount: -1 }, { label: '+1°', amount: 1 }, { label: '+90°', amount: 90 }].map((item, index) => <button key={item.label} type="button" onClick={() => { setRotation((value) => ((value + item.amount) % 360 + 360) % 360); clearResult(); }} className="flex flex-col items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-1 py-2 text-[10px] font-semibold text-blue-100 hover:border-cyan-300 hover:bg-cyan-400/10"><span className="text-cyan-200"><RotateCcw size={index === 0 || index === 1 ? 16 : 16} /></span>{item.label}</button>)}
            </div>
            <div className="mb-2 flex justify-between text-xs text-blue-100"><span>Manual crop · drag four corners</span><b>Free</b></div>
            <div className="rounded-lg border border-yellow-300/30 bg-[#071426] p-2 text-[10px] leading-4 text-blue-200">Preview में लाल-पीले handles पकड़कर जितना हिस्सा चाहिए उतना चुनें।</div>
            <button type="button" onClick={() => { setCropRect({ x: 4, y: 4, w: 92, h: 92 }); setRotation(0); clearResult(); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"><RotateCcw size={14} /> Reset crop &amp; angle</button>
            <p className="mt-3 text-[10px] leading-4 text-blue-200">Crop frame is adjustable from all four corners. Apply it with Remove Background.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Background color</div>
            <button type="button" onClick={() => setBackgroundMode('transparent')} className={'mb-2 flex w-full items-center gap-3 rounded-lg border p-2 text-xs font-bold ' + (backgroundMode === 'transparent' ? 'border-cyan-300 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-blue-100')}><span className="h-7 w-10 rounded border border-white/30" style={{ background: checker }} /> Transparent</button>
            <button type="button" onClick={() => setBackgroundMode('color')} className={'mb-2 flex w-full items-center gap-3 rounded-lg border p-2 text-xs font-bold ' + (backgroundMode === 'color' ? 'border-cyan-300 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-blue-100')}><span className="h-7 w-10 rounded border border-white/30" style={{ background: backgroundColor }} /> Solid / Custom Color</button>
            <div className="grid grid-cols-5 gap-2">
              {SWATCHES.map((color) => <button key={color} type="button" onClick={() => { setBackgroundColor(color); setCustomColor(color); setBackgroundMode('color'); }} className="h-7 rounded-md border border-white/20" style={{ background: color }} title={color} />)}
            </div>
            <label className="mt-3 flex items-center justify-between gap-2 text-xs text-blue-100">Custom color<input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setBackgroundColor(e.target.value); setBackgroundMode('color'); }} className="h-9 w-14 cursor-pointer rounded border-0 bg-transparent" /></label>
          </section>
        </aside>}

        <main className={'order-1 flex min-h-[360px] min-w-0 flex-col rounded-xl border border-white/10 bg-[#0c1d33] p-3 lg:order-2 lg:min-h-0 ' + (expanded ? 'lg:col-span-3' : '')}>
          <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs font-bold text-white"><ImageIcon size={15} className="text-cyan-300" />{resultUrl ? 'Background removed · Preview' : 'Photo preview'}</div><span className="text-[10px] text-blue-200">{file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Upload a photo to begin'}</span></div>
          <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto rounded-lg bg-[#06101f] p-3">
            {resultUrl ? <div className="flex max-h-full max-w-full items-center justify-center overflow-auto rounded-lg p-4" style={{ background: backgroundMode === 'transparent' ? checker : backgroundColor }}><img src={resultUrl} alt="Background removed preview" className="max-h-[65vh] max-w-full object-contain" /></div>
              : sourceUrl ? <div className="relative inline-block max-h-[65vh] max-w-full select-none touch-none" onPointerMove={moveCropCorner} onPointerUp={() => setDragCorner(null)} onPointerCancel={() => setDragCorner(null)}><img src={sourceUrl} alt="Original photo preview" draggable={false} className="block max-h-[65vh] max-w-full rounded-lg object-contain" style={{ transform: 'rotate(' + rotation + 'deg)' }} /><div className="absolute border-[2px] border-dashed border-yellow-300" style={{ left: cropRect.x + '%', top: cropRect.y + '%', width: cropRect.w + '%', height: cropRect.h + '%', boxShadow: '0 0 0 9999px rgba(0,0,0,.38)', pointerEvents: 'none' }} /><div className="absolute inset-0" onPointerMove={moveCropCorner} onPointerUp={() => setDragCorner(null)}>{cropHandle('tl', 'left-[' + cropRect.x + '%] top-[' + cropRect.y + '%]')}{cropHandle('tr', 'left-[' + (cropRect.x + cropRect.w) + '%] top-[' + cropRect.y + '%]')}{cropHandle('bl', 'left-[' + cropRect.x + '%] top-[' + (cropRect.y + cropRect.h) + '%]')}{cropHandle('br', 'left-[' + (cropRect.x + cropRect.w) + '%] top-[' + (cropRect.y + cropRect.h) + '%]')}</div></div>
              : <button type="button" onClick={() => inputRef.current?.click()} className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/5 px-8 py-12 text-center hover:bg-cyan-400/10"><Upload size={34} className="mb-3 text-cyan-300" /><b className="text-sm text-white">Upload your photo</b><span className="mt-2 text-xs text-blue-200">JPG · PNG · WEBP · Up to 40 MB</span></button>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-blue-200">Your original photo stays unchanged · Processing runs in this browser</span>
            {resultUrl && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200"><CheckCircle2 size={14} /> Ready to download</span>}
          </div>
        </main>

        {!expanded && <aside className="order-3 space-y-3 lg:overflow-y-auto">
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><Eraser size={15} /> AI background removal</div>
            <button type="button" onClick={runRemoval} disabled={!file || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 disabled:opacity-40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Eraser size={16} />}{busy ? 'Processing…' : resultUrl ? 'Remove Again' : 'Remove Background'}</button>
            {(busy || status) && <div className="mt-3"><div className="mb-1 flex justify-between gap-2 text-[10px] text-blue-100"><span>{status}</span><b>{progress}%</b></div><div className="h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: progress + '%' }} /></div></div>}
            <p className="mt-3 text-[10px] leading-4 text-blue-200">First use downloads the AI model to your browser. The photo itself is not uploaded.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Download settings</div>
            <label className="mb-3 block text-xs text-blue-100">File name<input value={filename} onChange={(e) => setFilename(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white outline-none focus:border-cyan-300" placeholder="Enter file name" /></label>
            <label className="mb-3 block text-xs text-blue-100">Image size / quality<select value={preset} onChange={(e) => setPreset(e.target.value as ExportPreset)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white"><option value="small">Small · 20 KB</option><option value="medium">Medium · 200 KB</option><option value="large">Large · 2 MB</option><option value="largest">Largest · 4 MB</option></select></label>
            <label className="mb-3 block text-xs text-blue-100">Print resolution<select value={dpi} onChange={(e) => setDpi(+e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white"><option value={72}>72 DPI · Screen</option><option value={150}>150 DPI · Standard</option><option value={300}>300 DPI · Print quality</option></select></label>
            <button type="button" onClick={exportPhoto} disabled={!resultUrl || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 disabled:opacity-40"><Download size={16} /> Download {backgroundMode === 'transparent' ? 'PNG' : 'JPG'}</button>
            <p className="mt-2 text-[10px] leading-4 text-blue-200">{backgroundMode === 'transparent' ? 'Transparent PNG is lossless; its final size depends on image detail. Size presets apply to JPG with a solid background.' : 'JPG compression targets the selected size; complex photos may remain above the target to protect quality.'} 300 DPI metadata is embedded in the exported file.</p>
          </section>
          {error && <div role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}
        </aside>}
      </div>
    </div>
  );
};
