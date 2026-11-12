import React, { useEffect, useRef, useState } from 'react';
import { ManualAssetEditor, type ManualAssetDocument } from './ManualAssetEditor';
import { ManualSignaturePanel } from './ManualSignaturePanel';
import { ArrowLeft, Plus, Upload, Trash2, Copy, Image as ImageIcon, MousePointer2, Crop, SquareDashedMousePointer, Hand, Lock, Unlock, ChevronUp, ChevronDown, Download, RotateCw, Settings2, FilePlus2, ZoomIn, ZoomOut, Check, Palette } from 'lucide-react';

type ManualLayer = { id: string; type: 'photo'|'frame'|'text'; name: string; x: number; y: number; w: number; h: number; src?: string; fileName?: string; text?: string; locked?: boolean; rotation?: number; cropZoom?: number; borderMm?: number; borderColor?: string; assetKind?: 'photo'|'signature'; aspectRatio?: number };
type ManualPage = { id: string; name: string; width: number; height: number; background: string; margin: number; photoGap?: number; horizontalPhotoGap?: number; verticalPhotoGap?: number; layers: ManualLayer[] };
type Tool = 'move'|'frame'|'marquee'|'crop'|'hand';

const uid = () => 'manual-' + Math.random().toString(36).slice(2, 10);
const makePage = (n: number, width = 210, height = 297): ManualPage => ({ id: uid(), name: 'Page ' + n, width, height, background: '#ffffff', margin: 5, layers: [] });
const intersects = (a: {x:number;y:number;w:number;h:number}, b: {x:number;y:number;w:number;h:number}) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const getManualSmartPosition = (x:number,y:number,moving:ManualLayer,others:ManualLayer[],gapX:number,gapY:number,pageW:number,pageH:number) => {
  const snap=3.5, xs=[x,...others.flatMap(item=>[item.x,item.x+item.w+gapX,item.x-moving.w-gapX,item.x+(item.w-moving.w)/2])], ys=[y,...others.flatMap(item=>[item.y,item.y+item.h+gapY,item.y-moving.h-gapY,item.y+(item.h-moving.h)/2])];
  let best:{x:number;y:number}|null=null,bestScore=Infinity;
  for(const cx of xs)for(const cy of ys){const candidate={x:Math.max(0,Math.min(pageW-moving.w,cx)),y:Math.max(0,Math.min(pageH-moving.h,cy)),w:moving.w,h:moving.h};const dx=candidate.x-x,dy=candidate.y-y;if(Math.abs(dx)>snap&&Math.abs(dy)>snap)continue;const collides=others.some(item=>candidate.x<item.x+item.w+gapX-0.01&&candidate.x+candidate.w>item.x-gapX+0.01&&candidate.y<item.y+item.h+gapY-0.01&&candidate.y+candidate.h>item.y-gapY+0.01);if(collides)continue;const score=dx*dx+dy*dy;if(score<bestScore){bestScore=score;best={x:candidate.x,y:candidate.y};}}
  if(best)return best;
  const clamped={x:Math.max(0,Math.min(pageW-moving.w,x)),y:Math.max(0,Math.min(pageH-moving.h,y))};
  if(!others.some(item=>intersects({...clamped,w:moving.w,h:moving.h},item)))return clamped;
  const alternatives=others.flatMap(item=>[{x:item.x+item.w+gapX,y:clamped.y},{x:item.x-moving.w-gapX,y:clamped.y},{x:clamped.x,y:item.y+item.h+gapY},{x:clamped.x,y:item.y-moving.h-gapY}]).map(p=>({x:Math.max(0,Math.min(pageW-moving.w,p.x)),y:Math.max(0,Math.min(pageH-moving.h,p.y))})).filter(p=>!others.some(item=>intersects({...p,w:moving.w,h:moving.h},item))).sort((a,b)=>((a.x-x)**2+(a.y-y)**2)-((b.x-x)**2+(b.y-y)**2));
  return alternatives[0]||{x:moving.x,y:moving.y};
};

const MANUAL_STUDIO_DB = 'tanshu-manual-photo-studio';
const MANUAL_STUDIO_STORE = 'workspace';
const MANUAL_STUDIO_KEY = 'current-project';
const openManualStudioDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(MANUAL_STUDIO_DB, 1);
  request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(MANUAL_STUDIO_STORE)) request.result.createObjectStore(MANUAL_STUDIO_STORE); };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const readManualStudioProject = async () => {
  const db = await openManualStudioDb();
  return new Promise<any>((resolve, reject) => {
    const request = db.transaction(MANUAL_STUDIO_STORE, 'readonly').objectStore(MANUAL_STUDIO_STORE).get(MANUAL_STUDIO_KEY);
    request.onsuccess = () => { resolve(request.result || null); db.close(); };
    request.onerror = () => { reject(request.error); db.close(); };
  });
};
const writeManualStudioProject = async (project: any) => {
  const db = await openManualStudioDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(MANUAL_STUDIO_STORE, 'readwrite');
    tx.objectStore(MANUAL_STUDIO_STORE).put(project, MANUAL_STUDIO_KEY);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
    tx.onabort = () => { reject(tx.error); db.close(); };
  });
};
const persistImageSource = async (src?: string) => {
  if (!src || src.startsWith('data:') || src.startsWith('https:') || src.startsWith('http:')) return src || '';
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

export const ManualPhotoStudioWorkspace: React.FC<{ onBackToAuto: () => void }> = ({ onBackToAuto }) => {
  const [pages, setPages] = useState<ManualPage[]>([makePage(1)]);
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<Tool>('move');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [files, setFiles] = useState<{id:string;name:string;src:string}[]>([]);
  const [assetDocuments, setAssetDocuments] = useState<ManualAssetDocument[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string|null>(null);
  const [assetWorkspaceOpen, setAssetWorkspaceOpen] = useState(false);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false);
  const [signatureAsset, setSignatureAsset] = useState<{name:string;src:string}|null>(null);
  const [importKind, setImportKind] = useState<'photo'|'signature'>('photo');
  const [unit, setUnit] = useState<'mm'|'cm'|'in'>('mm');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string|null>(null);
  const [drag, setDrag] = useState<{id:string;px:number;py:number;x:number;y:number}|null>(null);
  const [draw, setDraw] = useState<{x:number;y:number;cx:number;cy:number}|null>(null);
  const [cropZoom, setCropZoom] = useState(100);
  const [pageZoom, setPageZoom] = useState(100);
  const [cropBox, setCropBox] = useState({x:0,y:0,w:100,h:100});
  const [cropDrag, setCropDrag] = useState<any>(null);
  const [cropTargetW, setCropTargetW] = useState('');
  const [cropTargetH, setCropTargetH] = useState('');
  const [cropLockRatio, setCropLockRatio] = useState(false);
  const [signatureResize, setSignatureResize] = useState<{id:string;corner:string;startX:number;startY:number;x:number;y:number;w:number;h:number;aspect:number}|null>(null);
  const [marqueeBox, setMarqueeBox] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [stageSize, setStageSize] = useState({width:0,height:0});
  const uploadRef = useRef<HTMLInputElement>(null);
  const undoStackRef = useRef<ManualPage[][]>([]);
  const redoStackRef = useRef<ManualPage[][]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const menuBarRef = useRef<HTMLElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    readManualStudioProject().then(saved => {
      if (cancelled) return;
      if (saved?.pages?.length) {
        setPages(saved.pages);
        setPageIndex(Math.max(0, Math.min(saved.pageIndex || 0, saved.pages.length - 1)));
        setTool(saved.tool || 'move');
        setSelectedIds(saved.selectedIds || []);
        setFiles(saved.files || []);
        setAssetDocuments(saved.assetDocuments || []);
        setActiveAssetId(saved.activeAssetId || null);
        setAssetWorkspaceOpen(!!saved.assetWorkspaceOpen);
        setSignatureAsset(saved.signatureAsset || null);
        setImportKind(saved.importKind || 'photo');
        setUnit(saved.unit || 'mm');
        setSettingsOpen(saved.settingsOpen ?? true);
        setPageZoom(saved.pageZoom || 100);
        setCropZoom(saved.cropZoom || 100);
        setCropBox(saved.cropBox || {x:0,y:0,w:100,h:100});
        setCropTargetW(saved.cropTargetW || '');
        setCropTargetH(saved.cropTargetH || '');
        setCropLockRatio(!!saved.cropLockRatio);
      }
    }).catch(error => console.warn('Manual Studio recovery could not read the saved project.', error))
      .finally(() => { if (!cancelled) setHydrated(true); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const save = async () => {
        const [savedPages, savedFiles, savedDocuments] = await Promise.all([
          Promise.all(pages.map(async p => ({...p, layers: await Promise.all(p.layers.map(async l => l.src ? {...l, src: await persistImageSource(l.src)} : l))}))),
          Promise.all(files.map(async f => ({...f, src: await persistImageSource(f.src)}))),
          Promise.all(assetDocuments.map(async d => ({...d, src: await persistImageSource(d.src)})))
        ]);
        if (cancelled) return;
        await writeManualStudioProject({
          pages:savedPages,pageIndex,tool,selectedIds,files:savedFiles,assetDocuments:savedDocuments,
          activeAssetId,assetWorkspaceOpen,signatureAsset:signatureAsset?{...signatureAsset,src:await persistImageSource(signatureAsset.src)}:null,importKind,unit,settingsOpen,pageZoom,cropZoom,cropBox,cropTargetW,cropTargetH,cropLockRatio,
          savedAt:Date.now()
        });
      };
      saveQueueRef.current = saveQueueRef.current.then(save).catch(error => console.warn('Manual Studio auto-save failed.', error));
    }, 100);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [hydrated,pages,pageIndex,tool,selectedIds,files,assetDocuments,activeAssetId,assetWorkspaceOpen,signatureAsset,importKind,unit,settingsOpen,pageZoom,cropZoom,cropBox,cropTargetW,cropTargetH,cropLockRatio]);
  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('[data-menu-popup], [data-menu-toggle]')) setMenuOpen(null);
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, []);
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const handleWheelZoom = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const step = (value:number) => value < 200 ? 10 : value < 500 ? 25 : 50;
      setPageZoom(value => Math.max(10, Math.min(1600, value + (event.deltaY < 0 ? step(value) : -step(value)))));
    };
    element.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => element.removeEventListener('wheel', handleWheelZoom);
  }, []);
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect) setStageSize({width:rect.width,height:rect.height});
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const page = pages[pageIndex] || pages[0];
  const pageAspect = page.width / page.height;
  const fitPageHeight = stageSize.height > 0 ? Math.max(120, Math.min(700, stageSize.height - 40, (stageSize.width - 40) / pageAspect)) : 420;
  const basePageWidth = fitPageHeight * pageAspect;
  const zoomedPageWidth = basePageWidth * pageZoom / 100;
  const zoomedPageHeight = fitPageHeight * pageZoom / 100;
  const selected = page.layers.filter(layer => selectedIds.includes(layer.id));
  const updatePage = (fn: (p:ManualPage)=>ManualPage) => { undoStackRef.current=[...undoStackRef.current.slice(-39),pages]; redoStackRef.current=[]; setPages(current=>current.map((p,i)=>i===pageIndex?fn(p):p)); };
  const undoPage = () => { const previous=undoStackRef.current.pop(); if(previous){redoStackRef.current.push(pages);setPages(previous);setPageIndex(i=>Math.min(i,previous.length-1));setSelectedIds([]);} };
  const redoPage = () => { const next=redoStackRef.current.pop(); if(next){undoStackRef.current.push(pages);setPages(next);setPageIndex(i=>Math.min(i,next.length-1));setSelectedIds([]);} };
  const updateLayer = (id:string, patch:Partial<ManualLayer>) => updatePage(p=>({...p,layers:p.layers.map(l=>l.id===id?{...l,...patch}:l)}));
  const resizeLinkedPhotos = (sourceId:string, axis:'width'|'height', value:number) => {
    const source=page.layers.find(layer=>layer.id===sourceId&&layer.type==='photo'&&layer.assetKind!=='signature');if(!source)return;
    const requested=Math.max(3,Math.min(axis==='width'?page.width:page.height,Number(value)||3)),rawFactor=requested/(axis==='width'?source.w:source.h);
    const photosOnPage=page.layers.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature'&&!layer.locked),largestW=Math.max(1,...photosOnPage.map(layer=>layer.w)),largestH=Math.max(1,...photosOnPage.map(layer=>layer.h));
    if(source.locked)return;
    const factor=Math.max(0.05,Math.min(rawFactor,page.width/largestW,page.height/largestH));
    updatePage(p=>({...p,layers:p.layers.map(layer=>layer.type==='photo'&&layer.assetKind!=='signature'&&!layer.locked?{...layer,w:Math.max(3,layer.w*factor),h:Math.max(3,layer.h*factor)}:layer)}));
  };
  const addImage = (file:{id:string;name:string;src:string}, target?:{x:number;y:number;w:number;h:number}) => {
    const layer:ManualLayer={id:uid(),type:'photo',name:file.name,fileName:file.name,src:file.src,x:target?.x??page.margin+8,y:target?.y??page.margin+8,w:target?.w??45,h:target?.h??60,cropZoom:100};
    const position=getManualSmartPosition(layer.x,layer.y,layer,page.layers.filter(item=>item.type==='photo'&&item.assetKind!=='signature'),page.horizontalPhotoGap??page.photoGap??2,page.verticalPhotoGap??page.photoGap??3,page.width,page.height);
    const placed={...layer,...position};
    updatePage(p=>({...p,layers:[...p.layers,placed]})); setSelectedIds([placed.id]);
  };
  const addSignatureToPage = (asset:{name:string;src:string}) => {
    const image=new Image();
    image.onload=()=>{
      const width=34,aspect=image.naturalHeight/Math.max(1,image.naturalWidth),height=width*aspect;
      const layer:ManualLayer={id:uid(),type:'photo',assetKind:'signature',aspectRatio:aspect,name:asset.name,fileName:asset.name,src:asset.src,x:page.margin+8,y:page.margin+8,w:width,h:height,cropZoom:100};
      updatePage(p=>({...p,layers:[...p.layers,layer]}));setSelectedIds([layer.id]);setTool('move');
    };
    image.onerror=()=>window.alert('Signature preview could not be loaded. Please upload it again.');
    image.src=asset.src;
  };
  const applySignatureToPhoto = async () => {
    const signatureLayer=page.layers.find(layer=>selectedIds.includes(layer.id)&&layer.assetKind==='signature'&&layer.src);
    if(!signatureLayer)return;
    const photoLayers=page.layers.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature'&&layer.src&&layer.id!==signatureLayer.id);
    const target=photoLayers.map(layer=>({layer,area:Math.max(0,Math.min(layer.x+layer.w,signatureLayer.x+signatureLayer.w)-Math.max(layer.x,signatureLayer.x))*Math.max(0,Math.min(layer.y+layer.h,signatureLayer.y+signatureLayer.h)-Math.max(layer.y,signatureLayer.y))})).sort((a,b)=>b.area-a.area)[0];
    if(!target||target.area<1){window.alert('सिग्नेचर को पहले फोटो के ऊपर रखें, फिर Apply & Save करें।');return;}
    if(target.layer.rotation){window.alert('सिग्नेचर मर्ज करने से पहले फोटो को सीधा रखें।');return;}
    try{
      const [photoImage,signatureImage]=await Promise.all([target.layer.src,signatureLayer.src].map(src=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Image could not be loaded.'));image.src=src!;})));
      const scale=300/25.4,canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(target.layer.w*scale));canvas.height=Math.max(1,Math.round(target.layer.h*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(photoImage,0,0,canvas.width,canvas.height);
      const sx=(signatureLayer.x-target.layer.x)/target.layer.w*canvas.width;
      const sy=(signatureLayer.y-target.layer.y)/target.layer.h*canvas.height;
      const sw=signatureLayer.w/target.layer.w*canvas.width;
      const sh=signatureLayer.h/target.layer.h*canvas.height;
      ctx.drawImage(signatureImage,sx,sy,sw,sh);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!blob)throw new Error('Merged photo could not be created.');
      const mergedSrc=URL.createObjectURL(blob);
      updatePage(p=>({...p,layers:p.layers.filter(layer=>layer.id!==signatureLayer.id).map(layer=>layer.id===target.layer.id?{...layer,src:mergedSrc,name:layer.name.replace(/\.[^.]+$/,'')+'-signed.png',fileName:layer.name.replace(/\.[^.]+$/,'')+'-signed.png'}:layer)}));
      setSelectedIds([]);setTool('move');
    }catch(error){window.alert(error instanceof Error?error.message:'Could not apply signature to the photo.');}
  };
  const startSignatureResize = (event:React.PointerEvent<HTMLButtonElement>, layer:ManualLayer, corner:string) => {
    if(layer.locked)return;event.preventDefault();event.stopPropagation();
    const pageEl=event.currentTarget.closest('[data-manual-page]') as HTMLElement|null;if(!pageEl)return;
    pageEl.setPointerCapture(event.pointerId);
    undoStackRef.current=[...undoStackRef.current.slice(-39),pages];redoStackRef.current=[];
    setSignatureResize({id:layer.id,corner,startX:event.clientX,startY:event.clientY,x:layer.x,y:layer.y,w:layer.w,h:layer.h,aspect:layer.aspectRatio||layer.h/Math.max(1,layer.w)});
  };
  const onFiles = (list:FileList|null) => {
    if(!list)return;
    const incoming=Array.from(list).filter(f=>f.type.startsWith('image/')).map(file=>{
      const item={id:uid(),name:file.name,src:URL.createObjectURL(file)};
      return {item,document:{...item,kind:importKind} as ManualAssetDocument};
    });
    if(incoming.length){
      setFiles(current=>[...current,...incoming.map(x=>x.item)]);
      setAssetDocuments(current=>[...current,...incoming.map(x=>x.document)]);
      setActiveAssetId(incoming[incoming.length-1].document.id);
      setAssetWorkspaceOpen(true);
    }
    if(uploadRef.current)uploadRef.current.value='';
  };
  const addFrame = () => { const l:ManualLayer={id:uid(),type:'frame',name:'Photo Frame',x:page.margin+8,y:page.margin+8,w:45,h:60};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]);setTool('move'); };
  const addText = () => { const l:ManualLayer={id:uid(),type:'text',name:'Text Layer',text:'Your text',x:page.margin+8,y:page.margin+8,w:65,h:16};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]); };
  const removeSelected = () => { updatePage(p=>({...p,layers:p.layers.filter(l=>!selectedIds.includes(l.id))}));setSelectedIds([]); };
  const mergeSelectedPhotos = async () => {
    const chosen = selected.filter(layer => layer.type === 'photo' && layer.src);
    if (chosen.length < 2) return;
    const left = Math.min(...chosen.map(layer => layer.x)), top = Math.min(...chosen.map(layer => layer.y));
    const right = Math.max(...chosen.map(layer => layer.x + layer.w)), bottom = Math.max(...chosen.map(layer => layer.y + layer.h));
    const scale = 300 / 25.4, canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round((right-left)*scale)); canvas.height = Math.max(1, Math.round((bottom-top)*scale));
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    for (const layer of chosen) {
      const img = new Image(); img.src = layer.src!;
      await new Promise<void>(resolve => { img.onload=()=>resolve(); img.onerror=()=>resolve(); });
      if (!img.naturalWidth) continue;
      const x=(layer.x-left)*scale,y=(layer.y-top)*scale,ww=layer.w*scale,hh=layer.h*scale;
      ctx.save();ctx.translate(x+ww/2,y+hh/2);ctx.rotate((layer.rotation||0)*Math.PI/180);ctx.drawImage(img,-ww/2,-hh/2,ww,hh);ctx.restore();
    }
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return;
    const merged:ManualLayer={id:uid(),type:'photo',name:'Merged Photos.png',fileName:'Merged Photos.png',src:URL.createObjectURL(blob),x:left,y:top,w:right-left,h:bottom-top,cropZoom:100};
    updatePage(p=>({...p,layers:[...p.layers.filter(layer=>!chosen.some(item=>item.id===layer.id)),merged]}));setSelectedIds([merged.id]);setTool('move');
  };
  const duplicateSelected = () => {
    const occupied=[...page.layers],copies=selected.map(layer=>{
      const copy={...layer,id:uid(),name:layer.name+' copy',x:layer.x+5,y:layer.y+5,locked:false};
      if(copy.type==='photo'&&copy.assetKind!=='signature'){
        const position=getManualSmartPosition(copy.x,copy.y,copy,occupied.filter(item=>item.type==='photo'&&item.assetKind!=='signature'),page.horizontalPhotoGap??page.photoGap??2,page.verticalPhotoGap??page.photoGap??3,page.width,page.height);
        copy.x=position.x;copy.y=position.y;occupied.push(copy);
      }
      return copy;
    });
    updatePage(p=>({...p,layers:[...p.layers,...copies]}));setSelectedIds(copies.map(l=>l.id));
  };
  const setManualPhotoCount = (requested:number) => { const target=Math.max(1,Math.min(60,Math.floor(requested)||1)),current=page.layers.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature'),gapX=page.horizontalPhotoGap??page.photoGap??2,gapY=page.verticalPhotoGap??page.photoGap??3; if(target===current.length)return; if(target<current.length){let removeCount=current.length-target;const removeIds:string[]=[];for(const layer of [...current].reverse()){if(removeCount<=0)break;if(!layer.locked){removeIds.push(layer.id);removeCount--;}}if(removeIds.length)updatePage(p=>({...p,layers:p.layers.filter(layer=>!removeIds.includes(layer.id))}));return;} const base=selectedPhoto||current[0];if(!base)return;const occupied=[...page.layers],copies:ManualLayer[]=[];for(let i=current.length;i<target;i++){const copy:ManualLayer={...base,id:uid(),name:base.name+' copy '+(i+1),x:base.x+5,y:base.y+5,locked:false};const pos=getManualSmartPosition(copy.x,copy.y,copy,occupied.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature'),gapX,gapY,page.width,page.height);copy.x=pos.x;copy.y=pos.y;copies.push(copy);occupied.push(copy);}updatePage(p=>({...p,layers:[...p.layers,...copies]}));setSelectedIds(copies.map(layer=>layer.id)); };
  const autoArrangeSelected = () => {
    const chosen=page.layers.filter(layer=>selectedIds.includes(layer.id)&&!layer.locked);if(!chosen.length)return;
    const gapX=page.horizontalPhotoGap??page.photoGap??2,gapY=page.verticalPhotoGap??page.photoGap??3,maxW=Math.max(...chosen.map(layer=>layer.w)),maxH=Math.max(...chosen.map(layer=>layer.h));
    const columns=Math.max(1,Math.floor((page.width-page.margin*2+gapX)/(maxW+gapX))),rows=Math.max(1,Math.floor((page.height-page.margin*2+gapY)/(maxH+gapY)));
    if(chosen.length>columns*rows){window.alert('Selected photos do not fit on this page at their current sizes. Reduce the photo size or choose a larger page before Auto Arrange.');return;}
    updatePage(p=>({...p,layers:p.layers.map(layer=>{const index=chosen.findIndex(item=>item.id===layer.id);if(index<0)return layer;const col=index%columns,row=Math.floor(index/columns);return {...layer,x:Math.min(page.width-layer.w,page.margin+col*(maxW+gapX)),y:Math.min(page.height-layer.h,page.margin+row*(maxH+gapY))};})}));
  };
  const smartCenterAndBalance = () => { const chosen=page.layers.filter(layer=>selectedIds.includes(layer.id)&&layer.type==='photo'&&layer.assetKind!=='signature'&&!layer.locked); if(!chosen.length)return; const gapX=page.horizontalPhotoGap??page.photoGap??2,gapY=page.verticalPhotoGap??page.photoGap??3,maxW=Math.max(...chosen.map(layer=>layer.w)),maxH=Math.max(...chosen.map(layer=>layer.h)); const cols=Math.max(1,Math.floor((page.width-page.margin*2+gapX)/(maxW+gapX))),rows=Math.ceil(chosen.length/cols),maxRows=Math.max(1,Math.floor((page.height-page.margin*2+gapY)/(maxH+gapY))); if(rows>maxRows){window.alert('Selected photos do not fit on this page at their current sizes and gaps.');return;} const totalW=cols*maxW+(cols-1)*gapX,totalH=rows*maxH+(rows-1)*gapY,startX=page.margin+Math.max(0,(page.width-page.margin*2-totalW)/2),startY=page.margin+Math.max(0,(page.height-page.margin*2-totalH)/2); updatePage(p=>({...p,layers:p.layers.map(layer=>{const index=chosen.findIndex(item=>item.id===layer.id);if(index<0)return layer;const col=index%cols,row=Math.floor(index/cols);return {...layer,x:Math.min(page.width-page.margin-layer.w,startX+col*(maxW+gapX)),y:Math.min(page.height-page.margin-layer.h,startY+row*(maxH+gapY))};})})); };
  const pagePoint = (event:React.PointerEvent) => { const element=stageRef.current?.querySelector('[data-manual-page]') as HTMLDivElement|null;const rect=element?.getBoundingClientRect();if(!rect||!rect.width)return{x:0,y:0};const ratio=rect.width/page.width;return{x:Math.max(0,Math.min(page.width,(event.clientX-rect.left)/ratio)),y:Math.max(0,Math.min(page.height,(event.clientY-rect.top)/ratio))}; };
  const addPage = () => {undoStackRef.current=[...undoStackRef.current.slice(-39),pages];redoStackRef.current=[];setPages(current=>[...current,makePage(current.length+1,page.width,page.height)]);setPageIndex(pages.length);setSelectedIds([]);};
  const duplicatePage = () => {undoStackRef.current=[...undoStackRef.current.slice(-39),pages];redoStackRef.current=[];const copy={...page,id:uid(),name:'Page '+(pages.length+1),layers:page.layers.map(l=>({...l,id:uid(),x:l.x+3,y:l.y+3}))};setPages(current=>[...current,copy]);setPageIndex(pages.length);setSelectedIds([]);};
  const deletePage = () => {if(pages.length===1){updatePage(p=>({...p,layers:[]}));setSelectedIds([]);return;}undoStackRef.current=[...undoStackRef.current.slice(-39),pages];redoStackRef.current=[];setPages(current=>current.filter((_,i)=>i!==pageIndex));setPageIndex(Math.max(0,pageIndex-1));setSelectedIds([]);};
  const printPage = async () => {
    const canvas=document.createElement('canvas');canvas.width=Math.round(page.width*300/25.4);canvas.height=Math.round(page.height*300/25.4);
    const ctx=canvas.getContext('2d');if(!ctx)return;ctx.fillStyle=page.background;ctx.fillRect(0,0,canvas.width,canvas.height);
    for(const layer of page.layers){const x=layer.x*300/25.4,y=layer.y*300/25.4,ww=layer.w*300/25.4,hh=layer.h*300/25.4;
      if(layer.type==='text'){ctx.fillStyle='#111827';ctx.font=Math.max(12,Math.round(hh*.65))+'px Arial';ctx.fillText(layer.text||'',x,y+hh*.7);continue;}
      if(layer.type==='frame'){ctx.strokeStyle='#64748b';ctx.setLineDash([8,6]);ctx.strokeRect(x,y,ww,hh);ctx.setLineDash([]);continue;}
      if(layer.src){const img=new Image();img.src=layer.src;await new Promise<void>(resolve=>{img.onload=()=>{ctx.save();ctx.translate(x+ww/2,y+hh/2);ctx.rotate((layer.rotation||0)*Math.PI/180);ctx.drawImage(img,-ww/2,-hh/2,ww,hh);if(layer.borderMm&&layer.borderMm>0){ctx.strokeStyle=layer.borderColor||'#111827';ctx.lineWidth=layer.borderMm*300/25.4;ctx.strokeRect(-ww/2,-hh/2,ww,hh);}ctx.restore();resolve();};img.onerror=()=>resolve();});}
    }
    const printWindow=window.open('','_blank');if(!printWindow){window.alert('Please allow pop-ups to print at actual size.');return;}
    const data=canvas.toDataURL('image/png');
    printWindow.document.write('<!doctype html><html><head><title>'+page.name+'</title><style>@page{size:'+page.width+'mm '+page.height+'mm;margin:0}html,body{margin:0;padding:0;width:'+page.width+'mm;height:'+page.height+'mm}img{display:block;width:'+page.width+'mm;height:'+page.height+'mm}</style></head><body><img src="'+data+'"><script>window.onload=function(){window.focus();window.print();};</script></body></html>');
    printWindow.document.close();
  };
  const exportPage = async () => {
    const canvas=document.createElement('canvas');canvas.width=Math.round(page.width*300/25.4);canvas.height=Math.round(page.height*300/25.4);
    const ctx=canvas.getContext('2d');if(!ctx)return;ctx.fillStyle=page.background;ctx.fillRect(0,0,canvas.width,canvas.height);
    for(const layer of page.layers){const x=layer.x*300/25.4,y=layer.y*300/25.4,w=layer.w*300/25.4,h=layer.h*300/25.4;
      if(layer.type==='text'){ctx.fillStyle='#111827';ctx.font=Math.max(12,Math.round(h*.65))+'px Arial';ctx.fillText(layer.text||'',x,y+h*.7);continue;}
      if(layer.type==='frame'){ctx.strokeStyle='#64748b';ctx.setLineDash([8,6]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);continue;}
      if(layer.src){const img=new Image();img.src=layer.src;await new Promise<void>(resolve=>{img.onload=()=>{ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate((layer.rotation||0)*Math.PI/180);ctx.drawImage(img,-w/2,-h/2,w,h);if(layer.borderMm&&layer.borderMm>0){ctx.strokeStyle=layer.borderColor||'#111827';ctx.lineWidth=layer.borderMm*300/25.4;ctx.strokeRect(-w/2,-h/2,w,h);}ctx.restore();resolve();};img.onerror=()=>resolve();});}
    }
    const link=document.createElement('a');link.download=page.name.replace(/\s+/g,'-')+'.png';link.href=canvas.toDataURL('image/png');link.click();
  };
  const selectedPhoto = selected.find(layer=>layer.type==='photo') || null;
  const startCropDrag = (event:React.PointerEvent<HTMLButtonElement>, corner:string) => {
    if(!selectedPhoto)return; const wrapper=event.currentTarget.closest('[data-layer-id]') as HTMLElement|null; const rect=wrapper?.getBoundingClientRect(); if(!rect?.width||!rect.height)return;
    event.preventDefault();event.stopPropagation();event.currentTarget.setPointerCapture(event.pointerId);
    setCropDrag({corner,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},startX:event.clientX,startY:event.clientY,box:{...cropBox}});
  };
  const startCropDraw = (event:React.PointerEvent<HTMLDivElement>, layer:ManualLayer) => {
    if(!layer.src || layer.locked)return;
    event.preventDefault();event.stopPropagation();
    const rect=event.currentTarget.getBoundingClientRect();
    const pageElement=event.currentTarget.closest('[data-manual-page]') as HTMLElement|null;
    if(!rect.width||!rect.height||!pageElement)return;
    pageElement.setPointerCapture(event.pointerId);
    setSelectedIds([layer.id]);
    setCropBox({x:0,y:0,w:0,h:0});
    setCropDrag({mode:'draw',rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},startX:event.clientX,startY:event.clientY,layerId:layer.id});
  };
  const moveCropDrag = (event:React.PointerEvent<HTMLButtonElement>) => {
    if(!cropDrag)return; const dx=(event.clientX-cropDrag.startX)/cropDrag.rect.width*100; const dy=(event.clientY-cropDrag.startY)/cropDrag.rect.height*100; let {x,y,w,h}=cropDrag.box; const min=5;
    if(cropDrag.corner.includes('e'))w=Math.max(min,Math.min(100-x,w+dx)); if(cropDrag.corner.includes('s'))h=Math.max(min,Math.min(100-y,h+dy));
    if(cropDrag.corner.includes('w')){const right=x+w;x=Math.max(0,Math.min(right-min,x+dx));w=right-x;} if(cropDrag.corner.includes('n')){const bottom=y+h;y=Math.max(0,Math.min(bottom-min,y+dy));h=bottom-y;}
    setCropBox({x,y,w,h});
  };
  const updateCropDraw = (event:React.PointerEvent<HTMLDivElement>) => {
    if(!cropDrag || cropDrag.mode!=='draw')return;
    const {rect,startX,startY,layerId}=cropDrag;
    const layer=page.layers.find(l=>l.id===layerId);
    if(!layer)return;
    const sx=Math.max(0,Math.min(100,(startX-rect.left)/rect.width*100));
    const sy=Math.max(0,Math.min(100,(startY-rect.top)/rect.height*100));
    const ex=Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100));
    const ey=Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100));
    let x=Math.min(sx,ex),y=Math.min(sy,ey),w=Math.abs(ex-sx),h=Math.abs(ey-sy);
    const tw=Number(cropTargetW),th=Number(cropTargetH);
    if(cropLockRatio&&tw>0&&th>0&&w>0&&h>0){
      const desired=tw/th;
      const current=(w*layer.w)/(h*layer.h);
      if(current>desired){const nextW=h*layer.h*desired/layer.w;x=ex>=sx?sx:sx-nextW;w=nextW;}
      else {const nextH=w*layer.w/desired/layer.h;y=ey>=sy?sy:sy-nextH;h=nextH;}
      x=Math.max(0,Math.min(100-w,x));y=Math.max(0,Math.min(100-h,y));
    }
    if(w>=1&&h>=1)setCropBox({x,y,w,h});
  };
  const applyManualCrop = async () => {
    if(!selectedPhoto?.src)return; const image=new Image();image.src=selectedPhoto.src; await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Photo could not be loaded'));});
    const sx=Math.round(image.naturalWidth*cropBox.x/100),sy=Math.round(image.naturalHeight*cropBox.y/100); const sw=Math.max(1,Math.round(image.naturalWidth*cropBox.w/100)),sh=Math.max(1,Math.round(image.naturalHeight*cropBox.h/100));
    const canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)return;const src=URL.createObjectURL(blob);
    const outW=Number(cropTargetW)>0?fromUnit(Number(cropTargetW)):selectedPhoto.w*cropBox.w/100;
    const outH=Number(cropTargetH)>0?fromUnit(Number(cropTargetH)):selectedPhoto.h*cropBox.h/100;
    updateLayer(selectedPhoto.id,{src,name:selectedPhoto.name.replace(/\.[^.]+$/,'')+'-cropped.png',fileName:selectedPhoto.name.replace(/\.[^.]+$/,'')+'-cropped.png',cropZoom:100,...(outW>0&&outH>0?{w:outW,h:outH}:{})});setTool('move');setCropDrag(null);setCropBox({x:0,y:0,w:100,h:100});setCropTargetW('');setCropTargetH('');setCropLockRatio(false);
  };
  const unitValue=(mm:number)=>unit==='mm'?mm:unit==='cm'?mm/10:mm/25.4;
  const fromUnit=(v:number)=>unit==='mm'?v:unit==='cm'?v*10:v*25.4;
  const saveWorkspaceNow = async () => {
    const [savedPages, savedFiles, savedDocuments] = await Promise.all([
      Promise.all(pages.map(async p => ({...p, layers: await Promise.all(p.layers.map(async l => l.src ? {...l, src: await persistImageSource(l.src)} : l))}))),
      Promise.all(files.map(async f => ({...f, src: await persistImageSource(f.src)}))),
      Promise.all(assetDocuments.map(async d => ({...d, src: await persistImageSource(d.src)})))
    ]);
    const save = async () => writeManualStudioProject({
      pages:savedPages,pageIndex,tool,selectedIds,files:savedFiles,assetDocuments:savedDocuments,
      activeAssetId,assetWorkspaceOpen,signatureAsset:signatureAsset?{...signatureAsset,src:await persistImageSource(signatureAsset.src)}:null,importKind,unit,settingsOpen,pageZoom,cropZoom,cropBox,cropTargetW,cropTargetH,cropLockRatio,
      savedAt:Date.now()
    });
    saveQueueRef.current = saveQueueRef.current.then(save);
    await saveQueueRef.current;
  };
  return <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#171b20] text-[#e4e8ec]">
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#343b43] px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2"><button onClick={()=>{void saveWorkspaceNow().then(onBackToAuto).catch(error=>{console.warn("Manual Studio could not finish saving before exit.",error);onBackToAuto();});}} className="rounded-md border border-[#424a53] px-2 py-1.5 text-xs hover:bg-[#303840]"><ArrowLeft size={13} className="mr-1 inline"/> Auto Photo Maker</button><strong className="shrink-0 text-xs tracking-wide">MANUAL PHOTO STUDIO</strong><span className="shrink-0 rounded bg-[#29352f] px-2 py-1 text-[9px] text-[#b8d6c4]">Independent workspace</span><button onClick={()=>{setImportKind('photo');uploadRef.current?.click();}} className="ml-auto shrink-0 rounded border border-[#47515b] px-3 py-1.5 text-xs"><Upload size={13} className="mr-1 inline"/> Import Photo</button><div className="flex shrink-0 items-center gap-1.5 border-l border-[#3b4650] pl-2"><button onClick={()=>void exportPage()} className="rounded bg-[#d5a66e] px-2.5 py-1.5 text-[10px] font-semibold text-[#171b20]" title="Export the current Manual Studio page as a PNG file"><Download size={12} className="mr-1 inline"/> Export File</button><button onClick={()=>void printPage()} className="rounded border border-[#47515b] px-2.5 py-1.5 text-[10px]">Print Actual Size</button></div><input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>onFiles(e.target.files)}/></div>
    </div>
    <nav ref={menuBarRef} className="relative z-40 flex h-10 shrink-0 items-center gap-1 overflow-visible border-b border-[#343b43] bg-[#1b2026] px-3 text-[11px]">
      {['File','Edit','Image','Canvas','Arrange','Merge'].map(item=><div key={item} className="relative"><button data-menu-toggle onClick={()=>setMenuOpen(menuOpen===item?null:item)} className={'rounded px-2.5 py-2 '+(menuOpen===item?'bg-[#35404a] text-white':'text-[#aeb8c2] hover:bg-[#2b333b] hover:text-white')}>{item}</button>{menuOpen===item&&<div data-menu-popup className="absolute left-0 top-9 z-[80] min-w-[190px] rounded-lg border border-[#46515c] bg-[#20272e] p-1 shadow-2xl">{(item==='File'?['Export Page PNG','Print Actual Size']:item==='Edit'?['Undo','Redo','Duplicate Selected','Delete Selected','Select All Layers','Deselect All']:item==='Image'?['Crop Selected Photo']:item==='Canvas'?['A4 Portrait','A4 Landscape','Add Page','Duplicate Page','Delete Page']:item==='Arrange'?['Auto Arrange Selected','Bring Forward','Send Backward']:['Merge Selected Photos']).map(action=><button key={action} disabled={action==='Merge Selected Photos'&&selected.filter(l=>l.type==='photo').length<2} onClick={()=>{setMenuOpen(null);if(action==='Export Page PNG')void exportPage();else if(action==='Print Actual Size')void printPage();else if(action==='Undo')undoPage();else if(action==='Redo')redoPage();else if(action==='Duplicate Selected')duplicateSelected();else if(action==='Delete Selected')removeSelected();else if(action==='Select All Layers')setSelectedIds(page.layers.map(l=>l.id));else if(action==='Deselect All')setSelectedIds([]);else if(action==='Crop Selected Photo')setTool('crop');else if(action==='A4 Portrait')updatePage(p=>({...p,width:210,height:297}));else if(action==='A4 Landscape')updatePage(p=>({...p,width:297,height:210}));else if(action==='Add Page')addPage();else if(action==='Duplicate Page')duplicatePage();else if(action==='Delete Page')deletePage();else if(action==='Bring Forward')updatePage(p=>{const a=[...p.layers],i=a.findIndex(l=>selectedIds.includes(l.id));if(i>=0&&i<a.length-1)[a[i],a[i+1]]=[a[i+1],a[i]];return {...p,layers:a};});else if(action==='Send Backward')updatePage(p=>{const a=[...p.layers],i=a.findIndex(l=>selectedIds.includes(l.id));if(i>0)[a[i],a[i-1]]=[a[i-1],a[i]];return {...p,layers:a};});else if(action==='Auto Arrange Selected')autoArrangeSelected();else if(action==='Merge Selected Photos')void mergeSelectedPhotos();}} className="block w-full rounded px-3 py-2 text-left text-[10px] text-[#d0d7de] hover:bg-[#35404a]">{action}</button>)}</div>}</div>)}
      <label className="ml-1 flex cursor-pointer items-center gap-1.5 rounded px-2 py-2 text-[#aeb8c2]"><input type="checkbox" checked={page.layers.length>0&&selectedIds.length===page.layers.length} onChange={e=>setSelectedIds(e.target.checked?page.layers.map(l=>l.id):[])} className="accent-[#d5a66e]"/> Select All</label>
      <div className="flex items-center gap-1 rounded border border-[#46515c] px-2 py-1 text-[9px] text-[#aeb8c2]"><span>Canvas</span><button type="button" aria-pressed={page.height>=page.width} onClick={()=>{if(page.width>page.height)updatePage(p=>({...p,width:p.height,height:p.width}));}} className={'rounded px-2 py-1 '+(page.height>=page.width?'bg-[#3a4651] text-white':'hover:bg-[#303840]')}>Portrait</button><button type="button" aria-pressed={page.width>page.height} onClick={()=>{if(page.width<page.height)updatePage(p=>({...p,width:p.height,height:p.width}));}} className={'rounded px-2 py-1 '+(page.width>page.height?'bg-[#3a4651] text-white':'hover:bg-[#303840]')}>Landscape</button></div>
      <label className="flex items-center gap-1 rounded border border-[#46515c] px-2 py-1 text-[9px] text-[#aeb8c2]">Horizontal Gap (mm)<input aria-label="Horizontal Photo Gap (mm)" type="number" min="0" max="30" step="0.5" value={page.horizontalPhotoGap??page.photoGap??2} onChange={e=>updatePage(p=>({...p,horizontalPhotoGap:Math.max(0,Math.min(30,Number(e.target.value)||0))}))} className="w-12 rounded bg-[#171d23] px-1 py-1 text-white"/></label>
      <div className="relative"><button data-menu-toggle onClick={()=>setMenuOpen(menuOpen==='View'?null:'View')} className="rounded px-2.5 py-2 text-[#aeb8c2] hover:bg-[#2b333b]">View</button>{menuOpen==='View'&&<div data-menu-popup className="absolute left-0 top-9 z-[80] min-w-[150px] rounded-lg border border-[#46515c] bg-[#20272e] p-1 shadow-2xl">{['Zoom In','Zoom Out','Reset Zoom'].map(a=><button key={a} onClick={()=>{setPageZoom(v=>a==='Zoom In'?Math.min(1600,v+25):a==='Zoom Out'?Math.max(10,v-25):100);setMenuOpen(null);}} className="block w-full rounded px-3 py-2 text-left text-[10px] text-[#d0d7de] hover:bg-[#35404a]">{a}</button>)}</div>}</div>
      <button data-menu-toggle onClick={()=>setMenuOpen(menuOpen==='Help'?null:'Help')} className="rounded px-2.5 py-2 text-[#aeb8c2] hover:bg-[#2b333b]">Help</button>{menuOpen==='Help'&&<div data-menu-popup className="absolute left-[520px] top-9 z-[80] rounded-lg border border-[#46515c] bg-[#20272e] p-3 text-[10px] text-[#d0d7de] shadow-2xl">Select a photo layer to move, resize, duplicate or delete it. Import Photo opens the separate photo workspace.</div>}

      <div className="flex shrink-0 items-center gap-1 border-l border-[#3b4650] pl-2">
        <button onClick={()=>{if(!selected.length)return;const lock=!selected.every(l=>l.locked);updatePage(p=>({...p,layers:p.layers.map(l=>selectedIds.includes(l.id)?{...l,locked:lock}:l)}));}} disabled={!selected.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Lock Selected</button>
        <button onClick={()=>setSelectedIds([])} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px]">Select None</button>
        <button onClick={duplicateSelected} disabled={!selected.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Duplicate</button>
        <button onClick={duplicateSelected} disabled={!selected.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Copy Row</button>
        <button onClick={removeSelected} disabled={!selected.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Delete Row</button>
        <button onClick={autoArrangeSelected} disabled={!selected.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Auto Arrange</button>
        <button onClick={undoPage} disabled={!undoStackRef.current.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Undo</button>
        <button onClick={redoPage} disabled={!redoStackRef.current.length} className="rounded border border-[#53606c] px-2 py-1.5 text-[9px] disabled:opacity-40">Redo</button>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 border-l border-[#3b4650] pl-2">
        <button onClick={addPage} title="Add a new blank page" className="rounded border border-[#47515b] px-2 py-1.5 text-[10px] hover:bg-[#303840]"><FilePlus2 size={12} className="mr-1 inline"/> Add Page</button>
        <button onClick={duplicatePage} title="Duplicate current page" className="rounded border border-[#47515b] px-2 py-1.5 text-[10px] hover:bg-[#303840]"><Copy size={12} className="mr-1 inline"/> Duplicate</button>
        <button onClick={deletePage} title="Delete current page" className="rounded border border-[#47515b] px-2 py-1.5 text-[10px] hover:bg-[#303840]"><Trash2 size={12} className="mr-1 inline"/> Delete Page</button>
        <span className="flex items-center gap-1 border-l border-[#3b4650] pl-2 text-[10px] text-[#aeb8c2]">
          <button title="Zoom out" onClick={()=>setPageZoom(v=>Math.max(10,v-(v>500?50:25)))} className="rounded border border-[#47515b] p-1 hover:bg-[#303840]"><ZoomOut size={12}/></button>
          <button onClick={()=>setPageZoom(100)} className="min-w-[42px] rounded border border-[#47515b] px-1.5 py-1 tabular-nums">{pageZoom}%</button>
          <button title="Zoom in" onClick={()=>setPageZoom(v=>Math.min(1600,v+(v>=500?50:25)))} className="rounded border border-[#47515b] p-1 hover:bg-[#303840]"><ZoomIn size={12}/></button>
        </span>
        <div className="flex max-w-[150px] min-w-0 items-center gap-1 overflow-x-auto">
          {pages.map((p,i)=><button key={p.id} onClick={()=>{setPageIndex(i);setSelectedIds([]);}} className={'shrink-0 rounded px-2 py-1.5 text-[10px] '+(i===pageIndex?'bg-[#39434d] text-white':'text-[#9da8b3] hover:bg-[#28313a]')}>{p.name}</button>)}
        </div>
      </div>
    </nav>
    {assetDocuments.length>0&&<div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-[#343b43] bg-[#20262d] px-2"><ManualAssetEditor documents={assetDocuments} activeId={activeAssetId||assetDocuments[0].id} workspaceOpen={assetWorkspaceOpen&&!!activeAssetId} signatureAsset={signatureAsset} onSignatureApplied={()=>setSignatureAsset(null)} onSignatureDrop={asset=>setSignatureAsset(asset)} onOpen={()=>setAssetWorkspaceOpen(true)} backgroundPickerOpen={backgroundPickerOpen} onToggleBackgroundPicker={()=>setBackgroundPickerOpen(v=>!v)} onActiveChange={id=>{setActiveAssetId(id);setAssetWorkspaceOpen(true);}} onReplaceSource={(id,src)=>setAssetDocuments(current=>current.map(doc=>doc.id===id?{...doc,src}:doc))} onClose={id=>{setAssetDocuments(current=>current.filter(d=>d.id!==id));setActiveAssetId(current=>current===id?(assetDocuments.find(d=>d.id!==id)?.id||null):current);}} onDuplicate={id=>{const source=assetDocuments.find(d=>d.id===id);if(!source)return;const copy={...source,id:uid(),name:source.name.replace(/\.[^.]+$/,'')+' copy'+(source.name.match(/\.[^.]+$/)?.[0]||''),src:source.src};setAssetDocuments(current=>[...current,copy]);setActiveAssetId(copy.id);}} onUseOnPage={asset=>{const layer:ManualLayer={id:uid(),type:'photo',name:asset.name,fileName:asset.name,src:asset.src,x:page.margin+8,y:page.margin+8,w:Math.max(0.1,asset.widthMm),h:Math.max(0.1,asset.heightMm),cropZoom:100};updatePage(p=>({...p,layers:[...p.layers,layer]}));setSelectedIds([layer.id]);setTool('move');}} onFinish={()=>setAssetWorkspaceOpen(false)} cropMode={tool==='crop'}/></div>}
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="flex w-[64px] shrink-0 flex-col items-center gap-1 border-r border-[#343b43] py-3">
        {([['move','Move',MousePointer2],['crop','Crop',Crop],['marquee','Rectangle Select',SquareDashedMousePointer],['frame','Photo Frame',ImageIcon],['hand','Hand',Hand]] as const).map(([id,label,Icon])=><button key={id} title={label} onClick={()=>{setTool(id);if(id!=='marquee')setMarqueeBox(null);}} className={'flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] '+(tool===id?'bg-[#3a4651] text-white':'text-[#a5afb9] hover:bg-[#28313a]')}><Icon size={17}/>{label}</button>)}
        <button title="Add text" onClick={addText} className="mt-2 flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] text-[#a5afb9] hover:bg-[#28313a]"><Plus size={17}/>Text</button>
        {activeAssetId&&assetDocuments.some(doc=>doc.id===activeAssetId&&doc.kind==='photo')&&<button title="Photo Background Color" onClick={()=>setBackgroundPickerOpen(v=>!v)} className={"flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] "+(backgroundPickerOpen?"bg-[#3a4651] text-white":"text-[#a5afb9] hover:bg-[#28313a]")}><Palette size={17}/>Background</button>}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-auto bg-[#0b1118] p-5" style={{backgroundImage:"radial-gradient(ellipse at 50% 45%, rgba(46,65,82,.34), transparent 68%), linear-gradient(rgba(128,151,171,.075) 1px, transparent 1px), linear-gradient(90deg, rgba(128,151,171,.075) 1px, transparent 1px)",backgroundSize:"100% 100%, 24px 24px, 24px 24px"}} ref={stageRef} onPointerDown={e=>{if(tool==='marquee'||tool==='frame'){const p=pagePoint(e);setDraw({x:p.x,y:p.y,cx:p.x,cy:p.y});setMarqueeBox(null);e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerMove={e=>{if(!draw)return;const p=pagePoint(e);setDraw(d=>d?{...d,cx:p.x,cy:p.y}:null);}} onPointerUp={()=>{if(!draw)return;const rect={x:Math.min(draw.x,draw.cx),y:Math.min(draw.y,draw.cy),w:Math.abs(draw.cx-draw.x),h:Math.abs(draw.cy-draw.y)};if(rect.w>2&&rect.h>2){if(tool==='frame'){const l:ManualLayer={id:uid(),type:'frame',name:'Photo Frame',...rect};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]);}else{setMarqueeBox(rect);setSelectedIds(page.layers.filter(l=>intersects(rect,l)).map(l=>l.id));}}setDraw(null);}}>
          <div className="shrink-0" style={{width:Math.max(stageSize.width,zoomedPageWidth+40),height:Math.max(stageSize.height,zoomedPageHeight+40),display:'flex',alignItems:zoomedPageHeight<stageSize.height-40?'center':'flex-start',justifyContent:zoomedPageWidth<stageSize.width-40?'center':'flex-start'}}><div data-manual-page className="relative shrink-0 shadow-[0_14px_50px_rgba(0,0,0,.45)]" style={{width:basePageWidth,height:fitPageHeight,zoom:pageZoom/100,aspectRatio:page.width+'/'+page.height,background:page.background}} onWheel={e=>{e.preventDefault();setPageZoom(v=>Math.max(10,Math.min(1600,v+(e.deltaY<0?(v<200?10:v<500?25:50):-(v<200?10:v<500?25:50)))));}} onPointerDown={e=>{if(tool!=='move')return;const target=(e.target as HTMLElement).closest('[data-layer-id]') as HTMLElement|null;if(!target)return;const id=target.dataset.layerId||'';const layer=page.layers.find(l=>l.id===id);if(!layer||layer.locked)return;e.stopPropagation();setSelectedIds([id]);const p=pagePoint(e);setDrag({id,px:p.x,py:p.y,x:layer.x,y:layer.y});e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(cropDrag?.mode==='draw'){updateCropDraw(e);return;}if(signatureResize){const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();const dx=(e.clientX-signatureResize.startX)/rect.width*page.width;const dy=(e.clientY-signatureResize.startY)/rect.height*page.height;let {x,y,w}=signatureResize;const aspect=signatureResize.aspect;const startH=w*aspect;const horizontal=signatureResize.corner.endsWith('w')?-dx:dx;const vertical=(signatureResize.corner.startsWith('n')?-dy:dy)/Math.max(.01,aspect);const anchorX=signatureResize.corner.endsWith('w')?signatureResize.x+signatureResize.w:signatureResize.x;const anchorY=signatureResize.corner.startsWith('n')?signatureResize.y+startH:signatureResize.y;const maxWidth=Math.max(3,Math.min(signatureResize.corner.endsWith('w')?anchorX:page.width-anchorX,(signatureResize.corner.startsWith('n')?anchorY:page.height-anchorY)/Math.max(.01,aspect)));w=Math.max(3,Math.min(maxWidth,signatureResize.w+(horizontal+vertical)/2));const h=w*aspect;x=signatureResize.corner.endsWith('w')?anchorX-w:anchorX;y=signatureResize.corner.startsWith('n')?anchorY-h:anchorY;x=Math.max(0,Math.min(page.width-w,x));y=Math.max(0,Math.min(page.height-h,y));setPages(current=>current.map((p,i)=>i===pageIndex?{...p,layers:p.layers.map(l=>l.id===signatureResize.id?{...l,x,y,w,h}:l)}:p));return;}if(!drag)return;const p=pagePoint(e);const moving=page.layers.find(layer=>layer.id===drag.id);if(!moving)return;const targetX=Math.max(0,Math.min(page.width-moving.w,drag.x+p.x-drag.px)),targetY=Math.max(0,Math.min(page.height-moving.h,drag.y+p.y-drag.py));const position=moving.type==='photo'&&moving.assetKind!=='signature'?getManualSmartPosition(targetX,targetY,moving,page.layers.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature'&&layer.id!==moving.id),page.horizontalPhotoGap??page.photoGap??2,page.verticalPhotoGap??page.photoGap??3,page.width,page.height):{x:targetX,y:targetY};updateLayer(drag.id,position);}} onPointerUp={()=>{setDrag(null);setCropDrag(null);setSignatureResize(null);}} onPointerCancel={()=>setSignatureResize(null)}>
            {page.layers.map(l=><div key={l.id} data-layer-id={l.id} onClick={e=>{e.stopPropagation();if(tool==='move'||tool==='crop')setSelectedIds([l.id]);}} onWheel={e=>{if(!selectedIds.includes(l.id)||l.type!=='photo'||l.assetKind==='signature')return;e.preventDefault();e.stopPropagation();resizeLinkedPhotos(l.id,'width',l.w*(e.deltaY<0?1.03:0.97));}} onPointerDown={e=>{if(tool==='crop'&&l.type==='photo')startCropDraw(e,l);}} className={'absolute '+(l.assetKind==='signature'?'overflow-visible':'overflow-hidden')+' '+(selectedIds.includes(l.id)?'outline outline-2 outline-[#d4a66f]':'')} style={{left:(l.x/page.width*100)+'%',top:(l.y/page.height*100)+'%',width:(l.w/page.width*100)+'%',height:(l.h/page.height*100)+'%',transform:'rotate('+(l.rotation||0)+'deg)',background:l.type==='frame'?'rgba(148,163,184,.08)':'transparent',border:l.type==='frame'?'2px dashed #8794a2':(l.type==='photo'&&l.borderMm?`${Math.max(1,l.borderMm*basePageWidth/page.width)}px solid ${l.borderColor||'#111827'}`:'none'),cursor:l.locked?'not-allowed':tool==='move'?'move':'default'}}>
              {l.type==='photo'&&<><img src={l.src} alt={l.name} draggable={false} className={'h-full w-full select-none '+(l.assetKind==='signature'?'object-contain':(tool==='crop'&&selectedIds.includes(l.id)?'object-fill':'object-cover'))} style={{transform:'scale('+(l.cropZoom||100)/100+')'}}/>{l.assetKind==='signature'&&selectedIds.includes(l.id)&&tool==='move'&&(['nw','ne','sw','se'] as const).map(corner=><button key={corner} title="Resize signature" aria-label={'Resize signature '+corner} onPointerDown={e=>startSignatureResize(e,l,corner)} onPointerMove={()=>{}} onPointerUp={e=>{setSignatureResize(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setSignatureResize(null)} onClick={e=>e.stopPropagation()} className="absolute z-30 h-3 w-3 rounded-full border-2 border-white bg-[#d5a66e] shadow touch-none" style={{left:corner.includes('w')?'0%':'100%',top:corner.includes('n')?'0%':'100%',transform:'translate(-50%,-50%)',cursor:corner==='nw'||corner==='se'?'nwse-resize':'nesw-resize'}}/>)}{tool==='crop'&&selectedIds.includes(l.id)&&<><div className="pointer-events-none absolute border-2 border-[#ef4444] bg-[#ef4444]/[0.08]" style={{left:cropBox.x+'%',top:cropBox.y+'%',width:cropBox.w+'%',height:cropBox.h+'%'}}><span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-[#991b1b] px-1.5 py-0.5 text-[9px] text-white">{unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(1)} × {unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(1)} {unit}</span></div>{(['nw','ne','sw','se'] as const).map(corner=><button key={corner} aria-label={'Adjust crop '+corner} onPointerDown={e=>startCropDrag(e,corner)} onPointerMove={moveCropDrag} onPointerUp={e=>{setCropDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setCropDrag(null)} onClick={e=>e.stopPropagation()} className="absolute z-20 h-3 w-3 rounded-full border border-[#b91c1c] bg-[#ef4444] touch-none" style={{left:corner.includes('w')?cropBox.x+'%':(cropBox.x+cropBox.w)+'%',top:corner.includes('n')?cropBox.y+'%':(cropBox.y+cropBox.h)+'%',transform:'translate(-50%,-50%)',cursor:corner==='nw'||corner==='se'?'nwse-resize':'nesw-resize'}}/>)}</>}</>}{l.type==='text'&&<span className="block p-1 text-sm text-black">{l.text}</span>}{l.type==='frame'&&<span className="flex h-full items-center justify-center text-[10px] text-[#9aa7b4]">Empty Photo Frame</span>}
            </div>)}
            {marqueeBox&&tool==='marquee'&&<div className="pointer-events-none absolute border-2 border-dashed border-[#60a5fa] bg-[#60a5fa]/10" style={{left:(marqueeBox.x/page.width*100)+'%',top:(marqueeBox.y/page.height*100)+'%',width:(marqueeBox.w/page.width*100)+'%',height:(marqueeBox.h/page.height*100)+'%'}}/>}{draw&&<div className="pointer-events-none absolute border border-dashed border-[#d4a66f] bg-[#d4a66f]/10" style={{left:(Math.min(draw.x,draw.cx)/page.width*100)+'%',top:(Math.min(draw.y,draw.cy)/page.height*100)+'%',width:(Math.abs(draw.cx-draw.x)/page.width*100)+'%',height:(Math.abs(draw.cy-draw.y)/page.height*100)+'%'}}/>}
          </div></div>
        </div>
      </main>
      <aside className="flex w-[270px] shrink-0 flex-col overflow-y-auto border-l border-[#343b43]">
        <div className="flex items-center justify-between border-b border-[#343b43] p-3"><strong className="text-xs">Manual Settings</strong><button onClick={()=>setSettingsOpen(v=>!v)}><Settings2 size={15}/></button></div>
        {settingsOpen&&<div className="space-y-3 border-b border-[#343b43] p-3 text-[10px] text-[#aeb8c2]">
          <div className="flex gap-2"><label className="flex-1">Unit<select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)} className="studio-control mt-1 h-8 w-full px-2"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option></select></label><label className="flex-1">Background<input type="color" value={page.background} onChange={e=>updatePage(p=>({...p,background:e.target.value}))} className="studio-control mt-1 h-8 w-full p-1"/></label></div>
          <div className="border-t border-[#343b43] pt-3"><div className="mb-2 text-[9px] font-semibold tracking-[.12em] text-[#aeb8c2]">PHOTO SIZE &amp; UNITS</div><div className="grid grid-cols-2 gap-2"><label>Width ({unit})<input type="number" min="5" max="100" step="0.1" value={Number(unitValue(selectedPhoto?.w??35).toFixed(2))} onChange={e=>selectedPhoto&&resizeLinkedPhotos(selectedPhoto.id,'width',fromUnit(Math.max(5,Number(e.target.value)||5)))} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Height ({unit})<input type="number" min="5" max="100" step="0.1" value={Number(unitValue(selectedPhoto?.h??45).toFixed(2))} onChange={e=>selectedPhoto&&resizeLinkedPhotos(selectedPhoto.id,'height',fromUnit(Math.max(5,Number(e.target.value)||5)))} className="studio-control mt-1 h-8 w-full px-2"/></label></div><div className="mt-2 flex items-center justify-between text-[9px]"><span>Preset</span><span>{selectedPhoto&&Math.abs(selectedPhoto.w-35)<0.1&&Math.abs(selectedPhoto.h-45)<0.1?'India Passport / General form':'Custom Size'}</span></div></div>
          <div className="grid grid-cols-2 gap-2">{(['width','height'] as const).map(k=><label key={k}>{k==='width'?'Page width':'Page height'} ({unit})<input type="number" min="20" max="1000" value={Number(unitValue(page[k]).toFixed(2))} onChange={e=>updatePage(p=>({...p,[k]:Math.max(20,Math.min(1000,fromUnit(Number(e.target.value)||20)))}))} className="studio-control mt-1 h-8 w-full px-2"/></label>)}</div>
          <div className="flex flex-wrap gap-1">{[['A4 Portrait',210,297],['A4 Landscape',297,210],['A5',148,210],['Letter',215.9,279.4]].map(([name,w,h])=><button key={String(name)} onClick={()=>updatePage(p=>({...p,width:Number(w),height:Number(h)}))} className="rounded border border-[#46515c] px-2 py-1">{name}</button>)}</div>
          <label className="block">Margin (mm) · printer safe<input type="number" min="0" max="50" step="0.5" value={page.margin} onChange={e=>updatePage(p=>({...p,margin:Math.max(0,Math.min(50,Number(e.target.value)||0))}))} className="studio-control mt-1 h-8 w-full px-2"/></label>
          <div className="grid grid-cols-2 gap-2"><label className="block">Horizontal Photo Gap (mm)<input type="number" min="0" max="30" step="0.5" value={page.horizontalPhotoGap??page.photoGap??2} onChange={e=>updatePage(p=>({...p,horizontalPhotoGap:Math.max(0,Math.min(30,Number(e.target.value)||0))}))} className="studio-control mt-1 h-8 w-full px-2"/></label><label className="block">Vertical Photo Gap (mm)<input type="number" min="0" max="30" step="0.5" value={page.verticalPhotoGap??page.photoGap??3} onChange={e=>updatePage(p=>({...p,verticalPhotoGap:Math.max(0,Math.min(30,Number(e.target.value)||0))}))} className="studio-control mt-1 h-8 w-full px-2"/></label></div><label className="block">Count Photo<input aria-label="Count Photo" type="number" min="1" max="60" value={page.layers.filter(layer=>layer.type==='photo'&&layer.assetKind!=='signature').length||1} onChange={e=>setManualPhotoCount(Number(e.target.value))} className="studio-control mt-1 h-8 w-full px-2"/></label>
          <button type="button" onClick={autoArrangeSelected} disabled={!selected.length} className="studio-control w-full py-2 disabled:opacity-40">Arrange Photos Using Gaps</button><button type="button" onClick={smartCenterAndBalance} disabled={!selected.some(layer=>layer.type==='photo'&&layer.assetKind!=='signature')} className="studio-control w-full py-2 disabled:opacity-40">Smart Center &amp; Balance</button>
          <p className="leading-4 text-[#83909c]">Page settings are independent of Auto Photo Maker.</p>
        </div>}
        <ManualSignaturePanel onPlace={asset=>{const target=(assetDocuments.find(doc=>doc.id===activeAssetId&&doc.kind==='photo')||assetDocuments.find(doc=>doc.kind==='photo'));if(!target){window.alert('पहले Import Photo से फोटो खोलें, फिर सिग्नेचर को Crop Preview पर भेजें।');return;}setSignatureAsset(asset);setActiveAssetId(target.id);setAssetWorkspaceOpen(true);}}/>
        <div className="border-b border-[#343b43] p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Layers</strong><span>{page.layers.length} items</span></div>
          <div className="space-y-1">{[...page.layers].reverse().map(l=><div key={l.id} className={'flex items-center gap-1 rounded border px-2 py-2 '+(selectedIds.includes(l.id)?'border-[#b88b59] bg-[#292e34]':'border-[#39424b]')}><button onClick={()=>setSelectedIds([l.id])} className="min-w-0 flex-1 truncate text-left">{l.name}</button><button title={l.locked?'Unlock':'Lock'} onClick={()=>updateLayer(l.id,{locked:!l.locked})}>{l.locked?<Lock size={12}/>:<Unlock size={12}/>}</button><button title="Move layer up" onClick={()=>updatePage(p=>{const i=p.layers.findIndex(x=>x.id===l.id);if(i<0||i===p.layers.length-1)return p;const a=[...p.layers];[a[i],a[i+1]]=[a[i+1],a[i]];return{...p,layers:a};})}><ChevronUp size={12}/></button><button title="Move layer down" onClick={()=>updatePage(p=>{const i=p.layers.findIndex(x=>x.id===l.id);if(i<=0)return p;const a=[...p.layers];[a[i],a[i-1]]=[a[i-1],a[i]];return{...p,layers:a};})}><ChevronDown size={12}/></button></div>)}</div>
          <div className="mt-3 flex gap-1"><button onClick={duplicateSelected} disabled={!selected.length} className="flex-1 rounded border border-[#46515c] py-2 disabled:opacity-40"><Copy size={12} className="mr-1 inline"/>Duplicate</button><button onClick={removeSelected} disabled={!selected.length} className="flex-1 rounded border border-[#46515c] py-2 disabled:opacity-40"><Trash2 size={12} className="mr-1 inline"/>Delete</button></div>
          {tool==='crop'&&!selectedPhoto&&<div className="m-3 rounded border border-[#46515c] p-2 text-[9px] leading-4 text-[#aeb8c2]">Crop टूल चुनकर फोटो के किसी भी हिस्से से माउस दबाकर खींचें। फिर दाईं ओर साइज सेट करके Apply Crop दबाएँ।</div>}{selected.some(l=>l.type==='photo')&&<div className="mt-3 border-t border-[#343b43] pt-3">{tool==='crop'&&<div className="mb-3 rounded border border-[#b88b59] p-2"><div className="mb-2 text-[10px] font-semibold text-[#f2c58e]">Manual Crop · Drag anywhere on photo</div><p className="mb-2 text-[9px] leading-4 text-[#aeb8c2]">फोटो के किसी भी कोने/हिस्से से माउस दबाकर खींचें। लाल बॉक्स आपका चुना हुआ crop area दिखाएगा।</p><div className="mb-2 grid grid-cols-2 gap-2"><label>Crop width ({unit})<input type="number" min="0" step="0.1" placeholder={unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(2)} value={cropTargetW} onChange={e=>setCropTargetW(e.target.value)} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Crop height ({unit})<input type="number" min="0" step="0.1" placeholder={unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(2)} value={cropTargetH} onChange={e=>setCropTargetH(e.target.value)} className="studio-control mt-1 h-8 w-full px-2"/></label></div><label className="mb-2 flex items-center gap-2"><input type="checkbox" checked={cropLockRatio} onChange={e=>setCropLockRatio(e.target.checked)}/> Lock crop ratio to entered width/height</label><p className="mb-2 text-[9px] text-[#8d9aa6]">Live selection: {unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(2)} × {unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(2)} {unit}</p><button onClick={()=>void applyManualCrop()} className="flex w-full items-center justify-center gap-1 rounded bg-[#d5a66e] py-2 text-[10px] font-semibold text-[#171b20]"><Check size={13}/> Apply Crop</button><button onClick={()=>setCropBox({x:0,y:0,w:100,h:100})} className="mt-1 w-full rounded border border-[#46515c] py-1.5 text-[9px]">Reset crop frame</button></div>}<label>Photo crop zoom · {cropZoom}%<input type="range" min="100" max="300" value={cropZoom} onChange={e=>{setCropZoom(Number(e.target.value));selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{cropZoom:Number(e.target.value)}));}} className="mt-1 w-full"/></label><button onClick={()=>selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{rotation:((l.rotation||0)+90)%360}))} className="mt-2 w-full rounded border border-[#46515c] py-2"><RotateCw size={12} className="mr-1 inline"/>Rotate 90°</button><div className="mt-3 grid grid-cols-2 gap-2"><label>Width (mm)<input type="number" min="5" max="210" step="0.1" value={Number((selectedPhoto?.w||0).toFixed(1))} onChange={e=>selectedPhoto&&resizeLinkedPhotos(selectedPhoto.id,'width',Number(e.target.value)||5)} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Height (mm)<input type="number" min="5" max="297" step="0.1" value={Number((selectedPhoto?.h||0).toFixed(1))} onChange={e=>selectedPhoto&&resizeLinkedPhotos(selectedPhoto.id,'height',Number(e.target.value)||5)} className="studio-control mt-1 h-8 w-full px-2"/></label></div><div className="mt-2 grid grid-cols-[1fr_52px] gap-2"><label><span className="flex items-center justify-between">Border (mm)<input type="checkbox" aria-label="Toggle photo border" checked={(selectedPhoto?.borderMm||0)>0} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{borderMm:e.target.checked?Math.max(0.5,selectedPhoto.borderMm||0.5):0})} className="accent-[#d5a66e]"/></span><input type="number" min="0" max="5" step="0.1" value={selectedPhoto?.borderMm||0} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{borderMm:Math.max(0,Math.min(5,Number(e.target.value)||0))})} onWheel={e=>{if(!selectedPhoto)return;e.preventDefault();e.stopPropagation();updateLayer(selectedPhoto.id,{borderMm:Math.max(0,Math.min(5,Number(((selectedPhoto.borderMm||0)+(e.deltaY<0?0.1:-0.1)).toFixed(1))))});}} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Color<input type="color" value={selectedPhoto?.borderColor||'#111827'} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{borderColor:e.target.value})} className="studio-control mt-1 h-8 w-full p-1"/></label></div></div>}
        </div>
        <div className="p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Imported Assets</strong><span className="text-[9px] text-[#7f8b96]">{files.length} files</span></div>{files.length?files.map(f=><div key={f.id} className="mb-2 flex items-center gap-2 rounded border border-[#39424b] p-1.5"><img src={f.src} className="h-9 w-8 rounded object-cover" alt=""/><span className="min-w-0 flex-1 truncate text-[9px]">{f.name}</span></div>):<p className="text-[10px] text-[#7f8b96]">Imported photos and signatures appear in the photo workspace.</p>}</div>
      </aside>
    </div>
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#343b43] px-3 text-[9px] text-[#87939e]"><span>{page.name} · {page.width.toFixed(1)} × {page.height.toFixed(1)} mm · {page.layers.length} layers</span><span>Manual workspace · Preview · Zoom {pageZoom}%</span></div>
  </div>;
};
