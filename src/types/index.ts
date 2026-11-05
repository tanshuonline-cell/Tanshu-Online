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
  hindiTitle?: string;
  category: string;
  hindiCategory?: string;
  summary: string;
  hindiSummary?: string;
  officialPortal: string;
  officialPortalName: string;
  hindiOfficialPortalName?: string;
  processingTime: string;
  hindiProcessingTime?: string;
  estimatedFee: string;
  hindiEstimatedFee?: string;
  eligibility: string[];
  hindiEligibility?: string[];
  requiredDocuments: string[];
  hindiRequiredDocuments?: string[];
  steps: string[];
  hindiSteps?: string[];
  trackUrl?: string;
  jurisdiction?: 'central' | 'bihar';
  serviceType?: 'identity' | 'revenue' | 'land' | 'welfare' | 'transport' | 'utility';
}

export interface GovernmentScheme {
  id: string;
  name: string;
  hindiName?: string;
  ministry: string;
  hindiMinistry?: string;
  targetBeneficiaries: string;
  hindiTargetBeneficiaries?: string;
  financialBenefit: string;
  hindiFinancialBenefit?: string;
  summary: string;
  hindiSummary?: string;
  eligibility: string[];
  hindiEligibility?: string[];
  documentsRequired: string[];
  hindiDocumentsRequired?: string[];
  howToApply: string[];
  hindiHowToApply?: string[];
  officialPortal: string;
  officialPortalName?: string;
  jurisdiction?: 'central' | 'bihar';
  category?: 'farmer' | 'women' | 'youth' | 'health' | 'housing' | 'employment';
}

export type VideoAccessType = 'free' | 'premium';

export interface VideoGuide {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnailUrl?: string;
  instructor: string;
  description: string;
  topics: string[];
  hindiTopics?: string[];
  videoId: string; // for embedding (YouTube ID for free videos or local guide reference)
  // Premium Video System extensions (backward-compatible)
  accessType?: VideoAccessType;
  isPremium?: boolean;
  price?: number; // Price in INR (e.g. 99, 149)
  currency?: string; // e.g. 'INR'
  streamVideoId?: string; // Cloudflare Stream Video UID for secure playback
  youtubeUrl?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  isSample?: boolean; // Indicates sample catalog entry awaiting media upload in Cloudflare Stream
  isActive?: boolean; // Admin active/inactive status flag
  // Bilingual Guide Details
  hindiTitle?: string;
  hindiDescription?: string;
  aboutEn?: string; // Short, professional About summary (what is learned, key guidance, who it's for, expectations)
  aboutHi?: string; // Hindi translation of the About section
  requiredDocuments?: string[];
  hindiRequiredDocuments?: string[];
  stepsSummary?: string[];
  hindiStepsSummary?: string[];
  targetAudience?: string;
  hindiTargetAudience?: string;
}

export interface AdminUser {
  username: string;
  role: 'superadmin' | 'admin';
  lastLogin?: string;
}

export interface CustomerPurchaseRecord {
  id: string;
  customerPhone: string;
  customerEmail?: string;
  videoId: string;
  videoTitle?: string;
  orderId: string;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  grantedAt: string;
  isRevoked: boolean;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'USER_DROPPED' | 'CANCELLED';

export interface VideoPaymentOrder {
  orderId: string;
  videoId: string;
  videoTitle: string;
  orderAmount: number;
  orderCurrency: string;
  customerPhone: string;
  customerEmail?: string;
  paymentSessionId?: string;
  orderStatus: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  paymentSessionId: string;
  orderStatus: PaymentStatus;
  orderAmount: number;
  orderCurrency: string;
}

export interface PaymentVerificationRequest {
  orderId: string;
  customerPhone: string;
  videoId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  videoId: string;
  orderStatus: PaymentStatus;
  accessToken?: string;
  message: string;
}

export interface VideoPlaybackAuthorization {
  videoId: string;
  authorized: boolean;
  playbackToken?: string; // Cloudflare Stream signed playback token
  streamUrl?: string; // Cloudflare Stream embed URL with signed token
  expiresAt?: string;
  message?: string;
}

export interface CustomerVideoAccess {
  customerPhone: string;
  customerEmail?: string;
  purchasedVideoIds: string[];
  orderIds: string[];
  lastPurchasedAt: string;
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
