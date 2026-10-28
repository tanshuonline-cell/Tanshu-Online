import React, { useState } from 'react';
import { Play, Clock, Video, BookOpen, X, Check } from 'lucide-react';
import { LATEST_VIDEOS } from '../data/videosData';
import { VideoGuide } from '../types';

export const LatestVideos: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoGuide | null>(null);

  return (
    <section id="videos" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              Practical Video Tutorials & Masterclasses
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest Videos & Guides
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            Master photo paper printing, PVC card printer tray calibrations, exam form dimension adjustments, and cyber cafe customer management.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LATEST_VIDEOS.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Video Mock Thumbnail / Player Banner */}
                <div
                  onClick={() => setActiveVideo(video)}
                  className="relative aspect-video bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  {/* Subtle gradient pattern */}
                  <div className="absolute inset-0 bg-linear-to-br from-blue-950 via-slate-900 to-slate-950 opacity-90 group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Center Play Button */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:bg-blue-500 group-hover:scale-110 transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 bg-black/75 rounded text-[11px] font-mono font-medium text-white flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{video.duration}</span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-blue-950/80 border border-blue-800/60 rounded text-[10px] font-medium text-blue-200">
                    {video.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[11px] font-medium text-slate-500 mb-1">
                    By {video.instructor}
                  </div>

                  <h3
                    onClick={() => setActiveVideo(video)}
                    className="text-sm font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-2"
                  >
                    {video.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {video.description}
                  </p>

                  {/* Topics Pills (Zero-Pill discipline: unboxed text with bullets) */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {video.topics.slice(0, 2).map((top, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span className="truncate">{top}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-0">
                <button
                  onClick={() => setActiveVideo(video)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Tutorial</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Video Player & Notes Modal */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Top Header */}
              <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700">{activeVideo.category}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">{activeVideo.duration}</span>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Simulator */}
              <div className="aspect-video bg-black flex flex-col items-center justify-center text-white relative p-6">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg mb-4 animate-pulse">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                <h4 className="text-base font-bold text-center max-w-lg mb-1">{activeVideo.title}</h4>
                <p className="text-xs text-slate-400 text-center">Interactive Tutorial Streaming Stream (1080p HD)</p>

                {/* Progress bar */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-slate-800">
                  <div className="h-full bg-blue-500 w-1/3" />
                </div>
              </div>

              {/* Notes & Transcript */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm mb-1">Guide Synopsis</h5>
                  <p className="leading-relaxed text-slate-600">{activeVideo.description}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px] text-blue-900">
                    Step-by-Step Chapters Covered
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeVideo.topics.map((t, idx) => (
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
                  onClick={() => setActiveVideo(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
