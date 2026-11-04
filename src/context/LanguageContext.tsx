import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isHindi: boolean;
}

const STORAGE_KEY = 'tanshu_lang';

// Curated high quality English and Hindi dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Announcement
    'announcement': 'Independent Citizen Utility & Cyber Cafe Toolkit · Not affiliated with UIDAI, ECI, or any government department.',
    'nav.home': 'Home',
    'nav.allTools': 'All Tools',
    'nav.services': 'Government Services',
    'nav.schemes': 'Government Schemes',
    'nav.videos': 'Latest Videos',
    'nav.about': 'About',
    'btn.exploreTools': 'Explore Tools',
    'btn.exploreAllTools': 'Explore All 90 Tools',

    // Hero
    'hero.tools': 'TOOLS',
    'hero.services': 'SERVICES',
    'hero.schemes': 'SCHEMES',
    'hero.videos': 'VIDEOS',
    'hero.subtitle': 'PDF, photo, signature, online tools and government scheme information — simplified and organized.',
    'hero.searchPlaceholder': 'Search 90 tools, Bihar & Central services, schemes (e.g. Voter, Aadhaar, Caste, PM Kisan)...',
    'hero.searchBtn': 'Search',
    'hero.viewSchemes': 'View Schemes',

    // Category Navigation Section
    'catNav.kicker': 'Sarkari Navigation Hub · Centralized Citizen Directory',
    'catNav.title': 'Browse by Government Category',
    'catNav.desc': 'Direct access to verified Bihar state portals, Central citizen services, DBT welfare subsidies, and 90 online cyber cafe utility tools.',
    'catNav.biharSrv': 'Bihar Govt Services',
    'catNav.biharSrvHi': 'बिहार सरकारी सेवाएं',
    'catNav.biharSrvDesc': 'RTPS Caste, Income, Residence, Bihar Bhumi Dakhil-Kharij, Jamabandi, LPC & EPDS Ration Card.',
    'catNav.biharSrvBtn': 'Explore Bihar Services',
    'catNav.centralSrv': 'Central Govt Services',
    'catNav.centralSrvHi': 'केंद्रीय सरकारी सेवाएं',
    'catNav.centralSrvDesc': 'Aadhaar PVC & Updates, PAN Verification, Voter Portal, Parivahan Driving License & Passport Seva.',
    'catNav.centralSrvBtn': 'Explore Central Services',
    'catNav.biharSch': 'Bihar Govt Schemes',
    'catNav.biharSchHi': 'बिहार सरकारी योजनाएं',
    'catNav.biharSchDesc': 'Mukhyamantri Udyami Yojana (₹10 Lakh), Student Credit Card, Kanya Utthan, KYP & Diesel Anudan.',
    'catNav.biharSchBtn': 'Explore Bihar Schemes',
    'catNav.centralSch': 'Central Govt Schemes',
    'catNav.centralSchHi': 'केंद्रीय सरकारी योजनाएं',
    'catNav.centralSchDesc': 'PM Kisan Samman Nidhi DBT, Ayushman Bharat (₹5 Lakh), PM Awas Yojana & PM Vishwakarma.',
    'catNav.centralSchBtn': 'Explore Central Schemes',
    'catNav.allTools': 'All Online Tools',
    'catNav.allToolsHi': 'सभी ऑनलाइन टूल्स',
    'catNav.allToolsDesc': 'Passport photo maker, PVC card layout, PDF compress, Hindi typing & cyber cafe utilities.',
    'catNav.allToolsBtn': 'Explore All 90 Tools',
    'catNav.backBtn': 'Back to Categories',
    'catNav.topBtn': 'Top of Page ↑',

    // Featured Tools
    'ft.kicker': 'Popular Daily Utilities',
    'ft.title': 'Featured Tools',
    'ft.desc': 'The six most frequently used tools for photo printing, smart card preparation, document scanning, and retail billing.',

    // All Tools Directory
    'at.kicker': 'Comprehensive Digital Utilities Library',
    'at.title': 'All Tools Directory',
    'at.desc': '7 categories covering Business & CSC, PVC ID Card Printing, Photo & Biometric Studio, PDF Tools, Image Utilities, Financial Calculators, and WhatsApp QR Tools.',
    'at.searchPlaceholder': 'Search tools by name, description, or keyword...',
    'at.allCategory': 'All Tools',
    'at.noMatch': 'No tools matched your search query.',
    'at.resetFilter': 'Reset Filters',

    // Government Services
    'gs.kicker': 'Public Service Information Directory',
    'gs.title': 'Government Services',
    'gs.desc': 'Verified step-by-step application walkthroughs, document requirements, fee schedules, and direct official portal redirects for major Indian citizen services.',
    'gs.officialPortal': 'Official Portal',
    'gs.trackApplication': 'Track Application',
    'gs.fee': 'Fee',
    'gs.eligibility': 'Eligibility Criteria',
    'gs.documents': 'Required Documents',
    'gs.steps': 'Step-by-Step Application Procedure',
    'gs.proceedTo': 'Proceed to',

    // Government Schemes
    'sch.kicker': 'National Welfare Initiatives',
    'sch.title': 'Government Schemes',
    'sch.desc': 'Direct DBT financial benefits, healthcare coverage, and housing subsidies with complete eligibility checks and enrollment guides.',
    'sch.benefit': 'Direct Financial Benefit',
    'sch.target': 'Target Group',
    'sch.viewApply': 'View Eligibility & Apply',
    'sch.whoEligible': 'Who is Eligible?',
    'sch.mandatoryDocs': 'Mandatory Documents',
    'sch.howToApply': 'How to Apply Step-by-Step',
    'sch.applyPortal': 'Apply on Official Portal',
    'sch.close': 'Close',

    // Latest Videos
    'vid.kicker': 'Practical Video Tutorials & Masterclasses',
    'vid.title': 'Latest Videos & Guides',
    'vid.desc': 'Master photo paper printing, PVC card printer tray calibrations, exam form dimension adjustments, and cyber cafe customer management.',
    'vid.watch': 'Watch Tutorial',
    'vid.takeaways': 'Key Takeaways',
    'vid.by': 'By',

    // Homepage sections and shared controls
    'hero.mainTitle': 'Digital Tools & Citizen Services, All in One Place',
    'hero.mainTitleSuffix': '',
    'hero.brandSubtitle': 'Digital Tools • Public Services • Citizen Guides',
    'footer.nav.home': 'Home',
    'footer.nav.tools': 'All 89 Tools',
    'footer.nav.services': 'Government Services',
    'footer.nav.schemes': 'Government Schemes',
    'footer.nav.videos': 'Latest Videos',
    'footer.nav.about': 'About Us',
    'header.citizenToolkit': 'Citizen Toolkit',
    'quick.photo': 'Photo & Signature',
    'quick.pdf': 'PDF Tools',
    'quick.idPrint': 'ID Card & Print',
    'quick.business': 'Invoice & Business',
    'quick.whatsapp': 'WhatsApp & QR',
    'quick.citizen': 'Student & Citizen',
    'quick.schemes': 'Government Schemes',
    'quick.videos': 'Video Guides',
    'common.openTool': 'Open Tool',
    'common.close': 'Close',
    'common.backToCategories': 'Back to Categories',
    'about.kicker': 'About TANSHU ONLINE',
    'about.title': 'Built for India’s Digital Kiosks, Cyber Cafes & Every Citizen.',
    'about.intro': 'Every day, citizens visit Common Service Centers (CSC) and cyber cafes across India for passport photos, exam form submissions, PVC Aadhaar prints, and government certificates. Operators face daily hurdles with uneven mobile photos, skewed WhatsApp documents, and complex print margins.',
    'about.story': 'TANSHU ONLINE was created to simplify this work. We build fast, installation-free browser tools that run on your existing printer, computer, or smartphone.',
    'about.utilities': 'Available Utilities',
    'about.release': 'Current Release',
    'about.private': 'Private & Client-Side',
    'about.zeroUpload': 'No Server Uploads',
    'about.empowerment': 'Digital Empowerment',
    'about.empowermentDesc': 'Helping local entrepreneurs deliver faster, more reliable citizen services.',
    'about.privacyTitle': '100% In-Browser Privacy',
    'about.privacyDesc': 'Your sensitive Aadhaar files, passport portraits, and documents stay on your device. Cropping, filtering, and PDF generation run inside your browser.',
    'about.sizingTitle': 'Hardware & Paper Sizing',
    'about.sizingDesc': 'Tools are designed around practical print sizes, including CR80 ID cards, 4×6 photo sheets, and legal stamp paper.',
    'about.guidanceTitle': 'Reliable Public Guidance',
    'about.guidanceDesc': 'Clear, step-by-step information for government schemes and services, with links to official portals.',
    'about.transparencyTitle': 'Independent Platform Transparency Declaration',
    'about.disclaimer': 'TANSHU ONLINE is an independent digital tool platform and public information directory. It is not affiliated with UIDAI, the Election Commission of India, the Income Tax Department, or any central or state government department.',
    'about.disclaimer2': 'We do not collect government application fees, issue official identity documents, or approve government applications. Official services must be submitted through authorized government websites.',
    'footer.contact': 'Contact',
    'footer.popularTools': 'Popular Tools',
    'footer.quickLinks': 'Quick Links',
    'footer.legal': 'Legal Disclaimer',
    'footer.empowering': 'Empowering Digital India with',
    'video.premium': 'Premium Masterclasses',
    'video.paymentSecurity': 'Secure UPI & card payments • Protected video access',
    'video.purchased': 'PURCHASED',
    'video.watchUnlocked': 'Watch Purchased Masterclass',
    'video.unlock': 'Unlock Masterclass',
    'video.watchFree': 'Watch Free Tutorial',
    'video.freeStream': 'Free High-Definition Tutorial Stream (1080p)',
    'video.synopsis': 'Tutorial Summary',
    'vlc.kicker': 'Practical Training & CSC Masterclasses',
    'vlc.title': 'Video Learning Center',
    'vlc.desc': 'Learn practical workflows through step-by-step video lessons and masterclasses.',
    'vlc.viewAll': 'View All Videos',

    // Homepage sections and shared controls
    'hero.mainTitle': 'डिजिटल टूल्स और नागरिक सेवाएँ',
    'hero.mainTitleSuffix': 'अब एक ही जगह',
    'hero.brandSubtitle': 'डिजिटल टूल्स • सरकारी सेवाएँ • नागरिक मार्गदर्शन',
    'footer.nav.home': 'होम',
    'footer.nav.tools': 'सभी 89 टूल्स',
    'footer.nav.services': 'सरकारी सेवाएँ',
    'footer.nav.schemes': 'सरकारी योजनाएँ',
    'footer.nav.videos': 'नवीनतम वीडियो',
    'footer.nav.about': 'हमारे बारे में',
    'header.citizenToolkit': 'नागरिक सेवा टूलकिट',
    'quick.photo': 'फोटो और सिग्नेचर',
    'quick.pdf': 'PDF टूल्स',
    'quick.idPrint': 'ID कार्ड और प्रिंट',
    'quick.business': 'इनवॉइस और बिजनेस',
    'quick.whatsapp': 'व्हाट्सऐप और QR',
    'quick.citizen': 'छात्र और नागरिक सेवाएँ',
    'quick.schemes': 'सरकारी योजनाएँ',
    'quick.videos': 'वीडियो गाइड',
    'common.openTool': 'टूल खोलें',
    'common.close': 'बंद करें',
    'common.backToCategories': 'श्रेणियों पर वापस जाएँ',
    'about.kicker': 'तंशु ऑनलाइन के बारे में',
    'about.title': 'भारत के डिजिटल सेवा केंद्रों, साइबर कैफ़े और हर नागरिक के लिए।',
    'about.intro': 'हर दिन देशभर के नागरिक पासपोर्ट फोटो, परीक्षा फॉर्म, PVC आधार प्रिंट और सरकारी प्रमाणपत्रों के लिए CSC केंद्रों और साइबर कैफ़े जाते हैं। ऑपरेटरों को मोबाइल फोटो, तिरछे WhatsApp दस्तावेज़ और प्रिंट मार्जिन जैसी समस्याओं का सामना करना पड़ता है।',
    'about.story': 'तंशु ऑनलाइन इन कामों को आसान बनाने के लिए बनाया गया है। यहाँ तेज़ और बिना इंस्टॉल किए चलने वाले ब्राउज़र टूल मिलते हैं, जो आपके कंप्यूटर, प्रिंटर या मोबाइल पर काम करते हैं।',
    'about.utilities': 'उपलब्ध उपयोगी टूल',
    'about.release': 'वर्तमान संस्करण',
    'about.private': 'निजी और आपके डिवाइस पर',
    'about.zeroUpload': 'सर्वर पर अपलोड नहीं',
    'about.empowerment': 'डिजिटल सशक्तिकरण',
    'about.empowermentDesc': 'स्थानीय सेवा संचालकों को नागरिकों की बेहतर और तेज़ सेवा देने में मदद।',
    'about.privacyTitle': '100% ब्राउज़र में सुरक्षित',
    'about.privacyDesc': 'आपकी आधार फाइलें, पासपोर्ट फोटो और दस्तावेज़ आपके डिवाइस से बाहर नहीं जाते। क्रॉपिंग, फ़िल्टर और PDF बनाना आपके ब्राउज़र में ही होता है।',
    'about.sizingTitle': 'प्रिंटर और कागज़ के सही माप',
    'about.sizingDesc': 'टूल CR80 ID कार्ड, 4×6 फोटो शीट और कानूनी स्टाम्प पेपर जैसे व्यावहारिक प्रिंट मापों के अनुसार बनाए गए हैं।',
    'about.guidanceTitle': 'विश्वसनीय सरकारी जानकारी',
    'about.guidanceDesc': 'सरकारी योजनाओं और सेवाओं की आसान, चरण-दर-चरण जानकारी और आधिकारिक पोर्टल के लिंक।',
    'about.transparencyTitle': 'स्वतंत्र प्लेटफ़ॉर्म की पारदर्शिता घोषणा',
    'about.disclaimer': 'तंशु ऑनलाइन एक स्वतंत्र डिजिटल टूल प्लेटफ़ॉर्म और सार्वजनिक जानकारी निर्देशिका है। इसका UIDAI, भारत निर्वाचन आयोग, आयकर विभाग या किसी केंद्र/राज्य सरकारी विभाग से कोई संबंध नहीं है।',
    'about.disclaimer2': 'हम सरकारी आवेदन शुल्क नहीं लेते, आधिकारिक पहचान पत्र जारी नहीं करते और सरकारी आवेदनों को मंज़ूरी नहीं देते। आधिकारिक सेवाओं के लिए अधिकृत सरकारी वेबसाइट का ही उपयोग करें।',
    'footer.contact': 'संपर्क',
    'footer.popularTools': 'लोकप्रिय टूल्स',
    'footer.quickLinks': 'महत्वपूर्ण लिंक',
    'footer.legal': 'कानूनी सूचना',
    'footer.empowering': 'डिजिटल भारत को सशक्त बनाते हुए',
    'video.premium': 'प्रीमियम मास्टरक्लास',
    'video.paymentSecurity': 'सुरक्षित UPI और कार्ड भुगतान • सुरक्षित वीडियो एक्सेस',
    'video.purchased': 'खरीदा गया',
    'video.watchUnlocked': 'खरीदी गई मास्टरक्लास देखें',
    'video.unlock': 'मास्टरक्लास अनलॉक करें',
    'video.watchFree': 'मुफ़्त ट्यूटोरियल देखें',
    'video.freeStream': 'मुफ़्त हाई-डेफिनिशन वीडियो (1080p)',
    'video.synopsis': 'ट्यूटोरियल का सारांश',
    'vlc.kicker': 'व्यावहारिक प्रशिक्षण और CSC मास्टरक्लास',
    'vlc.title': 'वीडियो लर्निंग सेंटर',
    'vlc.desc': 'चरण-दर-चरण वीडियो पाठ और मास्टरक्लास के माध्यम से उपयोगी काम सीखें।',
    'vlc.viewAll': 'सभी वीडियो देखें',

    // Search Component
    'search.type.tool': 'Tool',
    'search.type.service': 'Government Service',
    'search.type.scheme': 'Government Scheme',
    'search.type.video': 'Video Guide',
    'search.resultsCount': 'Results matching',
    'search.noResults': 'No matching tools, services or schemes found for',
    'search.trySuggestions': 'Try searching in English, हिन्दी, or Hinglish: "Aadhaar", "Voter ID", "Caste", "PM Kisan", "निवास प्रमाण पत्र", "राशन कार्ड", "Passport Photo".',
    'search.pressEsc': 'Press Esc to close · Use ↑↓ to navigate · Enter to select'
  },
  hi: {
    // Header & Announcement
    'announcement': 'स्वतंत्र नागरिक उपयोगिता एवं साइबर कैफ़े टूलकिट · UIDAI, ECI या किसी भी सरकारी विभाग से संबद्ध नहीं।',
    'nav.home': 'होम',
    'nav.allTools': 'सभी टूल्स',
    'nav.services': 'सरकारी सेवाएं',
    'nav.schemes': 'सरकारी योजनाएं',
    'nav.videos': 'नवीनतम वीडियो',
    'nav.about': 'परिचय',
    'btn.exploreTools': 'टूल्स देखें',
    'btn.exploreAllTools': 'सभी 90 टूल्स देखें',

    // Hero
    'hero.tools': 'टूल्स',
    'hero.services': 'सेवाएं',
    'hero.schemes': 'योजनाएं',
    'hero.videos': 'वीडियो',
    'hero.subtitle': 'PDF, फोटो, सिग्नेचर, ऑनलाइन टूल्स और सरकारी योजनाओं की जानकारी — आसान और व्यवस्थित तरीके से।',
    'hero.searchPlaceholder': '90 टूल्स, बिहार व केंद्र की सेवाएं, योजनाएं खोजें (जैसे: वोटर, आधार, जाति, किसान)...',
    'hero.searchBtn': 'खोजें',
    'hero.viewSchemes': 'योजनाएं देखें',

    // Category Navigation Section
    'catNav.kicker': 'सरकारी नेविगेशन हब · केंद्रीकृत नागरिक डायरेक्टरी',
    'catNav.title': 'श्रेणी अनुसार सरकारी सेवाएं व योजनाएं',
    'catNav.desc': 'सत्यापित बिहार राज्य पोर्टल, केंद्रीय नागरिक सेवाएं, डीबीटी कल्याणकारी सब्सिडी और 90 ऑनलाइन साइबर कैफ़े टूल्स तक सीधी पहुंच।',
    'catNav.biharSrv': 'बिहार सरकारी सेवाएं',
    'catNav.biharSrvHi': 'Bihar Govt Services',
    'catNav.biharSrvDesc': 'आरटीपीएस जाति, आय, निवास प्रमाण पत्र, बिहार भूमि दाखिल-खारिज, जमाबंदी, एलपीसी एवं राशन कार्ड।',
    'catNav.biharSrvBtn': 'बिहार सेवाएं देखें',
    'catNav.centralSrv': 'केंद्रीय सरकारी सेवाएं',
    'catNav.centralSrvHi': 'Central Govt Services',
    'catNav.centralSrvDesc': 'आधार पीवीसी व अपडेट, पैन सत्यापन, वोटर पोर्टल, परिवहन ड्राइविंग लाइसेंस एवं पासपोर्ट सेवा।',
    'catNav.centralSrvBtn': 'केंद्रीय सेवाएं देखें',
    'catNav.biharSch': 'बिहार सरकारी योजनाएं',
    'catNav.biharSchHi': 'Bihar Govt Schemes',
    'catNav.biharSchDesc': 'मुख्यमंत्री उद्यमी योजना (₹10 लाख), स्टूडेंट क्रेडिट कार्ड, कन्या उत्थान, कुशल युवा एवं डीजल अनुदान।',
    'catNav.biharSchBtn': 'बिहार योजनाएं देखें',
    'catNav.centralSch': 'केंद्रीय सरकारी योजनाएं',
    'catNav.centralSchHi': 'Central Govt Schemes',
    'catNav.centralSchDesc': 'पीएम किसान सम्मान निधि डीबीटी, आयुष्मान भारत (₹5 लाख), पीएम आवास योजना एवं विश्वकर्मा योजना।',
    'catNav.centralSchBtn': 'केंद्रीय योजनाएं देखें',
    'catNav.allTools': 'सभी ऑनलाइन टूल्स',
    'catNav.allToolsHi': 'All Online Tools',
    'catNav.allToolsDesc': 'पासपोर्ट फोटो मेकर, पीवीसी कार्ड लेआउट, पीडीएफ कंप्रेस, हिंदी टाइपिंग और साइबर कैफ़े उपयोगिताएं।',
    'catNav.allToolsBtn': 'सभी 90 टूल्स देखें',
    'catNav.backBtn': '← श्रेणियों पर वापस जाएं',
    'catNav.topBtn': 'पेज के शीर्ष पर जाएं ↑',

    // Featured Tools
    'ft.kicker': 'लोकप्रिय दैनिक उपयोगिताएं',
    'ft.title': 'विशेष टूल्स (Featured Tools)',
    'ft.desc': 'फोटो प्रिंटिंग, स्मार्ट कार्ड निर्माण, दस्तावेज स्कैनिंग और रिटेल बिलिंग के लिए सर्वाधिक उपयोगी छह टूल्स।',

    // All Tools Directory
    'at.kicker': 'संपूर्ण डिजिटल उपयोगिता लाइब्रेरी',
    'at.title': 'सभी 90 टूल्स डायरेक्टरी',
    'at.desc': 'सीएससी व बिजनेस, पीवीसी आईडी कार्ड, फोटो स्टूडियो, पीडीएफ टूल्स, इमेज कनवर्टर, कैलकुलेटर व व्हाट्सएप टूल्स।',
    'at.searchPlaceholder': 'नाम, विवरण या कीवर्ड द्वारा टूल खोजें...',
    'at.allCategory': 'सभी टूल्स',
    'at.noMatch': 'आपकी खोज से मेल खाता कोई टूल नहीं मिला।',
    'at.resetFilter': 'फ़िल्टर रीसेट करें',

    // Government Services
    'gs.kicker': 'सार्वजनिक सेवा सूचना डायरेक्टरी',
    'gs.title': 'सरकारी सेवाएं (Government Services)',
    'gs.desc': 'प्रमुख भारतीय नागरिक सेवाओं के लिए चरणबद्ध आवेदन प्रक्रिया, आवश्यक दस्तावेज, शुल्क एवं आधिकारिक पोर्टल लिंक्स।',
    'gs.officialPortal': 'आधिकारिक पोर्टल',
    'gs.trackApplication': 'आवेदन स्थिति जांचें',
    'gs.fee': 'सरकारी शुल्क',
    'gs.eligibility': 'पात्रता मानदंड',
    'gs.documents': 'आवश्यक दस्तावेज',
    'gs.steps': 'चरणबद्ध आवेदन प्रक्रिया',
    'gs.proceedTo': 'पोर्टल पर जाएं:',

    // Government Schemes
    'sch.kicker': 'राष्ट्रीय एवं राज्य कल्याणकारी योजनाएं',
    'sch.title': 'सरकारी योजनाएं (Government Schemes)',
    'sch.desc': 'प्रत्यक्ष डीबीटी वित्तीय सहायता, स्वास्थ्य सुरक्षा और आवास सब्सिडी के लिए संपूर्ण पात्रता जांच एवं आवेदन निर्देश।',
    'sch.benefit': 'सीधा वित्तीय लाभ (Financial Benefit)',
    'sch.target': 'लक्षित लाभार्थी समूह',
    'sch.viewApply': 'View Eligibility & Apply',
    'sch.whoEligible': 'कौन पात्र है?',
    'sch.mandatoryDocs': 'अनिवार्य दस्तावेज',
    'sch.howToApply': 'आवेदन की चरणबद्ध विधि',
    'sch.applyPortal': 'आधिकारिक पोर्टल पर आवेदन करें',
    'sch.close': 'बंद करें',

    // Latest Videos
    'vid.kicker': 'व्यावहारिक वीडियो ट्यूटोरियल व मास्टरक्लास',
    'vid.title': 'नवीनतम वीडियो और गाइड्स',
    'vid.desc': 'फोटो पेपर प्रिंटिंग, पीवीसी प्रिंटर ट्रे कैलिब्रेशन, परीक्षा फॉर्म रीसाइजिंग और साइबर कैफ़े ग्राहक प्रबंधन सीखें।',
    'vid.watch': 'Watch Tutorial',
    'vid.takeaways': 'प्रमुख सीखने योग्य बिंदु',
    'vid.by': 'द्वारा',

    // Search Component
    'search.type.tool': 'डिजिटल टूल',
    'search.type.service': 'सरकारी सेवा',
    'search.type.scheme': 'सरकारी योजना',
    'search.type.video': 'वीडियो गाइड',
    'search.resultsCount': 'खोज परिणाम मिले',
    'search.noResults': 'के लिए कोई टूल, सेवा या योजना नहीं मिली',
    'search.trySuggestions': 'अंग्रेजी, हिन्दी या हिंग्लिश में खोजें: "Aadhaar", "Voter Card", "जाति प्रमाण पत्र", "आय", "राशन", "किसान", "पासपोर्ट फोटो"।',
    'search.pressEsc': 'बंद करने के लिए Esc दबाएं · चुनने के लिए Enter दबाएं'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isHindi: false
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi') {
        return saved;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage write errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    // Keep older component key names connected to the canonical dictionary keys.
    const aliases: Record<string, string> = {
      'featured.kicker': 'ft.kicker',
      'featured.title': 'ft.title',
      'featured.desc': 'ft.desc',
      'services.kicker': 'gs.kicker',
      'services.title': 'gs.title',
      'services.desc': 'gs.desc',
      'schemes.kicker': 'sch.kicker',
      'schemes.title': 'sch.title',
      'schemes.desc': 'sch.desc',
      'videos.kicker': 'vid.kicker',
      'videos.title': 'vid.title',
      'videos.desc': 'vid.desc',
    };
    const resolvedKey = aliases[key] || key;
    const currentDict = translations[language];
    if (currentDict && currentDict[resolvedKey]) return currentDict[resolvedKey];
    const defaultDict = translations.en;
    if (defaultDict && defaultDict[resolvedKey]) return defaultDict[resolvedKey];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
