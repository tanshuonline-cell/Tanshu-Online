import React, { useState, useEffect } from 'react';
import { Header, TANSHU_PROFILE_PHOTO } from './components/Header';
import { Hero } from './components/Hero';
import { QuickCategoryStrip } from './components/QuickCategoryStrip';
import { SocialStrip } from './components/SocialStrip';
import { FeaturedTools } from './components/FeaturedTools';
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
import DigitalSevaPage from './features/digital-seva/DigitalSevaPage';
import DigitalSevaAdminPage from './features/digital-seva/DigitalSevaAdminPage';
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
  const [adminCopyAllowed, setAdminCopyAllowed] = useState(false);
  const [paymentReturnNotice, setPaymentReturnNotice] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);

  // Confirm the HttpOnly admin session with the server before allowing copy access.
  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth/check', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setAdminCopyAllowed(Boolean(data?.authenticated && data?.user?.role));
      })
      .catch(() => {
        if (active) setAdminCopyAllowed(false);
      });
    return () => { active = false; };
  }, []);

  // Deter ordinary copy attempts while preserving text selection and tool workspaces.
  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      if (adminCopyAllowed) return;
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      const element = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      if (element?.closest('input, textarea, select, [contenteditable="true"], [data-copy-allowed], pre, code')) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], [data-copy-allowed], pre, code')) return;
      event.preventDefault();
    };
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [adminCopyAllowed]);
  const [catalogVideos, setCatalogVideos] = useState<VideoGuide[]>(LATEST_VIDEOS);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  
  // Keep browser metadata aligned with the actual public route.
  useEffect(() => {
    const siteUrl = 'https://tanshu-online.pages.dev';
    const pathname = window.location.pathname;
    const isVideoCatalog = pathname === '/videos';
    const isVideoDetail = pathname.startsWith('/video/');
    const isDigitalSevaAdmin = pathname === '/digital-seva-admin';
    const isDigitalSeva = pathname === '/digital-seva' || isDigitalSevaAdmin;
    const video = isVideoDetail
      ? (catalogVideos.find((item) => item.id === pathname.replace('/video/', '')) ||
         LATEST_VIDEOS.find((item) => item.id === pathname.replace('/video/', '')))
      : null;

    const title = isDigitalSeva
      ? 'Digital Seva Center | TANSHU ONLINE'
      : isVideoCatalog
        ? 'Video Learning Center | TANSHU ONLINE'
        : video
          ? `${video.title} | TANSHU ONLINE`
          : 'TANSHU ONLINE | Online Tools, Government Services & Video Guides';
    const description = isDigitalSeva
      ? 'TANSHU ONLINE Digital Seva Center: explore government service assistance, document services and PDF tools.'
      : isVideoCatalog
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
    setMeta('meta[name="robots"]', 'name', 'robots', isDigitalSevaAdmin ? 'noindex, nofollow' : 'index, follow');
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
        // Public video detail routes are restricted to active paid masterclasses.
        const isPaidActive = (video: VideoGuide) =>
          video.isActive !== false && (video.isPremium || video.accessType === 'premium');
        const found = catalogVideos.find((v) => v.id === id && isPaidActive(v)) ||
          LATEST_VIDEOS.find((v) => v.id === id && isPaidActive(v));
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

  // Verify Cashfree's return URL from the server-created order record.
  // Never trust query-string payment status, customer phone, or video ID as proof of payment.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    if (!orderId) return;

    let active = true;
    const videoIdFromUrl = params.get('video_id') || '';

    fetch('/api/video/verify-payment', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success || !data.isPaid) {
          throw Object.assign(new Error(data.message || data.error || 'Payment is not confirmed yet.'), { paymentData: data });
        }
        return data;
      })
      .then((data) => {
        if (!active) return;
        const resolvedVideoId = String(data.videoId || videoIdFromUrl);
        const video = catalogVideos.find((item) => item.id === resolvedVideoId) || LATEST_VIDEOS.find((item) => item.id === resolvedVideoId);
        if (!video || !data.customerPhone || !data.sessionToken) {
          throw new Error('Payment was confirmed, but this video session could not be opened. Please contact support with your order reference.');
        }

        try {
          const existing = JSON.parse(localStorage.getItem('tanshu_purchased_videos_v1') || '{}');
          existing[video.id] = {
            phone: data.customerPhone,
            sessionToken: data.sessionToken,
            unlockedAt: new Date().toISOString(),
          };
          localStorage.setItem('tanshu_purchased_videos_v1', JSON.stringify(existing));
        } catch {
          // The secure HttpOnly cookie remains available if local storage is disabled.
        }

        setPaymentReturnNotice({
          type: 'success',
          message: 'Payment verified successfully. Your video is unlocked. Select “Watch Masterclass” to start.',
        });
        setSelectedDetailVideo(video);
        setCurrentPage('video-detail');
        window.history.replaceState({}, '', `/video/${video.id}`);
      })
      .catch((error: any) => {
        if (!active) return;
        const data = error?.paymentData || {};
        const resolvedVideoId = String(data.videoId || videoIdFromUrl);
        const video = LATEST_VIDEOS.find((item) => item.id === resolvedVideoId);
        setPaymentReturnNotice({
          type: 'warning',
          message: data.orderStatus
            ? `Payment status: ${data.orderStatus}. Your video will remain locked until Cashfree confirms payment. If money was deducted, please do not pay again; contact support with your order reference.`
            : (error?.message || 'We could not confirm this payment yet. If money was deducted, please do not pay again; contact support with your order reference.'),
        });
        if (video) {
          setSelectedDetailVideo(video);
          setCurrentPage('video-detail');
          window.history.replaceState({}, '', `/video/${video.id}?order_id=${encodeURIComponent(orderId)}&video_id=${encodeURIComponent(video.id)}`);
        } else {
          setCurrentPage('videos');
          window.history.replaceState({}, '', `/videos?order_id=${encodeURIComponent(orderId)}&video_id=${encodeURIComponent(resolvedVideoId)}`);
        }
      });

    return () => { active = false; };
  }, []);

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
    if (tool.id === 'pvc-card-printer-studio') {
      window.location.href = '/id-pvc-studio/premium-desktop-preview.html';
      return;
    }
    setActiveTool(tool);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  // ISOLATED DIGITAL SEVA ADMIN — restored from the approved Digital Seva source branch.
  if (window.location.pathname === '/digital-seva-admin') {
    return <DigitalSevaAdminPage />;
  }

  // ISOLATED DIGITAL SEVA PAGE — keep its existing workflow and payment endpoints intact.
  if (window.location.pathname === '/digital-seva') {
    return <DigitalSevaPage />;
  }

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
            paymentReturnNotice={paymentReturnNotice}
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

        {/* Digital Seva entry card: placed between Government Category and Video Learning Center */}
        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8" aria-label="Digital Seva Center">
          <style>{`
            @property --digital-seva-angle {
              syntax: "<angle>";
              inherits: false;
              initial-value: 0deg;
            }
            @keyframes digital-seva-border-rotate {
              to { --digital-seva-angle: 360deg; }
            }
            .digital-seva-entry-card {
              position: relative;
              isolation: isolate;
              overflow: hidden;
              border: 1px solid #e5d5b5;
              box-shadow: 0 18px 34px -18px rgba(15,23,42,.34), 0 5px 12px rgba(167,124,52,.12);
              transition: box-shadow .25s ease, border-color .25s ease;
            }
            .digital-seva-entry-card::before {
              content: "";
              position: absolute;
              inset: 0;
              z-index: 0;
              padding: 2px;
              border-radius: inherit;
              background: conic-gradient(from var(--digital-seva-angle), transparent 0 62%, #c79a43 72%, #fff0b8 79%, #9c6b24 86%, transparent 96%);
              -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              pointer-events: none;
              animation: digital-seva-border-rotate 4.4s linear infinite;
            }
            .digital-seva-entry-card > div,
            .digital-seva-entry-card > span { position: relative; z-index: 1; }
            .digital-seva-entry-card:hover {
              border-color: #c79a43;
              box-shadow: 0 22px 40px -17px rgba(15,23,42,.38), 0 7px 18px rgba(167,124,52,.18);
            }
            @media (prefers-reduced-motion: reduce) {
              .digital-seva-entry-card::before { animation: none; }
              .digital-seva-entry-card { transition: none; }
            }
          `}</style>
          <a href="/digital-seva" className="digital-seva-entry-card group flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-rose-50 via-white to-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <img src={TANSHU_PROFILE_PHOTO} alt="TANSHU ONLINE" className="h-14 w-14 shrink-0 rounded-full border-2 border-amber-300 object-cover object-center shadow-md" />
              <div>
                <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest text-rose-800">Independent Digital Assistance</span>
                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Digital Seva Center</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">For eligible online government services and document-related work, contact us through this section. We assist with online processes only; biometric, face-scan and physical-centre services are not handled.</p>
                <p className="mt-1 text-sm font-medium text-slate-500">ऑनलाइन हो सकने वाली सरकारी सेवा या दस्तावेज़ संबंधी काम के लिए यहाँ अनुरोध करें। हम केवल ऑनलाइन प्रक्रिया में सहायता करते हैं; बायोमेट्रिक, फेस स्कैन या सेंटर पर जाकर होने वाले काम नहीं करते।</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-rose-900 px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-rose-800 sm:self-center">Explore Digital Seva <span aria-hidden="true">→</span></span>
          </a>
        </section>

        {/* 2. Video Learning Center (Placed immediately below CategoryNavigationSection and immediately above Future Tools) */}
        <VideoLearningCenter
          videos={catalogVideos}
          onOpenCatalog={() => navigateTo('videos', '/videos')}
          onSelectVideo={navigateToVideoDetail}
        />

        {/* 3. Future Tools (Featured Tools: Exactly 6 tools in one desktop row) */}
        <FeaturedTools onOpenTool={handleOpenTool} />

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
