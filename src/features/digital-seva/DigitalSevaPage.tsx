import React, { useEffect, useMemo, useState } from 'react';
import { TANSHU_PROFILE_PHOTO } from '../../components/Header';
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, CalendarClock, CheckCircle2, ChevronDown, Clock3, FileCheck2, FileText, Fingerprint, Landmark, LifeBuoy, Search, ShieldCheck, Sparkles, WalletCards, X, Globe, Droplets, Code2, Smartphone, Palette } from 'lucide-react';
import { SEVA_CATEGORIES, SEVA_SERVICES, searchSevaServices, type SevaCategory, type SevaService } from './serviceCatalog';
import { SEVA_SERVICE_HINDI } from './serviceCatalogHindi';
import RefundPolicyNotice from './RefundPolicyNotice';
import DigitalSevaApplicationForm, { type DigitalSevaReceiptData } from './DigitalSevaApplicationForm';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';
import { getAutoPaymentQuote } from './autoPaymentPricing';
import { buildDigitalSevaReceiptHtml } from './digitalSevaReceipt';
import './digitalSeva.css';
import WebsiteServicesShowcase from './WebsiteServicesShowcase';
import CreativeServicesStudio from './CreativeServicesStudio';
import DigitalSevaSlipRecovery from './DigitalSevaSlipRecovery';
import DigitalSevaPayNow, { type PrepaidDigitalSevaPayment } from './DigitalSevaPayNow';

type AdminArea = { code: string; name: string; name_local?: string; state_code?: string };

const categoryIcon: Record<string, React.ElementType> = {
  'id-card': FileText, fingerprint: Fingerprint, 'file-check': FileCheck2, vote: BadgeCheck,
  wheat: Sparkles, landmark: Landmark, 'clipboard-list': BookOpenCheck, 'file-pdf': FileText, files: FileCheck2, globe: Globe, image: Sparkles, video: Sparkles, sparkles: Sparkles,
};

function ServiceCard({ service, onSelect, hindi, highlighted }: { service: SevaService; onSelect: (service: SevaService) => void; hindi: boolean; highlighted: boolean }) {
  const category = SEVA_CATEGORIES.find((item) => item.id === service.category);
  return (
    <article id={`ds-service-${service.id}`} className={`ds-service-card${highlighted ? ' ds-search-highlight' : ''}`} aria-current={highlighted ? 'true' : undefined}>
      <div className="ds-service-card-top"><span className="ds-service-icon"><FileText size={19} /></span><span className="ds-service-tag">{hindi ? category?.hindi : category?.label}</span></div>
      <div className="ds-service-title-row"><h3>{hindi ? service.hindi : service.name}</h3>{service.id === 'website-services' && <button type="button" className="ds-premium-sample-cta ds-premium-sample-cta-side" onClick={() => onSelect(service)} aria-label={hindi ? 'प्रीमियम वेबसाइट सैंपल देखने के लिए यहाँ क्लिक करें' : 'Click here to explore premium website samples'}><span className="ds-premium-sample-icon" aria-hidden="true"><Droplets size={20} strokeWidth={1.8} /></span><span className="ds-premium-sample-copy"><strong>{hindi ? 'प्रीमियम वेबसाइट सैंपल देखें' : 'Explore premium website samples'}</strong><small>{hindi ? '19 शानदार डिज़ाइन' : 'Explore 19 premium designs'}</small></span><ArrowRight className="ds-premium-sample-arrow" size={17} /></button>}</div>
      <p className="ds-service-hindi">{hindi ? service.name : service.hindi}</p>
      <p className="ds-service-description">{hindi ? (SEVA_SERVICE_HINDI[service.id]?.descriptionHindi || service.description) : service.description}</p>
      <div className="ds-service-meta"><span><WalletCards size={14} /> {hindi ? 'विवरण में शुल्क देखें' : 'Fees shown in details'}</span><span><Clock3 size={14} /> {hindi ? 'उपलब्धता और पात्रता लागू' : service.availability}</span></div>
      <div className="ds-service-actions">
        <button className="ds-text-button" onClick={() => onSelect(service)}>{hindi ? 'विवरण देखें' : 'View details'} <ArrowRight size={15} /></button>
      </div>
    </article>
  );
}

export default function DigitalSevaPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const hindi = language === 'hi';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SevaCategory | 'all'>('all');
  const [selected, setSelected] = useState<SevaService | null>(null);
  const [showWebsiteShowcase, setShowWebsiteShowcase] = useState(false);
  const [creativeStudioCategory, setCreativeStudioCategory] = useState<'apps' | 'software' | 'design' | null>(null);
  const [states, setStates] = useState<AdminArea[]>([]);
  const [districts, setDistricts] = useState<AdminArea[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const serviceHindi = selected ? { ...selected, ...SEVA_SERVICE_HINDI[selected.id] } : null;
  const [showAll, setShowAll] = useState(false);
  const [searchTarget, setSearchTarget] = useState<string | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [showSlipRecovery, setShowSlipRecovery] = useState(false);
  const [trackingReference, setTrackingReference] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPayNowCenter, setShowPayNowCenter] = useState(false);
  const [paidCheckout, setPaidCheckout] = useState<PrepaidDigitalSevaPayment | null>(null);
  const [bookingReference, setBookingReference] = useState('');
  const [bookingReceipt, setBookingReceipt] = useState<DigitalSevaReceiptData | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('https://india-lgd-index-api.vercel.app/v1/states')
      .then((response) => { if (!response.ok) throw new Error('State directory is temporarily unavailable.'); return response.json(); })
      .then((payload) => {
        if (!payload?.success || !Array.isArray(payload.data)) throw new Error('Could not read the state directory.');
        if (!cancelled) { setStates(payload.data); setLocationError(''); }
      })
      .catch(() => { if (!cancelled) setLocationError(hindi ? 'राज्य/जिला सूची अभी लोड नहीं हो सकी। कृपया थोड़ी देर बाद पुनः प्रयास करें।' : 'The state/district directory could not load. Please retry in a moment.'); });
    return () => { cancelled = true; };
  }, [hindi]);

  useEffect(() => {
    if (!selectedStateCode) { setDistricts([]); setSelectedDistrictCode(''); return; }
    let cancelled = false;
    setLocationLoading(true);
    setDistricts([]);
    setSelectedDistrictCode('');
    fetch(`https://india-lgd-index-api.vercel.app/v1/districts?state=${encodeURIComponent(selectedStateCode)}`)
      .then((response) => { if (!response.ok) throw new Error('District directory is temporarily unavailable.'); return response.json(); })
      .then((payload) => {
        if (!payload?.success || !Array.isArray(payload.data)) throw new Error('Could not read the district directory.');
        if (!cancelled) { setDistricts(payload.data); setLocationError(''); }
      })
      .catch(() => { if (!cancelled) setLocationError(hindi ? 'इस राज्य की जिला सूची अभी लोड नहीं हो सकी।' : 'Districts for this state could not be loaded.'); })
      .finally(() => { if (!cancelled) setLocationLoading(false); });
    return () => { cancelled = true; };
  }, [selectedStateCode, hindi]);

  useEffect(() => {
    try {
      const savedServiceId = window.localStorage.getItem('tanshu-digital-seva-active-service');
      const savedService = savedServiceId ? SEVA_SERVICES.find((item) => item.id === savedServiceId) : null;
      if (savedService && savedService.id !== 'website-services') {
        setSelected(savedService);
        setShowBookingForm(true);
      }
    } catch { /* browser storage may be disabled */ }
  }, []);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem('tanshu-ds-paid-checkout-v1');
      if (!saved) return;
      const parsed = JSON.parse(saved) as { serviceId?: string; payment?: PrepaidDigitalSevaPayment };
      const service = SEVA_SERVICES.find((item) => item.id === parsed.serviceId);
      if (service && parsed.payment?.orderId) {
        setSelected(service);
        setPaidCheckout(parsed.payment);
        setShowBookingForm(true);
      }
    } catch { /* an unavailable or malformed recovery draft is ignored */ }
  }, []);
  const openPayNowCenter = () => setShowPayNowCenter(true);
  const selectedState = states.find((item) => String(item.code) === selectedStateCode);
  const selectedDistrict = districts.find((item) => String(item.code) === selectedDistrictCode);
  const results = useMemo(() => {
    const found = query.trim() ? searchSevaServices(query) : SEVA_SERVICES;
    const isBihar = selectedState?.name.toLocaleLowerCase('en-IN') === 'bihar';
    return found
      .filter((service) => activeCategory === 'all' || service.category === activeCategory)
      .filter((service) => !selectedStateCode || isBihar || !/bihar only/i.test(`${service.availability} ${service.description}`))
      .sort((a, b) => Number(b.id === 'website-services') - Number(a.id === 'website-services'));
  }, [query, activeCategory, selectedStateCode, selectedState]);

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
    const html = buildDigitalSevaReceiptHtml({
      bookingReference,
      customerName: bookingReceipt.customerName,
      customerPhone: bookingReceipt.customerPhone,
      customerEmail: bookingReceipt.customerEmail,
      serviceName: `${selected.name} / ${selected.hindi}`,
      paymentReference: bookingReceipt.paymentOrderId || null,
      status: 'REQUEST RECEIVED / अनुरोध प्राप्त हुआ',
      contactConsentAt: bookingReceipt.submittedAt,
      submittedAt: bookingReceipt.submittedAt,
      termsAcceptedAt: bookingReceipt.termsAcceptedAt,
      termsPolicyVersion: bookingReceipt.termsPolicyVersion,
      refundPolicyAcceptedAt: bookingReceipt.refundAcceptedAt,
      refundPolicyVersion: bookingReceipt.refundPolicyVersion,
      fieldValues: bookingReceipt.fieldValues,
      serviceOptions: bookingReceipt.serviceOptions,
      selectedWork: bookingReceipt.corrections.map((item) => item.replace(/[-_]/g, ' ')),
      documents: bookingReceipt.selectedDocuments.map((item) =>
        item === 'other' ? bookingReceipt.otherDocumentName || 'Other document' : item.replace(/[-_]/g, ' ')
      ),
      customerInstructions: bookingReceipt.taskDetails,
      feeBreakdown: getAutoPaymentQuote(selected) ? {
        governmentFee: getAutoPaymentQuote(selected)!.governmentFee,
        tanshuFee: getAutoPaymentQuote(selected)!.tanshuFee,
        totalAmount: getAutoPaymentQuote(selected)!.totalAmount,
        paymentStatus: bookingReceipt.paymentMode === 'AUTO_PAY' ? 'PAID — Cashfree payment verified / भुगतान सत्यापित' : 'PAYMENT PENDING / भुगतान बाकी'
      } : null
    });
    const popup = window.open('', '_blank');
    if (!popup) {
      window.alert(hindi ? 'कृपया इस वेबसाइट के लिए पॉप-अप की अनुमति दें।' : 'Please allow pop-ups for this website to open your receipt.');
      return;
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
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
        <nav><a href="/">{hindi ? 'होम' : 'Home'}</a><a href="#ds-government-services">{hindi ? 'सेवाएँ' : 'Services'}</a><a href="#ds-document-services">{hindi ? 'PDF और दस्तावेज़' : 'PDF & Documents'}</a><button onClick={() => paidCheckout ? setShowBookingForm(true) : openPayNowCenter()}>{paidCheckout ? (hindi ? 'आवेदन जारी रखें' : 'Continue application') : (hindi ? 'अभी भुगतान करें' : 'Pay Now')}</button><button onClick={() => setShowTrackingInfo(true)}>{hindi ? 'अनुरोध ट्रैक करें' : 'Track Request'}</button><button onClick={() => setShowSlipRecovery(true)}>{hindi ? 'स्लिप वापस पाएँ' : 'Recover Slip'}</button><a className="ds-admin-login" href="/digital-seva-admin">{hindi ? 'एडमिन लॉगिन' : 'Admin Login'}</a><a className="ds-back-home" href="/" aria-label="Back to TANSHU ONLINE homepage">{hindi ? '← मुख्य पृष्ठ' : '← Back to Home'}</a><div className="ds-language-switch" role="group" aria-label="Choose language"><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div></nav>
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

        <section className="ds-section ds-gallery-addons" aria-label={hindi ? 'डिजिटल क्रिएटिव स्टूडियो' : 'Digital Creative Studio'}>
          <div className="ds-section-heading"><div><span className="ds-kicker">{hindi ? 'पहले डेमो देखें, फिर चुनें' : 'EXPLORE BEFORE YOU BOOK'}</span><h2>Digital Creative Studio</h2><p>{hindi ? 'वेबसाइट, ऐप, सॉफ्टवेयर या ग्राफिक डिजाइन के मूल नमूने देखें। पसंद की दिशा चुनने के बाद ही कोटेशन या Pay Now की ओर बढ़ें।' : 'Explore original website, app, software and graphic design concepts. Choose a direction before moving to a quote or Pay Now.'}</p></div></div>
          <div className="ds-project-service-grid">
            <article className="ds-project-service-card"><span className="ds-project-service-icon"><Globe size={22} /></span><small>01 · WEBSITE</small><h3>Website Design &amp; Development</h3><p>{hindi ? '19 वेबसाइट स्टाइल और बिज़नेस डेमो देखें।' : 'Explore 19 website styles and business demos.'}</p><button type="button" onClick={() => { const service = SEVA_SERVICES.find((item) => item.id === 'website-services'); if (service) { setSelected(service); setShowWebsiteShowcase(true); } }}>{hindi ? '19 वेबसाइट डेमो देखें' : 'Explore all 19 website demos'} <ArrowRight size={15} /></button></article>
            <article className="ds-project-service-card"><span className="ds-project-service-icon"><Smartphone size={22} /></span><small>02 · APPLICATION</small><h3>Mobile &amp; Web Applications</h3><p>{hindi ? 'Booking, education और business app के स्क्रीन डेमो देखें।' : 'Browse booking, education and business app screen concepts.'}</p><button type="button" onClick={() => setCreativeStudioCategory('apps')}>{hindi ? 'App डेमो देखें' : 'Explore app demos'} <ArrowRight size={15} /></button></article>
            <article className="ds-project-service-card"><span className="ds-project-service-icon"><Code2 size={22} /></span><small>03 · SOFTWARE</small><h3>Custom Software</h3><p>{hindi ? 'Desktop tools, browser workspace और creative software कॉन्सेप्ट देखें।' : 'Explore desktop tools, browser workspaces and creative software concepts.'}</p><button type="button" onClick={() => setCreativeStudioCategory('software')}>{hindi ? 'Software डेमो देखें' : 'Explore software demos'} <ArrowRight size={15} /></button></article>
            <article className="ds-project-service-card"><span className="ds-project-service-icon"><Palette size={22} /></span><small>04 · GRAPHIC DESIGN</small><h3>Graphic &amp; Creative Design</h3><p>{hindi ? 'Poster, social creatives, logo और brochure के नमूने देखें।' : 'Browse poster, social creative, logo and brochure concepts.'}</p><button type="button" onClick={() => setCreativeStudioCategory('design')}>{hindi ? 'Design डेमो देखें' : 'Explore design samples'} <ArrowRight size={15} /></button></article>
          </div>
          <p className="ds-project-range-note">{hindi ? 'सभी डेमो केवल उदाहरण हैं। अंतिम फीचर, सामग्री, कीमत और डिलीवरी समय लिखित quotation में तय होंगे।' : 'All samples are illustrative only. Final features, content, price and delivery schedule are confirmed in a written quotation.'}</p>
        </section>

        <section className="ds-search-section" aria-label={hindi ? 'सेवाएँ खोजें' : 'Search services'}>
          <div className="ds-search-heading"><div><span className="ds-kicker">{hindi ? 'सही सेवा खोजें' : 'FIND THE RIGHT SERVICE'}</span><h2>{hindi ? 'आपको किस काम में सहायता चाहिए?' : 'What do you need help with?'}</h2></div><span className="ds-language-note">{hindi ? 'हिंदी और English दोनों में खोजें' : 'Search in Hindi and English'}</span></div>
          <div className="ds-location-filter ds-location-filter-premium">
            <label><span>{hindi ? 'राज्य / केंद्र शासित प्रदेश' : 'State / Union Territory'}</span><select value={selectedStateCode} onChange={(event) => setSelectedStateCode(event.target.value)}><option value="">{hindi ? 'राज्य चुनें' : 'Select state'}</option>{states.map((state) => <option key={state.code} value={state.code}>{state.name}</option>)}</select></label>
            <label><span>{hindi ? 'जिला' : 'District'}</span><select value={selectedDistrictCode} onChange={(event) => setSelectedDistrictCode(event.target.value)} disabled={!selectedStateCode || locationLoading}><option value="">{locationLoading ? (hindi ? 'जिले लोड हो रहे हैं…' : 'Loading districts…') : (hindi ? 'जिला चुनें' : 'Select district')}</option>{districts.map((district) => <option key={district.code} value={district.code}>{district.name_local ? `${district.name} / ${district.name_local}` : district.name}</option>)}</select></label>
            <label className="ds-location-service-search"><span>{hindi ? 'अपना काम खोजें' : 'Search your service'}</span><div className="ds-location-searchbox"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveCategory('all'); setShowAll(true); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); runServiceSearch(); } }} placeholder={hindi ? 'जैसे राशन कार्ड, ड्राइविंग लाइसेंस…' : 'e.g. Ration card, Driving licence…'} aria-label={hindi ? 'अपना काम खोजें' : 'Search your service'} />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setSearchTarget(null); }}><X size={15} /></button>}</div></label>
            {selectedState && <button type="button" className="ds-location-clear" onClick={() => { setSelectedStateCode(''); setSelectedDistrictCode(''); }}>{hindi ? 'लोकेशन हटाएँ' : 'Clear location'}</button>}
            {locationError && <small className="ds-location-error" role="status">{locationError}</small>}
          </div>
          {selectedState && <p className="ds-location-summary">{hindi ? 'चुनी गई लोकेशन:' : 'Selected location:'} <strong>{selectedDistrict ? `${selectedDistrict.name}, ${selectedState.name}` : selectedState.name}</strong> — {hindi ? 'नीचे चुने गए क्षेत्र के लिए उपलब्ध सेवाओं की सूची है।' : 'Browse the service list available for the selected area below.'}</p>}
          <div className="ds-location-service-list" aria-live="polite">
            <div className="ds-location-service-list-head"><strong>{hindi ? 'उपलब्ध काम चुनें' : 'Choose an available service'}</strong><span>{results.length} {hindi ? 'सेवाएँ' : 'services'}</span></div>
            {results.length ? <div className="ds-location-service-options">{results.map((service) => <button type="button" key={service.id} onClick={() => { setSelected(service); setSearchTarget(service.id); if (service.id === 'website-services') setShowWebsiteShowcase(true); }}>{hindi ? service.hindi : service.name}<ArrowRight size={13} /></button>)}</div> : <p className="ds-location-no-results">{hindi ? 'इस खोज से कोई सेवा नहीं मिली।' : 'No services match this search.'}</p>}
          </div>
        </section>

        <section className="ds-section" id="ds-government-services">
          <div className="ds-section-heading"><div><span className="ds-kicker">{hindi ? 'भारत भर की ऑनलाइन सेवाएँ' : 'ONLINE SERVICES ACROSS INDIA'}</span><h2>{hindi ? 'आप ऑनलाइन कौन-सा काम करवाना चाहते हैं?' : 'Choose what you need done online'}</h2><p>{hindi ? 'लोकप्रिय सेवाएँ देखें और शुरू करने से पहले ज़रूरी जानकारी जानें।' : 'Explore popular services and see what may be required before you begin.'}</p></div><button className="ds-outline-button" onClick={() => { setActiveCategory('all'); setShowAll(true); scrollToServices(); }}>{hindi ? 'सभी सेवाएँ देखें' : 'View all services'} <ArrowUpRight size={16} /></button></div>
          <div className="ds-category-grid">
            {(['photo', 'video', 'creative', 'business', 'career', 'websites', 'pan', 'aadhaar', 'voter', 'ration', 'schemes', 'forms', 'certificates', 'pdf', 'documents'] as SevaCategory[]).map((categoryId) => {
              const category = SEVA_CATEGORIES.find((item) => item.id === categoryId);
              if (!category) return null;
              const Icon = categoryIcon[category.icon] || FileText;
              return <button key={category.id} className={`ds-category-card ds-category-card-${category.id}`} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="ds-category-icon"><Icon size={22} /></span><strong>{hindi ? category.hindi : category.label}</strong><small>{hindi ? category.label : category.hindi}</small><span className="ds-category-arrow"><ArrowUpRight size={17} /></span>
              </button>;
            })}
          </div>
        </section>

        <section className="ds-section ds-results-section" id="ds-service-results">
          <div className="ds-section-heading"><div><span className="ds-kicker">{query ? (hindi ? 'खोज परिणाम' : 'SEARCH RESULTS') : (hindi ? 'लोकप्रिय सेवाएँ' : 'POPULAR ONLINE SERVICES')}</span><h2>{query ? `“${query}” के परिणाम` : (hindi ? 'लोकप्रिय ऑनलाइन सेवाएँ' : 'Popular online services')}</h2><p>{hindi ? `इस सूची में ${results.length} मिलती-जुलती सेवाएँ हैं।` : `${results.length} matching services in this catalogue preview.`}</p></div><button className="ds-clear-filter" onClick={() => { setQuery(''); setActiveCategory('all'); }}>{hindi ? 'फ़िल्टर हटाएँ' : 'Clear filters'}</button></div>
          <div className="ds-filter-row"><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>{hindi ? 'सभी' : 'All'}</button>{SEVA_CATEGORIES.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{hindi ? category.hindi : category.label}</button>)}</div>
          {results.length ? <div className="ds-service-grid">{(showAll ? results : results.slice(0, 6)).map((service) => <ServiceCard key={service.id} service={service} onSelect={(service) => { setSelected(service); if (service.id === 'website-services') setShowWebsiteShowcase(true); }} hindi={hindi} highlighted={searchTarget === service.id} />)}</div> : <div className="ds-empty"><Search size={28} /><h3>{hindi ? 'कोई सटीक परिणाम नहीं मिला' : 'No exact match yet'}</h3><p>{hindi ? 'छोटा शब्द, हिंदी शब्द या आम काम का नाम लिखकर देखें।' : 'Try a shorter phrase, a Hindi word, or a common task name.'}</p><button onClick={() => { setQuery(''); setActiveCategory('all'); }}>{hindi ? 'सभी सेवाएँ दिखाएँ' : 'Show all services'}</button></div>}
          {!showAll && results.length > 6 && <button className="ds-load-more" onClick={() => setShowAll(true)}>{hindi ? `सभी ${results.length} सेवाएँ दिखाएँ` : `Show all ${results.length} matching services`} <ChevronDown size={16} /></button>}
        </section>

        <section className="ds-document-band" id="ds-document-services">
          <div className="ds-document-intro"><span className="ds-kicker">{hindi ? 'रोज़मर्रा के फ़ाइल और दस्तावेज़ कार्य' : 'EVERYDAY FILE & DOCUMENT HELP'}</span><h2>{hindi ? 'दस्तावेज़ और PDF सेवाएँ' : 'Document & PDF Services'}</h2><p>{hindi ? 'फ़ाइल का आकार कम करना, इमेज बदलना, स्कैन साफ़ करना और दस्तावेज़ फ़ॉर्मेट करना — आसान चरणों में।' : 'Small file-size limits, image conversions, scan cleanup and document formatting — explained in simple steps.'}</p><button className="ds-light-button" onClick={() => { setActiveCategory('pdf'); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}>{hindi ? 'PDF सेवाएँ देखें' : 'Explore PDF services'} <ArrowRight size={16} /></button></div>
          <div className="ds-document-tiles">{SEVA_CATEGORIES.slice(8).map((category) => { const Icon = categoryIcon[category.icon] || FileText; return <button key={category.id} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}><Icon size={21} /><strong>{hindi ? category.hindi : category.label}</strong><span>{hindi ? 'इस श्रेणी की डिजिटल सहायता सेवाएँ देखें।' : category.description}</span><ArrowUpRight size={16} /></button>; })}</div>
        </section>

        <section className="ds-trust-row"><div><ShieldCheck size={22} /><span><b>{hindi ? 'आपके दस्तावेज़ महत्वपूर्ण हैं' : 'Your documents matter'}</b><small>{hindi ? 'चुनी गई सेवा के लिए केवल ज़रूरी जानकारी माँगी जाएगी।' : 'We will request only what is needed for the selected service.'}</small></span></div><div><WalletCards size={22} /><span><b>{hindi ? 'शुल्क अलग-अलग दिखेंगे' : 'Fees shown separately'}</b><small>{hindi ? 'सेवा शुल्क और सरकारी शुल्क कभी मिलाए नहीं जाएँगे।' : 'Service charges and government fees will never be mixed.'}</small></span></div><div><LifeBuoy size={22} /><span><b>{hindi ? 'व्यक्तिगत सहायता' : 'Human assistance'}</b><small>{hindi ? 'कोई चरण समझ न आए तो आगे बढ़ने से पहले पूछें।' : 'Ask before proceeding if a step is unclear.'}</small></span></div></section>

        <section className="ds-bottom-cta"><div><span className="ds-kicker">{hindi ? 'शुरुआत करने का आसान तरीका' : 'A CLEARER WAY TO GET STARTED'}</span><h2>{hindi ? 'समझ नहीं आ रहा कौन-सी सेवा चाहिए?' : 'Not sure which service you need?'}</h2><p>{hindi ? 'अपने सामान्य शब्दों में खोजें। हम सही सेवा ढूँढ़ने में मदद करेंगे।' : 'Search using the words you normally use. We’ll help you find the closest matching service.'}</p></div><button onClick={() => { document.querySelector<HTMLInputElement>('.ds-searchbox input')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{hindi ? 'सेवाएँ खोजें' : 'Search services'} <Search size={17} /></button></section>
      </main>

      <footer className="ds-footer"><a href="/" className="ds-brand"><img className="ds-brand-photo" src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" /><span><strong>TANSHU ONLINE</strong><small>Digital Seva Center</small></span></a><p>{hindi ? 'स्वतंत्र डिजिटल सहायता प्लेटफ़ॉर्म। यह सरकारी वेबसाइट या सरकारी विभाग नहीं है।' : 'Independent digital assistance platform. Not a government website or government department.'}</p><span>© {new Date().getFullYear()} TANSHU ONLINE</span></footer>

      {showPayNowCenter && <DigitalSevaPayNow language={language} initialServiceId={selected?.id} onClose={() => setShowPayNowCenter(false)} onPaid={(service, payment) => { setSelected(service); setPaidCheckout(payment); setBookingReference(''); setBookingReceipt(null); setShowPayNowCenter(false); setShowBookingForm(true); }} />}
      {showWebsiteShowcase && selected?.id === 'website-services' && <WebsiteServicesShowcase language={language} onClose={() => { setShowWebsiteShowcase(false); setSelected(null); }} onRequestQuote={() => { setShowWebsiteShowcase(false); openBookingForm(); }} />}
      {selected && selected.id !== 'website-services' && <div className="ds-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="ds-detail-modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'सेवा का विवरण' : 'SERVICE DETAILS'}</span><h2>{hindi ? selected.hindi : selected.name}</h2><p className="ds-modal-hindi">{hindi ? selected.name : selected.hindi}</p><p>{hindi ? (serviceHindi?.descriptionHindi || selected.description) : selected.description}</p><div className="ds-detail-grid"><div><small>{hindi ? 'उपलब्धता' : 'AVAILABILITY'}</small><b>{hindi ? (serviceHindi?.availabilityHindi || selected.availability) : selected.availability}</b></div><div><small>{hindi ? 'सहायता का प्रकार' : 'ASSISTANCE TYPE'}</small><b>{hindi ? (serviceHindi?.assistanceHindi || selected.assistance) : selected.assistance}</b></div></div><RefundPolicyNotice service={selected} language={language} /><h3>{hindi ? 'तैयार रखने वाले दस्तावेज़ / जानकारी' : 'Documents / information to prepare'}</h3><ul>{(hindi ? (serviceHindi?.documentsHindi || selected.documents) : selected.documents).map((item) => <li key={item}>{item}</li>)}</ul>{(hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note) && <div className="ds-important-note"><ShieldCheck size={18} /><span>{hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note}</span></div>}<div className="ds-preview-notice"><CalendarClock size={18} /><span>{hindi ? 'यह Preview केवल Cashfree Sandbox भुगतान और आवेदन प्रक्रिया की जाँच के लिए है। कोई वास्तविक पैसा नहीं लिया जाएगा।' : 'This Preview uses Cashfree Sandbox to test the payment and application flow. No real money is collected.'}</span></div><div className="ds-modal-actions"><button className="ds-modal-book" onClick={() => setShowPayNowCenter(true)}>{hindi ? 'Pay Now' : 'Pay Now'} <ArrowRight size={16} /></button><button className="ds-modal-done" onClick={() => setSelected(null)}>{hindi ? 'बंद करें' : 'Close'}</button></div></section></div>}

      {showBookingForm && selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowBookingForm(false)}><section className="ds-detail-modal ds-booking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'बुकिंग अनुरोध' : 'Request a booking'} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={closeBookingForm} aria-label="Close"><X size={20} /></button>{bookingReference ? <><span className="ds-kicker">{hindi ? 'अनुरोध प्राप्त हुआ' : 'REQUEST RECEIVED'}</span><h2>{hindi ? 'आपका बुकिंग अनुरोध सुरक्षित हो गया है' : 'Your booking request is saved'}</h2><p>{hindi ? <>हमने <strong>{selected.hindi}</strong> के लिए आपका अनुरोध दर्ज कर लिया है। यह सहायता का अनुरोध है, सरकारी आवेदन जमा होना नहीं।</> : <>We have recorded your request for <strong>{selected.name}</strong>. This is a request for assistance, not a government application submission.</>}</p><div className="ds-booking-reference"><small>{hindi ? 'आपका बुकिंग रेफरेंस' : 'YOUR BOOKING REFERENCE'}</small><strong>{bookingReference}</strong></div><button type="button" className="ds-modal-book" onClick={openCustomerReceipt} disabled={!bookingReceipt}>{hindi ? 'रसीद डाउनलोड / प्रिंट करें' : 'Download / Print Application Slip'} <FileText size={16} /></button><p className="ds-booking-help">{hindi ? 'इस रेफरेंस को सुरक्षित रखें। आप इसी नंबर से अपने काम का स्टेटस देख सकते हैं।' : 'Keep this reference safe. You can use it to check your request status anytime.'}</p><div className="ds-modal-actions"><button className="ds-modal-book" onClick={() => { setTrackingReference(bookingReference); setTrackingResult(null); setTrackingError(''); setShowTrackingInfo(true); closeBookingForm(); }}>{hindi ? 'स्टेटस देखें' : 'Track status'} <ArrowRight size={15} /></button><button className="ds-modal-done" onClick={() => { closeBookingForm(); setSelected(null); }}>{hindi ? 'ठीक है' : 'Done'}</button></div></> : <><span className="ds-kicker">{hindi ? 'बुकिंग अनुरोध' : 'BOOKING REQUEST'}</span><h2>{hindi ? 'इस सेवा के लिए अनुरोध करें' : 'Request this service'}</h2><p>{hindi ? 'सेवा:' : 'Service:'} <strong>{hindi ? selected.hindi : selected.name}</strong></p><div className="ds-booking-fee-summary"><strong>{hindi ? 'अनुरोध से पहले शुल्क विवरण' : 'Fee summary before request'}</strong><p><b>{hindi ? 'सरकारी / प्रदाता शुल्क:' : 'Government / provider fee:'}</b> {getServiceFeeDisclosure(selected).governmentFee}</p><p><b>{hindi ? 'TANSHU ONLINE सेवा शुल्क:' : 'TANSHU ONLINE fee:'}</b> {getServiceFeeDisclosure(selected).serviceFee}</p><p>{hindi ? <><b>रिफंड:</b> सरकारी/प्रदाता रिफंड सेवा विवरण में दिए गए आधिकारिक मार्ग के अनुसार होगा। TANSHU शुल्क में समायोजन वास्तव में किए गए काम और नीचे दी गई रिफंड नीति पर आधारित होगा।</> : <><b>Refund:</b> Government/provider refund follows the exact official route shown in the service details. TANSHU fee adjustments are based on work actually completed and the Refund Policy below.</>}</p><small>{hindi ? 'केवल Preview Sandbox परीक्षण है; कोई वास्तविक पैसा नहीं लिया जाता और लाइव भुगतान बंद है।' : 'Preview Sandbox testing only; no real money is collected and live payments are disabled.'}</small></div><DigitalSevaApplicationForm service={selected} language={language} prepaidPayment={paidCheckout} onSubmitted={(reference, receipt) => { try { window.localStorage.removeItem('tanshu-digital-seva-active-service'); window.sessionStorage.removeItem('tanshu-ds-paid-checkout-v1'); } catch { /* browser storage may be disabled */ } setPaidCheckout(null); setBookingReference(reference); setBookingReceipt(receipt); }} /></>}</section></div>}
      {creativeStudioCategory && <CreativeServicesStudio category={creativeStudioCategory} language={language} onClose={() => setCreativeStudioCategory(null)} onRequestQuote={(serviceId) => { const service = SEVA_SERVICES.find((item) => item.id === serviceId); if (!service) return; setSelected(service); setCreativeStudioCategory(null); setShowPayNowCenter(true); }} />}
      {showSlipRecovery && <DigitalSevaSlipRecovery language={language} onClose={() => setShowSlipRecovery(false)} />}
      {showTrackingInfo && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowTrackingInfo(false)}><section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'अनुरोध ट्रैकिंग' : 'Request tracking'} onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setShowTrackingInfo(false)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'अनुरोध ट्रैकिंग' : 'REQUEST TRACKING'}</span><h2>{hindi ? 'अपना सेवा अनुरोध ट्रैक करें' : 'Track your service request'}</h2><p>{hindi ? 'अपनी रसीद पर दिया गया बुकिंग रेफरेंस डालें।' : 'Enter the booking reference printed on your receipt.'}</p><form className="ds-tracking-form" onSubmit={(event) => void lookupTracking(event)}><label>{hindi ? 'बुकिंग रेफरेंस' : 'Booking Reference'}<input value={trackingReference} onChange={(event) => setTrackingReference(event.target.value.toUpperCase())} maxLength={24} placeholder="DS-YYYYMMDD-XXXXXXXXXX" autoComplete="off" /></label><button className="ds-modal-book" type="submit" disabled={trackingLoading}>{trackingLoading ? (hindi ? 'जाँच हो रही है…' : 'Checking…') : (hindi ? 'स्टेटस देखें' : 'Check Status')}</button></form>{trackingError && <p className="ds-booking-error" role="alert">{trackingError}</p>}{trackingResult && <div className="ds-tracking-result"><div className="ds-tracking-result-head"><small>{hindi ? 'बुकिंग रेफरेंस' : 'BOOKING REFERENCE'}</small><strong>{trackingResult.bookingReference}</strong><span className="ds-tracking-status">{statusLabel(trackingResult.status)}</span></div><div className="ds-tracking-meta"><p><b>{hindi ? 'अनुरोध दर्ज:' : 'Request received:'}</b> {formatTrackingTime(trackingResult.createdAt)}</p><p><b>{hindi ? 'आखिरी अपडेट:' : 'Last update:'}</b> {formatTrackingTime(trackingResult.updatedAt)}</p><p><b>{hindi ? 'अनुमानित पूरा होने का समय:' : 'Estimated completion:'}</b> {formatTrackingTime(trackingResult.estimatedCompletionAt)}</p></div><h3>{hindi ? 'काम की प्रगति' : 'Progress updates'}</h3><ol className="ds-tracking-timeline">{(trackingResult.events || []).map((item: any, index: number) => <li key={index}><span className="ds-tracking-dot" /><div><b>{statusLabel(item.status)}</b><small>{formatTrackingTime(item.createdAt)}</small>{item.note && <p>{item.note}</p>}</div></li>)}</ol><p className="ds-tracking-service">{hindi ? 'सेवा:' : 'Service:'} {SEVA_SERVICES.find((service) => service.id === trackingResult.serviceId)?.name || trackingResult.serviceId}</p></div>}<button className="ds-modal-done" onClick={() => setShowTrackingInfo(false)}>{hindi ? 'बंद करें' : 'Close'}</button></section></div>}
    </div>
  );
}
