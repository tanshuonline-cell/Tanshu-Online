import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { removeBackgroundAI } from './backgroundRemovalAI';
import { retouchFaceSkinLocally } from './skinRetouch';
import {
  Upload, Download, Printer, RefreshCw,
  ShieldCheck, Sparkles, SlidersHorizontal, Trash2, PenTool
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

// MediaPipe Face Detector runs inference locally in the browser. The image itself is never uploaded.
let faceDetectorPromise: Promise<any> | null = null;
const getLocalFaceDetector = async (): Promise<any> => {
  if (!faceDetectorPromise) {
    faceDetectorPromise = (async () => {
      const moduleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/+esm';
      const { FaceDetector, FilesetResolver } = await import(/* @vite-ignore */ moduleUrl) as any;
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm');
      return FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5
      });
    })().catch((error) => {
      faceDetectorPromise = null;
      throw error;
    });
  }
  return faceDetectorPromise;
};

const loadImageForDetection = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('फोटो पढ़ी नहीं जा सकी।'));
  image.src = src;
});

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

// Remove uneven paper by comparing each pixel with the brightest nearby paper surface.
// This also clears enclosed counters (O/A/R etc.) instead of relying on edge-connected flood fill.
const removeSignaturePaperBackground = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.width || !canvas.height) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  const width = canvas.width, height = canvas.height, length = width * height;
  const luminance = new Uint8Array(length);
  const horizontalMax = new Uint8Array(length);
  const localPaper = new Uint8Array(length);

  for (let p = 0, i = 0; p < length; p++, i += 4) {
    luminance[p] = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
  }

  // Separable 13px max filter estimates the local paper tone despite shadows and paper texture.
  const radius = 6;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let brightest = 0;
      for (let k = Math.max(0, x - radius); k <= Math.min(width - 1, x + radius); k++) {
        const value = luminance[row + k];
        if (value > brightest) brightest = value;
      }
      horizontalMax[row + x] = brightest;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let brightest = 0;
      for (let k = Math.max(0, y - radius); k <= Math.min(height - 1, y + radius); k++) {
        const value = horizontalMax[k * width + x];
        if (value > brightest) brightest = value;
      }
      localPaper[y * width + x] = brightest;
    }
  }

  for (let p = 0, i = 0; p < length; p++, i += 4) {
    if (data[i + 3] === 0) continue;
    const red = data[i], green = data[i + 1], blue = data[i + 2];
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
    const inkContrast = Math.max(0, localPaper[p] - luminance[p]);
    // Remove weak local contrast (paper grain), preserve strong pen strokes and antialiased edges.
    const inkAlpha = Math.max(0, Math.min(1, (inkContrast - 13) / 43));
    const colorInkProtection = Math.max(0, Math.min(1, (chroma - 18) / 34));
    const keepAlpha = Math.max(inkAlpha, colorInkProtection * 0.92);
    data[i + 3] = Math.round(data[i + 3] * keepAlpha);
  }
  ctx.putImageData(image, 0, 0);
};

const readFile = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image'));
  reader.onerror = () => reject(new Error('Could not read image'));
  reader.readAsDataURL(file);
});


const PHOTO_STUDIO_DB = "tanshu-photo-studio";
const PHOTO_STUDIO_STORE = "work";
const PHOTO_STUDIO_KEY = "latest-session";
const openPhotoStudioDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => { const request = indexedDB.open(PHOTO_STUDIO_DB, 1); request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(PHOTO_STUDIO_STORE)) request.result.createObjectStore(PHOTO_STUDIO_STORE); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
const readPhotoStudioWork = async (): Promise<any | null> => { const db = await openPhotoStudioDb(); return new Promise((resolve, reject) => { const request = db.transaction(PHOTO_STUDIO_STORE, "readonly").objectStore(PHOTO_STUDIO_STORE).get(PHOTO_STUDIO_KEY); request.onsuccess = () => { db.close(); resolve(request.result || null); }; request.onerror = () => { db.close(); reject(request.error); }; }); };
const writePhotoStudioWork = async (value: unknown): Promise<void> => { const db = await openPhotoStudioDb(); return new Promise((resolve, reject) => { const tx = db.transaction(PHOTO_STUDIO_STORE, "readwrite"); tx.objectStore(PHOTO_STUDIO_STORE).put(value, PHOTO_STUDIO_KEY); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error); }; tx.onabort = () => { db.close(); reject(tx.error); }; }); };
const clearPhotoStudioWork = async (): Promise<void> => { const db = await openPhotoStudioDb(); return new Promise((resolve, reject) => { const tx = db.transaction(PHOTO_STUDIO_STORE, "readwrite"); tx.objectStore(PHOTO_STUDIO_STORE).delete(PHOTO_STUDIO_KEY); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); reject(tx.error); }; }); };

export const AdvancedPassportPhotoStudio: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [restoreReady, setRestoreReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"loading"|"saved"|"saving"|"error">("loading");
  const [showStepSidebar, setShowStepSidebar] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [draggingPhotoId, setDraggingPhotoId] = useState<string>('');
  const [photoEdits, setPhotoEdits] = useState<Record<string, PhotoEdit>>({});
  const [sheetPositions, setSheetPositions] = useState<Record<number, { x: number; y: number; w: number; h: number }>>({});
  const [selectedSheetSlot, setSelectedSheetSlot] = useState<number | null>(null);
  const [selectedSheetSlots, setSelectedSheetSlots] = useState<number[]>([]);
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
  const activeSheetDragRef = useRef<{ slot: number; mode: 'move' | 'resize'; startX: number; startY: number; startRect: SheetRect; startGroup: SheetRect[]; handle: 'tl' | 'tr' | 'bl' | 'br'; duplicate?: boolean; moved?: boolean } | null>(null);
  const sheetMoveFrameRef = useRef<number | null>(null);
  const pendingSheetMoveRef = useRef<{ slot: number; position: { x: number; y: number; w: number; h: number } } | null>(null);
  const pendingSheetGroupRef = useRef<SheetRect[] | null>(null);
  const flushSheetMove = () => {
    if (sheetMoveFrameRef.current !== null) cancelAnimationFrame(sheetMoveFrameRef.current);
    sheetMoveFrameRef.current = null;
    const pending = pendingSheetMoveRef.current;
    pendingSheetMoveRef.current = null;
    const pendingGroup = pendingSheetGroupRef.current;
    pendingSheetGroupRef.current = null;
    if (pending) setSheetPositions(current => ({ ...current, [pending.slot]: pending.position }));
    if (pendingGroup) setSheetPositions(current => {
      const next = { ...current };
      for (const rect of pendingGroup) next[rect.slot] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
      return next;
    });
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
  const sheetUndoStackRef = useRef<Array<{ overrides: Record<number, string>; positions: Record<number, { x: number; y: number; w: number; h: number }>; count: number; selectedSlot: number | null; selectedSlots: number[] }>>([]);
  const [canUndoSheet, setCanUndoSheet] = useState(false);
  const [canRedoSheet, setCanRedoSheet] = useState(false);
  const sheetRedoStackRef = useRef<Array<{ overrides: Record<number, string>; positions: Record<number, { x: number; y: number; w: number; h: number }>; count: number; selectedSlot: number | null; selectedSlots: number[] }>>([]);
  const getSheetSnapshot = () => ({ overrides: { ...sheetPhotoOverrides }, positions: { ...sheetPositions }, count: sheetPhotoCount, selectedSlot: selectedSheetSlot, selectedSlots: [...selectedSheetSlots] });
  const restoreSheetSnapshot = (snapshot: { overrides: Record<number, string>; positions: Record<number, { x: number; y: number; w: number; h: number }>; count: number; selectedSlot: number | null; selectedSlots: number[] }) => {
    setSheetPhotoOverrides(snapshot.overrides); setSheetPositions(snapshot.positions); setSheetPhotoCount(snapshot.count); setSelectedSheetSlot(snapshot.selectedSlot); setSelectedSheetSlots(snapshot.selectedSlots);
  };
  const saveSheetUndo = () => {
    sheetUndoStackRef.current = [...sheetUndoStackRef.current.slice(-19), getSheetSnapshot()];
    sheetRedoStackRef.current = [];
    setCanUndoSheet(true); setCanRedoSheet(false);
  };
  const undoSheetAction = () => {
    const previous = sheetUndoStackRef.current.pop();
    if (!previous) return;
    sheetRedoStackRef.current = [...sheetRedoStackRef.current.slice(-19), getSheetSnapshot()];
    restoreSheetSnapshot(previous);
    setCanUndoSheet(sheetUndoStackRef.current.length > 0); setCanRedoSheet(true);
  };
  const redoSheetAction = () => {
    const next = sheetRedoStackRef.current.pop();
    if (!next) return;
    sheetUndoStackRef.current = [...sheetUndoStackRef.current.slice(-19), getSheetSnapshot()];
    restoreSheetSnapshot(next);
    setCanUndoSheet(true); setCanRedoSheet(sheetRedoStackRef.current.length > 0);
  };
  const [background, setBackground] = useState('#ffffff');
  const [backgroundDraft, setBackgroundDraft] = useState('#ffffff');
  const [backgroundRemoved, setBackgroundRemoved] = useState<Record<string, boolean>>({});
  const [backgroundTolerance, setBackgroundTolerance] = useState(32);
  const [aiCutouts, setAiCutouts] = useState<Record<string, string>>({});
  const [aiProcessing, setAiProcessing] = useState(false);
  const [faceStatus, setFaceStatus] = useState('');
  const [faceRect, setFaceRect] = useState<{x:number;y:number;width:number;height:number}|null>(null);
  const [retouchStrength, setRetouchStrength] = useState(18);
  const [previewOriginal, setPreviewOriginal] = useState(false);
  const beautyUndoRef = useRef<Array<{ id: string; edit: PhotoEdit; cutout?: string; removed: boolean }>>([]);
  const beautyRedoRef = useRef<Array<{ id: string; edit: PhotoEdit; cutout?: string; removed: boolean }>>([]);
  const [canUndoBeauty, setCanUndoBeauty] = useState(false);
  const [canRedoBeauty, setCanRedoBeauty] = useState(false);
  const [brushSize, setBrushSize] = useState(24);
  const [brushMode, setBrushMode] = useState<'erase'|'restore'>('erase');
  const [brushActive, setBrushActive] = useState(false);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushOriginalRef = useRef<HTMLCanvasElement|null>(null);
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
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [signatureAspect, setSignatureAspect] = useState(3.2);
  const signaturePreviewDragRef = useRef<{ pointerId: number; startX: number; startY: number; start: { x: number; y: number; width: number; height: number }; corner: 'move' | 'tl' | 'tr' | 'bl' | 'br' } | null>(null);
  const [signatureCrop, setSignatureCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [signaturePlacement, setSignaturePlacement] = useState({ x: 58, y: 78, width: 32, height: 8 });
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const signatureDragRef = useRef<{ x: number; y: number; mode?: 'move' | 'resize'; startCrop?: { x: number; y: number; w: number; h: number }; corner?: 'tl' | 'tr' | 'bl' | 'br' } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);


  useEffect(() => { let active = true; readPhotoStudioWork().then((saved) => { if (!active) return; if (saved && saved.version === 1) { setPhotos(saved.photos || []); setSelectedId(saved.selectedId || ""); setPhotoEdits(saved.photoEdits || {}); setSheetPositions(saved.sheetPositions || {}); setMode(saved.mode || "official"); setPreset(saved.preset || "india"); setCustomWidth(saved.customWidth ?? 35); setCustomHeight(saved.customHeight ?? 45); setSizeUnit(saved.sizeUnit || "mm"); setPaper(saved.paper || "single"); setSheetMargin(saved.sheetMargin ?? 5); setSheetGap(saved.sheetGap ?? 2); setSheetPhotoCount(saved.sheetPhotoCount ?? 4); setSheetPhotoOverrides(saved.sheetPhotoOverrides || {}); setBackground(saved.background || "#ffffff"); setBackgroundDraft(saved.backgroundDraft || saved.background || "#ffffff"); setBackgroundRemoved(saved.backgroundRemoved || {}); setBackgroundTolerance(saved.backgroundTolerance ?? 32); setAiCutouts(saved.aiCutouts || {}); setRetouchStrength(saved.retouchStrength ?? 18); setBorder(saved.border ?? 1); setBorderDraft(saved.borderDraft ?? saved.border ?? 1); setSignatureSrc(saved.signatureSrc || ""); setSignatureName(saved.signatureName || ""); setSignatureBackground(saved.signatureBackground || "transparent"); setSignatureCustomColor(saved.signatureCustomColor || "#ffffff"); setSignatureRemoveWhite(saved.signatureRemoveWhite ?? true); setSignatureConfirmed(saved.signatureConfirmed ?? false); setSignatureAspect(saved.signatureAspect ?? 3.2); setSignatureCrop(saved.signatureCrop || {x:0,y:0,w:100,h:100}); setSignaturePlacement(saved.signaturePlacement || {x:58,y:78,width:32,height:8}); setLanguage(saved.language || "en"); setStep(saved.step || 1); setShowStepSidebar(saved.showStepSidebar ?? true); } setSaveStatus("saved"); setRestoreReady(true); }).catch(() => { if (active) { setSaveStatus("error"); setRestoreReady(true); } }); return () => { active = false; }; }, []);
  useEffect(() => { if (!restoreReady) return; setSaveStatus("saving"); const timer = window.setTimeout(() => { writePhotoStudioWork({version:1,savedAt:Date.now(),photos,selectedId,photoEdits,sheetPositions,mode,preset,customWidth,customHeight,sizeUnit,paper,sheetMargin,sheetGap,sheetPhotoCount,sheetPhotoOverrides,background,backgroundDraft,backgroundRemoved,backgroundTolerance,aiCutouts,retouchStrength,border,borderDraft,signatureSrc,signatureName,signatureBackground,signatureCustomColor,signatureRemoveWhite,signatureConfirmed,signatureAspect,signatureCrop,signaturePlacement,language,step,showStepSidebar}).then(() => setSaveStatus("saved")).catch(() => setSaveStatus("error")); }, 500); return () => window.clearTimeout(timer); }, [restoreReady,photos,selectedId,photoEdits,sheetPositions,mode,preset,customWidth,customHeight,sizeUnit,paper,sheetMargin,sheetGap,sheetPhotoCount,sheetPhotoOverrides,background,backgroundDraft,backgroundRemoved,backgroundTolerance,aiCutouts,retouchStrength,border,borderDraft,signatureSrc,signatureName,signatureBackground,signatureCustomColor,signatureRemoveWhite,signatureConfirmed,signatureAspect,signatureCrop,signaturePlacement,language,step,showStepSidebar]);
  const finishAndClearWork = async () => { const message = language === "hi" ? "क्या आप काम खत्म करके सेव किया हुआ पूरा काम हटाना चाहते हैं? यह वापस नहीं आएगा।" : "Finish this session and permanently clear its saved work? This cannot be undone."; if (!window.confirm(message)) return; try { await clearPhotoStudioWork(); setPhotos([]); setSelectedId(""); setPhotoEdits({}); setSheetPositions({}); setSheetPhotoOverrides({}); setSheetPhotoCount(4); setSignatureSrc(""); setSignatureName(""); setAiCutouts({}); setBackgroundRemoved({}); setSaveStatus("saved"); } catch { setSaveStatus("error"); setError("Could not clear saved work."); } };

  const selected = photos.find((photo) => photo.id === selectedId) || photos[0] || null;
  const selectedEdit = selected ? (photoEdits[selected.id] || DEFAULT_EDIT) : DEFAULT_EDIT;
  const captureBeautySnapshot = (id: string) => ({ id, edit: { ...(photoEdits[id] || DEFAULT_EDIT) }, cutout: aiCutouts[id], removed: !!backgroundRemoved[id] });
  const saveBeautyHistory = (id: string) => { beautyUndoRef.current = [...beautyUndoRef.current.slice(-29), captureBeautySnapshot(id)]; beautyRedoRef.current = []; setCanUndoBeauty(true); setCanRedoBeauty(false); };
  const restoreBeautySnapshot = (snapshot: { id: string; edit: PhotoEdit; cutout?: string; removed: boolean }) => { setPhotoEdits(v => ({ ...v, [snapshot.id]: { ...snapshot.edit } })); setAiCutouts(v => { const n={...v}; if(snapshot.cutout) n[snapshot.id]=snapshot.cutout; else delete n[snapshot.id]; return n; }); setBackgroundRemoved(v => ({ ...v, [snapshot.id]: snapshot.removed })); setFaceStatus('Beauty बदलाव वापस लागू कर दिया गया।'); };
  const undoBeauty = () => { if(!selected)return; const previous=beautyUndoRef.current.pop(); if(!previous)return; beautyRedoRef.current=[...beautyRedoRef.current.slice(-29),captureBeautySnapshot(selected.id)]; restoreBeautySnapshot(previous); setCanUndoBeauty(beautyUndoRef.current.length>0); setCanRedoBeauty(true); };
  const redoBeauty = () => { if(!selected)return; const next=beautyRedoRef.current.pop(); if(!next)return; beautyUndoRef.current=[...beautyUndoRef.current.slice(-29),captureBeautySnapshot(selected.id)]; restoreBeautySnapshot(next); setCanUndoBeauty(true); setCanRedoBeauty(beautyRedoRef.current.length>0); };
  const updateSelectedEdit = (key: keyof PhotoEdit, value: number) => { if (!selected) return; saveBeautyHistory(selected.id); setPhotoEdits((current) => ({ ...current, [selected.id]: { ...(current[selected.id] || DEFAULT_EDIT), [key]: value } })); setFaceStatus('बदलाव लाइव प्रीव्यू में दिख रहा है।'); };

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

  useEffect(() => { if(activePanel!=='remove-bg'||!selected)return; const canvas=brushCanvasRef.current; if(!canvas)return; const image=new Image(); image.onload=()=>{canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.drawImage(image,0,0);const original=document.createElement('canvas');original.width=canvas.width;original.height=canvas.height;original.getContext('2d')?.drawImage(image,0,0);brushOriginalRef.current=original;};image.src=selected.src; },[activePanel,selected?.id,selected?.src]);

  useEffect(() => {
    const canvas = cropPreviewRef.current;
    if (activePanel !== 'crop' || !canvas || !selected) return;
    const width = Math.max(1, Math.round(dimensions.width));
    const height = Math.max(1, Math.round(dimensions.height));
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
    const sourceUrl = !previewOriginal && backgroundRemoved[selected.id] && aiCutouts[selected.id] ? aiCutouts[selected.id] : selected.src;
    const image = new Image();
    image.onload = () => {
      const edit = photoEdits[selected.id] || DEFAULT_EDIT;
      const sx = image.width * edit.cropX / 100, sy = image.height * edit.cropY / 100;
      const sw = image.width * edit.cropW / 100, sh = image.height * edit.cropH / 100;
      ctx.save();
      ctx.filter = mode === 'beauty' && !previewOriginal ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) blur(${edit.smooth * 0.012}px)` : 'none';
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
      ctx.restore();
    };
    image.src = sourceUrl;
  }, [activePanel, selected?.id, selected?.src, dimensions.width, dimensions.height, photoEdits, background, backgroundRemoved, aiCutouts, mode, previewOriginal]);

  const resetAdjustments = () => {
    if (selected) { saveBeautyHistory(selected.id); setPhotoEdits((current) => ({ ...current, [selected.id]: { ...DEFAULT_EDIT } })); setFaceStatus('Beauty adjustments रीसेट हो गए। Undo से वापस ला सकते हैं।'); }
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
          const filter = mode === 'beauty' && !previewOriginal
            ? `brightness(${edit.brightness}%) contrast(${edit.contrast}%) saturate(${edit.saturation}%) blur(${edit.smooth * 0.012}px)`
            : 'brightness(100%) contrast(100%) saturate(100%)';
          ctx.filter = filter;
          const aiCutout = aiCutouts[photo.id];
          const source: CanvasImageSource = !previewOriginal && backgroundRemoved[photo.id] ? (aiCutout ? img : removePlainBackground(img, backgroundTolerance)) : img;
          const sx=img.width*edit.cropX/100, sy=img.height*edit.cropY/100, sw=img.width*edit.cropW/100, sh=img.height*edit.cropH/100;
          ctx.drawImage(source,sx,sy,sw,sh,x+(slotW-w)/2+edit.moveX*slotW/photoW,y+(slotH-h)/2+edit.moveY*slotH/photoH,w,h);
        } else {
          ctx.fillStyle = '#f0f7ff'; ctx.fillRect(x, y, slotW, slotH);
          ctx.save();
          ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = Math.max(2, slotW * 0.012); ctx.setLineDash([Math.max(5, slotW * 0.035), Math.max(4, slotW * 0.025)]);
          ctx.strokeRect(x + slotW * 0.08, y + slotH * 0.08, slotW * 0.84, slotH * 0.84);
          ctx.setLineDash([]); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#2563eb'; ctx.font = `bold ${Math.max(24, slotW * 0.16)}px sans-serif`;
          ctx.fillText('↑', x + slotW / 2, y + slotH * 0.40);
          ctx.fillStyle = '#1e40af'; ctx.font = `600 ${Math.max(10, slotW * 0.055)}px sans-serif`;
          ctx.fillText(language === 'hi' ? 'लाइव एडिटिंग प्रीव्यू' : 'LIVE EDITING PREVIEW', x + slotW / 2, y + slotH * 0.62);
          ctx.fillStyle = '#64748b'; ctx.font = `${Math.max(8, slotW * 0.035)}px sans-serif`;
          ctx.fillText(language === 'hi' ? 'आपके बदलाव यहाँ दिखेंगे' : 'Your edits will appear here', x + slotW / 2, y + slotH * 0.72);
          ctx.restore();
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
              if (signatureRemoveWhite && signatureBackground !== 'white') removeSignaturePaperBackground(signatureCanvas);
              const drawW = slotW * signaturePlacement.width / 100;
              const drawH = slotH * signaturePlacement.height / 100;
              const drawX = x + slotW * Math.max(0, Math.min(100 - signaturePlacement.width, signaturePlacement.x)) / 100;
              const drawY = y + slotH * Math.max(0, Math.min(100 - drawH / slotH * 100, signaturePlacement.y)) / 100;
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
      const loaded = await Promise.all(sourcePhotos.map((photo, index) => !previewOriginal && aiCutouts[photo.id]
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
  }, [selected, photos, dimensions, paper, sheetMargin, sheetGap, sheetPhotoCount, sheetPhotoOverrides, background, mode, previewOriginal, photoEdits, sheetPositions, border, signatureSrc, signatureBackground, signatureCustomColor, signatureRemoveWhite, signatureCrop, signaturePlacement, backgroundRemoved, backgroundTolerance, aiCutouts]);

  const updateSignatureFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('सिग्नेचर के लिए JPG या PNG इमेज चुनें।'); return; }
    try {
      const src = await readFile(file);
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height }); image.onerror = () => reject(new Error('सिग्नेचर इमेज पढ़ी नहीं जा सकी।')); image.src = src; });
      setSignatureSrc(src); setSignatureName(file.name); setSignatureAspect(dimensions.width / Math.max(1, dimensions.height)); setSignatureConfirmed(false);
      setSignatureCrop({ x: 0, y: 0, w: 100, h: 100 }); setSignaturePlacement({ x: 58, y: 78, width: 32, height: 8 }); setError('');
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
      if (signatureRemoveWhite && signatureBackground !== 'white') removeSignaturePaperBackground(raw);
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
    const drag = signatureDragRef.current;
    if (!drag) { signatureDragRef.current = { x, y, startCrop: { ...signatureCrop }, mode: 'move' }; return; }
    const start = drag.startCrop || signatureCrop;
    const dx = x - drag.x, dy = y - drag.y;
    setSignatureCrop(() => {
      if (drag.mode !== 'resize') {
        return { ...start, x: Math.max(0, Math.min(100 - start.w, start.x + dx)), y: Math.max(0, Math.min(100 - start.h, start.y + dy)) };
      }
      const left = drag.corner?.endsWith('l') || false;
      const top = drag.corner?.startsWith('t') || false;
      const right = !left, bottom = !top;
      const fixedX = left ? start.x + start.w : start.x;
      const fixedY = top ? start.y + start.h : start.y;
      const movingX = Math.max(0, Math.min(100, (left ? start.x : start.x + start.w) + dx));
      const movingY = Math.max(0, Math.min(100, (top ? start.y : start.y + start.h) + dy));
      const nextX = left ? Math.min(movingX, fixedX - 5) : fixedX;
      const nextY = top ? Math.min(movingY, fixedY - 5) : fixedY;
      const nextRight = right ? Math.max(movingX, fixedX + 5) : fixedX;
      const nextBottom = bottom ? Math.max(movingY, fixedY + 5) : fixedY;
      const x1 = Math.max(0, Math.min(95, nextX));
      const y1 = Math.max(0, Math.min(95, nextY));
      const x2 = Math.max(x1 + 5, Math.min(100, nextRight));
      const y2 = Math.max(y1 + 5, Math.min(100, nextBottom));
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    });
  };

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas=canvasRef.current;if(!canvas)return;const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height;
    if(paper==='single'){if(!selected)return;const photoW=canvas.width,photoH=canvas.height,sigW=photoW*signaturePlacement.width/100,sigH=photoH*signaturePlacement.height/100,sigX=photoW*signaturePlacement.x/100,sigY=photoH*signaturePlacement.y/100,onSignature=!!signatureSrc&&x>=sigX&&x<=sigX+sigW&&y>=sigY&&y<=sigY+sigH,resizeSignature=onSignature&&x>=sigX+sigW-Math.max(18,photoW*.035)&&y>=sigY+sigH-Math.max(18,photoH*.035),edit=photoEdits[selected.id]||DEFAULT_EDIT;activeCanvasDragRef.current={kind:onSignature?'signature':'photo',startX:x,startY:y,startMoveX:edit.moveX,startMoveY:edit.moveY,startSigX:signaturePlacement.x,startSigY:signaturePlacement.y,startSigWidth:signaturePlacement.width,resizeSignature};canvas.setPointerCapture(event.pointerId);return;}
    const hit=[...sheetRectsRef.current].reverse().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(!hit){setSelectedSheetSlot(null);setSelectedSheetSlots([]);canvas.style.cursor='grab';return;}if(event.ctrlKey||event.metaKey||event.shiftKey){setSelectedSheetSlots(current=>current.includes(hit.slot)?current.filter(slot=>slot!==hit.slot):[...current,hit.slot]);setSelectedSheetSlot(hit.slot);canvas.focus();return;}setSelectedSheetSlot(hit.slot);setSelectedSheetSlots([hit.slot]);canvas.focus();
    const hs=Math.max(22,Math.min(42,Math.min(hit.w,hit.h)*.09)),l=x<=hit.x+hs,r=x>=hit.x+hit.w-hs,t=y<=hit.y+hs,b=y>=hit.y+hit.h-hs,corner=(l||r)&&(t||b),canResize=hit.slot===0,handle=t?(l?'tl':'tr'):(l?'bl':'br'),resizing=corner&&canResize;
    const copyHandleSize=Math.max(64,Math.min(100,Math.min(hit.w,hit.h)*.22));
    const onCopyHandle=selectedSheetSlot===hit.slot&&x>=hit.x+hit.w-copyHandleSize&&x<=hit.x+hit.w&&y>=hit.y&&y<=hit.y+copyHandleSize;
    if((event.altKey||onCopyHandle)&&!resizing){
      const currentCount=Math.min(sheetCapacity,sheetPhotoCount||sheetFitCapacity);
      if(currentCount>=sheetCapacity){setError('शीट पर और फोटो जोड़ने की जगह नहीं है।');return;}
      event.preventDefault();saveSheetUndo();
      const nextSlot=currentCount,copyRect:SheetRect={...hit,slot:nextSlot};
      setSheetPhotoOverrides(current=>({...current,[nextSlot]:hit.photoId}));
      setSheetPhotoCount(nextSlot+1);setSheetPositions(current=>({...current,[nextSlot]:{x:copyRect.x,y:copyRect.y,w:copyRect.w,h:copyRect.h}}));
      sheetRectsRef.current=[...sheetRectsRef.current,copyRect];
      setSelectedSheetSlot(nextSlot);setSelectedSheetSlots([]);
      canvas.style.cursor='grabbing';
      activeSheetDragRef.current={slot:nextSlot,mode:'move',startX:x,startY:y,startRect:copyRect,startGroup:[copyRect],handle:'br',duplicate:true,moved:false};
      canvas.setPointerCapture(event.pointerId);return;
    }
    event.preventDefault();canvas.style.cursor=resizing?(handle==='tl'||handle==='br'?'nwse-resize':'nesw-resize'):'grabbing';activeSheetDragRef.current={slot:hit.slot,mode:resizing?'resize':'move',startX:x,startY:y,startRect:hit,startGroup:sheetRectsRef.current.map(rect=>({...rect})),handle};canvas.setPointerCapture(event.pointerId);
  };
  const handleSheetPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas=canvasRef.current,cd=activeCanvasDragRef.current;if(cd&&canvas&&selected){const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height,dx=x-cd.startX,dy=y-cd.startY;if(cd.kind==='signature')setSignaturePlacement(p=>cd.resizeSignature?({...p,width:Math.max(5,Math.min(90,cd.startSigWidth+dx/canvas.width*100))}):({...p,x:Math.max(0,Math.min(100-p.width,cd.startSigX+dx/canvas.width*100)),y:Math.max(0,Math.min(100,cd.startSigY+dy/canvas.height*100))}));else setPhotoEdits(cur=>({...cur,[selected.id]:{...(cur[selected.id]||DEFAULT_EDIT),moveX:cd.startMoveX+dx,moveY:cd.startMoveY+dy}}));return;}
    const drag=activeSheetDragRef.current;if(!drag||!canvas){if(canvas&&paper!=='single'){const bounds=canvas.getBoundingClientRect(),px=(event.clientX-bounds.left)*canvas.width/bounds.width,py=(event.clientY-bounds.top)*canvas.height/bounds.height,hover=[...sheetRectsRef.current].reverse().find(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h);if(hover){const hs=Math.max(22,Math.min(42,Math.min(hover.w,hover.h)*.09)),left=px<=hover.x+hs,right=px>=hover.x+hover.w-hs,top=py<=hover.y+hs,bottom=py>=hover.y+hover.h-hs,isCorner=(left||right)&&(top||bottom);canvas.style.cursor=isCorner&&hover.slot===0?((top&&left)||(bottom&&right)?'nwse-resize':'nesw-resize'):'grab';}else canvas.style.cursor='grab';}return;}const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)*canvas.width/bounds.width,y=(event.clientY-bounds.top)*canvas.height/bounds.height,dx=x-drag.startX,dy=y-drag.startY,s=drag.startRect;
    if(drag.mode==='move'){
      const others=sheetRectsRef.current.filter(r=>r.slot!==drag.slot),gap=sheetGap*300/25.4;
      let nx=Math.max(0,Math.min(canvas.width-s.w,s.x+dx));
      let ny=Math.max(0,Math.min(canvas.height-s.h,s.y+dy));
      if (lockSheetGroup && drag.startGroup.length > 1) {
        // Always calculate from the pointer-down snapshot. Using the already
        // moved rectangles here would add the full pointer delta repeatedly,
        // making the group jump and accelerate during dragging.
        const group = drag.startGroup;
        const minX = Math.min(...group.map(r => r.x)), minY = Math.min(...group.map(r => r.y));
        const maxX = Math.max(...group.map(r => r.x + r.w)), maxY = Math.max(...group.map(r => r.y + r.h));
        const moveX = Math.max(-minX, Math.min(canvas.width - maxX, dx));
        const moveY = Math.max(-minY, Math.min(canvas.height - maxY, dy));
        const moved = group.map(r => ({ ...r, x: r.x + moveX, y: r.y + moveY }));
        sheetRectsRef.current = moved;
        pendingSheetGroupRef.current = moved;
        if (sheetMoveFrameRef.current === null) {
          sheetMoveFrameRef.current = requestAnimationFrame(() => {
            sheetMoveFrameRef.current = null;
            const pendingGroup = pendingSheetGroupRef.current;
            pendingSheetGroupRef.current = null;
            if (pendingGroup) setSheetPositions(current => {
              const next = { ...current };
              for (const rect of pendingGroup) next[rect.slot] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
              return next;
            });
          });
        }
        return;
      }
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
        if(drag.duplicate&&(Math.abs(dx)>3||Math.abs(dy)>3))drag.moved=true;
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
  const handleSheetPointerUp = (event?: React.PointerEvent<HTMLCanvasElement>) => { flushSheetMove(); const finishedDrag=activeSheetDragRef.current; if(finishedDrag?.duplicate&&!finishedDrag.moved){undoSheetAction();sheetRectsRef.current=sheetRectsRef.current.filter(rect=>rect.slot!==finishedDrag.slot);} activeSheetDragRef.current = null; activeCanvasDragRef.current = null; if(event)event.currentTarget.style.cursor='grab'; if (event?.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); };

  const [nudgeStepMm, setNudgeStepMm] = useState(1);
  const [lockSheetGroup, setLockSheetGroup] = useState(false);
  const [rowCopyCount, setRowCopyCount] = useState('all');
  const nudgeMasterPhoto = (dxMm: number, dyMm: number) => {
    if (paper === 'single') return;
    const master = sheetRectsRef.current.find((rect) => rect.slot === 0);
    if (!master) return;
    const step = 300 / 25.4;
    const nextX = Math.max(0, Math.min((canvasRef.current?.width || 0) - master.w, master.x + dxMm * step));
    const nextY = Math.max(0, Math.min((canvasRef.current?.height || 0) - master.h, master.y + dyMm * step));
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

  const resetSheetLayout = () => { setSheetPositions({}); setSelectedSheetSlot(null); setSelectedSheetSlots([]); };
  const autoArrangeSheet = () => {
    // Restore the clean grid and clear the active selection.
    setSheetPositions({});
    setSelectedSheetSlot(null);
    setSelectedSheetSlots([]);
  };
  const setPresetSheetCount = (count: number) => {
    setSheetPhotoCount(Math.max(1, Math.min(sheetCapacity, count)));
    setSheetPhotoOverrides({});
    setSheetPositions({});
    setSelectedSheetSlot(null);
    setSelectedSheetSlots([]);
  };
  const addSelectedSheetCopy = () => {
    if (!selected) return;
    const currentCount = Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity);
    if (currentCount >= sheetCapacity) return;
    setSheetPhotoOverrides((current) => ({ ...current, [currentCount]: selected.id }));
    setSheetPhotoCount(currentCount + 1);
    setSelectedSheetSlot(currentCount);
  };
  const copySelectedRowBelow = () => {
    if (paper === 'single' || selectedSheetSlot === null) return;
    const rects = [...sheetRectsRef.current];
    const selectedRect = rects.find(r => r.slot === selectedSheetSlot);
    if (!selectedRect) return;
    const rowTolerance = Math.max(2, sheetGap * 300 / 25.4 * 0.2);
    let row = rects.filter(r => Math.abs(r.y - selectedRect.y) <= rowTolerance).sort((a,b) => a.x - b.x);
    if (rowCopyCount !== 'all') row = row.slice(0, Number(rowCopyCount));
    const currentCount = Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity);
    const amount = Math.min(row.length, sheetCapacity - currentCount);
    if (!amount) return;
    row = row.slice(0, amount);
    const gapPx = sheetGap * 300 / 25.4;
    const nextY = Math.max(...rects.map(r => r.y + r.h)) + gapPx;
    const overrides: Record<number, string> = {};
    const positions: Record<number, { x: number; y: number; w: number; h: number }> = {};
    row.forEach((rect, index) => {
      const slot = currentCount + index;
      overrides[slot] = rect.photoId;
      positions[slot] = { x: rect.x, y: nextY, w: rect.w, h: rect.h };
    });
    setSheetPhotoOverrides(current => ({ ...current, ...overrides }));
    setSheetPositions(current => ({ ...current, ...positions }));
    setSheetPhotoCount(currentCount + amount);
    setSelectedSheetSlot(currentCount);
  };
  const copyAllRowsBelow = () => {
    if (paper === 'single') return;
    const rects = [...sheetRectsRef.current].sort((a,b) => a.slot - b.slot);
    const currentCount = Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity);
    const amount = Math.min(rects.length, sheetCapacity - currentCount);
    if (!amount || !rects.length) return;
    const source = rects.slice(0, amount);
    const gapPx = sheetGap * 300 / 25.4;
    const minY = Math.min(...rects.map(r => r.y));
    const maxY = Math.max(...rects.map(r => r.y + r.h));
    const offsetY = maxY - minY + gapPx;
    const overrides: Record<number, string> = {};
    const positions: Record<number, { x: number; y: number; w: number; h: number }> = {};
    source.forEach((rect, index) => {
      const slot = currentCount + index;
      overrides[slot] = rect.photoId;
      positions[slot] = { x: rect.x, y: rect.y + offsetY, w: rect.w, h: rect.h };
    });
    setSheetPhotoOverrides(current => ({ ...current, ...overrides }));
    setSheetPositions(current => ({ ...current, ...positions }));
    setSheetPhotoCount(currentCount + amount);
    setSelectedSheetSlot(currentCount);
  };
  const selectCurrentSheetRow = () => {
    if (selectedSheetSlot === null) return;
    const rects = [...sheetRectsRef.current], selectedRect = rects.find(rect => rect.slot === selectedSheetSlot);
    if (!selectedRect) return;
    const tolerance = Math.max(2, sheetGap * 300 / 25.4 * 0.2);
    setSelectedSheetSlots(rects.filter(rect => Math.abs(rect.y - selectedRect.y) <= tolerance).map(rect => rect.slot));
  };
  const deleteSheetPhotos = (slots: number[]) => {
    if (paper === 'single' || !slots.length) return;
    const remove = new Set(slots), remaining = [...sheetRectsRef.current].filter(rect => !remove.has(rect.slot)).sort((a,b) => a.slot - b.slot);
    if (remaining.length === sheetRectsRef.current.length) return;
    if (!remaining.length) { setError('शीट पर कम-से-कम एक फोटो रखना जरूरी है।'); return; }
    saveSheetUndo();
    const overrides: Record<number, string> = {}, positions: Record<number, { x: number; y: number; w: number; h: number }> = {};
    remaining.forEach((rect,index) => { overrides[index] = rect.photoId; positions[index] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h }; });
    setSheetPhotoOverrides(overrides); setSheetPositions(positions); setSheetPhotoCount(remaining.length); setSelectedSheetSlot(0); setSelectedSheetSlots([]);
  };
  const deleteSelectedSheetPhotos = () => deleteSheetPhotos(selectedSheetSlots.length ? selectedSheetSlots : selectedSheetSlot === null ? [] : [selectedSheetSlot]);
  const deleteSelectedSheetRow = () => {
    if (selectedSheetSlot === null) return;
    const rects = [...sheetRectsRef.current], selectedRect = rects.find(rect => rect.slot === selectedSheetSlot);
    if (!selectedRect) return;
    const tolerance = Math.max(2, sheetGap * 300 / 25.4 * 0.2);
    deleteSheetPhotos(rects.filter(rect => Math.abs(rect.y - selectedRect.y) <= tolerance).map(rect => rect.slot));
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
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} onPointerDown={(event) => event.stopPropagation()} onTouchStart={(event) => event.stopPropagation()} style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }} className="w-full touch-none select-none accent-blue-600 cursor-ew-resize" />
    </label>
  );

  const selectedSheetRect = selectedSheetSlot === null ? null : sheetRectsRef.current.find((rect) => rect.slot === selectedSheetSlot) || null;

  return (
    <div className="min-h-full space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">Advanced Passport &amp; Signature Photo Studio</h2>
          <p className="text-xs text-slate-500">{language==='hi'?'फोटो एडिट करें और प्रिंट शीट तैयार करें।':'Edit photos and prepare print-ready sheets.'}</p>
        </div>
        <div className="flex items-center gap-1.5"><div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"><button type="button" onClick={()=>setLanguage('hi')} aria-pressed={language==='hi'} className="rounded-md bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-1.5 text-[11px] font-extrabold text-white shadow">हिंदी</button><button type="button" onClick={()=>setLanguage('en')} aria-pressed={language==='en'} className="rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white shadow">English</button></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" />{language==='hi'?'फोटो ब्राउज़र में प्रोसेस होती है':'Browser-side processing'}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${saveStatus==='error'?'bg-rose-50 text-rose-700':saveStatus==='saved'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{saveStatus==='loading'?(language==='hi'?'काम जाँच रहे हैं…':'Checking…'):saveStatus==='saving'?(language==='hi'?'सेव हो रहा है…':'Saving…'):saveStatus==='error'?(language==='hi'?'सेव में समस्या':'Save issue'):(language==='hi'?'ऑटो सेव ✓':'Auto-saved ✓')}</span><button type="button" onClick={finishAndClearWork} className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-50">{language==='hi'?'काम खत्म करें':'Finish & Clear'}</button></div>
      </div>

      <div className="sticky top-0 z-40 -mx-1 -mt-2 mb-2 flex justify-start rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur sm:mx-0"><div className="inline-grid w-full max-w-[540px] grid-cols-3 gap-1 sm:w-auto">{([1,2,3] as const).map(n=><button key={n} onClick={()=>{setStep(n);setShowStepSidebar(true);}} aria-current={step===n?'step':undefined} className={`flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-10 sm:gap-1.5 sm:px-3 sm:text-xs ${step===n?(n===1?'border-blue-700 bg-blue-600 text-white shadow-md':n===2?'border-emerald-700 bg-emerald-600 text-white shadow-md':'border-amber-600 bg-amber-500 text-white shadow-md'):(n===1?'border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100':n===2?'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100':'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100')}`}>{n===1?<Upload className="h-4 w-4"/>:n===2?<SlidersHorizontal className="h-4 w-4"/>:<Download className="h-4 w-4"/>}<span>{n===1?(language==='hi'?'1. अपलोड':'1. Upload'):n===2?(language==='hi'?'2. एडिट':'2. Edit'):(language==='hi'?'3. डाउनलोड':'3. Export')}</span></button>)}</div></div>
      <div className={`grid grid-cols-1 items-start gap-3 lg:gap-4 ${showStepSidebar ? "xl:grid-cols-[minmax(245px,0.42fr)_minmax(0,2.08fr)] 2xl:grid-cols-[minmax(265px,0.44fr)_minmax(0,2.1fr)]" : "xl:grid-cols-1"}`}>
        {showStepSidebar && <section className="space-y-3 rounded-2xl border border-indigo-100 bg-white p-2.5 shadow-lg animate-in slide-in-from-left-3 fade-in duration-300 sm:p-3 xl:sticky xl:top-16 xl:max-h-[calc(100dvh-4.5rem)] xl:overflow-y-auto xl:self-start">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{step===1?"Upload panel":step===2?"Edit panel":"Export panel"}</span><button type="button" onClick={()=>setShowStepSidebar(false)} className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-3 py-1.5 text-xs font-extrabold text-indigo-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:from-indigo-100 hover:to-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300">← Back / Close</button></div>
          <div>
            <div className="mb-2 flex items-center justify-between"><h3 className="font-bold text-slate-900">1. फोटो अपलोड</h3><span className="text-xs text-slate-500">{photos.length} फोटो</span></div>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { void addPhotos(event.target.files); event.currentTarget.value = ''; }} />
            <button onClick={() => uploadRef.current?.click()} className="group flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-white to-sky-50 px-3 py-3 text-sm font-bold text-blue-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:from-blue-100 hover:to-sky-100 hover:shadow-lg"><span className="flex items-center gap-2"><Upload className="h-5 w-5" /> Choose one or more photos</span><span className="text-xs font-medium">एक या कई फोटो चुनें</span></button>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            {photos.length > 0 && <><p className="mt-2 text-[11px] text-slate-500">शीट में फोटो का क्रम बदलने के लिए थंबनेल को माउस से खींचकर दूसरी फोटो पर छोड़ें।</p><div className="mt-3 grid grid-cols-4 gap-2">{photos.map((photo) => <div key={photo.id} draggable onDragStart={() => setDraggingPhotoId(photo.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorderPhotos(draggingPhotoId, photo.id); setDraggingPhotoId(''); }} onDragEnd={() => setDraggingPhotoId('')} className={`relative overflow-hidden rounded-lg border-2 bg-white ${selected?.id === photo.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'} ${draggingPhotoId === photo.id ? 'opacity-40' : ''}`}><button type="button" onClick={() => setSelectedId(photo.id)} title={`Select photo: ${photo.name}`} className="block w-full"><img src={photo.src} alt={photo.name} className="aspect-square w-full object-cover" /></button><button type="button" aria-label={`Delete ${photo.name}`} title="Delete photo" onClick={(event) => { event.stopPropagation(); removePhoto(photo.id); }} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"><Trash2 className="h-4 w-4" /></button></div>)}</div></>}
          </div>

          {step===1 && <>
          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 font-bold text-slate-900">2. फोटो का प्रकार</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('official')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${mode === 'official' ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-blue-200' : 'border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100'}`}><ShieldCheck className="mr-1 inline h-4 w-4" /> Official Mode</button>
              <button onClick={() => setMode('beauty')} className={`rounded-xl border px-3 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${mode === 'beauty' ? 'border-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-200' : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'}`}><Sparkles className="mr-1 inline h-4 w-4" /> Beauty Mode</button>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{mode === 'official' ? 'सरकारी दस्तावेज़ के लिए मूल चेहरे की बनावट बनाए रखने हेतु ब्यूटी इफेक्ट बंद हैं।' : 'हल्के visual adjustments उपलब्ध हैं। आधिकारिक आवेदन में फोटो नियम पहले जाँचें।'}</p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-2 font-bold text-slate-900">3. फोटो साइज</h3>
            <select value={preset} onChange={(event) => setPreset(event.target.value as PhotoPreset)} className="w-full rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 px-3 py-2.5 text-sm font-bold text-indigo-950 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="india">{PRESETS.india.label}</option><option value="stamp">{PRESETS.stamp.label}</option><option value="pan">{PRESETS.pan.label}</option><option value="custom">Custom Size</option>
            </select>
            {preset === 'custom' && <div className="mt-2 space-y-2"><label className="block text-xs text-slate-600">Measurement unit<select value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value as SizeUnit)} className="mt-1 w-full rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-2.5 text-sm font-bold text-blue-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="mm">Millimetres (MM)</option><option value="cm">Centimetres (CM)</option><option value="in">Inches (IN)</option></select></label><div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-600">Width ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customWidth,sizeUnit).toFixed(2))} onChange={(e) => setCustomWidth(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label><label className="text-xs text-slate-600">Height ({sizeUnit.toUpperCase()})<input type="number" min="0.1" step="0.1" value={Number(fromMillimetres(customHeight,sizeUnit).toFixed(2))} onChange={(e) => setCustomHeight(toMillimetres(Math.max(0.1,Number(e.target.value)||0.1),sizeUnit))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2" /></label></div></div>}
            <p className="mt-2 text-xs text-slate-500">चुने गए साइज का आउटपुट 300 DPI के हिसाब से तैयार होगा। हर आवेदन की फोटो गाइडलाइन अलग हो सकती है।</p>
          </div>

          </>}
          {step===2 && <>
          <div className="grid grid-cols-2 gap-2"><button onClick={openCropEditor} disabled={!selected} className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-3 text-sm font-bold text-sky-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md disabled:opacity-40">✂️ {language==='hi'?'फोटो क्रॉप करें':'Crop Photo'}</button><button onClick={()=>setActivePanel('remove-bg')} disabled={!selected} className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 text-sm font-bold text-emerald-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md disabled:opacity-40">{language==='hi'?'बैकग्राउंड हटाएँ':'Remove Background'}</button><button onClick={()=>{setBackgroundDraft(background);setActivePanel('color');}} className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-3 text-sm font-bold text-cyan-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md">{language==='hi'?'बैकग्राउंड रंग':'Background Color'}</button><button onClick={()=>{setBorderDraft(border);setActivePanel('border');}} className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-3 text-sm font-bold text-indigo-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md">{language==='hi'?'बॉर्डर सेट करें':'Border Settings'}</button></div><p className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2.5 text-xs leading-5 text-emerald-900">{language==='hi'?'पहली बार AI Background Removal तैयार होने और मॉडल डाउनलोड होने में इंटरनेट व डिवाइस के अनुसार लगभग 1–5 मिनट लग सकते हैं। अगली बार ब्राउज़र में मॉडल कैश उपलब्ध होने पर यह जल्दी शुरू हो सकता है।':'The first AI background-removal setup and model download may take about 1–5 minutes, depending on your device and internet. Later visits may start faster if the model remains cached in your browser.'}</p>


          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="font-bold text-slate-900">7. Signature Editor</h3>
            <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void updateSignatureFile(e.target.files?.[0]); e.currentTarget.value = ''; }} />
            <button onClick={() => signatureInputRef.current?.click()} className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-gradient-to-r from-white via-indigo-50 to-sky-50 px-3 py-3 text-sm font-extrabold text-indigo-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500 hover:from-indigo-100 hover:to-sky-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"><Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" /> सिग्नेचर अपलोड करें</button>
            {signatureSrc && <>
              {signatureConfirmed ? <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2"><span className="text-xs font-semibold text-emerald-800">✓ Signature applied · फोटो पर फिट हो गया</span><button onClick={() => setSignatureConfirmed(false)} className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">Edit Signature</button></div> : <>
              <p className="text-xs text-slate-500">{signatureName} · क्रॉप बॉक्स सेट करें और फिर OK दबाएँ।</p>
              <div className="relative mx-auto max-w-full overflow-hidden rounded-lg border border-slate-300 bg-[linear-gradient(45deg,#eee_25%,transparent_25%),linear-gradient(-45deg,#eee_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eee_75%),linear-gradient(-45deg,transparent_75%,#eee_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]" style={{ width: Math.min(384, 192 * signatureAspect), aspectRatio: String(signatureAspect), touchAction: 'none' }}>
                <img src={signatureSrc} alt="Signature crop source" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
                <div className="absolute border-2 border-blue-600 bg-blue-300/10" style={{ left: signatureCrop.x + '%', top: signatureCrop.y + '%', width: signatureCrop.w + '%', height: signatureCrop.h + '%', touchAction: 'none' }}
                  onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); const parent = e.currentTarget.parentElement!.getBoundingClientRect(); const corner = (e.target as HTMLElement).dataset.resize as 'tl' | 'tr' | 'bl' | 'br' | undefined; signatureDragRef.current = { x: (e.clientX - parent.left) / parent.width * 100, y: (e.clientY - parent.top) / parent.height * 100, mode: corner ? 'resize' : 'move', corner, startCrop: { ...signatureCrop } }; }}
                  onPointerMove={(e) => { if (e.buttons === 1) moveSignatureCrop(e); }}
                  onPointerUp={() => { signatureDragRef.current = null; }}
                  onPointerCancel={() => { signatureDragRef.current = null; }}>
                  <span data-resize="tl" className="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-600 shadow" />
                  <span data-resize="tr" className="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-nesw-resize rounded-sm border-2 border-white bg-blue-600 shadow" />
                  <span data-resize="bl" className="absolute -left-1.5 -bottom-1.5 h-3 w-3 cursor-nesw-resize rounded-sm border-2 border-white bg-blue-600 shadow" />
                  <span data-resize="br" className="absolute -right-1.5 -bottom-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-600 shadow" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Crop width (%)" min={5} max={100} value={signatureCrop.w} onChange={(v) => setSignatureCrop((c) => ({ ...c, w: Math.min(v, 100 - c.x) }))} />
                <Slider label="Crop height (%)" min={5} max={100} value={signatureCrop.h} onChange={(v) => setSignatureCrop((c) => ({ ...c, h: Math.min(v, 100 - c.y) }))} />
                <Slider label="Crop left (%)" min={0} max={95} value={signatureCrop.x} onChange={(v) => setSignatureCrop((c) => ({ ...c, x: Math.min(v, 100 - c.w) }))} />
                <Slider label="Crop top (%)" min={0} max={95} value={signatureCrop.y} onChange={(v) => setSignatureCrop((c) => ({ ...c, y: Math.min(v, 100 - c.h) }))} />
              </div>
              <div className="flex flex-wrap gap-2">
                {(['transparent', 'white', 'custom'] as SignatureBackground[]).map((v) => <button key={v} onClick={() => setSignatureBackground(v)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${signatureBackground === v ? (v === "transparent" ? "border-cyan-600 bg-gradient-to-r from-cyan-600 to-sky-500 text-white" : v === "white" ? "border-slate-500 bg-gradient-to-r from-slate-100 to-white text-slate-800" : "border-fuchsia-700 bg-gradient-to-r from-fuchsia-700 to-purple-600 text-white") : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}>{v === 'transparent' ? 'Transparent' : v === 'white' ? 'White' : 'Custom Color'}</button>)}
                {signatureBackground === 'custom' && <input aria-label="Signature background color" type="color" value={signatureCustomColor} onChange={(e) => setSignatureCustomColor(e.target.value)} className="h-9 w-12 rounded border" />}
              </div>
              {signatureBackground === 'transparent' && <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={signatureRemoveWhite} onChange={(e) => setSignatureRemoveWhite(e.target.checked)} /> सफेद पेपर बैकग्राउंड हटाकर transparent करें</label>}
              <div className="border-t border-slate-200 pt-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">फोटो पर सिग्नेचर की जगह और साइज़</p>
                <p className="mb-2 text-[11px] text-slate-500">मुख्य प्रीव्यू में सिग्नेचर को सीधे खींचें। चारों कोनों के नीले हैंडल से बड़ा-छोटा करें। यह फोटो की सीमा के अंदर ही रहेगा।</p>
                <Slider label="Left position (%)" min={0} max={Math.max(0, Math.floor(100 - signaturePlacement.width))} value={Math.min(signaturePlacement.x, 100 - signaturePlacement.width)} onChange={(v) => setSignaturePlacement((p) => ({ ...p, x: v }))} />
                <Slider label="Top position (%)" min={0} max={95} value={signaturePlacement.y} onChange={(v) => setSignaturePlacement((p) => ({ ...p, y: v }))} />
                <Slider label="Signature width (%)" min={3} max={80} value={signaturePlacement.width} onChange={(v) => setSignaturePlacement((p) => ({ ...p, width: v, x: Math.min(p.x, 100 - v) }))} />
                <Slider label="Signature height (%)" min={3} max={40} value={signaturePlacement.height} onChange={(v) => setSignaturePlacement((p) => ({ ...p, height: v, y: Math.min(p.y, 100 - v) }))} />
              </div>
              <div className="flex flex-wrap gap-2">{!signatureConfirmed && <button onClick={() => setSignatureConfirmed(true)} className="rounded-xl border border-slate-950 bg-gradient-to-r from-slate-950 via-black to-slate-800 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-black hover:to-slate-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400">{language === "hi" ? "ठीक · सिग्नेचर लागू करें" : "OK · Apply Signature"}</button>}<button onClick={() => void downloadSignaturePng()} className="rounded-xl border border-violet-700 bg-gradient-to-r from-violet-700 to-indigo-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">{language === "hi" ? "सिग्नेचर PNG डाउनलोड" : "Download Signature PNG"}</button><button onClick={() => { setSignatureSrc(''); setSignatureName(''); setSignatureConfirmed(false); }} className="rounded-xl border border-red-700 bg-gradient-to-r from-red-700 to-rose-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-red-800 hover:to-rose-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300">{language === "hi" ? "सिग्नेचर हटाएँ" : "Remove Signature"}</button></div>
              </>}
            </>}
            <p className="text-[11px] text-slate-500">Transparent mode में सफेद pixels हटाने का threshold आधारित विकल्प है; हल्के रंग के हस्ताक्षर पर परिणाम जाँचें।</p>
          </div>

{mode === 'beauty' && <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-900"><SlidersHorizontal className="h-4 w-4" /> 5. Beauty &amp; Enhance</h3>
            <Slider label="Brightness" value={selectedEdit.brightness} min={50} max={150} onChange={(v) => updateSelectedEdit('brightness', v)} />
            <Slider label="Contrast" value={selectedEdit.contrast} min={50} max={150} onChange={(v) => updateSelectedEdit('contrast', v)} />
            <Slider label="Saturation" value={selectedEdit.saturation} min={0} max={200} onChange={(v) => updateSelectedEdit('saturation', v)} />
            <Slider label="Softening (हल्का blur)" value={selectedEdit.smooth} min={0} max={10} onChange={(v) => updateSelectedEdit('smooth', v)} />
            <div className="flex flex-wrap gap-2"><button type="button" onClick={undoBeauty} disabled={!canUndoBeauty} className="rounded border px-3 py-2 text-xs font-bold disabled:opacity-40">{language === "hi" ? "↶ पूर्ववत" : "↶ Undo"}</button><button type="button" onClick={redoBeauty} disabled={!canRedoBeauty} className="rounded border px-3 py-2 text-xs font-bold disabled:opacity-40">{language === "hi" ? "↷ फिर से" : "↷ Redo"}</button><button type="button" onClick={resetAdjustments} className="rounded border px-3 py-2 text-xs font-bold">Reset Beauty</button></div>
            <p className="text-[11px] text-slate-500">स्लाइडर को बाएँ-दाएँ खींचें। बदलाव ऊपर मुख्य फोटो में लाइव दिखेगा। नीचे Original और Edited फोटो साथ-साथ देखकर फर्क जाँचें।</p>
            {selected && <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="min-w-0 space-y-1.5"><div className="text-[10px] font-extrabold tracking-wide text-slate-600">BEFORE · ORIGINAL</div><div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border bg-white"><img src={selected.src} alt="Original photo before beauty edits" className="max-h-full max-w-full object-contain" /></div></div>
              <div className="min-w-0 space-y-1.5"><div className="text-[10px] font-extrabold tracking-wide text-blue-700">AFTER · EDITED PREVIEW</div><div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-blue-200 bg-white"><img src={aiCutouts[selected.id] || selected.src} alt="Edited photo preview" className="max-h-full max-w-full object-contain" style={{ filter: `brightness(${selectedEdit.brightness}%) contrast(${selectedEdit.contrast}%) saturate(${selectedEdit.saturation}%) blur(${selectedEdit.smooth * 0.12}px)` }} /></div></div>
            </div>}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" disabled={!selected || aiProcessing} onClick={async () => {
                  if (!selected) return;
                  const target = selected;
                  setAiProcessing(true); setFaceStatus('AI skin segmentation मॉडल लोड हो रहा है…'); setError('');
                  try {
                    const sourceUrl = backgroundRemoved[target.id] && aiCutouts[target.id] ? aiCutouts[target.id] : target.src;
                    const image = await loadImageForDetection(sourceUrl);
                    saveBeautyHistory(target.id);
                    const retouched = await retouchFaceSkinLocally(image, retouchStrength);
                    const resultUrl = retouched.toDataURL('image/png');
                    setAiCutouts(current => ({ ...current, [target.id]: resultUrl }));
                    setBackgroundRemoved(current => ({ ...current, [target.id]: true }));
                    setFaceStatus('AI Face-Skin Retouch लागू हुआ। आँखें, होंठ और बाल segmentation mask से सुरक्षित रखे गए हैं।');
                  } catch (error) {
                    console.error('Local skin retouch failed', error);
                    setFaceStatus('Skin Retouch पूरा नहीं हुआ। इंटरनेट कनेक्शन जाँचें और फिर कोशिश करें।');
                    setError(error instanceof Error ? error.message : 'Skin retouch failed.');
                  } finally { setAiProcessing(false); }
                }} className="rounded bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
                  {aiProcessing ? 'Processing…' : 'Apply AI Skin Retouch'}
                </button>
                <button type="button" disabled={!selected || aiProcessing} onClick={async () => {
                  if (!selected) return;
                  setFaceStatus('MediaPipe Face Detector मॉडल लोड हो रहा है…'); setFaceRect(null);
                  try {
                    const detector = await getLocalFaceDetector();
                    const image = await loadImageForDetection(selected.src);
                    const detections = detector.detect(image).detections || [];
                    const box = detections[0]?.boundingBox;
                    if (!box) { setFaceStatus('कोई चेहरा नहीं मिला। सामने से ली गई साफ़ फोटो आज़माएँ।'); return; }
                    setFaceRect({ x: box.originX / image.naturalWidth, y: box.originY / image.naturalHeight, width: box.width / image.naturalWidth, height: box.height / image.naturalHeight });
                    setFaceStatus(`${detections.length} चेहरा मिला।`);
                  } catch (error) {
                    console.error('Local face detection failed', error);
                    setFaceStatus('Face Detection मॉडल लोड नहीं हो पाया। इंटरनेट कनेक्शन जाँचें।');
                  }
                }} className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-bold disabled:opacity-40">Detect Face</button>
              </div>
              <label className="block text-xs font-semibold text-slate-700">Blemish Reduction Strength: {retouchStrength}%
                <input type="range" min="0" max="60" value={retouchStrength} onChange={e => setRetouchStrength(Number(e.target.value))} className="mt-1 w-full" />
              </label>
              {faceStatus && <p className="text-xs text-blue-900">{faceStatus}</p>}
              <p className="text-[11px] leading-5 text-blue-800">Face-skin segmentation आपके ब्राउज़र में चलती है। यह face-skin mask के भीतर छोटे isolated blemish-जैसे spots को हल्का करता है; पूरे चेहरे पर blur नहीं लगाता। फोटो सर्वर पर अपलोड नहीं होती। बेहतर परिणाम के लिए 10–25% से शुरू करें।</p>
            </div>
          </div>}

          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">6. Crop & Position</h3><button onClick={resetAdjustments} className="text-xs font-semibold text-blue-700"><RefreshCw className="mr-1 inline h-3 w-3" /> Reset</button></div>
            <p className="mb-2 text-xs text-slate-500">चुनी हुई फोटो की Crop अलग से सेट करें। Single Photo preview में फोटो को सीधे drag करके position भी बदल सकते हैं।</p>
            <div className="grid grid-cols-2 gap-3"><Slider label="Zoom" min={50} max={200} value={Math.round(selectedEdit.zoom * 100)} onChange={(v) => updateSelectedEdit('zoom', v / 100)} /><Slider label="Move left / right" min={-250} max={250} value={selectedEdit.moveX} onChange={(v) => updateSelectedEdit('moveX', v)} /></div>
            <div className="mt-3"><Slider label="Move up / down" min={-250} max={250} value={selectedEdit.moveY} onChange={(v) => updateSelectedEdit('moveY', v)} /></div>
          </div>
          {selected && <button onClick={removeSelected} className="text-xs font-semibold text-red-600 hover:text-red-700"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove selected photo</button>}
          </>}
          {step===3 && <div className="space-y-3"><p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{language==='hi'?'प्रीव्यू जाँचें और JPG/PDF डाउनलोड करें।':'Check the preview and download JPG/PDF.'}</p><button onClick={()=>{setStep(2);openCropEditor();}} disabled={!selected} className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-sm font-bold text-blue-700 disabled:opacity-40">← {language==='hi'?'वापस जाएँ और Crop सुधारें':'Back to Crop & Adjust'}</button></div>}
        </section>}

        <section className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 xl:self-start">
          {!showStepSidebar && <div className="flex justify-start"><button type="button" onClick={()=>setShowStepSidebar(true)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">☰ {step===1?"Open Upload panel":step===2?"Open Edit panel":"Open Export panel"}</button></div>}
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">{language==='hi'?'लाइव प्रिंट प्रीव्यू':'Live Print Preview'}</h3><select value={paper} onChange={(e) => { const next = e.target.value as Paper; setPaper(next); setSheetPhotoCount(next === '4x6' ? 4 : next === 'A4' ? 0 : 1); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className={`rounded-xl border px-3 py-2 text-xs font-extrabold shadow-sm outline-none transition-all duration-200 focus:ring-2 ${paper === 'single' ? 'border-slate-950 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 text-white shadow-md focus:ring-slate-300' : paper === '4x6' ? 'border-violet-300 bg-gradient-to-r from-violet-700 to-fuchsia-600 text-white hover:border-violet-500 focus:ring-violet-200' : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500 focus:ring-emerald-200'}`}><option value="single">{language === "hi" ? "एक फोटो" : "Single Photo"}</option><option value="4x6">{language === "hi" ? "4 × 6 इंच फोटो शीट" : "4 × 6 inch Photo Sheet"}</option><option value="A4">{language === "hi" ? "A4 फोटो शीट" : "A4 Photo Sheet"}</option></select><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-inner"><button onClick={() => { setPaper('4x6'); setSheetPhotoCount(4); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${paper === '4x6' ? 'bg-gradient-to-r from-violet-700 to-fuchsia-600 text-white shadow-md' : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}>4 × 6 inch</button><button onClick={() => { setPaper('A4'); setSheetPhotoCount(0); setSheetPhotoOverrides({}); setSheetPositions({}); setSelectedSheetSlot(null); }} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${paper === 'A4' ? 'bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>A4 Sheet</button></div></div>
          <div className="sticky top-2 z-30 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-md backdrop-blur sm:p-2"><button onClick={undoSheetAction} disabled={!canUndoSheet} className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-3 py-2 text-xs font-bold text-amber-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40">↶ Undo</button><button onClick={redoSheetAction} disabled={!canRedoSheet} className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white px-3 py-2 text-xs font-bold text-sky-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40">↷ Redo</button><button onClick={autoArrangeSheet} disabled={paper === 'single'} className="rounded-xl border border-blue-700 bg-gradient-to-r from-blue-700 to-sky-600 px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40">{language === "hi" ? "स्वतः व्यवस्थित करें" : "Auto Arrange"}</button><button onClick={resetSheetLayout} disabled={paper === 'single' || Object.keys(sheetPositions).length === 0} className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-orange-50 px-3 py-2 text-xs font-bold text-rose-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md disabled:opacity-40">{language === "hi" ? "लेआउट रीसेट करें" : "Reset Layout"}</button><span className="w-full text-[11px] leading-4 text-slate-500 sm:flex-1">{language === "hi" ? "फोटो चुनें और खिसकाएँ। ‘चुनी पंक्ति नीचे कॉपी करें’ से एक पंक्ति जोड़ें; ‘सभी पंक्तियाँ नीचे कॉपी करें’ से पूरा लेआउट दोहराएँ। समूह लॉक चालू करके फोटो खींचें—सभी फोटो साथ चलेंगी और उनके बीच का अंतर व आकार सुरक्षित रहेगा। कई फोटो चुनने के लिए Ctrl/⌘ + क्लिक करें; उन्हें चुनने या हटाने के लिए ‘यह पंक्ति चुनें’ या ‘चयनित हटाएँ’ का उपयोग करें।" : "Select and drag photos to reposition them. Use ‘Copy selected row below’ to add one row, or ‘Copy all rows below’ to repeat the full layout. Turn on Group Lock and drag a photo to move all photos together while preserving their spacing and size. Ctrl/⌘ + click selects multiple photos; use ‘Select this row’ or ‘Delete selected’ to remove them."}</span></div><div className="space-y-3 rounded-xl border border-slate-200 bg-white p-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-slate-700">{language === "hi" ? "इस शीट पर फोटो" : "Photos on this sheet"}</span><span className="text-[11px] text-slate-500">{language === "hi" ? "क्षमता" : "Capacity"}: {sheetFitCapacity} · {language === "hi" ? "चयनित" : "Selected"}: {Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity)}</span></div><div className="flex flex-wrap gap-2"><button onClick={() => setPresetSheetCount(4)} disabled={paper === 'single' || sheetFitCapacity < 4} className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${sheetPhotoCount === 4 ? "border-blue-700 bg-gradient-to-r from-blue-700 to-cyan-600 text-white" : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"}`}>{language === "hi" ? "4 फोटो" : "4 Photos"}</button><button onClick={() => setPresetSheetCount(6)} disabled={paper === 'single' || sheetFitCapacity < 6} className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${sheetPhotoCount === 6 ? "border-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-600 text-white" : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"}`}>{language === "hi" ? "6 फोटो" : "6 Photos"}</button><button onClick={useAutoFitSheet} disabled={paper === 'single'} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-xs font-extrabold text-amber-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">{language === "hi" ? "ऑटो-फिट" : "Auto-fit"}</button><button onClick={addSelectedSheetCopy} disabled={paper === 'single' || !selected || Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity) >= sheetCapacity} className="rounded-xl border border-blue-700 bg-gradient-to-r from-blue-700 to-cyan-600 px-3 py-2 text-xs font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40">{language === "hi" ? "+ चुनी फोटो की कॉपी जोड़ें" : "+ Add selected photo copy"}</button><button onClick={duplicateSelectedSheetPhoto} disabled={paper === 'single' || selectedSheetSlot === null || Math.min(sheetCapacity, sheetPhotoCount || sheetCapacity) >= sheetCapacity} className="rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2 text-xs font-extrabold text-indigo-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40">{language === "hi" ? "चुनी शीट फोटो डुप्लिकेट करें" : "Duplicate selected sheet photo"}</button><label className="flex items-center gap-2 text-xs text-slate-600">{language === "hi" ? "पंक्ति कॉपी" : "Row copy"} <select value={rowCopyCount} onChange={e => setRowCopyCount(e.target.value)} className="rounded-xl border border-violet-300 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 px-3 py-2 font-bold text-violet-900 shadow-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-100"><option value="all">{language === "hi" ? "पूरी पंक्ति" : "Entire row"}</option><option value="1">{language === "hi" ? "1 फोटो" : "1 photo"}</option><option value="2">{language === "hi" ? "2 फोटो" : "2 photos"}</option><option value="3">{language === "hi" ? "3 फोटो" : "3 photos"}</option><option value="4">{language === "hi" ? "4 फोटो" : "4 photos"}</option><option value="8">{language === "hi" ? "8 फोटो" : "8 photos"}</option></select></label><button onClick={copySelectedRowBelow} disabled={paper === 'single' || selectedSheetSlot === null || Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity) >= sheetCapacity} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-40">{language === "hi" ? "↓ चुनी पंक्ति नीचे कॉपी करें" : "↓ Copy selected row below"}</button><button onClick={copyAllRowsBelow} disabled={paper === 'single' || Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity) >= sheetCapacity} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-white px-3 py-2 text-xs font-extrabold text-amber-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md disabled:opacity-40">{language === "hi" ? "सभी पंक्तियाँ नीचे कॉपी करें" : "Copy all rows below"}</button><button onClick={selectCurrentSheetRow} disabled={paper === 'single' || selectedSheetSlot === null} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-40">{language === "hi" ? "यह पंक्ति चुनें" : "Select this row"}</button><button onClick={deleteSelectedSheetPhotos} disabled={paper === 'single' || (selectedSheetSlots.length === 0 && selectedSheetSlot === null)} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40">{language === "hi" ? "चयनित हटाएँ" : "Delete selected"} ({selectedSheetSlots.length || (selectedSheetSlot === null ? 0 : 1)})</button><button onClick={deleteSelectedSheetRow} disabled={paper === 'single' || selectedSheetSlot === null} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40">{language === "hi" ? "चुनी पंक्ति हटाएँ" : "Delete selected row"}</button><button type="button" onClick={() => setLockSheetGroup(v => !v)} disabled={paper === 'single' || sheetRectsRef.current.length < 2} className={`rounded-xl border px-3 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${lockSheetGroup ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-800 hover:border-violet-400'} disabled:opacity-40`}>{lockSheetGroup ? (language === "hi" ? "🔒 समूह लॉक है" : "🔒 Group locked") : (language === "hi" ? "सभी फोटो को समूह में लॉक करें" : "Lock all photos as group")}</button></div><div className="grid grid-cols-3 gap-1.5"><label className="min-w-0 rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-2 text-[11px] font-extrabold text-indigo-900 shadow-sm sm:text-xs">{language === "hi" ? "कस्टम फोटो संख्या" : "Custom photo count"}<input type="number" min="1" max={sheetCapacity} value={paper === 'single' ? 1 : Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity)} onChange={(e) => setPresetSheetCount(Number(e.target.value) || 1)} disabled={paper === 'single'} className="mt-1 w-full min-w-0 rounded-lg border border-indigo-200 bg-white px-2 py-2 text-sm font-bold text-indigo-950 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label><label className="min-w-0 rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-teal-100 p-2 text-[11px] font-extrabold text-teal-900 shadow-sm transition-all duration-200 hover:border-teal-300 hover:shadow-md sm:text-xs">{language === "hi" ? "पेज मार्जिन (mm)" : "Page margin (mm)"}<input type="number" min="0" max="15" value={sheetMargin} onChange={(e) => setSheetMargin(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full min-w-0 rounded-lg border border-teal-200 bg-white px-2 py-2 text-sm font-bold text-teal-950 shadow-inner outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100" /></label><label className="min-w-0 rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-100 p-2 text-[11px] font-extrabold text-rose-900 shadow-sm transition-all duration-200 hover:border-rose-300 hover:shadow-md sm:text-xs">{language === "hi" ? "कटिंग गैप (mm)" : "Cutting gap (mm)"}<input type="number" min="0" max="8" value={sheetGap} onChange={(e) => setSheetGap(Number(e.target.value))} disabled={paper === "single"} className="mt-1 w-full min-w-0 rounded-lg border border-amber-200 bg-white px-2 py-2 text-sm font-bold text-amber-950 shadow-inner outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100" /></label></div><p className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px] leading-5 text-slate-600">{language === "hi" ? "ऑटो-फिट मूल साइज में अधिकतम फोटो लगाएगा। कस्टम संख्या में जरूरत के अनुसार फोटो बढ़ाएँ; लेआउट शीट में फिट होगा। PDF प्रिंट करते समय वास्तविक आकार / 100% चुनें और Fit to page बंद रखें।" : "Auto-fit places the maximum photos at their original size. Increase the custom count as needed; the layout will fit the sheet. For PDF printing, choose Actual size / 100% and turn Fit to page off."}</p></div>{aiProcessing && <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">{aiProgressMessage || 'BiRefNet AI फोटो का background हटा रहा है… पूरा होने पर Preview अपने-आप अपडेट होगा।'}</p>}
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
          <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><div className="relative mx-auto w-fit"><canvas ref={canvasRef} tabIndex={paper === 'single' ? -1 : 0} aria-label="Photo sheet preview. Select the first photo and use arrow keys to position it." onKeyDown={handleSheetKeyDown} onPointerDown={handleSheetPointerDown} onPointerMove={handleSheetPointerMove} onPointerUp={handleSheetPointerUp} onPointerCancel={handleSheetPointerUp} onLostPointerCapture={handleSheetPointerUp} style={{ touchAction: 'none', cursor: paper === 'single' ? 'grab' : 'grab', outline: 'none' }} className="mx-auto block h-auto max-h-[720px] max-w-full bg-white shadow-lg" />{paper === 'single' && signatureSrc && !signatureConfirmed && (() => { const canvas = canvasRef.current; const widthPct = signaturePlacement.width; const heightPct = signaturePlacement.height; const leftPct = Math.max(0, Math.min(100 - widthPct, signaturePlacement.x)); const topPct = Math.max(0, Math.min(100 - heightPct, signaturePlacement.y)); return <div className="absolute z-10 border-2 border-blue-600 bg-blue-300/10" style={{ left: leftPct + '%', top: topPct + '%', width: widthPct + '%', height: heightPct + '%', touchAction: 'none', cursor: 'move' }} onPointerDown={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); const target = (e.target as HTMLElement).dataset.corner; signaturePreviewDragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, start: { x: leftPct, y: topPct, width: widthPct, height: heightPct }, corner: (target as any) || 'move' }; }} onPointerMove={e => { const drag = signaturePreviewDragRef.current; if (!drag || drag.pointerId !== e.pointerId) return; const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return; const dx = (e.clientX - drag.startX) / rect.width * 100, dy = (e.clientY - drag.startY) / rect.height * 100; let width = drag.start.width, height = drag.start.height, xPos = drag.start.x, yPos = drag.start.y; if (drag.corner === 'move') { xPos = Math.max(0, Math.min(100 - width, drag.start.x + dx)); yPos = Math.max(0, Math.min(100 - height, drag.start.y + dy)); } else { const fromLeft = drag.corner.endsWith('l'), fromTop = drag.corner.startsWith('t'); const right = drag.corner.endsWith('r'), bottom = drag.corner.endsWith('b'); const fixedX = fromLeft ? drag.start.x + drag.start.width : drag.start.x; const fixedY = fromTop ? drag.start.y + drag.start.height : drag.start.y; const movingX = fromLeft ? drag.start.x + dx : drag.start.x + drag.start.width + dx; const movingY = fromTop ? drag.start.y + dy : drag.start.y + drag.start.height + dy; const nextLeft = fromLeft ? Math.max(0, Math.min(fixedX - 3, movingX)) : fixedX; const nextTop = fromTop ? Math.max(0, Math.min(fixedY - 3, movingY)) : fixedY; const nextRight = right ? Math.min(100, Math.max(fixedX + 3, movingX)) : fixedX; const nextBottom = bottom ? Math.min(100, Math.max(fixedY + 3, movingY)) : fixedY; xPos = nextLeft; yPos = nextTop; width = Math.max(3, nextRight - nextLeft); height = Math.max(3, nextBottom - nextTop); if (xPos + width > 100) width = 100 - xPos; if (yPos + height > 100) height = 100 - yPos; } setSignaturePlacement({ x: xPos, y: yPos, width, height }); }} onPointerUp={e => { signaturePreviewDragRef.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { signaturePreviewDragRef.current = null; }} onLostPointerCapture={() => { signaturePreviewDragRef.current = null; }}><span data-corner="tl" className="absolute -left-2 -top-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow cursor-nwse-resize"/><span data-corner="tr" className="absolute -right-2 -top-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow cursor-nesw-resize"/><span data-corner="bl" className="absolute -left-2 -bottom-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow cursor-nesw-resize"/><span data-corner="br" className="absolute -right-2 -bottom-2 h-4 w-4 rounded-sm border-2 border-white bg-blue-600 shadow cursor-nwse-resize"/></div>; })()}{selectedSheetRect && paper !== 'single' && <div className="pointer-events-none absolute border-2 border-blue-600" style={{ left: `${selectedSheetRect.x / (paper === '4x6' ? 1200 : 2480) * 100}%`, top: `${selectedSheetRect.y / (paper === '4x6' ? 1800 : 3508) * 100}%`, width: `${selectedSheetRect.w / (paper === '4x6' ? 1200 : 2480) * 100}%`, height: `${selectedSheetRect.h / (paper === '4x6' ? 1800 : 3508) * 100}%` }}><span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-sm border border-white bg-blue-600 shadow"/><span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-sm border border-white bg-blue-600 shadow"/><span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-sm border border-white bg-blue-600 shadow"/><span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-sm border border-white bg-blue-600 shadow"/><button type="button" aria-label="Copy selected photo to sheet" title="Copy photo" onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); const currentCount = Math.min(sheetCapacity, sheetPhotoCount || sheetFitCapacity); if (currentCount >= sheetCapacity) { setError('शीट पर और फोटो जोड़ने की जगह नहीं है।'); return; } saveSheetUndo(); const nextSlot = currentCount; const copyRect: SheetRect = { ...selectedSheetRect, slot: nextSlot }; setSheetPhotoOverrides(current => ({ ...current, [nextSlot]: selectedSheetRect.photoId })); setSheetPhotoCount(nextSlot + 1); setSheetPositions(current => ({ ...current, [nextSlot]: { x: copyRect.x, y: copyRect.y, w: copyRect.w, h: copyRect.h } })); sheetRectsRef.current = [...sheetRectsRef.current, copyRect]; setSelectedSheetSlot(nextSlot); setSelectedSheetSlots([]); }} className="pointer-events-auto absolute right-1 top-1 rounded border border-white/80 bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold leading-tight tracking-wide text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">COPY</button></div>}{selectedSheetRect && paper !== 'single' && <button type="button" aria-label="Delete selected photo from sheet" title="Delete this photo" onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); deleteSheetPhotos([selectedSheetRect.slot]); }} className="absolute z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400" style={{ left: `${(selectedSheetRect.x + selectedSheetRect.w) / (paper === '4x6' ? 1200 : 2480) * 100}%`, top: `${selectedSheetRect.y / (paper === '4x6' ? 1800 : 3508) * 100}%`, transform: 'translate(-50%, -50%)' }}><Trash2 className="h-3.5 w-3.5" /></button>}</div></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><button onClick={downloadJpg} disabled={!selected} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4" /> {language === "hi" ? (paper === "single" ? "फोटो डाउनलोड करें" : "शीट JPG डाउनलोड करें") : (paper === "single" ? "Download Single Photo" : "Download Sheet JPG")}</button><button onClick={downloadPdf} disabled={!selected} className="flex items-center justify-center gap-2 rounded-xl border border-violet-700 bg-gradient-to-r from-violet-700 to-indigo-600 px-3 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40"><Download className="h-4 w-4" /> {language === "hi" ? "PDF डाउनलोड करें" : "Download PDF"}</button><button onClick={printSheet} disabled={!selected} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-600 px-3 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40"><Printer className="h-4 w-4" /> {language === "hi" ? "वास्तविक आकार में प्रिंट" : "Print at Actual Size"}</button></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>{language === "hi" ? "ध्यान दें:" : "Note:"}</strong> {language === "hi" ? "BiRefNet AI बैकग्राउंड हटाता है, लेकिन बालों और किनारों का परिणाम फोटो के अनुसार बदल सकता है। Face detection, retouch और brush tools ब्राउज़र पर निर्भर हैं। प्रिंट से पहले आउटपुट और संबंधित विभाग की नवीनतम specification जाँचें।" : "BiRefNet AI removes the background, but hair and edge quality varies by photo. Face detection, retouch and brush tools depend on browser support. Check the output and the relevant department’s latest specifications before printing."}</div>
        </section>
      </div>
      {activePanel && <div className={activePanel === "color" || activePanel === "border" ? "fixed right-4 top-24 z-[70] w-[min(92vw,420px)]" : "fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm"}><div className={activePanel === "color" || activePanel === "border" ? "max-h-[75vh] overflow-y-auto rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl" : "w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"}><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{activePanel==='crop'?(language==='hi'?'फोटो क्रॉप करें':'Crop Photo'):activePanel==='remove-bg'?(language==='hi'?'बैकग्राउंड हटाएँ':'Remove Background'):activePanel==='color'?(language==='hi'?'बैकग्राउंड रंग':'Background Color'):(language==='hi'?'बॉर्डर सेटिंग':'Border Settings')}</h3><button onClick={()=>{setActivePanel(null);setCropDrag(null);}} className="rounded-lg px-3 py-1 hover:bg-slate-100">✕</button></div>
      {activePanel==='crop'&&selected&&<div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">Crop / output size
            <select value={preset} onChange={e=>setPreset(e.target.value as PhotoPreset)} className="mt-1 w-full rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-2.5 font-bold text-indigo-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
              <option value="india">India Passport / Exam · 35 × 45 mm</option>
              <option value="stamp">Stamp Photo · 25 × 30 mm</option>
              <option value="pan">PAN Photo · 25 × 35 mm</option>
              <option value="custom">Custom size</option>
            </select>
          </label>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
            <div className="font-bold">{language === "hi" ? "चुना हुआ आउटपुट साइज" : "Selected output size"}</div>
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
            <h4 className="text-sm font-bold text-blue-900">{language === "hi" ? "फोटो का लाइव अंतिम प्रीव्यू" : "Live final photo preview"}</h4>
            <p className="text-xs text-blue-800">यहाँ वही चुना हुआ crop और exact output ratio दिखेगा जो JPG/PDF में बनेगा।</p>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
              <canvas ref={cropPreviewRef} className="mx-auto block h-auto max-h-[360px] max-w-full object-contain shadow-sm" />
            </div>
            <p className="text-[11px] text-slate-600">{preset==='custom'?fromMillimetres(customWidth,sizeUnit).toFixed(2)+' × '+fromMillimetres(customHeight,sizeUnit).toFixed(2)+' '+sizeUnit.toUpperCase():PRESETS[preset].label}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <button onClick={()=>setPhotoEdits(c=>({...c,[selected.id]:fitCropToOutput({...DEFAULT_EDIT})}))} className="rounded-lg border px-3 py-2 text-xs font-semibold">{language === "hi" ? "क्रॉप रीसेट" : "Reset Crop"}</button>
          <div className="flex gap-2"><button onClick={()=>{setActivePanel(null);setCropDrag(null);}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button><button onClick={()=>{setActivePanel(null);setCropDrag(null);setStep(3);}} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save &amp; Next</button></div>
        </div>
        <p className="text-[11px] text-amber-700">ध्यान दें: फोटो साइज का अंतिम नियम संबंधित फॉर्म/विभाग की आधिकारिक गाइडलाइन से मिलाएँ।</p>
      </div>}
      {activePanel==='remove-bg'&&selected&&<div className="space-y-4"><p className="text-sm text-slate-600">{language==='hi'?'फ्री BiRefNet AI आपके ब्राउज़र में बैकग्राउंड हटाता है। फोटो हमारे ऐप सर्वर पर अपलोड नहीं होती।':'Free BiRefNet AI removes the background locally in your browser. Your photo is not uploaded to our app server.'}</p><div className="rounded-xl border p-3 space-y-2"><h4 className="text-sm font-bold">Manual Brush Eraser</h4><p className="text-xs text-slate-600">ब्रश से मिटाएँ और Restore से वापस पेंट करें।</p><div className="flex flex-wrap items-center gap-2"><label className="text-xs">Size <input type="range" min="4" max="100" value={brushSize} onChange={e=>setBrushSize(Number(e.target.value))}/></label><button type="button" onClick={()=>setBrushMode('erase')} className="rounded border px-2 py-1 text-xs">Erase</button><button type="button" onClick={()=>setBrushMode('restore')} className="rounded border px-2 py-1 text-xs">Restore</button><button type="button" onClick={()=>{const c=brushCanvasRef.current,o=brushOriginalRef.current;if(c&&o)c.getContext('2d')?.drawImage(o,0,0);}} className="rounded border px-2 py-1 text-xs">Reset</button><button type="button" onClick={()=>{const c=brushCanvasRef.current;if(!c||!selected)return;setAiCutouts(v=>({...v,[selected.id]:c.toDataURL('image/png')}));setBackgroundRemoved(v=>({...v,[selected.id]:true}));setActivePanel(null);}} className="rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">Apply</button></div><div className="overflow-auto bg-slate-100 p-2"><canvas ref={brushCanvasRef} className="mx-auto block max-h-[360px] max-w-full touch-none" onPointerDown={e=>{const c=e.currentTarget;c.setPointerCapture(e.pointerId);setBrushActive(true);const ctx=c.getContext('2d'),r=c.getBoundingClientRect();if(ctx){ctx.globalCompositeOperation=brushMode==='erase'?'destination-out':'source-over';ctx.lineWidth=brushSize*Math.max(c.width/r.width,c.height/r.height);ctx.lineCap='round';ctx.beginPath();ctx.moveTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);ctx.lineTo((e.clientX-r.left)*c.width/r.width+0.1,(e.clientY-r.top)*c.height/r.height+0.1);ctx.stroke();}}} onPointerMove={e=>{if(!brushActive)return;const c=e.currentTarget,ctx=c.getContext('2d'),r=c.getBoundingClientRect();if(!ctx)return;ctx.globalCompositeOperation=brushMode==='erase'?'destination-out':'source-over';ctx.lineWidth=brushSize*Math.max(c.width/r.width,c.height/r.height);ctx.lineCap='round';ctx.lineTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);ctx.stroke();}} onPointerUp={()=>setBrushActive(false)} onPointerCancel={()=>setBrushActive(false)}/></div></div><div className="flex flex-wrap gap-2"><button disabled={aiProcessing} onClick={async()=>{const targetPhoto=selected;if(!targetPhoto)return;setAiProcessing(true);setAiProgressMessage('BiRefNet मॉडल तैयार हो रहा है…');setError('');let completed=false;try{setAiProgressMessage('BiRefNet मॉडल तैयार हो रहा है…');const blob=await removeBackgroundAI(targetPhoto.src,(message)=>setAiProgressMessage(message));const url=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Could not read AI output'));reader.onerror=()=>reject(new Error('Could not read AI output'));reader.readAsDataURL(blob);});setAiCutouts(c=>({...c,[targetPhoto.id]:url}));setBackgroundRemoved(c=>({...c,[targetPhoto.id]:true}));setSelectedId(targetPhoto.id);completed=true;}catch(e){setError(e instanceof Error?e.message:'AI background removal failed.');}finally{setAiProcessing(false);setAiProgressMessage('');if(completed)setActivePanel(null);}}} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{aiProcessing?(language==='hi'?'AI मॉडल चल रहा है… कृपया प्रतीक्षा करें':'Processing AI… please wait'):(language==='hi'?'AI से बैकग्राउंड हटाएँ':'Remove Background with AI')}</button><button onClick={()=>{setBackgroundRemoved(c=>({...c,[selected.id]:false}));setAiCutouts(c=>{const n={...c};delete n[selected.id];return n;});}} className="rounded-lg border px-4 py-2 text-sm">{language==='hi'?'मूल फोटो':'Restore Original'}</button></div><p className="text-xs text-slate-500">{language==='hi'?'पहली बार मॉडल डाउनलोड होने में समय लग सकता है (लगभग 94–452 MB, डिवाइस के अनुसार)।':'पहली बार BiRefNet मॉडल डाउनलोड होगा (लगभग 94–452 MB, डिवाइस के अनुसार) और ब्राउज़र में कैश हो सकता है। अगली बार आमतौर पर दोबारा पूरा डाउनलोड नहीं करना पड़ेगा।'}</p></div>}
      {activePanel==='color'&&<div className="space-y-4"><div className="flex flex-wrap gap-2">{[{name:'White',value:'#ffffff'},{name:'Blue',value:'#1d4ed8'},{name:'Light Blue',value:'#dbeafe'},{name:'Gray',value:'#e5e7eb'},{name:'Cream',value:'#fff7ed'}].map(c=><button key={c.value} onClick={()=>setBackgroundDraft(c.value)} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><span className="h-5 w-5 rounded border border-slate-300" style={{backgroundColor:c.value}} />{c.name}</button>)}</div><label className="flex items-center gap-3 text-sm">{language==='hi'?'कस्टम रंग':'Custom color'}<input type="color" value={backgroundDraft} onChange={e=>setBackgroundDraft(e.target.value)}/></label><div className="flex justify-end"><button onClick={()=>{setBackground(backgroundDraft);setActivePanel(null);}} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white">{language==='hi'?'ओके':'OK'}</button></div></div>}
      {activePanel==='border'&&<div className="space-y-4"><label className="block text-sm">{language==='hi'?'बॉर्डर मोटाई':'Border width'}: {borderDraft}<input type="range" min="0" max="8" value={borderDraft} onChange={e=>setBorderDraft(Number(e.target.value))} className="mt-2 w-full"/></label><div className="flex justify-end gap-2"><button onClick={()=>{setBorderDraft(border);setActivePanel(null);}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">{language==='hi'?'रद्द करें':'Cancel'}</button><button onClick={()=>{setBorder(borderDraft);setActivePanel(null);}} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white">{language==='hi'?'ओके':'OK'}</button></div></div>}
      </div></div>}
    </div>
  );
};