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
};

type Unit = 'mm' | 'cm' | 'in' | 'custom';
const toMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value * 10 : unit === 'in' ? value * 25.4 : value * customMm;
const fromMm = (value: number, unit: Unit, customMm = 1) => unit === 'mm' ? value : unit === 'cm' ? value / 10 : unit === 'in' ? value / 25.4 : value / Math.max(0.0001, customMm);

export const ManualAssetEditor: React.FC<Props> = ({ documents, activeId, onActiveChange, onClose, onDuplicate, onReplaceSource, onUseOnPage }) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [customUnitName, setCustomUnitName] = useState('custom');
  const [customUnitMm, setCustomUnitMm] = useState('1');
  const [croppedAsset, setCroppedAsset] = useState<{src:string;widthMm:number;heightMm:number;name:string}|null>(null);
  const [workingSrc, setWorkingSrc] = useState(documents[0]?.src || '');
  const [history, setHistory] = useState<Array<{src:string;box:{x:number;y:number;w:number;h:number};croppedAsset:{src:string;widthMm:number;heightMm:number;name:string}|null}>>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [maximized, setMaximized] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [targetW, setTargetW] = useState('0');
  const [targetH, setTargetH] = useState('0');
  const [box, setBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [drag, setDrag] = useState<{ corner: string; startX: number; startY: number; initial: typeof box } | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 12, y: 12 });
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

  const setCorner = (event: React.PointerEvent<HTMLElement>, corner: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ corner, startX: event.clientX, startY: event.clientY, initial: { ...box } });
  };
  const moveCorner = (event: React.PointerEvent<HTMLElement>) => {
    if (!drag || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
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
  const startCropMove = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ corner:'move', startX:event.clientX, startY:event.clientY, initial:{...box} });
  };
  const moveCropBox = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.corner !== 'move' || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const dx = (event.clientX - drag.startX) / rect.width * 100;
    const dy = (event.clientY - drag.startY) / rect.height * 100;
    setBox({
      ...drag.initial,
      x: Math.max(0, Math.min(100 - drag.initial.w, drag.initial.x + dx)),
      y: Math.max(0, Math.min(100 - drag.initial.h, drag.initial.y + dy))
    });
  };
  const measuredWidth = naturalSize.width > 0 ? fromMm(naturalSize.width * box.w / 100 * 25.4 / 300, unit, Number(customUnitMm)||1) : 0;
  const measuredHeight = naturalSize.height > 0 ? fromMm(naturalSize.height * box.h / 100 * 25.4 / 300, unit, Number(customUnitMm)||1) : 0;
  const cropOnly = async () => {
    const img = new Image();
    img.src = workingSrc || active.src;
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Image load failed')); });
    const sx = Math.round(img.naturalWidth * box.x / 100);
    const sy = Math.round(img.naturalHeight * box.y / 100);
    const sw = Math.max(1, Math.round(img.naturalWidth * box.w / 100));
    const sh = Math.max(1, Math.round(img.naturalHeight * box.h / 100));
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
    if (!croppedAsset) { setNotice('First click Crop to prepare the cropped asset.'); return; }
    onUseOnPage({name:croppedAsset.name,src:croppedAsset.src,widthMm:croppedAsset.widthMm,heightMm:croppedAsset.heightMm});
    setNotice('Cropped asset added to the A4 page. Source document remains open.');
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

  if (minimized) return <button onClick={() => setMinimized(false)} className="absolute bottom-3 right-3 z-[60] flex items-center gap-2 rounded-lg border border-[#687582] bg-[#20262d] px-4 py-3 text-xs text-white shadow-2xl"><Maximize2 size={14}/> Asset Editor · {documents.length} document{documents.length===1?'':'s'}</button>;
  return <div onPointerMove={moveWindow} onPointerUp={() => setWindowDrag(null)} className="absolute z-40 flex min-h-[260px] min-w-[360px] flex-col overflow-hidden rounded-xl border border-[#58616b] bg-[#20262d] shadow-2xl"
    style={{ left:windowPosition.x, top:windowPosition.y, width:maximized?'calc(100% - 24px)':'min(900px, calc(100% - 24px))', height:maximized?'calc(100% - 24px)':'min(680px, calc(100% - 24px))', resize:maximized?'none':'both' }}>
    <div onPointerDown={startWindowDrag} onPointerUp={() => setWindowDrag(null)} className="flex h-11 shrink-0 cursor-move items-center gap-2 border-b border-[#414a54] px-3">
      <strong className="mr-2 select-none text-xs tracking-wide">ASSET EDITOR</strong>
      <span className="max-w-[150px] truncate text-[10px] text-[#9eabb7]">{(active.name.split(/[\\\\/]/).pop() || 'Untitled').split('?')[0].slice(0,24)}</span>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{documents.map(doc => <button key={doc.id} onClick={() => { onActiveChange(doc.id); setBox({x:0,y:0,w:100,h:100}); setLockRatio(false); setDimensionEditing(false); }} className={'flex shrink-0 items-center gap-2 rounded-t px-3 py-2 text-[10px] ' + (doc.id===active.id?'bg-[#3b4651] text-white':'text-[#aeb8c2] hover:bg-[#303943]')}>{doc.kind==='signature'?'Signature':'Photo'} · {(doc.name.split(/[\\\\/]/).pop() || 'Untitled').split('?')[0].slice(0,28)}<span onClick={e=>{e.stopPropagation();onClose(doc.id);}} className="ml-1 rounded p-0.5 hover:bg-black/20"><X size={11}/></span></button>)}</div>
      <button title="Minimize" onClick={()=>setMinimized(true)} className="rounded border border-[#4b5661] p-1.5"><Minimize2 size={13}/></button>
      <button title={maximized?'Restore size':'Maximize'} onClick={()=>setMaximized(v=>!v)} className="rounded border border-[#4b5661] p-1.5"><Maximize2 size={13}/></button>
      <button title="Close active document" onClick={()=>onClose(active.id)} className="rounded border border-[#4b5661] p-1.5"><X size={13}/></button>
    </div>
    {!minimized && <>
      <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-[#414a54] p-3">
        <label className="text-[10px] text-[#aeb8c2]">Unit<select value={unit} onChange={e=>{setUnit(e.target.value as Unit);setDimensionEditing(false);setTargetW('0');setTargetH('0');}} className="studio-control mt-1 block h-8 w-24 px-2"><option value="mm">MM</option><option value="cm">CM</option><option value="in">Inch</option><option value="custom">Custom</option></select></label>
        {unit==='custom'&&<><label className="text-[10px] text-[#aeb8c2]">Custom label<input value={customUnitName} onChange={e=>setCustomUnitName(e.target.value)} className="studio-control mt-1 block h-8 w-24 px-2"/></label><label className="text-[10px] text-[#aeb8c2]">1 {customUnitName||'unit'} = mm<input type="number" min="0.0001" step="any" value={customUnitMm} onChange={e=>setCustomUnitMm(e.target.value)} className="studio-control mt-1 block h-8 w-24 px-2"/></label></>}
        <label className="text-[10px] text-[#aeb8c2]">Crop width ({unit==='custom'?(customUnitName||'custom'):unit})<input type="number" min="0" step="0.1" value={dimensionEditing ? targetW : measuredWidth.toFixed(2)} onFocus={()=>{setTargetW(measuredWidth.toFixed(2));setTargetH(measuredHeight.toFixed(2));setDimensionEditing(true);}} onBlur={()=>setDimensionEditing(false)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void cropOnly();}}} onChange={e=>{setTargetW(e.target.value);setLockRatio(true);}} className="studio-control mt-1 block h-8 w-28 px-2"/></label>
        <label className="text-[10px] text-[#aeb8c2]">Crop height ({unit==='custom'?(customUnitName||'custom'):unit})<input type="number" min="0" step="0.1" value={dimensionEditing ? targetH : measuredHeight.toFixed(2)} onFocus={()=>setDimensionEditing(true)} onBlur={()=>{setDimensionEditing(false);setTargetW(measuredWidth.toFixed(2));setTargetH(measuredHeight.toFixed(2));}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void cropOnly();}}} onChange={e=>{setTargetH(e.target.value);setLockRatio(true);}} className="studio-control mt-1 block h-8 w-28 px-2"/></label>
        <span className="pb-2 text-[9px] text-[#8996a2]">Live crop size · 300 DPI · {measuredWidth.toFixed(2)} × {measuredHeight.toFixed(2)} {unit==='custom'?(customUnitName||'custom'):unit}</span>
        <div className="ml-auto flex flex-wrap gap-1"><button onClick={()=>onDuplicate(active.id)} className="rounded border border-[#53606c] px-3 py-2 text-[10px]"><Copy size={12} className="mr-1 inline"/>Duplicate Document</button>{active.kind==='photo'&&<button onClick={()=>void removeBackground()} disabled={removingBackground} className="rounded border border-[#6b806e] px-3 py-2 text-[10px] text-[#c6e2cf] disabled:opacity-50">{removingBackground?'Removing…':'Remove Background'}</button>}<button onClick={undoCrop} disabled={historyIndex===0} title="Undo crop" className="rounded border border-[#53606c] px-2 py-2 text-[10px] disabled:opacity-35"><Undo2 size={14}/></button><button onClick={redoCrop} disabled={historyIndex>=history.length-1} title="Redo crop" className="rounded border border-[#53606c] px-2 py-2 text-[10px] disabled:opacity-35"><Redo2 size={14}/></button><button onClick={handleReset} className="rounded border border-[#53606c] px-3 py-2 text-[10px]"><RotateCcw size={12} className="mr-1 inline"/>Reset</button><button onClick={()=>void cropOnly()} className="rounded bg-[#d5a66e] px-3 py-2 text-[10px] font-semibold text-[#171b20]"><Check size={12} className="mr-1 inline"/>Crop / OK</button><button onClick={addCroppedToA4} disabled={!croppedAsset} className="rounded border border-[#d5a66e] px-3 py-2 text-[10px] font-semibold text-[#f0c895] disabled:cursor-not-allowed disabled:opacity-40">Add to A4</button></div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#151a1f] p-6">
        <div className="absolute bottom-10 left-4 z-20 flex items-center gap-1 rounded-lg border border-[#4b5661] bg-[#20262d] p-1 text-white"><button title="Zoom out" onClick={()=>setZoom(v=>Math.max(.5,Number((v-.25).toFixed(2))))} className="rounded px-2 py-1 text-xs">−</button><span className="min-w-12 text-center text-[10px]">{Math.round(zoom*100)}%</span><button title="Zoom in" onClick={()=>setZoom(v=>Math.min(3,Number((v+.25).toFixed(2))))} className="rounded px-2 py-1 text-xs">+</button><button title="Reset zoom" onClick={()=>setZoom(1)} className="rounded px-2 py-1 text-[10px]">Fit</button></div>
        <div ref={stageRef} className="relative max-h-full max-w-full select-none" style={{aspectRatio:'auto',touchAction:'none',transform:`scale(${zoom})`,transformOrigin:'center center'}}> 
          <img ref={imageRef} src={workingSrc || active.src} alt={active.name} draggable={false} onLoad={e=>setNaturalSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} className="block max-h-[calc(100vh-250px)] max-w-full object-contain"/>
          <div aria-label="Move crop selection" title="Grab anywhere inside the red crop frame to move the entire selection" onPointerDown={startCropMove} onPointerMove={moveCropBox} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} className="absolute z-[5] cursor-move border-2 border-red-500 bg-red-500/[0.04] touch-none" style={{left:box.x+'%',top:box.y+'%',width:box.w+'%',height:box.h+'%',touchAction:'none'}}/>
          {(['nw','ne','sw','se'] as const).map(corner=><button key={corner} aria-label={'Crop '+corner} onPointerDown={e=>setCorner(e,corner)} onPointerMove={moveCorner} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} onClick={e=>e.stopPropagation()} className="absolute z-10 h-5 w-5 rounded-full border-2 border-[#fecaca] bg-red-600 shadow-[0_0_0_2px_rgba(0,0,0,.45)] touch-none" style={{left:corner.includes('w')?box.x+'%':(box.x+box.w)+'%',top:corner.includes('n')?box.y+'%':(box.y+box.h)+'%',transform:'translate(-50%,-50%)',touchAction:'none',cursor:corner==='nw'||corner==='se'?'nwse-resize':'nesw-resize'}}/>)}
        </div>
      </div>
      {notice && <div className="shrink-0 border-t border-[#414a54] px-3 py-2 text-[10px] text-[#b8d6c4]">{notice}</div>}
      <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 opacity-60" style={{background:'linear-gradient(135deg, transparent 50%, #9aa7b4 50%)'}}/>
    </>}
  </div>;
};
