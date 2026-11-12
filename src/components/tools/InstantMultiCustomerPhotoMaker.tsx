import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Crop, ImagePlus,
  LayoutGrid, Plus, Printer, RotateCw, Settings2, SlidersHorizontal,
  Sparkles, Trash2, Upload, Users, UserRound, X, WandSparkles
} from 'lucide-react';

type CropBox = { x: number; y: number; w: number; h: number };
type CustomerPhoto = {
  id: string; file: File; previewUrl: string; workingUrl: string; name: string;
  size: string; quantity: number; customWidth: number; customHeight: number;
  brightness: number; contrast: number; saturation: number; bgRemoved: boolean;
};
const PHOTO_SIZES = [
  { value: '35x45', label: '35 × 45 mm', w: 35, h: 45 },
  { value: '25x35', label: '25 × 35 mm', w: 25, h: 35 },
  { value: '2x2', label: '2 × 2 inch', w: 50.8, h: 50.8 },
  { value: '35x35', label: '35 × 35 mm', w: 35, h: 35 },
  { value: 'custom', label: 'Custom size', w: 35, h: 45 },
];
const WORKFLOW = [
  { id: 'upload', label: 'Upload Customers', hint: 'Add multiple photos', icon: Upload },
  { id: 'crop', label: 'Crop & Position', hint: 'Select and apply crop', icon: Crop },
  { id: 'background', label: 'Background', hint: 'Batch background cleanup', icon: Sparkles },
  { id: 'adjust', label: 'Photo Adjustments', hint: 'Color and light settings', icon: SlidersHorizontal },
  { id: 'print', label: 'A4 Print Studio', hint: 'Quantity and smart layout', icon: Printer },
];
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src;
});
const canvasUrl = (canvas: HTMLCanvasElement) => canvas.toDataURL('image/png');
const mmFor = (customer: CustomerPhoto) => {
  const preset = PHOTO_SIZES.find(s => s.value === customer.size);
  return customer.size === 'custom' ? { w: customer.customWidth, h: customer.customHeight } : { w: preset?.w || 35, h: preset?.h || 45 };
};
const makeAdjusted = async (customer: CustomerPhoto) => {
  const img = await loadImage(customer.workingUrl);
  const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d'); if (!ctx) return customer.workingUrl;
  ctx.filter = 'brightness(' + customer.brightness + '%) contrast(' + customer.contrast + '%) saturate(' + customer.saturation + '%)';
  ctx.drawImage(img, 0, 0); ctx.filter = 'none'; return canvasUrl(canvas);
};
const removeLightBackground = async (src: string, threshold: number, onProgress: (fraction: number) => void) => {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d'); if (!ctx) return src;
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image; const w = canvas.width; const h = canvas.height; const total = w * h;
  const seen = new Uint8Array(total); const queue = new Int32Array(total); let head = 0; let tail = 0;
  const isBg = (i: number) => data[i] > 245 - threshold && data[i + 1] > 245 - threshold && data[i + 2] > 245 - threshold && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 34;
  const add = (p: number) => { if (p < 0 || p >= total || seen[p]) return; seen[p] = 1; const i = p * 4; if (isBg(i)) queue[tail++] = p; };
  for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
  for (let y = 1; y < h - 1; y++) { add(y * w); add(y * w + w - 1); }
  onProgress(0.08);
  while (head < tail) {
    const stop = Math.min(tail, head + 30000);
    while (head < stop) {
      const p = queue[head++]; const i = p * 4; data[i + 3] = 0;
      const x = p % w; const y = (p / w) | 0;
      if (x > 0) add(p - 1); if (x < w - 1) add(p + 1); if (y > 0) add(p - w); if (y < h - 1) add(p + w);
    }
    onProgress(0.08 + (tail ? 0.9 * head / Math.max(tail, head) : 0.9));
    await new Promise<void>(resolve => window.setTimeout(resolve, 0));
  }
  ctx.putImageData(image, 0, 0);
  onProgress(1);
  return canvasUrl(canvas);
};

export const InstantMultiCustomerPhotoMaker: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerPhoto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [activeStep, setActiveStep] = useState('upload');
  const [sameCrop, setSameCrop] = useState(true);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [cropStart, setCropStart] = useState<{x:number;y:number}|null>(null);
  const [dragging, setDragging] = useState(false);
  const [bgThreshold, setBgThreshold] = useState(28);
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#ffffff');
  const [bgProgress, setBgProgress] = useState(0);
  const [cropDragMode, setCropDragMode] = useState<'draw'|'move'>('draw');
  const [cropDragOrigin, setCropDragOrigin] = useState<CropBox|null>(null);
  const [busy, setBusy] = useState(false);
  const [paperSize, setPaperSize] = useState('A4');
  const [notice, setNotice] = useState('Upload several customer photos to start a batch.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeCustomer = customers.find(c => c.id === selectedId) || customers[0];
  const totalCopies = useMemo(() => customers.reduce((sum,c) => sum + Math.max(0,c.quantity || 0),0),[customers]);

  const updateCustomer = (id:string, updates:Partial<CustomerPhoto>) => setCustomers(current => current.map(c => c.id===id ? {...c,...updates} : c));
  const addFiles = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!selectedFiles.length) { setNotice('Please choose JPG, PNG or WEBP image files.'); return; }
    const additions:CustomerPhoto[] = selectedFiles.map((file,index) => {
      const url=URL.createObjectURL(file);
      return { id: String(Date.now())+'-'+index+'-'+Math.random().toString(36).slice(2,8), file, previewUrl:url, workingUrl:url,
        name:'Customer '+String(customers.length+index+1).padStart(2,'0'), size:'35x45', quantity:5, customWidth:35, customHeight:45,
        brightness:100, contrast:100, saturation:100, bgRemoved:false };
    });
    setCustomers(current => [...current,...additions]); if (!selectedId && additions[0]) setSelectedId(additions[0].id);
    setActiveStep('upload'); setNotice(selectedFiles.length+' photo'+(selectedFiles.length===1?'':'s')+' added to this batch.');
    if (fileInputRef.current) fileInputRef.current.value='';
  };
  const removeCustomer = (id:string) => {
    const target=customers.find(c=>c.id===id); if (target) { URL.revokeObjectURL(target.previewUrl); if(target.workingUrl!==target.previewUrl && target.workingUrl.startsWith('blob:')) URL.revokeObjectURL(target.workingUrl); }
    const remaining=customers.filter(c=>c.id!==id); setCustomers(remaining); if(selectedId===id) setSelectedId(remaining[0]?.id||''); setNotice('Customer photo removed from this batch.');
  };
  const handleStep = (stepId:string) => {
    setActiveStep(stepId); setCropBox(null);
    const messages:Record<string,string> = {upload:'Add or review customer photos in this batch.',crop:'Drag on the photo to select the crop area, then apply it.',background:'Choose the cleanup strength, background color and process one or all customer photos.',adjust:'Adjust brightness, contrast and saturation for the selected customer.',print:'Review your quantities and create a print-ready sheet.'};
    setNotice(messages[stepId] || '');
  };
  const pointOnImage = (event:React.PointerEvent) => {
    const rect=imageRef.current?.getBoundingClientRect(); if(!rect) return null;
    return {x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};
  };
  const onCropDown = (event:React.PointerEvent) => {
    if(activeStep!=='crop'||!activeCustomer) return;
    const p=pointOnImage(event); if(!p) return; event.preventDefault(); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const inside=!!cropBox && p.x>=cropBox.x && p.x<=cropBox.x+cropBox.w && p.y>=cropBox.y && p.y<=cropBox.y+cropBox.h;
    if(inside){setCropDragMode('move');setCropDragOrigin(cropBox);}
    else {setCropDragMode('draw');setCropDragOrigin(null);setCropBox({x:p.x,y:p.y,w:0,h:0});}
    setCropStart(p); setDragging(true);
  };
  const onCropMove = (event:React.PointerEvent) => {
    if(!dragging||!cropStart) return; const p=pointOnImage(event); if(!p) return;
    if(cropDragMode==='move'&&cropDragOrigin){
      const nx=Math.max(0,Math.min(1-cropDragOrigin.w,cropDragOrigin.x+p.x-cropStart.x));
      const ny=Math.max(0,Math.min(1-cropDragOrigin.h,cropDragOrigin.y+p.y-cropStart.y));
      setCropBox({...cropDragOrigin,x:nx,y:ny});
    } else setCropBox({x:Math.min(p.x,cropStart.x),y:Math.min(p.y,cropStart.y),w:Math.abs(p.x-cropStart.x),h:Math.abs(p.y-cropStart.y)});
  };
  const onCropUp = () => { setDragging(false); setCropStart(null); setCropDragOrigin(null); };
  const cropOne = async (customer:CustomerPhoto, box:CropBox) => {
    const img=await loadImage(customer.workingUrl); const x=Math.round(box.x*img.naturalWidth); const y=Math.round(box.y*img.naturalHeight);
    const w=Math.max(1,Math.round(box.w*img.naturalWidth)); const h=Math.max(1,Math.round(box.h*img.naturalHeight));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h; const ctx=canvas.getContext('2d'); if(!ctx) return customer.workingUrl;
    ctx.drawImage(img,x,y,w,h,0,0,w,h); return canvasUrl(canvas);
  };
  const applyCrop = async () => {
    if(!activeCustomer||!cropBox||cropBox.w<0.04||cropBox.h<0.04){setNotice('Drag over the photo to select a larger crop area first.');return;}
    setBusy(true);
    try {
      const box=cropBox; const targets=sameCrop?customers:customers.filter(c=>c.id===activeCustomer.id);
      const results=await Promise.all(targets.map(async c=>({id:c.id,url:await cropOne(c,box)})));
      setCustomers(current=>current.map(c=>{const result=results.find(r=>r.id===c.id);return result?{...c,workingUrl:result.url}:c;}));
      setCropBox(null); setNotice(sameCrop?'The selected crop was applied to all customers.':'Crop applied to the selected customer.');
    } catch {setNotice('Could not crop this image. Please try again.');} finally {setBusy(false);}
  };
  const processBackground = async (all:boolean) => {
    const targets=all?customers:(activeCustomer?[activeCustomer]:[]); if(!targets.length)return;
    setBusy(true); setBgProgress(0); setNotice('Removing background… 0%');
    try {
      for(let index=0;index<targets.length;index++){
        const customer=targets[index];
        const url=await removeLightBackground(customer.workingUrl,bgThreshold,fraction=>{
          const percent=Math.min(99,Math.round(((index+fraction)/targets.length)*100));
          setBgProgress(percent); setNotice('Removing background… '+percent+'%');
        });
        setCustomers(current=>current.map(c=>c.id===customer.id?{...c,workingUrl:url,bgRemoved:true}:c));
        setBgProgress(Math.round(((index+1)/targets.length)*100));
      }
      setBgProgress(100); setNotice('Background removed successfully. Choose a color below to preview it instantly.');
    } catch {setNotice('Background cleanup failed for one or more photos.');} finally {setBusy(false);}
  };
  const resetBackground = () => { if(activeCustomer) {updateCustomer(activeCustomer.id,{workingUrl:activeCustomer.previewUrl,bgRemoved:false});setNotice('Original background restored for this customer.');} };
  const applyAdjustments = async () => {
    if(!activeCustomer)return; setBusy(true);
    try { const url=await makeAdjusted(activeCustomer); updateCustomer(activeCustomer.id,{workingUrl:url,brightness:100,contrast:100,saturation:100});setNotice('Adjustments applied to the selected customer.'); }
    catch {setNotice('Could not apply adjustments.');} finally {setBusy(false);}
  };
  const sizePixels = (c:CustomerPhoto) => {const mm=mmFor(c);return {w:Math.round(mm.w/25.4*300),h:Math.round(mm.h/25.4*300)};};
  const buildPrintSheet = async () => {
    if(!customers.length)return; setBusy(true); setNotice('Arranging customer photos on print sheets…');
    try {
      const pages:HTMLCanvasElement[]=[]; const pageW=paperSize==='4x6'?1800:paperSize==='5x7'?2100:2480; const pageH=paperSize==='4x6'?1200:paperSize==='5x7'?1500:3508;
      let page=document.createElement('canvas'); page.width=pageW;page.height=pageH;let ctx=page.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,pageW,pageH);
      const margin=paperSize==='A4'?90:60;let x=margin,y=margin,rowH=0; const gap=24;
      const pushPage=()=>{pages.push(page);page=document.createElement('canvas');page.width=pageW;page.height=pageH;ctx=page.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,pageW,pageH);x=margin;y=margin;rowH=0;};
      for(const c of customers){
        const img=await loadImage(c.workingUrl); const dims=sizePixels(c);
        for(let n=0;n<c.quantity;n++){
          let w=dims.w,h=dims.h;if(w>pageW-margin*2||h>pageH-margin*2){const scale=Math.min((pageW-margin*2)/w,(pageH-margin*2)/h);w=Math.floor(w*scale);h=Math.floor(h*scale);}
          if(x+w>pageW-margin){x=margin;y+=rowH+gap;rowH=0;}
          if(y+h>pageH-margin){pushPage();}
          if(c.bgRemoved&&backgroundColor!=='transparent'){const composite=document.createElement('canvas');composite.width=img.naturalWidth;composite.height=img.naturalHeight;const compositeCtx=composite.getContext('2d');if(compositeCtx){compositeCtx.fillStyle=backgroundColor;compositeCtx.fillRect(0,0,composite.width,composite.height);compositeCtx.drawImage(img,0,0);ctx.drawImage(composite,x,y,w,h);}else{ctx.drawImage(img,x,y,w,h);}}else{ctx.drawImage(img,x,y,w,h);}ctx.strokeStyle='#d1d5db';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);x+=w+gap;rowH=Math.max(rowH,h);
        }
      }
      pages.push(page);
      const pageMm=paperSize==='A4'?{w:210,h:297}:paperSize==='4x6'?{w:152.4,h:101.6}:{w:177.8,h:127};
      const pdf=new jsPDF({orientation:pageMm.w>pageMm.h?'landscape':'portrait',unit:'mm',format:[pageMm.w,pageMm.h],compress:true});
      pages.forEach((p,i)=>{if(i>0)pdf.addPage([pageMm.w,pageMm.h],pageMm.w>pageMm.h?'landscape':'portrait');pdf.addImage(p.toDataURL('image/jpeg',0.94),'JPEG',0,0,pageMm.w,pageMm.h,undefined,'FAST');});
      pdf.save('tanshu-multi-customer-print-sheets.pdf');
      setNotice(pages.length+' print sheet(s) created as a correctly sized PDF. Print at Actual Size / 100%.');
    } catch {setNotice('Could not create the print sheet. Check the selected photos and try again.');} finally {setBusy(false);}
  };
  const printSheet = async () => { await buildPrintSheet(); };
  const customersRef=useRef(customers); useEffect(()=>{customersRef.current=customers;},[customers]);
  useEffect(()=>()=>{customersRef.current.forEach(c=>{URL.revokeObjectURL(c.previewUrl);if(c.workingUrl!==c.previewUrl&&c.workingUrl.startsWith('blob:'))URL.revokeObjectURL(c.workingUrl);});},[]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <style>{`
        .imc-premium-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(100,116,139,.48) transparent; }
        .imc-premium-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .imc-premium-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 999px; }
        .imc-premium-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(148,163,184,.78), rgba(100,116,139,.58)); border: 1px solid rgba(255,255,255,.72); border-radius: 999px; }
        .imc-premium-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, rgba(100,116,139,.9), rgba(71,85,105,.82)); }
      `}</style>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <a href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700" aria-label="Back to TANSHU ONLINE home"><ArrowLeft className="h-5 w-5" /></a>
            <div className="flex min-w-0 items-center gap-2.5"><img src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg" alt="TANSHU ONLINE profile" className="h-9 w-9 shrink-0 rounded-full border-2 border-blue-500/70 object-cover object-center shadow-sm" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700">TANSHU ONLINE STUDIO</span><span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Preview Workspace</span></div><h1 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">Instant Multi Customer Photo Maker</h1><p className="hidden text-xs text-slate-500 sm:block">One batch · Multiple customers · Different sizes · Print-ready workflow</p></div></div>
          </div>
          <div className="flex items-center gap-2"><div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Batch summary</p><p className="text-sm font-extrabold text-slate-900">{customers.length} customers <span className="mx-1 text-slate-300">·</span> {totalCopies} prints</p></div><button type="button" onClick={()=>fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-rose-800 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-900 sm:px-4"><Plus className="h-4 w-4"/> Add Photos</button></div>
        </div>
        <div className="mx-auto max-w-[1600px] overflow-x-auto px-4 pb-3 sm:px-6"><div className="flex min-w-max items-center gap-2">{WORKFLOW.map((step,index)=>{const Icon=step.icon;const active=activeStep===step.id;const complete=step.id==='upload'&&customers.length>0;return <React.Fragment key={step.id}><button type="button" onClick={()=>handleStep(step.id)} className={active?'flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-50 px-3 py-2 text-left text-rose-900 shadow-sm':'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'}><span className={active?'flex h-7 w-7 items-center justify-center rounded-lg bg-rose-800 text-white':complete?'flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700':'flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'}>{complete&&!active?<CheckCircle2 className="h-4 w-4"/>:<Icon className="h-4 w-4"/>}</span><span><span className="block text-[11px] font-extrabold">{step.label}</span><span className="block text-[9px] text-slate-500">{step.hint}</span></span></button>{index<WORKFLOW.length-1&&<ChevronRight className="h-4 w-4 shrink-0 text-slate-300"/>}</React.Fragment>;})}</div></div>
      </header>
      <main className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[230px_minmax(0,1fr)_320px] lg:gap-5 lg:px-6 lg:py-5">
        <aside className="space-y-4 lg:sticky lg:top-[145px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 imc-premium-scrollbar">
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center justify-between px-1"><h2 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Studio Tools</h2><Settings2 className="h-4 w-4 text-slate-400"/></div><div className="grid grid-cols-2 gap-2 lg:grid-cols-1">{WORKFLOW.filter(step=>step.id!=='upload').map(step=>{const Icon=step.icon;const active=activeStep===step.id;return <button key={step.id} type="button" onClick={()=>handleStep(step.id)} className={active?'flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-rose-900':'flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 text-left text-slate-600 transition hover:border-slate-200 hover:bg-white'}><span className={active?'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-800 text-white':'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm'}><Icon className="h-4 w-4"/></span><span className="min-w-0"><span className="block text-xs font-bold">{step.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{step.hint}</span></span></button>;})}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-rose-700"/><h2 className="text-xs font-extrabold text-slate-800">Batch Overview</h2></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Customers</p><p className="mt-1 text-2xl font-black tabular-nums">{customers.length}</p></div><div className="rounded-xl bg-rose-50 p-3"><p className="text-[10px] font-semibold text-rose-700">Total prints</p><p className="mt-1 text-2xl font-black tabular-nums text-rose-900">{totalCopies}</p></div></div><p className="mt-3 text-[10px] leading-5 text-slate-500">Each customer keeps an individual photo, size and print quantity.</p></section>
        </aside>
        <section className="min-w-0 space-y-4 lg:sticky lg:top-[145px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-100 py-2"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-700">Main editing canvas</p><h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Customer Photo Workspace</h2></div><div className="flex items-center gap-2"><button type="button" disabled={!customers.length} onClick={()=>{setCropBox(null);setNotice('Original uploaded photos remain preserved. Use Reset background to restore the selected customer.');}} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"><RotateCw className="h-3.5 w-3.5"/> Reset view</button><button type="button" onClick={()=>fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-800 transition hover:bg-rose-100"><ImagePlus className="h-3.5 w-3.5"/> Add more</button></div></div>
          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-[540px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span className="text-xs font-bold text-slate-700">{activeCustomer?activeCustomer.name:'No customer selected'}</span></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{activeCustomer?(PHOTO_SIZES.find(s=>s.value===activeCustomer.size)?.label||'Custom size'):'Waiting for upload'}</span></div>
            <div ref={stageRef} className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-50 p-5">
              {activeCustomer?<div className="relative flex max-h-[440px] max-w-full items-center justify-center rounded-xl border border-slate-200 p-3 shadow-xl" style={{background:backgroundColor==='transparent'?'conic-gradient(#e5e7eb 25%,#fff 0 50%,#e5e7eb 0 75%,#fff 0) 0/16px 16px':backgroundColor}}><div className="relative inline-block max-h-[410px] max-w-full" onPointerDown={onCropDown} onPointerMove={onCropMove} onPointerUp={onCropUp} onPointerCancel={onCropUp}><img ref={imageRef} src={activeCustomer.workingUrl} alt={activeCustomer.name} draggable={false} className={'block max-h-[410px] max-w-full object-contain '+(activeStep==='crop'?'cursor-crosshair touch-none':'')}/>{cropBox&&activeStep==='crop'&&<div className="pointer-events-none absolute border-2 border-rose-500 bg-rose-300/15 shadow-[0_0_0_9999px_rgba(15,23,42,.28)]" style={{left:(cropBox.x*100)+'%',top:(cropBox.y*100)+'%',width:(cropBox.w*100)+'%',height:(cropBox.h*100)+'%'}}><span className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-sm border-2 border-white bg-rose-600 shadow"/><span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-sm border-2 border-white bg-rose-600 shadow"/></div>}</div><span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white shadow-lg">{activeCustomer.name} · {activeStep==='crop'?'Drag to select crop':'Edited preview'}</span></div>:<button type="button" onClick={()=>fileInputRef.current?.click()} className="group flex w-full max-w-lg flex-col items-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm transition hover:border-rose-400 hover:bg-rose-50/60"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 transition group-hover:scale-105"><ImagePlus className="h-8 w-8"/></span><span className="mt-4 text-lg font-black text-slate-900">Upload multiple customer photos</span><span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Select several JPG, PNG or WEBP photos together. Each customer will receive a separate numbered entry.</span><span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-800 px-5 py-3 text-xs font-bold text-white"><Upload className="h-4 w-4"/> Choose Photos</span></button>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3"><p className="text-[10px] text-slate-500">Large preview · Original image kept separate</p><div className="flex flex-wrap items-center gap-2"><button type="button" disabled={!activeCustomer||customers.length<2} onClick={()=>{setSameCrop(true);setNotice('Same crop will be applied to all customer photos.');}} className={sameCrop?'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-800 disabled:opacity-40':'rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 disabled:opacity-40'}>Apply same crop to all</button><button type="button" disabled={!activeCustomer} onClick={()=>{setSameCrop(false);setNotice('Crop only the selected customer.');}} className={!sameCrop?'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-800':'rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600'}>Individual crop</button></div></div>
          </div>
          {activeStep==='crop'&&<section className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xs font-extrabold text-slate-800">Crop selection</h3><p className="mt-1 text-[10px] text-slate-500">Drag to draw a crop area. Then grab inside the outlined area to reposition it.</p></div><button type="button" disabled={!cropBox||busy} onClick={applyCrop} className="rounded-xl bg-rose-800 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{busy?'Applying…':'Apply Crop'}</button></div><p className="mt-2 text-[10px] text-slate-500">{sameCrop?'Same crop mode: the same selection is applied to every customer photo.':'Individual mode: only the selected customer is cropped.'}</p></section>}
          {activeStep==='background'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xs font-extrabold text-slate-800">Light background cleanup</h3><p className="mt-1 text-[10px] text-slate-500">Removes connected near-white pixels touching the image edges. Complex backgrounds and fine hair may need manual review.</p></div><WandSparkles className="h-5 w-5 text-rose-700"/></div><label className="mt-4 block text-[10px] font-bold text-slate-600">Removal strength · {bgThreshold}<input type="range" min="5" max="75" value={bgThreshold} onChange={e=>setBgThreshold(Number(e.target.value))} className="mt-2 w-full accent-rose-700"/></label><div className="mt-4"><span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-slate-600">Background color · Live preview</span><div className="grid grid-cols-6 gap-1.5">{[{value:'transparent',label:'Transparent',swatch:'conic-gradient(#e5e7eb 25%,#fff 0 50%,#e5e7eb 0 75%,#fff 0) 0/12px 12px'},{value:'#ffffff',label:'White',swatch:'#ffffff'},{value:'#eaf3ff',label:'Light blue',swatch:'#eaf3ff'},{value:'#e8f5e9',label:'Light green',swatch:'#e8f5e9'},{value:'#f3e8ff',label:'Lavender',swatch:'#f3e8ff'},{value:'#f5f5f5',label:'Light grey',swatch:'#f5f5f5'}].map(option=><button key={option.value} type="button" onClick={()=>setBackgroundColor(option.value)} className={backgroundColor===option.value?'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-rose-600 bg-rose-50 px-0.5 py-1.5 text-center':'flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-0.5 py-1.5 text-center transition hover:border-slate-400'}><span className="h-5 w-5 shrink-0 rounded-md border border-slate-300" style={{background:option.swatch}}/><span className="w-full truncate text-[8px] font-bold leading-tight text-slate-700">{option.label}</span>{backgroundColor===option.value&&<CheckCircle2 className="absolute right-0.5 top-0.5 h-3 w-3 text-rose-700"/>}</button>)}</div><label className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="color" value={customBackgroundColor} onChange={e=>{setCustomBackgroundColor(e.target.value);setBackgroundColor(e.target.value);}} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent p-0"/><span><span className="block text-[10px] font-bold text-slate-700">Custom color</span><span className="block text-[10px] text-slate-500">{customBackgroundColor} · Select any color for live preview</span></span></label><p className="mt-2 text-[10px] text-slate-500">Select a swatch or custom color. The preview changes immediately; the chosen background is used when making print sheets.</p></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={!activeCustomer||busy} onClick={()=>processBackground(false)} className="rounded-xl bg-rose-800 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">Remove selected background</button><button type="button" disabled={!customers.length||busy} onClick={()=>processBackground(true)} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 disabled:opacity-40">Remove for all customers</button><button type="button" disabled={!activeCustomer||busy} onClick={resetBackground} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Restore original</button></div>{(busy||bgProgress>0)&&<div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-700">{busy?'Background removal in progress':'Background removal progress'}</span><span className="text-xs font-black tabular-nums text-rose-800">{bgProgress}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-rose-700 transition-[width] duration-150" style={{width:bgProgress+'%'}}/></div></div>}</section>}
          {activeStep==='adjust'&&activeCustomer&&<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="text-xs font-extrabold text-slate-800">Photo adjustments · {activeCustomer.name}</h3><div className="mt-4 grid gap-4 sm:grid-cols-3">{([{key:'brightness',label:'Brightness'},{key:'contrast',label:'Contrast'},{key:'saturation',label:'Saturation'}] as const).map(item=><label key={item.key} className="block"><span className="flex justify-between text-[10px] font-bold text-slate-600"><span>{item.label}</span><span>{activeCustomer[item.key]}%</span></span><input type="range" min="50" max="150" value={activeCustomer[item.key]} onChange={e=>updateCustomer(activeCustomer.id,{[item.key]:Number(e.target.value)})} className="mt-2 w-full accent-rose-700"/></label>)}</div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={applyAdjustments} className="rounded-xl bg-rose-800 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{busy?'Applying…':'Apply adjustments'}</button><button type="button" onClick={()=>updateCustomer(activeCustomer.id,{brightness:100,contrast:100,saturation:100})} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Reset sliders</button></div></section>}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-2"><div><h3 className="text-xs font-extrabold text-slate-800">Customer photo strip</h3><p className="mt-0.5 text-[10px] text-slate-500">Select a thumbnail to edit its individual settings.</p></div><span className="text-[10px] font-bold text-slate-500">{customers.length} added</span></div>{customers.length?<div className="flex gap-3 overflow-x-auto pb-1">{customers.map((customer,index)=><div key={customer.id} className={selectedId===customer.id?'relative w-[104px] shrink-0 rounded-xl border border-rose-400 bg-rose-50 p-2 text-left shadow-sm':'relative w-[104px] shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-left transition hover:border-slate-300'}><button type="button" onClick={()=>setSelectedId(customer.id)} className="block w-full text-left"><div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-100"><img src={customer.workingUrl} alt="" className="h-full w-full object-contain"/></div><span className="mt-2 block truncate text-[10px] font-extrabold text-slate-800">{customer.name||('Customer '+(index+1))}</span><span className="block text-[9px] text-slate-500">{customer.quantity} copies</span></button><button type="button" onClick={()=>removeCustomer(customer.id)} aria-label={'Remove '+customer.name} className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"><X className="h-3 w-3"/></button></div>)}<button type="button" onClick={()=>fileInputRef.current?.click()} className="flex min-h-[126px] w-[104px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"><Plus className="h-6 w-6"/><span className="text-[10px] font-bold">Add photos</span></button></div>:<div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">Customer thumbnails will appear here after upload.</div>}</div>
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] leading-5 text-blue-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/><span>{busy?'Processing… ':''}{notice}</span></div>
        </section>
        <aside className="space-y-4 lg:sticky lg:top-[145px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Per-customer controls</p><h2 className="mt-1 text-sm font-black text-slate-900">Customer Settings</h2></div><UserRound className="h-5 w-5 text-slate-400"/></div>{activeCustomer?<div className="space-y-4"><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Customer name / label</span><input value={activeCustomer.name} onChange={e=>updateCustomer(activeCustomer.id,{name:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" placeholder="Customer name (optional)"/></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Photo size</span><select value={activeCustomer.size} onChange={e=>updateCustomer(activeCustomer.id,{size:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-rose-400">{PHOTO_SIZES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>{activeCustomer.size==='custom'&&<div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">Width (mm)</span><input type="number" min="5" max="150" value={activeCustomer.customWidth} onChange={e=>updateCustomer(activeCustomer.id,{customWidth:Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold outline-none focus:border-rose-400"/></label><label><span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">Height (mm)</span><input type="number" min="5" max="200" value={activeCustomer.customHeight} onChange={e=>updateCustomer(activeCustomer.id,{customHeight:Number(e.target.value)})} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold outline-none focus:border-rose-400"/></label></div>}<div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wide text-rose-800">Print quantity</span><span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-rose-800">{activeCustomer.quantity} copies</span></div><div className="flex items-center gap-2"><button type="button" onClick={()=>updateCustomer(activeCustomer.id,{quantity:Math.max(1,activeCustomer.quantity-1)})} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-800 hover:bg-rose-100">−</button><input type="number" min="1" max="500" value={activeCustomer.quantity} onChange={e=>updateCustomer(activeCustomer.id,{quantity:Math.max(1,Math.min(500,Number(e.target.value)||1))})} className="h-9 min-w-0 flex-1 rounded-lg border border-rose-200 bg-white px-2 text-center text-sm font-black tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-rose-100"/><button type="button" onClick={()=>updateCustomer(activeCustomer.id,{quantity:Math.min(500,activeCustomer.quantity+1)})} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-800 hover:bg-rose-100">+</button></div></div><button type="button" onClick={()=>removeCustomer(activeCustomer.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[11px] font-bold text-red-700 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5"/> Remove this customer</button></div>:<div className="rounded-xl bg-slate-50 p-5 text-center"><Users className="mx-auto h-7 w-7 text-slate-300"/><p className="mt-2 text-xs font-semibold text-slate-600">Upload photos to configure each customer.</p></div>}</section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-rose-700"/><h2 className="text-xs font-extrabold text-slate-800">Print Sheet Setup</h2></div><label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Paper size</span><select value={paperSize} onChange={e=>setPaperSize(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-rose-400"><option value="A4">A4</option><option value="4x6">4 × 6 inch</option><option value="5x7">5 × 7 inch</option></select></label><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase text-slate-500">Customers</p><p className="mt-1 text-lg font-black tabular-nums">{customers.length}</p></div><div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase text-slate-500">Total copies</p><p className="mt-1 text-lg font-black tabular-nums">{totalCopies}</p></div></div><div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">Smart Arrange respects each customer's selected size and quantity. Extra copies continue onto additional sheets.</div><button type="button" disabled={!customers.length||busy} onClick={printSheet} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"><Printer className="h-4 w-4"/> {busy?'Preparing sheets…':'Smart Arrange & Download'} <ArrowRight className="h-4 w-4"/></button></section>
        </aside>
      </main>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>e.target.files&&addFiles(e.target.files)}/>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-[10px] text-slate-500">TANSHU ONLINE · Instant Multi Customer Photo Maker · Separate batch workspace</footer>
    </div>
  );
};