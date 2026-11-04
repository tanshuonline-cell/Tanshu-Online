import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight, Wrench, Building2, Award, Play, ChevronRight, Sparkles } from 'lucide-react';
import { searchUniversal, SearchResultItem } from '../utils/searchIndex';
import { ToolItem, GovernmentService, GovernmentScheme, VideoGuide } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onSelectTool: (tool: ToolItem) => void;
  onSelectService: (service: GovernmentService) => void;
  onSelectScheme: (scheme: GovernmentScheme) => void;
  onSelectVideo: (video: VideoGuide) => void;
  onDefaultSearch: (query: string) => void;
  placeholder?: string;
}

export const UniversalSmartSearch: React.FC<Props> = ({
  onSelectTool,
  onSelectService,
  onSelectScheme,
  onSelectVideo,
  onDefaultSearch,
  placeholder,
}) => {
  const { language, t, isHindi } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Suggested quick searches when search bar is focused but empty
  const quickSuggestions = [
    { label: 'Voter ID Card', hi: 'वोटर कार्ड', q: 'Voter ID' },
    { label: 'Aadhaar Update', hi: 'आधार अपडेट', q: 'Aadhaar' },
    { label: 'Caste Certificate (RTPS)', hi: 'जाति प्रमाण पत्र', q: 'जाति प्रमाण पत्र' },
    { label: 'PM Kisan DBT', hi: 'पीएम किसान', q: 'PM Kisan' },
    { label: 'Passport Photo Maker', hi: 'पासपोर्ट फोटो', q: 'Passport Photo' },
    { label: 'Udyami Yojana', hi: 'उद्यमी योजना', q: 'Udyami' },
  ];

  // Perform live search using universal bidirectional search index
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchUniversal(query, 10);
  }, [query]);

  // Click outside to dismiss popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Scroll active item into view when navigating with arrow keys
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: SearchResultItem) => {
    setIsOpen(false);
    setSelectedIndex(-1);

    const targetData = item.originalData || item.rawItem;

    if (item.type === 'tool' && targetData) {
      onSelectTool(targetData as ToolItem);
    } else if (item.type === 'service' && targetData) {
      onSelectService(targetData as GovernmentService);
    } else if (item.type === 'scheme' && targetData) {
      onSelectScheme(targetData as GovernmentScheme);
    } else if (item.type === 'video' && targetData) {
      onSelectVideo(targetData as VideoGuide);
    } else {
      onDefaultSearch(item.title);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      handleSelectItem(results[selectedIndex]);
      return;
    }
    if (query.trim()) {
      setIsOpen(false);
      onDefaultSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelectItem(results[selectedIndex]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedIndex(-1);
  };

  const getItemBadge = (item: SearchResultItem) => {
    switch (item.type) {
      case 'tool':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Wrench className="w-2.5 h-2.5" />
            <span>{isHindi ? 'ऑनलाइन टूल' : 'Tool'}</span>
          </span>
        );
      case 'service':
        if (item.jurisdiction === 'bihar') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Building2 className="w-2.5 h-2.5 text-amber-600" />
              <span>{isHindi ? 'बिहार सेवा' : 'Bihar Service'}</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-2.5 h-2.5 text-indigo-600" />
            <span>{isHindi ? 'केंद्रीय सेवा' : 'Central Service'}</span>
          </span>
        );
      case 'scheme':
        if (item.jurisdiction === 'bihar') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
              <Award className="w-2.5 h-2.5 text-orange-600" />
              <span>{isHindi ? 'बिहार योजना' : 'Bihar Scheme'}</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Award className="w-2.5 h-2.5 text-emerald-600" />
            <span>{isHindi ? 'केंद्रीय योजना' : 'Central Scheme'}</span>
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>{isHindi ? 'वीडियो गाइड' : 'Video Tutorial'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const defaultPlaceholder = isHindi
    ? '89 टूल्स, सरकारी सेवाएं या योजनाएं खोजें (जैसे वोटर कार्ड, आधार, जाति, PM किसान)...'
    : 'Search 89 tools, Bihar & Central services, schemes (e.g. Voter, Aadhaar, Caste, PM Kisan)...';

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-2xl relative mb-6 transition-all duration-300 ${
        isOpen ? 'scale-[1.01] max-w-3xl' : ''
      }`}
    >
      {/* Long, Slim, Professional PVC-Card-Inspired Search Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="relative z-30 w-full bg-white rounded-xl border border-slate-300 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100/80 shadow-xs focus-within:shadow-md transition-all duration-200 p-1 sm:p-1.5 flex items-center gap-2"
      >
        <div className="pl-3 sm:pl-3.5 text-slate-400 flex items-center shrink-0">
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          aria-label={isHindi ? "सभी सेवाओं में खोजें" : "Universal Search"}
          autoComplete="off"
          spellCheck="false"
          className="flex-1 w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-1 py-1 font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={isHindi ? "खोज साफ़ करें" : "Clear Search"}
            title={isHindi ? 'खोज साफ़ करें' : 'Clear search'}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="hidden sm:inline-flex px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title={isHindi ? "परिणाम बंद करें" : "Close results"}
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        )}

        <button
          type="submit"
          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#0B1A3D] hover:bg-[#13285C] text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 hover:shadow-xs"
        >
          <span>{t('hero.searchBtn', 'Search')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/98 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn text-left">
          {/* Header strip with clear close button */}
          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="uppercase tracking-wider">
              {query.trim().length > 0
                ? `${isHindi ? 'शीर्ष परिणाम' : 'Top Results'} (${results.length})`
                : (isHindi ? 'त्वरित खोज सुझाव' : 'Quick Suggestions')}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 cursor-pointer"
              title={isHindi ? "खोज बंद करें" : "Close search"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Active Search Results */}
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <div>
                <div ref={listRef} className="max-h-[360px] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                  {results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 group ${
                          isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600 pl-3' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {getItemBadge(item)}
                            {item.hindiTitle && (
                              <span className="text-xs font-semibold text-slate-500 font-sans">
                                {item.hindiTitle}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center text-slate-400 group-hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Free Text Search Footer */}
                <div
                  onClick={() => {
                    setIsOpen(false);
                    onDefaultSearch(query.trim());
                  }}
                  className="p-3 bg-slate-50 hover:bg-blue-50 border-t border-slate-100 text-xs font-semibold text-blue-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <span className="truncate">
                    {isHindi ? `"${query}" के लिए सभी 89 टूल्स में खोजें` : `Search all 89 tools for "${query}"`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-2" />
                </div>
              </div>
            ) : (
              /* No Results State */
              <div className="p-6 text-center">
                <p className="text-sm font-bold text-slate-800 mb-1">
                  {isHindi ? `"${query}" के लिए कोई सीधा परिणाम नहीं मिला` : `No direct results for "${query}"`}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {isHindi
                    ? 'कृपया अन्य शब्दों जैसे "voter", "aadhaar", "caste", "kisan" आदि से खोजें।'
                    : 'Try searching with keywords like "voter", "aadhaar", "caste", or "kisan".'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDefaultSearch(query.trim());
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{isHindi ? 'सभी टूल्स में खोजें' : 'Search All Tools'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            /* Empty Query Quick Suggestions State */
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHindi ? 'लोकप्रिय खोज सुझाव' : 'Popular Search Suggestions'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(sug.q);
                      setIsOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{isHindi ? sug.hi : sug.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
