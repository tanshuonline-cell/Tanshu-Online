import React from 'react';

export const TERMS_POLICY_VERSION = 'terms-2026-11-07-v1';
export const REFUND_POLICY_VERSION = 'refund-2026-11-07-v1';

interface Props {
  language?: 'en' | 'hi';
  termsAccepted: boolean;
  refundAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onRefundChange: (accepted: boolean) => void;
}

export default function BookingPolicyConsent({ language = 'en', termsAccepted, refundAccepted, onTermsChange, onRefundChange }: Props) {
  const hindi = language === 'hi';
  return (
    <section className="ds-policy-consents" aria-label={hindi ? 'नीतियों की अनिवार्य स्वीकृति' : 'Required policy acceptance'}>
      <div className="ds-policy-consent-card">
        <label className="ds-policy-checkbox">
          <input type="checkbox" checked={termsAccepted} onChange={(event) => onTermsChange(event.target.checked)} required />
          <span><strong>{hindi ? 'मैं नियम और शर्तों से सहमत हूँ' : 'I agree to the Terms &amp; Conditions'}</strong><small>{hindi ? 'यह अलग से अनिवार्य पुष्टि है। इसे पहले से चुना नहीं गया है।' : 'This is a required, separate confirmation. It is not pre-selected.'}</small></span>
        </label>
        <details className="ds-policy-details">
          <summary>{hindi ? 'पूरे नियम और शर्तें पढ़ें' : 'Read full Terms &amp; Conditions'}</summary>
          <ol>
            <li><b>Independent assistance:</b> TANSHU ONLINE is a private digital assistance provider, not UIDAI, an election office, a government department or an issuing authority.</li>
            <li><b>Service scope:</b> We provide only the assistance described for the selected service, such as document preparation, form-filling guidance, file processing or submission assistance where authorised.</li>
            <li><b>Correct information:</b> You must provide true, complete and current information and lawful supporting documents. We will not create false records, alter issued certificates to misrepresent facts, bypass official checks or guarantee approval.</li>
            <li><b>Review before submission:</b> You must review names, dates, addresses, category, attachments and other entries before authorising any application submission. Tell us promptly if anything is incorrect.</li>
            <li><b>OTP and passwords:</b> Never disclose an OTP, password, PIN or account recovery code to staff or in this form. Enter authentication codes yourself on the official website/app whenever possible.</li>
            <li><b>Fees:</b> Government/provider fees and TANSHU ONLINE service fees are separate. Any applicable taxes or payment-provider charges will also be disclosed separately before payment. No fee is collected in this Preview.</li>
            <li><b>Government decisions:</b> The competent authority alone decides eligibility, acceptance, correction, approval, rejection and issuance. Our service-time target does not control government processing time.</li>
            <li><b>Customer cooperation:</b> Missing, unclear or inconsistent information may pause our work until clarification is received. We will communicate what is needed; we will not silently change your information.</li>
            <li><b>Privacy:</b> Personal information will be used only for the requested service. Before any sensitive document is collected, the applicable privacy notice, access controls and retention/deletion period must be shown. Do not submit sensitive documents in this Preview.</li>
            <li><b>Cancellation and complaints:</b> Cancellation, service-fee adjustment and refunds are handled under the separate Refund Policy and applicable law. A complaint may be raised through the customer-care/grievance channel that will be displayed before live service/payment launch.</li>
            <li><b>Preview status:</b> This form is a development preview. Booking, document upload and payment features may be unavailable; a preview request is not proof that a government application has been filed.</li>
          </ol>
          <p className="ds-policy-version">Terms version: {TERMS_POLICY_VERSION}</p>
        </details>
      </div>
      <div className="ds-policy-consent-card">
        <label className="ds-policy-checkbox">
          <input type="checkbox" checked={refundAccepted} onChange={(event) => onRefundChange(event.target.checked)} required />
          <span><strong>{hindi ? 'मैंने रिफंड नीति पढ़ ली है और सहमत हूँ' : 'I have read and agree to the Refund Policy'}</strong><small>{hindi ? 'यह दूसरी, स्वतंत्र पुष्टि है। इसे पहले से चुना नहीं गया है।' : 'This is a second, independent confirmation. It is not pre-selected.'}</small></span>
        </label>
        <details className="ds-policy-details">
          <summary>{hindi ? 'पूरी रिफंड नीति पढ़ें' : 'Read full Refund Policy'}</summary>
          <ol>
            <li><b>Separate fee components:</b> The official Government/Provider Fee, TANSHU ONLINE Service Fee, applicable taxes and payment-provider charges will be shown as separate line items before any live payment.</li>
            <li><b>Government/provider fee:</b> Refunds and cancellations follow the exact department/provider rule for the selected service and route. A government fee is not automatically non-refundable. If the amount has not been paid to the authority, it must not be represented as already deposited. If the authority permits a refund, we will explain the available process and assist with the records reasonably required.</li>
            <li><b>TANSHU ONLINE service fee:</b> The fee covers only the work and deliverables disclosed in the quote. If a request is cancelled, any amount retained must be fair, disclosed in advance, proportionate to work actually completed and consistent with applicable consumer law. There is no blanket rule that the entire service fee is forfeited as soon as work starts.</li>
            <li><b>Failure attributable to TANSHU ONLINE:</b> If we cannot complete the agreed work because of our own technical, system or process failure, we will review and refund the unearned portion of our service fee. Any government amount not deposited or recoverable will also be addressed. If an incorrect filing is caused by us, we will assess correction without an extra service charge or a reasonable refund, subject to the official process.</li>
            <li><b>Customer-side delay or incorrect documents:</b> If required documents, clarification or customer approval are missing, the service may be paused and the customer will be told what is pending. Any cancellation adjustment will consider work actually completed and the terms disclosed before payment; customer delay does not remove statutory rights.</li>
            <li><b>7–15 calendar day service commitment:</b> Our target is to complete our own agreed part within 7 calendar days after receiving the required information/documents and any required authorisation. In exceptional technical/system situations, our own work may take up to 15 calendar days. We will communicate a delay. This is not a government approval or government processing guarantee.</li>
            <li><b>If our work is not completed within 15 days:</b> Where the delay/non-completion is within TANSHU ONLINE’s responsibility, the customer may request review of the unearned service fee and any government amount not deposited or recoverable. This does not limit any stronger right available under law.</li>
            <li><b>Government decision after submission:</b> Once a valid application has been successfully submitted and acknowledged, later approval/rejection or processing time is controlled by the authority. We cannot promise an approval or refund of an official fee where the authority’s published rule does not allow it. Any TANSHU service-fee issue is assessed separately.</li>
            <li><b>How to request a refund:</b> Quote your booking/reference number, service name, payment reference (if any) and a brief reason through the customer-care/grievance channel displayed at live launch. Do not send OTPs, passwords or full identity numbers.</li>
            <li><b>Decision and payment method:</b> Eligible refunds will ordinarily be initiated to the original payment method, subject to payment-provider/bank processing and applicable statutory timelines. We will communicate the decision and status. A failed merchant UPI transaction where the payer is debited but the merchant is not credited is handled under the payment-system reversal rules, separately from a service refund.</li>
            <li><b>Legal rights:</b> Nothing in this policy removes rights or remedies available under applicable consumer-protection or other law. Where a legal rule provides a more protective remedy or timeline, that rule prevails.</li>
          </ol>
          <p className="ds-policy-version">Refund Policy version: {REFUND_POLICY_VERSION}</p>
          <p className="ds-policy-launch-note">Before live payments are enabled, TANSHU ONLINE must publish its verified customer-care/grievance contact and legal business details. This Preview does not accept payments.</p>
        </details>
      </div>
    </section>
  );
}
