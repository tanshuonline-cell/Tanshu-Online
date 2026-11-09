import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, Check, Crop, Download, ImagePlus, Laptop,
  Monitor, Printer, RotateCcw, Signature, Smartphone, SlidersHorizontal,
  Upload, WandSparkles
} from 'lucide-react';

type DeviceMode = 'mobile' | 'desktop';
type Step = 'photo' | 'signature' | 'print';
type PhotoSize = 'passport' | 'stamp' | 'pan' | 'custom';

const PHOTO_SIZES: Record<PhotoSize, { label: string; width: number; height: number }> = {
  passport: { label: 'Passport / Exam · 35 × 45 mm', width: 35, height: 45 },
  stamp: { label: 'Stamp Photo · 25 × 30 mm', width: 25, height: 30 },
  pan: { label: 'PAN Photo · 25 × 35 mm', width: 25, height: 35 },
  custom: { label: 'Custom · 35 × 45 mm demo', width: 35, height: 45 }
};

const panelClass = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm';
const labelClass = 'mb-1.5 block text-xs font-bold text-slate-600';
const controlClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export const PhotoSignatureStudioDemo: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [device, setDevice] = useState<DeviceMode | null>(null);
  const [step, setStep] = useState<Step>('photo');
  const [photoUrl, setPhotoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [photoSize, setPhotoSize] = useState<PhotoSize>('passport');
  const [photoBg, setPhotoBg] = useState('#ffffff');
  const [signatureBg, setSignatureBg] = useState<'transparent' | 'white' | 'blue'>('transparent');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(42);
  const photoInput = useRef<HTMLInputElement>(null);
  const signatureInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    if (signatureUrl) URL.revokeObjectURL(signatureUrl);
  }, [photoUrl, signatureUrl]);

  const size = PHOTO_SIZES[photoSize];
  
  const acceptFile = (file: File | undefined, slot: 'photo' | 'signature') => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    if (slot === 'photo') {
      setPhotoUrl(url);
      setPhotoName(file.name);
    } else {
      setSignatureUrl(url);
      setSignatureName(file.name);
    }
  };

  const resetPhoto = () => {
    setBrightness(100); setContrast(100); setZoom(100); setCropX(50); setCropY(42);
    setPhotoBg('#ffffff'); setPhotoSize('passport');
  };

  const photoFilter = `brightness(${brightness}%) contrast(${contrast}%)`;
  const a4PhotoWidth = size.width / 210 * 100;
    const readyCount = Number(Boolean(photoUrl)) + Number(Boolean(signatureUrl));

  const UploadCard = ({ slot }: { slot: 'photo' | 'signature' }) => {
    const isPhoto = slot === 'photo';
    const currentUrl = isPhoto ? photoUrl : signatureUrl;
    const currentName = isPhoto ? photoName : signatureName;
    const inputRef = isPhoto ? photoInput : signatureInput;
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => acceptFile(e.target.files?.[0], slot)} />
        {currentUrl ? (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
              <img src={currentUrl} alt={isPhoto ? 'Uploaded photo' : 'Uploaded signature'} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">{currentName}</p>
              <p className="mt-1 text-[11px] text-emerald-700">फाइल चुनी गई</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="mt-1 text-xs font-bold text-blue-700">दूसरी फाइल चुनें</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-lg text-center text-sm font-bold text-slate-700 hover:bg-blue-50">
            <span className="rounded-full bg-blue-100 p-2 text-blue-700">{isPhoto ? <Camera size={19} /> : <PenLine size={19} />}</span>
            {isPhoto ? 'फोटो चुनें या कैमरा से लें' : 'सिग्नेचर की फोटो चुनें'}
            <span className="text-[11px] font-medium text-slate-500">JPG · PNG · WEBP</span>
          </button>
        )}
      </div>
    );
  };

  const PhotoControls = () => (
    <div className={panelClass}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-black text-slate-900"><Camera size={17} className="text-blue-600" /> फोटो सेटअप</h3>
        <button type="button" onClick={resetPhoto} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><RotateCcw size={13} /> Reset</button>
      </div>
      <UploadCard slot="photo" />
      <div className="mt-4">
        <label className={labelClass}>पासपोर्ट / फॉर्म फोटो का साइज</label>
        <select className={controlClass} value={photoSize} onChange={e => setPhotoSize(e.target.value as PhotoSize)}>
          {Object.entries(PHOTO_SIZES).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
        <p className="mt-1 text-[11px] text-slate-500">चुना हुआ फ्रेम: {size.width} × {size.height} mm · 300 DPI target</p>
      </div>
      <div className="mt-4">
        <label className={labelClass}>बैकग्राउंड रंग</label>
        <div className="flex flex-wrap gap-2">
          {[['#ffffff','White'],['#dbeafe','Light Blue'],['#e5e7eb','Grey'],['#d1fae5','Light Green']].map(([color,name]) => (
            <button type="button" key={color} onClick={() => setPhotoBg(color)} aria-pressed={photoBg === color} className={`rounded-lg border px-3 py-2 text-xs font-bold ${photoBg === color ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}><span className="mr-1.5 inline-block h-3 w-3 rounded-full border border-slate-300 align-middle" style={{background:color}} />{name}</button>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-amber-700">डेमो: बैकग्राउंड विकल्प दिखाए गए हैं; असली AI कटआउट/बैकग्राउंड बदलना अगले निर्माण चरण में जोड़ा जाएगा।</p>
      </div>
      <div className="mt-4 space-y-3">
        <div><label className={labelClass}>क्रॉप / Zoom · {zoom}%</label><input aria-label="Photo zoom" type="range" min="80" max="180" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-blue-600" /></div>
        <div><label className={labelClass}>फ्रेम में Horizontal स्थिति · {cropX}%</label><input aria-label="Horizontal crop position" type="range" min="0" max="100" value={cropX} onChange={e => setCropX(Number(e.target.value))} className="w-full accent-blue-600" /></div>
        <div><label className={labelClass}>फ्रेम में Vertical स्थिति · {cropY}%</label><input aria-label="Vertical crop position" type="range" min="0" max="100" value={cropY} onChange={e => setCropY(Number(e.target.value))} className="w-full accent-blue-600" /></div>
        <div><label className={labelClass}>Brightness · {brightness}%</label><input aria-label="Brightness" type="range" min="60" max="150" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-blue-600" /></div>
        <div><label className={labelClass}>Color / Contrast · {contrast}%</label><input aria-label="Contrast" type="range" min="60" max="150" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-blue-600" /></div>
      </div>
    </div>
  );

  const SignatureControls = () => (
    <div className={panelClass}>
      <h3 className="mb-3 flex items-center gap-2 font-black text-slate-900"><PenLine size={17} className="text-violet-600" /> सिग्नेचर सेटअप</h3>
      <UploadCard slot="signature" />
      <div className="mt-4">
        <label className={labelClass}>सिग्नेचर बैकग्राउंड</label>
        <div className="grid grid-cols-3 gap-2">
          {(['transparent','white','blue'] as const).map(value => <button type="button" key={value} onClick={() => setSignatureBg(value)} className={`rounded-lg border px-2 py-2 text-xs font-bold ${signatureBg === value ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-600'}`}>{value === 'transparent' ? 'Transparent' : value === 'white' ? 'White' : 'Blue'}</button>)}
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-violet-50 p-3 text-xs leading-relaxed text-violet-900">
        फोटो और सिग्नेचर की सेटिंग अलग-अलग रहेगी। सिग्नेचर को फोटो के ऊपर नहीं, A4 शीट में अपने अलग निर्धारित स्थान पर रखा जाएगा।
      </div>
    </div>
  );

  const SheetPreview = () => (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div><h3 className="font-black text-slate-900">A4 Print Sheet Preview</h3><p className="text-[11px] text-slate-500">210 × 297 mm · Portrait · 300 DPI target</p></div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800">{readyCount}/2 assets</span>
      </div>
      <div className="mx-auto aspect-[210/297] w-full max-w-[330px] border border-slate-300 bg-white p-[5%] shadow-lg">
        <div className="flex h-full flex-col">
          <div className="mb-[5%] text-center text-[clamp(6px,1.6vw,10px)] font-bold tracking-wide text-slate-500">TANSHU ONLINE · PHOTO & SIGNATURE DEMO</div>
          <div className="flex flex-1 items-start justify-center gap-[8%]">
            <div className="flex flex-col items-center">
              <div className="overflow-hidden border border-slate-400" style={{width:` ${Math.max(12, Math.min(30, a4PhotoWidth))}%`, aspectRatio:`${size.width}/${size.height}`, background:photoBg}}>
                {photoUrl && <img src={photoUrl} alt="Passport photo preview" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${cropX}% ${cropY}%`,transform:`scale(${zoom/100})`,filter:photoFilter}} />}
              </div>
              <span className="mt-1 text-[clamp(6px,1.4vw,9px)] text-slate-500">PHOTO</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-24 max-w-full items-center justify-center overflow-hidden border border-dashed border-slate-300" style={{background:signatureBg==='blue'?'#dbeafe':signatureBg==='white'?'white':'transparent'}}>
                {signatureUrl && <img src={signatureUrl} alt="Signature preview" className="h-full w-full object-contain" />}
              </div>
              <span className="mt-1 text-[clamp(6px,1.4vw,9px)] text-slate-500">SIGNATURE</span>
            </div>
          </div>
          <div className="mt-auto border-t border-dashed border-slate-200 pt-2 text-center text-[clamp(6px,1.2vw,8px)] text-slate-400">Print layout preview · Confirm the official application requirements before printing</div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-500">यह शुरुआती layout demo है। Final sheet में multiple copies, exact margins और print calibration बाद में तय होंगे।</p>
    </div>
  );

  const DeviceChoice = () => (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
      <button type="button" onClick={() => {setDevice('mobile');setStep('photo');}} className="group rounded-3xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Smartphone size={34}/></div>
        <span className="text-xs font-black uppercase tracking-widest text-blue-700">Touch-friendly</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900">मोबाइल Demo</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">एक-एक स्टेप में फोटो, सिग्नेचर और A4 प्रिंट शीट तैयार करने का सरल workflow।</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">मोबाइल खोलें <ArrowRight size={16}/></span>
      </button>
      <button type="button" onClick={() => {setDevice('desktop');setStep('photo');}} className="group rounded-3xl border-2 border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-xl">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><Laptop size={34}/></div>
        <span className="text-xs font-black uppercase tracking-widest text-violet-700">Wide workspace</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900">Laptop / PC Demo</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">बाईं ओर Photo tools, बीच में A4 sheet और दाईं ओर Signature tools — PVC Studio की तरह।</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white">कंप्यूटर खोलें <ArrowRight size={16}/></span>
      </button>
    </div>
  );

  const stepItems: {id:Step;label:string}[] = [{id:'photo',label:'Photo'},{id:'signature',label:'Signature'},{id:'print',label:'Print Sheet'}];
  const goStep = (next:Step) => setStep(next);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #photo-signature-print-sheet, #photo-signature-print-sheet * { visibility: visible !important; }
          #photo-signature-print-sheet { position: absolute; inset: 0; width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; background: white !important; box-shadow: none !important; }
        }
      `}</style>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3">
          <button type="button" onClick={device ? () => setDevice(null) : onBack} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"><ArrowLeft size={16}/> {device ? 'Device चुनें' : 'Home'}</button>
          <div className="min-w-0"><p className="truncate text-sm font-black tracking-wide">TANSHU <span className="text-blue-700">ONLINE</span></p><p className="text-[10px] font-semibold text-slate-500">PHOTO & SIGNATURE STUDIO · DEMO</p></div>
          {device && <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">{device === 'mobile' ? 'MOBILE WORKFLOW' : 'LAPTOP / PC WORKSPACE'}</span>}
        </div>
      </header>

      {!device ? (
        <section className="px-4 py-12 sm:py-20">
          <div className="mx-auto mb-9 max-w-3xl text-center">
            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-800">New feature concept</span>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Photo & Signature Studio</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">एक क्लिक में फोटो को पासपोर्ट / फॉर्म साइज में तैयार करें, सिग्नेचर सेट करें और A4 print sheet का preview देखें। पहले अपना डिवाइस चुनें।</p>
          </div>
          <DeviceChoice/>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-500">यह केवल अलग Demo route है। Home Page की मौजूदा categories, links और बाकी tools को इस prototype में नहीं बदला गया है।</p>
        </section>
      ) : device === 'mobile' ? (
        <section className="mx-auto max-w-xl px-3 pb-28 pt-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {stepItems.map((item,index) => <button key={item.id} type="button" onClick={() => goStep(item.id)} className={`rounded-xl px-2 py-3 text-center text-xs font-black ${step===item.id?'bg-blue-700 text-white shadow':'border border-slate-200 bg-white text-slate-600'}`}><span className="block text-[10px] opacity-70">STEP 0{index+1}</span>{item.label}</button>)}
          </div>
          {step === 'photo' && <><PhotoControls/><button type="button" onClick={() => setStep('signature')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white">Photo के बाद Signature <ArrowRight size={17}/></button></>}
          {step === 'signature' && <><SignatureControls/><button type="button" onClick={() => setStep('print')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white">A4 Print Preview <ArrowRight size={17}/></button></>}
          {step === 'print' && <><SheetPreview/><button type="button" onClick={() => window.print()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-sm font-black text-white"><Printer size={17}/> Print Sheet</button></>}
          <div className="mt-4"><button type="button" onClick={() => setStep(step==='print'?'signature':'photo')} className="text-xs font-bold text-slate-500">← पिछला स्टेप</button></div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1600px] px-4 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-black">Photo & Signature Workspace</h1><p className="text-xs text-slate-500">Photo tools · A4 sheet preview · Signature tools</p></div>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white"><Printer size={16}/> Print Preview</button>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(260px,1fr)_minmax(360px,1.2fr)_minmax(260px,1fr)]">
            <PhotoControls/>
            <div id="photo-signature-print-sheet"><SheetPreview/></div>
            <SignatureControls/>
          </div>
        </section>
      )}

      {device === 'mobile' && <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500">{readyCount}/2 files ready</span>
          <button type="button" onClick={() => setStep(step==='photo'?'signature':step==='signature'?'print':'photo')} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white">{step==='photo'?'Next: Signature':step==='signature'?'Next: Print':'Edit Photo'}</button>
        </div>
      </div>}
    </main>
  );
};
