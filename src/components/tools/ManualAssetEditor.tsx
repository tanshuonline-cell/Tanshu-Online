import React, { useRef, useState } from 'react';
import { Copy, X, Minimize2, Maximize2, Check, RotateCcw } from 'lucide-react';

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
  onUseOnPage: (asset: { name: string; src: string; widthMm: number; heightMm: number }) => void;
};

type Unit = 'mm' | 'cm' | 'in';
const toMm = (value: number, unit: Unit) => unit === 'mm' ? value : unit === 'cm' ? value * 10 : value * 25.4;
const fromMm = (value: number, unit: Unit) => unit === 'mm' ? value : unit === 'cm' ? value / 10 : value / 25.4;

export const ManualAssetEditor: React.FC<Props> = ({ documents, activeId, onActiveChange, onClose, onDuplicate, onUseOnPage }) => {
  const [unit, setUnit] = useState<Unit>('mm');
  const [targetW, setTargetW] = useState('0');
  const [targetH, setTargetH] = useState('0');
  const [box, setBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [drag, setDrag] = useState<{ corner: string; startX: number; startY: number; initial: typeof box } | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [notice, setNotice] = useState('');
  const [naturalSize, setNaturalSize] = useState({width:0,height:0});
  const stageRef = useRef<HTMLDivElement>(null);
  const active = documents.find(d => d.id === activeId) || documents[0];
  if (!active) return null;

  const setCorner = (event: React.PointerEvent<HTMLButtonElement>, corner: string) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ corner, startX: event.clientX, startY: event.clientY, initial: { ...box } });
  };
  const moveCorner = (event: React.PointerEvent<HTMLButtonElement>) => {
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
    if (wantedW > 0 && wantedH > 0 && naturalSize.width > 0 && naturalSize.height > 0) {
      const targetRatio = toMm(wantedW, unit) / toMm(wantedH, unit);
      const imageRatio = naturalSize.width / naturalSize.height;
      const cropRatioInPercent = targetRatio / imageRatio;
      if (drag.corner.includes('e') || drag.corner.includes('w')) {
        const nextH = b.w / cropRatioInPercent;
        if (nextH <= 100 - b.y) b.h = Math.max(min, nextH);
      } else {
        const nextW = b.h * cropRatioInPercent;
        if (nextW <= 100 - b.x) b.w = Math.max(min, nextW);
      }
    }
    setBox(b);
  };
  const cropAndApply = async () => {
    const img = new Image();
    img.src = active.src;
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
    const widthMm = targetW.trim() && Number(targetW) > 0 ? toMm(Number(targetW), unit) : sw * 25.4 / 300;
    const heightMm = targetH.trim() && Number(targetH) > 0 ? toMm(Number(targetH), unit) : sh * 25.4 / 300;
    onUseOnPage({ name: active.name.replace(/\\.[^.]+$/, '') + '-crop.png', src: URL.createObjectURL(blob), widthMm, heightMm });
    setNotice('Cropped asset added to the A4 page. This source document remains open.');
  };
  const handleReset = () => { setBox({x:0,y:0,w:100,h:100}); setNotice('Crop selection reset.'); };

  return <div className="absolute inset-3 z-40 flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#58616b] bg-[#20262d] shadow-2xl">
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#414a54] px-3">
      <strong className="mr-2 text-xs tracking-wide">ASSET EDITOR</strong>
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{documents.map(doc => <button key={doc.id} onClick={() => { onActiveChange(doc.id); setBox({x:0,y:0,w:100,h:100}); }} className={'flex shrink-0 items-center gap-2 rounded-t px-3 py-2 text-[10px] ' + (doc.id===active.id?'bg-[#3b4651] text-white':'text-[#aeb8c2] hover:bg-[#303943]')}>{doc.kind==='signature'?'Signature':'Photo'} · {doc.name}<span onClick={e=>{e.stopPropagation();onClose(doc.id);}} className="ml-1 rounded p-0.5 hover:bg-black/20"><X size={11}/></span></button>)}</div>
      <button title={minimized?'Restore':'Minimize'} onClick={()=>setMinimized(v=>!v)} className="rounded border border-[#4b5661] p-1.5">{minimized?<Maximize2 size={13}/>:<Minimize2 size={13}/>}</button>
      <button title="Close active document" onClick={()=>onClose(active.id)} className="rounded border border-[#4b5661] p-1.5"><X size={13}/></button>
    </div>
    {!minimized && <>
      <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-[#414a54] p-3">
        <label className="text-[10px] text-[#aeb8c2]">Unit<select value={unit} onChange={e=>setUnit(e.target.value as Unit)} className="studio-control mt-1 block h-8 w-20 px-2"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option></select></label>
        <label className="text-[10px] text-[#aeb8c2]">Crop width ({unit})<input type="number" min="0" step="0.1" value={targetW} onChange={e=>setTargetW(e.target.value)} className="studio-control mt-1 block h-8 w-28 px-2"/></label>
        <label className="text-[10px] text-[#aeb8c2]">Crop height ({unit})<input type="number" min="0" step="0.1" value={targetH} onChange={e=>setTargetH(e.target.value)} className="studio-control mt-1 block h-8 w-28 px-2"/></label>
        <span className="pb-2 text-[9px] text-[#8996a2]">0 × 0 = free crop · Enter both dimensions to lock the crop ratio · Current: {fromMm(naturalSize.width*box.w/100*25.4/300,unit).toFixed(2)} × {fromMm(naturalSize.height*box.h/100*25.4/300,unit).toFixed(2)} {unit}</span>
        <div className="ml-auto flex gap-1"><button onClick={()=>onDuplicate(active.id)} className="rounded border border-[#53606c] px-3 py-2 text-[10px]"><Copy size={12} className="mr-1 inline"/>Duplicate Document</button><button onClick={handleReset} className="rounded border border-[#53606c] px-3 py-2 text-[10px]"><RotateCcw size={12} className="mr-1 inline"/>Reset</button><button onClick={()=>void cropAndApply()} className="rounded bg-[#d5a66e] px-3 py-2 text-[10px] font-semibold text-[#171b20]"><Check size={12} className="mr-1 inline"/>Crop & Add to A4</button></div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#151a1f] p-6">
        <div ref={stageRef} className="relative max-h-full max-w-full select-none" style={{aspectRatio:'auto',touchAction:'none'}}>
          <img src={active.src} alt={active.name} draggable={false} onLoad={e=>setNaturalSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} className="block max-h-[calc(100vh-250px)] max-w-full object-contain"/>
          <div className="pointer-events-none absolute border border-red-500 bg-red-500/[0.04]" style={{left:box.x+'%',top:box.y+'%',width:box.w+'%',height:box.h+'%'}}/>
          {(['nw','ne','sw','se'] as const).map(corner=><button key={corner} aria-label={'Crop '+corner} onPointerDown={e=>setCorner(e,corner)} onPointerMove={moveCorner} onPointerUp={e=>{setDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setDrag(null)} onClick={e=>e.stopPropagation()} className="absolute z-10 h-3 w-3 rounded-full border border-red-700 bg-red-500 touch-none" style={{left:corner.includes('w')?box.x+'%':(box.x+box.w)+'%',top:corner.includes('n')?box.y+'%':(box.y+box.h)+'%',transform:'translate(-50%,-50%)',cursor:corner==='nw'||corner==='se'?'nwse-resize':'nesw-resize'}}/>)}
        </div>
      </div>
      {notice && <div className="shrink-0 border-t border-[#414a54] px-3 py-2 text-[10px] text-[#b8d6c4]">{notice}</div>}
    </>}
  </div>;
};
