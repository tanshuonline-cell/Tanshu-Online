import React, { useMemo, useState } from 'react';
import './creativeStudio.css';
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Layers3, Monitor, Palette, Smartphone, Sparkles, X } from 'lucide-react';

type GalleryCategory = 'apps' | 'software' | 'design';
type Sample = { id: string; title: string; hiTitle: string; type: string; hiType: string; purpose: string; hiPurpose: string; screens: string[]; hiScreens: string[]; accent: string; icon: string; };
const SAMPLES: Record<GalleryCategory, Sample[]> = {
  apps: [
    { id: 'app-booking', title: 'SAFAR — Smart Booking', hiTitle: 'सफ़र — स्मार्ट बुकिंग', type: 'Travel & appointment booking', hiType: 'यात्रा और अपॉइंटमेंट बुकिंग', purpose: 'A customer-facing booking flow with discovery, date selection, booking status and profile screens.', hiPurpose: 'ग्राहक के लिए खोज, तारीख चयन, बुकिंग स्थिति और प्रोफाइल स्क्रीन वाला बुकिंग फ्लो।', screens: ['Explore', 'Select date', 'My bookings', 'Profile'], hiScreens: ['खोजें', 'तारीख चुनें', 'मेरी बुकिंग', 'प्रोफाइल'], accent: '#2876a8', icon: 'S' },
    { id: 'app-learning', title: 'GYAAN — Learning App', hiTitle: 'ज्ञान — लर्निंग ऐप', type: 'Education & course learning', hiType: 'शिक्षा और कोर्स', purpose: 'A learning concept with course cards, lesson progress, saved resources and student profile.', hiPurpose: 'कोर्स कार्ड, पाठ की प्रगति, सेव संसाधन और विद्यार्थी प्रोफाइल वाला लर्निंग कॉन्सेप्ट।', screens: ['My learning', 'Course details', 'Lesson player', 'Progress'], hiScreens: ['मेरी पढ़ाई', 'कोर्स विवरण', 'पाठ', 'प्रगति'], accent: '#7452a4', icon: 'G' },
    { id: 'app-business', title: 'KART — Business Companion', hiTitle: 'कार्ट — बिज़नेस ऐप', type: 'Small business & customer portal', hiType: 'छोटा व्यवसाय और ग्राहक पोर्टल', purpose: 'A compact business app concept for catalogue browsing, order tracking, support and account access.', hiPurpose: 'कैटलॉग, ऑर्डर ट्रैकिंग, सहायता और अकाउंट के लिए छोटा बिज़नेस ऐप कॉन्सेप्ट।', screens: ['Dashboard', 'Catalogue', 'Orders', 'Support'], hiScreens: ['डैशबोर्ड', 'कैटलॉग', 'ऑर्डर', 'सहायता'], accent: '#24866b', icon: 'K' },
  ],
  software: [
    { id: 'soft-cafe', title: 'COUNTER — Cafe Manager', hiTitle: 'काउंटर — कैफे मैनेजर', type: 'Billing & inventory desktop tool', hiType: 'बिलिंग और इन्वेंटरी डेस्कटॉप टूल', purpose: 'A desktop workflow concept for orders, billing, stock alerts, daily sales and printable reports.', hiPurpose: 'ऑर्डर, बिलिंग, स्टॉक अलर्ट, दैनिक बिक्री और प्रिंट रिपोर्ट के लिए डेस्कटॉप वर्कफ़्लो।', screens: ['Overview', 'New order', 'Inventory', 'Reports'], hiScreens: ['ओवरव्यू', 'नया ऑर्डर', 'इन्वेंटरी', 'रिपोर्ट'], accent: '#b66a36', icon: 'C' },
    { id: 'soft-office', title: 'WORKDESK — Office Suite', hiTitle: 'वर्कडेस्क — ऑफिस सूट', type: 'Document & workflow utility', hiType: 'दस्तावेज़ और वर्कफ़्लो यूटिलिटी', purpose: 'A browser-based workspace concept for task queues, document status, customer records and team activity.', hiPurpose: 'टास्क कतार, दस्तावेज़ स्थिति, ग्राहक रिकॉर्ड और टीम गतिविधि के लिए ब्राउज़र वर्कस्पेस।', screens: ['Workspace', 'Tasks', 'Customer files', 'Activity'], hiScreens: ['वर्कस्पेस', 'टास्क', 'ग्राहक फाइलें', 'गतिविधि'], accent: '#416d9b', icon: 'W' },
    { id: 'soft-studio', title: 'PIXELFORGE — Creative Studio', hiTitle: 'पिक्सेलफोर्ज — क्रिएटिव स्टूडियो', type: 'Photo & design editor concept', hiType: 'फोटो और डिजाइन एडिटर कॉन्सेप्ट', purpose: 'A creative software concept with canvas, asset library, export presets and project history.', hiPurpose: 'कैनवास, एसेट लाइब्रेरी, एक्सपोर्ट प्रीसेट और प्रोजेक्ट हिस्ट्री वाला क्रिएटिव सॉफ्टवेयर कॉन्सेप्ट।', screens: ['Projects', 'Editor canvas', 'Assets', 'Export'], hiScreens: ['प्रोजेक्ट', 'एडिटर कैनवास', 'एसेट', 'एक्सपोर्ट'], accent: '#7855a9', icon: 'P' },
  ],
  design: [
    { id: 'design-poster', title: 'Local Launch Poster', hiTitle: 'लोकल लॉन्च पोस्टर', type: 'Poster / banner direction', hiType: 'पोस्टर / बैनर डिजाइन', purpose: 'A fictional neighbourhood store launch poster with clear hierarchy and print-safe layout.', hiPurpose: 'काल्पनिक स्थानीय दुकान लॉन्च पोस्टर, स्पष्ट टेक्स्ट और प्रिंट-सेफ लेआउट के साथ।', screens: ['Square social', 'Portrait poster', 'Landscape banner'], hiScreens: ['स्क्वायर पोस्ट', 'पोर्ट्रेट पोस्टर', 'लैंडस्केप बैनर'], accent: '#c56c3e', icon: 'P' },
    { id: 'design-social', title: 'AAROH — Social Set', hiTitle: 'आरोह — सोशल सेट', type: 'Five coordinated social creatives', hiType: 'पाँच matching सोशल क्रिएटिव', purpose: 'A fictional wellness brand campaign direction with consistent typography and reusable campaign elements.', hiPurpose: 'काल्पनिक वेलनेस ब्रांड कैंपेन, एक जैसी typography और दोबारा उपयोग योग्य डिजाइन तत्वों के साथ।', screens: ['Announcement', 'Feature post', 'Offer post', 'Testimonial', 'Reminder'], hiScreens: ['घोषणा', 'फीचर पोस्ट', 'ऑफर पोस्ट', 'रिव्यू पोस्ट', 'रिमाइंडर'], accent: '#9b5776', icon: 'A' },
    { id: 'design-logo', title: 'NIVA — Logo Direction', hiTitle: 'निवा — लोगो दिशा', type: 'Starter logo concept', hiType: 'स्टार्टर लोगो कॉन्सेप्ट', purpose: 'A fictional lifestyle label identity direction showing symbol, wordmark and monochrome use.', hiPurpose: 'काल्पनिक लाइफस्टाइल ब्रांड की पहचान: प्रतीक, वर्डमार्क और मोनोक्रोम उपयोग।', screens: ['Primary mark', 'Wordmark', 'Monochrome', 'Usage card'], hiScreens: ['मुख्य लोगो', 'वर्डमार्क', 'मोनोक्रोम', 'उपयोग कार्ड'], accent: '#8a744c', icon: 'N' },
    { id: 'design-brochure', title: 'SAANJH — Four-page Brochure', hiTitle: 'सांझ — चार पेज ब्रोशर', type: 'Digital brochure concept', hiType: 'डिजिटल ब्रोशर कॉन्सेप्ट', purpose: 'A fictional service brand brochure direction covering cover, overview, services and contact.', hiPurpose: 'काल्पनिक सर्विस ब्रांड ब्रोशर: कवर, परिचय, सेवाएँ और संपर्क।', screens: ['Cover', 'About', 'Services', 'Contact'], hiScreens: ['कवर', 'परिचय', 'सेवाएँ', 'संपर्क'], accent: '#397d79', icon: 'S' },
  ],
};
const TITLES = { apps: ['Mobile & Web App Studio', 'मोबाइल और वेब ऐप स्टूडियो'], software: ['Custom Software Studio', 'कस्टम सॉफ्टवेयर स्टूडियो'], design: ['Graphic Design Studio', 'ग्राफिक डिजाइन स्टूडियो'] } as const;
const SERVICE_IDS = { apps: 'custom-app-advance', software: 'custom-project-advance', design: 'poster-design' } as const;

export default function CreativeServicesStudio({ category, language, onClose, onRequestQuote }: {
  category: GalleryCategory; language: 'en' | 'hi'; onClose: () => void; onRequestQuote: (serviceId: string, sampleId: string, sampleTitle: string) => void;
}) {
  const hi = language === 'hi';
  const [selectedId, setSelectedId] = useState(SAMPLES[category][0].id);
  const [screenIndex, setScreenIndex] = useState(0);
  const sample = useMemo(() => SAMPLES[category].find((item) => item.id === selectedId) || SAMPLES[category][0], [category, selectedId]);
  const screens = hi ? sample.hiScreens : sample.screens;
  const title = hi ? sample.hiTitle : sample.title;
  const screen = screens[Math.min(screenIndex, screens.length - 1)];
  return (
    <div className="ds-modal-backdrop ds-creative-studio-backdrop" role="presentation" onClick={onClose}>
      <section className="ds-detail-modal ds-creative-studio" role="dialog" aria-modal="true" aria-label={hi ? TITLES[category][1] : TITLES[category][0]} onClick={(event) => event.stopPropagation()}>
        <div className="ds-creative-studio-top"><button type="button" onClick={onClose} className="ds-preview-return"><ArrowLeft size={15} /> {hi ? 'वापस' : 'Back'}</button><button type="button" className="ds-modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        <span className="ds-kicker">{hi ? 'मूल कॉन्सेप्ट • केवल डेमो' : 'ORIGINAL CONCEPTS • DEMO ONLY'}</span>
        <h2>{hi ? TITLES[category][1] : TITLES[category][0]}</h2>
        <p>{hi ? 'नीचे अलग-अलग कॉन्सेप्ट देखें, स्क्रीन/डिजाइन पेज बदलें और जिस दिशा में काम करवाना चाहते हैं उसे चुनें। अंतिम फीचर, कीमत और समय लिखित quotation में तय होंगे।' : 'Browse distinct concepts, switch between their sample screens/pages and choose the direction you want us to explore. Final features, price and schedule are confirmed in a written quotation.'}</p>
        <div className="ds-creative-sample-tabs">{SAMPLES[category].map((item) => <button key={item.id} type="button" className={item.id === sample.id ? 'active' : ''} onClick={() => { setSelectedId(item.id); setScreenIndex(0); }}><span style={{ background: item.accent }}>{item.icon}</span><b>{hi ? item.hiTitle : item.title}</b><small>{hi ? item.hiType : item.type}</small></button>)}</div>
        <div className="ds-creative-sample-preview">
          <div className="ds-creative-preview-copy"><span className="ds-kicker">{hi ? 'चुना हुआ कॉन्सेप्ट' : 'SELECTED CONCEPT'}</span><h3>{title}</h3><p>{hi ? sample.hiPurpose : sample.purpose}</p><div className="ds-creative-screen-tabs">{screens.map((label, index) => <button key={label} type="button" className={screenIndex === index ? 'active' : ''} onClick={() => setScreenIndex(index)}>{label}</button>)}</div><div className="ds-creative-screen-count">{hi ? 'स्क्रीन / पेज' : 'SCREEN / PAGE'} {screenIndex + 1} / {screens.length}</div></div>
          <div className={'ds-creative-device ds-creative-device-' + category}>
            <div className="ds-creative-device-bar"><i /><i /><i /><span>{category === 'apps' ? 'APP PREVIEW' : category === 'software' ? 'WORKSPACE' : 'DESIGN BOARD'}</span></div>
            {category === 'apps' ? <div className="ds-creative-phone"><div className="ds-creative-phone-head"><small>HELLO, THERE</small><b>{screen}</b></div><div className="ds-creative-phone-banner" style={{ background: sample.accent }}><span>{sample.icon}</span><b>{title}</b><small>Explore • Choose • Continue</small></div><div className="ds-creative-phone-row"><span /><span /><span /></div><div className="ds-creative-phone-card"><b>{screen}</b><small>Sample content preview</small><div /></div><div className="ds-creative-phone-nav"><span>⌂</span><span>◇</span><span>▤</span><span>○</span></div></div> : category === 'software' ? <div className="ds-creative-desktop"><aside><b>{sample.icon}</b><i /><i /><i /><i /></aside><div className="ds-creative-desktop-main"><header><b>{screen}</b><small>DEMO WORKSPACE</small></header><div className="ds-creative-stat-row"><span /><span /><span /></div><div className="ds-creative-work-area"><div /><div /><div /></div><div className="ds-creative-data-rows"><i /><i /><i /><i /></div></div></div> : <div className="ds-creative-artboard" style={{ '--sample-accent': sample.accent } as React.CSSProperties}><small>STUDIO CONCEPT / 2026</small><strong>{title.toUpperCase()}</strong><span>{screen.toUpperCase()}</span><div /><i>ORIGINAL SAMPLE</i></div>}
          </div>
        </div>
        <div className="ds-creative-studio-footer"><small>{hi ? 'डेमो केवल दिशा दिखाता है; यह तैयार उत्पाद या शामिल फीचर की गारंटी नहीं है।' : 'Samples are illustrative directions, not a promise of a finished product or included feature set.'}</small><button type="button" className="ds-project-pay-button" onClick={() => onRequestQuote(SERVICE_IDS[category], sample.id, title)}>{hi ? 'यह डिजाइन चुनें / कोटेशन माँगें' : 'Choose this direction / Request a quote'} <ArrowRight size={16} /></button></div>
      </section>
    </div>
  );
}
