import React, { useCallback, useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, RotateCw, FileText, Image as ImageIcon, ScanLine, ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, ShieldCheck, WandSparkles } from 'lucide-react';

type ScanMode = 'ultra' | 'magic-color' | 'bw' | 'grayscale' | 'original';
type PdfJsPage = { getViewport: (args: { scale: number }) => { width: number; height: number }; render: (args: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } };
type PdfJsDocument = { numPages: number; getPage: (page: number) => Promise<PdfJsPage> };
type PdfJsLibrary = { getDocument: (args: { data: Uint8Array }) => { promise: Promise<PdfJsDocument> }; GlobalWorkerOptions: { workerSrc: string } };

declare global {
  interface Window { pdfjsLib?: PdfJsLibrary; cv?: any; }
}

const PDFJS_VERSION = '3.11.174';
let pdfJsLoader: Promise<PdfJsLibrary> | null = null;

function loadPdfJs(): Promise<PdfJsLibrary> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfJsLoader) return pdfJsLoader;
  pdfJsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tanshu-pdfjs="true"]');
    const script = existing || document.createElement('script');
    const finish = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      } else {
        pdfJsLoader = null;
        reject(new Error('PDF engine could not be loaded. Please check your internet connection and try again.'));
      }
    };
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => { pdfJsLoader = null; reject(new Error('Unable to load the PDF engine. Please try again.')); }, { once: true });
    if (!existing) {
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
      script.async = true;
      script.dataset.tanshuPdfjs = 'true';
      document.head.appendChild(script);
    } else if (window.pdfjsLib) finish();
  });
  return pdfJsLoader;
}

let openCvLoader: Promise<any> | null = null;
function loadOpenCv(): Promise<any> {
  if (window.cv?.Mat) return Promise.resolve(window.cv);
  if (openCvLoader) return openCvLoader;
  openCvLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tanshu-opencv="true"]');
    const script = existing || document.createElement('script');
    const ready = () => {
      if (window.cv?.Mat) resolve(window.cv);
      else if (window.cv) window.cv.onRuntimeInitialized = () => resolve(window.cv);
      else { openCvLoader = null; reject(new Error('Auto page detection is unavailable right now.')); }
    };
    script.addEventListener('load', ready, { once: true });
    script.addEventListener('error', () => { openCvLoader = null; reject(new Error('Could not load the page-detection engine.')); }, { once: true });
    if (!existing) {
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      script.async = true;
      script.dataset.tanshuOpencv = 'true';
      document.head.appendChild(script);
    } else if (window.cv) ready();
  });
  return openCvLoader;
}

async function autoRectifyPage(source: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const cv = await loadOpenCv();
  let src: any, gray: any, blurred: any, edges: any, contours: any, hierarchy: any;
  let transform: any, warped: any, srcPoints: any, dstPoints: any;
  try {
    src = cv.imread(source);
    gray = new cv.Mat(); blurred = new cv.Mat(); edges = new cv.Mat();
    contours = new cv.MatVector(); hierarchy = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edges, 45, 130);
    cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    let bestArea = 0;
    let corners: Array<{ x: number; y: number }> | null = null;
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const candidate = new cv.Mat();
      cv.approxPolyDP(contour, candidate, 0.02 * cv.arcLength(contour, true), true);
      const area = Math.abs(cv.contourArea(candidate));
      if (candidate.rows === 4 && area > source.width * source.height * 0.12 && area > bestArea) {
        const points = [];
        for (let j = 0; j < 4; j++) points.push({ x: candidate.intPtr(j, 0)[0], y: candidate.intPtr(j, 0)[1] });
        corners = points; bestArea = area;
      }
      candidate.delete(); contour.delete();
    }
    if (!corners || bestArea < source.width * source.height * 0.18) return source;
    const sums = corners.map(p => p.x + p.y);
    const diffs = corners.map(p => p.x - p.y);
    const ordered = [
      corners[sums.indexOf(Math.min(...sums))],
      corners[diffs.indexOf(Math.max(...diffs))],
      corners[sums.indexOf(Math.max(...sums))],
      corners[diffs.indexOf(Math.min(...diffs))],
    ];
    const width = Math.round(Math.max(Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y), Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y)));
    const height = Math.round(Math.max(Math.hypot(ordered[3].x - ordered[0].x, ordered[3].y - ordered[0].y), Math.hypot(ordered[2].x - ordered[1].x, ordered[2].y - ordered[1].y)));
    if (width < 120 || height < 120) return source;
    srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, ordered.flatMap(p => [p.x, p.y]));
    dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width - 1, 0, width - 1, height - 1, 0, height - 1]);
    transform = cv.getPerspectiveTransform(srcPoints, dstPoints);
    warped = new cv.Mat();
    cv.warpPerspective(src, warped, transform, new cv.Size(width, height), cv.INTER_CUBIC, cv.BORDER_REPLICATE);
    const result = document.createElement('canvas');
    cv.imshow(result, warped);
    return result;
  } finally {
    [src, gray, blurred, edges, contours, hierarchy, transform, warped, srcPoints, dstPoints].forEach(item => {
      if (item && typeof item.delete === 'function') item.delete();
    });
  }
}

function clamp(value: number, min = 0, max = 255) { return Math.max(min, Math.min(max, value)); }

function enhanceCanvas(source: HTMLCanvasElement, mode: ScanMode, contrast: number, brightness: number, sharpness: number, threshold: number) {
  const output = document.createElement('canvas');
  output.width = source.width;
  output.height = source.height;
  const ctx = output.getContext('2d', { willReadFrequently: true });
  if (!ctx) return output;
  ctx.drawImage(source, 0, 0);
  if (mode === 'original') return output;

  const image = ctx.getImageData(0, 0, output.width, output.height);
  const pixels = image.data;
  // Estimate broad page illumination at low resolution. Dividing by this smooth
  // field reduces desk shadows and gentle fold shading without inventing letters.
  const light = document.createElement('canvas');
  light.width = 64;
  light.height = 64;
  const lightCtx = light.getContext('2d', { willReadFrequently: true });
  if (lightCtx) {
    lightCtx.filter = 'blur(2px)';
    lightCtx.drawImage(source, 0, 0, light.width, light.height);
    lightCtx.filter = 'none';
  }
  const lightData = lightCtx?.getImageData(0, 0, light.width, light.height).data;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const brightnessOffset = (brightness - 100) * 1.8;

  for (let y = 0; y < output.height; y++) {
    const ly = Math.min(63, Math.floor((y / output.height) * 64));
    for (let x = 0; x < output.width; x++) {
      const i = (y * output.width + x) * 4;
      let r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (mode === 'ultra' && lightData) {
        const lx = Math.min(63, Math.floor((x / output.width) * 64));
        const li = (ly * 64 + lx) * 4;
        const illumination = Math.max(72, 0.299 * lightData[li] + 0.587 * lightData[li + 1] + 0.114 * lightData[li + 2]);
        const gain = 238 / illumination;
        r = clamp(r * gain);
        g = clamp(g * gain);
        b = clamp(b * gain);
        gray = 0.299 * r + 0.587 * g + 0.114 * b;
      }
      if (mode === 'bw') {
        const value = clamp((gray - 128) * (contrastFactor / 2.1) + 128 + brightnessOffset) >= threshold ? 255 : 0;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      } else if (mode === 'grayscale') {
        const value = clamp(contrastFactor * (gray - 128) + 128 + brightnessOffset);
        pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      } else if (mode === 'ultra') {
        pixels[i] = clamp(contrastFactor * (r - 128) + 128 + brightnessOffset);
        pixels[i + 1] = clamp(contrastFactor * (g - 128) + 128 + brightnessOffset);
        pixels[i + 2] = clamp(contrastFactor * (b - 128) + 128 + brightnessOffset);
      } else {
        const rr = clamp(contrastFactor * (r - 128) + 128 + brightnessOffset);
        const gg = clamp(contrastFactor * (g - 128) + 128 + brightnessOffset);
        const bb = clamp(contrastFactor * (b - 128) + 128 + brightnessOffset);
        const luminance = 0.299 * rr + 0.587 * gg + 0.114 * bb;
        if (mode === 'magic-color' && luminance > 178) {
          pixels[i] = clamp(rr + (255 - rr) * 0.35);
          pixels[i + 1] = clamp(gg + (255 - gg) * 0.35);
          pixels[i + 2] = clamp(bb + (255 - bb) * 0.35);
        } else {
          pixels[i] = rr; pixels[i + 1] = gg; pixels[i + 2] = bb;
        }
      }
      pixels[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  // Unsharp mask on a separate canvas. It strengthens existing edges only;
  // it does not synthesize or replace document characters.
  if (sharpness > 0 && mode !== 'bw') {
    const blurred = document.createElement('canvas');
    blurred.width = output.width; blurred.height = output.height;
    const blurCtx = blurred.getContext('2d');
    if (blurCtx) {
      blurCtx.filter = 'blur(1.2px)';
      blurCtx.drawImage(output, 0, 0);
      blurCtx.filter = 'none';
      const base = ctx.getImageData(0, 0, output.width, output.height);
      const soft = blurCtx.getImageData(0, 0, output.width, output.height);
      const amount = sharpness / 100;
      for (let i = 0; i < base.data.length; i += 4) {
        for (let c = 0; c < 3; c++) base.data[i + c] = clamp(base.data[i + c] + (base.data[i + c] - soft.data[i + c]) * amount);
      }
      ctx.putImageData(base, 0, 0);
    }
  }
  return output;
}

// High-resolution output uses high-quality browser resampling with a restrained
// final edge pass. It increases export pixel dimensions, but cannot recover detail
// that was never captured in the original photograph.
function upscaleCanvas(source: HTMLCanvasElement, requestedScale: number): HTMLCanvasElement {
  if (requestedScale <= 1) return source;
  // Keep output memory bounded on ordinary shop PCs and mobile devices.
  const maxPixels = 16_000_000;
  const sourcePixels = source.width * source.height;
  const safeScale = Math.min(requestedScale, Math.sqrt(maxPixels / Math.max(1, sourcePixels)));
  if (safeScale <= 1.01) return source;
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(source.width * safeScale));
  output.height = Math.max(1, Math.round(source.height * safeScale));
  const ctx = output.getContext('2d');
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, output.width, output.height);
  return output;
}

export const DocumentScannerTool: React.FC = () => {
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [sourceKind, setSourceKind] = useState<'image' | 'pdf' | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PdfJsDocument | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [mode, setMode] = useState<ScanMode>('ultra');
  const [contrast, setContrast] = useState(118);
  const [brightness, setBrightness] = useState(104);
  const [sharpness, setSharpness] = useState(45);
  const [resolutionScale, setResolutionScale] = useState(1);
  const [threshold, setThreshold] = useState(154);
  const [rotation, setRotation] = useState(0);
  const [autoRectify, setAutoRectify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);

  const renderPdfPage = useCallback(async (doc: PdfJsDocument, page: number) => {
    const pdfPage = await doc.getPage(page);
    const viewport = pdfPage.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare this PDF page.');
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    const pageCanvas = autoRectify ? await autoRectifyPage(canvas).catch(() => canvas) : canvas;
    setSourceCanvas(pageCanvas);
    setPageNumber(page);
    setRotation(0);
  }, [autoRectify]);

  const acceptFile = async (file: File) => {
    setError(''); setStatus(''); setBusy(true);
    setPdfDocument(null);
    try {
      if (file.size > 35 * 1024 * 1024) throw new Error('File is larger than 35 MB. Please choose a smaller file.');
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfjs = await loadPdfJs();
        const bytes = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data: bytes }).promise;
        setPdfDocument(doc); setPageCount(doc.numPages); setSourceKind('pdf');
        await renderPdfPage(doc, 1);
        setStatus(`PDF loaded: ${doc.numPages} page(s). Choose a page or export the full PDF.`);
      } else if (file.type.startsWith('image/')) {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 4200 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not read this image.');
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const rectified = autoRectify ? await autoRectifyPage(canvas).catch(() => canvas) : canvas;
        setSourceCanvas(rectified); setSourceKind('image'); setPageCount(1); setPageNumber(1); setRotation(0);
        setStatus('Image loaded. Select an enhancement mode and review the new page.');
      } else {
        throw new Error('Please upload a JPG, JPEG, PNG, WEBP or PDF file.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open this file.');
    } finally { setBusy(false); }
  };

  const rotateCanvas = (source: HTMLCanvasElement, degrees: number) => {
    const swap = degrees % 180 !== 0;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? source.height : source.width;
    canvas.height = swap ? source.width : source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return source;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(source, -source.width / 2, -source.height / 2);
    return canvas;
  };

  useEffect(() => {
    if (!sourceCanvas || !outputRef.current) return;
    // Render a lightweight live preview; keep the full-resolution source for exports.
    const frame = window.requestAnimationFrame(() => {
      const rotated = rotateCanvas(sourceCanvas, rotation);
      const previewScale = Math.min(1, 1500 / Math.max(rotated.width, rotated.height));
      const previewSource = document.createElement('canvas');
      previewSource.width = Math.max(1, Math.round(rotated.width * previewScale));
      previewSource.height = Math.max(1, Math.round(rotated.height * previewScale));
      const previewCtx = previewSource.getContext('2d');
      if (!previewCtx) return;
      previewCtx.imageSmoothingEnabled = true;
      previewCtx.imageSmoothingQuality = 'high';
      previewCtx.drawImage(rotated, 0, 0, previewSource.width, previewSource.height);
      const processed = enhanceCanvas(previewSource, mode, contrast, brightness, sharpness, threshold);
      const target = outputRef.current;
      if (!target) return;
      target.width = processed.width; target.height = processed.height;
      const ctx = target.getContext('2d');
      if (ctx) ctx.drawImage(processed, 0, 0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [sourceCanvas, mode, contrast, brightness, sharpness, threshold, rotation]);

  const changePdfPage = async (next: number) => {
    if (!pdfDocument || next < 1 || next > pageCount) return;
    setBusy(true); setError('');
    try { await renderPdfPage(pdfDocument, next); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not render this PDF page.'); }
    finally { setBusy(false); }
  };

  const buildExportCanvas = () => {
    if (!sourceCanvas) return null;
    const rotated = rotateCanvas(sourceCanvas, rotation);
    const enhanced = enhanceCanvas(rotated, mode, contrast, brightness, sharpness, threshold);
    return upscaleCanvas(enhanced, resolutionScale);
  };

  const downloadImage = () => {
    const canvas = buildExportCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'tanshu_ultra_enhanced_scan.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.96);
    link.click();
  };

  const downloadCurrentPdf = () => {
    const canvas = buildExportCanvas();
    if (!canvas) return;
    const doc = new jsPDF({ orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    const w = canvas.width > canvas.height ? 297 : 210;
    const h = canvas.width > canvas.height ? 210 : 297;
    const ratio = Math.min(w / canvas.width, h / canvas.height);
    const drawW = canvas.width * ratio, drawH = canvas.height * ratio;
    doc.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
    doc.save(`tanshu_scanned_page_${pageNumber}.pdf`);
  };

  const downloadAllPdfPages = async () => {
    if (!pdfDocument) return;
    setBusy(true); setError(''); setStatus('Preparing enhanced PDF pages…');
    try {
      let output: jsPDF | null = null;
      for (let page = 1; page <= pdfDocument.numPages; page++) {
        const pdfPage = await pdfDocument.getPage(page);
        const viewport = pdfPage.getViewport({ scale: 2 });
        const raw = document.createElement('canvas');
        raw.width = Math.round(viewport.width); raw.height = Math.round(viewport.height);
        const rawCtx = raw.getContext('2d');
        if (!rawCtx) throw new Error(`Could not process PDF page ${page}.`);
        await pdfPage.render({ canvasContext: rawCtx, viewport }).promise;
        const pageCanvas = autoRectify ? await autoRectifyPage(raw).catch(() => raw) : raw;
        const rotated = rotateCanvas(pageCanvas, rotation);
        const enhanced = upscaleCanvas(enhanceCanvas(rotated, mode, contrast, brightness, sharpness, threshold), resolutionScale);
        const landscape = enhanced.width > enhanced.height;
        const w = landscape ? 297 : 210, h = landscape ? 210 : 297;
        if (!output) output = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
        else output.addPage('a4', landscape ? 'landscape' : 'portrait');
        const ratio = Math.min(w / enhanced.width, h / enhanced.height);
        const dw = enhanced.width * ratio, dh = enhanced.height * ratio;
        output.addImage(enhanced.toDataURL('image/jpeg', 0.94), 'JPEG', (w - dw) / 2, (h - dh) / 2, dw, dh);
        setStatus(`Enhancing page ${page} of ${pdfDocument.numPages}…`);
      }
      output?.save('tanshu_ultra_enhanced_document.pdf');
      setStatus('All PDF pages exported successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export all PDF pages.');
    } finally { setBusy(false); }
  };

  const modes: { id: ScanMode; label: string; description: string }[] = [
    { id: 'ultra', label: 'ULTRA ENHANCE', description: 'Shadow flattening · Text edge clarity' },
    { id: 'magic-color', label: 'MAGIC COLOR', description: 'Bright page · Retain colored stamps' },
    { id: 'bw', label: 'BLACK & WHITE', description: 'High-contrast document scan' },
    { id: 'grayscale', label: 'CLEAN GRAYSCALE', description: 'Natural photocopy finish' },
    { id: 'original', label: 'ORIGINAL', description: 'Keep source appearance' },
  ];

  return (
    <div className="flex min-h-full flex-col gap-4 bg-slate-100 p-3 sm:p-5 lg:p-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-300"><ScanLine className="h-4 w-4" /> TANSHU ONLINE · DOCUMENT WORKSPACE</div>
            <h2 className="text-xl font-extrabold sm:text-2xl">Document Scanner & Image Rectifier</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">Turn document photos and PDF pages into clean, straight, scan-style pages with Ultra Enhance.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"><ShieldCheck className="h-4 w-4" /> Browser-side processing</div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div>
            <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-extrabold text-slate-900">1. Upload Document</h3><span className="text-[10px] font-semibold text-slate-500">IMAGE + PDF</span></div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/*,application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void acceptFile(f); e.currentTarget.value = ''; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-white px-4 py-5 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60">
              <span className="rounded-xl bg-blue-100 p-3 text-blue-700"><Upload className="h-5 w-5" /></span>
              <span><strong className="block text-sm text-slate-900">{sourceCanvas ? 'Document loaded · Choose another to replace' : 'Choose Photo or PDF'}</strong><small className="text-xs text-slate-500">JPG · PNG · WEBP · Multi-page PDF · Max 35 MB</small></span>
            </button>
            {sourceKind === 'pdf' && <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2"><button type="button" onClick={() => void changePdfPage(pageNumber - 1)} disabled={pageNumber <= 1 || busy} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span className="text-xs font-bold text-slate-700">Page {pageNumber} of {pageCount}</span><button type="button" onClick={() => void changePdfPage(pageNumber + 1)} disabled={pageNumber >= pageCount || busy} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div>}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">2. Scan Quality</h3>
            <div className="grid grid-cols-1 gap-2">
              {modes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-xl border p-3 text-left transition ${mode === item.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}><span className="flex items-center justify-between gap-2"><strong className="text-xs font-extrabold text-slate-900">{item.label}</strong>{mode === item.id && <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[9px] font-bold text-white">ACTIVE</span>}</span><small className="mt-1 block text-[11px] text-slate-500">{item.description}</small></button>)}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><SlidersHorizontal className="h-4 w-4" /> 3. Fine Tune</div>
            <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
              <div className="text-xs font-bold text-slate-800">Output Resolution</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setResolutionScale(1)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${resolutionScale === 1 ? 'border-blue-600 bg-white text-blue-800 ring-1 ring-blue-200' : 'border-slate-200 bg-white text-slate-600'}`}>Standard 1×</button>
                <button type="button" onClick={() => setResolutionScale(2)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${resolutionScale === 2 ? 'border-blue-600 bg-white text-blue-800 ring-1 ring-blue-200' : 'border-slate-200 bg-white text-slate-600'}`}>High Resolution up to 2×</button>
              </div>
              <p className="text-[10px] leading-4 text-slate-500">2× uses high-quality resampling and a light detail pass. It improves output size, but cannot recreate details missing from a blurry original.</p>
            </div>
            {[
              { label: 'Text / Contrast', value: contrast, min: 80, max: 165, set: setContrast },
              { label: 'Page Brightness', value: brightness, min: 80, max: 130, set: setBrightness },
              { label: 'Edge Sharpness', value: sharpness, min: 0, max: 100, set: setSharpness },
              ...(mode === 'bw' ? [{ label: 'B&W Threshold', value: threshold, min: 80, max: 210, set: setThreshold }] : []),
            ].map((item) => <label key={item.label} className="block"><span className="mb-1 flex justify-between text-xs text-slate-600"><span>{item.label}</span><strong className="font-mono text-slate-800">{item.value}</strong></span><input type="range" min={item.min} max={item.max} value={item.value} onChange={(e) => item.set(Number(e.target.value))} className="w-full accent-blue-700" /></label>)}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={autoRectify} onChange={(e) => setAutoRectify(e.target.checked)} className="h-4 w-4 accent-blue-700" /> Auto detect edges & straighten next upload</label>
            <div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-600">Page rotation</span><button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} disabled={!sourceCanvas} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" /> Rotate 90°</button></div>
            <button type="button" onClick={() => { setMode('ultra'); setContrast(118); setBrightness(104); setSharpness(45); setResolutionScale(1); setThreshold(154); setRotation(0); setAutoRectify(false); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"><RefreshCw className="h-3.5 w-3.5" /> Reset enhancements</button>
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-extrabold text-slate-900">Live Clean Page Preview</h3><p className="text-xs text-slate-500">The output updates as you adjust quality settings.</p></div>{sourceCanvas && <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">READY TO REVIEW</span>}</div>
          <div className="flex min-h-[min(72vh,820px)] items-center justify-center overflow-auto rounded-2xl border border-slate-300 bg-slate-200 p-3 sm:p-5">
            <canvas ref={outputRef} className="block h-auto max-h-[min(76vh,900px)] max-w-full bg-white shadow-xl" style={{ width: 'auto' }} />
            {!sourceCanvas && <div className="max-w-sm py-12 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow"><FileText className="h-8 w-8" /></div><h4 className="text-base font-extrabold text-slate-700">Your new document page will appear here</h4><p className="mt-2 text-xs leading-5 text-slate-500">Upload a crumpled, shadowed or angled document photo, or choose a PDF. Start with Ultra Enhance and inspect the text at full zoom.</p></div>}
          </div>
          {sourceCanvas && <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>Live preview: {outputRef.current?.width.toLocaleString()} × {outputRef.current?.height.toLocaleString()} px</span><span>Full-resolution source is used for downloads.</span></div>}
          {sourceCanvas && <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={downloadImage} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow hover:bg-slate-800"><ImageIcon className="h-4 w-4" /> Download Enhanced JPG</button><button type="button" onClick={downloadCurrentPdf} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow hover:bg-blue-800"><Download className="h-4 w-4" /> Download Current Page PDF</button>{sourceKind === 'pdf' && <button type="button" onClick={() => void downloadAllPdfPages()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-50 sm:col-span-2"><FileText className="h-4 w-4" /> {busy ? 'Processing PDF…' : `Enhance & Export All ${pageCount} PDF Pages`}</button>}</div>}
          {busy && <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">{status || 'Processing your document…'}</p>}
          {status && !busy && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">{status}</p>}
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">{error}</p>}
        </section>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><div className="mb-1 flex items-center gap-2 font-extrabold"><WandSparkles className="h-4 w-4" /> About Ultra Enhance</div>Ultra Enhance balances page lighting while preserving document colors, reduces broad shadows and strengthens existing text edges for a cleaner, more readable scan. High Resolution uses up to 2× careful resampling within a safe memory limit; it does not recreate missing letters or guarantee recovery of text hidden by deep folds, blur or damage. For best results, use a sharp, well-lit photo and review the output before submitting it to an official portal. Files are processed in your browser; PDF rendering and automatic page-edge detection load PDF.js and OpenCV.js from public CDNs.</div>
    </div>
  );
};
