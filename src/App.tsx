import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickCategoryStrip } from './components/QuickCategoryStrip';
import { SocialStrip } from './components/SocialStrip';
import { FeaturedTools } from './components/FeaturedTools';
import { MembershipPlansSection } from './components/MembershipPlansSection';
import { AllToolsDirectory } from './components/AllToolsDirectory';
import { GovernmentServices } from './components/GovernmentServices';
import { GovernmentSchemes } from './components/GovernmentSchemes';
import { CategoryNavigationSection } from './components/CategoryNavigationSection';
import { LatestVideos } from './components/LatestVideos';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { UniversalToolModal } from './components/tools/UniversalToolModal';
import { VideoLearningCenter } from './components/video/VideoLearningCenter';
import { CompleteVideoCatalog } from './components/video/CompleteVideoCatalog';
import { VideoDetailPage } from './components/video/VideoDetailPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { ToolItem, ToolCategory, GovernmentService, GovernmentScheme, VideoGuide, AdminUser } from './types';
import { CONFIRMED_TOOLS } from './data/toolsData';
import { LATEST_VIDEOS } from './data/videosData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'videos' | 'video-detail' | 'admin'>('home');
  const [selectedDetailVideo, setSelectedDetailVideo] = useState<VideoGuide | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [catalogVideos, setCatalogVideos] = useState<VideoGuide[]>(LATEST_VIDEOS);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  
  // Keep browser metadata aligned with the actual public route.
  useEffect(() => {
    const siteUrl = 'https://tanshu-online.pages.dev';
    const pathname = window.location.pathname;
    const isVideoCatalog = pathname === '/videos';
    const isVideoDetail = pathname.startsWith('/video/');
    const video = isVideoDetail
      ? (catalogVideos.find((item) => item.id === pathname.replace('/video/', '')) ||
         LATEST_VIDEOS.find((item) => item.id === pathname.replace('/video/', '')))
      : null;

    const title = isVideoCatalog
      ? 'Video Learning Center | TANSHU ONLINE'
      : video
        ? `${video.title} | TANSHU ONLINE`
        : 'TANSHU ONLINE | Online Tools, Government Services & Video Guides';
    const description = isVideoCatalog
      ? 'TANSHU ONLINE के वीडियो लर्निंग सेंटर में ऑनलाइन सेवाओं, दस्तावेज़ों, डिजिटल टूल्स और उपयोगी प्रक्रियाओं की वीडियो गाइड देखें।'
      : video
        ? (video.description || video.title).slice(0, 300)
        : 'TANSHU ONLINE पर उपयोगी ऑनलाइन टूल्स, सरकारी सेवाओं और योजनाओं की जानकारी, दस्तावेज़ संबंधी सुविधाएँ और वीडियो गाइड एक ही जगह पाएँ।';
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '/' : pathname}`;

    document.title = title;
    const setMeta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [catalogVideos]);


  // Existing Homepage State
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directoryCategory, setDirectoryCategory] = useState<ToolCategory>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);

  // Load public dynamic catalog updates if available
  useEffect(() => {
    fetch('/api/video/catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          const merged = [...data.videos];
          for (const lv of LATEST_VIDEOS) {
            if (!merged.some((m) => m.id === lv.id)) {
              merged.push(lv);
            }
          }
          setCatalogVideos(merged);
        }
      })
      .catch(() => {});
  }, []);

  // URL Path & History Routing Handler (handles /admin, /videos, /video/:id)
  useEffect(() => {
    const handleUrlRouting = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;

      if (pathname === '/admin' || hash === '#admin') {
        setCurrentPage('admin');
      } else if (pathname === '/videos' || hash === '#videos') {
        setCurrentPage('videos');
      } else if (pathname.startsWith('/video/') || hash.startsWith('#video/')) {
        const id = pathname.startsWith('/video/')
          ? pathname.replace('/video/', '')
          : hash.replace('#video/', '');
        const found = catalogVideos.find((v) => v.id === id) || LATEST_VIDEOS.find((v) => v.id === id);
        if (found) {
          setSelectedDetailVideo(found);
          setCurrentPage('video-detail');
        } else {
          setCurrentPage('videos');
        }
      } else {
        setCurrentPage('home');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [catalogVideos]);

  // Check existing admin session cookie on mount
  useEffect(() => {
    if (currentPage === 'admin' && !adminUser) {
      fetch('/api/admin/auth/check', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.authenticated && data.user) {
            setAdminUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [currentPage, adminUser]);

  const navigateTo = (page: 'home' | 'videos' | 'admin', pushUrl?: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushUrl && window.location.pathname !== pushUrl) {
      window.history.pushState({}, '', pushUrl);
    }
  };

  const navigateToVideoDetail = (video: VideoGuide) => {
    setSelectedDetailVideo(video);
    setCurrentPage('video-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({}, '', `/video/${video.id}`);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setAdminUser(null);
    navigateTo('home', '/');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (currentPage !== 'home') {
      navigateTo('home', '/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

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

  const handleSelectServiceFromSearch = (service: GovernmentService) => {
    setSelectedServiceId(service.id);
    scrollToSection('services');
  };

  const handleSelectSchemeFromSearch = (scheme: GovernmentScheme) => {
    setSelectedScheme(scheme);
    scrollToSection('schemes');
  };

  const handleSelectVideoFromSearch = (video: VideoGuide) => {
    navigateToVideoDetail(video);
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
      navigateTo('videos', '/videos');
    }
  };

  const handleOpenTool = (tool: ToolItem) => {
    setActiveTool(tool);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  // ROUTE 1: ADMIN PANEL
  if (currentPage === 'admin') {
    if (adminUser) {
      return (
        <AdminDashboard
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onBackToSite={() => navigateTo('home', '/')}
        />
      );
    }
    return (
      <AdminLogin
        onLoginSuccess={(user) => setAdminUser(user)}
        onBackToSite={() => navigateTo('home', '/')}
      />
    );
  }

  // ROUTE 2: DEDICATED COMPLETE VIDEO CATALOG
  if (currentPage === 'videos') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
        <Header
          onNavigate={scrollToSection}
          activeSection="videos"
          onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
        />
        <main className="flex-1">
          <CompleteVideoCatalog
            videos={catalogVideos}
            onSelectVideo={navigateToVideoDetail}
            onBackToHome={() => navigateTo('home', '/')}
          />
        </main>
        <Footer onNavigate={scrollToSection} />
        <CustomerAuthModal
          isOpen={customerAuthOpen}
          onClose={() => setCustomerAuthOpen(false)}
          onAdminNavigate={() => navigateTo('admin', '/admin')}
        />
      </div>
    );
  }

  // ROUTE 3: INDIVIDUAL VIDEO DETAIL PAGE
  if (currentPage === 'video-detail' && selectedDetailVideo) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
        <Header
          onNavigate={scrollToSection}
          activeSection="videos"
          onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
        />
        <main className="flex-1">
          <VideoDetailPage
            video={selectedDetailVideo}
            onBack={() => navigateTo('videos', '/videos')}
            onNavigateHome={() => navigateTo('home', '/')}
          />
        </main>
        <Footer onNavigate={scrollToSection} />
        <CustomerAuthModal
          isOpen={customerAuthOpen}
          onClose={() => setCustomerAuthOpen(false)}
          onAdminNavigate={() => navigateTo('admin', '/admin')}
        />
      </div>
    );
  }

  // ROUTE 4: STANDARD HOMEPAGE
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 2 & 3: Announcement Bar + Sticky Header + Tricolor Strip */}
      <Header
        onNavigate={scrollToSection}
        activeSection={activeSection}
        onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
      />

      <main className="flex-1">
        {/* 4, 5, 6: Large Hero Banner with Digital India Panorama, Central Bilingual Branding, Search & Action Buttons */}
        <Hero
          onSearch={handleHeroSearch}
          onExploreTools={() => scrollToSection('all-tools')}
          onExploreSchemes={() => scrollToSection('schemes')}
          onSelectTool={handleOpenTool}
          onSelectService={handleSelectServiceFromSearch}
          onSelectScheme={handleSelectSchemeFromSearch}
          onSelectVideo={handleSelectVideoFromSearch}
        />

        {/* 7: Quick Category Strip (8 Items with English & Hindi labels and colorful rounded icons) */}
        <QuickCategoryStrip onSelectCategory={handleCategoryShortcut} />

        {/* 8: Dark Navy Social Media Strip with Verified Links and WhatsApp CTA */}
        <SocialStrip />

        {/* 1. Browse by Government Category: 5 Premium Coordinated Category Cards */}
        <CategoryNavigationSection
          onOpenAllTools={() => {
            setDirectoryCategory('all');
            setSearchQuery('');
            scrollToSection('all-tools');
          }}
          onScrollToTop={() => scrollToSection('home')}
        />

        {/* 2. Video Learning Center (Placed immediately below CategoryNavigationSection and immediately above Future Tools) */}
        <VideoLearningCenter
          videos={catalogVideos}
          onOpenCatalog={() => navigateTo('videos', '/videos')}
          onSelectVideo={navigateToVideoDetail}
        />

        {/* 3. Future Tools (Featured Tools: Exactly 6 tools in one desktop row) */}
        <FeaturedTools onOpenTool={handleOpenTool} />

        {/* Membership plans preview, isolated below Featured Tools */}
        <MembershipPlansSection />

        {/* All Tools Directory: Searchable, Filterable 18 confirmed tools */}
        <AllToolsDirectory
          onOpenTool={handleOpenTool}
          initialSearchQuery={searchQuery}
          initialCategory={directoryCategory}
        />

        {/* Government Services Directory */}
        <GovernmentServices selectedServiceId={selectedServiceId} />

        {/* Government Schemes Directory */}
        <GovernmentSchemes
          selectedSchemeModal={selectedScheme}
          onCloseModal={() => setSelectedScheme(null)}
        />

        {/* Latest Videos & Tutorials Hub */}
        <LatestVideos
          selectedVideoModal={selectedVideo}
          onCloseModal={() => setSelectedVideo(null)}
        />

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

      {/* Customer Access / Login Modal */}
      <CustomerAuthModal
        isOpen={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        onAdminNavigate={() => navigateTo('admin', '/admin')}
      />
    </div>
  );
}
