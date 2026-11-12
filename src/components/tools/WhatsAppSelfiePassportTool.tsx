import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, ImagePlus, RotateCw, ScanFace, Sparkles, UploadCloud, X } from 'lucide-react';

const WORKFLOW_STEPS = [
  { label: 'Upload Selfie', icon: Camera },
  { label: 'Crop & Select Face', icon: ScanFace },
  { label: 'Straighten', icon: RotateCw },
  { label: 'Background', icon: Sparkles },
  { label: 'Final Preview', icon: CheckCircle2 },
];

export const WhatsAppSelfiePassportTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

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
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to TANSHU ONLINE
        </a>

        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/5">
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-700 px-6 py-8 text-white sm:px-9 sm:py-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-50">
              <Camera className="h-4 w-4" /> Dedicated Photo Studio
            </div>
            <h1 className="max-w-3xl text-2xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
              WhatsApp Selfie to Passport Photo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Turn a customer's selfie into a neatly aligned, passport-style photo through a guided editing workflow.
            </p>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step 1 of 5</p>
                  <h2 className="mt-1 text-xl font-extrabold">Upload WhatsApp Selfie</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Image upload</span>
              </div>

              {!selectedFile ? (
                <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-7 text-center transition hover:border-emerald-500 hover:bg-emerald-50">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <UploadCloud className="h-8 w-8" />
                  </span>
                  <span className="text-base font-extrabold text-slate-900">Choose Selfie Photo</span>
                  <span className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Upload an image saved from WhatsApp or another device folder.</span>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm">
                    <ImagePlus className="h-4 w-4" /> Select Photo
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={() => setSelectedFile(null)} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">
                      <X className="h-4 w-4" /> Remove
                    </button>
                  </div>
                  <div className="flex min-h-[280px] items-center justify-center bg-slate-100 p-4">
                    <img src={previewUrl} alt="Uploaded selfie preview" className="max-h-[360px] max-w-full rounded-xl object-contain shadow-md" />
                  </div>
                  <div className="p-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                      <ImagePlus className="h-4 w-4" /> Change Photo
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-slate-500">This first-stage preview only loads the selected image locally in your browser. Face correction and passport-photo processing are not enabled yet.</p>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Planned editing workflow</p>
              <h2 className="mt-1 text-lg font-extrabold">From selfie to studio photo</h2>
              <div className="mt-5 space-y-4">
                {WORKFLOW_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const active = index === 0;
                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-emerald-700 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${active ? 'text-emerald-800' : 'text-slate-600'}`}>{step.label}</p>
                        <p className="text-xs text-slate-500">{index === 0 ? 'Select the customer\u2019s selfie' : 'Planned for the next development stage'}</p>
                      </div>
                      {active && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">Current</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-900">Processing tools are not active yet</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">Crop controls, face alignment, straighten correction, background editing and final print settings will be added and tested in separate stages.</p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
};
