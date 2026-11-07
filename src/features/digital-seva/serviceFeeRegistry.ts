import type { SevaService } from './serviceCatalog';

export type FeeVerification = 'official-fixed' | 'route-quote' | 'not-applicable' | 'verify-before-payment';

export interface ServiceFeeDisclosure {
  governmentFee: string;
  governmentRefund: string;
  governmentStatus: FeeVerification;
  officialSourceLabel: string;
  officialSourceUrl: string;
  checkedOn: string;
  serviceFee: string;
  serviceRefund: string;
  note: string;
}

const CHECKED_ON = '7 November 2026';
const UIDAI = 'https://www.uidai.gov.in/en/aadhaar-seva-kendra';
const PAN = 'https://www.incometaxindia.gov.in/en/tax-services/apply-for-pan';
const PROTEAN = 'https://tinpan.proteantech.in/services/pan/form-form_93-form_94.html';
const ECI = 'https://voters.eci.gov.in/';
const ECI_FAQ = 'https://www.eci.gov.in/faq/en/how-to-register/';
const BIHAR = 'https://serviceonline.bihar.gov.in/';

const DEFAULT_DISCLOSURE: Omit<ServiceFeeDisclosure, 'governmentFee' | 'governmentRefund' | 'governmentStatus' | 'officialSourceLabel' | 'officialSourceUrl' | 'note'> = {
  serviceFee: 'Not configured yet — no TANSHU ONLINE amount will be collected in this Preview.',
  serviceRefund: 'Before any live payment, the quoted TANSHU fee, included work, cancellation point and refund calculation must be shown. Any amount retained must reflect work actually completed and applicable consumer law. If TANSHU fails to complete its part, the unearned service fee remains eligible for review/refund.',
  checkedOn: CHECKED_ON,
};

const routeQuote = (sourceLabel: string, sourceUrl: string, note: string): ServiceFeeDisclosure => ({
  ...DEFAULT_DISCLOSURE,
  governmentFee: 'Live official quote required for the exact service, route and applicant before payment.',
  governmentRefund: 'Refund/cancellation is governed by the exact department/provider route. The current rule must be checked and shown with the quote; do not assume every government fee is non-refundable.',
  governmentStatus: 'route-quote',
  officialSourceLabel: sourceLabel,
  officialSourceUrl: sourceUrl,
  note,
});

const disclosures: Record<string, ServiceFeeDisclosure> = {
  'pan-new': routeQuote('Income Tax Department / authorised PAN provider', PAN, 'PAN fees differ by route, paperless/physical mode, physical card and dispatch. Instant e-PAN is free only for eligible applicants. Obtain the live provider quote before accepting payment.'),
  'pan-correction': routeQuote('Protean PAN correction service', PROTEAN, 'Correction/reprint charges depend on the selected provider, paperless or physical-document mode, physical card and dispatch. Show the live quote and provider cancellation rule.'),
  'aadhaar-address-doc': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI lists online myAadhaar PoI/PoA document update as free until 14 June 2027 for the eligible online route; the corresponding centre update is listed at ₹75. Confirm eligibility and route at the time of service.',
    governmentRefund: 'For a free online route there is no government fee to refund. For a paid centre route, check UIDAI’s current cancellation/refund rule and receipt; do not promise a refund without that rule.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI official charges',
    officialSourceUrl: UIDAI,
    note: 'The online concession is route- and date-specific; do not apply it to every Aadhaar update.',
  },
  'aadhaar-address-hof': routeQuote('UIDAI official services and charges', UIDAI, 'Head-of-Family eligibility, consent and fee treatment must be checked for the exact current UIDAI flow.'),
  'aadhaar-co': routeQuote('UIDAI official services and charges', UIDAI, 'C/O is part of the address field, not a separate father-name field. Quote only the applicable address-update route.'),
  'aadhaar-mobile': routeQuote('UIDAI official services and charges', UIDAI, 'Mobile update channel and fee depend on current UIDAI-supported route; centre visit may be required.'),
  'aadhaar-email': routeQuote('UIDAI official services and charges', UIDAI, 'Confirm the current authorised channel and fee; do not assume a separate online update is available.'),
  'aadhaar-lost': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Online UID retrieval through UIDAI: check the live official flow; no fee is to be assumed. Any optional centre search/print charge must be quoted separately.',
    governmentRefund: 'If no government amount was collected, there is no government fee refund. Any centre/provider charge follows its current receipt and refund rule.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'UIDAI official services',
    officialSourceUrl: UIDAI,
    note: 'The customer must enter any OTP directly on the official UIDAI page. TANSHU must never collect OTPs.',
  },
  'aadhaar-download': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'e-Aadhaar download from the official UIDAI route is free. Any optional centre print/search service must be itemised separately and confirmed before proceeding.',
    governmentRefund: 'No government refund applies to a free e-Aadhaar download. Any separately charged centre/provider service follows its own current rule.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI official services',
    officialSourceUrl: UIDAI,
    note: 'Do not combine an optional print charge with the free online download.',
  },
  'certificate-income': routeQuote('Bihar ServicePlus / OGRAS', BIHAR, 'Fee can vary by service and delivery level (CO/SDO/DM). Verify the exact live application and OGRAS amount.'),
  'certificate-caste': routeQuote('Bihar ServicePlus / OGRAS', BIHAR, 'Fee can vary by service and delivery level (CO/SDO/DM). Verify the exact live application and OGRAS amount.'),
  'certificate-residence': routeQuote('Bihar ServicePlus / OGRAS', BIHAR, 'Fee can vary by service and delivery level (CO/SDO/DM). Verify the exact live application and OGRAS amount.'),
  'certificate-correction': routeQuote('Bihar ServicePlus / issuing authority', BIHAR, 'Correction rules and fees depend on the issuing authority and certificate type. Confirm before quoting.'),
  'voter-new': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: '₹0 — ECI Form 6 new voter registration is listed as free of cost. Re-check the live ECI instructions before submission.',
    governmentRefund: 'No government fee is collected for the free Form 6 route. Any separate TANSHU assistance fee is governed by the service-fee terms shown separately.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'Election Commission of India — Form 6',
    officialSourceUrl: ECI_FAQ,
    note: 'This applies to new registration Form 6; do not apply it to replacement EPIC or other Form 8 services.',
  },
  'voter-correction': routeQuote('Election Commission of India / Voters’ Service Portal', ECI, 'Form 8 covers several request types. The reviewed source does not establish one universal fee for every correction/replacement route.'),
  'ration-new': routeQuote('Bihar Food & Consumer Protection Department', 'https://epds.bihar.gov.in/', 'Check current Bihar ration-card eligibility, application route and any fee at the official department portal.'),
  'ration-update': routeQuote('Bihar Food & Consumer Protection Department', 'https://epds.bihar.gov.in/', 'Member addition/deletion and correction requirements or fees must be confirmed for the exact service route.'),
  'scheme-check': routeQuote('Relevant scheme’s official department portal', 'https://www.india.gov.in/my-government/schemes', 'Scheme applications may be free or paid. Identify the exact scheme and official application portal before quoting.'),
  'online-form': routeQuote('Relevant application portal', 'https://serviceonline.bihar.gov.in/', 'The government fee depends on the form/department. Do not quote until the exact application and portal fee are known.'),
};

for (const service of ['pdf-compress','pdf-merge','pdf-split','pdf-jpg','pdf-word','pdf-edit','image-compress','signature-resize','scan-clean','typing-format']) {
  disclosures[service] = {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Not applicable for private file-processing / typing work performed solely by TANSHU ONLINE. If a separate official portal fee is required for a later government submission, it must be itemised separately.',
    governmentRefund: 'No government fee is charged for this private file-processing task itself. Any later official portal fee follows that portal’s own rule.',
    governmentStatus: 'not-applicable',
    officialSourceLabel: 'Service scope — private file processing',
    officialSourceUrl: 'https://www.consumerhelpline.gov.in/',
    note: 'The TANSHU ONLINE service price is still not configured. Do not accept payment until the amount and deliverable are disclosed.',
  };
}

export function getServiceFeeDisclosure(service: SevaService): ServiceFeeDisclosure {
  return disclosures[service.id] || routeQuote('Relevant official department/provider portal', 'https://www.india.gov.in/', 'The exact authority, route, fee and refund rule have not yet been verified for this service.');
}
