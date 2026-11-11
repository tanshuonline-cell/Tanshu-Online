import React, { useEffect, useRef, useState } from 'react';
import { ManualAssetEditor, type ManualAssetDocument } from './ManualAssetEditor';
import { ArrowLeft, Plus, Upload, Trash2, Copy, Image as ImageIcon, MousePointer2, Crop, SquareDashedMousePointer, Hand, Lock, Unlock, ChevronUp, ChevronDown, Download, RotateCw, Settings2, FilePlus2, ZoomIn, ZoomOut, Check } from 'lucide-react';

type ManualLayer = { id: string; type: 'photo'|'frame'|'text'; name: string; x: number; y: number; w: number; h: number; src?: string; fileName?: string; text?: string; locked?: boolean; rotation?: number; cropZoom?: number; borderMm?: number; borderColor?: string };
type ManualPage = { id: string; name: string; width: number; height: number; background: string; margin: number; layers: ManualLayer[] };
type Tool = 'move'|'frame'|'marquee'|'crop'|'hand';

const uid = () => 'manual-' + Math.random().toString(36).slice(2, 10);
const makePage = (n: number, width = 210, height = 297): ManualPage => ({ id: uid(), name: 'Page ' + n, width, height, background: '#ffffff', margin: 5, layers: [] });
const intersects = (a: {x:number;y:number;w:number;h:number}, b: {x:number;y:number;w:number;h:number}) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;

export const ManualPhotoStudioWorkspace: React.FC<{ onBackToAuto: () => void }> = ({ onBackToAuto }) => {
  const [pages, setPages] = useState<ManualPage[]>([makePage(1)]);
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<Tool>('move');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [files, setFiles] = useState<{id:string;name:string;src:string}[]>([]);
  const [assetDocuments, setAssetDocuments] = useState<ManualAssetDocument[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string|null>(null);
  const [importKind, setImportKind] = useState<'photo'|'signature'>('photo');
  const [unit, setUnit] = useState<'mm'|'cm'|'in'>('mm');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [drag, setDrag] = useState<{id:string;px:number;py:number;x:number;y:number}|null>(null);
  const [draw, setDraw] = useState<{x:number;y:number;cx:number;cy:number}|null>(null);
  const [cropZoom, setCropZoom] = useState(100);
  const [pageZoom, setPageZoom] = useState(100);
  const [cropBox, setCropBox] = useState({x:0,y:0,w:100,h:100});
  const [cropDrag, setCropDrag] = useState<any>(null);
  const [cropTargetW, setCropTargetW] = useState('');
  const [cropTargetH, setCropTargetH] = useState('');
  const [cropLockRatio, setCropLockRatio] = useState(false);
  const [marqueeBox, setMarqueeBox] = useState<{x:number;y:number;w:number;h:number}|null>(null);
  const [stageSize, setStageSize] = useState({width:0,height:0});
  const uploadRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
  const updatePage = (fn: (p:ManualPage)=>ManualPage) => setPages(current=>current.map((p,i)=>i===pageIndex?fn(p):p));
  const updateLayer = (id:string, patch:Partial<ManualLayer>) => updatePage(p=>({...p,layers:p.layers.map(l=>l.id===id?{...l,...patch}:l)}));
  const addImage = (file:{id:string;name:string;src:string}, target?:{x:number;y:number;w:number;h:number}) => {
    const layer:ManualLayer={id:uid(),type:'photo',name:file.name,fileName:file.name,src:file.src,x:target?.x??page.margin+8,y:target?.y??page.margin+8,w:target?.w??45,h:target?.h??60,cropZoom:100};
    updatePage(p=>({...p,layers:[...p.layers,layer]})); setSelectedIds([layer.id]);
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
    }
    if(uploadRef.current)uploadRef.current.value='';
  };
  const addFrame = () => { const l:ManualLayer={id:uid(),type:'frame',name:'Photo Frame',x:page.margin+8,y:page.margin+8,w:45,h:60};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]);setTool('move'); };
  const addText = () => { const l:ManualLayer={id:uid(),type:'text',name:'Text Layer',text:'Your text',x:page.margin+8,y:page.margin+8,w:65,h:16};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]); };
  const removeSelected = () => { updatePage(p=>({...p,layers:p.layers.filter(l=>!selectedIds.includes(l.id))}));setSelectedIds([]); };
  const duplicateSelected = () => { const copies=selected.map(l=>({...l,id:uid(),name:l.name+' copy',x:l.x+5,y:l.y+5,locked:false}));updatePage(p=>({...p,layers:[...p.layers,...copies]}));setSelectedIds(copies.map(l=>l.id)); };
  const pagePoint = (event:React.PointerEvent) => { const element=stageRef.current?.querySelector('[data-manual-page]') as HTMLDivElement|null;const rect=element?.getBoundingClientRect();if(!rect||!rect.width)return{x:0,y:0};const ratio=rect.width/page.width;return{x:Math.max(0,Math.min(page.width,(event.clientX-rect.left)/ratio)),y:Math.max(0,Math.min(page.height,(event.clientY-rect.top)/ratio))}; };
  const addPage = () => {setPages(current=>[...current,makePage(current.length+1,page.width,page.height)]);setPageIndex(pages.length);setSelectedIds([]);};
  const duplicatePage = () => {const copy={...page,id:uid(),name:'Page '+(pages.length+1),layers:page.layers.map(l=>({...l,id:uid(),x:l.x+3,y:l.y+3}))};setPages(current=>[...current,copy]);setPageIndex(pages.length);setSelectedIds([]);};
  const deletePage = () => {if(pages.length===1){updatePage(p=>({...p,layers:[]}));setSelectedIds([]);return;}setPages(current=>current.filter((_,i)=>i!==pageIndex));setPageIndex(Math.max(0,pageIndex-1));setSelectedIds([]);};
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
  return <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#171b20] text-[#e4e8ec]">
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#343b43] px-3">
      <div className="flex items-center gap-2"><button onClick={onBackToAuto} className="rounded-md border border-[#424a53] px-2 py-1.5 text-xs hover:bg-[#303840]"><ArrowLeft size={13} className="mr-1 inline"/> Auto Photo Maker</button><strong className="text-xs tracking-wide">MANUAL PHOTO STUDIO</strong><span className="rounded bg-[#29352f] px-2 py-1 text-[9px] text-[#b8d6c4]">Independent workspace</span></div>
      <div className="flex min-w-0 items-center gap-2"><button onClick={()=>{setImportKind('photo');uploadRef.current?.click();}} className="shrink-0 rounded border border-[#47515b] px-3 py-1.5 text-xs"><Upload size={13} className="mr-1 inline"/> Import Photo</button><button onClick={()=>{setImportKind('signature');uploadRef.current?.click();}} className="shrink-0 rounded border border-[#47515b] px-3 py-1.5 text-xs">Import Signature</button><button onClick={()=>void exportPage()} className="shrink-0 rounded bg-[#d5a66e] px-3 py-1.5 text-xs font-semibold text-[#171b20]"><Download size={13} className="mr-1 inline"/> Export Page PNG</button><input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>onFiles(e.target.files)}/>{activeAssetId&&assetDocuments.length>0&&<div className="max-w-[58vw] min-w-0"><ManualAssetEditor documents={assetDocuments} activeId={activeAssetId} onActiveChange={setActiveAssetId} onReplaceSource={(id,src)=>setAssetDocuments(current=>current.map(doc=>doc.id===id?{...doc,src}:doc))} onClose={id=>{setAssetDocuments(current=>current.filter(d=>d.id!==id));setActiveAssetId(current=>current===id?(assetDocuments.find(d=>d.id!==id)?.id||null):current);}} onDuplicate={id=>{const source=assetDocuments.find(d=>d.id===id);if(!source)return;const copy={...source,id:uid(),name:source.name.replace(/\\.[^.]+$/,'')+' copy'+(source.name.match(/\\.[^.]+$/)?.[0]||''),src:source.src};setAssetDocuments(current=>[...current,copy]);setActiveAssetId(copy.id);}} onUseOnPage={asset=>{const layer:ManualLayer={id:uid(),type:'photo',name:asset.name,fileName:asset.name,src:asset.src,x:page.margin+8,y:page.margin+8,w:Math.max(0.1,asset.widthMm),h:Math.max(0.1,asset.heightMm),cropZoom:100};updatePage(p=>({...p,layers:[...p.layers,layer]}));setSelectedIds([layer.id]);setTool('move');}} onFinish={()=>setActiveAssetId(null)} cropMode={tool==='crop'}/></div>}
    </div>
    </div>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="flex w-[64px] shrink-0 flex-col items-center gap-1 border-r border-[#343b43] py-3">
        {([['move','Move',MousePointer2],['crop','Crop',Crop],['marquee','Rectangle Select',SquareDashedMousePointer],['frame','Photo Frame',ImageIcon],['hand','Hand',Hand]] as const).map(([id,label,Icon])=><button key={id} title={label} onClick={()=>{setTool(id);if(id!=='marquee')setMarqueeBox(null);}} className={'flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] '+(tool===id?'bg-[#3a4651] text-white':'text-[#a5afb9] hover:bg-[#28313a]')}><Icon size={17}/>{label}</button>)}
        <button title="Add text" onClick={addText} className="mt-2 flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] text-[#a5afb9] hover:bg-[#28313a]"><Plus size={17}/>Text</button>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#343b43] px-3">
          <button onClick={addPage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><FilePlus2 size={12} className="mr-1 inline"/> Add Page</button><button onClick={duplicatePage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><Copy size={12} className="mr-1 inline"/> Duplicate</button><button onClick={deletePage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><Trash2 size={12} className="mr-1 inline"/> Delete Page</button><span className="ml-auto flex items-center gap-1 text-[10px] text-[#aeb8c2]"><button title="Zoom out" onClick={()=>setPageZoom(v=>Math.max(10,v-(v>500?50:25)))} className="rounded border border-[#47515b] p-1"><ZoomOut size={13}/></button><input aria-label="Page zoom" type="range" min="10" max="1600" step="5" value={pageZoom} onChange={e=>setPageZoom(Number(e.target.value))} className="w-20"/><button title="Zoom in" onClick={()=>setPageZoom(v=>Math.min(1600,v+(v>=500?50:25)))} className="rounded border border-[#47515b] p-1"><ZoomIn size={13}/></button><button onClick={()=>setPageZoom(100)} className="rounded border border-[#47515b] px-1.5 py-1">{pageZoom}% · Reset</button></span>
          <div className="ml-2 flex min-w-0 gap-1 overflow-x-auto">{pages.map((p,i)=><button key={p.id} onClick={()=>{setPageIndex(i);setSelectedIds([]);}} className={'shrink-0 rounded px-3 py-1 text-[10px] '+(i===pageIndex?'bg-[#39434d] text-white':'text-[#9da8b3] hover:bg-[#28313a]')}>{p.name}</button>)}</div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 overflow-auto p-5" ref={stageRef} onPointerDown={e=>{if(tool==='marquee'||tool==='frame'){const p=pagePoint(e);setDraw({x:p.x,y:p.y,cx:p.x,cy:p.y});setMarqueeBox(null);e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerMove={e=>{if(!draw)return;const p=pagePoint(e);setDraw(d=>d?{...d,cx:p.x,cy:p.y}:null);}} onPointerUp={()=>{if(!draw)return;const rect={x:Math.min(draw.x,draw.cx),y:Math.min(draw.y,draw.cy),w:Math.abs(draw.cx-draw.x),h:Math.abs(draw.cy-draw.y)};if(rect.w>2&&rect.h>2){if(tool==='frame'){const l:ManualLayer={id:uid(),type:'frame',name:'Photo Frame',...rect};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]);}else{setMarqueeBox(rect);setSelectedIds(page.layers.filter(l=>intersects(rect,l)).map(l=>l.id));}}setDraw(null);}}>
          <div className="shrink-0" style={{width:Math.max(stageSize.width,zoomedPageWidth+40),height:Math.max(stageSize.height,zoomedPageHeight+40),display:'flex',alignItems:zoomedPageHeight<stageSize.height-40?'center':'flex-start',justifyContent:zoomedPageWidth<stageSize.width-40?'center':'flex-start'}}><div data-manual-page className="relative shrink-0 shadow-[0_14px_50px_rgba(0,0,0,.45)]" style={{width:basePageWidth,height:fitPageHeight,zoom:pageZoom/100,aspectRatio:page.width+'/'+page.height,background:page.background}} onPointerDown={e=>{if(tool!=='move')return;const target=(e.target as HTMLElement).closest('[data-layer-id]') as HTMLElement|null;if(!target)return;const id=target.dataset.layerId||'';const layer=page.layers.find(l=>l.id===id);if(!layer||layer.locked)return;e.stopPropagation();setSelectedIds([id]);const p=pagePoint(e);setDrag({id,px:p.x,py:p.y,x:layer.x,y:layer.y});e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(cropDrag?.mode==='draw'){updateCropDraw(e);return;}if(!drag)return;const p=pagePoint(e);updateLayer(drag.id,{x:Math.max(0,Math.min(page.width-5,drag.x+p.x-drag.px)),y:Math.max(0,Math.min(page.height-5,drag.y+p.y-drag.py))});}} onPointerUp={()=>{setDrag(null);setCropDrag(null);}}>
            {page.layers.map(l=><div key={l.id} data-layer-id={l.id} onClick={e=>{e.stopPropagation();if(tool==='move'||tool==='crop')setSelectedIds([l.id]);}} onPointerDown={e=>{if(tool==='crop'&&l.type==='photo')startCropDraw(e,l);}} className={'absolute overflow-hidden '+(selectedIds.includes(l.id)?'outline outline-2 outline-[#d4a66f]':'')} style={{left:(l.x/page.width*100)+'%',top:(l.y/page.height*100)+'%',width:(l.w/page.width*100)+'%',height:(l.h/page.height*100)+'%',transform:'rotate('+(l.rotation||0)+'deg)',background:l.type==='frame'?'rgba(148,163,184,.08)':'transparent',border:l.type==='frame'?'2px dashed #8794a2':(l.type==='photo'&&l.borderMm?`${Math.max(1,l.borderMm*basePageWidth/page.width)}px solid ${l.borderColor||'#111827'}`:'none'),cursor:l.locked?'not-allowed':tool==='move'?'move':'default'}}>
              {l.type==='photo'&&<><img src={l.src} alt={l.name} draggable={false} className={'h-full w-full select-none '+(tool==='crop'&&selectedIds.includes(l.id)?'object-fill':'object-cover')} style={{transform:'scale('+(l.cropZoom||100)/100+')'}}/>{tool==='crop'&&selectedIds.includes(l.id)&&<><div className="pointer-events-none absolute border-2 border-[#ef4444] bg-[#ef4444]/[0.08]" style={{left:cropBox.x+'%',top:cropBox.y+'%',width:cropBox.w+'%',height:cropBox.h+'%'}}><span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-[#991b1b] px-1.5 py-0.5 text-[9px] text-white">{unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(1)} × {unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(1)} {unit}</span></div>{(['nw','ne','sw','se'] as const).map(corner=><button key={corner} aria-label={'Adjust crop '+corner} onPointerDown={e=>startCropDrag(e,corner)} onPointerMove={moveCropDrag} onPointerUp={e=>{setCropDrag(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>setCropDrag(null)} onClick={e=>e.stopPropagation()} className="absolute z-20 h-3 w-3 rounded-full border border-[#b91c1c] bg-[#ef4444] touch-none" style={{left:corner.includes('w')?cropBox.x+'%':(cropBox.x+cropBox.w)+'%',top:corner.includes('n')?cropBox.y+'%':(cropBox.y+cropBox.h)+'%',transform:'translate(-50%,-50%)',cursor:corner==='nw'||corner==='se'?'nwse-resize':'nesw-resize'}}/>)}</>}</>}{l.type==='text'&&<span className="block p-1 text-sm text-black">{l.text}</span>}{l.type==='frame'&&<span className="flex h-full items-center justify-center text-[10px] text-[#9aa7b4]">Empty Photo Frame</span>}
            </div>)}
            {marqueeBox&&tool==='marquee'&&<div className="pointer-events-none absolute border-2 border-dashed border-[#60a5fa] bg-[#60a5fa]/10" style={{left:(marqueeBox.x/page.width*100)+'%',top:(marqueeBox.y/page.height*100)+'%',width:(marqueeBox.w/page.width*100)+'%',height:(marqueeBox.h/page.height*100)+'%'}}/>}{draw&&<div className="pointer-events-none absolute border border-dashed border-[#d4a66f] bg-[#d4a66f]/10" style={{left:(Math.min(draw.x,draw.cx)/page.width*100)+'%',top:(Math.min(draw.y,draw.cy)/page.height*100)+'%',width:(Math.abs(draw.cx-draw.x)/page.width*100)+'%',height:(Math.abs(draw.cy-draw.y)/page.height*100)+'%'}}/>}
          </div></div>
        </div>
      </main>
      <aside className="flex w-[270px] shrink-0 flex-col overflow-y-auto border-l border-[#343b43]">
        <div className="flex items-center justify-between border-b border-[#343b43] p-3"><strong className="text-xs">Manual Settings</strong><button onClick={()=>setSettingsOpen(v=>!v)}><Settings2 size={15}/></button></div>
        {settingsOpen&&<div className="space-y-3 border-b border-[#343b43] p-3 text-[10px] text-[#aeb8c2]">
          <div className="flex gap-2"><label className="flex-1">Unit<select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)} className="studio-control mt-1 h-8 w-full px-2"><option value="mm">mm</option><option value="cm">cm</option><option value="in">inch</option></select></label><label className="flex-1">Background<input type="color" value={page.background} onChange={e=>updatePage(p=>({...p,background:e.target.value}))} className="studio-control mt-1 h-8 w-full p-1"/></label></div>
          <div className="grid grid-cols-2 gap-2">{(['width','height'] as const).map(k=><label key={k}>{k==='width'?'Page width':'Page height'} ({unit})<input type="number" min="20" max="1000" value={Number(unitValue(page[k]).toFixed(2))} onChange={e=>updatePage(p=>({...p,[k]:Math.max(20,Math.min(1000,fromUnit(Number(e.target.value)||20)))}))} className="studio-control mt-1 h-8 w-full px-2"/></label>)}</div>
          <div className="flex flex-wrap gap-1">{[['A4 Portrait',210,297],['A4 Landscape',297,210],['A5',148,210],['Letter',215.9,279.4]].map(([name,w,h])=><button key={String(name)} onClick={()=>updatePage(p=>({...p,width:Number(w),height:Number(h)}))} className="rounded border border-[#46515c] px-2 py-1">{name}</button>)}</div>
          <label className="block">Page margin · {page.margin} mm<input type="range" min="0" max="30" value={page.margin} onChange={e=>updatePage(p=>({...p,margin:Number(e.target.value)}))} className="mt-1 w-full"/></label>
          <p className="leading-4 text-[#83909c]">Page settings are independent of Auto Photo Maker.</p>
        </div>}
        <div className="border-b border-[#343b43] p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Layers</strong><span>{page.layers.length} items</span></div>
          <div className="space-y-1">{[...page.layers].reverse().map(l=><div key={l.id} className={'flex items-center gap-1 rounded border px-2 py-2 '+(selectedIds.includes(l.id)?'border-[#b88b59] bg-[#292e34]':'border-[#39424b]')}><button onClick={()=>setSelectedIds([l.id])} className="min-w-0 flex-1 truncate text-left">{l.name}</button><button title={l.locked?'Unlock':'Lock'} onClick={()=>updateLayer(l.id,{locked:!l.locked})}>{l.locked?<Lock size={12}/>:<Unlock size={12}/>}</button><button title="Move layer up" onClick={()=>updatePage(p=>{const i=p.layers.findIndex(x=>x.id===l.id);if(i<0||i===p.layers.length-1)return p;const a=[...p.layers];[a[i],a[i+1]]=[a[i+1],a[i]];return{...p,layers:a};})}><ChevronUp size={12}/></button><button title="Move layer down" onClick={()=>updatePage(p=>{const i=p.layers.findIndex(x=>x.id===l.id);if(i<=0)return p;const a=[...p.layers];[a[i],a[i-1]]=[a[i-1],a[i]];return{...p,layers:a};})}><ChevronDown size={12}/></button></div>)}</div>
          <div className="mt-3 flex gap-1"><button onClick={duplicateSelected} disabled={!selected.length} className="flex-1 rounded border border-[#46515c] py-2 disabled:opacity-40"><Copy size={12} className="mr-1 inline"/>Duplicate</button><button onClick={removeSelected} disabled={!selected.length} className="flex-1 rounded border border-[#46515c] py-2 disabled:opacity-40"><Trash2 size={12} className="mr-1 inline"/>Delete</button></div>
          {tool==='crop'&&!selectedPhoto&&<div className="m-3 rounded border border-[#46515c] p-2 text-[9px] leading-4 text-[#aeb8c2]">Crop टूल चुनकर फोटो के किसी भी हिस्से से माउस दबाकर खींचें। फिर दाईं ओर साइज सेट करके Apply Crop दबाएँ।</div>}{selected.some(l=>l.type==='photo')&&<div className="mt-3 border-t border-[#343b43] pt-3">{tool==='crop'&&<div className="mb-3 rounded border border-[#b88b59] p-2"><div className="mb-2 text-[10px] font-semibold text-[#f2c58e]">Manual Crop · Drag anywhere on photo</div><p className="mb-2 text-[9px] leading-4 text-[#aeb8c2]">फोटो के किसी भी कोने/हिस्से से माउस दबाकर खींचें। लाल बॉक्स आपका चुना हुआ crop area दिखाएगा।</p><div className="mb-2 grid grid-cols-2 gap-2"><label>Crop width ({unit})<input type="number" min="0" step="0.1" placeholder={unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(2)} value={cropTargetW} onChange={e=>setCropTargetW(e.target.value)} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Crop height ({unit})<input type="number" min="0" step="0.1" placeholder={unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(2)} value={cropTargetH} onChange={e=>setCropTargetH(e.target.value)} className="studio-control mt-1 h-8 w-full px-2"/></label></div><label className="mb-2 flex items-center gap-2"><input type="checkbox" checked={cropLockRatio} onChange={e=>setCropLockRatio(e.target.checked)}/> Lock crop ratio to entered width/height</label><p className="mb-2 text-[9px] text-[#8d9aa6]">Live selection: {unitValue(selectedPhoto?.w*cropBox.w/100||0).toFixed(2)} × {unitValue(selectedPhoto?.h*cropBox.h/100||0).toFixed(2)} {unit}</p><button onClick={()=>void applyManualCrop()} className="flex w-full items-center justify-center gap-1 rounded bg-[#d5a66e] py-2 text-[10px] font-semibold text-[#171b20]"><Check size={13}/> Apply Crop</button><button onClick={()=>setCropBox({x:0,y:0,w:100,h:100})} className="mt-1 w-full rounded border border-[#46515c] py-1.5 text-[9px]">Reset crop frame</button></div>}<label>Photo crop zoom · {cropZoom}%<input type="range" min="100" max="300" value={cropZoom} onChange={e=>{setCropZoom(Number(e.target.value));selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{cropZoom:Number(e.target.value)}));}} className="mt-1 w-full"/></label><button onClick={()=>selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{rotation:((l.rotation||0)+90)%360}))} className="mt-2 w-full rounded border border-[#46515c] py-2"><RotateCw size={12} className="mr-1 inline"/>Rotate 90°</button><div className="mt-3 grid grid-cols-2 gap-2"><label>Width (mm)<input type="number" min="5" max="210" step="0.1" value={Number((selectedPhoto?.w||0).toFixed(1))} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{w:Math.max(5,Math.min(210,Number(e.target.value)||5))})} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Height (mm)<input type="number" min="5" max="297" step="0.1" value={Number((selectedPhoto?.h||0).toFixed(1))} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{h:Math.max(5,Math.min(297,Number(e.target.value)||5))})} className="studio-control mt-1 h-8 w-full px-2"/></label></div><div className="mt-2 grid grid-cols-[1fr_52px] gap-2"><label>Border (mm)<input type="number" min="0" max="5" step="0.1" value={selectedPhoto?.borderMm||0} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{borderMm:Math.max(0,Math.min(5,Number(e.target.value)||0))})} className="studio-control mt-1 h-8 w-full px-2"/></label><label>Color<input type="color" value={selectedPhoto?.borderColor||'#111827'} onChange={e=>selectedPhoto&&updateLayer(selectedPhoto.id,{borderColor:e.target.value})} className="studio-control mt-1 h-8 w-full p-1"/></label></div></div>}
        </div>
        <div className="p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Imported Assets</strong><span className="text-[9px] text-[#7f8b96]">{files.length} files</span></div>{files.length?files.map(f=><div key={f.id} className="mb-2 flex items-center gap-2 rounded border border-[#39424b] p-1.5"><img src={f.src} className="h-9 w-8 rounded object-cover" alt=""/><span className="min-w-0 flex-1 truncate text-[9px]">{f.name}</span></div>):<p className="text-[10px] text-[#7f8b96]">Imported photos and signatures appear in the photo workspace.</p>}</div>
      </aside>
    </div>
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#343b43] px-3 text-[9px] text-[#87939e]"><span>{page.name} · {page.width.toFixed(1)} × {page.height.toFixed(1)} mm · {page.layers.length} layers</span><span>Manual workspace · Preview · Zoom {pageZoom}%</span></div>
  </div>;
};
