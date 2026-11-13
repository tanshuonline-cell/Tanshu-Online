import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Upload, Download, Crop, RotateCcw, Maximize2, SlidersHorizontal, Image as ImageIcon, CheckCircle2, Move } from 'lucide-react';

type Point = { x: number; y: number };
type Quad = [Point, Point, Point, Point];

export const AutoDocumentCropperTool: React.FC = () => {
  const [imageUrl,setImageUrl]=useState<string|null>(null);
  const [imageSize,setImageSize]=useState({width:0,height:0});
  const [corners,setCorners]=useState<Quad|null>(null);
  const [dragging,setDragging]=useState<number|null>(null);
  const [brightness,setBrightness]=useState(0);
  const [contrast,setContrast]=useState(12);
  const [resultUrl,setResultUrl]=useState<string|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const imageRef=useRef<HTMLImageElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);

  const upload=(file?:File)=>{
    if(!file)return;
    if(!file.type.startsWith('image/')){setError('कृपया JPG, PNG या WEBP फोटो चुनें।');return;}
    const url=URL.createObjectURL(file);
    setImageUrl(old=>{if(old)URL.revokeObjectURL(old);return url;});
    setResultUrl(null);setError('');
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
    setResultUrl(null);
  };
  const reset=()=>{
    const x=imageSize.width*.07,y=imageSize.height*.07;
    setCorners([{x,y},{x:imageSize.width-x,y},{x:imageSize.width-x,y:imageSize.height-y},{x,y:imageSize.height-y}]);
    setResultUrl(null);
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
        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
        ctx.filter='brightness('+(100+brightness)+'%) contrast('+(100+contrast)+'%)';
        const dst: Point[]=[{x:0,y:0},{x:canvas.width,y:0},{x:canvas.width,y:canvas.height},{x:0,y:canvas.height}];
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
        canvas.toBlob(blob=>{
          if(!blob){setError('फोटो तैयार नहीं हो पाया।');setBusy(false);return;}
          setResultUrl(old=>{if(old)URL.revokeObjectURL(old);return URL.createObjectURL(blob);});setBusy(false);
        },'image/jpeg',.96);
      }catch(e){setError(e instanceof Error?e.message:'Crop failed');setBusy(false);}
    },20);
  };
  const saveJpeg=()=>{if(!resultUrl)return;const a=document.createElement('a');a.href=resultUrl;a.download='tanshu-cropped-document.jpg';a.click();};
  const savePdf=()=>{
    if(!resultUrl)return;const img=new Image();img.onload=()=>{
      const landscape=img.width>img.height;const pw=landscape?297:210,ph=landscape?210:297;
      const pdf=new jsPDF({orientation:landscape?'landscape':'portrait',unit:'mm',format:'a4'});
      const ratio=Math.min(pw/img.width,ph/img.height),w=img.width*ratio,h=img.height*ratio;
      pdf.addImage(resultUrl,'JPEG',(pw-w)/2,(ph-h)/2,w,h);pdf.save('tanshu-cropped-document.pdf');
    };img.src=resultUrl;
  };
  const size=Math.max(imageSize.width,imageSize.height);
  const radius=size*.018;

  return <div className="flex h-full min-h-0 flex-col bg-[#081629] text-slate-100">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#071426] to-[#123B5A] px-4 py-3 sm:px-6">
      <div><div className="text-sm font-black tracking-wide text-white sm:text-base">TANSHU ONLINE <span className="text-cyan-300">AUTO DOCUMENT CROPPER</span></div><div className="mt-0.5 text-[11px] text-blue-100">4-corner crop workspace · Document framing · HD image export</div></div>
      <div className="flex items-center gap-2">
        <button onClick={()=>setExpanded(v=>!v)} className="rounded-lg border border-white/20 p-2 text-blue-100 hover:bg-white/10" title="Expand workspace"><Maximize2 size={16}/></button>
        <button onClick={()=>fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"><Upload size={15}/>{imageUrl?'Change Photo':'Add Photo'}</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>upload(e.target.files?.[0])}/>
      </div>
    </header>
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[230px_minmax(0,1fr)_230px] lg:overflow-hidden sm:p-4">
      <aside className="order-2 space-y-3 lg:order-1 lg:overflow-y-auto">
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><Crop size={15}/> Crop selection</div>
          <p className="mb-3 text-xs leading-5 text-blue-100">फोटो डालने के बाद चारों नीले गोल हैंडल पकड़कर दस्तावेज़ के चार कोनों पर रखें।</p>
          <button onClick={reset} disabled={!imageUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><RotateCcw size={14}/> Reset crop area</button>
          <div className="mt-3 rounded-lg bg-cyan-400/10 p-3 text-[11px] leading-5 text-cyan-100"><Move size={14} className="mr-1 inline"/> चारों कोने अलग-अलग खींचें। चुना हुआ हिस्सा क्रॉप होगा।</div>
        </section>
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200"><SlidersHorizontal size={15}/> Image tuning</div>
          <label className="mb-1 flex justify-between text-xs text-blue-100"><span>Brightness</span><b>{brightness}</b></label><input className="mb-4 w-full accent-cyan-400" type="range" min="-40" max="40" value={brightness} onChange={e=>{setBrightness(+e.target.value);setResultUrl(null);}}/>
          <label className="mb-1 flex justify-between text-xs text-blue-100"><span>Contrast / Ink clarity</span><b>{contrast}</b></label><input className="w-full accent-cyan-400" type="range" min="-50" max="80" value={contrast} onChange={e=>{setContrast(+e.target.value);setResultUrl(null);}}/>
        </section>
      </aside>
      <main className={'order-1 flex min-h-[380px] min-w-0 flex-col rounded-xl border border-white/10 bg-[#0c1d33] p-3 lg:order-2 lg:min-h-0 '+(expanded?'lg:col-span-2':'')}>
        <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs font-bold text-white"><ImageIcon size={15} className="text-cyan-300"/>{resultUrl?'Cropped document output':'Drag handles to crop'}</div><span className="text-[10px] text-blue-200">{imageUrl?imageSize.width+' × '+imageSize.height+' px':'No photo selected'}</span></div>
        <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto rounded-lg bg-[#06101f] p-3">
          {imageUrl?<div ref={stageRef} className="relative mx-auto w-full" style={{aspectRatio:imageSize.width+'/'+imageSize.height,maxWidth:'min(100%, 75vh)'}}>
            <img ref={imageRef} src={imageUrl} onLoad={imageLoaded} alt="Document crop source" draggable={false} className="absolute inset-0 h-full w-full select-none object-fill"/>
            {corners&&<svg className="absolute inset-0 h-full w-full touch-none" viewBox={'0 0 '+imageSize.width+' '+imageSize.height} preserveAspectRatio="none">
              <polygon points={corners.map(p=>p.x+','+p.y).join(' ')} fill="rgba(34,211,238,.12)" stroke="#22d3ee" strokeWidth={Math.max(2,size*.003)} strokeDasharray={Math.max(8,size*.012)+' '+Math.max(5,size*.008)}/>
              {corners.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r={radius} fill="#071426" stroke="#67e8f9" strokeWidth={Math.max(2,size*.005)}/><circle cx={p.x} cy={p.y} r={radius*.3} fill="white"/><circle cx={p.x} cy={p.y} r={radius*2.5} fill="transparent" style={{cursor:'grab',touchAction:'none'}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(i);}} onPointerMove={e=>{if(dragging===i)updateCorner(i,e);}} onPointerUp={()=>setDragging(null)} onPointerCancel={()=>setDragging(null)}/></g>)}
            </svg>}
          </div>:<button onClick={()=>fileRef.current?.click()} className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-cyan-400/40 bg-cyan-400/5 px-8 py-12 text-center hover:bg-cyan-400/10"><Upload size={32} className="mb-3 text-cyan-300"/><b className="text-sm text-white">Upload document photo</b><span className="mt-2 text-xs text-blue-200">JPG · PNG · WEBP</span></button>}
        </div>
        <div className="mt-3 text-[10px] text-blue-200">चारों हैंडल ड्रैग करें · Original photo सुरक्षित रहती है</div>
      </main>
      <aside className="order-3 space-y-3 lg:overflow-y-auto">
        <section className="rounded-xl border border-white/10 bg-[#10233d] p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-200">Apply & export</div>
          <button onClick={applyCrop} disabled={!imageUrl||!corners||busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-3 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"><Crop size={16}/>{busy?'Cropping…':'Apply Crop'}</button>
          <p className="mt-2 text-[10px] leading-4 text-blue-200">Crop output original image pixel dimensions से तैयार होगा।</p>
          <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
            <button onClick={saveJpeg} disabled={!resultUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><Download size={15}/> Save High-Res JPEG</button>
            <button onClick={savePdf} disabled={!resultUrl} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold hover:bg-white/10 disabled:opacity-40"><Download size={15}/> Export A4 PDF</button>
          </div>
        </section>
        {resultUrl&&<section className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3"><div className="mb-2 text-xs font-bold text-emerald-200"><CheckCircle2 size={13} className="mr-1 inline"/> Cropped result</div><img src={resultUrl} alt="Cropped result" className="max-h-64 w-full rounded-lg bg-white object-contain"/></section>}
        {error&&<div role="alert" className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}
      </aside>
    </div>
  </div>;
};
