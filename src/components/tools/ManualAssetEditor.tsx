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
  onUseOnPage: (asset: { name: string; src: string; widthMm: number; heightMm: number }) => void;
  onFinish: () => void;
  cropMode?: boolean;
};

type Unit = 'mm' | 'cm' | 'in' | 'custom';
const toMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value * 10 : unit === 'in' ? value * 25.4 : value * customMm;
const fromMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value / 10 : unit === 'in' ? value / 25.4 : value / Math.max(0.0001, customMm);

export const ManualAssetEditor: React.FC<Props> = ({ documents, activeId, onActiveChange, onClose, onDuplicate, onReplaceSource, onUseOnPage, onFinish, cropMode = false }) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [customUnitName, setCustomUnitName] = useState('custom');
  const [customUnitMm, setCustomUnitMm] = useState('1');
  const [croppedAsset, setCroppedAsset] = useState<{src:string;widthMm:number;heightMm:number;name:string}|null>(null);
  const [workingSrc, setWorkingSrc] = useState(documents[0]?.src || '');
  const [history, setHistory] = useState<Array<{src:string;box:{x:number;y:number;w:number;h:number};croppedAsset:{src:string;widthMm:number;heightMm:number;name:string}|null}>>([]);
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
  const [naturalSize, setNaturalSize] = useState({width:0,height:0});
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const active = documents.find(d => d.id === activeId) || documents[0];
  useEffect(() => {
    if (!active) return;
    const initial = { src: active.src, box: {x:0,y:0,w:100,h:100}, croppedAsset: null };
    setWorkingSrc(active.src); setBox(initial.box); setCroppedAsset(null); setHistory([initial]); setHistoryIndex(0);
    setTargetW('0'); setTargetH('0'); setLockRatio(false); setDimensionEditing(false);
  }, [active?.id]);
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
    const nextState = { src, box:{x:0,y:0,w:100,h:100}, croppedAsset:nextAsset };
    setHistory(prev => { const next = [...prev.slice(0, historyIndex + 1), nextState]; setHistoryIndex(next.length - 1); return next; });
    setWorkingSrc(src); setCroppedAsset(nextAsset); setBox(nextState.box);
    setNotice('Crop applied. Use Undo to restore the previous image or Redo to apply it again.');
  };
  const applyHistory = (nextIndex:number) => {
    const item = history[nextIndex]; if (!item) return;
    setHistoryIndex(nextIndex); setWorkingSrc(item.src); setBox(item.box); setCroppedAsset(item.croppedAsset);
    setNotice(nextIndex === 0 ? 'Original image restored.' : 'Crop history restored.');
  };
  const undoCrop = () => applyHistory(Math.max(0, historyIndex - 1));
  const redoCrop = () => applyHistory(Math.min(history.length - 1, historyIndex + 1));
  const addCroppedToA4 = () => {
    const asset = croppedAsset || {
      src: workingSrc || active.src,
      name: active.name,
      widthMm: naturalSize.width > 0 ? naturalSize.width * 25.4 / 300 : 45,
      heightMm: naturalSize.height > 0 ? naturalSize.height * 25.4 / 300 : 60
    };
    onUseOnPage({name:asset.name,src:asset.src,widthMm:asset.widthMm,heightMm:asset.heightMm});
    setNotice(croppedAsset ? 'Cropped photo added to the A4 page. Source document remains open.' : 'Original photo added to the A4 page at its proportional source size.');
  };
  const removeBackground = async () => {
    if (active.kind !== 'photo' || removingBackground) return;
    setRemovingBackground(true);
    setNotice('AI background removal is starting…');
    try {
      const blob = await removeBackgroundAI(active.src, setNotice);
      const nextSrc = URL.createObjectURL(blob);
      onReplaceSource(active.id, nextSrc);
      setBox({x:0,y:0,w:100,h:100});
      setNotice('Background removed. The original remains available in its separate document if you duplicated it first.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Background removal could not be completed. Please try again.');
    } finally {
      setRemovingBackground(false);
    }
  };
  const handleReset = () => { setBox({x:0,y:0,w:100,h:100}); setLockRatio(false); setDimensionEditing(false); setTargetW('0'); setTargetH('0'); setNotice('Crop selection reset.'); };

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
      <select aria-label="Active imported photo" value={active.id} onChange={e=>{onActiveChange(e.target.value);}} className="studio-control h-8 max-w-[130px] px-1 text-[10px]">
        {documents.map(doc=><option key={doc.id} value={doc.id}>{doc.kind==='signature'?'Signature':'Photo'} · {doc.name}</option>)}
      </select>
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">Unit
        <select value={unit} onPointerDown={e=>e.stopPropagation()} onChange={e=>{setUnit(e.target.value as Unit);setDimensionEditing(false);}} className="studio-control h-8 w-[68px] px-1 text-[10px]"><option value="mm">MM</option><option value="cm">CM</option><option value="in">Inch</option><option value="custom">Custom</option></select>
      </label>
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">W
        <input aria-label="Crop width" type="number" min="0" step="0.1" value={dimensionEditing ? targetW : measuredWidth.toFixed(2)} onPointerDown={e=>e.stopPropagation()} onFocus={()=>{if(!dimensionEditing){setTargetW(targetW||measuredWidth.toFixed(2));setTargetH(targetH||measuredHeight.toFixed(2));setDimensionEditing(true);}}} onBlur={()=>setDimensionEditing(false)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void cropOnly();}}} onChange={e=>{setTargetW(e.target.value);setLockRatio(true);}} className="studio-control h-8 w-[76px] px-1 text-[10px]"/>
      </label>
      <label className="flex shrink-0 items-center gap-1 text-[9px] text-[#aeb8c2]">H
        <input aria-label="Crop height" type="number" min="0" step="0.1" value={dimensionEditing ? targetH : measuredHeight.toFixed(2)} onPointerDown={e=>e.stopPropagation()} onFocus={()=>{if(!dimensionEditing){setTargetW(targetW||measuredWidth.toFixed(2));setTargetH(targetH||measuredHeight.toFixed(2));setDimensionEditing(true);}}} onBlur={()=>setDimensionEditing(false)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void cropOnly();}}} onChange={e=>{setTargetH(e.target.value);setLockRatio(true);}} className="studio-control h-8 w-[76px] px-1 text-[10px]"/>
      </label>
      {unit==='custom'&&<input aria-label="Custom unit millimetres" type="number" min="0.0001" step="any" value={customUnitMm} onPointerDown={e=>e.stopPropagation()} onChange={e=>setCustomUnitMm(e.target.value)} className="studio-control h-8 w-[68px] px-1 text-[10px]" title="1 custom unit = mm"/>}
      <button onClick={()=>onDuplicate(active.id)} className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 text-[9px]"><Copy size={11} className="mr-1 inline"/>Duplicate</button>
      {active.kind==='photo'&&<button onClick={()=>void removeBackground()} disabled={removingBackground} className="shrink-0 rounded border border-[#6b806e] px-2 py-1.5 text-[9px] text-[#c6e2cf] disabled:opacity-50">{removingBackground?'Removing…':'Remove BG'}</button>}
      <button onClick={undoCrop} disabled={historyIndex===0} title="Undo" className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 disabled:opacity-35"><Undo2 size={13}/></button>
      <button onClick={redoCrop} disabled={historyIndex>=history.length-1} title="Redo" className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 disabled:opacity-35"><Redo2 size={13}/></button>
      <button onClick={handleReset} className="shrink-0 rounded border border-[#53606c] px-2 py-1.5 text-[9px]"><RotateCcw size={11} className="mr-1 inline"/>Reset</button>
      <button onClick={()=>void cropOnly()} className="shrink-0 rounded bg-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#171b20]"><Check size={11} className="mr-1 inline"/>Crop / OK</button>
      <button onClick={addCroppedToA4} className="shrink-0 rounded border border-[#d5a66e] px-2 py-1.5 text-[9px] font-semibold text-[#f0c895]">Add to A4</button>
      <button onClick={()=>{onClose(active.id);onFinish();}} title="Close photo workspace" className="shrink-0 rounded border border-[#53606c] p-1.5"><X size={13}/></button>
    </div>
    <div className="absolute inset-x-0 bottom-8 top-12 z-30 flex min-h-0 items-center justify-center overflow-auto border-y border-[#414a54] bg-[#151b22] p-4">
      {cropMode&&<div className="absolute left-4 top-3 z-20 rounded border border-red-500/60 bg-[#351b1b] px-3 py-1.5 text-[10px] text-red-100">Crop mode: selection के अंदर खींचें = Move · बाहर खींचें = नया Crop · किनारे/कोने = Resize</div>}
      <div ref={stageRef} onPointerDown={startStagePointer} onPointerMove={moveCropBox} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} className="relative inline-block h-fit w-fit shrink-0 select-none" style={{touchAction:'none'}}>
        <img ref={imageRef} src={workingSrc||active.src} alt={active.name} draggable={false} onLoad={e=>setNaturalSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} className="block h-auto w-auto max-h-[min(68vh,760px)] max-w-[min(88vw,1200px)] object-contain"/>
        {cropMode&&<><div aria-hidden="true" className="pointer-events-none absolute z-[5] border-2 border-red-500 bg-red-500/[0.04]" style={{left:box.x+'%',top:box.y+'%',width:box.w+'%',height:box.h+'%'}}/>
          {!(box.x===0&&box.y===0&&box.w===100&&box.h===100)&&(['nw','n','ne','e','se','s','sw','w'] as const).map(handle=><button key={handle} aria-label={'Crop '+handle} title={'Resize crop '+handle} onPointerDown={e=>setCorner(e,handle)} onPointerMove={moveCorner} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} onClick={e=>e.stopPropagation()} className={'absolute z-10 rounded-full border-2 border-[#fecaca] bg-red-600 shadow-[0_0_0_2px_rgba(0,0,0,.45)] touch-none '+(handle==='n'||handle==='s'?'h-3 w-5':'h-5 w-3')} style={{left:handle.includes('w')?box.x+'%':handle.includes('e')?(box.x+box.w)+'%':(box.x+box.w/2)+'%',top:handle.includes('n')?box.y+'%':handle.includes('s')?(box.y+box.h)+'%':(box.y+box.h/2)+'%',transform:'translate(-50%,-50%)',touchAction:'none',cursor:handle==='n'||handle==='s'?'ns-resize':handle==='e'||handle==='w'?'ew-resize':handle==='nw'||handle==='se'?'nwse-resize':'nesw-resize'}}/>)}
        </>}
      </div>
      {notice&&<div className="absolute bottom-2 left-3 rounded bg-[#26332c] px-3 py-1.5 text-[10px] text-[#b8d6c4]">{notice}</div>}
    </div>
  </>;
};
