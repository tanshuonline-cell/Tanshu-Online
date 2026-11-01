import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedHeroBackground } from './AnimatedHeroBackground';
import { UniversalSmartSearch } from './UniversalSmartSearch';
import { ToolItem, GovernmentService, GovernmentScheme, VideoGuide } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onSearch: (query: string) => void;
  onExploreTools: () => void;
  onExploreSchemes: () => void;
  onSelectTool: (tool: ToolItem) => void;
  onSelectService: (service: GovernmentService) => void;
  onSelectScheme: (scheme: GovernmentScheme) => void;
  onSelectVideo: (video: VideoGuide) => void;
}

export const Hero: React.FC<Props> = ({
  onSearch,
  onExploreTools,
  onExploreSchemes,
  onSelectTool,
  onSelectService,
  onSelectScheme,
  onSelectVideo,
}) => {
  const { t, isHindi } = useLanguage();

  return (
    <section id="home" className="relative w-full overflow-hidden bg-slate-100 border-b border-slate-200">
      {/* Background Hero Image with Natural Light Breeze Wind Animation on Flag and Crop Tips */}
      <div className="relative min-h-[580px] lg:min-h-[660px] w-full flex items-center justify-center">
        {/* Pure 100% opacity background with natural colors, brightness, and contrast */}
        <AnimatedHeroBackground />

        {/* Central Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16 text-center flex flex-col items-center">
          {/* Central Prominent Branding Wordmark */}
          <div className="mb-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0A1938] drop-shadow-xs">
              TANSHU <span className="text-blue-600">ONLINE</span>
            </h1>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5 tracking-wide font-sans">
              तंशु ऑनलाइन
            </div>
          </div>

          {/* Small Navigation-style Tagline */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-xs text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest my-3 backdrop-blur-xs">
            <span>{t('hero.tools', 'TOOLS')}</span>
            <span className="text-slate-300">|</span>
            <span>{t('hero.services', 'SERVICES')}</span>
            <span className="text-slate-300">|</span>
            <span>{t('hero.schemes', 'SCHEMES')}</span>
            <span className="text-slate-300">|</span>
            <span>{t('hero.videos', 'VIDEOS')}</span>
          </div>

          {/* Main Hindi Heading: "आपकी हर Digital ज़रूरत, एक ही जगह" */}
          <div className="mt-2 mb-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A1938]">आपकी हर Digital ज़रूरत, </span>
              <span className="text-[#138808]">एक ही जगह</span>
            </h2>

            {/* Small Tricolor Underline Flourish */}
            <div className="w-32 h-1 mx-auto mt-2 rounded-full flex overflow-hidden shadow-xs">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>
          </div>

          {/* Supporting Bilingual Text */}
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium mt-2 mb-6">
            {t(
              'hero.subtitle',
              'PDF, फोटो, सिग्नेचर, ऑनलाइन टूल्स और सरकारी योजनाओं की जानकारी — आसान और व्यवस्थित तरीके से।'
            )}
          </p>

          {/* Premium Universal Smart Search Bar with live autocomplete popover */}
          <UniversalSmartSearch
            onSelectTool={onSelectTool}
            onSelectService={onSelectService}
            onSelectScheme={onSelectScheme}
            onSelectVideo={onSelectVideo}
            onDefaultSearch={onSearch}
          />

          {/* Two Prominent Rounded Buttons: Explore Tools & View Schemes */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreTools}
              className="px-7 py-3 bg-[#0B1A3D] hover:bg-[#162a5b] text-white rounded-full text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span>{t('btn.exploreTools', 'Explore Tools')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreSchemes}
              className="px-7 py-3 bg-[#138808] hover:bg-[#0f6f06] text-white rounded-full text-sm font-bold tracking-wide transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span>{t('hero.viewSchemes', 'View Schemes')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
