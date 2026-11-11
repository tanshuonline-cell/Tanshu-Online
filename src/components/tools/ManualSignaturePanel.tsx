import React, { useRef, useState } from 'react';
import { ImagePlus, Eraser, Check, Loader2 } from 'lucide-react';
import { removeBackgroundAI } from './backgroundRemovalAI';

type Props = { onPlace: (asset: { name: string; src: string }) => void };

export const ManualSignaturePanel: React.FC<Props> = ({ onPlace }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [cutout, setCutout] = useState('');
  const [color, setColor] = useState('transparent');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Upload a signature image to begin.');

  const upload = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setName(file.name);
    setSource(url);
    setCutout('');
    setPreview(url);
    setColor('transparent');
    setMessage('Signature uploaded. Remove its background, then choose a background if needed.');
  };

  const removeBg = async () => {
    if (!source || busy) return;
    setBusy(true);
    setMessage('Cleaning the signature while preserving ink details…');
    try {
      const blob = await removeBackgroundAI(source, setMessage);
      const url = URL.createObjectURL(blob);
      setCutout(url);
      setPreview(url);
      setMessage('Background removed. Check that every stroke remains clear.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not remove the signature background.');
    } finally { setBusy(false); }
  };

  const applyColor = async () => {
    const base = cutout || source;
    if (!base) return;
    try {
      const img = new Image();
      img.src = base;
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Signature preview could not be loaded.')); });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (color !== 'transparent') { ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not prepare the signature image.');
      setPreview(URL.createObjectURL(blob));
      setMessage(color === 'transparent' ? 'Transparent signature preview ready.' : 'Selected color applied behind the signature.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not apply the background color.'); }
  };

  return <section className="border-b border-[#343b43] p-3 text-[#aeb8c2]">
    <div className="mb-2 flex items-center justify-between"><strong className="text-xs text-[#f0c895]">Signature Studio</strong><span className="text-[9px]">Manual only</span></div>
    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { upload(e.target.files?.[0]); e.currentTarget.value = ''; }}/>
    <button onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#8b765e] bg-[#252c33] px-3 py-2.5 text-[10px] text-white hover:bg-[#303943]"><ImagePlus size={14}/> Upload Signature</button>
    {preview && <div className="mt-2 flex min-h-[86px] items-center justify-center rounded-lg border border-[#46525f] p-2" style={{backgroundImage:'linear-gradient(45deg,#303943 25%,transparent 25%),linear-gradient(-45deg,#303943 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#303943 75%),linear-gradient(-45deg,transparent 75%,#303943 75%)',backgroundSize:'12px 12px',backgroundPosition:'0 0,0 6px,6px -6px,-6px 0'}}><img src={preview} alt="Signature preview" className="max-h-20 max-w-full object-contain"/></div>}
    {name && <p className="mt-1 truncate text-[9px]">{name}</p>}
    <button onClick={() => void removeBg()} disabled={!source || busy} className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-[#536c5c] py-2 text-[10px] text-[#c7e5d0] disabled:opacity-40"><Eraser size={12}/>{busy ? 'Removing background…' : 'Remove Background'}</button>
    <div className="mt-3 text-[9px]">Signature background</div>
    <div className="mt-1 grid grid-cols-4 gap-1.5">
      {['transparent','#ffffff','#1769c2','#8ecbff','#e53935','#16834a','#111827','#f4e7c5'].map((value,i)=><button key={value} title={['Transparent','White','Blue','Light Blue','Red','Green','Black','Cream'][i]} onClick={()=>setColor(value)} className={'h-7 rounded border '+(color===value?'border-[#e8bd88] ring-1 ring-[#e8bd88]':'border-[#53606c]')} style={value==='transparent'?{backgroundImage:'linear-gradient(45deg,#7b8792 25%,transparent 25%),linear-gradient(-45deg,#7b8792 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#7b8792 75%),linear-gradient(-45deg,transparent 75%,#7b8792 75%)',backgroundSize:'8px 8px'}:{background:value}}/>)}
    </div>
    <label className="mt-2 flex items-center justify-between rounded border border-[#46525f] px-2 py-1.5 text-[9px]">Custom color <input type="color" value={color==='transparent'?'#ffffff':color} onChange={e=>setColor(e.target.value)} className="h-6 w-9 bg-transparent"/></label>
    <button onClick={()=>void applyColor()} disabled={!source} className="mt-2 w-full rounded border border-[#53606c] py-2 text-[10px] disabled:opacity-40">Apply Background Preview</button>
    <button onClick={()=>{if(preview)onPlace({name:name.replace(/\.[^.]+$/,'')+'-signature.png',src:preview});}} disabled={!preview} className="mt-2 flex w-full items-center justify-center gap-1 rounded bg-[#d5a66e] py-2 text-[10px] font-semibold text-[#171b20] disabled:opacity-40"><Check size={13}/> Place on Photo / A4</button>
    <p className="mt-2 text-[9px] leading-4 text-[#8996a2]">{message}</p>
    <p className="mt-1 text-[9px] leading-4 text-[#8996a2]">Tip: use Remove Background first for a clean transparent signature. Check thin strokes before placing.</p>
  </section>;
};
