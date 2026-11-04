import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Camera,
  Crop,
  ScanLine,
  CreditCard,
  Layers,
  Receipt,
  FileText,
  Maximize2,
  UserCheck,
  MessageSquareShare,
  Sparkles,
  Eraser,
  BadgeCheck,
  FileBadge,
  MapPin,
  Grid,
  ScrollText,
  FolderKanban,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  X,
  SlidersHorizontal,
  Wrench
} from 'lucide-react';
import { ToolItem, ToolCategory } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { getToolPreviewImage } from '../data/toolPreviewImages';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onOpenTool: (tool: ToolItem) => void;
  initialSearchQuery?: string;
  initialCategory?: ToolCategory;
}

export const AllToolsDirectory: React.FC<Props> = ({
  onOpenTool,
  initialSearchQuery = '',
  initialCategory = 'all'
}) => {
  const { isHindi, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(initialCategory);
  const [poppingCategory, setPoppingCategory] = useState<ToolCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync initial props
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim().length > 0) {
      setSearchTerm(initialSearchQuery);
      setIsModalOpen(true);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') {
      setSelectedCategory(initialCategory);
      setIsModalOpen(true);
    }
  }, [initialCategory]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Category counts and definitions across all 90 tools
  const categories: { id: ToolCategory; label: string; hindiLabel: string; count: number }[] = [
    { id: 'all', label: 'All Tools', hindiLabel: 'सभी टूल्स', count: 90 },
    { id: 'business', label: 'CSC & Business', hindiLabel: 'CSC और व्यापार', count: 11 },
    { id: 'pvc-id', label: 'ID Card & Print', hindiLabel: 'पहचान पत्र व प्रिंटिंग', count: 7 },
    { id: 'photo', label: 'Photo & Signature', hindiLabel: 'फोटो और हस्ताक्षर', count: 18 },
    { id: 'pdf', label: 'PDF Tools', hindiLabel: 'PDF टूल्स', count: 22 },
    { id: 'converter', label: 'Image & Utilities', hindiLabel: 'इमेज व उपयोगिताएँ', count: 8 },
    { id: 'calculator', label: 'Calculator & Finance', hindiLabel: 'कैलकुलेटर व वित्त', count: 15 },
    { id: 'whatsapp', label: 'WhatsApp & QR', hindiLabel: 'व्हाट्सएप व QR कोड', count: 8 },
  ];

  const handleCategorySelect = (categoryId: ToolCategory) => {
    setPoppingCategory(categoryId);
    setSelectedCategory(categoryId);
    setTimeout(() => {
      setPoppingCategory((current) => (current === categoryId ? null : current));
    }, 240);
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-4 h-4 text-blue-600" />;
      case 'Crop': return <Crop className="w-4 h-4 text-indigo-600" />;
      case 'ScanLine': return <ScanLine className="w-4 h-4 text-emerald-600" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'Layers': return <Layers className="w-4 h-4 text-purple-600" />;
      case 'Receipt': return <Receipt className="w-4 h-4 text-teal-600" />;
      case 'FileText': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Maximize2': return <Maximize2 className="w-4 h-4 text-indigo-600" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'MessageSquareShare': return <MessageSquareShare className="w-4 h-4 text-green-600" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'Eraser': return <Eraser className="w-4 h-4 text-red-600" />;
      case 'BadgeCheck': return <BadgeCheck className="w-4 h-4 text-blue-600" />;
      case 'FileBadge': return <FileBadge className="w-4 h-4 text-purple-600" />;
      case 'MapPin': return <MapPin className="w-4 h-4 text-rose-600" />;
      case 'Grid': return <Grid className="w-4 h-4 text-cyan-600" />;
      case 'ScrollText': return <ScrollText className="w-4 h-4 text-amber-700" />;
      case 'FolderKanban': return <FolderKanban className="w-4 h-4 text-blue-700" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default: return <Camera className="w-4 h-4 text-blue-600" />;
    }
  };

  // Requirement: Identify the six Featured Tools to ensure All Tools initial cards are 100% distinct
  const featuredToolIds = useMemo(() => {
    return new Set(
      CONFIRMED_TOOLS.filter((t) => t.isFeatured).slice(0, 6).map((t) => t.id)
    );
  }, []);

  // Exactly six different tool cards for the initial homepage All Tools section
  const initialSixTools = useMemo(() => {
    return CONFIRMED_TOOLS.filter((t) => !featuredToolIds.has(t.id)).slice(0, 6);
  }, [featuredToolIds]);

  // Filtered tools across all 90 tools (active inside the modal)
  const filteredTools = useMemo(() => {
    return CONFIRMED_TOOLS.filter((tool) => {
      const effectiveCategory =
        selectedCategory === 'scanning' ? 'converter' :
        selectedCategory === 'legal-docs' ? 'business' :
        selectedCategory;

      const matchesCategory =
        effectiveCategory === 'all' ||
        tool.category === effectiveCategory ||
        (selectedCategory === 'scanning' && (tool.category === 'converter' || tool.category === 'pdf')) ||
        (selectedCategory === 'legal-docs' && tool.category === 'business');

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.categoryLabel.toLowerCase().includes(q) ||
        tool.keyFeatures.some((f) => f.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleToolClick = (tool: ToolItem) => {
    setIsModalOpen(false);
    onOpenTool(tool);
  };

  // Helper renderer for standard tool card
  const renderToolCard = (tool: ToolItem) => {
    const previewImg = getToolPreviewImage(tool.id, tool.name, tool.categoryLabel);
    return (
      <div
        key={tool.id}
        className="bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none"
      >
        <div>
          {/* Visual Preview Image */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5 border border-slate-200/80 shadow-2xs">
            <img
              src={previewImg}
              alt={tool.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold rounded-md">
              {tool.categoryLabel}
            </div>
          </div>

          {/* Category and Icon Header */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
              {getToolIcon(tool.iconName)}
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">
              {tool.categoryLabel}
            </span>
          </div>

          {/* Tool Name */}
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight mb-1 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
            {tool.name}
          </h3>

          {/* Tool Description */}
          <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
            {tool.description}
          </p>

          {/* Key Features Bullet List */}
          <ul className="space-y-1 mb-3 pt-2 border-t border-slate-100">
            {tool.keyFeatures.slice(0, 2).map((feat, i) => (
              <li key={i} className="text-[10px] sm:text-[11px] text-slate-500 flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">✓</span>
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Open Tool Button */}
        <button
          onClick={() => handleToolClick(tool)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto shadow-2xs"
        >
          <span>{isHindi ? 'टूल खोलें' : 'Open Tool'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <section id="all-tools" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHindi ? 'ऑनलाइन टूल्स डायरेक्टरी' : 'Production Utilities Directory'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isHindi ? 'सभी टूल्स' : 'All Tools'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isHindi
                ? 'साइबर कैफ़े, CSC केंद्र और नागरिक सेवाओं के लिए 7 श्रेणियों में 90 प्रमाणित ऑनलाइन उपयोगिताएँ।'
                : 'Complete professional toolkit for Cyber Cafes, CSC Centers, and Citizen Digital Services across 7 specialized categories.'}
            </p>
          </div>

          {/* Quick Summary Badge & Modal Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 border border-blue-200 px-3.5 py-2 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isHindi ? 'डायरेक्टरी खोलें (90 टूल्स)' : 'Browse All 90 Tools'}</span>
            </button>
          </div>
        </div>

        {/* 1. HOMEPAGE: INITIALLY DISPLAY EXACTLY SIX DIFFERENT TOOLS (NOT in Featured Tools) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {initialSixTools.map((tool) => renderToolCard(tool))}
        </div>

        {/* 2. CENTERED BUTTON: "View All 90 Tools" / "सभी 90 टूल देखें" */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
            <span>{isHindi ? 'सभी 90 टूल देखें' : 'View All 90 Tools'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-[11px] text-slate-500 font-medium">
            {isHindi ? '7 श्रेणियों में 90 ऑनलाइन उपयोगिताएँ' : 'Browse full directory with search & category filters'}
          </span>
        </div>
      </div>

      {/* 3. ALL TOOLS MODAL: COMPLETE 90-TOOL DIRECTORY WITH SEARCH & CATEGORY FILTERS */}
      {isModalOpen && (
        <div
          ref={backdropRef}
          onClick={(e) => {
            if (e.target === backdropRef.current) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-tools-modal-title"
        >
          <div className="relative w-full max-w-7xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0A1324] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  <Grid className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 id="all-tools-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white">
                    {isHindi ? 'सभी 90 टूल्स डायरेक्टरी' : 'All 90 Tools Directory'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isHindi
                      ? '7 विशेष श्रेणियों में उपलब्ध सम्पूर्ण डिजिटल टूल्स'
                      : 'Complete professional toolkit across 7 specialized categories'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close all tools modal"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sticky Controls: Search Bar & Category Filter Bar */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Input across all 90 tools */}
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      isHindi
                        ? 'टूल नाम या फॉर्मेट (PDF, JPG, A4, PVC) से खोजें...'
                        : 'Search by tool name, format (PDF, JPG, A4, PVC), or service...'
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Count Text */}
                <div className="text-xs text-slate-600 font-medium whitespace-nowrap self-end sm:self-center">
                  {isHindi ? 'प्रदर्शित: ' : 'Showing '}{' '}
                  <span className="font-bold text-slate-900">{filteredTools.length}</span>{' '}
                  {isHindi ? 'कुल 90 टूल्स में से' : `of ${CONFIRMED_TOOLS.length} tools`}
                </div>
              </div>

              {/* Category Filter Tabs across all 90 tools */}
              <div
                role="tablist"
                aria-label="Tool Categories"
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none"
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const isPopping = poppingCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`group relative px-3 py-1.5 text-xs font-semibold rounded-xl border cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 transition-all duration-200 active:scale-[0.96] select-none ${
                        isPopping ? 'scale-105' : 'scale-100'
                      } ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-700'
                      }`}
                    >
                      <span>{isHindi ? cat.hindiLabel : cat.label}</span>
                      <span
                        className={`text-[10px] min-w-[18px] px-1 py-0.2 rounded-full font-bold transition-colors leading-none text-center ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Independently Scrollable Grid of Tools */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50">
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
                  {filteredTools.map((tool) => renderToolCard(tool))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                  <p className="text-sm font-bold text-slate-800">
                    {isHindi ? 'आपकी खोज के अनुसार कोई टूल नहीं मिला।' : 'No tools matched your search query.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHindi
                      ? 'कृपया अन्य शब्दों जैसे "Passport", "PDF", "Calculator", "QR" से खोजें।'
                      : 'Try searching for "Passport", "PDF", "Calculator", or "QR", or reset your filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                  >
                    {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-500">
              <span>
                {isHindi
                  ? 'सभी टूल्स 100% निशुल्क और क्लाइंट-साइड प्राइवेट हैं।'
                  : 'All 90 tools run 100% client-side with complete user privacy.'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                {isHindi ? 'बंद करें (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
