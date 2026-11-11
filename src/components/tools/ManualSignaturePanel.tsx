import React, { useRef, useState } from 'react';
import { ImagePlus, Eraser, Check, Crop } from 'lucide-react';

type Props = { onPlace: (asset: { name: string; src: string }) => void };
const loadImage = (src:string) => new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Signature image could not be loaded.'));image.src=src;});

export const ManualSignaturePanel: React.FC<Props> = ({ onPlace }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name,setName]=useState('');
  const [source,setSource]=useState('');
  const [cutout,setCutout]=useState('');
  const [preview,setPreview]=useState('');
  const [color,setColor]=useState('transparent');
  const [cropZoom,setCropZoom]=useState(100);
  const [cropX,setCropX]=useState(50);
  const [cropY,setCropY]=useState(50);
  const [cleanThreshold,setCleanThreshold]=useState(230);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('Upload a signature image to begin.');

  const upload=(file?:File)=>{
    if(!file||!file.type.startsWith('image/'))return;
    const url=URL.createObjectURL(file);
    setName(file.name);setSource(url);setCutout('');setPreview(url);setColor('transparent');
    setCropZoom(100);setCropX(50);setCropY(50);
    setMessage('Signature uploaded. Adjust crop, then clean the background.');
  };

  const makeCrop=(image:HTMLImageElement)=>{
    const scale=Math.max(1,cropZoom)/100;
    const cropWidth=Math.max(1,Math.round(image.naturalWidth/scale));
    const cropHeight=Math.max(1,Math.round(image.naturalHeight/scale));
    const centerX=image.naturalWidth*cropX/100,centerY=image.naturalHeight*cropY/100;
    const left=Math.max(0,Math.min(image.naturalWidth-cropWidth,centerX-cropWidth/2));
    const top=Math.max(0,Math.min(image.naturalHeight-cropHeight,centerY-cropHeight/2));
    const canvas=document.createElement('canvas');canvas.width=cropWidth;canvas.height=cropHeight;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');
    ctx.drawImage(image,left,top,cropWidth,cropHeight,0,0,cropWidth,cropHeight);
    return canvas;
  };

  const applyCrop=async()=>{
    if(!source||busy)return;
    setBusy(true);
    try{
      const image=await loadImage(source);const canvas=makeCrop(image);
      const data=canvas.toDataURL('image/png');
      setSource(data);setPreview(data);setCutout('');
      setCropZoom(100);setCropX(50);setCropY(50);
      setMessage('Signature crop applied. Now clean the background.');
    }catch(error){setMessage(error instanceof Error?error.message:'Signature crop failed.');}
    finally{setBusy(false);}
  };

  const cleanSignature=async()=>{
    if(!source||busy)return;
    setBusy(true);setMessage('Cleaning background while preserving signature ink…');
    try{
      const image=await loadImage(source);const canvas=makeCrop(image);
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
      let left=canvas.width,top=canvas.height,right=0,bottom=0,found=false;
      for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
        const i=(y*canvas.width+x)*4;
        const luminance=.299*data[i]+.587*data[i+1]+.114*data[i+2];
        const alpha=luminance>=cleanThreshold?0:Math.round((cleanThreshold-luminance)/Math.max(1,cleanThreshold-80)*255);
        data[i+3]=Math.min(data[i+3],alpha);
        if(data[i+3]>8){found=true;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
      }
      if(!found)throw new Error('No clear dark/blue signature strokes found. Lower the cleanup threshold or upload a clearer signature.');
      ctx.putImageData(pixels,0,0);
      const width=right-left+1,height=bottom-top+1;
      const trimmed=document.createElement('canvas');trimmed.width=width;trimmed.height=height;
      const trimmedCtx=trimmed.getContext('2d');if(!trimmedCtx)throw new Error('Canvas is unavailable.');
      trimmedCtx.drawImage(canvas,left,top,width,height,0,0,width,height);
      const dataUrl=trimmed.toDataURL('image/png');
      setCutout(dataUrl);setPreview(dataUrl);
      setMessage('Background removed and signature tightly trimmed. Check every thin stroke before placing.');
    }catch(error){setMessage(error instanceof Error?error.message:'Signature cleanup failed.');}
    finally{setBusy(false);}
  };

  const applyColor=async()=>{
    if(!cutout)return;
    try{
      const image=await loadImage(cutout);const canvas=document.createElement('canvas');
      canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas is unavailable.');
      if(color!=='transparent'){ctx.fillStyle=color;ctx.fillRect(0,0,canvas.width,canvas.height);}
      ctx.drawImage(image,0,0);
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!blob)throw new Error('Could not prepare the signature preview.');
      setPreview(URL.createObjectURL(blob));
      setMessage(color==='transparent'?'Transparent signature is ready.':'Selected color applied behind the cleaned signature.');
    }catch(error){setMessage(error instanceof Error?error.message:'Could not apply signature background.');}
  };

  return <section className="border-b border-[#343b43] p-3 text-[#aeb8c2]">
    <div className="mb-2 flex items-center justify-between"><strong className="text-xs text-[#f0c895]">Signature Studio</strong><span className="text-[9px]">Manual only</span></div>
    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e=>{upload(e.target.files?.[0]);e.currentTarget.value='';}}/>
    <button onClick={()=>inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#8b765e] bg-[#252c33] px-3 py-2.5 text-[10px] text-white hover:bg-[#303943]"><ImagePlus size={14}/> Upload Signature</button>
    {preview&&<div className="mt-2 flex min-h-[86px] items-center justify-center rounded-lg border border-[#46525f] p-2" style={{backgroundImage:'linear-gradient(45deg,#303943 25%,transparent 25%),linear-gradient(-45deg,#303943 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#303943 75%),linear-gradient(-45deg,transparent 75%,#303943 75%)',backgroundSize:'12px 12px',backgroundPosition:'0 0,0 6px,6px -6px,-6px 0'}}><img src={preview} alt="Signature preview — drag onto the cropped photo" draggable onDragStart={event=>{event.dataTransfer.effectAllowed='copy';event.dataTransfer.setData('application/x-tanshu-signature-src',preview);event.dataTransfer.setData('text/plain',preview);}} className="max-h-20 max-w-full cursor-grab object-contain active:cursor-grabbing"/></div>}
    {name&&<p className="mt-1 truncate text-[9px]">{name}</p>}
    {source&&<>
      <div className="mt-3 rounded border border-[#46525f] p-2">
        <div className="mb-2 flex items-center gap-1 text-[10px] text-white"><Crop size={12}/> Signature Crop</div>
        <label className="block text-[9px]">Crop zoom · {cropZoom}%<input type="range" min="100" max="300" step="5" value={cropZoom} onChange={e=>setCropZoom(Number(e.target.value))} className="mt-1 w-full"/></label>
        <label className="mt-2 block text-[9px]">Horizontal · {cropX}%<input type="range" min="0" max="100" value={cropX} onChange={e=>setCropX(Number(e.target.value))} className="mt-1 w-full"/></label>
        <label className="mt-2 block text-[9px]">Vertical · {cropY}%<input type="range" min="0" max="100" value={cropY} onChange={e=>setCropY(Number(e.target.value))} className="mt-1 w-full"/></label>
        <button disabled={busy} onClick={()=>void applyCrop()} className="mt-2 w-full rounded border border-[#53606c] py-2 text-[10px] disabled:opacity-40">Apply Signature Crop</button>
      </div>
      <button disabled={busy} onClick={()=>void cleanSignature()} className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-[#536c5c] py-2 text-[10px] text-[#c7e5d0] disabled:opacity-40"><Eraser size={12}/>{busy?'Cleaning…':'Remove Background · Protect Ink'}</button>
      {cutout&&<>
        <div className="mt-3 text-[9px]">Ink / background threshold · {cleanThreshold}</div>
        <input type="range" min="150" max="250" step="1" value={cleanThreshold} onChange={e=>setCleanThreshold(Number(e.target.value))} className="mt-1 w-full"/>
        <p className="mt-1 text-[9px] leading-4 text-[#8996a2]">अगर हल्की या पतली स्याही कम दिखे, threshold थोड़ा बढ़ाएँ; बैकग्राउंड बचा हो तो थोड़ा घटाएँ और फिर Remove Background दबाएँ।</p>
        <div className="mt-3 text-[9px]">Signature background</div>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {['transparent','#ffffff','#1769c2','#8ecbff','#e53935','#16834a','#111827','#f4e7c5'].map((value,i)=><button key={value} title={['Transparent','White','Blue','Light Blue','Red','Green','Black','Cream'][i]} onClick={()=>setColor(value)} className={'h-7 rounded border '+(color===value?'border-[#e8bd88] ring-1 ring-[#e8bd88]':'border-[#53606c]')} style={value==='transparent'?{backgroundImage:'linear-gradient(45deg,#7b8792 25%,transparent 25%),linear-gradient(-45deg,#7b8792 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#7b8792 75%),linear-gradient(-45deg,transparent 75%,#7b8792 75%)',backgroundSize:'8px 8px'}:{background:value}}/>)}
        </div>
        <label className="mt-2 flex items-center justify-between rounded border border-[#46525f] px-2 py-1.5 text-[9px]">Custom color <input type="color" value={color==='transparent'?'#ffffff':color} onChange={e=>setColor(e.target.value)} className="h-6 w-9 bg-transparent"/></label>
        <button onClick={()=>void applyColor()} className="mt-2 w-full rounded border border-[#53606c] py-2 text-[10px]">Apply Background Preview</button>
      </>}
      <button onClick={()=>{if(cutout&&preview)onPlace({name:name.replace(/\.[^.]+$/,'')+'-signature.png',src:preview});}} disabled={!cutout||busy} className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-[#d5a66e] py-2 text-[10px] font-semibold text-[#171b20] disabled:opacity-40"><Check size={13}/> Send to Crop Preview</button>
    </>}
    <p className="mt-2 text-[9px] leading-4 text-[#8996a2]">{message}</p>
    <p className="mt-1 text-[9px] leading-4 text-[#8996a2]">Cleaned transparent PNG is placed as its own layer. The selection border and corner handles are editing guides only; they are not included in the saved image.</p>
  </section>;
};
