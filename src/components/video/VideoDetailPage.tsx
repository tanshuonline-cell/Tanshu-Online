import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Lock,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { VideoGuide } from '../../types';
import { CashfreeCheckoutModal } from './CashfreeCheckoutModal';
import { PremiumVideoPlayer } from './PremiumVideoPlayer';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  video: VideoGuide;
  onBack: () => void;
  onNavigateHome?: () => void;
  paymentReturnNotice?: { type: 'success' | 'warning'; message: string } | null;
}

export const VideoDetailPage: React.FC<Props> = ({ video, onBack, onNavigateHome, paymentReturnNotice }) => {
  const { language } = useLanguage();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [aboutLang, setAboutLang] = useState<'hi' | 'en'>(language === 'hi' ? 'hi' : 'en');

  const isPremium = video.isPremium || video.accessType === 'premium';
  const price = video.price || 99;

  // Check if customer already has a stored verified session for this specific video in localStorage
  useEffect(() => {
    if (!isPremium) return;
    try {
      const stored = localStorage.getItem('tanshu_purchased_videos_v1');
      if (stored) {
        const records = JSON.parse(stored);
        if (records[video.id] && records[video.id].phone && records[video.id].sessionToken) {
          setIsUnlocked(true);
          setCustomerPhone(records[video.id].phone);
          setSessionToken(records[video.id].sessionToken);
        }
      }
    } catch (e) {
      console.warn('LocalStorage entitlement check notice:', e);
    }
  }, [video.id, isPremium]);

  const handlePaymentSuccess = (videoId: string, phone: string, token?: string) => {
    setIsCheckoutOpen(false);
    setIsUnlocked(true);
    setCustomerPhone(phone);
    if (token) setSessionToken(token);

    // Save strictly scoped to this videoId
    try {
      const existing = JSON.parse(localStorage.getItem('tanshu_purchased_videos_v1') || '{}');
      existing[videoId] = {
        phone,
        sessionToken: token || '',
        unlockedAt: new Date().toISOString(),
      };
      localStorage.setItem('tanshu_purchased_videos_v1', JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    setIsPlayerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {paymentReturnNotice && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-sm leading-relaxed ${
              paymentReturnNotice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-950'
            }`}
          >
            {paymentReturnNotice.message}
          </div>
        )}
        {/* Back and Breadcrumb Navigation (Sharing strictly removed for security) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </button>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Home
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              Tanshu Online Learning Center
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Player / Media & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Presentation Box */}
            <div className="bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative aspect-video flex items-center justify-center">
              {!isPremium ? (
                // Free Video: Direct YouTube Iframe
                <iframe
                  src={
                    video.youtubeUrl ||
                    `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=0&rel=0`
                  }
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isUnlocked ? (
                // Unlocked Premium Video: Play button launches the purchase-verified premium player
                <div className="relative w-full h-full">
                  <img
                    src={
                      video.thumbnailUrl ||
                      `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&q=80`
                    }
                    alt={video.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <button
                      onClick={() => setIsPlayerOpen(true)}
                      className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </button>
                    <div className="text-sm font-bold text-white">
                      Entitlement Verified • Ready to Stream
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      Licensed to +91 {customerPhone.slice(0, 2)}****{customerPhone.slice(-4)}
                    </div>
                  </div>
                </div>
              ) : (
                // Locked Premium Video: Pure thumbnail and locked overlay (ABSOLUTELY NO PLAYBACK OR PREVIEW)
                <div className="relative w-full h-full">
                  <img
                    src={
                      video.thumbnailUrl ||
                      `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080&q=80`
                    }
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-black/40 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3 backdrop-blur-xs">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-base font-extrabold text-white mb-1">
                      Full Premium Masterclass
                    </div>
                    <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                      Complete Full HD practical training, step-by-step portal filing, and download files. Zero preview clips — unlock verified access below.
                    </p>
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 hover:scale-105"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock Masterclass • ₹{price}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* About This Video / इस वीडियो के बारे में */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {aboutLang === 'hi' ? 'इस वीडियो के बारे में' : 'About this Video'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {aboutLang === 'hi' ? 'विषय, उपयोगी मार्गदर्शन और मुख्य बिंदु' : 'Guidance, topics covered & learning outcomes'}
                    </p>
                  </div>
                </div>

                {/* Bilingual Language Switcher */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() => setAboutLang('hi')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      aboutLang === 'hi'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setAboutLang('en')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      aboutLang === 'en'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Clear, Professional Description (Matches video topic without revealing full tutorial) */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                {aboutLang === 'hi'
                  ? (video.aboutHi || video.hindiDescription || video.description)
                  : (video.aboutEn || video.description)}
              </div>

              {/* Key Takeaways */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{aboutLang === 'hi' ? 'इस वीडियो से क्या सीखेंगे?' : 'What You Will Learn'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {aboutLang === 'hi'
                      ? 'प्रक्रिया के मुख्य नियम, तकनीकी सेटिंग्स और पोर्टल पर सामान्य गलतियों से बचने की सही जानकारी।'
                      : 'Essential rules, configuration parameters, and proven methods to avoid common errors.'}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{aboutLang === 'hi' ? 'यह किसके लिए उपयोगी है?' : 'Who This Is Useful For'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    {aboutLang === 'hi'
                      ? (video.hindiTargetAudience || 'साइबर कैफ़े संचालक, CSC VLEs और सही प्रक्रिया समझने वाले सभी नागरिक।')
                      : (video.targetAudience || 'Cyber cafe operators, CSC VLEs, and applicants wanting reliable guidance.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {video.category}
                  </span>
                  {video.level && (
                    <span className="text-xs font-semibold text-slate-500">
                      Level: <strong className="text-slate-800">{video.level}</strong>
                    </span>
                  )}
                  {video.isSample && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold font-mono">
                      SAMPLE ENTRY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {video.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>By {video.instructor}</span>
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {video.title}
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>

              {/* Topics / Curriculum Checklist */}
              {video.topics && video.topics.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                    What You Will Learn in This Masterclass:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {video.topics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Access Fee
                </span>
                {isPremium ? (
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                    One-Time Purchase
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    100% Free
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {isPremium ? `₹${price}` : 'Free'}
                </span>
                {isPremium && (
                  <span className="text-xs font-semibold text-slate-500">INR (Incl. GST)</span>
                )}
              </div>

              {isPremium ? (
                isUnlocked ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Masterclass Unlocked</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Your purchase is verified and licensed to your mobile number.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPlayerOpen(true)}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Watch Masterclass</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-xl hover:scale-102"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Buy Now • ₹{price} INR</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500">
                      Instant unlock with Cashfree UPI, Cards, NetBanking.
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                    This practical guide is completely free for all cyber cafe operators and CSC VLEs.
                  </div>
                </div>
              )}

              {/* Guarantees & Features */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified purchase before video playback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Licensed mobile number displayed during playback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Verified Cashfree 256-Bit SSL Checkout</span>
                </div>
              </div>

              {isPremium && price === 49 && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-2">
                    <div>
                      <p className="text-sm font-extrabold text-rose-900">प्रीमियम WhatsApp परामर्श</p>
                      <p className="text-[11px] font-semibold text-rose-700">केवल ₹49 • एक विषय • एक बार भुगतान</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-rose-600 px-2 py-1 text-xs font-black text-white">₹49</span>
                  </div>

                  <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-slate-900">इसमें आपको क्या मिलेगा?</p>
                    <p>एक भुगतान पर आप WhatsApp चैट के माध्यम से केवल एक ही विषय पर पूरी बातचीत कर सकते हैं। आपकी समस्या और उससे जुड़ी जानकारी समझकर उपलब्ध नियमों के अनुसार सही प्रक्रिया, जरूरी जानकारी और अगले कदम बताए जाएँगे। हमारा उद्देश्य आपकी समस्या को ठीक से समझकर आपको स्पष्ट मार्गदर्शन देना है।</p>
                  </div>

                  <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-slate-900">समय और वैधता</p>
                    <p>भुगतान सफलतापूर्वक सत्यापित होने के बाद इस परामर्श की वैधता 24 घंटे रहेगी। सहायता केवल निर्धारित कार्य समय में दी जाएगी। 24 घंटे पूरे होने पर परामर्श का एक्सेस समाप्त हो जाएगा।</p>
                  </div>

                  <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-slate-900">WhatsApp पर संपर्क कैसे मिलेगा?</p>
                    <p>Cashfree भुगतान की पुष्टि होने के बाद आपको सुरक्षित WhatsApp चैट लिंक दिया जाएगा। आपका निजी मोबाइल नंबर वेबसाइट पर सार्वजनिक रूप से नहीं दिखाया जाएगा। यह सुविधा केवल WhatsApp चैट के लिए है। अनावश्यक कॉल या बार-बार संदेश भेजना स्वीकार नहीं होगा।</p>
                  </div>

                  <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-slate-900">महत्वपूर्ण नियम एवं शर्तें</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>₹49 का भुगतान केवल एक विषय के परामर्श के लिए है।</li>
                      <li>नई या अलग समस्या, नया विषय अथवा अतिरिक्त परामर्श के लिए अलग भुगतान करना होगा।</li>
                      <li>सरकारी फीस, आवेदन शुल्क, पोर्टल शुल्क और किसी अन्य सेवा का शुल्क ₹49 में शामिल नहीं है।</li>
                      <li>यह मार्गदर्शन सेवा है। किसी सरकारी आवेदन की स्वीकृति, परिणाम या निश्चित समय-सीमा की गारंटी नहीं दी जाती। अंतिम निर्णय संबंधित विभाग या पोर्टल के नियमों पर निर्भर करेगा।</li>
                      <li>भुगतान सत्यापित होने के बाद ही Consultation लिंक सक्रिय होगा। असफल या अपुष्ट भुगतान पर एक्सेस नहीं मिलेगा।</li>
                      <li>24 घंटे की वैधता समाप्त होने पर पुराने परामर्श लिंक से सहायता उपलब्ध नहीं रहेगी।</li>
                    </ul>
                  </div>
                  <p className="border-t border-rose-100 pt-2 text-[10px] leading-relaxed text-slate-500">कृपया भुगतान करने से पहले ऊपर दी गई जानकारी और सभी शर्तें ध्यान से पढ़ लें।</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cashfree Checkout Modal */}
      {isCheckoutOpen && (
        <CashfreeCheckoutModal
          video={video}
          onClose={() => setIsCheckoutOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Purchase-verified Premium Video Player */}
      {isPlayerOpen && (
        <PremiumVideoPlayer
          video={video}
          customerPhone={customerPhone}
          sessionToken={sessionToken}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
};
