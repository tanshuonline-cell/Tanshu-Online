import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, CalendarClock, CheckCircle2, ChevronDown, Clock3, FileCheck2, FileText, Fingerprint, Landmark, LifeBuoy, Search, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react';
import { SEVA_CATEGORIES, SEVA_SERVICES, searchSevaServices, type SevaCategory, type SevaService } from './serviceCatalog';
import RefundPolicyNotice from './RefundPolicyNotice';
import BookingPolicyConsent, { TERMS_POLICY_VERSION, REFUND_POLICY_VERSION } from './BookingPolicyConsent';
import './digitalSeva.css';

const categoryIcon: Record<string, React.ElementType> = {
  'id-card': FileText, fingerprint: Fingerprint, 'file-check': FileCheck2, vote: BadgeCheck,
  wheat: Sparkles, landmark: Landmark, 'clipboard-list': BookOpenCheck, 'file-pdf': FileText, files: FileCheck2,
};

function ServiceCard({ service, onSelect }: { service: SevaService; onSelect: (service: SevaService) => void }) {
  const category = SEVA_CATEGORIES.find((item) => item.id === service.category);
  return (
    <article className="ds-service-card">
      <div className="ds-service-card-top"><span className="ds-service-icon"><FileText size={19} /></span><span className="ds-service-tag">{category?.label}</span></div>
      <h3>{service.name}</h3>
      <p className="ds-service-hindi">{service.hindi}</p>
      <p className="ds-service-description">{service.description}</p>
      <div className="ds-service-meta"><span><WalletCards size={14} /> Fee: {service.serviceFee}</span><span><Clock3 size={14} /> {service.availability}</span></div>
      <button className="ds-text-button" onClick={() => onSelect(service)}>View details <ArrowRight size={15} /></button>
    </article>
  );
}

export default function DigitalSevaPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SevaCategory | 'all'>('all');
  const [selected, setSelected] = useState<SevaService | null>(null);
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
    <div className="ds-page">
      <div className="ds-back-row"><a className="ds-back-home" href="/" aria-label="Back to TANSHU ONLINE homepage">← Back to Home</a></div>
      <div className="ds-topline"><span>INDEPENDENT DIGITAL ASSISTANCE</span><span><ShieldCheck size={14} /> Privacy-first • Clear fees • Transparent process</span></div>
      <header className="ds-header">
        <a href="/" className="ds-brand" aria-label="TANSHU ONLINE home"><span className="ds-brand-mark">T</span><span><strong>TANSHU ONLINE</strong><small>Digital Seva Center</small></span></a>
        <nav><a href="/">Home</a><a href="#ds-government-services">Services</a><a href="#ds-document-services">PDF & Documents</a><button onClick={() => setShowTrackingInfo(true)}>Track Request</button></nav>
      </header>

      <main>
        <section className="ds-hero">
          <div className="ds-hero-copy">
            <div className="ds-eyebrow"><span /> YOUR DIGITAL SERVICE DESK</div>
            <h1>Government services.<br /><em>Made simpler.</em></h1>
            <p>Find the help you need, understand the documents and fees, and follow a clear process — all in one place.</p>
            <div className="ds-hero-points"><span><CheckCircle2 size={16} /> Clear service information</span><span><CheckCircle2 size={16} /> No hidden fee promise</span></div>
          </div>
          <div className="ds-hero-art" aria-label="Digital service assistance illustration">
            <div className="ds-art-orbit ds-orbit-one" /><div className="ds-art-orbit ds-orbit-two" />
            <div className="ds-art-card ds-art-card-main"><div className="ds-art-logo"><Fingerprint size={25} /></div><div><b>Digital Seva</b><small>One place. Clear guidance.</small></div><BadgeCheck className="ds-art-check" size={22} /></div>
            <div className="ds-art-float ds-float-top"><FileCheck2 size={18} /><span>Document ready</span></div>
            <div className="ds-art-float ds-float-bottom"><ShieldCheck size={18} /><span>Secure by design</span></div>
          </div>
        </section>

        <section className="ds-search-section" aria-label="Search services">
          <div className="ds-search-heading"><div><span className="ds-kicker">FIND THE RIGHT SERVICE</span><h2>What do you need help with?</h2></div><span className="ds-language-note">हिंदी और English दोनों में खोजें</span></div>
          <label className="ds-searchbox"><Search size={22} /><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveCategory('all'); }} placeholder="Try “PDF chhota”, “Aadhaar me pita ka naam”, “photo KB kam”..." /><kbd>Search</kbd>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={17} /></button>}</label>
          <div className="ds-search-hints"><span>Popular searches:</span>{['PDF size kam', 'PDF jodna', 'आधार पता', 'Photo 20 KB'].map((hint) => <button key={hint} onClick={() => { setQuery(hint); setActiveCategory('all'); }}>{hint}</button>)}</div>
        </section>

        <section className="ds-section" id="ds-government-services">
          <div className="ds-section-heading"><div><span className="ds-kicker">GOVERNMENT & CITIZEN SERVICES</span><h2>Choose a service category</h2><p>Explore popular services and see what may be required before you begin.</p></div><button className="ds-outline-button" onClick={() => { setActiveCategory('all'); setShowAll(true); scrollToServices(); }}>View all services <ArrowUpRight size={16} /></button></div>
          <div className="ds-category-grid">
            {SEVA_CATEGORIES.slice(0, 7).map((category, index) => {
              const Icon = categoryIcon[category.icon] || FileText;
              return <button key={category.id} className={`ds-category-card ds-category-${index}`} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                <span className="ds-category-icon"><Icon size={22} /></span><strong>{category.label}</strong><small>{category.hindi}</small><span className="ds-category-arrow"><ArrowUpRight size={17} /></span>
              </button>;
            })}
          </div>
        </section>

        <section className="ds-section ds-results-section" id="ds-service-results">
          <div className="ds-section-heading"><div><span className="ds-kicker">{query ? 'SEARCH RESULTS' : 'POPULAR SERVICES'}</span><h2>{query ? `Results for “${query}”` : 'Popular government services'}</h2><p>{results.length} matching services in this catalogue preview.</p></div><button className="ds-clear-filter" onClick={() => { setQuery(''); setActiveCategory('all'); }}>Clear filters</button></div>
          <div className="ds-filter-row"><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>All</button>{SEVA_CATEGORIES.slice(0, 7).map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}</div>
          {results.length ? <div className="ds-service-grid">{(showAll ? results : results.slice(0, 6)).map((service) => <ServiceCard key={service.id} service={service} onSelect={setSelected} />)}</div> : <div className="ds-empty"><Search size={28} /><h3>No exact match yet</h3><p>Try a shorter phrase, a Hindi word, or a common task name.</p><button onClick={() => { setQuery(''); setActiveCategory('all'); }}>Show all services</button></div>}
          {!showAll && results.length > 6 && <button className="ds-load-more" onClick={() => setShowAll(true)}>Show all {results.length} matching services <ChevronDown size={16} /></button>}
        </section>

        <section className="ds-document-band" id="ds-document-services">
          <div className="ds-document-intro"><span className="ds-kicker">EVERYDAY FILE & DOCUMENT HELP</span><h2>Document & PDF Services</h2><p>Small file-size limits, image conversions, scan cleanup and document formatting — explained in simple steps.</p><button className="ds-light-button" onClick={() => { setActiveCategory('pdf'); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore PDF services <ArrowRight size={16} /></button></div>
          <div className="ds-document-tiles">{SEVA_CATEGORIES.slice(7).map((category) => { const Icon = categoryIcon[category.icon] || FileText; return <button key={category.id} onClick={() => { setActiveCategory(category.id); setQuery(''); setShowAll(true); document.getElementById('ds-service-results')?.scrollIntoView({ behavior: 'smooth' }); }}><Icon size={21} /><strong>{category.label}</strong><span>{category.description}</span><ArrowUpRight size={16} /></button>; })}</div>
        </section>

        <section className="ds-trust-row"><div><ShieldCheck size={22} /><span><b>Your documents matter</b><small>We will request only what is needed for the selected service.</small></span></div><div><WalletCards size={22} /><span><b>Fees shown separately</b><small>Service charges and government fees will never be mixed.</small></span></div><div><LifeBuoy size={22} /><span><b>Human assistance</b><small>Ask before proceeding if a step is unclear.</small></span></div></section>

        <section className="ds-bottom-cta"><div><span className="ds-kicker">A CLEARER WAY TO GET STARTED</span><h2>Not sure which service you need?</h2><p>Search using the words you normally use. We’ll help you find the closest matching service.</p></div><button onClick={() => { document.querySelector<HTMLInputElement>('.ds-searchbox input')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Search services <Search size={17} /></button></section>
      </main>

      <footer className="ds-footer"><a href="/" className="ds-brand"><span className="ds-brand-mark">T</span><span><strong>TANSHU ONLINE</strong><small>Digital Seva Center</small></span></a><p>Independent digital assistance platform. Not a government website or government department.</p><span>© {new Date().getFullYear()} TANSHU ONLINE</span></footer>

      {selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="ds-detail-modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">SERVICE DETAILS</span><h2>{selected.name}</h2><p className="ds-modal-hindi">{selected.hindi}</p><p>{selected.description}</p><div className="ds-detail-grid"><div><small>SERVICE CHARGE</small><b>{selected.serviceFee}</b></div><div><small>GOVERNMENT FEE</small><b>{selected.governmentFee}</b></div><div><small>AVAILABILITY</small><b>{selected.availability}</b></div><div><small>ASSISTANCE TYPE</small><b>{selected.assistance}</b></div></div><RefundPolicyNotice service={selected} /><h3>Documents / information to prepare</h3><ul>{selected.documents.map((item) => <li key={item}>{item}</li>)}</ul>{selected.note && <div className="ds-important-note"><ShieldCheck size={18} /><span>{selected.note}</span></div>}<div className="ds-preview-notice"><CalendarClock size={18} /><span>Booking and payment are not enabled in this preview. This page is for service discovery and catalogue review only.</span></div><div className="ds-modal-actions"><button className="ds-modal-book" onClick={openBookingForm}>Request a booking <ArrowRight size={16} /></button><button className="ds-modal-done" onClick={() => setSelected(null)}>Close</button></div></section></div>}

      {showBookingForm && selected && <div className="ds-modal-backdrop" role="presentation" onClick={() => !bookingSubmitting && setShowBookingForm(false)}><section className="ds-detail-modal ds-booking-modal" role="dialog" aria-modal="true" aria-label="Request a booking" onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setShowBookingForm(false)} aria-label="Close" disabled={bookingSubmitting}><X size={20} /></button>{bookingReference ? <><span className="ds-kicker">REQUEST RECEIVED</span><h2>Your booking request is saved</h2><p>We have recorded your request for <strong>{selected.name}</strong>. This is a request for assistance, not a government application submission.</p><div className="ds-booking-reference"><small>YOUR BOOKING REFERENCE</small><strong>{bookingReference}</strong></div><p className="ds-booking-help">Please keep this reference safe. The team can use it to locate your request after the Preview database is connected.</p><button className="ds-modal-book" onClick={() => { setShowBookingForm(false); setSelected(null); }}>Done</button></> : <><span className="ds-kicker">BOOKING REQUEST</span><h2>Request this service</h2><p>Service: <strong>{selected.name}</strong></p><form className="ds-booking-form" onSubmit={submitBooking}><label>Full name<input autoComplete="name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} minLength={2} maxLength={80} required placeholder="Enter your name" /></label><label>Mobile number<input autoComplete="tel" inputMode="tel" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} minLength={10} maxLength={16} required placeholder="10-digit mobile number" /></label><label>Email address <span>(required for request updates)</span><input autoComplete="email" type="email" value={bookingEmail} onChange={(event) => setBookingEmail(event.target.value)} maxLength={254} required placeholder="name@example.com" /></label><div className="ds-booking-privacy"><ShieldCheck size={18} /><span>For this first step, we only collect your name and contact details. Do not enter Aadhaar/PAN numbers, OTPs, passwords or upload documents here.</span></div><BookingPolicyConsent termsAccepted={termsAccepted} refundAccepted={refundAccepted} onTermsChange={setTermsAccepted} onRefundChange={setRefundAccepted} /><label className="ds-booking-consent"><input type="checkbox" checked={bookingConsent} onChange={(event) => setBookingConsent(event.target.checked)} required /><span>I agree that TANSHU ONLINE may contact me about this service request. I understand this is an independent assistance service, not a government department.</span></label>{bookingError && <p className="ds-booking-error" role="alert">{bookingError}</p>}<button className="ds-modal-book" type="submit" disabled={bookingSubmitting || !bookingConsent || !termsAccepted || !refundAccepted}>{bookingSubmitting ? 'Submitting…' : 'Submit booking request'} <ArrowRight size={16} /></button></form></>}</section></div>}
      {showTrackingInfo && <div className="ds-modal-backdrop" role="presentation" onClick={() => setShowTrackingInfo(false)}><section className="ds-detail-modal ds-tracking-modal" role="dialog" aria-modal="true" aria-label="Request tracking" onClick={(event) => event.stopPropagation()}><button className="ds-modal-close" onClick={() => setShowTrackingInfo(false)} aria-label="Close"><X size={20} /></button><span className="ds-kicker">REQUEST TRACKING</span><h2>Track your service request</h2><p>Tracking will be activated after the secure booking and request database is configured.</p><div className="ds-preview-notice"><Clock3 size={18} /><span>This preview does not create or look up real booking IDs. No customer documents or personal details should be uploaded here yet.</span></div><button className="ds-modal-done" onClick={() => setShowTrackingInfo(false)}>Close</button></section></div>}
    </div>
  );
}
