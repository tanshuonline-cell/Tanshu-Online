import React, { useEffect, useRef, useState } from 'react';
import {
  Upload, Download, Image as ImageIcon, Crop, RotateCcw, RotateCw,
  Eraser, CheckCircle2, Loader2, X, Maximize2, Minimize2,
} from 'lucide-react';

type BackgroundMode = 'transparent' | 'color';
type ExportPreset = 'small' | 'medium' | 'large' | 'largest' | 'custom';
type ExportFormat = 'png' | 'jpg';
type CropRect = { x: number; y: number; w: number; h: number };

const PRESETS: Record<ExportPreset, { label: string; bytes: number; quality: number }> = {
  small: { label: 'Small · 20 KB', bytes: 20 * 1024, quality: 0.52 },
  medium: { label: 'Medium · 200 KB', bytes: 200 * 1024, quality: 0.78 },
  large: { label: 'Large · 2 MB', bytes: 2 * 1024 * 1024, quality: 0.9 },
  largest: { label: 'Largest · 4 MB', bytes: 4 * 1024 * 1024, quality: 0.97 },
};

// Reuse the same lightweight MediaPipe selfie-segmentation approach as the existing
// Selfie Photo Studio. Keep one model instance per browser session for faster repeat use.
let sharedPersonSegmenter: any = null;
let sharedPersonSegmenterPromise: Promise<any> | null = null;

async function getPersonSegmenter() {
  if (sharedPersonSegmenter) return sharedPersonSegmenter;
  if (!sharedPersonSegmenterPromise) {
    sharedPersonSegmenterPromise = (async () => {
      const moduleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm';
      const visionTasks = await import(/* @vite-ignore */ moduleUrl);
      const vision = await visionTasks.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
      );
      const options = {
        runningMode: 'IMAGE' as const,
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      };
      try {
        return await visionTasks.ImageSegmenter.createFromOptions(vision, {
          ...options,
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite',
            delegate: 'GPU',
          },
        });
      } catch {
        return await visionTasks.ImageSegmenter.createFromOptions(vision, {
          ...options,
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite',
            delegate: 'CPU',
          },
        });
      }
    })();
  }
  try {
    sharedPersonSegmenter = await sharedPersonSegmenterPromise;
    return sharedPersonSegmenter;
  } catch (error) {
    sharedPersonSegmenterPromise = null;
    throw error;
  }
}

async function removeBackgroundWithPersonMask(photo: Blob, onStatus: (message: string) => void): Promise<Blob> {
  onStatus('Loading the fast person-segmentation model…');
  const segmenter = await getPersonSegmenter();
  const imageUrl = URL.createObjectURL(photo);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The prepared photo could not be opened.'));
      image.src = imageUrl;
    });
    onStatus('Detecting the person and preserving the full photo frame…');
    const result = segmenter.segment(image);
    const mask = result?.confidenceMasks?.[0];
    if (!mask) throw new Error('The AI did not return a person mask. Please try another photo.');
    const maskData = mask.getAsFloat32Array();
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = mask.width;
    maskCanvas.height = mask.height;
    const maskContext = maskCanvas.getContext('2d');
    if (!maskContext) throw new Error('Could not prepare the person mask.');
    const pixels = maskContext.createImageData(mask.width, mask.height);
    for (let i = 0; i < maskData.length; i += 1) {
      // Match the confidence-mask edge handling used in Selfie Photo Studio.
      const alpha = Math.max(0, Math.min(255, Math.round(((maskData[i] - 0.18) / 0.64) * 255)));
      const p = i * 4;
      pixels.data[p] = 255;
      pixels.data[p + 1] = 255;
      pixels.data[p + 2] = 255;
      pixels.data[p + 3] = alpha;
    }
    maskContext.putImageData(pixels, 0, 0);

    // The output canvas always keeps the prepared photo's complete width/height.
    // Only the person mask changes alpha; no subject-side or bottom-frame crop is applied.
    const output = document.createElement('canvas');
    output.width = image.naturalWidth;
    output.height = image.naturalHeight;
    const context = output.getContext('2d');
    if (!context) throw new Error('Could not create the transparent photo.');
    context.drawImage(image, 0, 0, output.width, output.height);
    context.globalCompositeOperation = 'destination-in';
    context.filter = 'blur(1.2px)';
    context.drawImage(maskCanvas, 0, 0, output.width, output.height);
    context.filter = 'none';
    context.globalCompositeOperation = 'source-over';
    onStatus('Finishing transparent PNG…');
    return await new Promise<Blob>((resolve, reject) => {
      output.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not finish the transparent PNG.')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

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
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 100 });
  const [rotation, setRotation] = useState(0);
  const [dragCorner, setDragCorner] = useState<string | null>(null);
  const [cropApplied, setCropApplied] = useState(false);
  const cropDragStart = useRef<{ x: number; y: number; rect: CropRect } | null>(null);
  const [filename, setFilename] = useState('photo-background-removed');
  const [preset, setPreset] = useState<ExportPreset>('large');
  const [customSize, setCustomSize] = useState('20');
  const [customSizeUnit, setCustomSizeUnit] = useState<'KB' | 'MB'>('KB');
  const [dpi, setDpi] = useState(300);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cropStageRef = useRef<HTMLDivElement>(null);

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
    setCropRect({ x: 0, y: 0, w: 100, h: 100 });
    setCropApplied(false);
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

      // Keep very large phone/camera images from exhausting memory on ordinary
      // laptops and mobiles. 1600px is ample for passport-photo printing, while
      // the AI still receives the exact user-selected crop and keeps quality mode.
      const maxProcessingEdge = 1600;
      const longestEdge = Math.max(output.width, output.height);
      let processingCanvas = output;
      if (longestEdge > maxProcessingEdge) {
        const scale = maxProcessingEdge / longestEdge;
        const resized = document.createElement('canvas');
        resized.width = Math.max(1, Math.round(output.width * scale));
        resized.height = Math.max(1, Math.round(output.height * scale));
        const resizedContext = resized.getContext('2d');
        if (!resizedContext) throw new Error('Your browser could not optimize this photo.');
        resizedContext.imageSmoothingEnabled = true;
        resizedContext.imageSmoothingQuality = 'high';
        resizedContext.drawImage(output, 0, 0, resized.width, resized.height);
        processingCanvas = resized;
      }
      return await new Promise<Blob>((resolve, reject) => processingCanvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not prepare the photo.')), 'image/png'));
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
      setProgress(15);
      const removed = await removeBackgroundWithPersonMask(prepared, (message) => {
        setStatus(message);
        setProgress(message.includes('Finishing') ? 90 : message.includes('Detecting') ? 65 : 25);
      });
      setResultBlob(removed);
      setResultUrl(URL.createObjectURL(removed));
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
      if (exportFormat === 'png') {
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
        ctx.fillStyle = backgroundMode === 'color' ? backgroundColor : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        URL.revokeObjectURL(source);
        const target = preset === 'custom'
          ? Math.round(Number(customSize) * (customSizeUnit === 'MB' ? 1024 * 1024 : 1024))
          : PRESETS[preset].bytes;
        if (!Number.isFinite(target) || target < 1024 || target > 20 * 1024 * 1024) {
          throw new Error('Choose a target size between 1 KB and 20 MB.');
        }
        let exportCanvas = canvas;
        const encodeWithDpi = async (quality: number) => {
          const encoded = await new Promise<Blob>((resolve, reject) => exportCanvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('JPEG export failed.')), 'image/jpeg', quality));
          return addJpegDpi(encoded, dpi);
        };
        // If even low JPEG quality is too large, reduce pixel dimensions gradually
        // while preserving the complete photo frame and aspect ratio.
        let low = 0.03;
        let high = 0.98;
        let best = await encodeWithDpi(low);
        let resizeAttempts = 0;
        while (best.size > target && resizeAttempts < 12 && Math.min(exportCanvas.width, exportCanvas.height) > 160) {
          const scaled = document.createElement('canvas');
          const factor = 0.82;
          scaled.width = Math.max(1, Math.round(exportCanvas.width * factor));
          scaled.height = Math.max(1, Math.round(exportCanvas.height * factor));
          const scaledContext = scaled.getContext('2d');
          if (!scaledContext) throw new Error('Your browser could not resize the photo for this file-size limit.');
          scaledContext.imageSmoothingEnabled = true;
          scaledContext.imageSmoothingQuality = 'high';
          scaledContext.drawImage(exportCanvas, 0, 0, scaled.width, scaled.height);
          exportCanvas = scaled;
          best = await encodeWithDpi(low);
          resizeAttempts += 1;
        }
        if (best.size > target) {
          throw new Error('This target is too small for this photo. Please choose a larger KB/MB limit.');
        }
        for (let i = 0; i < 16; i++) {
          const mid = (low + high) / 2;
          const candidate = await encodeWithDpi(mid);
          if (candidate.size <= target) { best = candidate; low = mid; } else { high = mid; }
        }
        if (best.size > target) throw new Error('Could not meet the selected file-size limit. Please choose a larger size.');
        const jpeg = best;
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

  const moveCropCorner = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragCorner) return;
    const bounds = cropStageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const stage = cropStageRef.current;
    if (!stage) return;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const angle = -rotation * Math.PI / 180;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle) + stage.offsetWidth / 2;
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle) + stage.offsetHeight / 2;
    const px = Math.max(0, Math.min(100, (localX / stage.offsetWidth) * 100));
    const py = Math.max(0, Math.min(100, (localY / stage.offsetHeight) * 100));
    if (dragCorner === 'move' && cropDragStart.current) {
      const dx = px - cropDragStart.current.x;
      const dy = py - cropDragStart.current.y;
      const start = cropDragStart.current.rect;
      setCropRect({ ...start, x: Math.max(0, Math.min(100 - start.w, start.x + dx)), y: Math.max(0, Math.min(100 - start.h, start.y + dy)) });
      return;
    }
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

  const startCropMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cropApplied) return;
    const bounds = cropStageRef.current?.getBoundingClientRect();
    const stage = cropStageRef.current;
    if (!bounds || !stage) return;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const angle = -rotation * Math.PI / 180;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle) + stage.offsetWidth / 2;
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle) + stage.offsetHeight / 2;
    cropDragStart.current = { x: (localX / stage.offsetWidth) * 100, y: (localY / stage.offsetHeight) * 100, rect: { ...cropRect } };
    setDragCorner('move');
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const finishCropDrag = () => { setDragCorner(null); cropDragStart.current = null; };

  const cropHandle = (corner: string, left: number, top: number) => (
    <button key={corner} type="button" aria-label={'Drag ' + corner + ' crop corner'} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setDragCorner(corner); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={moveCropCorner} onPointerUp={() => finishCropDrag()} onPointerCancel={finishCropDrag} className="absolute z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-[3px] border-yellow-300 bg-red-500 shadow-[0_0_0_2px_rgba(0,0,0,.8)]" style={{ left: left + '%', top: top + '%' }} />
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
              {[{ label: '−90°', amount: -90 }, { label: '−1°', amount: -1 }, { label: '+1°', amount: 1 }, { label: '+90°', amount: 90 }].map((item, index) => <button key={item.label} type="button" onClick={() => { setRotation((value) => ((value + item.amount) % 360 + 360) % 360); clearResult(); }} className="flex flex-col items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-1 py-2 text-[10px] font-semibold text-blue-100 hover:border-cyan-300 hover:bg-cyan-400/10"><span className="text-cyan-200">{index < 2 ? <RotateCcw size={16} /> : <RotateCw size={16} />}</span>{item.label}</button>)}
            </div>
            <div className="mb-2 flex justify-between text-xs text-blue-100"><span>Manual crop · drag four corners</span><b>Free</b></div>
            <div className="rounded-lg border border-yellow-300/30 bg-[#071426] p-2 text-[10px] leading-4 text-blue-200">चारों कोनों से आकार बदलें और चयन के बीच में पकड़कर पूरा crop box कहीं भी खिसकाएँ। फिर Done दबाएँ।</div>
            <button type="button" onClick={() => { setCropRect({ x: 0, y: 0, w: 100, h: 100 }); setCropApplied(false); setRotation(0); clearResult(); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"><RotateCcw size={14} /> Reset crop &amp; angle</button>
            <button type="button" onClick={() => { setCropApplied(true); finishCropDrag(); clearResult(); }} disabled={!file || cropApplied} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 disabled:opacity-40"><CheckCircle2 size={14} /> {cropApplied ? 'Crop Applied' : 'Done · Apply Crop'}</button>
            {cropApplied && <button type="button" onClick={() => { setCropApplied(false); clearResult(); }} className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold">Edit Crop Again</button>}
            <p className="mt-3 text-[10px] leading-4 text-blue-200">Done करने पर crop selection lock हो जाएगा और handles छिप जाएँगे। Remove Background पर वही crop लागू होगा।</p>
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
              : sourceUrl ? <div ref={cropStageRef} className="relative inline-block max-h-[65vh] max-w-full select-none touch-none" style={{ transform: 'rotate(' + rotation + 'deg)' }} onPointerMove={moveCropCorner} onPointerUp={finishCropDrag} onPointerCancel={finishCropDrag}><img src={sourceUrl} alt="Original photo preview" draggable={false} className="block max-h-[65vh] max-w-full rounded-lg object-contain" style={{ clipPath: cropApplied ? 'inset(' + cropRect.y + '% ' + (100 - cropRect.x - cropRect.w) + '% ' + (100 - cropRect.y - cropRect.h) + '% ' + cropRect.x + '%)' : undefined }} />{!cropApplied && <div className="absolute border-[2px] border-dashed border-yellow-300" style={{ left: cropRect.x + '%', top: cropRect.y + '%', width: cropRect.w + '%', height: cropRect.h + '%', boxShadow: '0 0 0 9999px rgba(0,0,0,.38)', pointerEvents: 'none' }} />}{!cropApplied && <><div className="absolute cursor-move touch-none rounded-sm" style={{ left: cropRect.x + '%', top: cropRect.y + '%', width: cropRect.w + '%', height: cropRect.h + '%', background: 'rgba(250,204,21,.06)' }} onPointerDown={startCropMove} onPointerMove={moveCropCorner} onPointerUp={finishCropDrag} onPointerCancel={finishCropDrag} /><div className="absolute inset-0">{cropHandle('tl', cropRect.x, cropRect.y)}{cropHandle('tr', cropRect.x + cropRect.w, cropRect.y)}{cropHandle('bl', cropRect.x, cropRect.y + cropRect.h)}{cropHandle('br', cropRect.x + cropRect.w, cropRect.y + cropRect.h)}</div></>}</div>
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
            <p className="mt-3 text-[10px] leading-4 text-blue-200">First use downloads the lightweight AI model to your browser. Later photos reuse it in this tab. The photo itself is not uploaded.</p>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Download settings</div>
            <label className="mb-3 block text-xs text-blue-100">File name<input value={filename} onChange={(e) => setFilename(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white outline-none focus:border-cyan-300" placeholder="Enter file name" /></label>
            <label className="mb-3 block text-xs text-blue-100">Target file size (JPG)<select value={preset} onChange={(e) => setPreset(e.target.value as ExportPreset)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white"><option value="small">20 KB (Government forms)</option><option value="medium">200 KB</option><option value="large">2 MB</option><option value="largest">4 MB</option><option value="custom">Custom size</option></select></label>
            {preset === 'custom' && <div className="mb-3 grid grid-cols-[minmax(0,1fr)_90px] gap-2"><label className="text-xs text-blue-100">Enter size<input type="number" min="1" max={customSizeUnit === 'MB' ? 20 : 20480} step="1" value={customSize} onChange={(e) => setCustomSize(e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white" placeholder="e.g. 20" /></label><label className="text-xs text-blue-100">Unit<select value={customSizeUnit} onChange={(e) => setCustomSizeUnit(e.target.value as 'KB' | 'MB')} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-2 py-2 text-xs text-white"><option value="KB">KB</option><option value="MB">MB</option></select></label></div>}
            <label className="mb-3 block text-xs text-blue-100">Print resolution<select value={dpi} onChange={(e) => setDpi(+e.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white"><option value={72}>72 DPI · Screen</option><option value={150}>150 DPI · Standard</option><option value={300}>300 DPI · Print quality</option></select></label>
            <div className="mb-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setExportFormat('png')} className={'rounded-lg border px-3 py-2.5 text-xs font-extrabold ' + (exportFormat === 'png' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-white/15 bg-white/5 text-blue-100')}>PNG · Transparent</button>
              <button type="button" onClick={() => setExportFormat('jpg')} className={'rounded-lg border px-3 py-2.5 text-xs font-extrabold ' + (exportFormat === 'jpg' ? 'border-cyan-300 bg-cyan-400/15 text-cyan-100' : 'border-white/15 bg-white/5 text-blue-100')}>JPG · Photo</button>
            </div>
            <button type="button" onClick={exportPhoto} disabled={!resultUrl || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 disabled:opacity-40"><Download size={16} /> Download {exportFormat.toUpperCase()}</button>
            <p className="mt-2 text-[10px] leading-4 text-blue-200">{exportFormat === 'png' ? 'PNG keeps the removed background transparent and preserves full image quality. JPG always uses a solid background (selected color, or white).' : 'JPG uses the selected solid background color; when Transparent is selected above, white is used. JPG size presets and custom limits are enforced on the final downloaded file. PNG is lossless, so its file size depends on the photo and cannot be forced to an exact KB/MB target.'} 300 DPI metadata is embedded in the exported file.</p>
          </section>
          {error && <div role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}
        </aside>}
      </div>
    </div>
  );
};
