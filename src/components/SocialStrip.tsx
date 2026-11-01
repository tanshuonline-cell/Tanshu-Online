import React from 'react';
import { Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SocialStrip: React.FC = () => {
  const { isHindi } = useLanguage();

  const socialLinks = [
    {
      name: 'Instagram',
      label: 'Instagram',
      handle: '@tanshuonline',
      url: 'https://www.instagram.com/tanshuonline?obrf=MTY3dmhkNTV2cHk1Mw==',
      icon: <Instagram className="w-4 h-4 text-pink-400" />,
      btnStyle: 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-pink-500/50',
    },
    {
      name: 'Facebook',
      label: 'Facebook',
      handle: 'Tanshuonline',
      url: 'https://www.facebook.com/share/19bDrHwUdD/',
      icon: <Facebook className="w-4 h-4 text-blue-400" />,
      btnStyle: 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-blue-500/50',
    },
    {
      name: 'YouTube',
      label: 'YouTube',
      handle: 'TANSHU ONLINE',
      url: 'https://youtube.com/@tanshuonline?si=MSwlXsajZRAZUl0- ',
      icon: <Youtube className="w-4 h-4 text-red-500" />,
      btnStyle: 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-red-500/50',
    },
    {
      name: 'WhatsApp',
      label: 'Chat on WhatsApp', // Strict requirement: do not expose phone number as visible text
      handle: 'Helpdesk',
      url: 'https://wa.me/919360714846',
      icon: <MessageCircle className="w-4 h-4 text-emerald-300" />,
      btnStyle: 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-100 border-emerald-600/50 hover:border-emerald-400 shadow-sm shadow-emerald-950/40 ring-1 ring-emerald-500/20',
      isWhatsApp: true,
    },
  ];

  return (
    <div className="w-full bg-[#0A1324] text-white border-b border-slate-800/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Prominent Heading & High-Contrast Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 mr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-extrabold text-xs tracking-wider uppercase">
              {isHindi ? 'हमसे संपर्क करें:' : 'Connect With Us:'}
            </span>
          </div>

          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-2xs cursor-pointer ${item.btnStyle}`}
              title={item.name}
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.label}</span>
              {item.isWhatsApp && (
                <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 ml-0.5">
                  Direct
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Right side: Tasteful Indian Tricolor badge & tagline */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-4 sm:w-5 h-1.5 rounded-full bg-[#FF9933]" />
            <span className="w-4 sm:w-5 h-1.5 rounded-full bg-white opacity-90" />
            <span className="w-4 sm:w-5 h-1.5 rounded-full bg-[#138808]" />
          </div>
          <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider ml-1">
            Digital Seva Hub
          </span>
        </div>
      </div>
    </div>
  );
};
