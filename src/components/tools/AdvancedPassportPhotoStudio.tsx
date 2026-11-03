import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { removeBackgroundAI } from './backgroundRemovalAI';
import {
  Upload, Download, Printer, RefreshCw,
  ShieldCheck, Sparkles, SlidersHorizontal, Trash2
} from 'lucide-react';

type Photo = { id: string; name: string; src: string };
type PhotoPreset = 'india' | 'stamp' | 'pan' | 'custom';
type SizeUnit = 'mm' | 'cm' | 'in';
const toMillimetres = (value: number, unit: SizeUnit) => value * (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const fromMillimetres = (value: number, unit: SizeUnit) => value / (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
type Paper = 'single' | '4x6' | 'A4';
type Mode = 'official' | 'beauty';
type SignatureBackground = 'transparent' | 'white' | 'custom';
type PhotoEdit = { zoom: number; moveX: number; moveY: number; cropX: number; cropY: number; cropW: number; cropH: number; brightness: number; contrast: number; saturation: number; smooth: number };
type SheetRect = { slot: number; photoId: string; x: number; y: number; w: number; h: number };
const DEFAULT_EDIT: PhotoEdit = { zoom: 1, moveX: 0, moveY: 0, cropX: 0, cropY: 0, cropW: 100, cropH: 100, brightness: 100, contrast: 100, saturation: 100, smooth: 0 };

const PRESETS: Record<Exclude<PhotoPreset, 'custom'>, { label: string; width: number; height: number }> = {
  india: { label: 'India Passport / Exam · 35 × 45 mm', width: 413, height: 531 },
  stamp: { label: 'Stamp Photo · 25 × 30 mm', width: 295, height: 354 },
  pan: { label: 'PAN Photo · 25 × 35 mm', width: 295, height: 413 }
};

// Local color-key background removal for plain edge-connected backgrounds (not AI segmentation).
const removePlainBackground = (source: HTMLImageElement, tolerance: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas'); canvas.width = source.naturalWidth || source.width; canvas.height = source.naturalHeight || source.height;
  const ctx = canvas.getContext('2d'); if (!ctx) return canvas; ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height), { data, width, height } = image;
  const sample = (x:number,y:number) => { const i=(y*width+x)*4; return [data[i],data[i+1],data[i+2]]; };
  const corners=[sample(0,0),sample(width-1,0),sample(0,height-1),sample(width-1,height-1)];
  const bg=[0,1,2].map(c=>Math.round(corners.reduce((sum,rgb)=>sum+rgb[c],0)/4));
  const matches=(i:number)=>Math.max(Math.abs(data[i]-bg[0]),Math.abs(data[i+1]-bg[1]),Math.abs(data[i+2]-bg[2]))<=tolerance;
  const seen=new Uint8Array(width*height), queue=new Int32Array(width*height); let head=0,tail=0;
  const seed=(p:number)=>{if(!seen[p]&&matches(p*4)){seen[p]=1;queue[tail++]=p;}};
  for(let x=0;x<width;x++){seed(x);seed((height-1)*width+x);} for(let y=1;y<height-1;y++){seed(y*width);seed(y*width+width-1);}
  while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);data[p*4+3]=0;if(x>0)seed(p-1);if(x+1<width)seed(p+1);if(y>0)seed(p-width);if(y+1<height)seed(p+width);}
  ctx.putImageData(image,0,0);return canvas;
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
  const [sheetPositions, setSheetPositions] = useState<Record<number, { x: number; y: number; w: number; h: number }>>({});
  const [selectedSheetSlot, setSelectedSheetSlot] = useState<number | null>(null);
  const sheetRectsRef = useRef<SheetRect[]>([]);
  const sheetImageCacheRef = useRef<Map<string, Promise<HTMLImageElement | null>>>(new Map());
  const loadSheetImage = (src: string) => {
    const cached = sheetImageCacheRef.current.get(src);
    if (cached) return cached;
    const pending = new Promise<HTMLImageElement | null>((resolve) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = src;
    });
    sheetImageCacheRef.current.set(src, pending);
    return pending;
  };
  const activeSheetDragRef = useRef<{ slot: number; mode: 'move' | 'resize'; startX: number; startY: number; startRect: SheetRect; handle: 'tl' | 'tr' | 'bl' | 'br' } | null>(null);
  const sheetMoveFrameRef = useRef<number | null>(null);
  const pendingSheetMoveRef = useRef<{ slot: number; position: { x: number; y: number; w: number; h: number } } | null>(null);
  const flushSheetMove = () => {
    if (sheetMoveFrameRef.current !== null) cancelAnimationFrame(sheetMoveFrameRef.current);
    sheetMoveFrameRef.current = null;
    const pending = pendingSheetMoveRef.current;
    pendingSheetMoveRef.current = null;
    if (pending) setSheetPositions(current => ({ ...current, [pending.slot]: pending.position }));
  };
  const activeCanvasDragRef = useRef<{ kind: 'photo' | 'signature'; startX: number; startY: number; startMoveX: number; startMoveY: number; startSigX: number; startSigY: number; startSigWidth: number; resizeSignature: boolean } | null>(null);
  const [mode, setMode] = useState<Mode>('official');
  const [preset, setPreset] = useState<PhotoPreset>('india');
  const [customWidth, setCustomWidth] = useState(35);
  const [customHeight, setCustomHeight] = useState(45);
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>('mm');
  const [paper, setPaper] = useState<Paper>('single');
  const [sheetMargin, setSheetMargin] = useState(5);
  const [sheetGap, setSheetGap] = useState(2);
  const [sheetPhotoCount, setSheetPhotoCount] = useState(4);
  const [sheetPhotoOverrides, setSheetPhotoOverrides] = useState<Record<number, string>>({});
  const [background, setBackground] = useState('#ffffff');
  const [backgroundDraft, setBackgroundDraft] = useState('#ffffff');
  const [backgroundRemoved, setBackgroundRemoved] = useState<Record<string, boolean>>({});
  const [backgroundTolerance, setBackgroundTolerance] = useState(32);
  const [aiCutouts, setAiCutouts] = useState<Record<string, string>>({});
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgressMessage, setAiProgressMessage] = useState('');
  const [border, setBorder] = useState(1);
  const [borderDraft, setBorderDraft] = useState(1);
  const [activePanel, setActivePanel] = useState<'crop'|'remove-bg'|'color'|'border'|null>(null);
  const [cropDrag, setCropDrag] = useState<{startX:number;startY:number;startCrop:PhotoEdit;mode:'move'|'resize';handle?:string}|null>(null);
  const [cropImageDimensions, setCropImageDimensions] = useState({ width: 4, height: 5 });
  const [language, setLanguage] = useState<'en'|'hi'>('en');
  const [step, setStep] = useState<1|2|3>(1);
  const [error, setError] = useState('');
  const [signatureSrc, setSignatureSrc] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signatureBackground, setSignatureBackground] = useState<SignatureBackground>('transparent');
  const [signatureCustomColor, setSignatureCustomColor] = useState('#ffffff');
  const [signatureRemoveWhite, setSignatureRemoveWhite] = useState(true);
  const [signatureCrop, setSignatureCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [signaturePlacement, setSignaturePlacement] = useState({ x: 58, y: 78, width: 32 });
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const signatureDragRef = useRef<{ x: number; y: number; mode?: 'move' | 'resize' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const selected = photos.find((photo) => photo.id === selectedId) || photos[0] || null;
  const selectedEdit = selected ? (photoEdits[selected.id] || DEFAULT_EDIT) : DEFAULT_EDIT;
  const updateSelectedEdit = (key: keyof PhotoEdit, value: number) => { if (!selected) return; setPhotoEdits((current) => ({ ...current, [selected.id]: { ...(current[selected.id] || DEFAULT_EDIT), [key]: value } })); };

  const dimensions = useMemo(() => {
    if (preset === 'custom') return { width: Math.max(10, customWidth) * 300 / 25.4, height: Math.max(10, customHeight) * 300 / 25.4 };
    return PRESETS[preset];
  }, [preset, customWidth, customHeight]);

  const cropPercentRatio = dimensions.width / dimensions.height * cropImageDimensions.height / cropImageDimensions.width;
  const sheetFitCapacity = useMemo(() => {
    if (paper === 'single') return 1;
    const pageWidth = paper === '4x6' ? 1200 : 2480;
    const pageHeight = paper === '4x6' ? 1800 : 3508;
    const mmToPx = (mm: number) => mm * 300 / 25.4;
    const margin = mmToPx(sheetMargin), gap = mmToPx(sheetGap);
    const cols = Math.max(1, Math.floor((pageWidth - margin * 2 + gap) / (dimensions.width + gap)));
    const rows = Math.max(1, Math.floor((pageHeight - margin * 2 + gap) / (dimensions.height + gap)));
    return cols * rows;
  }, [paper, sheetMargin, sheetGap, dimensions.width, dimensions.height]);
  const sheetCapacity = paper === 'single' ? 1 : 60;
  const fitCropToOutput = (crop: PhotoEdit): PhotoEdit => {
    const ratio = Math.max(0.01, cropPercentRatio);
    const width = Math.min(crop.cropW, crop.cropH * ratio, 100, 100 * ratio);
    const height = width / ratio;
    return { ...crop, cropX: Math.max(0, Math.min(100 - width, crop.cropX + (crop.cropW - width) / 2)), cropY: Math.max(0, Math.min(100 - height, crop.cropY + (crop.cropH - height) / 2)), cropW: width, cropH: height };
  };
  const openCropEditor = () => {
    if (!selected) return;
    setPhotoEdits((current) => ({ ...current, [selected.id]: fitCropToOutput(current[selected.id] || DEFAULT_EDIT) }));
    setActivePanel('crop');
  };

  useEffect(() => {
    if (!selected) return;
    const image = new Image();
    image.onload = () => setCropImageDimensions({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    image.src = selected.src;
  }, [selected?.src]);

  useEffect(() => {
    if (activePanel !== 'crop' || !selected) return;
    setPhotoEdits((current) => {
      const previous = current[selected.id] || DEFAULT_EDIT;
      const fitted = fitCropToOutput(previous);
      if (Math.abs(previous.cropX - fitted.cropX) < 0.01 && Math.abs(previous.cropY - fitted.cropY) < 0.01 && Math.abs(previous.cropW - fitted.cropW) < 0.01 && Math.abs(previous.cropH - fitted.cropH) < 0.01) return current;
      return { ...current, [selected.id]: fitted };
    });
  }, [activePanel, selected?.id, dimensions.width, dimensions.height, cropImageDimensions.width, cropImageDimensions.height]);

  useEffect(() => {
    const canvas = cropPreviewRef.current;
    if (activePanel !== 'crop' || !canvas || !selected) return;
    const width = Math.max(1, Math.round(dimensions.width));
    const height = Math.max(1, Math.round(dimensions.height));
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    const sourceUrl = backgroundRemoved[selected.id] && aiCutouts[selected.id] ? aiCutouts[selected.id] : selected.src;
    const image = new Image();
    image.onload = () => {
      const edit = photoEdits[selected.id] || DEFAULT_EDIT;
      const sx = image.width * edit.cropX / 100, sy = image.height * edit.cropY / 100;
      const sw = image.width * edit.cropW / 100, sh = image.height * edit.cropH / 100;
      ctx.save();
      ctx.filter = mode === 'beauty' ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) blur(${Math.max(0, edit.smooth) * 0.012}px)` : 'none';
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
      ctx.restore();
    };
    image.src = sourceUrl;
  }, [activePanel, selected?.id, selected?.src, dimensions.width, dimensions.height, photoEdits, background, backgroundRemoved, aiCutouts, mode]);

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
    const targetCanvasWidth = isSingle ? photoW : is4x6 ? 1200 : 2480;
    const targetCanvasHeight = isSingle ? photoH : is4x6 ? 1800 : 3508;
    if (canvas.width !== targetCanvasWidth) canvas.width = targetCanvasWidth;
    if (canvas.height !== targetCanvasHeight) canvas.height = targetCanvasHeight;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const mmToPx = (mm: number) => mm * 300 / 25.4;
    const margin = isSingle ? 0 : mmToPx(sheetMargin);
    const gap = isSingle ? 0 : mmToPx(sheetGap);
    const maxCols = isSingle ? 1 : Math.max(1, Math.floor((canvas.width - margin * 2 + gap) / (photoW + gap)));
    const maxRows = isSingle ? 1 : Math.max(1, Math.floor((canvas.height - margin * 2 + gap) / (photoH + gap)));
    const capacity = maxCols * maxRows;
    const desiredSlots = isSingle ? 1 : Math.max(1, Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity));
    let cols = isSingle ? 1 : Math.max(1, Math.min(maxCols, desiredSlots));
    let rows = isSingle ? 1 : Math.max(1, Math.ceil(desiredSlots / cols));
    let layoutScale = 1;
    if (!isSingle && desiredSlots > maxCols * maxRows) {
      const availableW = canvas.width - margin * 2, availableH = canvas.height - margin * 2;
      let bestScale = 0, bestCols = 1;
      for (let candidateCols = 1; candidateCols <= desiredSlots; candidateCols++) {
        const candidateRows = Math.ceil(desiredSlots / candidateCols);
        const scaleW = (availableW - (candidateCols - 1) * gap) / (candidateCols * photoW);
        const scaleH = (availableH - (candidateRows - 1) * gap) / (candidateRows * photoH);
        const candidateScale = Math.min(scaleW, scaleH);
        if (candidateScale > bestScale) { bestScale = candidateScale; bestCols = candidateCols; }
      }
      cols = bestCols; rows = Math.ceil(desiredSlots / cols); layoutScale = Math.min(1, bestScale);
    }
    const layoutW = Math.max(24, Math.round(photoW * layoutScale));
    const layoutH = Math.max(24, Math.round(photoH * layoutScale));
    const usedW = cols * layoutW + (cols - 1) * gap;
    const usedH = rows * layoutH + (rows - 1) * gap;
    const startX = isSingle ? 0 : Math.max(margin, (canvas.width - usedW) / 2);
    const startY = isSingle ? 0 : Math.max(margin, (canvas.height - usedH) / 2);
    const draw = (images: Array<HTMLImageElement | null> = [], signatureImage: HTMLImageElement | null = null) => {
      const rects: SheetRect[] = [];
      for (let slot = 0; slot < desiredSlots; slot++) {
        const row = Math.floor(slot / cols), col = slot % cols;
        const photoIndex = isSingle ? 0 : slot;
        const photo = sourcePhotos[photoIndex];
        const defaultX = startX + col * (layoutW + gap);
        const defaultY = startY + row * (layoutH + gap);
        const position = !isSingle ? sheetPositions[slot] : undefined;
        const slotW = position?.w ?? layoutW, slotH = position?.h ?? layoutH;
        const x = position ? position.x : defaultX, y = position ? position.y : defaultY;
        if (photo) rects.push({ slot, photoId: photo.id, x, y, w: slotW, h: slotH });
        ctx.save();
        ctx.fillStyle = background;
        ctx.fillRect(x, y, slotW, slotH);
        ctx.beginPath(); ctx.rect(x, y, slotW, slotH); ctx.clip();
        const img = images.length ? images[photoIndex % images.length] || undefined : undefined;
        const edit = photo ? (photoEdits[photo.id] || DEFAULT_EDIT) : DEFAULT_EDIT;
        if (img) {
          const cropSourceW = img.width * edit.cropW / 100, cropSourceH = img.height * edit.cropH / 100;
          const scale = Math.max(slotW / cropSourceW, slotH / cropSourceH) * edit.zoom;
          const w = cropSourceW * scale, h = cropSourceH * scale;
          const filter = mode === 'beauty'
            ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) blur(${Math.max(0, edit.smooth) * 0.012}px)`
            : 'brightness(100%) contrast(100%) saturate(100%)';
          ctx.filter = filter;
          const aiCutout = aiCutouts[photo.id];
          const source: CanvasImageSource = backgroundRemoved[photo.id] ? (aiCutout ? img : removePlainBackground(img, backgroundTolerance)) : img;
          const sx=img.width*edit.cropX/100, sy=img.height*edit.cropY/100, sw=img.width*edit.cropW/100, sh=img.height*edit.cropH/100;
          ctx.drawImage(source,sx,sy,sw,sh,x+(slotW-w)/2+edit.moveX*slotW/photoW,y+(slotH-h)/2+edit.moveY*slotH/photoH,w,h);
        } else {
          ctx.fillStyle = '#f1f5f9'; ctx.fillRect(x, y, slotW, slotH);
          ctx.fillStyle = '#64748b'; ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('Upload a photo', x + slotW / 2, y + slotH / 2);
        }
        if (img && signatureImage) {
          const cropX = signatureImage.width * signatureCrop.x / 100;
          const cropY = signatureImage.height * signatureCrop.y / 100;
          const cropW = signatureImage.width * signatureCrop.w / 100;
          const cropH = signatureImage.height * signatureCrop.h / 100;
          if (cropW > 0 && cropH > 0) {
            const signatureCanvas = document.createElement('canvas');
            signatureCanvas.width = Math.max(1, Math.round(cropW));
            signatureCanvas.height = Math.max(1, Math.round(cropH));
            const signatureCtx = signatureCanvas.getContext('2d');
            if (signatureCtx) {
              signatureCtx.drawImage(signatureImage, cropX, cropY, cropW, cropH, 0, 0, signatureCanvas.width, signatureCanvas.height);
              if (signatureRemoveWhite && signatureBackground !== 'white') {
                const pixels = signatureCtx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
                for (let p = 0; p < pixels.data.length; p += 4) {
                  const r = pixels.data[p], g = pixels.data[p + 1], b = pixels.data[p + 2];
                  const lightness = (r + g + b) / 3;
                  const whiteness = Math.min(r, g, b);
                  if (lightness > 238 && whiteness > 225) pixels.data[p + 3] = 0;
                  else if (lightness > 210 && whiteness > 195) pixels.data[p + 3] = Math.round(pixels.data[p + 3] * (238 - lightness) / 28);
                }
                signatureCtx.putImageData(pixels, 0, 0);
              }
              const drawW = slotW * signaturePlacement.width / 100;
              const drawH = drawW * signatureCanvas.height / signatureCanvas.width;
              const drawX = x + slotW * signaturePlacement.x / 100;
              const drawY = y + slotH * signaturePlacement.y / 100;
              ctx.save();
              if (signatureBackground !== 'transparent') {
                ctx.fillStyle = signatureBackground === 'white' ? '#ffffff' : signatureCustomColor;
                ctx.fillRect(drawX - 3, drawY - 3, drawW + 6, drawH + 6);
              }
              ctx.drawImage(signatureCanvas, drawX, drawY, drawW, drawH);
              ctx.restore();
            }
          }
        }
        ctx.restore();
        if (border > 0) { ctx.strokeStyle = '#111827'; ctx.lineWidth = border * 2; ctx.strokeRect(x, y, slotW, slotH); }
        
      }
      sheetRectsRef.current = rects;
    };
    const sourcePhotos = paper === 'single'
      ? (selected ? [selected] : [])
      : Array.from({ length: desiredSlots }, (_, slot) => {
          const overrideId = sheetPhotoOverrides[slot];
          return (overrideId && photos.find((photo) => photo.id === overrideId)) || photos[slot % Math.max(1, photos.length)];
        }).filter((photo): photo is Photo => Boolean(photo));
    if (!sourcePhotos.length) { draw(); return; }
    let cancelled = false;
    Promise.all(sourcePhotos.map((photo) => loadSheetImage(photo.src))).then(async (originals) => {
      const loaded = await Promise.all(sourcePhotos.map((photo, index) => aiCutouts[photo.id]
        ? loadSheetImage(aiCutouts[photo.id]).then((cut) => cut || originals[index])
        : Promise.resolve(originals[index])));
      if (cancelled) return;
      if (loaded.some((img) => img === null)) setError('कुछ फोटो लोड नहीं हो सकीं। कृपया उन्हें दोबारा चुनें।');
      let signatureImage: HTMLImageElement | null = null;
      if (signatureSrc) {
        signatureImage = await new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image(); img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = signatureSrc;
        });
      }
      if (cancelled) return;
      draw(loaded, signatureImage);
    });
    return () => { cancelled = true; };
  }, [selected, photos, dimensions, paper, sheetMargin, sheetGap, sheetPhotoCount, sheetPhotoOverrides, background, mode, photoEdits, sheetPositions, border, signatureSrc, signatureBackground, signatureCustomColor, signatureRemoveWhite, signatureCrop, signaturePlacement, backgroundRemoved, backgroundTolerance, aiCutouts]);

  const updateSignatureFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('सिग्नेचर के लिए JPG या PNG इमेज चुनें।'); return; }
    try {
      setSignatureSrc(await readFile(file)); setSignatureName(file.name);
      setSignatureCrop({ x: 0, y: 0, w: 100, h: 100 }); setError('');
    } catch { setError('सिग्नेचर इमेज पढ़ी नहीं जा सकी।'); }
  };
  const downloadSignaturePng = async () => {
    if (!signatureSrc) return;
    const img = new Image();
    img.onload = () => {
      const sx = img.width * signatureCrop.x / 100, sy = img.height * signatureCrop.y / 100;
      const sw = img.width * signatureCrop.w / 100, sh = img.height * signatureCrop.h / 100;
      const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(sw)); out.height = Math.max(1, Math.round(sh));
      const c = out.getContext('2d'); if (!c) return;
      const raw = document.createElement('canvas'); raw.width = out.width; raw.height = out.height;
      const rawCtx = raw.getContext('2d'); if (!rawCtx) return;
      rawCtx.drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height);
      if (signatureRemoveWhite && signatureBackground !== 'white') {
        const pixels = rawCtx.getImageData(0, 0, out.width, out.height);
        for (let p = 0; p < pixels.data.length; p += 4) {
          const r = pixels.data[p], g = pixels.data[p + 1], b = pixels.data[p + 2], light = (r + g + b) / 3;
          if (light > 238 && Math.min(r, g, b) > 225) pixels.data[p + 3] = 0;
          else if (light > 210 && Math.min(r, g, b) > 195) pixels.data[p + 3] = Math.round(pixels.data[p + 3] * (238 - light) / 28);
        }
        rawCtx.putImageData(pixels, 0, 0);
      }
      if (signatureBackground !== 'transparent') { c.fillStyle = signatureBackground === 'white' ? '#fff' : signatureCustomColor; c.fillRect(0, 0, out.width, out.height); }
      c.drawImage(raw, 0, 0);
      const a = document.createElement('a'); a.download = 'tanshu-signature.png'; a.href = out.toDataURL('image/png'); a.click();
    };
    img.src = signatureSrc;
  };
  const moveSignatureCrop = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = (event.currentTarget.parentElement || event.currentTarget).getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100));
    const y = Math.max(0, Math.min(100, (event.clientY - box.top) / box.height * 100));
    if (!signatureDragRef.current) { signatureDragRef.current = { x, y }; return; }
    const start = signatureDragRef.current;
    setSignatureCrop((current) => {
      const dx = x - start.x, dy = y - start.y;
      if (start.mode === 'resize') return { ...current, w: Math.max(5, Math.min(100 - current.x, current.w + dx)), h: Math.max(5, Math.min(100 - current.y, current.h + dy)) };
      return { ...current, x: Math.max(0, Math.min(100 - current.w, current.x + dx)), y: Math.max(0, Math.min(100 - current.h, current.y + dy)) };
    });
    signatureDragRef.current = { x, y, mode: start.mode };
  };
  const handleSheetPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas=canvasRef.current;if(!canvas)return;const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height;
    if(paper==='single'){if(!selected)return;const photoW=canvas.width,photoH=canvas.height,sigW=photoW*signaturePlacement.width/100,sigH=signatureSrc?(()=>{const image=new Image();image.src=signatureSrc;return sigW*(image.naturalHeight||image.height||1)/(image.naturalWidth||image.width||1);})():0,sigX=photoW*signaturePlacement.x/100,sigY=photoH*signaturePlacement.y/100,onSignature=!!signatureSrc&&x>=sigX&&x<=sigX+sigW&&y>=sigY&&y<=sigY+sigH,resizeSignature=onSignature&&x>=sigX+sigW-Math.max(18,photoW*.035)&&y>=sigY+sigH-Math.max(18,photoH*.035),edit=photoEdits[selected.id]||DEFAULT_EDIT;activeCanvasDragRef.current={kind:onSignature?'signature':'photo',startX:x,startY:y,startMoveX:edit.moveX,startMoveY:edit.moveY,startSigX:signaturePlacement.x,startSigY:signaturePlacement.y,startSigWidth:signaturePlacement.width,resizeSignature};canvas.setPointerCapture(event.pointerId);return;}
    const hit=[...sheetRectsRef.current].reverse().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(!hit){setSelectedSheetSlot(null);canvas.style.cursor='grab';return;}setSelectedSheetSlot(hit.slot);
    const hs=Math.max(22,Math.min(42,Math.min(hit.w,hit.h)*.09)),l=x<=hit.x+hs,r=x>=hit.x+hit.w-hs,t=y<=hit.y+hs,b=y>=hit.y+hit.h-hs,corner=(l||r)&&(t||b),canResize=hit.slot===0,handle=t?(l?'tl':'tr'):(l?'bl':'br'),resizing=corner&&canResize;
    event.preventDefault();canvas.style.cursor=resizing?(handle==='tl'||handle==='br'?'nwse-resize':'nesw-resize'):'grabbing';activeSheetDragRef.current={slot:hit.slot,mode:resizing?'resize':'move',startX:x,startY:y,startRect:hit,handle};canvas.setPointerCapture(event.pointerId);
  };
  const handleSheetPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas=canvasRef.current,cd=activeCanvasDragRef.current;if(cd&&canvas&&selected){const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height,dx=x-cd.startX,dy=y-cd.startY;if(cd.kind==='signature')setSignaturePlacement(p=>cd.resizeSignature?({...p,width:Math.max(5,Math.min(90,cd.startSigWidth+dx/canvas.width*100))}):({...p,x:Math.max(0,Math.min(100-p.width,cd.startSigX+dx/canvas.width*100)),y:Math.max(0,Math.min(100,cd.startSigY+dy/canvas.height*100))}));else setPhotoEdits(cur=>({...cur,[selected.id]:{...(cur[selected.id]||DEFAULT_EDIT),moveX:cd.startMoveX+dx,moveY:cd.startMoveY+dy}}));return;}
    const drag=activeSheetDragRef.current;if(!drag||!canvas){if(canvas&&paper!=='single'){const bounds=canvas.getBoundingClientRect(),px=(event.clientX-bounds.left)*canvas.width/bounds.width,py=(event.clientY-bounds.top)*canvas.height/bounds.height,hover=[...sheetRectsRef.current].reverse().find(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h);if(hover){const hs=Math.max(22,Math.min(42,Math.min(hover.w,hover.h)*.09)),left=px<=hover.x+hs,right=px>=hover.x+hover.w-hs,top=py<=hover.y+hs,bottom=py>=hover.y+hover.h-hs,isCorner=(left||right)&&(top||bottom);canvas.style.cursor=isCorner&&hover.slot===0?((top&&left)||(bottom&&right)?'nwse-resize':'nesw-resize'):'grab';}else canvas.style.cursor='grab';}return;}const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height,dx=x-drag.startX,dy=y-drag.startY,s=drag.startRect;
    if(drag.mode==='move'){
      const others=sheetRectsRef.current.filter(r=>r.slot!==drag.slot),gap=sheetGap*300/25.4;
      let nx=Math.max(0,Math.min(canvas.width-s.w,s.x+dx));
      let ny=Math.max(0,Math.min(canvas.height-s.h,s.y+dy));
      // Smart alignment: snap to a neighbour's top/centre/bottom line and
      // to its left/right edge with the configured cutting gap.
      const snapDistance=8*300/25.4;
      const nearest=(value:number,candidates:number[])=>{
        let best=value,bestDistance=snapDistance+1;
        for(const candidate of candidates){
          const distance=Math.abs(value-candidate);
          if(distance<bestDistance){best=candidate;bestDistance=distance;}
        }
        return best;
      };
      // The master (first) photo is positioned freely; only later copies snap to it.
      if (drag.slot !== 0) {
        nx=nearest(nx,others.flatMap(r=>[r.x,r.x+r.w+gap,r.x-gap-s.w]));
        ny=nearest(ny,others.flatMap(r=>[r.y,r.y+(r.h-s.h)/2,r.y+r.h+gap,r.y-gap-s.h]));
      }
      nx=Math.max(0,Math.min(canvas.width-s.w,nx));
      ny=Math.max(0,Math.min(canvas.height-s.h,ny));
      const tooClose=others.some(r=>nx<r.x+r.w+gap-1&&nx+s.w>r.x-gap+1&&ny<r.y+r.h+gap-1&&ny+s.h>r.y-gap+1);
      if(!tooClose){
        const nextRect={...s,x:nx,y:ny};
        // Keep geometry in sync immediately; React/canvas repaint is coalesced to one frame.
        sheetRectsRef.current=sheetRectsRef.current.map(rect=>rect.slot===drag.slot?nextRect:rect);
        pendingSheetMoveRef.current={slot:drag.slot,position:{x:nx,y:ny,w:s.w,h:s.h}};
        if(sheetMoveFrameRef.current===null){
          sheetMoveFrameRef.current=requestAnimationFrame(()=>{
            sheetMoveFrameRef.current=null;
            const pending=pendingSheetMoveRef.current;
            pendingSheetMoveRef.current=null;
            if(pending)setSheetPositions(cur=>({...cur,[pending.slot]:pending.position}));
          });
        }
      }
    }
    else{
      const ratio=s.w/s.h,left=drag.handle==='tl'||drag.handle==='bl',top=drag.handle==='tl'||drag.handle==='tr',delta=(left?-dx:dx)+(top?-dy*ratio:dy*ratio);
      // Keep the resize anchor inside the paper edge; no artificial page margin lock.
      const maxW=Math.min(left?s.x+s.w:canvas.width-s.x,(top?s.y+s.h:canvas.height-s.y)*ratio);
      const wantedW=Math.max(Math.max(24,Math.min(s.w,s.h)*.18),Math.min(maxW,s.w+delta/2));
      const others=sheetRectsRef.current.filter(r=>r.slot!==drag.slot);
      const makeRect=(w:number)=>({x:left?s.x+s.w-w:s.x,y:top?s.y+s.h-w/ratio:s.y,w,h:w/ratio});
      const cuttingGap=sheetGap*300/25.4;
      const collides=(rect:{x:number;y:number;w:number;h:number})=>others.some(r=>rect.x<r.x+r.w+cuttingGap&&rect.x+rect.w>r.x-cuttingGap&&rect.y<r.y+r.h+cuttingGap&&rect.y+rect.h>r.y-cuttingGap);
      let low=Math.max(24,Math.min(s.w,s.h)*.18),high=wantedW;
      if(collides(makeRect(high))){for(let i=0;i<14;i++){const mid=(low+high)/2;if(collides(makeRect(mid)))high=mid;else low=mid;} }
      const next=makeRect(Math.max(low,Math.min(wantedW,high)));
      // Keep the live selection outline and corner handles locked to the resized photo immediately.
      sheetRectsRef.current=sheetRectsRef.current.map(rect=>rect.slot===drag.slot?{...rect,...next}:{...rect,w:next.w,h:next.h});
      setSheetPositions(cur=>{
        const synced:{[slot:number]:{x:number;y:number;w:number;h:number}}={...cur};
        // The first photo sets the common print dimensions for every copy on this sheet.
        for(const rect of sheetRectsRef.current)synced[rect.slot]={x:rect.x,y:rect.y,w:next.w,h:next.h};
        synced[drag.slot]=next;
        return synced;
      });
    }
  };
  const handleSheetPointerUp = (event?: React.PointerEvent<HTMLCanvasElement>) => { flushSheetMove(); activeSheetDragRef.current = null; activeCanvasDragRef.current = null; if(event)event.currentTarget.style.cursor='grab'; if (event?.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };

  const [nudgeStepMm, setNudgeStepMm] = useState(1);
  const nudgeMasterPhoto = (dxMm: number, dyMm: number) => {
    if (paper === 'single') return;
    const master = sheetRectsRef.current.find((rect) => rect.slot === 0);
    if (!master) return;
    const step = 300 / 25.4;
    const gap = sheetGap * step;
    const nextX = Math.max(0, Math.min((canvasRef.current?.width || 0) - master.w, master.x + dxMm * step));
    const nextY = Math.max(0, Math.min((canvasRef.current?.height || 0) - master.h, master.y + dyMm * step));
    const others = sheetRectsRef.current.filter((rect) => rect.slot !== 0);
    const collides = others.some((rect) => nextX < rect.x + rect.w + gap - 1 && nextX + master.w > rect.x - gap + 1 && nextY < rect.y + rect.h + gap - 1 && nextY + master.h > rect.y - gap + 1);
    if (collides) return;
    const nextRect = { ...master, x: nextX, y: nextY };
    sheetRectsRef.current = sheetRectsRef.current.map((rect) => rect.slot === 0 ? nextRect : rect);
    setSheetPositions((current) => ({ ...current, 0: { x: nextX, y: nextY, w: master.w, h: master.h } }));
    setSelectedSheetSlot(0);
  };
  const handleSheetKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (paper === 'single' || !sheetRectsRef.current.some((rect) => rect.slot === 0)) return;
    const step = (event.shiftKey ? 5 : 1) * 300 / 25.4;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    nudgeMasterPhoto(move[0] / (300 / 25.4), move[1] / (300 / 25.4));
  };

  const resetSheetLayout = () => { setSheetPositions({}); setSelectedSheetSlot(null); };
  const autoArrangeSheet = () => {
    // Restore the clean grid and clear the active selection.
    setSheetPositions({});
    setSelectedSheetSlot(null);
  };
  const setPresetSheetCount = (count: number) => {
    setSheetPhotoCount(Math.max(1, Math.min(sheetCapacity, count)));
    setSheetPhotoOverrides({});
    setSheetPositions({});
    setSelectedSheetSlot(null);
    setSelectedSheetSlot(null);
  };
  const addSelectedSheetCopy = () => {
    if (!selected) return;
    const currentCount = Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity);
    if (currentCount >= sheetCapacity) return;
    setSheetPhotoOverrides((current) => ({ ...current, [currentCount]: selected.id }));
    setSheetPhotoCount(currentCount + 1);
    setSelectedSheetSlot(currentCount);
  };
  const duplicateSelectedSheetPhoto = () => {
    if (selectedSheetSlot === null || paper === 'single') return;
    const sourceRect = sheetRectsRef.current.find((rect) => rect.slot === selectedSheetSlot);
    const currentCount = sheetPhotoCount || sheetFitCapacity;
    if (!sourceRect || currentCount >= sheetCapacity) return;
    const nextSlot = Math.min(sheetCapacity, currentCount);
    setSheetPhotoOverrides((current) => ({ ...current, [nextSlot]: sourceRect.photoId }));
    setSheetPhotoCount(nextSlot + 1);
    setSelectedSheetSlot(nextSlot);
  };
  const useAutoFitSheet = () => {
    setSheetPhotoCount(0);
    setSheetPhotoOverrides({});
    setSheetPositions({});
    setSelectedSheetSlot(null);
  };

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
  const printSheet = () => {
    if (!canvasRef.current || !selected) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { setError('Print window blocked. कृपया pop-up allow करके फिर Print दबाएँ।'); return; }
    const pageWidth = paper === 'single' ? `${dimensions.width * 25.4 / 300}mm` : paper === '4x6' ? '101.6mm' : '210mm';
    const pageHeight = paper === 'single' ? `${dimensions.height * 25.4 / 300}mm` : paper === '4x6' ? '152.4mm' : '297mm';
    const pageSize = paper === 'single' ? `${pageWidth} ${pageHeight}` : paper === '4x6' ? '4in 6in' : 'A4';
    const imageUrl = canvasRef.current.toDataURL('image/png');
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Tanshu Photo Sheet</title><style>@page{size:${pageSize};margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;width:${pageWidth};height:${pageHeight};background:#fff}img{display:block;width:100%;height:100%;object-fit:fill} @media print{html,body{width:${pageWidth};height:${pageHeight};margin:0;padding:0}}</style></head><body><img id="photo-sheet" src="${imageUrl}" alt="Photo sheet"></body></html>`);
    printWindow.document.close();
    const image = printWindow.document.getElementById('photo-sheet') as HTMLImageElement | null;
    const startPrint = () => { printWindow.focus(); printWindow.print(); };
    if (image?.complete) startPrint(); else if (image) image.onload = startPrint;
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

  const removePhoto = (photoId: string) => {
    const next = photos.filter((photo) => photo.id !== photoId);
    setPhotos(next);
    setSelectedId((current) => current === photoId ? (next[0]?.id || '') : current);
    setPhotoEdits((current) => { const updated = { ...current }; delete updated[photoId]; return updated; });
    setAiCutouts((current) => { const updated = { ...current }; delete updated[photoId]; return updated; });
    setBackgroundRemoved((current) => { const updated = { ...current }; delete updated[photoId]; return updated; });
  };
  const removeSelected = () => { if (selected) removePhoto(selected.id); };

  const Slider = ({ label, value, min = 0, max = 200, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void }) => (
    <label className="block space-y-1.5">
      <span className="flex justify-between text-xs font-semibold text-slate-700"><span>{label}</span><span className="tabular-nums text-slate-500">{value}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-blue-600" />
    </label>
  );

  const selectedSheetRect = selectedSheetSlot === null ? null : sheetRectsRef.current.find((rect) => rect.slot === selectedSheetSlot) || null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Advanced Passport Photo Studio</h2>
          <p className="text-sm text-slate-500">{language==='hi'?'फोटो तैयार करें, साइज सेट करें और प्रिंट शीट डाउनलोड करें।':'Prepare your photo, set its size, and download a print sheet.'}</p>
        </div>
        <div className="flex items-center gap-2"><button onClick={()=>setLanguage(language==='en'?'hi':'en')} className="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold">{language==='en'?'हिंदी':'English'}</button><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" />{language==='hi'?'फोटो ब्राउज़र में प्रोसेस होती है':'Browser-side processing'}</span></div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">{([1,2,3] as const).map(n=><button key={n} onClick={()=>setStep(n)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${step===n?'border-blue-600 bg-blue-600 text-white':'border-slate-200 bg-white text-slate-600'}`}>{n===1?(language==='hi'?'1. अपलोड':'1. Upload'):n===2?(language==='hi'?'2. एडिट':'2. Edit'):(language==='hi'?'3. डाउनलोड':'3. Export')}</button>)}</div>
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(280px,0.9fr)_minmax(320px,1.1fr)]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div>
            <div className="mb-2 flex items-center justify-between"><h3 className="font-bold text-slate-900">1. फोटो अपलोड</h3><span className="text-xs text-slate-500">{photos.length} फोटो</span></div>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { void addPhotos(event.target.files); event.currentTarget.value = ''; }} />
            <button onClick={() => uploadRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-300 bg-white px-4 py-5 text-sm font-semibold text-blue-700 hover:bg-blue-50"><span className="flex items-center gap-2"><Upload className="h-5 w-5" /> Choose one or more photos</span><span className="text-xs font-medium">एक या कई फोटो चुनें</span></button>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            {photos.length > 0 && <><p className="mt-2 text-[11px] text-slate-500">शीट में फोटो का क्रम बदलने के लिए थंबनेल को माउस से खींचकर दूसरी फोटो पर छोड़ें।</p><div className="mt-3 grid grid-cols-4 gap-2">{photos.map((photo) => <div key={photo.id} draggable onDragStart={() => setDraggingPhotoId(photo.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorderPhotos(draggingPhotoId, photo.id); setDraggingPhotoId(''); }} onDragEnd={() => setDraggingPhotoId('')} className={`relative overflow-hidden rounded-lg border-2 bg-white ${selected?.id === photo.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'} ${draggingPhotoId === photo.id ? 'opacity-40' : ''}`}><button type="button" onClick={() => setSelectedId(photo.id)} title={`Select photo: ${photo.name}`} className="block w-full"><img src={photo.src} alt={photo.name} className="aspect-square w-full object-cover" /></button><button type="button" aria-label={`Delete ${photo.name}`} title="Delete photo" onClick={(event) => { event.stopPropagation(); removePhoto(photo.id); }} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"><Trash2 className="h-4 w-4" /></button></div>)}</div></>}
          </div>

          {step===1 && <>
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
            {preset === 'custom' && <div className="mt-2 space-y-2"><label className="block text-xs text-slate-600">Measurement unit<select value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value as SizeUnit)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"><option value="mm">Millimetres (MM)</option><option value="cm">Centimetres (CM)</option><option value="in">Inches (IN)</option></select></label><div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-600">Width ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customWidth,sizeUnit).toFixed(2))} onChange={(e) => setCustomWidth(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label><label className="text-xs text-slate-600">Height ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customHeight,sizeUnit).toFixed(2))} onChange={(e) => setCustomHeight(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label></div></div>}
            <p className="mt-2 text-xs text-slate-500">चुने गए साइज का आउटपुट 300 DPI के हिसाब से तैयार होगा। हर आवेदन की फोटो गाइडलाइन अलग हो सकती है।</p>
          </div>

          </>}
          {step===2 && <>
          <div className="grid grid-cols-2 gap-2"><button onClick={openCropEditor} disabled={!selected} className="rounded-xl border bg-white p-3 text-sm font-bold disabled:opacity-40">✂️ {language==='hi'?'फोटो क्रॉप करें':'Crop Photo'}</button><button onClick={()=>setActivePanel('remove-bg')} disabled={!selected} className="rounded-xl border bg-white p-3 text-sm font-bold disabled:opacity-40">{language==='hi'?'बैकग्राउंड हटाएँ':'Remove Background'}</button><button onClick={()=>{setBackgroundDraft(background);setActivePanel('color');}} className="rounded-xl border bg-white p-3 text-sm font-bold">{language==='hi'?'बैकग्राउंड रंग':'Background Color'}</button><button onClick={()=>{setBorderDraft(border);setActivePanel('border');}} className="rounded-xl border bg-white p-3 text-sm font-bold">{language==='hi'?'बॉर्डर सेट करें':'Border Settings'}</button></div>


          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-900">7. Signature Editor</h3>
            <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void updateSignatureFile(e.target.files?.[0]); e.currentTarget.value = ''; }} />
            <button onClick={() => signatureInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-white px-3 py-3 text-sm font-semibold text-blue-700"><Upload className="h-4 w-4" /> सिग्नेचर अपलोड करें</button>
            {signatureSrc && <>
              <p className="text-xs text-slate-500">{signatureName} · Drag the crop box to move and its corner to resize. फोटो पर signature को preview में सीधे drag करके रखें।</p>
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg border border-slate-300 bg-[linear-gradient(45deg,#eee_25%,transparent_25%),linear-gradient(-45deg,#eee_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]">
                <img src={signatureSrc} alt="Signature crop source" className="block max-h-48 w-full object-contain" />
                <div className="absolute border-2 border-blue-600 bg-blue-300/10" style={{ left: signatureCrop.x + '%', top: signatureCrop.y + '%', width: signatureCrop.w + '%', height: signatureCrop.h + '%' }} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); const parent = e.currentTarget.parentElement!.getBoundingClientRect(); signatureDragRef.current = { x: (e.clientX - parent.left) / parent.width * 100, y: (e.clientY - parent.top) / parent.height * 100, mode: (e.target as HTMLElement).dataset.resize === 'handle' ? 'resize' : 'move' }; }} onPointerMove={(e) => { if (e.buttons === 1) moveSignatureCrop(e as unknown as React.PointerEvent<HTMLDivElement>); }} onPointerUp={() => { signatureDragRef.current = null; }}><span data-resize="handle" className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-600" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Crop width (%)" min={5} max={100} value={signatureCrop.w} onChange={(v) => setSignatureCrop((c) => ({ ...c, w: Math.min(v, 100 - c.x) }))} />
                <Slider label="Crop height (%)" min={5} max={100} value={signatureCrop.h} onChange={(v) => setSignatureCrop((c) => ({ ...c, h: Math.min(v, 100 - c.y) }))} />
                <Slider label="Crop left (%)" min={0} max={95} value={signatureCrop.x} onChange={(v) => setSignatureCrop((c) => ({ ...c, x: Math.min(v, 100 - c.w) }))} />
                <Slider label="Crop top (%)" min={0} max={95} value={signatureCrop.y} onChange={(v) => setSignatureCrop((c) => ({ ...c, y: Math.min(v, 100 - c.h) }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['transparent', 'white', 'custom'] as SignatureBackground[]).map((v) => <button key={v} onClick={() => setSignatureBackground(v)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${signatureBackground === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'}`}>{v === 'transparent' ? 'Transparent' : v === 'white' ? 'White' : 'Custom Color'}</button>)}
                {signatureBackground === 'custom' && <input aria-label="Signature background color" type="color" value={signatureCustomColor} onChange={(e) => setSignatureCustomColor(e.target.value)} className="h-9 w-12 rounded border" />}
              </div>
              {signatureBackground === 'transparent' && <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={signatureRemoveWhite} onChange={(e) => setSignatureRemoveWhite(e.target.checked)} /> सफेद पेपर बैकग्राउंड हटाकर transparent करें</label>}
              <div className="border-t border-slate-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">फोटो पर सिग्नेचर की जगह और साइज़</p>
                <Slider label="Left position (%)" min={0} max={90} value={signaturePlacement.x} onChange={(v) => setSignaturePlacement((p) => ({ ...p, x: v }))} />
                <Slider label="Top position (%)" min={0} max={95} value={signaturePlacement.y} onChange={(v) => setSignaturePlacement((p) => ({ ...p, y: v }))} />
                <Slider label="Signature width (%)" min={5} max={80} value={signaturePlacement.width} onChange={(v) => setSignaturePlacement((p) => ({ ...p, width: v }))} />
              </div>
              <div className="flex flex-wrap gap-2"><button onClick={() => void downloadSignaturePng()} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Download Signature PNG</button><button onClick={() => { setSignatureSrc(''); setSignatureName(''); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">Remove Signature</button></div>
            </>}
            <p className="text-[11px] text-slate-500">Transparent mode में सफेद pixels हटाने का threshold आधारित विकल्प है; हल्के रंग के हस्ताक्षर पर परिणाम जाँचें।</p>
          </div>

          {mode === 'beauty' && <div className="space-y-3 border-t border-slate-200 pt-4"><h3 className="flex items-center gap-2 font-bold text-slate-900"><SlidersHorizontal className="h-4 w-4" /> 5. Beauty & Enhance</h3><Slider label="Brightness" value={selectedEdit.brightness} min={50} max={150} onChange={(v) => updateSelectedEdit('brightness', v)} /><Slider label="Contrast" value={selectedEdit.contrast} min={50} max={150} onChange={(v) => updateSelectedEdit('contrast', v)} /><Slider label="Saturation" value={selectedEdit.saturation} min={0} max={200} onChange={(v) => updateSelectedEdit('saturation', v)} /><Slider label="Softening (हल्का blur)" value={selectedEdit.smooth} min={0} max={10} onChange={(v) => updateSelectedEdit('smooth', v)} /><p className="text-[11px] text-slate-500">Softening हल्का blur है, skin smoothing से अलग। अभी AI blemish removal / face retouch उपलब्ध नहीं है।</p></div>}

          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">6. Crop & Position</h3><button onClick={resetAdjustments} className="text-xs font-semibold text-blue-700"><RefreshCw className="mr-1 inline h-3 w-3" /> Reset</button></div>
            <p className="mb-2 text-xs text-slate-500">चुनी हुई फोटो की Crop अलग से सेट करें। Single Photo preview में फोटो को सीधे drag करके position भी बदल सकते हैं।</p>
            <div className="grid grid-cols-2 gap-3"><Slider label="Zoom" min={50} max={200} value={Math.round(selectedEdit.zoom * 100)} onChange={(v) => updateSelectedEdit('zoom', v / 100)} /><Slider label="Move left / right" min={-250} max={250} value={selectedEdit.moveX} onChange={(v) => updateSelectedEdit('moveX', v)} /></div>
            <div className="mt-3"><Slider label="Move up / down" min={-250} max={250} value={selectedEdit.moveY} onChange={(v) => updateSelectedEdit('moveY', v)} /></div>
          </div>
          {selected && <button onClick={removeSelected} className="text-xs font-semibold text-red-600 hover:text-red-700"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove selected photo</button>}
          </>}
          {step===3 && <div className="space-y-3"><p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{language==='hi'?'प्रीव्यू जाँचें और JPG/PDF डाउनलोड करें।':'Check the preview and download JPG/PDF.'}</p><button onClick={()=>{setStep(2);openCropEditor();}} disabled={!selected} className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm font-bold text-blue-700 disabled:opacity-40">← {language==='hi'?'वापस जाएँ और Crop सुधारें':'Back to Crop & Adjust'}</button></div>}
        </section>

        <section className="min-w-0 space-y-4 xl:sticky xl:top-3 xl:self-start">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">{language==='hi'?'लाइव प्रिंट प्रीव्यू':'Live Print Preview'}</h3><select value={paper} onChange={(e) => { const next = e.target.value as Paper; setPaper(next); setSheetPhotoCount(next === '4x6' ? 4 : next === 'A4' ? 0 : 1); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="single">Single Photo</option><option value="4x6">4 × 6 inch Photo Sheet</option><option value="A4">A4 Photo Sheet</option></select><div className="flex rounded-lg border border-slate-200 bg-white p-1"><button onClick={() => { setPaper('4x6'); setSheetPhotoCount(4); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className={`rounded px-3 py-1.5 text-xs font-semibold ${paper === '4x6' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>4 × 6 inch</button><button onClick={() => { setPaper('A4'); setSheetPhotoCount(0); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className={`rounded px-3 py-1.5 text-xs font-semibold ${paper === 'A4' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>A4 Sheet</button></div></div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3"><button onClick={autoArrangeSheet} disabled={paper === 'single'} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-40">Auto Arrange</button><button onClick={resetSheetLayout} disabled={paper === 'single' || Object.keys(sheetPositions).length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Reset Layout</button><span className="self-center text-[11px] text-slate-500">फोटो चुनें, बीच से खिसकाएँ और किसी कोने से छोटा-बड़ा करें।</span></div><div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-slate-700">Photos on this sheet</span><span className="text-[11px] text-slate-500">Capacity: {sheetFitCapacity} · Selected: {Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity)}</span></div><div className="flex flex-wrap gap-2"><button onClick={() => setPresetSheetCount(4)} disabled={paper === 'single' || sheetFitCapacity < 4} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${sheetPhotoCount === 4 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'}`}>4 Photos</button><button onClick={() => setPresetSheetCount(6)} disabled={paper === 'single' || sheetFitCapacity < 6} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${sheetPhotoCount === 6 ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300'}`}>6 Photos</button><button onClick={useAutoFitSheet} disabled={paper === 'single'} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">Auto-fit</button><button onClick={addSelectedSheetCopy} disabled={paper === 'single' || !selected || Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity) >= sheetCapacity} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">+ Add selected photo copy</button><button onClick={duplicateSelectedSheetPhoto} disabled={paper === 'single' || selectedSheetSlot === null || Math.min(sheetCapacity, sheetPhotoCount || sheetCapacity) >= sheetCapacity} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-40">Duplicate selected sheet photo</button></div><label className="block text-xs text-slate-600">Custom photo count<input type="number" min="1" max={sheetCapacity} value={paper === 'single' ? 1 : Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity)} onChange={(e) => setPresetSheetCount(Number(e.target.value) || 1)} disabled={paper === 'single'} className="mt-1 w-full rounded-lg border p-2" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-600">Page margin (mm)<input type="number" min="0" max="15" value={sheetMargin} onChange={(e) => setSheetMargin(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full rounded-lg border p-2" /></label><label className="text-xs text-slate-600">Cutting gap (mm)<input type="number" min="0" max="8" value={sheetGap} onChange={(e) => setSheetGap(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full rounded-lg border p-2" /></label></div><p className="text-[11px] text-slate-500">Auto-fit से मूल साइज में फिट होने वाली अधिकतम फोटो लगेंगी। Custom count में 7–8 या जरूरत के अनुसार कॉपी बढ़ाएँ; ज्यादा फोटो चुनने पर शुरुआती लेआउट अपने-आप छोटा होकर शीट में फिट होगा। फिर किसी भी फोटो के कोने से उसका साइज अलग बदलें। PDF प्रिंट करते समय Actual size / 100% चुनें; “Fit to page” बंद रखें। प्रिंटर के printable margins अलग हो सकते हैं।</p></div>{aiProcessing && <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">{aiProgressMessage || 'BiRefNet AI फोटो का background हटा रहा है… पूरा होने पर Preview अपने-आप अपडेट होगा।'}</p>}
          {paper !== 'single' && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="text-sm font-bold text-blue-900">पहला फोटो सेट करें (Master Position)</p><p className="text-[11px] text-blue-800">पहले फोटो को चुनें। माउस से आराम से खिसकाएँ या नीचे के बटन इस्तेमाल करें।</p></div>
              <button type="button" onClick={() => { setSelectedSheetSlot(0); canvasRef.current?.focus(); }} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-800">पहला फोटो चुनें</button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-blue-900">Move step</label>
              <select aria-label="Movement step in millimetres" value={nudgeStepMm} onChange={(e) => setNudgeStepMm(Number(e.target.value))} className="rounded-lg border border-blue-200 bg-white px-2 py-2 text-xs">
                <option value={0.2}>0.2 mm</option><option value={0.5}>0.5 mm</option><option value={1}>1 mm</option><option value={2}>2 mm</option><option value={5}>5 mm</option>
              </select>
              <span className="text-[11px] text-blue-800">कंप्यूटर: फोटो चुनकर Arrow Keys दबाएँ; Shift + Arrow = 5 mm</span>
            </div>
            <div className="mx-auto grid w-36 grid-cols-3 gap-1">
              <span />
              <button type="button" aria-label="Move first photo up" onClick={() => nudgeMasterPhoto(0,-nudgeStepMm)} className="rounded-lg border border-blue-200 bg-white py-2 text-lg font-bold text-blue-800 active:bg-blue-100">↑</button>
              <span />
              <button type="button" aria-label="Move first photo left" onClick={() => nudgeMasterPhoto(-nudgeStepMm,0)} className="rounded-lg border border-blue-200 bg-white py-2 text-lg font-bold text-blue-800 active:bg-blue-100">←</button>
              <button type="button" onClick={() => { setSelectedSheetSlot(0); canvasRef.current?.focus(); }} className="rounded-lg border border-blue-200 bg-white py-2 text-[10px] font-bold text-blue-800">SELECT</button>
              <button type="button" aria-label="Move first photo right" onClick={() => nudgeMasterPhoto(nudgeStepMm,0)} className="rounded-lg border border-blue-200 bg-white py-2 text-lg font-bold text-blue-800 active:bg-blue-100">→</button>
              <span />
              <button type="button" aria-label="Move first photo down" onClick={() => nudgeMasterPhoto(0,nudgeStepMm)} className="rounded-lg border border-blue-200 bg-white py-2 text-lg font-bold text-blue-800 active:bg-blue-100">↓</button>
              <span />
            </div>
            <p className="text-[11px] text-blue-800">पहले फोटो की जगह तय होने के बाद दूसरे और आगे के फोटो को खींचें—वे उसी लाइन पर Snap होंगे। 2 mm cutting gap बना रहेगा।</p>
          </div>}
          <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><div className="relative mx-auto w-fit"><canvas ref={canvasRef} tabIndex={paper === 'single' ? -1 : 0} aria-label="Photo sheet preview. Select the first photo and use arrow keys to position it." onKeyDown={handleSheetKeyDown} onPointerDown={handleSheetPointerDown} onPointerMove={handleSheetPointerMove} onPointerUp={handleSheetPointerUp} onPointerCancel={handleSheetPointerUp} onLostPointerCapture={handleSheetPointerUp} style={{ touchAction: 'none', cursor: paper === 'single' ? (signatureSrc ? 'move' : 'grab') : 'grab', outline: 'none' }} className="mx-auto block h-auto max-h-[720px] max-w-full bg-white shadow-lg" />{selectedSheetRect && paper !== 'single' && <div className="pointer-events-none absolute border-2 border-blue-600" style={{ left: `${selectedSheetRect.x / (paper === '4x6' ? 1200 : 2480) * 100}%`, top: `${selectedSheetRect.y / (paper === '4x6' ? 1800 : 3508) * 100}%`, width: `${selectedSheetRect.w / (paper === '4x6' ? 1200 : 2480) * 100}%`, height: `${selectedSheetRect.h / (paper === '4x6' ? 1800 : 3508) * 100}%` }}><span className="absolute -left-2 -top-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow"/><span className="absolute -right-2 -top-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow"/><span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow"/><span className="absolute -bottom-2 -right-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow"/></div>}</div></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><button onClick={downloadJpg} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4" /> {paper === "single" ? "Download Single Photo" : "Download Sheet JPG"}</button><button onClick={downloadPdf} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"><Download className="h-4 w-4" /> Download PDF</button><button onClick={printSheet} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"><Printer className="h-4 w-4" /> Print at Actual Size</button></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>ध्यान दें:</strong> BiRefNet AI बैकग्राउंड हटाने के लिए इस्तेमाल होता है। फिर भी हर फोटो में बालों और किनारों का परिणाम अलग हो सकता है; प्रिंट से पहले आउटपुट जाँचें। Face detection, AI skin retouch और manual brush eraser अभी उपलब्ध नहीं हैं। प्रिंट से पहले फोटो का परिणाम और संबंधित विभाग की latest specification जाँचें।</div>
        </section>
      </div>
      {activePanel && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm"><div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{activePanel==='crop'?(language==='hi'?'फोटो क्रॉप करें':'Crop Photo'):activePanel==='remove-bg'?(language==='hi'?'बैकग्राउंड हटाएँ':'Remove Background'):activePanel==='color'?(language==='hi'?'बैकग्राउंड रंग':'Background Color'):(language==='hi'?'बॉर्डर सेटिंग':'Border Settings')}</h3><button onClick={()=>{setActivePanel(null);setCropDrag(null);}} className="rounded-lg px-3 py-1 hover:bg-slate-100">✕</button></div>
      {activePanel==='crop'&&selected&&<div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">Crop / output size
            <select value={preset} onChange={e=>setPreset(e.target.value as PhotoPreset)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
              <option value="india">India Passport / Exam · 35 × 45 mm</option>
              <option value="stamp">Stamp Photo · 25 × 30 mm</option>
              <option value="pan">PAN Photo · 25 × 35 mm</option>
              <option value="custom">Custom size</option>
            </select>
          </label>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
            <div className="font-bold">Selected output size</div>
            <div className="mt-1 text-sm font-semibold">{preset==='custom'?fromMillimetres(customWidth,sizeUnit).toFixed(2)+' × '+fromMillimetres(customHeight,sizeUnit).toFixed(2)+' '+sizeUnit.toUpperCase():PRESETS[preset].label}</div>
            <div className="mt-1">{(preset==='custom'?customWidth/25.4:dimensions.width/300*25.4).toFixed(2)} × {(preset==='custom'?customHeight/25.4:dimensions.height/300*25.4).toFixed(2)} in · {(preset==='custom'?customWidth/10:dimensions.width/300*25.4/10).toFixed(2)} × {(preset==='custom'?customHeight/10:dimensions.height/300*25.4/10).toFixed(2)} cm · 300 DPI</div>
          </div>
        </div>
        {preset==='custom'&&<div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Measurement unit
            <select value={sizeUnit} onChange={e=>setSizeUnit(e.target.value as SizeUnit)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
              <option value="mm">Millimetres (MM)</option><option value="cm">Centimetres (CM)</option><option value="in">Inches (IN)</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-600">Width ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customWidth,sizeUnit).toFixed(2))} onChange={e=>setCustomWidth(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border p-2"/></label>
            <label className="text-xs text-slate-600">Height ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customHeight,sizeUnit).toFixed(2))} onChange={e=>setCustomHeight(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border p-2"/></label>
          </div>
        </div>}
        <p className="text-xs text-slate-500">नीले बॉक्स को खींचकर जगह बदलें। चारों कोनों के हैंडल से crop का आकार बदलें। चुना गया साइज अंतिम प्रिंट फोटो का आउटपुट साइज तय करता है।</p>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.8fr)]">
        <div className="relative mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-100" style={{width:'100%',maxWidth:440,aspectRatio:`${cropImageDimensions.width}/${cropImageDimensions.height}`,touchAction:'none'}}>
          <img src={selected.src} alt="Crop source" className="absolute inset-0 h-full w-full object-fill"/>
          <div className="absolute border-2 border-blue-600 bg-blue-300/10" style={{left:(photoEdits[selected.id]?.cropX??0)+'%',top:(photoEdits[selected.id]?.cropY??0)+'%',width:(photoEdits[selected.id]?.cropW??100)+'%',height:(photoEdits[selected.id]?.cropH??100)+'%',touchAction:'none'}}
            onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setCropDrag({startX:e.clientX,startY:e.clientY,startCrop:photoEdits[selected.id]||DEFAULT_EDIT,mode:(e.target as HTMLElement).dataset.resize?'resize':'move',handle:(e.target as HTMLElement).dataset.resize||'bottom-right'});}}
            onPointerMove={e=>{if(!cropDrag||e.buttons!==1)return;const box=e.currentTarget.parentElement!.getBoundingClientRect(),dx=(e.clientX-cropDrag.startX)/box.width*100,dy=(e.clientY-cropDrag.startY)/box.height*100,c=cropDrag.startCrop,handle=cropDrag.handle||'bottom-right',left=handle.includes('left'),top=handle.includes('top'),ratio=Math.max(0.01,cropPercentRatio);let x=c.cropX,y=c.cropY,w=c.cropW,h=c.cropH;if(cropDrag.mode==='move'){x=Math.max(0,Math.min(100-c.cropW,c.cropX+dx));y=Math.max(0,Math.min(100-c.cropH,c.cropY+dy));}else{const horizontalDelta=left?-dx:dx,verticalDelta=(top?-dy:dy)*ratio,proposedW=c.cropW+(horizontalDelta+verticalDelta)/2,maxW=Math.min(left?c.cropX+c.cropW:100-c.cropX,(top?c.cropY+c.cropH:100-c.cropY)*ratio),minW=Math.min(10,maxW),nextW=Math.max(minW,Math.min(maxW,proposedW));w=nextW;h=w/ratio;x=left?c.cropX+c.cropW-w:c.cropX;y=top?c.cropY+c.cropH-h:c.cropY;x=Math.max(0,Math.min(100-w,x));y=Math.max(0,Math.min(100-h,y));}setPhotoEdits(prev=>({...prev,[selected.id]:{...(prev[selected.id]||DEFAULT_EDIT),cropX:x,cropY:y,cropW:w,cropH:h}}));}} onPointerUp={()=>setCropDrag(null)} onPointerCancel={()=>setCropDrag(null)}>
            {['top-left','top-right','bottom-left','bottom-right'].map(pos=><span key={pos} data-resize={pos} className={`absolute h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow ${pos.includes('top')?'-top-2':'-bottom-2'} ${pos.includes('left')?'-left-2':'-right-2'} cursor-nwse-resize`}/>)}
          </div>
        </div>
          <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <h4 className="text-sm font-bold text-blue-900">Live final photo preview</h4>
            <p className="text-xs text-blue-800">यहाँ वही चुना हुआ crop और exact output ratio दिखेगा जो JPG/PDF में बनेगा।</p>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
              <canvas ref={cropPreviewRef} className="mx-auto block h-auto max-h-[360px] max-w-full object-contain shadow-sm" />
            </div>
            <p className="text-[11px] text-slate-600">{preset==='custom'?fromMillimetres(customWidth,sizeUnit).toFixed(2)+' × '+fromMillimetres(customHeight,sizeUnit).toFixed(2)+' '+sizeUnit.toUpperCase():PRESETS[preset].label}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <button onClick={()=>setPhotoEdits(c=>({...c,[selected.id]:fitCropToOutput({...DEFAULT_EDIT})}))} className="rounded-lg border px-3 py-2 text-xs font-semibold">Reset Crop</button>
          <div className="flex gap-2"><button onClick={()=>{setActivePanel(null);setCropDrag(null);}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button><button onClick={()=>{setActivePanel(null);setCropDrag(null);setStep(3);}} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save &amp; Next</button></div>
        </div>
        <p className="text-[11px] text-amber-700">ध्यान दें: फोटो साइज का अंतिम नियम संबंधित फॉर्म/विभाग की आधिकारिक गाइडलाइन से मिलाएँ।</p>
      </div>}
      {activePanel==='remove-bg'&&selected&&<div className="space-y-4"><p className="text-sm text-slate-600">{language==='hi'?'फ्री BiRefNet AI आपके ब्राउज़र में बैकग्राउंड हटाता है। फोटो हमारे ऐप सर्वर पर अपलोड नहीं होती।':'Free BiRefNet AI removes the background locally in your browser. Your photo is not uploaded to our app server.'}</p><div className="flex flex-wrap gap-2"><button disabled={aiProcessing} onClick={async()=>{const targetPhoto=selected;if(!targetPhoto)return;setAiProcessing(true);setAiProgressMessage('BiRefNet मॉडल तैयार हो रहा है…');setError('');let completed=false;try{setAiProgressMessage('BiRefNet मॉडल तैयार हो रहा है…');const blob=await removeBackgroundAI(targetPhoto.src,(message)=>setAiProgressMessage(message));const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Could not read AI output'));reader.onerror=()=>reject(new Error('Could not read AI output'));reader.readAsDataURL(blob);});setAiCutouts(c=>({...c,[targetPhoto.id]:url}));setBackgroundRemoved(c=>({...c,[targetPhoto.id]:true}));setSelectedId(targetPhoto.id);completed=true;}catch(e){setError(e instanceof Error?e.message:'AI background removal failed.');}finally{setAiProcessing(false);setAiProgressMessage('');if(completed)setActivePanel(null);}}} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{aiProcessing?(language==='hi'?'AI मॉडल चल रहा है… कृपया प्रतीक्षा करें':'Processing AI… please wait'):(language==='hi'?'AI से बैकग्राउंड हटाएँ':'Remove Background with AI')}</button><button onClick={()=>{setBackgroundRemoved(c=>({...c,[selected.id]:false}));setAiCutouts(c=>{const n={...c};delete n[selected.id];return n;});}} className="rounded-lg border px-4 py-2 text-sm">{language==='hi'?'मूल फोटो':'Restore Original'}</button></div><p className="text-xs text-slate-500">{language==='hi'?'पहली बार मॉडल डाउनलोड होने में समय लग सकता है (लगभग 94–452 MB, डिवाइस के अनुसार)।':'पहली बार BiRefNet मॉडल डाउनलोड होगा (लगभग 94–452 MB, डिवाइस के अनुसार) और ब्राउज़र में कैश हो सकता है। अगली बार आमतौर पर दोबारा पूरा डाउनलोड नहीं करना पड़ेगा।'}</p></div>}
      {activePanel==='color'&&<div className="space-y-4"><div className="flex flex-wrap gap-2">{[{name:'White',value:'#ffffff'},{name:'Blue',value:'#1d4ed8'},{name:'Light Blue',value:'#dbeafe'},{name:'Gray',value:'#e5e7eb'},{name:'Cream',value:'#fff7ed'}].map(c=><button key={c.value} onClick={()=>setBackgroundDraft(c.value)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><span className="h-5 w-5 rounded border border-slate-300" style={{backgroundColor:c.value}} />{c.name}</button>)}</div><label className="flex items-center gap-3 text-sm">{language==='hi'?'कस्टम रंग':'Custom color'}<input type="color" value={backgroundDraft} onChange={e=>setBackgroundDraft(e.target.value)}/></label><div className="flex justify-end"><button onClick={()=>{setBackground(backgroundDraft);setActivePanel(null);}} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white">{language==='hi'?'ओके':'OK'}</button></div></div>}
      {activePanel==='border'&&<div className="space-y-4"><label className="block text-sm">{language==='hi'?'बॉर्डर मोटाई':'Border width'}: {borderDraft}<input type="range" min="0" max="8" value={borderDraft} onChange={e=>setBorderDraft(Number(e.target.value))} className="mt-2 w-full"/></label><div className="flex justify-end gap-2"><button onClick={()=>{setBorderDraft(border);setActivePanel(null);}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">{language==='hi'?'रद्द करें':'Cancel'}</button><button onClick={()=>{setBorder(borderDraft);setActivePanel(null);}} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white">{language==='hi'?'ओके':'OK'}</button></div></div>}
      </div></div>}
    </div>
  );
};