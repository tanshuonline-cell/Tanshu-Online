import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StudioAdvancedPanel } from './StudioAdvancedPanel';
import {
  ArrowLeft, ChevronDown, Undo2, Redo2,
  MousePointer2, Crop, WandSparkles, Image as ImageIcon,
  Layers3, Palette, ZoomIn, ZoomOut, Grid2X2, PanelRightClose,
  MoreHorizontal, Check, LockKeyhole, ScanFace, Upload, X, Plus, Trash2, Printer,
  Maximize2, Minimize2,
  Move, MousePointer, Lasso, SquareDashedMousePointer, RotateCw, FlipHorizontal,
  Ruler, Paintbrush, Stamp, Eraser, Pipette, Sun, Contrast, SlidersHorizontal,
  Type, PenTool, Shapes, Hand, Download, Sparkles, ScanSearch, UserRound,
  Highlighter, Eye, CircleHelp, Blend, Wand, CircleDot, Focus, ScanLine, Search
} from 'lucide-react';
import { jsPDF } from 'jspdf';

type StudioPhoto = { id: string; file: File; url: string; width: number; height: number; kind?: 'photo'|'signature'; cropZoom?: number; positionX?: number; positionY?: number };
type StudioPreset = 'india' | 'pan' | 'stamp' | 'passport-35x35' | 'square-51' | 'oci-51' | 'pcc-35x35' | 'frro-35x35' | 'dl-35x45' | 'voter-35x45' | 'exam-35x45' | 'custom';
type StudioUnit = 'mm' | 'cm' | 'in';
type SheetMode = 'single' | '3.5x5' | '4x6' | '5x7' | '6x8' | '8x10' | 'a6' | 'a5' | 'a4' | 'a3' | 'letter' | 'legal' | 'custom';
const SHEET_PRESETS: Record<Exclude<SheetMode, 'single' | 'custom'>, { label: string; widthMm: number; heightMm: number }> = {
  '3.5x5': { label: '3.5 × 5 Sheet', widthMm: 88.9, heightMm: 127 }, '4x6': { label: '4 × 6 Sheet', widthMm: 101.6, heightMm: 152.4 },
  '5x7': { label: '5 × 7 Sheet', widthMm: 127, heightMm: 177.8 }, '6x8': { label: '6 × 8 Sheet', widthMm: 152.4, heightMm: 203.2 },
  '8x10': { label: '8 × 10 Sheet', widthMm: 203.2, heightMm: 254 }, a6: { label: 'A6 Sheet', widthMm: 105, heightMm: 148 },
  a5: { label: 'A5 Sheet', widthMm: 148, heightMm: 210 }, a4: { label: 'A4 Sheet', widthMm: 210, heightMm: 297 },
  a3: { label: 'A3 Sheet', widthMm: 297, heightMm: 420 }, letter: { label: 'Letter Sheet', widthMm: 215.9, heightMm: 279.4 },
  legal: { label: 'Legal Sheet', widthMm: 215.9, heightMm: 355.6 }
};
type SheetSlot = { id: string; photoId: string; x: number; y: number; width: number; height: number; cropZoom?: number; positionX?: number; positionY?: number; locked?: boolean; mergeSources?: SheetSlot[] };
type EditorSnapshot = { photos: StudioPhoto[]; selectedId: string; zoom: number; cropZoom: number; positionX: number; positionY: number; preset: StudioPreset; customWidthMm: number; customHeightMm: number; sizeUnit: StudioUnit; sheetMode: SheetMode; customSheetWidthMm: number; customSheetHeightMm: number; sheetCopies: number; sheetMargin: number; sheetGap: number; sheetVerticalGap: number; sheetSlots: SheetSlot[]; borderEnabled: boolean; borderWidthMm: number; borderColor: string; customBorderColor: string };
const STUDIO_PRESETS: Record<Exclude<StudioPreset, 'custom'>, { label: string; widthMm: number; heightMm: number }> = {
  india: { label: 'India Passport / General form', widthMm: 35, heightMm: 45 },
  pan: { label: 'PAN card print', widthMm: 25, heightMm: 35 },
  stamp: { label: 'Stamp Photo', widthMm: 25, heightMm: 30 },
  'passport-35x35': { label: 'Passport / Consular square', widthMm: 35, heightMm: 35 },
  'square-51': { label: '2 × 2 inch Visa photo', widthMm: 50.8, heightMm: 50.8 },
  'oci-51': { label: 'OCI card photo', widthMm: 51, heightMm: 51 },
  'pcc-35x35': { label: 'PCC / Birth certificate', widthMm: 35, heightMm: 35 },
  'frro-35x35': { label: 'FRRO / Consular form', widthMm: 35, heightMm: 35 },
  'dl-35x45': { label: 'Driving licence photo', widthMm: 35, heightMm: 45 },
  'voter-35x45': { label: 'Voter ID / Form photo', widthMm: 35, heightMm: 45 },
  'exam-35x45': { label: 'Exam form · common print', widthMm: 35, heightMm: 45 }
};
const mmToUnit = (value: number, unit: StudioUnit) => value / (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const getPatternCopyPosition = (source: SheetSlot, pageW: number, pageH: number, margin: number, gap: number, others: SheetSlot[]) => {
  const stepX = source.width + gap, stepY = source.height + gap;
  const candidates = [
    { x: source.x + stepX, y: source.y },
    { x: source.x, y: source.y + stepY },
    { x: source.x - stepX, y: source.y },
    { x: source.x, y: source.y - stepY },
  ];
  const valid = (p: {x:number;y:number}) => p.x >= 0 && p.y >= 0 && p.x + source.width <= pageW && p.y + source.height <= pageH && !others.some(o => overlapsWithCutGap({...source,...p}, o, gap));
  const found = candidates.find(valid);
  return found || getSmartSheetPosition(source.x + stepX, source.y, source, others, pageW, pageH, margin, gap);
};
const unitToMm = (value: number, unit: StudioUnit) => value * (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);

const overlapsWithCutGap = (a: SheetSlot, b: SheetSlot, gap: number) =>
  a.x < b.x + b.width + gap - 0.01 && a.x + a.width + gap > b.x + 0.01 &&
  a.y < b.y + b.height + gap - 0.01 && a.y + a.height + gap > b.y + 0.01;

const getSmartSheetPosition = (x: number, y: number, moving: SheetSlot, others: SheetSlot[], pageW: number, pageH: number, margin: number, gap: number) => {
  const maxX = Math.max(margin, pageW - margin - moving.width), maxY = Math.max(margin, pageH - margin - moving.height);
  const clamp = (value: number, max: number) => Math.max(margin, Math.min(max, value));
  const target = { ...moving, x: clamp(x, maxX), y: clamp(y, maxY) };
  const collides = (candidate: SheetSlot) => others.some(other => overlapsWithCutGap(candidate, other, gap));
  const xEdges = [margin, maxX], yEdges = [margin, maxY];
  others.forEach(other => { xEdges.push(other.x - moving.width - gap, other.x + other.width + gap); yEdges.push(other.y - moving.height - gap, other.y + other.height + gap); });
  const candidates: SheetSlot[] = [], seen = new Set<string>();
  const add = (cx: number, cy: number) => { const candidate = { ...moving, x: clamp(cx, maxX), y: clamp(cy, maxY) }; const key = candidate.x.toFixed(2)+':'+candidate.y.toFixed(2); if (!seen.has(key) && !collides(candidate)) { seen.add(key); candidates.push(candidate); } };
  xEdges.forEach(cx => yEdges.forEach(cy => add(cx, cy)));
  const stepX = moving.width + gap, stepY = moving.height + gap;
  for (let row=0; row*stepY+margin<=maxY+0.01; row++) for (let col=0; col*stepX+margin<=maxX+0.01; col++) add(margin+col*stepX,margin+row*stepY);
  const nearest = candidates.sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
  if (!nearest) return { x: target.x, y: target.y };
  const distance = Math.hypot(nearest.x-target.x,nearest.y-target.y);
  return collides(target)||distance<=4 ? {x:nearest.x,y:nearest.y} : {x:target.x,y:target.y};
};

const toolItems = [
  { icon: MousePointer2, label: 'Move', active: true },
  { icon: Crop, label: 'Crop' },
  { icon: ScanFace, label: 'Portrait' },
  { icon: WandSparkles, label: 'Retouch' },
  { icon: Palette, label: 'Background' },
  { icon: Grid2X2, label: 'Layout' },
];

const toolGroups: { id: string; label: string; icon: typeof MousePointer; tools: [string, typeof MousePointer][] }[] = [
  { id: 'selection', label: 'Move & Selection', icon: MousePointer, tools: [
    ['Move Selection', Move], ['Object Select', ScanSearch], ['Magic Select', Wand],
    ['Lasso Select', Lasso], ['Marquee Select', SquareDashedMousePointer], ['Brush Select', Paintbrush],
    ['Quick Select', MousePointer2], ['Subject Select', UserRound],
  ]},
  { id: 'transform', label: 'Crop & Transform', icon: Crop, tools: [
    ['Crop', Crop], ['Rotate', RotateCw], ['Straighten', Ruler], ['Resize', Focus],
    ['Perspective', ScanLine], ['Flip', FlipHorizontal],
  ]},
  { id: 'measure', label: 'Measurement', icon: Ruler, tools: [
    ['Ruler', Ruler], ['Measure Distance', Move], ['Color Sampler', Pipette],
  ]},
  { id: 'retouch', label: 'Retouch & Repair', icon: WandSparkles, tools: [
    ['Healing Brush', Blend], ['Spot Remover', CircleDot], ['Clone Stamp', Stamp],
    ['Red Eye Remover', Eye], ['Blur', Focus], ['Sharpen', Highlighter],
  ]},
  { id: 'painting', label: 'Painting & Background', icon: Paintbrush, tools: [
    ['Brush', Paintbrush], ['Eraser', Eraser], ['Background Eraser', Eraser],
    ['Magic Background', WandSparkles], ['Replace Background', ImageIcon], ['Gradient', Blend],
    ['Color Picker', Pipette],
  ]},
  { id: 'color', label: 'Light & Color', icon: SlidersHorizontal, tools: [
    ['Brightness', Sun], ['Contrast', Contrast], ['Exposure', Focus], ['Curves', SlidersHorizontal],
    ['Levels', Ruler], ['Saturation', Palette], ['Temperature', Sun], ['Black & White', CircleDot],
    ['Selective Color', Pipette],
  ]},
  { id: 'drawing', label: 'Drawing & Type', icon: Type, tools: [
    ['Text', Type], ['Signature', PenTool], ['Line', Move], ['Shapes', Shapes],
    ['Pen', PenTool], ['Watermark', Stamp],
  ]},
  { id: 'navigation', label: 'Navigation & History', icon: Hand, tools: [
    ['Zoom In', ZoomIn], ['Zoom Out', ZoomOut], ['Hand', Hand], ['Fit to Screen', Focus],
    ['Undo', CircleHelp], ['Redo', CircleHelp], ['Before / After', Eye], ['Reset View', RotateCw],
  ]},
  { id: 'export', label: 'Export & Print', icon: Download, tools: [
    ['Save Project', Download], ['Export JPG / PNG / WEBP', Download],
    ['Print Preview', Printer], ['Photo Size Presets', Ruler], ['4 × 6 Sheet', Grid2X2], ['A4 Layout', Grid2X2],
  ]},
  { id: 'ai', label: 'AI Studio', icon: Sparkles, tools: [
    ['AI Object Select', ScanSearch], ['Smart Face Enhance', UserRound], ['AI Skin Smooth', Sparkles],
    ['AI Color Fix', WandSparkles], ['Smart Eraser', Eraser], ['AI Background', ImageIcon],
    ['AI Photo Align', Focus], ['AI Shadow Control', Blend], ['AI Document Clean', ScanLine],
  ]},
];

const swatches = ['#F4F1EA', '#D9E2EA', '#CBD5D0', '#D9D3CB', '#AAB6C2'];

const STUDIO_DB = 'tanshu-studio-shell';
const STUDIO_STORE = 'workspace';
const STUDIO_KEY = 'active-project';
const openStudioDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(STUDIO_DB, 1);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STUDIO_STORE)) request.result.createObjectStore(STUDIO_STORE); };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not save image'));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});
const dataUrlToFile = async (data: string, name: string) => {
  const response = await fetch(data);
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || 'image/jpeg' });
};


export const AdvancedPhotoStudioShell: React.FC = () => {
  const studioRootRef = useRef<HTMLDivElement>(null);
  const [isStudioFullscreen, setIsStudioFullscreen] = useState(false);
  useEffect(() => {
    const syncFullscreenState = () => setIsStudioFullscreen(document.fullscreenElement === studioRootRef.current);
    document.addEventListener('fullscreenchange', syncFullscreenState);
    syncFullscreenState();
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);
  const toggleStudioFullscreen = async () => {
    try {
      if (document.fullscreenElement === studioRootRef.current) await document.exitFullscreen();
      else if (!document.fullscreenElement && studioRootRef.current?.requestFullscreen) await studioRootRef.current.requestFullscreen();
    } catch {
      // Keep the editor state untouched if the browser blocks fullscreen mode.
    }
  };
  const [photos, setPhotos] = useState<StudioPhoto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [zoom, setZoom] = useState(100);
  const [cropZoom, setCropZoom] = useState(100);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [preset, setPreset] = useState<StudioPreset>('india');
  const [customWidthMm, setCustomWidthMm] = useState(35);
  const [customHeightMm, setCustomHeightMm] = useState(45);
  const [sizeUnit, setSizeUnit] = useState<StudioUnit>('mm');
  const [restoreReady, setRestoreReady] = useState(false);
  const [saveState, setSaveState] = useState<'loading'|'saving'|'saved'|'error'>('loading');
  const [activeTool, setActiveTool] = useState<'Move'|'Crop'|'Portrait'|'Retouch'|'Background'|'Layout'>('Move');
  const [openToolGroup, setOpenToolGroup] = useState<string | null>(null);
  const [studioSearchQuery, setStudioSearchQuery] = useState('');
  const [studioSearchOpen, setStudioSearchOpen] = useState(false);
  const studioSearchInputRef = useRef<HTMLInputElement>(null);
  const studioSearchResults = useMemo(() => {
    const query = studioSearchQuery.trim().toLowerCase();
    if (!query) return [];
    return toolGroups.flatMap(group => group.tools
      .filter(([label]) => label.toLowerCase().includes(query) || group.label.toLowerCase().includes(query))
      .map(([label, Icon]) => ({ label, groupId: group.id, groupLabel: group.label, Icon }))
    ).slice(0, 8);
  }, [studioSearchQuery]);
  const [sheetMode, setSheetMode] = useState<SheetMode>('single');
  const [customSheetWidthMm, setCustomSheetWidthMm] = useState(102);
  const [customSheetHeightMm, setCustomSheetHeightMm] = useState(152);
  const [sheetCopies, setSheetCopies] = useState(8);
  const [sheetMargin, setSheetMargin] = useState(5);
  const [sheetGap, setSheetGap] = useState(2);
  const [sheetVerticalGap, setSheetVerticalGap] = useState(2);
  const [sheetSlots, setSheetSlots] = useState<SheetSlot[]>([]);
  const [quickPrintLayout, setQuickPrintLayout] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState('');
  const [cropDialogPosition, setCropDialogPosition] = useState({ x: 24, y: 24 });
  const [cropDialogDrag, setCropDialogDrag] = useState<{x:number;y:number;left:number;top:number}|null>(null);
  const [slotDrag, setSlotDrag] = useState<{id:string;px:number;py:number;sx:number;sy:number;group?:{id:string;x:number;y:number}[]}|null>(null);
  const [slotResize, setSlotResize] = useState<{id:string;corner:'nw'|'ne'|'sw'|'se';px:number;py:number;x:number;y:number;width:number;height:number}|null>(null);
  const [menuOpen, setMenuOpen] = useState<string|null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string|null>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  const [deleteModeEnabled, setDeleteModeEnabled] = useState(false);
  const [signaturePlacement, setSignaturePlacement] = useState<{x:number;y:number;width:number}|null>(null);
  const [signatureSelected, setSignatureSelected] = useState(false);
  const signaturePointerRef = useRef<{pointerId:number;mode:'move'|'resize';corner?:'nw'|'ne'|'sw'|'se';px:number;py:number;rect:{left:number;top:number;width:number;height:number};start:{x:number;y:number;width:number}}|null>(null);
  useEffect(() => {
    if (!signatureSelected) return;
    const confirmSignature = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) return;
      event.preventDefault();
      setSignatureSelected(false);
    };
    window.addEventListener('keydown', confirmSignature);
    return () => window.removeEventListener('keydown', confirmSignature);
  }, [signatureSelected]);
  const [canUndo, setCanUndo] = useState(false); const [canRedo, setCanRedo] = useState(false);
  const undoStackRef = useRef<EditorSnapshot[]>([]); const redoStackRef = useRef<EditorSnapshot[]>([]);
  const lastSnapshotRef = useRef<EditorSnapshot|null>(null); const applyingHistoryRef = useRef(false);
  const menuAreaRef = useRef<HTMLDivElement>(null);
  const previewStageRef = useRef<HTMLDivElement>(null);
  const [previewViewport, setPreviewViewport] = useState({ width: 0, height: 0 });
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderWidthMm, setBorderWidthMm] = useState(0.5);
  const [borderColor, setBorderColor] = useState('#000000');
  const [customBorderColor, setCustomBorderColor] = useState('#000000');
  const documentSize = useMemo(() => {
    const widthMm = preset === 'custom' ? Math.max(1, customWidthMm) : STUDIO_PRESETS[preset].widthMm;
    const heightMm = preset === 'custom' ? Math.max(1, customHeightMm) : STUDIO_PRESETS[preset].heightMm;
    return { widthMm, heightMm, widthPx: Math.round(widthMm * 300 / 25.4), heightPx: Math.round(heightMm * 300 / 25.4) };
  }, [preset, customWidthMm, customHeightMm]);
  const sheetDimensions = sheetMode === 'single' ? { widthMm: documentSize.widthMm, heightMm: documentSize.heightMm, label: 'Single Photo' } : sheetMode === 'custom' ? { widthMm: Math.max(10, customSheetWidthMm), heightMm: Math.max(10, customSheetHeightMm), label: 'Custom Sheet' } : SHEET_PRESETS[sheetMode];
  const sheetWidthPx = Math.round(sheetDimensions.widthMm * 300 / 25.4);
  const sheetHeightPx = Math.round(sheetDimensions.heightMm * 300 / 25.4);
  const previewAspectRatio = sheetDimensions.widthMm / sheetDimensions.heightMm;
  const previewPageHeight = previewViewport.height > 0
    ? Math.max(120, Math.min(552, previewViewport.height - 120, (previewViewport.width - 48) / previewAspectRatio))
    : Math.min(552, 390 / previewAspectRatio);
  const previewPageWidth = previewPageHeight * previewAspectRatio;
  const marginPx = sheetMode === 'single' ? 0 : sheetMargin * 300 / 25.4;
  const gapPx = sheetMode === 'single' ? 0 : sheetGap * 300 / 25.4;
  const sheetCols = sheetMode === 'single' ? 1 : Math.max(1, Math.floor((sheetWidthPx - marginPx * 2 + gapPx) / (documentSize.widthPx + gapPx)));
  const sheetRows = sheetMode === 'single' ? 1 : Math.max(1, Math.floor((sheetHeightPx - marginPx * 2 + gapPx) / (documentSize.heightPx + gapPx)));
  const sheetCapacity = sheetCols * sheetRows;
  const sheetAnchor = sheetSlots[0];
  const anchorX = sheetAnchor?.x ?? sheetMargin;
  const anchorY = sheetAnchor?.y ?? sheetMargin;
  const anchoredCols = Math.max(1, Math.floor((sheetDimensions.widthMm - anchorX + sheetGap) / (documentSize.widthMm + sheetGap)));
  const anchoredRows = Math.max(1, Math.floor((sheetDimensions.heightMm - anchorY + sheetGap) / (documentSize.heightMm + sheetGap)));
  const anchoredCapacity = Math.min(sheetCapacity, anchoredCols * anchoredRows);
  const visibleCopies = sheetMode === 'single' ? 1 : Math.min(sheetCopies, anchoredCapacity);
  useEffect(() => { if (sheetMode !== 'single' && sheetCopies > anchoredCapacity) setSheetCopies(anchoredCapacity); }, [sheetMode, anchoredCapacity, sheetCopies]);
  useEffect(() => {
    const element = previewStageRef.current;
    if (!element) return;
    const updateSize = () => setPreviewViewport({ width: element.clientWidth, height: element.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = previewStageRef.current;
    if (!element) return;
    const handlePreviewWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const zoomStep = (current: number) => current < 200 ? 10 : current < 500 ? 25 : 50;
      setZoom(current => Math.max(10, Math.min(1600, current + (event.deltaY < 0 ? zoomStep(current) : -zoomStep(current)))));
    };
    element.addEventListener('wheel', handlePreviewWheel, { passive: false });
    return () => element.removeEventListener('wheel', handlePreviewWheel);
  }, []);

  const uploadRef = useRef<HTMLInputElement>(null);
  const restoreFullscreenAfterUploadRef = useRef(false);
  const restoreStudioFullscreenAfterPicker = () => {
    if (!restoreFullscreenAfterUploadRef.current) return;
    if (document.fullscreenElement === studioRootRef.current) {
      restoreFullscreenAfterUploadRef.current = false;
      return;
    }
    const studioRoot = studioRootRef.current;
    if (!studioRoot?.requestFullscreen) return;
    void studioRoot.requestFullscreen().then(() => {
      restoreFullscreenAfterUploadRef.current = false;
    }).catch(() => {
      // Keep the restore request pending; the file-input change handler can retry.
    });
  };
  const openUploadPicker = () => {
    restoreFullscreenAfterUploadRef.current = document.fullscreenElement === studioRootRef.current;
    if (restoreFullscreenAfterUploadRef.current) {
      window.addEventListener('focus', restoreStudioFullscreenAfterPicker, { once: true });
    }
    uploadRef.current?.click();
  };
  const photosRef = useRef<StudioPhoto[]>([]);
  const cropDragRef = useRef<{ pointerId: number; x: number; y: number; positionX: number; positionY: number } | null>(null);
  const suppressSlotClickRef = useRef(false);
  const printablePhotos = useMemo(() => photos.filter(photo => photo.kind !== 'signature'), [photos]);
  const selected = printablePhotos.find(photo => photo.id === selectedId) || printablePhotos[0] || null;
  const signaturePhoto = photos.filter(photo=>photo.kind==='signature').slice(-1)[0] || null;
  const selectedSheetSlot = sheetSlots.find(slot => slot.id === selectedSlotId) || null;
  const activeCropZoom = sheetMode !== 'single' && selectedSheetSlot ? (selectedSheetSlot.cropZoom ?? 100) : (selected?.cropZoom ?? cropZoom);
  const activePositionX = sheetMode !== 'single' && selectedSheetSlot ? (selectedSheetSlot.positionX ?? 50) : (selected?.positionX ?? positionX);
  const activePositionY = sheetMode !== 'single' && selectedSheetSlot ? (selectedSheetSlot.positionY ?? 50) : (selected?.positionY ?? positionY);
  const updateActiveCrop = (patch: Partial<Pick<SheetSlot, 'cropZoom'|'positionX'|'positionY'>>) => {
    if (sheetMode !== 'single' && selectedSheetSlot) setSheetSlots(current => current.map(slot => slot.id === selectedSheetSlot.id ? { ...slot, ...patch } : slot));
    else if (selected) setPhotos(current => current.map(photo => photo.id === selected.id ? { ...photo, ...patch } : photo));
  };
  const detectFaceAndSuggestCrop = async () => {
    if(!selected)return;
    setFaceDetectionStatus('Detecting face…');
    let detector:any;
    try {
      const moduleUrl='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/+esm';
      const {FaceDetector,FilesetResolver}=await import(/* @vite-ignore */ moduleUrl) as any;
      const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm');
      detector=await FaceDetector.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'},runningMode:'IMAGE'});
      const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Photo could not be loaded.'));img.src=selected.url;});
      const result=detector.detect(image);const face=result.detections?.[0]?.boundingBox;
      if(!face)throw new Error('No clear face detected. Try a front-facing, well-lit photo.');
      const ratio=documentSize.widthPx/documentSize.heightPx;
      const baseWidth=Math.min(image.naturalWidth,image.naturalHeight*ratio),baseHeight=baseWidth/ratio;
      const zoom=Math.max(100,Math.min(300,(baseHeight*0.55/Math.max(1,face.height))*100));
      const sourceWidth=baseWidth/(zoom/100),sourceHeight=baseHeight/(zoom/100);
      const centerX=face.originX+face.width/2,centerY=face.originY+face.height/2;
      const maxX=Math.max(1,image.naturalWidth-sourceWidth),maxY=Math.max(1,image.naturalHeight-sourceHeight);
      const sourceX=Math.max(0,Math.min(maxX,centerX-sourceWidth/2));
      const sourceY=Math.max(0,Math.min(maxY,centerY-sourceHeight*0.42));
      updateActiveCrop({cropZoom:Math.round(zoom),positionX:Math.round(sourceX/maxX*100),positionY:Math.round(sourceY/maxY*100)});
      setFaceDetectionStatus('Face detected. Suggested passport framing applied to the selected photo only.');
    } catch(error) { setFaceDetectionStatus(error instanceof Error?error.message:'Face detection could not run.'); }
    finally { detector?.close?.(); }
  };

  const captureSnapshot = (): EditorSnapshot => ({ photos, selectedId, zoom, cropZoom, positionX, positionY, preset, customWidthMm, customHeightMm, sizeUnit, sheetMode, customSheetWidthMm, customSheetHeightMm, sheetCopies, sheetMargin, sheetGap, sheetVerticalGap, sheetSlots, borderEnabled, borderWidthMm, borderColor, customBorderColor });
  const applySnapshot = (v: EditorSnapshot) => { setPhotos(v.photos);setSelectedId(v.selectedId);setZoom(v.zoom);setCropZoom(v.cropZoom);setPositionX(v.positionX);setPositionY(v.positionY);setPreset(v.preset);setCustomWidthMm(v.customWidthMm);setCustomHeightMm(v.customHeightMm);setSizeUnit(v.sizeUnit);setSheetMode(v.sheetMode);setCustomSheetWidthMm(v.customSheetWidthMm ?? 102);setCustomSheetHeightMm(v.customSheetHeightMm ?? 152);setSheetCopies(v.sheetCopies);setSheetMargin(v.sheetMargin);setSheetGap(v.sheetGap);setSheetVerticalGap(v.sheetVerticalGap ?? 2);setSheetSlots(v.sheetSlots);setBorderEnabled(v.borderEnabled);setBorderWidthMm(v.borderWidthMm);setBorderColor(v.borderColor);setCustomBorderColor(v.customBorderColor); };
  const snapshotKey = (v: EditorSnapshot) => JSON.stringify({photos:v.photos.map(p=>p.id),zoom:v.zoom,cropZoom:v.cropZoom,positionX:v.positionX,positionY:v.positionY,preset:v.preset,customWidthMm:v.customWidthMm,customHeightMm:v.customHeightMm,sizeUnit:v.sizeUnit,sheetMode:v.sheetMode,customSheetWidthMm:v.customSheetWidthMm,customSheetHeightMm:v.customSheetHeightMm,sheetCopies:v.sheetCopies,sheetMargin:v.sheetMargin,sheetGap:v.sheetGap,sheetVerticalGap:v.sheetVerticalGap,sheetSlots:v.sheetSlots,borderEnabled:v.borderEnabled,borderWidthMm:v.borderWidthMm,borderColor:v.borderColor,customBorderColor:v.customBorderColor});
  const undo = () => { const v=undoStackRef.current.pop();if(!v)return;redoStackRef.current.push(captureSnapshot());applyingHistoryRef.current=true;applySnapshot(v);setCanUndo(undoStackRef.current.length>0);setCanRedo(true); };
  const redo = () => { const v=redoStackRef.current.pop();if(!v)return;undoStackRef.current.push(captureSnapshot());applyingHistoryRef.current=true;applySnapshot(v);setCanUndo(true);setCanRedo(redoStackRef.current.length>0); };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await openStudioDb();
        const saved = await new Promise<any>((resolve, reject) => {
          const request = db.transaction(STUDIO_STORE, 'readonly').objectStore(STUDIO_STORE).get(STUDIO_KEY);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
        db.close();
        if (!active) return;
        if (saved?.photos?.length) {
          const restored = await Promise.all(saved.photos.map(async (item: any) => {
            const file = await dataUrlToFile(item.data, item.name);
            return { id: item.id, file, url: URL.createObjectURL(file), width: item.width || 0, height: item.height || 0, cropZoom:item.cropZoom ?? 100, positionX:item.positionX ?? 50, positionY:item.positionY ?? 50 };
          }));
          if (!active) { restored.forEach(photo => URL.revokeObjectURL(photo.url)); return; }
          setPhotos(restored);
          setSelectedId(saved.selectedId || restored[0]?.id || '');
          setPreset(saved.preset || 'india');
          setCustomWidthMm(saved.customWidthMm || 35);
          setCustomHeightMm(saved.customHeightMm || 45);
          setSizeUnit(saved.sizeUnit || 'mm');
          setCropZoom(saved.cropZoom || 100);
          setPositionX(saved.positionX ?? 50);
          setPositionY(saved.positionY ?? 50);
          setSheetMode(saved.sheetMode || 'single');
          setCustomSheetWidthMm(saved.customSheetWidthMm || 102);
          setCustomSheetHeightMm(saved.customSheetHeightMm || 152);
          setSheetCopies(saved.sheetCopies || 8);
          setSheetMargin(saved.sheetMargin ?? 5);
          setSheetGap(saved.sheetGap ?? 2);
          setSheetVerticalGap(saved.sheetVerticalGap ?? 2);
          setSheetSlots(Array.isArray(saved.sheetSlots) ? saved.sheetSlots : []);
          setSignaturePlacement(saved.signaturePlacement || null);
          setBorderEnabled(saved.borderEnabled ?? false);
          setBorderWidthMm(saved.borderWidthMm ?? 0.5);
          setBorderColor(saved.borderColor || '#000000');
          setCustomBorderColor(saved.customBorderColor || '#000000');
        }
        setSaveState('saved');
      } catch { if (active) setSaveState('error'); }
      finally { if (active) setRestoreReady(true); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!restoreReady) return;
    setSaveState('saving');
    const timer = window.setTimeout(async () => {
      try {
        const storedPhotos = await Promise.all(photos.map(async photo => ({
          id: photo.id, name: photo.file.name, data: await fileToDataUrl(photo.file), width: photo.width, height: photo.height, cropZoom:photo.cropZoom, positionX:photo.positionX, positionY:photo.positionY
        })));
        const db = await openStudioDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STUDIO_STORE, 'readwrite');
          tx.objectStore(STUDIO_STORE).put({ photos: storedPhotos, selectedId, preset, customWidthMm, customHeightMm, sizeUnit, cropZoom, positionX, positionY, sheetMode, customSheetWidthMm, customSheetHeightMm, sheetCopies, sheetMargin, sheetGap, sheetVerticalGap, sheetSlots, signaturePlacement, borderEnabled, borderWidthMm, borderColor, customBorderColor, savedAt: Date.now() }, STUDIO_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
        db.close();
        setSaveState('saved');
      } catch { setSaveState('error'); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [restoreReady, photos, selectedId, preset, customWidthMm, customHeightMm, sizeUnit, cropZoom, positionX, positionY, sheetMode, customSheetWidthMm, customSheetHeightMm, sheetCopies, sheetMargin, sheetGap, sheetVerticalGap, sheetSlots, signaturePlacement, borderEnabled, borderWidthMm, borderColor]);

  useEffect(() => { if(!restoreReady)return;const current=captureSnapshot();if(!lastSnapshotRef.current){lastSnapshotRef.current=current;return;}if(applyingHistoryRef.current){applyingHistoryRef.current=false;lastSnapshotRef.current=current;return;}if(snapshotKey(current)!==snapshotKey(lastSnapshotRef.current)){undoStackRef.current.push(lastSnapshotRef.current);if(undoStackRef.current.length>60)undoStackRef.current.shift();redoStackRef.current=[];setCanUndo(true);setCanRedo(false);lastSnapshotRef.current=current;} }, [restoreReady,photos,selectedId,zoom,cropZoom,positionX,positionY,preset,customWidthMm,customHeightMm,sizeUnit,sheetMode,sheetCopies,sheetMargin,sheetGap,sheetVerticalGap,sheetSlots,borderEnabled,borderWidthMm,borderColor,customBorderColor]);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => { if(!menuOpen)return;const close=(event:PointerEvent)=>{if(event.target instanceof Node&&!menuAreaRef.current?.contains(event.target))setMenuOpen(null);};document.addEventListener('pointerdown',close,true);return()=>document.removeEventListener('pointerdown',close,true); }, [menuOpen]);
  useEffect(() => {
    if (sheetMode === 'single') return;
    const handleDeleteKey = (event: KeyboardEvent) => {
      if (event.key !== 'Delete') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName))) return;
      const ids = selectAllMode ? sheetSlots.map(slot => slot.id) : selectedSlotId ? [selectedSlotId] : [];
      if (!ids.length) return;
      event.preventDefault();
      const removedCount = sheetSlots.filter(slot => ids.includes(slot.id)).length;
      setSheetSlots(current => current.filter(slot => !ids.includes(slot.id)));
      if (removedCount) setSheetCopies(count => Math.max(0, count - removedCount));
      setSelectedSlotIds([]);
      setSelectedSlotId(null);
      setSelectAllMode(false);
    };
    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [sheetMode, selectedSlotId, selectAllMode, sheetSlots]);
  useEffect(() => {
    if (sheetMode === 'single' || !printablePhotos.length) { setSheetSlots([]); return; }
    setSheetSlots(current => {
      const count = Math.min(visibleCopies, sheetCapacity, 60);
      // Signature artwork is an overlay layer, never a printable photo slot.
      // Also discard legacy slots that may have been created from a signature layer.
      const result = current.filter(slot => printablePhotos.some(photo => photo.id === slot.photoId)).slice(0, count).map(slot => ({...slot, photoId: printablePhotos.some(p => p.id === slot.photoId) ? slot.photoId : printablePhotos[0].id}));
      const pageW = sheetDimensions.widthMm;
      
      while (result.length < count) { const i=result.length; const anchor=result[0] || {x:sheetMargin,y:sheetMargin}; const anchorCols=Math.max(1,Math.floor((pageW-anchor.x+sheetGap)/(documentSize.widthMm+sheetGap))); const col=i%anchorCols; const row=Math.floor(i/anchorCols); result.push({id:'slot-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2),photoId:printablePhotos[i%printablePhotos.length].id,x:anchor.x+col*(documentSize.widthMm+sheetGap),y:anchor.y+row*(documentSize.heightMm+sheetGap),width:documentSize.widthMm,height:documentSize.heightMm,cropZoom:100,positionX:50,positionY:50}); }
      return result;
    });
  }, [sheetMode, visibleCopies, sheetCapacity, printablePhotos, documentSize.widthMm, documentSize.heightMm, sheetMargin, sheetGap, quickPrintLayout]);
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(file => file.type.startsWith('image/'));
    const additions = accepted.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      width: 0,
      height: 0,
      cropZoom: 100,
      positionX: 50,
      positionY: 50
    }));
    if (additions.length) {
      setPhotos(current => [...current, ...additions]);
      setSelectedId(current => current || additions[0].id);
    }
    if (uploadRef.current) uploadRef.current.value = '';
    restoreStudioFullscreenAfterPicker();
  };


  const autoArrangeSheet = () => {
    if (!sheetSlots.length) return;
    const topY = Math.min(...sheetSlots.map(slot => slot.y));
    const topRow = sheetSlots.filter(slot => Math.abs(slot.y - topY) <= Math.max(1, documentSize.heightMm * 0.35)).sort((a,b) => a.x - b.x);
    const rowYs = [...new Set(sheetSlots.map(slot => Math.round(slot.y * 10) / 10))].sort((a,b) => a-b);
    const measuredSteps = rowYs.slice(1).map((value,index) => value - rowYs[index]).filter(value => value >= documentSize.heightMm);
    const rowStep = measuredSteps.length ? measuredSteps[0] : documentSize.heightMm + sheetGap;
    const anchors = topRow.length ? topRow : [sheetSlots[0]];
    const pageW = sheetDimensions.widthMm;
    const pageH = sheetDimensions.heightMm;
    setSheetSlots(current => current.map((slot,index) => {
      const anchor = anchors[index % anchors.length];
      const row = Math.floor(index / anchors.length);
      return { ...slot, x: Math.max(sheetMargin, Math.min(pageW - sheetMargin - slot.width, anchor.x)), y: Math.max(sheetMargin, Math.min(pageH - sheetMargin - slot.height, topY + row * rowStep)) };
    }));
  };

  const arrangeSheetUsingGaps = () => {
    if (!sheetSlots.length) return;
    const first = sheetSlots[0];
    const pageW = sheetDimensions.widthMm;
    const cols = Math.max(1, Math.floor((pageW - sheetMargin * 2 + sheetGap) / (first.width + sheetGap)));
    setSheetSlots(current => current.map((slot, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return { ...slot, x: Math.min(pageW - sheetMargin - slot.width, sheetMargin + col * (first.width + sheetGap)), y: Math.min(sheetDimensions.heightMm - sheetMargin - slot.height, sheetMargin + row * (first.height + sheetVerticalGap)) };
    }));
  };

  const smartCenterAndBalanceSheet = () => {
    if (!sheetSlots.length) return;
    const minX = Math.min(...sheetSlots.map(slot => slot.x));
    const minY = Math.min(...sheetSlots.map(slot => slot.y));
    const maxX = Math.max(...sheetSlots.map(slot => slot.x + slot.width));
    const maxY = Math.max(...sheetSlots.map(slot => slot.y + slot.height));
    const dx = (sheetDimensions.widthMm - sheetMargin * 2 - (maxX - minX)) / 2 - minX;
    const dy = (sheetDimensions.heightMm - sheetMargin * 2 - (maxY - minY)) / 2 - minY;
    setSheetSlots(current => current.map(slot => ({ ...slot, x: Math.max(sheetMargin, Math.min(sheetDimensions.widthMm - sheetMargin - slot.width, slot.x + dx)), y: Math.max(sheetMargin, Math.min(sheetDimensions.heightMm - sheetMargin - slot.height, slot.y + dy)) })));
  };

  const mergeSheetPhotos = async (mergeAll = false) => {
    const chosenIds = mergeAll ? sheetSlots.map(slot => slot.id) : selectedSlotIds;
    const chosen = sheetSlots.filter(slot => chosenIds.includes(slot.id));
    if (chosen.length < 2) return;
    const left = Math.min(...chosen.map(slot => slot.x)), top = Math.min(...chosen.map(slot => slot.y));
    const right = Math.max(...chosen.map(slot => slot.x + slot.width)), bottom = Math.max(...chosen.map(slot => slot.y + slot.height));
    const scale = 300 / 25.4, canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((right-left)*scale)); canvas.height = Math.max(1, Math.round((bottom-top)*scale));
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    for (const slot of chosen) {
      const photo = photos.find(item => item.id === slot.photoId); if (!photo) continue;
      const image = await new Promise<HTMLImageElement>((resolve,reject) => { const img = new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('A photo could not be loaded for merging.')); img.src=photo.url; });
      const ratio=documentSize.widthPx/documentSize.heightPx, baseWidth=Math.min(image.naturalWidth,image.naturalHeight*ratio), baseHeight=baseWidth/ratio;
      const cropScale=Math.max(1,(slot.cropZoom ?? 100)/100), sourceWidth=baseWidth/cropScale, sourceHeight=baseHeight/cropScale;
      const sourceX=Math.max(0,Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*(slot.positionX ?? 50)/100));
      const sourceY=Math.max(0,Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*(slot.positionY ?? 50)/100));
      const dx=(slot.x-left)*scale, dy=(slot.y-top)*scale, dw=slot.width*scale, dh=slot.height*scale;
      if (photo?.kind === 'signature') { const fit=Math.min(dw/image.naturalWidth,dh/image.naturalHeight); const fitW=image.naturalWidth*fit,fitH=image.naturalHeight*fit; ctx.drawImage(image,dx+(dw-fitW)/2,dy+(dh-fitH)/2,fitW,fitH); } else { ctx.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,dx,dy,dw,dh); }
      if(borderEnabled&&borderWidthMm>0){ctx.save();ctx.strokeStyle=borderColor;ctx.lineWidth=borderWidthMm*scale;ctx.strokeRect(dx+ctx.lineWidth/2,dy+ctx.lineWidth/2,Math.max(0,dw-ctx.lineWidth),Math.max(0,dh-ctx.lineWidth));ctx.restore();}
    }
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Merged image export failed.')),'image/png'));
    const file=new File([blob],'tanshu-studio-merged.png',{type:'image/png'});
    const photo={id:'merged-'+Date.now()+'-'+Math.random().toString(36).slice(2),file,url:URL.createObjectURL(file),width:canvas.width,height:canvas.height};
    const mergedSlot:SheetSlot={id:'slot-merged-'+Date.now(),photoId:photo.id,x:left,y:top,width:right-left,height:bottom-top,mergeSources:chosen.map(slot=>({...slot,mergeSources:undefined}))};
    setPhotos(current=>[...current,photo]); setSheetSlots(current=>[...current.filter(slot=>!chosenIds.includes(slot.id)),mergedSlot]);
    setSheetCopies(current=>Math.max(1,current-chosen.length+1)); setSelectedId(photo.id); setSelectedSlotId(mergedSlot.id); setSelectedSlotIds([mergedSlot.id]);
  };


  const unmergeSelectedSlot = () => {
    const merged = sheetSlots.find(slot => slot.id === selectedSlotId);
    if (!merged?.mergeSources?.length) return;
    const restored = merged.mergeSources.map(slot => ({...slot, mergeSources: undefined}));
    setSheetSlots(current => [...current.filter(slot => slot.id !== merged.id), ...restored]);
    setSheetCopies(current => Math.min(60, sheetCapacity, Math.max(0, current - 1 + restored.length)));
    setSelectedSlotId(restored[0]?.id || null);
    setSelectedSlotIds(restored.map(slot => slot.id));
    const firstPhotoId = restored[0]?.photoId;
    if (firstPhotoId) setSelectedId(firstPhotoId);
    setPhotos(current => current.filter(photo => photo.id !== merged.photoId));
  };

  const duplicateSelectedRow = () => {
    const source = sheetSlots.find(slot => slot.id === selectedSlotId); if (!source) return;
    const row = sheetSlots.filter(slot => Math.abs(slot.y-source.y) <= Math.max(1,documentSize.heightMm*0.35)).sort((a,b)=>a.x-b.x);
    const room = Math.min(anchoredCapacity-sheetSlots.length,60-sheetSlots.length); if (room <= 0) return;
    const pageW=sheetDimensions.widthMm, pageH=sheetDimensions.heightMm;
    const additions:SheetSlot[]=[];
    for (const item of row.slice(0,room)) {
      const position=getSmartSheetPosition(item.x,item.y+item.height+sheetGap,item,[...sheetSlots,...additions],pageW,pageH,sheetMargin,sheetGap);
      additions.push({...item,id:'slot-row-copy-'+Date.now()+'-'+Math.random().toString(36).slice(2),...position,locked:false});
    }
    if (!additions.length) return;
    setSheetSlots(current=>[...current,...additions]); setSheetCopies(current=>Math.min(60,sheetCapacity,current+additions.length));
    setSelectedSlotId(additions[0].id); setSelectedSlotIds(additions.map(item=>item.id));
  };
  const deleteSelectedRow = () => {
    const source=sheetSlots.find(slot=>slot.id===selectedSlotId); if(!source)return;
    const rowIds=sheetSlots.filter(slot=>Math.abs(slot.y-source.y)<=Math.max(1,documentSize.heightMm*0.35)).map(slot=>slot.id);
    setSheetSlots(current=>current.filter(slot=>!rowIds.includes(slot.id))); setSheetCopies(current=>Math.max(0,current-rowIds.length));
    setSelectedSlotIds(current=>current.filter(id=>!rowIds.includes(id))); setSelectedSlotId(null);
  };
  const toggleSelectedSlotsLock = () => {
    const ids=selectedSlotIds.length?selectedSlotIds:selectedSlotId?[selectedSlotId]:[]; if(!ids.length)return;
    const shouldLock=!sheetSlots.filter(slot=>ids.includes(slot.id)).every(slot=>slot.locked);
    setSheetSlots(current=>current.map(slot=>ids.includes(slot.id)?{...slot,locked:shouldLock}:slot));
  };

  const duplicateSelectedSlot = () => {
    const source = sheetSlots.find(slot => slot.id === selectedSlotId);
    if (!source || sheetSlots.length >= anchoredCapacity || sheetSlots.length >= 60) return;
    const pageW = sheetDimensions.widthMm;
    const pageH = sheetDimensions.heightMm;
    const position = getPatternCopyPosition(source, pageW, pageH, sheetMargin, sheetGap, sheetSlots.filter(slot => slot.id !== source.id));
    const copy = { ...source, id: 'slot-copy-' + Date.now() + '-' + Math.random().toString(36).slice(2), ...position };
    setSheetSlots(current => [...current, copy]);
    setSheetCopies(current => Math.min(60, sheetCapacity, current + 1));
    setSelectedSlotId(copy.id); setSelectedSlotIds([copy.id]);
  };

  const handleSheetKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    const ids = selectedSlotIds.length ? selectedSlotIds : selectedSlotId ? [selectedSlotId] : [];
    if (!ids.length) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : event.altKey ? 0.2 : 1;
    const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
    const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
    const pageW = sheetDimensions.widthMm;
    const pageH = sheetDimensions.heightMm;
    setSheetSlots(current => current.map(slot => ids.includes(slot.id) ? {
      ...slot,
      x: Math.max(sheetMargin, Math.min(pageW - sheetMargin - slot.width, slot.x + dx)),
      y: Math.max(sheetMargin, Math.min(pageH - sheetMargin - slot.height, slot.y + dy))
    } : slot));
  };

  const removeLayer = (layerId: string) => {
    const removed = photos.find(photo => photo.id === layerId);
    if (!removed) return;
    setPhotos(current => current.filter(photo => photo.id !== layerId));
    setSheetSlots(current => current.filter(slot => slot.photoId !== layerId));
    if (selectedId === layerId) {
      const nextPhoto = photos.find(photo => photo.id !== layerId && photo.kind !== 'signature');
      setSelectedId(nextPhoto?.id || '');
    }
    if (removed.kind === 'signature') {
      setSignatureSelected(false);
      const remainingSignature = photos.some(photo => photo.id !== layerId && photo.kind === 'signature');
      if (!remainingSignature) setSignaturePlacement(null);
    }
  };

  const removeSelected = () => {
    if (selected) removeLayer(selected.id);
  };

  const applyProcessedImage = (blob: Blob, suffix: string, sourceId?: string) => {
    const source = photos.find(photo => photo.id === sourceId) || selected;
    if (!source) return;
    const extension = blob.type === 'image/png' ? 'png' : 'jpg';
    const file = new File([blob], source.file.name.replace(/\\.[^.]+$/, '') + '-' + suffix + '.' + extension, { type: blob.type || 'image/jpeg' });
    const url = URL.createObjectURL(file);
    const processedLayer: StudioPhoto = {
      // Keep the same layer identity for a signature so the cleaned cutout replaces
      // the uploaded artwork instead of leaving an older/original signature on top.
      id: source.kind === 'signature' ? source.id : `processed-${suffix}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url,
      width: 0,
      height: 0,
      kind: source.kind || 'photo',
      cropZoom: 100,
      positionX: 50,
      positionY: 50
    };
    const processedImage = new Image();
    processedImage.onload = () => {
      setPhotos(current => current.map(photo => photo.id === processedLayer.id
        ? { ...photo, width: processedImage.naturalWidth, height: processedImage.naturalHeight }
        : photo));
    };
    processedImage.onerror = () => {
      if (source.kind === 'signature') setSignatureSelected(false);
    };
    processedImage.src = url;
    if (source.kind === 'signature') {
      setPhotos(current => current.map(photo => photo.id === source.id ? processedLayer : photo));
      // Keep the cleaned signature in its layer; the user places it by dragging the layer onto the preview.
    } else {
      setPhotos(current => [...current, processedLayer]);
      // When a sheet slot already uses this photo, point that slot at the processed layer
      // so the cleaned/edited result appears on the 4x6, A4, or other print-sheet preview.
      setSheetSlots(current => current.map(slot => slot.photoId === source.id
        ? { ...slot, photoId: processedLayer.id }
        : slot));
      setSelectedId(processedLayer.id);
    }
  };

  const addSignatureLayer = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const layer: StudioPhoto = { id: `signature-${Date.now()}-${Math.random().toString(36).slice(2)}`, file, url, width: 0, height: 0, kind: 'signature', cropZoom: 100, positionX: 50, positionY: 50 };
    const image = new Image(); image.onload = () => setPhotos(current => current.map(item => item.id === layer.id ? { ...item, width: image.naturalWidth, height: image.naturalHeight } : item)); image.src = url;
    setPhotos(current => [...current.filter(item=>item.kind!=='signature'), layer]);
    setSignaturePlacement(null);setSignatureSelected(false);
  };

  const updateDimensions = (id: string, width: number, height: number) => {
    setPhotos(current => current.map(photo => photo.id === id ? { ...photo, width, height } : photo));
  };

  const exportPrintSheet = async (format: 'jpg'|'png'|'pdf') => {
    if (!selected) return;
    const canvas = document.createElement('canvas'); canvas.width = sheetWidthPx; canvas.height = sheetHeightPx;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sourcePhotos = printablePhotos.length ? printablePhotos : [selected];
    const images = await Promise.all(sourcePhotos.map(photo => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('A photo could not be loaded for sheet export.')); image.src = photo.url; })));
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const slots: SheetSlot[] = sheetMode === 'single' ? [{id:'single-export',photoId:selected.id,x:0,y:0,width:documentSize.widthMm,height:documentSize.heightMm,cropZoom:selected.cropZoom??cropZoom,positionX:selected.positionX??positionX,positionY:selected.positionY??positionY}] : sheetSlots.filter(slot => sourcePhotos.some(photo => photo.id === slot.photoId));
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const image = images[Math.max(0, sourcePhotos.findIndex(photo => photo.id === slot.photoId))] || images[0];
      const ratio = documentSize.widthPx / documentSize.heightPx;
      const baseWidth = Math.min(image.naturalWidth, image.naturalHeight * ratio), baseHeight = baseWidth / ratio;
      const scale = Math.max(1, (slot.cropZoom ?? 100) / 100), sourceWidth = baseWidth / scale, sourceHeight = baseHeight / scale;
      const sourceX = Math.max(0, Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*(slot.positionX ?? 50)/100));
      const sourceY = Math.max(0, Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*(slot.positionY ?? 50)/100));
      const destX=slot.x*300/25.4, destY=slot.y*300/25.4, destW=slot.width*300/25.4, destH=slot.height*300/25.4;
      if (sourcePhotos.find(photo => photo.id === slot.photoId)?.kind === 'signature') { const scale = Math.min(destW / image.naturalWidth, destH / image.naturalHeight); const drawW = image.naturalWidth * scale, drawH = image.naturalHeight * scale; ctx.drawImage(image, destX + (destW - drawW) / 2, destY + (destH - drawH) / 2, drawW, drawH); } else { ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destW, destH); }
      if(signaturePhoto&&signaturePlacement&&sourcePhotos.find(photo=>photo.id===slot.photoId)?.kind!=='signature'){const sig=images[sourcePhotos.findIndex(photo=>photo.id===signaturePhoto.id)];if(sig){const sigW=signaturePlacement.width*destW,sigH=sigW*sig.naturalHeight/sig.naturalWidth;ctx.drawImage(sig,destX+signaturePlacement.x*destW,destY+signaturePlacement.y*destH,sigW,sigH);}} if (borderEnabled && borderWidthMm > 0) { ctx.save(); ctx.strokeStyle=borderColor; ctx.lineWidth=borderWidthMm*300/25.4; ctx.strokeRect(destX+ctx.lineWidth/2,destY+ctx.lineWidth/2,Math.max(0,destW-ctx.lineWidth),Math.max(0,destH-ctx.lineWidth)); ctx.restore(); }
    }

    const baseName = selected.file.name.replace(/\\.[^.]+$/, '') + `-${sheetMode}-print`;
    if (format === 'pdf') { const doc = new jsPDF({orientation:'portrait', unit:'mm', format:[sheetDimensions.widthMm, sheetDimensions.heightMm] as any}); doc.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,sheetDimensions.widthMm,sheetDimensions.heightMm); doc.save(baseName+'.pdf'); return; }
    const mime = format === 'png' ? 'image/png' : 'image/jpeg'; const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Sheet export failed.')),mime,0.96)); const url=URL.createObjectURL(blob), anchor=document.createElement('a'); anchor.href=url; anchor.download=baseName+(format==='png'?'.png':'.jpg'); anchor.click(); window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  const printActualSize = async () => {
    if(!selected)return;
    const printWindow=window.open('','_blank','width=900,height=700');
    if(!printWindow){window.alert('Please allow pop-ups to print at actual size.');return;}
    try {
      const canvas=document.createElement('canvas');canvas.width=sheetWidthPx;canvas.height=sheetHeightPx;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Print canvas is unavailable.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
      const sourcePhotos=printablePhotos.length?printablePhotos:[selected];
      const images=await Promise.all(sourcePhotos.map(photo=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('A photo could not be loaded for printing.'));image.src=photo.url;})));
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const slots:SheetSlot[]=sheetMode==='single'?[{id:'print-single',photoId:selected.id,x:0,y:0,width:documentSize.widthMm,height:documentSize.heightMm,cropZoom:selected.cropZoom??cropZoom,positionX:selected.positionX??positionX,positionY:selected.positionY??positionY}]:sheetSlots.filter(slot=>sourcePhotos.some(photo=>photo.id===slot.photoId));
      for(const slot of slots){
        const photo=sourcePhotos.find(item=>item.id===slot.photoId);const image=images[Math.max(0,sourcePhotos.findIndex(item=>item.id===slot.photoId))]||images[0];if(!image)continue;
        const ratio=documentSize.widthPx/documentSize.heightPx,baseWidth=Math.min(image.naturalWidth,image.naturalHeight*ratio),baseHeight=baseWidth/ratio;
        const scale=Math.max(1,(slot.cropZoom??100)/100),sourceWidth=baseWidth/scale,sourceHeight=baseHeight/scale;
        const sourceX=Math.max(0,Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*(slot.positionX??50)/100));
        const sourceY=Math.max(0,Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*(slot.positionY??50)/100));
        const dx=slot.x*300/25.4,dy=slot.y*300/25.4,dw=slot.width*300/25.4,dh=slot.height*300/25.4;
        if (photo.kind === 'signature') { const scale = Math.min(dw / image.naturalWidth, dh / image.naturalHeight); const drawW = image.naturalWidth * scale, drawH = image.naturalHeight * scale; ctx.drawImage(image, dx + (dw - drawW) / 2, dy + (dh - drawH) / 2, drawW, drawH); } else { ctx.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,dx,dy,dw,dh); }
        if(signaturePhoto&&signaturePlacement&&photo?.kind!=='signature'){const sig=images[sourcePhotos.findIndex(item=>item.id===signaturePhoto.id)];if(sig){const sigW=signaturePlacement.width*dw,sigH=sigW*sig.naturalHeight/sig.naturalWidth;ctx.drawImage(sig,dx+signaturePlacement.x*dw,dy+signaturePlacement.y*dh,sigW,sigH);}} if(borderEnabled&&borderWidthMm>0){ctx.save();ctx.strokeStyle=borderColor;ctx.lineWidth=borderWidthMm*300/25.4;ctx.strokeRect(dx+ctx.lineWidth/2,dy+ctx.lineWidth/2,Math.max(0,dw-ctx.lineWidth),Math.max(0,dh-ctx.lineWidth));ctx.restore();}
      }

      const pageW=sheetDimensions.widthMm;
      const pageH=sheetDimensions.heightMm;
      const pageSize=`${pageW}mm ${pageH}mm`;
      const dataUrl=canvas.toDataURL('image/png');
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><title>TANSHU STUDIO · Actual Size Print</title><style>@page{size:${pageSize};margin:0}html,body{width:${pageW}mm;height:${pageH}mm;margin:0;padding:0;overflow:hidden}img{display:block;width:${pageW}mm;height:${pageH}mm;object-fit:fill}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body><img src="${dataUrl}" alt="Actual size print sheet" onload="window.focus();window.print()"></body></html>`);
      printWindow.document.close();
    } catch(error){printWindow.close();window.alert(error instanceof Error?error.message:'Could not prepare the print sheet.');}
  };

  const exportSelectedPhoto = async (format: 'jpg'|'png'|'pdf') => {
    if (!selected) return;
    const image = new Image();
    image.src = selected.url;
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Photo could not be loaded for export.')); });
    const output = document.createElement('canvas');
    output.width = documentSize.widthPx; output.height = documentSize.heightPx;
    const context = output.getContext('2d'); if (!context) return;
    const ratio = output.width / output.height;
    const baseWidth = Math.min(image.naturalWidth, image.naturalHeight * ratio);
    const baseHeight = baseWidth / ratio;
    const scale = Math.max(1, (selected.cropZoom ?? cropZoom) / 100);
    const sourceWidth = baseWidth / scale, sourceHeight = baseHeight / scale;
    const sourceX = Math.max(0, Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*(selected.positionX ?? positionX)/100));
    const sourceY = Math.max(0, Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*(selected.positionY ?? positionY)/100));
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    if (format !== 'png') { context.fillStyle='#fff'; context.fillRect(0,0,output.width,output.height); }
    if (selected.kind === 'signature') { const fit=Math.min(output.width/image.naturalWidth,output.height/image.naturalHeight); const fitW=image.naturalWidth*fit,fitH=image.naturalHeight*fit; context.drawImage(image,(output.width-fitW)/2,(output.height-fitH)/2,fitW,fitH); } else { context.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,0,0,output.width,output.height); }
    if(signaturePhoto&&signaturePlacement){const sig=new Image();sig.src=signaturePhoto.url;await new Promise<void>((resolve,reject)=>{sig.onload=()=>resolve();sig.onerror=()=>reject(new Error('Signature could not be loaded for export.'));});const dw=signaturePlacement.width*output.width,dh=dw*sig.naturalHeight/sig.naturalWidth;context.drawImage(sig,signaturePlacement.x*output.width,signaturePlacement.y*output.height,dw,dh);}
    if (borderEnabled && borderWidthMm > 0) { context.save(); context.strokeStyle = borderColor; context.lineWidth = borderWidthMm * 300 / 25.4; context.strokeRect(context.lineWidth / 2, context.lineWidth / 2, Math.max(0, output.width - context.lineWidth), Math.max(0, output.height - context.lineWidth)); context.restore(); }
    const baseName = selected.file.name.replace(/\\.[^.]+$/, '') + '-tanshu-studio';
    if (format === 'pdf') {
      const doc = new jsPDF({orientation:documentSize.widthMm>documentSize.heightMm?'landscape':'portrait',unit:'mm',format:[documentSize.widthMm,documentSize.heightMm]});
      doc.addImage(output.toDataURL('image/jpeg',0.96),'JPEG',0,0,documentSize.widthMm,documentSize.heightMm);
      doc.save(baseName+'.pdf'); return;
    }
    const mime = format==='png'?'image/png':'image/jpeg';
    const blob = await new Promise<Blob>((resolve,reject)=>output.toBlob(value=>value?resolve(value):reject(new Error('Image export failed.')),mime,0.96));
    const url=URL.createObjectURL(blob), anchor=document.createElement('a');
    anchor.href=url; anchor.download=baseName+(format==='png'?'.png':'.jpg'); anchor.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  const handleSignatureDrop = (event: React.DragEvent<HTMLDivElement>, pageWidthMm:number, pageHeightMm:number) => {
    const layerId = event.dataTransfer.getData('application/x-tanshu-signature-layer');
    if (!layerId || !signaturePhoto || signaturePhoto.id !== layerId || !signaturePhoto.width || !signaturePhoto.height) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = signaturePlacement?.width ?? 0.32;
    const height = width * pageWidthMm * (signaturePhoto.height / signaturePhoto.width) / pageHeightMm;
    const pointerX = (event.clientX - rect.left) / Math.max(1, rect.width);
    const pointerY = (event.clientY - rect.top) / Math.max(1, rect.height);
    setSignaturePlacement({
      x: Math.max(0, Math.min(1 - width, pointerX - width / 2)),
      y: Math.max(0, Math.min(1 - height, pointerY - height / 2)),
      width
    });
    setSignatureSelected(true);
  };

  const renderSignatureOverlay = (pageWidthMm:number,pageHeightMm:number,showControls = true,onSelect?:()=>void) => {
    if(!signaturePhoto || !signaturePlacement || !signaturePhoto.width || !signaturePhoto.height) return null;
    const aspect=signaturePhoto.height/signaturePhoto.width;
    const heightForWidth=(width:number)=>width*pageWidthMm*aspect/pageHeightMm;
    const updatePointer=(event:React.PointerEvent<HTMLDivElement>)=>{
      const drag=signaturePointerRef.current;
      if(!drag||drag.pointerId!==event.pointerId)return;
      const dx=(event.clientX-drag.px)/Math.max(1,drag.rect.width);
      const dy=(event.clientY-drag.py)/Math.max(1,drag.rect.height);
      if(drag.mode==='move'){
        const height=heightForWidth(drag.start.width);
        setSignaturePlacement({x:Math.max(0,Math.min(1-drag.start.width,drag.start.x+dx)),y:Math.max(0,Math.min(1-height,drag.start.y+dy)),width:drag.start.width});
        return;
      }
      const corner=drag.corner||'se';
      const startHeight=heightForWidth(drag.start.width);
      // Combine both pointer axes so diagonal resizing stays proportional without sudden jumps.
      const horizontal=(corner.endsWith('w')?-dx:dx);
      const vertical=(corner.startsWith('n')?-dy:dy)*pageHeightMm/(pageWidthMm*aspect);
      const anchorX=corner.endsWith('w')?drag.start.x+drag.start.width:drag.start.x;
      const anchorY=corner.startsWith('n')?drag.start.y+startHeight:drag.start.y;
      const maxWidth=Math.max(0.025,Math.min(0.9,corner.endsWith('w')?anchorX:1-anchorX,(corner.startsWith('n')?anchorY:1-anchorY)*pageHeightMm/(pageWidthMm*aspect)));
      const width=Math.max(0.025,Math.min(maxWidth,drag.start.width+(horizontal+vertical)/2));
      const height=heightForWidth(width);
      const x=corner.endsWith('w')?anchorX-width:anchorX;
      const y=corner.startsWith('n')?anchorY-height:anchorY;
      setSignaturePlacement({x,y,width});
    };
    const beginPointer=(event:React.PointerEvent<HTMLDivElement>,mode:'move'|'resize',corner?:'nw'|'ne'|'sw'|'se')=>{
      event.preventDefault();
      event.stopPropagation();
      const page=event.currentTarget.parentElement;
      if(!page)return;
      const rect=page.getBoundingClientRect();
      setSignatureSelected(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      signaturePointerRef.current={pointerId:event.pointerId,mode,corner,px:event.clientX,py:event.clientY,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},start:{...signaturePlacement}};
    };
    return <div onClick={event=>{event.stopPropagation();setSignatureSelected(true);onSelect?.();}} onPointerDown={event=>beginPointer(event,'move')} onPointerMove={updatePointer} onPointerUp={event=>{signaturePointerRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{signaturePointerRef.current=null;}} className="absolute z-40 cursor-move select-none" style={{left:(signaturePlacement.x*100)+'%',top:(signaturePlacement.y*100)+'%',width:(signaturePlacement.width*100)+'%',height:(heightForWidth(signaturePlacement.width)*100)+'%',touchAction:'none',outline:signatureSelected&&showControls?'2px solid #2684FF':'none',outlineOffset:'2px'}}>
      <img src={signaturePhoto.url} alt="Signature overlay" draggable={false} className="pointer-events-none h-full w-full object-fill"/>
      {signatureSelected&&showControls&&(['nw','ne','sw','se'] as const).map(corner=><button key={corner} type="button" aria-label={'Resize signature '+corner} onPointerDown={event=>{event.preventDefault();event.stopPropagation();const overlay=event.currentTarget.parentElement as HTMLDivElement;const page=overlay.parentElement; if(!page)return;const rect=page.getBoundingClientRect();overlay.setPointerCapture(event.pointerId);signaturePointerRef.current={pointerId:event.pointerId,mode:'resize',corner,px:event.clientX,py:event.clientY,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},start:{...signaturePlacement}};}} className={'absolute z-50 h-3.5 w-3.5 rounded-sm border border-blue-900 bg-white shadow '+(corner==='nw'?'left-[-7px] top-[-7px]':corner==='ne'?'right-[-7px] top-[-7px]':corner==='sw'?'bottom-[-7px] left-[-7px]':'bottom-[-7px] right-[-7px]')}/>)}
      {signatureSelected&&showControls&&<button type="button" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();setSignatureSelected(false);}} className="absolute left-1/2 top-full z-[60] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1677D2] px-4 py-1.5 text-[11px] font-semibold text-white shadow-lg ring-2 ring-white/80 hover:bg-[#2589E8]">OK · Enter</button>}
    </div>;
  };

  return (
    <div ref={studioRootRef} className="studio-root h-screen overflow-hidden bg-[#101214] text-[#D9DDE1] font-sans antialiased">
      <style>{`
        .studio-root:fullscreen { width:100vw; height:100vh; background:#101214; }
        .studio-shell * { box-sizing: border-box; }
        .studio-shell { min-width: 1100px; height:100%; }
        .studio-panel { background:#181B1F; border:1px solid #302C27; }
        .studio-muted { color:#96918A; }
        .studio-line { border-color:#302C27; }
        .studio-control { border:1px solid #40382F; background:#211F1C; color:#DED7CC; border-radius:7px; transition:background-color .2s,border-color .2s,color .2s,box-shadow .2s; }
        .studio-control:hover { background-color:#30271E; border-color:#8A6238; color:#FFF2DE; box-shadow:0 0 0 1px rgba(202,143,70,.12),0 4px 18px rgba(190,125,48,.09); }
        .studio-shell button:not(:disabled) { transition:background-color .2s,border-color .2s,color .2s,box-shadow .2s,transform .2s; }
        .studio-shell button:not(:disabled):hover { background-image:radial-gradient(circle at 50% 50%,rgba(229,170,91,.17) 0%,rgba(229,170,91,.07) 34%,transparent 72%); background-size:180% 180%; animation:studio-water-ripple .72s ease-out; }
        .studio-shell button:not(:disabled):active { transform:translateY(1px); }
        .studio-shell button:focus-visible,.studio-shell input:focus-visible,.studio-shell select:focus-visible { outline:2px solid rgba(211,151,75,.72); outline-offset:2px; }
        .studio-shell .studio-photo-resize-handle:hover { background-image:none; animation:none; background-color:rgba(201,149,85,.10); box-shadow:0 0 10px rgba(201,149,85,.18); }
        .studio-shell .studio-photo-resize-handle:focus-visible { outline:none; }
        .studio-shell input[type="checkbox"] { accent-color:#C8893E; cursor:pointer; }
        .studio-shell #studio-delete-mode { accent-color:#A94736; }
        .studio-tool-button[data-tool="move"] svg { color:#78C8E8; }
        .studio-tool-button[data-tool="crop"] svg { color:#A6A4F4; }
        .studio-tool-button[data-tool="portrait"] svg { color:#D99BCB; }
        .studio-tool-button[data-tool="retouch"] svg { color:#E8B65F; }
        .studio-tool-button[data-tool="background"] svg { color:#83C69B; }
        .studio-tool-button[data-tool="layout"] svg { color:#69C9C4; }
        .studio-tool-button[data-tool="move"].is-active { background:rgba(79,157,190,.16); color:#D8F3FF; box-shadow:inset 0 0 0 1px rgba(105,190,220,.3); }
        .studio-tool-button[data-tool="crop"].is-active { background:rgba(126,116,207,.16); color:#E3E0FF; box-shadow:inset 0 0 0 1px rgba(154,145,230,.3); }
        .studio-tool-button[data-tool="portrait"].is-active { background:rgba(180,104,158,.16); color:#FFE5F5; box-shadow:inset 0 0 0 1px rgba(208,139,185,.3); }
        .studio-tool-button[data-tool="retouch"].is-active { background:rgba(190,137,52,.17); color:#FFEBC5; box-shadow:inset 0 0 0 1px rgba(220,169,91,.3); }
        .studio-tool-button[data-tool="background"].is-active { background:rgba(75,145,99,.17); color:#DFFFE7; box-shadow:inset 0 0 0 1px rgba(119,190,139,.3); }
        .studio-tool-button[data-tool="layout"].is-active { background:rgba(55,147,145,.17); color:#D8FFFC; box-shadow:inset 0 0 0 1px rgba(101,195,190,.3); }
        .studio-tool-group svg { color:#C99A60; }
        .studio-tool-group.is-expanded { background:rgba(191,133,65,.14); color:#F5D7AD; box-shadow:inset 0 0 0 1px rgba(201,145,76,.28); }
        @keyframes studio-water-ripple { 0% { background-size:45% 45%; } 100% { background-size:180% 180%; } }
        @media (prefers-reduced-motion:reduce) { .studio-shell *, .studio-shell *::before, .studio-shell *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; } }
        .studio-stage {
          background-color:#202429;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:24px 24px;
        }
        .studio-photo-placeholder {
          background:linear-gradient(145deg,#D9DDE0 0%,#BFC8CF 52%,#AAB5BE 100%);
          box-shadow:0 22px 70px rgba(0,0,0,.35);
        }
        .studio-avatar { background:linear-gradient(180deg,#E8D8C6 0%,#C8B19B 100%); }
        .studio-hair { background:#55504B; }
        .studio-accent { color:#B6C0CA; }
        .studio-trash-lid { transform-origin: right bottom; }
        .group:hover .studio-trash-lid, .group:focus-visible .studio-trash-lid { transform: rotate(-58deg) translate(-3px,-4px) scaleX(1.12); }
      `}</style>
      <div className="studio-shell flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b studio-line bg-[#171A1D] px-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg"
              alt="Tanshu Online profile"
              className="h-9 w-9 shrink-0 rounded-full border-2 border-blue-500/70 object-cover object-center shadow-sm"
              loading="eager"
            />
            <div>
              <div className="text-[13px] font-semibold tracking-wide text-[#E4E7EA]">TANSHU STUDIO</div>
              <div className="text-[10px] tracking-[.16em] studio-muted">PHOTO, EDITING & PASSPORT STUDIO</div>
            </div>
          </div>
          <div className="relative mx-5 flex min-w-0 flex-1 justify-center">
            <form onSubmit={event => { event.preventDefault(); setStudioSearchOpen(true); }} className="flex h-7 w-full max-w-[340px] items-center gap-2 rounded-full border border-[#3A424A] bg-[#20252A] px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,.22),0_2px_10px_rgba(0,0,0,.12)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#C99555] focus-within:shadow-[0_2px_12px_rgba(201,149,85,.08)]">
              <Search size={13} className="shrink-0 text-[#9DAAB6]" />
              <input ref={studioSearchInputRef} value={studioSearchQuery} onChange={event => { setStudioSearchQuery(event.target.value); setStudioSearchOpen(true); }} onFocus={() => { if (studioSearchQuery) setStudioSearchOpen(true); }} placeholder="Search tools, text, fonts..." aria-label="Search studio tools, text and fonts" className="h-full min-w-0 flex-1 bg-transparent text-[10px] text-[#E0E5EA] outline-none placeholder:text-[#7F8993]" />
              <button type="submit" aria-label="Search" title="Search" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#B8C4CE] transition hover:bg-[#35404A] hover:text-white"><Search size={12}/></button>
            </form>
            {studioSearchOpen && studioSearchQuery.trim() && <div className="absolute left-1/2 top-9 z-[80] w-full max-w-[340px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#3A424A] bg-[#20252A] shadow-[0_16px_42px_rgba(0,0,0,.48)]">
              <div className="flex items-center justify-between border-b border-[#343B43] px-3 py-2"><span className="text-[9px] font-semibold tracking-[.12em] text-[#8F9BA6]">STUDIO SEARCH</span><button type="button" onClick={() => setStudioSearchOpen(false)} className="text-[9px] text-[#8F9BA6] hover:text-white">Close</button></div>
              {studioSearchResults.length ? <div className="max-h-64 overflow-y-auto p-1">{studioSearchResults.map((result, index) => <button key={result.groupId+'-'+result.label+'-'+index} type="button" onClick={() => { setOpenToolGroup(result.groupId); setStudioSearchOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-[#303840]"><result.Icon size={13} className="shrink-0 text-[#AAB7C3]"/><span className="min-w-0 flex-1"><span className="block text-[10px] text-[#E0E5EA]">{result.label}</span><span className="block text-[8px] text-[#87939E]">{result.groupLabel}</span></span><span className="text-[8px] text-[#7F8B96]">Coming soon</span></button>)}</div> : <div className="px-3 py-4 text-center text-[9px] text-[#929DA7]">No matching tools yet. Text and font libraries can be added here as they become available.</div>}
            </div>}
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-3 flex items-center gap-1.5 rounded-md border border-[#343A42] bg-[#202429] px-2 py-1">
              <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(value => Math.max(10, value - (value > 500 ? 50 : 25)))} className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#30373E]"><ZoomOut size={13}/></button>
              <span className="w-10 text-center text-[10px] tabular-nums text-[#C9CFD5]">{zoom}%</span>
              <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(value => Math.min(1600, value + (value >= 500 ? 50 : 25)))} className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#30373E]"><ZoomIn size={13}/></button>
            </div>
            <button type="button" onClick={() => void toggleStudioFullscreen()} aria-label={isStudioFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={isStudioFullscreen ? 'Exit fullscreen (Esc)' : 'Expand studio to fullscreen'} className="studio-control flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:text-white">
              {isStudioFullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
            </button>
            <span className="mr-2 flex items-center gap-1.5 text-[11px] studio-muted"><span className="h-1.5 w-1.5 rounded-full bg-[#82978B]"/> {saveState==='saved'?'Auto-saved locally':saveState==='saving'?'Saving project…':saveState==='error'?'Local save issue':'Restoring project…'}</span>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><span className="studio-muted">Untitled project</span><ChevronDown size={13}/></div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><LockKeyhole size={12}/> Saved locally</div>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#343B42] text-xs font-semibold text-[#DCE1E5]">T</div>
          </div>
        </header>

        <nav ref={menuAreaRef} className="flex h-[48px] shrink-0 items-center justify-between gap-2 border-b studio-line bg-[#1B1F23] px-3">
          <div className="relative flex items-center gap-1 text-[12px]">
            {['File','Edit','Image','Canvas','Arrange','Merge','Select All','View','Help'].map(item=><div key={item} className="relative">
              {item==='Select All' ? <label className={'flex cursor-pointer items-center gap-1.5 rounded px-2 py-2 studio-muted hover:text-white '+(sheetMode==='single'||!sheetSlots.length?'cursor-not-allowed opacity-40':'')}><input type="checkbox" checked={selectAllMode} disabled={sheetMode==='single'||!sheetSlots.length} onChange={event=>{const enabled=event.target.checked;setSelectAllMode(enabled);if(enabled){setSelectedSlotIds(sheetSlots.map(slot=>slot.id));setSelectedSlotId(sheetSlots[0]?.id??null);if(sheetSlots[0])setSelectedId(photos.find(photo=>photo.id===sheetSlots[0].photoId)?.id||selectedId);}else setSelectedSlotIds([]);}} className="h-3 w-3 accent-[#D0D7DE]"/><span>Select All</span></label> : <button type="button" onClick={()=>setMenuOpen(menuOpen===item?null:item)} className={'rounded px-2 py-2 '+(menuOpen===item?'bg-[#30373E] text-white':'studio-muted hover:text-white')}>{item}</button>}
              {menuOpen===item && item!=='Select All' && <div className="absolute left-0 top-10 z-50 min-w-[190px] rounded-lg border border-[#3A4148] bg-[#202429] p-1 shadow-2xl">
                {(item==='File'?['Import File']:item==='Edit'?['Undo','Redo','Reset crop']:item==='Image'?['Open manual crop studio','Center crop']:item==='Canvas'?['Single Photo','4 × 6 Sheet','A4 Sheet','Custom photo size']:item==='Arrange'?['Auto arrange photos','Center selected photo','Unmerge']:item==='Merge'?['Merge Selected','Merge All']:item==='View'?['Zoom in','Zoom out','Reset zoom']:['How to move photos','How to delete a photo','How to crop manually']).map(action=><button key={action} type="button" disabled={(action==='Merge Selected'&&selectedSlotIds.length<2)||(action==='Merge All'&&sheetSlots.length<2)||(action==='Unmerge'&&!selectedSheetSlot?.mergeSources?.length)} onClick={()=>{
                  if(action==='Undo')undo();
                  else if(action==='Redo')redo();
                  else if(action==='Import File')openUploadPicker();
                  else if(action==='Export JPG')void(sheetMode==='single'?exportSelectedPhoto('jpg'):exportPrintSheet('jpg'));
                  else if(action==='Export PNG')void(sheetMode==='single'?exportSelectedPhoto('png'):exportPrintSheet('png'));
                  else if(action==='Export PDF')void(sheetMode==='single'?exportSelectedPhoto('pdf'):exportPrintSheet('pdf'));
                  else if(action==='Reset crop'){updateActiveCrop({cropZoom:100,positionX:50,positionY:50});}
                  else if(action==='Open manual crop studio'){setActiveTool('Crop');setCropDialogOpen(true);}
                  else if(action==='Center crop'){updateActiveCrop({positionX:50,positionY:50});}
                  else if(action==='Single Photo')setSheetMode('single');
                  else if(action==='4 × 6 Sheet')setSheetMode('4x6');
                  else if(action==='A4 Sheet')setSheetMode('a4');
                  else if(action==='Custom photo size')setPreset('custom');
                  else if(action==='Auto arrange photos')autoArrangeSheet();
                  else if(action==='Merge Selected')void mergeSheetPhotos(false);
                  else if(action==='Merge All')void mergeSheetPhotos(true);
                  else if(action==='Unmerge')unmergeSelectedSlot();
                  else if(action==='Center selected photo')setSheetSlots(current=>current.map(slot=>slot.photoId===selected?.id?{...slot,x:((sheetDimensions.widthMm)-slot.width)/2,y:((sheetDimensions.heightMm)-slot.height)/2}:slot));
                  else if(action==='Zoom in')setZoom(value=>Math.min(1600,value+(value>=500?50:25)));
                  else if(action==='Zoom out')setZoom(value=>Math.max(10,value-(value>500?50:25)));
                  else if(action==='Reset zoom')setZoom(100);
                  else if(action==='How to move photos')window.alert('On a 4×6 or A4 sheet, press and hold any photo, then drag it to the required position.');
                  else if(action==='How to delete a photo')window.alert('Select a photo on the sheet, then click its red trash icon to remove only that copy.');
                  else if(action==='How to crop manually'){setActiveTool('Crop');setCropDialogOpen(true);}
                  setMenuOpen(null);
                }} className="block w-full rounded px-3 py-2 text-left text-[11px] text-[#C9CFD5] hover:bg-[#30373E]">{action}</button>)}
                {item==='Edit' && <div className="mt-2 space-y-2 border-t border-[#3A4148] p-2"><div className="text-[9px] font-semibold tracking-[.12em] text-[#9AA4AE]">QUICK SETTINGS</div><label className="block text-[9px] text-[#AAB2BA]">Paper sheet<select aria-label="Edit menu paper sheet" value={sheetMode} onChange={event=>{setSheetMode(event.target.value as SheetMode);setSheetSlots([]);setSelectedSlotId(null);setSelectedSlotIds([]);setQuickPrintLayout(true);}} className="studio-control mt-1 h-7 w-full px-2 text-[10px]"><option value="single">Single Photo</option><option value="3.5x5">3.5 × 5 Sheet</option><option value="4x6">4 × 6 Sheet</option><option value="5x7">5 × 7 Sheet</option><option value="6x8">6 × 8 Sheet</option><option value="8x10">8 × 10 Sheet</option><option value="a6">A6 Sheet</option><option value="a5">A5 Sheet</option><option value="a4">A4 Sheet</option><option value="a3">A3 Sheet</option><option value="letter">Letter Sheet</option><option value="legal">Legal Sheet</option><option value="custom">Custom Paper Size</option></select></label><label className="block text-[9px] text-[#AAB2BA]">Photo size<select aria-label="Edit menu photo size" value={preset} onChange={event=>{setPreset(event.target.value as StudioPreset);setSheetSlots([]);setSelectedSlotId(null);setSelectedSlotIds([]);setQuickPrintLayout(true);}} className="studio-control mt-1 h-7 w-full px-2 text-[10px]"><option value="india">Passport / General · 35 × 45 mm</option><option value="pan">PAN · 25 × 35 mm</option><option value="voter-35x45">Voter ID · 35 × 45 mm</option><option value="dl-35x45">Driving Licence · 35 × 45 mm</option><option value="exam-35x45">Exam form · 35 × 45 mm</option><option value="stamp">Stamp · 25 × 30 mm</option><option value="square-51">Visa · 2 × 2 inch</option><option value="oci-51">OCI · 51 × 51 mm</option><option value="passport-35x35">Consular square · 35 × 35 mm</option><option value="pcc-35x35">PCC / Birth · 35 × 35 mm</option><option value="frro-35x35">FRRO · 35 × 35 mm</option><option value="custom">Custom Size</option></select></label><label className="block text-[9px] text-[#AAB2BA]">Number of photos<select aria-label="Edit menu number of photos" value={sheetCopies} onChange={event=>{setSheetCopies(Math.min(anchoredCapacity,Number(event.target.value)));setQuickPrintLayout(false);}} className="studio-control mt-1 h-7 w-full px-2 text-[10px]">{Array.from({length:60},(_,index)=>index+1).map(count=><option key={count} value={count} disabled={count>1&&(sheetMode==='single'||count>anchoredCapacity)}>{count} {count===1?'Photo':'Photos'}</option>)}</select></label><p className="text-[8px] leading-4 text-[#87919B]">Custom dimensions appear beside the matching controls in the top toolbar.</p></div>}
              </div>}
            </div>)}
          </div>
          <div className="flex items-center gap-1.5">
            <label className="studio-control flex h-7 cursor-pointer items-center gap-1.5 px-2 text-[10px]" title="Lock or unlock selected sheet photos"><input type="checkbox" checked={!!selectedSlotId && sheetSlots.filter(slot=>selectedSlotIds.length?selectedSlotIds.includes(slot.id):slot.id===selectedSlotId).length>0 && sheetSlots.filter(slot=>selectedSlotIds.length?selectedSlotIds.includes(slot.id):slot.id===selectedSlotId).every(slot=>slot.locked)} disabled={!selectedSlotId} onChange={toggleSelectedSlotsLock} className="accent-[#D0D7DE]"/> Lock Selected</label>
            <button type="button" title="Duplicate selected photo" disabled={!selectedSlotId||sheetSlots.length>=anchoredCapacity||sheetSlots.length>=60} onClick={duplicateSelectedSlot} className="studio-control h-7 px-2 text-[10px] disabled:opacity-35">Duplicate</button>
            <button type="button" title="Copy selected row" disabled={!selectedSlotId||sheetSlots.length>=anchoredCapacity||sheetSlots.length>=60} onClick={duplicateSelectedRow} className="studio-control h-7 px-2 text-[10px] disabled:opacity-35">Copy Row</button>
            <button type="button" title="Delete selected row" disabled={!selectedSlotId} onClick={deleteSelectedRow} className="studio-control h-7 px-2 text-[10px] disabled:opacity-35">Delete Row</button>
            <button type="button" title="Automatically arrange sheet photos" disabled={!selected||sheetMode==='single'} onClick={autoArrangeSheet} className="studio-control h-7 px-2 text-[10px] disabled:opacity-35">Auto Arrange</button>
            <button type="button" title="Undo" aria-label="Undo" onClick={undo} disabled={!canUndo} className="studio-control flex h-7 w-7 items-center justify-center disabled:opacity-35 hover:text-white"><Undo2 size={13}/></button>
            <button type="button" title="Redo" aria-label="Redo" onClick={redo} disabled={!canRedo} className="studio-control flex h-7 w-7 items-center justify-center disabled:opacity-35 hover:text-white"><Redo2 size={13}/></button>
            <button type="button" onClick={openUploadPicker} className="studio-control flex h-7 items-center gap-1.5 px-2.5 text-[10px] hover:text-white"><Upload size={12}/> Import File</button>
            <div className="relative">
              <button type="button" disabled={!selected} onClick={()=>setMenuOpen(menuOpen==='print-export'?null:'print-export')} className="studio-control flex h-7 items-center gap-1.5 px-2.5 text-[10px] disabled:opacity-40"><Printer size={12}/> Print Actual Size <ChevronDown size={11}/></button>
              {menuOpen==='print-export'&&<div className="absolute right-0 top-9 z-50 min-w-[190px] rounded-lg border border-[#3A4148] bg-[#202429] p-1 shadow-2xl">
                <div className="px-3 py-2 text-[9px] leading-4 text-[#929CA6]">{sheetDimensions.label} · {sheetDimensions.widthMm.toFixed(1)} × {sheetDimensions.heightMm.toFixed(1)} mm</div>
                <button type="button" onClick={()=>{setMenuOpen(null);void printActualSize();}} className="block w-full rounded px-3 py-2 text-left text-[10px] text-[#D9DEE1] hover:bg-[#30373E]">Print at Actual Size</button>
                <div className="my-1 border-t border-[#3A4148]"/>
                <div className="px-3 py-1 text-[9px] text-[#929CA6]">Download current size</div>
                {(['jpg','png','pdf'] as const).map(format=><button key={format} type="button" onClick={()=>{setMenuOpen(null);void (sheetMode==='single'?exportSelectedPhoto(format):exportPrintSheet(format));}} className="block w-full rounded px-3 py-2 text-left text-[10px] uppercase text-[#D9DDE1] hover:bg-[#30373E]">Download {format.toUpperCase()}</button>)}
              </div>}
            </div>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={event => addPhotos(event.target.files)}/>
          </div>
        </nav>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="studio-panel flex w-[82px] min-h-0 shrink-0 flex-col items-center gap-1 overflow-y-auto overscroll-contain border-y-0 border-l-0 px-1.5 py-3">
            <div className="mb-1 w-full border-b border-[#343A42] pb-2">
              {toolItems.map(({icon:Icon,label})=><button type="button" key={label} title={label+" tool"} onClick={()=>setActiveTool(label as typeof activeTool)} data-tool={label.toLowerCase()} className={`studio-tool-button mb-1 flex w-full flex-col items-center gap-1 rounded-lg py-2 transition ${activeTool===label?'is-active':'studio-muted hover:bg-[#252B31]'}`}><Icon size={17} strokeWidth={1.7}/><span className="text-[9px]">{label}</span></button>)}
              <label htmlFor="studio-delete-mode" title="Delete mode" className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-[9px] ${deleteModeEnabled?'bg-red-500/15 text-red-300':'studio-muted hover:bg-[#252B31]'}`}>
                <Trash2 size={17}/><input id="studio-delete-mode" type="checkbox" checked={deleteModeEnabled} onChange={event => setDeleteModeEnabled(event.target.checked)} className="h-3 w-3 accent-red-500"/><span>Delete</span>
              </label>
            </div>
            <div className="w-full pb-2 text-center text-[8px] font-semibold tracking-[.12em] text-[#7F8993]">TOOL GROUPS</div>
            {toolGroups.map(group=>{
              const GroupIcon=group.icon;
              const expanded=openToolGroup===group.id;
              return <div key={group.id} className="w-full">
                <button type="button" aria-expanded={expanded} title={group.label} onClick={()=>setOpenToolGroup(expanded?null:group.id)} className={`studio-tool-group flex w-full flex-col items-center gap-1 rounded-lg px-0.5 py-2 text-center transition ${expanded?'is-expanded':'studio-muted hover:bg-[#252B31]'}`}>
                  <GroupIcon size={16} strokeWidth={1.7}/><span className="w-full text-[8px] leading-tight">{group.label}</span><ChevronDown size={11} className={`transition-transform ${expanded?'rotate-180':''}`}/>
                </button>
                {expanded&&<div className="my-1 rounded-md border border-[#343A42] bg-[#1A1E22] p-1">
                  {group.tools.map(([toolLabel,ToolIcon])=><button key={toolLabel} type="button" disabled title={toolLabel+" · Coming soon"} className="flex w-full cursor-not-allowed items-center gap-1.5 rounded px-1 py-1.5 text-left text-[8px] text-[#727D87] opacity-80">
                    <ToolIcon size={13} strokeWidth={1.7}/><span className="min-w-0 leading-tight">{toolLabel}</span>
                  </button>)}
                </div>}
              </div>;
            })}
            <div className="mt-auto flex w-full flex-col items-center gap-1 py-2 text-[#77818B]" title="More tools coming soon"><MoreHorizontal size={17}/><span className="text-[8px]">More</span></div>
          </aside>
          <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-[#14171A]">
            <div className="flex h-[52px] min-w-0 shrink-0 items-center justify-between gap-3 overflow-hidden border-b studio-line px-5">
              <div className="flex min-w-0 shrink-0 items-center"><span className="text-[12px] font-medium text-[#E1E5E8]">Canvas</span></div>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-[10px] studio-muted">SHEET</span>
                <select aria-label="Print sheet size" value={sheetMode} onChange={event => { setSheetMode(event.target.value as SheetMode); setSheetSlots([]); setSelectedSlotId(null); setSelectedSlotIds([]); setQuickPrintLayout(true); }} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="single">Single Photo</option><optgroup label="Common photo paper"><option value="3.5x5">3.5 × 5 Sheet</option><option value="4x6">4 × 6 Sheet</option><option value="5x7">5 × 7 Sheet</option><option value="6x8">6 × 8 Sheet</option><option value="8x10">8 × 10 Sheet</option></optgroup><optgroup label="Standard paper"><option value="a6">A6 Sheet</option><option value="a5">A5 Sheet</option><option value="a4">A4 Sheet</option><option value="a3">A3 Sheet</option><option value="letter">Letter Sheet</option><option value="legal">Legal Sheet</option></optgroup><option value="custom">Custom Paper Size</option></select>
                {sheetMode === 'custom' && <div className="flex items-center gap-1"><input aria-label="Custom paper width in millimetres" type="number" min="10" max="1000" value={customSheetWidthMm} onChange={event=>setCustomSheetWidthMm(Math.max(10,Math.min(1000,Number(event.target.value)||10)))} className="studio-control h-7 w-[66px] px-1 text-[9px]"/><span className="text-[9px] studio-muted">×</span><input aria-label="Custom paper height in millimetres" type="number" min="10" max="1000" value={customSheetHeightMm} onChange={event=>setCustomSheetHeightMm(Math.max(10,Math.min(1000,Number(event.target.value)||10)))} className="studio-control h-7 w-[66px] px-1 text-[9px]"/><span className="text-[8px] studio-muted">mm</span></div>}
                <span className="mr-1 text-[10px] studio-muted">PHOTO</span>
                <select aria-label="Photo size preset" value={preset} onChange={event => setPreset(event.target.value as StudioPreset)} className="studio-control h-7 px-2 text-[10px] outline-none"><optgroup label="Common India print sizes">
                    <option value="india">Passport / General form · 35 × 45 mm</option>
                    <option value="pan">PAN card print · 25 × 35 mm</option>
                    <option value="voter-35x45">Voter ID / Form · 35 × 45 mm</option>
                    <option value="dl-35x45">Driving licence · 35 × 45 mm</option>
                    <option value="exam-35x45">Exam form common · 35 × 45 mm*</option>
                    <option value="stamp">Stamp photo · 25 × 30 mm</option>
                  </optgroup>
                  <optgroup label="Visa & consular sizes">
                    <option value="square-51">Visa photo · 2 × 2 inch (50.8 × 50.8 mm)</option>
                    <option value="oci-51">OCI photo · 51 × 51 mm</option>
                    <option value="passport-35x35">Passport / consular square · 35 × 35 mm</option>
                    <option value="pcc-35x35">PCC / Birth certificate · 35 × 35 mm</option>
                    <option value="frro-35x35">FRRO / Consular form · 35 × 35 mm</option>
                  </optgroup>
                  <option value="custom">Custom Size</option></select>
                <div className="studio-control flex h-7 items-center px-3 text-[10px]">{documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</div>
                <label className="ml-1 flex items-center gap-1.5 text-[10px] studio-muted">
                  <span className="whitespace-nowrap">Number of photos</span>
                  <select aria-label="Number of photos" title="Select number of photos" value={sheetCopies} onChange={event => { const count = Number(event.target.value); setSheetCopies(count); setQuickPrintLayout(false); }} className="studio-control h-7 min-w-[104px] px-2 text-[10px] outline-none" disabled={!selected}>
                    {Array.from({length:60},(_,index)=>index+1).map(count => <option key={count} value={count} disabled={count > 1 && (sheetMode === 'single' || count > anchoredCapacity)}>{count} {count === 1 ? 'Photo' : 'Photos'}</option>)}
                  </select>
                </label>
                <button type="button" onClick={()=>{const pageW=sheetDimensions.widthMm;const pageH=sheetDimensions.heightMm;const source=selected||photos[0];if(!source)return;const id="slot-"+Date.now();if(source.kind==='signature'){const target=sheetSlots.find(slot=>photos.find(item=>item.id===slot.photoId)?.kind!=='signature')||sheetSlots[0];const width=Math.min(40,target?.width?target.width*.8:40);const ratio=source.width>0&&source.height>0?source.height/source.width:.25;const height=Math.max(3,Math.min(24,width*ratio));const x=target?target.x+(target.width-width)/2:sheetMargin;const y=target?target.y+target.height-height-2:sheetMargin;const slot={id,photoId:source.id,x:Math.max(0,Math.min(pageW-width,x)),y:Math.max(0,Math.min(pageH-height,y)),width,height,cropZoom:100,positionX:50,positionY:50,locked:false};setSheetSlots(current=>[...current,slot]);setSelectedSlotId(id);setSelectedSlotIds([id]);}else{const anchor=sheetSlots[0]||{id:"anchor",photoId:source.id,x:sheetMargin,y:sheetMargin,width:documentSize.widthMm,height:documentSize.heightMm};const position=getPatternCopyPosition(anchor,pageW,pageH,sheetMargin,sheetGap,sheetSlots);const slot={id,photoId:source.id,...position,width:documentSize.widthMm,height:documentSize.heightMm,cropZoom:100,positionX:50,positionY:50,locked:false};setSheetSlots(current=>[...current,slot]);setSelectedSlotId(id);setSelectedSlotIds([id]);}setSheetCopies(current=>Math.min(anchoredCapacity,current+1));}} disabled={!selected||sheetMode==="single"||sheetSlots.length>=anchoredCapacity||sheetSlots.length>=60} className="studio-control flex h-7 items-center gap-1 px-2 text-[10px] disabled:opacity-35"><Plus size={12}/> Add Photo</button>
              </div>
            </div>

            <div ref={previewStageRef} className="studio-stage relative flex min-h-0 flex-1 items-start justify-start overflow-auto overscroll-contain p-6">
              <div className="absolute right-5 top-5 z-40 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">PREVIEW AREA</div>
              {selected && sheetMode !== 'single' ? (
                <div className="mx-auto flex w-max flex-col items-center gap-3">
                  <div className="rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">{sheetDimensions.label.toUpperCase()} · {visibleCopies} / {sheetCopies} COPIES · {anchoredCapacity} MAX FIT</div>
                  <div tabIndex={0} onDragOver={event=>{if(event.dataTransfer.types.includes('application/x-tanshu-signature-layer'))event.preventDefault();}} onDrop={event=>handleSignatureDrop(event,sheetDimensions.widthMm,sheetDimensions.heightMm)} onClick={event=>{if(event.target===event.currentTarget){setSelectedSlotId(null);setSelectedSlotIds([]);setHoveredSlotId(null);setSignatureSelected(false);}}} onKeyDown={handleSheetKeyDown} aria-label="Photo sheet. Use arrow keys to move selected photo; Shift plus arrow moves 5 mm, Alt plus arrow moves 0.2 mm." className="relative overflow-hidden border border-white/20 bg-white shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400" style={{width:previewPageWidth,height:previewPageHeight,flexShrink:0,zoom:zoom/100}}>
                    {sheetSlots.map((slot,i)=>{const photo=photos.find(p=>p.id===slot.photoId)||selected;const pageW=sheetDimensions.widthMm;const pageH=sheetDimensions.heightMm;const isChosen=selectedSlotId===slot.id;return <div key={slot.id} onPointerEnter={()=>setHoveredSlotId(slot.id)} onPointerLeave={()=>setHoveredSlotId(current=>current===slot.id?null:current)} onClick={event=>{event.stopPropagation();if(suppressSlotClickRef.current){suppressSlotClickRef.current=false;return;}setSelectAllMode(false);if(event.ctrlKey||event.metaKey){setSelectedSlotIds(current=>current.includes(slot.id)?current.filter(id=>id!==slot.id):[...current,slot.id]);setSelectedSlotId(slot.id);setSelectedId(photo.id);}else{setSelectedSlotIds([slot.id]);setSelectedSlotId(slot.id);}}} onPointerDown={event=>{event.stopPropagation();setHoveredSlotId(null);if(slot.locked)return;event.currentTarget.setPointerCapture(event.pointerId);setSelectAllMode(false);setSelectedId(photo.id);setSelectedSlotId(slot.id);if(!event.ctrlKey&&!event.metaKey)setSelectedSlotIds([slot.id]);const wantsCopy=event.altKey||event.shiftKey;const canCopy=sheetSlots.length<anchoredCapacity&&sheetSlots.length<60;const dragId=wantsCopy&&canCopy?'slot-copy-'+Date.now()+'-'+Math.random().toString(36).slice(2):slot.id;let dragStartX=slot.x,dragStartY=slot.y;if(wantsCopy&&canCopy){const copyPosition=getPatternCopyPosition(slot,sheetDimensions.widthMm,sheetDimensions.heightMm,sheetMargin,sheetGap,sheetSlots);dragStartX=copyPosition.x;dragStartY=copyPosition.y;setSheetSlots(current=>[...current,{...slot,id:dragId,...copyPosition,locked:false}]);setSheetCopies(current=>Math.min(60,sheetCapacity,current+1));setSelectedSlotId(dragId);setSelectedSlotIds([dragId]);}const groupIds=!wantsCopy&&selectedSlotIds.includes(slot.id)&&selectedSlotIds.length>1?selectedSlotIds:[slot.id];const group=groupIds.length>1?sheetSlots.filter(item=>groupIds.includes(item.id)).map(item=>({id:item.id,x:item.x,y:item.y})):undefined;if(group&&sheetSlots.some(item=>groupIds.includes(item.id)&&item.locked))return;setSlotDrag({id:dragId,px:event.clientX,py:event.clientY,sx:dragStartX,sy:dragStartY,group});}} onPointerMove={event=>{const rect=event.currentTarget.parentElement!.getBoundingClientRect();if(slotResize){const dx=(event.clientX-slotResize.px)/rect.width*pageW;const dy=(event.clientY-slotResize.py)/rect.height*pageH;const horizontal=slotResize.corner.endsWith('w')?-dx:dx;const vertical=slotResize.corner.startsWith('n')?-dy:dy;let factor=Math.abs(horizontal/slotResize.width)>=Math.abs(vertical/slotResize.height)?horizontal/slotResize.width:vertical/slotResize.height;const minScale=Math.max(15/slotResize.width,15/slotResize.height)-1;const maxScale=Math.min((slotResize.corner.endsWith('w')?slotResize.x+slotResize.width-sheetMargin:pageW-sheetMargin-slotResize.x)/slotResize.width,(slotResize.corner.startsWith('n')?slotResize.y+slotResize.height-sheetMargin:pageH-sheetMargin-slotResize.y)/slotResize.height)-1;factor=Math.max(minScale,Math.min(maxScale,factor));const width=slotResize.width*(1+factor),height=slotResize.height*(1+factor);const x=slotResize.corner.endsWith('w')?slotResize.x+slotResize.width-width:slotResize.x;const y=slotResize.corner.startsWith('n')?slotResize.y+slotResize.height-height:slotResize.y;setSheetSlots(current=>current.map(item=>item.id===slotResize.id?{...item,x:Math.max(sheetMargin,x),y:Math.max(sheetMargin,y),width,height}:item));return;}if(!slotDrag)return;if(Math.hypot(event.clientX-slotDrag.px,event.clientY-slotDrag.py)>3)suppressSlotClickRef.current=true;const dx=(event.clientX-slotDrag.px)/rect.width*pageW;const dy=(event.clientY-slotDrag.py)/rect.height*pageH;if(slotDrag.group){const groupIds=slotDrag.group.map(item=>item.id);const groupBounds=slotDrag.group.map(origin=>{const current=sheetSlots.find(item=>item.id===origin.id);return {...origin,width:current?.width??0,height:current?.height??0};});const minDx=Math.max(...groupBounds.map(item=>sheetMargin-item.x)),maxDx=Math.min(...groupBounds.map(item=>pageW-sheetMargin-item.width));const minDy=Math.max(...groupBounds.map(item=>sheetMargin-item.y)),maxDy=Math.min(...groupBounds.map(item=>pageH-sheetMargin-item.height));const gx=Math.max(minDx,Math.min(maxDx,dx)),gy=Math.max(minDy,Math.min(maxDy,dy));setSheetSlots(current=>current.map(item=>{const origin=slotDrag.group!.find(groupItem=>groupItem.id===item.id);return origin?{...item,x:origin.x+gx,y:origin.y+gy}:item;}));return;}setSheetSlots(current=>{const moving=current.find(item=>item.id===slotDrag.id);if(!moving)return current;const minMargin=current[0]?.id===moving.id?0:sheetMargin;const targetX=Math.max(0,Math.min(pageW-moving.width,slotDrag.sx+dx));const targetY=Math.max(0,Math.min(pageH-moving.height,slotDrag.sy+dy));const others=current.filter(item=>item.id!==moving.id);const movingPhoto=photos.find(photo=>photo.id===moving.photoId);const position=movingPhoto?.kind==='signature'?{x:targetX,y:targetY}:getSmartSheetPosition(targetX,targetY,moving,others,pageW,pageH,minMargin,sheetGap);return current.map(item=>item.id===moving.id?{...item,...position}:item);});}} onPointerUp={event=>{setSlotDrag(null);setSlotResize(null);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{setSlotDrag(null);setSlotResize(null);}} className="absolute select-none bg-[#F3F3F3] cursor-move" style={{left:(slot.x/pageW*100)+'%',top:(slot.y/pageH*100)+'%',width:(slot.width/pageW*100)+'%',height:(slot.height/pageH*100)+'%',touchAction:'none',border:'none',boxShadow:[borderEnabled?'inset 0 0 0 '+Math.max(0.1,borderWidthMm/pageW*previewPageWidth)+'px '+borderColor:'',isChosen?'0 0 0 1px rgba(201,149,85,.55), 0 5px 16px rgba(0,0,0,.22)':''].filter(Boolean).join(', ')||'none',outline:(slotDrag?.id===slot.id||slotResize?.id===slot.id)?'1px solid rgba(90,110,130,.75)':'none',outlineOffset:'0px'}}>
                      <img src={photo.url} alt={'Photo slot '+(i+1)} draggable={false} className={'pointer-events-none h-full w-full '+(photo.kind==='signature'?'object-contain':'object-cover')} style={{objectPosition:(slot.positionX ?? 50)+'% '+(slot.positionY ?? 50)+'%',transform:photo.kind==='signature'?'none':'scale('+((slot.cropZoom ?? 100)/100)+')'}}/>{photo.kind!=='signature'&&renderSignatureOverlay(documentSize.widthMm,documentSize.heightMm,selectedSlotId===slot.id,()=>setSelectedSlotId(slot.id))}<div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{border:borderEnabled?`${Math.max(0.1,borderWidthMm/pageW*previewPageWidth)}px solid ${borderColor}`:'none'}}/>
                      {isChosen&&deleteModeEnabled&&<button type="button" aria-label={selectAllMode?'Delete all photos from sheet':'Delete photo '+(i+1)+' from sheet'} title={selectAllMode?'Delete all photos from sheet':'Delete this photo'} onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();const ids=selectAllMode?sheetSlots.map(item=>item.id):[slot.id];const removedCount=sheetSlots.filter(item=>ids.includes(item.id)).length;setSheetSlots(current=>current.filter(item=>!ids.includes(item.id)));if(removedCount)setSheetCopies(count=>Math.max(0,count-removedCount));setSelectedSlotIds([]);setSelectedSlotId(null);setSelectAllMode(false);}} style={{transform:`scale(${100/zoom})`,transformOrigin:'top right'}} className="group absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-lg transition hover:scale-110 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"><span className="studio-trash-lid pointer-events-none absolute -top-[4px] left-[7px] h-[4px] w-[13px] rounded-t-sm bg-white shadow-sm transition-transform duration-300"/><Trash2 size={15} className="pointer-events-none"/></button>}
                      {(isChosen)&&(['nw','ne','sw','se'] as const).map(corner=><button key={corner} type="button" aria-label={`Resize photo ${i+1} ${corner} corner`} title="Drag to resize while keeping photo proportions" onClick={event=>event.stopPropagation()} onPointerDown={event=>{event.preventDefault();event.stopPropagation();const parent=event.currentTarget.parentElement as HTMLDivElement;parent.setPointerCapture(event.pointerId);setSelectedSlotId(slot.id);setSelectedSlotIds([slot.id]);setSlotResize({id:slot.id,corner,px:event.clientX,py:event.clientY,x:slot.x,y:slot.y,width:slot.width,height:slot.height});}} className={`studio-photo-resize-handle absolute z-30 h-4 w-4 rounded-sm border-0 bg-transparent shadow-none focus:outline-none focus-visible:outline-none ${corner==='nw'?'left-[-6px] top-[-6px]':corner==='ne'?'right-[-6px] top-[-6px]':corner==='sw'?'bottom-[-6px] left-[-6px]':'bottom-[-6px] right-[-6px]'}`}/>)}<span className="pointer-events-none absolute bottom-0 left-0 bg-black/65 px-1 text-[8px] text-white">{i+1}</span>
                    </div>})}

                  </div>
                </div>
              ) : selected ? (
                <div
                  className="mx-auto relative overflow-hidden border border-white/10 bg-[#E7E5E0] shadow-2xl cursor-grab active:cursor-grabbing"
                  style={{ zoom: zoom / 100, aspectRatio: `${documentSize.widthMm} / ${documentSize.heightMm}`, width: previewPageWidth, height: previewPageHeight, flexShrink: 0, touchAction: "none" }}
                  onDragOver={event=>{if(event.dataTransfer.types.includes('application/x-tanshu-signature-layer'))event.preventDefault();}}
                  onDrop={event=>handleSignatureDrop(event,documentSize.widthMm,documentSize.heightMm)}
                  onClick={event=>{if(event.target===event.currentTarget)setSignatureSelected(false);}}
                  onPointerDown={event => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    cropDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, positionX:activePositionX, positionY:activePositionY };
                  }}
                  onPointerMove={event => {
                    const drag = cropDragRef.current;
                    if (!drag || drag.pointerId !== event.pointerId) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const dx = (event.clientX - drag.x) / rect.width * 100 * (zoom / 100);
                    const dy = (event.clientY - drag.y) / rect.height * 100 * (zoom / 100);
                    updateActiveCrop({positionX:Math.max(0, Math.min(100, drag.positionX - dx)),positionY:Math.max(0, Math.min(100, drag.positionY - dy))});
                  }}
                  onPointerUp={event => {
                    cropDragRef.current = null;
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerCancel={() => { cropDragRef.current = null; }}
                >
                  <img src={selected.url} alt={selected.file.name} draggable={false} onLoad={event => updateDimensions(selected.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} className={'pointer-events-none block h-full w-full select-none '+(selected.kind==='signature'?'object-contain':'object-cover')} style={{ objectPosition: `${activePositionX}% ${activePositionY}%`, transform: selected.kind==='signature'?'none':`scale(${activeCropZoom / 100})` }}/><div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{border:borderEnabled?`${Math.max(0.1,borderWidthMm/documentSize.widthMm*previewPageWidth)}px solid ${borderColor}`:'none'}}/>{renderSignatureOverlay(documentSize.widthMm,documentSize.heightMm)}
                </div>
              ) : (
                <button type="button" onClick={openUploadPicker} className="group m-auto flex h-[420px] w-[336px] flex-col items-center justify-center gap-4 rounded-[2px] border border-dashed border-[#59616A] bg-[#1B1F23]/70 text-center transition hover:border-[#8A949E] hover:bg-[#20252A]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A4148] bg-[#252B31] text-[#B6C0CA]"><Upload size={20}/></div>
                  <div><div className="text-[13px] font-medium text-[#DDE1E5]">Import a file to begin</div><div className="mt-2 text-[10px] studio-muted">Choose JPG, PNG or WEBP · Multiple files supported</div></div>
                  <span className="studio-control flex items-center gap-2 px-3 py-2 text-[10px]"><Plus size={13}/> Browse files</span>
                </button>
              )}
            </div>

            <div className="flex h-[38px] shrink-0 items-center justify-between border-t studio-line bg-[#191D21] px-5 text-[10px] studio-muted">
              <div className="flex items-center gap-4"><span>{selected ? `Image: ${selected.width || '—'} × ${selected.height || '—'} px` : 'Canvas: 35 × 45 mm'}</span><span>Document: {documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</span><span>Output: {documentSize.widthPx} × {documentSize.heightPx} px @ 300 DPI</span><span>Color: RGB</span></div>
              <div className="flex items-center gap-3"><span>{zoom}%</span><span className="h-3 w-px bg-[#3A4148]"/><button type="button" onClick={() => setZoom(100)} className="hover:text-[#D9DDE1]">Reset zoom</button></div>
            </div>
          </main>

          <aside className="studio-panel flex w-[286px] min-h-0 shrink-0 flex-col overflow-hidden border-y-0 border-r-0">
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b studio-line px-4"><div className="text-[12px] font-semibold text-[#E0E4E8]">{activeTool === 'Move' ? 'Move Settings' : `${activeTool} Settings`}</div><span className="text-[9px] studio-muted">{saveState==='saved'?'Auto-saved':saveState==='saving'?'Saving…':saveState==='error'?'Save issue':'Restoring…'}</span></div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                            {activeTool === 'Crop' && <div className="border-b studio-line p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">CROP & POSITION</span><button type="button" onClick={() => updateActiveCrop({cropZoom:100,positionX:50,positionY:50})} className="text-[10px] studio-muted hover:text-[#D9DDE1]">Reset selected crop</button></div>
                {([['Crop zoom',activeCropZoom,'cropZoom',100,300],['Horizontal position',activePositionX,'positionX',0,100],['Vertical position',activePositionY,'positionY',0,100]] as const).map(([label,value,key,min,max])=><label key={label} className="mb-3 block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span><input type="range" min={min} max={max} value={value} onChange={event=>updateActiveCrop({[key]:Number(event.target.value)})} className="w-full accent-[#AEB8C2]"/></label>)}
                <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>updateActiveCrop({positionX:50})} className="studio-control py-1.5 text-[9px]">Center X</button><button type="button" onClick={()=>updateActiveCrop({positionY:50})} className="studio-control py-1.5 text-[9px]">Center Y</button></div>
                <button type="button" onClick={()=>void detectFaceAndSuggestCrop()} className="studio-control mt-3 flex w-full items-center justify-center gap-2 py-2 text-[10px]"><ScanFace size={13}/> Detect face & suggest crop</button>{faceDetectionStatus&&<p className="mt-2 text-[9px] leading-4 studio-muted" role="status">{faceDetectionStatus}</p>}<button type="button" onClick={()=>setCropDialogOpen(true)} className="studio-control mt-2 flex w-full items-center justify-center gap-2 py-2 text-[10px]"><Crop size={13}/> Open manual crop studio</button>
              </div>}
              <div className="border-b studio-line p-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">PHOTO SIZE & UNITS</span><span className="text-[9px] text-[#D5DADF]">{documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</span></div>
                <div className="mb-2 grid grid-cols-[64px_1fr_1fr] gap-2">
                  <select aria-label="Photo measurement unit" value={sizeUnit} onChange={event=>setSizeUnit(event.target.value as StudioUnit)} className="studio-control h-8 px-1 text-[10px]"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option></select>
                  <label className="text-[9px] studio-muted">Width<input aria-label="Photo width" type="number" min="0.1" step="0.1" value={Number(mmToUnit(documentSize.widthMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomWidthMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));setSheetSlots([]);setQuickPrintLayout(true);}} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                  <label className="text-[9px] studio-muted">Height<input aria-label="Photo height" type="number" min="0.1" step="0.1" value={Number(mmToUnit(documentSize.heightMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomHeightMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));setSheetSlots([]);setQuickPrintLayout(true);}} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                </div>
                <div className="flex items-center justify-between text-[10px]"><span className="studio-muted">Preset</span><span className="text-[#D5DADF]">{preset==='custom'?'Custom Size':STUDIO_PRESETS[preset].label}</span></div>
              </div>
              <div className="border-b studio-line p-3">
                <div className="mb-2 text-[10px] font-semibold tracking-[.12em] studio-muted">SHEET SPACING & COPIES</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[9px] studio-muted col-span-2">Printer-safe Margin (mm)<input aria-label="Printer safe margin in millimetres" type="number" min="0" max="50" step="0.5" value={Number(sheetMargin.toFixed(1))} onChange={event=>setSheetMargin(Math.max(0,Math.min(50,Number(event.target.value)||0)))} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                  <label className="text-[9px] studio-muted">Horizontal Photo Gap (mm)<input aria-label="Horizontal Photo Gap (mm)" type="number" min="0" max="30" step="0.5" value={Number(sheetGap.toFixed(1))} onChange={event=>setSheetGap(Math.max(0,Math.min(30,Number(event.target.value)||0)))} onWheel={event=>{event.preventDefault();setSheetGap(v=>Math.max(0,Math.min(30,Number((v+(event.deltaY<0?0.5:-0.5)).toFixed(1)))));}} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                  <label className="text-[9px] studio-muted">Vertical Photo Gap (mm)<input aria-label="Vertical Photo Gap (mm)" type="number" min="0" max="30" step="0.5" value={Number(sheetVerticalGap.toFixed(1))} onChange={event=>setSheetVerticalGap(Math.max(0,Math.min(30,Number(event.target.value)||0)))} onWheel={event=>{event.preventDefault();setSheetVerticalGap(v=>Math.max(0,Math.min(30,Number((v+(event.deltaY<0?0.5:-0.5)).toFixed(1)))));}} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                  <label className="text-[9px] studio-muted col-span-2">Count Photo<input aria-label="Count Photo" type="number" min="1" max={Math.max(1,Math.min(60,anchoredCapacity))} step="1" value={sheetCopies} onChange={event=>{const count=Math.max(1,Math.min(60,anchoredCapacity,Number(event.target.value)||1));setSheetCopies(count);setQuickPrintLayout(false);}} onWheel={event=>{event.preventDefault();const count=Math.max(1,Math.min(60,anchoredCapacity,sheetCopies+(event.deltaY<0?1:-1)));setSheetCopies(count);setQuickPrintLayout(false);}} className="studio-control mt-1 h-8 w-full px-2 text-[10px]"/></label>
                  <button type="button" onClick={arrangeSheetUsingGaps} disabled={sheetMode==='single'||!sheetSlots.length} className="studio-control col-span-2 py-2 text-[10px] disabled:opacity-40">Arrange Photos Using Gaps</button>
                  <button type="button" onClick={smartCenterAndBalanceSheet} disabled={sheetMode==='single'||!sheetSlots.length} className="studio-control col-span-2 py-2 text-[10px] disabled:opacity-40">Smart Center &amp; Balance</button>
                </div>
              </div>
              <div className="border-b studio-line p-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">PHOTO BORDER</span><label className="flex items-center gap-1.5 text-[9px] studio-muted"><input type="checkbox" checked={borderEnabled} onChange={event=>setBorderEnabled(event.target.checked)} className="accent-[#D0D7DE]"/> Enable</label></div>
                <label className="block text-[9px] studio-muted">Thickness · {borderWidthMm.toFixed(1)} mm<input type="range" min="0.1" max="10" step="0.1" value={borderWidthMm} onChange={event=>setBorderWidthMm(Number(event.target.value))} className="mt-1 w-full accent-[#D0D7DE]"/><div className="flex justify-between text-[8px]"><span>0.1 mm · Thin</span><span>10 mm · Thick</span></div></label>
                <div className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] studio-muted">Border colour<select value={['#000000','#0000FF','#FF0000'].includes(borderColor)?borderColor:'custom'} onChange={event=>{if(event.target.value!=='custom')setBorderColor(event.target.value);else setBorderColor(customBorderColor);}} className="studio-control mt-1 h-8 w-full px-2"><option value="#000000">Black</option><option value="#0000FF">Blue</option><option value="#FF0000">Red</option><option value="custom">Custom</option></select></label><label className="text-[9px] studio-muted">Custom colour<input type="color" value={customBorderColor} onChange={event=>{setCustomBorderColor(event.target.value);setBorderColor(event.target.value);}} className="studio-control mt-1 h-8 w-full p-1"/></label></div>
                <div className="mt-2 flex items-center justify-between border-t studio-line pt-2 text-[10px]"><span className="studio-muted">Output size</span><span className="text-[#D5DADF]">{documentSize.widthPx} × {documentSize.heightPx} px</span></div>
                <div className="flex items-center justify-between border-t studio-line py-2 text-[10px]"><span className="studio-muted">Resolution</span><span className="text-[#D5DADF]">300 DPI</span></div>
              </div>
              <StudioAdvancedPanel selected={selected} photos={photos} widthPx={documentSize.widthPx} heightPx={documentSize.heightPx} onApplyImage={applyProcessedImage} onAddSignature={addSignatureLayer} onApplySignature={()=>{setSignaturePlacement(current=>current||{x:0.34,y:0.72,width:0.32});setSignatureSelected(true);}} activeSection={activeTool==='Move'?'move':activeTool==='Background'?'background':activeTool==='Retouch'?'portrait':activeTool==='Layout'?'layout':'adjust'} hideTabs />
              <div className="border-t studio-line p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">LAYERS</span><span className="text-[9px] studio-muted">{photos.length.toString().padStart(2, '0')} ITEMS</span></div>
                {photos.length ? <div className="space-y-2">{photos.map(photo => <div key={photo.id} draggable={photo.kind==='signature'} onDragStart={event=>{if(photo.kind!=='signature')return;event.dataTransfer.effectAllowed='copy';event.dataTransfer.setData('application/x-tanshu-signature-layer',photo.id);}} className={`flex items-center gap-2 rounded-md border p-2 ${selectedId === photo.id || (photo.kind==='signature' && signatureSelected) ? 'border-[#3A4148] bg-[#252B31]' : 'studio-line bg-[#202429]'} ${photo.kind==='signature'?'cursor-grab active:cursor-grabbing':''}`}><button type="button" onClick={() => {if(photo.kind==='signature'){setSignatureSelected(true);}else{setSelectedId(photo.id);}}} className="flex min-w-0 flex-1 items-center gap-2 text-left"><img src={photo.url} alt="" className={'h-9 w-8 rounded bg-[#30363D] '+(photo.kind==='signature'?'object-contain':'object-cover')}/><span className="min-w-0"><span className="block truncate text-[10px] text-[#DCE1E5]">{photo.file.name}</span><span className="block text-[9px] studio-muted">{photo.kind==='signature'?'Signature layer · Drag to preview':'Image · '+(photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Loading dimensions')}</span></span></button><button type="button" aria-label={'Delete '+(photo.kind==='signature'?'signature':'photo')+' layer'} title="Delete layer" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();removeLayer(photo.id);}} className="rounded p-1 text-[#9AA3AD] hover:bg-red-500/15 hover:text-red-400"><Trash2 size={14}/></button></div>)}
                  <button type="button" onClick={openUploadPicker} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed studio-line py-2 text-[10px] studio-muted hover:text-[#D9DDE1]"><Plus size={13}/> Add photos</button></div> : <div className="rounded-md border border-dashed studio-line p-4 text-center text-[10px] studio-muted">No image layers yet</div>}
              </div>
            </div>
          </aside>
        </div>
                {cropDialogOpen && <div className="fixed inset-0 z-[100] bg-black/50" onPointerDown={event=>{if(event.target===event.currentTarget)setCropDialogOpen(false);}}><div className="absolute w-[min(560px,calc(100vw-32px))] rounded-xl border border-[#46505A] bg-[#1B1F23] shadow-2xl" style={{left:cropDialogPosition.x,top:cropDialogPosition.y}}><div className="flex cursor-move items-center justify-between border-b border-[#343A42] px-4 py-3" onPointerDown={event=>{setCropDialogDrag({x:event.clientX,y:event.clientY,left:cropDialogPosition.x,top:cropDialogPosition.y});event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(cropDialogDrag)setCropDialogPosition({x:Math.max(0,cropDialogDrag.left+event.clientX-cropDialogDrag.x),y:Math.max(0,cropDialogDrag.top+event.clientY-cropDialogDrag.y)});}} onPointerUp={()=>setCropDialogDrag(null)} onPointerCancel={()=>setCropDialogDrag(null)}><div><div className="text-[12px] font-semibold text-[#E4E8EC]">Manual Crop Studio</div><div className="text-[9px] studio-muted">Exact size in mm, cm or inches · drag the dialog by its title bar</div></div><button type="button" onClick={()=>setCropDialogOpen(false)}><X size={16}/></button></div><div className="grid grid-cols-[1fr_180px] gap-4 p-4"><div className="relative h-[260px] w-full touch-none overflow-hidden rounded-lg border border-white/20 bg-[#E7E5E0]" onPointerDown={event=>{if(!selected)return;event.currentTarget.setPointerCapture(event.pointerId);cropDragRef.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,positionX:activePositionX,positionY:activePositionY};}} onPointerMove={event=>{const drag=cropDragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;const rect=event.currentTarget.getBoundingClientRect();updateActiveCrop({positionX:Math.max(0,Math.min(100,drag.positionX-(event.clientX-drag.x)/rect.width*100)),positionY:Math.max(0,Math.min(100,drag.positionY-(event.clientY-drag.y)/rect.height*100))});}} onPointerUp={event=>{cropDragRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{cropDragRef.current=null;}}>{selected&&<img src={selected.url} alt="Drag photo to position crop" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" style={{objectPosition:activePositionX+'% '+activePositionY+'%',transform:'scale('+(activeCropZoom/100)+')'}}/>}</div><div className="space-y-3"><label className="block text-[10px] studio-muted">Unit<select value={sizeUnit} onChange={event=>setSizeUnit(event.target.value as StudioUnit)} className="studio-control mt-1 h-8 w-full px-2"><option value="mm">Millimetres</option><option value="cm">Centimetres</option><option value="in">Inches</option></select></label><label className="block text-[10px] studio-muted">Width ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customWidthMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomWidthMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));}} className="studio-control mt-1 h-8 w-full px-2"/></label><label className="block text-[10px] studio-muted">Height ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customHeightMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomHeightMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));}} className="studio-control mt-1 h-8 w-full px-2"/></label><label className="block text-[10px] studio-muted">Zoom {activeCropZoom}%<input type="range" min="100" max="300" value={activeCropZoom} onChange={event=>updateActiveCrop({cropZoom:Number(event.target.value)})} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Horizontal {activePositionX}%<input type="range" min="0" max="100" value={activePositionX} onChange={event=>updateActiveCrop({positionX:Number(event.target.value)})} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Vertical {activePositionY}%<input type="range" min="0" max="100" value={activePositionY} onChange={event=>updateActiveCrop({positionY:Number(event.target.value)})} className="mt-1 w-full"/></label><button type="button" onClick={()=>updateActiveCrop({cropZoom:100,positionX:50,positionY:50})} className="studio-control w-full py-2 text-[10px]">Reset selected crop</button><button type="button" onClick={()=>setCropDialogOpen(false)} className="w-full rounded-md bg-[#D9DEE2] py-2 text-[10px] font-semibold text-[#20252A]">Apply crop settings</button></div></div></div></div>}
        <footer className="flex h-[34px] shrink-0 items-center justify-between border-t studio-line bg-[#171A1D] px-5 text-[9px] studio-muted"><span>TANSHU STUDIO · DOCUMENT PRESETS</span><span className="flex items-center gap-4"><span>Import and layer selection enabled</span><span>© TANSHU ONLINE</span></span></footer>
      </div>
    </div>
  );
};