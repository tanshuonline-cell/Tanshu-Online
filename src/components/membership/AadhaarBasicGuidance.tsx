import React from 'react';
import { ShieldCheck, MessageCircle, LockKeyhole, ExternalLink, FileText, Info } from 'lucide-react';
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
        privacyTitle: 'Privacy और सुरक्षित उपयोग',
        privacy: 'यह पेज केवल सामान्य जानकारी देता है। यहाँ अपना Aadhaar number, OTP, पूरा Aadhaar card, personal documents या bank details न भेजें। हम इस जानकारी को समझाने के लिए कोई Aadhaar document upload नहीं माँगते। आवेदन केवल UIDAI के official portal/app/centre से करें।',
        officialTitle: 'आधिकारिक UIDAI लिंक',
        portal: 'myAadhaar Portal',
        updates: 'Aadhaar Update जानकारी',
        documents: 'Acceptable Documents / Forms',
        faq: 'UIDAI FAQ और सहायता',
        termsTitle: 'जरूरी जानकारी और शर्तें',
        disclaimer: 'TANSHU ONLINE एक स्वतंत्र information platform है; UIDAI या भारत सरकार की आधिकारिक वेबसाइट/एजेंसी नहीं है। यह जानकारी approval, update, eligibility या processing time की guarantee नहीं है। UIDAI के नियम और स्वीकार्य दस्तावेज़ बदल सकते हैं—आवेदन से पहले official source जाँचें।',
        note: 'Basic Membership में Aadhaar update से जुड़ी जानकारी और मार्गदर्शन, निजी Chat तथा घोषित Basic Tools शामिल होंगे। TANSHU ONLINE आपकी ओर से Aadhaar update request submit नहीं करता। सरकारी आवेदन और अंतिम निर्णय संबंधित सरकारी विभाग/UIDAI के अधिकार में हैं।',
        chat: 'अपनी परिस्थिति के अनुसार सवाल पूछने के लिए Basic Membership की निजी Chat का उपयोग करें।',
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
        privacyTitle: 'Privacy and safe use',
        privacy: 'This page provides general information only. Do not send your Aadhaar number, OTP, full Aadhaar card, personal documents or bank details here. We do not ask you to upload Aadhaar documents to explain this information. Submit applications only through the official UIDAI portal/app/centre.',
        officialTitle: 'Official UIDAI links',
        portal: 'myAadhaar Portal',
        updates: 'Aadhaar Update Information',
        documents: 'Acceptable Documents / Forms',
        faq: 'UIDAI FAQs and Help',
        termsTitle: 'Important information and terms',
        disclaimer: 'TANSHU ONLINE is an independent information platform, not an official UIDAI or Government of India website/agency. This information does not guarantee approval, an update, eligibility or processing time. UIDAI rules and accepted documents may change—check official sources before applying.',
        note: 'Basic Membership includes Aadhaar update information and guidance, private Chat and the listed Basic Tools. TANSHU ONLINE does not submit Aadhaar update requests on your behalf. Government applications and final decisions remain with the relevant government department/UIDAI.',
        chat: 'Use the private Chat included with Basic Membership to ask questions about your own situation.',
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

      <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-bold text-emerald-950"><LockKeyhole className="h-4 w-4" />{content.privacyTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-950/90">{content.privacy}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-bold text-blue-950"><ShieldCheck className="h-4 w-4" />{content.officialTitle}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://myaadhaar.uidai.gov.in/" target="_blank" rel="noreferrer">{content.portal}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://www.uidai.gov.in/en/my-aadhaar.html" target="_blank" rel="noreferrer">{content.updates}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://www.uidai.gov.in/enrolment-update.html" target="_blank" rel="noreferrer">{content.documents}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://uidai.gov.in/" target="_blank" rel="noreferrer">{content.faq}<ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-bold text-amber-950"><Info className="h-4 w-4" />{content.termsTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-amber-950/90">{content.disclaimer}</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{content.note}</p>
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-slate-700">{content.chat}</p>
    </section>
  );
};
