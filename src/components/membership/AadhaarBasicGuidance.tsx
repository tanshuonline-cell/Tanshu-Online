import React from 'react';
import { ShieldCheck, MessageCircle, LockKeyhole } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AadhaarBasicGuidance: React.FC = () => {
  const { isHindi } = useLanguage();

  const content = isHindi
    ? {
        eyebrow: 'BASIC ₹49 MEMBERSHIP',
        title: 'आपको किस तरह की मदद मिलेगी?',
        intro: 'अपनी समस्या और परिस्थिति निजी Chat में बताइए। आपको उपलब्ध आधिकारिक नियमों और दस्तावेजों के आधार पर प्रक्रिया समझने में मदद मिलेगी।',
        items: [
          'Aadhaar में पिता या पति के नाम से जुड़ी परेशानी और नाम में अंतर',
          'जब माता-पिता के जरूरी दस्तावेज उपलब्ध न हों',
          'जब केवल एड्रेस बदलने या सही कराने की जरूरत हो',
          'अपने पास मौजूद दस्तावेजों के आधार पर संभावित प्रक्रिया समझना',
          'PAN Card, Voter ID, Birth Certificate, Ration Card, बिहार सरकार और अन्य सार्वजनिक सेवाओं की जानकारी',
        ],
        videos: 'संबंधित विषयों पर उपयोगी छोटे वीडियो भी उपलब्ध हो सकते हैं। हर सवाल के लिए वीडियो होने की गारंटी नहीं है।',
        privacy: 'अपना Aadhaar नंबर, OTP या निजी दस्तावेज यहाँ साझा न करें। हम आपकी ओर से कोई सरकारी आवेदन जमा नहीं करते और किसी अपडेट की मंजूरी की गारंटी नहीं देते।',
        note: 'अपनी परिस्थिति के अनुसार सवाल पूछने के लिए Basic Membership की निजी Chat का उपयोग करें।',
      }
    : {
        eyebrow: 'BASIC ₹49 MEMBERSHIP',
        title: 'What kind of help is included?',
        intro: 'Explain your situation in private Chat. Guidance will be based on available official rules and the documents relevant to your case.',
        items: [
          'Concerns about a father’s or husband’s name in Aadhaar and name mismatches',
          'Situations where a parent’s required documents are unavailable',
          'Cases where only an address change or correction is needed',
          'Understanding possible procedures based on the documents you already have',
          'Information about PAN Card, Voter ID, Birth Certificate, Ration Card, Bihar Government and other public services',
        ],
        videos: 'Helpful short videos on relevant topics may also be available. A video is not guaranteed for every question.',
        privacy: 'Do not share your Aadhaar number, OTP or private documents here. We do not submit government applications on your behalf or guarantee approval of any update.',
        note: 'Use the private Chat included with Basic Membership to ask questions about your own situation.',
      };

  return (
    <section id="basic-guidance" className="mt-10 scroll-mt-24 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-blue-50 p-3 text-blue-700"><MessageCircle className="h-6 w-6" /></span>
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-blue-700">{content.eyebrow}</p>
          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{content.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{content.intro}</p>
        </div>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {content.items.map((item) => (
          <li key={item} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-950">{content.videos}</p>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex gap-2 text-sm leading-6 text-emerald-950"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />{content.privacy}</p>
      </div>
      <p className="mt-4 text-xs font-semibold leading-5 text-slate-700">{content.note}</p>
    </section>
  );
};
