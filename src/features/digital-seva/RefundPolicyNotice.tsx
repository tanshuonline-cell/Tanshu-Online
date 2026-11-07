import React from 'react';
import type { SevaService } from './serviceCatalog';
import { getServiceFeeDisclosure } from './serviceFeeRegistry';

interface RefundPolicyNoticeProps { service: SevaService; }

export default function RefundPolicyNotice({ service }: RefundPolicyNoticeProps) {
  const fee = getServiceFeeDisclosure(service);
  const governmentStatus = fee.governmentStatus === 'not-applicable'
    ? 'NOT APPLICABLE'
    : fee.governmentStatus === 'official-fixed'
      ? 'OFFICIAL ROUTE — RECHECK'
      : 'LIVE QUOTE REQUIRED';

  return (
    <section className="ds-refund-notice" aria-label="Service-specific fee and refund information">
      <div className="ds-refund-notice-heading">
        <strong>Service Fee &amp; Refund Details</strong>
        <span>{governmentStatus}</span>
      </div>
      <div className="ds-refund-row">
        <b>1. Government / Official Provider Fee</b>
        <p>{fee.governmentFee}</p>
        <p className="ds-fee-refund"><strong>Government refund rule:</strong> {fee.governmentRefund}</p>
        {fee.governmentStatus !== 'not-applicable' && <a className="ds-fee-source" href={fee.officialSourceUrl} target="_blank" rel="noreferrer">{fee.officialSourceLabel} ↗</a>}
      </div>
      <div className="ds-refund-row">
        <b>2. TANSHU ONLINE Service Fee</b>
        <p>{fee.serviceFee}</p>
        <p className="ds-fee-refund"><strong>Service-fee refund:</strong> {fee.serviceRefund}</p>
      </div>
      <div className="ds-refund-row">
        <b>3. Service-specific note</b>
        <p>{fee.note}</p>
      </div>
      <div className="ds-refund-timeline">
        <b>Our service-time commitment</b>
        <p>We aim to complete our own agreed work within 7 calendar days after receiving the required information, documents and authorisation. In exceptional technical/system situations, our work may take up to 15 calendar days. This is TANSHU ONLINE’s service commitment only—not a government approval or processing guarantee.</p>
      </div>
      <p className="ds-refund-preview-note">Preview only — no payment is being collected. Any official fee, provider rule, TANSHU service price, taxes and payment charges must be confirmed and shown separately in a dated quote before live payment.</p>
      <small className="ds-fee-checked">Source review date: {fee.checkedOn}. Official amounts/rules can change; the live portal and exact route must be rechecked before payment.</small>
    </section>
  );
}
