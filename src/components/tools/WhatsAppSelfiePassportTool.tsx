import React, { useEffect, useRef, useState } from 'react';
import { TANSHU_PROFILE_PHOTO } from '../Header';
import {
  ArrowLeft, Camera, Check, Crop, Download, FileImage, FlipHorizontal,
  ImagePlus, Info, Layers3, RotateCcw, RotateCw, ScanFace,
  ShieldCheck, SlidersHorizontal, Sparkles, UploadCloud, WandSparkles,
  X, ZoomIn, ZoomOut
} from 'lucide-react';

type StudioTool = 'crop' | 'face' | 'straighten' | 'background' | 'print';

const WORKFLOW_STEPS = [
  { label: 'Upload Selfie', detail: 'Choose a customer photo', icon: Camera },
  { label: 'Crop & Face', detail: 'Frame the face correctly', icon: ScanFace },
  { label: 'Straighten', detail: 'Correct photo alignment', icon: RotateCw },
  { label: 'Background', detail: 'Prepare a clean backdrop', icon: Sparkles },
  { label: 'Print & Export', detail: 'Prepare final photo output', icon: Download },
];

const TOOL_ITEMS: { id: StudioTool; label: string; short: string; icon: typeof Crop }[] = [
  { id: 'crop', label: 'Crop & Position', short: 'CROP', icon: Crop },
  { id: 'face', label: 'Face Alignment', short: 'FACE', icon: ScanFace },
  { id: 'straighten', label: 'Straighten', short: 'ALIGN', icon: SlidersHorizontal },
  { id: 'background', label: 'Background', short: 'BG', icon: WandSparkles },
  { id: 'print', label: 'Photo Size & Print', short: 'PRINT', icon: FileImage },
];

const toolDescriptions: Record<StudioTool, { title: string; description: string }> = {
  crop: { title: 'Crop & Position', description: 'Set the photo frame and position the customer’s face accurately.' },
  face: { title: 'Face Alignment', description: 'The face guide will help keep the head straight and correctly placed.' },
  straighten: { title: 'Straighten & Rotate', description: 'Correct a tilted selfie before preparing the passport photo.' },
  background: { title: 'Background Studio', description: 'Prepare a clean, even background for the final photo.' },
  print: { title: 'Photo Size & Print', description: 'Choose a standard photo size and prepare print sheets.' },
};

export const WhatsAppSelfiePassportTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTool, setActiveTool] = useState<StudioTool>('crop');
  const [photoSize, setPhotoSize] = useState('35x45');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [inputMode, setInputMode] = useState<'selfie' | 'existing' | 'whatsapp'>('selfie');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [sheetSize, setSheetSize] = useState<'A4' | '4x6'>('A4');
  const [sheetZoom, setSheetZoom] = useState(100);
  const [signatureVisible, setSignatureVisible] = useState(true);
  const replacePhotoInputRef = useRef<HTMLInputElement>(null);
  const cropViewportRef = useRef<HTMLDivElement>(null);
  const cropDrawRef = useRef<{mode:'draw'|'move'|'resize';startX:number;startY:number;bounds:DOMRect;initialRect:{x:number;y:number;w:number;h:number};anchorX:number;anchorY:number;cornerX:number;cornerY:number}|null>(null);
  const photoPanRef = useRef<{startX:number;startY:number;offsetX:number;offsetY:number}|null>(null);
  const [isCropping,setIsCropping] = useState(false);
  const [cropRect,setCropRect] = useState({x:0,y:0,w:100,h:100});
  const [cropHasSelection,setCropHasSelection] = useState(false);
  const [photoOffset,setPhotoOffset] = useState({x:0,y:0});

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!signatureFile) { setSignatureUrl(''); return; }
    const url = URL.createObjectURL(signatureFile);
    setSignatureUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [signatureFile]);

  const handleSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) setSignatureFile(file);
    event.target.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setZoom(100);
    setRotation(0);
    setFlipped(false);
    setCropRect({x:0,y:0,w:100,h:100});
    setCropHasSelection(false);
    setPhotoOffset({x:0,y:0});
    setIsCropping(false);
    event.target.value = '';
  };

  const resetPreview = () => {
    setZoom(100); setRotation(0); setFlipped(false);
    setCropRect({x:0,y:0,w:100,h:100}); setCropHasSelection(false); setPhotoOffset({x:0,y:0}); setIsCropping(false);
  };
  const startPhotoPan=(event:React.PointerEvent<HTMLImageElement>)=>{
    if(isCropping||activeTool!=='crop')return;
    event.preventDefault();
    photoPanRef.current={startX:event.clientX,startY:event.clientY,offsetX:photoOffset.x,offsetY:photoOffset.y};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const startCropDraw=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(!isCropping||activeTool!=='crop')return;
    const bounds=event.currentTarget.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const px=Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100));
    const py=Math.max(0,Math.min(100,(event.clientY-bounds.top)/bounds.height*100));
    const valid=cropHasSelection&&cropRect.w>2&&cropRect.h>2;
    const inside=valid&&px>=cropRect.x&&px<=cropRect.x+cropRect.w&&py>=cropRect.y&&py<=cropRect.y+cropRect.h;
    let mode:'draw'|'move'|'resize'='draw';
    let cornerX=0,cornerY=0,anchorX=0,anchorY=0;
    const corners=[
      {id:'tl',x:cropRect.x,y:cropRect.y,cx:1,cy:1},
      {id:'tr',x:cropRect.x+cropRect.w,y:cropRect.y,cx:-1,cy:1},
      {id:'bl',x:cropRect.x,y:cropRect.y+cropRect.h,cx:1,cy:-1},
      {id:'br',x:cropRect.x+cropRect.w,y:cropRect.y+cropRect.h,cx:-1,cy:-1},
    ];
    const handle=(event.target as HTMLElement).closest('[data-crop-handle]')?.getAttribute('data-crop-handle');
    const hit=valid&&handle?corners.find(point=>point.id===handle):undefined;
    if(hit){
      mode='resize';cornerX=hit.cx;cornerY=hit.cy;
      anchorX=hit.x+(hit.cx===1?cropRect.w:-cropRect.w);
      anchorY=hit.y+(hit.cy===1?cropRect.h:-cropRect.h);
    }else if(inside){
      mode='move';
    }
    cropDrawRef.current={mode,startX:px,startY:py,bounds,initialRect:{...cropRect},anchorX,anchorY,cornerX,cornerY};
    if(mode==='draw')setCropRect({x:px,y:py,w:0,h:0});
  };
  const handleCropPointerMove=(event:React.PointerEvent<HTMLDivElement>)=>{
    const pan=photoPanRef.current;
    if(pan){
      setPhotoOffset({x:pan.offsetX+event.clientX-pan.startX,y:pan.offsetY+event.clientY-pan.startY});
      return;
    }
    const draw=cropDrawRef.current;
    if(!draw)return;
    const px=Math.max(0,Math.min(100,(event.clientX-draw.bounds.left)/draw.bounds.width*100));
    const py=Math.max(0,Math.min(100,(event.clientY-draw.bounds.top)/draw.bounds.height*100));
    if(draw.mode==='draw'){
      setCropRect({x:Math.min(draw.startX,px),y:Math.min(draw.startY,py),w:Math.abs(px-draw.startX),h:Math.abs(py-draw.startY)});
    }else if(draw.mode==='move'){
      const x=Math.max(0,Math.min(100-draw.initialRect.w,draw.initialRect.x+px-draw.startX));
      const y=Math.max(0,Math.min(100-draw.initialRect.h,draw.initialRect.y+py-draw.startY));
      setCropRect({...draw.initialRect,x,y});
    }else{
      const x=Math.min(draw.anchorX,px),y=Math.min(draw.anchorY,py);
      setCropRect({x,y,w:Math.abs(px-draw.anchorX),h:Math.abs(py-draw.anchorY)});
    }
  };
  const endCropDrag=()=>{
    photoPanRef.current=null;
    const draw=cropDrawRef.current;
    if(draw){
      cropDrawRef.current=null;
      if(draw.mode==='draw'){
        if(cropRect.w<1||cropRect.h<1){
          setCropRect({x:0,y:0,w:100,h:100});
          setCropHasSelection(false);
        }else{
          setCropHasSelection(true);
        }
      }
    }
  };

  const removeSelectedPhoto = () => {
    setSelectedFile(null);
    resetPreview();
  };

  return (
    <main className="min-h-screen bg-[#111518] text-[#E8EDF1]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#171C20]/95 backdrop-blur-xl">
        <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Back to TANSHU ONLINE" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#D6DEE5] transition hover:bg-white/10">
              <ArrowLeft size={17} />
            </a>
            <img src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" className="h-10 w-10 rounded-full border-2 border-emerald-300/80 object-cover object-center shadow-lg shadow-emerald-950/40" />
            <div>
              
              <h1 className="text-sm font-extrabold tracking-wide text-white sm:text-base">TANSHU ONLINE · WHATSAPP SELFIE PHOTO STUDIO</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 sm:inline-flex">
              <ShieldCheck size={13} /> Browser-side preview
            </span>
            <button type="button" onClick={resetPreview} disabled={!selectedFile} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#C8D1D9] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">Reset</button>
            <button type="button" disabled={!selectedFile} title="Export will be enabled after photo processing is implemented" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto h-[calc(100vh-68px)] max-w-[1920px] overflow-hidden px-2 py-2 sm:px-3">
        <section onPointerDown={event=>{const target=event.target as HTMLElement;if(isCropping&&cropViewportRef.current&&!cropViewportRef.current.contains(target)&&!target.closest('button'))setIsCropping(false);}} className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#343D44] bg-[#1A2025] shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#343D44] bg-[#20272D] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300"><Layers3 size={16}/></span>
              <div><p className="text-xs font-bold text-white">Studio Workspace</p><p className="text-[10px] text-[#8F9BA5]">Upload · Edit · Preview · Print</p></div>
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="mr-1 text-[9px] font-extrabold uppercase tracking-wider text-[#82949B]">Choose Photo</span>
              {([{id:'selfie',title:'Selfie Photo'},{id:'existing',title:'Existing Photo'},{id:'whatsapp',title:'WhatsApp Print'}] as const).map(mode => <button key={mode.id} type="button" onClick={() => setInputMode(mode.id)} aria-pressed={inputMode===mode.id} className={inputMode===mode.id?'rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-400/20 transition':'rounded-lg border border-[#3A444C] bg-[#1B2227] px-2.5 py-2 text-[10px] font-semibold text-[#AAB5BD] transition hover:bg-white/5 hover:text-white'}>{mode.title}</button>)}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#9BA7B0]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>{selectedFile ? 'Photo loaded locally' : 'Waiting for photo'}<span className="mx-1 text-[#4D5962]">|</span>Studio ready</div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[76px_minmax(0,1fr)_310px]">
            <nav aria-label="Studio tools" className="flex min-h-0 flex-col gap-1 overflow-y-auto overflow-x-hidden border-r border-[#343D44] bg-[#171D22] p-2 lg:p-3">
              {TOOL_ITEMS.map((tool) => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return (
                  <button key={tool.id} type="button" onClick={() => { setActiveTool(tool.id); if(tool.id !== 'crop') setIsCropping(false); }} title={tool.label} aria-pressed={active} className={active ? 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-2 py-3 text-emerald-300 ring-1 ring-emerald-400/25 lg:min-w-0 lg:flex-none' : 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[#87939D] transition hover:bg-white/5 hover:text-white lg:min-w-0 lg:flex-none'}>
                    <Icon size={19}/><span className="text-[9px] font-bold leading-tight">{tool.short}</span>
                    {active && <span className="hidden h-1 w-4 rounded-full bg-emerald-400 lg:block"/>}
                  </button>
                );
              })}
              <div className="hidden flex-1 lg:block"/>
              <div className="hidden rounded-xl border border-white/5 bg-white/[.03] p-2 text-center lg:block"><ShieldCheck size={17} className="mx-auto text-emerald-400"/><p className="mt-1 text-[8px] font-semibold text-[#87939D]">LOCAL</p></div>
            </nav>

            <section className="flex min-h-0 min-w-0 flex-col overflow-y-auto bg-[#12171B] overscroll-contain">
              <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-[#303941] bg-[#12171B]/95 px-4 py-3 backdrop-blur">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C9AA4]">Live photo canvas</p><p className="mt-0.5 text-xs font-semibold text-[#E3E8EC]">{selectedFile ? 'Photo loaded · Ready to edit' : 'Your photo preview will appear here'}</p></div>
                <div className="flex items-center gap-1.5">
                  {selectedFile && <>
                    <input ref={replacePhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                    <button type="button" onClick={() => replacePhotoInputRef.current?.click()} className="rounded-lg border border-emerald-400/30 px-2.5 py-2 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-400/10">Replace Photo</button>
                    <button type="button" onClick={removeSelectedPhoto} className="rounded-lg border border-rose-400/25 px-2.5 py-2 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-400/10">Remove</button>
                  </>}
                  <button type="button" onClick={() => setZoom(value => Math.max(50, value - 10))} disabled={!selectedFile} aria-label="Zoom out" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomOut size={14}/></button>
                  <span className="w-10 text-center text-[10px] font-bold tabular-nums text-[#C8D1D9]">{zoom}%</span>
                  <button type="button" onClick={() => setZoom(value => Math.min(180, value + 10))} disabled={!selectedFile} aria-label="Zoom in" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomIn size={14}/></button>
                  {selectedFile&&activeTool==='crop'&&<button type="button" onClick={()=>setIsCropping(v=>!v)} className={isCropping?'ml-1 rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-2.5 py-2 text-[10px] font-bold text-emerald-200':'ml-1 rounded-lg border border-[#3A444C] px-2.5 py-2 text-[10px] font-semibold text-[#AEB8C0] hover:bg-white/5'}>{isCropping?'Done':'Crop'}</button>}
                  <button type="button" onClick={() => setShowGuides(value => !value)} disabled={!selectedFile} className={showGuides ? 'ml-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-semibold text-emerald-300 disabled:opacity-30' : 'ml-1 rounded-lg border border-[#3A444C] px-2.5 py-2 text-[10px] font-semibold text-[#AEB8C0] disabled:opacity-30'}>Guides</button>
                </div>
              </div>

              <div onWheel={(event) => { if (selectedFile) { event.preventDefault(); const delta = event.deltaY < 0 ? 5 : -5; if (activeTool === 'print') setSheetZoom(value => Math.max(50, Math.min(160, value + delta))); else setZoom(value => Math.max(50, Math.min(250, value + delta))); } }} className="relative flex min-h-[calc(100vh-190px)] flex-1 items-center justify-center overflow-auto p-4 sm:min-h-[calc(100vh-190px)] sm:p-6" style={{backgroundImage:'radial-gradient(#34414a 1px, transparent 1px)',backgroundSize:'18px 18px'}}>
                {!selectedFile ? (
                  <label className="group flex min-h-[390px] w-full max-w-[580px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#4B6260] bg-[#1A2527]/90 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-[#1D2B2B]">
                    <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-xl shadow-black/20 transition group-hover:scale-105"><UploadCloud size={35}/></span>
                    <span className="text-lg font-extrabold text-white sm:text-xl">{inputMode === 'selfie' ? 'Upload Customer Selfie' : inputMode === 'existing' ? 'Upload Existing Photo' : 'Upload WhatsApp Photo'}</span>
                    <span className="mt-2 max-w-sm text-xs leading-6 text-[#9EADB4] sm:text-sm">{inputMode === 'selfie' ? 'Choose a customer selfie for guided face positioning.' : inputMode === 'existing' ? 'Choose an older passport photo or low-resolution image.' : 'Choose a tilted or photographed passport print received on WhatsApp.'}</span>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/50 transition group-hover:-translate-y-0.5"><ImagePlus size={16}/> Choose Photo</span>
                    <span className="mt-4 text-[10px] text-[#73828A]">JPG · PNG · WEBP · Image files</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/>
                  </label>
                ) : (
                  activeTool === 'print' ? (
                    <div className="flex min-h-full min-w-full items-center justify-center overflow-auto p-5">
                      <div className="relative shrink-0 rounded-sm bg-white p-5 shadow-2xl" style={{width:sheetSize==='A4'?Math.round(420*sheetZoom/100)+'px':Math.round(360*sheetZoom/100)+'px',minHeight:sheetSize==='A4'?Math.round(594*sheetZoom/100)+'px':Math.round(240*sheetZoom/100)+'px'}}>
                        <div className="grid grid-cols-3 content-start gap-3">
                          {Array.from({length:sheetSize==='A4'?12:4},(_,index)=><div key={index} className="relative overflow-hidden border border-slate-300 bg-slate-100" style={{aspectRatio:photoSize==='2x2'?'1 / 1':'7 / 9'}}>
                            <img src={previewUrl} alt="" className="h-full w-full object-cover" style={{transform:'rotate('+rotation+'deg) scale('+zoom/100+') scaleX('+(flipped?-1:1)+')'}}/>
                            {signatureUrl && signatureVisible && <img src={signatureUrl} alt="" className="absolute bottom-[8%] right-[8%] h-[12%] w-[38%] object-contain"/>}
                          </div>)}
                        </div>
                        <span className="absolute bottom-2 right-3 text-[8px] font-semibold text-slate-400">{sheetSize} · LAYOUT PREVIEW · {sheetZoom}%</span>
                      </div>
                    </div>
                  ) : (
                  <div className="relative flex h-full min-h-[420px] w-full items-center justify-center">
                    <div ref={cropViewportRef} onPointerDown={startCropDraw} onPointerMove={handleCropPointerMove} onPointerUp={endCropDrag} onPointerCancel={endCropDrag} className={'relative flex max-h-[calc(100vh-150px)] max-w-[min(100%,480px)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-[#E7E8E6] p-2 shadow-2xl shadow-black/50 '+(isCropping?'cursor-crosshair':'')} style={{aspectRatio:photoSize==='2x2'?'1 / 1':'7 / 9',height:'min(76vh, 720px)',touchAction:'none'}}>
                      <img src={previewUrl} alt="Customer selfie preview" draggable={false} onPointerDown={startPhotoPan} className={'h-full w-full select-none object-contain '+(isCropping?'pointer-events-none':'cursor-grab active:cursor-grabbing')} style={{transform:'translate('+photoOffset.x+'px, '+photoOffset.y+'px) rotate('+rotation+'deg) scale('+zoom/100+') scaleX('+(flipped?-1:1)+')',clipPath:(!isCropping&&(cropRect.x!==0||cropRect.y!==0||cropRect.w!==100||cropRect.h!==100))?'inset('+cropRect.y+'% '+(100-cropRect.x-cropRect.w)+'% '+(100-cropRect.y-cropRect.h)+'% '+cropRect.x+'%)':undefined}}/>
                      {showGuides&&!isCropping&&<div className="pointer-events-none absolute inset-[9%] rounded-md border border-dashed border-emerald-600/70"><div className="absolute left-1/2 top-0 h-full border-l border-dashed border-emerald-600/35"/><div className="absolute left-0 top-1/3 w-full border-t border-dashed border-emerald-600/35"/><div className="absolute left-0 top-2/3 w-full border-t border-dashed border-emerald-600/35"/></div>}
                      {isCropping&&activeTool==='crop'&&cropRect.w>0&&cropRect.h>0&&<div className="pointer-events-none absolute rounded-sm border-2 border-rose-600 shadow-[0_0_0_9999px_rgba(0,0,0,0.48)]" style={{left:cropRect.x+'%',top:cropRect.y+'%',width:cropRect.w+'%',height:cropRect.h+'%'}}><span data-crop-handle="tl" className="pointer-events-auto absolute -left-2 -top-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="tr" className="pointer-events-auto absolute -right-2 -top-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="bl" className="pointer-events-auto absolute -bottom-2 -left-2 z-10 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/><span data-crop-handle="br" className="pointer-events-auto absolute -bottom-2 -right-2 z-10 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-rose-600 bg-white shadow-md"/></div>}
                      {isCropping&&<span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 text-[9px] font-bold text-white">DRAG TO DRAW · INSIDE TO MOVE · CORNERS TO RESIZE · DONE TO APPLY</span>}
                      {signatureUrl && signatureVisible && <img src={signatureUrl} alt="Signature overlay preview" className="absolute bottom-[13%] right-[12%] max-h-[12%] max-w-[38%] object-contain drop-shadow" />}
                      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[9px] font-bold tracking-wide text-white">PREVIEW ONLY</span>
                    </div>
                  </div>
                  )
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#303941] bg-[#1A2025] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] text-[#8E9AA3]"><Info size={13}/>{selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2)+' MB · Local preview' : 'Upload a selfie to begin'}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setRotation(value => (value - 90 + 360) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCcw size={13}/> Rotate left</button>
                  <button type="button" onClick={() => setRotation(value => (value + 90) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCw size={13}/> Rotate right</button>
                  <button type="button" onClick={() => setFlipped(value => !value)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><FlipHorizontal size={13}/> Flip</button>
                </div>
              </div>
            </section>

            <aside className="hidden min-h-0 overflow-y-auto border-l border-[#343D44] bg-[#1B2126] overscroll-contain lg:block">
              <div className="border-b border-[#343D44] px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Tool settings</p>
                <h3 className="mt-1 text-base font-extrabold text-white">{toolDescriptions[activeTool].title}</h3>
                <p className="mt-1 text-[10px] leading-5 text-[#94A1AA]">{toolDescriptions[activeTool].description}</p>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold tracking-wide text-[#D4DCE1]">PHOTO INPUT</span><span className={selectedFile ? 'rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300' : 'rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-[#87939D]'}>{selectedFile ? 'LOADED' : 'EMPTY'}</span></div>
                  {selectedFile ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#313B42]"><img src={previewUrl} alt="" className="h-full w-full object-cover"/></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">{selectedFile.name}</p><p className="mt-1 text-[9px] text-[#8F9CA5]">{(selectedFile.size / 1024).toFixed(0)} KB</p></div>
                      <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove uploaded selfie" className="rounded-lg p-2 text-[#A9B3BA] hover:bg-rose-500/10 hover:text-rose-300"><X size={15}/></button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-400/5"><ImagePlus size={14}/> Select customer selfie<input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/></label>
                  )}
                </div>

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <label className="mb-2 block text-[10px] font-bold tracking-wide text-[#D4DCE1]" htmlFor="passport-photo-size">PASSPORT PHOTO SIZE</label>
                  <select id="passport-photo-size" value={photoSize} onChange={event => setPhotoSize(event.target.value)} className="h-10 w-full rounded-lg border border-[#46535C] bg-[#171D22] px-3 text-xs font-semibold text-white outline-none focus:border-emerald-400">
                    <option value="35x45">India Passport · 35 × 45 mm</option>
                    <option value="2x2">Visa Photo · 2 × 2 inch</option>
                    <option value="35x35">Square Photo · 35 × 35 mm</option>
                  </select>
                  <p className="mt-2 text-[9px] leading-4 text-[#83919A]">Size selection currently updates the preview frame only. Exact crop/export is a later stage.</p>
                </div>

                {activeTool === 'crop' ? (
                  <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                    <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold text-[#D4DCE1]">PHOTO ZOOM</span><span className="text-[10px] font-bold tabular-nums text-emerald-300">{zoom}%</span></div>
                    <input aria-label="Preview zoom" type="range" min="50" max="180" step="5" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-emerald-400"/>
                    <div className="mt-2 flex justify-between text-[9px] text-[#829099]"><span>50%</span><span>100%</span><span>180%</span></div>
                    <button type="button" onClick={() => setShowGuides(value => !value)} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[10px] font-semibold text-[#C3CDD3]"><span>Composition guides</span><span className={showGuides ? 'text-emerald-300' : 'text-[#7E8A93]'}>{showGuides ? 'ON' : 'OFF'}</span></button>
                    <button type="button" onClick={()=>setPhotoOffset({x:0,y:0})} className="mt-2 w-full rounded-lg border border-[#46535C] px-3 py-2 text-[10px] font-semibold text-[#C3CDD3] hover:bg-white/5">Center photo position</button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-3">
                    <div className="flex items-center gap-2 text-amber-200"><Sparkles size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Next development stage</span></div>
                    <p className="mt-2 text-[10px] leading-5 text-[#B5BFC5]">This tool is visible in the studio layout. Its full editing controls will be connected after the core crop and preview workflow is completed.</p>
                  </div>
                )}

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">SIGNATURE ON PHOTO</p>
                  {signatureFile ? <div className="flex items-center gap-2"><img src={signatureUrl} alt="Signature" className="h-10 w-16 rounded bg-white object-contain p-1"/><span className="min-w-0 flex-1 truncate text-[9px] text-[#C8D1D9]">{signatureFile.name}</span><button type="button" onClick={() => setSignatureFile(null)} className="rounded p-1 text-rose-300" aria-label="Remove signature"><X size={14}/></button></div> : <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300 hover:bg-emerald-400/5"><ImagePlus size={14}/> Add signature image<input type="file" accept="image/*" className="sr-only" onChange={handleSignatureChange}/></label>}
                  <button type="button" disabled={!signatureFile} onClick={() => setSignatureVisible(value => !value)} className="mt-2 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[9px] font-semibold text-[#C3CDD3] disabled:opacity-40"><span>Show signature on preview</span><span className="text-emerald-300">{signatureVisible ? 'ON' : 'OFF'}</span></button>
                  <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Signature is shown as a preview overlay. Final composite export will be connected with the print renderer.</p>
                </div>

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">PRINT SHEET SETUP</p>
                  <select value={sheetSize} onChange={event => setSheetSize(event.target.value as 'A4'|'4x6')} className="h-9 w-full rounded-lg border border-[#46535C] bg-[#171D22] px-2 text-[10px] font-semibold text-white"><option value="A4">A4 Sheet</option><option value="4x6">4 × 6 inch Sheet</option></select>
                  <div className="mt-3 flex items-center justify-between"><span className="text-[9px] font-bold text-[#D4DCE1]">SHEET ZOOM</span><span className="text-[9px] tabular-nums text-emerald-300">{sheetZoom}%</span></div>
                  <input type="range" min="50" max="160" step="5" value={sheetZoom} onChange={event => setSheetZoom(Number(event.target.value))} className="mt-2 w-full accent-emerald-400"/>
                  <p className="mt-2 text-[8px] leading-4 text-[#83919A]">Mouse wheel over the preview while Print is selected to zoom the sheet.</p>
                </div>

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">WORKFLOW</p>
                  <div className="space-y-3">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const active = index === 0;
                      return <div key={step.label} className="flex items-center gap-2.5">
                        <span className={active ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#303940] text-[#83919A]'}><Icon size={15}/></span>
                        <div className="min-w-0 flex-1"><p className={active ? 'text-[10px] font-bold text-emerald-300' : 'text-[10px] font-bold text-[#B4BEC5]'}>{step.label}</p><p className="text-[9px] text-[#7F8C95]">{step.detail}</p></div>
                        {active && <Check size={13} className="text-emerald-300"/>}
                      </div>;
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-sky-300/15 bg-sky-300/[.05] p-3">
                  <div className="flex items-center gap-2 text-sky-200"><ShieldCheck size={14}/><span className="text-[10px] font-bold">Privacy-first preview</span></div>
                  <p className="mt-1.5 text-[9px] leading-4 text-[#94A3AD]">The selected image is previewed locally in this browser. This screen does not upload it to a server.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

      </div>
    </main>
  );
};
