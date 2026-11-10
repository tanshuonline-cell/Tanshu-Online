import React, { useState } from 'react';
import { Menu, X, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TANSHU_PROFILE_PHOTO = '/assets/aistudio/WhatsApp_Image_2026-10-31_at_4.17.05_PM_d70d41a1.jpeg';

interface Props {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onOpenCustomerAuth?: () => void;
}

export const Header: React.FC<Props> = ({ onNavigate, activeSection, onOpenCustomerAuth }) => {
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
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#C62828] cursor-pointer ${
                    isActive ? 'text-[#C62828] font-bold border-b-2 border-[#C62828] py-1' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            {activeSection !== 'videos' && (
              <a href="/digital-seva" className="whitespace-nowrap shrink-0 rounded-full border border-amber-300/70 bg-white px-3 py-1.5 text-xs font-bold text-[#7A4B16] shadow-sm transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-[#8F1725]">
                {language === 'hi' ? 'डिजिटल सेवा केंद्र' : 'Digital Seva Center'}
              </a>
            )}
          </nav>

          {/* Left on Mobile / Tablet: Quick section label */}
          <div className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-[#C62828] shrink-0" />
            <span className="truncate">Digital Public Services Hub</span>
          </div>

          {/* Right: Language Switcher ("हिंदी | English") + Customer Access + Explore Tools Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Homepage language switcher styled to match Advanced Passport Photo Studio */}
            <div
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#07152f] p-0.5 shadow-md shadow-slate-900/15 select-none"
              title="भाषा बदलें / Switch Language"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-md px-2 py-1.5 text-[10px] font-extrabold transition duration-300 hover:-translate-y-0.5 sm:text-xs ${
                  language === 'hi'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:shadow-sm'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`inline-flex h-7 w-9 shrink-0 items-center justify-center rounded-md px-2 py-1.5 text-[10px] font-extrabold transition duration-300 hover:-translate-y-0.5 sm:text-xs ${
                  language === 'en'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-blue-100 hover:bg-white/10 hover:shadow-sm'
                }`}
              >
                EN
              </button>
            </div>

            {/* Customer Access / Login Trigger */}
            {onOpenCustomerAuth && (
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                className="inline-flex h-8 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 cursor-pointer sm:w-[132px] sm:px-3"
                title={language === 'hi' ? 'ग्राहक लॉगिन एवं वीडियो एक्सेस' : 'Customer Access'}
              >
                <User className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                <span className="hidden sm:inline">
                  {language === 'hi' ? 'ग्राहक लॉगिन' : 'Customer Access'}
                </span>
              </button>
            )}

            {/* Explore Tools Action */}
            <button
              onClick={() => handleLinkClick('all-tools')}
              className="hidden h-8 w-[132px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#C62828] px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-xs transition-colors hover:bg-[#A61F2A] cursor-pointer whitespace-nowrap sm:flex"
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
                  activeSection === link.id ? 'bg-red-50 text-[#C62828] font-bold' : 'text-slate-700 hover:bg-red-50 hover:text-[#C62828]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {activeSection !== 'videos' && (
              <a
                href="/digital-seva"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-full border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-[#7A4B16] transition-colors hover:bg-amber-50 hover:text-[#8F1725] block"
              >
                {language === 'hi' ? 'डिजिटल सेवा केंद्र' : 'Digital Seva Center'}
              </a>
            )}

            {/* Mobile Customer Access Trigger */}
            {onOpenCustomerAuth && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCustomerAuth();
                  }}
                  className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-800 hover:text-[#C62828] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#C62828]" />
                  <span>{language === 'hi' ? 'ग्राहक लॉगिन एवं वीडियो एक्सेस' : 'Customer Video Access / Sign In'}</span>
                </button>
              </div>
            )}

            <div className="pt-1">
              <button
                onClick={() => handleLinkClick('all-tools')}
                className="w-full py-2.5 bg-[#C62828] hover:bg-[#A61F2A] text-white rounded-lg text-xs font-bold text-center block shadow-sm cursor-pointer"
              >
                {t('btn.exploreAllTools', 'Explore All 89 Tools')}
              </button>
            </div>
          </div>
        )}

        {/* Animated tricolor ambient glow — isolated to the existing decorative strip */}
        <style>{`
          @keyframes tanshu-tricolor-flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .tanshu-tricolor-wrap {
            isolation: isolate;
            position: relative;
            z-index: 0;
            cursor: default;
          }
          .tanshu-tricolor-base {
            background: linear-gradient(90deg, #ff9933 0%, #ffb35e 18%, #fff 38%, #fff 58%, #138808 78%, #21a51b 100%);
            background-size: 220% 100%;
            animation: tanshu-tricolor-flow 6s linear infinite alternate;
          }
          .tanshu-tricolor-pointer {
            background: radial-gradient(115px circle at var(--tanshu-pointer-x, 50%) 50%, rgba(255,255,255,.95), rgba(255,153,51,.55) 22%, rgba(19,136,8,.35) 48%, transparent 76%);
            mix-blend-mode: screen;
            opacity: .9;
          }
          @media (prefers-reduced-motion: reduce) {
            .tanshu-tricolor-base { animation: none; }
          }
        `}</style>
        <div
          className="tanshu-tricolor-wrap h-[2.5px] w-full"
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
            event.currentTarget.style.setProperty('--tanshu-pointer-x', `${(x / bounds.width) * 100}%`);
          }}
          onPointerLeave={(event) => event.currentTarget.style.removeProperty('--tanshu-pointer-x')}
          aria-hidden="true"
        >
          <div className="tanshu-tricolor-base absolute inset-0" />
          <div className="tanshu-tricolor-pointer absolute inset-x-0 -top-[8px] -bottom-[8px] pointer-events-none" />
        </div>
      </header>
    </div>
  );
};
