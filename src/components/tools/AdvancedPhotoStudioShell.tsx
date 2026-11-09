import React from 'react';
import {
  ArrowLeft, ChevronDown, Search, Upload, Download, Printer, Undo2, Redo2,
  MousePointer2, Crop, WandSparkles, SlidersHorizontal, Image as ImageIcon,
  Layers3, Palette, Ruler, ZoomIn, ZoomOut, Grid2X2, PanelRightClose,
  MoreHorizontal, Check, LockKeyhole, ScanFace, RotateCcw
} from 'lucide-react';

const toolItems = [
  { icon: MousePointer2, label: 'Move', active: true },
  { icon: Crop, label: 'Crop' },
  { icon: ScanFace, label: 'Portrait' },
  { icon: WandSparkles, label: 'Retouch' },
  { icon: Palette, label: 'Background' },
  { icon: Ruler, label: 'Measure' },
];

const swatches = ['#F4F1EA', '#D9E2EA', '#CBD5D0', '#D9D3CB', '#AAB6C2'];

export const AdvancedPhotoStudioShell: React.FC = () => (
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
            <div><div className="text-[13px] font-semibold tracking-wide text-[#E4E7EA]">ADVANCE PHOTO STUDIO</div><div className="text-[10px] tracking-[.16em] studio-muted">PROFESSIONAL WORKSPACE</div></div>
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
          <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px]"><Undo2 size={14}/> Undo</div>
          <div className="studio-control flex h-8 items-center gap-2 px-3 text-[11px] opacity-50"><Redo2 size={14}/> Redo</div>
          <div className="flex h-8 items-center gap-2 rounded-md bg-[#D9DEE2] px-3 text-[11px] font-semibold text-[#20252A]"><Download size={14}/> Export</div>
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
            <div className="flex items-center gap-3"><span className="text-[12px] font-medium text-[#E1E5E8]">Canvas</span><span className="text-[11px] studio-muted">/</span><span className="text-[11px] studio-muted">Portrait workspace</span></div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-[10px] studio-muted">DOCUMENT</span>
              <div className="studio-control flex h-7 items-center px-3 text-[10px]">Single photo <ChevronDown size={12} className="ml-2"/></div>
              <div className="studio-control flex h-7 items-center px-3 text-[10px]">35 × 45 mm</div>
              <div className="mx-1 h-5 w-px bg-[#30363D]"/>
              <div className="studio-control flex h-7 w-7 items-center justify-center"><ZoomOut size={13}/></div>
              <span className="w-10 text-center text-[10px] studio-muted">100%</span>
              <div className="studio-control flex h-7 w-7 items-center justify-center"><ZoomIn size={13}/></div>
            </div>
          </div>

          <div className="studio-stage relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden p-10">
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted"><MousePointer2 size={13}/> Move tool <span className="ml-2 text-[#626B74]">V</span></div>
            <div className="absolute right-5 top-5 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-3 py-2 text-[10px] studio-muted">PREVIEW AREA</div>
            <div className="relative flex h-[420px] w-[336px] items-center justify-center overflow-hidden rounded-[2px] border border-white/10 bg-[#E7E5E0] p-3">
              <div className="studio-photo-placeholder relative flex h-full w-full items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#8E9BA2] to-transparent"/>
                <div className="absolute bottom-[12%] h-[48%] w-[62%] rounded-t-[48%] bg-[#59646D]"/>
                <div className="studio-avatar absolute top-[19%] h-[42%] w-[38%] rounded-[48%]"/>
                <div className="studio-hair absolute top-[16%] h-[20%] w-[40%] rounded-t-[50%]"/>
                <div className="absolute top-[39%] h-[2px] w-[12%] rounded-full bg-[#75685F] opacity-60"/>
                <div className="absolute inset-3 border border-dashed border-white/60"/>
                <div className="absolute left-3 top-3 rounded bg-black/25 px-2 py-1 text-[8px] tracking-widest text-white">SAMPLE CANVAS</div>
              </div>
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-md border border-[#3A4148] bg-[#1B1F23]/90 px-4 py-2 text-[10px] studio-muted">A clean workspace for precise photo preparation</div>
          </div>

          <div className="flex h-[38px] shrink-0 items-center justify-between border-t studio-line bg-[#191D21] px-5 text-[10px] studio-muted">
            <div className="flex items-center gap-4"><span>Canvas: 35 × 45 mm</span><span>Resolution: 300 DPI</span><span>Color: RGB</span></div>
            <div className="flex items-center gap-3"><span>100%</span><span className="h-3 w-px bg-[#3A4148]"/><span>Fit to screen</span></div>
          </div>
        </main>

        <aside className="studio-panel flex w-[286px] shrink-0 flex-col border-y-0 border-r-0">
          <div className="flex h-[52px] items-center justify-between border-b studio-line px-4"><div className="text-[12px] font-semibold text-[#E0E4E8]">Properties</div><PanelRightClose size={15} className="studio-muted"/></div>
          <div className="border-b studio-line p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">DOCUMENT SETUP</span><MoreHorizontal size={15} className="studio-muted"/></div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-md border studio-line bg-[#202429] p-2.5"><div className="text-[9px] studio-muted">Width</div><div className="mt-1 text-[12px] text-[#DDE1E5]">35 <span className="text-[9px] studio-muted">mm</span></div></div>
              <div className="rounded-md border studio-line bg-[#202429] p-2.5"><div className="text-[9px] studio-muted">Height</div><div className="mt-1 text-[12px] text-[#DDE1E5]">45 <span className="text-[9px] studio-muted">mm</span></div></div>
            </div>
            <div className="flex items-center justify-between py-2 text-[11px]"><span className="studio-muted">Resolution</span><span className="text-[#D5DADF]">300 DPI</span></div>
            <div className="flex items-center justify-between border-t studio-line py-2 text-[11px]"><span className="studio-muted">Color profile</span><span className="text-[#D5DADF]">sRGB</span></div>
          </div>
          <div className="border-b studio-line p-4">
            <div className="mb-3 text-[10px] font-semibold tracking-[.12em] studio-muted">APPEARANCE</div>
            <div className="mb-2 text-[11px] studio-muted">Background color</div>
            <div className="flex items-center gap-2">{swatches.map(color=><div key={color} className="h-7 w-7 rounded-md border border-white/10" style={{backgroundColor:color}}/>)}<div className="flex h-7 w-7 items-center justify-center rounded-md border studio-line text-[13px] studio-muted">+</div></div>
            <div className="mt-4 flex items-center justify-between text-[11px]"><span className="studio-muted">Border</span><span className="text-[#D5DADF]">Off</span></div>
          </div>
          <div className="min-h-0 flex-1 p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.12em] studio-muted">LAYERS</span><span className="text-[9px] studio-muted">01 ITEM</span></div>
            <div className="flex items-center gap-3 rounded-md border border-[#3A4148] bg-[#252B31] p-3"><ImageIcon size={16} className="studio-accent"/><div className="min-w-0 flex-1"><div className="text-[11px] text-[#DCE1E5]">Portrait layer</div><div className="text-[9px] studio-muted">Image · Base layer</div></div><Check size={13} className="studio-muted"/></div>
            <div className="mt-3 flex items-center gap-2 text-[10px] studio-muted"><Layers3 size={13}/> Layer structure preview</div>
          </div>
          <div className="border-t studio-line p-4"><div className="flex items-center justify-between text-[10px]"><span className="studio-muted">Workspace status</span><span className="flex items-center gap-1.5 text-[#9EADA4]"><span className="h-1.5 w-1.5 rounded-full bg-[#82978B]"/> Ready for review</span></div></div>
        </aside>
      </div>
      <footer className="flex h-[34px] shrink-0 items-center justify-between border-t studio-line bg-[#171A1D] px-5 text-[9px] studio-muted"><span>ADVANCE PHOTO STUDIO · DESKTOP CONCEPT</span><span className="flex items-center gap-4"><span>All tools are visual placeholders in this review build</span><span>© TANSHU ONLINE</span></span></footer>
    </div>
  </div>
);
