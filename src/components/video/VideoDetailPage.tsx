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
  const isAadhaarFatherName49 = video.id === 'video_1793562264012' && price === 49;

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
                      {aboutLang === 'hi' ? 'इस वीडियो के बारे में' : 'About This Video'}
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

              {isAadhaarFatherName49 ? (
                <div className="space-y-5">
                  <section className="rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-orange-50/60 p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-rose-700">
                      {aboutLang === 'hi' ? 'इस वीडियो में आपको क्या-क्या जानकारी मिलेगी?' : 'What Information Will You Get in This Video?'}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-slate-600">
                      {aboutLang === 'hi'
                        ? <>आवेदन के वैकल्पिक तरीके <span className="px-1 text-rose-500">•</span> जरूरी जानकारी <span className="px-1 text-rose-500">•</span> स्टेप-बाय-स्टेप मार्गदर्शन</>
                        : <>Alternative application methods <span className="px-1 text-rose-500">•</span> Essential information <span className="px-1 text-rose-500">•</span> Step-by-step guidance</>}
                    </p>

                    <h4 className="mt-5 mb-3 text-sm font-extrabold text-slate-950">
                      {aboutLang === 'hi' ? 'इस वीडियो में आप समझेंगे:' : 'In This Video, You Will Understand:'}
                    </h4>
                    <ol className="space-y-3">
                      {(aboutLang === 'hi'
                        ? [
                            {
                              heading: 'पिता के आधार कार्ड में नाम गलत है?',
                              detail: 'ऐसी स्थिति में पिता का सही नाम अपडेट करवाने के संभावित विकल्प समझेंगे।'
                            },
                            {
                              heading: 'पिता का नाम सही है, लेकिन उनका पता अलग है?',
                              detail: 'ऐसी स्थिति में अपने पते के अनुसार आधार अपडेट करवाने के संभावित विकल्प जानेंगे।'
                            },
                            {
                              heading: 'आपके पास अपना एड्रेस प्रूफ नहीं है?',
                              detail: 'बिना HOF के बताए गए वैकल्पिक तरीके और उसकी सीमाओं के बारे में समझेंगे।'
                            },
                            {
                              heading: 'पति का निधन हो चुका है?',
                              detail: 'ऐसी स्थिति में पिता के नाम और आधार अपडेट से जुड़ी उपलब्ध संभावनाओं को समझेंगे।'
                            },
                            {
                              heading: 'पिता का निधन हो चुका है?',
                              detail: 'ऐसी स्थिति में पिता के नाम से जुड़े अपडेट के संभावित विकल्पों की जानकारी मिलेगी।'
                            },
                            {
                              heading: 'पिता के नाम की स्पेलिंग या लिखावट में गलती है?',
                              detail: 'ऐसी गलती को ठीक करवाने से पहले किन जरूरी बातों को समझना चाहिए, इसकी जानकारी मिलेगी।'
                            },
                            {
                              heading: 'पिता के आधार और आपके आधार में जानकारी अलग है?',
                              detail: 'ऐसी स्थिति में आवेदन से पहले उपलब्ध विकल्पों और जरूरी बातों को समझेंगे।'
                            },
                            {
                              heading: 'पिता के नाम से जुड़ी कोई दूसरी समस्या है?',
                              detail: 'वीडियो में ऐसी अन्य सामान्य समस्याओं और उनके संभावित समाधानों पर भी जानकारी मिलेगी।'
                            },
                            {
                              heading: 'पिता के आधार कार्ड में नाम और पता अलग हैं, और आपके दस्तावेज़ में भी जानकारी अलग है?',
                              detail: 'ऐसी स्थिति में अपने आधार में पिता का सही नाम और अपना पता अपडेट करवाने के संभावित विकल्प समझेंगे।'
                            },
                            {
                              heading: 'आपके पास पिता का कोई भी दस्तावेज़ उपलब्ध नहीं है?',
                              detail: 'क्या अपने दस्तावेज़ के आधार पर अपने आधार कार्ड में पिता का नाम दर्ज करवाना संभव है? वीडियो में इससे जुड़े संभावित विकल्प समझेंगे।'
                            }
                          ]
                        : [
                            {
                              heading: 'Is Your Father’s Name Incorrect in His Aadhaar?',
                              detail: 'Understand the possible options for correcting your father’s name.'
                            },
                            {
                              heading: 'Is Your Father’s Name Correct, But His Address Is Different?',
                              detail: 'Learn about possible options for updating your Aadhaar with your own address.'
                            },
                            {
                              heading: 'Do You Have No Address Proof of Your Own?',
                              detail: 'Understand the alternative method explained without HOF and its limitations.'
                            },
                            {
                              heading: 'Has Your Husband Passed Away?',
                              detail: 'Understand the available possibilities related to your father’s name and Aadhaar update in this situation.'
                            },
                            {
                              heading: 'Has Your Father Passed Away?',
                              detail: 'Learn about possible options related to updating your father’s name in this situation.'
                            },
                            {
                              heading: 'Is There A Spelling Or Writing Error In Your Father’s Name?',
                              detail: 'Understand the important points to consider before seeking a correction.'
                            },
                            {
                              heading: 'Are The Details In Your Father’s Aadhaar Different From Your Aadhaar?',
                              detail: 'Understand the available options and important points before applying.'
                            },
                            {
                              heading: 'Do You Have Another Issue Related To Your Father’s Name?',
                              detail: 'The video also covers other common issues and their possible solutions.'
                            },
                            {
                              heading: 'Are The Name And Address In Your Father’s Aadhaar Different From The Details In Your Documents?',
                              detail: 'Understand possible options for updating your father’s correct name and your own address in your Aadhaar.'
                            },
                            {
                              heading: 'Do You Have No Document Belonging To Your Father?',
                              detail: 'Is It Possible To Add Your Father’s Name To Your Aadhaar Using Your Own Documents? Understand the possible options discussed in the video.'
                            }
                          ]
                      ).map((item, index) => (
                        <li key={index} className="rounded-lg border border-slate-100 bg-white/80 p-3 transition-colors hover:border-rose-200 hover:bg-rose-50/50">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-[11px] font-extrabold text-rose-700 shadow-2xs">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-extrabold leading-snug text-slate-900">
                                {item.heading}
                              </h5>
                              <p className="mt-1 text-[11px] sm:text-xs font-normal leading-relaxed text-slate-600">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 transition-colors hover:border-red-300 hover:bg-amber-100/80">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-amber-900 transition-colors hover:text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                      {aboutLang === 'hi' ? 'महत्वपूर्ण सूचना' : 'Important Notice'}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-amber-950">
                      {aboutLang === 'hi'
                        ? 'HOF के बिना आवेदन के लिए वीडियो में एक वैकल्पिक तरीका/प्रोसेस समझाया गया है। यह UIDAI का कोई आधिकारिक अपडेट, घोषित सुविधा या आधिकारिक तरीका नहीं है। इसे एक वैकल्पिक मेथड के रूप में समझें। इसकी उपलब्धता और काम करना UIDAI के मौजूदा सिस्टम, नियमों और सत्यापन पर निर्भर कर सकता है। इसे किसी आधिकारिक बग या स्थायी सुविधा की गारंटी न समझें।'
                        : 'The video explains an alternative method/process for applying without HOF. This is not an official UIDAI update, announced facility, or official method. Treat it only as an alternative method. Its availability and functioning may depend on UIDAI’s current system, rules, and verification. Do not consider it a confirmed official bug or a permanent facility.'}
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-amber-950">
                      {aboutLang === 'hi'
                        ? 'यह वीडियो केवल शैक्षणिक और जानकारी देने के उद्देश्य से है। आवेदन स्वीकार होने या अपडेट पूरा होने की गारंटी नहीं है।'
                        : 'This video is for educational and informational purposes only. There is no guarantee that an application will be accepted or that an update will be completed.'}
                    </p>
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 transition-all hover:border-red-300 hover:bg-red-50/70">
                      <h4 className="text-xs font-extrabold text-blue-900 transition-colors hover:text-red-700">
                        {aboutLang === 'hi' ? 'गोपनीयता' : 'Privacy'}
                      </h4>
                      <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-slate-700">
                        {aboutLang === 'hi'
                          ? 'किसी से Aadhaar OTP, पासवर्ड या बायोमेट्रिक जानकारी साझा न करें। OTP की जरूरत होने पर उसे केवल आधिकारिक UIDAI पोर्टल पर स्वयं दर्ज करें।'
                          : 'Never Share Your Aadhaar OTP, Password, Or Biometric Information With Anyone. If An OTP Is Required, Enter It Yourself Only On The Official UIDAI Portal.'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 transition-all hover:border-red-300 hover:bg-red-50/70">
                      <h4 className="text-xs font-extrabold text-emerald-900 transition-colors hover:text-red-700">
                        {aboutLang === 'hi' ? 'खरीद' : 'Purchase'}
                      </h4>
                      <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-slate-700">
                        {aboutLang === 'hi'
                          ? 'यह एक One-Time Purchase वीडियो है। सफल भुगतान सत्यापित होने के बाद ही एक्सेस मिलेगा।'
                          : 'This Is A One-Time Purchase Video. Access Will Be Provided Only After Successful Payment Verification.'}
                      </p>
                    </div>
                  </section>

                  {video.topics && video.topics.length > 0 && (
                    <section className="border-t border-slate-100 pt-4">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 mb-3 transition-colors hover:text-red-600">
                        What You Will Learn in This Masterclass
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {video.topics.map((topic, index) => (
                          <div key={index} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700 border border-slate-100">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-3 transition-colors hover:text-red-600">
                      {aboutLang === 'hi' ? 'आधिकारिक UIDAI लिंक' : 'Official UIDAI Links'}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'myAadhaar Portal', href: 'https://myaadhaar.uidai.gov.in/' },
                        { label: 'List of Acceptable Documents', href: 'https://uidai.gov.in/en/enrolment-and-updates' },
                        { label: 'Updating Data on Aadhaar', href: 'https://uidai.gov.in/en/updating-data-on-aadhaar' },
                        { label: 'UIDAI Regulations', href: 'https://uidai.gov.in/en/regulations' }
                      ].map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-10 items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-center text-[9px] sm:text-[10px] font-bold leading-tight text-blue-800 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                        >
                          {link.label}
                          <span aria-hidden="true" className="text-[10px]">↗</span>
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {aboutLang === 'hi'
                      ? (video.aboutHi || video.hindiDescription || video.description)
                      : (video.aboutEn || video.description)}
                  </div>

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
                </>
              )}
            </div>

            {/* Video Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                {!isAadhaarFatherName49 && (
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
                )}

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
                {!isAadhaarFatherName49 && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {video.description}
                  </p>
                )}
              </div>

              {/* Topics / Curriculum Checklist */}
              {!isAadhaarFatherName49 && video.topics && video.topics.length > 0 && (
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
