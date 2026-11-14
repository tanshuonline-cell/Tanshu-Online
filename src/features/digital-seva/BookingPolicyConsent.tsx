import React from 'react';

export const TERMS_POLICY_VERSION = 'terms-2026-11-14-v2';
export const REFUND_POLICY_VERSION = 'refund-2026-11-14-v3';
const TERMS_HINDI: [string, string][] = [["स्वतंत्र सहायता सेवा","TANSHU ONLINE एक निजी डिजिटल सहायता सेवा प्रदाता है। यह UIDAI, निर्वाचन कार्यालय, किसी सरकारी विभाग या प्रमाण पत्र जारी करने वाले प्राधिकरण का हिस्सा नहीं है।"],["सेवा का दायरा","हम केवल चुनी गई सेवा के लिए बताई गई सहायता देंगे, जैसे दस्तावेज़ तैयार करना, फॉर्म भरने का मार्गदर्शन, फ़ाइल प्रोसेसिंग या जहाँ अधिकृत हो वहाँ आवेदन जमा करने में सहायता।"],["सही जानकारी","आपको सही, पूरी और वर्तमान जानकारी तथा वैध सहायक दस्तावेज़ देने होंगे। हम झूठे रिकॉर्ड नहीं बनाएँगे, जारी प्रमाण पत्र में तथ्य गलत दिखाने के लिए बदलाव नहीं करेंगे, आधिकारिक जाँच को बायपास नहीं करेंगे और मंज़ूरी की गारंटी नहीं देंगे।"],["जमा करने से पहले जाँच","किसी आवेदन को जमा करने की अनुमति देने से पहले नाम, तारीख, पता, श्रेणी, संलग्न दस्तावेज़ और अन्य प्रविष्टियाँ ध्यान से जाँचना आपकी ज़िम्मेदारी है। कोई गलती दिखे तो तुरंत बताएँ।"],["OTP और पासवर्ड","किसी कर्मचारी को या इस फ़ॉर्म में OTP, पासवर्ड, PIN या अकाउंट रिकवरी कोड कभी न बताएँ। जहाँ संभव हो, प्रमाणीकरण कोड आधिकारिक वेबसाइट / ऐप पर स्वयं दर्ज करें।"],["शुल्क","सरकारी / प्रदाता शुल्क और TANSHU ONLINE सेवा शुल्क अलग-अलग हैं। लागू टैक्स या भुगतान प्रदाता का शुल्क भी भुगतान से पहले अलग दिखाया जाएगा। इस Preview में कोई शुल्क नहीं लिया जाता।"],["सरकारी निर्णय","पात्रता, आवेदन स्वीकार करना, सुधार, मंज़ूरी, अस्वीकृति और प्रमाण पत्र जारी करने का निर्णय केवल सक्षम सरकारी प्राधिकरण लेता है। हमारी सेवा पूरी करने की समय-सीमा सरकारी प्रक्रिया के समय को नियंत्रित नहीं करती।"],["ग्राहक का सहयोग","जानकारी या दस्तावेज़ अधूरे, अस्पष्ट या आपस में मेल न खाने पर स्पष्टीकरण मिलने तक हमारा काम रुक सकता है। हम बताएँगे कि क्या चाहिए; आपकी जानकारी में चुपचाप बदलाव नहीं करेंगे।"],["गोपनीयता","व्यक्तिगत जानकारी का उपयोग केवल माँगी गई सेवा के लिए किया जाएगा। कोई संवेदनशील दस्तावेज़ लेने से पहले लागू गोपनीयता सूचना, पहुँच नियंत्रण और डेटा रखने / हटाने की अवधि बताई जानी चाहिए। इस Preview में संवेदनशील दस्तावेज़ जमा न करें।"],["रद्द करना और शिकायत","रद्दीकरण, सेवा शुल्क में समायोजन और रिफंड अलग रिफंड नीति तथा लागू कानून के अनुसार होंगे। लाइव सेवा / भुगतान शुरू होने से पहले ग्राहक सहायता और शिकायत निवारण का संपर्क दिखाया जाएगा।"],["Preview की स्थिति","यह विकासाधीन Preview है। बुकिंग, दस्तावेज़ अपलोड और भुगतान की सुविधाएँ उपलब्ध न भी हों। Preview में भेजा गया अनुरोध इस बात का प्रमाण नहीं है कि सरकारी आवेदन जमा हो गया है।"]];
const REFUND_HINDI: [string, string][] = [["अलग-अलग शुल्क","लाइव भुगतान से पहले सरकारी / प्रदाता शुल्क, TANSHU ONLINE सेवा शुल्क, लागू टैक्स और भुगतान प्रदाता के शुल्क अलग-अलग मदों में दिखाए जाएँगे।"],["सरकारी / प्रदाता शुल्क","रिफंड और रद्दीकरण चुनी गई सेवा तथा आवेदन मार्ग के संबंधित विभाग / प्रदाता के सटीक नियमों के अनुसार होंगे। सरकारी शुल्क अपने-आप गैर-वापसी योग्य नहीं माना जाएगा। जो राशि प्राधिकरण को जमा नहीं हुई है, उसे जमा हुई बताना मना है। यदि प्राधिकरण रिफंड की अनुमति देता है, तो हम उपलब्ध प्रक्रिया समझाएँगे और उचित रूप से आवश्यक रिकॉर्ड जुटाने में सहायता करेंगे।"],["TANSHU ONLINE सेवा शुल्क","यह शुल्क केवल कोटेशन में बताए गए काम और परिणामों के लिए है। अनुरोध रद्द होने पर रोकी जाने वाली राशि उचित, पहले से बताई गई, वास्तव में पूरे किए गए काम के अनुपात में और लागू उपभोक्ता कानून के अनुरूप होगी। काम शुरू होते ही पूरा सेवा शुल्क जब्त मानने का कोई सामान्य नियम नहीं है।"],["TANSHU ONLINE की गलती से काम पूरा न होना","यदि हमारी तकनीकी, सिस्टम या प्रक्रिया संबंधी गलती के कारण सहमत काम पूरा नहीं हो पाता, तो सेवा शुल्क के उस हिस्से की समीक्षा करके रिफंड किया जाएगा जिसके बदले काम नहीं हुआ। जो सरकारी राशि जमा नहीं हुई या वापस मिल सकती है, उसका भी उचित समाधान किया जाएगा। हमारी गलती से आवेदन में त्रुटि होने पर आधिकारिक प्रक्रिया के अधीन बिना अतिरिक्त सेवा शुल्क के सुधार या उचित रिफंड पर विचार होगा।"],["ग्राहक की ओर से देरी या गलत दस्तावेज़","ज़रूरी दस्तावेज़, स्पष्टीकरण या ग्राहक की मंज़ूरी न मिलने पर सेवा रोकी जा सकती है और लंबित चीज़ बताई जाएगी। रद्दीकरण में समायोजन वास्तव में पूरे किए गए काम और भुगतान से पहले बताई गई शर्तों के अनुसार होगा; ग्राहक की देरी से कानून के तहत अधिकार समाप्त नहीं होते।"],["काम पूरा करने का सामान्य समय","ग्राहक द्वारा आवेदन फॉर्म, आवश्यक जानकारी, दस्तावेज़ और सभी जरूरी सहमति पूरी करने के बाद TANSHU ONLINE की टीम जल्द से जल्द काम शुरू करेगी। सामान्यतः काम उसी दिन पूरा करने का पूरा प्रयास किया जाएगा। सेवा और फॉर्म की प्रकृति के अनुसार लगभग 10–30 मिनट या उससे अधिक समय लग सकता है। कुछ मामलों में जाँच, दस्तावेज़ सत्यापन या आधिकारिक पोर्टल की प्रक्रिया के कारण अतिरिक्त समय लग सकता है। यदि आवेदन उसी दिन सफलतापूर्वक पूरा हो जाता है, तो ग्राहक को उसी दिन रसीद / स्लिप उपलब्ध कराई जाएगी। ग्राहक से अनुरोध है कि आवेदन जमा करने के बाद काम पूरा होने तक थोड़ा धैर्य रखें।"],["विशेष तकनीकी परिस्थिति में देरी और रिफंड","7 से 15 कैलेंडर दिनों की अवधि सामान्य काम के लिए नहीं है। यह केवल असाधारण और गंभीर तकनीकी परिस्थितियों में लागू होगी, जैसे TANSHU ONLINE वेबसाइट / सर्वर का बंद होना, सिस्टम में बड़ी खराबी, बग या अन्य गंभीर तकनीकी बाधा। ऐसी स्थिति में हम ग्राहक को देरी की जानकारी देंगे और समस्या जल्द ठीक करके काम पूरा करने का प्रयास करेंगे। यदि ऐसी TANSHU ONLINE तकनीकी समस्या के कारण 15 कैलेंडर दिनों के भीतर सहमत सेवा पूरी नहीं हो पाती है, तो 15वें दिन ग्राहक को TANSHU ONLINE द्वारा लिया गया सेवा शुल्क रिफंड किया जाएगा। सरकारी / पोर्टल शुल्क अलग रहेगा और उसका निपटारा इस आधार पर होगा कि राशि वास्तव में जमा हुई है या नहीं तथा संबंधित विभाग के नियम क्या हैं। यह समय-सीमा सरकारी मंज़ूरी या सरकारी पोर्टल की प्रक्रिया की गारंटी नहीं है।"],["आवेदन जमा होने के बाद सरकारी निर्णय","वैध आवेदन सफलतापूर्वक जमा होकर उसकी पावती मिलने के बाद मंज़ूरी, अस्वीकृति और प्रक्रिया का समय संबंधित प्राधिकरण के नियंत्रण में होता है। जहाँ सरकारी प्रकाशित नियम अनुमति नहीं देते, वहाँ हम मंज़ूरी या आधिकारिक शुल्क के रिफंड का वादा नहीं कर सकते। TANSHU सेवा शुल्क का मामला अलग से देखा जाएगा।"],["रिफंड कैसे माँगें","लाइव सेवा शुरू होने पर दिखाए गए ग्राहक सहायता / शिकायत निवारण माध्यम से अपना बुकिंग / रेफरेंस नंबर, सेवा का नाम, भुगतान रेफरेंस (यदि हो) और संक्षिप्त कारण दें। OTP, पासवर्ड या पूरा पहचान नंबर न भेजें।"],["निर्णय और भुगतान का माध्यम","पात्र रिफंड सामान्यतः उसी भुगतान माध्यम में शुरू किया जाएगा जिससे भुगतान हुआ था। भुगतान प्रदाता / बैंक की प्रक्रिया और लागू कानूनी समय-सीमा के अनुसार राशि आने में समय लग सकता है। हम निर्णय और स्थिति की जानकारी देंगे। यदि ग्राहक के UPI खाते से राशि कट जाए लेकिन व्यापारी को न मिले, तो ऐसे असफल व्यापारी UPI लेनदेन का समाधान भुगतान प्रणाली के रिवर्सल नियमों के अनुसार अलग से होगा; यह सेवा रिफंड से अलग है।"],["कानूनी अधिकार","इस नीति की कोई बात लागू उपभोक्ता संरक्षण या अन्य कानून के तहत उपलब्ध अधिकारों या उपायों को समाप्त नहीं करती। यदि कानून अधिक सुरक्षा या कम समय-सीमा देता है, तो वही नियम प्रभावी होगा।"]];


const TERMS_ENGLISH: [string, string][] = [
 ['Independent assistance', 'TANSHU ONLINE is a private digital assistance provider, not UIDAI, an election office, a government department or an issuing authority.'],
 ['Service scope', 'We provide only the assistance described for the selected service, such as document preparation, form-filling guidance, file processing or submission assistance where authorised.'],
 ['Correct information', 'You must provide true, complete and current information and lawful supporting documents. We will not create false records, alter issued certificates to misrepresent facts, bypass official checks or guarantee approval.'],
 ['Review before submission', 'You must review names, dates, addresses, category, attachments and other entries before authorising any application submission. Tell us promptly if anything is incorrect.'],
 ['OTP and passwords', 'Never disclose an OTP, password, PIN or account recovery code to staff or in this form. Enter authentication codes yourself on the official website/app whenever possible.'],
 ['Fees', 'Government/provider fees and TANSHU ONLINE service fees are separate. Any applicable taxes or payment-provider charges will also be disclosed separately before payment. No fee is collected in this Preview.'],
 ['Government decisions', 'The competent authority alone decides eligibility, acceptance, correction, approval, rejection and issuance. Our service-time target does not control government processing time.'],
 ['Customer cooperation', 'Missing, unclear or inconsistent information may pause our work until clarification is received. We will communicate what is needed; we will not silently change your information.'],
 ['Privacy', 'Personal information will be used only for the requested service. Before any sensitive document is collected, the applicable privacy notice, access controls and retention/deletion period must be shown. Do not submit sensitive documents in this Preview.'],
 ['Cancellation and complaints', 'Cancellation, service-fee adjustment and refunds are handled under the separate Refund Policy and applicable law. A complaint may be raised through the customer-care/grievance channel that will be displayed before live service/payment launch.'],
 ['Preview status', 'This form is a development preview. Booking, document upload and payment features may be unavailable; a preview request is not proof that a government application has been filed.']
];

const REFUND_ENGLISH: [string, string][] = [
  ['Separate fee components', 'The official Government/Provider Fee, TANSHU ONLINE Service Fee, applicable taxes and payment-provider charges will be shown as separate line items before any live payment.'],
  ['Government/provider fee', 'Refunds and cancellations follow the exact department/provider rule for the selected service and route. A government fee is not automatically non-refundable. If the amount has not been paid to the authority, it must not be represented as already deposited. If the authority permits a refund, we will explain the available process and assist with the records reasonably required.'],
  ['TANSHU ONLINE service fee', 'The fee covers only the work and deliverables disclosed in the quote. If a request is cancelled, any amount retained must be fair, disclosed in advance, proportionate to work actually completed and consistent with applicable consumer law. There is no blanket rule that the entire service fee is forfeited as soon as work starts.'],
  ['Failure attributable to TANSHU ONLINE', 'If we cannot complete the agreed work because of our own technical, system or process failure, we will review and refund the unearned portion of our service fee. Any government amount not deposited or recoverable will also be addressed. If an incorrect filing is caused by us, we will assess correction without an extra service charge or a reasonable refund, subject to the official process.'],
  ['Customer-side delay or incorrect documents', 'If required documents, clarification or customer approval are missing, the service may be paused and the customer will be told what is pending. Any cancellation adjustment will consider work actually completed and the terms disclosed before payment; customer delay does not remove statutory rights.'],
  ['Normal completion time', 'After the customer submits the completed request form, required information and documents, and all necessary consent, TANSHU ONLINE will begin processing as soon as possible. We will normally make every effort to complete our agreed work on the same day. Depending on the service and form, this may take around 10–30 minutes or longer. Verification, document checks or official-portal steps may require additional time. If the work is successfully completed that day, the customer will receive the receipt/slip the same day. Customers are requested to wait patiently after submitting the request while our team completes the work.'],
  ['Exceptional technical delay and 15-day refund', 'A period of 7–15 calendar days is not the normal processing time. It applies only in exceptional, serious technical situations affecting TANSHU ONLINE, such as our website/server being unavailable, a major system failure, a bug or another serious technical disruption. We will inform the customer and work to resolve the issue promptly. If the agreed service remains incomplete within 15 calendar days because of such a TANSHU ONLINE technical problem, the TANSHU ONLINE service fee charged for that service will be refunded on the 15th day. Government/portal fees are separate and will be handled according to whether the amount was actually remitted and the relevant department’s rules. This is not a guarantee of government approval or government-portal processing time.'],
  ['Government decision after submission', 'Once a valid application has been successfully submitted and acknowledged, later approval/rejection or processing time is controlled by the authority. We cannot promise an approval or refund of an official fee where the authority’s published rule does not allow it. Any TANSHU service-fee issue is assessed separately.'],
  ['How to request a refund', 'Quote your booking/reference number, service name, payment reference (if any) and a brief reason through the customer-care/grievance channel displayed at live launch. Do not send OTPs, passwords or full identity numbers.'],
  ['Decision and payment method', 'Eligible refunds will ordinarily be initiated to the original payment method, subject to payment-provider/bank processing and applicable statutory timelines. We will communicate the decision and status. A failed merchant UPI transaction where the payer is debited but the merchant is not credited is handled under the payment-system reversal rules, separately from a service refund.'],
  ['Legal rights', 'Nothing in this policy removes rights or remedies available under applicable consumer-protection or other law. Where a legal rule provides a more protective remedy or timeline, that rule prevails.']
];

type ProjectCategory = 'websites' | 'apps' | 'software' | 'design';

const PROJECT_TERMS_HINDI: Record<ProjectCategory, [string, string][]> = {
 websites: [
  ['काम का दायरा और quotation','वेबसाइट में केवल वही pages, features, integrations और deliverables शामिल होंगे जो ग्राहक द्वारा मंजूर लिखित brief/quotation में दर्ज हैं। Demo केवल design direction है, सभी दिखाए गए features का वादा नहीं। अतिरिक्त काम के लिए अलग लिखित change approval जरूरी है।'],
  ['काम शुरू होने की शर्तें','ग्राहक final text, logo, images, page list, domain/hosting access और जरूरी approvals देगा। समय-सीमा सभी जरूरी सामग्री और access मिलने के बाद शुरू होगी।'],
  ['डिज़ाइन, परीक्षण और संशोधन','शामिल revisions, responsive device/browser scope, testing और acceptance criteria quotation में लिखे होंगे। नया feature, नया page या बदली हुई requirement अलग estimate और schedule के अधीन होगी।'],
  ['बाहरी सेवाएँ','Domain, hosting, paid plugins/themes, email, stock assets, APIs और third-party subscriptions तभी खरीदे या जोड़े जाएँगे जब उनकी लागत पहले बताकर ग्राहक की मंजूरी ली जाए। Google indexing/ranking या बाहरी platform approval की गारंटी नहीं है।'],
  ['लॉन्च, स्वामित्व और handover','Final launch, admin access, source files और ownership/licence का दायरा quotation में स्पष्ट होगा। अंतिम handover तय भुगतान पूरा होने और आवश्यक customer access/approval मिलने के बाद होगा। Third-party/open-source सामग्री अपने licences के अधीन रहेगी।'],
  ['गोपनीयता और ग्राहक सामग्री','ग्राहक अपने दिए text, photos, logo, trademark और अन्य सामग्री के उपयोग की अनुमति की पुष्टि करेगा। Password, OTP या payment credentials project brief में न भेजें; access सुरक्षित तरीके से साझा और handover पर rotate/revoke किया जाएगा।']
 ],
 apps: [
  ['ऐप का दायरा और platform','केवल मंजूर लिखित brief/quotation में सूचीबद्ध Android, iOS या web platform, screens, user roles, features और integrations शामिल होंगे। Gallery demo illustrative है, सभी दिखाए गए features का वादा नहीं।'],
  ['Milestones और भुगतान','₹999 केवल discovery advance है, पूरा app development शुल्क नहीं। कुल price, deliverables, acceptance criteria और 40/40/20 या अन्य सहमत milestones लिखित quotation में होंगे। कोई अगला भुगतान अपने-आप नहीं कटेगा।'],
  ['Development, testing और release','Device/OS support, test cases, security checks, beta build, app-store submission और production release का दायरा quotation में तय होगा। App-store review और approval बाहरी platform के नियंत्रण में हैं और guaranteed नहीं।'],
  ['बाहरी सेवाएँ और लागत','Backend, hosting, APIs, SMS/WhatsApp, maps, payment gateway, app-store accounts और licences अलग हो सकते हैं। कोई भी paid third-party purchase ग्राहक की पूर्व मंजूरी के बिना नहीं होगा।'],
  ['ग्राहक की जिम्मेदारी','ग्राहक accurate workflows, content, test accounts, legal notices, privacy requirements और समय पर feedback देगा। ग्राहक की देरी या approved scope changes से price/schedule बदल सकता है।'],
  ['डेटा, सुरक्षा और handover','Customer data का उपयोग केवल मंजूर project के लिए होगा। Credentials सुरक्षित माध्यम से साझा होंगे और handover पर rotate/revoke होंगे। Final code, source files, account ownership और licence वही होंगे जो लिखित quotation में शामिल हैं।']
 ],
 software: [
  ['सॉफ्टवेयर का दायरा','केवल लिखित रूप से मंजूर modules, workflows, operating systems/browser targets, user roles, reports, integrations और deliverables शामिल होंगे। Demo illustrative है; अतिरिक्त module या feature अलग change approval के बिना शामिल नहीं होगा।'],
  ['Discovery और भुगतान milestones','₹999 केवल requirements discovery advance है, पूरा software development शुल्क नहीं। कुल कीमत, modules, deliverables, acceptance criteria और milestones लिखित quotation में तय होंगे। कोई अगला भुगतान अपने-आप नहीं कटेगा।'],
  ['Development और testing','Data import/migration, compatibility, security, backup/restore, user acceptance testing और deployment का दायरा quotation में लिखा होगा। Legacy systems या third-party integration की सीमाएँ और dependencies पहले दर्ज की जाएँगी।'],
  ['बाहरी सेवाएँ और लागत','Cloud/hosting, API subscriptions, licences, paid libraries और third-party tools अलग हो सकते हैं। कोई paid purchase ग्राहक की पूर्व मंजूरी के बिना नहीं होगा।'],
  ['ग्राहक की जिम्मेदारी','ग्राहक business rules, sample data, test cases, access और समय पर feedback देगा। अधूरी जानकारी, देर से testing या approved scope change से schedule और price बदल सकते हैं।'],
  ['सुरक्षा और handover','Credentials सुरक्षित माध्यम से साझा होंगे और handover पर rotate/revoke होंगे। Final executable, source code, documentation, deployment और ownership/licence का दायरा लिखित quotation के अनुसार होगा। Third-party/open-source components अपने licences के अधीन रहेंगे।']
 ],
 design: [
  ['डिज़ाइन का दायरा और deliverables','केवल पैकेज/quotation में लिखी संख्या, size, format, design direction और final files शामिल हैं। अतिरिक्त creatives, formats, copywriting या brand identity अलग quote होंगे।'],
  ['सामग्री और उपयोग अधिकार','ग्राहक सही text, logo, images, brand details और final dimensions देगा तथा इनके उपयोग की अनुमति रखेगा। Trademark, image, font और supplied asset के अधिकार ग्राहक की जिम्मेदारी होंगे।'],
  ['Concept, revisions और approval','शामिल initial concepts और revision rounds package/quotation में लिखे होंगे। ग्राहक final spelling, numbers, claims, contact details और layout को approval से पहले जाँचेगा। मंजूरी के बाद बड़े बदलाव अलग काम माने जा सकते हैं।'],
  ['समय और ग्राहक feedback','Delivery estimate final brief, content और assets मिलने के बाद शुरू होगा। Feedback या सामग्री देर से मिलने, direction बदलने या अतिरिक्त formats माँगने पर schedule बढ़ सकता है।'],
  ['Printing और अतिरिक्त सेवाएँ','Printing, paper, delivery, ad spend, campaign management, copywriting और editable source/vector files तभी शामिल होंगे जब quotation में स्पष्ट हों। कोई अतिरिक्त खर्च पहले बताकर मंजूर कराया जाएगा।'],
  ['Final files और licence','Final PNG/JPG/PDF या अन्य exports और editable source files वही होंगे जो package में सूचीबद्ध हैं। किसी third-party font, stock image या asset का उपयोग उसके licence के अधीन रहेगा।']
 ]
};
const PROJECT_TERMS_ENGLISH: Record<ProjectCategory, [string, string][]> = {
 websites: [
  ['Scope and written quotation','Only pages, features, integrations and deliverables expressly listed in the customer-approved written brief/quotation are included. A demo is a visual direction, not a promise that every displayed feature is included. Additional work requires a written change approval.'],
  ['Start conditions','The customer supplies final text, logo, images, page list, domain/hosting access and required approvals. The schedule starts after all required materials and access are received.'],
  ['Design, testing and revisions','Included revisions, responsive device/browser scope, testing and acceptance criteria are stated in the quotation. New features, pages or changed requirements require a separate estimate and schedule.'],
  ['Third-party services','Domain, hosting, paid plugins/themes, email, stock assets, APIs and third-party subscriptions are purchased or connected only after their costs are disclosed and approved. Google indexing/ranking and external-platform approval are not guaranteed.'],
  ['Launch, ownership and handover','The scope of final launch, admin access, source files and ownership/licence is stated in the quotation. Final handover follows completion of agreed payments and required customer approvals/access. Third-party/open-source materials remain subject to their own licences.'],
  ['Privacy and customer materials','The customer confirms permission to use supplied text, photos, logos, trademarks and other materials. Do not send passwords, OTPs or payment credentials in the project brief; access is shared securely and rotated/revoked at handover.']
 ],
 apps: [
  ['App scope and platform','Only Android, iOS or web platforms, screens, user roles, features and integrations listed in the approved written brief/quotation are included. Gallery demos are illustrative and do not promise every displayed feature.'],
  ['Discovery and payment milestones','₹999 is a discovery advance only, not the full app development fee. Total price, deliverables, acceptance criteria and 40/40/20 or other agreed milestones must be stated in the written quotation. No later payment is auto-debited.'],
  ['Development, testing and release','Device/OS support, test cases, security checks, beta build, app-store submission and production release scope will be stated in the quotation. App-store review and approval are controlled by the external platform and are not guaranteed.'],
  ['Third-party services and costs','Backend, hosting, APIs, SMS/WhatsApp, maps, payment gateway, app-store accounts and licences may be additional. No paid third-party purchase is made without prior customer approval.'],
  ['Customer responsibilities','The customer provides accurate workflows, content, test accounts, legal notices, privacy requirements and timely feedback. Customer delays or approved scope changes may affect price and schedule.'],
  ['Data, security and handover','Customer data is used only for the approved project. Credentials are shared securely and rotated/revoked at handover. Final code, source files, account ownership and licences are limited to what the written quotation includes.']
 ],
 software: [
  ['Software scope','Only modules, workflows, operating systems/browser targets, user roles, reports, integrations and deliverables approved in writing are included. Demos are illustrative; no extra module or feature is included without a written change approval.'],
  ['Discovery and payment milestones','₹999 is a requirements-discovery advance only, not the full software development fee. Total price, modules, deliverables, acceptance criteria and milestones are set in the written quotation. No later payment is auto-debited.'],
  ['Development and testing','Data import/migration, compatibility, security, backup/restore, user acceptance testing and deployment scope will be stated in the quotation. Legacy systems and third-party integration limits/dependencies will be identified in advance.'],
  ['Third-party services and costs','Cloud/hosting, API subscriptions, licences, paid libraries and third-party tools may be additional. No paid purchase is made without prior customer approval.'],
  ['Customer responsibilities','The customer provides business rules, sample data, test cases, access and timely feedback. Missing information, delayed testing or approved scope changes may affect schedule and price.'],
  ['Security and handover','Credentials are shared securely and rotated/revoked at handover. Final executable, source code, documentation, deployment and ownership/licence are limited to what the written quotation includes. Third-party/open-source components remain subject to their own licences.']
 ],
 design: [
  ['Design scope and deliverables','Only the quantity, size, format, design direction and final files listed in the package/quotation are included. Additional creatives, formats, copywriting or brand identity require a separate quote.'],
  ['Materials and usage rights','The customer supplies accurate text, logo, images, brand details and final dimensions and confirms permission to use them. Rights to supplied trademarks, images, fonts and assets remain the customer’s responsibility.'],
  ['Concepts, revisions and approval','Included initial concepts and revision rounds are stated in the package/quotation. The customer reviews spelling, numbers, claims, contact details and layout before approval. Major changes after approval may be treated as additional work.'],
  ['Schedule and customer feedback','Delivery estimates start after the final brief, content and assets are received. Late feedback/materials, changed direction or extra formats may extend the schedule.'],
  ['Printing and additional services','Printing, paper, delivery, ad spend, campaign management, copywriting and editable source/vector files are included only when expressly stated in the quotation. Additional costs are disclosed for approval in advance.'],
  ['Final files and licence','Final PNG/JPG/PDF or other exports and editable source files are limited to those listed in the package. Third-party fonts, stock images and assets remain subject to their licences.']
 ]
};

const PROJECT_TIMELINES: Record<ProjectCategory, [string, string][]> = {
 websites: [
  ['प्रोजेक्ट शुल्क और बाहरी खर्च','फिक्स्ड पैकेज का शुल्क केवल लिखित scope के लिए है। कस्टम वेबसाइट का ₹999 केवल discovery/requirements-review advance है, पूरी वेबसाइट की कीमत नहीं। शेष कीमत और milestones लिखित quotation में मंजूर होंगे। Domain, hosting, paid plugins और third-party सेवाएँ अलग तभी होंगी जब पहले बताकर ग्राहक से मंजूरी ली जाए। कोई सरकारी/पोर्टल शुल्क लागू नहीं है。'.replace('。','।')],
  ['वेबसाइट का अनुमानित समय','Basic लगभग 5–7 कार्यदिवस, Standard 8–14 और Premium 15–25 कार्यदिवस; समय final content, logo, images, access और design approval मिलने के बाद शुरू होगा। Custom focused business website लगभग 3–6 सप्ताह और complex portal/e-commerce/multi-role platform लगभग 6–16 सप्ताह या अधिक ले सकता है। Custom scope review/लिखित अनुमान complete brief और verified advance के बाद सामान्यतः 2–4 कार्यदिवस ले सकता है। अंतिम schedule मंजूर quotation में होगा।'],
  ['देरी और निर्भरताएँ','ग्राहक सामग्री, access, feedback या milestone payment देर से दे, scope बदले, अथवा hosting/domain/integration/बाहरी platform में समस्या हो तो समय बढ़ सकता है। Google indexing, ranking या external platform approval की गारंटी नहीं है।'],
  ['रद्दीकरण और रिफंड','रद्दीकरण पर केवल वास्तव में पूरा हुआ और उचित मूल्य वाला काम तथा ग्राहक द्वारा पहले से मंजूर, प्रमाणित और वास्तव में non-recoverable third-party खर्च समायोजित होगा। बची unearned राशि लौटाई जाएगी; पूरा advance अपने-आप जब्त नहीं होगा।']
 ],
 apps: [
  ['प्रोजेक्ट शुल्क और बाहरी खर्च','₹999 केवल ऐप discovery और requirements-review advance है, पूरे ऐप की कीमत नहीं। कुल price, features, platform और milestones लिखित quotation में मंजूर होंगे। Backend/hosting, APIs, app-store accounts, licences और third-party सेवाएँ अलग तभी होंगी जब पहले बताकर ग्राहक से मंजूरी ली जाए। कोई सरकारी/पोर्टल शुल्क लागू नहीं है।'],
  ['ऐप का अनुमानित समय','Complete brief और verified advance के बाद शुरुआती scope review/लिखित अनुमान सामान्यतः 2–4 कार्यदिवस ले सकता है। Scope मंजूर होने के बाद focused MVP लगभग 6–12 सप्ताह, medium multi-role app 3–6 महीने और complex app 6 महीने या अधिक ले सकता है। अंतिम milestone schedule मंजूर quotation में होगा।'],
  ['देरी और निर्भरताएँ','Requirements, content, assets, access, feedback या milestone payment में देरी, scope change, external API/backend integration, device compatibility, security testing और Apple/Google app-store review से समय बढ़ सकता है। App-store approval या third-party availability की गारंटी नहीं है।'],
  ['रद्दीकरण और रिफंड','रद्दीकरण पर वास्तव में पूरा हुआ discovery/development काम और ग्राहक द्वारा पहले से मंजूर, प्रमाणित non-recoverable third-party खर्च itemised होंगे। बची unearned राशि लौटाई जाएगी। पूरा advance अपने-आप जब्त नहीं होगा; अगली milestone राशि अलग मंजूरी के बिना नहीं ली जाएगी।']
 ],
 software: [
  ['प्रोजेक्ट शुल्क और बाहरी खर्च','₹999 केवल software discovery और requirements-review advance है, पूरे software की कीमत नहीं। Modules, platform, कुल price और milestones लिखित quotation में मंजूर होंगे। Hosting/cloud, API subscriptions, licences और third-party tools अलग तभी होंगे जब पहले बताकर ग्राहक से मंजूरी ली जाए। कोई सरकारी/पोर्टल शुल्क लागू नहीं है。'.replace('。','।')],
  ['सॉफ्टवेयर का अनुमानित समय','Complete brief और verified advance के बाद शुरुआती scope review/लिखित अनुमान सामान्यतः 2–4 कार्यदिवस ले सकता है। मंजूर scope के बाद focused desktop/browser utility लगभग 4–8 सप्ताह, medium business system 2–4 महीने और complex CRM/ERP/automation platform 4–8 महीने या अधिक ले सकता है। अंतिम schedule मंजूर quotation में होगा।'],
  ['देरी और निर्भरताएँ','Data migration, पुराने software integration, third-party APIs, security/compatibility testing, customer feedback, access या milestone payment में देरी और scope change से समय बढ़ सकता है। बिना मंजूरी अतिरिक्त module/feature शामिल नहीं होगा।'],
  ['रद्दीकरण और रिफंड','रद्दीकरण पर वास्तव में पूरा हुआ discovery/development काम और ग्राहक द्वारा पहले से मंजूर, प्रमाणित non-recoverable third-party खर्च itemised होंगे। बची unearned राशि लौटाई जाएगी। पूरा advance अपने-आप जब्त नहीं होगा और कोई अगली milestone राशि स्वतः नहीं कटेगी।']
 ],
 design: [
  ['डिज़ाइन शुल्क और डिलीवरी','पैकेज शुल्क केवल उसमें लिखी संख्या, size, formats और deliverables के लिए है। Printing, ad spend, copywriting, editable source/vector files या अतिरिक्त formats तभी शामिल होंगे जब quotation में स्पष्ट हों। कोई सरकारी/पोर्टल शुल्क लागू नहीं है।'],
  ['ग्राफिक डिज़ाइन का अनुमानित समय','अंतिम text, logo, images, dimensions और brief मिलने के बाद एक poster/banner 1–2 कार्यदिवस, पाँच social posts 3–5 कार्यदिवस, starter logo 3–5 कार्यदिवस और चार-पेज brochure 4–6 कार्यदिवस ले सकता है। Complex illustration या अतिरिक्त formats का अलग अनुमान होगा।'],
  ['देरी और revisions','अंतिम सामग्री या feedback देर से मिलने, design direction बदलने, अतिरिक्त revision, नए size/format या scope बढ़ने पर समय बढ़ सकता है। शामिल revision rounds और formats package/quotation में लिखे होंगे।'],
  ['रद्दीकरण और रिफंड','रद्दीकरण पर वास्तव में पूरा हुआ और उचित मूल्य वाला design work तथा ग्राहक द्वारा पहले से मंजूर, प्रमाणित non-recoverable third-party खर्च समायोजित होगा। बची unearned राशि लौटाई जाएगी; पूरा शुल्क अपने-आप जब्त नहीं होगा।']
 ]
};
const PROJECT_TIMELINES_EN: Record<ProjectCategory, [string, string][]> = {
 websites: [
  ['Project fee and third-party costs','The fixed package fee covers only its written scope. ₹999 for a custom website is an initial discovery/requirements-review advance, not the full website price. Remaining price and milestones require written approval. Domain, hosting, paid plugins and third-party services are additional only when disclosed and approved in advance. No government or portal fee applies.'],
  ['Indicative website schedule','Basic: about 5–7 working days; Standard: 8–14; Premium: 15–25, starting only after final content, logo, images, access and design approval. A focused custom business website may take about 3–6 weeks; a complex portal/e-commerce/multi-role platform about 6–16 weeks or longer. Initial custom-scope review/estimate may take 2–4 working days after a complete brief and verified advance. The binding schedule is in the approved quotation.'],
  ['Delays and dependencies','Late customer content, access, feedback or milestone payment, scope changes, or hosting/domain/integration/external-platform issues may extend the schedule. Google indexing, ranking and external-platform approval are not guaranteed.'],
  ['Cancellation and refunds','Only the fair value of work actually completed and customer-approved, documented, genuinely non-recoverable third-party costs may be adjusted. Any unearned balance will be returned; the entire advance is not automatically forfeited.']
 ],
 apps: [
  ['Project fee and third-party costs','₹999 is an app discovery/requirements-review advance only, not the full app price. Total price, features, platforms and milestones require written approval. Backend/hosting, APIs, app-store accounts, licences and third-party services are additional only when disclosed and approved in advance. No government or portal fee applies.'],
  ['Indicative app schedule','Initial scope review/estimate may take 2–4 working days after a complete brief and verified advance. After scope approval, a focused MVP may take 6–12 weeks; a medium multi-role app 3–6 months; and a complex app 6 months or longer. The binding milestone schedule is in the approved quotation.'],
  ['Delays and dependencies','Incomplete requirements, delayed content/assets/access/feedback or milestone payments, scope changes, external API/backend integrations, device compatibility, security testing and Apple/Google app-store review may extend the schedule. App-store approval and third-party availability are not guaranteed.'],
  ['Cancellation and refunds','The fair value of discovery/development work actually completed and customer-approved, documented, genuinely non-recoverable third-party costs will be itemised. Any unearned balance will be returned. The entire advance is not automatically forfeited; later milestones require separate approval.']
 ],
 software: [
  ['Project fee and third-party costs','₹999 is a software discovery/requirements-review advance only, not the full software price. Modules, platform, total price and milestones require written approval. Hosting/cloud, API subscriptions, licences and third-party tools are additional only when disclosed and approved in advance. No government or portal fee applies.'],
  ['Indicative software schedule','Initial scope review/estimate may take 2–4 working days after a complete brief and verified advance. After scope approval, a focused desktop/browser utility may take 4–8 weeks; a medium business system 2–4 months; and a complex CRM/ERP/automation platform 4–8 months or longer. The binding schedule is in the approved quotation.'],
  ['Delays and dependencies','Data migration, legacy-software integrations, third-party APIs, security/compatibility testing, delayed customer feedback/access/milestone payments and scope changes may extend the schedule. No extra module or feature is included without approval.'],
  ['Cancellation and refunds','The fair value of discovery/development work actually completed and customer-approved, documented, genuinely non-recoverable third-party costs will be itemised. Any unearned balance will be returned. The entire advance is not automatically forfeited and no later milestone is automatically charged.']
 ],
 design: [
  ['Design fee and deliverables','The package fee covers only the stated quantity, sizes, formats and deliverables. Printing, ad spend, copywriting, editable source/vector files and extra formats are included only when expressly stated in the quotation. No government or portal fee applies.'],
  ['Indicative graphic-design schedule','After final text, logo, images, dimensions and brief are received: one poster/banner 1–2 working days; five social posts 3–5 working days; starter logo 3–5 working days; four-page brochure 4–6 working days. Complex illustration or extra formats require a separate estimate.'],
  ['Delays and revisions','Late final content or feedback, changed design direction, additional revisions, new sizes/formats or expanded scope may extend delivery. Included revision rounds and formats are stated in the package/quotation.'],
  ['Cancellation and refunds','Only the fair value of design work actually completed and customer-approved, documented, genuinely non-recoverable third-party costs may be adjusted. Any unearned balance will be returned; the entire fee is not automatically forfeited.']
 ]
};

interface Props {
  language?: 'en' | 'hi';
  projectCategory?: ProjectCategory;
  termsAccepted: boolean;
  refundAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onRefundChange: (accepted: boolean) => void;
  termsError?: string;
  refundError?: string;
}

export default function BookingPolicyConsent({ language = 'en', projectCategory, termsAccepted, refundAccepted, onTermsChange, onRefundChange, termsError, refundError }: Props) {
  const hindi = language === 'hi';
  const termsHindi = projectCategory ? PROJECT_TERMS_HINDI[projectCategory] : TERMS_HINDI;
  const termsEnglish = projectCategory ? PROJECT_TERMS_ENGLISH[projectCategory] : TERMS_ENGLISH;
  const refundHindi = projectCategory ? PROJECT_TIMELINES[projectCategory] : REFUND_HINDI;
  const refundEnglish = projectCategory ? PROJECT_TIMELINES_EN[projectCategory] : REFUND_ENGLISH;
  return (
    <section className="ds-policy-consents" aria-label={hindi ? 'नीतियों की अनिवार्य स्वीकृति' : 'Required policy acceptance'}>
      <div className="ds-policy-consent-card">
        <label className={termsError ? "ds-policy-checkbox ds-field-invalid" : "ds-policy-checkbox"}>
          <input data-validation-key="termsAccepted" aria-invalid={Boolean(termsError)} type="checkbox" checked={termsAccepted} onChange={(event) => onTermsChange(event.target.checked)} required />
          <span><strong>{hindi ? 'मैं नियम और शर्तों से सहमत हूँ' : 'I agree to the Terms &amp; Conditions'}</strong><small>{hindi ? 'यह अलग से अनिवार्य पुष्टि है। इसे पहले से चुना नहीं गया है।' : 'This is a required, separate confirmation. It is not pre-selected.'}</small></span>
        </label>
        {termsError && <small className="ds-field-error" role="alert">{termsError}</small>}
        <details className="ds-policy-details">
          <summary>{hindi ? 'पूरे नियम और शर्तें पढ़ें' : 'Read full Terms &amp; Conditions'}</summary>
          {hindi ? <ol>{termsHindi.map(([title, body]) => <li key={title}><b>{title}:</b> {body}</li>)}</ol> : <ol>{termsEnglish.map(([title, body]) => <li key={title}><b>{title}:</b> {body}</li>)}</ol>}
          <p className="ds-policy-version">{hindi ? 'नियम और शर्तों का संस्करण:' : 'Terms version:'} {TERMS_POLICY_VERSION}</p>
        </details>
      </div>
      <div className="ds-policy-consent-card">
        <label className={refundError ? "ds-policy-checkbox ds-field-invalid" : "ds-policy-checkbox"}>
          <input data-validation-key="refundAccepted" aria-invalid={Boolean(refundError)} type="checkbox" checked={refundAccepted} onChange={(event) => onRefundChange(event.target.checked)} required />
          <span><strong>{hindi ? 'मैंने रिफंड नीति पढ़ ली है और सहमत हूँ' : 'I have read and agree to the Refund Policy'}</strong><small>{hindi ? 'यह दूसरी, स्वतंत्र पुष्टि है। इसे पहले से चुना नहीं गया है।' : 'This is a second, independent confirmation. It is not pre-selected.'}</small></span>
        </label>
        {refundError && <small className="ds-field-error" role="alert">{refundError}</small>}
        <details className="ds-policy-details">
          <summary>{hindi ? 'पूरी रिफंड नीति पढ़ें' : 'Read full Refund Policy'}</summary>
          {hindi ? <ol>{refundHindi.map(([title, body]) => <li key={title}><b>{title}:</b> {body}</li>)}</ol> : <ol>{refundEnglish.map(([title, body]) => <li key={title}><b>{title}:</b> {body}</li>)}</ol>}
          <p className="ds-policy-version">{hindi ? 'रिफंड नीति का संस्करण:' : 'Refund Policy version:'} {REFUND_POLICY_VERSION}</p>
          <p className="ds-policy-launch-note">{hindi ? 'लाइव भुगतान शुरू करने से पहले TANSHU ONLINE को सत्यापित ग्राहक सहायता / शिकायत संपर्क और व्यवसाय का कानूनी विवरण प्रकाशित करना होगा। इस Preview में भुगतान स्वीकार नहीं किया जाता।' : 'Before live payments are enabled, TANSHU ONLINE must publish its verified customer-care/grievance contact and legal business details. This Preview does not accept payments.'}</p>
        </details>
      </div>
    </section>
  );
}
