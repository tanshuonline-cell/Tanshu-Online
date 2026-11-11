import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Plus, Upload, Trash2, Copy, Image as ImageIcon, MousePointer2, Crop, SquareDashedMousePointer, Hand, Lock, Unlock, ChevronUp, ChevronDown, Download, RotateCw, Settings2, FilePlus2 } from 'lucide-react';

type ManualLayer = { id: string; type: 'photo'|'frame'|'text'; name: string; x: number; y: number; w: number; h: number; src?: string; fileName?: string; text?: string; locked?: boolean; rotation?: number; cropZoom?: number };
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
  const [unit, setUnit] = useState<'mm'|'cm'|'in'>('mm');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [drag, setDrag] = useState<{id:string;px:number;py:number;x:number;y:number}|null>(null);
  const [draw, setDraw] = useState<{x:number;y:number;cx:number;cy:number}|null>(null);
  const [cropZoom, setCropZoom] = useState(100);
  const uploadRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const page = pages[pageIndex] || pages[0];
  const selected = page.layers.filter(layer => selectedIds.includes(layer.id));
  const updatePage = (fn: (p:ManualPage)=>ManualPage) => setPages(current=>current.map((p,i)=>i===pageIndex?fn(p):p));
  const updateLayer = (id:string, patch:Partial<ManualLayer>) => updatePage(p=>({...p,layers:p.layers.map(l=>l.id===id?{...l,...patch}:l)}));
  const addImage = (file:{id:string;name:string;src:string}, target?:{x:number;y:number;w:number;h:number}) => {
    const layer:ManualLayer={id:uid(),type:'photo',name:file.name,fileName:file.name,src:file.src,x:target?.x??page.margin+8,y:target?.y??page.margin+8,w:target?.w??45,h:target?.h??60,cropZoom:100};
    updatePage(p=>({...p,layers:[...p.layers,layer]})); setSelectedIds([layer.id]);
  };
  const onFiles = (list:FileList|null) => {
    if(!list)return;
    Array.from(list).filter(f=>f.type.startsWith('image/')).forEach(file=>{
      const item={id:uid(),name:file.name,src:URL.createObjectURL(file)};
      setFiles(current=>[...current,item]);
      if(tool==='frame') {
        const frame=page.layers.find(l=>l.type==='frame'&&selectedIds.includes(l.id));
        if(frame){addImage(item,{x:frame.x,y:frame.y,w:frame.w,h:frame.h});updatePage(p=>({...p,layers:p.layers.filter(l=>l.id!==frame.id)}));}
        else addImage(item);
      } else addImage(item);
    });
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
      if(layer.src){const img=new Image();img.src=layer.src;await new Promise<void>(resolve=>{img.onload=()=>{ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate((layer.rotation||0)*Math.PI/180);ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();resolve();};img.onerror=()=>resolve();});}
    }
    const link=document.createElement('a');link.download=page.name.replace(/\\s+/g,'-')+'.png';link.href=canvas.toDataURL('image/png');link.click();
  };
  const unitValue=(mm:number)=>unit==='mm'?mm:unit==='cm'?mm/10:mm/25.4;
  const fromUnit=(v:number)=>unit==='mm'?v:unit==='cm'?v*10:v*25.4;
  const scale=useMemo(()=>1,[page.width,page.height]);
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#171b20] text-[#e4e8ec]">
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#343b43] px-3">
      <div className="flex items-center gap-2"><button onClick={onBackToAuto} className="rounded-md border border-[#424a53] px-2 py-1.5 text-xs hover:bg-[#303840]"><ArrowLeft size={13} className="mr-1 inline"/> Auto Photo Maker</button><strong className="text-xs tracking-wide">MANUAL PHOTO STUDIO</strong><span className="rounded bg-[#29352f] px-2 py-1 text-[9px] text-[#b8d6c4]">Independent workspace</span></div>
      <div className="flex items-center gap-2"><button onClick={()=>uploadRef.current?.click()} className="rounded border border-[#47515b] px-3 py-1.5 text-xs"><Upload size={13} className="mr-1 inline"/> Import Photos</button><button onClick={()=>void exportPage()} className="rounded bg-[#d5a66e] px-3 py-1.5 text-xs font-semibold text-[#171b20]"><Download size={13} className="mr-1 inline"/> Export Page PNG</button><input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>onFiles(e.target.files)}/></div>
    </div>
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside className="flex w-[64px] shrink-0 flex-col items-center gap-1 border-r border-[#343b43] py-3">
        {([['move','Move',MousePointer2],['crop','Crop',Crop],['marquee','Rectangle Select',SquareDashedMousePointer],['frame','Photo Frame',ImageIcon],['hand','Hand',Hand]] as const).map(([id,label,Icon])=><button key={id} title={label} onClick={()=>setTool(id)} className={'flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] '+(tool===id?'bg-[#3a4651] text-white':'text-[#a5afb9] hover:bg-[#28313a]')}><Icon size={17}/>{label}</button>)}
        <button title="Add text" onClick={addText} className="mt-2 flex w-[54px] flex-col items-center gap-1 rounded-lg py-2 text-[9px] text-[#a5afb9] hover:bg-[#28313a]"><Plus size={17}/>Text</button>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#343b43] px-3">
          <button onClick={addPage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><FilePlus2 size={12} className="mr-1 inline"/> Add Page</button><button onClick={duplicatePage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><Copy size={12} className="mr-1 inline"/> Duplicate</button><button onClick={deletePage} className="rounded border border-[#47515b] px-2 py-1 text-[10px]"><Trash2 size={12} className="mr-1 inline"/> Delete Page</button>
          <div className="ml-2 flex min-w-0 gap-1 overflow-x-auto">{pages.map((p,i)=><button key={p.id} onClick={()=>{setPageIndex(i);setSelectedIds([]);}} className={'shrink-0 rounded px-3 py-1 text-[10px] '+(i===pageIndex?'bg-[#39434d] text-white':'text-[#9da8b3] hover:bg-[#28313a]')}>{p.name}</button>)}</div>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5" ref={stageRef} onPointerDown={e=>{if(tool==='marquee'){const p=pagePoint(e);setDraw({x:p.x,y:p.y,cx:p.x,cy:p.y});e.currentTarget.setPointerCapture(e.pointerId);}else if(tool==='frame'){const p=pagePoint(e);setDraw({x:p.x,y:p.y,cx:p.x,cy:p.y});e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerMove={e=>{if(!draw)return;const p=pagePoint(e);setDraw(d=>d?{...d,cx:p.x,cy:p.y}:null);}} onPointerUp={()=>{if(!draw)return;const rect={x:Math.min(draw.x,draw.cx),y:Math.min(draw.y,draw.cy),w:Math.abs(draw.cx-draw.x),h:Math.abs(draw.cy-draw.y)};if(rect.w>2&&rect.h>2){if(tool==='frame'){const l:ManualLayer={id:uid(),type:'frame',name:'Photo Frame',...rect};updatePage(p=>({...p,layers:[...p.layers,l]}));setSelectedIds([l.id]);}else{setSelectedIds(page.layers.filter(l=>intersects(rect,l)).map(l=>l.id));}}setDraw(null);}}>
          <div data-manual-page className="relative shrink-0 shadow-[0_14px_50px_rgba(0,0,0,.45)]" style={{width:'min(100%, '+(page.width/page.height*70)+'vh)',aspectRatio:page.width+'/'+page.height,background:page.background}} onPointerDown={e=>{if(tool!=='move')return;const target=(e.target as HTMLElement).closest('[data-layer-id]') as HTMLElement|null;if(!target)return;const id=target.dataset.layerId||'';const layer=page.layers.find(l=>l.id===id);if(!layer||layer.locked)return;e.stopPropagation();setSelectedIds([id]);const p=pagePoint(e);setDrag({id,px:p.x,py:p.y,x:layer.x,y:layer.y});e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(!drag)return;const p=pagePoint(e);updateLayer(drag.id,{x:Math.max(0,Math.min(page.width-5,drag.x+p.x-drag.px)),y:Math.max(0,Math.min(page.height-5,drag.y+p.y-drag.py))});}} onPointerUp={()=>setDrag(null)}>
            {page.layers.map(l=><div key={l.id} data-layer-id={l.id} onClick={e=>{e.stopPropagation();if(tool==='move'||tool==='crop')setSelectedIds([l.id]);}} className={'absolute overflow-hidden '+(selectedIds.includes(l.id)?'outline outline-2 outline-[#d4a66f]':'')} style={{left:(l.x/page.width*100)+'%',top:(l.y/page.height*100)+'%',width:(l.w/page.width*100)+'%',height:(l.h/page.height*100)+'%',transform:'rotate('+(l.rotation||0)+'deg)',background:l.type==='frame'?'rgba(148,163,184,.08)':'transparent',border:l.type==='frame'?'2px dashed #8794a2':'none',cursor:l.locked?'not-allowed':tool==='move'?'move':'default'}}>
              {l.type==='photo'&&<img src={l.src} alt={l.name} draggable={false} className="h-full w-full select-none object-cover" style={{transform:'scale('+(l.cropZoom||100)/100+')'}}/>}{l.type==='text'&&<span className="block p-1 text-sm text-black">{l.text}</span>}{l.type==='frame'&&<span className="flex h-full items-center justify-center text-[10px] text-[#9aa7b4]">Empty Photo Frame</span>}
            </div>)}
            {draw&&<div className="pointer-events-none absolute border border-dashed border-[#d4a66f] bg-[#d4a66f]/10" style={{left:(Math.min(draw.x,draw.cx)/page.width*100)+'%',top:(Math.min(draw.y,draw.cy)/page.height*100)+'%',width:(Math.abs(draw.cx-draw.x)/page.width*100)+'%',height:(Math.abs(draw.cy-draw.y)/page.height*100)+'%'}}/>}
          </div>
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
          {selected.some(l=>l.type==='photo')&&<div className="mt-3 border-t border-[#343b43] pt-3"><label>Photo crop zoom · {cropZoom}%<input type="range" min="100" max="300" value={cropZoom} onChange={e=>{setCropZoom(Number(e.target.value));selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{cropZoom:Number(e.target.value)}));}} className="mt-1 w-full"/></label><button onClick={()=>selected.filter(l=>l.type==='photo').forEach(l=>updateLayer(l.id,{rotation:((l.rotation||0)+90)%360}))} className="mt-2 w-full rounded border border-[#46515c] py-2"><RotateCw size={12} className="mr-1 inline"/>Rotate 90°</button></div>}
        </div>
        <div className="p-3"><div className="mb-2 flex items-center justify-between"><strong className="text-xs">Imported Photos</strong><button onClick={()=>uploadRef.current?.click()}><Plus size={14}/></button></div>{files.length?files.map(f=><div key={f.id} className="mb-2 flex items-center gap-2 rounded border border-[#39424b] p-1.5"><img src={f.src} className="h-9 w-8 rounded object-cover" alt=""/><span className="min-w-0 flex-1 truncate text-[9px]">{f.name}</span><button onClick={()=>addImage(f)} title="Add to page"><Plus size={13}/></button></div>):<p className="text-[10px] text-[#7f8b96]">Import photos to add them to this page.</p>}</div>
      </aside>
    </div>
    <div className="flex h-8 shrink-0 items-center justify-between border-t border-[#343b43] px-3 text-[9px] text-[#87939e]"><span>{page.name} · {page.width.toFixed(1)} × {page.height.toFixed(1)} mm · {page.layers.length} layers</span><span>Manual workspace · Preview</span></div>
  </div>;
};
