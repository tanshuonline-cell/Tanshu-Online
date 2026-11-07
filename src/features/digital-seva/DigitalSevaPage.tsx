import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, CalendarClock, CheckCircle2, ChevronDown, Clock3, FileCheck2, FileText, Fingerprint, Landmark, LifeBuoy, Search, ShieldCheck, Sparkles, WalletCards, X, Globe } from 'lucide-react';
import { SEVA_CATEGORIES, SEVA_SERVICES, searchSevaServices, type SevaCategory, type SevaService } from './serviceCatalog';
import { SEVA_SERVICE_HINDI } from './serviceCatalogHindi';
import RefundPolicyNotice from './RefundPolicyNotice';
import BookingPolicyConsent, { TERMS_POLICY_VERSION, REFUND_POLICY_VERSION } from './BookingPolicyConsent';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';
import './digitalSeva.css';

const categoryIcon: Record<string, React.ElementType> = {
  'id-card': FileText, fingerprint: Fingerprint, 'file-check': FileCheck2, vote: BadgeCheck,
  wheat: Sparkles, landmark: Landmark, 'clipboard-list': BookOpenCheck, 'file-pdf': FileText, files: FileCheck2, globe: Globe,
};

function ServiceCard({ service, onSelect, hindi }: { service: SevaService; onSelect: (service: SevaService) => void; hindi: boolean }) {
  const category = SEVA_CATEGORIES.find((item) => item.id === service.category);
  return (
    <article className="ds-service-card">
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
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingConsent, setBookingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [refundAccepted, setRefundAccepted] = useState(false);
  const [bookingIdempotencyKey, setBookingIdempotencyKey] = useState('');
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

  const openBookingForm = () => {
    setBookingError('');
    setBookingReference('');
    setBookingName('');
    setBookingPhone('');
    setBookingEmail('');
    setBookingConsent(false);
    setTermsAccepted(false);
    setRefundAccepted(false);
    setBookingIdempotencyKey(window.crypto.randomUUID());
    setShowBookingForm(true);
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !bookingConsent || !termsAccepted || !refundAccepted || bookingSubmitting) return;
    setBookingSubmitting(true);
    setBookingError('');
    try {
      const response = await fetch('/api/digital-seva/bookings', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selected.id,
          customerName: bookingName.trim(),
          customerPhone: bookingPhone.trim(),
          customerEmail: bookingEmail.trim() || null,
          consent: bookingConsent,
          termsAccepted,
          termsPolicyVersion: TERMS_POLICY_VERSION,
          refundPolicyAccepted: refundAccepted,
          refundPolicyVersion: REFUND_POLICY_VERSION,
          idempotencyKey: bookingIdempotencyKey,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.bookingReference) {
        throw new Error(data.error || 'Booking could not be saved. Please try again later.');
      }
      setBookingReference(String(data.bookingReference));
    } catch (error: any) {
      setBookingError(error?.message || 'Network error. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
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
          <label className="ds-searchbox"><Search size={22} /><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveCategory('all'); }} placeholder={hindi ? 'जैसे “PDF छोटा”, “आधार पता”, “फोटो KB कम”...' : 'Try “PDF chhota”, “Aadhaar me pita ka naam”, “photo KB kam”...'} /><kbd>{hindi ? 'खोजें' : 'Search'}</kbd>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}</label>
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
          {results.length ? <div className="ds-service-grid">{(showAll ? results : results.slice(0, 6)).map((service) => <ServiceCard key={service.id} service={service} onSelect={setSelected} hindi={hindi} />)}</div> : <div className="ds-empty"><Search size={28} /><h3>{hindi ? 'कोई सटीक परिणाम नहीं मिला' : 'No exact match yet'}</h3><p>{hindi ? 'छोटा शब्द, हिंदी शब्द या आम काम का नाम लिखकर देखें।' : 'Try a shorter phrase, a Hindi word, or a common task name.'}</p><button onClick={() => { setQuery(''); setActiveCategory('all'); }}>{hindi ? 'सभी सेवाएँ दिखाएँ' : 'Show all services'}</button></div>}
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

      {selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="ds-detail-modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'सेवा का विवरण' : 'SERVICE DETAILS'}</span><h2>{hindi ? selected.hindi : selected.name}</h2><p className="ds-modal-hindi">{hindi ? selected.name : selected.hindi}</p><p>{hindi ? (serviceHindi?.descriptionHindi || selected.description) : selected.description}</p><div className="ds-detail-grid"><div><small>{hindi ? 'उपलब्धता' : 'AVAILABILITY'}</small><b>{hindi ? (serviceHindi?.availabilityHindi || selected.availability) : selected.availability}</b></div><div><small>{hindi ? 'सहायता का प्रकार' : 'ASSISTANCE TYPE'}</small><b>{hindi ? (serviceHindi?.assistanceHindi || selected.assistance) : selected.assistance}</b></div></div><RefundPolicyNotice service={selected} language={language} /><h3>{hindi ? 'तैयार रखने वाले दस्तावेज़ / जानकारी' : 'Documents / information to prepare'}</h3><ul>{(hindi ? (serviceHindi?.documentsHindi || selected.documents) : selected.documents).map((item) => <li key={item}>{item}</li>)}</ul>{(hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note) && <div className="ds-important-note"><ShieldCheck size={18} /><span>{hindi ? (serviceHindi?.noteHindi || selected.note) : selected.note}</span></div>}<div className="ds-preview-notice"><CalendarClock size={18} /><span>{hindi ? 'Consent database migration लागू होने के बाद यह Preview सेवा अनुरोध दर्ज कर सकता है। यह सरकारी आवेदन जमा नहीं करता और न ही भुगतान लेता है।' : 'This Preview can record a service request after its consent database migration is applied. It does not submit a government application or collect payment.'}</span></div><div className="ds-modal-actions"><button className="ds-modal-book" onClick={openBookingForm}>{hindi ? 'बुकिंग अनुरोध करें' : 'Request a booking'} <ArrowRight size={16} /></button><button className="ds-modal-done" onClick={() => setSelected(null)}>{hindi ? 'बंद करें' : 'Close'}</button></div></section></div>}

      {showBookingForm && selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => !bookingSubmitting && setShowBookingForm(false)}><section className="ds-detail-modal ds-booking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'बुकिंग अनुरोध' : 'Request a booking'} onClick={(event) => event.stopPropagation()}><div className="ds-modal-language-switch" role="group" aria-label={hindi ? 'भाषा चुनें' : 'Choose language'}><button type="button" className={!hindi ? "active" : ""} aria-pressed={!hindi} onClick={() => setLanguage("en")}>English</button><button type="button" className={hindi ? "active" : ""} aria-pressed={hindi} onClick={() => setLanguage("hi")}>हिंदी</button></div><button className="ds-modal-close" onClick={() => setShowBookingForm(false)} aria-label="Close" disabled={bookingSubmitting}><X size={20} /></button>{bookingReference ? <><span className="ds-kicker">{hindi ? 'अनुरोध प्राप्त हुआ' : 'REQUEST RECEIVED'}</span><h2>{hindi ? 'आपका बुकिंग अनुरोध सुरक्षित हो गया है' : 'Your booking request is saved'}</h2><p>{hindi ? <>हमने <strong>{selected.hindi}</strong> के लिए आपका अनुरोध दर्ज कर लिया है। यह सहायता का अनुरोध है, सरकारी आवेदन जमा होना नहीं।</> : <>We have recorded your request for <strong>{selected.name}</strong>. This is a request for assistance, not a government application submission.</>}</p><div className="ds-booking-reference"><small>{hindi ? 'आपका बुकिंग रेफरेंस' : 'YOUR BOOKING REFERENCE'}</small><strong>{bookingReference}</strong></div><p className="ds-booking-help">{hindi ? 'इस रेफरेंस को सुरक्षित रखें। टीम इसे निजी Preview एडमिन क्षेत्र में आपका अनुरोध खोजने के लिए उपयोग कर सकती है।' : 'Please keep this reference safe. The team can use it to locate your request in the private Preview admin area.'}</p><button className="ds-modal-book" onClick={() => { setShowBookingForm(false); setSelected(null); }}>{hindi ? 'ठीक है' : 'Done'}</button></> : <><span className="ds-kicker">{hindi ? 'बुकिंग अनुरोध' : 'BOOKING REQUEST'}</span><h2>{hindi ? 'इस सेवा के लिए अनुरोध करें' : 'Request this service'}</h2><p>{hindi ? 'सेवा:' : 'Service:'} <strong>{hindi ? selected.hindi : selected.name}</strong></p><div className="ds-booking-fee-summary"><strong>{hindi ? 'अनुरोध से पहले शुल्क विवरण' : 'Fee summary before request'}</strong><p><b>{hindi ? 'सरकारी / प्रदाता शुल्क:' : 'Government / provider fee:'}</b> {getServiceFeeDisclosure(selected).governmentFee}</p><p><b>{hindi ? 'TANSHU ONLINE सेवा शुल्क:' : 'TANSHU ONLINE fee:'}</b> {getServiceFeeDisclosure(selected).serviceFee}</p><p>{hindi ? <><b>रिफंड:</b> सरकारी/प्रदाता रिफंड सेवा विवरण में दिए गए आधिकारिक मार्ग के अनुसार होगा। TANSHU शुल्क में समायोजन वास्तव में किए गए काम और नीचे दी गई रिफंड नीति पर आधारित होगा।</> : <><b>Refund:</b> Government/provider refund follows the exact official route shown in the service details. TANSHU fee adjustments are based on work actually completed and the Refund Policy below.</>}</p><small>{hindi ? 'इस Preview में कोई भुगतान नहीं लिया जाता। लाइव भुगतान से पहले टैक्स, प्रदाता शुल्क और अंतिम कुल राशि अलग-अलग दिखाई जाएगी।' : 'No payment is collected in this Preview. Any tax, provider charge and final total must be itemised before live payment.'}</small></div><form className="ds-booking-form" onSubmit={submitBooking}><label>{hindi ? 'पूरा नाम' : 'Full name'}<input autoComplete="name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} minLength={2} maxLength={80} required placeholder={hindi ? 'अपना नाम लिखें' : 'Enter your name'} /></label><label>{hindi ? 'मोबाइल नंबर' : 'Mobile number'}<input autoComplete="tel" inputMode="tel" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} minLength={10} maxLength={16} required placeholder={hindi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'} /></label><label>{hindi ? 'ईमेल पता' : 'Email address'} <span>{hindi ? '(अनुरोध अपडेट के लिए ज़रूरी)' : '(required for request updates)'}</span><input autoComplete="email" type="email" value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} maxLength={254} required placeholder="name@example.com" /></label><div className="ds-booking-privacy"><ShieldCheck size={18} /><span>{hindi ? 'इस पहले चरण में केवल आपका नाम और संपर्क विवरण लिया जाएगा। यहाँ Aadhaar/PAN नंबर, OTP, पासवर्ड न लिखें और दस्तावेज़ अपलोड न करें।' : 'For this first step, we only collect your name and contact details. Do not enter Aadhaar/PAN numbers, OTPs, passwords or upload documents here.'}</span></div><BookingPolicyConsent language={language} termsAccepted={termsAccepted} refundAccepted={refundAccepted} onTermsChange={setTermsAccepted} onRefundChange={setRefundAccepted} /><label className="ds-booking-consent"><input type="checkbox" checked={bookingConsent} onChange={(event) => setBookingConsent(event.target.checked)} required /><span>{hindi ? 'मैं सहमत हूँ कि TANSHU ONLINE इस सेवा अनुरोध के बारे में मुझसे संपर्क कर सकता है। मैं समझता/समझती हूँ कि यह स्वतंत्र सहायता सेवा है, सरकारी विभाग नहीं।' : 'I agree that TANSHU ONLINE may contact me about this service request. I understand this is an independent assistance service, not a government department.'}</span></label>{bookingError && <p className="ds-booking-error" role="alert">{bookingError}</p>}<button className="ds-modal-book" type="submit" disabled={bookingSubmitting || !bookingConsent || !termsAccepted || !refundAccepted}>{bookingSubmitting ? (hindi ? 'जमा हो रहा है…' : 'Submitting…') : (hindi ? 'बुकिंग अनुरोध जमा करें' : 'Submit booking request')} <ArrowRight size={16} /></button></form></>}</section></div>}
      {showTrackingInfo && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowTrackingInfo(false)}><section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label={hindi ? 'अनुरोध ट्रैकिंग' : 'Request tracking'} onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setShowTrackingInfo(false)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">{hindi ? 'अनुरोध ट्रैकिंग' : 'REQUEST TRACKING'}</span><h2>{hindi ? 'अपना सेवा अनुरोध ट्रैक करें' : 'Track your service request'}</h2><p>{hindi ? 'ग्राहकों के लिए स्टेटस जाँच अभी चालू नहीं है। अपना बुकिंग रेफरेंस सुरक्षित रखें और सत्यापित सहायता संपर्क प्रकाशित होने पर सेवा टीम से संपर्क करें।' : 'Customer-facing status lookup is not active yet. Keep your booking reference and contact the service team through the verified support channel when it is published.'}</p><div className="ds-preview-notice"><Clock3 size={18} /><span>{hindi ? 'यह Preview बुकिंग रेफरेंस बना सकता है, लेकिन ग्राहक अभी यहाँ स्टेटस नहीं देख सकते। दस्तावेज़ अपलोड न करें और OTP/पासवर्ड साझा न करें।' : 'This Preview can create booking references, but customers cannot look up status here yet. Do not upload documents or share OTPs/passwords.'}</span></div><button className="ds-modal-done" onClick={() => setShowTrackingInfo(false)}>{hindi ? 'बंद करें' : 'Close'}</button></section></div>}
    </div>
  );
}
