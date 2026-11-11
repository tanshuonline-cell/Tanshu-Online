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
  ,
  'pdf-split': {
    serviceId: 'pdf-split', totalAmount: 30, governmentFee: 0, tanshuFee: 30, currency: 'INR',
    routeLabel: 'Private PDF page-splitting task',
    note: '₹30 is the TANSHU ONLINE fee for one PDF task. The customer supplies the PDF and selected page numbers/ranges; the separated PDF output is delivered after processing.'
  }
};

export function getAutoPaymentQuote(service: SevaService | string): AutoPaymentQuote | null {
  const serviceId = typeof service === 'string' ? service : service.id;
  return AUTO_PAYMENT_QUOTES[serviceId] || null;
}
