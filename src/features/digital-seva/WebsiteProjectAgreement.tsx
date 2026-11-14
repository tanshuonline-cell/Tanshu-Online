import React from 'react';

export const WEBSITE_PROJECT_TERMS_VERSION = 'website-project-terms-2026-11-14-v2';
export const WEBSITE_PROJECT_REFUND_VERSION = 'website-project-refund-2026-11-14-v1';

interface Props {
  language: 'en' | 'hi';
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  acceptedAt: string;
}

const SECTIONS: Array<{ title: string; hiTitle: string; body: string; hiBody: string }> = [
  {
    title: '1. Scope, package limits and written approval',
    hiTitle: '1. काम का दायरा, पैकेज की सीमा और लिखित मंजूरी',
    body: 'The selected Basic, Standard or Premium package includes only the page limits, features and deliverables displayed on the package card and confirmed in the project brief. Anything not listed—such as e-commerce checkout, member accounts, custom dashboards, ERP/CRM, marketplace, SaaS, AI features, complex booking/payment flows, copywriting, data entry or extra pages—is excluded unless added in a written change order with its extra price and revised timeline. Work begins only after the scope, content responsibility, milestones and delivery estimate are confirmed in writing.',
    hiBody: 'चुने गए Basic, Standard या Premium पैकेज में केवल पैकेज कार्ड और लिखित प्रोजेक्ट brief में बताई गई पेज सीमा, फीचर और डिलीवरी शामिल हैं। E-commerce checkout, सदस्य लॉगिन, कस्टम डैशबोर्ड, ERP/CRM, marketplace, SaaS, AI फीचर, जटिल booking/payment flow, copywriting, data entry या अतिरिक्त पेज तभी शामिल होंगे जब उनका अतिरिक्त शुल्क और नया समय लिखित रूप में मंजूर हो। काम शुरू होने से पहले स्कोप, कंटेंट की जिम्मेदारी, पेमेंट चरण और अनुमानित डिलीवरी लिखित रूप में तय होंगे।'
  },
  {
    title: '2. Booking and milestone payments',
    hiTitle: '2. बुकिंग और चरणों में भुगतान',
    body: 'Fixed-price Basic, Standard and Premium packages are paid in full at the displayed Pay Now checkout before work begins; no second package payment is due unless the customer approves an extra-scope quote. For custom websites outside these packages, the ₹999 scope-review advance is for discovery only and is credited against the first project milestone if the customer proceeds. After the written custom quote is approved, the usual proposed schedule is 40% to start, 40% after design direction/homepage preview approval and before the full build, and the final 20% after staging preview/testing but before public launch, production credentials, source files or final handover. Each amount and due date is shown in a written project confirmation/invoice. No balance is automatically charged: the customer receives a separate payment request and must approve it. Work may pause while an agreed milestone payment is overdue.',
    hiBody: 'फिक्स्ड Basic, Standard और Premium पैकेज का पूरा दिखाया गया शुल्क Pay Now पर काम शुरू होने से पहले देना होगा; जब तक ग्राहक अतिरिक्त काम का अलग quotation मंजूर न करे, पैकेज के लिए दूसरी किस्त नहीं होगी। इन पैकेजों से बाहर कस्टम वेबसाइट के लिए ₹999 एडवांस केवल जरूरत/स्कोप समीक्षा का है और ग्राहक प्रोजेक्ट आगे बढ़ाता है तो पहली project milestone राशि में समायोजित होगा। लिखित custom quotation मंजूर होने के बाद सामान्य प्रस्तावित क्रम: काम शुरू करने के लिए 40%; डिजाइन दिशा/होमपेज प्रीव्यू मंजूर होने के बाद और पूरा निर्माण करने से पहले 40%; staging प्रीव्यू/टेस्टिंग के बाद, वेबसाइट लाइव करने, production credentials, source files या अंतिम हैंडओवर से पहले अंतिम 20%। हर किस्त और तारीख लिखित project confirmation/invoice में होगी। कोई शेष राशि अपने-आप नहीं कटेगी; अलग payment request ग्राहक स्वयं मंजूर करेगा। किस्त लंबित होने पर काम रोका जा सकता है।'
  },
  {
    title: '3. Preview access and protection of unpaid work',
    hiTitle: '3. प्रीव्यू और बकाया भुगतान तक काम की सुरक्षा',
    body: 'The customer may review a password-protected or otherwise restricted staging/demo preview at the agreed review milestones. A preview is for evaluation only and may contain watermarking, disabled downloads, sample data or restricted functionality. It is not permission to copy, publish, commercially use, transfer, resell or deploy the work. Before all agreed payments clear, TANSHU ONLINE will not provide the production launch, unrestricted public access, administrator/hosting credentials, domain transfer, full source code, editable project files or final downloadable assets. The customer must not share preview credentials or bypass preview restrictions. After full payment, the agreed final deliverables and customer-specific access will be handed over.',
    hiBody: 'ग्राहक तय review चरणों पर password-protected या सीमित staging/demo प्रीव्यू देख सकेगा। प्रीव्यू केवल जाँच के लिए होगा; इसमें watermark, download बंद, sample data या सीमित फीचर हो सकते हैं। प्रीव्यू देखने का अर्थ काम को कॉपी, प्रकाशित, व्यावसायिक रूप से इस्तेमाल, ट्रांसफर, दोबारा बेचने या लाइव deploy करने की अनुमति नहीं है। सभी तय भुगतान पूरे होने से पहले TANSHU ONLINE production launch, बिना रोक सार्वजनिक access, admin/hosting credentials, domain transfer, पूरा source code, editable project files या अंतिम downloadable assets नहीं देगा। ग्राहक preview login किसी और को नहीं देगा और सुरक्षा रोक को bypass नहीं करेगा। पूरा भुगतान मिलने के बाद सहमत अंतिम deliverables और ग्राहक-विशिष्ट access सौंपे जाएँगे।'
  },
  {
    title: '4. Review rounds, approvals and change requests',
    hiTitle: '4. डिजाइन में सुधार, मंजूरी और बदलाव',
    body: 'Each fixed package includes up to two consolidated revision rounds on the agreed design preview. The customer should send one clear list of changes per round within 3 working days. A revision means refinement within the approved scope; a new layout direction, extra pages, new features, new language/content, replacement of already-approved work or repeated preference changes are scope changes and may require a written additional quote and timeline. Once a milestone is approved in writing, later reversal of that approval may be treated as a change request. TANSHU ONLINE will not proceed with chargeable extra work until the customer approves its price and schedule.',
    hiBody: 'हर फिक्स्ड पैकेज में मंजूर स्कोप के भीतर डिजाइन प्रीव्यू पर अधिकतम दो consolidated revision rounds शामिल हैं। ग्राहक हर राउंड में 3 कार्यदिवस के भीतर बदलावों की एक स्पष्ट सूची भेजे। Revision का अर्थ मंजूर डिजाइन में सुधार है; नया डिजाइन रास्ता, अतिरिक्त पेज/फीचर, नई भाषा/कंटेंट, पहले से मंजूर काम बदलना या बार-बार पसंद बदलना नया scope change माना जा सकता है और इसके लिए अतिरिक्त quotation व समय मंजूर करना होगा। किसी चरण की लिखित मंजूरी के बाद उसे पलटना change request हो सकता है। अतिरिक्त शुल्क वाला काम ग्राहक की लिखित मंजूरी के बिना शुरू नहीं होगा।'
  },
  {
    title: '5. Customer content, access and delays',
    hiTitle: '5. ग्राहक का कंटेंट, एक्सेस और देरी',
    body: 'The customer must supply accurate business details, approved text, logo, images, product information, legal notices and required account/domain access, and must have rights to use all supplied materials. The delivery estimate starts only after the booking payment, complete content/assets and required approvals are received. If customer content, feedback, access or milestone payment is delayed, the project schedule pauses and moves by the delay period plus reasonable rescheduling time. If the project remains blocked for 15 calendar days, TANSHU ONLINE may send a reminder and pause it; after 30 calendar days without response, the project may be marked inactive after notice and settled under the cancellation policy. Restarting may require a new schedule and quote.',
    hiBody: 'ग्राहक सही बिज़नेस जानकारी, मंजूर टेक्स्ट, लोगो, फोटो, प्रोडक्ट विवरण, जरूरी कानूनी सूचना और आवश्यक account/domain access देगा। दिए गए सभी कंटेंट/फोटो के उपयोग का अधिकार ग्राहक के पास होना चाहिए। डिलीवरी का समय तभी शुरू होगा जब बुकिंग भुगतान, पूरा कंटेंट/फाइलें और जरूरी मंजूरियाँ मिल जाएँ। ग्राहक के कंटेंट, feedback, access या किस्त में देरी होने पर प्रोजेक्ट का समय रुक जाएगा और देरी के साथ दोबारा schedule बनाने का उचित समय जुड़ सकता है। 15 कैलेंडर दिनों तक काम रुका रहने पर reminder देकर pause किया जा सकता है; 30 कैलेंडर दिनों तक जवाब न मिलने पर सूचना देकर प्रोजेक्ट inactive किया जा सकता है और cancellation policy के अनुसार हिसाब होगा। दोबारा शुरू करने के लिए नया schedule/quotation लग सकता है।'
  },
  {
    title: '6. Estimated delivery times and exceptional delays',
    hiTitle: '6. अनुमानित समय और विशेष देरी',
    body: 'Current estimates after complete content and approvals: Basic up to 5 pages, 5–7 working days; Standard up to 10 pages, 8–14 working days; Premium up to 15 pages, 15–25 working days. These are estimates, not guaranteed dates. They exclude customer response delays, weekends/public holidays, domain/hosting propagation, third-party outages, payment-provider or API approvals, security incidents and changes outside the approved scope. If TANSHU ONLINE expects a material delay for a reason within its control, it will notify the customer, explain the reason and provide a revised date. If TANSHU ONLINE cannot complete the agreed scope after a reasonable cure period, the customer may cancel and receive a fair refund of the unperformed portion, subject to applicable law.',
    hiBody: 'पूरा कंटेंट और मंजूरियाँ मिलने के बाद वर्तमान अनुमान: Basic (5 पेज तक) 5–7 कार्यदिवस; Standard (10 पेज तक) 8–14 कार्यदिवस; Premium (15 पेज तक) 15–25 कार्यदिवस। ये अनुमान हैं, पक्की गारंटी वाली तारीख नहीं। ग्राहक के जवाब में देरी, रविवार/सरकारी छुट्टी, domain/hosting propagation, third-party outage, payment provider/API approval, security incident और मंजूर स्कोप से बाहर बदलाव इसमें शामिल नहीं हैं। TANSHU ONLINE के नियंत्रण वाले कारण से महत्वपूर्ण देरी होने की संभावना पर ग्राहक को कारण और संशोधित तारीख बताई जाएगी। उचित सुधार-अवधि के बाद भी सहमत काम पूरा न हो सके तो ग्राहक प्रोजेक्ट रद्द कर सकता है और लागू कानून के अनुसार अधूरे काम के हिस्से का उचित रिफंड माँग सकता है।'
  },
  {
    title: '7. Cancellation and refund calculation',
    hiTitle: '7. रद्दीकरण और रिफंड का हिसाब',
    body: 'The customer may request cancellation in writing at any stage. There is no blanket rule that the entire advance is automatically forfeited. The settlement will account for (a) milestones/deliverables actually completed and reasonably valued against the agreed quote, (b) work in progress that can be evidenced, and (c) third-party/domain/hosting/licence costs that the customer approved in advance and that are genuinely non-recoverable. Any remaining unearned amount will be refunded. If no project work has begun, the advance will ordinarily be refunded, less only a clearly disclosed, actually incurred and legally recoverable non-refundable charge, if any. If TANSHU ONLINE cancels or fails to deliver for a reason within its control, the unearned portion will be refunded. Refunds are normally initiated to the original payment method; provider/bank timelines apply. Statutory consumer rights remain unaffected.',
    hiBody: 'ग्राहक किसी भी चरण पर लिखित रूप में cancellation माँग सकता है। ऐसा कोई सामान्य नियम नहीं है कि पूरा एडवांस अपने-आप जब्त हो जाएगा। हिसाब में (क) तय quotation के अनुसार वास्तव में पूरा हुआ और उचित मूल्य वाला काम, (ख) प्रमाणित किया जा सकने वाला चल रहा काम, और (ग) ग्राहक की पहले से मंजूर वास्तविक non-recoverable domain/hosting/licence/third-party लागत शामिल होगी। इसके बाद बची हुई unearned राशि वापस की जाएगी। यदि प्रोजेक्ट का काम शुरू ही नहीं हुआ है, तो सामान्यतः एडवांस वापस होगा; केवल पहले से स्पष्ट बताए गए, वास्तव में लगे और कानूनन वसूल किए जा सकने वाले non-refundable खर्च को ही घटाया जा सकता है। TANSHU ONLINE अपने नियंत्रण के कारण प्रोजेक्ट रद्द करे या काम पूरा न करे तो अधूरे काम की राशि वापस की जाएगी। पात्र रिफंड सामान्यतः मूल भुगतान माध्यम में शुरू होगा; बैंक/payment provider का समय लागू होगा। ग्राहक के कानूनी अधिकार बने रहेंगे।'
  },
  {
    title: '8. Defect fixes, maintenance and third-party services',
    hiTitle: '8. तकनीकी सुधार, मेंटेनेंस और बाहरी सेवाएँ',
    body: 'A 30-calendar-day post-handover correction window is included for reproducible defects where the delivered website materially fails to match the written approved scope. It does not include new features, new content, design preference changes, customer/third-party edits, malware caused by compromised customer credentials, hosting/domain failures or third-party service changes. Ongoing maintenance, backups, content updates, security monitoring, SEO campaigns, paid plugins, premium themes, email, domain, hosting, stock assets, SMS/WhatsApp/API usage and transaction fees are separate unless listed in the quote. Google indexing, ranking, Business Profile verification or approval cannot be guaranteed because these are controlled by Google.',
    hiBody: 'हैंडओवर के बाद 30 कैलेंडर दिनों तक ऐसे दोहराए जा सकने वाले technical defects का सुधार शामिल है जिनमें बनी वेबसाइट लिखित मंजूर स्कोप से महत्वपूर्ण रूप से अलग हो। इसमें नए फीचर, नया कंटेंट, पसंद बदलना, ग्राहक/तीसरे पक्ष द्वारा किए बदलाव, ग्राहक के compromised credentials से malware, hosting/domain outage या third-party service बदलाव शामिल नहीं हैं। लगातार maintenance, backup, content updates, security monitoring, SEO campaign, paid plugins, premium themes, email, domain, hosting, stock assets, SMS/WhatsApp/API usage और transaction fees quotation में शामिल न हों तो अलग होंगे। Google indexing, ranking, Business Profile verification या approval की गारंटी नहीं दी जा सकती क्योंकि ये Google के नियंत्रण में हैं।'
  },
  {
    title: '9. Ownership, licence and handover',
    hiTitle: '9. स्वामित्व, लाइसेंस और अंतिम हैंडओवर',
    body: 'After all agreed project payments clear, the customer receives the customer-specific final deliverables and the rights/licence expressly included in the written quote. TANSHU ONLINE retains ownership of its pre-existing code, reusable components, frameworks, tools, methods and third-party/open-source materials, which remain subject to their own licences. The customer is responsible for the legality and accuracy of supplied content and for ongoing renewals of accounts/subscriptions registered in the customer’s name. No ownership or unrestricted licence to unpaid work is transferred merely because a preview was shown.',
    hiBody: 'प्रोजेक्ट की सभी तय किस्तें सफलतापूर्वक मिलने के बाद ग्राहक को उसके लिए तैयार अंतिम deliverables और लिखित quotation में स्पष्ट रूप से शामिल अधिकार/लाइसेंस दिए जाएँगे। TANSHU ONLINE के पहले से मौजूद code, reusable components, frameworks, tools और methods का स्वामित्व TANSHU ONLINE के पास रहेगा; third-party/open-source सामग्री अपने अलग licence के अधीन रहेगी। ग्राहक अपने दिए कंटेंट की वैधता/सटीकता और अपने नाम पर बने account/subscription के renewal के लिए जिम्मेदार होगा। केवल प्रीव्यू दिखाने से बिना भुगतान वाले काम का स्वामित्व या unrestricted licence ग्राहक को नहीं मिलता।'
  },
  {
    title: '10. Communication and disputes',
    hiTitle: '10. संपर्क और विवाद समाधान',
    body: 'Project decisions, approvals, change requests, delivery notices and cancellation requests should be recorded through the customer support channel shown on the live website or the agreed written communication channel. The customer should quote the project/booking reference and must not send passwords, OTPs or recovery codes. A statutory consumer grievance will be acknowledged within 48 hours and redressed within one month where the Consumer Protection (E-Commerce) Rules, 2020 apply. Ordinary project queries will normally be acknowledged within 3 working days, with an update/resolution plan targeted within 7 working days. These terms do not exclude any remedy available under Indian consumer law.',
    hiBody: 'प्रोजेक्ट के निर्णय, मंजूरी, बदलाव, डिलीवरी सूचना और cancellation अनुरोध live वेबसाइट पर दिए गए customer support माध्यम या पहले से तय लिखित माध्यम से रिकॉर्ड किए जाएँ। ग्राहक project/booking reference बताए; password, OTP या recovery code न भेजे। जहाँ Consumer Protection (E-Commerce) Rules, 2020 लागू हों, वहाँ वैधानिक consumer grievance की प्राप्ति 48 घंटे में स्वीकार और एक महीने के भीतर निपटाई जाएगी। सामान्य project query की प्राप्ति सामान्यतः 3 कार्यदिवस में स्वीकार और 7 कार्यदिवस में अपडेट/समाधान योजना देने का लक्ष्य रहेगा। ये शर्तें भारतीय उपभोक्ता कानून के तहत ग्राहक के किसी अधिकार या उपाय को समाप्त नहीं करतीं।'
  },
  {
    title: '11. Personal data, privacy and access security',
    hiTitle: '11. व्यक्तिगत डेटा, गोपनीयता और access सुरक्षा',
    body: 'The customer should provide only the information genuinely required for the agreed website functions. The customer is responsible for publishing an appropriate privacy notice and obtaining any legally required permissions from its own website visitors/customers, including where forms, analytics, cookies, marketing tools or third-party integrations are used. TANSHU ONLINE will use customer-provided project information only to perform the agreed work, provide support and meet lawful obligations; it will not sell customer personal data. Do not send passwords, OTPs, payment credentials or unnecessary identity/biometric information in a project brief. Demo/staging data should be fictional or appropriately masked. Access credentials must be shared through an agreed secure method and rotated/revoked at handover. Suspected unauthorised access or data exposure should be reported promptly through the agreed support channel.',
    hiBody: 'ग्राहक वेबसाइट के तय फीचर के लिए वास्तव में जरूरी जानकारी ही देगा। अपनी वेबसाइट पर forms, analytics, cookies, marketing tools या third-party integrations होने पर visitors/customers के लिए उचित privacy notice प्रकाशित करना और कानूनन जरूरी अनुमति लेना ग्राहक की जिम्मेदारी होगी। TANSHU ONLINE ग्राहक की project जानकारी केवल सहमत काम, सहायता और कानूनी जिम्मेदारी के लिए उपयोग करेगा; व्यक्तिगत डेटा बेचेगा नहीं। Project brief में password, OTP, payment credentials या अनावश्यक पहचान/biometric जानकारी न भेजें। Demo/staging में काल्पनिक या उचित रूप से छिपाया गया डेटा होना चाहिए। Credentials तय सुरक्षित माध्यम से साझा होंगे और handover पर बदले/रद्द किए जाएँगे। अनधिकृत access या data exposure का शक हो तो तय support channel पर तुरंत सूचना दें।'
  }
];

export default function WebsiteProjectAgreement({ language, accepted, onAcceptedChange, acceptedAt }: Props) {
  const hi = language === 'hi';
  return (
    <section className="ds-web-agreement" aria-label={hi ? 'वेबसाइट प्रोजेक्ट की विशेष शर्तें' : 'Website project terms'}>
      <div className="ds-web-agreement-intro">
        <b>{hi ? 'वेबसाइट प्रोजेक्ट की खास जानकारी' : 'Important: website project terms'}</b>
        <p>{hi ? 'वेबसाइट का प्रीव्यू, किस्तों में भुगतान, काम का समय, रिवीजन, रद्दीकरण और अंतिम एक्सेस देने के नियम नीचे पढ़ें। भुगतान से पहले अलग से सहमति जरूरी है।' : 'Please review the separate website scope, preview access, milestone payments, timelines, revisions, cancellation and final handover rules. A separate acceptance is required before payment.'}</p>
      </div>
      <div className="ds-web-agreement-facts">
        <div><small>{hi ? 'फिक्स्ड पैकेज' : 'Fixed packages'}</small><b>{hi ? '100% पहले' : '100% upfront'}</b></div>
        <div><small>{hi ? 'कस्टम प्रोजेक्ट शुरू' : 'Custom project start'}</small><b>40%</b></div>
        <div><small>{hi ? 'डिजाइन / हैंडओवर' : 'Design / handover'}</small><b>40% + 20%</b></div>
      </div>
      <details className="ds-web-agreement-details">
        <summary>{hi ? 'Website Terms & Conditions पढ़ें' : 'Read Website Terms & Conditions'}</summary>
        <ol>{SECTIONS.filter((section) => !section.title.startsWith('7.')).map((section) => <li key={section.title}><b>{hi ? section.hiTitle : section.title}</b><p>{hi ? section.hiBody : section.body}</p></li>)}</ol>
        <p className="ds-web-agreement-version">{hi ? 'Website Terms संस्करण:' : 'Website Terms version:'} {WEBSITE_PROJECT_TERMS_VERSION}</p>
      </details>
      <details className="ds-web-agreement-details">
        <summary>{hi ? 'Website Refund & Cancellation Policy पढ़ें' : 'Read Website Refund & Cancellation Policy'}</summary>
        <ol>{SECTIONS.filter((section) => section.title.startsWith('7.')).map((section) => <li key={section.title}><b>{hi ? section.hiTitle : section.title}</b><p>{hi ? section.hiBody : section.body}</p></li>)}</ol>
        <p className="ds-web-agreement-version">{hi ? 'Website Refund Policy संस्करण:' : 'Website Refund Policy version:'} {WEBSITE_PROJECT_REFUND_VERSION}</p>
      </details>
      <label className="ds-web-agreement-check">
        <input type="checkbox" checked={accepted} onChange={(event) => onAcceptedChange(event.target.checked)} required />
        <span><b>{hi ? 'मैंने वेबसाइट की विशेष शर्तें और रिफंड नीति पढ़ ली हैं और सहमत हूँ।' : 'I have read and agree to the Website Project Terms & Conditions and Website Refund & Cancellation Policy.'}</b><small>{hi ? 'यह वेबसाइट सेवाओं के लिए अलग और अनिवार्य सहमति है।' : 'This is a separate, required acceptance for website services only.'}</small></span>
      </label>
      {accepted && acceptedAt && <small className="ds-web-agreement-accepted">{hi ? 'सहमति दर्ज करने का समय:' : 'Acceptance recorded at:'} {new Date(acceptedAt).toLocaleString(hi ? 'en-IN' : 'en-GB')}</small>}
    </section>
  );
}
