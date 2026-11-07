import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Globe2, Heart, Menu, Search, ShoppingBag, Star, Sparkles, Monitor, Smartphone, Utensils, GraduationCap, BriefcaseBusiness, Palette, Gem, Flower2, Store, House, Leaf, X } from 'lucide-react';

type Props = { language: 'en' | 'hi'; onClose: () => void; onRequestQuote: () => void };
type Tier = 'Basic' | 'Professional' | 'Premium';
type Demo = {
  id: string; tier: Tier; category: string; hiCategory: string; name: string; hiName: string; brand: string;
  tagline: string; hiTagline: string; title: string; hiTitle: string; description: string; hiDescription: string;
  logo: string; style: string; accent: string; bg: string; image: string; nav: string[]; hiNav: string[];
  products: { name: string; price: string; image: string; tag?: string }[];
  cta: string; hiCta: string;
};

const demos: Demo[] = [
  {
    id:'local-business',tier:'Basic',category:'Local Business',hiCategory:'स्थानीय व्यवसाय',name:'Local Business Website',hiName:'लोकल बिज़नेस वेबसाइट',brand:'APNA BAZAAR',logo:'A',style:'local',
    tagline:'Your neighbourhood, one click closer.',hiTagline:'आपके शहर की भरोसेमंद पसंद, अब ऑनलाइन।',
    title:'Good things.\nRight around you.',hiTitle:'आपके शहर की\nअपनी पसंद।',description:'A clean, welcoming website for a local shop, service or family-run business.',hiDescription:'स्थानीय दुकान, सर्विस या पारिवारिक व्यवसाय के लिए सरल और भरोसेमंद वेबसाइट।',
    accent:'#b4532a',bg:'#fff5e9',image:'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=1200&q=85',nav:['Home','About','What We Offer','Contact'],hiNav:['होम','हमारे बारे में','हमारी सेवाएँ','संपर्क'],
    products:[{name:'Everyday Essentials',price:'From ₹99',image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'},{name:'Local Favourites',price:'From ₹149',image:'https://images.unsplash.com/photo-1543168256-418811576931?w=500&q=80'},{name:'Special Picks',price:'From ₹199',image:'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&q=80'}],
    cta:'Explore our store',hiCta:'हमारी दुकान देखें'
  },
  {
    id:'coaching',tier:'Basic',category:'Coaching & Education',hiCategory:'कोचिंग और शिक्षा',name:'Coaching Institute Website',hiName:'कोचिंग संस्थान वेबसाइट',brand:'UDAAN ACADEMY',logo:'U',style:'education',
    tagline:'Learn with purpose. Rise with confidence.',hiTagline:'सीखिए आत्मविश्वास के साथ, बढ़िए सफलता की ओर।',
    title:'Your next chapter\nstarts here.',hiTitle:'आपकी सफलता की\nशुरुआत यहाँ से।',description:'Course details, faculty, batches, results and admission enquiries in one place.',hiDescription:'कोर्स, शिक्षक, बैच, रिज़ल्ट और एडमिशन की जानकारी एक जगह।',
    accent:'#245b87',bg:'#edf5f7',image:'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&q=85',nav:['Courses','Our Faculty','Results','Admissions'],hiNav:['कोर्स','हमारे शिक्षक','रिज़ल्ट','एडमिशन'],
    products:[{name:'Foundation Batch',price:'From ₹799/mo',image:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80'},{name:'Exam Preparation',price:'From ₹1,299/mo',image:'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80'},{name:'Digital Learning',price:'From ₹499/mo',image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80'}],
    cta:'View courses',hiCta:'कोर्स देखें'
  },
  {
    id:'portfolio',tier:'Basic',category:'Personal Portfolio',hiCategory:'पर्सनल पोर्टफोलियो',name:'Creator Portfolio Website',hiName:'क्रिएटर पोर्टफोलियो वेबसाइट',brand:'RIYA MEHTA',logo:'R',style:'portfolio',
    tagline:'Independent creative • Jaipur, India',hiTagline:'स्वतंत्र क्रिएटिव • जयपुर, भारत',
    title:'Stories shaped\nwith intention.',hiTitle:'रचनात्मक सोच से\nबनी खास पहचान।',description:'A personal showcase for designers, photographers, freelancers and creators.',hiDescription:'डिज़ाइनर, फोटोग्राफर, फ्रीलांसर और क्रिएटर्स के लिए आकर्षक पोर्टफोलियो।',
    accent:'#785b49',bg:'#f4eee7',image:'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=85',nav:['Selected Work','About','Journal','Contact'],hiNav:['चुना हुआ काम','परिचय','जर्नल','संपर्क'],
    products:[{name:'Brand Identity',price:'View project',image:'https://images.unsplash.com/photo-1634942536790-253b8f7be5a5?w=500&q=80'},{name:'Editorial Design',price:'View project',image:'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=500&q=80'},{name:'Visual Stories',price:'View project',image:'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500&q=80'}],
    cta:'See selected work',hiCta:'काम देखें'
  },
  {
    id:'clothing',tier:'Professional',category:'Fashion & Clothing',hiCategory:'फैशन और कपड़े',name:'Indian Clothing Store',hiName:'इंडियन क्लोदिंग स्टोर',brand:'AABHA — THE INDIAN EDIT',logo:'आ',style:'fashion',
    tagline:'Crafted in India • Made to be loved',hiTagline:'भारत की खूबसूरती • हर पहनावे में',
    title:'A little tradition.\nA lot of you.',hiTitle:'परंपरा का रंग।\nआपका अपना अंदाज़।',description:'Discover sarees, kurtas and everyday Indian wear, thoughtfully selected for you.',hiDescription:'साड़ी, कुर्ते और रोज़मर्रा के भारतीय परिधानों का खूबसूरत कलेक्शन।',
    accent:'#8c3e49',bg:'#f8eee9',image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=90',nav:['New Arrivals','Sarees','Kurtas','Our Story'],hiNav:['नया कलेक्शन','साड़ियाँ','कुर्ते','हमारी कहानी'],
    products:[{name:'Banarasi Festive Saree',price:'₹2,499',image:'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=85',tag:'BESTSELLER'},{name:'Everyday Cotton Kurta',price:'₹899',image:'https://images.unsplash.com/photo-1583391733956-6c78276477e7?w=600&q=85',tag:'NEW'},{name:'Festive Suit Set',price:'₹1,799',image:'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=600&q=85'}],
    cta:'Shop the collection',hiCta:'कलेक्शन खरीदें'
  },
  {
    id:'restaurant',tier:'Professional',category:'Restaurant & Food',hiCategory:'रेस्टोरेंट और फूड',name:'Indian Restaurant Website',hiName:'इंडियन रेस्टोरेंट वेबसाइट',brand:'ZAAYKA — KITCHEN & CO.',logo:'ज़',style:'restaurant',
    tagline:'Fresh from our kitchen, straight to your table.',hiTagline:'हमारी रसोई से, सीधे आपकी मेज़ तक।',
    title:'A feast of\nIndian flavours.',hiTitle:'हर स्वाद में\nअपनापन।',description:'Explore the menu, discover signature dishes and send a table or takeaway enquiry.',hiDescription:'मेन्यू देखें, खास व्यंजन जानें और टेबल या टेकअवे की पूछताछ करें।',
    accent:'#a84d2b',bg:'#fbf1e5',image:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1400&q=90',nav:['Our Menu','Our Story','Gallery','Find Us'],hiNav:['मेन्यू','हमारी कहानी','गैलरी','लोकेशन'],
    products:[{name:'Royal Paneer Thali',price:'₹349',image:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=85',tag:'CHEF SPECIAL'},{name:'North Indian Platter',price:'₹429',image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=85',tag:'POPULAR'},{name:'Saffron Dessert',price:'₹149',image:'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=85'}],
    cta:'Explore the menu',hiCta:'मेन्यू देखें'
  },
  {
    id:'beauty',tier:'Professional',category:'Beauty & Cosmetics',hiCategory:'ब्यूटी और कॉस्मेटिक्स',name:'Beauty & Cosmetics Store',hiName:'ब्यूटी और कॉस्मेटिक्स स्टोर',brand:'GULMOHR BEAUTY',logo:'G',style:'beauty',
    tagline:'Everyday rituals. A little more you.',hiTagline:'हर दिन की देखभाल, आपका खास अंदाज़।',
    title:'Your glow,\nyour own way.',hiTitle:'आपकी चमक।\nआपकी पहचान।',description:'A premium-feel storefront for skincare, makeup, beauty essentials and salon services.',hiDescription:'स्किनकेयर, मेकअप, ब्यूटी प्रोडक्ट और सैलून सर्विस के लिए खूबसूरत स्टोर।',
    accent:'#a94e72',bg:'#faeef3',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=90',nav:['New In','Skincare','Makeup','Our Rituals'],hiNav:['नया','स्किनकेयर','मेकअप','हमारी खासियत'],
    products:[{name:'Rose Glow Serum',price:'₹699',image:'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&q=85',tag:'GLOW PICK'},{name:'Everyday Lip Tint',price:'₹399',image:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=85'},{name:'Botanical Face Care',price:'₹549',image:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&q=85'}],
    cta:'Discover beauty',hiCta:'ब्यूटी कलेक्शन देखें'
  },
  {
    id:'mobile',tier:'Premium',category:'Mobiles & Electronics',hiCategory:'मोबाइल और इलेक्ट्रॉनिक्स',name:'Mobile & Electronics Store',hiName:'मोबाइल और इलेक्ट्रॉनिक्स स्टोर',brand:'GADGET GALI',logo:'G',style:'tech',
    tagline:'Smart picks. Straight-up value.',hiTagline:'स्मार्ट पसंद • सही कीमत',
    title:'Upgrade your\neveryday.',hiTitle:'हर दिन को\nबनाएँ स्मार्ट।',description:'A modern electronics catalogue with product specs, comparisons and enquiry actions.',hiDescription:'प्रोडक्ट जानकारी, तुलना और पूछताछ के साथ आधुनिक मोबाइल-इलेक्ट्रॉनिक्स स्टोर।',
    accent:'#2554a0',bg:'#edf2fa',image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=90',nav:['Smartphones','Audio','Accessories','Offers'],hiNav:['स्मार्टफोन','ऑडियो','एक्सेसरीज़','ऑफर'],
    products:[{name:'Nova 5G Smartphone',price:'₹18,999',image:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=85',tag:'5G READY'},{name:'Studio Wireless Buds',price:'₹2,499',image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=85'},{name:'PowerCharge 30W',price:'₹899',image:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=85'}],
    cta:'Explore gadgets',hiCta:'गैजेट देखें'
  },
  {
    id:'grocery',tier:'Premium',category:'Grocery & Daily Needs',hiCategory:'किराना और रोज़मर्रा का सामान',name:'Fresh Grocery Store',hiName:'फ्रेश ग्रॉसरी स्टोर',brand:'TAZA TOKRI',logo:'त',style:'grocery',
    tagline:'Fresh picks for every Indian kitchen.',hiTagline:'हर भारतीय रसोई के लिए ताज़गी।',
    title:'Freshness at\nyour doorstep.',hiTitle:'ताज़गी अब\nआपके दरवाज़े पर।',description:'A category-led grocery storefront for fresh produce, pantry staples and daily essentials.',hiDescription:'फल-सब्ज़ी, राशन और रोज़मर्रा की ज़रूरतों के लिए कैटेगरी-वाइज़ ऑनलाइन स्टोर।',
    accent:'#28764d',bg:'#edf5e9',image:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=90',nav:['Fresh Produce','Staples','Dairy','Daily Deals'],hiNav:['फल-सब्ज़ी','राशन','डेयरी','आज के ऑफर'],
    products:[{name:'Farm Fresh Vegetables',price:'From ₹35',image:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=85',tag:'FRESH TODAY'},{name:'Seasonal Fruits Box',price:'₹299',image:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=85'},{name:'Daily Pantry Pack',price:'₹499',image:'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?w=600&q=85'}],
    cta:'Shop fresh essentials',hiCta:'ताज़ा सामान खरीदें'
  },
  {
    id:'interiors',tier:'Premium',category:'Home & Furniture',hiCategory:'होम और फर्नीचर',name:'Home Decor & Furniture',hiName:'होम डेकोर और फर्नीचर',brand:'AANGAN LIVING',logo:'आ',style:'interiors',
    tagline:'Thoughtful spaces, beautiful living.',hiTagline:'खूबसूरत घर, सुकून भरी ज़िंदगी।',
    title:'Make room for\nbeautiful living.',hiTitle:'अपने घर को\nदीजिए नया एहसास।',description:'A curated catalogue for furniture, lighting, decor and made-to-order enquiries.',hiDescription:'फर्नीचर, लाइटिंग, डेकोर और कस्टम ऑर्डर के लिए प्रीमियम कैटलॉग।',
    accent:'#82623f',bg:'#f4f0e8',image:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=90',nav:['Furniture','Lighting','Decor','Our Studio'],hiNav:['फर्नीचर','लाइटिंग','डेकोर','हमारा स्टूडियो'],
    products:[{name:'Handcrafted Accent Chair',price:'₹8,900',image:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=85'},{name:'Warm Glow Pendant',price:'₹3,499',image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=85'},{name:'Artisan Table Decor',price:'₹1,299',image:'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&q=85'}],
    cta:'Explore the collection',hiCta:'कलेक्शन देखें'
  }
];

const tierInfo = {
  Basic:{hi:'बेसिक',sub:'Simple and professional online presence',hiSub:'शुरुआती और छोटे व्यवसाय के लिए साफ़-सुथरी वेबसाइट',price:'₹4,999 से शुरू',time:'5–7 working days',hiTime:'5–7 कार्यदिवस',color:'basic',features:['Up to 5 pages','Mobile-friendly layout','About, services and contact','Enquiry form','Basic SEO setup'],hiFeatures:['अधिकतम 5 पेज','मोबाइल-फ्रेंडली डिज़ाइन','परिचय, सेवाएँ और संपर्क','पूछताछ फॉर्म','बेसिक SEO सेटअप']},
  Professional:{hi:'प्रोफेशनल',sub:'A richer design to grow your brand',hiSub:'ब्रांड और ऑनलाइन बिक्री को आगे बढ़ाने के लिए',price:'₹9,999 से शुरू',time:'8–14 working days',hiTime:'8–14 कार्यदिवस',color:'pro',features:['Up to 10 pages','Custom branded design','Product / menu catalogue','Advanced enquiry sections','Speed and SEO essentials'],hiFeatures:['अधिकतम 10 पेज','कस्टम ब्रांडेड डिज़ाइन','प्रोडक्ट / मेन्यू कैटलॉग','एडवांस पूछताछ सेक्शन','स्पीड और SEO की ज़रूरी सेटिंग']},
  Premium:{hi:'प्रीमियम',sub:'Feature-rich experience built around you',hiSub:'बड़े और फीचर-रिच बिज़नेस के लिए कस्टम अनुभव',price:'₹19,999+ से शुरू',time:'15–25+ working days',hiTime:'15–25+ कार्यदिवस',color:'premium',features:['Custom page architecture','Advanced catalogue and filters','Integrations as scoped','Rich visual interactions','Extended testing and handover'],hiFeatures:['कस्टम पेज स्ट्रक्चर','एडवांस कैटलॉग और फ़िल्टर','ज़रूरत के अनुसार इंटीग्रेशन','खास विज़ुअल इंटरैक्शन','विस्तृत टेस्टिंग और हैंडओवर']}
};

function WebsitePreview({demo,hi}:{demo:Demo;hi:boolean}) {
  const [activeNav,setActiveNav]=useState(0);
  const [message,setMessage]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const nav=hi?demo.hiNav:demo.nav;
  const choose=(i:number)=>{setActiveNav(i);setMenuOpen(false);setMessage(hi?nav[i]+' — यह डेमो नेविगेशन है। असली वेबसाइट में यह पेज खुलेगा।':nav[i]+' — demo navigation only. This page can be built in the final website.');};
  return <div className={'ds-live-site ds-live-'+demo.style} style={{'--live-accent':demo.accent,'--live-bg':demo.bg} as React.CSSProperties}>
    <div className="ds-live-topline">{hi?'भारत में डिज़ाइन किया गया • ग्राहक के लिए नमूना':'DESIGNED FOR CUSTOMER SAMPLE • INDIA'}</div>
    <header className="ds-live-nav">
      <button className="ds-live-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle demo menu">{menuOpen?<X size={19}/>:<Menu size={19}/>}</button>
      <div className="ds-live-logo"><span>{demo.logo}</span><b>{demo.brand}</b></div>
      <nav className={menuOpen?'is-open':''}>{nav.map((n,i)=><button key={n} className={activeNav===i?'selected':''} onClick={()=>choose(i)}>{n}</button>)}</nav>
      <button className="ds-live-cart" onClick={()=>setMessage(hi?'यह केवल डेमो है, वास्तविक ऑर्डर चालू नहीं है।':'Sample interaction only — checkout is disabled in this demo.')}><ShoppingBag size={17}/><span>{hi?'कार्ट':'Bag'}</span></button>
    </header>
    <section className="ds-live-hero">
      <div className="ds-live-hero-copy"><small>{demo.tagline}</small><h2>{(hi?demo.hiTitle:demo.title).split('\n').map((line,i)=><React.Fragment key={i}>{line}{i===0&&<br/>}</React.Fragment>)}</h2><p>{hi?demo.hiDescription:demo.description}</p><button onClick={()=>setMessage(hi?'यह डेमो बटन है। असली वेबसाइट में संबंधित सेक्शन खुलेगा।':'Demo button only — the real website can connect this to your chosen flow.')}>{hi?demo.hiCta:demo.cta}<ArrowRight size={16}/></button><div className="ds-live-trust"><span><Check size={13}/>{hi?'सुरक्षित अनुभव':'Made for your brand'}</span><span><Star size={13}/>{hi?'कस्टम डिज़ाइन':'Responsive design'}</span></div></div>
      <div className="ds-live-hero-image"><img src={demo.image} alt={demo.category} loading="lazy"/><span>{hi?'आपके ब्रांड का नमूना':'YOUR BRAND • SAMPLE'}</span></div>
    </section>
    <section className="ds-live-products">
      <div className="ds-live-section-heading"><div><small>{hi?'खास कलेक्शन':'CURATED FOR YOU'}</small><h3>{demo.style==='restaurant'?(hi?'आज के खास व्यंजन':'Signature favourites'):demo.style==='education'?(hi?'लोकप्रिय कोर्स':'Popular programmes'):demo.style==='portfolio'?(hi?'चुना हुआ काम':'Selected projects'):(hi?'आपकी पसंद के लिए':'Made for your everyday')}</h3></div><button onClick={()=>setMessage(hi?'यह डेमो लिंक है।':'Demo link only.')}>{hi?'सब देखें':'View all'} <ArrowRight size={14}/></button></div>
      <div className="ds-live-product-grid">{demo.products.map((p,i)=><article key={p.name}><div className="ds-live-product-image"><img src={p.image} alt={p.name} loading="lazy"/>{p.tag&&<span>{p.tag}</span>}<button aria-label="Save sample item" onClick={()=>setMessage(hi?'यह पसंदीदा बटन केवल डेमो है।':'Wishlist is a sample interaction only.')}><Heart size={15}/></button></div><div className="ds-live-product-meta"><b>{p.name}</b><span>{p.price}</span></div></article>)}</div>
    </section>
    <div className="ds-live-bottom"><span>{hi?'यह एक क्लिक करने योग्य वेबसाइट नमूना है':'INTERACTIVE WEBSITE SAMPLE'}</span><span>{demo.brand} • {hi?'डेमो':'DEMO'}</span></div>
    {message&&<div className="ds-live-toast" role="status"><span>{message}</span><button onClick={()=>setMessage('')}><X size={15}/></button></div>}
  </div>;
}

export default function WebsiteServicesShowcase({language,onClose,onRequestQuote}:Props) {
  const hi=language==='hi';
  const [tier,setTier]=useState<Tier>('Professional');
  const [activeId,setActiveId]=useState('clothing');
  const tierDemos=useMemo(()=>demos.filter(d=>d.tier===tier),[tier]);
  const activeDemo=demos.find(d=>d.id===activeId&&d.tier===tier)||tierDemos[0];
  const info=tierInfo[tier];
  const TierIcon=tier==='Basic'?Store:tier==='Professional'?Sparkles:Gem;
  const selectTier=(next:Tier)=>{setTier(next);setActiveId(demos.find(d=>d.tier===next)!.id);};
  return <div className="ds-webshowcase" role="dialog" aria-modal="true" aria-label={hi?'TANSHU ONLINE वेबसाइट डेमो गैलरी':'TANSHU ONLINE website demo gallery'}>
    <header className="ds-webshowcase-header">
      <button className="ds-webshowcase-back" onClick={onClose}><ArrowLeft size={17}/>{hi?'डिजिटल सेवा पर वापस जाएँ':'Back to Digital Seva'}</button>
      <div className="ds-webshowcase-brand"><span className="ds-webshowcase-logo"><Globe2 size={19}/></span><span><b>TANSHU ONLINE</b><small>{hi?'WEBSITE DESIGN STUDIO':'WEBSITE DESIGN STUDIO'}</small></span></div>
      <button className="ds-webshowcase-quote" onClick={onRequestQuote}>{hi?'कोटेशन माँगें':'Request a quote'}<ArrowRight size={16}/></button>
    </header>
    <main className="ds-webshowcase-main">
      <section className="ds-gallery-hero">
        <div className="ds-gallery-brandline"><span className="ds-gallery-monogram">T</span><span><b>TANSHU</b><small>ONLINE • DIGITAL DESIGN STUDIO</small></span><i>{hi?'आपके बिज़नेस के लिए':'BUILT FOR YOUR BUSINESS'}</i></div>
        <div className="ds-gallery-kicker"><Sparkles size={14}/>{hi?'वेबसाइट डेमो गैलरी':'WEBSITE DEMO GALLERY'}</div>
        <h1>{hi?<>आपका बिज़नेस,<br/><em>आपकी अपनी वेबसाइट।</em></>:<>Your business deserves<br/><em>its own digital space.</em></>}</h1>
        <p>{hi?'नीचे Basic, Professional और Premium पैकेज के अंतर्गत अलग-अलग भारतीय बिज़नेस की वेबसाइट के नमूने देखें। हर डेमो को खोलकर मेन्यू, प्रोडक्ट और बटन पर क्लिक करके इसका डिज़ाइन समझें।':'Explore sample websites for Indian businesses across Basic, Professional and Premium packages. Open a demo and try its menus, product cards and buttons to experience the design.'}</p>
        <div className="ds-gallery-hero-pills"><span><Check size={14}/>{hi?'भारत-केंद्रित डिज़ाइन':'Made for Indian businesses'}</span><span><Smartphone size={14}/>{hi?'मोबाइल-फ्रेंडली':'Mobile-first layouts'}</span><span><Monitor size={14}/>{hi?'क्लिक करने योग्य नमूने':'Interactive previews'}</span></div>
      </section>
      <section className="ds-gallery-packages">
        <div className="ds-gallery-section-heading"><div><small>{hi?'पहले अपना बजट और स्तर चुनें':'CHOOSE YOUR WEBSITE LEVEL'}</small><h2>{hi?'तीन पैकेज, अलग-अलग संभावनाएँ':'Three levels. Different possibilities.'}</h2></div><span>{hi?'पैकेज बदलने पर डेमो भी बदलेंगे':'Switch packages to explore their demos'}</span></div>
        <div className="ds-gallery-tier-tabs">{(['Basic','Professional','Premium'] as Tier[]).map(t=>{const ti=tierInfo[t];return <button key={t} className={'ds-tier-tab ds-tier-'+ti.color+(tier===t?' active':'')} onClick={()=>selectTier(t)}><span className="ds-tier-icon">{t==='Basic'?<Store size={20}/>:t==='Professional'?<Sparkles size={20}/>:<Gem size={20}/>}</span><span><b>{hi?ti.hi:t}</b><small>{t==='Basic'?(hi?'बेसिक वेबसाइट':'Starter website'):t==='Professional'?(hi?'ब्रांडेड वेबसाइट':'Branded website'):(hi?'एडवांस कस्टम वेबसाइट':'Advanced custom website')}</small></span><ArrowRight size={16}/></button>;})}</div>
        <div className={'ds-gallery-tier-details ds-tier-detail-'+info.color}>
          <div className="ds-tier-detail-heading"><span className="ds-tier-detail-icon"><TierIcon size={22}/></span><div><small>{hi?'चुना हुआ पैकेज':'SELECTED PACKAGE'}</small><h3>{hi?info.hi:tier}</h3><p>{hi?info.hiSub:info.sub}</p></div><strong>{info.price}</strong></div>
          <div className="ds-tier-detail-bottom"><div className="ds-tier-feature-list">{(hi?info.hiFeatures:info.features).map(f=><span key={f}><Check size={14}/>{f}</span>)}</div><span className="ds-tier-timeline"><Clock3 size={15}/>{hi?info.hiTime:info.time}</span></div>
        </div>
      </section>
      <section className="ds-gallery-demos">
        <div className="ds-gallery-section-heading"><div><small>{hi?'इस पैकेज के वेबसाइट नमूने':'WEBSITE SAMPLES IN THIS PACKAGE'}</small><h2>{hi?tier==='Basic'?'बेसिक वेबसाइट के उदाहरण':tier==='Professional'?'प्रोफेशनल वेबसाइट के उदाहरण':'प्रीमियम वेबसाइट के उदाहरण':tier+' website examples'}</h2></div><span>{hi?'देखने के लिए कोई नमूना चुनें':'Choose a sample to preview'}</span></div>
        <div className="ds-gallery-demo-list">{tierDemos.map(d=><button key={d.id} className={activeDemo.id===d.id?'active':''} onClick={()=>setActiveId(d.id)}><span className="ds-demo-mini-logo">{d.logo}</span><span><b>{hi?d.hiName:d.name}</b><small>{hi?d.hiCategory:d.category}</small></span><ArrowRight size={15}/></button>)}</div>
        <div className="ds-gallery-preview-heading"><div><span className="ds-preview-live-dot"/><b>{hi?'लाइव डेमो प्रीव्यू':'LIVE DEMO PREVIEW'}</b><small>{hi?'केवल नमूना • वास्तविक ऑर्डर/पेमेंट बंद':'SAMPLE ONLY • REAL ORDERS / PAYMENTS DISABLED'}</small></div><span>{hi?activeDemo.hiCategory:activeDemo.category}</span></div>
        <WebsitePreview key={activeDemo.id} demo={activeDemo} hi={hi}/>
      </section>
      <section className="ds-gallery-custom">
        <div><span><Globe2 size={17}/>{hi?'आपके बिज़नेस के अनुसार':'CUSTOM WEBSITE DESIGN'}</span><h2>{hi?'डेमो पसंद आया? अब आपकी बारी।':'Like a sample? Let’s make it yours.'}</h2><p>{hi?'आप ऊपर दिए गए किसी भी नमूने जैसा डिज़ाइन चुन सकते हैं या अपना रेफरेंस, रंग, पेज और फीचर बताकर बिल्कुल अलग वेबसाइट बनवा सकते हैं। अंतिम कीमत आपके बजट, पेजों की संख्या, फीचर्स, डिज़ाइन की जटिलता और काम में लगने वाले समय पर निर्भर करेगी।':'Choose a style you like or share your own reference, colours, pages and features for a completely different design. Final pricing depends on your budget, page count, features, design complexity and time required.'}</p></div><button onClick={onRequestQuote}>{hi?'अपनी वेबसाइट के लिए बात करें':'Discuss your website'}<ArrowRight size={16}/></button>
      </section>
      <footer className="ds-webshowcase-footer">TANSHU ONLINE <span>•</span>{hi?'आपका बिज़नेस, आपकी पहचान।':'Your business. Your identity.'}<small>{hi?'सभी वेबसाइट स्क्रीन ग्राहक के लिए केवल डेमो नमूने हैं।':'All website screens are illustrative customer demo samples.'}</small></footer>
    </main>
  </div>;
}
