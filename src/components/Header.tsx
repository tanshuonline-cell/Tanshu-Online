import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<Props> = ({ onNavigate, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'all-tools', label: 'All Tools' },
    { id: 'services', label: 'Government Services' },
    { id: 'schemes', label: 'Government Schemes' },
    { id: 'videos', label: 'Latest Videos' },
    { id: 'about', label: 'About' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 w-full shadow-xs">
      {/* 2. Top Announcement Bar: Slim dark navy strip */}
      <div className="bg-[#0A1324] text-slate-300 px-4 py-1.5 text-[11px] sm:text-xs text-center border-b border-slate-800/80 flex items-center justify-center gap-2 font-medium tracking-wide">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
        <span className="truncate">
          Independent Citizen Utility &amp; Cyber Cafe Toolkit · Not affiliated with UIDAI, ECI, or any government department.
        </span>
      </div>

      {/* 3. Navigation Header: Clean White Bar */}
      <header className="bg-white/98 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Left: TANSHU ONLINE Logo */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            {/* Blue square with letter T */}
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-extrabold text-base tracking-wider shadow-sm relative overflow-hidden">
              <span>T</span>
              {/* Subtle tricolor line at bottom of logo mark */}
              <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                <span className="flex-1 bg-amber-500" />
                <span className="flex-1 bg-white" />
                <span className="flex-1 bg-emerald-600" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-lg font-black tracking-tight text-slate-950">TANSHU</span>
                <span className="text-lg font-black tracking-tight text-blue-600">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
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

          {/* Right: Explore Tools Action + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleLinkClick('all-tools')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-sm whitespace-nowrap"
            >
              <span>Explore Tools</span>
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
                  activeSection === link.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => handleLinkClick('all-tools')}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold text-center block shadow-sm"
              >
                Explore All 18 Tools
              </button>
            </div>
          </div>
        )}

        {/* Thin saffron-white-green decorative strip directly below the header */}
        <div className="h-[3px] w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white border-t border-b border-slate-200/50" />
          <div className="flex-1 bg-[#138808]" />
        </div>
      </header>
    </div>
  );
};
