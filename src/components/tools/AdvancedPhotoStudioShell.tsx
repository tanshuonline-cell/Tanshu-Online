import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StudioAdvancedPanel } from './StudioAdvancedPanel';
import {
  ArrowLeft, ChevronDown, Search, Download, Undo2, Redo2,
  MousePointer2, Crop, WandSparkles, Image as ImageIcon,
  Layers3, Palette, ZoomIn, ZoomOut, Grid2X2, PanelRightClose,
  MoreHorizontal, Check, LockKeyhole, ScanFace, Upload, X, Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';

type StudioPhoto = { id: string; file: File; url: string; width: number; height: number };
type StudioPreset = 'india' | 'stamp' | 'pan' | 'custom';
type StudioUnit = 'mm' | 'cm' | 'in';
type SheetSlot = { id: string; photoId: string; x: number; y: number; width: number; height: number };
const STUDIO_PRESETS: Record<Exclude<StudioPreset, 'custom'>, { label: string; widthMm: number; heightMm: number }> = {
  india: { label: 'India Passport / Exam', widthMm: 35, heightMm: 45 },
  stamp: { label: 'Stamp Photo', widthMm: 25, heightMm: 30 },
  pan: { label: 'PAN Photo', widthMm: 25, heightMm: 35 }
};
const mmToUnit = (value: number, unit: StudioUnit) => value / (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const unitToMm = (value: number, unit: StudioUnit) => value * (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);

const toolItems = [
  { icon: MousePointer2, label: 'Move', active: true },
  { icon: Crop, label: 'Crop' },
  { icon: ScanFace, label: 'Portrait' },
  { icon: WandSparkles, label: 'Retouch' },
  { icon: Palette, label: 'Background' },
  { icon: Grid2X2, label: 'Layout' },
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
  const [sheetMode, setSheetMode] = useState<'single'|'4x6'|'a4'>('single');
  const [sheetCopies, setSheetCopies] = useState(8);
  const [sheetMargin, setSheetMargin] = useState(5);
  const [sheetGap, setSheetGap] = useState(2);
  const [sheetSlots, setSheetSlots] = useState<SheetSlot[]>([]);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropDialogPosition, setCropDialogPosition] = useState({ x: 24, y: 24 });
  const [cropDialogDrag, setCropDialogDrag] = useState<{x:number;y:number;left:number;top:number}|null>(null);
  const [slotDrag, setSlotDrag] = useState<{id:string;px:number;py:number;sx:number;sy:number}|null>(null);
  const [menuOpen, setMenuOpen] = useState<string|null>(null);
  const documentSize = useMemo(() => {
    const widthMm = preset === 'custom' ? Math.max(1, customWidthMm) : STUDIO_PRESETS[preset].widthMm;
    const heightMm = preset === 'custom' ? Math.max(1, customHeightMm) : STUDIO_PRESETS[preset].heightMm;
    return { widthMm, heightMm, widthPx: Math.round(widthMm * 300 / 25.4), heightPx: Math.round(heightMm * 300 / 25.4) };
  }, [preset, customWidthMm, customHeightMm]);
  const sheetWidthPx = sheetMode === 'single' ? documentSize.widthPx : sheetMode === '4x6' ? 1200 : 2480;
  const sheetHeightPx = sheetMode === 'single' ? documentSize.heightPx : sheetMode === '4x6' ? 1800 : 3508;
  const marginPx = sheetMode === 'single' ? 0 : sheetMargin * 300 / 25.4;
  const gapPx = sheetMode === 'single' ? 0 : sheetGap * 300 / 25.4;
  const sheetCols = sheetMode === 'single' ? 1 : Math.max(1, Math.floor((sheetWidthPx - marginPx * 2 + gapPx) / (documentSize.widthPx + gapPx)));
  const sheetRows = sheetMode === 'single' ? 1 : Math.max(1, Math.floor((sheetHeightPx - marginPx * 2 + gapPx) / (documentSize.heightPx + gapPx)));
  const sheetCapacity = sheetCols * sheetRows;
  const visibleCopies = sheetMode === 'single' ? 1 : Math.min(sheetCopies, sheetCapacity);
  const uploadRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<StudioPhoto[]>([]);
  const cropDragRef = useRef<{ pointerId: number; x: number; y: number; positionX: number; positionY: number } | null>(null);
  const selected = photos.find(photo => photo.id === selectedId) || photos[0] || null;


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
            return { id: item.id, file, url: URL.createObjectURL(file), width: item.width || 0, height: item.height || 0 };
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
          setSheetCopies(saved.sheetCopies || 8);
          setSheetMargin(saved.sheetMargin ?? 5);
          setSheetGap(saved.sheetGap ?? 2);
          setSheetSlots(Array.isArray(saved.sheetSlots) ? saved.sheetSlots : []);
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
          id: photo.id, name: photo.file.name, data: await fileToDataUrl(photo.file), width: photo.width, height: photo.height
        })));
        const db = await openStudioDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STUDIO_STORE, 'readwrite');
          tx.objectStore(STUDIO_STORE).put({ photos: storedPhotos, selectedId, preset, customWidthMm, customHeightMm, sizeUnit, cropZoom, positionX, positionY, sheetMode, sheetCopies, sheetMargin, sheetGap, sheetSlots, savedAt: Date.now() }, STUDIO_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
        });
        db.close();
        setSaveState('saved');
      } catch { setSaveState('error'); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [restoreReady, photos, selectedId, preset, customWidthMm, customHeightMm, sizeUnit, cropZoom, positionX, positionY, sheetMode, sheetCopies, sheetMargin, sheetGap, sheetSlots]);

  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => {
    if (sheetMode === 'single' || !photos.length) { setSheetSlots([]); return; }
    setSheetSlots(current => {
      const count = Math.min(visibleCopies, sheetCapacity, 60);
      const result = current.slice(0, count).map(slot => ({...slot, photoId: photos.some(p => p.id === slot.photoId) ? slot.photoId : photos[0].id}));
      const pageW = sheetMode === '4x6' ? 101.6 : 210;
      const cols = Math.max(1, Math.floor((pageW - sheetMargin * 2 + sheetGap) / (documentSize.widthMm + sheetGap)));
      while (result.length < count) { const i=result.length; result.push({id:'slot-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2),photoId:photos[i%photos.length].id,x:sheetMargin+(i%cols)*(documentSize.widthMm+sheetGap),y:sheetMargin+Math.floor(i/cols)*(documentSize.heightMm+sheetGap),width:documentSize.widthMm,height:documentSize.heightMm}); }
      return result;
    });
  }, [sheetMode, visibleCopies, sheetCapacity, photos, documentSize.widthMm, documentSize.heightMm, sheetMargin, sheetGap]);
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(file => file.type.startsWith('image/'));
    const additions = accepted.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      width: 0,
      height: 0
    }));
    if (additions.length) {
      setPhotos(current => [...current, ...additions]);
      setSelectedId(current => current || additions[0].id);
    }
    if (uploadRef.current) uploadRef.current.value = '';
  };

  const removeSelected = () => {
    if (!selected) return;
    URL.revokeObjectURL(selected.url);
    setPhotos(current => {
      const next = current.filter(photo => photo.id !== selected.id);
      setSelectedId(next[0]?.id || '');
      return next;
    });
  };

  const applyProcessedImage = (blob: Blob, suffix: string) => {
    if (!selected) return;
    const extension = blob.type === 'image/png' ? 'png' : 'jpg';
    const file = new File([blob], selected.file.name.replace(/\\.[^.]+$/, '') + '-' + suffix + '.' + extension, { type: blob.type || 'image/jpeg' });
    const url = URL.createObjectURL(file);
    const processedLayer: StudioPhoto = {
      id: `processed-${suffix}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url,
      width: 0,
      height: 0
    };
    setPhotos(current => [...current, processedLayer]);
    setSelectedId(processedLayer.id);
  };

  const updateDimensions = (id: string, width: number, height: number) => {
    setPhotos(current => current.map(photo => photo.id === id ? { ...photo, width, height } : photo));
  };

  const exportPrintSheet = async (format: 'jpg'|'png'|'pdf') => {
    if (!selected) return;
    const canvas = document.createElement('canvas'); canvas.width = sheetWidthPx; canvas.height = sheetHeightPx;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sourcePhotos = photos.length ? photos : [selected];
    const images = await Promise.all(sourcePhotos.map(photo => new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('A photo could not be loaded for sheet export.')); image.src = photo.url; })));
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const slots = sheetMode === 'single' ? [{photoId:selected.id,x:0,y:0,width:documentSize.widthMm,height:documentSize.heightMm}] : sheetSlots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const image = images[Math.max(0, sourcePhotos.findIndex(photo => photo.id === slot.photoId))] || images[0];
      const ratio = documentSize.widthPx / documentSize.heightPx;
      const baseWidth = Math.min(image.naturalWidth, image.naturalHeight * ratio), baseHeight = baseWidth / ratio;
      const scale = Math.max(1, cropZoom / 100), sourceWidth = baseWidth / scale, sourceHeight = baseHeight / scale;
      const sourceX = Math.max(0, Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*positionX/100));
      const sourceY = Math.max(0, Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*positionY/100));
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, slot.x*300/25.4, slot.y*300/25.4, slot.width*300/25.4, slot.height*300/25.4);
    }
    const baseName = selected.file.name.replace(/\\.[^.]+$/, '') + `-${sheetMode}-print`;
    if (format === 'pdf') { const pageFormat = sheetMode === 'single' ? [documentSize.widthMm, documentSize.heightMm] : sheetMode === '4x6' ? [4, 6] : 'a4'; const doc = new jsPDF({orientation:'portrait', unit:sheetMode === 'single' ? 'mm' : 'in', format:pageFormat as any}); doc.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,sheetMode === 'single' ? documentSize.widthMm : sheetMode === '4x6' ? 4 : 8.27,sheetMode === 'single' ? documentSize.heightMm : sheetMode === '4x6' ? 6 : 11.69); doc.save(baseName+'.pdf'); return; }
    const mime = format === 'png' ? 'image/png' : 'image/jpeg'; const blob = await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Sheet export failed.')),mime,0.96)); const url=URL.createObjectURL(blob), anchor=document.createElement('a'); anchor.href=url; anchor.download=baseName+(format==='png'?'.png':'.jpg'); anchor.click(); window.setTimeout(()=>URL.revokeObjectURL(url),1000);
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
    const scale = Math.max(1, cropZoom / 100);
    const sourceWidth = baseWidth / scale, sourceHeight = baseHeight / scale;
    const sourceX = Math.max(0, Math.min(image.naturalWidth-sourceWidth,(image.naturalWidth-sourceWidth)*positionX/100));
    const sourceY = Math.max(0, Math.min(image.naturalHeight-sourceHeight,(image.naturalHeight-sourceHeight)*positionY/100));
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
    if (format !== 'png') { context.fillStyle='#fff'; context.fillRect(0,0,output.width,output.height); }
    context.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,0,0,output.width,output.height);
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

  return (
    <div className="min-h-screen bg-[#101214] text-[#D9DDE1] font-sans antialiased">
      <style>{`
        .studio-shell * { box-sizing: border-box; }
        .studio-shell { min-width: 1100px; }
        .studio-panel { background:#181B1F; border:1px solid #2A2F35; }
        .studio-muted { color:#858D96; }
        .studio-line { border-color:#2A2F35; }
        .studio-control { border:1px solid #343A42; background:#202429; color:#C9CFD5; border-radius:7px; }
        .studio-control:hover { background:#292F35; }
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
      `}</style>
      <div className="studio-shell flex min-h-screen flex-col">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b studio-line bg-[#171A1D] px-5">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-sm studio-muted hover:text-white"><ArrowLeft size={16}/> TANSHU ONLINE</a>
            <div className="h-6 w-px bg-[#30363D]"/>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#303840] text-[#D8DEE4]"><ImageIcon size={17}/></div>
              <div><div className="text-[13px] font-semibold tracking-wide text-[#E4E7EA]">TANSHU STUDIO</div><div className="text-[10px] tracking-[.16em] studio-muted">PHOTO EDITING & PASSPORT STUDIO</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 flex items-center gap-1.5 text-[11px] studio-muted"><span className="h-1.5 w-1.5 rounded-full bg-[#82978B]"/> {saveState==='saved'?'Auto-saved locally':saveState==='saving'?'Saving project…':saveState==='error'?'Local save issue':'Restoring project…'}</span>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><span className="studio-muted">Untitled project</span><ChevronDown size={13}/></div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><LockKeyhole size={12}/> Saved locally</div>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#343B42] text-xs font-semibold text-[#DCE1E5]">T</div>
          </div>
        </header>

        <nav className="flex h-[48px] shrink-0 items-center justify-between border-b studio-line bg-[#1B1F23] px-5">
          <div className="relative flex items-center gap-1 text-[12px]">
            {['File','Edit','Image','Canvas','Arrange','View','Help'].map(item=><div key={item} className="relative">
              <button type="button" onClick={()=>setMenuOpen(menuOpen===item?null:item)} className={'rounded px-3 py-2 '+(menuOpen===item?'bg-[#30373E] text-white':'studio-muted hover:text-white')}>{item}</button>
              {menuOpen===item && <div className="absolute left-0 top-10 z-50 min-w-[190px] rounded-lg border border-[#3A4148] bg-[#202429] p-1 shadow-2xl">
                {(item==='File'?['Import photo','Export JPG','Export PNG','Export PDF']:item==='Edit'?['Delete selected photo','Reset crop']:item==='Image'?['Open manual crop studio','Center crop']:item==='Canvas'?['Single Photo','4 × 6 inch sheet','A4 sheet','Custom photo size']:item==='Arrange'?['Auto arrange photos','Center selected photo']:item==='View'?['Zoom in','Zoom out','Reset zoom']:['How to move photos','How to delete a photo','How to crop manually']).map(action=><button key={action} type="button" onClick={()=>{
                  if(action==='Import photo')uploadRef.current?.click();
                  else if(action==='Export JPG')void(sheetMode==='single'?exportSelectedPhoto('jpg'):exportPrintSheet('jpg'));
                  else if(action==='Export PNG')void(sheetMode==='single'?exportSelectedPhoto('png'):exportPrintSheet('png'));
                  else if(action==='Export PDF')void(sheetMode==='single'?exportSelectedPhoto('pdf'):exportPrintSheet('pdf'));
                  else if(action==='Delete selected photo')removeSelected();
                  else if(action==='Reset crop'){setCropZoom(100);setPositionX(50);setPositionY(50);}
                  else if(action==='Open manual crop studio'){setActiveTool('Crop');setCropDialogOpen(true);}
                  else if(action==='Center crop'){setPositionX(50);setPositionY(50);}
                  else if(action==='Single Photo')setSheetMode('single');
                  else if(action==='4 × 6 inch sheet')setSheetMode('4x6');
                  else if(action==='A4 sheet')setSheetMode('a4');
                  else if(action==='Custom photo size')setPreset('custom');
                  else if(action==='Auto arrange photos')setSheetSlots(current=>current.map((slot,i)=>({...slot,x:sheetMargin+(i%sheetCols)*(documentSize.widthMm+sheetGap),y:sheetMargin+Math.floor(i/sheetCols)*(documentSize.heightMm+sheetGap)})));
                  else if(action==='Center selected photo')setSheetSlots(current=>current.map(slot=>slot.photoId===selected?.id?{...slot,x:((sheetMode==='4x6'?101.6:210)-slot.width)/2,y:((sheetMode==='4x6'?152.4:297)-slot.height)/2}:slot));
                  else if(action==='Zoom in')setZoom(value=>Math.min(200,value+25));
                  else if(action==='Zoom out')setZoom(value=>Math.max(25,value-25));
                  else if(action==='Reset zoom')setZoom(100);
                  else if(action==='How to move photos')window.alert('On a 4×6 or A4 sheet, press and hold any photo, then drag it to the required position.');
                  else if(action==='How to delete a photo')window.alert('Click the red X icon on the photo you want to remove from the sheet.');
                  else if(action==='How to crop manually'){setActiveTool('Crop');setCropDialogOpen(true);}
                  setMenuOpen(null);
                }} className="block w-full rounded px-3 py-2 text-left text-[11px] text-[#C9CFD5] hover:bg-[#30373E]">{action}</button>)}
              </div>}
            </div>)}
          </div>
          <div className="flex items-center gap-2">
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px]"><Search size={13} className="studio-muted"/> Search tools and actions <span className="ml-5 rounded border border-[#3B424A] px-1.5 py-0.5 text-[9px] studio-muted">⌘ K</span></div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px] opacity-50"><Undo2 size={14}/> Undo</div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px] opacity-50"><Redo2 size={14}/> Redo</div>
            <button type="button" onClick={() => uploadRef.current?.click()} className="flex h-8 items-center gap-2 rounded-md bg-[#D9DEE2] px-3 text-[11px] font-semibold text-[#20252A] hover:bg-[#E5E8EA]"><Upload size={14}/> Import photo</button>
            <div className="flex items-center gap-1 rounded-md border border-[#343A42] p-1">
              <button type="button" disabled={!selected} onClick={() => void (sheetMode === 'single' ? exportSelectedPhoto('jpg') : exportPrintSheet('jpg'))} className="studio-control flex h-7 items-center gap-1 px-2 text-[10px] disabled:opacity-40"><Download size={12}/> JPG</button>
              <button type="button" disabled={!selected} onClick={() => void (sheetMode === 'single' ? exportSelectedPhoto('png') : exportPrintSheet('png'))} className="studio-control h-7 px-2 text-[10px] disabled:opacity-40">PNG</button>
              <button type="button" disabled={!selected} onClick={() => void (sheetMode === 'single' ? exportSelectedPhoto('pdf') : exportPrintSheet('pdf'))} className="studio-control h-7 px-2 text-[10px] disabled:opacity-40">PDF</button>
            </div>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={event => addPhotos(event.target.files)}/>
          </div>
        </nav>

        <div className="flex min-h-0 flex-1">
          <aside className="studio-panel flex w-[72px] shrink-0 flex-col items-center gap-2 border-y-0 border-l-0 py-4">
            {toolItems.map(({icon:Icon,label})=><button type="button" key={label} onClick={()=>setActiveTool(label as typeof activeTool)} className={`flex w-[54px] flex-col items-center gap-1.5 rounded-lg py-3 transition ${activeTool===label?'bg-[#30373E] text-[#F0F2F4]':'studio-muted hover:bg-[#252B31]'}`}><Icon size={18} strokeWidth={1.7}/><span className="text-[9px]">{label}</span></button>)}
            <div className="mt-auto flex w-[54px] flex-col items-center gap-1.5 py-3 studio-muted"><MoreHorizontal size={19}/><span className="text-[9px]">More</span></div>
          </aside>
          <main className="flex min-w-0 flex-1 flex-col bg-[#14171A]">
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b studio-line px-5">
              <div className="flex items-center gap-3"><span className="text-[12px] font-medium text-[#E1E5E8]">Canvas</span><span className="text-[11px] studio-muted">/</span><span className="text-[11px] studio-muted">{selected ? selected.file.name : 'Portrait workspace'}</span></div>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-[10px] studio-muted">SHEET</span>
                <select aria-label="Print sheet size" value={sheetMode} onChange={event => setSheetMode(event.target.value as typeof sheetMode)} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="single">Single Photo</option><option value="4x6">4 × 6 inch</option><option value="a4">A4 Sheet</option></select>
                <span className="mr-1 text-[10px] studio-muted">PHOTO</span>
                <select aria-label="Photo size preset" value={preset} onChange={event => setPreset(event.target.value as StudioPreset)} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="india">India Passport / Exam</option><option value="pan">PAN Photo</option><option value="stamp">Stamp Photo</option><option value="custom">Custom size</option></select>
                <div className="studio-control flex h-7 items-center px-3 text-[10px]">{documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</div>
                <div className="mx-1 h-5 w-px bg-[#30363D]"/>
                <button type="button" aria-label="Zoom out" onClick={() => setZoom(value => Math.max(25, value - 25))} className="studio-control flex h-7 w-7 items-center justify-center"><ZoomOut size={13}/></button>
                <span className="w-10 text-center text-[10px] studio-muted">{zoom}%</span>
                <button type="button" aria-label="Zoom in" onClick={() => setZoom(value => Math.min(200, value + 25))} className="studio-control flex h-7 w-7 items-center justify-center"><ZoomIn size={13}/></button>
              </div>
            </div>

            <div className="studio-stage relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden p-10">
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted"><MousePointer2 size={13}/> Move tool <span className="ml-2 text-[#626B74]">V</span></div>
              <div className="absolute right-5 top-5 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">PREVIEW AREA</div>
              {selected && sheetMode !== 'single' ? (
                <div className="flex max-h-full max-w-full flex-col items-center gap-3" style={{transform:`scale(${zoom / 100})`}}>
                  <div className="rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">{sheetMode === '4x6' ? '4 × 6 INCH SHEET' : 'A4 PRINT SHEET'} · {visibleCopies} / {sheetCopies} COPIES · {sheetCapacity} MAX FIT</div>
                  <div className="relative overflow-hidden border border-white/20 bg-white shadow-2xl" style={{width:sheetMode === '4x6' ? 300 : 390,height:sheetMode === '4x6' ? 450 : 552}}>
                    {sheetSlots.map((slot,i)=>{const photo=photos.find(p=>p.id===slot.photoId)||selected;const pageW=sheetMode==='4x6'?101.6:210;const pageH=sheetMode==='4x6'?152.4:297;return <div key={slot.id} onPointerDown={event=>{event.stopPropagation();event.currentTarget.setPointerCapture(event.pointerId);setSelectedId(photo.id);setSlotDrag({id:slot.id,px:event.clientX,py:event.clientY,sx:slot.x,sy:slot.y});}} onPointerMove={event=>{if(!slotDrag||slotDrag.id!==slot.id)return;const rect=event.currentTarget.parentElement!.getBoundingClientRect();const dx=(event.clientX-slotDrag.px)/rect.width*pageW;const dy=(event.clientY-slotDrag.py)/rect.height*pageH;setSheetSlots(current=>current.map(item=>item.id===slot.id?{...item,x:Math.max(0,Math.min(pageW-item.width,slotDrag.sx+dx)),y:Math.max(0,Math.min(pageH-item.height,slotDrag.sy+dy))}:item));}} onPointerUp={event=>{setSlotDrag(null);if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>setSlotDrag(null)} className="absolute cursor-move select-none border border-dashed border-[#AEB7C0] bg-[#F3F3F3]" style={{left:(slot.x/pageW*100)+'%',top:(slot.y/pageH*100)+'%',width:(slot.width/pageW*100)+'%',height:(slot.height/pageH*100)+'%',touchAction:'none'}}>
                      <img src={photo.url} alt={'Photo slot '+(i+1)} draggable={false} className="pointer-events-none h-full w-full object-cover" style={{objectPosition:positionX+'% '+positionY+'%',transform:'scale('+(cropZoom/100)+')'}}/>
                      <button type="button" aria-label={'Delete photo '+(i+1)} title="Delete this photo" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();setSheetSlots(current=>current.filter(item=>item.id!==slot.id));setSheetCopies(current=>Math.max(1,current-1));}} className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#B94B4B] text-white shadow-lg"><X size={11}/></button>
                      <span className="pointer-events-none absolute bottom-0 left-0 bg-black/65 px-1 text-[8px] text-white">{i+1}</span>
                    </div>})}
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2">
                    <button type="button" onClick={()=>{const pageW=sheetMode==='4x6'?101.6:210;const cols=Math.max(1,Math.floor((pageW-sheetMargin*2+sheetGap)/(documentSize.widthMm+sheetGap)));const i=sheetSlots.length;const source=selected||photos[0];if(!source)return;setSheetSlots(current=>[...current,{id:'slot-'+Date.now(),photoId:source.id,x:sheetMargin+(i%cols)*(documentSize.widthMm+sheetGap),y:sheetMargin+Math.floor(i/cols)*(documentSize.heightMm+sheetGap),width:documentSize.widthMm,height:documentSize.heightMm}]);setSheetCopies(current=>Math.min(60,current+1));}} disabled={sheetSlots.length>=sheetCapacity||sheetSlots.length>=60} className="studio-control flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] disabled:opacity-40"><Plus size={12}/> Add photo</button>
                    <button type="button" onClick={()=>setSheetSlots(current=>current.map((slot,i)=>({...slot,x:sheetMargin+(i%sheetCols)*(documentSize.widthMm+sheetGap),y:sheetMargin+Math.floor(i/sheetCols)*(documentSize.heightMm+sheetGap)})))} className="studio-control px-2.5 py-1.5 text-[10px]">Auto arrange</button>
                  </div>
                </div>
              ) : selected ? (
                <div
                  className="relative max-h-full max-w-full overflow-hidden border border-white/10 bg-[#E7E5E0] shadow-2xl cursor-grab active:cursor-grabbing"
                  style={{ transform: `scale(${zoom / 100})`, aspectRatio: `${documentSize.widthMm} / ${documentSize.heightMm}`, width: Math.min(560, 420 * documentSize.widthMm / documentSize.heightMm), maxWidth: "55vw", maxHeight: 420, touchAction: "none" }}
                  onPointerDown={event => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    cropDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, positionX, positionY };
                  }}
                  onPointerMove={event => {
                    const drag = cropDragRef.current;
                    if (!drag || drag.pointerId !== event.pointerId) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const dx = (event.clientX - drag.x) / rect.width * 100;
                    const dy = (event.clientY - drag.y) / rect.height * 100;
                    setPositionX(Math.max(0, Math.min(100, drag.positionX - dx)));
                    setPositionY(Math.max(0, Math.min(100, drag.positionY - dy)));
                  }}
                  onPointerUp={event => {
                    cropDragRef.current = null;
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                  }}
                  onPointerCancel={() => { cropDragRef.current = null; }}
                >
                  <img src={selected.url} alt={selected.file.name} draggable={false} onLoad={event => updateDimensions(selected.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} className="pointer-events-none block h-full w-full object-cover select-none" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${cropZoom / 100})` }}/>
                </div>
              ) : (
                <button type="button" onClick={() => uploadRef.current?.click()} className="group flex h-[420px] w-[336px] flex-col items-center justify-center gap-4 rounded-[2px] border border-dashed border-[#59616A] bg-[#1B1F23]/70 text-center transition hover:border-[#8A949E] hover:bg-[#20252A]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A4148] bg-[#252B31] text-[#B6C0CA]"><Upload size={20}/></div>
                  <div><div className="text-[13px] font-medium text-[#DDE1E5]">Import a photo to begin</div><div className="mt-2 text-[10px] studio-muted">Choose JPG, PNG or WEBP · Multiple files supported</div></div>
                  <span className="studio-control flex items-center gap-2 px-3 py-2 text-[10px]"><Plus size={13}/> Browse files</span>
                </button>
              )}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-4 py-2 text-[10px] studio-muted">{selected ? 'Photo imported · Original file remains on this device' : 'A clean workspace for precise photo preparation'}</div>
            </div>

            <div className="flex h-[38px] shrink-0 items-center justify-between border-t studio-line bg-[#191D21] px-5 text-[10px] studio-muted">
              <div className="flex items-center gap-4"><span>{selected ? `Image: ${selected.width || '—'} × ${selected.height || '—'} px` : 'Canvas: 35 × 45 mm'}</span><span>Document: {documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</span><span>Output: {documentSize.widthPx} × {documentSize.heightPx} px @ 300 DPI</span><span>Color: RGB</span></div>
              <div className="flex items-center gap-3"><span>{zoom}%</span><span className="h-3 w-px bg-[#3A4148]"/><button type="button" onClick={() => setZoom(100)} className="hover:text-[#D9DDE1]">Reset zoom</button></div>
            </div>
          </main>

          <aside className="studio-panel flex w-[286px] shrink-0 flex-col border-y-0 border-r-0">
            <div className="flex h-[52px] items-center justify-between border-b studio-line px-4"><div className="text-[12px] font-semibold text-[#E0E4E8]">{activeTool === 'Move' ? 'Move Settings' : `${activeTool} Settings`}</div><span className="text-[9px] studio-muted">{saveState==='saved'?'Auto-saved':saveState==='saving'?'Saving…':saveState==='error'?'Save issue':'Restoring…'}</span></div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeTool === 'Crop' && <div className="border-b studio-line p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">CROP & POSITION</span><button type="button" onClick={() => { setCropZoom(100); setPositionX(50); setPositionY(50); }} className="text-[10px] studio-muted hover:text-[#D9DDE1]">Reset</button></div>
                {([['Crop zoom',cropZoom,setCropZoom,100,300],['Horizontal position',positionX,setPositionX,0,100],['Vertical position',positionY,setPositionY,0,100]] as const).map(([label,value,setter,min,max])=><label key={label} className="mb-3 block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span><input type="range" min={min} max={max} value={value} onChange={event=>setter(Number(event.target.value))} className="w-full accent-[#AEB8C2]"/></label>)}
                <div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setPositionX(50)} className="studio-control py-1.5 text-[9px]">Center X</button><button type="button" onClick={()=>setPositionY(50)} className="studio-control py-1.5 text-[9px]">Center Y</button></div>
                <button type="button" onClick={()=>setCropDialogOpen(true)} className="studio-control mt-3 flex w-full items-center justify-center gap-2 py-2 text-[10px]"><Crop size={13}/> Open manual crop studio</button>
              </div>}
              <StudioAdvancedPanel selected={selected} photos={photos} widthPx={documentSize.widthPx} heightPx={documentSize.heightPx} onApplyImage={applyProcessedImage} activeSection={activeTool==='Move'?'move':activeTool==='Background'?'background':activeTool==='Retouch'?'portrait':activeTool==='Layout'?'print':'adjust'} hideTabs />
              <div className="border-t studio-line p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">DOCUMENT SETUP</span><MoreHorizontal size={15} className="studio-muted"/></div>
                <label className="mb-3 block text-[10px] studio-muted">Photo size preset
                  <select aria-label="Photo size preset" value={preset} onChange={event => setPreset(event.target.value as StudioPreset)} className="studio-control mt-1.5 h-8 w-full px-2 text-[11px] outline-none"><option value="india">India Passport / Exam · 35 × 45 mm</option><option value="pan">PAN Photo · 25 × 35 mm</option><option value="stamp">Stamp Photo · 25 × 30 mm</option><option value="custom">Custom dimensions</option></select>
                </label>
                {preset === 'custom' && <div className="mb-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] studio-muted">Measurement unit</span><select aria-label="Custom size unit" value={sizeUnit} onChange={event => setSizeUnit(event.target.value as StudioUnit)} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="mm">mm</option><option value="cm">cm</option><option value="in">in</option></select></div><div className="grid grid-cols-2 gap-2"><label className="text-[9px] studio-muted">Width ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customWidthMm, sizeUnit).toFixed(2))} onChange={event => setCustomWidthMm(unitToMm(Math.max(0.1, Number(event.target.value) || 0.1), sizeUnit))} className="studio-control mt-1 h-8 w-full px-2 text-[11px] outline-none"/></label><label className="text-[9px] studio-muted">Height ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customHeightMm, sizeUnit).toFixed(2))} onChange={event => setCustomHeightMm(unitToMm(Math.max(0.1, Number(event.target.value) || 0.1), sizeUnit))} className="studio-control mt-1 h-8 w-full px-2 text-[11px] outline-none"/></label></div></div>}
                {sheetMode !== 'single' && <div className="mt-3 space-y-3 border-t studio-line pt-3"><label className="block text-[10px] studio-muted">Photo copies <input type="number" min="1" max="60" value={sheetCopies} onChange={event=>setSheetCopies(Math.max(1,Math.min(60,Number(event.target.value)||1)))} className="studio-control mt-1 h-8 w-full px-2 text-[11px]"/></label><div className="grid grid-cols-2 gap-2"><label className="text-[9px] studio-muted">Margin (mm)<input type="number" min="0" max="20" value={sheetMargin} onChange={event=>setSheetMargin(Math.max(0,Math.min(20,Number(event.target.value)||0)))} className="studio-control mt-1 h-8 w-full px-2 text-[11px]"/></label><label className="text-[9px] studio-muted">Cut gap (mm)<input type="number" min="0" max="15" value={sheetGap} onChange={event=>setSheetGap(Math.max(0,Math.min(15,Number(event.target.value)||0)))} className="studio-control mt-1 h-8 w-full px-2 text-[11px]"/></label></div><p className="text-[9px] studio-muted">Select the sheet before importing. Copies are arranged using your selected photo size at 300 DPI.</p></div>}
                <div className="flex items-center justify-between py-2 text-[11px]"><span className="studio-muted">Output size</span><span className="text-[#D5DADF]">{documentSize.widthPx} × {documentSize.heightPx} px</span></div>
                <div className="flex items-center justify-between border-t studio-line py-2 text-[11px]"><span className="studio-muted">Resolution</span><span className="text-[#D5DADF]">300 DPI</span></div>
              </div>
              <div className="border-t studio-line p-4">
                <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">LAYERS</span><span className="text-[9px] studio-muted">{photos.length.toString().padStart(2, '0')} ITEMS</span></div>
                {photos.length ? <div className="space-y-2">{photos.map(photo => <div key={photo.id} className={`flex items-center gap-2 rounded-md border p-2 ${selected?.id === photo.id ? 'border-[#3A4148] bg-[#252B31]' : 'studio-line bg-[#202429]'}`}><button type="button" onClick={() => setSelectedId(photo.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><img src={photo.url} alt="" className="h-9 w-8 rounded object-cover bg-[#30363D]"/><span className="min-w-0"><span className="block truncate text-[10px] text-[#DCE1E5]">{photo.file.name}</span><span className="block text-[9px] studio-muted">Image · {photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Loading dimensions'}</span></span></button>{selected?.id === photo.id && <button type="button" aria-label="Remove selected photo" onClick={removeSelected} className="rounded p-1 studio-muted hover:text-[#E1E5E8]"><X size={13}/></button>}{selected?.id === photo.id && <Check size={12} className="studio-muted"/>}</div>)}
                  <button type="button" onClick={() => uploadRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed studio-line py-2 text-[10px] studio-muted hover:text-[#D9DDE1]"><Plus size={13}/> Add photos</button></div> : <div className="rounded-md border border-dashed studio-line p-4 text-center text-[10px] studio-muted">No image layers yet</div>}
              </div>
            </div>
          </aside>
        </div>
                {cropDialogOpen && <div className="fixed inset-0 z-[100] bg-black/50" onPointerDown={event=>{if(event.target===event.currentTarget)setCropDialogOpen(false);}}><div className="absolute w-[min(560px,calc(100vw-32px))] rounded-xl border border-[#46505A] bg-[#1B1F23] shadow-2xl" style={{left:cropDialogPosition.x,top:cropDialogPosition.y}}><div className="flex cursor-move items-center justify-between border-b border-[#343A42] px-4 py-3" onPointerDown={event=>{setCropDialogDrag({x:event.clientX,y:event.clientY,left:cropDialogPosition.x,top:cropDialogPosition.y});event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(cropDialogDrag)setCropDialogPosition({x:Math.max(0,cropDialogDrag.left+event.clientX-cropDialogDrag.x),y:Math.max(0,cropDialogDrag.top+event.clientY-cropDialogDrag.y)});}} onPointerUp={()=>setCropDialogDrag(null)} onPointerCancel={()=>setCropDialogDrag(null)}><div><div className="text-[12px] font-semibold text-[#E4E8EC]">Manual Crop Studio</div><div className="text-[9px] studio-muted">Exact size in mm, cm or inches · drag the dialog by its title bar</div></div><button type="button" onClick={()=>setCropDialogOpen(false)}><X size={16}/></button></div><div className="grid grid-cols-[1fr_180px] gap-4 p-4"><div className="relative h-[260px] w-full touch-none overflow-hidden rounded-lg border border-white/20 bg-[#E7E5E0]" onPointerDown={event=>{if(!selected)return;event.currentTarget.setPointerCapture(event.pointerId);cropDragRef.current={pointerId:event.pointerId,x:event.clientX,y:event.clientY,positionX,positionY};}} onPointerMove={event=>{const drag=cropDragRef.current;if(!drag||drag.pointerId!==event.pointerId)return;const rect=event.currentTarget.getBoundingClientRect();setPositionX(Math.max(0,Math.min(100,drag.positionX-(event.clientX-drag.x)/rect.width*100)));setPositionY(Math.max(0,Math.min(100,drag.positionY-(event.clientY-drag.y)/rect.height*100)));}} onPointerUp={event=>{cropDragRef.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{cropDragRef.current=null;}}>{selected&&<img src={selected.url} alt="Drag photo to position crop" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" style={{objectPosition:positionX+'% '+positionY+'%',transform:'scale('+(cropZoom/100)+')'}}/>}</div><div className="space-y-3"><label className="block text-[10px] studio-muted">Unit<select value={sizeUnit} onChange={event=>setSizeUnit(event.target.value as StudioUnit)} className="studio-control mt-1 h-8 w-full px-2"><option value="mm">Millimetres</option><option value="cm">Centimetres</option><option value="in">Inches</option></select></label><label className="block text-[10px] studio-muted">Width ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customWidthMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomWidthMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));}} className="studio-control mt-1 h-8 w-full px-2"/></label><label className="block text-[10px] studio-muted">Height ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customHeightMm,sizeUnit).toFixed(2))} onChange={event=>{setPreset('custom');setCustomHeightMm(unitToMm(Math.max(.1,Number(event.target.value)||.1),sizeUnit));}} className="studio-control mt-1 h-8 w-full px-2"/></label><label className="block text-[10px] studio-muted">Zoom {cropZoom}%<input type="range" min="100" max="300" value={cropZoom} onChange={event=>setCropZoom(Number(event.target.value))} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Horizontal {positionX}%<input type="range" min="0" max="100" value={positionX} onChange={event=>setPositionX(Number(event.target.value))} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Vertical {positionY}%<input type="range" min="0" max="100" value={positionY} onChange={event=>setPositionY(Number(event.target.value))} className="mt-1 w-full"/></label><button type="button" onClick={()=>{setCropZoom(100);setPositionX(50);setPositionY(50);}} className="studio-control w-full py-2 text-[10px]">Reset crop</button><button type="button" onClick={()=>setCropDialogOpen(false)} className="w-full rounded-md bg-[#D9DEE2] py-2 text-[10px] font-semibold text-[#20252A]">Apply crop settings</button></div></div></div></div>}
        <footer className="flex h-[34px] shrink-0 items-center justify-between border-t studio-line bg-[#171A1D] px-5 text-[9px] studio-muted"><span>TANSHU STUDIO · DOCUMENT PRESETS</span><span className="flex items-center gap-4"><span>Import and layer selection enabled</span><span>© TANSHU ONLINE</span></span></footer>
      </div>
    </div>
  );
};
