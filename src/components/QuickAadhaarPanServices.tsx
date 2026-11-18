import React, { useMemo, useState } from 'react';
import { ArrowRight, Search, ShieldCheck, Fingerprint, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type QuickService = {
  id: string;
  group: 'aadhaar' | 'pan';
  title: string;
  hindi: string;
  keywords: string[];
  note?: string;
};

const QUICK_SERVICES: QuickService[] = [
  { id: 'aadhaar-address-doc', group: 'aadhaar', title: 'Aadhaar Address Update (Document Based)', hindi: 'आधार एड्रेस अपडेट (डॉक्यूमेंट बेस्ड)', keywords: ['address', 'change address', 'पता', 'एड्रेस'] },
  { id: 'aadhaar-co', group: 'aadhaar', title: 'Aadhaar C/O / Father Name in Address', hindi: 'आधार में C/O / पिता का नाम (एड्रेस)', keywords: ['father', 'father name', 'c/o', 'care of', 'पिता', 'पिताजी'] },
  { id: 'aadhaar-lost', group: 'aadhaar', title: 'Find / Retrieve Aadhaar Number', hindi: 'आधार नंबर फाइंड / वापस पाना', keywords: ['find aadhaar', 'lost aadhaar', 'retrieve', 'आधार नंबर खोजें', 'खोया आधार'] },
  { id: 'aadhaar-download', group: 'aadhaar', title: 'Download e-Aadhaar', hindi: 'ई-आधार डाउनलोड', keywords: ['download', 'pdf', 'ई आधार', 'डाउनलोड'] },
  { id: 'pan-correction', group: 'pan', title: 'PAN Correction (Name, Father Name, DOB, Mobile)', hindi: 'पैन करेक्शन (नाम, पिता का नाम, जन्मतिथि, मोबाइल)', keywords: ['pan name', 'father name', 'dob', 'date of birth', 'mobile', 'पिता', 'जन्मतिथि', 'मोबाइल'] },
  { id: 'pan-photo-signature', group: 'pan', title: 'PAN Photo / Signature Update', hindi: 'पैन फोटो / सिग्नेचर अपडेट', keywords: ['photo', 'signature', 'फोटो', 'हस्ताक्षर', 'सिग्नेचर'] },
];

export default function QuickAadhaarPanServices() {
  const { isHindi } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<'all' | 'aadhaar' | 'pan'>('all');
  const [selectedId, setSelectedId] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return QUICK_SERVICES.filter((item) => activeGroup === 'all' || item.group === activeGroup)
      .filter((item) => !q || [item.title, item.hindi, ...item.keywords].some((value) => value.toLocaleLowerCase().includes(q)));
  }, [search, activeGroup]);

  const selected = QUICK_SERVICES.find((item) => item.id === selectedId);

  return (
    <section id="quick-aadhaar-pan" className="relative z-20 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8" aria-label="Quick Aadhaar and PAN services">
      <div className="overflow-visible rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/70 to-blue-50/70 p-4 shadow-[0_14px_34px_-24px_rgba(15,23,42,.5)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-800">
              <ShieldCheck size={14} /> {isHindi ? 'त्वरित सरकारी सेवा' : 'QUICK GOVERNMENT SERVICES'}
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              {isHindi ? 'Aadhaar और PAN सेवाएँ' : 'Aadhaar & PAN Services'}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">
              {isHindi ? 'अपना काम खोजें और सेवा चुनें।' : 'Search and select the service you need.'}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-xl">
            <div className="flex gap-2" role="group" aria-label="Service category">
              <button type="button" onClick={() => { setActiveGroup('all'); setShowResults(true); }} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeGroup === 'all' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>{isHindi ? 'सभी' : 'All'}</button>
              <button type="button" onClick={() => { setActiveGroup('aadhaar'); setShowResults(true); }} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeGroup === 'aadhaar' ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'}`}><Fingerprint size={13} /> Aadhaar</button>
              <button type="button" onClick={() => { setActiveGroup('pan'); setShowResults(true); }} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeGroup === 'pan' ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}><CreditCard size={13} /> PAN</button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setShowResults(true); setSelectedId(''); }}
                onFocus={() => setShowResults(true)}
                onKeyDown={(event) => { if (event.key === 'Escape') setShowResults(false); }}
                placeholder={isHindi ? 'काम खोजें — जैसे आधार पता, पैन पिता का नाम…' : 'Search a service — e.g. Aadhaar address, PAN father name…'}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-inner outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                aria-label={isHindi ? 'सेवा खोजें' : 'Search services'}
              />
              {showResults && (
                <div className="absolute left-0 right-0 top-[calc(100%+7px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
                  {results.length ? results.map((item) => (
                    <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setSearch(isHindi ? item.hindi : item.title); setShowResults(false); }} className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-amber-50 focus:bg-amber-50 focus:outline-none">
                      <span className="min-w-0"><strong className="block text-sm font-bold text-slate-800">{isHindi ? item.hindi : item.title}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{item.group === 'aadhaar' ? 'Aadhaar' : 'PAN'} · {isHindi ? 'सेवा चुनें' : 'Select service'}</span></span>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-amber-700" />
                    </button>
                  )) : <p className="px-3 py-4 text-center text-xs text-slate-500">{isHindi ? 'कोई मिलती-जुलती सेवा नहीं मिली।' : 'No matching service found.'}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 border-t border-amber-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-5 text-slate-500">{selected ? (isHindi ? `चुनी गई सेवा: ${selected.hindi}` : `Selected: ${selected.title}`) : (isHindi ? 'आधार और PAN की उपलब्ध सेवाएँ खोजकर चुनें।' : 'Choose from the available Aadhaar and PAN services.')}</p>
          <a href={selected ? `/digital-seva?quickService=${encodeURIComponent(selected.id)}` : '/digital-seva'} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition ${selected ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md hover:from-amber-700 hover:to-amber-800' : 'border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-800'}`}>
            {isHindi ? 'आगे बढ़ें' : 'Continue'} <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
