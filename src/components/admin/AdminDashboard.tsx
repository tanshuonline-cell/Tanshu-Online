import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Video,
  PlusCircle,
  Users,
  LogOut,
  Sparkles,
  Shield,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  DollarSign,
  Save,
  X,
  Play,
  Lock,
  ArrowRight,
  Eye,
  BookOpen
} from 'lucide-react';
import { VideoGuide, AdminUser, CustomerPurchaseRecord } from '../../types';
import { LATEST_VIDEOS } from '../../data/videosData';

interface Props {
  adminUser: AdminUser;
  onLogout: () => void;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ adminUser, onLogout, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'add' | 'purchases'>('overview');
  const [videos, setVideos] = useState<VideoGuide[]>(LATEST_VIDEOS);
  const [purchases, setPurchases] = useState<CustomerPurchaseRecord[]>([]);
  const [grantPhone, setGrantPhone] = useState('');
  const [grantVideoId, setGrantVideoId] = useState('');
  const [grantNote, setGrantNote] = useState('');
  const [grantSubmitting, setGrantSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for Adding / Editing Videos
  const [editingVideo, setEditingVideo] = useState<VideoGuide | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formInstructor, setFormInstructor] = useState<string>('');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formDuration, setFormDuration] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('CSC & Banking Kiosk');
  const [formIsPremium, setFormIsPremium] = useState<boolean>(true);
  const [formPrice, setFormPrice] = useState<number>(99);
  const [formYoutubeUrl, setFormYoutubeUrl] = useState<string>('');
  const [formStreamVideoId, setFormStreamVideoId] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formTopics, setFormTopics] = useState<string>('');
  const [formAboutHi, setFormAboutHi] = useState<string>('');
  const [formAboutEn, setFormAboutEn] = useState<string>('');
  const [formLevel, setFormLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [formHindiTitle, setFormHindiTitle] = useState<string>('');
  const [formTargetAudience, setFormTargetAudience] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewTabLang, setPreviewTabLang] = useState<'hi' | 'en'>('hi');

  // Suggested pricing presets
  const pricingPresets = [
    { label: 'Basic Tutorial', amount: 49 },
    { label: 'Standard Tutorial', amount: 99 },
    { label: 'Advanced Tutorial', amount: 299 },
    { label: 'Complete Masterclass', amount: 399 },
  ];

  // Fetch videos from backend
  const fetchVideos = async () => {
    try {
      const resp = await fetch('/api/admin/videos', {
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      }
    } catch (e) {
      console.warn('Error fetching admin videos:', e);
    }
  };

  // Fetch purchases from backend
  const fetchPurchases = async () => {
    try {
      const resp = await fetch('/api/admin/purchases', {
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.purchases)) {
          setPurchases(data.purchases);
        }
      }
    } catch (e) {
      console.warn('Error fetching admin purchases:', e);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchPurchases();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormHindiTitle('');
    setFormDescription('');
    setFormAboutHi('');
    setFormAboutEn('');
    setFormLevel('Beginner');
    setFormTargetAudience('साइबर कैफ़े संचालक, CSC VLEs और सभी नागरिक');
    setFormInstructor('Tanshu Senior Trainer');
    setFormThumbnail('');
    setFormDuration('35:00');
    setFormCategory('CSC & Banking Kiosk');
    setFormIsPremium(true);
    setFormPrice(99);
    setFormYoutubeUrl('');
    setFormStreamVideoId('');
    setFormIsActive(true);
    setFormTopics('Portal registration\nDocument upload\nTroubleshooting errors');
    setActiveTab('add');
  };

  const handleOpenEditVideo = (video: VideoGuide) => {
    setEditingVideo(video);
    setFormTitle(video.title);
    setFormHindiTitle(video.hindiTitle || '');
    setFormDescription(video.description);
    setFormAboutHi(video.aboutHi || video.hindiDescription || '');
    setFormAboutEn(video.aboutEn || '');
    setFormLevel(video.level || 'Beginner');
    setFormTargetAudience(video.hindiTargetAudience || video.targetAudience || '');
    setFormInstructor(video.instructor);
    setFormThumbnail(video.thumbnailUrl || '');
    setFormDuration(video.duration);
    setFormCategory(video.category);
    setFormIsPremium(true);
    setFormPrice(video.price || 99);
    setFormYoutubeUrl(video.youtubeUrl || '');
    setFormStreamVideoId(video.streamVideoId || '');
    setFormIsActive(video.isActive !== false);
    setFormTopics(video.topics ? video.topics.join('\n') : '');
    setActiveTab('add');
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formInstructor.trim()) {
      showNotification('error', 'Please fill in video title and instructor name.');
      return;
    }

    if (!Number.isFinite(formPrice) || formPrice <= 0) {
      showNotification('error', 'Paid video price must be greater than ₹0.');
      return;
    }

    // Active paid videos need either a valid YouTube URL or a genuine Cloudflare Stream UID.
    if (formIsActive) {
      const cleanStreamId = formStreamVideoId.trim();
      const cleanYoutubeUrl = formYoutubeUrl.trim();
      let validYoutube = false;
      if (cleanYoutubeUrl) {
        try {
          const parsed = new URL(cleanYoutubeUrl);
          const host = parsed.hostname.replace(/^www\\./, '').toLowerCase();
          const parts = parsed.pathname.split('/').filter(Boolean);
          const id = host === 'youtu.be' ? parts[0] : parsed.searchParams.get('v') || (['embed', 'shorts'].includes(parts[0]) ? parts[1] : '');
          validYoutube = ['youtu.be', 'youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host) && /^[A-Za-z0-9_-]{11}$/.test(id || '');
        } catch { validYoutube = false; }
      }
      const validStream = !!cleanStreamId && !cleanStreamId.startsWith('cf_stream_') && !cleanStreamId.startsWith('mock_') && !cleanStreamId.startsWith('stream-');
      if (!validYoutube && !validStream) {
        showNotification('error', 'एक्टिव वीडियो के लिए सही YouTube URL या Cloudflare Stream UID डालें।');
        return;
      }
    }

    setLoading(true);

    const videoId = editingVideo ? editingVideo.id : `video_${Date.now()}`;
    const topicsArray = formTopics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const videoPayload: VideoGuide = {
      id: videoId,
      videoId: videoId,
      title: formTitle.trim(),
      hindiTitle: formHindiTitle.trim() || undefined,
      description: formDescription.trim(),
      aboutHi: formAboutHi.trim() || undefined,
      aboutEn: formAboutEn.trim() || undefined,
      level: formLevel,
      targetAudience: formTargetAudience.trim() || undefined,
      instructor: formInstructor.trim(),
      thumbnailUrl: formThumbnail.trim() || undefined,
      duration: formDuration.trim() || '20:00',
      category: formCategory,
      isPremium: true,
      accessType: 'premium',
      price: Math.max(1, Math.floor(formPrice)),
      currency: 'INR',
      youtubeUrl: formYoutubeUrl.trim() || undefined,
      streamVideoId: formYoutubeUrl.trim() ? '' : formStreamVideoId.trim(),
      isActive: formIsActive,
      topics: topicsArray,
    };

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('success', editingVideo ? 'Video updated successfully!' : 'New video added to catalog!');
        // Update local list
        setVideos((prev) => {
          const index = prev.findIndex((v) => v.id === videoId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = videoPayload;
            return updated;
          }
          return [videoPayload, ...prev];
        });
        setActiveTab('manage');
      } else {
        showNotification('error', data.error || 'Failed to save video record.');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Network error saving video.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to deactivate and remove "${title}" from the video catalog?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showNotification('success', `Video "${title}" deactivated successfully.`);
        setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, isActive: false } : v)));
      } else {
        showNotification('error', 'Could not deactivate video.');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error communicating with server.');
    }
  };

  const handleRevokeAccess = async (accessId: string, isRevokedNow: boolean) => {
    const actionText = isRevokedNow ? 'restore' : 'revoke';
    const confirmRevoke = window.confirm(`Are you sure you want to ${actionText} access for this purchase record?`);
    if (!confirmRevoke) return;

    try {
      const response = await fetch('/api/admin/revoke-access', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessId, revoke: !isRevokedNow }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showNotification('success', data.message);
        setPurchases((prev) =>
          prev.map((p) => (p.id === accessId ? { ...p, isRevoked: !isRevokedNow } : p))
        );
      } else {
        showNotification('error', data.error || 'Failed to update access state.');
      }
    } catch (e: any) {
      showNotification('error', e.message || 'Error updating access.');
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = grantPhone.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(phone) || !grantVideoId) { showNotification('error', '10 अंकों का मोबाइल नंबर और वीडियो चुनें।'); return; }
    setGrantSubmitting(true);
    try {
      const response = await fetch('/api/admin/grant-access', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerPhone: phone, videoId: grantVideoId, note: grantNote.trim() }) });
      const data = await response.json();
      if (response.ok && data.success) { showNotification('success', 'बिना पेमेंट वाला एक्सेस दे दिया गया। ग्राहक इसी मोबाइल नंबर से वीडियो सत्यापित कर सकता है।'); setGrantPhone(''); setGrantVideoId(''); setGrantNote(''); await fetchPurchases(); }
      else showNotification('error', data.error || 'एक्सेस नहीं दिया जा सका।');
    } catch (err: any) { showNotification('error', err.message || 'सर्वर से संपर्क नहीं हो पाया।'); }
    finally { setGrantSubmitting(false); }
  };

  // Metrics Calculations
  const totalVideosCount = videos.length;
  const activeVideosCount = videos.filter((v) => v.isActive !== false).length;
  const freeVideosCount = videos.filter((v) => !v.isPremium && v.accessType !== 'premium').length;
  const premiumVideosCount = videos.filter((v) => v.isPremium || v.accessType === 'premium').length;
  const totalVerifiedPurchases = purchases.filter((p) => p.paymentStatus === 'PAID').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : 'bg-red-950 border-red-500 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-900/30">
                T
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white">Tanshu Admin</h1>
                <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Logged in as {adminUser.username}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Manage Videos ({videos.length})</span>
            </button>

            <button
              onClick={handleOpenAddVideo}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Video</span>
            </button>

            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'purchases'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Purchases</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-red-800/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">System Dashboard</h2>
              <p className="text-xs text-slate-400">
                Catalog health metrics, monetization overview, and recent activity.
              </p>
            </div>

            {/* Metrics 5-Card Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Videos
                </div>
                <div className="text-2xl font-black text-white">{totalVideosCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">Free + Premium catalog</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Active Videos
                </div>
                <div className="text-2xl font-black text-emerald-400">{activeVideosCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">Published to customers</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Free Tutorials
                </div>
                <div className="text-2xl font-black text-blue-400">{freeVideosCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">YouTube links active</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Premium Courses
                </div>
                <div className="text-2xl font-black text-amber-400">{premiumVideosCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">Paid Cloudflare Stream</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 col-span-2 lg:col-span-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Verified Purchases
                </div>
                <div className="text-2xl font-black text-purple-400">{totalVerifiedPurchases}</div>
                <div className="text-[10px] text-slate-500 mt-1">Server confirmed PAID</div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Ready to add a new tutorial?</h3>
                <p className="text-xs text-slate-400">
                  Easily publish free YouTube guides or set up a paid masterclass with custom pricing and Cloudflare Stream.
                </p>
              </div>
              <button
                onClick={handleOpenAddVideo}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Video</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE VIDEOS TABLE */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Manage Video Catalog</h2>
                <p className="text-xs text-slate-400">
                  Edit prices, update descriptions, toggle active status, or remove videos.
                </p>
              </div>
              <button
                onClick={handleOpenAddVideo}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            </div>

            {/* Video List Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Video Details</th>
                      <th className="py-3 px-4">Type & Price</th>
                      <th className="py-3 px-4">Hosting / ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {videos.map((v) => {
                      const isPrem = v.isPremium || v.accessType === 'premium';
                      const isActive = v.isActive !== false;

                      return (
                        <tr key={v.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs max-w-xs sm:max-w-md line-clamp-1">
                              {v.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>By {v.instructor}</span>
                              <span>•</span>
                              <span>{v.duration}</span>
                              <span>•</span>
                              <span className="text-slate-500">{v.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isPrem ? (
                              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>₹{v.price || 99} INR</span>
                              </div>
                            ) : (
                              <div className="text-emerald-400 font-bold flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                <span>Free</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                            {isPrem ? (
                              v.streamVideoId ? (
                                <span className="text-slate-300 truncate max-w-xs block">
                                  Stream: {v.streamVideoId.slice(0, 16)}...
                                </span>
                              ) : (
                                <span className="text-red-400 italic">No Stream UID</span>
                              )
                            ) : (
                              <span className="text-blue-400 truncate max-w-xs block">
                                YouTube: {v.videoId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                INACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditVideo(v)}
                              className="p-1.5 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-lg transition-colors cursor-pointer"
                              title="Edit Video & Pricing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(v.id, v.title)}
                              className="p-1.5 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                              title="Deactivate Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADD / EDIT VIDEO FORM */}
        {activeTab === 'add' && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {editingVideo ? `Edit Video: ${editingVideo.title}` : 'Add New Video Tutorial'}
                </h2>
                <p className="text-xs text-slate-400">
                  Configure tutorial title, pricing, instructor, and media hosting.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('manage')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Video Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Masterclass: PVC Smart Card Alignment & Printing"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Hindi Title / हिंदी शीर्षक (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={formHindiTitle}
                    onChange={(e) => setFormHindiTitle(e.target.value)}
                    placeholder="उदा. PVC स्मार्ट कार्ड अलाइनमेंट व प्रिंटिंग मास्टरक्लास"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Difficulty Level / स्तर
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e: any) => setFormLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden cursor-pointer"
                  >
                    <option value="Beginner">Beginner (शुरुआती)</option>
                    <option value="Intermediate">Intermediate (मध्यम)</option>
                    <option value="Advanced">Advanced (उन्नत)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Instructor Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    placeholder="e.g. Tanshu Senior VLE Expert"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden cursor-pointer"
                  >
                    <option value="CSC & Banking Kiosk">CSC & Banking Kiosk</option>
                    <option value="Hardware & Printing">Hardware & Printing</option>
                    <option value="Government Services">Government Services</option>
                    <option value="Business & Accounts">Business & Accounts</option>
                    <option value="Cyber Cafe Hacks">Cyber Cafe Hacks</option>
                  </select>
                </div>
              </div>

              {/* Bilingual Video About Section */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Customer About Description (Bilingual / गैर-सुलभ विवरण)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Explain what customer will learn, key guidance, and who it is for without revealing the complete tutorial or full steps.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      About Video (Hindi) / इस वीडियो के बारे में:
                    </label>
                    <textarea
                      rows={3}
                      value={formAboutHi}
                      onChange={(e) => setFormAboutHi(e.target.value)}
                      placeholder="उदा. इस वीडियो में आपको आधार कार्ड में पिता के नाम से जुड़ी समस्याओं, मुख्य नियमों और सुधार से पहले ध्यान रखने योग्य महत्वपूर्ण बातों की पूरी जानकारी मिलेगी..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-400 mb-1">
                      About Video (English) / About this Video:
                    </label>
                    <textarea
                      rows={3}
                      value={formAboutEn}
                      onChange={(e) => setFormAboutEn(e.target.value)}
                      placeholder="e.g. This video provides essential guidance on common issues, key rules, and important things to know before updating..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Target Audience / किसके लिए उपयोगी है:
                    </label>
                    <input
                      type="text"
                      value={formTargetAudience}
                      onChange={(e) => setFormTargetAudience(e.target.value)}
                      placeholder="उदा. साइबर कैफ़े संचालक, CSC VLEs और आवेदक"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed curriculum, prerequisites, and learning outcomes..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Duration (e.g. 45:30)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="30:00"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Paid-only website catalog */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="p-3 bg-amber-950/40 border border-amber-700 rounded-xl text-xs text-amber-200">
                  सभी वेबसाइट वीडियो Paid Masterclass होंगे। Free वीडियो वेबसाइट पर नहीं जोड़े जाएंगे।
                </div>

                {formIsPremium ? (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-bold text-amber-400">
                        Custom Price in INR (₹)
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500">Suggested Presets:</span>
                        {pricingPresets.map((p) => (
                          <button
                            key={p.amount}
                            type="button"
                            onClick={() => setFormPrice(p.amount)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              formPrice === p.amount
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            ₹{p.amount}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-xs text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        required={formIsPremium}
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        placeholder="99"
                        className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs font-mono font-bold text-white outline-hidden"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-400 mb-1">YouTube Unlisted Video URL (Paid playback)</label>
                        <input
                          type="url"
                          value={formYoutubeUrl}
                          onChange={(e) => setFormYoutubeUrl(e.target.value)}
                          placeholder="https://youtu.be/xxxxxxxxxxx"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">YouTube URL देने पर ग्राहक का भुगतान और एक्सेस सत्यापित होने के बाद ही एम्बेड प्लेयर दिखेगा। वीडियो को Unlisted रखें।</p>
                      </div>
                      <details className="text-xs text-slate-400">
                        <summary className="cursor-pointer">या Cloudflare Stream UID इस्तेमाल करें</summary>
                        <input
                          type="text"
                          value={formStreamVideoId}
                          onChange={(e) => setFormStreamVideoId(e.target.value)}
                          placeholder="Cloudflare Stream Video UID"
                          className="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-hidden"
                        />
                      </details>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Topics / Curriculum */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topics / Chapters Covered (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formTopics}
                  onChange={(e) => setFormTopics(e.target.value)}
                  placeholder="Step 1: Document setup&#10;Step 2: Fingerprint scanner driver install&#10;Step 3: Portal submission"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white outline-hidden"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Activate Video (Make visible to customers on website)
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Preview Customer View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Video & Publish</span>
                </button>
              </div>
            </form>

            {/* LIVE CUSTOMER VIEW PREVIEW MODAL */}
            {showPreviewModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                  {/* Modal Header */}
                  <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm">Customer View Preview • ग्राहक पूर्वावलोकन</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer Card Preview */}
                  <div className="p-6 overflow-y-auto space-y-5 bg-slate-50 text-slate-900">
                    {/* Video Header Strip */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {formCategory}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            Level: <strong className="text-slate-800">{formLevel}</strong>
                          </span>
                          {formIsPremium ? (
                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                              Premium (₹{formPrice})
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              Free Tutorial
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Duration: {formDuration || '20:00'}
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900">
                        {previewTabLang === 'hi' && formHindiTitle ? formHindiTitle : formTitle || 'Untitled Video Tutorial'}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {formDescription || 'No description provided.'}
                      </p>
                    </div>

                    {/* About This Video Box Preview */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {previewTabLang === 'hi' ? 'इस वीडियो के बारे में' : 'About this Video'}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {previewTabLang === 'hi' ? 'विषय, उपयोगी मार्गदर्शन और मुख्य बिंदु' : 'Guidance, topics covered & learning outcomes'}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Language Switcher in Preview */}
                        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => setPreviewTabLang('hi')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              previewTabLang === 'hi'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            हिंदी
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTabLang('en')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              previewTabLang === 'en'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      {/* Description Text */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {previewTabLang === 'hi'
                          ? (formAboutHi || 'हिंदी में "इस वीडियो के बारे में" विवरण दर्ज करें...')
                          : (formAboutEn || 'Enter "About this Video" guidance in English...')}
                      </div>

                      {/* 2 Takeaways */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                          <div className="font-bold text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>{previewTabLang === 'hi' ? 'इस वीडियो से क्या सीखेंगे?' : 'What You Will Learn'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-normal">
                            {previewTabLang === 'hi'
                              ? 'प्रक्रिया के मुख्य नियम, तकनीकी सेटिंग्स और सामान्य गलतियों से बचने की सही जानकारी।'
                              : 'Essential rules, configuration parameters, and proven methods to avoid common errors.'}
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{previewTabLang === 'hi' ? 'यह किसके लिए उपयोगी है?' : 'Who This Is Useful For'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-normal">
                            {formTargetAudience || 'साइबर कैफ़े संचालक, CSC VLEs और सभी आवेदक।'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Topics Checklist */}
                    {formTopics.trim() && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Curriculum Chapters Covered:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {formTopics.split('\n').filter(Boolean).map((t, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-3 px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>This shows the live customer view prior to purchase or streaming.</span>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(false)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Back to Editor
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMER PURCHASES & REVOCATION */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <section className="bg-slate-950 rounded-2xl border border-emerald-800/60 p-5 space-y-4">
              <div><h3 className="text-sm font-extrabold text-white">Grant Complimentary Video Access</h3><p className="text-xs text-slate-400 mt-1">किसी ग्राहक को बिना पेमेंट चुने हुए paid video का एक्सेस दें। ग्राहक को वही मोबाइल नंबर इस्तेमाल करना होगा।</p></div>
              <form onSubmit={handleGrantAccess} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs text-slate-300 space-y-1"><span>Customer mobile number</span><input value={grantPhone} onChange={(e) => setGrantPhone(e.target.value)} inputMode="numeric" maxLength={10} placeholder="10 digit mobile number" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" required /></label>
                <label className="text-xs text-slate-300 space-y-1"><span>Select paid video</span><select value={grantVideoId} onChange={(e) => setGrantVideoId(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" required><option value="">Choose a video</option>{videos.filter((v) => v.isActive !== false && (v.isPremium || v.accessType === 'premium')).map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}</select></label>
                <label className="text-xs text-slate-300 space-y-1 md:col-span-2"><span>Reason / note (optional)</span><input value={grantNote} onChange={(e) => setGrantNote(e.target.value)} maxLength={240} placeholder="Reason for complimentary access" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white" /></label>
                <div className="md:col-span-2"><button type="submit" disabled={grantSubmitting || !videos.some((v) => v.id === grantVideoId && v.isActive !== false && (v.isPremium || v.accessType === 'premium'))} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold">{grantSubmitting ? 'Granting access...' : 'Grant Access Without Payment'}</button></div>
              </form>
            </section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">Customer Access Records</h2>
                <p className="text-xs text-slate-400">
                  Cashfree verified purchases और Admin द्वारा दिए गए complimentary access, दोनों का रिकॉर्ड।
                </p>
              </div>
              <button
                onClick={fetchPurchases}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh List</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer Phone</th>
                      <th className="py-3 px-4">Masterclass Purchased</th>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Purchased Date</th>
                      <th className="py-3 px-4 text-right">Access Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {purchases.length > 0 ? (
                      purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {p.customerPhone}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200 max-w-xs truncate">
                            {p.videoTitle || p.videoId}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {p.orderId || '—'}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400 font-mono">
                            {p.paymentStatus === 'COMPLIMENTARY' ? '₹0 (No payment)' : `₹${p.amountPaid}`}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {new Date(p.grantedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {p.isRevoked ? (
                              <button
                                onClick={() => handleRevokeAccess(p.id, true)}
                                className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Restore Access
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRevokeAccess(p.id, false)}
                                className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/60 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Revoke Access
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          No customer access records found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
