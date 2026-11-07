import React from 'react';
import type { SevaService } from './serviceCatalog';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';

interface RefundPolicyNoticeProps { service: SevaService; language?: 'en' | 'hi'; }

export default function RefundPolicyNotice({ service, language = 'en' }: RefundPolicyNoticeProps) {
  const hindi = language === 'hi';
  const fee = getServiceFeeDisclosure(service);
  const governmentStatus = fee.governmentStatus === 'not-applicable'
    ? (hindi ? 'लागू नहीं' : 'NOT APPLICABLE')
    : fee.governmentStatus === 'official-fixed'
      ? (hindi ? 'आधिकारिक मार्ग — दोबारा जाँचें' : 'OFFICIAL ROUTE — RECHECK')
      : (hindi ? 'लाइव शुल्क की पुष्टि ज़रूरी' : 'LIVE QUOTE REQUIRED');

  return (
    <section className="ds-refund-notice" aria-label="Service-specific fee and refund information">
      <div className="ds-refund-notice-heading">
        <strong>{hindi ? 'सेवा शुल्क और रिफंड विवरण' : 'Service Fee &amp; Refund Details'}</strong>
        <span>{governmentStatus}</span>
      </div>
      <div className="ds-refund-row">
        <b>{hindi ? '1. सरकारी / आधिकारिक प्रदाता शुल्क' : '1. Government / Official Provider Fee'}</b>
        <p>{fee.governmentFee}</p>
        <p className="ds-fee-refund"><strong>{hindi ? 'सरकारी रिफंड नियम:' : 'Government refund rule:'}</strong> {fee.governmentRefund}</p>
        {fee.governmentStatus !== 'not-applicable' && <a className="ds-fee-source" href={fee.officialSourceUrl} target="_blank" rel="noreferrer">{fee.officialSourceLabel} ↗</a>}
      </div>
      <div className="ds-refund-row">
        <b>{hindi ? '2. TANSHU ONLINE सेवा शुल्क' : '2. TANSHU ONLINE Service Fee'}</b>
        <p>{fee.serviceFee}</p>
        <p className="ds-fee-refund"><strong>{hindi ? 'सेवा शुल्क रिफंड:' : 'Service-fee refund:'}</strong> {fee.serviceRefund}</p>
      </div>
      <div className="ds-refund-row">
        <b>{hindi ? '3. इस सेवा से जुड़ी खास जानकारी' : '3. Service-specific note'}</b>
        <p>{fee.note}</p>
      </div>
      <div className="ds-refund-timeline">
        <b>{hindi ? 'हमारी सेवा पूरी करने की समय-सीमा' : 'Our service-time commitment'}</b>
        <p>{hindi ? 'ज़रूरी जानकारी, दस्तावेज़ और अनुमति मिलने के बाद हम अपना निर्धारित काम 7 कैलेंडर दिनों में पूरा करने का लक्ष्य रखते हैं। असाधारण तकनीकी/सिस्टम समस्या में इसमें 15 कैलेंडर दिन तक लग सकते हैं। यह केवल TANSHU ONLINE की सेवा समय-सीमा है, सरकारी मंज़ूरी या सरकारी प्रक्रिया की गारंटी नहीं।' : 'We aim to complete our own agreed work within 7 calendar days after receiving the required information, documents and authorisation. In exceptional technical/system situations, our work may take up to 15 calendar days. This is TANSHU ONLINE’s service commitment only—not a government approval or processing guarantee.'}</p>
      </div>
      <p className="ds-refund-preview-note">{hindi ? 'केवल Preview — अभी कोई भुगतान नहीं लिया जा रहा है। लाइव भुगतान से पहले आधिकारिक शुल्क, प्रदाता नियम, TANSHU सेवा मूल्य, टैक्स और भुगतान शुल्क की पुष्टि करके दिनांक सहित अलग-अलग दिखाए जाएँगे।' : 'Preview only — no payment is being collected. Any official fee, provider rule, TANSHU service price, taxes and payment charges must be confirmed and shown separately in a dated quote before live payment.'}</p>
      <small className="ds-fee-checked">{hindi ? 'स्रोत जाँच की तारीख:' : 'Source review date:'} {fee.checkedOn}. {hindi ? 'आधिकारिक राशि/नियम बदल सकते हैं; भुगतान से पहले लाइव पोर्टल और चुने गए सही मार्ग की दोबारा जाँच ज़रूरी है।' : 'Official amounts/rules can change; the live portal and exact route must be rechecked before payment.'}</small>
    </section>
  );
}
