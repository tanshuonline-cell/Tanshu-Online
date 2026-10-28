import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickCategoryStrip } from './components/QuickCategoryStrip';
import { SocialStrip } from './components/SocialStrip';
import { FeaturedTools } from './components/FeaturedTools';
import { AllToolsDirectory } from './components/AllToolsDirectory';
import { GovernmentServices } from './components/GovernmentServices';
import { GovernmentSchemes } from './components/GovernmentSchemes';
import { LatestVideos } from './components/LatestVideos';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { UniversalToolModal } from './components/tools/UniversalToolModal';
import { ToolItem, ToolCategory } from './types';
import { CONFIRMED_TOOLS } from './data/toolsData';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directoryCategory, setDirectoryCategory] = useState<ToolCategory>('all');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleHeroSearch = (query: string) => {
    setSearchQuery(query);
    setDirectoryCategory('all');
    scrollToSection('all-tools');
  };

  const handleCategoryShortcut = (action: string) => {
    if (action === 'tool-photo') {
      setDirectoryCategory('photo');
      setSearchQuery('');
      scrollToSection('all-tools');
    } else if (action === 'tool-scanning') {
      setDirectoryCategory('pdf');
      setSearchQuery('');
      scrollToSection('all-tools');
    } else if (action === 'tool-pvc') {
      setDirectoryCategory('pvc-id');
      setSearchQuery('');
      scrollToSection('all-tools');
    } else if (action === 'tool-business') {
      setDirectoryCategory('business');
      setSearchQuery('');
      scrollToSection('all-tools');
    } else if (action === 'tool-whatsapp') {
      setDirectoryCategory('whatsapp');
      setSearchQuery('');
      scrollToSection('all-tools');
    } else if (action === 'section-services') {
      scrollToSection('services');
    } else if (action === 'section-schemes') {
      scrollToSection('schemes');
    } else if (action === 'section-videos') {
      scrollToSection('videos');
    }
  };

  const handleOpenTool = (tool: ToolItem) => {
    setActiveTool(tool);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 2 & 3: Announcement Bar + Sticky Header + Tricolor Strip */}
      <Header
        onNavigate={scrollToSection}
        activeSection={activeSection}
      />

      <main className="flex-1">
        {/* 4, 5, 6: Large Hero Banner with Digital India Panorama, Central Bilingual Branding, Search & Action Buttons */}
        <Hero
          onSearch={handleHeroSearch}
          onExploreTools={() => scrollToSection('all-tools')}
          onExploreSchemes={() => scrollToSection('schemes')}
        />

        {/* 7: Quick Category Strip (8 Items with English & Hindi labels and colorful rounded icons) */}
        <QuickCategoryStrip onSelectCategory={handleCategoryShortcut} />

        {/* 8: Dark Navy Social Media Strip with Verified Links and WhatsApp CTA */}
        <SocialStrip />

        {/* Featured Tools: Exactly 6 tools in one desktop row */}
        <FeaturedTools onOpenTool={handleOpenTool} />

        {/* All Tools Directory: Searchable, Filterable 18 confirmed tools */}
        <AllToolsDirectory
          onOpenTool={handleOpenTool}
          initialSearchQuery={searchQuery}
          initialCategory={directoryCategory}
        />

        {/* Government Services Directory */}
        <GovernmentServices />

        {/* Government Schemes Directory */}
        <GovernmentSchemes />

        {/* Latest Videos & Tutorials Hub */}
        <LatestVideos />

        {/* About TANSHU ONLINE & Privacy Mission */}
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer onNavigate={scrollToSection} />

      {/* Universal Interactive Tool Workspace Modal */}
      {activeTool && (
        <UniversalToolModal
          tool={activeTool}
          onClose={handleCloseTool}
        />
      )}
    </div>
  );
}
