import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Globe2, LayoutTemplate, Monitor, ShoppingBag, GraduationCap, Utensils, BriefcaseBusiness, Sparkles, Clock3, IndianRupee, Palette } from 'lucide-react';

type Props = { language: 'en' | 'hi'; onClose: () => void; onRequestQuote: () => void };

const examples = [
  { id: 'business', name: 'Business Website', hi: 'बिज़नेस वेबसाइट', icon: BriefcaseBusiness, tagline: 'A polished online presence for your company', hiTagline: 'आपके व्यवसाय के लिए एक पेशेवर ऑनलाइन पहचान', pages: ['Home', 'About', 'Services', 'Gallery', 'Contact'], hiPages: ['होम', 'हमारे बारे में', 'सेवाएँ', 'गैलरी', 'संपर्क'], accent: 'blue' },
  { id: 'portfolio', name: 'Portfolio Website', hi: 'पोर्टफोलियो वेबसाइट', icon: Palette, tagline: 'Showcase your work, skills and achievements', hiTagline: 'अपने काम, कौशल और उपलब्धियों को दिखाएँ', pages: ['Home', 'My Work', 'About Me', 'Contact'], hiPages: ['होम', 'मेरा काम', 'मेरे बारे में', 'संपर्क'], accent: 'violet' },
  { id: 'shop', name: 'Online Store', hi: 'ऑनलाइन स्टोर', icon: ShoppingBag, tagline: 'Product catalogue, cart and enquiry flow', hiTagline: 'प्रोडक्ट कैटलॉग, कार्ट और पूछताछ की सुविधा', pages: ['Shop', 'Categories', 'Offers', 'Cart'], hiPages: ['शॉप', 'कैटेगरी', 'ऑफर', 'कार्ट'], accent: 'amber' },
  { id: 'education', name: 'Education / Coaching', hi: 'एजुकेशन / कोचिंग', icon: GraduationCap, tagline: 'Courses, batches, results and admission details', hiTagline: 'कोर्स, बैच, रिज़ल्ट और एडमिशन की जानकारी', pages: ['Home', 'Courses', 'Results', 'Admissions'], hiPages: ['होम', 'कोर्स', 'रिज़ल्ट', 'एडमिशन'], accent: 'green' },
  { id: 'restaurant', name: 'Restaurant Website', hi: 'रेस्टोरेंट वेबसाइट', icon: Utensils, tagline: 'Menu, photos, location and table enquiries', hiTagline: 'मेन्यू, फोटो, लोकेशन और टेबल पूछताछ', pages: ['Home', 'Menu', 'Our Story', 'Find Us'], hiPages: ['होम', 'मेन्यू', 'हमारी कहानी', 'लोकेशन'], accent: 'rose' },
  { id: 'services', name: 'Service Booking Website', hi: 'सर्विस बुकिंग वेबसाइट', icon: LayoutTemplate, tagline: 'Present services and collect customer requests', hiTagline: 'सेवाएँ दिखाएँ और ग्राहकों के अनुरोध पाएँ', pages: ['Home', 'Services', 'Packages', 'Book Now'], hiPages: ['होम', 'सेवाएँ', 'पैकेज', 'बुक करें'], accent: 'cyan' },
];

const packages = [
  { name: 'Basic', hi: 'बेसिक', price: '₹4,999', time: '5–7 working days', hiTime: '5–7 कार्यदिवस', desc: 'A clean starter website for a small business or personal profile.', hiDesc: 'छोटे व्यवसाय या व्यक्तिगत प्रोफाइल के लिए साफ़-सुथरी शुरुआती वेबसाइट।', features: ['Up to 5 pages', 'Mobile responsive layout', 'Contact / enquiry form', 'Basic on-page setup'], hiFeatures: ['अधिकतम 5 पेज', 'मोबाइल-फ्रेंडली डिज़ाइन', 'संपर्क / पूछताछ फॉर्म', 'बेसिक ऑन-पेज सेटअप'] },
  { name: 'Professional', hi: 'प्रोफेशनल', price: '₹9,999', time: '8–14 working days', hiTime: '8–14 कार्यदिवस', desc: 'A custom-styled website with richer sections and stronger presentation.', hiDesc: 'बेहतर सेक्शन और खास डिज़ाइन वाली कस्टम वेबसाइट।', features: ['Up to 10 pages', 'Custom visual design', 'Gallery / service sections', 'Enquiry form and map link', 'Speed and SEO basics'], hiFeatures: ['अधिकतम 10 पेज', 'कस्टम विज़ुअल डिज़ाइन', 'गैलरी / सर्विस सेक्शन', 'पूछताछ फॉर्म और मैप लिंक', 'स्पीड और SEO की बुनियादी सेटिंग'] },
  { name: 'Premium', hi: 'प्रीमियम', price: '₹19,999+', time: '15–25+ working days', hiTime: '15–25+ कार्यदिवस', desc: 'A larger, feature-rich website planned around your workflow.', hiDesc: 'आपके काम के तरीके के अनुसार बड़ी और फीचर-रिच वेबसाइट।', features: ['Custom page structure', 'Advanced forms / integrations', 'Rich animations and sections', 'Product / course catalogue options', 'Extended testing and handover'], hiFeatures: ['कस्टम पेज स्ट्रक्चर', 'एडवांस फॉर्म / इंटीग्रेशन', 'बेहतर एनिमेशन और सेक्शन', 'प्रोडक्ट / कोर्स कैटलॉग विकल्प', 'विस्तृत टेस्टिंग और हैंडओवर'] },
];

export default function WebsiteServicesShowcase({ language, onClose, onRequestQuote }: Props) {
  const hi = language === 'hi';
  const [active, setActive] = useState('business');
  const selected = examples.find((item) => item.id === active) || examples[0];
  const Icon = selected.icon;
  return <div className="ds-webshowcase" role="dialog" aria-modal="true" aria-label={hi ? 'वेबसाइट डिज़ाइन डेमो' : 'Website design demo'}>
    <header className="ds-webshowcase-header">
      <button className="ds-webshowcase-back" onClick={onClose}><ArrowLeft size={17} /> {hi ? 'डिजिटल सेवा पर वापस जाएँ' : 'Back to Digital Seva'}</button>
      <div className="ds-webshowcase-brand"><span className="ds-webshowcase-logo"><Globe2 size={19} /></span><span><b>TANSHU ONLINE</b><small>{hi ? 'वेबसाइट डिज़ाइन स्टूडियो' : 'WEBSITE DESIGN STUDIO'}</small></span></div>
      <button className="ds-webshowcase-quote" onClick={onRequestQuote}>{hi ? 'कोटेशन माँगें' : 'Request a quote'} <ArrowRight size={16} /></button>
    </header>
    <main className="ds-webshowcase-main">
      <section className="ds-webshowcase-hero">
        <span className="ds-webshowcase-eyebrow"><Sparkles size={14} /> {hi ? 'आपके आइडिया से आपकी वेबसाइट तक' : 'FROM YOUR IDEA TO YOUR WEBSITE'}</span>
        <h1>{hi ? <>आपके व्यवसाय के लिए<br/><em>एक शानदार वेबसाइट।</em></> : <>A website that makes<br/><em>your business stand out.</em></>}</h1>
        <p>{hi ? 'नीचे अलग-अलग वेबसाइट के उदाहरण देखें। आप इनमें से कोई स्टाइल चुन सकते हैं या अपनी पसंद का बिल्कुल अलग कस्टम डिज़ाइन बनवा सकते हैं।' : 'Explore different website examples below. Choose a style you like or ask us to create a completely different custom design.'}</p>
        <div className="ds-webshowcase-points"><span><Check size={15}/>{hi ? 'मोबाइल-फ्रेंडली डिज़ाइन' : 'Mobile-friendly design'}</span><span><Check size={15}/>{hi ? 'आपके ब्रांड के अनुसार' : 'Designed around your brand'}</span><span><Check size={15}/>{hi ? 'स्पष्ट प्रोजेक्ट कोटेशन' : 'Clear project quotation'}</span></div>
      </section>
      <section className="ds-webshowcase-examples">
        <div className="ds-webshowcase-section-title"><div><small>{hi ? 'वेबसाइट के उदाहरण' : 'WEBSITE EXAMPLES'}</small><h2>{hi ? 'आप किस तरह की वेबसाइट चाहते हैं?' : 'What kind of website do you need?'}</h2></div><span>{hi ? 'उदाहरण देखने के लिए चुनें' : 'Select an example to preview'}</span></div>
        <div className="ds-webshowcase-types">{examples.map((item) => { const TypeIcon = item.icon; return <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}><TypeIcon size={19}/><span>{hi ? item.hi : item.name}</span><ArrowRight size={14}/></button>; })}</div>
        <div className={'ds-webshowcase-preview ds-accent-' + selected.accent}>
          <div className="ds-webshowcase-browser"><span/><span/><span/><small>yourbrand.example</small><ExternalLink size={13}/></div>
          <div className="ds-webshowcase-site">
            <nav><b><span className="ds-preview-mark"><Icon size={15}/></span>{active === 'business' ? 'NOVA' : active === 'portfolio' ? 'AARAV' : active === 'shop' ? 'THE EDIT' : active === 'education' ? 'BRIGHTPATH' : active === 'restaurant' ? 'CASA VERDE' : 'YOUR BRAND'}</b><div>{(hi ? selected.hiPages : selected.pages).slice(0,3).map((p) => <span key={p}>{p}</span>)}</div><button>{hi ? 'संपर्क' : 'Contact'}</button></nav>
            <div className="ds-preview-content"><div className="ds-preview-copy"><small>{hi ? 'आपका स्वागत है' : 'WELCOME TO OUR WEBSITE'}</small><h3>{active === 'restaurant' ? (hi ? 'स्वाद का नया अनुभव।' : 'A taste worth sharing.') : active === 'education' ? (hi ? 'सीखें। आगे बढ़ें।' : 'Learn. Grow. Succeed.') : active === 'shop' ? (hi ? 'कुछ खास खोजें।' : 'Find something special.') : active === 'portfolio' ? (hi ? 'विचारों को आकार देना।' : 'Ideas made visible.') : active === 'services' ? (hi ? 'आपका काम, हमारी विशेषज्ञता।' : 'Your goals. Our expertise.') : (hi ? 'आपके सपनों को आगे बढ़ाएँ।' : 'Build your next chapter.')}</h3><p>{hi ? selected.hiTagline : selected.tagline}</p><button>{hi ? 'और जानें' : 'Explore more'} <ArrowRight size={13}/></button></div><div className="ds-preview-art"><div className="ds-preview-art-card"><Icon size={38}/><b>{active === 'shop' ? 'NEW COLLECTION' : active === 'education' ? 'ADMISSIONS OPEN' : active === 'restaurant' ? 'FRESH • LOCAL • GOOD' : 'MADE FOR YOU'}</b><small>{hi ? 'आपके ब्रांड की पहचान' : 'A clear brand experience'}</small></div><div className="ds-preview-orbit"/></div></div>
            <div className="ds-preview-footer"><span>✦ {hi ? selected.hi : selected.name}</span><span>{hi ? 'डेमो लेआउट • वास्तविक प्रोजेक्ट कस्टम होगा' : 'DEMO LAYOUT • YOUR PROJECT WILL BE CUSTOMISED'}</span></div>
          </div>
        </div>
        <p className="ds-webshowcase-caption">{hi ? 'यह केवल डिज़ाइन का उदाहरण है। अंतिम वेबसाइट का रंग, फोटो, सामग्री और लेआउट आपके ब्रांड और ज़रूरत के अनुसार तैयार होगा।' : 'This is a design example only. Final colours, images, content and layout will be tailored to your brand and requirements.'}</p>
      </section>
      <section className="ds-webshowcase-pricing">
        <div className="ds-webshowcase-section-title"><div><small>{hi ? 'शुरुआती बजट और समय' : 'STARTING BUDGET & TIMELINE'}</small><h2>{hi ? 'अपना पैकेज चुनें' : 'Choose a starting package'}</h2></div><span>{hi ? 'अंतिम कोटेशन काम देखकर' : 'Final quote after scope review'}</span></div>
        <div className="ds-webshowcase-packages">{packages.map((pkg) => <article key={pkg.name} className={'ds-web-package ds-package-' + pkg.name.toLowerCase()}><div className="ds-web-package-top"><b>{hi ? pkg.hi : pkg.name}</b>{pkg.name === 'Professional' && <span>{hi ? 'लोकप्रिय' : 'POPULAR'}</span>}</div><strong className="ds-web-package-price">{pkg.price}<small>{hi ? ' से शुरू' : ' starting'}</small></strong><p>{hi ? pkg.hiDesc : pkg.desc}</p><div className="ds-web-package-time"><Clock3 size={15}/>{hi ? pkg.hiTime : pkg.time}</div><ul>{(hi ? pkg.hiFeatures : pkg.features).map((feature) => <li key={feature}><Check size={15}/>{feature}</li>)}</ul><button onClick={onRequestQuote}>{hi ? 'इस पैकेज पर बात करें' : 'Discuss this package'} <ArrowRight size={15}/></button></article>)}</div>
        <p className="ds-webshowcase-disclaimer"><IndianRupee size={15}/>{hi ? 'दिखाई गई कीमतें केवल उदाहरण के लिए शुरुआती अनुमान हैं, पक्का ऑफर नहीं। वास्तविक कीमत पेजों की संख्या, फीचर्स, कस्टम डिज़ाइन, कंटेंट, इंटीग्रेशन और काम के समय के आधार पर तय होगी। डोमेन और होस्टिंग का खर्च अलग हो सकता है और आपकी मंज़ूरी के बिना कोई खरीदारी नहीं होगी।' : 'Prices are indicative starting examples, not a fixed offer. The final quote depends on page count, features, custom design, content, integrations and time required. Domain and hosting may cost extra; nothing will be purchased without your approval.'}</p>
      </section>
      <section className="ds-webshowcase-custom"><div><span><Monitor size={18}/>{hi ? 'आपकी ज़रूरत के अनुसार' : 'MADE FOR YOUR REQUIREMENTS'}</span><h2>{hi ? 'अपनी पसंद का अलग डिज़ाइन भी बनवा सकते हैं।' : 'Have a different idea? We can design that too.'}</h2><p>{hi ? 'आपको ऊपर का कोई उदाहरण पसंद हो तो उसी तरह का डिज़ाइन बन सकता है। या अपना रेफरेंस, रंग, पेज और फीचर बताकर पूरी तरह कस्टम वेबसाइट बनवा सकते हैं।' : 'If you like one of the examples, we can create a similar style. Or share your reference, colours, pages and features for a completely custom website.'}</p></div><button onClick={onRequestQuote}>{hi ? 'अपना प्रोजेक्ट बताएं' : 'Tell us about your project'} <ArrowRight size={16}/></button></section>
      <footer className="ds-webshowcase-footer">TANSHU ONLINE <span>•</span> {hi ? 'डिज़ाइन, स्पष्टता और भरोसे के साथ।' : 'Designed with clarity and care.'}</footer>
    </main>
  </div>;
}
