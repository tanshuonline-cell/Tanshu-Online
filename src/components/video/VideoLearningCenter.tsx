import React from 'react';
import { Lock, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import { VideoGuide } from '../../types';
import { LATEST_VIDEOS } from '../../data/videosData';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onOpenCatalog: () => void;
  onSelectVideo: (video: VideoGuide) => void;
  videos?: VideoGuide[];
}

export const VideoLearningCenter: React.FC<Props> = ({
  onOpenCatalog,
  onSelectVideo,
  videos = LATEST_VIDEOS,
}) => {
  const { t, isHindi } = useLanguage();
  // Public learning center intentionally displays paid videos only. Free guides remain stored for admin/future use.
  const displayedVideos = videos.filter(
    (video) => video.isActive !== false && (video.isPremium || video.accessType === 'premium')
  );

  return (
    <section id="video-learning-center" className="py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('vlc.kicker', 'Practical Training & CSC Masterclasses')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('vlc.title', 'Video Learning Center')}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 hidden md:block max-w-sm">
              {t(
                'vlc.desc',
                'Step-by-step video masterclasses and quick guides for daily cyber cafe operations and government portals.'
              )}
            </p>
            <button
              onClick={onOpenCatalog}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <span>{t('vlc.viewAll', 'View All Videos')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Public catalog shows paid videos only. */}
        {/* Responsive Grid: 4 cards on desktop (lg:grid-cols-4), 3 on tablet (md:grid-cols-3), 2 on mobile (grid-cols-2) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedVideos.map((video) => {
            const price = video.price || 99;
            const displayTitle = isHindi && video.hindiTitle ? video.hindiTitle : video.title;

            return (
              <div
                key={video.id}
                className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Compact Thumbnail Container (No preview playback before payment) */}
                <div
                  onClick={() => onSelectVideo(video)}
                  className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={
                      video.thumbnailUrl ||
                      `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=80`
                    }
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20" />

                  {/* Duration Badge (Bottom Right) */}
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono font-medium text-white flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-300" />
                    <span>{video.duration}</span>
                  </div>

                  {/* Premium Badge (Top Left) */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <div className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Lock className="w-2.5 h-2.5" />
                      <span>PREMIUM • ₹{price}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
                      <span className="truncate">{video.instructor}</span>
                      {video.isSample && (
                        <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0.2 rounded font-mono font-semibold">
                          COMING SOON
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectVideo(video)}
                      className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug cursor-pointer"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Paid video action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col items-center gap-1.5">
                      <div className="flex items-center justify-between w-full text-xs px-0.5">
                        <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">₹{price} INR</span>
                        <span className="text-[10px] font-semibold text-slate-500">{video.level || 'Intermediate'}</span>
                      </div>
                      <button type="button" onClick={() => onSelectVideo(video)} className="w-full max-w-[170px] py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        <Lock className="w-3 h-3 text-amber-300" />
                        <span>{isHindi ? 'विवरण / खरीदें' : 'Buy Now / Details'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All CTA */}
        <div className="mt-4 text-center sm:hidden">
          <button
            onClick={onOpenCatalog}
            className="w-full py-2 bg-white border border-slate-300 text-xs font-bold text-blue-700 rounded-lg shadow-2xs flex items-center justify-center gap-1 hover:bg-slate-50 transition-colors"
          >
            <span>{isHindi ? 'सभी वीडियो देखें' : 'View All Videos'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </section>
  );
};
