import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileText, Languages, Copy, Download, RotateCcw, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react';

declare global {
  interface Window {
    Tesseract?: any;
    pdfjsLib?: any;
  }
}

type OcrItem = { id: string; name: string; text: string; status: 'queued' | 'processing' | 'done' | 'error'; progress: number; error?: string };

const loadScript = (src: string, test: () => boolean) => new Promise<void>((resolve, reject) => {
  if (test()) return resolve();
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener('load', () => resolve(), { once: true });
    existing.addEventListener('error', () => reject(new Error('OCR library could not be loaded.')), { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = () => test() ? resolve() : reject(new Error('OCR library did not initialize.'));
  script.onerror = () => reject(new Error('Could not download the OCR engine. Check your internet connection and retry.'));
  document.head.appendChild(script);
});

const loadOcrEngine = async () => {
  await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', () => !!window.Tesseract);
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', () => !!window.pdfjsLib);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
};

export const PdfOcrTextExtractorTool: React.FC = () => {
  const [language, setLanguage] = useState<'hin+eng' | 'eng' | 'hin'>('hin+eng');
  const [items, setItems] = useState<OcrItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [engineReady, setEngineReady] = useState(false);
  const workerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateItem = (id: string, patch: Partial<OcrItem>) => setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));

  useEffect(() => () => { workerRef.current?.terminate?.(); }, []);

  const getWorker = useCallback(async () => {
    await loadOcrEngine();
    if (!workerRef.current) {
      const worker = await window.Tesseract.createWorker(language, 1, {
        logger: (message: any) => {
          if (message.status === 'recognizing text') setStatus(`टेक्स्ट पहचाना जा रहा है · ${Math.round((message.progress || 0) * 100)}%`);
        }
      });
      workerRef.current = worker;
    }
    setEngineReady(true);
    return workerRef.current;
  }, [language]);

  const processFiles = async (files: FileList | File[]) => {
    const accepted = Array.from(files).filter(file => file.type.startsWith('image/') || file.type === 'application/pdf');
    if (!accepted.length) { setError('कृपया JPG, PNG, WEBP या PDF फाइल चुनें।'); return; }
    if (accepted.some(file => file.size > 25 * 1024 * 1024)) { setError('एक फाइल अधिकतम 25 MB तक हो सकती है।'); return; }
    const queue = accepted.map(file => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: file.name, text: '', status: 'queued' as const, progress: 0 }));
    setItems(prev => [...prev, ...queue]);
    setBusy(true); setError('');
    try {
      const worker = await getWorker();
      for (let index = 0; index < accepted.length; index++) {
        const file = accepted[index]; const item = queue[index];
        updateItem(item.id, { status: 'processing', progress: 5 });
        try {
          let collected = '';
          if (file.type === 'application/pdf') {
            const pdfData = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
            if (pdf.numPages > 20) throw new Error('एक PDF में अधिकतम 20 पेज प्रोसेस किए जा सकते हैं।');
            for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
              setStatus(`PDF पेज ${pageNo}/${pdf.numPages} पढ़ा जा रहा है…`);
              const page = await pdf.getPage(pageNo);
              const viewport = page.getViewport({ scale: 1.8 });
              const canvas = document.createElement('canvas');
              canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
              const context = canvas.getContext('2d');
              if (!context) throw new Error('PDF पेज तैयार नहीं हो पाया।');
              await page.render({ canvasContext: context, viewport }).promise;
              const result = await worker.recognize(canvas);
              collected += (pdf.numPages > 1 ? `--- पेज ${pageNo} ---\n` : '') + (result.data.text || '').trim() + '\n\n';
              updateItem(item.id, { progress: Math.round((pageNo / pdf.numPages) * 95) });
              canvas.width = 1; canvas.height = 1;
            }
          } else {
            const result = await worker.recognize(file);
            collected = result.data.text || '';
          }
          updateItem(item.id, { text: collected.trim(), status: 'done', progress: 100 });
        } catch (err) {
          updateItem(item.id, { status: 'error', error: err instanceof Error ? err.message : 'इस फाइल को पढ़ा नहीं जा सका।' });
        }
      }
      setStatus('प्रोसेस पूरा हुआ। पहचाने गए टेक्स्ट को जाँचकर सुधार सकते हैं।');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR शुरू नहीं हो पाया।');
      setStatus('');
    } finally { setBusy(false); }
  };

  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setStatus('टेक्स्ट कॉपी हो गया।'); }
    catch { setError('कॉपी नहीं हो पाया। टेक्स्ट चुनकर कॉपी करें।'); }
  };
  const downloadText = (item: OcrItem) => {
    const blob = new Blob([item.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = item.name.replace(/\.[^.]+$/, '') + '-ocr.txt'; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-5">
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-5 sm:p-7 text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-[10px] font-bold tracking-[.22em] text-cyan-200 uppercase">TANSHU ONLINE · PREMIUM UTILITY</div><h2 className="mt-2 text-2xl sm:text-3xl font-black">OCR Studio</h2><p className="mt-2 max-w-2xl text-sm text-indigo-100">स्कैन फोटो और PDF से हिंदी व अंग्रेज़ी टेक्स्ट निकालें। टेक्स्ट को जाँचें, एडिट करें, कॉपी करें या TXT फाइल में सेव करें।</p></div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3"><Languages className="h-8 w-8 text-cyan-200"/></div>
      </div>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {['Hindi + English OCR','Image और PDF सपोर्ट','ब्राउज़र में लोकल प्रोसेसिंग'].map(label => <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">{label}</div>)}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">फाइल अपलोड करें</h3><p className="text-xs text-slate-500 mt-1">एक साथ कई फोटो या PDF चुन सकते हैं।</p></div><span className="text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">MAX 25 MB / FILE</span></div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={e => { if (e.target.files) void processFiles(e.target.files); e.target.value = ''; }}/>
        <button disabled={busy} onClick={() => inputRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 hover:bg-indigo-50 p-8 text-center transition-colors disabled:opacity-50">
          <Upload className="mx-auto h-8 w-8 text-indigo-600"/><span className="mt-3 block text-sm font-bold text-slate-900">फाइल चुनें या यहाँ क्लिक करें</span><span className="mt-1 block text-xs text-slate-500">JPG · PNG · WEBP · PDF</span>
        </button>
        <div className="flex flex-wrap items-center gap-2"><label className="text-xs font-semibold text-slate-600">पहचान की भाषा</label><select value={language} disabled={busy} onChange={e => { setLanguage(e.target.value as any); void workerRef.current?.terminate?.(); workerRef.current = null; setEngineReady(false); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"><option value="hin+eng">हिंदी + English</option><option value="hin">केवल हिंदी</option><option value="eng">English only</option></select><span className="text-[11px] text-slate-400">पहली बार इंजन और भाषा डेटा डाउनलोड होगा।</span></div>
        {busy && <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800"><Loader2 className="h-4 w-4 animate-spin"/> {status || 'OCR इंजन तैयार हो रहा है…'}</div>}
        {error && <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
        {status && !busy && <p className="text-xs text-emerald-700">{status}</p>}
      </section>
      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900"><ShieldCheck className="h-4 w-4 text-emerald-600"/> प्राइवेसी और सही उपयोग</div>
        <p className="text-xs leading-relaxed text-slate-600">आपकी चुनी हुई फाइलें OCR के लिए इस ब्राउज़र में प्रोसेस होती हैं; उन्हें हमारे सर्वर पर अपलोड नहीं किया जाता। OCR इंजन और भाषा डेटा पहली बार इंटरनेट से लोड होते हैं।</p>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] leading-relaxed text-amber-900">OCR में गलतियाँ हो सकती हैं। नाम, नंबर, जन्मतिथि और पते को आधिकारिक उपयोग से पहले मूल दस्तावेज़ से मिलान करें।</div>
        <div className="text-[11px] text-slate-500">बेहतर परिणाम के लिए साफ़, सीधी और अच्छी रोशनी वाली स्कैन इमेज उपयोग करें।</div>
        {engineReady && <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/> OCR इंजन तैयार</div>}
      </aside>
    </div>

    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-slate-900">पहचाना गया टेक्स्ट</h3><p className="text-xs text-slate-500">परिणाम को एडिट करना संभव है।</p></div><div className="flex gap-2"><button disabled={!items.length || busy} onClick={() => setItems([])} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5"/> साफ़ करें</button><button disabled={!items.some(i => i.status === 'done')} onClick={() => copyText(items.filter(i => i.status === 'done').map(i => `## ${i.name}\n${i.text}`).join('\n\n'))} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Copy className="h-3.5 w-3.5"/> सभी कॉपी करें</button></div></div>
      {!items.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 text-sm font-semibold text-slate-600">अभी कोई फाइल प्रोसेस नहीं हुई</p><p className="mt-1 text-xs text-slate-400">अपलोड करने के बाद टेक्स्ट यहाँ दिखाई देगा।</p></div> : items.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-indigo-600"/><span className="truncate text-sm font-bold text-slate-800">{item.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{item.status === 'done' ? 'पूरा' : item.status === 'processing' ? 'चल रहा है' : item.status === 'error' ? 'त्रुटि' : 'कतार में'}</span></div>{item.status === 'done' && <div className="flex gap-2"><button onClick={() => void copyText(item.text)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"><Copy className="inline h-3.5 w-3.5 mr-1"/>कॉपी</button><button onClick={() => downloadText(item)} className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white"><Download className="inline h-3.5 w-3.5 mr-1"/>TXT</button></div>}</div>
        {item.status === 'processing' && <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{width: `${item.progress}%`}}/></div>}
        {item.error && <p className="text-xs text-rose-700">{item.error}</p>}
        {item.status === 'done' && <textarea value={item.text} onChange={e => updateItem(item.id, {text:e.target.value})} rows={Math.min(14, Math.max(4, item.text.split('\n').length))} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 focus:border-indigo-400 focus:outline-none" placeholder="पहचाना गया टेक्स्ट यहाँ आएगा…"/>}
      </article>)}
    </section>
  </div>;
};
