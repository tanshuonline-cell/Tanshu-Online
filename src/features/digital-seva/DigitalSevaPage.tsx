import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, CalendarClock, CheckCircle2, ChevronDown, Clock3, FileCheck2, FileText, Fingerprint, Landmark, LifeBuoy, Search, ShieldCheck, Sparkles, WalletCards, X, Globe } from 'lucide-react';
import { SEVA_CATEGORIES, SEVA_SERVICES, searchSevaServices, type SevaCategory, type SevaService } from './serviceCatalog';
import { SEVA_SERVICE_HINDI } from './serviceCatalogHindi';
import RefundPolicyNotice from './RefundPolicyNotice';
import DigitalSevaApplicationForm, { type DigitalSevaReceiptData } from './DigitalSevaApplicationForm';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';
import './digitalSeva.css';

const categoryIcon: Record<string, React.ElementType> = {
  'id-card': FileText, fingerprint: Fingerprint, 'file-check': FileCheck2, vote: BadgeCheck,
  wheat: Sparkles, landmark: Landmark, 'clipboard-list': BookOpenCheck, 'file-pdf': FileText, files: FileCheck2, globe: Globe,
};

function ServiceCard({ service, onSelect, hindi, highlighted }: { service: SevaService; onSelect: (service: SevaService) => void; hindi: boolean; highlighted: boolean }) {
  const category = SEVA_CATEGORIES.find((item) => item.id === service.category);
  return (
    <article id={`ds-service-${service.id}`} className={`ds-service-card${highlighted ? ' ds-search-highlight' : ''}`} aria-current={highlighted ? 'true' : undefined}>
      <div className="ds-service-card-top"><span className="ds-service-icon"><FileText size={19} /></span><span className="ds-service-tag">{hindi ? category?.hindi : category?.label}</span></div>
      <h3>{hindi ? service.hindi : service.name}</h3>
      <p className="ds-service-hindi">{hindi ? service.name : service.hindi}</p>
      <p className="ds-service-description">{hindi ? (SEVA_SERVICE_HINDI[service.id]?.descriptionHindi || service.description) : service.description}</p>
      <div className="ds-service-meta"><span><WalletCards size={14} /> {hindi ? 'विवरण में शुल्क देखें' : 'Fees shown in details'}</span><span><Clock3 size={14} /> {hindi ? 'उपलब्धता और पात्रता लागू' : service.availability}</span></div>
      <button className="ds-text-button" onClick={() => onSelect(service)}>{hindi ? 'विवरण देखें' : 'View details'} <ArrowRight size={15} /></button>
    </article>
  );
}

export default function DigitalSevaPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const hindi = language === 'hi';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SevaCategory | 'all'>('all');
  const [selected, setSelected] = useState<SevaService | null>(null);
  const serviceHindi = selected ? { ...selected, ...SEVA_SERVICE_HINDI[selected.id] } : null;
  const [showAll, setShowAll] = useState(false);
  const [searchTarget, setSearchTarget] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [trackingReference, setTrackingReference] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [bookingReceipt, setBookingReceipt] = useState<DigitalSevaReceiptData | null>(null);
  useEffect(() => {
    try {
      const savedServiceId = window.localStorage.getItem('tanshu-digital-seva-active-service');
      const savedService = savedServiceId ? SEVA_SERVICES.find((item) => item.id === savedServiceId) : null;
      if (savedService) {
        setSelected(savedService);
        setShowBookingForm(true);
      }
    } catch { /* browser storage may be disabled */ }
  }, []);
  const results = useMemo(() => {
    const found = query.trim() ? searchSevaServices(query) : SEVA_SERVICES;
    return found.filter((service) => activeCategory === 'all' || service.category === activeCategory);
  }, [query, activeCategory]);

  useEffect(() => {
    document.title = 'Digital Seva Center | TANSHU ONLINE';
    const description = 'Explore digital assistance for government services, documents and PDF tasks at TANSHU ONLINE.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    return () => { document.title = 'TANSHU ONLINE | Online Tools, Government Services & Video Guides'; };
  }, []);

  const scrollToServices = () => document.getElementById('ds-government-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const runServiceSearch = () => {
    const matches = searchSevaServices(query);
    setActiveCategory('all');
    setShowAll(true);
    setSearchTarget(matches[0]?.id || null);
    setSearchAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    if (!searchTarget || !searchAttempt) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`ds-service-${searchTarget}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const clear = window.setTimeout(() => setSearchTarget(null), 3600);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(clear);
    };
  }, [searchAttempt, searchTarget, results, showAll]);

  const openBookingForm = () => {
    setBookingReference('');
    setBookingReceipt(null);
    try { if (selected) window.localStorage.setItem('tanshu-digital-seva-active-service', selected.id); } catch { /* browser storage may be disabled */ }
    setShowBookingForm(true);
  };
  const lookupTracking = async (event?: React.FormEvent<HTMLFormElement>, reference = trackingReference) => {
    event?.preventDefault();
    const bookingReferenceValue = reference.trim().toUpperCase();
    setTrackingReference(bookingReferenceValue);
    setTrackingError('');
    setTrackingResult(null);
    if (!/^DS-\d{8}-[0-9A-F]{10}$/.test(bookingReferenceValue)) {
      setTrackingError(hindi ? 'कृपया रसीद पर दिया गया पूरा बुकिंग रेफरेंस भरें।' : 'Enter the complete booking reference printed on your receipt.');
      return;
    }
    setTrackingLoading(true);
    try {
      const response = await fetch('/api/digital-seva/track', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingReference: bookingReferenceValue })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.booking) throw new Error(data.error || 'Could not load request status.');
      setTrackingResult(data.booking);
    } catch (error: any) {
      setTrackingError(error?.message || 'Could not load request status. Please try again.');
    } finally { setTrackingLoading(false); }
  };
  const formatTrackingTime = (value?: string | null) => {
    if (!value) return hindi ? 'अभी तय नहीं' : 'Not set yet';
    const date = new Date(value.endsWith('Z') ? value : `${value.replace(' ', 'T')}Z`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  };
  const statusLabel = (status: string) => ({
    RECEIVED: hindi ? 'अनुरोध प्राप्त हुआ' : 'Request Received',
    IN_REVIEW: hindi ? 'दस्तावेज़ जाँच में' : 'Document Review',
    WAITING_FOR_CUSTOMER: hindi ? 'ग्राहक की जानकारी चाहिए' : 'Waiting for Customer',
    IN_PROGRESS: hindi ? 'काम चल रहा है' : 'Work in Progress',
    COMPLETED: hindi ? 'काम पूरा हुआ' : 'Completed',
    CANCELLED: hindi ? 'रद्द' : 'Cancelled'
  } as Record<string, string>)[status] || status.replaceAll('_', ' ');

  const openCustomerReceipt = () => {
    if (!bookingReference || !selected || !bookingReceipt) return;
    const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
    const mask = (key: string, value: string) => {
      const digits = value.replace(/\D/g, '');
      if (/aadhaar|uid/i.test(key)) return digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : 'Protected';
      if (/pan(number|no)?$/i.test(key)) return digits.length >= 4 ? `XXXXXX${digits.slice(-4)}` : 'Protected';
      return value;
    };
    const fields = Object.entries(bookingReceipt.fieldValues || {}).filter(([key, value]) => value.trim() && !key.endsWith('Hindi'));
    const rows = fields.map(([key, value]) => {
      const hindi = bookingReceipt.fieldValues[`${key}Hindi`] || '';
      const label = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
      return `<tr><th>${escape(label)}</th><td>${escape(mask(key, value))}${hindi ? `<div class="hi"><small>हिंदी</small> ${escape(hindi)}</div>` : ''}</td></tr>`;
    }).join('');
    const options = Object.entries(bookingReceipt.serviceOptions || {}).filter(([, value]) => value.trim()).map(([key, value]) => `<tr><th>${escape(key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'))}</th><td>${escape(value)}</td></tr>`).join('');
    const docs = bookingReceipt.selectedDocuments.map((item) => item === 'other' ? bookingReceipt.otherDocumentName || 'Other document' : item.replace(/[-_]/g, ' '));
    const submitted = new Date(bookingReceipt.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(bookingReference)} - TANSHU ONLINE</title><style>
      *{box-sizing:border-box}body{margin:0;padding:24px;background:#f4f4f4;color:#191919;font:13px Arial,"Noto Sans Devanagari",sans-serif}.sheet{max-width:790px;margin:auto;background:#fff;padding:30px 34px;border:1px solid #ddd}.brand{text-align:center;border-bottom:2px solid #a51f32;padding-bottom:12px}.brand h1{margin:0;color:#a51f32;font-size:27px;letter-spacing:1px}.brand p{margin:5px 0;color:#555;font-size:10px}.heading{text-align:center;margin:17px 0}.heading h2{font-size:17px;margin:0}.ref{display:flex;justify-content:space-between;gap:10px;padding:11px;background:#fff7f7;border:1px solid #eadada}.ref b{color:#a51f32}section{margin-top:16px}h3{font-size:12px;color:#84202e;background:#f8eeee;padding:8px;border-left:3px solid #a51f32}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}th{width:38%;background:#fafafa}.hi{margin-top:5px;color:#444}.hi small{color:#777;font-weight:bold}.customer{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.cell{border:1px solid #ddd;padding:9px}.cell small{display:block;color:#777;font-size:9px;margin-bottom:4px}.cell b{overflow-wrap:anywhere}.note{margin-top:16px;border-top:1px solid #ddd;padding-top:10px;color:#555;font-size:10px;line-height:1.5}.actions{text-align:center;margin:15px}.actions button{background:#922331;color:white;border:0;border-radius:7px;padding:11px 18px;font-weight:bold;cursor:pointer}@page{size:A4;margin:12mm}@media print{body{padding:0;background:white}.sheet{border:0;padding:0}.actions{display:none}}@media(max-width:560px){body{padding:0}.sheet{padding:18px 14px}.customer{grid-template-columns:1fr}.ref{display:grid}}
      </style></head><body><main class="sheet"><header class="brand"><h1>TANSHU ONLINE</h1><p>RELIABLE • SECURE • PROFESSIONAL SERVICE</p></header><div class="heading"><h2>DIGITAL SEVA APPLICATION ACKNOWLEDGEMENT</h2><p>डिजिटल सेवा आवेदन प्राप्ति रसीद</p></div><div class="ref"><span>Booking Reference / बुकिंग संदर्भ</span><b>${escape(bookingReference)}</b></div><section><h3>01. Applicant Details / आवेदक की जानकारी</h3><div class="customer"><div class="cell"><small>Customer Name / ग्राहक का नाम</small><b>${escape(bookingReceipt.customerName)}</b></div><div class="cell"><small>Mobile / मोबाइल</small><b>${escape(bookingReceipt.customerPhone.length===10 ? bookingReceipt.customerPhone.slice(0,2)+'XXXXXX'+bookingReceipt.customerPhone.slice(-2) : '—')}</b></div><div class="cell"><small>Service / सेवा</small><b>${escape(selected.name)} / ${escape(selected.hindi)}</b></div><div class="cell"><small>Email / ईमेल</small><b>${escape(bookingReceipt.customerEmail || '—')}</b></div></div></section><section><h3>02. Application Details / आवेदन का विवरण</h3><table><tbody>${rows || '<tr><td colspan="2">No additional details provided.</td></tr>'}${options}</tbody></table></section><section><h3>03. Documents Submitted / जमा दस्तावेज़</h3><p>${escape(docs.join(' • ') || 'No documents selected')}</p></section>${bookingReceipt.taskDetails ? `<section><h3>Customer Instructions / ग्राहक के निर्देश</h3><p>${escape(bookingReceipt.taskDetails)}</p></section>` : ''}<section><h3>Request Status / अनुरोध की स्थिति</h3><p><b>REQUEST RECEIVED / अनुरोध प्राप्त हुआ</b></p><p>Submitted: ${escape(submitted)}</p></section><div class="note">This is a TANSHU ONLINE service request acknowledgement, not proof that a government application has been filed.<br>यह TANSHU ONLINE की सेवा अनुरोध रसीद है, सरकारी आवेदन जमा होने का प्रमाण नहीं।</div></main><div class="actions"><button onclick="window.print()">Download / Save as PDF / Print</button></div></body></html>`;
    const popup = window.open('', '_blank');
    if (!popup) { window.alert(hindi ? 'कृपया इस वेबसाइट के लिए पॉप-अप की अनुमति दें।' : 'Please allow pop-ups for this website to open your receipt.'); return; }
    popup.document.open(); popup.document.write(html); popup.document.close(); popup.focus();
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    try { window.localStorage.removeItem('tanshu-digital-seva-active-service'); } catch { /* browser storage may be disabled */ }
  };

  return (
    <div className="ds-page" lang={language === 'hi' ? 'hi' : 'en'}>
      <div className="ds-topline"><span>{hindi ? 'स्वतंत्र डिजिटल सहायता' : 'INDEPENDENT DIGITAL ASSISTANCE'}</span><span><ShieldCheck size={14} /> {hindi ? 'गोपनीयता • स्पष्ट शुल्क • पारदर्शी प्रक्रिया' : 'Privacy-first • Clear fees • Transparent process'}</span></div>
      <header className="ds-header">
        <a href="/" className="ds-brand" aria-label="TANSHU ONLINE home"><img className="ds-brand-photo" src="/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg" alt="TANSHU ONLINE" /><span><strong><span className="ds-brand-name-dark">TANSHU</span> <span className="ds-brand-name-accent">ONLINE</span></strong><small>{hindi ? 'डिजिटल सेवा केंद्र' : 'Digital Seva Center'}</small></span></a>
        <nav><a href="/">{hindi ? 'होम' : 'Home'}</a><a href="#ds-government-services">{hindi ? 'सेवाएँ' : 'Services'}</a><a href="#ds-document-services">{hindi ? 'PDF और दस्तावेज़' : 'PDF & Documents'}</a><button onClick={() => setShowTrackingInfo(true)}>{hindi ? 'अनुरोध ट्रैक करें' : 'Track Request'}</button><a className="ds-back-home" href="/" aria-label="Back to TANSHU ONLINE homepage">{hindi ? '← मुख्य पृष्ठ' : '← Back to Home'}</a><div className="ds-language-switch" role="group" aria-label="Choose language"><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div></nav>
      </header>

      <main>
        <section className="ds-hero">
          <div className="ds-hero-copy">
            <div className="ds-eyebrow"><span /> {hindi ? 'आपका डिजिटल सेवा केंद्र' : 'YOUR DIGITAL SERVICE DESK'}</div>
            <h1>{hindi ? <>सरकारी सेवाएँ।<br /><em>अब और आसान।</em></> : <>Government services.<br /><em>Made simpler.</em></>}</h1>
            <p>{hindi ? 'ज़रूरी सहायता पाएँ, दस्तावेज़ और शुल्क समझें और एक स्पष्ट प्रक्रिया अपनाएँ — सब कुछ एक ही जगह।' : 'Find the help you need, understand the documents and fees, and follow a clear process — all in one place.'}</p>
            <div className="ds-hero-points"><span><CheckCircle2 size={16} /> {hindi ? 'सेवा की स्पष्ट जानकारी' : 'Clear service information'}</span><span><CheckCircle2 size={16} /> {hindi ? 'कोई छिपा हुआ शुल्क नहीं' : 'No hidden fee promise'}</span></div>
          </div>
          <div className="ds-hero-art" aria-label="Digital service assistance illustration">
            <div className="ds-art-orbit ds-orbit-one" /><div className="ds-art-orbit ds-orbit-two" />
            <div className="ds-art-card ds-art-card-main"><div className="ds-art-logo"><Fingerprint size={25} /></div><div><b>{hindi ? 'डिजिटल सेवा' : 'Digital Seva'}</b><small>{hindi ? 'एक जगह। स्पष्ट मार्गदर्शन।' : 'One place. Clear guidance.'}</small></div><BadgeCheck className="ds-art-check" size={22} /></div>
            <div className="ds-art-float ds-float-top"><FileCheck2 size={18} /><span>{hindi ? 'दस्तावेज़ तैयार' : 'Document ready'}</span></div>
            <div className="ds-art-float ds-float-bottom"><ShieldCheck size={18} /><span>{hindi ? 'सुरक्षा को प्राथमिकता' : 'Secure by design'}</span></div>
          </div>
        </section>

        <section className="ds-search-section" aria-label={hindi ? 'सेवाएँ खोजें' : 'Search services'}>
          <div className="ds-search-heading"><div><span className="ds-kicker">{hindi ? 'सही सेवा खोजें' : 'FIND THE RIGHT SERVICE'}</span><h2>{hindi ? 'आपको किस काम में सहायता चाहिए?' : 'What do you need help with?'}</h2></div><span className="ds-language-note">{hindi ? 'हिंदी और English दोनों में खोजें' : 'Search in Hindi and English'}</span></div>
          <label className="ds-searchbox"><Search size={22} /><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveCategory('all'); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); runServiceSearch(); } }} placeholder={hindi ? 'जैसे “वोटर आईडी सुधार”, “पैन करेक्शन”, “आधार पता”...' : 'Try “Voter ID correction”, “PAN correction”, “Aadhaar address”...'} aria-label={hindi ? 'सेवा खोजें' : 'Search for a service'} /><button type="button" className="ds-search-submit" onClick={runServiceSearch}>{hindi ? 'खोजें' : 'Search'} <ArrowRight size={15} /></button>{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setSearchTarget(null); }}><X size={17} /></button>}</label>
          <div className="ds-search-hints"><span>{hindi ? 'लोकप्रिय खोज:' : 'Popular searches:'}</span>{['PDF size kam', 'PDF jodna', 'आधार पता', 'Photo 20 KB'].map((hint) => <button key={hint} onClick={() => { setQuery(hint); setActiveCategory('all'); }}>{hint}</button>)}</div>
        </section>

        <section className="ds-section" id="ds-government-services">
          <div className="ds-section-heading"><div><span className="ds-kicker">{hindi ? 'सरकारी और नागरिक सेवाएँ' : 'GOVERNMENT & CITIZEN SERVICES'}</span><h2>{hindi ? 'सेवा की श्रेणी चुनें' : 'Choose a service category'}</h2><p>{hindi ? 'लोकप्रिय सेवाएँ देखें और शुरू करने से पहले ज़रूरी जानकारी जानें।' : 'Explore popular services and see what may be required before you begin.'}</p></div><button className="ds-outline-button" onClick={() => { setActiveCategory('all'); setShowAll(true); scrollToServices(); }}>{hindi ? 'सभी सेवाएँ देखें' : 'View all services'} <ArrowUpRight size={16} /></button></div>
          <div className="ds-category-grid">
            {SEVA_CATEGORIES.slice(0, 8).map((category, index) => {
              const Icon = categoryIcon[category.icon] || FileText;
              return <button key={category.id} className={`ds-category-card ds-category-${index}`} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="ds-category-icon"><Icon size={22} /></span><strong>{hindi ? category.hindi : category.label}</strong><small>{hindi ? category.label : category.hindi}</small><span className="ds-category-arrow"><ArrowUpRight size={17} /></span>
              </button>;
            })}
          </div>
        </section>

        <section className="ds-section ds-results-section" id="ds-service-results">
          <div className="ds-section-heading"><div><span className="ds-kicker">{query ? (hindi ? 'खोज परिणाम' : 'SEARCH RESULTS') : (hindi ? 'लोकप्रिय सेवाएँ' : 'POPULAR SERVICES')}</span><h2>{query ? `“${query}” के परिणाम` : (hindi ? 'लोकप्रिय सरकारी सेवाएँ' : 'Popular government services')}</h2><p>{hindi ? `इस सूची में ${results.length} मिलती-जुलती सेवाएँ हैं।` : `${results.length} matching services in this catalogue preview.`}</p></div><button className="ds-clear-filter" onClick={() => { setQuery(''); setActiveCategory('all'); }}>{hindi ? 'फ़िल्टर हटाएँ' : 'Clear filters'}</button></div>
          <div className="ds-filter-row"><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>{hindi ? 'सभी' : 'All'}</button>{SEVA_CATEGORIES.slice(0, 7).map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{hindi ? category.hindi : category.label}</button>)}</div>
          {results.length ? <div className="ds-service-grid">{(showAll ? results : results.slice(0, 6)).map((service) => <ServiceCard key={service.id} service={service} onSelect={setSelected} hindi={hindi} highlighted={searchTarget === service.id} />)}</div> : <div className="ds-empty"><Search size={28} /><h3>{hindi ? 'कोई सटीक परिणाम नहीं मिला' : 'No exact match yet'}</h3><p>{hindi ? 'छोटा शब्द, हिंदी शब्द या आम काम का नाम लिखकर देखें।' : 'Try a shorter phrase, a Hindi word, or a common task name.'}</p><button onClick={() => { setQuery(''); setActiveCategory('all'); }}>{hindi ? 'सभी सेवाएँ दिखाएँ' : 'Show all services'}</button></div>}
          {!showAll && results.length > 6 && <button className="ds-load-more" onClick={() => setShowAll(true)}>{hindi ? `सभी ${results.length} सेवाएँ दिखाएँ` : `Show all ${results.length} matching services`} <ChevronDown size={16} /></button>}
        </section>

        <section className="ds-document-band" id="ds-document-services">
          <div className="ds-document-intro"><span className="ds-kicker">{hindi ? 'रोज़मर्रा के फ़ाइल और दस्तावेज़ कार्य' : 'EVERYDAY FILE & DOCUMENT HELP'}</span><h2>{hindi ? 'दस्तावेज़ और PDF सेवाएँ' : 'Document & PDF Services'}</h2><p>{hindi ? 'फ़ाइल का आकार कम करना, इमेज बदलना, स्कैन साफ़ करना और दस्तावेज़ फ़ॉर्मेट करना — आसान चरणों में।' : 'Small file-size limits, image conversions, scan cleanup and document formatting — explained in simple steps.'}</p><button className="ds-light-button" onClick={() => { setActiveCategory('pdf'); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}>{hindi ? 'PDF सेवाएँ देखें' : 'Explore PDF services'} <ArrowRight size={16} /></button></div>
          <div className="ds-document-tiles">{SEVA_CATEGORIES.slice(8).map((category) => { const Icon = categoryIcon[category.icon] || FileText; return <button key={category.id} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}><Icon size={21} /><strong>{hindi ? category.hindi : category.label}</strong><span>{hindi ? 'इस श्रेणी की डिजिटल सहायता सेवाएँ देखें।' : category.description}</span><ArrowUpRight size={16} /></button>; })}</div>
        </section>

        <section className="ds-trust-row"><div><ShieldCheck size={22} /><span><b>{hindi ? 'आपके दस्तावेज़ महत्वपूर्ण हैं' : 'Your documents matter'}</b><small>{hindi ? 'चुनी गई सेवा के लिए केवल ज़रूरी जानकारी माँगी जाएगी।' : 'We will request only what is needed for the selected service.'}</small></span></div><div><WalletCards size={22} /><span><b>{hindi ? 'शुल्क अलग-अलग दिखेंगे' : 'Fees shown separately'}</b><small>{hindi ? 'सेवा शुल्क और सरकारी शुल्क कभी मिलाए नहीं जाएँगे।' : 'Service charges and government fees will never be mixed.'}</small></span></div><div><LifeBuoy size={22} /><span><b>{hindi ? 'व्यक्तिगत सहायता' : 'Human assistance'}</b><small>{hindi ? 'कोई चरण समझ न आए तो आगे बढ़ने से पहले पूछें।' : 'Ask before proceeding if a step is unclear.'}</small></span></div></section>

        <section className="ds-bottom-cta"><div><span className="ds-kicker">{hindi ? 'शुरुआत करने का आसान तरीका' : 'A CLEARER WAY TO GET STARTED'}</span><h2>{hindi ? 'समझ नहीं आ रहा कौन-सी सेवा चाहिए?' : 'Not sure which service you need?'}</h2><p>{hindi ? 'अपने सामान्य शब्दों में खोजें। हम सही सेवा ढूँढ़ने में मदद करेंगे।' : 'Search using the words you normally use. We’ll help you find the closest matching service.'}</p></div><button onClick={() => { document.querySelector<HTMLInputElement>('.ds-searchbox input')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{hindi ? 'सेवाएँ खोजें' : 'Search services'} <Search size={17} /></button></section>
      </main>

      <footer className="ds-footer"><a href="/" className="ds-brand"><span className="ds-brand-mark">T</span><span><strong>TANSHU ONLINE</strong><small>Digital Seva Center</small></span></a><p>{hindi ? 'स्वतंत्र डिजिटल सहायता प्लेटफ़ॉर्म। यह सरकारी वेबसाइट या सरकारी विभाग नहीं है।' : 'Independent digital assistance platform. Not a government website or government department.'}</p><span>© {new Date().getFullYear()} TANSHU ONLINE</span></footer>

      {selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="ds-detail-modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'सेवा का विवरण' : 'SERVICE DETAILS'}</span><h2>{hindi ? selected.hindi : selected.name}</h2><p className="ds-modal-hindi">{hindi ? selected.name : selected.hindi}</p><p>{hindi ? (serviceHindi?.descriptionHindi || selected.description) : selected.description}</p><div className="ds-detail-grid"><div><small>{hindi ? 'उपलब्धता' : 'AVAILABILITY'}</small><b>{hindi ? (serviceHindi?.availabilityHindi || selected.availability) : selected.availability}</b></div><div><small>{hindi ? 'सहायता का प्रकार' : 'ASSISTANCE TYPE'}</small><b>{hindi ? (serviceHindi?.assistanceHindi || selected.assistance) : selected.assistance}</b></div></div><RefundPolicyNotice service={selected} language={language} /><h3>{hindi ? 'तैयार रखने वाले दस्तावेज़ / जानकारी' : 'Documents / information to prepare'}</h3><ul>{(hindi ? (serviceHindi?.documentsHindi || selected.documents) : selected.documents).map((item) => <li key={item}>{item}</li>)}</ul>{(hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note) && <div className="ds-important-note"><ShieldCheck size={18} /><span>{hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note}</span></div>}<div className="ds-preview-notice"><CalendarClock size={18} /><span>{hindi ? 'Digital Seva की आवश्यक Preview database migrations लागू होने के बाद यह Preview सेवा अनुरोध दर्ज कर सकता है। यह सरकारी आवेदन जमा नहीं करता और न ही भुगतान लेता है।' : 'This Preview can record a service request after all required Digital Seva Preview database migrations are applied. It does not submit a government application or collect payment.'}</span></div><div className="ds-modal-actions"><button className="ds-modal-book" onClick={openBookingForm}>{hindi ? 'बुकिंग अनुरोध करें' : 'Request a booking'} <ArrowRight size={16} /></button><button className="ds-modal-done" onClick={() => setSelected(null)}>{hindi ? 'बंद करें' : 'Close'}</button></div></section></div>}

      {showBookingForm && selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowBookingForm(false)}><section className="ds-detail-modal ds-booking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'बुकिंग अनुरोध' : 'Request a booking'} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={closeBookingForm} aria-label="Close"><X size={20} /></button>{bookingReference ? <><span className="ds-kicker">{hindi ? 'अनुरोध प्राप्त हुआ' : 'REQUEST RECEIVED'}</span><h2>{hindi ? 'आपका बुकिंग अनुरोध सुरक्षित हो गया है' : 'Your booking request is saved'}</h2><p>{hindi ? <>हमने <strong>{selected.hindi}</strong> के लिए आपका अनुरोध दर्ज कर लिया है। यह सहायता का अनुरोध है, सरकारी आवेदन जमा होना नहीं।</> : <>We have recorded your request for <strong>{selected.name}</strong>. This is a request for assistance, not a government application submission.</>}</p><div className="ds-booking-reference"><small>{hindi ? 'आपका बुकिंग रेफरेंस' : 'YOUR BOOKING REFERENCE'}</small><strong>{bookingReference}</strong></div><button type="button" className="ds-modal-book" onClick={openCustomerReceipt} disabled={!bookingReceipt}>{hindi ? 'रसीद डाउनलोड / प्रिंट करें' : 'Download / Print Application Slip'} <FileText size={16} /></button><p className="ds-booking-help">{hindi ? 'इस रेफरेंस को सुरक्षित रखें। आप इसी नंबर से अपने काम का स्टेटस देख सकते हैं।' : 'Keep this reference safe. You can use it to check your request status anytime.'}</p><div className="ds-modal-actions"><button className="ds-modal-book" onClick={() => { setTrackingReference(bookingReference); setTrackingResult(null); setTrackingError(''); setShowTrackingInfo(true); closeBookingForm(); }}>{hindi ? 'स्टेटस देखें' : 'Track status'} <ArrowRight size={15} /></button><button className="ds-modal-done" onClick={() => { closeBookingForm(); setSelected(null); }}>{hindi ? 'ठीक है' : 'Done'}</button></div></> : <><span className="ds-kicker">{hindi ? 'बुकिंग अनुरोध' : 'BOOKING REQUEST'}</span><h2>{hindi ? 'इस सेवा के लिए अनुरोध करें' : 'Request this service'}</h2><p>{hindi ? 'सेवा:' : 'Service:'} <strong>{hindi ? selected.hindi : selected.name}</strong></p><div className="ds-booking-fee-summary"><strong>{hindi ? 'अनुरोध से पहले शुल्क विवरण' : 'Fee summary before request'}</strong><p><b>{hindi ? 'सरकारी / प्रदाता शुल्क:' : 'Government / provider fee:'}</b> {getServiceFeeDisclosure(selected).governmentFee}</p><p><b>{hindi ? 'TANSHU ONLINE सेवा शुल्क:' : 'TANSHU ONLINE fee:'}</b> {getServiceFeeDisclosure(selected).serviceFee}</p><p>{hindi ? <><b>रिफंड:</b> सरकारी/प्रदाता रिफंड सेवा विवरण में दिए गए आधिकारिक मार्ग के अनुसार होगा। TANSHU शुल्क में समायोजन वास्तव में किए गए काम और नीचे दी गई रिफंड नीति पर आधारित होगा।</> : <><b>Refund:</b> Government/provider refund follows the exact official route shown in the service details. TANSHU fee adjustments are based on work actually completed and the Refund Policy below.</>}</p><small>{hindi ? 'इस Preview में कोई भुगतान नहीं लिया जाता। लाइव भुगतान से पहले टैक्स, प्रदाता शुल्क और अंतिम कुल राशि अलग-अलग दिखाई जाएगी।' : 'No payment is collected in this Preview. Any tax, provider charge and final total must be itemised before live payment.'}</small></div><DigitalSevaApplicationForm service={selected} language={language} onSubmitted={(reference, receipt) => { try { window.localStorage.removeItem('tanshu-digital-seva-active-service'); } catch { /* browser storage may be disabled */ } setBookingReference(reference); setBookingReceipt(receipt); }} /></>}</section></div>}
      {showTrackingInfo && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowTrackingInfo(false)}><section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'अनुरोध ट्रैकिंग' : 'Request tracking'} onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setShowTrackingInfo(false)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'अनुरोध ट्रैकिंग' : 'REQUEST TRACKING'}</span><h2>{hindi ? 'अपना सेवा अनुरोध ट्रैक करें' : 'Track your service request'}</h2><p>{hindi ? 'अपनी रसीद पर दिया गया बुकिंग रेफरेंस डालें।' : 'Enter the booking reference printed on your receipt.'}</p><form className="ds-tracking-form" onSubmit={(event) => void lookupTracking(event)}><label>{hindi ? 'बुकिंग रेफरेंस' : 'Booking Reference'}<input value={trackingReference} onChange={(event) => setTrackingReference(event.target.value.toUpperCase())} maxLength={24} placeholder="DS-YYYYMMDD-XXXXXXXXXX" autoComplete="off" /></label><button className="ds-modal-book" type="submit" disabled={trackingLoading}>{trackingLoading ? (hindi ? 'जाँच हो रही है…' : 'Checking…') : (hindi ? 'स्टेटस देखें' : 'Check Status')}</button></form>{trackingError && <p className="ds-booking-error" role="alert">{trackingError}</p>}{trackingResult && <div className="ds-tracking-result"><div className="ds-tracking-result-head"><small>{hindi ? 'बुकिंग रेफरेंस' : 'BOOKING REFERENCE'}</small><strong>{trackingResult.bookingReference}</strong><span className="ds-tracking-status">{statusLabel(trackingResult.status)}</span></div><div className="ds-tracking-meta"><p><b>{hindi ? 'अनुरोध दर्ज:' : 'Request received:'}</b> {formatTrackingTime(trackingResult.createdAt)}</p><p><b>{hindi ? 'आखिरी अपडेट:' : 'Last update:'}</b> {formatTrackingTime(trackingResult.updatedAt)}</p><p><b>{hindi ? 'अनुमानित पूरा होने का समय:' : 'Estimated completion:'}</b> {formatTrackingTime(trackingResult.estimatedCompletionAt)}</p></div><h3>{hindi ? 'काम की प्रगति' : 'Progress updates'}</h3><ol className="ds-tracking-timeline">{(trackingResult.events || []).map((item: any, index: number) => <li key={index}><span className="ds-tracking-dot" /><div><b>{statusLabel(item.status)}</b><small>{formatTrackingTime(item.createdAt)}</small>{item.note && <p>{item.note}</p>}</div></li>)}</ol><p className="ds-tracking-service">{hindi ? 'सेवा:' : 'Service:'} {SEVA_SERVICES.find((service) => service.id === trackingResult.serviceId)?.name || trackingResult.serviceId}</p></div>}<button className="ds-modal-done" onClick={() => setShowTrackingInfo(false)}>{hindi ? 'बंद करें' : 'Close'}</button></section></div>}
    </div>
  );
}
