import React, { useEffect, useRef, useState } from 'react';
import { removeBackgroundAI } from './backgroundRemovalAI';
import { Copy, X, Minimize2, Maximize2, Check, RotateCcw, Undo2, Redo2 } from 'lucide-react';

export type ManualAssetDocument = {
  id: string;
  name: string;
  src: string;
  kind: 'photo' | 'signature';
};

type Props = {
  documents: ManualAssetDocument[];
  activeId: string | null;
  onActiveChange: (id: string) => void;
  onClose: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReplaceSource: (id: string, src: string) => void;
  onUseOnPage: (asset: { name: string; src: string; widthMm: number; heightMm: number }) => void | Promise<void>;
  onFinish: () => void;
  signatureAsset?: { name: string; src: string } | null;
  onSignatureApplied?: () => void;
  onSignatureDrop?: (asset: { name: string; src: string }) => void;
  onOpen?: () => void;
  cropMode?: boolean;
  workspaceOpen?: boolean;
  backgroundPickerOpen?: boolean;
  onToggleBackgroundPicker?: () => void;
};

type Unit = 'mm' | 'cm' | 'in' | 'custom';
const toMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value * 10 : unit === 'in' ? value * 25.4 : value * customMm;
const fromMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value / 10 : unit === 'in' ? value / 25.4 : value / Math.max(0.0001, customMm);
const EDITOR_DB = 'tanshu-manual-photo-editor-state';
const openEditorDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(EDITOR_DB, 1);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('states')) request.result.createObjectStore('states'); };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const readEditorState = async (id: string) => {
  const db = await openEditorDb();
  return new Promise<any>((resolve, reject) => {
    const request = db.transaction('states', 'readonly').objectStore('states').get(id);
    request.onsuccess = () => { resolve(request.result || null); db.close(); };
    request.onerror = () => { reject(request.error); db.close(); };
  });
};
const writeEditorState = async (id: string, value: any) => {
  const db = await openEditorDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('states', 'readwrite');
    tx.objectStore('states').put(value, id);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
    tx.onabort = () => { reject(tx.error); db.close(); };
  });
};
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Image could not be loaded.'));
  image.src = src;
  if (image.complete && image.naturalWidth > 0) resolve(image);
});
const makePersistentSrc = async (src: string) => {
  if (!src || src.startsWith('data:') || src.startsWith('http:') || src.startsWith('https:')) return src;
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch { return ''; }
};

export const ManualAssetEditor: React.FC<Props> = ({ documents, activeId, onActiveChange, onClose, onDuplicate, onReplaceSource, onUseOnPage, onFinish, signatureAsset = null, onSignatureApplied, onSignatureDrop, onOpen, cropMode = false, workspaceOpen = true, backgroundPickerOpen = false, onToggleBackgroundPicker }) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [customUnitName, setCustomUnitName] = useState('custom');
  const [customUnitMm, setCustomUnitMm] = useState('1');
  const [croppedAsset, setCroppedAsset] = useState<{src:string;widthMm:number;heightMm:number;name:string}|null>(null);
  // Keep the merged signed crop synchronously available to the next toolbar action.
  const signedCroppedAssetRef = useRef<{src:string;widthMm:number;heightMm:number;name:string}|null>(null);
  const [cutoutSrc, setCutoutSrc] = useState('');
  const [backgroundColor, setBackgroundColor] = useState<string|null>(null);
  const [backgroundChoice, setBackgroundChoice] = useState<string>('#ffffff');
  const [workingSrc, setWorkingSrc] = useState(documents[0]?.src || '');
  const [history, setHistory] = useState<Array<{src:string;box:{x:number;y:number;w:number;h:number};croppedAsset:{src:string;widthMm:number;heightMm:number;name:string}|null;cutoutSrc?:string;backgroundColor?:string|null}>>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [maximized, setMaximized] = useState(false);
  const [cropWorkspaceOpen, setCropWorkspaceOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [targetW, setTargetW] = useState('0');
  const [targetH, setTargetH] = useState('0');
  const [box, setBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [drag, setDrag] = useState<{ corner: string; startX: number; startY: number; initial: typeof box } | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 76, y: 56 });
  const [windowDrag, setWindowDrag] = useState<{ startX:number; startY:number; originX:number; originY:number } | null>(null);
  const [dimensionEditing, setDimensionEditing] = useState(false);
  const [lockRatio, setLockRatio] = useState(false);
  const [notice, setNotice] = useState('');
  const [removingBackground, setRemovingBackground] = useState(false);
  const [addingToA4, setAddingToA4] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({x:54,y:70,width:30});
  const [signatureDrag, setSignatureDrag] = useState<{startX:number;startY:number;initial:{x:number;y:number;width:number}}|null>(null);
  const [naturalSize, setNaturalSize] = useState({width:0,height:0});
  const [editorHydrated, setEditorHydrated] = useState(false);
  const editorSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const active = documents.find(d => d.id === activeId) || documents[0];
  useEffect(() => {
    let cancelled = false;
    setEditorHydrated(false);
    if (!active) { setEditorHydrated(true); return; }
    const initial = { src: active.src, box: {x:0,y:0,w:100,h:100}, croppedAsset: null };
    signedCroppedAssetRef.current = null;
    setWorkingSrc(active.src); setBox(initial.box); setCroppedAsset(null); setCutoutSrc(''); setBackgroundColor(null); setHistory([initial]); setHistoryIndex(0);
    setTargetW('0'); setTargetH('0'); setLockRatio(false); setDimensionEditing(false); setSignaturePosition({x:54,y:70,width:30}); setSignatureDrag(null);
    readEditorState(active.id).then(saved => {
      if (cancelled || !saved) return;
      setWorkingSrc(saved.workingSrc || active.src);
      setBox(saved.box || initial.box);
      setCroppedAsset(saved.croppedAsset || null);
      setCutoutSrc(saved.cutoutSrc || ''); setBackgroundColor(saved.backgroundColor ?? null); setBackgroundChoice(saved.backgroundChoice || saved.backgroundColor || '#ffffff');
      setHistory(saved.history?.length ? saved.history : [initial]);
      setHistoryIndex(Math.max(0, Math.min(saved.historyIndex || 0, (saved.history?.length || 1) - 1)));
      setTargetW(saved.targetW || '0'); setTargetH(saved.targetH || '0');
      setUnit(saved.unit || 'mm'); setCustomUnitName(saved.customUnitName || 'custom');
      setCustomUnitMm(saved.customUnitMm || '1'); setLockRatio(!!saved.lockRatio);
      setDimensionEditing(!!saved.dimensionEditing);
    }).catch(error => console.warn('Manual photo editor recovery could not read its saved state.', error))
      .finally(() => { if (!cancelled) setEditorHydrated(true); });
    return () => { cancelled = true; };
  }, [active?.id]);
  useEffect(() => {
    if (!active || !editorHydrated) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const save = async () => {
        const [savedWorkingSrc, savedHistory, savedCropSrc] = await Promise.all([
          makePersistentSrc(workingSrc || active.src),
          Promise.all(history.map(async item => ({...item, src: await makePersistentSrc(item.src), cutoutSrc:item.cutoutSrc?await makePersistentSrc(item.cutoutSrc):'', croppedAsset:item.croppedAsset?{...item.croppedAsset,src:await makePersistentSrc(item.croppedAsset.src)}:null}))),
          croppedAsset ? makePersistentSrc(croppedAsset.src) : Promise.resolve(null)
        ]);
        if (cancelled) return;
        await writeEditorState(active.id, {
          workingSrc:savedWorkingSrc,box,croppedAsset:croppedAsset?{...croppedAsset,src:savedCropSrc}:null,cutoutSrc:await makePersistentSrc(cutoutSrc),backgroundColor,backgroundChoice,
          history:savedHistory,historyIndex,targetW,targetH,unit,customUnitName,customUnitMm,lockRatio,dimensionEditing,
          savedAt:Date.now()
        });
      };
      editorSaveQueue.current = editorSaveQueue.current.then(save).catch(error => console.warn('Manual photo editor auto-save failed.', error));
    }, 100);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [active?.id,editorHydrated,workingSrc,box,croppedAsset,cutoutSrc,backgroundColor,backgroundChoice,history,historyIndex,targetW,targetH,unit,customUnitName,customUnitMm,lockRatio,dimensionEditing]);
  if (!active) return null;

  // Use the rendered image bounds for pointer math. The editor stage can be
  // affected by flex sizing/zoom, while the crop percentages describe the image.
  const getImageRect = () => imageRef.current?.getBoundingClientRect() || stageRef.current?.getBoundingClientRect() || null;

  const setCorner = (event: React.PointerEvent<HTMLElement>, corner: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ corner, startX: event.clientX, startY: event.clientY, initial: { ...box } });
  };
  const moveCorner = (event: React.PointerEvent<HTMLElement>) => {
    if (!drag || !stageRef.current) return;
    const rect = getImageRect();
    if (!rect || !rect.width || !rect.height) return;
    const dx = (event.clientX - drag.startX) / rect.width * 100;
    const dy = (event.clientY - drag.startY) / rect.height * 100;
    const b = { ...drag.initial };
    const min = 3;
    if (drag.corner.includes('e')) b.w = Math.max(min, Math.min(100 - b.x, b.w + dx));
    if (drag.corner.includes('s')) b.h = Math.max(min, Math.min(100 - b.y, b.h + dy));
    if (drag.corner.includes('w')) { const right = b.x + b.w; b.x = Math.max(0, Math.min(right - min, b.x + dx)); b.w = right - b.x; }
    if (drag.corner.includes('n')) { const bottom = b.y + b.h; b.y = Math.max(0, Math.min(bottom - min, b.y + dy)); b.h = bottom - b.y; }
    const wantedW = Number(targetW), wantedH = Number(targetH);
    if (lockRatio && wantedW > 0 && wantedH > 0 && naturalSize.width > 0 && naturalSize.height > 0) {
      const targetRatio = toMm(wantedW, unit, Number(customUnitMm)||1) / toMm(wantedH, unit, Number(customUnitMm)||1);
      const imageRatio = naturalSize.width / naturalSize.height;
      const ratio = targetRatio / imageRatio;
      // Keep the diagonally opposite corner fixed while locking the requested ratio.
      const anchorX = drag.corner.includes('w') ? drag.initial.x + drag.initial.w : drag.initial.x;
      const anchorY = drag.corner.includes('n') ? drag.initial.y + drag.initial.h : drag.initial.y;
      if (drag.corner.includes('e') || drag.corner.includes('w')) {
        b.h = b.w / ratio;
        b.y = drag.corner.includes('n') ? anchorY - b.h : anchorY;
      } else {
        b.w = b.h * ratio;
        b.x = drag.corner.includes('w') ? anchorX - b.w : anchorX;
      }
      b.w = Math.max(min, Math.min(100, b.w));
      b.h = Math.max(min, Math.min(100, b.h));
      b.x = Math.max(0, Math.min(100 - b.w, b.x));
      b.y = Math.max(0, Math.min(100 - b.h, b.y));
    }
    setBox(b);
  };
  const startWindowDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setWindowDrag({ startX:event.clientX, startY:event.clientY, originX:windowPosition.x, originY:windowPosition.y });
  };
  const moveWindow = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!windowDrag) return;
    setWindowPosition({
      x: Math.max(0, Math.min(window.innerWidth - 180, windowDrag.originX + event.clientX - windowDrag.startX)),
      y: Math.max(0, Math.min(window.innerHeight - 90, windowDrag.originY + event.clientY - windowDrag.startY))
    });
  };
  const startCropDraw = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ corner:'draw', startX:event.clientX, startY:event.clientY, initial:{...box} });
  };
  const startCropMove = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    stageRef.current?.setPointerCapture(event.pointerId);
    // The initial full-photo frame is also the drawing surface: drag from any
    // starting point to create a new custom rectangle instead of moving 100%.
    if (box.x === 0 && box.y === 0 && box.w === 100 && box.h === 100) {
      setDrag({ corner:'draw', startX:event.clientX, startY:event.clientY, initial:{...box} });
    } else {
      setDrag({ corner:'move', startX:event.clientX, startY:event.clientY, initial:{...box} });
    }
  };
  const moveCropBox = (event: React.PointerEvent<HTMLDivElement>) => {
    if (signatureDrag) {
      const rect = getImageRect();
      if (!rect || !rect.width || !rect.height) return;
      setSignaturePosition(current => ({...current, x: Math.max(0, Math.min(100-current.width, signatureDrag.initial.x + (event.clientX-signatureDrag.startX)/rect.width*100)), y: Math.max(0, Math.min(99, signatureDrag.initial.y + (event.clientY-signatureDrag.startY)/rect.height*100))}));
      return;
    }
    if (!drag || !stageRef.current) return;
    // Crop percentages and pointer deltas use the exact same visible stage bounds.
    const rect = getImageRect();
    if (!rect || !rect.width || !rect.height) return;
    if (drag.corner === 'draw') {
      const sx = Math.max(0, Math.min(100, (drag.startX - rect.left) / rect.width * 100));
      const sy = Math.max(0, Math.min(100, (drag.startY - rect.top) / rect.height * 100));
      const ex = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
      const ey = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
      const x = Math.min(sx, ex), y = Math.min(sy, ey);
      const w = Math.abs(ex - sx), h = Math.abs(ey - sy);
      if (w >= 1 && h >= 1) setBox({x,y,w,h});
      return;
    }
    if (drag.corner !== 'move') return;
    const dx = (event.clientX - drag.startX) / rect.width * 100;
    const dy = (event.clientY - drag.startY) / rect.height * 100;
    const maxX = Math.max(0, 100 - drag.initial.w);
    const maxY = Math.max(0, 100 - drag.initial.h);
    setBox({
      ...drag.initial,
      x: Math.max(0, Math.min(maxX, drag.initial.x + dx)),
      y: Math.max(0, Math.min(maxY, drag.initial.y + dy))
    });
  };
  const measuredWidth = naturalSize.width > 0 ? fromMm(naturalSize.width * box.w / 100 * 25.4 / 300, unit, Number(customUnitMm)||1) : 0;
  const measuredHeight = naturalSize.height > 0 ? fromMm(naturalSize.height * box.h / 100 * 25.4 / 300, unit, Number(customUnitMm)||1) : 0;
  const cropOnly = async () => {
    const img = new Image();
    img.src = workingSrc || active.src;
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Image load failed')); });
    let cropBox = { ...box };
    const requestedW = Number(targetW), requestedH = Number(targetH);
    if (requestedW > 0 && requestedH > 0) {
      const wantedRatio = toMm(requestedW, unit, Number(customUnitMm)||1) / toMm(requestedH, unit, Number(customUnitMm)||1);
      const currentPixelW = img.naturalWidth * cropBox.w / 100;
      const currentPixelH = img.naturalHeight * cropBox.h / 100;
      const currentRatio = currentPixelW / currentPixelH;
      if (currentRatio > wantedRatio) {
        const nextW = currentPixelH * wantedRatio / img.naturalWidth * 100;
        cropBox.x += (cropBox.w - nextW) / 2; cropBox.w = nextW;
      } else {
        const nextH = currentPixelW / wantedRatio / img.naturalHeight * 100;
        cropBox.y += (cropBox.h - nextH) / 2; cropBox.h = nextH;
      }
    }
    const sx = Math.round(img.naturalWidth * cropBox.x / 100);
    const sy = Math.round(img.naturalHeight * cropBox.y / 100);
    const sw = Math.max(1, Math.round(img.naturalWidth * cropBox.w / 100));
    const sh = Math.max(1, Math.round(img.naturalHeight * cropBox.h / 100));
    const canvas = document.createElement('canvas');
    canvas.width = sw; canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const widthMm = targetW.trim() && Number(targetW) > 0 ? toMm(Number(targetW), unit, Number(customUnitMm)||1) : sw * 25.4 / 300;
    const heightMm = targetH.trim() && Number(targetH) > 0 ? toMm(Number(targetH), unit, Number(customUnitMm)||1) : sh * 25.4 / 300;
    const src = URL.createObjectURL(blob);
    const nextAsset = {src, widthMm, heightMm, name:active.name.replace(/\.[^.]+$/, '') + '-crop.png'};
    signedCroppedAssetRef.current = null;
    const nextState = { src, box:{x:0,y:0,w:100,h:100}, croppedAsset:nextAsset, cutoutSrc:'', backgroundColor:null };
    setHistory(prev => { const next = [...prev.slice(0, historyIndex + 1), nextState]; setHistoryIndex(next.length - 1); return next; });
    setWorkingSrc(src); setCroppedAsset(nextAsset); setCutoutSrc(''); setBackgroundColor(null); setBox(nextState.box);
    setNotice('Crop applied. Use Undo to restore the previous image or Redo to apply it again.');
  };
  const applyHistory = (nextIndex:number) => {
    const item = history[nextIndex]; if (!item) return;
    signedCroppedAssetRef.current = null;
    setHistoryIndex(nextIndex); setWorkingSrc(item.src); setBox(item.box); setCroppedAsset(item.croppedAsset); setCutoutSrc(item.cutoutSrc || ''); setBackgroundColor(item.backgroundColor ?? null);
    setNotice(nextIndex === 0 ? 'Original image restored.' : 'Crop history restored.');
  };
  const undoCrop = () => applyHistory(Math.max(0, historyIndex - 1));
  const redoCrop = () => applyHistory(Math.min(history.length - 1, historyIndex + 1));
  const applySignatureToCrop = async (): Promise<{src:string;widthMm:number;heightMm:number;name:string}|null> => {
    if (!signatureAsset || !croppedAsset) return null;
    try {
      // Always composite onto the actual cropped image, not the visual overlay.
      const photoSource = croppedAsset.src || workingSrc || active.src;
      const [photo, signature] = await Promise.all([loadImage(photoSource), loadImage(signatureAsset.src)]);
      const canvas = document.createElement('canvas');
      canvas.width = photo.naturalWidth; canvas.height = photo.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(photo, 0, 0);
      const drawWidth = Math.max(1, photo.naturalWidth * Math.max(1, Math.min(100, signaturePosition.width)) / 100);
      const drawHeight = drawWidth * signature.naturalHeight / Math.max(1, signature.naturalWidth);
      const left = Math.max(0, Math.min(photo.naturalWidth - drawWidth, photo.naturalWidth * signaturePosition.x / 100));
      const top = Math.max(0, Math.min(photo.naturalHeight - drawHeight, photo.naturalHeight * signaturePosition.y / 100));
      ctx.drawImage(signature, left, top, drawWidth, drawHeight);
      const src = canvas.toDataURL('image/png');
      if (!src || src === 'data:,') throw new Error('Signed photo could not be created.');
      const baseName = (croppedAsset.name || active.name).replace(/\.[^.]+$/, '');
      const nextAsset = {
        src,
        widthMm: croppedAsset.widthMm || photo.naturalWidth * 25.4 / 300,
        heightMm: croppedAsset.heightMm || photo.naturalHeight * 25.4 / 300,
        name: baseName + '-signed.png'
      };
      signedCroppedAssetRef.current = nextAsset;
      const nextState = { src, box: {x:0,y:0,w:100,h:100}, croppedAsset: nextAsset, cutoutSrc: '', backgroundColor: null };
      setHistory(prev => { const next = [...prev.slice(0, historyIndex + 1), nextState]; setHistoryIndex(next.length - 1); return next; });
      setWorkingSrc(src); setCroppedAsset(nextAsset); setCutoutSrc(''); setBackgroundColor(null);
      setBox(nextState.box); setSignaturePosition({x:54,y:70,width:30}); setSignatureDrag(null);
      onSignatureApplied?.();
      setNotice('Signature merged into the cropped photo. You can now add this merged image to A4.');
      return nextAsset;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not merge the signature into the cropped photo.');
      return null;
    }
  };
  const addCroppedToA4 = async () => {
    if (addingToA4) return;
    setAddingToA4(true);
    setNotice('Preparing the final photo for A4…');
    try {
      let asset = signedCroppedAssetRef.current || croppedAsset || {
        src: workingSrc || active.src,
        name: active.name,
        widthMm: naturalSize.width > 0 ? naturalSize.width * 25.4 / 300 : 45,
        heightMm: naturalSize.height > 0 ? naturalSize.height * 25.4 / 300 : 60
      };
      // If the signature is still a separate draggable overlay, merge it first.
      if (signatureAsset && croppedAsset && !signedCroppedAssetRef.current) {
        const mergedAsset = await applySignatureToCrop();
        if (!mergedAsset) throw new Error('Signature merge failed. The crop editor is still open; adjust the signature and try Merge Signature again.');
        asset = mergedAsset;
      }
      const image = await loadImage(asset.src);
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('The selected photo is empty or invalid.');
      await onUseOnPage({name:asset.name,src:asset.src,widthMm:asset.widthMm,heightMm:asset.heightMm});
      signedCroppedAssetRef.current = null;
      setNotice('Merged photo successfully added to the A4 page.');
      onFinish();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not transfer the photo to A4. Please try again.');
    } finally {
      setAddingToA4(false);
    }
  };
  const removeBackground = async () => {
    if (active.kind !== 'photo' || removingBackground) return;
    signedCroppedAssetRef.current = null;
    setRemovingBackground(true);
    setNotice('AI background removal is starting…');
    try {
      const sourceForRemoval = workingSrc || active.src;
      const blob = await removeBackgroundAI(sourceForRemoval, setNotice);
      const nextSrc = URL.createObjectURL(blob);
      const nextAsset = croppedAsset ? {...croppedAsset,src:nextSrc} : null;
      const nextState = {src:nextSrc,box:{x:0,y:0,w:100,h:100},croppedAsset:nextAsset,cutoutSrc:nextSrc,backgroundColor:null};
      onReplaceSource(active.id, nextSrc);
      setWorkingSrc(nextSrc); setCutoutSrc(nextSrc); setBackgroundColor(null);
      if(nextAsset) setCroppedAsset(nextAsset);
      setBox({x:0,y:0,w:100,h:100});
      setHistory(prev=>{const next=[...prev.slice(0,historyIndex+1),nextState];setHistoryIndex(next.length-1);return next;});
      setNotice('Background removed. Choose a photo background color or keep it transparent.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Background removal could not be completed. Please try again.');
    } finally {
      setRemovingBackground(false);
    }
  };
  const handleReset = () => { setBox({x:0,y:0,w:100,h:100}); setLockRatio(false); setDimensionEditing(false); setTargetW('0'); setTargetH('0'); setNotice('Crop selection reset.'); };
  const applyPhotoBackground = async () => {
    signedCroppedAssetRef.current = null;
    if (!cutoutSrc) { setNotice('पहले Remove BG करें, फिर Background Color चुनें।'); return; }
    try {
      const img = new Image();
      img.src = cutoutSrc;
      await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Cutout image could not be loaded'));});
      const canvas=document.createElement('canvas'); canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d'); if(!ctx) return;
      if(backgroundChoice!=='transparent'){ctx.fillStyle=backgroundChoice;ctx.fillRect(0,0,canvas.width,canvas.height);}
      ctx.drawImage(img,0,0);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!blob) throw new Error('Could not create the background image');
      const nextSrc=URL.createObjectURL(blob);
      const nextAsset={src:nextSrc,widthMm:croppedAsset?.widthMm||(naturalSize.width*25.4/300),heightMm:croppedAsset?.heightMm||(naturalSize.height*25.4/300),name:croppedAsset?.name||active.name.replace(/\.[^.]+$/,'')+'-background.png'};
      const nextState={src:nextSrc,box:{x:0,y:0,w:100,h:100},croppedAsset:nextAsset,cutoutSrc,backgroundColor:backgroundChoice==='transparent'?null:backgroundChoice};
      setWorkingSrc(nextSrc); setCroppedAsset(nextAsset); setBackgroundColor(nextState.backgroundColor);
      setHistory(prev=>{const next=[...prev.slice(0,historyIndex+1),nextState];setHistoryIndex(next.length-1);return next;});
      setNotice(backgroundChoice==='transparent'?'Transparent background kept.':'Photo background color applied.');
      onToggleBackgroundPicker?.();
    } catch(error) { setNotice(error instanceof Error?error.message:'Could not apply photo background.'); }
  };


  const startStagePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropMode || !imageRef.current) return;
    const rect = getImageRect();
    if (!rect || !rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width * 100;
    const py = (event.clientY - rect.top) / rect.height * 100;
    const inside = box.w > 0 && box.h > 0 && px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
    if (inside && !(box.x === 0 && box.y === 0 && box.w === 100 && box.h === 100)) {
      event.preventDefault(); event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({corner:'move',startX:event.clientX,startY:event.clientY,initial:{...box}});
    } else {
      startCropDraw(event);
    }
  };
  return <>
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">Unit
        <select value={unit} onPointerDown={e=>e.stopPropagation()} onChange={e=>{const next=e.target.value as Unit;const w=Number(targetW),h=Number(targetH);if(w>0)setTargetW(fromMm(toMm(w,unit,Number(customUnitMm)||1),next,Number(customUnitMm)||1).toFixed(2));if(h>0)setTargetH(fromMm(toMm(h,unit,Number(customUnitMm)||1),next,Number(customUnitMm)||1).toFixed(2));setUnit(next);setDimensionEditing(false);}} className="studio-control h-8 w-[68px] px-1 text-[10px]"><option value="mm">MM</option><option value="cm">CM</option><option value="in">Inch</option><option value="custom">Custom</option></select>
      </label>
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">W
        <input aria-label="Crop width" type="number" min="0" step="0.1" value={dimensionEditing ? targetW : (Number(targetW)>0 ? targetW : measuredWidth.toFixed(2))} onPointerDown={e=>e.stopPropagation()} onFocus={()=>{if(!dimensionEditing){setTargetW(Number(targetW)>0?targetW:measuredWidth.toFixed(2));setTargetH(Number(targetH)>0?targetH:measuredHeight.toFixed(2));setDimensionEditing(true);}}} onBlur={()=>setDimensionEditing(false)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void cropOnly();}}} onChange={e=>{setTargetW(e.target.value);setLockRatio(true);}} className="studio-control h-8 w-[76px] px-1 text-[10px]"/>
      </label>
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">H
        <input aria-label="Crop height" type="number" min="0" step="0.1" value={dimensionEditing ? targetH : (Number(targetH)>0 ? targetH : measuredHeight.toFixed(2))} onPointerDown={e=>e.stopPropagation()} onFocus={()=>{if(!dimensionEditing){setTargetW(Number(targetW)>0?targetW:measuredWidth.toFixed(2));setTargetH(Number(targetH)>0?targetH:measuredHeight.toFixed(2));setDimensionEditing(true);}}} onBlur={()=>setDimensionEditing(false)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void cropOnly();}}} onChange={e=>{setTargetH(e.target.value);setLockRatio(true);}} className="studio-control h-8 w-[76px] px-1 text-[10px]"/>
      </label>
      {unit==='custom'&&<input aria-label="Custom unit millimetres" type="number" min="0.0001" step="any" value={customUnitMm} onPointerDown={e=>e.stopPropagation()} onChange={e=>setCustomUnitMm(e.target.value)} className="studio-control h-8 w-[68px] px-1 text-[10px]" title="1 custom unit = mm"/>}
      <button onClick={()=>onDuplicate(active.id)} className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 text-[9px]"><Copy size={11} className="mr-1 inline"/>Duplicate</button>
      {active.kind==='photo'&&<button onClick={()=>void removeBackground()} disabled={removingBackground} className="shrink-0 rounded border border-[#6b806e] px-2 py-1.5 text-[9px] text-[#c6e2cf] disabled:opacity-50">{removingBackground?'Removing…':'Remove BG'}</button>}
      <button onClick={undoCrop} disabled={historyIndex===0} title="Undo" className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 disabled:opacity-35"><Undo2 size={13}/></button>
      <button onClick={redoCrop} disabled={historyIndex>=history.length-1} title="Redo" className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 disabled:opacity-35"><Redo2 size={13}/></button>{croppedAsset&&<button onClick={()=>{applyHistory(0);setTargetW('0');setTargetH('0');setLockRatio(false);setDimensionEditing(false);setNotice('Original photo restored. Select a new crop, then press Crop / OK.');}} title="Restore the original source photo to make a fresh crop" className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 text-[9px]">Re-crop Original</button>}
      <button onClick={handleReset} className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 text-[9px]"><RotateCcw size={11} className="mr-1 inline"/>Reset</button>
      <button onClick={()=>{onActiveChange(active.id);void cropOnly();}} className="shrink-0 rounded bg-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#171b20]"><Check size={11} className="mr-1 inline"/>Crop / OK</button>{signatureAsset&&<button disabled={!croppedAsset} title={croppedAsset?"Merge the positioned signature into this cropped photo":"पहले Crop / OK दबाकर फोटो क्रॉप करें"} onClick={()=>void applySignatureToCrop()} className="shrink-0 rounded border border-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#f0c895] disabled:cursor-not-allowed disabled:opacity-40">Merge Signature</button>}
      {<button onClick={()=>void addCroppedToA4()} disabled={!workspaceOpen||addingToA4} title={workspaceOpen?"Add the current photo to A4":"Photo is already on the A4 workspace"} className="shrink-0 rounded border border-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#f0c895] disabled:opacity-40">{addingToA4?'Adding…':'Add to A4'}</button>}{workspaceOpen?<button onClick={()=>{onClose(active.id);onFinish();}} title="Close photo workspace" className="shrink-0 rounded border border-[#53606c] p-1.5"><X size={13}/></button>:<button onClick={()=>{onActiveChange(active.id);onOpen?.();}} className="shrink-0 rounded border border-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#f0c895]">Back to Crop</button>}
    </div>
    {workspaceOpen&&<div className="absolute bottom-0 left-[64px] right-[270px] top-[128px] z-30 flex min-h-0 items-center justify-center overflow-auto border-y border-[#414a54] bg-[#151b22] p-3">
      {cropMode&&<div className="absolute left-4 top-3 z-20 rounded border border-red-500/60 bg-[#351b1b] px-3 py-1.5 text-[10px] text-red-100">Crop mode: selection के अंदर खींचें = Move · बाहर खींचें = नया Crop · किनारे/कोने = Resize</div>}
      {backgroundPickerOpen&&<div className="absolute left-3 top-12 z-40 w-[238px] rounded-xl border border-[#566371] bg-[#202832] p-3 text-[#e7edf3] shadow-2xl">
        <div className="mb-2 flex items-center justify-between"><strong className="text-[11px]">Photo Background</strong><button onClick={()=>onToggleBackgroundPicker?.()} className="rounded px-1.5 py-0.5 text-xs text-[#aeb8c2] hover:bg-[#35414d]">✕</button></div>
        <p className="mb-2 text-[9px] leading-4 text-[#aeb8c2]">यह रंग केवल Remove BG किए गए क्रॉप फोटो के पीछे लगेगा, A4 पेज पर नहीं।</p>
        <div className="mb-2 grid grid-cols-4 gap-2">
          {[['Transparent','transparent'],['White','#ffffff'],['Blue','#1677d2'],['Light Blue','#8ecbff'],['Red','#e53935'],['Green','#16834a'],['Yellow','#ffd43b'],['Black','#111827'],['Grey','#9ca3af'],['Navy','#142b52'],['Pink','#f4a6c1'],['Cream','#f4e7c5']].map(([label,value])=><button key={value} title={label} onClick={()=>setBackgroundChoice(value)} className={'flex flex-col items-center gap-1 rounded-lg border p-1.5 '+(backgroundChoice===value?'border-[#e8bd88] bg-[#35414d]':'border-[#46525f] hover:bg-[#2b3540]')}><span className="h-6 w-6 rounded-full border border-white/30" style={value==='transparent'?{backgroundImage:'linear-gradient(45deg,#697582 25%,transparent 25%),linear-gradient(-45deg,#697582 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#697582 75%),linear-gradient(-45deg,transparent 75%,#697582 75%)',backgroundSize:'8px 8px',backgroundPosition:'0 0,0 4px,4px -4px,-4px 0'}:{backgroundColor:value}}/><span className="text-[8px]">{label}</span></button>)}
        </div>
        <label className="mb-3 flex items-center justify-between rounded-lg border border-[#46525f] px-2 py-2 text-[9px]">Custom color <input aria-label="Custom photo background color" type="color" value={backgroundChoice==='transparent'?'#ffffff':backgroundChoice} onChange={e=>setBackgroundChoice(e.target.value)} className="h-7 w-10 cursor-pointer rounded bg-transparent"/></label>
        {!cutoutSrc&&<p className="mb-2 rounded bg-[#3a3030] px-2 py-1.5 text-[9px] text-[#f0c4b9]">पहले ऊपर Remove BG करें।</p>}
        <button disabled={!cutoutSrc} onClick={()=>void applyPhotoBackground()} className="w-full rounded-lg bg-[#d5a66e] py-2 text-[10px] font-semibold text-[#171b20] disabled:cursor-not-allowed disabled:opacity-40">OK · Apply to Cropped Photo</button>
      </div>}
      <div ref={stageRef} onPointerDown={startStagePointer} onPointerMove={moveCropBox} onPointerUp={e=>{setDrag(null);setSignatureDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{setDrag(null);setSignatureDrag(null);}} onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-tanshu-signature-src'))e.preventDefault();}} onDrop={e=>{const src=e.dataTransfer.getData('application/x-tanshu-signature-src')||e.dataTransfer.getData('text/plain');if(!src)return;e.preventDefault();const rect=getImageRect();if(rect?.width&&rect.height)setSignaturePosition(current=>({...current,x:Math.max(0,Math.min(100-current.width,(e.clientX-rect.left)/rect.width*100)),y:Math.max(0,Math.min(99,(e.clientY-rect.top)/rect.height*100))}));onSignatureDrop?.({name:'Cleaned Signature.png',src});}} className="relative flex h-full max-h-full max-w-full shrink-0 items-center justify-center select-none" style={{touchAction:'none'}}>
        <img ref={imageRef} src={workingSrc||active.src} alt={active.name} draggable={false} onLoad={e=>setNaturalSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} className="block h-auto w-auto max-h-full max-w-full object-contain"/>{signatureAsset&&croppedAsset&&<img data-signature-overlay src={signatureAsset.src} alt="Signature placement — drag to position" draggable={false} onPointerDown={e=>{e.preventDefault();e.stopPropagation();stageRef.current?.setPointerCapture(e.pointerId);setSignatureDrag({startX:e.clientX,startY:e.clientY,initial:{...signaturePosition}});}} onPointerUp={e=>{setSignatureDrag(null);if(stageRef.current?.hasPointerCapture(e.pointerId))stageRef.current.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setSignatureDrag(null)} className="absolute z-20 max-w-none cursor-grab touch-none active:cursor-grabbing" style={{left:signaturePosition.x+'%',top:signaturePosition.y+'%',width:signaturePosition.width+'%',height:'auto',pointerEvents:'auto'}}/>}
        {cropMode&&<><div aria-hidden="true" className="pointer-events-none absolute z-[5] border-2 border-red-500 bg-red-500/[0.04]" style={{left:box.x+'%',top:box.y+'%',width:box.w+'%',height:box.h+'%'}}/>
          {!(box.x===0&&box.y===0&&box.w===100&&box.h===100)&&(['nw','n','ne','e','se','s','sw','w'] as const).map(handle=><button key={handle} aria-label={'Crop '+handle} title={'Resize crop '+handle} onPointerDown={e=>setCorner(e,handle)} onPointerMove={moveCorner} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} onClick={e=>e.stopPropagation()} className={'absolute z-10 rounded-full border-2 border-[#fecaca] bg-red-600 shadow-[0_0_0_2px_rgba(0,0,0,.45)] touch-none '+(handle==='n'||handle==='s'?'h-3 w-5':'h-5 w-3')} style={{left:handle.includes('w')?box.x+'%':handle.includes('e')?(box.x+box.w)+'%':(box.x+box.w/2)+'%',top:handle.includes('n')?box.y+'%':handle.includes('s')?(box.y+box.h)+'%':(box.y+box.h/2)+'%',transform:'translate(-50%,-50%)',touchAction:'none',cursor:handle==='n'||handle==='s'?'ns-resize':handle==='e'||handle==='w'?'ew-resize':handle==='nw'||handle==='se'?'nwse-resize':'nesw-resize'}}/>)}
        </>}
      </div>
      {notice&&<div className="absolute bottom-2 left-3 rounded bg-[#26332c] px-3 py-1.5 text-[10px] text-[#b8d6c4]">{notice}</div>}
    </div>}
  </>;
};
