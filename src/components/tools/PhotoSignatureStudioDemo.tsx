import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { removeBackgroundAI } from './backgroundRemovalAI';
import { ArrowLeft, ArrowRight, Camera, Laptop, PenLine, Printer, RotateCcw, Smartphone, Eraser, Download, FileImage, FileText, Move } from 'lucide-react';

type DeviceMode = 'mobile' | 'desktop';
type Step = 'photo' | 'signature' | 'print';
type Unit = 'mm' | 'cm' | 'in';
type Paper = 'A4' | '4x6';
type Bg = 'transparent' | 'white' | 'blue' | 'custom';
const presets = [
  { label: 'Passport / Exam', w: 35, h: 45 },
  { label: 'Stamp Photo', w: 25, h: 30 },
  { label: 'PAN Photo', w: 25, h: 35 },
];
const mm = (v: number, u: Unit) => v * (u === 'cm' ? 10 : u === 'in' ? 25.4 : 1);
const panel = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
const label = 'mb-1.5 block text-xs font-bold text-slate-600';
const control = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500';

const readDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('फाइल पढ़ी नहीं जा सकी।'));
  reader.onerror = () => reject(new Error('फाइल पढ़ी नहीं जा सकी।'));
  reader.readAsDataURL(blob);
});
const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('इमेज लोड नहीं हुई।')); img.src = src;
});

export const PhotoSignatureStudioDemo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [device, setDevice] = useState<DeviceMode | null>(null);
  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoCutout, setPhotoCutout] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoProgress, setPhotoProgress] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoBg, setPhotoBg] = useState('#ffffff');
  const [presetIndex, setPresetIndex] = useState(0);
  const [unit, setUnit] = useState<Unit>('mm');
  const [customW, setCustomW] = useState('35');
  const [customH, setCustomH] = useState('45');
  const [customSize, setCustomSize] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(42);
  const [signature, setSignature] = useState('');
  const [signatureCutout, setSignatureCutout] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signatureBusy, setSignatureBusy] = useState(false);
  const [signatureProgress, setSignatureProgress] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [signatureBg, setSignatureBg] = useState<Bg>('transparent');
  const [signatureCustomBg, setSignatureCustomBg] = useState('#ffffff');
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 78, w: 34 });
  const [paper, setPaper] = useState<Paper>('A4');
  const [copies, setCopies] = useState(4);
  const [output, setOutput] = useState<'jpg' | 'png' | 'pdf'>('jpg');
  const [sheetUrl, setSheetUrl] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoColorInput = useRef<HTMLInputElement>(null);
  const signatureInput = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const cropDragRef = useRef<{x:number;y:number;cx:number;cy:number}|null>(null);
  const photoSize = customSize ? { w: mm(Math.max(5, Number(customW)||35), unit), h: mm(Math.max(5, Number(customH)||45), unit) } : presets[presetIndex];
  const photoSource = photoCutout || photo;
  const signatureSource = signatureCutout || signature;
  const signatureBgColor = signatureBg === 'white' ? '#ffffff' : signatureBg === 'blue' ? '#dbeafe' : signatureBg === 'custom' ? signatureCustomBg : 'transparent';

  useEffect(() => () => { if (sheetUrl) URL.revokeObjectURL(sheetUrl); }, [sheetUrl]);

  const chooseFile = async (file: File | undefined, kind: 'photo'|'signature') => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    if (kind === 'photo') {
      setPhoto(url); setPhotoName(file.name); setPhotoCutout(''); setPhotoError(''); setStep('photo');
    } else {
      setSignature(url); setSignatureName(file.name); setSignatureCutout(''); setSignatureError(''); setStep('signature');
    }
  };
  const removeBg = async (kind: 'photo'|'signature') => {
    const source = kind === 'photo' ? photo : signature;
    if (!source) return;
    const busy = kind === 'photo' ? setPhotoBusy : setSignatureBusy;
    const progress = kind === 'photo' ? setPhotoProgress : setSignatureProgress;
    const error = kind === 'photo' ? setPhotoError : setSignatureError;
    busy(true); progress('AI मॉडल तैयार हो रहा है…'); error('');
    try {
      const blob = await removeBackgroundAI(source, progress);
      const url = await readDataUrl(blob);
      if (kind === 'photo') setPhotoCutout(url); else setSignatureCutout(url);
    } catch (e) {
      error(e instanceof Error ? e.message : 'बैकग्राउंड रिमूव नहीं हो पाया।');
    } finally { busy(false); progress(''); }
  };

  const drawPhoto = async (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    if (!photo) throw new Error('पहले फोटो अपलोड करें।');
    const source = await loadImage(photoSource);
    const original = await loadImage(photo);
    ctx.save();
    if (photoCutout) { ctx.fillStyle = photoBg; ctx.fillRect(x,y,w,h); }
    const img = photoCutout ? source : original;
    const frameRatio = w / h, imageRatio = img.naturalWidth / img.naturalHeight;
    let sw = img.naturalWidth, sh = img.naturalHeight;
    if (imageRatio > frameRatio) sw = sh * frameRatio; else sh = sw / frameRatio;
    sw /= zoom / 100; sh /= zoom / 100;
    const sx = Math.max(0, Math.min(img.naturalWidth - sw, (img.naturalWidth - sw) * cropX / 100));
    const sy = Math.max(0, Math.min(img.naturalHeight - sh, (img.naturalHeight - sh) * cropY / 100));
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    if (signatureSource) {
      const sig = await loadImage(signatureSource);
      const sigW = w * sigPosition.w / 100, sigH = sigW / Math.max(.2, sig.naturalWidth / sig.naturalHeight);
      const sigX = x + (w - sigW) * sigPosition.x / 100;
      const sigY = y + (h - sigH) * sigPosition.y / 100;
      if (signatureBg !== 'transparent') { ctx.fillStyle = signatureBgColor; ctx.fillRect(sigX, sigY, sigW, sigH); }
      ctx.drawImage(sig, sigX, sigY, sigW, sigH);
    }
    ctx.restore();
  };

  const makeSheet = async () => {
    setExportBusy(true);
    try {
      const isA4 = paper === 'A4';
      const pageW = isA4 ? 2480 : 1200, pageH = isA4 ? 3508 : 1800;
      const canvas = document.createElement('canvas'); canvas.width = pageW; canvas.height = pageH;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('शीट तैयार नहीं हो सकी।');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,pageW,pageH);
      const cols = Math.ceil(Math.sqrt(copies * pageW / pageH));
      const rows = Math.ceil(copies / cols);
      const margin = isA4 ? 100 : 45, gap = isA4 ? 34 : 24;
      const cellW = (pageW - margin*2 - gap*(cols-1)) / cols;
      const cellH = (pageH - margin*2 - gap*(rows-1)) / rows;
      const ratio = photoSize.w / photoSize.h;
      let w = Math.min(cellW, cellH * ratio), h = w / ratio;
      if (h > cellH) { h = cellH; w = h * ratio; }
      for (let i=0;i<copies;i++) {
        const col=i%cols, row=Math.floor(i/cols);
        const x=margin+col*(cellW+gap)+(cellW-w)/2, y=margin+row*(cellH+gap)+(cellH-h)/2;
        await drawPhoto(ctx,x,y,w,h);
      }
      const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('शीट एक्सपोर्ट नहीं हुई।')), 'image/png'));
      if (sheetUrl) URL.revokeObjectURL(sheetUrl);
      const url=URL.createObjectURL(blob); setSheetUrl(url); return {canvas,blob,url};
    } finally { setExportBusy(false); }
  };
  const downloadSheet = async () => {
    try {
      const result = await makeSheet();
      if (output === 'pdf') {
        const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:paper==='A4'?'a4':[101.6,152.4] });
        pdf.addImage(result.canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,paper==='A4'?210:101.6,paper==='A4'?297:152.4);
        pdf.save(`photo-sheet-${paper.toLowerCase()}.pdf`);
      } else {
        const blob = await new Promise<Blob>((resolve,reject) => result.canvas.toBlob(b => b ? resolve(b) : reject(new Error('डाउनलोड तैयार नहीं हुआ।')), output==='png'?'image/png':'image/jpeg',0.96));
        const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`photo-sheet-${paper.toLowerCase()}.${output}`; a.click(); URL.revokeObjectURL(url);
      }
    } catch(e) { setPhotoError(e instanceof Error?e.message:'Export failed'); }
  };
  const printSheet = async () => {
    try { await makeSheet(); window.setTimeout(() => window.print(), 100); }
    catch(e) { setPhotoError(e instanceof Error?e.message:'Print sheet failed'); }
  };

  const UploadBox = ({kind}:{kind:'photo'|'signature'}) => {
    const isPhoto=kind==='photo', src=isPhoto?photo:signature, name=isPhoto?photoName:signatureName, input=isPhoto?photoInput:signatureInput;
    return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={e=>chooseFile(e.target.files?.[0],kind)} />
      {src ? <div className="flex items-center gap-3"><img src={src} alt="" className="h-16 w-16 rounded-lg border bg-white object-contain p-1"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{name}</p><button type="button" onClick={()=>input.current?.click()} className="mt-1 text-xs font-bold text-blue-700">दूसरी फाइल चुनें</button></div></div> :
      <button type="button" onClick={()=>input.current?.click()} className="flex min-h-20 w-full flex-col items-center justify-center gap-2 text-sm font-bold text-slate-700"><span className="rounded-full bg-blue-100 p-2 text-blue-700">{isPhoto?<Camera size={18}/>:<PenLine size={18}/>}</span>{isPhoto?'फोटो चुनें / कैमरा से लें':'सिग्नेचर फोटो चुनें'}<span className="text-[11px] font-medium text-slate-500">JPG · PNG · WEBP</span></button>}
    </div>;
  };

  const PhotoControls = () => <div className={panel}>
    <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-black"><Camera size={17} className="text-blue-600"/> फोटो सेटअप</h3><button onClick={()=>{setZoom(100);setCropX(50);setCropY(42);setPhotoBg('#ffffff')}} className="text-xs font-bold text-slate-500"><RotateCcw size={13} className="inline"/> Reset</button></div>
    <UploadBox kind="photo"/>
    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2"><div><label className={label}>फोटो साइज</label><select className={control} value={customSize?'custom':String(presetIndex)} onChange={e=>{if(e.target.value==='custom')setCustomSize(true);else{setPresetIndex(Number(e.target.value));setCustomSize(false)}}}>{presets.map((p,i)=><option key={p.label} value={i}>{p.label} · {p.w}×{p.h} mm</option>)}<option value="custom">Custom size</option></select></div><div><label className={label}>Unit</label><select className={control} value={unit} onChange={e=>setUnit(e.target.value as Unit)}><option value="mm">MM</option><option value="cm">CM</option><option value="in">Inch</option></select></div></div>
    {customSize ? <div className="mt-2 grid grid-cols-2 gap-2"><div><label className={label}>Width ({unit})</label><input className={control} type="number" min="5" value={customW} onChange={e=>setCustomW(e.target.value)}/></div><div><label className={label}>Height ({unit})</label><input className={control} type="number" min="5" value={customH} onChange={e=>setCustomH(e.target.value)}/></div></div> : <p className="mt-1 text-[11px] text-slate-500">फ्रेम: {photoSize.w} × {photoSize.h} mm</p>}
    <div className="mt-3 rounded-xl bg-slate-50 p-3"><div className="mb-2 flex items-center justify-between"><b className="text-xs">Manual Crop</b><span className="text-[10px] text-slate-500">Zoom {zoom}%</span></div><label className={label}>Zoom</label><input type="range" min="80" max="220" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="w-full accent-blue-600"/><label className={label}>Horizontal crop</label><input type="range" min="0" max="100" value={cropX} onChange={e=>setCropX(Number(e.target.value))} className="w-full accent-blue-600"/><label className={label}>Vertical crop</label><input type="range" min="0" max="100" value={cropY} onChange={e=>setCropY(Number(e.target.value))} className="w-full accent-blue-600"/></div>
    <div className="mt-3"><label className={label}>Background removal & colour</label><button disabled={!photo||photoBusy} onClick={()=>removeBg('photo')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-black text-white disabled:opacity-50"><Eraser size={16}/>{photoBusy?'AI से बैकग्राउंड हट रहा है…':'AI से बैकग्राउंड हटाएँ'}</button>{photoProgress&&<p className="mt-1 text-xs text-blue-700">{photoProgress}</p>}{photoError&&<p className="mt-1 text-xs text-red-600">{photoError}</p>}
      <div className="mt-2 flex flex-wrap gap-2">{[['#ffffff','White'],['#dbeafe','Blue'],['#bfdbfe','Light Blue'],['#e5e7eb','Grey'],['#d1fae5','Light Green']].map(([c,n])=><button key={c} onClick={()=>setPhotoBg(c)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${photoBg===c?'border-blue-600 ring-2 ring-blue-100':'border-slate-200'}`}><span className="mr-1 inline-block h-3 w-3 rounded-full border align-middle" style={{background:c}}/>{n}</button>)}</div><div className="mt-2 flex items-center gap-2"><label className="text-xs font-bold">Custom</label><input ref={photoColorInput} type="color" defaultValue="#dbeafe" aria-label="कस्टम फोटो बैकग्राउंड रंग चुनें"/><button onClick={()=>{const color=photoColorInput.current?.value;if(color)setPhotoBg(color)}} className="text-xs font-bold text-blue-700">रंग लागू करें</button><button onClick={()=>{setPhotoCutout('');setPhotoBg('#ffffff')}} className="ml-auto text-xs text-slate-500">Original</button></div>
    </div>
  </div>;

  const SignatureControls = () => <div className={panel}>
    <h3 className="mb-3 flex items-center gap-2 font-black"><PenLine size={17} className="text-violet-600"/> सिग्नेचर सेटअप</h3><UploadBox kind="signature"/>
    <button disabled={!signature||signatureBusy} onClick={()=>removeBg('signature')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2.5 text-sm font-black text-white disabled:opacity-50"><Eraser size={16}/>{signatureBusy?'AI प्रोसेसिंग…':'सिग्नेचर का बैकग्राउंड हटाएँ'}</button>
    {signatureProgress&&<p className="mt-1 text-xs text-violet-700">{signatureProgress}</p>}{signatureError&&<p className="mt-1 text-xs text-red-600">{signatureError}</p>}
    <div className="mt-3"><label className={label}>सिग्नेचर बैकग्राउंड</label><div className="grid grid-cols-4 gap-1.5">{(['transparent','white','blue','custom'] as Bg[]).map(v=><button key={v} onClick={()=>setSignatureBg(v)} className={`rounded-lg border px-1 py-2 text-[11px] font-bold ${signatureBg===v?'border-violet-600 bg-violet-50':'border-slate-200'}`}>{v==='transparent'?'Clear':v==='white'?'White':v==='blue'?'Blue':'Custom'}</button>)}</div><input className="mt-2 h-9 w-full" type="color" value={signatureCustomBg} onChange={e=>{setSignatureCustomBg(e.target.value);setSignatureBg('custom')}}/></div>
    <p className="mt-3 text-xs text-slate-500">सिग्नेचर को फोटो पर माउस या उंगली से खींचकर रखें।</p>
  </div>;

  const Preview = () => <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-black">Photo Preview</h3><p className="text-[11px] text-slate-500">फोटो पर Signature को drag करें</p></div><Move size={17} className="text-slate-500"/></div>
    <div className="relative mx-auto aspect-[35/45] w-full max-w-[260px] touch-none overflow-hidden border border-slate-400 shadow-lg" style={{background:photoCutout?photoBg:'#e2e8f0'}} onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();if(cropDragRef.current){setCropX(Math.max(0,Math.min(100,cropDragRef.current.cx+(e.clientX-cropDragRef.current.x)/r.width*100)));setCropY(Math.max(0,Math.min(100,cropDragRef.current.cy+(e.clientY-cropDragRef.current.y)/r.height*100)));return;}if(!dragRef.current)return;setSigPosition(p=>({...p,x:Math.max(0,Math.min(100,dragRef.current!.px+(e.clientX-dragRef.current!.x)/r.width*100)),y:Math.max(0,Math.min(100,dragRef.current!.py+(e.clientY-dragRef.current!.y)/r.height*100))}))}} onPointerUp={()=>{dragRef.current=null;cropDragRef.current=null}} onPointerCancel={()=>{dragRef.current=null;cropDragRef.current=null}}>
      {photoSource&&<img src={photoSource} alt="Photo crop preview" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);cropDragRef.current={x:e.clientX,y:e.clientY,cx:cropX,cy:cropY}}} className="h-full w-full cursor-move object-cover" style={{objectPosition:`${cropX}% ${cropY}%`,transform:`scale(${zoom/100})`}}/>}
      {signatureSource&&<div onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={x:e.clientX,y:e.clientY,px:sigPosition.x,py:sigPosition.y}}} className="absolute z-10 flex cursor-move items-center justify-center border border-dashed border-violet-500/70" style={{left:`${sigPosition.x}%`,top:`${sigPosition.y}%`,width:`${sigPosition.w}%`,transform:'translate(-50%,-50%)',background:!signatureCutout&&signatureBg!=='transparent'?signatureBgColor:'transparent'}}><img src={signatureSource} alt="Signature" className="pointer-events-none max-h-12 w-full object-contain"/></div>}
    </div><p className="mt-2 text-center text-[10px] text-slate-500">नोट: AI cutout को डाउनलोड/प्रिंट से पहले ध्यान से जाँचें। बालों और कपड़ों के किनारों पर परिणाम फोटो के अनुसार बदल सकता है।</p>
  </div>;

  const PrintControls = () => <div className={panel}><h3 className="mb-3 font-black">डाउनलोड और प्रिंट</h3><div className="grid grid-cols-2 gap-2"><div><label className={label}>Paper</label><select className={control} value={paper} onChange={e=>{setPaper(e.target.value as Paper);setCopies(e.target.value==='A4'?4:2)}}><option value="A4">A4 · 210×297 mm</option><option value="4x6">4×6 inch</option></select></div><div><label className={label}>Output</label><select className={control} value={output} onChange={e=>setOutput(e.target.value as 'jpg'|'png'|'pdf')}><option value="jpg">JPG</option><option value="png">PNG</option><option value="pdf">PDF</option></select></div></div>
    <label className={`${label} mt-3`}>एक शीट पर फोटो की संख्या</label><div className="grid grid-cols-5 gap-1.5">{(paper==='A4'?[4,6,8,12,25]:[2,4,6,8,10]).map(n=><button key={n} onClick={()=>setCopies(n)} className={`rounded-lg border py-2 text-sm font-black ${copies===n?'border-blue-700 bg-blue-50 text-blue-800':'border-slate-200'}`}>{n}</button>)}</div>
    <p className="mt-2 text-[11px] text-slate-500">चुनी हुई संख्या के अनुसार शीट पर फोटो अपने-आप बराबर जगह में फिट होंगी; फोटो का अनुपात सुरक्षित रहेगा।</p>
    <button disabled={!photo||exportBusy} onClick={downloadSheet} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-black text-white disabled:opacity-50"><Download size={17}/>{exportBusy?'शीट बन रही है…':`${output.toUpperCase()} डाउनलोड करें`}</button><button disabled={!photo||exportBusy} onClick={printSheet} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-black text-white disabled:opacity-50"><Printer size={17}/> Direct Print</button>
  </div>;

  const stepItems: {id:Step;label:string}[]=[{id:'photo',label:'Photo'},{id:'signature',label:'Signature'},{id:'print',label:'Print'}];
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <style>{`@media print { body * { visibility:hidden !important; } #photo-signature-print-output,#photo-signature-print-output * { visibility:visible !important; } #photo-signature-print-output { position:absolute;left:0;top:0;width:100vw;height:100vh;display:flex!important;align-items:center;justify-content:center;background:white!important; } #photo-signature-print-output img { max-width:100%;max-height:100%;object-fit:contain; } }`}</style>
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm"><div className="mx-auto flex max-w-[1500px] items-center gap-3"><button onClick={device?()=>setDevice(null):onBack} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-slate-600"><ArrowLeft size={16}/>{device?'Device चुनें':'Home'}</button><div><p className="text-sm font-black">TANSHU <span className="text-blue-700">ONLINE</span></p><p className="text-[10px] font-semibold text-slate-500">PHOTO & SIGNATURE STUDIO</p></div></div></header>
    {!device?<section className="px-4 py-12"><div className="mx-auto mb-9 max-w-3xl text-center"><h1 className="text-3xl font-black sm:text-5xl">Photo & Signature Studio</h1><p className="mt-4 text-sm text-slate-600">फोटो क्रॉप करें, बैकग्राउंड बदलें, सिग्नेचर सेट करें और प्रिंट शीट तैयार करें।</p></div><div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2"><button onClick={()=>{setDevice('mobile');setStep('photo')}} className="rounded-3xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm"><Smartphone size={34} className="mb-4 text-blue-700"/><b className="text-2xl">मोबाइल</b><p className="mt-2 text-sm text-slate-600">टच के लिए सरल स्टेप-बाय-स्टेप वर्कफ़्लो।</p><span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">शुरू करें <ArrowRight size={16}/></span></button><button onClick={()=>{setDevice('desktop');setStep('photo')}} className="rounded-3xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm"><Laptop size={34} className="mb-4 text-violet-700"/><b className="text-2xl">Laptop / PC</b><p className="mt-2 text-sm text-slate-600">बाईं ओर फोटो, बीच में प्रीव्यू, दाईं ओर सिग्नेचर टूल्स।</p><span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white">शुरू करें <ArrowRight size={16}/></span></button></div></section>:
    <section className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5">
      {device==='mobile'&&<div className="mb-4 grid grid-cols-3 gap-2">{stepItems.map((s,i)=><button key={s.id} onClick={()=>setStep(s.id)} className={`rounded-xl px-2 py-3 text-xs font-black ${step===s.id?'bg-blue-700 text-white':'border bg-white text-slate-600'}`}><span className="block text-[10px] opacity-70">STEP 0{i+1}</span>{s.label}</button>)}</div>}
      {device==='desktop'?<div className="grid items-start gap-4 xl:grid-cols-[minmax(260px,1fr)_minmax(300px,1.1fr)_minmax(260px,1fr)]"><PhotoControls/><div className="space-y-4"><Preview/><PrintControls/></div><SignatureControls/></div>:
        <div className="mx-auto max-w-xl space-y-4">{step==='photo'?<><PhotoControls/><Preview/><button onClick={()=>setStep('signature')} className="w-full rounded-xl bg-blue-700 py-3 font-black text-white">Next: Signature <ArrowRight className="inline" size={16}/></button></>:step==='signature'?<><SignatureControls/><Preview/><button onClick={()=>setStep('print')} className="w-full rounded-xl bg-blue-700 py-3 font-black text-white">Next: Print <ArrowRight className="inline" size={16}/></button></>:<><Preview/><PrintControls/></>}</div>}
    </section>}
    <div id="photo-signature-print-output" className="hidden">{sheetUrl&&<img src={sheetUrl} alt="Print sheet"/>}</div>
  </main>;
};
