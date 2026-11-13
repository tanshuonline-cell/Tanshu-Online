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

const PHOTO_SIZE_PRESETS = [
  // Official physical sizes where the issuing authority publishes one.
  { id: 'passport-35x45', label: 'Indian Passport / Visa · 35 × 45 mm (where requested)', widthMm: 35, heightMm: 45 },
  { id: 'passport-minor-45x35', label: 'Indian Passport · Child under 4 · 45 × 35 mm', widthMm: 45, heightMm: 35 },
  { id: 'pan-35x25', label: 'PAN Card application · 35 × 25 mm', widthMm: 35, heightMm: 25 },
  { id: 'voter-24x18', label: 'Voter ID / EPIC · 24 × 18 mm (older ECI spec; verify current portal)', widthMm: 24, heightMm: 18 },

  // Common portrait crops for portals that say "passport-size" but do not
  // publish a universal physical measurement. Always follow the live form.
  { id: 'exam-35x45', label: 'Exam Form Photo · NEET / JEE / CUET / Entrance (35 × 45 mm crop; portal rules vary)', widthMm: 35, heightMm: 45 },
  { id: 'upsc-35x45', label: 'UPSC / Government Exam · Passport-style crop 35 × 45 mm (check pixel/KB rules)', widthMm: 35, heightMm: 45 },
  { id: 'ssc-35x45', label: 'SSC / Recruitment Form · Portrait crop 35 × 45 mm (live-photo rules may apply)', widthMm: 35, heightMm: 45 },
  { id: 'state-exam-35x45', label: 'State Govt Exam / Police / Teacher Recruitment · 35 × 45 mm crop', widthMm: 35, heightMm: 45 },
  { id: 'admission-35x45', label: 'School / College / University Admission · 35 × 45 mm crop', widthMm: 35, heightMm: 45 },
  { id: 'scholarship-35x45', label: 'Scholarship / Student Credit Card Form · 35 × 45 mm crop', widthMm: 35, heightMm: 45 },
  { id: 'job-35x45', label: 'Job / Employment Application · 35 × 45 mm crop', widthMm: 35, heightMm: 45 },
  { id: 'ration-35x45', label: 'Ration Card Application · 35 × 45 mm crop (state portal rules vary)', widthMm: 35, heightMm: 45 },
  { id: 'wb-ration-35x45', label: 'West Bengal Ration Card · 35 × 45 mm crop (check portal upload rules)', widthMm: 35, heightMm: 45 },
  { id: 'aadhaar-35x45', label: 'Aadhaar-related form · 35 × 45 mm crop only (UIDAI enrolment photo is captured at centre)', widthMm: 35, heightMm: 45 },
  { id: 'pension-35x45', label: 'Pension / Social Welfare Form · 35 × 45 mm crop', widthMm: 35, heightMm: 45 },

  // General studio sizes retained for other forms and print workflows.
  { id: '35x35', label: 'General ID / Application · Square · 35 × 35 mm', widthMm: 35, heightMm: 35 },
  { id: '40x50', label: 'General Portrait · 40 × 50 mm', widthMm: 40, heightMm: 50 },
  { id: '45x35', label: 'General Landscape · 45 × 35 mm', widthMm: 45, heightMm: 35 },
  { id: '2x2', label: '2 × 2 inch · 50.8 × 50.8 mm (where requested)', widthMm: 50.8, heightMm: 50.8 },
  { id: '25x25', label: 'General Square · 25 × 25 mm', widthMm: 25, heightMm: 25 },
  { id: 'postcard-4x6', label: 'Exam / Document Postcard Print · 4 × 6 inch (print size; not an upload standard)', widthMm: 101.6, heightMm: 152.4 },
];

const SWATCHES = ['#ffffff', '#f1f5f9', '#dbeafe', '#bfdbfe', '#dcfce7', '#fef3c7', '#fce7f3', '#e5e7eb', '#111827', '#000000'];

function safeFilename(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-') || 'photo-background-removed';
}

function triggerBlobDownload(blob: Blob, filename: string) {
  if (!(blob instanceof Blob) || blob.size === 0) throw new Error('The photo file is empty and could not be downloaded. Please try again.');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the object URL alive briefly so browsers can start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
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
  const [backgroundSaved, setBackgroundSaved] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('color');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 100 });
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropHasSelection, setCropHasSelection] = useState(false);
  const [cropApplied, setCropApplied] = useState(false);
  const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });
  const [photoScale, setPhotoScale] = useState(1);
  const cropDrawRef = useRef<{ mode: 'draw' | 'move' | 'resize'; startX: number; startY: number; bounds: DOMRect; initialRect: CropRect; anchorX: number; anchorY: number; cornerX: number; cornerY: number } | null>(null);
  const photoTransformRef = useRef<{ mode: 'move' | 'resize'; startX: number; startY: number; bounds: DOMRect; offset: { x: number; y: number }; scale: number; cornerX: number; cornerY: number } | null>(null);
  const [photoSizePreset, setPhotoSizePreset] = useState('passport-35x45');
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
  const selectedPhotoSize = PHOTO_SIZE_PRESETS.find((item) => item.id === photoSizePreset);
  // Custom crop is fully freeform; physical output dimensions are derived from
  // the exact selected crop ratio rather than a forced preset.
  const targetWidthMm = selectedPhotoSize?.widthMm ?? 35;
  const targetHeightMm = selectedPhotoSize?.heightMm ?? 45;

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); }, [sourceUrl]);
  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);
  useEffect(() => () => { if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl); }, [cropPreviewUrl]);

  const clearResult = () => {
    setResultBlob(null);
    setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    setBackgroundSaved(false);
    setCroppedBlob(null);
    setProgress(0);
    setStatus('');
  };

  const resetCropForGeometryChange = () => {
    setCropRect({ x: 0, y: 0, w: 100, h: 100 });
    setCropHasSelection(false);
    setIsCropping(false);
    setCropApplied(false);
    setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    setPhotoOffset({ x: 0, y: 0 });
    setPhotoScale(1);
    cropDrawRef.current = null;
    photoTransformRef.current = null;
    setCroppedBlob(null);
  };

  const chooseFile = (next?: File) => {
    if (!next) return;
    if (!next.type.startsWith('image/')) { setError('Please choose a JPG, PNG or WEBP photo.'); return; }
    if (next.size > 40 * 1024 * 1024) { setError('Please choose a photo smaller than 40 MB.'); return; }
    setFile(next);
    setSourceUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(next); });
    setFilename(next.name.replace(/\.[^.]+$/, '') || 'photo-background-removed');
    setCropRect({ x: 0, y: 0, w: 100, h: 100 });
    setCropHasSelection(false);
    setIsCropping(false);
    setCropApplied(false);
    cropDrawRef.current = null;
    photoTransformRef.current = null;
    setPhotoOffset({ x: 0, y: 0 });
    setPhotoScale(1);
    setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    setRotation(0);
    setError('');
    clearResult();
  };

  const preparePhoto = async () => {
    if (!file) throw new Error('Upload a photo first.');
    if (!resultBlob) throw new Error('Remove and save the background before cropping.');
    const image = new Image();
    const originalUrl = URL.createObjectURL(resultBlob);
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('The selected photo could not be opened.'));
        image.src = originalUrl;
      });
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const selectedX = Math.max(0, Math.min(width - 1, width * cropRect.x / 100));
      const selectedY = Math.max(0, Math.min(height - 1, height * cropRect.y / 100));
      const selectedW = Math.max(1, Math.min(width - selectedX, width * cropRect.w / 100));
      const selectedH = Math.max(1, Math.min(height - selectedY, height * cropRect.h / 100));

      // Crop exactly the rectangle the user selected in the original image
      // coordinate space. The preview stage is rotated with CSS, so its
      // pointer handler maps the selection back into this same source space.
      const selected = document.createElement('canvas');
      selected.width = Math.max(1, Math.round(selectedW));
      selected.height = Math.max(1, Math.round(selectedH));
      const selectedContext = selected.getContext('2d');
      if (!selectedContext) throw new Error('Your browser could not prepare this crop.');
      selectedContext.drawImage(image, selectedX, selectedY, selectedW, selectedH, 0, 0, selected.width, selected.height);

      // Rotate only the already-selected pixels. This prevents a second,
      // differently-positioned crop from cutting into the user's chosen area.
      const radians = rotation * Math.PI / 180;
      const rotatedWidth = Math.max(1, Math.ceil(Math.abs(selected.width * Math.cos(radians)) + Math.abs(selected.height * Math.sin(radians))));
      const rotatedHeight = Math.max(1, Math.ceil(Math.abs(selected.width * Math.sin(radians)) + Math.abs(selected.height * Math.cos(radians))));
      const rotated = document.createElement('canvas');
      rotated.width = rotatedWidth;
      rotated.height = rotatedHeight;
      const rotatedContext = rotated.getContext('2d');
      if (!rotatedContext) throw new Error('Your browser could not rotate this crop.');
      rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2);
      rotatedContext.rotate(radians);
      rotatedContext.drawImage(selected, -selected.width / 2, -selected.height / 2);

      const isCustomCrop = photoSizePreset === 'custom';
      const maxProcessingEdge = 1600;
      let outputWidth: number;
      let outputHeight: number;
      if (isCustomCrop) {
        // No ratio or physical dimensions are imposed in Custom. Preserve the
        // exact crop ratio and use the selected DPI for output pixel density.
        const scale = Math.min(1, maxProcessingEdge / Math.max(rotatedWidth, rotatedHeight));
        outputWidth = Math.max(1, Math.round(rotatedWidth * scale));
        outputHeight = Math.max(1, Math.round(rotatedHeight * scale));
      } else {
        if (!Number.isFinite(targetWidthMm) || !Number.isFinite(targetHeightMm) || targetWidthMm <= 0 || targetHeightMm <= 0) {
          throw new Error('Choose a valid photo size preset.');
        }
        const requestedWidthPx = Math.max(1, Math.round((targetWidthMm / 25.4) * dpi));
        const requestedHeightPx = Math.max(1, Math.round((targetHeightMm / 25.4) * dpi));
        const scale = Math.min(1, maxProcessingEdge / Math.max(requestedWidthPx, requestedHeightPx));
        outputWidth = Math.max(1, Math.round(requestedWidthPx * scale));
        outputHeight = Math.max(1, Math.round(requestedHeightPx * scale));
      }
      const output = document.createElement('canvas');
      output.width = outputWidth;
      output.height = outputHeight;
      const out = output.getContext('2d');
      if (!out) throw new Error('Your browser could not prepare this crop.');
      out.imageSmoothingEnabled = true;
      out.imageSmoothingQuality = 'high';
      // Keep the crop PNG transparent; show the chosen color behind it in the
      // preview and composite that color only when exporting the final file.
      const placementScale = cropApplied ? photoScale : 1;
      const placementX = cropApplied ? (photoOffset.x / 100) * output.width : 0;
      const placementY = cropApplied ? (photoOffset.y / 100) * output.height : 0;
      // Fit the complete selected crop inside a preset's physical frame without
      // stretching or trimming it. This also protects corners after small-angle
      // rotations, where the rotated crop's bounding ratio can differ slightly.
      const fitScale = Math.min(output.width / rotated.width, output.height / rotated.height);
      const drawWidth = rotated.width * fitScale * placementScale;
      const drawHeight = rotated.height * fitScale * placementScale;
      out.drawImage(rotated, 0, 0, rotated.width, rotated.height, (output.width - drawWidth) / 2 + placementX, (output.height - drawHeight) / 2 + placementY, drawWidth, drawHeight);
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
      const removed = await removeBackgroundWithPersonMask(file, (message) => {
        setStatus(message);
        setProgress(message.includes('Finishing') ? 90 : message.includes('Detecting') ? 65 : 25);
      });
      setResultBlob(removed);
      setResultUrl(URL.createObjectURL(removed));
      setBackgroundSaved(false);
      setCroppedBlob(null);
      setCropApplied(false);
      setIsCropping(false);
      setCropHasSelection(false);
      setCropRect({ x: 0, y: 0, w: 100, h: 100 });
      setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
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
    const exportBlob = cropApplied && croppedBlob ? croppedBlob : null;
    if (!resultBlob || !backgroundSaved || !exportBlob) return;
    setBusy(true);
    setError('');
    try {
      if (exportFormat === 'png') {
        const image = new Image();
        const source = URL.createObjectURL(exportBlob);
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('Could not prepare the passport photo background.'));
          image.src = source;
        });
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create the passport photo background.');
        if (backgroundMode === 'color') {
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        const drawWidth = canvas.width * photoScale;
        const drawHeight = canvas.height * photoScale;
        context.drawImage(image, (canvas.width - drawWidth) / 2 + (photoOffset.x / 100) * canvas.width, (canvas.height - drawHeight) / 2 + (photoOffset.y / 100) * canvas.height, drawWidth, drawHeight);
        URL.revokeObjectURL(source);
        const pngSource = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed.')), 'image/png'));
        const png = await addPngDpi(pngSource, dpi);
        triggerBlobDownload(png, safeFilename(filename) + '.png');
      } else {
        const image = new Image();
        const source = URL.createObjectURL(exportBlob);
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
        const drawWidth = canvas.width * photoScale;
        const drawHeight = canvas.height * photoScale;
        ctx.drawImage(image, (canvas.width - drawWidth) / 2 + (photoOffset.x / 100) * canvas.width, (canvas.height - drawHeight) / 2 + (photoOffset.y / 100) * canvas.height, drawWidth, drawHeight);
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
        triggerBlobDownload(jpeg, safeFilename(filename) + '.jpg');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not export this photo.');
    } finally {
      setBusy(false);
    }
  };

  const checker = 'repeating-conic-gradient(#d8e0e9 0% 25%, #ffffff 0% 50%) 50% / 18px 18px';

  const getCropPoint = (event: React.PointerEvent<HTMLElement>) => {
    const stage = cropStageRef.current;
    const bounds = stage?.getBoundingClientRect();
    if (!stage || !bounds || !stage.offsetWidth || !stage.offsetHeight) return null;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const angle = -rotation * Math.PI / 180;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle) + stage.offsetWidth / 2;
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle) + stage.offsetHeight / 2;
    return {
      x: Math.max(0, Math.min(100, localX / stage.offsetWidth * 100)),
      y: Math.max(0, Math.min(100, localY / stage.offsetHeight * 100)),
    };
  };

  const makeFreeCropRect = (anchorX: number, anchorY: number, pointerX: number, pointerY: number): CropRect => {
    const x = Math.min(anchorX, pointerX);
    const y = Math.min(anchorY, pointerY);
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      w: Math.max(0, Math.min(100 - x, Math.abs(pointerX - anchorX))),
      h: Math.max(0, Math.min(100 - y, Math.abs(pointerY - anchorY))),
    };
  };

  const makeAspectCropRect = (anchorX: number, anchorY: number, pointerX: number, pointerY: number, bounds: DOMRect, ratio: number) => {
    const ratioInPercent = ratio * bounds.height / bounds.width;
    const directionX = pointerX >= anchorX ? 1 : -1;
    const directionY = pointerY >= anchorY ? 1 : -1;
    let width = Math.abs(pointerX - anchorX);
    let height = Math.abs(pointerY - anchorY);
    if (width > height * ratioInPercent) width = height * ratioInPercent;
    else height = width / ratioInPercent;
    const maxWidth = directionX > 0 ? 100 - anchorX : anchorX;
    const maxHeight = directionY > 0 ? 100 - anchorY : anchorY;
    const scale = Math.min(1, maxWidth / Math.max(width, 0.001), maxHeight / Math.max(height, 0.001));
    width *= scale;
    height *= scale;
    return { x: directionX > 0 ? anchorX : anchorX - width, y: directionY > 0 ? anchorY : anchorY - height, w: width, h: height };
  };

  const startCropDraw = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isCropping || cropApplied || !file) return;
    const stage = cropStageRef.current;
    if (!stage || !stage.offsetWidth || !stage.offsetHeight) return;
    const bounds = new DOMRect(0, 0, stage.offsetWidth, stage.offsetHeight);
    const point = getCropPoint(event);
    if (!point) return;
    const px = point.x;
    const py = point.y;
    const valid = cropHasSelection && cropRect.w > 2 && cropRect.h > 2;
    const inside = valid && px >= cropRect.x && px <= cropRect.x + cropRect.w && py >= cropRect.y && py <= cropRect.y + cropRect.h;
    let mode: 'draw' | 'move' | 'resize' = 'draw';
    let cornerX = 0, cornerY = 0, anchorX = 0, anchorY = 0;
    const corners = [
      { id: 'tl', x: cropRect.x, y: cropRect.y, cx: 1, cy: 1 },
      { id: 'tr', x: cropRect.x + cropRect.w, y: cropRect.y, cx: -1, cy: 1 },
      { id: 'bl', x: cropRect.x, y: cropRect.y + cropRect.h, cx: 1, cy: -1 },
      { id: 'br', x: cropRect.x + cropRect.w, y: cropRect.y + cropRect.h, cx: -1, cy: -1 },
    ];
    const handle = (event.target as HTMLElement).closest('[data-crop-handle]')?.getAttribute('data-crop-handle');
    const hit = valid && handle ? corners.find(point => point.id === handle) : undefined;
    if (hit) {
      mode = 'resize';
      cornerX = hit.cx;
      cornerY = hit.cy;
      anchorX = hit.x + (hit.cx === 1 ? cropRect.w : -cropRect.w);
      anchorY = hit.y + (hit.cy === 1 ? cropRect.h : -cropRect.h);
    } else if (inside) {
      mode = 'move';
    }
    cropDrawRef.current = { mode, startX: px, startY: py, bounds, initialRect: { ...cropRect }, anchorX, anchorY, cornerX, cornerY };
    if (mode === 'draw') setCropRect({ x: px, y: py, w: 0, h: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDrawRef.current;
    if (!drag) return;
    const point = getCropPoint(event);
    if (!point) return;
    const px = point.x;
    const py = point.y;
    const presetRatio = (targetWidthMm / targetHeightMm);
    // Crop coordinates are stored in the unrotated source image space. At
    // quarter-turn rotations, invert the locked preset ratio in that space.
    const quarterTurn = Math.abs(rotation % 180) === 90;
    const ratio = quarterTurn ? 1 / presetRatio : presetRatio;
    if (drag.mode === 'draw') {
      setCropRect(photoSizePreset === 'custom'
        ? makeFreeCropRect(drag.startX, drag.startY, px, py)
        : makeAspectCropRect(drag.startX, drag.startY, px, py, drag.bounds, ratio));
    } else if (drag.mode === 'move') {
      const x = Math.max(0, Math.min(100 - drag.initialRect.w, drag.initialRect.x + px - drag.startX));
      const y = Math.max(0, Math.min(100 - drag.initialRect.h, drag.initialRect.y + py - drag.startY));
      setCropRect({ ...drag.initialRect, x, y });
    } else {
      setCropRect(photoSizePreset === 'custom'
        ? makeFreeCropRect(drag.anchorX, drag.anchorY, px, py)
        : makeAspectCropRect(drag.anchorX, drag.anchorY, px, py, drag.bounds, ratio));
    }
  };

  const finishCropDrag = () => {
    const drag = cropDrawRef.current;
    cropDrawRef.current = null;
    if (drag?.mode === 'draw') {
      setCropHasSelection(cropRect.w >= 1 && cropRect.h >= 1);
    }
  };

  const startPhotoTransform = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropApplied || isCropping || busy) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const handle = (event.target as HTMLElement).closest('[data-photo-resize]') as HTMLElement | null;
    const corner = handle?.getAttribute('data-photo-resize');
    photoTransformRef.current = {
      mode: corner ? 'resize' : 'move',
      startX: event.clientX,
      startY: event.clientY,
      bounds,
      offset: { ...photoOffset },
      scale: photoScale,
      cornerX: corner?.includes('l') ? -1 : 1,
      cornerY: corner?.includes('t') ? -1 : 1,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const movePhotoTransform = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = photoTransformRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.mode === 'move') {
      setPhotoOffset({
        x: Math.max(-100, Math.min(100, drag.offset.x + dx / drag.bounds.width * 100)),
        y: Math.max(-100, Math.min(100, drag.offset.y + dy / drag.bounds.height * 100)),
      });
    } else {
      const delta = (dx * drag.cornerX + dy * drag.cornerY) / (Math.max(drag.bounds.width, drag.bounds.height) * 1.15);
      setPhotoScale(Math.max(0.5, Math.min(3, drag.scale + delta)));
    }
  };

  const endPhotoTransform = () => { photoTransformRef.current = null; };

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
            <div className="mb-3 rounded-lg border border-cyan-300/20 bg-cyan-400/5 p-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-cyan-100">Photo size preset</div>
              <label className="mb-2 block text-[10px] text-blue-100">Choose common size
                <select value={photoSizePreset} onChange={(e) => {
                  const next = e.target.value;
                  setPhotoSizePreset(next);
                  resetCropForGeometryChange();
                }} className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-2 py-2 text-[11px] text-white">
                  {PHOTO_SIZE_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  <option value="custom">Custom · Free crop</option>
                </select>
              </label>
              {photoSizePreset === 'custom' && <p className="mb-2 rounded-lg border border-cyan-300/20 bg-cyan-400/5 p-2 text-[10px] leading-4 text-cyan-100">Custom में कोई ratio lock नहीं है। फोटो पर जितना लंबा या चौड़ा हिस्सा चाहिए, उतना crop box बनाएँ और कोनों से स्वतंत्र रूप से resize करें।</p>}
              <p className="text-[9px] leading-4 text-blue-200">Preset चुनने पर उसका ratio लॉक रहेगा। Custom में पूरी तरह free crop होगा और चुना हुआ ratio डाउनलोड में भी सुरक्षित रहेगा।</p>
            </div>
            <div className="mb-2 flex justify-between text-xs text-blue-100"><span>Manual crop · drag on photo to create</span><b>{photoSizePreset === 'custom' ? 'Free · Any ratio' : 'Preset ratio'}</b></div>
            <div className="rounded-lg border border-yellow-300/30 bg-[#071426] p-2 text-[10px] leading-4 text-blue-200">फोटो पर किसी खाली जगह से माउस दबाकर खींचें और नया crop box बनाएँ। बने हुए बॉक्स को बीच से पकड़कर खिसकाएँ और चारों कोनों से उसका आकार बदलें। Preset में ratio लॉक रहेगा; Custom में कोई ratio लॉक नहीं है।</div>
            <button type="button" onClick={() => { setCropRect({ x: 0, y: 0, w: 100, h: 100 }); setCropHasSelection(false); setIsCropping(false); setCropApplied(false); setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; }); setPhotoOffset({ x: 0, y: 0 }); setPhotoScale(1); setRotation(0); cropDrawRef.current = null; photoTransformRef.current = null; setCroppedBlob(null); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"><RotateCcw size={14} /> Reset crop &amp; angle</button>
            <button type="button" onClick={async () => {
              if (isCropping) {
                try {
                  finishCropDrag();
                  setBusy(true);
                  const prepared = await preparePhoto();
                  setCroppedBlob(prepared);
                  const nextUrl = URL.createObjectURL(prepared);
                  setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return nextUrl; });
                  setPhotoOffset({ x: 0, y: 0 });
                  setPhotoScale(1);
                  setIsCropping(false);
                  setCropApplied(true);
                  setCropHasSelection(cropRect.w >= 1 && cropRect.h >= 1);
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Could not apply this crop.');
                } finally {
                  setBusy(false);
                }
              } else {
                if (!cropHasSelection) setCropRect({ x: 0, y: 0, w: 100, h: 100 });
                setCropPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
                setCroppedBlob(null);
                setPhotoOffset({ x: 0, y: 0 });
                setPhotoScale(1);
                setCropApplied(false);
                setIsCropping(true);
              }
            }} disabled={!backgroundSaved || !resultBlob || busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 disabled:opacity-40">{isCropping ? <CheckCircle2 size={14} /> : <Crop size={14} />} {isCropping ? 'Done · Apply Crop' : cropApplied ? 'Edit Crop' : 'Crop'}</button>
            <p className="mt-3 text-[10px] leading-4 text-blue-200">{isCropping ? 'Background हटने और Save होने के बाद फोटो पर ड्रैग करके crop बनाएँ। बॉक्स को अंदर से खिसकाएँ और चारों कोनों से resize करें। Done दबाकर लागू करें।' : cropApplied ? 'Crop लागू हो गया है। अब डाउनलोड सेटिंग के अनुसार फोटो सेव करें।' : 'पहले Remove Background करें और Save Background दबाएँ। उसके बाद यहाँ crop का वही ड्रॉ, मूव और resize सिस्टम खुलेगा।'}</p>
            <div className="mb-2 flex items-center justify-between text-xs text-blue-100"><span>Rotate photo</span><b>{rotation}°</b></div>
            <div className="mb-4 grid grid-cols-4 gap-1.5">
              {[{ label: '−90°', amount: -90 }, { label: '−1°', amount: -1 }, { label: '+1°', amount: 1 }, { label: '+90°', amount: 90 }].map((item, index) => <button key={item.label} type="button" onClick={() => { setRotation((value) => ((value + item.amount) % 360 + 360) % 360); resetCropForGeometryChange(); }} className="flex flex-col items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-1 py-2 text-[10px] font-semibold text-blue-100 hover:border-cyan-300 hover:bg-cyan-400/10"><span className="text-cyan-200">{index < 2 ? <RotateCcw size={16} /> : <RotateCw size={16} />}</span>{item.label}</button>)}
            </div>
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
            {cropApplied && cropPreviewUrl ? <div className="relative max-h-[65vh] max-w-full overflow-hidden rounded-lg border-2 border-dashed border-cyan-300 bg-white touch-none select-none" style={{ width: 'min(100%, 420px)', aspectRatio: photoSizePreset === 'custom' ? 'auto' : targetWidthMm + ' / ' + targetHeightMm, cursor: 'move', background: backgroundMode === 'color' ? backgroundColor : checker }} onPointerDown={startPhotoTransform} onPointerMove={movePhotoTransform} onPointerUp={endPhotoTransform} onPointerCancel={endPhotoTransform}><img src={cropPreviewUrl} alt="Passport photo crop preview — drag to reposition" draggable={false} className={'pointer-events-none select-none ' + (photoSizePreset === 'custom' ? 'block h-auto max-h-[65vh] w-full object-contain' : 'h-full w-full object-contain')} style={{ transform: 'translate(' + photoOffset.x + '%, ' + photoOffset.y + '%) scale(' + photoScale + ')', transformOrigin: 'center' }} /><span data-photo-resize="tl" className="absolute left-0 top-0 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-cyan-700 bg-white shadow-md" /><span data-photo-resize="tr" className="absolute right-0 top-0 z-20 h-5 w-5 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize rounded-full border-2 border-cyan-700 bg-white shadow-md" /><span data-photo-resize="bl" className="absolute bottom-0 left-0 z-20 h-5 w-5 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize rounded-full border-2 border-cyan-700 bg-white shadow-md" /><span data-photo-resize="br" className="absolute bottom-0 right-0 z-20 h-5 w-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-cyan-700 bg-white shadow-md" /></div>
              : resultUrl && backgroundSaved ? <div ref={cropStageRef} className="relative inline-block max-h-[65vh] max-w-full select-none touch-none" style={{ transform: 'rotate(' + rotation + 'deg)', cursor: isCropping ? 'crosshair' : 'grab', background: backgroundMode === 'color' ? backgroundColor : checker }} onPointerDown={startCropDraw} onPointerMove={handleCropPointerMove} onPointerUp={finishCropDrag} onPointerCancel={finishCropDrag}><img src={resultUrl} alt="Background-removed photo — crop preview" draggable={false} className="block max-h-[65vh] max-w-full rounded-lg object-contain" style={{ pointerEvents: 'none' }} />{isCropping && cropRect.w > 0 && cropRect.h > 0 && <div className="pointer-events-none absolute rounded-sm border-2 border-rose-600 shadow-[0_0_0_9999px_rgba(0,0,0,.48)]" style={{ left: cropRect.x + '%', top: cropRect.y + '%', width: cropRect.w + '%', height: cropRect.h + '%' }}><span data-crop-handle="tl" className="pointer-events-auto absolute -left-2 -top-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md" /><span data-crop-handle="tr" className="pointer-events-auto absolute -right-2 -top-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md" /><span data-crop-handle="bl" className="pointer-events-auto absolute -bottom-2 -left-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md" /><span data-crop-handle="br" className="pointer-events-auto absolute -bottom-2 -right-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md" /></div>}</div>
              : resultUrl ? <div className="flex max-h-full max-w-full items-center justify-center overflow-auto rounded-lg p-4" style={{ background: backgroundMode === 'transparent' ? checker : backgroundColor }}><img src={resultUrl} alt="Background removed preview — save it to unlock cropping" className="max-h-[65vh] max-w-full object-contain" /></div>
              : sourceUrl ? <div className="flex max-h-full max-w-full items-center justify-center"><img src={sourceUrl} alt="Original photo preview" className="max-h-[65vh] max-w-full object-contain" /></div>
              : <button type="button" onClick={() => inputRef.current?.click()} className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/5 px-8 py-12 text-center hover:bg-cyan-400/10"><Upload size={34} className="mb-3 text-cyan-300" /><b className="text-sm text-white">Upload your photo</b><span className="mt-2 text-xs text-blue-200">JPG · PNG · WEBP · Up to 40 MB</span></button>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-blue-200">Your original photo stays unchanged · Processing runs in this browser</span>
            {resultUrl && backgroundSaved && cropApplied && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200"><CheckCircle2 size={14} /> Crop applied · Ready to download</span>}
          </div>
        </main>

        {!expanded && <aside className="order-3 space-y-3 lg:overflow-y-auto">
          <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><Eraser size={15} /> AI background removal</div>
            <button type="button" onClick={runRemoval} disabled={!file || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 disabled:opacity-40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Eraser size={16} />}{busy ? 'Processing…' : resultUrl ? 'Remove Again' : 'Remove Background'}</button>
            {resultUrl && !backgroundSaved && !busy && <button type="button" onClick={() => { setBackgroundSaved(true); setIsCropping(true); setCropRect({ x: 0, y: 0, w: 100, h: 100 }); setCropHasSelection(false); setError(''); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-300"><CheckCircle2 size={16} /> Save Background &amp; Open Crop</button>}
            {backgroundSaved && <p className="mt-2 text-[10px] leading-4 text-emerald-200">Background saved in this session. Cropping is now unlocked.</p>}
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
            <button type="button" onClick={exportPhoto} disabled={!resultUrl || !backgroundSaved || !cropApplied || !croppedBlob || busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-300 disabled:opacity-40"><Download size={16} /> Download {exportFormat.toUpperCase()}</button>
            <p className="mt-2 text-[10px] leading-4 text-blue-200">{!backgroundSaved ? 'Remove the background, save it, then crop and apply to unlock download. ' : !cropApplied ? 'Apply the crop to unlock download. ' : ''}{exportFormat === 'png' ? 'PNG keeps the removed background transparent and preserves full image quality. JPG always uses a solid background (selected color, or white).' : 'JPG uses the selected solid background color; when Transparent is selected above, white is used. JPG size presets and custom limits are enforced on the final downloaded file. PNG is lossless, so its file size depends on the photo and cannot be forced to an exact KB/MB target.'} 300 DPI metadata is embedded in the exported file.</p>
          </section>
          {error && <div role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}
        </aside>}
      </div>
    </div>
  );
};
