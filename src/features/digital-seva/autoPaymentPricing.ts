import type { SevaService } from './serviceCatalog';

export interface AutoPaymentQuote {
  serviceId: string;
  totalAmount: number;
  governmentFee: number;
  tanshuFee: number;
  currency: 'INR';
  routeLabel: string;
  note: string;
}

// Approved automatic-checkout quotes. Keep unapproved catalogue services disabled.
// PAN figures assume an Indian physical-card application route.
// UIDAI figures assume a separate demographic address update, not a document-only refresh.
export const AUTO_PAYMENT_QUOTES: Record<string, AutoPaymentQuote> = {
  'pan-new': {
    serviceId: 'pan-new', totalAmount: 300, governmentFee: 107, tanshuFee: 193, currency: 'INR',
    routeLabel: 'Indian physical PAN card route',
    note: 'The total is fixed at ₹300 for the standard Indian physical-card route. A different paperless/e-PAN route must be re-quoted before payment.'
  },
  'pan-correction': {
    serviceId: 'pan-correction', totalAmount: 300, governmentFee: 107, tanshuFee: 193, currency: 'INR',
    routeLabel: 'Indian physical PAN card correction route',
    note: 'Name, father-name and mobile corrections use the same ₹300 total on the standard Indian physical-card route.'
  },
  'pan-photo-signature': {
    serviceId: 'pan-photo-signature', totalAmount: 357, governmentFee: 107, tanshuFee: 250, currency: 'INR',
    routeLabel: 'Indian physical PAN card photo/signature correction route',
    note: '₹250 TANSHU ONLINE assistance + ₹107 standard Indian physical-card provider charge. Confirm the live provider quote before any live payment.'
  },
  'aadhaar-address-doc': {
    serviceId: 'aadhaar-address-doc', totalAmount: 275, governmentFee: 75, tanshuFee: 200, currency: 'INR',
    routeLabel: 'Separate demographic address update with document verification',
    note: 'This is an actual address change. The free online PoI/PoA document-only update is a different service.'
  },
  'aadhaar-address-hof': {
    serviceId: 'aadhaar-address-hof', totalAmount: 175, governmentFee: 75, tanshuFee: 100, currency: 'INR',
    routeLabel: 'HoF-based demographic address update',
    note: 'HoF eligibility, relationship proof and HoF consent are required; confirm the selected UIDAI route before any live payment.'
  },
  'aadhaar-co': {
    serviceId: 'aadhaar-co', totalAmount: 275, governmentFee: 75, tanshuFee: 200, currency: 'INR',
    routeLabel: 'C/O address-detail update',
    note: 'C/O is part of the address, not a separate father-name update.'
  },
  'aadhaar-download': {
    serviceId: 'aadhaar-download', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'e-Aadhaar download assistance only',
    note: '₹30 covers download assistance only. Optional printing is not included and must be quoted separately.'
  },
  'aadhaar-lost': {
    serviceId: 'aadhaar-lost', totalAmount: 50, governmentFee: 0, tanshuFee: 50, currency: 'INR',
    routeLabel: 'Basic UID retrieval guidance',
    note: '₹50 covers basic retrieval guidance. The customer enters any OTP directly; no OTP is collected by TANSHU ONLINE.'
  },
  'aadhaar-pvc-assistance': {
    serviceId: 'aadhaar-pvc-assistance', totalAmount: 175, governmentFee: 75, tanshuFee: 100, currency: 'INR',
    routeLabel: 'UIDAI PVC card order assistance',
    note: '₹75 UIDAI PVC order charge + ₹100 TANSHU ONLINE assistance. The customer must personally confirm the UIDAI order and enter OTP.'
  },
  'voter-new': {
    serviceId: 'voter-new', totalAmount: 100, governmentFee: 0, tanshuFee: 100, currency: 'INR',
    routeLabel: 'ECI Form 6 new voter registration assistance',
    note: 'ECI Form 6 government fee is ₹0. ₹100 is the TANSHU ONLINE assistance fee; approval is decided by the election authority.'
  },
  'scheme-check': {
    serviceId: 'scheme-check', totalAmount: 50, governmentFee: 0, tanshuFee: 50, currency: 'INR',
    routeLabel: 'One-scheme eligibility checklist',
    note: '₹50 covers one selected scheme eligibility checklist and official application-route guidance only; no government application fee is included.'
  },
  'pdf-compress': {
    serviceId: 'pdf-compress', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One PDF compression task',
    note: '₹30 is for one customer-provided PDF compression task.'
  },
  'pdf-merge': {
    serviceId: 'pdf-merge', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One PDF merge task',
    note: '₹30 is for one merge task using the customer-provided PDF files.'
  },
  'pdf-jpg': {
    serviceId: 'pdf-jpg', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One PDF to image conversion task',
    note: '₹30 is for one standard PDF-to-image conversion task.'
  },
  'pdf-word': {
    serviceId: 'pdf-word', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One PDF to Word conversion task',
    note: '₹30 is for one standard PDF-to-Word conversion task. Complex OCR or formatting is quoted separately before work.'
  },
  'pdf-edit': {
    serviceId: 'pdf-edit', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One basic PDF editing task',
    note: '₹30 is for one basic PDF editing task. Extensive editing or multi-page reconstruction is quoted separately before work.'
  },
  'image-compress': {
    serviceId: 'image-compress', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One image resize/compression task',
    note: '₹30 is for one customer-provided image resize or compression task.'
  },
  'signature-resize': {
    serviceId: 'signature-resize', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'One signature resize task',
    note: '₹30 is for one customer-provided signature resize task.'
  },
  'pdf-split': {
    serviceId: 'pdf-split', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'Private PDF page-splitting task',
    note: '₹30 is the TANSHU ONLINE fee for one PDF task. The customer supplies the PDF and selected page numbers/ranges; the separated PDF output is delivered after processing.'
  }

  'website-basic': { serviceId: 'website-basic', totalAmount: 5999, governmentFee: 0, tanshuFee: 5999, currency: 'INR', routeLabel: 'Basic website package — up to 5 pages', note: 'Fixed scope only. Domain, hosting and third-party services are separate.' },
  'website-standard': { serviceId: 'website-standard', totalAmount: 11999, governmentFee: 0, tanshuFee: 11999, currency: 'INR', routeLabel: 'Standard business website — up to 10 pages', note: 'Fixed scope only. Domain, hosting and third-party services are separate.' },
  'website-premium': { serviceId: 'website-premium', totalAmount: 24999, governmentFee: 0, tanshuFee: 24999, currency: 'INR', routeLabel: 'Premium website package — up to 15 pages', note: 'Fixed scope only. E-commerce, SaaS and advanced custom integrations are separate.' },
  'custom-project-advance': { serviceId: 'custom-project-advance', totalAmount: 999, governmentFee: 0, tanshuFee: 999, currency: 'INR', routeLabel: 'Custom software/app project discovery booking advance', note: '₹999 is an initial booking and requirements-review advance only, not the full development cost. Final written quote and milestone plan require customer approval before further payment or development.' },
  'poster-design': { serviceId: 'poster-design', totalAmount: 499, governmentFee: 0, tanshuFee: 499, currency: 'INR', routeLabel: 'One standard poster/banner design', note: 'One design, one final size and up to two reasonable revision rounds. Printing/source files are separate.' },
  'social-media-pack': { serviceId: 'social-media-pack', totalAmount: 1499, governmentFee: 0, tanshuFee: 1499, currency: 'INR', routeLabel: 'Five coordinated social media creatives', note: 'Five designs for one brand/campaign. Copywriting, ad spend and posting management are separate.' },
  'logo-design': { serviceId: 'logo-design', totalAmount: 2499, governmentFee: 0, tanshuFee: 2499, currency: 'INR', routeLabel: 'Starter logo design package', note: 'Two initial directions, one selected refinement and up to two revision rounds. Editable source/vector files are separate.' },
  'brochure-design': { serviceId: 'brochure-design', totalAmount: 2999, governmentFee: 0, tanshuFee: 2999, currency: 'INR', routeLabel: 'Four-page digital brochure design', note: 'Four-page digital brochure with PDF exports. Printing and additional pages are separate.' },

};

export function getAutoPaymentQuote(service: SevaService | string): AutoPaymentQuote | null {
  const serviceId = typeof service === 'string' ? service : service.id;
  return AUTO_PAYMENT_QUOTES[serviceId] || null;
}
