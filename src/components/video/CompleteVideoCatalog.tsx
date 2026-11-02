import React, { useState } from 'react';
import { Search, ArrowLeft, Play, Lock, Clock, Sparkles, Filter, X } from 'lucide-react';
import { VideoGuide } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  videos?: VideoGuide[];
  onSelectVideo: (video: VideoGuide) => void;
  onBackToHome: () => void;
}

export const CompleteVideoCatalog: React.FC<Props> = ({
  videos = [],
  onSelectVideo,
  onBackToHome,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all');

  // Customer filter: do not show inactive videos
  const activeVideos = videos.filter((v) => v.isActive !== false);

  const filteredVideos = activeVideos.filter((video) => {
    const isPremium = video.isPremium || video.accessType === 'premium';
    if (filterType === 'free' && isPremium) return false;
    if (filterType === 'premium' && !isPremium) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = video.description.toLowerCase().includes(q);
      const matchInstructor = video.instructor.toLowerCase().includes(q);
      const matchCategory = video.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchInstructor || matchCategory;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Tanshu Online Learning
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Complete Video Learning Catalog
              </h1>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorial by title..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filter By:</span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({activeVideos.length})
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  filterType === 'free'
                    ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free Tutorials ({activeVideos.filter((v) => !v.isPremium).length})
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'premium'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-2xs'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Premium Masterclasses ({activeVideos.filter((v) => v.isPremium).length})</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredVideos.length} of {activeVideos.length} video tutorials
          </div>
        </div>

        {/* Video Catalog Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map((video) => {
              const isPremium = video.isPremium || video.accessType === 'premium';
              const price = video.price || 99;

              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={
                        video.thumbnailUrl ||
                        `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&q=80`
                      }
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-300" />
                      <span>{video.duration}</span>
                    </div>

                    {/* Price / Type Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                      {isPremium ? (
                        <div className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                          <Lock className="w-2.5 h-2.5" />
                          <span>PREMIUM • ₹{price}</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold shadow-2xs">
                          FREE
                        </div>
                      )}
                      {video.isSample && (
                        <div className="px-1.5 py-0.5 bg-slate-900/90 text-slate-200 rounded text-[8px] font-mono font-bold">
                          SAMPLE
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span className="truncate">{video.instructor}</span>
                        <span className="text-slate-400 font-mono text-[9px]">{video.category}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug mb-2">
                        {video.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      {isPremium ? (
                        <>
                          <div className="text-xs font-extrabold text-amber-700">₹{price} INR</div>
                          <span className="text-[11px] font-bold text-blue-700 group-hover:underline">
                            Unlock Masterclass
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="text-[11px] font-bold text-emerald-700">Free Tutorial</div>
                          <span className="text-[11px] font-bold text-blue-700 group-hover:underline flex items-center gap-1">
                            Watch Free <Play className="w-2.5 h-2.5 fill-current" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <div className="text-slate-400 font-bold text-sm mb-1">No videos found</div>
            <p className="text-xs text-slate-500">
              No active tutorials matched your search criteria "{searchQuery}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
