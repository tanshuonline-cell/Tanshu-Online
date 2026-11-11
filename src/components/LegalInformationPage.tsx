import React, { useEffect } from 'react';
import { Mail, MessageCircle, Instagram, Facebook, Youtube, MapPin, ShieldCheck, Clock3 } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLanguage } from '../context/LanguageContext';

type LegalSection = { title: string; body: React.ReactNode };

const mail = 'tanshuonline@gmail.com';

export const LEGAL_PAGE_PATHS = [
  '/privacy-policy',
  '/terms-and-conditions',
  '/disclaimer',
  '/refund-policy',
  '/copyright',
  '/contact',
];

export const LegalInformationPage: React.FC = () => {
  const { isHindi } = useLanguage();
  const path = window.location.pathname;
  const hindi = isHindi;

  const pages: Record<string, { title: string; description: string; intro: string; sections: LegalSection[] }> = {
    '/privacy-policy': {
      title: hindi ? 'गोपनीयता नीति' : 'Privacy Policy',
      description: hindi ? 'TANSHU ONLINE पर जानकारी, दस्तावेज़, कुकीज़ और तृतीय-पक्ष सेवाओं का उपयोग कैसे होता है।' : 'How TANSHU ONLINE handles information, documents, cookies and third-party services.',
      intro: hindi ? 'यह नीति बताती है कि TANSHU ONLINE वेबसाइट और उसकी सेवाओं का उपयोग करते समय कौन-सी जानकारी ली जा सकती है, उसका उपयोग क्यों होता है और गोपनीयता संबंधी अनुरोध कैसे भेजें।' : 'This policy explains what information may be collected when you use TANSHU ONLINE, why it is used, how service providers may process it, and how to contact us about privacy.',
      sections: [
        { title: hindi ? '1. जानकारी जो आप देते हैं' : '1. Information you provide', body: hindi ? 'Digital Seva अनुरोध में आपका नाम, मोबाइल नंबर, ईमेल, चुनी गई सेवा, फॉर्म में भरी गई जानकारी, चुने गए दस्तावेज़ और आपके द्वारा अपलोड की गई JPG, PNG या PDF फाइलें शामिल हो सकती हैं। साइबर कैफ़े/CSC/एजेंट अनुरोध में ऑपरेटर, केंद्र या एजेंसी का नाम, संपर्क और पता भी लिया जा सकता है। भुगतान या प्रीमियम वीडियो के लिए मोबाइल नंबर, ईमेल (यदि दिया गया हो), ऑर्डर संदर्भ, राशि और भुगतान स्थिति प्रोसेस हो सकती है। केवल वही जानकारी दें जो चुनी गई सेवा के लिए आवश्यक है।' : 'A Digital Seva request may include your name, mobile number, email, selected service, form details, selected document types and JPG, PNG or PDF files you choose to upload. Requests submitted by a cyber cafe, CSC or agent may also include operator, centre or agency contact details and address. Paid video access may involve a mobile number, optional email, order reference, amount and payment status. Please provide only information needed for the selected service.' },
        { title: hindi ? '2. जानकारी का उपयोग' : '2. How information is used', body: hindi ? 'जानकारी का उपयोग अनुरोध प्राप्त करने, सेवा देने, आपसे संपर्क करने, दस्तावेज़/फॉर्म की जाँच, बुकिंग स्थिति बताने, भुगतान सत्यापित करने, खरीदे गए वीडियो का एक्सेस देने, सुरक्षा और विवाद/कानूनी रिकॉर्ड रखने के लिए किया जाता है। आपकी जानकारी को विज्ञापन के लिए बेचने का दावा हम नहीं करते; सेवा चलाने वाले प्रदाताओं के साथ आवश्यक जानकारी साझा हो सकती है।' : 'Information is used to receive and process requests, contact you, review submitted details, provide booking status, verify payments, grant purchased video access, protect the service and maintain necessary dispute or legal records. Information may be shared with service providers where required to operate the requested feature. We do not sell personal information for advertising.' },
        { title: hindi ? '2.1 तकनीकी जानकारी' : '2.1 Technical information', body: hindi ? 'वेबसाइट की होस्टिंग और सुरक्षा सेवाएँ साइट डिलीवर करने, त्रुटि/दुरुपयोग रोकने और सुरक्षा बनाए रखने के लिए IP पता, ब्राउज़र/डिवाइस प्रकार, अनुरोध का समय और तकनीकी लॉग जैसी जानकारी प्रोसेस कर सकती हैं।' : 'Hosting and security providers may process information such as IP address, browser or device type, request timestamps and technical logs to deliver the site, prevent abuse and maintain security.' },
        { title: hindi ? '3. टूल्स और फाइल प्रोसेसिंग' : '3. Tools and file processing', body: hindi ? 'कई फोटो, PDF और दस्तावेज़ टूल आपके ब्राउज़र/डिवाइस पर ही काम करते हैं। कुछ सुविधाओं को मॉडल, लाइब्रेरी या वीडियो सामग्री लोड करने के लिए बाहरी नेटवर्क की जरूरत हो सकती है। Digital Seva फॉर्म में आप स्वयं जो विवरण और दस्तावेज़ जमा करते हैं, वे अनुरोध पूरा करने के लिए हमारे सर्वर और संबंधित निजी स्टोरेज सेवा तक भेजे जाते हैं। इसलिए हर सुविधा को “100% क्लाइंट-साइड” मानकर न चलें; संबंधित टूल/फॉर्म पर दी गई सूचना पढ़ें।' : 'Many photo, PDF and document tools process files in your browser or on your device. Some features need an internet connection to load models, libraries or video content. Details and documents that you actively submit through Digital Seva forms are sent to our server and the associated private storage service so the requested service can be handled. Do not assume every feature is entirely client-side; read the notice shown with the relevant tool or form.' },
        { title: hindi ? '4. स्टोरेज और सुरक्षा' : '4. Storage and security', body: hindi ? 'Digital Seva अनुरोध का रिकॉर्ड Cloudflare की डेटाबेस सेवाओं में रखा जा सकता है और अपलोड किए गए दस्तावेज़ निजी Supabase Storage में रखे जा सकते हैं। कुछ आवेदन विवरण सेव करने से पहले एन्क्रिप्ट किए जाते हैं और दस्तावेज़ों तक पहुँच सीमित रखने के तकनीकी उपाय हैं। भुगतान Cashfree के माध्यम से होने पर भुगतान प्रदाता अपनी प्रणाली में भुगतान संबंधी जानकारी प्रोसेस करता है। इंटरनेट पर कोई भी प्रणाली पूर्ण सुरक्षा की गारंटी नहीं दे सकती।' : 'Digital Seva request records may be stored using Cloudflare database services, while uploaded documents may be stored in private Supabase Storage. Certain application details are encrypted before being stored and technical controls are used to restrict document access. Where checkout is provided, Cashfree processes payment information through its own systems. No internet-based system can guarantee absolute security.' },
        { title: hindi ? '5. ब्राउज़र स्टोरेज और कुकीज़' : '5. Browser storage and cookies', body: hindi ? 'वेबसाइट भाषा पसंद, चुनी गई सेवा या खरीदे गए वीडियो के सत्र जैसी आवश्यक सुविधा के लिए ब्राउज़र के local storage और सुरक्षित session cookies का उपयोग कर सकती है। इन्हें बंद करने या हटाने पर कुछ सुविधाएँ काम न करें या दोबारा सेटअप माँगें।' : 'The website may use browser local storage for preferences such as language, a selected service or a purchased-video session, and secure session cookies for protected access. Disabling or clearing them may affect some features or require you to set them up again.' },
        { title: hindi ? '6. बाहरी सेवाएँ' : '6. Third-party services', body: <>{hindi ? 'कुछ सुविधाएँ Cloudflare (होस्टिंग/डेटाबेस), Supabase (निजी दस्तावेज़ स्टोरेज), Cashfree (भुगतान), Google सेवाएँ (फ़ॉन्ट/मॉडल), jsDelivr (लाइब्रेरी) और YouTube (वीडियो) पर निर्भर हो सकती हैं। इन प्रदाताओं की अपनी गोपनीयता नीतियाँ लागू होती हैं:' : 'Some features may rely on Cloudflare (hosting/database), Supabase (private document storage), Cashfree (payments), Google services (fonts/models), jsDelivr (libraries) and YouTube (video). Their own privacy policies apply:'}<ul className="mt-2 list-disc pl-5 space-y-1"><li><a className="underline text-blue-700" href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare</a></li><li><a className="underline text-blue-700" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a></li><li><a className="underline text-blue-700" href="https://www.cashfree.com/privacy/" target="_blank" rel="noopener noreferrer">Cashfree</a></li><li><a className="underline text-blue-700" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a></li><li><a className="underline text-blue-700" href="https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net" target="_blank" rel="noopener noreferrer">jsDelivr</a></li><li><a className="underline text-blue-700" href="https://www.youtube.com/howyoutubeworks/our-commitments/protecting-user-data/" target="_blank" rel="noopener noreferrer">YouTube</a></li></ul></> },
        { title: hindi ? '7. विज्ञापन और Google AdSense कुकीज़' : '7. Advertising and Google AdSense cookies', body: <>{hindi ? 'जब इस वेबसाइट पर Google AdSense या अन्य विज्ञापन नेटवर्क के विज्ञापन दिखाए जाते हैं, तो Google और उसके विज्ञापन साझेदार आपकी इस या अन्य वेबसाइटों पर पिछली विज़िट के आधार पर विज्ञापन दिखाने के लिए कुकीज़, वेब बीकन, IP पते या अन्य पहचानकर्ताओं का उपयोग कर सकते हैं। विज्ञापन कुकीज़ और डेटा उपयोग के बारे में जानकारी यहाँ पढ़ें: ' : 'When Google AdSense or other advertising networks display ads on this website, Google and its advertising partners may use cookies, web beacons, IP addresses or other identifiers to serve ads based on your prior visits to this or other websites. Read: '}<a className="underline text-blue-700" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses data when you use our partners’ sites or apps</a>. {hindi ? 'आप ' : 'You can turn off personalised advertising in '}<a className="underline text-blue-700" href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{hindi ? ' में वैयक्तिकृत विज्ञापन बंद कर सकते हैं या ' : ' or review choices at '}<a className="underline text-blue-700" href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>. {hindi ? 'यदि विज्ञापन प्रदाता या लागू सहमति आवश्यकताएँ बदलती हैं, तो यह नीति अपडेट की जाएगी।' : 'This policy will be updated if advertising providers or applicable consent requirements change.'}</> },
        { title: hindi ? '8. जानकारी रखने की अवधि' : '8. How long information is kept', body: hindi ? 'जानकारी अनुरोध पूरा करने, ग्राहक सहायता, सुरक्षा, विवाद समाधान और लागू कानूनी/लेखा आवश्यकताओं के लिए जितनी जरूरी हो उतनी अवधि तक रखी जा सकती है। अलग-अलग रिकॉर्ड की अवधि अलग हो सकती है। जहाँ लागू हो और कोई कानूनी रोक न हो, आप नीचे दिए ईमेल पर जानकारी हटाने का अनुरोध कर सकते हैं।' : 'Information may be retained for as long as reasonably needed to complete the request, provide support, protect the service, resolve disputes and meet applicable legal or accounting requirements. Retention can differ by record type. Where applicable and not legally restricted, you may request deletion using the contact details below.' },
        { title: hindi ? '9. आपके अनुरोध और संपर्क' : '9. Your requests and contact', body: <> {hindi ? 'अपनी जानकारी देखने, सुधारने, हटाने, सहमति वापस लेने या गोपनीयता संबंधी शिकायत के लिए हमें ईमेल करें। अनुरोध पहचानने के लिए बुकिंग संदर्भ माँगा जा सकता है; ईमेल में OTP, पासवर्ड या पूरा आधार/PAN नंबर न भेजें।' : 'To ask about your information, request correction or deletion, withdraw consent where applicable, or raise a privacy concern, email us. We may ask for a booking reference to identify the request; do not email an OTP, password or full Aadhaar/PAN number.'} <a className="font-semibold text-blue-700 underline" href={`mailto:${mail}`}>{mail}</a></> },
      ],
    },
    '/terms-and-conditions': {
      title: hindi ? 'नियम और शर्तें' : 'Terms & Conditions',
      description: hindi ? 'TANSHU ONLINE वेबसाइट और डिजिटल टूल्स के उपयोग की शर्तें।' : 'Terms governing use of the TANSHU ONLINE website and digital tools.',
      intro: hindi ? 'TANSHU ONLINE का उपयोग करके आप इन शर्तों को मानते हैं। यदि आप सहमत नहीं हैं, तो संबंधित वेबसाइट या सेवा का उपयोग न करें।' : 'By using TANSHU ONLINE, you agree to these terms. If you do not agree, do not use the relevant website or service.',
      sections: [
        { title: hindi ? 'स्वतंत्र प्लेटफ़ॉर्म' : 'Independent platform', body: hindi ? 'TANSHU ONLINE एक स्वतंत्र निजी डिजिटल टूल और सहायता प्लेटफ़ॉर्म है। यह भारत सरकार, बिहार सरकार, UIDAI, ECI या किसी अन्य सरकारी विभाग का आधिकारिक पोर्टल या एजेंट नहीं है, जब तक किसी विशेष सेवा के लिए स्पष्ट अधिकृत संबंध न बताया गया हो।' : 'TANSHU ONLINE is an independent private digital tools and assistance platform. It is not an official portal or agent of the Government of India, Government of Bihar, UIDAI, ECI or any government department unless a specific authorised relationship is expressly stated.' },
        { title: hindi ? 'टूल्स का उपयोग' : 'Use of tools', body: hindi ? 'टूल्स का उपयोग वैध व्यक्तिगत, शैक्षणिक या व्यावसायिक कार्यों के लिए करें। धोखाधड़ी, जाली दस्तावेज़, अनधिकृत पहुँच, किसी की गोपनीयता का उल्लंघन या कानून-विरुद्ध काम के लिए इनका उपयोग न करें।' : 'Use the tools for lawful personal, educational or business purposes. Do not use them for fraud, forged documents, unauthorised access, privacy violations or unlawful activity.' },
        { title: hindi ? 'जानकारी और सरकारी निर्णय' : 'Information and official decisions', body: hindi ? 'सरकारी नियम, पात्रता, शुल्क, दस्तावेज़ और पोर्टल प्रक्रियाएँ बदल सकती हैं। आवेदन से पहले संबंधित आधिकारिक पोर्टल पर वर्तमान जानकारी जाँचें। आवेदन स्वीकार करना, मंज़ूरी, अस्वीकृति और प्रमाणपत्र जारी करना संबंधित प्राधिकरण का निर्णय है; TANSHU ONLINE इसकी गारंटी नहीं देता।' : 'Government rules, eligibility, fees, documents and portal procedures may change. Verify current information on the relevant official portal before applying. Acceptance, approval, rejection and issuance of certificates are decisions of the relevant authority; TANSHU ONLINE does not guarantee them.' },
        { title: hindi ? 'सेवा अनुरोध और भुगतान' : 'Service requests and payments', body: hindi ? 'जहाँ Digital Seva या प्रीमियम सामग्री उपलब्ध हो, सेवा का दायरा, आवश्यक जानकारी, शुल्क और लागू शर्तें अनुरोध/भुगतान से पहले दिखाई जाएँगी। भुगतान केवल वेबसाइट पर उपलब्ध अधिकृत checkout के माध्यम से करें। सरकारी शुल्क और TANSHU ONLINE सेवा शुल्क अलग हो सकते हैं। रद्दीकरण और रिफंड के लिए Refund Policy लागू होगी।' : 'Where Digital Seva or premium content is offered, the scope, required information, charges and applicable conditions will be shown before request submission or payment. Pay only through an authorised checkout presented on the website. Government charges and TANSHU ONLINE service charges may be separate. The Refund Policy applies to cancellations and refunds.' },
        { title: hindi ? 'आपकी जिम्मेदारी' : 'Your responsibility', body: hindi ? 'आप सही और वैध जानकारी दें, दस्तावेज़ जमा करने का अधिकार रखते हों और अंतिम सबमिशन से पहले विवरण जाँचें। OTP, पासवर्ड, UPI PIN या recovery code किसी के साथ साझा न करें।' : 'You must provide accurate and lawful information, have the right to submit the documents, and review details before final submission. Never share an OTP, password, UPI PIN or recovery code.' },
        { title: hindi ? 'बौद्धिक संपदा' : 'Intellectual property', body: hindi ? 'वेबसाइट का नाम, ब्रांडिंग, मूल लेखन, डिज़ाइन और स्वयं निर्मित सामग्री TANSHU ONLINE या उसके संबंधित अधिकार धारकों की है। तीसरे पक्ष की लाइब्रेरी, फ़ॉन्ट, लोगो, वीडियो और सामग्री उनके अपने लाइसेंस/अधिकारों के अधीन हैं।' : 'The website name, branding, original writing, design and materials created for the site belong to TANSHU ONLINE or their respective rights holders. Third-party libraries, fonts, logos, videos and materials remain subject to their own licences and rights.' },
        { title: hindi ? 'बाहरी लिंक और उपलब्धता' : 'External links and availability', body: hindi ? 'बाहरी वेबसाइटें अपने संचालकों के नियंत्रण में हैं। हम उनकी सामग्री, उपलब्धता या गोपनीयता प्रथाओं के लिए जिम्मेदार नहीं हैं। वेबसाइट/टूल्स में बदलाव, रखरखाव या अस्थायी रुकावट हो सकती है।' : 'External websites are controlled by their respective operators. We are not responsible for their content, availability or privacy practices. The website and tools may change, undergo maintenance or experience temporary interruptions.' },
        { title: hindi ? 'कानूनी अधिकार' : 'Legal rights', body: hindi ? 'इन शर्तों से लागू उपभोक्ता या अन्य कानून के तहत आपके अधिकार समाप्त नहीं होते। किसी प्रावधान के अमान्य होने पर बाकी शर्तें लागू रहेंगी।' : 'These terms do not remove rights available under applicable consumer or other laws. If any provision is unenforceable, the remaining provisions continue to apply.' },
      ],
    },
    '/disclaimer': {
      title: hindi ? 'अस्वीकरण' : 'Disclaimer',
      description: hindi ? 'TANSHU ONLINE की स्वतंत्र स्थिति, सरकारी जानकारी और डिजिटल टूल्स के बारे में महत्वपूर्ण सूचना।' : 'Important information about TANSHU ONLINE’s independent status, public information and digital tools.',
      intro: hindi ? 'TANSHU ONLINE नागरिकों और डिजिटल सेवा संचालकों के लिए स्वतंत्र जानकारी और उपयोगी टूल्स उपलब्ध कराता है।' : 'TANSHU ONLINE provides independent information and utility tools for citizens and digital service operators.',
      sections: [
        { title: hindi ? 'सरकारी संबद्धता नहीं' : 'No government affiliation', body: hindi ? 'TANSHU ONLINE भारत सरकार, बिहार सरकार, UIDAI, निर्वाचन आयोग, CSC या किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। सरकारी नाम, लोगो और ट्रेडमार्क उनके संबंधित स्वामियों के हैं। आधिकारिक आवेदन और भुगतान संबंधित सरकारी पोर्टल पर ही सत्यापित करें।' : 'TANSHU ONLINE is not an official website of the Government of India, Government of Bihar, UIDAI, Election Commission, CSC or any government department. Government names, logos and trademarks belong to their respective owners. Verify official applications and payments on the relevant government portal.' },
        { title: hindi ? 'जानकारी की सटीकता' : 'Accuracy of information', body: hindi ? 'सरकारी योजनाओं, दस्तावेज़ों, पात्रता, शुल्क और प्रक्रियाओं की जानकारी केवल सामान्य मार्गदर्शन है। नियम बदल सकते हैं या किसी राज्य/आवेदक के अनुसार अलग हो सकते हैं। किसी आवेदन या भुगतान से पहले आधिकारिक स्रोत से पुष्टि करें।' : 'Information about schemes, documents, eligibility, fees and procedures is general guidance only. Rules may change or differ by state or applicant. Confirm details with official sources before applying or paying.' },
        { title: hindi ? 'टूल आउटपुट' : 'Tool outputs', body: hindi ? 'फोटो, PDF, प्रिंट लेआउट, कैलकुलेशन या दस्तावेज़ आउटपुट को उपयोग से पहले स्वयं जाँचें। प्रिंटर, कागज़, डिवाइस और मूल फाइल के कारण परिणाम अलग हो सकते हैं। किसी सरकारी या परीक्षा पोर्टल की स्वीकृति की गारंटी नहीं है।' : 'Review photo, PDF, print-layout, calculation and document outputs before use. Results can vary with printers, paper, devices and source files. Acceptance by a government or examination portal is not guaranteed.' },
        { title: hindi ? 'सेवा और भुगतान' : 'Assistance and payments', body: hindi ? 'जहाँ निजी सहायता सेवा उपलब्ध है, TANSHU ONLINE केवल प्रकाशित सेवा दायरे के अनुसार सहायता देता है। सरकारी निर्णय संबंधित प्राधिकरण का है। सरकारी शुल्क और निजी सेवा शुल्क अलग हो सकते हैं; भुगतान से पहले विवरण पढ़ें।' : 'Where private assistance is offered, TANSHU ONLINE provides help only within the published service scope. Government decisions remain with the relevant authority. Government charges and private service charges may be separate; review the breakdown before payment.' },
        { title: hindi ? 'बाहरी सामग्री' : 'Third-party content', body: hindi ? 'बाहरी वेबसाइट, वीडियो, फ़ॉन्ट, मॉडल और सेवाएँ अपने प्रदाताओं के नियंत्रण में हैं और उनकी अपनी शर्तें लागू होती हैं।' : 'External websites, videos, fonts, models and services are controlled by their providers and are subject to their own terms.' },
      ],
    },
    '/refund-policy': {
      title: hindi ? 'रद्दीकरण और रिफंड नीति' : 'Cancellation & Refund Policy',
      description: hindi ? 'Digital Seva सहायता और प्रीमियम सामग्री के रद्दीकरण तथा रिफंड की शर्तें।' : 'Cancellation and refund information for Digital Seva assistance and premium content.',
      intro: hindi ? 'यदि वेबसाइट पर कोई भुगतान योग्य सेवा उपलब्ध है, तो भुगतान से पहले दिखाई गई सेवा-विशिष्ट शर्तें और लागू कानून इस नीति के साथ पढ़ें।' : 'If a paid service is offered on the website, read the service-specific terms shown before payment together with this policy and applicable law.',
      sections: [
        { title: hindi ? 'शुल्क का अलग विवरण' : 'Separate fee disclosure', body: hindi ? 'जहाँ लागू हो, सरकारी/प्रदाता शुल्क, TANSHU ONLINE सेवा शुल्क, टैक्स और भुगतान प्रदाता शुल्क भुगतान से पहले अलग-अलग दिखाए जाने चाहिए।' : 'Where applicable, government/provider fees, TANSHU ONLINE service fees, taxes and payment-provider charges should be disclosed separately before payment.' },
        { title: hindi ? 'सरकारी शुल्क' : 'Government fees', body: hindi ? 'सरकारी शुल्क का रिफंड संबंधित विभाग/प्रदाता के नियमों पर निर्भर करेगा। जमा न की गई राशि को जमा हुआ नहीं बताया जाएगा। यदि प्राधिकरण रिफंड की अनुमति देता है, तो उपलब्ध प्रक्रिया में सहायता दी जाएगी।' : 'Refund of government fees depends on the relevant department/provider rules. An amount not remitted must not be described as deposited. If the authority permits a refund, reasonable assistance with the available process will be provided.' },
        { title: hindi ? 'TANSHU ONLINE सेवा शुल्क' : 'TANSHU ONLINE service fee', body: hindi ? 'रद्दीकरण पर सेवा शुल्क का समायोजन भुगतान से पहले बताई गई शर्तों, वास्तव में पूरे किए गए काम और लागू उपभोक्ता कानून के अनुसार होगा। पूरी सेवा न मिलने पर बिना कमाए गए हिस्से की समीक्षा की जाएगी।' : 'On cancellation, any service-fee adjustment will follow the terms disclosed before payment, work actually completed and applicable consumer law. If the agreed service is not delivered, the unearned portion will be reviewed.' },
        { title: hindi ? 'हमारी तकनीकी गलती' : 'Failure attributable to us', body: hindi ? 'यदि हमारी तकनीकी या प्रक्रिया संबंधी गलती से सहमत काम पूरा नहीं होता, तो सेवा शुल्क के उस हिस्से की समीक्षा और उचित रिफंड किया जाएगा जिसके बदले काम नहीं हुआ।' : 'If our technical or process failure prevents completion of the agreed work, we will review and reasonably refund the portion of the service fee for work not delivered.' },
        { title: hindi ? 'गंभीर तकनीकी समस्या में 15 दिन' : '15 days for exceptional technical failure', body: hindi ? 'सामान्य काम के लिए 7–15 दिन का समय नहीं है। यदि TANSHU ONLINE की वेबसाइट/सर्वर की गंभीर तकनीकी समस्या के कारण सहमत सेवा 15 कैलेंडर दिनों के भीतर पूरी नहीं हो पाती, तो TANSHU ONLINE द्वारा लिया गया सेवा शुल्क 15वें दिन वापस किया जाएगा। सरकारी/पोर्टल शुल्क का निपटारा इस आधार पर होगा कि राशि वास्तव में जमा हुई है या नहीं और संबंधित विभाग के नियम क्या हैं।' : 'Seven to fifteen days is not the normal completion time. If a serious technical problem with TANSHU ONLINE’s website or server prevents the agreed service from being completed within 15 calendar days, the TANSHU ONLINE service fee collected for that service will be refunded on the 15th day. Government/portal fees will be handled according to whether the amount was actually remitted and the relevant department’s rules.' },
        { title: hindi ? 'सरकारी मंज़ूरी' : 'Government approval', body: hindi ? 'वैध आवेदन जमा होने के बाद मंज़ूरी, अस्वीकृति और प्रक्रिया का समय संबंधित सरकारी प्राधिकरण के नियंत्रण में है। हम मंज़ूरी की गारंटी नहीं देते।' : 'After a valid application is submitted, approval, rejection and processing time are controlled by the relevant government authority. We do not guarantee approval.' },
        { title: hindi ? 'रिफंड अनुरोध' : 'How to request a refund', body: <> {hindi ? 'अपना बुकिंग संदर्भ, सेवा का नाम, भुगतान संदर्भ (यदि हो) और कारण ईमेल करें। OTP, पासवर्ड या पूरा पहचान नंबर न भेजें। पात्र रिफंड सामान्यतः मूल भुगतान माध्यम में शुरू किया जाएगा, बैंक/प्रदाता की प्रक्रिया के अधीन।' : 'Email your booking reference, service name, payment reference (if any) and reason. Do not send an OTP, password or full identity number. Eligible refunds will ordinarily be initiated to the original payment method, subject to bank/provider processing.'} <a className="font-semibold text-blue-700 underline" href={`mailto:${mail}`}>{mail}</a></> },
        { title: hindi ? 'कानूनी अधिकार' : 'Your legal rights', body: hindi ? 'यह नीति लागू उपभोक्ता संरक्षण या अन्य कानून के तहत आपके अधिकारों को सीमित नहीं करती। जहाँ कानून अधिक सुरक्षा देता है, वही प्रभावी होगा।' : 'This policy does not limit rights available under applicable consumer-protection or other laws. Where the law provides greater protection, the law prevails.' },
      ],
    },
    '/copyright': {
      title: hindi ? 'कॉपीराइट और बौद्धिक संपदा सूचना' : 'Copyright & Intellectual Property Notice',
      description: hindi ? 'TANSHU ONLINE की मूल सामग्री और तीसरे पक्ष की सामग्री के अधिकारों की सूचना।' : 'Notice about original TANSHU ONLINE materials and third-party intellectual property.',
      intro: hindi ? 'TANSHU ONLINE की सामग्री का उपयोग उसके मूल अधिकारों और लागू तीसरे पक्ष के लाइसेंस के अधीन है।' : 'Materials on TANSHU ONLINE are subject to their original ownership rights and any applicable third-party licences.',
      sections: [
        { title: hindi ? 'मूल सामग्री' : 'Original materials', body: hindi ? 'वेबसाइट का नाम, ब्रांडिंग, मूल लेखन, स्वयं निर्मित कोड, पेज संरचना और विशिष्ट डिज़ाइन तत्वों पर TANSHU ONLINE या संबंधित अधिकार धारकों के अधिकार लागू होते हैं।' : 'The website name, branding, original writing, code created for the site, page structure and distinctive design elements are protected by rights held by TANSHU ONLINE or the relevant rights holders.' },
        { title: hindi ? 'तीसरे पक्ष की सामग्री' : 'Third-party materials', body: hindi ? 'ओपन-सोर्स लाइब्रेरी, फ़ॉन्ट, आइकन, सरकारी नाम/लोगो, YouTube वीडियो और अन्य तीसरे पक्ष की सामग्री उनके संबंधित स्वामियों और लाइसेंस की शर्तों के अधीन रहती है। यह सूचना किसी तीसरे पक्ष की सामग्री का स्वामित्व TANSHU ONLINE को नहीं देती।' : 'Open-source libraries, fonts, icons, government names/logos, YouTube videos and other third-party materials remain subject to their respective owners and licence terms. This notice does not transfer ownership of third-party material to TANSHU ONLINE.' },
        { title: hindi ? 'अनुमति और शिकायत' : 'Permission and rights concerns', body: <> {hindi ? 'हमारी मूल सामग्री को लिखित अनुमति के बिना कॉपी, पुनर्प्रकाशित या व्यावसायिक रूप से वितरित न करें। यदि आपको लगता है कि वेबसाइट पर आपकी सामग्री का उपयोग अधिकारों का उल्लंघन करता है, तो सामग्री का URL, अपने अधिकार का विवरण और संपर्क जानकारी ईमेल करें।' : 'Do not copy, republish or commercially distribute our original materials without written permission. If you believe material on this website infringes your rights, email the URL, a description of your rights and your contact details.'} <a className="font-semibold text-blue-700 underline" href={`mailto:${mail}`}>{mail}</a></> },
      ],
    },
    '/contact': {
      title: hindi ? 'संपर्क करें' : 'Contact TANSHU ONLINE',
      description: hindi ? 'TANSHU ONLINE की सहायता, शिकायत, गोपनीयता और सेवा संबंधी संपर्क जानकारी।' : 'Support, grievance and business contact information for TANSHU ONLINE.',
      intro: hindi ? 'TANSHU ONLINE एक Digital Service Center & Online Tools Platform है। सेवा-संबंधी जरूरी सहायता, बुकिंग, भुगतान, गोपनीयता या कॉपीराइट शिकायत के लिए नीचे दिए आधिकारिक संपर्क माध्यमों का उपयोग करें।' : 'TANSHU ONLINE is a Digital Service Center & Online Tools Platform. Use the official contact channels below for essential service support, bookings, payment issues, privacy requests or copyright concerns.',
      sections: [
        {
          title: hindi ? 'व्यवसाय की जानकारी' : 'Business information',
          body: <div className="space-y-2">
            <p><strong>{hindi ? 'वेबसाइट / ब्रांड:' : 'Website / Brand:'}</strong> TANSHU ONLINE</p>
            <p><strong>{hindi ? 'व्यवसाय का प्रकार:' : 'Business type:'}</strong> Digital Service Center &amp; Online Tools Platform</p>
            <p><strong>{hindi ? 'संचालन:' : 'Operated by:'}</strong> TANSHU ONLINE</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500 shrink-0" /><strong>{hindi ? 'स्थान:' : 'Location:'}</strong> Bihar, India</p>
          </div>
        },
        {
          title: hindi ? 'ग्राहक सहायता और शिकायत अधिकारी' : 'Customer support & grievance officer',
          body: <div className="space-y-2">
            <p><strong>{hindi ? 'जिम्मेदार सहायता टीम:' : 'Responsible support contact:'}</strong> TANSHU ONLINE</p>
            <p>{hindi ? 'TANSHU ONLINE ग्राहक सहायता और शिकायतों को प्राप्त करने तथा उनका समाधान करने की जिम्मेदारी संभालता है।' : 'TANSHU ONLINE is responsible for receiving customer support requests and grievances and coordinating their resolution.'}</p>
            <p className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-slate-500 shrink-0" />{hindi ? 'शिकायत मिलने की पुष्टि: 48 घंटे के भीतर।' : 'Grievance acknowledgement: within 48 hours.'}</p>
            <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />{hindi ? 'समाधान का लक्ष्य: शिकायत प्राप्त होने के 30 दिनों के भीतर।' : 'Target resolution: within 30 days of receiving the grievance.'}</p>
          </div>
        },
        {
          title: hindi ? 'WhatsApp सहायता (प्राथमिक माध्यम)' : 'WhatsApp support (preferred channel)',
          body: <div className="space-y-3">
            <p>{hindi ? 'WhatsApp का उपयोग केवल जरूरी सेवा-संबंधी सहायता, बुकिंग/भुगतान की समस्या और वास्तविक शिकायतों के लिए करें।' : 'Use WhatsApp for essential service-related assistance, booking or payment issues, and genuine grievances.'}</p>
            <a href="https://wa.me/919360714846" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white no-underline hover:bg-emerald-800"><MessageCircle className="w-4 h-4" />{hindi ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</a>
            <p className="text-sm text-slate-600">{hindi ? 'कृपया ध्यान दें: WhatsApp निजी बातचीत या सामान्य जानकारी के हर छोटे सवाल के लिए नहीं है। हर सामान्य प्रश्न का उत्तर देना संभव नहीं होगा। संदेश में सेवा का नाम और बुकिंग संदर्भ (यदि हो) स्पष्ट लिखें।' : 'Please note: WhatsApp is not intended for personal conversations or every routine question. We may not be able to answer all general enquiries. Clearly mention the service name and booking reference, if any.'}</p>
          </div>
        },
        {
          title: hindi ? 'ईमेल सहायता' : 'Email support',
          body: <a className="inline-flex items-center gap-2 font-semibold text-blue-700 underline" href={`mailto:${mail}`}><Mail className="w-4 h-4" />{mail}</a>
        },
        {
          title: hindi ? 'हमारे सोशल मीडिया' : 'Connect with us',
          body: <div className="flex flex-wrap gap-3">
            <a href="https://www.instagram.com/tanshuonline?obrf=MTY3dmhkNTV2cHk1Mw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-semibold text-slate-800 no-underline hover:border-pink-400 hover:text-pink-700"><Instagram className="w-5 h-5" />Instagram</a>
            <a href="https://www.facebook.com/share/19bDrHwUdD/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-semibold text-slate-800 no-underline hover:border-blue-400 hover:text-blue-700"><Facebook className="w-5 h-5" />Facebook</a>
            <a href="https://youtube.com/@tanshuonline?si=MSwlXsajZRAZUl0-" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-semibold text-slate-800 no-underline hover:border-red-400 hover:text-red-700"><Youtube className="w-5 h-5" />YouTube</a>
          </div>
        },
        {
          title: hindi ? 'संपर्क करते समय ध्यान रखें' : 'Please keep in mind when contacting us',
          body: hindi ? 'संबंधित सेवा का नाम और बुकिंग संदर्भ (यदि हो) लिखें। OTP, पासवर्ड, UPI PIN या पूरा Aadhaar/PAN नंबर WhatsApp या ईमेल पर न भेजें। TANSHU ONLINE एक स्वतंत्र डिजिटल टूल और सहायता प्लेटफ़ॉर्म है, सरकारी विभाग नहीं। सरकारी आवेदन की स्थिति और निर्णय के लिए संबंधित आधिकारिक पोर्टल से भी संपर्क करें।' : 'Mention the relevant service and booking reference, if any. Never send an OTP, password, UPI PIN or full Aadhaar/PAN number over WhatsApp or email. TANSHU ONLINE is an independent digital tools and assistance platform, not a government department. For official application status and decisions, also contact the relevant government portal.'
        },
      ],
    },
  };

  const page = pages[path] || pages['/disclaimer'];

  useEffect(() => {
    document.title = `${page.title} | TANSHU ONLINE`;
    const description = page.description;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `https://tanshu-online.pages.dev${path}`;
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'index, follow';
    const setMeta = (selector: string, attribute: 'name' | 'property', key: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    setMeta('meta[property="og:title"]', 'property', 'og:title', `${page.title} | TANSHU ONLINE`);
    setMeta('meta[property="og:description"]', 'property', 'og:description', page.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', `https://tanshu-online.pages.dev${path}`);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', `${page.title} | TANSHU ONLINE`);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', page.description);
  }, [path, page.title, page.description]);

  const goToSection = (sectionId: string) => {
    window.location.href = sectionId === 'home' ? '/' : `/#${sectionId}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
      <Header onNavigate={goToSection} activeSection="" />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <a href="/" className="text-xs font-semibold text-blue-700 hover:underline">{hindi ? '← TANSHU ONLINE होम पर वापस जाएँ' : '← Back to TANSHU ONLINE home'}</a>
        <article className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">TANSHU ONLINE · {hindi ? 'कानूनी जानकारी' : 'Legal information'}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{page.title}</h1>
          <p className="mt-4 text-sm sm:text-base leading-7 text-slate-600">{page.intro}</p>
          <p className="mt-2 text-xs text-slate-500">{hindi ? 'अंतिम अपडेट: 11 नवंबर 2026' : 'Last updated: 11 November 2026'}</p>
          <div className="mt-8 space-y-7">
            {page.sections.map((section, index) => (
              <section key={section.title} className="space-y-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">{section.title}</h2>
                <div className="text-sm leading-7 text-slate-700">{section.body}</div>
              </section>
            ))}
          </div>
          <nav aria-label={hindi ? 'अन्य कानूनी पेज' : 'Other legal pages'} className="mt-12 border-t border-slate-200 pt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-blue-700">
            {[
              ['/privacy-policy', hindi ? 'गोपनीयता नीति' : 'Privacy Policy'],
              ['/terms-and-conditions', hindi ? 'नियम और शर्तें' : 'Terms & Conditions'],
              ['/disclaimer', hindi ? 'अस्वीकरण' : 'Disclaimer'],
              ['/refund-policy', hindi ? 'रिफंड नीति' : 'Refund Policy'],
              ['/copyright', hindi ? 'कॉपीराइट' : 'Copyright'],
              ['/contact', hindi ? 'संपर्क' : 'Contact'],
            ].filter(([href]) => href !== path).map(([href, label]) => <a key={href} href={href} className="hover:underline">{label}</a>)}
          </nav>
        </article>
      </main>
      <Footer onNavigate={goToSection} />
    </div>
  );
};
