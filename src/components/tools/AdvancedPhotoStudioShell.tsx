import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ChevronDown, Search, Download, Undo2, Redo2,
  MousePointer2, Crop, WandSparkles, Image as ImageIcon,
  Layers3, Palette, Ruler, ZoomIn, ZoomOut, Grid2X2, PanelRightClose,
  MoreHorizontal, Check, LockKeyhole, ScanFace, Upload, X, Plus
} from 'lucide-react';

type StudioPhoto = { id: string; file: File; url: string; width: number; height: number };
type StudioPreset = 'india' | 'stamp' | 'pan' | 'custom';
type StudioUnit = 'mm' | 'cm' | 'in';
const STUDIO_PRESETS: Record<Exclude<StudioPreset, 'custom'>, { label: string; widthMm: number; heightMm: number }> = {
  india: { label: 'India Passport / Exam', widthMm: 35, heightMm: 45 },
  stamp: { label: 'Stamp Photo', widthMm: 25, heightMm: 30 },
  pan: { label: 'PAN Photo', widthMm: 25, heightMm: 35 }
};
const mmToUnit = (value: number, unit: StudioUnit) => value / (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const unitToMm = (value: number, unit: StudioUnit) => value * (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);

const toolItems = [
  { icon: MousePointer2, label: 'Move', active: true },
  { icon: Crop, label: 'Crop' },
  { icon: ScanFace, label: 'Portrait' },
  { icon: WandSparkles, label: 'Retouch' },
  { icon: Palette, label: 'Background' },
  { icon: Ruler, label: 'Measure' },
];

const swatches = ['#F4F1EA', '#D9E2EA', '#CBD5D0', '#D9D3CB', '#AAB6C2'];

export const AdvancedPhotoStudioShell: React.FC = () => {
  const [photos, setPhotos] = useState<StudioPhoto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [zoom, setZoom] = useState(100);
  const [preset, setPreset] = useState<StudioPreset>('india');
  const [customWidthMm, setCustomWidthMm] = useState(35);
  const [customHeightMm, setCustomHeightMm] = useState(45);
  const [sizeUnit, setSizeUnit] = useState<StudioUnit>('mm');
  const documentSize = useMemo(() => {
    const widthMm = preset === 'custom' ? Math.max(1, customWidthMm) : STUDIO_PRESETS[preset].widthMm;
    const heightMm = preset === 'custom' ? Math.max(1, customHeightMm) : STUDIO_PRESETS[preset].heightMm;
    return { widthMm, heightMm, widthPx: Math.round(widthMm * 300 / 25.4), heightPx: Math.round(heightMm * 300 / 25.4) };
  }, [preset, customWidthMm, customHeightMm]);
  const uploadRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<StudioPhoto[]>([]);
  const selected = photos.find(photo => photo.id === selectedId) || photos[0] || null;

  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)), []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter(file => file.type.startsWith('image/'));
    const additions = accepted.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
      width: 0,
      height: 0
    }));
    if (additions.length) {
      setPhotos(current => [...current, ...additions]);
      setSelectedId(current => current || additions[0].id);
    }
    if (uploadRef.current) uploadRef.current.value = '';
  };

  const removeSelected = () => {
    if (!selected) return;
    URL.revokeObjectURL(selected.url);
    setPhotos(current => {
      const next = current.filter(photo => photo.id !== selected.id);
      setSelectedId(next[0]?.id || '');
      return next;
    });
  };

  const updateDimensions = (id: string, width: number, height: number) => {
    setPhotos(current => current.map(photo => photo.id === id ? { ...photo, width, height } : photo));
  };

  return (
    <div className="min-h-screen bg-[#101214] text-[#D9DDE1] font-sans antialiased">
      <style>{`
        .studio-shell * { box-sizing: border-box; }
        .studio-shell { min-width: 1100px; }
        .studio-panel { background:#181B1F; border:1px solid #2A2F35; }
        .studio-muted { color:#858D96; }
        .studio-line { border-color:#2A2F35; }
        .studio-control { border:1px solid #343A42; background:#202429; color:#C9CFD5; border-radius:7px; }
        .studio-control:hover { background:#292F35; }
        .studio-stage {
          background-color:#202429;
          background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:24px 24px;
        }
        .studio-photo-placeholder {
          background:linear-gradient(145deg,#D9DDE0 0%,#BFC8CF 52%,#AAB5BE 100%);
          box-shadow:0 22px 70px rgba(0,0,0,.35);
        }
        .studio-avatar { background:linear-gradient(180deg,#E8D8C6 0%,#C8B19B 100%); }
        .studio-hair { background:#55504B; }
        .studio-accent { color:#B6C0CA; }
      `}</style>
      <div className="studio-shell flex min-h-screen flex-col">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b studio-line bg-[#171A1D] px-5">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 text-sm studio-muted hover:text-white"><ArrowLeft size={16}/> TANSHU ONLINE</a>
            <div className="h-6 w-px bg-[#30363D]"/>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#303840] text-[#D8DEE4]"><ImageIcon size={17}/></div>
              <div><div className="text-[13px] font-semibold tracking-wide text-[#E4E7EA]">TANSHU STUDIO</div><div className="text-[10px] tracking-[.16em] studio-muted">PHOTO EDITING & PASSPORT STUDIO</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 flex items-center gap-1.5 text-[11px] studio-muted"><span className="h-1.5 w-1.5 rounded-full bg-[#82978B]"/> Draft workspace</span>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><span className="studio-muted">Untitled project</span><ChevronDown size={13}/></div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-xs"><LockKeyhole size={12}/> Saved locally</div>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#343B42] text-xs font-semibold text-[#DCE1E5]">T</div>
          </div>
        </header>

        <nav className="flex h-[48px] shrink-0 items-center justify-between border-b studio-line bg-[#1B1F23] px-5">
          <div className="flex items-center gap-1 text-[12px]">
            {['File','Edit','Image','Canvas','Arrange','View','Help'].map((item, index) => <span key={item} className={`rounded px-3 py-2 ${index===0?'text-[#E0E4E8]':'studio-muted'}`}>{item}</span>)}
          </div>
          <div className="flex items-center gap-2">
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px]"><Search size={13} className="studio-muted"/> Search tools and actions <span className="ml-5 rounded border border-[#3B424A] px-1.5 py-0.5 text-[9px] studio-muted">⌘ K</span></div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px] opacity-50"><Undo2 size={14}/> Undo</div>
            <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px] opacity-50"><Redo2 size={14}/> Redo</div>
            <button type="button" onClick={() => uploadRef.current?.click()} className="flex h-8 items-center gap-2 rounded-md bg-[#D9DEE2] px-3 text-[11px] font-semibold text-[#20252A] hover:bg-[#E5E8EA]"><Upload size={14}/> Import photo</button>
            <input ref={uploadRef} type="file" accept="image/*" multiple className="hidden" onChange={event => addPhotos(event.target.files)}/>
          </div>
        </nav>

        <div className="flex min-h-0 flex-1">
          <aside className="studio-panel flex w-[72px] shrink-0 flex-col items-center gap-2 border-y-0 border-l-0 py-4">
            {toolItems.map(({icon:Icon,label,active}) => <div key={label} className={`flex w-[54px] flex-col items-center gap-1.5 rounded-lg py-3 ${active?'bg-[#30373E] text-[#F0F2F4]':'studio-muted'}`}><Icon size={18} strokeWidth={1.7}/><span className="text-[9px]">{label}</span></div>)}
            <div className="my-2 h-px w-8 bg-[#30363D]"/>
            <div className="flex w-[54px] flex-col items-center gap-1.5 py-3 studio-muted"><Grid2X2 size={18}/><span className="text-[9px]">Layout</span></div>
            <div className="mt-auto flex w-[54px] flex-col items-center gap-1.5 py-3 studio-muted"><MoreHorizontal size={19}/><span className="text-[9px]">More</span></div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col bg-[#14171A]">
            <div className="flex h-[52px] shrink-0 items-center justify-between border-b studio-line px-5">
              <div className="flex items-center gap-3"><span className="text-[12px] font-medium text-[#E1E5E8]">Canvas</span><span className="text-[11px] studio-muted">/</span><span className="text-[11px] studio-muted">{selected ? selected.file.name : 'Portrait workspace'}</span></div>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-[10px] studio-muted">DOCUMENT</span>
                <select aria-label="Photo size preset" value={preset} onChange={event => setPreset(event.target.value as StudioPreset)} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="india">India Passport / Exam</option><option value="pan">PAN Photo</option><option value="stamp">Stamp Photo</option><option value="custom">Custom size</option></select>
                <div className="studio-control flex h-7 items-center px-3 text-[10px]">{documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</div>
                <div className="mx-1 h-5 w-px bg-[#30363D]"/>
                <button type="button" aria-label="Zoom out" onClick={() => setZoom(value => Math.max(25, value - 25))} className="studio-control flex h-7 w-7 items-center justify-center"><ZoomOut size={13}/></button>
                <span className="w-10 text-center text-[10px] studio-muted">{zoom}%</span>
                <button type="button" aria-label="Zoom in" onClick={() => setZoom(value => Math.min(200, value + 25))} className="studio-control flex h-7 w-7 items-center justify-center"><ZoomIn size={13}/></button>
              </div>
            </div>

            <div className="studio-stage relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden p-10">
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted"><MousePointer2 size={13}/> Move tool <span className="ml-2 text-[#626B74]">V</span></div>
              <div className="absolute right-5 top-5 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">PREVIEW AREA</div>
              {selected ? (
                <div className="relative flex max-h-full max-w-full items-center justify-center border border-white/10 bg-[#E7E5E0] p-3 shadow-2xl" style={{ transform: `scale(${zoom / 100})`, aspectRatio: `${documentSize.widthMm} / ${documentSize.heightMm}`, width: Math.min(560, 420 * documentSize.widthMm / documentSize.heightMm), maxWidth: "55vw", maxHeight: 420, padding: 0 }}>
                  <img src={selected.url} alt={selected.file.name} onLoad={event => updateDimensions(selected.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} className="block h-full w-full object-cover"/>
                </div>
              ) : (
                <button type="button" onClick={() => uploadRef.current?.click()} className="group flex h-[420px] w-[336px] flex-col items-center justify-center gap-4 rounded-[2px] border border-dashed border-[#59616A] bg-[#1B1F23]/70 text-center transition hover:border-[#8A949E] hover:bg-[#20252A]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A4148] bg-[#252B31] text-[#B6C0CA]"><Upload size={20}/></div>
                  <div><div className="text-[13px] font-medium text-[#DDE1E5]">Import a photo to begin</div><div className="mt-2 text-[10px] studio-muted">Choose JPG, PNG or WEBP · Multiple files supported</div></div>
                  <span className="studio-control flex items-center gap-2 px-3 py-2 text-[10px]"><Plus size={13}/> Browse files</span>
                </button>
              )}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-4 py-2 text-[10px] studio-muted">{selected ? 'Photo imported · Original file remains on this device' : 'A clean workspace for precise photo preparation'}</div>
            </div>

            <div className="flex h-[38px] shrink-0 items-center justify-between border-t studio-line bg-[#191D21] px-5 text-[10px] studio-muted">
              <div className="flex items-center gap-4"><span>{selected ? `Image: ${selected.width || '—'} × ${selected.height || '—'} px` : 'Canvas: 35 × 45 mm'}</span><span>Document: {documentSize.widthMm.toFixed(1)} × {documentSize.heightMm.toFixed(1)} mm</span><span>Output: {documentSize.widthPx} × {documentSize.heightPx} px @ 300 DPI</span><span>Color: RGB</span></div>
              <div className="flex items-center gap-3"><span>{zoom}%</span><span className="h-3 w-px bg-[#3A4148]"/><button type="button" onClick={() => setZoom(100)} className="hover:text-[#D9DDE1]">Reset zoom</button></div>
            </div>
          </main>

          <aside className="studio-panel flex w-[286px] shrink-0 flex-col border-y-0 border-r-0">
            <div className="flex h-[52px] items-center justify-between border-b studio-line px-4"><div className="text-[12px] font-semibold text-[#E0E4E8]">Properties</div><PanelRightClose size={15} className="studio-muted"/></div>
            <div className="border-b studio-line p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">DOCUMENT SETUP</span><MoreHorizontal size={15} className="studio-muted"/></div>
              <label className="mb-3 block text-[10px] studio-muted">Photo size preset
                <select aria-label="Photo size preset" value={preset} onChange={event => setPreset(event.target.value as StudioPreset)} className="studio-control mt-1.5 h-8 w-full px-2 text-[11px] outline-none">
                  <option value="india">India Passport / Exam · 35 × 45 mm</option><option value="pan">PAN Photo · 25 × 35 mm</option><option value="stamp">Stamp Photo · 25 × 30 mm</option><option value="custom">Custom dimensions</option>
                </select>
              </label>
              {preset === 'custom' && <div className="mb-3">
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] studio-muted">Measurement unit</span><select aria-label="Custom size unit" value={sizeUnit} onChange={event => setSizeUnit(event.target.value as StudioUnit)} className="studio-control h-7 px-2 text-[10px] outline-none"><option value="mm">mm</option><option value="cm">cm</option><option value="in">in</option></select></div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[9px] studio-muted">Width ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customWidthMm, sizeUnit).toFixed(2))} onChange={event => setCustomWidthMm(unitToMm(Math.max(0.1, Number(event.target.value) || 0.1), sizeUnit))} className="studio-control mt-1 h-8 w-full px-2 text-[11px] outline-none"/></label>
                  <label className="text-[9px] studio-muted">Height ({sizeUnit})<input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customHeightMm, sizeUnit).toFixed(2))} onChange={event => setCustomHeightMm(unitToMm(Math.max(0.1, Number(event.target.value) || 0.1), sizeUnit))} className="studio-control mt-1 h-8 w-full px-2 text-[11px] outline-none"/></label>
                </div>
              </div>}
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border studio-line bg-[#202429] p-2.5"><div className="text-[9px] studio-muted">Width</div><div className="mt-1 text-[12px] text-[#DDE1E5]">{documentSize.widthMm.toFixed(1)} <span className="text-[9px] studio-muted">mm</span></div></div>
                <div className="rounded-md border studio-line bg-[#202429] p-2.5"><div className="text-[9px] studio-muted">Height</div><div className="mt-1 text-[12px] text-[#DDE1E5]">{documentSize.heightMm.toFixed(1)} <span className="text-[9px] studio-muted">mm</span></div></div>
              </div>
              <div className="flex items-center justify-between py-2 text-[11px]"><span className="studio-muted">Output size</span><span className="text-[#D5DADF]">{documentSize.widthPx} × {documentSize.heightPx} px</span></div>
              <div className="flex items-center justify-between border-t studio-line py-2 text-[11px]"><span className="studio-muted">Resolution</span><span className="text-[#D5DADF]">300 DPI</span></div>
              <div className="flex items-center justify-between border-t studio-line py-2 text-[11px]"><span className="studio-muted">Color profile</span><span className="text-[#D5DADF]">sRGB</span></div>
            </div>
            <div className="border-b studio-line p-4">
              <div className="mb-3 text-[10px] font-semibold tracking-[.12em] studio-muted">APPEARANCE</div>
              <div className="mb-2 text-[11px] studio-muted">Background color</div>
              <div className="flex items-center gap-2">{swatches.map(color=><div key={color} className="h-7 w-7 rounded-md border border-white/10" style={{backgroundColor:color}}/>)}<div className="flex h-7 w-7 items-center justify-center rounded-md border studio-line text-[13px] studio-muted">+</div></div>
              <div className="mt-4 flex items-center justify-between text-[11px]"><span className="studio-muted">Border</span><span className="text-[#D5DADF]">Off</span></div>
            </div>
            <div className="min-h-0 flex-1 p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">LAYERS</span><span className="text-[9px] studio-muted">{photos.length.toString().padStart(2, '0')} ITEMS</span></div>
              {photos.length ? <div className="space-y-2">
                {photos.map(photo => <div key={photo.id} className={`flex items-center gap-2 rounded-md border p-2 ${selected?.id === photo.id ? 'border-[#3A4148] bg-[#252B31]' : 'studio-line bg-[#202429]'}`}>
                  <button type="button" onClick={() => setSelectedId(photo.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><img src={photo.url} alt="" className="h-9 w-8 rounded object-cover bg-[#30363D]"/><span className="min-w-0"><span className="block truncate text-[10px] text-[#DCE1E5]">{photo.file.name}</span><span className="block text-[9px] studio-muted">Image · {photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Loading dimensions'}</span></span></button>
                  {selected?.id === photo.id && <button type="button" aria-label="Remove selected photo" onClick={removeSelected} className="rounded p-1 studio-muted hover:text-[#E1E5E8]"><X size={13}/></button>}
                  {selected?.id === photo.id && <Check size={12} className="studio-muted"/>}
                </div>)}
                <button type="button" onClick={() => uploadRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed studio-line py-2 text-[10px] studio-muted hover:text-[#D9DDE1]"><Plus size={13}/> Add photos</button>
              </div> : <div className="rounded-md border border-dashed studio-line p-4 text-center text-[10px] studio-muted">No image layers yet</div>}
              <div className="mt-3 flex items-center gap-2 text-[10px] studio-muted"><Layers3 size={13}/> Layer structure</div>
            </div>
            <div className="border-t studio-line p-4"><div className="flex items-center justify-between text-[10px]"><span className="studio-muted">Workspace status</span><span className="flex items-center gap-1.5 text-[#9EADA4]"><span className="h-1.5 w-1.5 rounded-full bg-[#82978B]"/>{selected ? 'Photo loaded' : 'Ready for import'}</span></div></div>
          </aside>
        </div>
        <footer className="flex h-[34px] shrink-0 items-center justify-between border-t studio-line bg-[#171A1D] px-5 text-[9px] studio-muted"><span>TANSHU STUDIO · DOCUMENT PRESETS</span><span className="flex items-center gap-4"><span>Import and layer selection enabled</span><span>© TANSHU ONLINE</span></span></footer>
      </div>
    </div>
  );
};
