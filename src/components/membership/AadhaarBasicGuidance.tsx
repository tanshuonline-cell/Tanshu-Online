import React from 'react';
import { ExternalLink, ShieldCheck, FileText, Clock3, Info, LockKeyhole } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AadhaarBasicGuidance: React.FC = () => {
  const { isHindi } = useLanguage();

  const text = isHindi ? {
    eyebrow: 'BASIC ₹49 MEMBERSHIP — INFORMATION GUIDE',
    title: 'Aadhaar पिता का नाम और Address Update की जानकारी',
    intro: 'यह जानकारी समझने के लिए है कि Aadhaar में पिता का नाम किस जगह दिख सकता है, Address में C/o कैसे काम करता है, कौन-से update विकल्प उपलब्ध हैं और आधिकारिक प्रक्रिया कहाँ से करनी है।',
    important: 'सबसे जरूरी बात',
    importantBody: 'UIDAI के सामान्य Aadhaar demographic fields में Aadhaar धारक का अपना Name, Address, Date of Birth, Gender, Mobile और Email शामिल हैं। पिता का नाम अलग standalone demographic field के रूप में सामान्य adult Aadhaar update सूची में नहीं है। Address में “C/o” (Care of) line में किसी व्यक्ति का नाम दिख सकता है; यह अलग Father Name field या रिश्ते का प्रमाण नहीं है।',
    childTitle: 'बच्चों के Aadhaar में माता-पिता की जानकारी',
    childBody: 'बच्चों के enrolment और Head of Family (HoF) आधारित address update में माता-पिता/अभिभावक की जानकारी और relationship proof की भूमिका हो सकती है। सही तरीका बच्चे की उम्र, उपलब्ध दस्तावेज़ और UIDAI के मौजूदा नियमों पर निर्भर करता है।',
    addressTitle: 'Address या C/o में सुधार कैसे करें?',
    addressBody: 'यदि बदलाव Address/C/o line से जुड़ा है, तो myAadhaar या UIDAI Aadhaar App में उपलब्ध पात्र online सुविधा देखें; इसके लिए Aadhaar से registered mobile पर OTP/ऐप verification की जरूरत हो सकती है। अन्यथा Aadhaar Enrolment/Update Centre जाएँ। अपने नाम का valid Proof of Address (PoA) न होने पर, पात्र मामलों में उसी पते पर रहने वाले परिवार के Head of Family की सहमति और Proof of Relationship (PoR) के आधार पर HoF route उपलब्ध हो सकता है।',
    docsTitle: 'कौन-से दस्तावेज़ लग सकते हैं?',
    docsBody: 'Document-based address update के लिए UIDAI की current List of Acceptable Documents में दिया गया valid PoA चाहिए। HoF route में UIDAI द्वारा स्वीकार किया गया Proof of Relationship और HoF की consent/verification जरूरी हो सकती है। Aadhaar धारक के अपने नाम में correction के लिए अलग valid Proof of Identity (PoI) और लागू प्रक्रिया की जरूरत होती है। हर document हर update के लिए मान्य नहीं होता—जमा करने से पहले UIDAI की latest list जाँचें।',
    stepsTitle: 'कहाँ और कैसे आवेदन करें?',
    step1: 'Address update की पात्र online सुविधा के लिए आधिकारिक myAadhaar portal / Aadhaar App देखें।',
    step2: 'Name, Date of Birth, Gender और biometric जैसे update के लिए Aadhaar Enrolment/Update Centre की प्रक्रिया अपनाएँ।',
    step3: 'दस्तावेज़ों में नाम और पता साफ, सही और एक-दूसरे से मेल खाते होने चाहिए। आवेदन के बाद acknowledgement / SRN / URN सुरक्षित रखें और official status portal पर स्थिति देखें।',
    timeTitle: 'कितना समय लग सकता है?',
    timeBody: 'UIDAI के अनुसार update request की प्रक्रिया में 90 दिन तक लग सकते हैं। कुछ अनुरोध इससे पहले पूरे हो जाते हैं, लेकिन समय, स्वीकृति या परिणाम की कोई गारंटी नहीं दी जा सकती।',
    limitsTitle: 'कौन-सा update हो सकता है और क्या नहीं?',
    limitsBody: 'UIDAI की प्रक्रिया के अनुसार Name, Address, Date of Birth, Gender, Mobile, Email और biometric details (photo, fingerprints, iris) के लिए update सेवाएँ उपलब्ध हैं—लेकिन हर update के लिए अलग पात्रता, दस्तावेज़, केंद्र/online तरीका और लागू सीमाएँ हैं। पिता का नाम अलग field में बदलने का सामान्य विकल्प नहीं है; पहले यह समझें कि मामला C/o address line, child/HoF record या Aadhaar धारक के अपने नाम का है।',
    privacyTitle: 'Privacy और सुरक्षित उपयोग',
    privacyBody: 'यह पेज केवल सामान्य जानकारी देता है। यहाँ अपना Aadhaar number, OTP, पूरा Aadhaar card, personal documents या bank details न भेजें। हम इस जानकारी को समझाने के लिए कोई Aadhaar document upload नहीं माँगते। आवेदन केवल UIDAI के official portal/app/centre से करें।',
    disclaimer: 'TANSHU ONLINE एक स्वतंत्र information platform है; UIDAI या भारत सरकार की आधिकारिक वेबसाइट/एजेंसी नहीं है। यह जानकारी approval, update, eligibility या processing time की guarantee नहीं है। UIDAI के नियम और स्वीकार्य दस्तावेज़ बदल सकते हैं—आवेदन से पहले official source जाँचें।',
    official: 'आधिकारिक UIDAI लिंक',
    portal: 'myAadhaar Portal',
    updates: 'Aadhaar Update जानकारी',
    documents: 'Acceptable Documents / Forms',
    faq: 'UIDAI FAQ और सहायता',
    note: 'Basic membership में इस चरण पर Aadhaar update से जुड़ी जानकारी और मार्गदर्शन शामिल है; TANSHU ONLINE आपकी ओर से Aadhaar update request submit नहीं करता।'
  } : {
    eyebrow: 'BASIC ₹49 MEMBERSHIP — INFORMATION GUIDE',
    title: 'Aadhaar Father Name and Address Update Information',
    intro: 'Understand where a father’s name may appear in Aadhaar, how the C/o address line works, which update options exist, and where to follow the official process.',
    important: 'Important clarification',
    importantBody: 'UIDAI’s regular Aadhaar demographic fields include the Aadhaar holder’s own Name, Address, Date of Birth, Gender, Mobile and Email. A father’s name is not a separate standalone demographic field in the normal adult Aadhaar update list. A person’s name may appear in the address “C/o” (Care of) line; this is not a separate Father Name field and does not by itself prove a relationship.',
    childTitle: 'Parent details in a child’s Aadhaar',
    childBody: 'Parent/guardian details and relationship proof may be relevant during child enrolment and a Head of Family (HoF)-based address update. The applicable route depends on the child’s age, available documents and current UIDAI rules.',
    addressTitle: 'How can Address or C/o be updated?',
    addressBody: 'For a change related to the Address/C/o line, check the eligible online service on myAadhaar or the official Aadhaar App; registered-mobile OTP or app verification may be required. Otherwise, visit an Aadhaar Enrolment/Update Centre. If you do not have a valid Proof of Address (PoA) in your own name, eligible residents may use the HoF route with consent from a family member living at the same address and accepted Proof of Relationship (PoR).',
    docsTitle: 'Which documents may be required?',
    docsBody: 'A document-based address update requires a valid PoA from UIDAI’s current List of Acceptable Documents. The HoF route may require UIDAI-accepted Proof of Relationship and HoF consent/verification. A correction to the Aadhaar holder’s own name requires a separate valid Proof of Identity (PoI) and the applicable process. Not every document is accepted for every update—check the latest UIDAI list before applying.',
    stepsTitle: 'Where and how to apply',
    step1: 'For eligible online address updates, use the official myAadhaar portal / Aadhaar App.',
    step2: 'For Name, Date of Birth, Gender and biometric updates, follow the Aadhaar Enrolment/Update Centre process.',
    step3: 'Ensure documents show clear, correct and matching details. Keep the acknowledgement / SRN / URN and check status through the official portal.',
    timeTitle: 'How long can it take?',
    timeBody: 'UIDAI says an update request can take up to 90 days to process. Some requests finish sooner, but approval, outcome or processing time cannot be guaranteed.',
    limitsTitle: 'What can and cannot be updated?',
    limitsBody: 'UIDAI provides update services for Name, Address, Date of Birth, Gender, Mobile, Email and biometric details (photo, fingerprints and iris), subject to separate eligibility, documents, online/centre routes and applicable limits. There is no ordinary separate field to change a father’s name; first identify whether the issue concerns the C/o address line, a child/HoF record, or the Aadhaar holder’s own name.',
    privacyTitle: 'Privacy and safe use',
    privacyBody: 'This page provides general information only. Do not send your Aadhaar number, OTP, full Aadhaar card, personal documents or bank details here. We do not ask you to upload Aadhaar documents to read this guide. Submit requests only through UIDAI’s official portal/app/centre.',
    disclaimer: 'TANSHU ONLINE is an independent information platform, not an official UIDAI or Government of India website/agency. This information does not guarantee approval, an update, eligibility or processing time. UIDAI rules and accepted documents can change—check official sources before applying.',
    official: 'Official UIDAI links',
    portal: 'myAadhaar Portal',
    updates: 'Aadhaar Update Information',
    documents: 'Acceptable Documents / Forms',
    faq: 'UIDAI FAQs and Help',
    note: 'At this stage, Basic membership provides Aadhaar update information and guidance; TANSHU ONLINE does not submit an Aadhaar update request on your behalf.'
  };

  return (
    <section id="basic-guidance" className="mt-10 scroll-mt-24 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-blue-50 p-3 text-blue-700"><FileText className="h-6 w-6" /></span>
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.16em] text-blue-700">{text.eyebrow}</p>
          <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">{text.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.intro}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-bold text-amber-950">{text.important}</h3>
          <p className="mt-2 text-sm leading-6 text-amber-950/90">{text.importantBody}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-900">{text.childTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.childBody}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-900">{text.addressTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.addressBody}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-900">{text.docsTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.docsBody}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-bold text-slate-900">{text.stepsTitle}</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>{text.step1}</li><li>{text.step2}</li><li>{text.step3}</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-900"><Clock3 className="h-4 w-4 text-blue-700" />{text.timeTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text.timeBody}</p>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-slate-200 p-4">
        <h3 className="font-bold text-slate-900">{text.limitsTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.limitsBody}</p>
      </article>

      <article className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="flex items-center gap-2 font-bold text-emerald-950"><LockKeyhole className="h-4 w-4" />{text.privacyTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-950/90">{text.privacyBody}</p>
      </article>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <h3 className="flex items-center gap-2 font-bold text-blue-950"><ShieldCheck className="h-4 w-4" />{text.official}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://myaadhaar.uidai.gov.in/" target="_blank" rel="noreferrer">{text.portal}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://www.uidai.gov.in/en/my-aadhaar.html" target="_blank" rel="noreferrer">{text.updates}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://www.uidai.gov.in/enrolment-update.html" target="_blank" rel="noreferrer">{text.documents}<ExternalLink className="h-3.5 w-3.5" /></a>
          <a className="inline-flex items-center gap-1.5 text-blue-800 underline" href="https://uidai.gov.in/" target="_blank" rel="noreferrer">{text.faq}<ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{text.disclaimer}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">{text.note}</p>
    </section>
  );
};
