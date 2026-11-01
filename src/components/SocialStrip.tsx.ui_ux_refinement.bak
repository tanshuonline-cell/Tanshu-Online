import React from 'react';
import { Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';

export const SocialStrip: React.FC = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      label: 'Tanshuonline',
      url: 'https://www.instagram.com/tanshuonline?obrf=MTY3dmhkNTV2cHk1Mw==',
      icon: <Instagram className="w-4 h-4 text-pink-400" />
    },
    {
      name: 'Facebook',
      label: 'Tanshuonline',
      url: 'https://www.facebook.com/share/19bDrHwUdD/',
      icon: <Facebook className="w-4 h-4 text-blue-400" />
    },
    {
      name: 'YouTube',
      label: 'TANSHU ONLINE',
      url: 'https://youtube.com/@tanshuonline?si=MSwlXsajZRAZUl0- ',
      icon: <Youtube className="w-4 h-4 text-red-500" />
    },
    {
      name: 'WhatsApp',
      label: 'Chat on WhatsApp', // Explicit requirement: never display phone number as visible text
      url: 'https://wa.me/919360714846',
      icon: <MessageCircle className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <div className="w-full bg-[#0A1324] text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Social Links Group */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-6 text-xs font-semibold">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider hidden md:inline">
            Connect With Us:
          </span>

          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white transition-all border border-slate-800 hover:border-slate-700 shadow-xs"
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Right side: Tasteful Indian Tricolor decorative element */}
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <div className="flex items-center gap-1">
            <span className="w-4 sm:w-6 h-1.5 rounded-full bg-[#FF9933]" />
            <span className="w-4 sm:w-6 h-1.5 rounded-full bg-white opacity-90" />
            <span className="w-4 sm:w-6 h-1.5 rounded-full bg-[#138808]" />
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono ml-2">
            Digital India
          </span>
        </div>
      </div>
    </div>
  );
};
