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
  'pan-new': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Live official quote required for the exact current PAN application route, form, provider, paperless/physical mode, card and dispatch. Eligible Instant e-PAN through the Income Tax e-filing portal is free; eligibility is limited and must be checked.',
    governmentRefund: 'Cancellation/refund follows the selected authorised provider and application route. Check the live provider terms before payment; do not assume all PAN fees are non-refundable.',
    governmentStatus: 'route-quote',
    officialSourceLabel: 'Income Tax Department PAN / Instant e-PAN',
    officialSourceUrl: PAN,
    note: 'PAN application forms changed for applications filed on or after 1 April 2026. Confirm the current form and exact provider quote at the time of request; no old fee example is treated as a universal price.',
  },
  'pan-correction': routeQuote('Protean PAN correction service', PROTEAN, 'Correction/reprint charges depend on the selected provider, paperless or physical-document mode, physical card and dispatch. Show the live quote and provider cancellation rule.'),
  'pan-photo-signature': routeQuote('Authorised PAN provider — photo/signature correction', PROTEAN, 'TANSHU ONLINE assistance fee is ₹250. Government/provider fee varies by selected provider, physical/e-PAN mode and dispatch; verify and show the live quote before payment.'),
  'aadhaar-address-doc': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI lists a separate demographic update (including address) at ₹75. It is free when performed together with a biometric update. Do not confuse this with the separate PoI/PoA document-only update concession (free online until 14 June 2027).',
    governmentRefund: 'For a paid UIDAI transaction, cancellation/refund is subject to the current UIDAI appointment/transaction rule and receipt. UIDAI states cancelled appointment refunds are usually credited in 7–21 days after processing; confirm the exact route before promising a refund.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI official charges and FAQ',
    officialSourceUrl: UIDAI,
    note: 'This service means an address change. The free myAadhaar PoI/PoA document-only update concession must not be misrepresented as a free address-change transaction.',
  },
  'aadhaar-address-hof': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI demographic update including address is ₹75 when done separately, and free when combined with a biometric update. Confirm whether the current HoF-based online route has any different displayed charge before submission.',
    governmentRefund: 'Follow the live UIDAI transaction/appointment cancellation rule and payment receipt. Do not state that all UIDAI fees are non-refundable.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'UIDAI official charges',
    officialSourceUrl: UIDAI,
    note: 'HoF eligibility, relationship evidence and HoF consent/authentication must be satisfied; fee must be rechecked on the selected flow.',
  },
  'aadhaar-co': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'C/O is part of the address field. UIDAI demographic address update is ₹75 when done separately, and free when combined with a biometric update. Confirm the exact route before payment.',
    governmentRefund: 'Follow the live UIDAI transaction/appointment cancellation rule and payment receipt.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'UIDAI official charges',
    officialSourceUrl: UIDAI,
    note: 'C/O is not a separate father-name field; only use the applicable address-update route.',
  },
  'aadhaar-mobile': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI demographic update including mobile number is ₹75 when done separately, and free when performed together with a biometric update. Confirm the current app/centre route.',
    governmentRefund: 'Follow the current UIDAI transaction/appointment cancellation rule and payment receipt.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI official charges',
    officialSourceUrl: UIDAI,
    note: 'UIDAI currently lists mobile update through supported app/centre channels. The customer must enter OTP/authentication directly; TANSHU must not collect it.',
  },
  'aadhaar-email': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI demographic update including email is ₹75 when done separately, and free when combined with a biometric update. UIDAI has also waived the ₹75 email-update charge through the Aadhaar mobile application from 1 July to 31 December 2026; verify app availability and current notice.',
    governmentRefund: 'Follow the current UIDAI transaction/appointment cancellation rule and payment receipt. A waived/free route has no government fee to refund.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'UIDAI charges and June 2026 fee-waiver memorandum',
    officialSourceUrl: 'https://uidai.gov.in/images/OM_dated_18-06-2026.pdf',
    note: 'The app waiver is temporary through 31 December 2026. Centre-based email update and later dates may have different fee treatment.',
  },
  'aadhaar-lost': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Online UID retrieval through UIDAI: no fee is shown for the online retrieval flow. UIDAI lists ₹40 for Aadhaar search/Find Aadhaar and colour print on A4 at a centre; show it only if that optional centre service is actually requested.',
    governmentRefund: 'If no government amount was collected, there is no government fee refund. Any centre/provider charge follows its current receipt and refund rule.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'UIDAI official services',
    officialSourceUrl: UIDAI,
    note: 'The customer must enter any OTP directly on the official UIDAI page. TANSHU must never collect OTPs.',
  },
  'aadhaar-download': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'e-Aadhaar download from the official UIDAI route is free. UIDAI lists ₹40 for Aadhaar search/Find Aadhaar and colour print on A4 at a centre; show it only if that optional centre service is actually requested.',
    governmentRefund: 'No government refund applies to a free e-Aadhaar download. Any separately charged centre/provider service follows its own current rule.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI official services',
    officialSourceUrl: UIDAI,
    note: 'Do not combine an optional print charge with the free online download.',
  },
  'aadhaar-pvc-assistance': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'UIDAI Aadhaar PVC card order charge is ₹75 inclusive of taxes and Speed Post delivery (effective 1 January 2026). The customer must place/confirm the order on UIDAI and enter OTP themselves.',
    governmentRefund: 'Check the current UIDAI order/cancellation rule for the exact transaction. Do not promise refund after an order is placed or dispatched unless UIDAI confirms eligibility.',
    governmentStatus: 'official-fixed',
    officialSourceLabel: 'UIDAI Aadhaar PVC Card official fee',
    officialSourceUrl: 'https://uidai.gov.in/hi/aadhaar-online-services',
    note: 'UIDAI delivers to the address registered in Aadhaar, normally by Speed Post. TANSHU ONLINE assistance is a separate ₹100 service fee.',
  },
  'bw-print': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Not applicable for private document printing.',
    governmentRefund: 'No government fee applies. Any reprint/cancellation adjustment follows the disclosed print-work terms and actual pages already printed.',
    governmentStatus: 'not-applicable',
    officialSourceLabel: 'Private printing service',
    officialSourceUrl: 'https://www.consumerhelpline.gov.in/',
    note: 'TANSHU ONLINE print charge is ₹5 per printed page. Confirm page count and print settings before printing.',
  },
  'colour-print': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Not applicable for private document printing.',
    governmentRefund: 'No government fee applies. Any reprint/cancellation adjustment follows the disclosed print-work terms and actual pages already printed.',
    governmentStatus: 'not-applicable',
    officialSourceLabel: 'Private printing service',
    officialSourceUrl: 'https://www.consumerhelpline.gov.in/',
    note: 'TANSHU ONLINE print charge is ₹10 per printed page. Special photo paper or other media, if requested, must be quoted separately.',
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
  'voter-correction': {
    ...DEFAULT_DISCLOSURE,
    governmentFee: 'Form 8 correction/shifting requests: confirm the live ECI route before quoting. For a lost EPIC replacement, ECI FAQ lists ₹25 with a copy of the police complaint; no fee is charged where loss was due to events beyond the elector’s control such as flood, fire or another natural disaster.',
    governmentRefund: 'Follow the current ECI instruction for the selected Form 8 request and any paid replacement-EPIC transaction. Do not apply the ₹25 lost-card fee to every correction request.',
    governmentStatus: 'verify-before-payment',
    officialSourceLabel: 'Election Commission of India — Form 8 / FAQ',
    officialSourceUrl: 'https://www.eci.gov.in/faq/2/9',
    note: 'Correction, shifting and replacement are different Form 8 request types. Confirm which one the customer actually needs.',
  },
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

const TANSHU_SERVICE_FEES: Record<string, string> = {
  'pan-new': '₹150 TANSHU ONLINE assistance fee + applicable official PAN/provider fee.',
  'aadhaar-address-doc': '₹200 TANSHU ONLINE assistance fee + ₹75 UIDAI demographic address-update fee (unless the selected eligible route is free).',
  'aadhaar-address-hof': '₹100 TANSHU ONLINE assistance fee + applicable UIDAI fee; confirm the live HoF route before payment.',
  'aadhaar-co': '₹200 TANSHU ONLINE assistance fee + applicable UIDAI address-update fee; C/O is part of the address, not a separate father-name update.',
  'aadhaar-mobile': '₹100 TANSHU ONLINE assistance fee + applicable UIDAI fee; confirm the selected app/centre route before payment.',
  'pan-correction': '₹150 TANSHU ONLINE assistance fee + applicable official PAN/provider fee.',
  'pan-photo-signature': '₹250 TANSHU ONLINE assistance fee + applicable official PAN/provider fee.',
  'aadhaar-download': '₹30 e-Aadhaar download assistance. Optional Aadhaar print: B/W ₹30 or colour ₹50. Download + B/W print ₹50; download + colour print ₹70.',
  'certificate-income': 'Bihar: ₹50 TANSHU ONLINE fee per Income Certificate. Uttar Pradesh: ₹100 per certificate. Other states: quote before starting. Add any applicable government/portal fee separately after checking the exact application route.'
  'certificate-caste': 'Bihar: ₹50 TANSHU ONLINE fee per Caste Certificate. Uttar Pradesh: ₹100 per certificate. Other states: quote before starting. Add any applicable government/portal fee separately after checking the exact application route.'
  'certificate-residence': 'Bihar: ₹50 TANSHU ONLINE fee per Domicile/Residence Certificate. Uttar Pradesh: ₹100 per certificate. Other states: quote before starting. Add any applicable government/portal fee separately after checking the exact application route.'
  'voter-new': '₹100 TANSHU ONLINE assistance fee. ECI Form 6 government fee is ₹0.',
  'voter-correction': '₹100 TANSHU ONLINE assistance fee + any applicable official replacement/provider fee.',
  'ration-new': '₹300 TANSHU ONLINE assistance fee + any applicable Bihar department fee, which must be checked on the exact official application route and shown separately.',
  'ration-update': '₹100 TANSHU ONLINE assistance fee + any applicable Bihar department fee.',
  'online-form': '₹100–₹150 depending on the form and work complexity; quote before starting + any applicable portal fee.',
  'pdf-compress': '₹30 per PDF task.',
  'pdf-merge': '₹30 per PDF task.',
  'pdf-split': '₹30 per PDF task.',
  'pdf-jpg': '₹30 per conversion task.',
  'pdf-word': '₹30 per conversion task; complex formatting/OCR must be quoted separately.',
  'pdf-edit': '₹30 per PDF task; extensive editing must be quoted separately.',
  'image-compress': '₹30 per image resize/compression task.',
  'signature-resize': '₹30 per signature resize task.',
  'scan-clean': '₹10 per page.',
  'bw-print': '₹5 per printed page.',
  'colour-print': '₹10 per printed page.',
  'aadhaar-pvc-assistance': '₹100 TANSHU ONLINE assistance fee + ₹75 UIDAI PVC card order fee.',
};

export function getServiceFeeDisclosure(service: SevaService): ServiceFeeDisclosure {
  const disclosure = disclosures[service.id] || routeQuote('Relevant official department/provider portal', 'https://www.india.gov.in/', 'The exact authority, route, fee and refund rule have not yet been verified for this service.');
  return { ...disclosure, serviceFee: TANSHU_SERVICE_FEES[service.id] || disclosure.serviceFee };
}
