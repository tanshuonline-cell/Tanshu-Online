import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload, Download, Printer, RefreshCw, ImagePlus, ShieldCheck,
  Sparkles, CheckCircle2, Zap, SlidersHorizontal, FileDown
} from 'lucide-react';

type Slot = 'photo' | 'signature';
type OutputFormat = 'image/jpeg' | 'image/png';
type FitMode = 'contain' | 'cover';
type Settings = { width: number; height: number; targetKB: number; format: OutputFormat; fit: FitMode; quality: number; zoom: number; cropX: number; cropY: number };
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
};
type Preset = { label: string; photo: Settings; signature: Settings };

const DEFAULT_PHOTO: Settings = { width: 200, height: 230, targetKB: 50, format: 'image/jpeg', fit: 'contain', quality: 0.88, zoom: 1, cropX: 0, cropY: 0 };
const DEFAULT_SIGNATURE: Settings = { width: 140, height: 60, targetKB: 20, format: 'image/jpeg', fit: 'contain', quality: 0.88, zoom: 1, cropX: 0, cropY: 0 };
const makePreset = (label: string, photo: Partial<Settings>, signature: Partial<Settings>): Preset => ({
  label,
  photo: { ...DEFAULT_PHOTO, ...photo },
  signature: { ...DEFAULT_SIGNATURE, ...signature }
});
const PRESETS: Preset[] = [
  makePreset('SSC / Exam Starter', { width: 200, height: 230, targetKB: 50 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('UPSC Starter', { width: 300, height: 350, targetKB: 100 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Railway Starter', { width: 200, height: 230, targetKB: 50 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Bihar Exam Starter', { width: 200, height: 230, targetKB: 50 }, { width: 140, height: 60, targetKB: 20 }),
  makePreset('Compact Upload', { width: 100, height: 120, targetKB: 20 }, { width: 100, height: 40, targetKB: 10 })
];

const formatBytes = (bytes: number) => bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(1) + ' KB';
const readImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('The selected image could not be opened.'));
  image.src = url;
});
const canvasBlob = (canvas: HTMLCanvasElement, type: OutputFormat, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image export failed.')), type, quality));

function drawImageToCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement, settings: Settings) {
  const width = Math.max(5, Math.min(4000, Math.round(settings.width || 200)));
  const height = Math.max(5, Math.min(4000, Math.round(settings.height || 230)));
  if (width * height > 12000000) throw new Error('Please choose dimensions under 12 megapixels.');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');
  // Preserve transparent pixels for PNG; flatten JPEG on white.
  context.clearRect(0, 0, width, height);
  if (settings.format === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  const scale = settings.fit === 'cover'
    ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
    : Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale * Math.max(1, settings.zoom || 1);
  const drawHeight = image.naturalHeight * scale * Math.max(1, settings.zoom || 1);
  const overflowX = Math.max(0, drawWidth - width);
  const overflowY = Math.max(0, drawHeight - height);
  const offsetX = Math.max(-1, Math.min(1, settings.cropX || 0));
  const offsetY = Math.max(-1, Math.min(1, settings.cropY || 0));
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
  }, [sourceUrl, settings.width, settings.height, settings.fit, settings.zoom, settings.cropX, settings.cropY]);
  return <canvas ref={canvasRef} aria-label={label} className="block h-auto w-full max-w-[240px] rounded-lg bg-white" />;
};

async function renderImage(asset: Asset, settings: Settings) {
  const image = await readImage(asset.sourceUrl);
  const canvas = document.createElement('canvas');
  const { width, height } = drawImageToCanvas(canvas, image, settings);
  const targetBytes = Math.max(5, Math.min(5000, settings.targetKB || 50)) * 1024;
  const maxQuality = Math.max(0.3, Math.min(1, settings.quality || 0.88));
  let actualQuality = settings.format === 'image/jpeg' ? maxQuality : 1;
  let blob = await canvasBlob(canvas, settings.format, settings.format === 'image/jpeg' ? maxQuality : 0.92);
  if (settings.format === 'image/jpeg') {
    if (blob.size > targetBytes) {
      let low = 0.3;
      let high = maxQuality;
      let best: Blob | null = null;
      let bestQuality = 0.3;
      for (let i = 0; i < 8; i++) {
        const quality = (low + high) / 2;
        const candidate = await canvasBlob(canvas, 'image/jpeg', quality);
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
        blob = await canvasBlob(canvas, 'image/jpeg', 0.3);
        actualQuality = 0.3;
      }
    }
  }
  const warning = settings.format === 'image/png' && blob.size > targetBytes
    ? 'PNG compression cannot guarantee the target KB. Try JPG or smaller dimensions.'
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
  const [activePreset, setActivePreset] = useState('custom');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const isHindi = language === 'hi';

  const copy = useMemo(() => isHindi ? {
    subtitle: 'सरकारी फॉर्म, नौकरी आवेदन और ऑनलाइन सेवाओं के लिए फोटो और सिग्नेचर तैयार करें।',
    quality: 'JPG क्वालिटी', zoom: 'क्रॉप ज़ूम', cropX: 'बाएँ / दाएँ', cropY: 'ऊपर / नीचे', qualityHint: 'ज़्यादा क्वालिटी = बेहतर डिटेल, बड़ा KB', cropHint: 'फोटो को फ्रेम में सही जगह सेट करें।',
    upload: '01 · अपनी फाइल अपलोड करें',
    photo: 'पासपोर्ट / फॉर्म फोटो',
    signature: 'सिग्नेचर',
    clickUpload: 'फाइल चुनने के लिए क्लिक करें',
    presets: '02 · तैयार फॉर्म Presets',
    settings: '03 · अलग-अलग आउटपुट सेटिंग',
    width: 'चौड़ाई (px)',
    height: 'ऊँचाई (px)',
    target: 'लक्षित साइज़ (KB)',
    format: 'फॉर्मेट',
    fit: 'फिटिंग',
    contain: 'पूरा फोटो दिखाएँ',
    cover: 'फ्रेम भरें (क्रॉप)',
    process: 'दोनों Resize करें',
    processBoth: 'दोनों Resize करें',
    processPhoto: 'फोटो Resize करें',
    processSignature: 'सिग्नेचर Resize करें',
    downloadBoth: 'दोनों डाउनलोड करें',
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
    quality: 'JPG Quality', zoom: 'Crop zoom', cropX: 'Left / Right', cropY: 'Up / Down', qualityHint: 'Higher quality keeps more detail but increases KB.', cropHint: 'Position the image inside the frame.',
    upload: '01 · Upload Your Files',
    photo: 'Passport / Form Photo',
    signature: 'Signature',
    clickUpload: 'Click to choose a file',
    presets: '02 · Ready-made Form Presets',
    settings: '03 · Separate Output Settings',
    width: 'Width (px)',
    height: 'Height (px)',
    target: 'Target Size (KB)',
    format: 'Format',
    fit: 'Fit mode',
    contain: 'Fit inside',
    cover: 'Fill frame (crop)',
    process: 'Resize Both',
    processBoth: 'Resize Both',
    processPhoto: 'Resize Photo',
    processSignature: 'Resize Signature',
    downloadBoth: 'Download Both',
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

  const updateSetting = (slot: Slot, key: keyof Settings, value: string | number) => {
    setSettings((current) => ({ ...current, [slot]: { ...current[slot], [key]: value } as Settings }));
    clearOutput(slot);
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
      if (!currentAsset || currentAsset.sourceUrl !== asset.sourceUrl || revisionsRef.current[slot] !== revision) return current;
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
      if (!photoOk || !signatureOk) {
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
    const extension = settings[slot].format === 'image/png' ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.href = asset.outputUrl;
    link.download = 'tanshu-online-' + slot + '.' + extension;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadBoth = () => {
    const ready = (['photo', 'signature'] as Slot[]).filter((slot) => assets[slot]?.outputUrl);
    if (!ready.length) {
      setStatus(copy.noOutput);
      return;
    }
    ready.forEach((slot, index) => window.setTimeout(() => downloadSlot(slot), index * 250));
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
      return '<section><h2>' + (slot === 'photo' ? (isHindi ? 'फोटो' : 'Photo') : (isHindi ? 'सिग्नेचर' : 'Signature')) + '</h2><img src="' + asset.outputUrl + '" alt="' + slot + '"><p>' + asset.outputWidth + ' × ' + asset.outputHeight + ' px · ' + formatBytes(asset.outputBytes || 0) + '</p></section>';
    }).join('');
    popup.document.write('<!doctype html><html lang="' + (isHindi ? 'hi' : 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TANSHU ONLINE ' + (isHindi ? 'प्रिंट प्रीव्यू' : 'Print Preview') + '</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#14243b}main{display:flex;gap:24px;flex-wrap:wrap}section{border:1px solid #cbd5e1;border-radius:12px;padding:16px;min-width:220px}img{max-width:100%;max-height:320px;object-fit:contain}button{padding:10px 18px;background:#174ea6;color:white;border:0;border-radius:8px;font-weight:bold}@media print{button{display:none}body{padding:0}}</style></head><body><h1>TANSHU ONLINE</h1><p>' + (isHindi ? 'फोटो और सिग्नेचर रिसाइज़र · प्रिंट प्रीव्यू' : 'Photo & Signature Resizer · Print Preview') + '</p><main>' + cards + '</main><p><button onclick="window.print()">' + (isHindi ? 'प्रिंट करें' : 'Print') + '</button></p></body></html>');
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
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFile(slot, event.target.files?.[0])} />
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
    const heading = slot === 'photo' ? copy.onlyPhoto : copy.onlySign;
    const fields: { key: keyof Settings; label: string }[] = [
      { key: 'width', label: copy.width },
      { key: 'height', label: copy.height },
      { key: 'targetKB', label: copy.target }
    ];
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {assets[slot] && <div className="mb-3 overflow-hidden rounded-xl border border-blue-100 bg-slate-100 p-2">
          <p className="mb-2 text-[10px] font-extrabold text-slate-600">{isHindi ? 'लाइव क्रॉप प्रीव्यू' : 'Live crop preview'}</p>
          <div className="mx-auto flex max-w-[240px] items-center justify-center overflow-hidden rounded-lg bg-white">\n            <CropPreview sourceUrl={assets[slot]!.sourceUrl} settings={current} label={heading + " crop preview"} />\n          </div>
        </div>}
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-900">{slot === 'photo' ? '📷 ' : '✍️ '}{heading}</h3>
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fields.map((field) => (
            <label key={field.key} className="text-[10px] font-bold text-slate-500">
              {field.label}
              <input
                type="number"
                min="5"
                max={field.key === 'targetKB' ? 5000 : 4000}
                value={current[field.key] as number}
                onChange={(event) => updateSetting(slot, field.key, Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          ))}
          <label className="text-[10px] font-bold text-slate-500">{copy.format}
            <select value={current.format} onChange={(event) => updateSetting(slot, 'format', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500">
              <option value="image/jpeg">JPG</option><option value="image/png">PNG</option>
            </select>
          </label>
          <label className="text-[10px] font-bold text-slate-500">{copy.fit}
            <select value={current.fit} onChange={(event) => updateSetting(slot, 'fit', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500">
              <option value="contain">{copy.contain}</option><option value="cover">{copy.cover}</option>
            </select>
          </label>
          <div className="col-span-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 sm:col-span-3">
            <div className="mb-2 flex items-center justify-between gap-2"><span className="text-[11px] font-extrabold text-slate-800">{copy.cropHint}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-700">{current.zoom.toFixed(1)}×</span></div>
            <label className="block text-[10px] font-bold text-slate-600">{copy.zoom}
              <input type="range" min="1" max="3" step="0.05" value={current.zoom} onChange={(event) => updateSetting(slot, 'zoom', Number(event.target.value))} className="mt-2 w-full accent-blue-600" />
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="text-[10px] font-bold text-slate-600">{copy.cropX}
                <input type="range" min="-1" max="1" step="0.02" value={current.cropX} onChange={(event) => updateSetting(slot, 'cropX', Number(event.target.value))} className="mt-2 w-full accent-blue-600" />
              </label>
              <label className="text-[10px] font-bold text-slate-600">{copy.cropY}
                <input type="range" min="-1" max="1" step="0.02" value={current.cropY} onChange={(event) => updateSetting(slot, 'cropY', Number(event.target.value))} className="mt-2 w-full accent-blue-600" />
              </label>
            </div>
          </div>
          <div className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 sm:col-span-3">
            <div className="flex items-center justify-between gap-2"><label className="text-[10px] font-extrabold text-slate-700">{copy.quality}</label><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700">{Math.round(current.quality * 100)}%</span></div>
            <input type="range" min="0.3" max="1" step="0.01" value={current.quality} onChange={(event) => updateSetting(slot, 'quality', Number(event.target.value))} className="mt-2 w-full accent-emerald-600" disabled={current.format === 'image/png'} />
            <p className="mt-1 text-[10px] leading-4 text-slate-500">{copy.qualityHint}{current.format === 'image/png' ? (isHindi ? ' PNG में यह सेटिंग लागू नहीं होती।' : ' This setting does not apply to PNG.') : ''}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = (slot: Slot) => {
    const asset = assets[slot];
    const title = slot === 'photo' ? copy.onlyPhoto : copy.onlySign;
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
            <p className="mt-2 text-[10px] font-semibold text-slate-600">{asset.outputWidth} × {asset.outputHeight} px · {settings[slot].format === 'image/jpeg' ? `JPG · ${Math.round((asset.outputQuality || settings[slot].quality) * 100)}%` : 'PNG'}</p>
            {asset.warning && <p className="mt-1 rounded-lg bg-amber-50 p-2 text-[10px] leading-4 text-amber-800">{asset.warning}</p>}
          </>
        )}
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
