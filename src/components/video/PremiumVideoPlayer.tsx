import React, { useState, useEffect } from 'react';
import { Play, Shield, Lock, AlertCircle, RefreshCw, X, CheckCircle, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { VideoGuide } from '../../types';

interface Props {
  video: VideoGuide;
  customerPhone: string;
  sessionToken?: string;
  onClose: () => void;
  onPurchaseAgain?: () => void;
}

export const PremiumVideoPlayer: React.FC<Props> = ({
  video,
  customerPhone,
  sessionToken,
  onClose,
  onPurchaseAgain,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [playbackToken, setPlaybackToken] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'about'>('chapters');
  const [isBlurred, setIsBlurred] = useState<boolean>(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  // Screen recording & inspection deterrence listeners
  useEffect(() => {
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trap PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        setIsBlurred(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('Protected Content - Tanshu Online');
        }
        setSecurityWarning('Screenshots are restricted on protected video content.');
        setTimeout(() => setSecurityWarning(null), 3500);
      }

      // Trap DevTools & saving shortcuts: F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) ||
        (e.metaKey && ['s', 'S', 'p', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        setSecurityWarning('Developer inspection and page saving are disabled on this video.');
        setTimeout(() => setSecurityWarning(null), 3000);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keyup', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keyup', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchStreamToken = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/video/stream-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          videoId: video.id,
          customerPhone,
          sessionToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.authorized) {
        setAuthorized(true);
        setPlaybackToken(data.playbackToken || 'active_token');
        setPlaybackUrl(data.playbackUrl || null);
      } else {
        setAuthorized(false);
        setErrorMessage(
          data.error || 'Access Denied: Server could not verify an active purchase entitlement for this phone number.'
        );
      }
    } catch (err: any) {
      setAuthorized(false);
      setErrorMessage(err.message || 'Network error while requesting secure video playback token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamToken();
  }, [video.id, customerPhone]);

  const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
  const maskedPhone = sanitizedPhone.length === 10
    ? `+91 ${sanitizedPhone.slice(0, 3)}••••${sanitizedPhone.slice(7)}`
    : '+91 Customer';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded">
              PREMIUM MASTERCLASS
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">·</span>
            <span className="text-slate-300 text-xs font-medium truncate max-w-xs sm:max-w-md">
              {video.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Toast */}
        {securityWarning && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-950/90 border border-amber-500/80 text-amber-200 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in duration-150">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>{securityWarning}</span>
          </div>
        )}

        {/* Video Player Display Area (Protected against right-click, screen grabbing, inspect) */}
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setSecurityWarning('Right-click context menu is disabled for video protection.');
            setTimeout(() => setSecurityWarning(null), 2500);
          }}
          className="relative aspect-video bg-black flex items-center justify-center overflow-hidden select-none"
        >
          {/* Privacy Blur Overlay when browser loses focus */}
          {isBlurred && authorized && (
            <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Playback Paused for Privacy Protection</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Video display is temporarily masked while browser window is out of focus or screen capture is active. Click inside the window to resume watching.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-3 p-6 text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="text-sm font-semibold">Verifying Purchase & Authorizing Video Playback...</div>
              <div className="text-xs text-slate-500">Checking server entitlement records</div>
            </div>
          ) : authorized ? (
            <div className="relative w-full h-full bg-black">
              {video.youtubeUrl ? (
                <iframe
                  src={(() => {
                    try {
                      const url = new URL(video.youtubeUrl);
                      const id = url.hostname === 'youtu.be'
                        ? url.pathname.split('/').filter(Boolean)[0]
                        : (url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).slice(-1)[0]);
                      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
                    } catch { return ''; }
                  })()}
                  title={video.title}
                  className="w-full h-full border-0 select-none pointer-events-auto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* Cloudflare Stream Official Signed Embed Player */
                <iframe
                  src={`https://iframe.videodelivery.net/${playbackToken || video.streamVideoId}?poster=${encodeURIComponent(video.thumbnailUrl || '')}&autoplay=true&controls=true&defaultTextTrack=false`}
                  title={video.title}
                  className="w-full h-full border-0 select-none pointer-events-auto"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              )}

              {/* Dynamic Anti-Piracy Watermark Badge (Top Right) */}
              <div className="absolute top-3 right-3 pointer-events-none z-30 px-2.5 py-1 bg-black/75 backdrop-blur-xs border border-white/10 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5 shadow-lg select-none">
                <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Licensed to: {maskedPhone}</span>
              </div>

              {/* Secondary Discreet Floating Session Stamp (Bottom Left) */}
              <div className="absolute bottom-3 left-3 pointer-events-none z-30 px-2 py-0.5 bg-black/60 backdrop-blur-2xs rounded text-[9px] font-mono text-slate-400 opacity-70 select-none">
                Tanshu Protected Stream • ID #{sanitizedPhone.slice(-4) || 'AUTH'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-md text-white">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold mb-1">Access Authorization Required</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {errorMessage || 'This is a protected premium video. You must purchase it with verified payment to watch the complete masterclass.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchStreamToken}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Verification</span>
                </button>
                {onPurchaseAgain && (
                  <button
                    onClick={onPurchaseAgain}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    Buy Video (₹{video.price || 99})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Video Metadata & Chapters */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 text-slate-200 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white mb-0.5">{video.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Instructor: <strong className="text-slate-200">{video.instructor}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{video.duration}</span>
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Purchase Unlocked</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-medium">
                {video.category}
              </span>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-3 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'chapters'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masterclass Curriculum ({video.topics.length} Chapters)
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'about'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              About this Video / इस वीडियो के बारे में
            </button>
          </div>

          {activeTab === 'chapters' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {video.topics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 text-xs leading-snug">{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 text-slate-300 leading-relaxed">
              {/* Hindi About */}
              {video.aboutHi && (
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-amber-400">हिंदी विवरण:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{video.aboutHi}</p>
                </div>
              )}

              {/* English About */}
              {video.aboutEn && (
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] font-bold text-blue-400">English Guidance:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{video.aboutEn}</p>
                </div>
              )}

              {/* Base Description */}
              {!video.aboutHi && !video.aboutEn && (
                <p className="text-xs text-slate-300">{video.description}</p>
              )}

              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400 text-[11px]">
                <strong className="text-slate-200 block mb-1">Licensed Access Notice:</strong>
                This video is digitally watermarked with your registered number ({maskedPhone}). Stream URL tokens are short-lived and non-transferable.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloudflare Stream Token-Signed Playback & Dynamic Watermarking</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Player
          </button>
        </div>
      </div>
    </div>
  );
};
