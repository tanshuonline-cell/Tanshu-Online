import React from 'react';

interface Props {
  onSelectCategory: (categoryKey: string) => void;
}

export const QuickCategoryStrip: React.FC<Props> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'photo',
      title: 'Photo & Signature',
      hindi: 'फोटो और सिग्नेचर टूल्स',
      iconBg: 'bg-[#2563EB]', // Blue
      action: 'tool-photo',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Photo frame with mountain and sun */}
          <rect x="2" y="3" width="14" height="12" rx="2" />
          <circle cx="6.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
          <path d="M16 11l-3.5-3.5-6.5 6.5" />
          {/* Signature pen nib and flowing signature stroke */}
          <path d="M14 18c1.5-1 3-1 4.5 0s2-1 2.5-2" />
          <path d="M19 13l2.5-2.5a1 1 0 0 1 1.4 1.4L20.5 14.5" />
        </svg>
      )
    },
    {
      id: 'pdf',
      title: 'PDF Tools',
      hindi: 'PDF से जुड़ी सुविधाएँ',
      iconBg: 'bg-[#DC2626]', // Red
      action: 'tool-scanning',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Folded corner document */}
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          {/* Prominent PDF Letters */}
          <path d="M7 15h1.8a1.2 1.2 0 0 0 0-2.4H7v4.8" strokeWidth="1.7" />
          <path d="M11.5 12.6v4.8m0-4.8h1.4a1.8 1.8 0 0 1 1.8 1.8v1.2a1.8 1.8 0 0 1-1.8 1.8h-1.4" strokeWidth="1.7" />
          <path d="M17 12.6h-1.8v4.8m0-2.4h1.5" strokeWidth="1.7" />
        </svg>
      )
    },
    {
      id: 'id-print',
      title: 'ID Card & Print',
      hindi: 'ID कार्ड और प्रिंट टूल्स',
      iconBg: 'bg-[#7C3AED]', // Purple
      action: 'tool-pvc',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* ID Card with photo badge and info lines */}
          <rect x="3" y="3" width="18" height="13" rx="2.5" />
          <circle cx="8" cy="8.5" r="2" fill="rgba(255,255,255,0.25)" />
          <path d="M5.5 13.5a2.5 2.5 0 0 1 5 0" />
          <line x1="13" y1="7.5" x2="18" y2="7.5" />
          <line x1="13" y1="10.5" x2="17" y2="10.5" />
          {/* Print output tray at bottom */}
          <path d="M7 16v4.5h10V16" />
          <line x1="9" y1="18.5" x2="15" y2="18.5" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'business',
      title: 'Invoice & Business',
      hindi: 'बिजनेस और इनवॉइस टूल्स',
      iconBg: 'bg-[#EA580C]', // Orange
      action: 'tool-business',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Invoice receipt with jagged cut bottom */}
          <path d="M4 2v18.5l2.5-1.5 2.5 1.5 3-1.5 3 1.5 2.5-1.5 2.5 1.5V2H4z" />
          {/* Indian Rupee ₹ Symbol */}
          <path d="M8.5 6.5h7M8.5 9h5M8.5 6.5v6.5c1.8 0 2.8-.8 2.8-2.2 0-1.5-1-1.8-2.8-1.8l3.6 5" strokeWidth="1.8" />
          <line x1="8.5" y1="16" x2="15.5" y2="16" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp & QR',
      hindi: 'व्हाट्सऐप और QR टूल्स',
      iconBg: 'bg-[#16A34A]', // Green
      action: 'tool-whatsapp',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* WhatsApp speech bubble */}
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          {/* QR mini matrix inside */}
          <rect x="8.5" y="8" width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="13" y="8" width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="8.5" y="12.5" width="3" height="3" fill="currentColor" stroke="none" />
          <rect x="13" y="12.5" width="1.5" height="1.5" fill="currentColor" stroke="none" />
          <rect x="14.5" y="14" width="1.5" height="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    },
    {
      id: 'citizen',
      title: 'Student & Citizen',
      hindi: 'छात्र और नागरिक सेवाएँ',
      iconBg: 'bg-[#18181B]', // Black / Dark Charcoal
      action: 'section-services',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* White Graduation Cap (Mortarboard) */}
          <path d="M22 7.5L12 3 2 7.5l10 4.5 10-4.5z" fill="rgba(255,255,255,0.18)" />
          <path d="M6 9.5v3.8c0 1.8 2.7 3.2 6 3.2s6-1.4 6-3.2V9.5" />
          <path d="M22 7.5v5.5" />
          {/* White Open Book Symbol underneath */}
          <path d="M4 19c2-.8 4.5-.8 8 .8 3.5-1.6 6-1.6 8-.8v-3.5c-2-.8-4.5-.8-8 .8-3.5-1.6-6-1.6-8-.8V19z" fill="rgba(255,255,255,0.22)" strokeWidth="1.7" />
        </svg>
      )
    },
    {
      id: 'schemes',
      title: 'Government Schemes',
      hindi: 'सरकारी योजनाएँ',
      iconBg: 'bg-[#6D28D9]', // Deep Violet
      action: 'section-schemes',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Triangular pediment roof */}
          <path d="M3 9.5L12 3.5l9 6" />
          <path d="M4 9.5h16" strokeWidth="2" />
          {/* Colonnade Pillars */}
          <line x1="6" y1="10.5" x2="6" y2="17.5" />
          <line x1="10" y1="10.5" x2="10" y2="17.5" />
          <line x1="14" y1="10.5" x2="14" y2="17.5" />
          <line x1="18" y1="10.5" x2="18" y2="17.5" />
          {/* Base foundation steps */}
          <path d="M2 18h20" strokeWidth="1.8" />
          <path d="M4 20.5h16" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      id: 'videos',
      title: 'YouTube Videos',
      hindi: 'सीखें और आगे बढ़ें',
      iconBg: 'bg-[#DC2626]', // Red
      action: 'section-videos',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* YouTube display screen */}
          <rect x="2" y="4.5" width="20" height="15" rx="3.5" fill="rgba(255,255,255,0.12)" />
          {/* Centered White Play Triangle */}
          <polygon points="10 9 16 12 10 15 10 9" fill="white" stroke="white" strokeWidth="1" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Horizontal 8-Item Balanced Strip on Desktop; Responsive Grid on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-200/90">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.action)}
              className="group p-3 sm:p-2.5 xl:p-3.5 flex flex-col items-center text-center justify-start hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              {/* Rounded-square icon badge with consistent dimensions */}
              <div
                className={`w-11 h-11 rounded-xl ${cat.iconBg} flex items-center justify-center shadow-xs group-hover:scale-108 group-hover:shadow-md transition-all duration-200 mb-2 shrink-0`}
              >
                {cat.icon}
              </div>

              {/* English Category Name */}
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                {cat.title}
              </span>

              {/* Hindi Subtitle */}
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                {cat.hindi}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
