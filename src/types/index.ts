export type ToolCategory = 
  | 'all'
  | 'business'
  | 'pvc-id'
  | 'photo'
  | 'pdf'
  | 'converter'
  | 'calculator'
  | 'whatsapp'
  | 'scanning'
  | 'legal-docs';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  categoryLabel: string;
  description: string;
  detailedInstructions: string;
  isFeatured?: boolean;
  badge?: string;
  iconName: string;
  keyFeatures: string[];
}

export interface GovernmentService {
  id: string;
  title: string;
  category: string;
  summary: string;
  officialPortal: string;
  officialPortalName: string;
  processingTime: string;
  estimatedFee: string;
  eligibility: string[];
  requiredDocuments: string[];
  steps: string[];
  trackUrl?: string;
  jurisdiction?: 'central' | 'bihar';
  serviceType?: 'identity' | 'revenue' | 'land' | 'welfare' | 'transport' | 'utility';
}

export interface GovernmentScheme {
  id: string;
  name: string;
  hindiName?: string;
  ministry: string;
  targetBeneficiaries: string;
  financialBenefit: string;
  summary: string;
  eligibility: string[];
  documentsRequired: string[];
  howToApply: string[];
  officialPortal: string;
  jurisdiction?: 'central' | 'bihar';
  category?: 'farmer' | 'women' | 'youth' | 'health' | 'housing' | 'employment';
}

export interface VideoGuide {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnailUrl?: string;
  instructor: string;
  description: string;
  topics: string[];
  videoId: string; // for embedding
}

export interface PinCodeEntry {
  pincode: string;
  officeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  district: string;
  state: string;
  deliveryStatus: 'Delivery' | 'Non-Delivery';
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // e.g. 0, 5, 12, 18
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  businessName: string;
  businessGstin: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
  upiId: string;
}
