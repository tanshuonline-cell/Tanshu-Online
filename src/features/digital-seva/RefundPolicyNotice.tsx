import React from 'react';
import type { SevaCategory } from './serviceCatalog';

interface RefundPolicyNoticeProps {
  category: SevaCategory;
}

export default function RefundPolicyNotice({ category }: RefundPolicyNoticeProps) {
  const privateFileService = category === 'pdf' || category === 'documents';

  return (
    <section className="ds-refund-notice" aria-label="Fee and refund information">
      <div className="ds-refund-notice-heading">
        <strong>Fees & Refund Information</strong>
        <span>Read before proceeding</span>
      </div>
      <div className="ds-refund-row">
        <b>Government Fee</b>
        <p>
          {privateFileService
            ? 'Not applicable for private file-processing work. If a separate government or external portal fee applies, it will be shown separately before payment.'
            : 'Depends on the exact official department/provider route. Refund and cancellation follow that authority’s current rules; not every government fee is automatically non-refundable.'}
        </p>
      </div>
      <div className="ds-refund-row">
        <b>TANSHU ONLINE Service Fee</b>
        <p>
          This charge will be shown separately. Refund eligibility depends on the work actually completed, the reason the service could not be completed, and applicable consumer-protection rules. A blanket no-refund rule will not be applied.
        </p>
      </div>
      <div className="ds-refund-timeline">
        <b>Our service-time commitment</b>
        <p>We aim to complete our part within 7 calendar days. In exceptional technical or system situations, this may extend up to 15 calendar days. This is TANSHU ONLINE’s service commitment, not a guarantee of government approval or government processing time.</p>
      </div>
      <p className="ds-refund-preview-note">Preview information only. Exact fees and service-specific refund terms must be verified and displayed before payments are enabled.</p>
    </section>
  );
}
