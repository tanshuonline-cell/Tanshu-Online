import React from 'react';

type SheetMode = 'single' | '4x6' | 'a4';
type PhotoPreset = 'india' | 'stamp' | 'pan' | 'custom';
type Unit = 'mm' | 'cm' | 'in';

type Props = {
  sheetMode: SheetMode;
  preset: PhotoPreset;
  sizeUnit: Unit;
  customWidthMm: number;
  customHeightMm: number;
  sheetCopies: number;
  sheetCapacity: number;
  hasPhoto: boolean;
  onSheetModeChange: (value: SheetMode) => void;
  onPresetChange: (value: PhotoPreset) => void;
  onSizeUnitChange: (value: Unit) => void;
  onCustomWidthMmChange: (value: number) => void;
  onCustomHeightMmChange: (value: number) => void;
  onSheetCopiesChange: (value: number) => void;
  onPrint: () => void;
};

const mmToUnit = (value: number, unit: Unit) => value / (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const unitToMm = (value: number, unit: Unit) => value * (unit === 'cm' ? 10 : unit === 'in' ? 25.4 : 1);
const countPresets = [2, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 30];

export const StudioQuickPrintSetup: React.FC<Props> = ({
  sheetMode, preset, sizeUnit, customWidthMm, customHeightMm, sheetCopies, sheetCapacity, hasPhoto,
  onSheetModeChange, onPresetChange, onSizeUnitChange, onCustomWidthMmChange, onCustomHeightMmChange,
  onSheetCopiesChange, onPrint
}) => {
  const capacity = Math.max(1, Math.min(60, sheetCapacity));
  const currentCount = Math.max(1, Math.min(capacity, sheetCopies || 1));
  const control = 'studio-control h-8 w-full rounded-md px-2 text-[10px] outline-none';
  return (
    <section className="border-b studio-line p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold tracking-[.12em] text-[#E0E4E8]">QUICK PRINT SETUP</div>
          <p className="mt-1 text-[9px] studio-muted">Choose the printer, photo size and sheet, then prepare the layout.</p>
        </div>
        <span className="rounded-md border border-emerald-900/60 bg-emerald-950/40 px-2 py-1 text-[9px] text-emerald-300">300 DPI</span>
      </div>

      <div className="mb-3 rounded-lg border border-[#343A42] bg-[#202429] p-2.5">
        <div className="mb-1.5 text-[9px] font-semibold text-[#D5DADF]">PRINTER DESTINATION</div>
        <div className="flex items-center gap-2 text-[10px] text-[#D9DEE2]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#30373E]">🖨️</span>
          <span>Choose your installed printer in the system print dialog</span>
        </div>
        <p className="mt-1.5 text-[9px] leading-4 studio-muted">Browsers do not allow websites to read or select installed printer names directly. Your printer choice is made securely when you press Print.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[9px] studio-muted">Paper sheet
          <select aria-label="Quick print paper sheet" value={sheetMode} onChange={event => onSheetModeChange(event.target.value as SheetMode)} className={control + ' mt-1'}>
            <option value="4x6">4 × 6 inch</option>
            <option value="a4">A4 · 210 × 297 mm</option>
            <option value="single">Single photo</option>
          </select>
        </label>
        <label className="text-[9px] studio-muted">Passport photo size
          <select aria-label="Quick print photo size" value={preset} onChange={event => onPresetChange(event.target.value as PhotoPreset)} className={control + ' mt-1'}>
            <option value="india">Passport · 35 × 45 mm</option>
            <option value="pan">PAN · 25 × 35 mm</option>
            <option value="stamp">Stamp · 25 × 30 mm</option>
            <option value="custom">Custom size</option>
          </select>
        </label>
      </div>

      {preset === 'custom' && <div className="mt-2 rounded-md border border-[#343A42] bg-[#202429] p-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] studio-muted">Custom measurement</span>
          <select aria-label="Quick print measurement unit" value={sizeUnit} onChange={event => onSizeUnitChange(event.target.value as Unit)} className="studio-control h-7 px-2 text-[9px]">
            <option value="mm">Millimetres (mm)</option><option value="cm">Centimetres (cm)</option><option value="in">Inches (in)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[9px] studio-muted">Width ({sizeUnit})
            <input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customWidthMm,sizeUnit).toFixed(2))} onChange={event => onCustomWidthMmChange(unitToMm(Math.max(0.1,Number(event.target.value)||0.1),sizeUnit))} className={control + ' mt-1'}/>
          </label>
          <label className="text-[9px] studio-muted">Height ({sizeUnit})
            <input type="number" min="0.1" step="0.1" value={Number(mmToUnit(customHeightMm,sizeUnit).toFixed(2))} onChange={event => onCustomHeightMmChange(unitToMm(Math.max(0.1,Number(event.target.value)||0.1),sizeUnit))} className={control + ' mt-1'}/>
          </label>
        </div>
      </div>}

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#D5DADF]">NUMBER OF PHOTOS</span>
          <span className="text-[9px] studio-muted">{currentCount} selected · {capacity} fit on this sheet</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {countPresets.map(count => <button key={count} type="button" disabled={sheetMode === 'single' || count > capacity || !hasPhoto} onClick={() => onSheetCopiesChange(count)} className={`rounded-md border px-1 py-2 text-[10px] font-semibold transition ${currentCount === count ? 'border-[#AEB8C2] bg-[#D9DEE2] text-[#20252A]' : 'border-[#3A4148] bg-[#202429] text-[#C9CFD5] hover:bg-[#30373E]'} disabled:cursor-not-allowed disabled:opacity-30`}>{count} Photos</button>)}
        </div>
        <div className="mt-2 flex gap-1.5">
          <label className="min-w-0 flex-1 text-[9px] studio-muted">Custom count
            <input type="number" min="1" max={capacity} disabled={sheetMode === 'single' || !hasPhoto} value={currentCount} onChange={event => onSheetCopiesChange(Math.max(1,Math.min(capacity,Number(event.target.value)||1)))} className={control + ' mt-1'}/>
          </label>
          <button type="button" disabled={sheetMode === 'single' || !hasPhoto} onClick={() => onSheetCopiesChange(capacity)} className="mt-4 rounded-md border border-[#46515C] bg-[#30373E] px-2.5 text-[9px] font-semibold text-[#E0E4E8] disabled:opacity-30">Max fit</button>
        </div>
      </div>

      <button type="button" disabled={!hasPhoto || sheetMode === 'single'} onClick={onPrint} className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#D9DEE2] px-3 text-[10px] font-bold text-[#20252A] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35">
        <span>🖨️</span> Prepare sheet & Print
      </button>
      <p className="mt-2 text-[9px] leading-4 studio-muted">Print at 100% / Actual Size. Turn off “Fit to page”. Keep the printer’s supported paper size selected. Edge-to-edge printing depends on the printer’s borderless capability.</p>
    </section>
  );
};
