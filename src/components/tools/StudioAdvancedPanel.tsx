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
  onApplyImage: (blob: Blob, suffix: string) => void;
  activeSection?: 'adjust'|'background'|'portrait'|'signature'|'print';
};

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Image could not be loaded.'));
  image.src = src;
});
const canvasBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 0.96) => new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image export failed.')), type, quality));

export const StudioAdvancedPanel: React.FC<Props> = ({ selected, photos, widthPx, heightPx, onApplyImage, activeSection }) => {
  const [section, setSection] = useState<'adjust'|'background'|'portrait'|'signature'|'print'>(activeSection || 'adjust');
  React.useEffect(() => { if (activeSection) setSection(activeSection); }, [activeSection]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [retouch, setRetouch] = useState(22);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cutoutUrl, setCutoutUrl] = useState('');
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [signature, setSignature] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signatureScale, setSignatureScale] = useState(28);
  const [signatureX, setSignatureX] = useState(58);
  const [signatureY, setSignatureY] = useState(80);
  const [paper, setPaper] = useState<'single'|'4x6'|'a4'>('4x6');
  const [copies, setCopies] = useState(8);
  const [gap, setGap] = useState(2);
  const [margin, setMargin] = useState(5);
  const signatureInput = useRef<HTMLInputElement>(null);

  const tabClass = (key: typeof section) => `flex items-center gap-2 rounded-md border px-2 py-2 text-[10px] transition ${section===key?'border-[#59636D] bg-[#30373E] text-[#F0F2F4]':'border-[#343A42] bg-[#202429] text-[#AAB2BA] hover:bg-[#292F35]'}`;
  const run = async (task: () => Promise<void>) => {
    if (!selected || busy) return;
    setBusy(true); setStatus('Processing…');
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

  const removeBg = () => run(async () => {
    const cutout = await removeBackgroundAI(selected!.url, message => setStatus(message));
    const previewUrl = URL.createObjectURL(cutout);
    setCutoutUrl(current => { if (current) URL.revokeObjectURL(current); return previewUrl; });
    setCutoutBlob(cutout);
    setStatus('Transparent cutout ready. Original photo remains untouched; choose how to apply it.');
  });

  const applyCutout = (withColor: boolean) => run(async () => {
    if (!cutoutBlob) throw new Error('Remove the background first.');
    if (!withColor) {
      onApplyImage(cutoutBlob, 'transparent-cutout');
    } else {
      const image = await loadImage(cutoutUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is unavailable.');
      ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      onApplyImage(await canvasBlob(canvas, 'image/png'), 'new-background');
    }
    setStatus(withColor ? 'New background applied as a separate layer.' : 'Transparent PNG cutout applied as a separate layer.');
  });

  const applyRetouch = () => run(async () => {
    const image = await loadImage(selected!.url);
    const canvas = await retouchFaceSkinLocally(image, retouch);
    onApplyImage(await canvasBlob(canvas, 'image/jpeg'), 'retouched');
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
    ctx.drawImage(sign, canvas.width * signatureX / 100 - targetW / 2, canvas.height * signatureY / 100 - targetH / 2, targetW, targetH);
    onApplyImage(await canvasBlob(canvas, 'image/png'), 'signature');
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

  const signatureFileChanged = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStatus('Choose a signature image.'); return; }
    const data = await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Read failed'));reader.onerror=()=>reject(new Error('Read failed'));reader.readAsDataURL(file);});
    setSignature(data); setSignatureName(file.name); setStatus('Signature loaded. Adjust placement, then apply.');
  };

  React.useEffect(() => () => { if (cutoutUrl) URL.revokeObjectURL(cutoutUrl); }, [cutoutUrl]);

  const disabled = !selected || busy;
  return <div className="border-b studio-line p-3">
    <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">STUDIO TOOLS</span>{busy && <Loader2 size={13} className="animate-spin studio-muted"/>}</div>
    <div className="grid grid-cols-2 gap-1.5">
      <button className={tabClass('adjust')} onClick={()=>setSection('adjust')}><SlidersHorizontal size={13}/> Adjust</button>
      <button className={tabClass('background')} onClick={()=>setSection('background')}><Eraser size={13}/> Background</button>
      <button className={tabClass('portrait')} onClick={()=>setSection('portrait')}><ScanFace size={13}/> Face Retouch</button>
      <button className={tabClass('signature')} onClick={()=>setSection('signature')}><PenTool size={13}/> Signature</button>
      <button className={tabClass('print')} onClick={()=>setSection('print')}><Printer size={13}/> Print Sheet</button>
      <span className="flex items-center gap-1 px-2 text-[9px] studio-muted"><WandSparkles size={12}/> Browser processing</span>
    </div>

    {!selected ? <p className="mt-3 text-[10px] studio-muted">Import a photo to enable editing tools.</p> : <div className="mt-3 space-y-3">
      {section==='adjust' && <>
        {([['Brightness',brightness,setBrightness],['Contrast',contrast,setContrast],['Saturation',saturation,setSaturation]] as const).map(([label,value,setter])=><label key={label} className="block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span><input className="w-full accent-[#AEB8C2]" type="range" min="0" max="200" value={value} onChange={e=>setter(Number(e.target.value))}/></label>)}
        <button disabled={disabled} onClick={applyAdjustments} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><Check size={13}/> Apply adjustments</button>
      </>}
      {section==='background' && <>
        <p className="text-[10px] leading-4 studio-muted">AI background removal runs in your browser. The original photo is preserved; the cutout is added as a new layer.</p>
        <button disabled={disabled} onClick={removeBg} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><Eraser size={13}/> Remove background</button>
        {cutoutUrl && <>
          <div className="rounded border studio-line p-2" style={{backgroundImage:'linear-gradient(45deg,#d7d7d7 25%,transparent 25%),linear-gradient(-45deg,#d7d7d7 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d7d7d7 75%),linear-gradient(-45deg,transparent 75%,#d7d7d7 75%)',backgroundSize:'16px 16px',backgroundPosition:'0 0,0 8px,8px -8px,-8px 0'}}><img src={cutoutUrl} alt="Transparent background removal preview" className="mx-auto max-h-40 max-w-full object-contain"/></div>
          <button disabled={disabled} onClick={()=>applyCutout(false)} className="studio-control w-full py-2 text-[10px] disabled:opacity-40">Apply transparent PNG as new layer</button>
          <label className="flex items-center justify-between text-[10px] studio-muted">Replacement color<input type="color" value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="h-8 w-12 rounded border border-[#3A4148] bg-transparent"/></label>
          <button disabled={disabled} onClick={()=>applyCutout(true)} className="studio-control w-full py-2 text-[10px] disabled:opacity-40">Apply color background as new layer</button>
        </>}
      </>}
      {section==='portrait' && <>
        <p className="text-[10px] leading-4 studio-muted">Conservative face-skin cleanup. Eyes, brows, lips, hair and background are excluded by the segmentation mask.</p>
        <label className="block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>Retouch strength</span><span>{retouch}%</span></span><input className="w-full accent-[#AEB8C2]" type="range" min="0" max="100" value={retouch} onChange={e=>setRetouch(Number(e.target.value))}/></label>
        <button disabled={disabled} onClick={applyRetouch} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><ScanFace size={13}/> Apply face retouch</button>
      </>}
      {section==='signature' && <>
        <input ref={signatureInput} type="file" accept="image/*" className="hidden" onChange={e=>{void signatureFileChanged(e.target.files?.[0]);e.currentTarget.value='';}}/>
        <button onClick={()=>signatureInput.current?.click()} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px]"><ImagePlus size={13}/> Upload signature</button>
        {signature && <><div className="rounded border studio-line bg-white p-2"><img src={signature} alt="Signature preview" className="max-h-16 max-w-full object-contain"/></div><p className="truncate text-[9px] studio-muted">{signatureName}</p>
          {([['Size',signatureScale,setSignatureScale],['Horizontal',signatureX,setSignatureX],['Vertical',signatureY,setSignatureY]] as const).map(([label,value,setter])=><label key={label} className="block text-[10px] studio-muted"><span className="mb-1 flex justify-between"><span>{label}</span><span>{value}%</span></span><input className="w-full accent-[#AEB8C2]" type="range" min={label==='Size'?5:0} max={label==='Size'?70:100} value={value} onChange={e=>setter(Number(e.target.value))}/></label>)}
          <button disabled={disabled} onClick={applySignature} className="studio-control flex w-full items-center justify-center gap-2 py-2 text-[10px] disabled:opacity-40"><PenTool size={13}/> Apply signature to photo</button></>}
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
