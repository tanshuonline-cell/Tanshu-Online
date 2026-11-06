import React, { useState, useEffect } from 'react';
import { Play, Clock, Video, BookOpen, X, Check, Lock, Shield, Sparkles, CheckCircle, Smartphone } from 'lucide-react';
import { LATEST_VIDEOS } from '../data/videosData';
import { VideoGuide } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CashfreeCheckoutModal } from './video/CashfreeCheckoutModal';
import { PremiumVideoPlayer } from './video/PremiumVideoPlayer';

interface Props {
  selectedVideoModal?: VideoGuide | null;
  onCloseModal?: () => void;
}

interface PurchasedRecord {
  phone: string;
  sessionToken?: string;
  unlockedAt: string;
}

export const LatestVideos: React.FC<Props> = ({ selectedVideoModal, onCloseModal }) => {
  const { t, isHindi } = useLanguage();

  // Video playback & modal states
  const [activeFreeVideo, setActiveFreeVideo] = useState<VideoGuide | null>(null);
  const [activePremiumVideo, setActivePremiumVideo] = useState<VideoGuide | null>(null);
  const [checkoutVideo, setCheckoutVideo] = useState<VideoGuide | null>(null);

  // Multi-video customer purchase registry (maps videoId -> PurchasedRecord)
  const [purchasedVideos, setPurchasedVideos] = useState<Record<string, PurchasedRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tanshu_purchased_videos_v1');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // Persist purchased videos registry in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tanshu_purchased_videos_v1', JSON.stringify(purchasedVideos));
    } catch (e) {
      console.warn('Could not save purchased videos to storage', e);
    }
  }, [purchasedVideos]);

  // Handle external selection from search or category clicks
  useEffect(() => {
    if (selectedVideoModal) {
      handleVideoClick(selectedVideoModal);
      const element = document.getElementById(`video-${selectedVideoModal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedVideoModal]);

  // Handle video card click
  const handleVideoClick = (video: VideoGuide) => {
    if (video.isPremium || video.accessType === 'premium') {
      // Check if this particular video has been purchased
      const existingPurchase = purchasedVideos[video.id];
      if (existingPurchase) {
        setActivePremiumVideo(video);
      } else {
        // Unpurchased: Open Cashfree checkout / unlock modal
        setCheckoutVideo(video);
      }
    } else {
      // Free YouTube / Portal Tutorial
      setActiveFreeVideo(video);
    }
  };

  // Called when payment verification succeeds for a specific video
  const handlePaymentSuccess = (videoId: string, phone: string, sessionToken?: string) => {
    const newRecord: PurchasedRecord = {
      phone,
      sessionToken,
      unlockedAt: new Date().toISOString(),
    };

    setPurchasedVideos((prev) => ({
      ...prev,
      [videoId]: newRecord,
    }));

    setCheckoutVideo(null);

    // Automatically open the verified player for this video
    const video = LATEST_VIDEOS.find((v) => v.id === videoId);
    if (video) {
      setActivePremiumVideo(video);
    }
  };

  const handleCloseFreeModal = () => {
    setActiveFreeVideo(null);
    if (onCloseModal) onCloseModal();
  };

  const handleClosePremiumModal = () => {
    setActivePremiumVideo(null);
    if (onCloseModal) onCloseModal();
  };

  // Public Latest Videos section displays only active paid masterclasses; free guides remain stored but hidden.
  const displayedVideos = LATEST_VIDEOS.filter(
    (video) => video.isActive !== false && (video.isPremium || video.accessType === 'premium')
  );

  return (
    <section id="videos" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#C62828] mb-1 flex items-center gap-1.5">
              <span>{t('videos.kicker', 'Practical Video Tutorials & Masterclasses')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              <span className="text-amber-600 font-bold">{isHindi ? 'Cloudflare Stream सुरक्षित वीडियो प्लेबैक • डायनामिक वॉटरमार्क' : 'Cloudflare Stream Token-Signed Playback & Dynamic Watermarking'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#C62828] tracking-tight">
              {t('videos.title', 'Latest Videos & Masterclasses')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
            {t(
              'videos.desc',
              'Master cyber cafe operations, PVC card tray calibrations, exam form dimension adjustments, and specialized high-earning CSC masterclasses.'
            )}
          </p>
        </div>

        {/* Premium-only catalog summary; free guides are hidden from the public section. */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? `प्रीमियम मास्टरक्लास (${displayedVideos.length})` : `Premium Masterclasses (${displayedVideos.length})`}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('video.paymentSecurity', 'Secure UPI & card payments • Protected video access')}</span>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5">
          {displayedVideos.map((video) => {
            const isPremium = Boolean(video.isPremium || video.accessType === 'premium');
            const isPurchased = Boolean(purchasedVideos[video.id]);
            const price = video.price || 99;
            const displayTitle = isHindi && video.hindiTitle ? video.hindiTitle : video.title;
            const displayDescription = isHindi && video.hindiDescription ? video.hindiDescription : video.description;
            const displayCategory = isHindi ? 'वीडियो गाइड' : video.category;

            return (
              <div
                key={video.id}
                id={`video-${video.id}`}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 ease-out flex flex-col justify-between group select-none ${
                  isPurchased
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : isPremium
                    ? 'border-amber-200/90 hover:border-amber-400'
                    : 'border-slate-200/90 hover:border-blue-400'
                }`}
              >
                <div>
                  {/* Video Thumbnail Area — Strictly Thumbnail Only, NO preview playback */}
                  <div
                    onClick={() => handleVideoClick(video)}
                    className="relative aspect-video bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden group/thumb"
                  >
                    {/* Background Pattern / Gradient */}
                    <div
                      className={`absolute inset-0 opacity-90 group-hover/thumb:scale-105 transition-transform duration-500 ${
                        isPurchased
                          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950'
                          : isPremium
                          ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950'
                          : 'bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950'
                      }`}
                    />

                    {/* Center Icon */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/thumb:scale-110 ${
                        isPurchased
                          ? 'bg-emerald-600 text-white'
                          : isPremium
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isPurchased ? (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      ) : isPremium ? (
                        <Lock className="w-5 h-5 text-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 bg-black/85 backdrop-blur-xs rounded text-[10px] font-mono font-medium text-white flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-300" />
                      <span>{video.duration}</span>
                    </div>

                    {/* Access / Price Badge (Top Left) */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                      {isPurchased ? (
                        <div className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          <span>{t('video.purchased', 'PURCHASED')}</span>
                        </div>
                      ) : isPremium ? (
                        <div className="flex items-center gap-1">
                          <div className="px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Lock className="w-2.5 h-2.5 text-slate-950" />
                            <span>{isHindi ? 'प्रीमियम' : 'PREMIUM'} • ₹{price}</span>
                          </div>
                          {video.isSample && (
                            <div className="px-1.5 py-0.5 bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 rounded text-[9px] font-bold tracking-wider">
                              {isHindi ? 'नमूना' : 'SAMPLE'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-slate-900/90 text-emerald-400 border border-slate-700/60 rounded text-[10px] font-bold">
                          {isHindi ? 'मुफ़्त' : 'FREE'}
                        </div>
                      )}
                    </div>

                    {/* Category (Top Right) */}
                    <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 bg-slate-950/80 border border-slate-700/60 rounded text-[9px] font-bold text-slate-300">
                      {displayCategory}
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>{isHindi ? 'प्रशिक्षक:' : 'By'} {video.instructor}</span>
                      {video.level && (
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {isHindi ? (video.level === 'Beginner' ? 'शुरुआती' : video.level === 'Advanced' ? 'उन्नत' : 'मध्यम') : video.level}
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => handleVideoClick(video)}
                      className="text-sm sm:text-base font-extrabold tracking-tight mb-2 transition-colors cursor-pointer line-clamp-2 leading-snug ${isHindi ? 'text-slate-900 hover:text-[#C62828]' : 'text-[#C62828] hover:text-[#A61F2A]'}"
                    >
                      {displayTitle}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {displayDescription}
                    </p>

                    {/* Key Chapters / Topics Covered */}
                    <div className="pt-2.5 border-t border-slate-100 mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        {isHindi ? 'मुख्य पाठ्यक्रम के अध्याय:' : 'Key Curriculum Chapters:'}
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {(isHindi && video.hindiTopics ? video.hindiTopics : video.topics).slice(0, 3).map((topic, idx) => (
                          <li key={idx} className="flex items-center gap-2 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isPurchased
                                  ? 'bg-emerald-600'
                                  : isPremium
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                            />
                            <span className="truncate">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 sm:p-5 pt-0">
                  {isPurchased ? (
                    <button
                      onClick={() => handleVideoClick(video)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('video.watchUnlocked', 'Watch Purchased Masterclass')}</span>
                    </button>
                  ) : isPremium ? (
                    <button
                      onClick={() => handleVideoClick(video)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('video.unlock', 'Unlock Masterclass')} • ₹{price}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVideoClick(video)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('video.watchFree', 'Watch Free Tutorial')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Video Player & Synopsis Modal */}
        {activeFreeVideo && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Top Header */}
              <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                    {isHindi ? 'मुफ़्त ट्यूटोरियल' : 'FREE TUTORIAL'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-blue-700">{isHindi ? 'वीडियो गाइड' : activeFreeVideo.category}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">{activeFreeVideo.duration}</span>
                </div>
                <button
                  onClick={handleCloseFreeModal}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Video Streaming Player */}
              <div className="aspect-video bg-black flex flex-col items-center justify-center text-white relative p-6">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg mb-4 animate-pulse">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                <h4 className="text-base font-bold text-center max-w-lg mb-1">{isHindi && activeFreeVideo.hindiTitle ? activeFreeVideo.hindiTitle : activeFreeVideo.title}</h4>
                <p className="text-xs text-slate-400 text-center">{t('video.freeStream', 'Free High-Definition Tutorial Stream (1080p)')}</p>

                {/* Progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-800">
                  <div className="h-full bg-blue-500 w-1/3" />
                </div>
              </div>

              {/* Notes & Transcript */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">{t('video.synopsis', 'Tutorial Summary')}</h5>
                  <p className="leading-relaxed text-slate-600">{isHindi && activeFreeVideo.hindiDescription ? activeFreeVideo.hindiDescription : activeFreeVideo.description}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                    {isHindi ? 'चरण-दर-चरण शामिल विषय' : 'Step-by-Step Chapters Covered'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(isHindi && activeFreeVideo.hindiTopics ? activeFreeVideo.hindiTopics : activeFreeVideo.topics).map((t, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-mono text-blue-700 font-bold">0{idx + 1}.</span>
                        <span className="text-slate-700">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleCloseFreeModal}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isHindi ? 'प्लेयर बंद करें' : 'Close Player'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cashfree Checkout & Unlock Modal */}
        {checkoutVideo && (
          <CashfreeCheckoutModal
            video={checkoutVideo}
            onClose={() => setCheckoutVideo(null)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Premium Cloudflare Stream Verified Video Player */}
        {activePremiumVideo && (
          <PremiumVideoPlayer
            video={activePremiumVideo}
            customerPhone={purchasedVideos[activePremiumVideo.id]?.phone || ''}
            sessionToken={purchasedVideos[activePremiumVideo.id]?.sessionToken}
            onClose={handleClosePremiumModal}
            onPurchaseAgain={() => {
              setActivePremiumVideo(null);
              setCheckoutVideo(activePremiumVideo);
            }}
          />
        )}
      </div>
    </section>
  );
};
