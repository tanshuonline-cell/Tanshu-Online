import React, { useMemo, useRef, useState } from 'react';
import { Download, Eraser, ImagePlus, Palette, ScanFace, PenTool, Printer, SlidersHorizontal, WandSparkles, Check, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { removeBackgroundAI } from './backgroundRemovalAI';
import { retouchFaceSkinLocally } from './skinRetouch';

type PhotoItem = { id: string; file: File; url: string; width: number; height: number };
type Props = {
  selected: PhotoItem | null;
  photos: PhotoItem[];
  widthPx: number;
  heightPx: number;
  onApplyImage: (blob: Blob, suffix: string, sourceId?: string) => void;
  onAddSignature: (file: File) => void;
  activeSection?: 'move'|'layout'|'adjust'|'background'|'portrait'|'signature'|'print';
  hideTabs?: boolean;
};

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Image could not be loaded.'));
  image.src = src;
});
const canvasBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 0.96) => new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed.')), type, quality));

export const StudioAdvancedPanel: React.FC<Props> = ({ selected, photos, widthPx, heightPx, onApplyImage, onAddSignature, activeSection, hideTabs = false }) => {
  const [section, setSection] = useState<'move'|'layout'|'adjust'|'background'|'portrait'|'signature'|'print'>(activeSection || 'adjust');
  React.useEffect(() => { if (activeSection) setSection(activeSection); }, [activeSection]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [retouch, setRetouch] = useState(22);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundMode, setBackgroundMode] = useState<'transparent'|'color'>('transparent');
  const [backgroundSelection, setBackgroundSelection] = useState<string[]>(selected ? [selected.id] : []);
  const [progress, setProgress] = useState(0);
  const [cutoutUrl, setCutoutUrl] = useState('');
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signatureScale, setSignatureScale] = useState(28);
  const [signatureX, setSignatureX] = useState(58);
  const [signatureY, setSignatureY] = useState(80);
  const [signatureCropZoom, setSignatureCropZoom] = useState(100);
  const [signatureCropX, setSignatureCropX] = useState(50);
  const [signatureCropY, setSignatureCropY] = useState(50);
  const [signatureCleanThreshold, setSignatureCleanThreshold] = useState(230);
  const [paper, setPaper] = useState<'single'|'4x6'|'a4'>('4x6');
  const [copies, setCopies] = useState(8);
  const [gap, setGap] = useState(2);
  const [margin, setMargin] = useState(5);
  const signatureInput = useRef<HTMLInputElement>(null);
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);
  const brushOriginalRef = useRef<HTMLImageElement|null>(null);
  const brushLastPointRef = useRef<{x:number;y:number}|null>(null);
  const [brushMode, setBrushMode] = useState<'erase'|'restore'>('erase');
  const [brushSize, setBrushSize] = useState(28);

  const tabClass = (key: typeof section) => `flex items-center gap-2 rounded-md border px-2 py-2 text-[10px] transition ${section===key?'border-[#59636D] bg-[#30373E] text-[#F0F2F4]':'border-[#343A42] bg-[#202429] text-[#AAB2BA] hover:bg-[#292F35]'}`;
  const run = async (task: () => Promise<void>) => {
    if (!selected || busy) return;
    setBusy(true); setProgress(0); setStatus('Processing…');
    try { await task(); }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Processing failed.'); }
    finally { setBusy(false); }
  };

  const applyAdjustments = () => run(async () => {
    const image = await loadImage(selected!.url);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(image, 0, 0);
    onApplyImage(await canvasBlob(canvas, 'image/jpeg'), 'adjusted');
    setStatus('Adjustments applied to the selected layer.');
  });

  const removeBg = async () => {
    if (busy) return;
    const targets = photos.filter(photo => backgroundSelection.includes(photo.id));
    if (!targets.length) { setStatus('Select at least one image layer.'); return; }
    setBusy(true); setProgress(0); setStatus('Starting background removal…');
    try {
      for (let index = 0; index < targets.length; index++) {
        const item = targets[index];
        const cutout = await removeBackgroundAI(item.url, message => {
          const match = message.match(/(\\d+(?:\\.\\d+)?)%/);
          const itemProgress = match ? Number(match[1]) : 0;
          setProgress(Math.min(100, Math.round(((index + itemProgress / 100) / targets.length) * 100)));
          setStatus(`${targets.length > 1 ? `Processing ${index + 1} of ${targets.length}: ` : ''}${message}`);
        });
        if (targets.length === 1) {
          const previewUrl = URL.createObjectURL(cutout);
          setCutoutUrl(current => { if (current) URL.revokeObjectURL(current); return previewUrl; });
          setCutoutBlob(cutout);
        } else {
          let output = cutout;
          if (backgroundMode === 'color') {
            const image = await loadImage(URL.createObjectURL(cutout));
            const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas is unavailable.');
            ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0);
            output = await canvasBlob(canvas, 'image/png');
          }
          onApplyImage(output, backgroundMode === 'color' ? 'background-color' : 'transparent-cutout', item.id);
        }
        setProgress(Math.round(((index + 1) / targets.length) * 100));
      }
      setStatus(targets.length === 1 ? 'Background removal complete. Review the cutout, then apply it.' : `Background removal complete for ${targets.length} layers.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Background removal failed.'); }
    finally { setBusy(false); }
  };

  const applyCutout = (withColor: boolean) => run(async () => {
    if (!cutoutBlob) throw new Error('Remove the background first.');
    if (!withColor) {
      onApplyImage(cutoutBlob, 'transparent-cutout', selected!.id);
    } else {
      const image = await loadImage(cutoutUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');
      ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      onApplyImage(await canvasBlob(canvas, 'image/png'), 'new-background', selected!.id);
    }
    setStatus(withColor ? 'New background applied as a separate layer.' : 'Transparent PNG cutout applied as a separate layer.');
  });

  const applyRetouch = () => run(async () => {
    const image = await loadImage(selected!.url);
    const canvas = await retouchFaceSkinLocally(image, retouch);
    onApplyImage(await canvasBlob(canvas, 'image/jpeg'), 'retouched', selected!.id);
    setStatus('Face-skin retouch applied. Original photo remains available as a separate layer.');
  });

  const applySignature = () => run(async () => {
    if (!signature) throw new Error('Upload a signature first.');
    const image = await loadImage(selected!.url);
    const sign = await loadImage(signature);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.drawImage(image, 0, 0);
    const targetW = canvas.width * signatureScale / 100;
    const targetH = targetW * sign.naturalHeight / sign.naturalWidth;
    const cropScale=Math.max(1,signatureCropZoom/100),sourceW=sign.naturalWidth/cropScale,sourceH=sign.naturalHeight/cropScale;
    const sourceX=(sign.naturalWidth-sourceW)*signatureCropX/100,sourceY=(sign.naturalHeight-sourceH)*signatureCropY/100;
    ctx.drawImage(sign,sourceX,sourceY,sourceW,sourceH,canvas.width * signatureX / 100 - targetW / 2, canvas.height * signatureY / 100 - targetH / 2, targetW, targetH);
    onApplyImage(await canvasBlob(canvas, 'image/png'), 'signature', selected!.id);
    setStatus('Signature placed on the selected photo.');
  });

  const exportSheet = async (format: 'jpg'|'png'|'pdf') => run(async () => {
    const list = photos.length ? photos : [selected!];
    const images = await Promise.all(list.map(item => loadImage(item.url)));
    const photoW = widthPx, photoH = heightPx;
    const pageW = paper === 'single' ? photoW : paper === '4x6' ? 1200 : 2480;
    const pageH = paper === 'single' ? photoH : paper === '4x6' ? 1800 : 3508;
    const canvas = document.createElement('canvas');
    canvas.width = pageW; canvas.height = pageH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is unavailable.');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,pageW,pageH);
    const mmPx = (value:number) => value * 300 / 25.4;
    const inset = paper === 'single' ? 0 : mmPx(margin);
    const spacing = paper === 'single' ? 0 : mmPx(gap);
    const cols = paper === 'single' ? 1 : Math.max(1, Math.floor((pageW - inset*2 + spacing)/(photoW+spacing)));
    const rows = paper === 'single' ? 1 : Math.max(1, Math.ceil(copies/cols));
    const drawCount = paper === 'single' ? 1 : Math.min(copies, cols*rows);
    for (let i=0;i<drawCount;i++) {
      const image = images[i % images.length];
      const x = paper === 'single' ? 0 : inset + (i%cols)*(photoW+spacing);
      const y = paper === 'single' ? 0 : inset + Math.floor(i/cols)*(photoH+spacing);
      if (x+photoW <= pageW && y+photoH <= pageH) ctx.drawImage(image,x,y,photoW,photoH);
    }
    if (format === 'pdf') {
      const format = paper === 'single' ? [photoW*25.4/300, photoH*25.4/300] : paper === '4x6' ? [4,6] : 'a4';
      const doc = new jsPDF({orientation:'portrait',unit:paper==='single'?'mm':'in',format});
      doc.addImage(canvas.toDataURL('image/jpeg',0.96),'JPEG',0,0,paper==='single'?photoW*25.4/300:paper==='4x6'?4:8.27,paper==='single'?photoH*25.4/300:paper==='4x6'?6:11.69);
      doc.save(`tanshu-studio-${paper}-print.pdf`);
    } else {
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await canvasBlob(canvas,mime,0.96);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`tanshu-studio-${paper}-print.${format}`; a.click();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    setStatus(`${paper.toUpperCase()} print sheet exported as ${format.toUpperCase()}.`);
  });

  const cleanSignature = async () => {
    if(!signature)return;
    const image=await loadImage(signature);const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;let left=canvas.width,top=canvas.height,right=0,bottom=0,found=false;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;const luminance=.299*data[i]+.587*data[i+1]+.114*data[i+2];const alpha=luminance>=signatureCleanThreshold?0:Math.round((signatureCleanThreshold-luminance)/Math.max(1,signatureCleanThreshold-80)*255);data[i+3]=Math.min(data[i+3],alpha);if(data[i+3]>8){found=true;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}}
    if(!found)throw new Error('No dark signature strokes found. Lower the cleanup threshold or use a clearer image.');
    ctx.putImageData(pixels,0,0);const width=right-left+1,height=bottom-top+1;const cropped=document.createElement('canvas');cropped.width=width;cropped.height=height;cropped.getContext('2d')?.drawImage(canvas,left,top,width,height,0,0,width,height);
    setSignature(cropped.toDataURL('image/png'));setSignatureName(name=>name.replace(/\\.[^.]+$/,'')+'-cleaned.png');setStatus('Signature cleaned and tightly cropped with a transparent background.');
  };

  const signatureFileChanged = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Choose a signature image.'); return; }
    const data = await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Read failed'));reader.onerror=()=>reject(new Error('Read failed'));reader.readAsDataURL(file);});
    setSignature(data); setSignatureName(file.name); onAddSignature(file); setStatus('Signature uploaded as a new layer. Select it in Layers to place it on a print sheet, or position it on the selected photo below.');
  };

  React.useEffect(() => () => { if (cutoutUrl) URL.revokeObjectURL(cutoutUrl); }, [cutoutUrl]);

  React.useEffect(() => {
    if (!selected?.url) { brushOriginalRef.current = null; return; }
    const original = new Image(); original.onload = () => { brushOriginalRef.current = original; }; original.src = selected.url;
  }, [selected?.url]);

  React.useEffect(() => {
    if (!cutoutUrl) return;
    const canvas = brushCanvasRef.current; if (!canvas) return;
    const image = new Image();
    image.onload = () => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const ctx = canvas.getContext('2d'); if (ctx) ctx.drawImage(image,0,0); };
    image.src = cutoutUrl;
  }, [cutoutUrl]);

  const paintBackgroundBrush = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = brushCanvasRef.current, ctx = canvas?.getContext('2d'); if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const point = {x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
    const previous = brushLastPointRef.current || point;
    const width = Math.max(2,brushSize*canvas.width/Math.max(1,rect.width));
    ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=width;
    ctx.beginPath(); ctx.moveTo(previous.x,previous.y); ctx.lineTo(point.x,point.y);
    if (brushMode === 'erase') { ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='rgba(0,0,0,1)'; ctx.stroke(); }
    else if (brushOriginalRef.current) {
      const mask=document.createElement('canvas'); mask.width=canvas.width; mask.height=canvas.height;
      const maskCtx=mask.getContext('2d');
      if(maskCtx){maskCtx.lineCap='round';maskCtx.lineJoin='round';maskCtx.lineWidth=width;maskCtx.strokeStyle='#fff';maskCtx.beginPath();maskCtx.moveTo(previous.x,previous.y);maskCtx.lineTo(point.x,point.y);maskCtx.stroke();
        const patch=document.createElement('canvas');patch.width=canvas.width;patch.height=canvas.height;const patchCtx=patch.getContext('2d');
        if(patchCtx){patchCtx.drawImage(brushOriginalRef.current,0,0,canvas.width,canvas.height);patchCtx.globalCompositeOperation='destination-in';patchCtx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';ctx.drawImage(patch,0,0);}
      }
    }
    ctx.restore(); brushLastPointRef.current=point;
  };

  const commitBackgroundBrush = () => {
    brushLastPointRef.current=null;
    const canvas=brushCanvasRef.current;if(!canvas)return;
    canvas.toBlob(blob=>{if(blob)setCutoutBlob(blob);},'image/png');
  };

  const disabled = !selected || busy;
  return <div className="border-b studio-line p-3">
    {!hideTabs && <>
      <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">STUDIO TOOLS</span>{busy && <Loader2 size={13} className="animate-spin studio-muted"/>}</div>
      <div className="grid grid-cols-2 gap-1.5">
        <button className={tabClass('adjust')} onClick={()=>setSection('adjust')}><SlidersHorizontal size={13}/> Adjust</button>
        <button className={tabClass('background')} onClick={()=>setSection('background')}><Eraser size={13}/> Background</button>
        <button className={tabClass('portrait')} onClick={()=>setSection('portrait')}><ScanFace size={13}/> Face Retouch</button>
        <button className={tabClass('signature')} onClick={()=>setSection('signature')}><PenTool size={13}/> Signature</button>
        <button className={tabClass('print')} onClick={()=>setSection('print')}><Printer size={13}/> Print Sheet</button>
        <span className="flex items-center gap-1 px-2 text-[9px] studio-muted"><WandSparkles size={12}/> Browser processing</span>
      </div>
    </>}

    {!selected ? <p className="mt-3 text-[10px] studio-muted">Import a photo to enable editing tools.</p> : <div className="mt-3 space-y-3">
      {section==='move' && <p className="text-[10px] leading-5 studio-muted">Drag the photo directly on the canvas to reposition it. Use the zoom controls above the canvas to adjust the view.</p>}
      {section==='layout' && <p className="text-[10px] leading-5 studio-muted">Choose the paper sheet, photo size and number of copies from the top toolbar or the Edit menu. Drag, resize and arrange each photo directly on the print-sheet preview.</p>}
      {section==='adjust' && <>
        {([['Brightness',brightness,setBrightness],['Contrast',contrast,setContrast],['Saturation',saturation,setSaturation]] as const).map(([label,value,setter])=><label key={label} className="block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span><input className="w-full accent-[#AEB8C2]" type="range" min="0" max="200" value={value} onChange={e=>setter(Number(e.target.value))}/></label>)}
        <button disabled={disabled} onClick={applyAdjustments} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><Check size={13}/> Apply adjustments</button>
      </>}
      {section==='background' && <>
        <p className="text-[10px] leading-4 studio-muted">Select one or more image layers, including signatures, then remove their backgrounds. Original layers remain available.</p>
        <div className="flex items-center justify-between text-[10px] studio-muted"><span>Image layers</span><button type="button" disabled={!photos.length||busy} onClick={()=>setBackgroundSelection(backgroundSelection.length===photos.length?[]:photos.map(photo=>photo.id))} className="font-semibold text-[#D9DEE2] hover:text-white">{backgroundSelection.length===photos.length?'Clear all':'Select All'}</button></div>
        <div className="max-h-32 space-y-1 overflow-y-auto rounded border studio-line p-2">{photos.map(photo=><label key={photo.id} className="flex cursor-pointer items-center gap-2 text-[9px] studio-muted"><input type="checkbox" checked={backgroundSelection.includes(photo.id)} onChange={event=>setBackgroundSelection(current=>event.target.checked?[...current,photo.id]:current.filter(id=>id!==photo.id))} className="accent-[#D0D7DE]"/><span className="min-w-0 flex-1 truncate">{photo.file.name}</span><span>{photo.kind==='signature'?'Signature':'Photo'}</span></label>)}</div>
        <div className="flex items-center justify-between text-[10px] studio-muted"><span>Background output</span><div className="flex gap-1"><button type="button" onClick={()=>setBackgroundMode('transparent')} className={`studio-control px-2 py-1 ${backgroundMode==='transparent'?'border-[#AEB8C2] text-white':''}`}>Transparent</button><button type="button" onClick={()=>setBackgroundMode('color')} className={`studio-control px-2 py-1 ${backgroundMode==='color'?'border-[#AEB8C2] text-white':''}`}>Color</button></div></div>
        <label className="flex items-center justify-between text-[10px] studio-muted">Background color<input type="color" value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="h-8 w-12 rounded border border-[#3A4148] bg-transparent"/></label>
        <div className="flex flex-wrap gap-1.5">{['#FFFFFF','#F4F1EA','#D9E2EA','#CBD5D0','#D9D3CB','#AAB6C2','#E8D8C6','#DDE7F2'].map(color=><button type="button" key={color} aria-label={`Set background color ${color}`} onClick={()=>setBackgroundColor(color)} className="h-6 w-6 rounded border border-white/15" style={{backgroundColor:color}}/>)}</div>
        {backgroundMode==='color'&&<><label className="flex items-center justify-between text-[10px] studio-muted">Custom background color<input type="color" value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="h-8 w-12 rounded border border-[#3A4148] bg-transparent"/></label><div className="flex flex-wrap gap-1.5">{['#FFFFFF','#F4F1EA','#D9E2EA','#CBD5D0','#D9D3CB','#AAB6C2','#E8D8C6','#DDE7F2'].map(color=><button type="button" key={color} aria-label={`Set background color ${color}`} onClick={()=>setBackgroundColor(color)} className="h-6 w-6 rounded border border-white/15" style={{backgroundColor:color}}/>)}</div></>}
        <button disabled={!backgroundSelection.length||busy} onClick={()=>void removeBg()} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><Eraser size={13}/> Remove background</button>
        {busy&&<div className="space-y-1"><div className="flex justify-between text-[9px] studio-muted"><span>Processing</span><span>{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#343A42]"><div className="h-full rounded-full bg-[#D0D7DE] transition-all" style={{width:`${progress}%`}}/></div></div>}
        <input ref={signatureInput} type="file" accept="image/*" className="hidden" onChange={e=>{void signatureFileChanged(e.target.files?.[0]);e.currentTarget.value='';}}/>
        <button type="button" onClick={()=>signatureInput.current?.click()} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px]"><ImagePlus size={13}/> Upload signature</button>
        {signature&&<><p className="truncate text-[9px] studio-muted">{signatureName}</p><div className="rounded border studio-line p-2"><img src={signature} alt="Signature preview" className="mx-auto max-h-16 max-w-full object-contain"/></div><button type="button" onClick={()=>void cleanSignature()} className="studio-control w-full py-2 text-[10px]">Clean signature background</button><label className="block text-[10px] studio-muted">Signature size · {signatureScale}%<input type="range" min="5" max="70" value={signatureScale} onChange={e=>setSignatureScale(Number(e.target.value))} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Signature horizontal position · {signatureX}%<input type="range" min="0" max="100" value={signatureX} onChange={e=>setSignatureX(Number(e.target.value))} className="mt-1 w-full"/></label><label className="block text-[10px] studio-muted">Signature vertical position · {signatureY}%<input type="range" min="0" max="100" value={signatureY} onChange={e=>setSignatureY(Number(e.target.value))} className="mt-1 w-full"/></label><button disabled={disabled} onClick={applySignature} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><PenTool size={13}/> Apply signature to photo</button></>}
        {cutoutUrl && <>
          <div className="rounded border studio-line p-2" style={{backgroundImage:'linear-gradient(45deg,#d7d7d7 25%,transparent 25%),linear-gradient(-45deg,#d7d7d7 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d7d7d7 75%),linear-gradient(-45deg,transparent 75%,#d7d7d7 75%)',backgroundSize:'16px 16px',backgroundPosition:'0 0,0 8px,8px -8px,-8px 0'}}><canvas ref={brushCanvasRef} aria-label="Background cutout brush editor" className="mx-auto block max-h-52 max-w-full touch-none object-contain" style={{width:'100%',height:'auto'}} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);brushLastPointRef.current=null;paintBackgroundBrush(event);}} onPointerMove={event=>{if(event.buttons===1)paintBackgroundBrush(event);}} onPointerUp={event=>{commitBackgroundBrush();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={commitBackgroundBrush}/></div>
          <div className="grid grid-cols-2 gap-1.5"><button type="button" onClick={()=>setBrushMode('erase')} className={`studio-control py-2 text-[10px] ${brushMode==='erase'?'border-[#8B949E] bg-[#30373E] text-white':''}`}>Brush Erase</button><button type="button" onClick={()=>setBrushMode('restore')} className={`studio-control py-2 text-[10px] ${brushMode==='restore'?'border-[#8B949E] bg-[#30373E] text-white':''}`}>Brush Restore</button></div>
          <label className="block text-[10px] studio-muted">Brush size · {brushSize}px<input type="range" min="5" max="100" value={brushSize} onChange={event=>setBrushSize(Number(event.target.value))} className="mt-1 w-full"/></label>
          <p className="text-[9px] studio-muted">Erase removes pixels; Restore paints the matching area from the original photo. Brush edits are included when you apply the cutout.</p>
          <button disabled={disabled} onClick={()=>applyCutout(false)} className="studio-control w-full py-2 text-[10px] disabled:opacity-40">Apply transparent PNG as new layer</button>
          <button disabled={disabled} onClick={()=>applyCutout(true)} className="studio-control w-full py-2 text-[10px] disabled:opacity-40">Apply color background as new layer</button>
        </>}
      </>}
      {section==='portrait' && <>
        <p className="text-[10px] leading-4 studio-muted">Conservative face-skin cleanup. Eyes, brows, lips, hair and background are excluded by the segmentation mask.</p>
        <label className="block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>Retouch strength</span><span>{retouch}%</span></span><input className="w-full accent-[#AEB8C2]" type="range" min="0" max="100" value={retouch} onChange={e=>setRetouch(Number(e.target.value))}/></label>
        <button disabled={disabled} onClick={applyRetouch} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><ScanFace size={13}/> Apply face retouch</button>
      </>}
      {section==='print' && <>
        <label className="block text-[10px] studio-muted">Paper size<select className="studio-control mt-1 h-8 w-full px-2 text-[10px]" value={paper} onChange={e=>setPaper(e.target.value as typeof paper)}><option value="single">Single photo</option><option value="4x6">4 × 6 inch</option><option value="a4">A4</option></select></label>
        <label className="block text-[10px] studio-muted">Photo copies<input className="studio-control mt-1 h-8 w-full px-2 text-[10px]" type="number" min="1" max="60" value={copies} onChange={e=>setCopies(Math.max(1,Math.min(60,Number(e.target.value)||1)))}/></label>
        <div className="grid grid-cols-2 gap-2"><label className="text-[10px] studio-muted">Margin (mm)<input className="studio-control mt-1 h-8 w-full px-2 text-[10px]" type="number" min="0" max="20" value={margin} onChange={e=>setMargin(Math.max(0,Math.min(20,Number(e.target.value)||0)))}/></label><label className="text-[10px] studio-muted">Gap (mm)<input className="studio-control mt-1 h-8 w-full px-2 text-[10px]" type="number" min="0" max="15" value={gap} onChange={e=>setGap(Math.max(0,Math.min(15,Number(e.target.value)||0)))}/></label></div>
        <p className="text-[9px] studio-muted">Sheet uses uploaded layers in order and repeats them to fill the selected copy count.</p>
        <div className="grid grid-cols-3 gap-1.5">
          <button disabled={disabled} onClick={()=>void exportSheet('jpg')} className="studio-control py-2 text-[10px] disabled:opacity-40">JPG</button>
          <button disabled={disabled} onClick={()=>void exportSheet('png')} className="studio-control py-2 text-[10px] disabled:opacity-40">PNG</button>
          <button disabled={disabled} onClick={()=>void exportSheet('pdf')} className="rounded-md bg-[#D9DEE2] py-2 text-[10px] font-semibold text-[#20252A] disabled:opacity-40">PDF</button>
        </div>
      </>}
    </div>}
    {status && <p className="mt-2 break-words text-[9px] leading-4 studio-muted" role="status">{status}</p>}
  </div>;
};
