import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload, Download, Printer, RefreshCw, ImagePlus, ShieldCheck,
  Sparkles, CheckCircle2, Zap, SlidersHorizontal, FileDown, Trash2
} from 'lucide-react';

type Slot = 'photo' | 'signature';
type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'original';
type FitMode = 'contain' | 'cover';
type DimensionUnit = 'px' | 'cm' | 'mm' | 'in';
const fromPixels = (pixels: number, unit: DimensionUnit, dpi: number) => {
  const converted = unit === 'px' ? pixels : unit === 'in' ? pixels / dpi : unit === 'cm' ? pixels * 2.54 / dpi : pixels * 25.4 / dpi;
  return unit === 'px' ? Math.round(converted) : Number(converted.toFixed(2));
};
const toPixels = (value: number, unit: DimensionUnit, dpi: number) => Math.round(
  unit === 'px' ? value : unit === 'in' ? value * dpi : unit === 'cm' ? value * dpi / 2.54 : value * dpi / 25.4
);
type Settings = { width: number; height: number; dpi: number; targetKB: number; format: OutputFormat; fit: FitMode; quality: number; zoom: number; cropX: number; cropY: number; preserveOriginal: boolean };
type Asset = {
  file: File;
  sourceUrl: string;
  outputUrl?: string;
  outputBlob?: Blob;
  outputBytes?: number;
  warning?: string;
  outputWidth?: number;
  outputHeight?: number;
  outputQuality?: number;
  sourceWidth?: number;
  sourceHeight?: number;
};
type Preset = { label: string; photo: Settings; signature: Settings };

const DEFAULT_PHOTO: Settings = { width: 413, height: 531, dpi: 300, targetKB: 50, format: 'image/jpeg', fit: 'contain', quality: 0.98, zoom: 1, cropX: 0, cropY: 0, preserveOriginal: false };
const DEFAULT_SIGNATURE: Settings = { width: 140, height: 60, dpi: 300, targetKB: 20, format: 'image/jpeg', fit: 'contain', quality: 0.88, zoom: 1, cropX: 0, cropY: 0, preserveOriginal: false };
const makePreset = (label: string, photo: Partial<Settings>, signature: Partial<Settings>): Preset => ({
  label,
  photo: { ...DEFAULT_PHOTO, ...photo },
  signature: { ...DEFAULT_SIGNATURE, ...signature }
});
const PRESETS: Preset[] = [
  makePreset('SSC / Exam Starter', { width: 413, height: 531, targetKB: 50, quality: 0.98 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('UPSC Starter', { width: 300, height: 350, targetKB: 100 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Railway Starter', { width: 413, height: 531, targetKB: 50, quality: 0.98 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Bihar Exam Starter', { width: 413, height: 531, targetKB: 50, quality: 0.98 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Compact Upload', { width: 100, height: 120, targetKB: 20 }, { width: 100, height: 40, targetKB: 10 }),
  makePreset('Legacy Signature 140×60 · 10–20 KB', {}, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Legacy Signature 200×100', {}, { width: 200, height: 100, targetKB: 20 })
];


const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

async function createZip(files: Array<{ name: string; blob: Blob }>) {
  const encoder = new TextEncoder();
  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let offset = 0;
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + (part as Uint8Array).length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}

const formatBytes = (bytes: number) => bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
const readImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('The selected image could not be opened.'));
  image.src = url;
});
const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image export failed.')), type, quality));

function drawImageToCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement, settings: Settings) {
  const width = settings.preserveOriginal ? image.naturalWidth : Math.max(5, Math.min(4000, Math.round(settings.width || 200)));
  const height = settings.preserveOriginal ? image.naturalHeight : Math.max(5, Math.min(4000, Math.round(settings.height || 230)));
  if (settings.preserveOriginal && (image.naturalWidth > 4000 || image.naturalHeight > 4000)) {
    throw new Error('The original image exceeds 4000 px on one side. Turn off original-dimension mode and choose smaller dimensions.');
  }
  if (width * height > 12000000) throw new Error('Please choose dimensions under 12 megapixels.');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');
  // Preserve transparent pixels for PNG/WebP; flatten JPEG on white.
  context.clearRect(0, 0, width, height);
  if (settings.format === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  const scale = settings.preserveOriginal ? 1 : settings.fit === 'cover'
    ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
    : Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const zoom = settings.preserveOriginal ? 1 : Math.max(1, settings.zoom || 1);
  const drawWidth = image.naturalWidth * scale * zoom;
  const drawHeight = image.naturalHeight * scale * zoom;
  const overflowX = Math.max(0, drawWidth - width);
  const overflowY = Math.max(0, drawHeight - height);
  const offsetX = settings.preserveOriginal ? 0 : Math.max(-1, Math.min(1, settings.cropX || 0));
  const offsetY = settings.preserveOriginal ? 0 : Math.max(-1, Math.min(1, settings.cropY || 0));
  context.drawImage(image, (width - drawWidth) / 2 - (overflowX / 2) * offsetX, (height - drawHeight) / 2 - (overflowY / 2) * offsetY, drawWidth, drawHeight);
  return { width, height };
}

const CropPreview: React.FC<{ sourceUrl: string; settings: Settings; label: string }> = ({ sourceUrl, settings, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    readImage(sourceUrl).then((image) => {
      if (!cancelled && canvasRef.current) drawImageToCanvas(canvasRef.current, image, settings);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [sourceUrl, settings.width, settings.height, settings.format, settings.fit, settings.zoom, settings.cropX, settings.cropY, settings.preserveOriginal]);
  return <canvas
    ref={canvasRef}
    aria-label={label}
    className="block h-auto w-full max-w-[240px] rounded-lg"
    style={{
      backgroundColor: '#ffffff',
      backgroundImage: 'linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)',
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0,0 8px,8px -8px,-8px 0px'
    }}
  />;
};

const addDpiMetadata = async (blob: Blob, dpi: number): Promise<Blob> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const density = Math.max(1, Math.min(65535, Math.round(dpi)));
  if (blob.type === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8) {
    const segment = new Uint8Array(18);
    segment.set([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01], 0);
    segment[12] = density >> 8; segment[13] = density & 255;
    segment[14] = density >> 8; segment[15] = density & 255;
    let replaceUntil = 2;
    if (bytes[2] === 0xff && bytes[3] === 0xe0 && bytes[6] === 0x4a && bytes[7] === 0x46 && bytes[8] === 0x49 && bytes[9] === 0x46) {
      replaceUntil = 2 + 2 + ((bytes[4] << 8) | bytes[5]);
    }
    const output = new Uint8Array(bytes.length - (replaceUntil - 2) + segment.length);
    output.set(bytes.subarray(0, 2));
    output.set(segment, 2);
    output.set(bytes.subarray(replaceUntil), 2 + segment.length);
    return new Blob([output], { type: blob.type });
  }
  if (blob.type === 'image/png' && bytes[0] === 0x89 && bytes[1] === 0x50) {
    const ppm = Math.round(density / 0.0254);
    const chunk = new Uint8Array(21);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, 9, false);
    chunk.set([0x70, 0x48, 0x59, 0x73], 4);
    view.setUint32(8, ppm, false); view.setUint32(12, ppm, false); chunk[16] = 1;
    view.setUint32(17, crc32(chunk.subarray(4, 17)), false);
    const output = new Uint8Array(bytes.length + chunk.length);
    output.set(bytes.subarray(0, 33), 0);
    output.set(chunk, 33);
    output.set(bytes.subarray(33), 54);
    return new Blob([output], { type: blob.type });
  }
  return blob;
};

async function renderImage(asset: Asset, settings: Settings) {
  const image = await readImage(asset.sourceUrl);
  const sourceType = ['image/jpeg', 'image/png', 'image/webp'].includes(asset.file.type) ? asset.file.type : 'image/jpeg';
  const outputType = settings.format === 'original' ? sourceType : settings.format;
  const canvas = document.createElement('canvas');
  const { width, height } = drawImageToCanvas(canvas, image, settings);
  const targetBytes = Math.max(5, Math.min(50 * 1024, settings.targetKB || 50)) * 1024;
  const maxQuality = Math.max(0.3, Math.min(1, settings.quality || 0.88));
  let actualQuality = outputType === 'image/jpeg' || outputType === 'image/webp' ? maxQuality : 1;
  let blob = await canvasBlob(canvas, outputType, outputType === 'image/jpeg' || outputType === 'image/webp' ? maxQuality : 0.92);
  if (outputType === 'image/jpeg' || outputType === 'image/webp') {
    if (blob.size > targetBytes) {
      let low = 0.3;
      let high = maxQuality;
      let best: Blob | null = null;
      let bestQuality = 0.3;
      for (let i = 0; i < 12; i++) {
        const quality = (low + high) / 2;
        const candidate = await canvasBlob(canvas, outputType, quality);
        if (candidate.size <= targetBytes) {
          best = candidate;
          bestQuality = quality;
          low = quality;
        } else {
          high = quality;
        }
      }
      if (best) {
        blob = best;
        actualQuality = bestQuality;
      } else {
        blob = await canvasBlob(canvas, outputType, 0.3);
        actualQuality = 0.3;
      }
    }
  }
  if (blob.type === 'image/jpeg' || blob.type === 'image/png') blob = await addDpiMetadata(blob, settings.dpi);
  const warning = (outputType === 'image/png' || outputType === 'image/webp') && blob.size > targetBytes
    ? `${outputType === 'image/png' ? 'PNG' : 'WEBP'} compression may not reach the maximum KB. Try JPG or smaller dimensions.`
    : blob.size > targetBytes
      ? 'Target KB could not be reached at the minimum 30% quality. Reduce width and height or increase the target KB.'
      : '';
  return { blob, width, height, warning, actualQuality };
}

export const PhotoSignatureResizerTool: React.FC = () => {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [assets, setAssets] = useState<Record<Slot, Asset | null>>({ photo: null, signature: null });
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const revisionsRef = useRef<Record<Slot, number>>({ photo: 0, signature: 0 });
  const [settings, setSettings] = useState<Record<Slot, Settings>>({ photo: DEFAULT_PHOTO, signature: DEFAULT_SIGNATURE });
  const [dimensionUnits, setDimensionUnits] = useState<Record<Slot, DimensionUnit>>({ photo: 'px', signature: 'px' });
  const [sizeUnits, setSizeUnits] = useState<Record<Slot, 'KB' | 'MB'>>({ photo: 'KB', signature: 'KB' });
  const [activePreset, setActivePreset] = useState('custom');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const isHindi = language === 'hi';

  const copy = useMemo(() => isHindi ? {
    subtitle: 'सरकारी फॉर्म, नौकरी आवेदन और ऑनलाइन सेवाओं के लिए फोटो और सिग्नेचर तैयार करें।',
    quality: 'JPG क्वालिटी', zoom: 'क्रॉप ज़ूम', cropX: 'बाएँ / दाएँ', cropY: 'ऊपर / नीचे', qualityHint: 'ज़्यादा क्वालिटी = बेहतर डिटेल, बड़ा KB। चुना हुआ KB अधिकतम सीमा है, फाइल का ठीक उतना होना जरूरी नहीं।', cropHint: 'फोटो को फ्रेम में सही जगह सेट करें।',
    upload: '01 · अपनी फाइल अपलोड करें',
    photo: 'पासपोर्ट / फॉर्म फोटो',
    signature: 'सिग्नेचर',
    clickUpload: 'फाइल चुनने के लिए क्लिक करें',
    presets: '02 · तैयार फॉर्म Presets',
    settings: '03 · अलग-अलग आउटपुट सेटिंग',
    width: 'चौड़ाई',
    height: 'ऊँचाई',
    target: 'अधिकतम फाइल साइज़',
    dimensionUnit: 'डाइमेंशन यूनिट',
    dpi: 'प्रिंट DPI',
    dpiHint: 'DPI प्रिंट की डेंसिटी बताता है; असली डिटेल पिक्सेल पर निर्भर करती है।',
    quickSizes: 'जल्दी KB चुनें',
    format: 'Save Image As',
    fit: 'फिटिंग',
    contain: 'पूरा फोटो दिखाएँ',
    cover: 'फ्रेम भरें (क्रॉप)',
    process: 'दोनों Resize करें',
    processBoth: 'दोनों Resize करें',
    processPhoto: 'फोटो Resize करें',
    processSignature: 'सिग्नेचर Resize करें',
    downloadBoth: 'दोनों ZIP में डाउनलोड करें',
    print: 'Print Preview',
    reset: 'रीसेट',
    result: '04 · Original और Final Preview',
    original: 'Original',
    final: 'Final Output',
    download: 'डाउनलोड करें',
    noFile: 'अभी कोई फाइल नहीं',
    note: 'ये Presets केवल शुरुआती उदाहरण हैं, किसी सरकारी विभाग के आधिकारिक मानक नहीं। आवेदन जमा करने से पहले संबंधित फॉर्म की नवीनतम फोटो और सिग्नेचर शर्तें जाँचें।',
    privacy: 'आपकी फोटो और सिग्नेचर इसी ब्राउज़र में प्रोसेस होते हैं; इस टूल द्वारा हमारे सर्वर पर अपलोड नहीं किए जाते।',
    ready: 'तैयार है — फोटो या सिग्नेचर अपलोड करें।',
    choose: 'फाइल चुनें',
    size: 'फाइल साइज़',
    limit: 'JPG, PNG या WEBP · अधिकतम 20 MB',
    choosePreset: 'Preset लागू हुआ। आधिकारिक निर्देश जाँचना न भूलें।',
    noOutput: 'पहले Resize करें।',
    done: 'प्रोसेसिंग पूरी हुई। नीचे रिजल्ट देखें।',
    onlyPhoto: 'फोटो',
    onlySign: 'सिग्नेचर'
  } : {
    subtitle: 'Prepare photo and signature files for government forms, job applications and online services.',
    quality: 'JPG Quality', zoom: 'Crop zoom', cropX: 'Left / Right', cropY: 'Up / Down', qualityHint: 'Higher quality keeps more detail but increases KB. Target KB is a maximum, not an exact file size.', cropHint: 'Position the image inside the frame.',
    upload: '01 · Upload Your Files',
    photo: 'Passport / Form Photo',
    signature: 'Signature',
    clickUpload: 'Click to choose a file',
    presets: '02 · Ready-made Form Presets',
    settings: '03 · Separate Output Settings',
    width: 'Width',
    height: 'Height',
    target: 'Maximum File Size',
    dimensionUnit: 'Dimension unit',
    dpi: 'Print DPI',
    dpiHint: 'DPI sets print density; actual image detail depends on pixel dimensions.',
    quickSizes: 'Quick KB targets',
    format: 'Save Image As',
    fit: 'Fit mode',
    contain: 'Fit inside',
    cover: 'Fill frame (crop)',
    process: 'Resize Both',
    processBoth: 'Resize Both',
    processPhoto: 'Resize Photo',
    processSignature: 'Resize Signature',
    downloadBoth: 'Download Both (ZIP)',
    print: 'Print Preview',
    reset: 'Reset',
    result: '04 · Original & Final Preview',
    original: 'Original',
    final: 'Final Output',
    download: 'Download',
    noFile: 'No file selected yet',
    note: 'These presets are starter examples, not official department specifications. Always check the latest photo and signature requirements on the relevant application form.',
    privacy: 'Your photos and signatures are processed in this browser and are not uploaded to our servers by this tool.',
    ready: 'Ready — upload a photo or signature to begin.',
    choose: 'Choose file',
    size: 'File size',
    limit: 'JPG, PNG or WEBP · Max 20 MB',
    choosePreset: 'Preset applied. Please verify the official instructions.',
    noOutput: 'Resize the files first.',
    done: 'Processing complete. Review your results below.',
    onlyPhoto: 'Photo',
    onlySign: 'Signature'
  }, [isHindi]);

  useEffect(() => () => {
    (['photo', 'signature'] as Slot[]).forEach((slot) => {
      const asset = assetsRef.current[slot];
      if (asset?.sourceUrl) URL.revokeObjectURL(asset.sourceUrl);
      if (asset?.outputUrl) URL.revokeObjectURL(asset.outputUrl);
    });
  }, []);

  const clearOutput = (slot: Slot) => {
    revisionsRef.current[slot] += 1;
    const existing = assetsRef.current[slot];
    if (existing?.outputUrl) URL.revokeObjectURL(existing.outputUrl);
    setAssets((current) => {
      const asset = current[slot];
      if (!asset) return current;
      const { outputUrl, outputBlob, outputBytes, warning, outputWidth, outputHeight, outputQuality, ...source } = asset;
      return { ...current, [slot]: source };
    });
  };

  const updateSetting = (slot: Slot, key: keyof Settings, value: string | number | boolean) => {
    setSettings((current) => ({ ...current, [slot]: { ...current[slot], [key]: value } as Settings }));
    setActivePreset('custom');
    clearOutput(slot);
  };

  const clearAsset = (slot: Slot) => {
    revisionsRef.current[slot] += 1;
    const previous = assetsRef.current[slot];
    if (previous?.sourceUrl) URL.revokeObjectURL(previous.sourceUrl);
    if (previous?.outputUrl) URL.revokeObjectURL(previous.outputUrl);
    setAssets((current) => ({ ...current, [slot]: null }));
    setStatus(isHindi ? (slot === 'photo' ? 'फोटो हटा दी गई।' : 'सिग्नेचर हटा दिया गया।') : `${slot === 'photo' ? 'Photo' : 'Signature'} removed.`);
  };

  const handleFile = (slot: Slot, file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatus(isHindi ? 'कृपया JPG, PNG या WEBP इमेज चुनें।' : 'Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatus(isHindi ? 'फाइल 20 MB से बड़ी है।' : 'The selected file is larger than 20 MB.');
      return;
    }
    revisionsRef.current[slot] += 1;
    const previous = assetsRef.current[slot];
    if (previous?.sourceUrl) URL.revokeObjectURL(previous.sourceUrl);
    if (previous?.outputUrl) URL.revokeObjectURL(previous.outputUrl);
    const sourceUrl = URL.createObjectURL(file);
    setAssets((current) => ({ ...current, [slot]: { file, sourceUrl } }));
    readImage(sourceUrl).then((image) => {
      setAssets((current) => current[slot]?.sourceUrl === sourceUrl
        ? { ...current, [slot]: { ...current[slot]!, sourceWidth: image.naturalWidth, sourceHeight: image.naturalHeight } }
        : current);
    }).catch(() => undefined);
    setStatus((slot === 'photo' ? copy.onlyPhoto : copy.onlySign) + (isHindi ? ' अपलोड हो गया।' : ' uploaded successfully.'));
  };

  const applyPreset = (preset: Preset) => {
    setSettings({ photo: preset.photo, signature: preset.signature });
    (['photo', 'signature'] as Slot[]).forEach(clearOutput);
    setActivePreset(preset.label);
    setStatus(copy.choosePreset);
  };

  const processSlot = async (slot: Slot, revision: number, asset: Asset | null, slotSettings: Settings) => {
    if (!asset) return true;
    if (revisionsRef.current[slot] !== revision || assetsRef.current[slot]?.sourceUrl !== asset.sourceUrl) return false;
    const result = await renderImage(asset, slotSettings);
    if (revisionsRef.current[slot] !== revision || assetsRef.current[slot]?.sourceUrl !== asset.sourceUrl) return false;
    const outputUrl = URL.createObjectURL(result.blob);
    const latest = assetsRef.current[slot];
    if (latest?.outputUrl) URL.revokeObjectURL(latest.outputUrl);
    if (revisionsRef.current[slot] !== revision || assetsRef.current[slot]?.sourceUrl !== asset.sourceUrl) {
      URL.revokeObjectURL(outputUrl);
      return false;
    }
    setAssets((current) => {
      const currentAsset = current[slot];
      if (!currentAsset || currentAsset.sourceUrl !== asset.sourceUrl || revisionsRef.current[slot] !== revision) {
        URL.revokeObjectURL(outputUrl);
        return current;
      }
      return {
        ...current,
        [slot]: {
          ...currentAsset,
          outputUrl,
          outputBlob: result.blob,
          outputBytes: result.blob.size,
          warning: result.warning,
          outputWidth: result.width,
          outputHeight: result.height,
          outputQuality: result.actualQuality
        }
      };
    });
    return true;
  };

  const processOne = async (slot: Slot) => {
    const asset = assets[slot];
    if (!asset) {
      setStatus(isHindi ? (slot === 'photo' ? 'पहले फोटो अपलोड करें।' : 'पहले सिग्नेचर अपलोड करें।') : (slot === 'photo' ? 'Upload a photo first.' : 'Upload a signature first.'));
      return;
    }
    const revision = revisionsRef.current[slot];
    const slotSettings = { ...settings[slot] };
    setProcessing(true);
    setStatus(isHindi ? 'फाइल प्रोसेस हो रही है…' : 'Processing file…');
    try {
      const ok = await processSlot(slot, revision, asset, slotSettings);
      setStatus(ok ? (isHindi ? 'प्रोसेसिंग पूरी हुई।' : 'Processing complete.') : (isHindi ? 'फाइल या सेटिंग बदल गई। दोबारा Resize करें।' : 'File or settings changed. Please resize again.'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Image processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const processAll = async () => {
    if (!assets.photo && !assets.signature) {
      setStatus(isHindi ? 'पहले फोटो या सिग्नेचर अपलोड करें।' : 'Upload a photo or signature first.');
      return;
    }
    const run = {
      photo: { asset: assets.photo, settings: { ...settings.photo }, revision: revisionsRef.current.photo },
      signature: { asset: assets.signature, settings: { ...settings.signature }, revision: revisionsRef.current.signature }
    };
    setProcessing(true);
    setStatus(isHindi ? 'आपकी फाइलें प्रोसेस हो रही हैं…' : 'Processing your files…');
    try {
      const photoOk = await processSlot('photo', run.photo.revision, run.photo.asset, run.photo.settings);
      if (!photoOk) {
        setStatus(isHindi ? 'फोटो की सेटिंग या फाइल बदल गई। दोबारा Resize करें।' : 'Photo changed during processing. Please resize again.');
        return;
      }
      const signatureOk = await processSlot('signature', run.signature.revision, run.signature.asset, run.signature.settings);
      const photoStillCurrent = revisionsRef.current.photo === run.photo.revision;
      const signatureStillCurrent = revisionsRef.current.signature === run.signature.revision;
      if (!photoOk || !signatureOk || !photoStillCurrent || !signatureStillCurrent) {
        setStatus(isHindi ? 'सेटिंग या फाइल बदल गई है। कृपया दोबारा Resize करें।' : 'A file or setting changed during processing. Please resize again.');
        return;
      }
      setStatus(copy.done);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Image processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadSlot = (slot: Slot) => {
    const asset = assets[slot];
    if (!asset?.outputUrl) return;
    const outputType = asset.outputBlob?.type || 'image/jpeg';
    const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.href = asset.outputUrl;
    link.download = 'tanshu-online-' + slot + '.' + extension;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadBoth = async () => {
    const ready = (['photo', 'signature'] as Slot[]).filter((slot) => assets[slot]?.outputBlob);
    if (!ready.length) {
      setStatus(copy.noOutput);
      return;
    }
    try {
      const files = ready.map((slot) => {
        const asset = assets[slot]!;
        const extension = asset.outputBlob?.type === 'image/png' ? 'png' : asset.outputBlob?.type === 'image/webp' ? 'webp' : 'jpg';
        return { name: 'tanshu-online-' + slot + '.' + extension, blob: asset.outputBlob! };
      });
      const archive = await createZip(files);
      const archiveUrl = URL.createObjectURL(archive);
      const link = document.createElement('a');
      link.href = archiveUrl;
      link.download = 'tanshu-online-photo-signature.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(archiveUrl), 10000);
      setStatus(isHindi ? 'ZIP फाइल डाउनलोड हो रही है।' : 'ZIP archive download started.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : (isHindi ? 'ZIP फाइल नहीं बन सकी।' : 'Could not create the ZIP archive.'));
    }
  };

  const printPreview = () => {
    const ready = (['photo', 'signature'] as Slot[]).filter((slot) => assets[slot]?.outputUrl);
    if (!ready.length) {
      setStatus(copy.noOutput);
      return;
    }
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) {
      setStatus(isHindi ? 'Print Preview खोलने के लिए Pop-ups की अनुमति दें।' : 'Allow pop-ups to open the print preview.');
      return;
    }
    const cards = ready.map((slot) => {
      const asset = assets[slot]!;
      const dpi = settings[slot].dpi;
      const physicalWidth = ((asset.outputWidth || 0) / dpi).toFixed(2);
      const physicalHeight = ((asset.outputHeight || 0) / dpi).toFixed(2);
      const heading = slot === 'photo' ? (isHindi ? 'फोटो' : 'Photo') : (isHindi ? 'सिग्नेचर' : 'Signature');
      return '<section><h2>' + heading + '</h2><img class="print-image" style="width:' + physicalWidth + 'in;height:' + physicalHeight + 'in" src="' + asset.outputUrl + '" alt="' + slot + '"><p>' + asset.outputWidth + ' × ' + asset.outputHeight + ' px · ' + dpi + ' DPI · ' + physicalWidth + ' × ' + physicalHeight + ' in</p><p>' + formatBytes(asset.outputBytes || 0) + '</p></section>';
    }).join('');
    popup.document.write('<!doctype html><html lang="' + (isHindi ? 'hi' : 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TANSHU ONLINE ' + (isHindi ? 'प्रिंट प्रीव्यू' : 'Print Preview') + '</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#14243b}main{display:flex;gap:24px;flex-wrap:wrap}section{border:1px solid #cbd5e1;border-radius:12px;padding:16px;min-width:220px}.print-image{display:block;max-width:100%;max-height:320px;object-fit:contain}button{padding:10px 18px;background:#174ea6;color:white;border:0;border-radius:8px;font-weight:bold}@media print{button{display:none}body{padding:0}.print-image{max-width:none;max-height:none}}</style></head><body><h1>TANSHU ONLINE</h1><p>' + (isHindi ? 'फोटो और सिग्नेचर रिसाइज़र · प्रिंट प्रीव्यू' : 'Photo & Signature Resizer · Print Preview') + '</p><p>' + (isHindi ? 'सही फिजिकल साइज के लिए Print Scale 100% रखें।' : 'Set print scale to 100% for the exact physical size.') + '</p><main>' + cards + '</main><p><button onclick="window.print()">' + (isHindi ? 'प्रिंट करें' : 'Print') + '</button></p></body></html>');
    popup.document.close();
    popup.focus();
  };

  const reset = () => {
    (['photo', 'signature'] as Slot[]).forEach((slot) => {
      revisionsRef.current[slot] += 1;
      const asset = assetsRef.current[slot];
      if (asset?.sourceUrl) URL.revokeObjectURL(asset.sourceUrl);
      if (asset?.outputUrl) URL.revokeObjectURL(asset.outputUrl);
    });
    setAssets({ photo: null, signature: null });
    setSettings({ photo: DEFAULT_PHOTO, signature: DEFAULT_SIGNATURE });
    setActivePreset('custom');
    setStatus(copy.ready);
  };

  const renderUpload = (slot: Slot) => {
    const asset = assets[slot];
    const title = slot === 'photo' ? copy.photo : copy.signature;
    return (
      <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-slate-900">{slot === 'photo' ? '📷 ' : '✍️ '}{title}</h3>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-blue-700">{slot}</span>
        </div>
        <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-slate-50 to-blue-50/70 p-4 text-center transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 active:scale-[.99]">
          <ImagePlus className="mb-2 h-7 w-7 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-xs font-bold text-slate-800">{asset ? (isHindi ? 'दूसरी फाइल चुनें' : 'Choose another file') : copy.clickUpload}</span>
          <span className="mt-1 text-[10px] text-slate-500">{copy.limit}</span>
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
            const input = event.currentTarget;
            handleFile(slot, input.files?.[0]);
            input.value = '';
          }} />
        </label>
        {asset ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
            <img src={asset.sourceUrl} alt={title} className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800">{asset.file.name}</p>
              <p className="mt-1 text-[10px] text-slate-500">{copy.size}: {formatBytes(asset.file.size)}</p>
              <p className="text-[10px] text-emerald-700">{isHindi ? 'ब्राउज़र में सुरक्षित' : 'Local browser processing'}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-slate-400">{copy.noFile}</p>
        )}
      </div>
    );
  };

  const renderSettings = (slot: Slot) => {
    const current = settings[slot];
    const asset = assets[slot];
    const heading = slot === 'photo' ? copy.onlyPhoto : copy.onlySign;
    const unit = dimensionUnits[slot];
    const unitSuffix = unit === 'in' ? 'in' : unit;
    const sizeUnit = sizeUnits[slot];
    const fields: { key: 'width' | 'height' | 'targetKB'; label: string }[] = [
      { key: 'width', label: `${copy.width} (${unitSuffix})` },
      { key: 'height', label: `${copy.height} (${unitSuffix})` },
      { key: 'targetKB', label: `${copy.target} (${sizeUnit})` }
    ];
    const displayedWidth = current.preserveOriginal && asset?.sourceWidth
      ? fromPixels(asset.sourceWidth, unit, current.dpi) : fromPixels(current.width, unit, current.dpi);
    const displayedHeight = current.preserveOriginal && asset?.sourceHeight
      ? fromPixels(asset.sourceHeight, unit, current.dpi) : fromPixels(current.height, unit, current.dpi);
    return (
      <div className="grid min-h-[360px] grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-4 sm:p-4">
        <div className="min-w-0 max-h-[62vh] overflow-y-auto overscroll-contain pr-1 sm:max-h-[68vh]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">{slot === 'photo' ? '📷 ' : '✍️ '}{heading}</h3>
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fields.map((field) => (
              <label key={field.key} className="flex min-w-0 flex-col text-[10px] font-bold text-slate-500">
                <span className="flex min-h-[26px] items-end leading-tight">{field.label}</span>
                <input
                  type="number"
                  min={field.key === 'targetKB' ? (sizeUnit === 'MB' ? 0.01 : 5) : unit === 'px' ? 5 : 0.1}
                  max={field.key === 'targetKB' ? (sizeUnit === 'MB' ? 50 : 50 * 1024) : unit === 'px' ? 4000 : Number(fromPixels(4000, unit, current.dpi).toFixed(2))}
                  value={field.key === 'targetKB'
                    ? Number((sizeUnit === 'MB' ? current.targetKB / 1024 : current.targetKB).toFixed(2))
                    : field.key === 'width' ? displayedWidth : displayedHeight}
                  step={field.key === 'targetKB' ? (sizeUnit === 'MB' ? 0.01 : 1) : unit === 'px' ? 1 : 0.01}
                  disabled={current.preserveOriginal && field.key !== 'targetKB'}
                  onChange={(event) => {
                    const raw = event.target.value;
                    if (raw === '') return;
                    const parsed = Number(raw);
                    if (Number.isFinite(parsed)) {
                      const stored = field.key === 'targetKB' ? parsed * (sizeUnit === 'MB' ? 1024 : 1) : toPixels(parsed, unit, current.dpi);
                      updateSetting(slot, field.key, stored);
                    }
                  }}
                  onBlur={(event) => {
                    const entered = Number(event.currentTarget.value) || (field.key === 'targetKB' ? (sizeUnit === 'MB' ? 0.01 : 5) : unit === 'px' ? 5 : 0.1);
                    const maximum = field.key === 'targetKB' ? (sizeUnit === 'MB' ? 50 : 50 * 1024) : Number(fromPixels(4000, unit, current.dpi).toFixed(2));
                    const normalized = field.key === 'targetKB'
                      ? Math.max(sizeUnit === 'MB' ? 0.01 * 1024 : 5, Math.min(maximum, entered * (sizeUnit === 'MB' ? 1024 : 1)))
                      : Math.max(5, Math.min(4000, toPixels(Math.min(entered, maximum), unit, current.dpi)));
                    if (normalized !== current[field.key]) updateSetting(slot, field.key, normalized);
                    if ((field.key === 'height' && current.width * normalized > 12000000) ||
                        (field.key === 'width' && normalized * current.height > 12000000)) {
                      setStatus(isHindi
                        ? 'कुल आउटपुट 12 मेगापिक्सेल से अधिक है। चौड़ाई या ऊँचाई कम करें।'
                        : 'Output exceeds 12 megapixels. Reduce the width or height.');
                    }
                  }}
                  className="mt-1 h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                />
              </label>
            ))}
            <label className="text-[10px] font-bold text-slate-500">{copy.dimensionUnit}
              <select value={unit} onChange={(event) => setDimensionUnits((currentUnits) => ({ ...currentUnits, [slot]: event.target.value as DimensionUnit }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500">
                <option value="px">Pixels (px)</option><option value="cm">Centimeters (cm)</option><option value="mm">Millimeters (mm)</option><option value="in">Inches (in)</option>
              </select>
            </label>
            <label className="text-[10px] font-bold text-slate-500">{copy.dpi}
              <select value={current.dpi} onChange={(event) => updateSetting(slot, 'dpi', Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500">
                <option value={72}>72 DPI · Screen</option><option value={96}>96 DPI · Screen</option><option value={150}>150 DPI · General print</option><option value={200}>200 DPI · Print</option><option value={240}>240 DPI · Photo print</option><option value={300}>300 DPI · High-quality print</option>
              </select>
              <span className="mt-1 block text-[9px] font-medium leading-4 text-slate-400">{copy.dpiHint}</span>
            </label>
            <div className="col-span-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 sm:col-span-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-extrabold text-slate-700">{copy.quickSizes}</p>
                <select aria-label={isHindi ? 'फाइल साइज़ यूनिट' : 'File size unit'} value={sizeUnit} onChange={(event) => setSizeUnits((currentUnits) => ({ ...currentUnits, [slot]: event.target.value as 'KB' | 'MB' }))} className="rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-[10px] font-bold text-indigo-800">
                  <option value="KB">KB</option><option value="MB">MB</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {(sizeUnit === 'KB' ? [10, 20, 50, 100, 200, 500] : [1, 2, 5, 10]).map((amount) => {
                  const kb = sizeUnit === 'MB' ? amount * 1024 : amount;
                  return <button key={`${sizeUnit}-${amount}`} type="button" onClick={() => updateSetting(slot, 'targetKB', kb)} className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${Math.abs(current.targetKB - kb) < 0.5 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400'}`}>{amount} {sizeUnit}</button>;
                })}
              </div>
              <p className="mt-2 text-[9px] leading-4 text-slate-500">{isHindi ? 'KB और MB दोनों में कस्टम साइज़ ऊपर दर्ज कर सकते हैं। यह अधिकतम सीमा है।' : 'Enter a custom size above in KB or MB. This is a maximum file-size limit.'}</p>
            </div>
            <label className="text-[10px] font-bold text-slate-500">{copy.fit}
              <select value={current.fit} disabled={current.preserveOriginal} onChange={(event) => updateSetting(slot, 'fit', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="contain">{copy.contain}</option><option value="cover">{copy.cover}</option>
              </select>
            </label>
            <div className="col-span-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:col-span-3">
              <label className="flex cursor-pointer items-start gap-2 text-[10px] font-extrabold leading-5 text-slate-800">
                <input type="checkbox" checked={current.preserveOriginal} onChange={(event) => updateSetting(slot, 'preserveOriginal', event.target.checked)} className="mt-1 h-4 w-4 accent-blue-600" />
                <span>{isHindi ? 'सिर्फ KB कम करें — मूल फोटो का आकार और फ्रेमिंग न बदलें' : 'Compress only — keep original dimensions and framing'}</span>
              </label>
              <p className="mt-1 text-[9px] leading-4 text-slate-500">{isHindi ? 'इस विकल्प में फोटो Crop, Zoom या Position नहीं होगी। केवल चुने हुए फॉर्मेट और KB लक्ष्य के अनुसार फाइल दोबारा सेव होगी।' : 'This mode does not crop, zoom, or reposition the image. It only re-encodes it using the selected format and file-size target.'}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:col-span-3">
              <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[11px] font-extrabold text-slate-800">{copy.cropHint}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-700">{Math.round(current.zoom * 100)}%</span></div>
              <label className="block text-[10px] font-bold text-slate-600">{copy.zoom}
                <input type="range" min="1" max="3" step="0.05" value={current.zoom} disabled={current.preserveOriginal} onChange={(event) => updateSetting(slot, 'zoom', Number(event.target.value))} className="mt-2 w-full accent-blue-600 disabled:opacity-40" />
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="text-[10px] font-bold text-slate-600">{copy.cropX}
                  <span className="float-right rounded bg-white px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700">{current.cropX > 0 ? '+' : ''}{Math.round(current.cropX * 100)}%</span>
                  <input type="range" min="-1" max="1" step="0.02" value={current.cropX} disabled={current.preserveOriginal} onChange={(event) => updateSetting(slot, 'cropX', Number(event.target.value))} className="mt-2 w-full accent-blue-600 disabled:opacity-40" />
                </label>
                <label className="text-[10px] font-bold text-slate-600">{copy.cropY}
                  <span className="float-right rounded bg-white px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700">{current.cropY > 0 ? '+' : ''}{Math.round(current.cropY * 100)}%</span>
                  <input type="range" min="-1" max="1" step="0.02" value={current.cropY} disabled={current.preserveOriginal} onChange={(event) => updateSetting(slot, 'cropY', Number(event.target.value))} className="mt-2 w-full accent-blue-600 disabled:opacity-40" />
                </label>
              </div>
              {current.preserveOriginal && <p className="mt-2 text-[9px] font-semibold text-blue-800">{isHindi ? 'मूल फोटो सुरक्षित मोड चालू है — Crop/Zoom/Position लागू नहीं होंगे।' : 'Original-image mode is on — crop, zoom and position controls are paused.'}</p>}
            </div>
            <div className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 sm:col-span-3">
              <div className="flex items-center justify-between gap-2"><label className="text-[10px] font-extrabold text-slate-700">{copy.quality}</label><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700">{Math.round(current.quality * 100)}%</span></div>
              <input type="range" min="0.3" max="1" step="0.01" value={current.quality} onChange={(event) => updateSetting(slot, 'quality', Number(event.target.value))} className="mt-2 w-full accent-emerald-600" disabled={current.format === 'image/png' || (current.format === 'original' && asset?.file.type === 'image/png')} />
              <p className="mt-1 text-[10px] leading-4 text-slate-500">{copy.qualityHint}{current.format === 'image/png' || (current.format === 'original' && asset?.file.type === 'image/png') ? (isHindi ? ' PNG में यह सेटिंग लागू नहीं होती।' : ' This setting does not apply to PNG.') : ''}</p>
            </div>
          </div>
        </div>
        <aside className="min-w-0 self-start sm:sticky sm:top-2">
          <div className="relative rounded-xl border border-blue-100 bg-slate-50 p-2 shadow-inner">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-extrabold text-slate-700">{isHindi ? 'लाइव प्रीव्यू' : 'Live preview'}</p>
              {asset && <button type="button" onClick={() => clearAsset(slot)} aria-label={isHindi ? (slot === 'photo' ? 'फोटो हटाएँ' : 'सिग्नेचर हटाएँ') : (slot === 'photo' ? 'Remove photo' : 'Remove signature')} title={isHindi ? 'फाइल हटाएँ' : 'Remove file'} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
            {asset ? (
              <>
                <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                  <CropPreview sourceUrl={asset.sourceUrl} settings={current} label={heading + " live preview"} />
                </div>
                <p className="mt-2 break-words text-[9px] font-semibold text-slate-600">{current.preserveOriginal && asset.sourceWidth ? `${asset.sourceWidth} × ${asset.sourceHeight} px · ` : ''}{isHindi ? 'रियल-टाइम सेटिंग प्रीव्यू' : 'Real-time settings preview'}</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">{isHindi ? 'सेटिंग बदलते ही यह प्रीव्यू अपडेट होगा।' : 'This preview updates as you adjust the controls.'}</p>
              </>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-[10px] text-slate-400"><ImagePlus className="mb-2 h-6 w-6" />{copy.noFile}</div>
            )}
          </div>
        </aside>
      </div>
    );
  };

  const renderResult = (slot: Slot) => {
    const asset = assets[slot];
    const title = slot === 'photo' ? copy.onlyPhoto : copy.onlySign;
    const outputMime = asset?.outputBlob?.type || '';
    const outputFormatLabel = outputMime === 'image/jpeg' ? 'JPG' : outputMime === 'image/png' ? 'PNG' : outputMime === 'image/webp' ? 'WEBP' : '';
    const qualityLabel = outputMime === 'image/jpeg' || outputMime === 'image/webp'
      ? ` · ${Math.round((asset?.outputQuality || settings[slot].quality) * 100)}%`
      : '';
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-extrabold text-slate-900">{slot === 'photo' ? '📷 ' : '✍️ '}{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">{copy.original}</p>
            {asset ? <img src={asset.sourceUrl} alt="Original" className="h-28 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain" /> : <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50 text-[10px] text-slate-400">—</div>}
            <p className="mt-1 text-[9px] text-slate-500">{asset ? formatBytes(asset.file.size) : '—'}</p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-black uppercase tracking-wider text-emerald-600">{copy.final}</p>
            {asset?.outputUrl ? <img src={asset.outputUrl} alt="Final output" className="h-28 w-full rounded-lg border border-emerald-200 bg-slate-50 object-contain" /> : <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50 text-[10px] text-slate-400">—</div>}
            <p className="mt-1 text-[9px] text-slate-500">{asset?.outputBytes ? formatBytes(asset.outputBytes) : '—'}</p>
          </div>
        </div>
        {asset?.outputUrl && (
          <>
            <p className="mt-2 text-[10px] font-semibold text-slate-600">{asset.outputWidth} × {asset.outputHeight} px · {outputFormatLabel}{qualityLabel}</p>
            {asset.warning && <p className="mt-1 rounded-lg bg-amber-50 p-2 text-[10px] leading-4 text-amber-800">{asset.warning}</p>}
          </>
        )}
        {asset && <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <label className="block text-[10px] font-extrabold text-slate-700">{copy.format}
            <select value={settings[slot].format} onChange={(event) => updateSetting(slot, 'format', event.target.value)} className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500">
              <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option><option value="original">Original Format</option>
            </select>
          </label>
          {settings[slot].format === 'original' && <p className="mt-2 text-[9px] leading-4 text-slate-600">{isHindi ? 'Original Format में फाइल का JPG/PNG/WEBP प्रकार रखा जाता है, लेकिन चुने हुए आकार के अनुसार इमेज resize/crop और दोबारा encode होती है।' : 'Keeps the input JPG/PNG/WEBP format, but still resizes/crops and re-encodes the image; it is not a byte-for-byte copy.'}</p>}
        </div>}
        {asset && <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" disabled={processing} onClick={() => processOne(slot)} className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"><Zap className="h-3.5 w-3.5" />{slot === 'photo' ? copy.processPhoto : copy.processSignature}</button>
          <button type="button" disabled={!asset.outputUrl} onClick={() => downloadSlot(slot)} className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2.5 text-[11px] font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-40"><Download className="h-3.5 w-3.5" />{copy.download}</button>
        </div>}
      </div>
    );
  };

  return (
    <main className="min-h-full w-full bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07152f]/95 px-3 py-2.5 text-white shadow-lg backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5">
          <img src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg" alt="Tanshu Online logo" className="h-9 w-9 rounded-full border-2 border-blue-400 object-cover shadow-md sm:h-10 sm:w-10" />
          <div className="flex items-center gap-1 font-sans tracking-tight">
            <span className="text-sm font-black tracking-wide text-white sm:text-lg">TANSHU</span>
            <span className="text-sm font-black tracking-wide text-blue-300 sm:text-lg">ONLINE</span>
          </div>
          <span className="hidden text-xs font-medium text-blue-100/80 md:block">Photo & Signature Resizer</span>
          <div className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 p-0.5 shadow-sm" aria-label="Choose language">
            <button type="button" onClick={() => setLanguage('hi')} aria-pressed={isHindi} className={'rounded-md px-2 py-1.5 text-[10px] font-extrabold transition ' + (isHindi ? 'bg-white text-slate-900 shadow' : 'text-blue-100 hover:bg-white/10')}>हिंदी</button>
            <button type="button" onClick={() => setLanguage('en')} aria-pressed={!isHindi} className={'rounded-md px-2 py-1.5 text-[10px] font-extrabold transition ' + (!isHindi ? 'bg-white text-slate-900 shadow' : 'text-blue-100 hover:bg-white/10')}>EN</button>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#07152f] via-[#102d58] to-[#155e91] px-4 py-8 text-white sm:px-7 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-7 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold text-emerald-100"><ShieldCheck className="h-3.5 w-3.5" />{isHindi ? 'लोकल ब्राउज़र प्रोसेसिंग' : 'LOCAL BROWSER PROCESSING'}</div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">{isHindi ? 'Photo और Signature को सही Size में तैयार करें' : 'Resize Photos & Signatures with Precision'}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100/85">{copy.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['⚡ Quick Resize', '🎯 KB Target', '📄 Form Presets', '🖨️ Print Ready'].map((item) => <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-blue-50 shadow-sm">{item}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-200/40">
            <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-extrabold">{isHindi ? 'एक ही जगह पूरा वर्कफ़्लो' : 'A complete workflow in one place'}</span><Sparkles className="h-5 w-5 text-amber-300" /></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{n:'01',t:isHindi?'अपलोड':'UPLOAD',i:Upload},{n:'02',t:isHindi?'Resize':'RESIZE',i:SlidersHorizontal},{n:'03',t:isHindi?'डाउनलोड':'DOWNLOAD',i:FileDown}].map((step) => {
                const Icon = step.i;
                return <div key={step.n} className="rounded-xl border border-white/10 bg-white/10 p-3 transition duration-200 hover:-translate-y-1 hover:bg-white/15"><Icon className="mx-auto mb-2 h-5 w-5 text-cyan-200" /><span className="block text-[9px] font-black text-cyan-100">{step.n}</span><span className="mt-1 block text-[10px] font-bold text-white">{step.t}</span></div>;
              })}
            </div>
            <p className="mt-3 text-[10px] leading-5 text-blue-100/70">{isHindi ? 'फोटो और सिग्नेचर की अलग-अलग सेटिंग और अलग डाउनलोड।' : 'Separate settings and individual downloads for each file.'}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-black tracking-tight text-slate-900">{copy.upload}</h2><span className="text-[10px] font-semibold text-slate-400">JPG · PNG · WEBP</span></div>
          <div className="grid gap-4 md:grid-cols-2">{renderUpload('photo')}{renderUpload('signature')}</div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /><h2 className="text-sm font-black text-slate-900">{copy.presets}</h2></div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className={'rounded-xl border px-3 py-2 text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] ' + (activePreset === preset.label ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'border-blue-100 bg-white text-blue-800 hover:border-blue-400')}>{preset.label}</button>)}
            <button type="button" onClick={() => { setSettings({ photo: DEFAULT_PHOTO, signature: DEFAULT_SIGNATURE }); (['photo', 'signature'] as Slot[]).forEach(clearOutput); setActivePreset('custom'); }} className={'rounded-xl border px-3 py-2 text-[10px] font-extrabold transition-all ' + (activePreset === 'custom' ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700')}>Custom</button>
          </div>
          <p className="mt-3 text-[10px] leading-5 text-slate-500">{copy.note}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-black tracking-tight text-slate-900">{copy.settings}</h2>
          <div className="grid gap-4 lg:grid-cols-2">{renderSettings('photo')}{renderSettings('signature')}</div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button type="button" disabled={processing} onClick={processAll} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-wait disabled:opacity-60"><Zap className="h-4 w-4" />{processing ? (isHindi ? 'प्रोसेस हो रहा है…' : 'Processing…') : copy.processBoth}</button>
          <button type="button" onClick={downloadBoth} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-extrabold text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100"><Download className="h-4 w-4" />{copy.downloadBoth}</button>
          <button type="button" onClick={printPreview} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"><Printer className="h-4 w-4" />{copy.print}</button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-700"><RefreshCw className="h-4 w-4" />{copy.reset}</button>
        </div>
        {status && <div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-blue-900">{status}</div>}

        <div>
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><h2 className="text-sm font-black text-slate-900">{copy.result}</h2></div>
          <div className="grid gap-4 md:grid-cols-2">{renderResult('photo')}{renderResult('signature')}</div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div><p className="text-xs font-extrabold text-emerald-900">{isHindi ? 'आपकी फाइलें आपके पास रहती हैं' : 'Your files stay on your device'}</p><p className="mt-1 text-[10px] leading-5 text-emerald-800">{copy.privacy}</p></div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-[10px] text-slate-500">© TANSHU ONLINE · {isHindi ? 'फोटो और सिग्नेचर रिसाइज़र' : 'Photo & Signature Resizer'}</footer>
    </main>
  );
};
