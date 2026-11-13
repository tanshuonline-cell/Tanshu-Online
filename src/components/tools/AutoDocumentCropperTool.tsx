import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Crop, RotateCcw, Maximize2, Minimize2, SlidersHorizontal, Image as ImageIcon, CheckCircle2, Move, ZoomIn, ZoomOut, X, Eye } from 'lucide-react';

type Point = { x: number; y: number };
type Quad = [Point, Point, Point, Point];
type ExportPreset = 'small' | 'standard' | 'high' | 'very-high';

const PRESETS: Record<ExportPreset, { label: string; target: number; quality: number }> = {
  small: { label: 'Small · 20 KB', target: 20 * 1024, quality: 0.55 },
  standard: { label: 'Standard · 200 KB', target: 200 * 1024, quality: 0.78 },
  high: { label: 'High · 2 MB', target: 2 * 1024 * 1024, quality: 0.9 },
  'very-high': { label: 'Very High · 4 MB', target: 4 * 1024 * 1024, quality: 0.97 },
};

export const AutoDocumentCropperTool: React.FC = () => {
  const [imageUrl,setImageUrl]=useState<string|null>(null);
  const [imageSize,setImageSize]=useState({width:0,height:0});
  const [corners,setCorners]=useState<Quad|null>(null);
  const [dragging,setDragging]=useState<number|null>(null);
  const [brightness,setBrightness]=useState(0);
  const [contrast,setContrast]=useState(12);
  const [saturation,setSaturation]=useState(100);
  const [sharpness,setSharpness]=useState(0);
  const [clarity,setClarity]=useState(0);
  const [monochrome,setMonochrome]=useState(false);
  const [resultUrl,setResultUrl]=useState<string|null>(null);
  const [resultBlob,setResultBlob]=useState<Blob|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [zoomOpen,setZoomOpen]=useState(false);
  const [zoom,setZoom]=useState(100);
  const [preset,setPreset]=useState<ExportPreset>('high');
  const [documentName,setDocumentName]=useState('cropped-document');
  const [customTarget,setCustomTarget]=useState('2');
  const [customUnit,setCustomUnit]=useState<'KB'|'MB'>('MB');
  const [exportMode,setExportMode]=useState<'preset'|'custom'>('preset');
  const fileRef=useRef<HTMLInputElement>(null);
  const imageRef=useRef<HTMLImageElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);

  const cleanName=(name:string)=>name.trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')||'cropped-document';
  const clearResult=()=>{setResultUrl(old=>{if(old)URL.revokeObjectURL(old);return null;});setResultBlob(null);};
  const upload=(file?:File)=>{
    if(!file)return;
    if(!file.type.startsWith('image/')){setError('कृपया JPG, PNG या WEBP फोटो चुनें।');return;}
    const url=URL.createObjectURL(file);
    setImageUrl(old=>{if(old)URL.revokeObjectURL(old);return url;});
    setDocumentName(file.name.replace(/\\.[^.]+$/,'')||'cropped-document');
    clearResult();setError('');
  };
  const imageLoaded=()=>{
    const img=imageRef.current;if(!img)return;
    const w=img.naturalWidth,h=img.naturalHeight,x=w*.07,y=h*.07;
    setImageSize({width:w,height:h});
    setCorners([{x,y},{x:w-x,y},{x:w-x,y:h-y},{x,y:h-y}]);
  };
  const updateCorner=(index:number,e:React.PointerEvent<SVGCircleElement>)=>{
    const rect=stageRef.current?.getBoundingClientRect();if(!rect)return;
    const x=Math.max(0,Math.min(imageSize.width,(e.clientX-rect.left)/rect.width*imageSize.width));
    const y=Math.max(0,Math.min(imageSize.height,(e.clientY-rect.top)/rect.height*imageSize.height));
    setCorners(old=>{if(!old)return old;const next=[...old] as Quad;next[index]={x,y};return next;});
    clearResult();
  };
  const reset=()=>{
    const x=imageSize.width*.07,y=imageSize.height*.07;
    setCorners([{x,y},{x:imageSize.width-x,y},{x:imageSize.width-x,y:imageSize.height-y},{x,y:imageSize.height-y}]);
    clearResult();
  };
  const applyCrop=()=>{
    if(!imageRef.current||!corners)return;
    setBusy(true);setError('');
    window.setTimeout(()=>{
      try{
        const c=corners;
        const width=Math.max(1,Math.round((Math.hypot(c[1].x-c[0].x,c[1].y-c[0].y)+Math.hypot(c[2].x-c[3].x,c[2].y-c[3].y))/2));
        const height=Math.max(1,Math.round((Math.hypot(c[3].x-c[0].x,c[3].y-c[0].y)+Math.hypot(c[2].x-c[1].x,c[2].y-c[1].y))/2));
        const scale=Math.min(1,3200/Math.max(width,height));
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
        ctx.filter='brightness('+(100+brightness)+'%) contrast('+(100+contrast+clarity)+'%) saturate('+(monochrome?0:saturation)+'%) grayscale('+(monochrome?1:0)+')';
        const dst:Point[]=[{x:0,y:0},{x:canvas.width,y:0},{x:canvas.width,y:canvas.height},{x:0,y:canvas.height}];
        const drawTriangle=(ids:number[])=>{
          const p0=c[ids[0]],p1=c[ids[1]],p2=c[ids[2]],q0=dst[ids[0]],q1=dst[ids[1]],q2=dst[ids[2]];
          const den=p0.x*(p1.y-p2.y)+p1.x*(p2.y-p0.y)+p2.x*(p0.y-p1.y);
          if(Math.abs(den)<1e-6)throw new Error('कृपया चारों crop points सही जगह रखें।');
          const affine=(v0:number,v1:number,v2:number)=>{
            const aa=(v0*(p1.y-p2.y)+v1*(p2.y-p0.y)+v2*(p0.y-p1.y))/den;
            const bb=(v0*(p2.x-p1.x)+v1*(p0.x-p2.x)+v2*(p1.x-p0.x))/den;
            const cc=(v0*(p1.x*p2.y-p2.x*p1.y)+v1*(p2.x*p0.y-p0.x*p2.y)+v2*(p0.x*p1.y-p1.x*p0.y))/den;
            return [aa,bb,cc];
          };
          const ax=affine(q0.x,q1.x,q2.x),ay=affine(q0.y,q1.y,q2.y);
          ctx.save();ctx.beginPath();ctx.moveTo(q0.x,q0.y);ctx.lineTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);ctx.closePath();ctx.clip();
          ctx.setTransform(ax[0],ay[0],ax[1],ay[1],ax[2],ay[2]);ctx.drawImage(imageRef.current!,0,0);ctx.restore();
        };
        drawTriangle([0,1,2]);drawTriangle([0,2,3]);
        if(sharpness>0){
          const imageData=ctx.getImageData(0,0,canvas.width,canvas.height),src=imageData.data;
          const copy=new Uint8ClampedArray(src),amount=Math.min(1,sharpness/100)*.65;
          for(let y=1;y<canvas.height-1;y++)for(let x=1;x<canvas.width-1;x++){
            const i=(y*canvas.width+x)*4;
            for(let ch=0;ch<3;ch++){const sum=copy[i-4+ch]+copy[i+4+ch]+copy[i-canvas.width*4+ch]+copy[i+canvas.width*4+ch];src[i+ch]=Math.max(0,Math.min(255,copy[i+ch]+(copy[i+ch]*4-sum)*amount));}
          }
          ctx.putImageData(imageData,0,0);
        }
        canvas.toBlob(blob=>{
          if(!blob){setError('फोटो तैयार नहीं हो पाया।');setBusy(false);return;}
          setResultUrl(old=>{if(old)URL.revokeObjectURL(old);return URL.createObjectURL(blob);});setResultBlob(blob);setBusy(false);
        },'image/jpeg',.98);
      }catch(e){setError(e instanceof Error?e.message:'Crop failed');setBusy(false);}
    },20);
  };
  const targetBytes=()=>exportMode==='preset'?PRESETS[preset].target:Math.max(1,Number(customTarget)||1)*(customUnit==='MB'?1024*1024:1024);
  const makeExportBlob=async()=> {
    if(!resultBlob)throw new Error('पहले Apply Crop करें।');
    const target=targetBytes();
    const bitmap=await createImageBitmap(resultBlob);
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    ctx.drawImage(bitmap,0,0);bitmap.close();
    const encode=(q:number)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Export failed')),'image/jpeg',q));
    let lo=.25,hi=.99,best=await encode(Math.min(hi,exportMode==='preset'?PRESETS[preset].quality:.92));
    if(best.size>target){
      for(let i=0;i<8;i++){const mid=(lo+hi)/2,b=await encode(mid);if(b.size<=target){best=b;lo=mid;}else hi=mid;}
    }
    return best;
  };
  const saveJpeg=async()=>{
    if(!resultBlob)return;setBusy(true);setError('');
    try{const blob=await makeExportBlob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=cleanName(documentName)+'.jpg';a.click();URL.revokeObjectURL(url);}
    catch(e){setError(e instanceof Error?e.message:'Export failed');}finally{setBusy(false);}
  };
  const savePdf=async()=>{
    if(!resultBlob)return;setBusy(true);setError('');
    try{
      const blob=await makeExportBlob();const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Could not read image'));r.readAsDataURL(blob);});
      const img=new Image();img.onload=()=>{
        const landscape=img.width>img.height,pw=landscape?297:210,ph=landscape?210:297;
        const pdf=new jsPDF({orientation:landscape?'landscape':'portrait',unit:'mm',format:'a4',compress:true});
        const ratio=Math.min(pw/img.width,ph/img.height),w=img.width*ratio,h=img.height*ratio;
        pdf.addImage(data,'JPEG',(pw-w)/2,(ph-h)/2,w,h,undefined,'FAST');pdf.save(cleanName(documentName)+'.pdf');setBusy(false);
      };img.onerror=()=>{setError('PDF preview could not be prepared.');setBusy(false);};img.src=data;
    }catch(e){setError(e instanceof Error?e.message:'PDF export failed');setBusy(false);}
  };
  const radius=Math.max(10,Math.max(imageSize.width,imageSize.height)*.018);
  const filterStyle={filter:'brightness('+(100+brightness)+'%) contrast('+(100+contrast+clarity)+'%) saturate('+(monochrome?0:saturation)+'%)'};
  const slider=(label:string,value:number,min:number,max:number,onChange:(v:number)=>void,suffix='')=><label className="mb-3 block text-xs text-blue-100"><span className="mb-1 flex justify-between"><span>{label}</span><b>{value}{suffix}</b></span><input className="w-full accent-cyan-400" type="range" min={min} max={max} value={value} onChange={e=>{onChange(+e.target.value);clearResult();}}/></label>;

  return <div className="flex h-full min-h-0 flex-col bg-[#081629] text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#071426] to-[#123B5A] px-4 py-3 sm:px-6">
      <div className="min-w-0"><div className="text-sm font-black tracking-wide text-white sm:text-base">TANSHU ONLINE <span className="text-cyan-300">· AUTO DOCUMENT CROPPER</span> <span className="ml-1 text-[10px] font-semibold text-blue-100">4-Corner Crop · HD Export · Browser-side</span></div></div>
      <div className="flex items-center gap-2">
        <button onClick={()=>setExpanded(v=>!v)} className="rounded-lg border border-white/20 p-2 text-blue-100 hover:bg-white/10" title={expanded?'Restore studio':'Expand studio'}>{expanded?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
        <button onClick={()=>fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"><Upload size={15}/>{imageUrl?'Change Photo':'Add Photo'}</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>upload(e.target.files?.[0])}/>
      </div>
    </header>
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[230px_minmax(0,1fr)_250px] lg:overflow-hidden sm:p-4">
      {!expanded&&<aside className="order-2 space-y-3 lg:order-1 lg:overflow-y-auto">
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><Crop size={15}/> Crop selection</div>
          <p className="mb-3 text-xs leading-5 text-blue-100">चारों नीले हैंडल दस्तावेज़ के कोनों पर रखें।</p>
          <button onClick={reset} disabled={!imageUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><RotateCcw size={14}/> Reset crop area</button>
          <div className="mt-3 rounded-lg bg-cyan-400/10 p-3 text-[11px] leading-5 text-cyan-100"><Move size={14} className="mr-1 inline"/> चारों कोने अलग-अलग खींचें।</div>
        </section>
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><SlidersHorizontal size={15}/> Image enhancement</div>
          {slider('Brightness',brightness,-40,40,setBrightness)}
          {slider('Contrast',contrast,-50,80,setContrast)}
          {slider('Clarity',clarity,0,50,setClarity)}
          {slider('Sharpness',sharpness,0,100,setSharpness)}
          {slider('Saturation',saturation,0,200,setSaturation,'%')}
          <button onClick={()=>{setMonochrome(v=>!v);clearResult();}} className={'w-full rounded-lg border px-3 py-2 text-xs font-bold '+(monochrome?'border-cyan-300 bg-cyan-400 text-slate-950':'border-white/15 bg-white/5 text-blue-100')}>{monochrome?'Black & White: ON':'Black & White'}</button>
          <button onClick={()=>{setBrightness(0);setContrast(12);setClarity(0);setSharpness(0);setSaturation(100);setMonochrome(false);clearResult();}} className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-blue-100">Reset enhancement</button>
        </section>
      </aside>}
      <main className={'order-1 flex min-h-[380px] min-w-0 flex-col rounded-xl border border-white/10 bg-[#0c1d33] p-3 lg:order-2 lg:min-h-0 '+(expanded?'lg:col-span-3':'')}>
        <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs font-bold text-white"><ImageIcon size={15} className="text-cyan-300"/>{resultUrl?'Cropped document output':'Drag handles to crop'}</div><span className="text-[10px] text-blue-200">{imageUrl?imageSize.width+' × '+imageSize.height+' px':'No photo selected'}</span></div>
        <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto rounded-lg bg-[#06101f] p-3">
          {imageUrl?<div ref={stageRef} className="relative mx-auto w-full" style={{aspectRatio:imageSize.width+'/'+imageSize.height,maxWidth:'min(100%, 75vh)'}}>
            <img ref={imageRef} src={imageUrl} onLoad={imageLoaded} alt="Document crop source" draggable={false} style={filterStyle} className="absolute inset-0 h-full w-full select-none object-fill"/>
            {corners&&<svg className="absolute inset-0 h-full w-full touch-none" viewBox={'0 0 '+imageSize.width+' '+imageSize.height} preserveAspectRatio="none">
              <polygon points={corners.map(p=>p.x+','+p.y).join(' ')} fill="rgba(34,211,238,.12)" stroke="#22d3ee" strokeWidth={Math.max(2,Math.max(imageSize.width,imageSize.height)*.003)} strokeDasharray={Math.max(8,Math.max(imageSize.width,imageSize.height)*.012)+' '+Math.max(5,Math.max(imageSize.width,imageSize.height)*.008)}/>
              {corners.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r={radius} fill="#071426" stroke="#67e8f9" strokeWidth={Math.max(2,Math.max(imageSize.width,imageSize.height)*.005)}/><circle cx={p.x} cy={p.y} r={radius*.3} fill="white"/><circle cx={p.x} cy={p.y} r={radius*2.5} fill="transparent" style={{cursor:'grab',touchAction:'none'}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(i);}} onPointerMove={e=>{if(dragging===i)updateCorner(i,e);}} onPointerUp={()=>setDragging(null)} onPointerCancel={()=>setDragging(null)}/></g>)}
            </svg>}
          </div>:<button onClick={()=>fileRef.current?.click()} className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/5 px-8 py-12 text-center hover:bg-cyan-400/10"><Upload size={32} className="mb-3 text-cyan-300"/><b className="text-sm text-white">Upload document photo</b><span className="mt-2 text-xs text-blue-200">JPG · PNG · WEBP</span></button>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-blue-200"><span>चारों हैंडल ड्रैग करें · Original photo सुरक्षित रहती है</span>{resultUrl&&<button onClick={()=>{setZoom(100);setZoomOpen(true);}} className="inline-flex items-center gap-1 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100"><Eye size={14}/> View Full Image</button>}</div>
      </main>
      {!expanded&&<aside className="order-3 space-y-3 lg:overflow-y-auto">
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Document & export</div>
          <label className="mb-3 block text-xs text-blue-100">Document Name<input value={documentName} onChange={e=>setDocumentName(e.target.value)} placeholder="Enter document name" className="mt-1 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white outline-none focus:border-cyan-300"/></label>
          <button onClick={applyCrop} disabled={!imageUrl||!corners||busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"><Crop size={16}/>{busy?'Processing…':'Apply Crop'}</button>
          <p className="mt-2 text-[10px] leading-4 text-blue-200">Image dimensions source pixels से सीमित रहेंगी; artificial upscaling नहीं।</p>
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="mb-2 text-[11px] font-bold text-blue-100">Download size / quality</div>
            <select value={exportMode==='preset'?preset:'custom'} onChange={e=>{if(e.target.value==='custom')setExportMode('custom');else{setPreset(e.target.value as ExportPreset);setExportMode('preset');}}} className="mb-2 w-full rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white">
              <option value="small">Small · 20 KB</option><option value="standard">Standard · 200 KB</option><option value="high">High · 2 MB</option><option value="very-high">Very High · 4 MB</option><option value="custom">Custom size</option>
            </select>
            {exportMode==='custom'&&<div className="mb-2 flex gap-2"><input type="number" min="1" value={customTarget} onChange={e=>setCustomTarget(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#071426] px-3 py-2 text-xs text-white"/><select value={customUnit} onChange={e=>setCustomUnit(e.target.value as 'KB'|'MB')} className="rounded-lg border border-white/15 bg-[#071426] px-2 text-xs text-white"><option>KB</option><option>MB</option></select></div>}
            <div className="mb-2 text-[10px] text-blue-200">Target size: {(targetBytes()/1024/1024).toFixed(2)} MB तक (image compression के अनुसार वास्तविक size बदल सकता है)।</div>
            <button onClick={saveJpeg} disabled={!resultUrl||busy} className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><Download size={15}/> Download JPG</button>
            <button onClick={savePdf} disabled={!resultUrl||busy} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><Download size={15}/> Export PDF</button>
          </div>
        </section>
        {resultUrl&&<section className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3"><div className="mb-2 text-xs font-bold text-emerald-200"><CheckCircle2 size={13} className="mr-1 inline"/> Crop Result</div><img src={resultUrl} alt="Cropped result" className="max-h-48 w-full rounded-lg bg-white object-contain"/><button onClick={()=>{setZoom(100);setZoomOpen(true);}} className="mt-2 w-full rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100"><Eye size={13} className="mr-1 inline"/> View Full Image</button></section>}
        {error&&<div role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}
      </aside>}
    </div>
    {zoomOpen&&resultUrl&&<div className="fixed inset-0 z-[80] flex flex-col bg-[#020914]/95 p-3 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-bold text-white">Full Image Preview <span className="ml-2 text-xs text-cyan-200">{zoom}%</span></div><div className="flex items-center gap-2"><button onClick={()=>setZoom(v=>Math.max(25,v-25))} className="rounded-lg border border-white/20 p-2 text-white" title="Zoom out"><ZoomOut size={17}/></button><input aria-label="Zoom level" type="range" min="25" max="300" step="5" value={zoom} onChange={e=>setZoom(+e.target.value)} className="w-28 accent-cyan-400 sm:w-44"/><button onClick={()=>setZoom(v=>Math.min(300,v+25))} className="rounded-lg border border-white/20 p-2 text-white" title="Zoom in"><ZoomIn size={17}/></button><button onClick={()=>setZoom(100)} className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white">100%</button><button onClick={()=>setZoomOpen(false)} className="rounded-lg bg-white/10 p-2 text-white"><X size={18}/></button></div></div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-black/40 p-4"><img src={resultUrl} alt="Full size cropped document" style={{width:zoom+'%',maxWidth:'none',height:'auto'}} className="h-auto shrink-0 object-contain"/></div>
    </div>}
  </div>;
};
