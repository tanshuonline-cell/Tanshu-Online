import React, { useState } from 'react';
import { Menu, X, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TANSHU_PROFILE_PHOTO = '/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg';

interface Props {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onOpenCustomerAuth?: () => void;
  isHomePage?: boolean;
}

export const Header: React.FC<Props> = ({ onNavigate, activeSection, onOpenCustomerAuth, isHomePage = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { id: 'home', label: t('nav.home', 'Home') },
    { id: 'all-tools', label: t('nav.allTools', 'All Tools') },
    { id: 'services', label: t('nav.services', 'Government Services') },
    { id: 'schemes', label: t('nav.schemes', 'Government Schemes') },
    { id: 'videos', label: t('nav.videos', 'Latest Videos') },
    { id: 'about', label: t('nav.about', 'About') },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. UPPER DARK HEADER AREA: Main Branding + Profile Photo + Citizen Disclaimer */}
      <div className="bg-[#0A1324] text-white border-b border-slate-800/90 px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Original Profile Photo + Branding: "TANSHU ONLINE" */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 group"
          >
            {/* Small circular profile photo using exact original image */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-blue-500/70 shadow-xs shrink-0 bg-slate-800">
              <img
                src={TANSHU_PROFILE_PHOTO}
                alt="Tanshu Online Founder & Instructor"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: '50%' }}
                loading="eager"
              />
            </div>

            {/* Branding text: TANSHU in white, ONLINE in blue */}
            <div className="flex items-center gap-1 font-sans tracking-tight">
              <span className="text-sm sm:text-base font-black text-white tracking-wide">
                TANSHU
              </span>
              <span className="text-sm sm:text-base font-black text-blue-400 tracking-wide">
                ONLINE
              </span>
            </div>
          </div>

          {/* Right: Preserved Independent Citizen Disclaimer & Toolkit Tagline */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate max-w-xl">
              {t(
                'announcement',
                'Independent Citizen Utility & Cyber Cafe Toolkit · Not affiliated with UIDAI, ECI, or any government department.'
              )}
            </span>
          </div>

          {/* Mobile Right: Compact Citizen Badge */}
          <div className="flex md:hidden items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Citizen Toolkit</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR: Clean White Bar (No duplicated branding) */}
      <header className="bg-white/98 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-blue-700 cursor-pointer ${
                    isActive ? 'text-blue-700 font-bold border-b-2 border-blue-600 py-1' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Left on Mobile / Tablet: Quick section label */}
          <div className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Digital Public Services Hub</span>
          </div>

          {/* Right: Language Switcher ("हिंदी | English") + Customer Access + Explore Tools Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Prominent Language Switcher showing both "हिंदी | English" */}
            <div
              className={isHomePage ? "inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#07152f] p-0.5 shadow-md shadow-slate-900/15 select-none" : "inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold shadow-2xs select-none"}
              title="भाषा बदलें / Switch Language"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={isHomePage ? `rounded-md px-2 py-1.5 text-[10px] font-extrabold transition duration-300 hover:-translate-y-0.5 sm:text-xs ${language === 'hi' ? 'bg-white text-slate-900 shadow-md' : 'text-blue-100 hover:bg-white/10 hover:shadow-sm'}` : `px-2 py-1 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${language === 'hi' ? 'bg-blue-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                हिंदी
              </button>
              <span className={isHomePage ? "hidden" : "text-slate-300 px-0.5"}>|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={isHomePage ? `rounded-md px-2 py-1.5 text-[10px] font-extrabold transition duration-300 hover:-translate-y-0.5 sm:text-xs ${language === 'en' ? 'bg-white text-slate-900 shadow-md' : 'text-blue-100 hover:bg-white/10 hover:shadow-sm'}` : `px-2 py-1 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${language === 'en' ? 'bg-blue-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                {isHomePage ? 'EN' : 'English'}
              </button>
            </div>

            {/* Customer Access / Login Trigger */}
            {onOpenCustomerAuth && (
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs ${isHomePage ? "sm:w-[150px] sm:justify-center" : ""}`}
                title={language === 'hi' ? 'ग्राहक लॉगिन एवं वीडियो एक्सेस' : 'Customer Access'}
              >
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">
                  {language === 'hi' ? 'ग्राहक लॉगिन' : 'Customer Access'}
                </span>
              </button>
            )}

            {/* Explore Tools Action */}
            <button
              onClick={() => handleLinkClick('all-tools')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-xs whitespace-nowrap ${isHomePage ? "sm:w-[160px] sm:justify-center" : ""}`}
            >
              <span>{t('btn.exploreTools', 'Explore Tools')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer block ${
                  activeSection === link.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile Customer Access Trigger */}
            {onOpenCustomerAuth && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCustomerAuth();
                  }}
                  className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-800 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'ग्राहक लॉगिन एवं वीडियो एक्सेस' : 'Customer Video Access / Sign In'}</span>
                </button>
              </div>
            )}

            <div className="pt-1">
              <button
                onClick={() => handleLinkClick('all-tools')}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold text-center block shadow-sm cursor-pointer"
              >
                {t('btn.exploreAllTools', 'Explore All 89 Tools')}
              </button>
            </div>
          </div>
        )}

        {/* Thin saffron-white-green decorative strip directly below navigation */}
        <div className="h-[2.5px] w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white border-t border-b border-slate-200/50" />
          <div className="flex-1 bg-[#138808]" />
        </div>
      </header>
    </div>
  );
};
