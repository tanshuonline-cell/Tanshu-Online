import React, { useMemo, useRef, useState } from 'react';
import { ImagePlus, RotateCcw, RotateCw, ScanLine, Download, Check, Move } from 'lucide-react';

type Point = { x: number; y: number };
type Props = { onApply: (file: File) => void };

const solveLinear = (matrix: number[][], values: number[]) => {
  const a = matrix.map((row, i) => [...row, values[i]]);
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let row = col + 1; row < 8; row++) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    if (Math.abs(a[pivot][col]) < 1e-10) throw new Error('The selected corners are too close together.');
    [a[col], a[pivot]] = [a[pivot], a[col]];
    const divisor = a[col][col];
    for (let j = col; j <= 8; j++) a[col][j] /= divisor;
    for (let row = 0; row < 8; row++) if (row !== col) {
      const factor = a[row][col];
      for (let j = col; j <= 8; j++) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map(row => row[8]);
};

const makeHomography = (src: Point[], width: number, height: number) => {
  const dst = [{x:0,y:0},{x:width-1,y:0},{x:width-1,y:height-1},{x:0,y:height-1}];
  const matrix: number[][] = [], values: number[] = [];
  for (let i = 0; i < 4; i++) {
    const {x,y} = dst[i], {x:u,y:v} = src[i];
    matrix.push([x,y,1,0,0,0,-u*x,-u*y]); values.push(u);
    matrix.push([0,0,0,x,y,1,-v*x,-v*y]); values.push(v);
  }
  return solveLinear(matrix, values);
};

const warpPerspective = (image: HTMLImageElement, corners: Point[], outW: number, outH: number) => {
  const source = document.createElement('canvas');
  source.width = image.naturalWidth; source.height = image.naturalHeight;
  const sourceContext = source.getContext('2d', {willReadFrequently:true});
  if (!sourceContext) throw new Error('Could not read the source photo.');
  sourceContext.drawImage(image, 0, 0);
  const input = sourceContext.getImageData(0, 0, source.width, source.height);
  const output = new ImageData(outW, outH);
  const h = makeHomography(corners, outW, outH);
  for (let y = 0; y < outH; y++) for (let x = 0; x < outW; x++) {
    const denominator = h[6]*x + h[7]*y + 1;
    const sx = (h[0]*x + h[1]*y + h[2]) / denominator;
    const sy = (h[3]*x + h[4]*y + h[5]) / denominator;
    const target = (y*outW+x)*4;
    if (sx < 0 || sy < 0 || sx >= source.width-1 || sy >= source.height-1) { output.data[target+3] = 255; continue; }
    const x0 = Math.floor(sx), y0 = Math.floor(sy), dx = sx-x0, dy = sy-y0;
    const p00=(y0*source.width+x0)*4, p10=p00+4, p01=p00+source.width*4, p11=p01+4;
    for (let c=0;c<3;c++) {
      const top=input.data[p00+c]*(1-dx)+input.data[p10+c]*dx;
      const bottom=input.data[p01+c]*(1-dx)+input.data[p11+c]*dx;
      output.data[target+c]=Math.round(top*(1-dy)+bottom*dy);
    }
    output.data[target+3]=255;
  }
  const canvas=document.createElement('canvas'); canvas.width=outW; canvas.height=outH;
  const context=canvas.getContext('2d');
  if(!context) throw new Error('Could not create the corrected photo.');
  context.putImageData(output,0,0);
  return canvas;
};

export const PhotoFromPhotoTool: React.FC<Props> = ({onApply}) => {
  const [file,setFile]=useState<File|null>(null);
  const [sourceUrl,setSourceUrl]=useState('');
  const [corners,setCorners]=useState<Point[]>([{x:5,y:5},{x:95,y:5},{x:95,y:95},{x:5,y:95}]);
  const [aspect,setAspect]=useState('35x45');
  const [brightness,setBrightness]=useState(100);
  const [contrast,setContrast]=useState(100);
  const [sharpness,setSharpness]=useState(0);
  const [rotation,setRotation]=useState(0);
  const [resultUrl,setResultUrl]=useState('');
  const [originalResultUrl,setOriginalResultUrl]=useState('');
  const [compareMode,setCompareMode]=useState(false);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [dragIndex,setDragIndex]=useState<number|null>(null);
  const frameRef=useRef<HTMLDivElement>(null);
  const imageRef=useRef<HTMLImageElement>(null);
  const ratio=aspect==='35x45'?35/45:aspect==='2x2'?1:aspect==='25x35'?25/35:35/35;
  const displayCorners=useMemo(()=>corners,[corners]);

  const chooseFile=(next:File|null)=>{
    if(!next)return;
    if(!next.type.startsWith('image/')){setStatus('Please choose an image file.');return;}
    const url=URL.createObjectURL(next);
    setFile(next);setSourceUrl(url);setResultUrl('');setOriginalResultUrl('');setCompareMode(false);setStatus('Drag the four corner points onto the edges of the photographed print.');
    setCorners([{x:5,y:5},{x:95,y:5},{x:95,y:95},{x:5,y:95}]);setRotation(0);
  };
  const moveCorner=(event:React.PointerEvent<HTMLButtonElement>,index:number)=>{
    if(dragIndex!==index||!frameRef.current)return;
    const bounds=imageRef.current?.getBoundingClientRect();
    if(!bounds)return;
    const x=Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100));
    const y=Math.max(0,Math.min(100,(event.clientY-bounds.top)/bounds.height*100));
    setCorners(current=>current.map((p,i)=>i===index?{x,y}:p));
  };
  const correct=async()=>{
    if(!sourceUrl||busy)return;
    setBusy(true);setStatus('Correcting perspective and enhancing the photo…');
    try{
      const image=new Image();image.src=sourceUrl;await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not open this photo.'));});
      const rotated=document.createElement('canvas');
      const swap=Math.abs(rotation)%180===90;
      rotated.width=swap?image.naturalHeight:image.naturalWidth;rotated.height=swap?image.naturalWidth:image.naturalHeight;
      const rc=rotated.getContext('2d');if(!rc)throw new Error('Could not rotate the source photo.');
      rc.translate(rotated.width/2,rotated.height/2);rc.rotate(rotation*Math.PI/180);rc.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);
      const rotatedImage=new Image();rotatedImage.src=rotated.toDataURL('image/png');await new Promise<void>((resolve,reject)=>{rotatedImage.onload=()=>resolve();rotatedImage.onerror=()=>reject(new Error('Could not prepare the rotated image.'));});
      const points=corners.map(p=>{let x=p.x,y=p.y;if(rotation===90){x=100-p.y;y=p.x;}else if(rotation===180){x=100-p.x;y=100-p.y;}else if(rotation===270){x=p.y;y=100-p.x;}return {x:x/100*rotated.width,y:y/100*rotated.height};});
      const outW=aspect==='2x2'?1200:aspect==='25x35'?1000:aspect==='35x35'?1200:1050;
      const outH=Math.round(outW/ratio);
      if(outW*outH>2200000)throw new Error('The output is too large. Please try again.');
      const canvas=warpPerspective(rotatedImage,points,outW,outH);
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Could not enhance the corrected photo.');
      const enhanced=document.createElement('canvas');enhanced.width=outW;enhanced.height=outH;
      const ec=enhanced.getContext('2d');if(!ec)throw new Error('Could not prepare the enhancement.');
      ec.filter='brightness('+brightness+'%) contrast('+(contrast+sharpness*0.12)+'%)';ec.drawImage(canvas,0,0);
      const url=enhanced.toDataURL('image/jpeg',0.96);setResultUrl(url);setOriginalResultUrl(url);setCompareMode(false);setStatus('Perspective corrected. Review the result before applying it to the studio.');
    }catch(error){setStatus(error instanceof Error?error.message:'Could not correct this photo.');}
    finally{setBusy(false);}
  };
  const apply=async()=>{
    if(!resultUrl)return;
    const blob=await (await fetch(resultUrl)).blob();
    onApply(new File([blob],'photo-from-photo-corrected.jpg',{type:'image/jpeg'}));
  };
  const runEffect=async(kind:'denoise'|'sharpen'|'face')=>{
    const base=originalResultUrl;
    if(!base||busy)return;
    setBusy(true);setCompareMode(false);
    setStatus(kind==='denoise'?'Reducing noise and mild blur…':kind==='sharpen'?'Applying smart sharpening…':'Protecting natural-looking skin tones…');
    try{
      const image=new Image();image.src=base;
      await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not open the corrected photo.'));});
      const w=image.naturalWidth,h=image.naturalHeight;
      const source=document.createElement('canvas');source.width=w;source.height=h;
      const sc=source.getContext('2d',{willReadFrequently:true});if(!sc)throw new Error('Could not prepare the image.');
      sc.drawImage(image,0,0);
      const original=sc.getImageData(0,0,w,h);
      const blurredCanvas=document.createElement('canvas');blurredCanvas.width=w;blurredCanvas.height=h;
      const bc=blurredCanvas.getContext('2d',{willReadFrequently:true});if(!bc)throw new Error('Could not process the image.');
      bc.filter='blur(1.8px)';bc.drawImage(source,0,0);
      const soft=bc.getImageData(0,0,w,h);
      const out=new ImageData(w,h);
      for(let i=0;i<original.data.length;i+=4){
        const r=original.data[i],g=original.data[i+1],b=original.data[i+2];
        const sr=soft.data[i],sg=soft.data[i+1],sb=soft.data[i+2];
        if(kind==='denoise'){
          out.data[i]=Math.round(r*.42+sr*.58);out.data[i+1]=Math.round(g*.42+sg*.58);out.data[i+2]=Math.round(b*.42+sb*.58);
        }else if(kind==='sharpen'){
          out.data[i]=Math.max(0,Math.min(255,Math.round(r+(r-sr)*2.4)));
          out.data[i+1]=Math.max(0,Math.min(255,Math.round(g+(g-sg)*2.4)));
          out.data[i+2]=Math.max(0,Math.min(255,Math.round(b+(b-sb)*2.4)));
        }else{
          const y=.299*r+.587*g+.114*b, cb=128-.168736*r-.331264*g+.5*b, cr=128+.5*r-.418688*g-.081312*b;
          const skin=cr>132&&cr<180&&cb>75&&cb<135&&y>45;
          const mix=skin ? 0.42 : 0;
          out.data[i]=Math.round(r*(1-mix)+sr*mix);out.data[i+1]=Math.round(g*(1-mix)+sg*mix);out.data[i+2]=Math.round(b*(1-mix)+sb*mix);
        }
        out.data[i+3]=original.data[i+3];
      }
      sc.putImageData(out,0,0);
      const next=source.toDataURL('image/jpeg',.98);setResultUrl(next);
      setStatus(kind==='denoise'?'Noise reduction preview ready.':kind==='sharpen'?'Smart sharpening preview ready.':'Natural Face Protection preview ready. Skin-tone protection is a conservative color-based approximation, not AI face detection.');
    }catch(error){setStatus(error instanceof Error?error.message:'Could not apply this effect.');}
    finally{setBusy(false);}
  };
  const hdUpscale=async(scale:2|4)=>{
    if(!originalResultUrl||busy)return;
    setBusy(true);setCompareMode(false);setStatus('Creating a high-quality '+scale+'× browser upscale…');
    try{
      const image=new Image();image.src=originalResultUrl;
      await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Could not open the corrected photo.'));});
      const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
      if(width*height>12000000)throw new Error('This output exceeds the 12 MP safety limit on this device.');
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const context=canvas.getContext('2d');if(!context)throw new Error('Could not create the HD version.');
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,width,height);
      setResultUrl(canvas.toDataURL('image/jpeg',.98));
      setStatus(scale+'× high-quality browser upscale complete. This is not AI and cannot recreate missing original detail.');
    }catch(error){setStatus(error instanceof Error?error.message:'Could not create the HD version.');}
    finally{setBusy(false);}
  };
  const download=()=>{
    if(!resultUrl)return;
    const link=document.createElement('a');link.href=resultUrl;link.download='tanshu-photo-from-photo-hd.jpg';link.click();
  };

  return <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden p-3 sm:p-5 text-white">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-emerald-200">
          <ScanLine size={18}/><h2 className="text-sm font-extrabold">PHOTO FROM PHOTO</h2>
          {file&&<div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={()=>setCorners([{x:5,y:5},{x:95,y:5},{x:95,y:95},{x:5,y:95}])} className="rounded-md border border-white/15 px-2 py-1.5 text-[9px] font-semibold text-slate-300"><Move size={11} className="mr-1 inline"/>Set Corners</button>
            <button type="button" onClick={()=>setRotation(v=>(v+270)%360)} className="rounded-md border border-white/15 px-2 py-1.5 text-[9px] font-semibold text-slate-300"><RotateCcw size={11} className="mr-1 inline"/>Rotate Left</button>
            <button type="button" onClick={()=>setRotation(v=>(v+90)%360)} className="rounded-md border border-white/15 px-2 py-1.5 text-[9px] font-semibold text-slate-300"><RotateCw size={11} className="mr-1 inline"/>Rotate Right</button>
          </div>}
        </div>
        <p className="mt-1 text-[10px] text-slate-400">Straighten a photographed print, correct its perspective and prepare a passport-size image.</p>
      </div>
      <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-[10px] font-bold text-white"><ImagePlus size={14}/> {file?'Change Photo':'Upload WhatsApp Photo'}<input type="file" accept="image/*" className="sr-only" onChange={e=>chooseFile(e.target.files?.[0]||null)}/></label>
    </div>
    {!file?<label className="flex min-h-[300px] flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300/30 bg-slate-900/50 text-center"><ImagePlus size={36} className="text-emerald-300"/><strong className="mt-3 text-sm">Upload a photo received on WhatsApp</strong><span className="mt-2 text-xs text-slate-400">JPG · PNG · WEBP</span><input type="file" accept="image/*" className="sr-only" onChange={e=>chooseFile(e.target.files?.[0]||null)}/></label>:<div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-h-0 max-h-full flex-col overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-slate-950/70 p-3">
        <div className="mb-2 flex items-center justify-between text-[9px] text-slate-400"><span>DRAG THE 4 CORNERS TO MATCH THE PHOTO EDGES</span><span>{Math.round(imageRef.current?.naturalWidth||0)} × {Math.round(imageRef.current?.naturalHeight||0)}</span></div>
        <div ref={frameRef} className="relative flex min-h-[min(42vh,420px)] flex-none items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="relative inline-block max-h-full max-w-full">
            <img ref={imageRef} src={sourceUrl} alt="Uploaded photographed print" onLoad={e=>{const el=e.currentTarget;const box=frameRef.current;if(!box)return;const scale=Math.min((box.clientWidth-20)/el.naturalWidth,(box.clientHeight-20)/el.naturalHeight,1);el.style.width=Math.max(1,el.naturalWidth*scale)+'px';el.style.height=Math.max(1,el.naturalHeight*scale)+'px';}} className="block max-h-full max-w-full object-contain"/>
            {displayCorners.map((point,index)=><button key={index} type="button" onPointerDown={e=>{setDragIndex(index);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>moveCorner(e,index)} onPointerUp={()=>setDragIndex(null)} onPointerCancel={()=>setDragIndex(null)} style={{left:point.x+'%',top:point.y+'%'}} className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.3)]"><span className="sr-only">Move corner {index+1}</span></button>)}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={displayCorners.map(p=>p.x+','+p.y).join(' ')} fill="rgba(16,185,129,.10)" stroke="#34d399" strokeWidth=".6" strokeDasharray="2 1"/></svg>
          </div>
        </div>
        {resultUrl&&<div className="mt-3 rounded-xl border border-emerald-300/25 bg-slate-900/80 p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-extrabold tracking-wide text-emerald-200">LIVE CORRECTED PHOTO PREVIEW</span><span className="text-[9px] text-slate-400">{compareMode?'BEFORE / AFTER':'CURRENT RESULT'}</span></div>{compareMode?<div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-white p-2"><img src={originalResultUrl} alt="Original corrected photo" className="max-h-[min(48vh,480px)] w-full object-contain"/><p className="pt-1 text-center text-[9px] font-bold text-slate-700">ORIGINAL</p></div><div className="rounded-lg bg-white p-2"><img src={resultUrl} alt="Current effect preview" className="max-h-[min(38vh,360px)] w-full object-contain"/><p className="pt-1 text-center text-[9px] font-bold text-slate-700">AFTER EFFECT</p></div></div>:<div className="rounded-lg bg-white p-2"><img src={resultUrl} alt="Live corrected photo" className="max-h-[min(62vh,620px)] w-full object-contain"/></div>}</div>}
      </div>
      <div className="max-h-full space-y-3 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-slate-900/70 p-3">
        <div><label className="mb-1 block text-[9px] font-bold text-slate-300">OUTPUT PHOTO SIZE</label><select value={aspect} onChange={e=>setAspect(e.target.value)} className="h-9 w-full rounded-lg border border-white/15 bg-slate-950 px-2 text-[10px] text-white"><option value="35x45">Passport · 35 × 45 mm</option><option value="25x35">PAN · 25 × 35 mm</option><option value="2x2">Visa · 2 × 2 inch</option><option value="35x35">Square · 35 × 35 mm</option></select></div>
        {[{label:'BRIGHTNESS',value:brightness,set:setBrightness},{label:'CONTRAST',value:contrast,set:setContrast}].map(item=><div key={item.label}><div className="mb-1 flex justify-between text-[9px] text-slate-300"><label>{item.label}</label><span>{item.value}%</span></div><input type="range" min="70" max="140" value={item.value} onChange={e=>item.set(Number(e.target.value))} className="w-full accent-emerald-400"/></div>)}
        <div><div className="mb-1 flex justify-between text-[9px] text-slate-300"><label>DETAIL ENHANCE</label><span>{sharpness}</span></div><input type="range" min="0" max="100" value={sharpness} onChange={e=>setSharpness(Number(e.target.value))} className="w-full accent-emerald-400"/></div>
        <button type="button" onClick={correct} disabled={busy} className="w-full rounded-lg bg-emerald-500 px-3 py-2.5 text-[10px] font-extrabold text-white disabled:opacity-40">{busy?'Correcting…':'Correct Perspective & Enhance'}</button>
        {resultUrl&&<><div className="overflow-hidden rounded-lg border border-emerald-300/30 bg-white"><img src={resultUrl} alt="Corrected passport photo" className="max-h-[min(55vh,520px)] w-full object-contain"/></div><div className="space-y-2 rounded-lg border border-violet-300/25 bg-violet-400/[.06] p-2"><div className="text-[9px] font-extrabold text-violet-100">QUALITY TEST LAB · EACH EFFECT STARTS FROM THE ORIGINAL CORRECTED PHOTO</div><div className="grid grid-cols-2 gap-2"><button type="button" disabled title="A genuine AI model is not connected yet" className="col-span-2 rounded-lg border border-violet-300/25 px-2 py-2 text-[9px] font-bold text-violet-200/60">AI HD Upscale · 2× / 4× (AI engine not connected)</button><button type="button" onClick={()=>hdUpscale(2)} disabled={busy} className="rounded-lg border border-violet-300/35 px-2 py-2 text-[9px] font-bold text-violet-100 disabled:opacity-40">Standard HD · 2×</button><button type="button" onClick={()=>hdUpscale(4)} disabled={busy} className="rounded-lg border border-violet-300/35 px-2 py-2 text-[9px] font-bold text-violet-100 disabled:opacity-40">Standard HD · 4×</button><button type="button" onClick={()=>runEffect('denoise')} disabled={busy} className="rounded-lg border border-white/15 px-2 py-2 text-[9px] font-bold text-slate-100 disabled:opacity-40">Noise & Blur Removal</button><button type="button" onClick={()=>runEffect('sharpen')} disabled={busy} className="rounded-lg border border-white/15 px-2 py-2 text-[9px] font-bold text-slate-100 disabled:opacity-40">Smart Sharpening</button><button type="button" onClick={()=>runEffect('face')} disabled={busy} className="col-span-2 rounded-lg border border-emerald-300/25 px-2 py-2 text-[9px] font-bold text-emerald-100 disabled:opacity-40">Natural Face Protection</button></div><button type="button" onClick={()=>{setResultUrl(originalResultUrl);setCompareMode(false);setStatus('Original corrected photo restored.');}} disabled={busy||!originalResultUrl} className="w-full rounded-lg border border-white/15 px-2 py-2 text-[9px] font-semibold text-slate-300 disabled:opacity-40">Reset to Original Corrected Photo</button><button type="button" onClick={()=>setCompareMode(v=>!v)} disabled={busy||!originalResultUrl} className="w-full rounded-lg border border-amber-300/25 px-2 py-2 text-[9px] font-semibold text-amber-100 disabled:opacity-40">{compareMode?'Hide Comparison':'Compare Original & Current'}</button></div>{compareMode&&<div className="grid grid-cols-2 gap-2"><div className="rounded-lg border border-white/10 bg-white p-1"><img src={originalResultUrl} alt="Original corrected photo" className="max-h-[min(38vh,360px)] w-full object-contain"/><p className="py-1 text-center text-[8px] text-slate-700">ORIGINAL</p></div><div className="rounded-lg border border-emerald-300/30 bg-white p-1"><img src={resultUrl} alt="Current effect preview" className="max-h-40 w-full object-contain"/><p className="py-1 text-center text-[8px] text-slate-700">CURRENT EFFECT</p></div></div>}<button type="button" onClick={apply} className="w-full rounded-lg bg-sky-500 px-3 py-2.5 text-[10px] font-extrabold text-white"><Check size={13} className="mr-1 inline"/>Save to WhatsApp Studio</button><button type="button" onClick={download} className="w-full rounded-lg border border-white/15 px-3 py-2 text-[10px] font-bold text-slate-200"><Download size={13} className="mr-1 inline"/>Download Corrected Photo</button></>}
        <p className="text-[8px] leading-4 text-slate-400">HD Upscale 2×/4× uses browser resampling, not AI. Noise reduction and sharpening are conventional image filters. Natural Face Protection uses conservative skin-tone detection, not AI face recognition. True AI super-resolution/face restoration requires a connected AI model and is not claimed here.</p>
      </div>
    </div>}
    {status&&<p className="rounded-lg border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-2 text-[9px] text-emerald-100">{status}</p>}
  </div>;
};
