import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Crop, ImagePlus,
  LayoutGrid, Plus, Printer, RotateCw, Settings2, SlidersHorizontal,
  Sparkles, Trash2, Upload, Users, UserRound, X
} from 'lucide-react';

type CustomerPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: string;
  quantity: number;
  customWidth: number;
  customHeight: number;
};

const PHOTO_SIZES = [
  { value: '35x45', label: '35 × 45 mm' },
  { value: '25x35', label: '25 × 35 mm' },
  { value: '2x2', label: '2 × 2 inch' },
  { value: '35x35', label: '35 × 35 mm' },
  { value: 'custom', label: 'Custom size' },
];

const WORKFLOW = [
  { id: 'upload', label: 'Upload Customers', hint: 'Add multiple photos', icon: Upload },
  { id: 'crop', label: 'Crop & Position', hint: 'Same or individual crop', icon: Crop },
  { id: 'background', label: 'Background', hint: 'Batch background removal', icon: Sparkles },
  { id: 'adjust', label: 'Photo Adjustments', hint: 'Color and light settings', icon: SlidersHorizontal },
  { id: 'print', label: 'A4 Print Studio', hint: 'Quantity and smart layout', icon: Printer },
];

export const InstantMultiCustomerPhotoMaker: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerPhoto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [activeStep, setActiveStep] = useState('upload');
  const [sameCrop, setSameCrop] = useState(true);
  const [paperSize, setPaperSize] = useState('A4');
  const [notice, setNotice] = useState('Upload several customer photos to start a batch.');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCustomer = customers.find((customer) => customer.id === selectedId) || customers[0];

  const totalCopies = useMemo(
    () => customers.reduce((sum, customer) => sum + Math.max(0, customer.quantity || 0), 0),
    [customers]
  );

  const addFiles = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!selectedFiles.length) {
      setNotice('Please choose JPG, PNG or WEBP image files.');
      return;
    }
    const additions = selectedFiles.map((file, index) => ({
      id: String(Date.now()) + '-' + index + '-' + Math.random().toString(36).slice(2, 8),
      file,
      previewUrl: URL.createObjectURL(file),
      name: 'Customer ' + String(customers.length + index + 1).padStart(2, '0'),
      size: '35x45',
      quantity: 5,
      customWidth: 35,
      customHeight: 45,
    }));
    setCustomers((current) => [...current, ...additions]);
    if (!selectedId && additions[0]) setSelectedId(additions[0].id);
    setActiveStep('upload');
    setNotice(selectedFiles.length + ' photo' + (selectedFiles.length === 1 ? '' : 's') + ' added to this batch.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateCustomer = (id: string, updates: Partial<CustomerPhoto>) => {
    setCustomers((current) => current.map((customer) => customer.id === id ? { ...customer, ...updates } : customer));
  };

  const removeCustomer = (id: string) => {
    const target = customers.find((customer) => customer.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    const remaining = customers.filter((customer) => customer.id !== id);
    setCustomers(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id || '');
    setNotice('Customer photo removed from this batch.');
  };

  const handleStep = (stepId: string) => {
    setActiveStep(stepId);
    if (stepId === 'upload') {
      setNotice('Add or review customer photos in this batch.');
    } else {
      const step = WORKFLOW.find((item) => item.id === stepId);
      setNotice((step?.label || 'This step') + ' workspace is laid out. Its processing controls will be connected in the next implementation stage.');
    }
  };

  const customersRef = useRef(customers);
  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => () => {
    customersRef.current.forEach((customer) => URL.revokeObjectURL(customer.previewUrl));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <a href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700" aria-label="Back to TANSHU ONLINE home">
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-700">TANSHU ONLINE STUDIO</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">Preview Workspace</span>
              </div>
              <h1 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">Instant Multi Customer Photo Maker</h1>
              <p className="hidden text-xs text-slate-500 sm:block">One batch · Multiple customers · Different sizes · Print-ready workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Batch summary</p>
              <p className="text-sm font-extrabold text-slate-900">{customers.length} customers <span className="mx-1 text-slate-300">·</span> {totalCopies} prints</p>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-rose-800 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-900 sm:px-4">
              <Plus className="h-4 w-4" /> Add Photos
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] overflow-x-auto px-4 pb-3 sm:px-6">
          <div className="flex min-w-max items-center gap-2">
            {WORKFLOW.map((step, index) => {
              const Icon = step.icon;
              const active = activeStep === step.id;
              const complete = step.id === 'upload' && customers.length > 0;
              return (
                <React.Fragment key={step.id}>
                  <button type="button" onClick={() => handleStep(step.id)} className={active ? 'flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-50 px-3 py-2 text-left text-rose-900 shadow-sm' : 'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'}>
                    <span className={active ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-rose-800 text-white' : complete ? 'flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700' : 'flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500'}>
                      {complete && !active ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span><span className="block text-[11px] font-extrabold">{step.label}</span><span className="block text-[9px] text-slate-500">{step.hint}</span></span>
                  </button>
                  {index < WORKFLOW.length - 1 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[230px_minmax(0,1fr)_320px] lg:gap-5 lg:px-6 lg:py-5">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between px-1"><h2 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Studio Tools</h2><Settings2 className="h-4 w-4 text-slate-400" /></div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {WORKFLOW.map((step) => {
                const Icon = step.icon;
                const active = activeStep === step.id;
                return <button key={step.id} type="button" onClick={() => handleStep(step.id)} className={active ? 'flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-rose-900' : 'flex items-center gap-3 rounded-xl border border-transparent bg-slate-50 p-3 text-left text-slate-600 transition hover:border-slate-200 hover:bg-white'}>
                  <span className={active ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-800 text-white' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm'}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block text-xs font-bold">{step.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{step.hint}</span></span>
                </button>;
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-rose-700" /><h2 className="text-xs font-extrabold text-slate-800">Batch Overview</h2></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Customers</p><p className="mt-1 text-2xl font-black tabular-nums">{customers.length}</p></div>
              <div className="rounded-xl bg-rose-50 p-3"><p className="text-[10px] font-semibold text-rose-700">Total prints</p><p className="mt-1 text-2xl font-black tabular-nums text-rose-900">{totalCopies}</p></div>
            </div>
            <p className="mt-3 text-[10px] leading-5 text-slate-500">Each customer keeps an individual photo, size and print quantity.</p>
          </section>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-700">Main editing canvas</p><h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Customer Photo Workspace</h2></div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={!customers.length} onClick={() => setNotice('Original uploaded photos remain individually preserved in this batch.')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" /> Reset view</button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-800 transition hover:bg-rose-100"><ImagePlus className="h-3.5 w-3.5" /> Add more</button>
            </div>
          </div>

          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-[540px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-bold text-slate-700">{activeCustomer ? activeCustomer.name : 'No customer selected'}</span></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{activeCustomer ? (PHOTO_SIZES.find((size) => size.value === activeCustomer.size)?.label || 'Custom size') : 'Waiting for upload'}</span>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-slate-50 p-5">
              {activeCustomer ? (
                <div className="relative flex max-h-[440px] max-w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <img src={activeCustomer.previewUrl} alt={activeCustomer.name} className="max-h-[410px] max-w-full object-contain" />
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white shadow-lg">{activeCustomer.name} · Original preview</span>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="group flex w-full max-w-lg flex-col items-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm transition hover:border-rose-400 hover:bg-rose-50/60">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-800 transition group-hover:scale-105"><ImagePlus className="h-8 w-8" /></span>
                  <span className="mt-4 text-lg font-black text-slate-900">Upload multiple customer photos</span>
                  <span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Select several JPG, PNG or WEBP photos together. Each customer will receive a separate numbered entry.</span>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-800 px-5 py-3 text-xs font-bold text-white"><Upload className="h-4 w-4" /> Choose Photos</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3">
              <p className="text-[10px] text-slate-500">Large preview · Original image kept separate</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={!activeCustomer || customers.length < 2} onClick={() => { setSameCrop(true); setNotice('Same-crop mode selected. Crop engine connection is part of the next implementation stage.'); }} className={sameCrop ? 'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-800 disabled:opacity-40' : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 disabled:opacity-40'}>Apply same crop to all</button>
                <button type="button" disabled={!activeCustomer} onClick={() => { setSameCrop(false); setNotice('Individual crop mode selected for each customer.'); }} className={!sameCrop ? 'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-800 disabled:opacity-40' : 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 disabled:opacity-40'}>Individual crop</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2"><div><h3 className="text-xs font-extrabold text-slate-800">Customer photo strip</h3><p className="mt-0.5 text-[10px] text-slate-500">Select a thumbnail to edit its individual settings.</p></div><span className="text-[10px] font-bold text-slate-500">{customers.length} added</span></div>
            {customers.length ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {customers.map((customer, index) => <div key={customer.id} className={selectedId === customer.id ? 'relative w-[104px] shrink-0 rounded-xl border border-rose-400 bg-rose-50 p-2 text-left shadow-sm' : 'relative w-[104px] shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-left transition hover:border-slate-300'}>
                  <button type="button" onClick={() => setSelectedId(customer.id)} className="block w-full text-left">
                    <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-100"><img src={customer.previewUrl} alt="" className="h-full w-full object-contain" /></div>
                    <span className="mt-2 block truncate text-[10px] font-extrabold text-slate-800">{customer.name || ('Customer ' + (index + 1))}</span>
                    <span className="block text-[9px] text-slate-500">{customer.quantity} copies</span>
                  </button>
                  <button type="button" onClick={() => removeCustomer(customer.id)} aria-label={'Remove ' + customer.name} className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"><X className="h-3 w-3" /></button>
                </div>)}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-[126px] w-[104px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"><Plus className="h-6 w-6" /><span className="text-[10px] font-bold">Add photos</span></button>
              </div>
            ) : <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">Customer thumbnails will appear here after upload.</div>}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[11px] leading-5 text-blue-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{notice}</span></div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Per-customer controls</p><h2 className="mt-1 text-sm font-black text-slate-900">Customer Settings</h2></div><UserRound className="h-5 w-5 text-slate-400" /></div>
            {activeCustomer ? (
              <div className="space-y-4">
                <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Customer name / label</span><input value={activeCustomer.name} onChange={(event) => updateCustomer(activeCustomer.id, { name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" placeholder="Customer name (optional)" /></label>
                <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Photo size</span><select value={activeCustomer.size} onChange={(event) => updateCustomer(activeCustomer.id, { size: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-rose-400">{PHOTO_SIZES.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}</select></label>
                {activeCustomer.size === 'custom' && <div className="grid grid-cols-2 gap-2">
                  <label><span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">Width (mm)</span><input type="number" min="5" max="150" value={activeCustomer.customWidth} onChange={(event) => updateCustomer(activeCustomer.id, { customWidth: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold outline-none focus:border-rose-400" /></label>
                  <label><span className="mb-1 block text-[9px] font-bold uppercase text-slate-500">Height (mm)</span><input type="number" min="5" max="200" value={activeCustomer.customHeight} onChange={(event) => updateCustomer(activeCustomer.id, { customHeight: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold outline-none focus:border-rose-400" /></label>
                </div>}
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wide text-rose-800">Print quantity</span><span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-rose-800">{activeCustomer.quantity} copies</span></div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateCustomer(activeCustomer.id, { quantity: Math.max(1, activeCustomer.quantity - 1) })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-800 hover:bg-rose-100">−</button>
                    <input type="number" min="1" max="500" value={activeCustomer.quantity} onChange={(event) => updateCustomer(activeCustomer.id, { quantity: Math.max(1, Math.min(500, Number(event.target.value) || 1)) })} className="h-9 min-w-0 flex-1 rounded-lg border border-rose-200 bg-white px-2 text-center text-sm font-black tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-rose-100" />
                    <button type="button" onClick={() => updateCustomer(activeCustomer.id, { quantity: Math.min(500, activeCustomer.quantity + 1) })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-800 hover:bg-rose-100">+</button>
                  </div>
                </div>
                <button type="button" onClick={() => removeCustomer(activeCustomer.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-[11px] font-bold text-red-700 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Remove this customer</button>
              </div>
            ) : <div className="rounded-xl bg-slate-50 p-5 text-center"><Users className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-600">Upload photos to configure each customer.</p></div>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-rose-700" /><h2 className="text-xs font-extrabold text-slate-800">Print Sheet Setup</h2></div>
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Paper size</span><select value={paperSize} onChange={(event) => setPaperSize(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-rose-400"><option>A4</option><option>4 × 6 inch</option><option>5 × 7 inch</option><option>A5</option><option>Letter</option></select></label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase text-slate-500">Customers</p><p className="mt-1 text-lg font-black tabular-nums">{customers.length}</p></div>
              <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase text-slate-500">Total copies</p><p className="mt-1 text-lg font-black tabular-nums">{totalCopies}</p></div>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">Smart Arrange will respect each customer's selected size, quantity, margins and cutting gaps. Extra copies will continue onto additional sheets.</div>
            <button type="button" disabled={!customers.length} onClick={() => handleStep('print')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><Printer className="h-4 w-4" /> Open A4 Print Studio <ArrowRight className="h-4 w-4" /></button>
          </section>
        </aside>
      </main>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files)} />
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-[10px] text-slate-500">TANSHU ONLINE · Instant Multi Customer Photo Maker · Separate batch workspace</footer>
    </div>
  );
};
