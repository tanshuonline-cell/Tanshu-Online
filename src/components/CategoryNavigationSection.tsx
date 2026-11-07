import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  GraduationCap, 
  ShieldCheck, 
  Wrench,
  FileText,
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles,
  Award
} from 'lucide-react';
import { GOVERNMENT_SERVICES } from '../data/servicesData';
import { GOVERNMENT_SCHEMES } from '../data/schemesData';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { GovernmentScheme, ToolCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BilingualText, BilingualHeading, BilingualList, BilingualSteps } from './common/BilingualContent';

import aadhaarImg from '../assets/images/srv_aadhaar_card_1793213335581.jpg';
import panImg from '../assets/images/srv_pan_card_1793213337829.jpg';
import voterImg from '../assets/images/srv_voter_id_evm_1793213338449.jpg';
import dlImg from '../assets/images/srv_driving_license_1793213339233.jpg';
import passportImg from '../assets/images/srv_passport_travel_1793213340053.jpg';
import edistrictImg from '../assets/images/srv_edistrict_portal_1793213339753.jpg';

import kisanImg from '../assets/images/scheme_pm_kisan_1793213628614.jpg';
import ayushmanImg from '../assets/images/scheme_ayushman_bharat_1793213629585.jpg';
import awasImg from '../assets/images/scheme_pm_awas_1793213630372.jpg';
import vishwakarmaImg from '../assets/images/scheme_pm_vishwakarma_1793213630511.jpg';
import eshramImg from '../assets/images/scheme_eshram_worker_1793213631564.jpg';
import sukanyaImg from '../assets/images/scheme_sukanya_samriddhi_1793213631693.jpg';

type CategoryType = 'none' | 'bihar-services' | 'central-services' | 'bihar-schemes' | 'central-schemes';

interface Props {
  onOpenAllTools: (category?: ToolCategory) => void;
  onScrollToTop?: () => void;
}

export const CategoryNavigationSection: React.FC<Props> = ({ onOpenAllTools, onScrollToTop }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('none');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedSchemeModal, setSelectedSchemeModal] = useState<GovernmentScheme | null>(null);
  const { t, isHindi } = useLanguage();

  // Dynamic calculations strictly from existing verified datasets
  const biharServices = GOVERNMENT_SERVICES.filter(s => s.jurisdiction === 'bihar');
  const centralServices = GOVERNMENT_SERVICES.filter(s => s.jurisdiction !== 'bihar');
  const biharSchemes = GOVERNMENT_SCHEMES.filter(s => s.jurisdiction === 'bihar');
  const centralSchemes = GOVERNMENT_SCHEMES.filter(s => s.jurisdiction !== 'bihar');
  const allToolsCount = CONFIRMED_TOOLS.length;

  const handleSelectCategory = (cat: CategoryType) => {
    setActiveCategory(cat);
    setFilterQuery('');
    setExpandedServiceId(null);
    const element = document.getElementById('category-navigation');
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleBackToCategories = () => {
    setActiveCategory('none');
    setFilterQuery('');
  };

  const getServiceImage = (id: string) => {
    switch (id) {
      case 'aadhaar-services':
        return aadhaarImg;
      case 'pan-card-services':
        return panImg;
      case 'voter-services':
        return voterImg;
      case 'parivahan-services':
        return dlImg;
      case 'passport-seva':
        return passportImg;
      case 'edistrict-certificates':
        return edistrictImg;
      default:
        return null;
    }
  };

  const getSchemeImage = (id: string) => {
    switch (id) {
      case 'pm-kisan':
        return kisanImg;
      case 'ayushman-bharat':
        return ayushmanImg;
      case 'pm-awas-yojana':
        return awasImg;
      case 'pm-vishwakarma':
        return vishwakarmaImg;
      case 'e-shram-card':
        return eshramImg;
      case 'sukanya-samriddhi':
        return sukanyaImg;
      default:
        return null;
    }
  };

  // Filtered lists for the active category view
  const displayedServices = (activeCategory === 'bihar-services' ? biharServices : centralServices).filter(s => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.hindiTitle && s.hindiTitle.toLowerCase().includes(q)) ||
      s.summary.toLowerCase().includes(q) ||
      (s.hindiSummary && s.hindiSummary.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q) ||
      (s.hindiCategory && s.hindiCategory.toLowerCase().includes(q))
    );
  });

  const displayedSchemes = (activeCategory === 'bihar-schemes' ? biharSchemes : centralSchemes).filter(s => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.hindiName && s.hindiName.toLowerCase().includes(q)) ||
      s.summary.toLowerCase().includes(q) ||
      (s.hindiSummary && s.hindiSummary.toLowerCase().includes(q)) ||
      s.ministry.toLowerCase().includes(q) ||
      (s.hindiMinistry && s.hindiMinistry.toLowerCase().includes(q))
    );
  });

  return (
    <section id="category-navigation" className="py-12 bg-white border-b border-slate-200/90 relative">
    <style>{`

      @keyframes category-premium-flow { 0% { background-position: -110% 0, 110% 100%, 0 110%, 100% -110%; } 100% { background-position: 110% 0, -110% 100%, 0 -110%, 100% 110%; } }
      @keyframes category-halo-pulse { from { opacity: .28; filter: blur(9px); } to { opacity: .62; filter: blur(15px); } }
      .category-card-grid > div { isolation: isolate; }
      .category-card-grid > div::before { content: ""; position: absolute; inset: -5px; z-index: -1; border-radius: inherit; background: linear-gradient(115deg, var(--card-light-a), var(--card-light-b), var(--card-light-c), var(--card-light-a)); animation: category-halo-pulse 3.8s ease-in-out infinite alternate; pointer-events: none; }
      .category-card-grid > div::after { content: ""; position: absolute; inset: 0; z-index: 5; border-radius: inherit; padding: 2px; background-image: linear-gradient(90deg, transparent 0%, var(--card-light-a) 26%, var(--card-light-b) 65%, transparent 100%), linear-gradient(270deg, transparent 0%, var(--card-light-c) 28%, var(--card-light-a) 70%, transparent 100%), linear-gradient(180deg, transparent 0%, var(--card-light-b) 30%, var(--card-light-a) 72%, transparent 100%), linear-gradient(0deg, transparent 0%, var(--card-light-a) 28%, var(--card-light-c) 70%, transparent 100%); background-size: 220% 2px, 220% 2px, 2px 220%, 2px 220%; background-position: -110% 0, 110% 100%, 0 110%, 100% -110%; background-repeat: no-repeat; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: category-premium-flow 5.4s linear infinite; pointer-events: none; }
      .category-card-grid > div:nth-child(1) { --card-light-a: rgba(129,140,248,.98); --card-light-b: rgba(216,180,254,.98); --card-light-c: rgba(99,102,241,.95); box-shadow: 0 0 0 1px rgba(129,140,248,.16), 0 0 22px rgba(99,102,241,.16), 0 0 34px rgba(216,180,254,.10); }
      .category-card-grid > div:nth-child(2) { --card-light-a: rgba(96,165,250,.98); --card-light-b: rgba(165,243,252,.98); --card-light-c: rgba(37,99,235,.95); box-shadow: 0 0 0 1px rgba(96,165,250,.16), 0 0 22px rgba(37,99,235,.16), 0 0 34px rgba(165,243,252,.10); }
      .category-card-grid > div:nth-child(3) { --card-light-a: rgba(52,211,153,.98); --card-light-b: rgba(167,243,208,.98); --card-light-c: rgba(5,150,105,.95); box-shadow: 0 0 0 1px rgba(52,211,153,.16), 0 0 22px rgba(5,150,105,.16), 0 0 34px rgba(167,243,208,.10); }
      .category-card-grid > div:nth-child(4) { --card-light-a: rgba(251,191,36,.98); --card-light-b: rgba(253,230,138,.98); --card-light-c: rgba(217,119,6,.95); box-shadow: 0 0 0 1px rgba(251,191,36,.16), 0 0 22px rgba(217,119,6,.16), 0 0 34px rgba(253,230,138,.10); }
      .category-card-grid > div:nth-child(5) { --card-light-a: rgba(244,114,182,.98); --card-light-b: rgba(196,181,253,.98); --card-light-c: rgba(219,39,119,.95); box-shadow: 0 0 0 1px rgba(244,114,182,.16), 0 0 22px rgba(219,39,119,.16), 0 0 34px rgba(196,181,253,.10); }
      @media (prefers-reduced-motion: reduce) { .category-card-grid > div::before, .category-card-grid > div::after { animation: none; } }
    `}</style>
    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('catNav.kicker', 'Sarkari Navigation Hub · Centralized Citizen Directory')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('catNav.title', 'Browse by Government Category')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            {t('catNav.desc', 'Direct access to verified government services, schemes, and online utility tools.')}
          </p>
        </div>

        {/* 5 PREMIUM COLORFUL CATEGORY CARDS GRID (When no category is expanded) */}
        {activeCategory === 'none' && (
          <div className="category-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
            
            {/* CARD A: Bihar Government Services (Refined Indigo & Royal Lavender) */}
            <div
              onClick={() => handleSelectCategory('bihar-services')}
              className="group select-none bg-gradient-to-b from-[#F5F3FF] via-[#FAF5FF] to-white rounded-2xl border border-indigo-200/90 p-5 shadow-xs hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              {/* Soft decorative ambient glow */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-indigo-900 bg-indigo-100/90 px-3 py-1 rounded-full border border-indigo-200/80 tabular-nums shadow-2xs">
                    {biharServices.length} {isHindi ? 'सेवाएँ' : 'Services'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'बिहार सरकारी सेवाएँ' : 'Bihar Govt Services'}
                </h3>
                <p className="text-xs font-semibold text-indigo-700 mb-2">बिहार सरकारी सेवाएं</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'RTPS जाति, आय और निवास प्रमाण पत्र, बिहार भूमि दाखिल-खारिज, जमाबंदी, LPC और राशन कार्ड।' : 'RTPS Caste, Income, Residence, Bihar Bhumi Dakhil-Kharij, Jamabandi, LPC & EPDS Ration Card.'}
                </p>
              </div>

              <div className="pt-3 border-t border-indigo-100/80 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:text-indigo-950">
                <span>{isHindi ? 'बिहार सेवाएँ देखें' : 'Explore Bihar Services'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* CARD B: Central Government Services (Refined Civic Sapphire & Ocean Blue) */}
            <div
              onClick={() => handleSelectCategory('central-services')}
              className="group select-none bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white rounded-2xl border border-blue-200/90 p-5 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-blue-900 bg-blue-100/90 px-3 py-1 rounded-full border border-blue-200/80 tabular-nums shadow-2xs">
                    {centralServices.length} {isHindi ? 'सेवाएँ' : 'Services'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'केंद्रीय सरकारी सेवाएँ' : 'Central Govt Services'}
                </h3>
                <p className="text-xs font-semibold text-blue-700 mb-2">केंद्रीय सरकारी सेवाएं</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'आधार PVC और अपडेट, PAN सत्यापन, वोटर पोर्टल, परिवहन ड्राइविंग लाइसेंस और पासपोर्ट सेवा।' : 'Aadhaar PVC & Updates, PAN Verification, Voter Portal, Parivahan Driving License & Passport Seva.'}
                </p>
              </div>

              <div className="pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-950">
                <span>{isHindi ? 'केंद्रीय सेवाएँ देखें' : 'Explore Central Services'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* CARD C: Bihar Government Schemes (Vibrant Emerald & Mint Welfare) */}
            <div
              onClick={() => handleSelectCategory('bihar-schemes')}
              className="group select-none bg-gradient-to-b from-[#ECFDF5] via-[#F0FDF4] to-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200/80 tabular-nums shadow-2xs">
                    {biharSchemes.length} {isHindi ? 'योजनाएँ' : 'Schemes'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'बिहार सरकारी योजनाएँ' : 'Bihar Govt Schemes'}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mb-2">बिहार सरकारी योजनाएं</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'मुख्यमंत्री उद्यमी योजना (₹10 लाख), स्टूडेंट क्रेडिट कार्ड, कन्या उत्थान, KYP और डीज़ल अनुदान।' : 'Mukhyamantri Udyami Yojana (₹10 Lakh), Student Credit Card, Kanya Utthan, KYP & Diesel Anudan.'}
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-950">
                <span>{isHindi ? 'बिहार योजनाएँ देखें' : 'Explore Bihar Schemes'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* CARD D: Central Government Schemes (Warm Saffron & Amber Welfare) */}
            <div
              onClick={() => handleSelectCategory('central-schemes')}
              className="group select-none bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7]/20 to-white rounded-2xl border border-amber-200/90 p-5 shadow-xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform duration-300">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200/80 tabular-nums shadow-2xs">
                    {centralSchemes.length} {isHindi ? 'योजनाएँ' : 'Schemes'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'केंद्रीय सरकारी योजनाएँ' : 'Central Govt Schemes'}
                </h3>
                <p className="text-xs font-semibold text-amber-700 mb-2">केंद्रीय सरकारी योजनाएं</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'पीएम किसान सम्मान निधि, आयुष्मान भारत (₹5 लाख), पीएम आवास योजना और पीएम विश्वकर्मा योजना।' : 'PM Kisan Samman Nidhi DBT, Ayushman Bharat (₹5 Lakh), PM Awas Yojana & PM Vishwakarma.'}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-100/80 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-950">
                <span>{isHindi ? 'केंद्रीय योजनाएँ देखें' : 'Explore Central Schemes'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* CARD E: All Online Tools (Creative Royal Violet & Cyber Toolkit) */}
            <div
              onClick={onOpenAllTools}
              className="group select-none bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF]/20 to-white rounded-2xl border border-purple-200/90 p-5 shadow-xs hover:shadow-xl hover:border-purple-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-purple-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-slate-800 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform duration-300">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-purple-900 bg-purple-100/90 px-3 py-1 rounded-full border border-purple-200/80 tabular-nums shadow-2xs">
                    {allToolsCount} {isHindi ? 'टूल्स' : 'Tools'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'सभी ऑनलाइन टूल्स' : 'All Online Tools'}
                </h3>
                <p className="text-xs font-semibold text-purple-700 mb-2">सभी ऑनलाइन टूल्स</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'पासपोर्ट फोटो, PVC कार्ड लेआउट, PDF कंप्रेस, हिंदी टाइपिंग और साइबर कैफ़े के टूल्स।' : 'Passport photo maker, PVC card layout, PDF compress, Hindi typing & cyber cafe utilities.'}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-100/80 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-950">
                <span>{isHindi ? 'सभी 89 टूल्स देखें' : 'Explore All 89 Tools'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

            {/* CARD F: Document & PDF Tools */}
            <div
              onClick={() => onOpenAllTools('pdf')}
              className="group select-none bg-gradient-to-b from-[#EFF6FF] via-[#F0F9FF]/60 to-white rounded-2xl border border-sky-200/90 p-5 shadow-xs hover:shadow-xl hover:border-sky-400 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-sky-200/25 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-sky-900 bg-sky-100/90 px-3 py-1 rounded-full border border-sky-200/80 tabular-nums shadow-2xs">
                    {CONFIRMED_TOOLS.filter((tool) => tool.category === 'pdf').length} {isHindi ? 'टूल्स' : 'Tools'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-950 transition-colors tracking-tight leading-snug mb-1">
                  {isHindi ? 'डॉक्यूमेंट और PDF टूल्स' : 'Document & PDF Tools'}
                </h3>
                <p className="text-xs font-semibold text-sky-700 mb-2">Document Correction · PDF Utilities</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {isHindi ? 'PDF जोड़ें, अलग करें, कम्प्रेस करें, पेज क्रम बदलें, घुमाएँ और दस्तावेज़ तैयार करें।' : 'Merge, split, compress, reorder, rotate and prepare documents with practical PDF utilities.'}
                </p>
              </div>
              <div className="pt-3 border-t border-sky-100/80 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-sky-950">
                <span>{isHindi ? 'डॉक्यूमेंट टूल्स खोलें' : 'Explore Document Tools'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </div>
            </div>

          </div>
        )}

        {/* DEDICATED CATEGORY LISTING VIEW (When a category is active) */}
        {activeCategory !== 'none' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-fadeIn">
            
            {/* Listing View Top Controls Bar with Custom Category Accent */}
            <div className={`p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              activeCategory === 'bihar-services' ? 'bg-indigo-50/70 border-indigo-100' :
              activeCategory === 'central-services' ? 'bg-blue-50/70 border-blue-100' :
              activeCategory === 'bihar-schemes' ? 'bg-emerald-50/70 border-emerald-100' :
              'bg-amber-50/70 border-amber-100'
            }`}>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToCategories}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-slate-300 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  <span>{isHindi ? 'श्रेणियों पर वापस जाएँ' : 'Back to Categories'}</span>
                </button>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {activeCategory === 'bihar-services' && (isHindi ? 'बिहार सरकारी सेवाएँ' : 'Bihar Government Services')}
                    {activeCategory === 'central-services' && (isHindi ? 'केंद्रीय सरकारी सेवाएँ' : 'Central Government Services')}
                    {activeCategory === 'bihar-schemes' && (isHindi ? 'बिहार सरकारी योजनाएँ' : 'Bihar Government Schemes')}
                    {activeCategory === 'central-schemes' && (isHindi ? 'केंद्रीय सरकारी योजनाएँ' : 'Central Government Schemes')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {activeCategory.includes('services') 
                      ? (isHindi ? `${displayedServices.length} में से ${activeCategory === 'bihar-services' ? biharServices.length : centralServices.length} सरकारी सेवाएँ उपलब्ध हैं` : `Showing ${displayedServices.length} of ${activeCategory === 'bihar-services' ? biharServices.length : centralServices.length} official services with full application guides`)
                      : (isHindi ? `${displayedSchemes.length} में से ${activeCategory === 'bihar-schemes' ? biharSchemes.length : centralSchemes.length} सरकारी योजनाएँ उपलब्ध हैं` : `Showing ${displayedSchemes.length} of ${activeCategory === 'bihar-schemes' ? biharSchemes.length : centralSchemes.length} national & state welfare schemes`)}
                  </p>
                </div>
              </div>

              {/* Category Quick Switcher Tabs with Coordinated Color Palettes */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/60 rounded-xl">
                <button
                  onClick={() => handleSelectCategory('bihar-services')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeCategory === 'bihar-services' 
                      ? 'bg-indigo-600 text-white shadow-xs font-bold category-tab-glow category-tab-indigo' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  {isHindi ? `बिहार सेवाएँ (${biharServices.length})` : `Bihar Services (${biharServices.length})`}
                </button>
                <button
                  onClick={() => handleSelectCategory('central-services')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeCategory === 'central-services' 
                      ? 'bg-blue-600 text-white shadow-xs font-bold category-tab-glow category-tab-blue' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  {isHindi ? `केंद्रीय सेवाएँ (${centralServices.length})` : `Central Services (${centralServices.length})`}
                </button>
                <button
                  onClick={() => handleSelectCategory('bihar-schemes')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeCategory === 'bihar-schemes' 
                      ? 'bg-emerald-600 text-white shadow-xs font-bold category-tab-glow category-tab-emerald' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  {isHindi ? `बिहार योजनाएँ (${biharSchemes.length})` : `Bihar Schemes (${biharSchemes.length})`}
                </button>
                <button
                  onClick={() => handleSelectCategory('central-schemes')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeCategory === 'central-schemes' 
                      ? 'bg-amber-600 text-white shadow-xs font-bold category-tab-glow category-tab-amber' 
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  {isHindi ? `केंद्रीय योजनाएँ (${centralSchemes.length})` : `Central Schemes (${centralSchemes.length})`}
                </button>
                <button
                  onClick={onOpenAllTools}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                >
                  {isHindi ? `टूल्स (${allToolsCount})` : `Tools (${allToolsCount})`}
                </button>
              </div>

            </div>

            {/* In-view Search Filter */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-white">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={isHindi ? `${activeCategory.replace('-', ' ')} में खोजें...` : `Search in ${activeCategory.replace('-', ' ')}...`}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-colors text-slate-800 placeholder-slate-400"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    {isHindi ? 'साफ़ करें' : 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {/* LIST OF SERVICES (When activeCategory is bihar-services or central-services) */}
            {activeCategory.includes('services') && (
              <div className="p-4 sm:p-6 space-y-3.5">
                {displayedServices.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    {isHindi ? `"${filterQuery}" से मेल खाती कोई सेवा नहीं मिली। दूसरा शब्द खोजें या ` : `No services matched "${filterQuery}". Try a different keyword or `}{' '}
                    <button onClick={() => setFilterQuery('')} className="text-blue-600 underline font-semibold">
                      {isHindi ? 'फ़िल्टर साफ़ करें' : 'clear filter'}
                    </button>.
                  </div>
                ) : (
                  displayedServices.map((srv) => {
                    const isExpanded = expandedServiceId === srv.id;
                    const serviceImg = getServiceImage(srv.id);
                    const primaryTitle = isHindi && srv.hindiTitle ? srv.hindiTitle : srv.title;
                    const secondaryTitle = isHindi ? srv.title : srv.hindiTitle;
                    const primaryCat = isHindi && srv.hindiCategory ? srv.hindiCategory : srv.category;
                    const primaryTime = isHindi && srv.hindiProcessingTime ? srv.hindiProcessingTime : srv.processingTime;
                    const primaryFee = isHindi && srv.hindiEstimatedFee ? srv.hindiEstimatedFee : srv.estimatedFee;

                    return (
                      <div
                        key={srv.id}
                        className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-blue-300 transition-all duration-200"
                      >
                        {/* Service Item Header Row */}
                        <div
                          onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                          className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            {serviceImg ? (
                              <div className="w-20 sm:w-28 h-14 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                                <img
                                  src={serviceImg}
                                  alt={srv.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover object-center"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                                <Building2 className="w-6 h-6" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-500">
                                <span className={srv.jurisdiction === 'bihar' ? 'text-indigo-700 font-bold' : 'text-blue-700 font-bold'}>
                                  {srv.jurisdiction === 'bihar' ? (isHindi ? 'बिहार राज्य' : 'Bihar State') : (isHindi ? 'केंद्रीय पोर्टल' : 'Central Portal')} · {primaryCat}
                                </span>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {primaryTime}
                                </span>
                                <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
                                <span className="text-emerald-700 font-medium">
                                  {isHindi ? 'शुल्क:' : 'Fee:'} {primaryFee}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                                  {primaryTitle}
                                </h4>
                                {secondaryTitle && secondaryTitle !== primaryTitle && (
                                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                                    {secondaryTitle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-start gap-2.5 shrink-0 self-end sm:self-center">
                            <a
                              href={srv.officialPortal}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors border border-blue-200/60"
                            >
                              <span>{isHindi ? 'आधिकारिक पोर्टल' : 'Official Portal'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              type="button"
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Service Details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
                            {/* Bilingual Summary */}
                            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80">
                              <BilingualText
                                en={srv.summary}
                                hi={srv.hindiSummary}
                                isHindi={isHindi}
                                primaryClassName="text-slate-800 font-normal leading-relaxed text-xs"
                                secondaryClassName="text-slate-500 font-normal leading-relaxed text-[11px] mt-1 pt-1 border-t border-slate-100"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <BilingualHeading
                                    en="Eligibility Criteria"
                                    hi="पात्रता एवं अनिवार्य शर्तें"
                                    isHindi={isHindi}
                                    className="mb-2.5"
                                  />
                                  <BilingualList
                                    enItems={srv.eligibility}
                                    hiItems={srv.hindiEligibility}
                                    isHindi={isHindi}
                                    icon="dot"
                                  />
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                                  <BilingualHeading
                                    en="Required Documents"
                                    hi="अनिवार्य दस्तावेज सूची"
                                    isHindi={isHindi}
                                    className="mb-2.5"
                                  />
                                  <BilingualList
                                    enItems={srv.requiredDocuments}
                                    hiItems={srv.hindiRequiredDocuments}
                                    isHindi={isHindi}
                                    icon="check"
                                  />
                                </div>
                              </div>

                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                                <div>
                                  <BilingualHeading
                                    en="Step-by-Step Application Procedure"
                                    hi="आवेदन की चरण-दर-चरण प्रक्रिया"
                                    isHindi={isHindi}
                                    className="mb-3"
                                  />
                                  <BilingualSteps
                                    enSteps={srv.steps}
                                    hiSteps={srv.hindiSteps}
                                    isHindi={isHindi}
                                  />
                                </div>

                                <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                  {srv.trackUrl && (
                                    <a
                                      href={srv.trackUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                    >
                                      <span>{isHindi ? 'आवेदन स्थिति ट्रैक करें' : 'Track Application'}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                  <a
                                    href={srv.officialPortal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs ml-auto flex items-center gap-1"
                                  >
                                    <span>
                                      {isHindi
                                        ? `पोर्टल: ${srv.hindiOfficialPortalName || srv.officialPortalName}`
                                        : `Proceed to ${srv.officialPortalName}`}
                                    </span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* LIST OF SCHEMES (When activeCategory is bihar-schemes or central-schemes) */}
            {activeCategory.includes('schemes') && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedSchemes.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                    {isHindi ? `"${filterQuery}" से मेल खाती कोई योजना नहीं मिली। दूसरा शब्द खोजें या ` : `No schemes matched "${filterQuery}". Try a different keyword or `}{' '}
                    <button onClick={() => setFilterQuery('')} className="text-blue-600 underline font-semibold">
                      {isHindi ? 'फ़िल्टर साफ़ करें' : 'clear filter'}
                    </button>.
                  </div>
                ) : (
                  displayedSchemes.map((scheme) => {
                    const schemeImg = getSchemeImage(scheme.id);
                    const primaryName = isHindi && scheme.hindiName ? scheme.hindiName : scheme.name;
                    const secondaryName = isHindi ? scheme.name : scheme.hindiName;
                    const primaryMinistry = isHindi && scheme.hindiMinistry ? scheme.hindiMinistry : scheme.ministry;

                    return (
                      <div
                        key={scheme.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5 line-clamp-1">
                                {primaryMinistry}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                                {primaryName}
                              </h4>
                              {secondaryName && secondaryName !== primaryName && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {secondaryName}
                                </p>
                              )}
                            </div>

                            {schemeImg ? (
                              <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                <img
                                  src={schemeImg}
                                  alt={scheme.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                                <Award className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-950 mb-3 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                              {isHindi ? 'सीधा वित्तीय लाभ' : 'Financial Benefit'}
                            </span>
                            <BilingualText
                              en={scheme.financialBenefit}
                              hi={scheme.hindiFinancialBenefit}
                              isHindi={isHindi}
                              primaryClassName="font-semibold text-slate-900 line-clamp-2 text-xs"
                              secondaryClassName="text-emerald-800 text-[11px] line-clamp-1"
                            />
                          </div>

                          <div className="mb-3">
                            <BilingualText
                              en={scheme.summary}
                              hi={scheme.hindiSummary}
                              isHindi={isHindi}
                              primaryClassName="text-xs text-slate-600 line-clamp-2 leading-relaxed"
                              secondaryClassName="text-[11px] text-slate-500 line-clamp-1 mt-0.5"
                            />
                          </div>

                          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mb-3">
                            <span className="font-semibold text-slate-700">
                              {isHindi ? 'लक्षित लाभार्थी:' : 'Target:'}
                            </span>{' '}
                            <BilingualText
                              en={scheme.targetBeneficiaries}
                              hi={scheme.hindiTargetBeneficiaries}
                              isHindi={isHindi}
                              primaryClassName="text-slate-700 line-clamp-1 inline font-medium"
                              secondaryClassName="text-slate-500 text-[10px] line-clamp-1"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedSchemeModal(scheme)}
                            className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer shadow-2xs"
                          >
                            {isHindi ? 'पात्रता एवं प्रक्रिया देखें' : 'View Eligibility & Steps'}
                          </button>
                          <a
                            href={scheme.officialPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                            title={isHindi ? 'आधिकारिक पोर्टल' : 'Official Portal'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={handleBackToCategories}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-700 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? '5 श्रेणी कार्ड पर वापस जाएँ' : 'Return to 5 Category Cards'}</span>
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={onOpenAllTools}
                  className="text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  {isHindi ? `सभी ${allToolsCount} टूल्स की डायरेक्टरी देखें →` : `View All ${allToolsCount} Tools Directory →`}
                </button>
                {onScrollToTop && (
                  <button
                    onClick={onScrollToTop}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {isHindi ? 'पेज के शीर्ष पर जाएँ ↑' : 'Top of Page ↑'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Scheme Detail Walkthrough Modal */}
      {selectedSchemeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-fadeIn">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-blue-700 block mb-1">
                  {isHindi && selectedSchemeModal.hindiMinistry ? selectedSchemeModal.hindiMinistry : selectedSchemeModal.ministry}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {isHindi && selectedSchemeModal.hindiName ? selectedSchemeModal.hindiName : selectedSchemeModal.name}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isHindi ? selectedSchemeModal.name : selectedSchemeModal.hindiName}
                </div>
              </div>
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 shadow-2xs">
                <BilingualHeading
                  en="Financial Assistance / Grant"
                  hi="वित्तीय सहायता / लाभ राशि"
                  isHindi={isHindi}
                  className="mb-1"
                />
                <BilingualText
                  en={selectedSchemeModal.financialBenefit}
                  hi={selectedSchemeModal.hindiFinancialBenefit}
                  isHindi={isHindi}
                  primaryClassName="font-bold text-sm text-emerald-950"
                  secondaryClassName="text-xs text-emerald-800 font-medium mt-1 pt-1 border-t border-emerald-200/60"
                />
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <BilingualHeading
                  en="Scheme Overview"
                  hi="योजना का विवरण एवं उद्देश्य"
                  isHindi={isHindi}
                  className="mb-1.5"
                />
                <BilingualText
                  en={selectedSchemeModal.summary}
                  hi={selectedSchemeModal.hindiSummary}
                  isHindi={isHindi}
                  primaryClassName="leading-relaxed text-slate-800 font-medium"
                  secondaryClassName="leading-relaxed text-slate-500 text-[11px] mt-1 pt-1 border-t border-slate-200/60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <BilingualHeading
                    en="Who is Eligible?"
                    hi="योजना की पात्रता शर्तें"
                    isHindi={isHindi}
                    className="mb-2.5"
                  />
                  <BilingualList
                    enItems={selectedSchemeModal.eligibility}
                    hiItems={selectedSchemeModal.hindiEligibility}
                    isHindi={isHindi}
                    icon="dot"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <BilingualHeading
                    en="Mandatory Documents"
                    hi="अनिवार्य दस्तावेज सूची"
                    isHindi={isHindi}
                    className="mb-2.5"
                  />
                  <BilingualList
                    enItems={selectedSchemeModal.documentsRequired}
                    hiItems={selectedSchemeModal.hindiDocumentsRequired}
                    isHindi={isHindi}
                    icon="check"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
                <BilingualHeading
                  en="How to Apply Step-by-Step"
                  hi="आवेदन प्रक्रिया (चरणबद्ध विवरण)"
                  isHindi={isHindi}
                  className="mb-3"
                />
                <BilingualSteps
                  enSteps={selectedSchemeModal.howToApply}
                  hiSteps={selectedSchemeModal.hindiHowToApply}
                  isHindi={isHindi}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
              <a
                href={selectedSchemeModal.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>{isHindi ? 'आधिकारिक पोर्टल पर आवेदन करें' : 'Apply on Official Portal'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
