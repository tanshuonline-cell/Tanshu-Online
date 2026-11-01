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
    'btn.exploreAllTools': 'Explore All 89 Tools',

    // Hero
    'hero.tools': 'TOOLS',
    'hero.services': 'SERVICES',
    'hero.schemes': 'SCHEMES',
    'hero.videos': 'VIDEOS',
    'hero.subtitle': 'PDF, photo, signature, online tools and government scheme information — simplified and organized.',
    'hero.searchPlaceholder': 'Search 89 tools, Bihar & Central services, schemes (e.g. Voter, Aadhaar, Caste, PM Kisan)...',
    'hero.searchBtn': 'Search',
    'hero.viewSchemes': 'View Schemes',

    // Category Navigation Section
    'catNav.kicker': 'Sarkari Navigation Hub · Centralized Citizen Directory',
    'catNav.title': 'Browse by Government Category',
    'catNav.desc': 'Direct access to verified Bihar state portals, Central citizen services, DBT welfare subsidies, and 89 online cyber cafe utility tools.',
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
    'catNav.allToolsBtn': 'Explore All 89 Tools',
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
    'btn.exploreAllTools': 'सभी 89 टूल्स देखें',

    // Hero
    'hero.tools': 'टूल्स',
    'hero.services': 'सेवाएं',
    'hero.schemes': 'योजनाएं',
    'hero.videos': 'वीडियो',
    'hero.subtitle': 'PDF, फोटो, सिग्नेचर, ऑनलाइन टूल्स और सरकारी योजनाओं की जानकारी — आसान और व्यवस्थित तरीके से।',
    'hero.searchPlaceholder': '89 टूल्स, बिहार व केंद्र की सेवाएं, योजनाएं खोजें (जैसे: वोटर, आधार, जाति, किसान)...',
    'hero.searchBtn': 'खोजें',
    'hero.viewSchemes': 'योजनाएं देखें',

    // Category Navigation Section
    'catNav.kicker': 'सरकारी नेविगेशन हब · केंद्रीकृत नागरिक डायरेक्टरी',
    'catNav.title': 'श्रेणी अनुसार सरकारी सेवाएं व योजनाएं',
    'catNav.desc': 'सत्यापित बिहार राज्य पोर्टल, केंद्रीय नागरिक सेवाएं, डीबीटी कल्याणकारी सब्सिडी और 89 ऑनलाइन साइबर कैफ़े टूल्स तक सीधी पहुंच।',
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
    'catNav.allToolsBtn': 'सभी 89 टूल्स देखें',
    'catNav.backBtn': '← श्रेणियों पर वापस जाएं',
    'catNav.topBtn': 'पेज के शीर्ष पर जाएं ↑',

    // Featured Tools
    'ft.kicker': 'लोकप्रिय दैनिक उपयोगिताएं',
    'ft.title': 'विशेष टूल्स (Featured Tools)',
    'ft.desc': 'फोटो प्रिंटिंग, स्मार्ट कार्ड निर्माण, दस्तावेज स्कैनिंग और रिटेल बिलिंग के लिए सर्वाधिक उपयोगी छह टूल्स।',

    // All Tools Directory
    'at.kicker': 'संपूर्ण डिजिटल उपयोगिता लाइब्रेरी',
    'at.title': 'सभी 89 टूल्स डायरेक्टरी',
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
    const currentDict = translations[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const defaultDict = translations.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
