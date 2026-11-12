import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Camera, Check, Crop, Download, FileImage, FlipHorizontal,
  ImagePlus, Info, Layers3, Maximize2, RotateCcw, RotateCw, ScanFace,
  ShieldCheck, SlidersHorizontal, Sparkles, UploadCloud, WandSparkles,
  X, ZoomIn, ZoomOut
} from 'lucide-react';

type StudioTool = 'crop' | 'face' | 'straighten' | 'background' | 'print';

const WORKFLOW_STEPS = [
  { label: 'Upload Selfie', detail: 'Choose a customer photo', icon: Camera },
  { label: 'Crop & Face', detail: 'Frame the face correctly', icon: ScanFace },
  { label: 'Straighten', detail: 'Correct photo alignment', icon: RotateCw },
  { label: 'Background', detail: 'Prepare a clean backdrop', icon: Sparkles },
  { label: 'Print & Export', detail: 'Prepare final photo output', icon: Download },
];

const TOOL_ITEMS: { id: StudioTool; label: string; short: string; icon: typeof Crop }[] = [
  { id: 'crop', label: 'Crop & Position', short: 'CROP', icon: Crop },
  { id: 'face', label: 'Face Alignment', short: 'FACE', icon: ScanFace },
  { id: 'straighten', label: 'Straighten', short: 'ALIGN', icon: SlidersHorizontal },
  { id: 'background', label: 'Background', short: 'BG', icon: WandSparkles },
  { id: 'print', label: 'Photo Size & Print', short: 'PRINT', icon: FileImage },
];

const toolDescriptions: Record<StudioTool, { title: string; description: string }> = {
  crop: { title: 'Crop & Position', description: 'Set the photo frame and position the customer’s face accurately.' },
  face: { title: 'Face Alignment', description: 'The face guide will help keep the head straight and correctly placed.' },
  straighten: { title: 'Straighten & Rotate', description: 'Correct a tilted selfie before preparing the passport photo.' },
  background: { title: 'Background Studio', description: 'Prepare a clean, even background for the final photo.' },
  print: { title: 'Photo Size & Print', description: 'Choose a standard photo size and prepare print sheets.' },
};

export const WhatsAppSelfiePassportTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTool, setActiveTool] = useState<StudioTool>('crop');
  const [photoSize, setPhotoSize] = useState('35x45');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showGuides, setShowGuides] = useState(true);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setZoom(100);
    setRotation(0);
    setFlipped(false);
    event.target.value = '';
  };

  const resetPreview = () => {
    setZoom(100);
    setRotation(0);
    setFlipped(false);
  };

  return (
    <main className="min-h-screen bg-[#111518] text-[#E8EDF1]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#171C20]/95 backdrop-blur-xl">
        <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" aria-label="Back to TANSHU ONLINE" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#D6DEE5] transition hover:bg-white/10">
              <ArrowLeft size={17} />
            </a>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-lg shadow-emerald-950/40">
              <Camera size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[.22em] text-[#B9C3CC]">TANSHU ONLINE</p>
              <h1 className="text-sm font-extrabold tracking-wide text-white sm:text-base">WHATSAPP SELFIE PHOTO STUDIO</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 sm:inline-flex">
              <ShieldCheck size={13} /> Browser-side preview
            </span>
            <button type="button" onClick={resetPreview} disabled={!selectedFile} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#C8D1D9] transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">Reset</button>
            <button type="button" disabled={!selectedFile} title="Export will be enabled after photo processing is implemented" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1680px] px-3 py-4 sm:px-5 sm:py-6">
        <section className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#1B2927] via-[#1B2526] to-[#20262B] shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-200">
                <Sparkles size={12} /> Dedicated premium studio
              </div>
              <h2 className="text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">WhatsApp Selfie to Passport Photo</h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-[#B7C3C7] sm:text-sm">A guided workspace for turning customer selfies into clean, properly framed passport-style photographs.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
              {[['01','Upload'],['02','Adjust'],['03','Print']].map(([number,label]) => (
                <div key={number} className="rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-center">
                  <p className="text-lg font-black text-emerald-300">{number}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#D2DADF]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#343D44] bg-[#1A2025] shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#343D44] bg-[#20272D] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300"><Layers3 size={16}/></span>
              <div><p className="text-xs font-bold text-white">Studio Workspace</p><p className="text-[10px] text-[#8F9BA5]">Upload · Edit · Preview · Print</p></div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#9BA7B0]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>{selectedFile ? 'Photo loaded locally' : 'Waiting for photo'}<span className="mx-1 text-[#4D5962]">|</span>Step 1 of 5</div>
          </div>

          <div className="grid min-h-[690px] lg:grid-cols-[82px_minmax(0,1fr)_320px]">
            <nav aria-label="Studio tools" className="flex flex-row gap-1 overflow-x-auto border-b border-[#343D44] bg-[#171D22] p-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:p-3">
              {TOOL_ITEMS.map((tool) => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return (
                  <button key={tool.id} type="button" onClick={() => setActiveTool(tool.id)} title={tool.label} aria-pressed={active} className={active ? 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-2 py-3 text-emerald-300 ring-1 ring-emerald-400/25 lg:min-w-0 lg:flex-none' : 'group flex min-w-[66px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[#87939D] transition hover:bg-white/5 hover:text-white lg:min-w-0 lg:flex-none'}>
                    <Icon size={19}/><span className="text-[9px] font-bold leading-tight">{tool.short}</span>
                    {active && <span className="hidden h-1 w-4 rounded-full bg-emerald-400 lg:block"/>}
                  </button>
                );
              })}
              <div className="hidden flex-1 lg:block"/>
              <div className="hidden rounded-xl border border-white/5 bg-white/[.03] p-2 text-center lg:block"><ShieldCheck size={17} className="mx-auto text-emerald-400"/><p className="mt-1 text-[8px] font-semibold text-[#87939D]">LOCAL</p></div>
            </nav>

            <section className="flex min-w-0 flex-col bg-[#12171B]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#303941] px-4 py-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C9AA4]">Live photo canvas</p><p className="mt-0.5 text-xs font-semibold text-[#E3E8EC]">{selectedFile ? selectedFile.name : 'Your photo preview will appear here'}</p></div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setZoom(value => Math.max(50, value - 10))} disabled={!selectedFile} aria-label="Zoom out" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomOut size={14}/></button>
                  <span className="w-10 text-center text-[10px] font-bold tabular-nums text-[#C8D1D9]">{zoom}%</span>
                  <button type="button" onClick={() => setZoom(value => Math.min(180, value + 10))} disabled={!selectedFile} aria-label="Zoom in" className="rounded-lg border border-[#3A444C] p-2 text-[#AEB8C0] hover:bg-white/5 disabled:opacity-30"><ZoomIn size={14}/></button>
                  <button type="button" onClick={() => setShowGuides(value => !value)} disabled={!selectedFile} className={showGuides ? 'ml-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-semibold text-emerald-300 disabled:opacity-30' : 'ml-1 rounded-lg border border-[#3A444C] px-2.5 py-2 text-[10px] font-semibold text-[#AEB8C0] disabled:opacity-30'}>Guides</button>
                </div>
              </div>

              <div className="relative flex min-h-[440px] flex-1 items-center justify-center overflow-hidden p-5 sm:min-h-[540px] sm:p-8" style={{backgroundImage:'radial-gradient(#34414a 1px, transparent 1px)',backgroundSize:'18px 18px'}}>
                {!selectedFile ? (
                  <label className="group flex min-h-[390px] w-full max-w-[580px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#4B6260] bg-[#1A2527]/90 px-6 py-10 text-center transition hover:border-emerald-400 hover:bg-[#1D2B2B]">
                    <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-xl shadow-black/20 transition group-hover:scale-105"><UploadCloud size={35}/></span>
                    <span className="text-lg font-extrabold text-white sm:text-xl">Upload Customer Selfie</span>
                    <span className="mt-2 max-w-sm text-xs leading-6 text-[#9EADB4] sm:text-sm">Choose a photo received on WhatsApp and saved to this device. Your image preview stays in this browser.</span>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/50 transition group-hover:-translate-y-0.5"><ImagePlus size={16}/> Choose Photo</span>
                    <span className="mt-4 text-[10px] text-[#73828A]">JPG · PNG · WEBP · Image files</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/>
                  </label>
                ) : (
                  <div className="relative flex h-full min-h-[420px] w-full items-center justify-center">
                    <div className="relative flex max-h-[540px] max-w-[min(100%,420px)] items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-[#E7E8E6] p-2 shadow-2xl shadow-black/50" style={{aspectRatio:photoSize==='2x2'?'1 / 1':'7 / 9',height:'min(68vh, 520px)'}}>
                      <img src={previewUrl} alt="Customer selfie preview" draggable={false} className="h-full w-full select-none object-contain transition-transform duration-200" style={{transform:'rotate('+rotation+'deg) scale('+zoom/100+') scaleX('+(flipped ? -1 : 1)+')'}}/>
                      {showGuides && <div className="pointer-events-none absolute inset-[9%] rounded-md border border-dashed border-emerald-600/70"><div className="absolute left-1/2 top-0 h-full border-l border-dashed border-emerald-600/35"/><div className="absolute left-0 top-1/3 w-full border-t border-dashed border-emerald-600/35"/><div className="absolute left-0 top-2/3 w-full border-t border-dashed border-emerald-600/35"/></div>}
                      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[9px] font-bold tracking-wide text-white">PREVIEW ONLY</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#303941] bg-[#1A2025] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] text-[#8E9AA3]"><Info size={13}/>{selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2)+' MB · Local preview' : 'Upload a selfie to begin'}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setRotation(value => (value - 90 + 360) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCcw size={13}/> Rotate left</button>
                  <button type="button" onClick={() => setRotation(value => (value + 90) % 360)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><RotateCw size={13}/> Rotate right</button>
                  <button type="button" onClick={() => setFlipped(value => !value)} disabled={!selectedFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[#3A444C] px-3 py-2 text-[10px] font-semibold text-[#C1CAD1] hover:bg-white/5 disabled:opacity-30"><FlipHorizontal size={13}/> Flip</button>
                </div>
              </div>
            </section>

            <aside className="border-t border-[#343D44] bg-[#1B2126] lg:border-l lg:border-t-0">
              <div className="border-b border-[#343D44] px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Tool settings</p>
                <h3 className="mt-1 text-base font-extrabold text-white">{toolDescriptions[activeTool].title}</h3>
                <p className="mt-1 text-[10px] leading-5 text-[#94A1AA]">{toolDescriptions[activeTool].description}</p>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold tracking-wide text-[#D4DCE1]">PHOTO INPUT</span><span className={selectedFile ? 'rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300' : 'rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-[#87939D]'}>{selectedFile ? 'LOADED' : 'EMPTY'}</span></div>
                  {selectedFile ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#313B42]"><img src={previewUrl} alt="" className="h-full w-full object-cover"/></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">{selectedFile.name}</p><p className="mt-1 text-[9px] text-[#8F9CA5]">{(selectedFile.size / 1024).toFixed(0)} KB</p></div>
                      <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove uploaded selfie" className="rounded-lg p-2 text-[#A9B3BA] hover:bg-rose-500/10 hover:text-rose-300"><X size={15}/></button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#52615F] px-3 py-3 text-[10px] font-bold text-emerald-300 transition hover:bg-emerald-400/5"><ImagePlus size={14}/> Select customer selfie<input type="file" accept="image/*" className="sr-only" onChange={handleFileChange}/></label>
                  )}
                </div>

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <label className="mb-2 block text-[10px] font-bold tracking-wide text-[#D4DCE1]" htmlFor="passport-photo-size">PASSPORT PHOTO SIZE</label>
                  <select id="passport-photo-size" value={photoSize} onChange={event => setPhotoSize(event.target.value)} className="h-10 w-full rounded-lg border border-[#46535C] bg-[#171D22] px-3 text-xs font-semibold text-white outline-none focus:border-emerald-400">
                    <option value="35x45">India Passport · 35 × 45 mm</option>
                    <option value="2x2">Visa Photo · 2 × 2 inch</option>
                    <option value="35x35">Square Photo · 35 × 35 mm</option>
                  </select>
                  <p className="mt-2 text-[9px] leading-4 text-[#83919A]">Size selection currently updates the preview frame only. Exact crop/export is a later stage.</p>
                </div>

                {activeTool === 'crop' ? (
                  <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                    <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold text-[#D4DCE1]">PREVIEW ZOOM</span><span className="text-[10px] font-bold tabular-nums text-emerald-300">{zoom}%</span></div>
                    <input aria-label="Preview zoom" type="range" min="50" max="180" step="5" value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-emerald-400"/>
                    <div className="mt-2 flex justify-between text-[9px] text-[#829099]"><span>50%</span><span>100%</span><span>180%</span></div>
                    <button type="button" onClick={() => setShowGuides(value => !value)} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#46535C] px-3 py-2 text-[10px] font-semibold text-[#C3CDD3]"><span>Composition guides</span><span className={showGuides ? 'text-emerald-300' : 'text-[#7E8A93]'}>{showGuides ? 'ON' : 'OFF'}</span></button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-3">
                    <div className="flex items-center gap-2 text-amber-200"><Sparkles size={15}/><span className="text-[10px] font-extrabold uppercase tracking-wide">Next development stage</span></div>
                    <p className="mt-2 text-[10px] leading-5 text-[#B5BFC5]">This tool is visible in the studio layout. Its full editing controls will be connected after the core crop and preview workflow is completed.</p>
                  </div>
                )}

                <div className="rounded-xl border border-[#3A454D] bg-[#222A30] p-3">
                  <p className="mb-3 text-[10px] font-bold tracking-wide text-[#D4DCE1]">WORKFLOW</p>
                  <div className="space-y-3">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const active = index === 0;
                      return <div key={step.label} className="flex items-center gap-2.5">
                        <span className={active ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#303940] text-[#83919A]'}><Icon size={15}/></span>
                        <div className="min-w-0 flex-1"><p className={active ? 'text-[10px] font-bold text-emerald-300' : 'text-[10px] font-bold text-[#B4BEC5]'}>{step.label}</p><p className="text-[9px] text-[#7F8C95]">{step.detail}</p></div>
                        {active && <Check size={13} className="text-emerald-300"/>}
                      </div>;
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-sky-300/15 bg-sky-300/[.05] p-3">
                  <div className="flex items-center gap-2 text-sky-200"><ShieldCheck size={14}/><span className="text-[10px] font-bold">Privacy-first preview</span></div>
                  <p className="mt-1.5 text-[9px] leading-4 text-[#94A3AD]">The selected image is previewed locally in this browser. This screen does not upload it to a server.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#343D44] bg-[#1A2025] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-emerald-300">Studio workflow</p><h3 className="mt-1 text-sm font-extrabold text-white">Your photo preparation journey</h3></div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-[#A8B3BB]">5 guided stages</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {WORKFLOW_STEPS.map((step,index) => {
              const Icon = step.icon;
              const active = index === 0;
              return <div key={step.label} className={active ? 'flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/[.07] p-3' : 'flex items-center gap-3 rounded-xl border border-[#343D44] bg-[#20272D] p-3'}>
                <span className={active ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#303940] text-[#8B98A1]'}><Icon size={17}/></span>
                <div className="min-w-0"><p className={active ? 'text-[10px] font-extrabold text-emerald-300' : 'text-[10px] font-extrabold text-[#C4CDD3]'}>{step.label}</p><p className="mt-0.5 text-[9px] text-[#84919A]">{active ? 'Ready to start' : 'Coming in next stage'}</p></div>
              </div>;
            })}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 px-2 py-4 text-[9px] text-[#6F7C85]">
          <span>TANSHU ONLINE · WHATSAPP SELFIE PHOTO STUDIO</span>
          <span className="inline-flex items-center gap-1.5"><Maximize2 size={11}/> Designed for desktop studio workflow · Responsive on mobile</span>
        </footer>
      </div>
    </main>
  );
};
