import React, { useState, useMemo } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { ToolItem, ToolCategory } from '../types';
import { CONFIRMED_TOOLS } from '../data/toolsData';
import { getToolPreviewImage } from '../data/toolPreviewImages';

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
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(initialCategory);
  const [poppingCategory, setPoppingCategory] = useState<ToolCategory | null>(null);

  const handleCategorySelect = (categoryId: ToolCategory) => {
    setPoppingCategory(categoryId);
    setSelectedCategory(categoryId);
    setTimeout(() => {
      setPoppingCategory((current) => (current === categoryId ? null : current));
    }, 240);
  };

  React.useEffect(() => {
    setSearchTerm(initialSearchQuery);
  }, [initialSearchQuery]);

  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categories: { id: ToolCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Tools', count: 89 },
    { id: 'business', label: 'CSC & Business', count: 11 },
    { id: 'pvc-id', label: 'ID Card & Print', count: 7 },
    { id: 'photo', label: 'Photo & Signature', count: 18 },
    { id: 'pdf', label: 'PDF Tools', count: 22 },
    { id: 'converter', label: 'Image & Utilities', count: 8 },
    { id: 'calculator', label: 'Calculator & Finance', count: 15 },
    { id: 'whatsapp', label: 'WhatsApp & QR', count: 8 },
  ];

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

  const filteredTools = useMemo(() => {
    return CONFIRMED_TOOLS.filter((tool) => {
      // Map backwards compatibility categories if any
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

  return (
    <section id="all-tools" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Production Utilities Directory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Tools (89)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete professional toolkit for Cyber Cafes, CSC Centers, and Citizen Digital Services across 7 specialized categories.
            </p>
          </div>

          {/* Quick Category Summary Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 max-w-lg">
            <span className="font-semibold text-slate-900">89 Confirmed Tools:</span>{' '}
            7 categories covering Business &amp; CSC, PVC ID Card Printing, Photo &amp; Biometric Studio, PDF Tools, Image Utilities, Financial Calculators, and WhatsApp QR Tools.
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tool name, format (PDF, JPG, A4, PVC), or service..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Count Text */}
            <div className="text-xs text-slate-500 whitespace-nowrap self-end sm:self-center">
              Showing <span className="font-semibold text-slate-900">{filteredTools.length}</span> of {CONFIRMED_TOOLS.length} tools
            </div>
          </div>

          {/* Category Tabs: Modern, Accessible Segmented Navigation Bar */}
          <div
            role="tablist"
            aria-label="Tool Categories"
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-slate-100/85 rounded-2xl border border-slate-200/90 shadow-2xs backdrop-blur-xs"
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
                  className={`group relative px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 active:scale-[0.96] motion-reduce:transition-none motion-reduce:transform-none select-none ${
                    isPopping ? 'scale-105' : 'scale-100'
                  } ${
                    isSelected
                      ? 'bg-blue-50/95 text-blue-700 border-blue-300 shadow-xs ring-1 ring-blue-300/40 font-bold'
                      : 'bg-white/80 text-slate-600 border-slate-200/80 hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-300/80 hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
                >
                  <span className="tracking-tight">{cat.label}</span>
                  <span
                    className={`text-[11px] min-w-[20px] px-1.5 py-0.5 rounded-full font-bold transition-colors leading-none text-center border ${
                      isSelected
                        ? 'bg-blue-100/90 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200/80 group-hover:bg-blue-100/70 group-hover:text-blue-700 group-hover:border-blue-200/70'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 89 Tools Grid with Professional Compact Realistic Preview Images */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const previewImg = getToolPreviewImage(tool.id, tool.name, tool.categoryLabel);
              return (
                <div
                  key={tool.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Visual Preview Image in Upper Section:
                        Compact 120-130px wide × 66-72px high on desktop, centered, object-fit cover */}
                    <div className="relative w-full flex items-center justify-center py-2 px-3 mb-3.5 bg-slate-50/90 rounded-lg border border-slate-200/80 shadow-2xs group-hover:bg-blue-50/30 transition-colors">
                      <div className="w-[124px] sm:w-[130px] h-[66px] sm:h-[72px] rounded-md overflow-hidden relative shadow-2xs border border-slate-200 bg-white shrink-0">
                        <img
                          src={previewImg}
                          alt={tool.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-semibold rounded">
                        {tool.categoryLabel}
                      </div>
                    </div>

                    {/* Category and Icon Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        {getToolIcon(tool.iconName)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 truncate">
                        {tool.categoryLabel}
                      </span>
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1.5 group-hover:text-blue-700 transition-colors">
                      {tool.name}
                    </h3>

                    {/* Tool Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                      {tool.description}
                    </p>

                    {/* Key Features Bullet List */}
                    <ul className="space-y-1 mb-4 pt-2.5 border-t border-slate-100">
                      {tool.keyFeatures.slice(0, 2).map((feat, i) => (
                        <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold shrink-0">✓</span>
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Open Tool Button */}
                  <button
                    onClick={() => onOpenTool(tool)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer mt-auto"
                  >
                    <span>Open Tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 p-6">
            <p className="text-sm font-semibold text-slate-700">No tools matched your search query.</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for "Passport", "PDF", "Calculator", "QR", or reset your filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
