import React from 'react';
import { X, Play, Clock, FileCheck, ListOrdered, Users, BookOpen, ExternalLink } from 'lucide-react';
import { VideoGuide } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  video: VideoGuide | null;
  onClose: () => void;
  onWatchVideo: (video: VideoGuide) => void;
}

export const FreeGuideDetailsModal: React.FC<Props> = ({ video, onClose, onWatchVideo }) => {
  const { language, isHindi } = useLanguage();

  if (!video) return null;

  const displayTitle = isHindi && video.hindiTitle ? video.hindiTitle : video.title;
  const displayDescription = isHindi && video.hindiDescription ? video.hindiDescription : video.description;
  const displayDocs = isHindi && video.hindiRequiredDocuments ? video.hindiRequiredDocuments : video.requiredDocuments;
  const displaySteps = isHindi && video.hindiStepsSummary ? video.hindiStepsSummary : video.stepsSummary;
  const displayAudience = isHindi && video.hindiTargetAudience ? video.hindiTargetAudience : video.targetAudience;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-guide-title"
      >
        {/* Modal Header Bar */}
        <div className="bg-[#0A1324] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
              FREE GUIDE · 100% निशुल्क
            </span>
            <div className="flex items-center gap-1 text-slate-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{video.duration}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left">
          {/* Title & Instructor */}
          <div>
            <div className="text-xs font-semibold text-blue-700 mb-1">
              {video.category} · {video.instructor}
            </div>
            <h3 id="free-guide-title" className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight">
              {displayTitle}
            </h3>
          </div>

          {/* Section 1: What the Video Teaches */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>{isHindi ? 'यह वीडियो क्या सिखाता है?' : 'What this Video Teaches'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {displayDescription}
            </p>
          </div>

          {/* Section 2: Important Topics Covered */}
          {video.topics && video.topics.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span>{isHindi ? 'मुख्य विषय व अध्याय' : 'Important Topics Covered'}</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {video.topics.map((topic, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Required Documents (if applicable) */}
          {displayDocs && displayDocs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'आवश्यक दस्तावेज़ / सामग्री' : 'Required Documents & Materials'}</span>
              </h4>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:p-4 space-y-1.5">
                {displayDocs.map((doc, idx) => (
                  <div key={idx} className="text-xs text-emerald-950 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Step-by-Step Process Summary */}
          {displaySteps && displaySteps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span>{isHindi ? 'चरणबद्ध प्रक्रिया सारांश' : 'Step-by-Step Process Summary'}</span>
              </h4>
              <div className="space-y-2">
                {displaySteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed mt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Who Should Watch */}
          {displayAudience && (
            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950">
                <strong className="font-bold">
                  {isHindi ? 'यह वीडियो किसके लिए उपयोगी है:' : 'Who should watch this video:'}
                </strong>{' '}
                <span className="font-medium">{displayAudience}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onWatchVideo(video);
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isHindi ? 'निशुल्क वीडियो देखें (Watch Now)' : 'Watch Video Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
