import { ToolItem } from '../types';

export const CONFIRMED_TOOLS: ToolItem[] = [
  // ==========================================
  // FEATURED TOOLS (Preserved for Homepage)
  // ==========================================
  {
    id: 'passport-size-photo-maker',
    name: 'Passport Size Photo Maker',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    isFeatured: true,
    iconName: 'Camera',
    description: 'Create compliant 3.5×4.5 cm Indian passport photos with custom borders, white/blue background, and 8-photo 4×6 print sheet layout.',
    detailedInstructions: 'Upload a clear portrait, position the face within standard oval guides, adjust contrast, and generate instant 4×6 or A4 print sheets ready for your color printer.',
    keyFeatures: [
      'Standard 3.5 × 4.5 cm & custom stamp sizes',
      'Solid border generator (1px - 3px)',
      '4×6 inch (8 photos) & A4 (32 photos) layouts',
      'High-resolution 300 DPI print output'
    ]
  },
  {
    id: 'auto-document-cropper',
    name: 'Auto Document Cropper',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    isFeatured: true,
    iconName: 'Crop',
    description: 'Automatically detect document boundaries, crop away unwanted table backgrounds, rotate, and enhance text clarity.',
    detailedInstructions: 'Drop your photographed document or receipt. The tool isolates the paper boundaries, applies edge alignment, and produces a crisp, straight document.',
    keyFeatures: [
      'Intelligent paper edge detection',
      'Manual fine-tune corner coordinates',
      '90° / 180° orientation correction',
      'Instant high-res PNG / PDF download'
    ]
  },
  {
    id: 'document-scanner-image-rectifier',
    name: 'Document Scanner & Image Rectifier',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    isFeatured: true,
    iconName: 'ScanLine',
    description: 'Transform angled phone photos into flat, high-contrast black & white or magic-color document scans suitable for official uploads.',
    detailedInstructions: 'Straighten skewed perspective and eliminate uneven ambient shadows using our client-side adaptive thresholding filters.',
    keyFeatures: [
      'Perspective rectification engine',
      'Black & White document thresholding',
      'Magic color enhancement for stamps & seals',
      'File size compressor under 200 KB for govt portals'
    ]
  },
  {
    id: 'pdf-to-pvc-card-auto-cropper',
    name: 'PDF to PVC Card Auto Cropper',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    isFeatured: true,
    iconName: 'CreditCard',
    description: 'Crop standard CR80 ID cards (85.6 × 53.98 mm) from e-Aadhaar, Voter, Ayushman, or Driving License PDFs for instant plastic card printing.',
    detailedInstructions: 'Extract front and back card regions from government PDFs. Pre-formatted with exact millimeter dimensions for Epson and Canon PVC card printing trays.',
    keyFeatures: [
      'Exact standard CR80 ISO dimensions (85.6 × 54 mm)',
      'Precision front & back alignment grids',
      'Direct card-tray template (Epson L805 & Canon)',
      '300 DPI print-ready canvas rendering'
    ]
  },
  {
    id: 'id-card-front-back-print-layout-maker',
    name: 'ID Card Front-Back Print Layout Maker',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    isFeatured: true,
    iconName: 'Layers',
    description: 'Align separate front and back ID photos side-by-side or stacked on 4×6 photo paper with scissors cutting guidelines.',
    detailedInstructions: 'Upload front and back photos of any ID card. Select your print paper size, fine-tune card spacing, and print standard laminatable identity cards in seconds.',
    keyFeatures: [
      'Dual card side-by-side or stacked layout',
      'Dashed scissors cutting lines',
      'Adjustable card gap (2mm to 10mm)',
      'Single-click 4×6 & A4 print formatting'
    ]
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'business',
    categoryLabel: 'CSC & Business',
    isFeatured: true,
    iconName: 'Receipt',
    description: 'Create professional GST and Non-GST bills for cyber cafes, CSC centers, and small retail businesses with live preview and UPI QR codes.',
    detailedInstructions: 'Enter your shop details, customer info, services provided (e.g., Online Form, Lamination, Photo Print), auto-calculate CGST/SGST, and print clean invoices.',
    keyFeatures: [
      'GST & Non-GST invoice support',
      'Auto CGST, SGST, IGST tax breakdown',
      'Dynamic UPI QR code for fast customer payments',
      'Download print-ready PDF with amount in words'
    ]
  },

  // ==========================================
  // CATEGORY 1: CSC & BUSINESS TOOLS (11 Tools)
  // ==========================================
  {
    id: 'cash-payment-receipt-maker',
    name: 'Cash Payment Receipt Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'Receipt',
    description: 'Generate numbered cash payment receipts for cyber cafe services, lamination, print jobs, and online exam form submissions.',
    detailedInstructions: 'Fill in receipt number, customer name, purpose of payment, and cash amount. Includes automatic amount in words and authorized signatory stamp.',
    keyFeatures: [
      'Auto-generated sequential receipt number',
      'Amount in words automatic conversion',
      'Customer copy and shop counter foil',
      'Direct thermal receipt or A4 print format'
    ]
  },
  {
    id: 'rate-list-maker',
    name: 'Rate List Maker (Shop Price Chart)',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'FileText',
    description: 'Design and print professional laminated price charts for cyber cafe photocopying, color prints, lamination, and form charges.',
    detailedInstructions: 'Select default rates or customize per-page black & white, color, PVC smart card, and online consultation fees with cyber cafe header branding.',
    keyFeatures: [
      'Pre-populated standard CSC & Cyber Cafe rates',
      'Custom shop name, address & mobile header',
      'Bilingual Hindi & English rate descriptions',
      'Print-ready high-contrast A4 display poster'
    ]
  },
  {
    id: 'cyber-cafe-work-log',
    name: 'Cyber Cafe Work Log / Job Slip',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'ScrollText',
    description: 'Track daily customer work, pending Aadhaar correction slots, exam admit card print requests, and counter collections.',
    detailedInstructions: 'Maintain a clean digital work register. Record customer names, phone numbers, requested services, token numbers, and payment status.',
    keyFeatures: [
      'Daily customer service entry log',
      'Pending vs Delivered job filter',
      'One-click export to CSV / Excel',
      'Printable customer delivery token slip'
    ]
  },
  {
    id: 'money-transfer-slip-maker',
    name: 'Money Transfer / AEPS Slip Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'BadgeCheck',
    description: 'Instant customer transaction slips for Domestic Money Transfer (DMT), AEPS cash withdrawals, and Aadhaar mini-statements.',
    detailedInstructions: 'Input bank name, RRN / UTR reference number, customer mobile, and transaction amount. Generates a clear proof slip preventing customer disputes.',
    keyFeatures: [
      'Clean RRN / UTR reference record',
      'Supported for SBI, PNB, BOB, HDFC & all AEPS',
      'Includes security disclaimer and agent seal',
      'Fits standard 2-inch & 3-inch thermal printers'
    ]
  },
  {
    id: 'customer-token-queue-slip',
    name: 'Customer Token & Queue Slip Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'Grid',
    description: 'Issue clean numbered queue tokens during heavy rush days (such as Board result releases and last date of police/SSC forms).',
    detailedInstructions: 'Generate sequential queue tokens with approximate wait time and desk number to manage physical crowds in your digital service center.',
    keyFeatures: [
      'Instant sequential token counter',
      'Customizable counter numbers & service desk',
      'Cyber cafe name and helpline watermark',
      'Compact ink-saving slip layout'
    ]
  },
  {
    id: 'quotation-estimate-maker',
    name: 'Quotation & Estimate Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'FileBadge',
    description: 'Provide formal pre-work estimates for bulk school identity cards, corporate stationery, flex banners, and coaching study materials.',
    detailedInstructions: 'Add line items with quantities, unit rates, and turnaround time. Prints a formal estimate letterhead for institutional clients.',
    keyFeatures: [
      'Itemized pricing with optional discounts',
      'Validity period and payment terms section',
      'Cyber cafe bank account & UPI payment info',
      'Single-click conversion into final bill'
    ]
  },
  {
    id: 'delivery-challan-maker',
    name: 'Delivery Challan Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'ScrollText',
    description: 'Dispatch slips for delivered printing orders, exam answer sheets, laminated documents, and marketing flex boards.',
    detailedInstructions: 'Print a clean dispatch document requiring receiver acknowledgment signature to eliminate missing parcel claims.',
    keyFeatures: [
      'Sender and receiver address blocks',
      'Package quantity and description check',
      'Receiver acknowledgment signature line',
      'Official dispatch serial numbering'
    ]
  },
  {
    id: 'shop-notice-signboard-maker',
    name: 'Shop Notice & Signboard Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'Maximize2',
    description: 'Print eye-catching counter notices like "Bring Original Aadhaar", "Online Form Last Date", and "UPI Payments Accepted".',
    detailedInstructions: 'Choose from 20+ pre-designed cyber cafe notices in bold Hindi and English. Format for A4 or A3 paper with prominent red or blue borders.',
    keyFeatures: [
      'High-visibility bold bilingual typography',
      'Pre-written templates for Aadhaar, PAN, and UPI',
      'Emergency holiday and lunch timing notices',
      'One-click high-contrast black & white print mode'
    ]
  },
  {
    id: 'biodata-resume-maker',
    name: 'Bio-Data & Resume Maker for Jobs',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'UserCheck',
    description: 'Fast single-page resume and Indian marriage bio-data creator with photo attachment, qualifications table, and clean formatting.',
    detailedInstructions: 'Help students and job seekers build standard CVs for police recruitment, clerical posts, computer operator roles, and matrimonial proposals.',
    keyFeatures: [
      'Standard Indian curriculum vitae layout',
      'Integrated passport photo placeholder',
      'Educational qualifications chronological table',
      'Download clean, unwatermarked PDF'
    ]
  },
  {
    id: 'affidavit-print-maker',
    name: 'Affidavit & Legal Draft Maker',
    category: 'business',
    categoryLabel: 'CSC & Business',
    iconName: 'ScrollText',
    description: 'Format legal drafts with mandatory 3.5-inch top margin for Non-Judicial E-Stamp papers with standard verified student & citizen templates.',
    detailedInstructions: 'Select standard templates for Name Correction, Gap Year Certificate, Address Proof, or Income Declaration. Text automatically aligns below the e-stamp paper seal.',
    keyFeatures: [
      'Standard 3.5" and 4.0" E-Stamp top clearance margin',
      'Pre-written legal drafts for common student & citizen needs',
      'Adjustable font size, line spacing, and notary signatures',
      'Direct Legal size & A4 print ready formatting'
    ]
  },

  // ==========================================
  // CATEGORY 2: ID CARD & PRINT TOOLS (7 Tools)
  // ==========================================
  {
    id: 'govt-id-card-print',
    name: 'Govt ID Card Print (Aadhaar, PAN, Voter)',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    iconName: 'BadgeCheck',
    description: 'Exact millimeter templates calibrated for Epson L805 and Canon plastic card trays for Aadhaar, Voter, PAN, and Ayushman cards.',
    detailedInstructions: 'Select your target government ID type. The layout automatically adopts official card geometry (85.60 × 53.98 mm) with optimal cut boundaries.',
    keyFeatures: [
      'Pre-set templates for Aadhaar, PAN, Voter, and ABHA',
      'Precision millimeters to DPI calibration',
      'Optional lamination border margin (+1.5mm)',
      'Export PDF with cut marks'
    ]
  },
  {
    id: 'pvc-cover-print',
    name: 'PVC Cover & Thermal Pouch Maker',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    iconName: 'FileBadge',
    description: 'Outer sleeve inserts and laminated thermal pouch header cards with cyber cafe branding and citizen emergency details.',
    detailedInstructions: 'Generate formatted cover inserts with user details, emergency contacts, or cyber cafe branding for PVC card thermal pouches.',
    keyFeatures: [
      'Templates for 65×95 mm and 70×100 mm pouches',
      'Single-sided and bi-fold pouch wrap formats',
      'Custom cyber cafe shop name and contact placement',
      'Print multiple sleeve inserts on a single A4 page'
    ]
  },
  {
    id: 'multiple-id-cards-print',
    name: 'Multiple ID Cards Print on A4 (5-in-1)',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    iconName: 'Grid',
    description: 'Fit up to 5 full ID cards (both front & back) onto a single A4 page with cutting guides to maximize paper and ink efficiency.',
    detailedInstructions: 'Upload multiple citizen ID cards in batch. Arrange them automatically in an ink-saving grid with scissors guidelines for fast lamination.',
    keyFeatures: [
      'Batch upload up to 5 complete ID cards',
      'Optimal A4 layout saving 60% photo paper',
      'Unified scissors cutting lines',
      'Perfect for busy CSC centers and digital seva kendras'
    ]
  },
  {
    id: 'lamination-margin-cutting-guide',
    name: 'Lamination Margin & Cutting Guide Maker',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    iconName: 'Crop',
    description: 'Add uniform 2.5mm transparent lamination seal margins and corner rounding cut guides to prevent pouch peeling.',
    detailedInstructions: 'Prevents laminated cards from splitting at edges by generating a strict 2.5mm thermal sealing border and 3mm radius rounded corner marks.',
    keyFeatures: [
      'Standard 2.5mm thermal pouch edge clearance',
      'Corner rounding cut lines (3mm radius)',
      'Dual-side alignment verification crosses',
      'Compatible with heat lamination machines'
    ]
  },
  {
    id: 'student-employee-id-template',
    name: 'Student & Employee ID Card Template',
    category: 'pvc-id',
    categoryLabel: 'ID Card & Print',
    iconName: 'CreditCard',
    description: 'Instant school, coaching institute, and staff identity badge maker with photo holder, logo, barcode, and blood group fields.',
    detailedInstructions: 'Choose vertical or horizontal card orientations. Enter student or employee data, insert photo, and print on standard CR80 PVC sheets.',
    keyFeatures: [
      'Vertical and horizontal orientation presets',
      'Custom school or coaching institute branding',
      'Barcode / QR code auto-generator for roll numbers',
      'Direct PVC tray single or dual-card print'
    ]
  },

  // ==========================================
  // CATEGORY 3: PHOTO & SIGNATURE TOOLS (18 Tools)
  // ==========================================
  {
    id: 'ai-selfie-passport-photo-maker',
    name: 'AI Selfie Passport Photo Maker',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'UserCheck',
    description: 'Convert casual phone selfies into formal passport photos with clean white studio backdrop, shoulder alignment, and lighting balance.',
    detailedInstructions: 'Upload a front-facing selfie. Centers eyes and chin to official specifications, applies clean uniform backdrops, and formats an 8-photo sheet.',
    keyFeatures: [
      'Selfie to formal portrait framing guide',
      'Clean white, light blue, and grey background replacer',
      'Facial illumination and contrast balancer',
      'Official biometric compliance guidelines'
    ]
  },
  {
    id: 'whatsapp-photo-print-alignment',
    name: 'WhatsApp Photo Print & Alignment',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'MessageSquareShare',
    description: 'Optimized specifically for cyber cafes! Fix compressed, dark, or crooked photos received via WhatsApp and fit onto 4×6 or A4 sheets.',
    detailedInstructions: 'Directly import WhatsApp media files. Automatically compensates for lossy compression, adds standard photo borders, and lays out multiple copies.',
    keyFeatures: [
      'De-skewing and orientation correction',
      'Shadow lift & contrast enhancement for compressed photos',
      'Multiple duplicate photo copies on 4×6 paper',
      'Eliminates wasted ink and photo paper'
    ]
  },
  {
    id: 'ai-face-cleaner',
    name: 'AI Face Cleaner & Biometric Enhancer',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Sparkles',
    description: 'Clean up portrait shadows, skin glare, flash reflections, and enhance sharpness for strict passport and exam application portals.',
    detailedInstructions: 'Subtly smoothen uneven shadows, remove red-eye glare, and sharpen facial contours to ensure your photos pass AI verification at UPSC and SSC.',
    keyFeatures: [
      'Subtle non-destructive skin tone refinement',
      'Flash reflection and harsh shadow suppression',
      'Facial edge sharpening for biometric gates',
      'Strict adherence to no-distortion guidelines'
    ]
  },
  {
    id: 'exam-photo-cropper',
    name: 'Exam Photo Cropper (UPSC, SSC, NTA)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Crop',
    description: 'Auto-crop to exact exam portal dimensions (e.g. 3.5×4.5 cm, 20KB–50KB JPEG) specified in latest recruitment notifications.',
    detailedInstructions: 'Select target examination (SSC CGL/CHSL, UPSC CSE, IBPS PO, NTA JEE/NEET, Railway RRB). Automatically crops and compresses within portal limits.',
    keyFeatures: [
      'Pre-configured presets for all Indian national exams',
      'Strict 20 KB to 50 KB file weight regulator',
      'Aspect ratio lock preventing facial distortion',
      'Direct compliance report with pixel count'
    ]
  },
  {
    id: 'photo-signature-joiner',
    name: 'Photo & Signature Joiner (Single Image)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Layers',
    description: 'Combine passport photograph and signature into a single stacked or side-by-side file required by UPSSSC, SSC, and state recruitment gates.',
    detailedInstructions: 'Upload portrait and signature. The tool stacks them vertically with a standard separation line and outputs a single JPEG under 50KB.',
    keyFeatures: [
      'Vertical stacked layout matching official UPSSSC guidelines',
      'Proportional scaling of photo (75%) and signature (25%)',
      'Clean separator divider line',
      'Strict JPEG output under portal size cap'
    ]
  },
  {
    id: 'date-name-on-photo-maker',
    name: 'Date and Name on Photo Maker (DOP Stamp)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'FileText',
    description: 'Stamp candidate full name and Date of Photograph (DOP) on a bottom white band as mandated by SSC, Railway, and Defence recruitments.',
    detailedInstructions: 'Enter candidate name and photo capture date. Creates a clean white rectangular footer with bold black capital typography.',
    keyFeatures: [
      'Compliant white bottom strip conforming to SSC rules',
      'Bold sans-serif candidate name & capture date',
      'Live preview preventing over-cropping of chin',
      'One-click format for 3.5×4.5 cm portraits'
    ]
  },
  {
    id: 'signature-clearer-bg-remover',
    name: 'Signature Clearer & Background Remover',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Eraser',
    description: 'Convert dimly-lit mobile snapshots of blue or black pen signatures into 100% pure white background or transparent PNG images.',
    detailedInstructions: 'Upload photo of handwriting. Interactive thresholding lifts ink strokes while turning yellowed or shadowed paper into pure white.',
    keyFeatures: [
      'Ink stroke isolation (Blue and Black ink)',
      'Complete elimination of paper shadows and textures',
      'Pure #FFFFFF background required by exam portals',
      'Optional transparent PNG export'
    ]
  },
  {
    id: 'stamp-size-photo-maker',
    name: 'Stamp Size Photo Maker (2.5×3.0 cm)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Camera',
    description: 'Generate compact 2.5×3.0 cm stamp-size photographs for railway season passes, driving license booklets, and school record cards.',
    detailedInstructions: 'Position face within compact stamp boundaries. Arrange 12 or 16 stamp photos on 4×6 photo paper with fine cutting guides.',
    keyFeatures: [
      'Standard 2.5 × 3.0 cm stamp photo geometry',
      'High-density 12-photo 4×6 sheet arrangement',
      '1px solid border for effortless scissors cutting',
      '300 DPI high-definition portrait export'
    ]
  },
  {
    id: 'bw-to-color-photo-studio',
    name: 'Black & White to Color Photo Studio',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Sparkles',
    description: 'Restore contrast and colorize vintage citizen photographs, old freedom fighter portraits, and ancestral family prints.',
    detailedInstructions: 'Enhance vintage faded portraits. Balances sepia tones, removes noise, and adds natural skin illumination for memorial photo framing.',
    keyFeatures: [
      'Contrast restoration for faded archival photos',
      'Noise and film grain suppression',
      'Natural skin tone balancer',
      'High-res output for glass photo frames'
    ]
  },
  {
    id: 'photo-background-changer',
    name: 'Photo Background Changer (White/Blue/Grey)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Maximize2',
    description: 'Replace messy home wall backgrounds with solid white, passport blue, or neutral grey studio backdrops with smooth edge blending.',
    detailedInstructions: 'Isolates the subject contour and fills the background with standard studio tones compliant with Indian passport and visa rules.',
    keyFeatures: [
      'One-click official white, sky blue, and grey backdrops',
      'Hair contour edge-softening feathering',
      'Adjustable lighting balance between subject & backdrop',
      'Meets US Visa, Schengen, and Indian passport norms'
    ]
  },
  {
    id: 'photo-paper-4x6-layout',
    name: '4×6 Photo Paper Layout Generator',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Grid',
    description: 'Arrange 4, 6, 8, or 12 passport photos onto a standard 4×6 inch (10×15 cm) glossy photo paper with scissors cutting lines.',
    detailedInstructions: 'Select photo count. Perfect for Canon Selphy, Epson L805, and photo lab printers with zero paper wastage.',
    keyFeatures: [
      'Presets for 4, 6, 8, and 12 photos per sheet',
      'Exact 100 × 150 mm printer canvas calibration',
      'Dashed scissors cutting lines',
      'Saves high-res JPEG ready for direct spooling'
    ]
  },
  {
    id: 'photo-paper-a4-layout',
    name: 'A4 Photo Paper Multi-Grid Layout',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Layers',
    description: 'Fit 32 or 36 passport photos on a single A4 glossy sheet for large joint families, school admissions, and bulk staff batches.',
    detailedInstructions: 'Upload portrait and instantly populate a full A4 sheet (8 rows × 4 columns). Generates clean cutting gutters between photos.',
    keyFeatures: [
      'Bulk 32-photo & 36-photo grid on A4 paper',
      'Standard 2mm cut gutters to prevent accidental clippings',
      'Custom customer name footer on sheet margin',
      'Reduces per-photo printing cost below ₹0.50'
    ]
  },
  {
    id: 'signature-resizer-compressor',
    name: 'Signature Resize & Compressor (10KB–20KB)',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Crop',
    description: 'Strictly compress signature image files between 10 KB and 20 KB with pixel dimensions 140×60 px required by SSC and IBPS.',
    detailedInstructions: 'Eliminates repetitive upload rejections on government exam servers by locking target file weight between 10KB and 20KB.',
    keyFeatures: [
      'Strict 10 KB - 20 KB boundary clamping',
      'Exact 140 × 60 px and 200 × 100 px presets',
      'Retains bold ink legibility without blur',
      'Guaranteed acceptance on SSC & UPSC gates'
    ]
  },
  {
    id: 'face-centering-ratio-checker',
    name: 'Face Centering & Head Size Ratio Checker',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'UserCheck',
    description: 'Visual overlay guide to verify that facial area occupies between 70% and 80% of the photo height as required by passport rules.',
    detailedInstructions: 'Align eyes along horizontal rule-of-thirds and crown-to-chin between guideline ovals before printing or uploading.',
    keyFeatures: [
      'Interactive 70%-80% biometric face height guide',
      'Crown-to-chin vertical measurement scale',
      'Eye level horizontal alignment indicator',
      'Zero-rejection verification report'
    ]
  },
  {
    id: 'blurry-photo-sharpener',
    name: 'Blurry Photo Sharpener & De-noise',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Sparkles',
    description: 'Enhance focus and de-noise soft portraits taken in low-light cyber cafe corners to satisfy portal clarity standards.',
    detailedInstructions: 'Applies unsharp masking and luminance de-noising to bring out crisp facial boundaries and clear eyes.',
    keyFeatures: [
      'High-pass facial unsharp masking',
      'Granular noise reduction for low-light shots',
      'Eye and eyebrow contour sharpening',
      'Client-side real-time rendering'
    ]
  },
  {
    id: 'red-eye-flash-glare-remover',
    name: 'Red Eye & Flash Glare Remover',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Camera',
    description: 'Fix red reflection pupils caused by camera flash and suppress specular oily forehead glares for clean studio portraits.',
    detailedInstructions: 'Click on red pupil centers to restore natural dark iris tones and reduce harsh flash reflections on skin.',
    keyFeatures: [
      'One-click natural iris pigment restorer',
      'Forehead and nose tip shine suppression',
      'Preserves natural eye catchlight reflection',
      'Fast client-side canvas correction'
    ]
  },
  {
    id: 'biometric-crop-exact-pixels',
    name: 'Biometric Photo Crop to Exact Pixels',
    category: 'photo',
    categoryLabel: 'Photo & Signature',
    iconName: 'Crop',
    description: 'Direct crop to custom portal specifications like 200×230 px, 138×177 px, and 350×450 px with DPI calibration.',
    detailedInstructions: 'Enter your custom width and height in pixels or select portal presets. Automatically resamples without stretching.',
    keyFeatures: [
      'Pixel-locked bounding box with zero distortion',
      'Presets for UPSC, SSC, NTA, Gate, State PSC',
      'Real-time pixel preview and size monitor',
      'Instant JPEG download with metadata tags'
    ]
  },

  // ==========================================
  // CATEGORY 4: PDF TOOLS (22 Tools)
  // ==========================================
  {
    id: 'pdf-merger',
    name: 'PDF Merger (Combine Files)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Layers',
    description: 'Combine multiple PDF documents, receipts, marksheets, and certificates into a single organized application dossier.',
    detailedInstructions: 'Upload multiple PDF files, drag and drop to rearrange order, and merge into a single download without uploading to third-party servers.',
    keyFeatures: [
      'Multi-file drag and drop ordering',
      'Preserves original vector text and stamp sharpness',
      '100% private in-browser merging',
      'Unlimited pages and file size'
    ]
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter & Page Extractor',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Crop',
    description: 'Extract specific certificate pages or split a thick multi-page gazette into individual standalone PDF files.',
    detailedInstructions: 'Select page ranges (e.g. 1-3, 5, 8-10) or extract every page into separate individual files for specific departmental uploads.',
    keyFeatures: [
      'Custom page range extraction (e.g. 2, 4-7)',
      'Visual thumbnail page selector',
      'Single-click burst mode (split every page)',
      'Fast zero-server processing'
    ]
  },
  {
    id: 'pdf-compressor-under-200kb',
    name: 'PDF Compressor (Under 200KB / 100KB)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileText',
    description: 'Compress heavy scanned PDFs under strict 200 KB or 100 KB government portal caps while preserving text readability.',
    detailedInstructions: 'Select target file size (under 100KB, 200KB, or 500KB). Smart image re-sampling shrinks file weight without blurry documents.',
    keyFeatures: [
      'Target file size presets: 100 KB, 200 KB, 500 KB',
      'Maintains legible seal numbers and candidate signatures',
      'Drastic reduction of 5MB+ phone scans',
      'Accepted across all State and Central portals'
    ]
  },
  {
    id: 'pdf-to-jpg-png',
    name: 'PDF to JPG / PNG Converter',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Camera',
    description: 'Convert PDF document pages into high-resolution 300 DPI JPG or PNG images for portals that reject PDF uploads.',
    detailedInstructions: 'Upload your PDF. Select all pages or individual sheets. Generates crisp, high-definition image files ready for upload or photo printing.',
    keyFeatures: [
      'High-resolution 300 DPI rendering engine',
      'Export as JPEG or lossless PNG',
      'Batch export all pages as individual images',
      'Preserves original color and crisp stamp edges'
    ]
  },
  {
    id: 'images-to-single-pdf',
    name: 'JPG / PNG Images to Single PDF',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Layers',
    description: 'Combine multiple phone photos of marksheets, Aadhaar, PAN, and passbook into a single clean PDF document.',
    detailedInstructions: 'Upload image files, sort in logical sequence (e.g., Aadhaar Front, Aadhaar Back, 10th Certificate), choose portrait or landscape, and export.',
    keyFeatures: [
      'Multi-image upload with thumbnail reordering',
      'A4 page fit with uniform margins',
      'Auto-compression to keep final PDF under 1MB',
      'Direct one-click export'
    ]
  },
  {
    id: 'pdf-page-organizer',
    name: 'PDF Page Organizer',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FolderKanban',
    description: 'Reorder, rotate, delete blank pages, and merge scanned identity document pages into a single organized upload file.',
    detailedInstructions: 'Load multiple pages or scanned sheets, drag to reorder in sequence, rotate upside-down pages, remove accidental duplicates, and download a clean file.',
    keyFeatures: [
      'Visual thumbnail page reordering',
      'Individual page 90° / 180° / 270° rotation',
      'Single-click blank page remover',
      '100% private in-browser document processing'
    ]
  },
  {
    id: 'pdf-password-remover',
    name: 'PDF Password Remover (Unlock PDF)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'BadgeCheck',
    description: 'Permanently remove password protection from e-Aadhaar and bank statements so they can be opened and printed instantly.',
    detailedInstructions: 'Enter your standard Aadhaar password (first 4 letters of name in capitals + year of birth) once to unlock and save an unencrypted copy.',
    keyFeatures: [
      'Permanent password removal for hassle-free re-printing',
      'Supported for e-Aadhaar, SBI, HDFC & ICICI statements',
      'Processed strictly in-browser without sending passwords',
      'Print-ready decrypted output'
    ]
  },
  {
    id: 'pdf-password-protector',
    name: 'PDF Password Protector (Encrypt PDF)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'ShieldCheck',
    description: 'Lock confidential legal drafts, salary certificates, and client biodata with 128-bit AES password encryption.',
    detailedInstructions: 'Upload PDF and set a secure password. Prevents unauthorized opening, editing, or copying without the passcode.',
    keyFeatures: [
      'Standard 128-bit AES document encryption',
      'Restricts unauthorized viewing and printing',
      'Compatible with Adobe Acrobat and mobile PDF viewers',
      'Client-side zero-storage security'
    ]
  },
  {
    id: 'pdf-rotate-tool',
    name: 'PDF Rotate & Permanent Deskew',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Maximize2',
    description: 'Permanently fix inverted or sideways pages in scanned PDF documents with single-click 90-degree and 180-degree rotation.',
    detailedInstructions: 'Rotates selected pages or all pages at once and permanently re-saves the orientation so official portals display them right-side-up.',
    keyFeatures: [
      'Rotate individual or all pages clockwise / counter-clockwise',
      'Permanent orientation saving in PDF header',
      'Maintains original PDF compression and quality',
      'Fast real-time page thumbnail updates'
    ]
  },
  {
    id: 'pdf-watermark-adder',
    name: 'PDF Watermark Adder (Security Stamp)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Sparkles',
    description: 'Stamp custom semi-transparent watermarks like "FOR VERIFICATION ONLY", "TANSHU ONLINE", or date stamps across PDF pages.',
    detailedInstructions: 'Type watermark text, adjust transparency, font size, and diagonal rotation. Protects citizen documents against misuse.',
    keyFeatures: [
      'Diagonal 45° anti-fraud watermark overlay',
      'Customizable opacity (10% to 50%) preserving text legibility',
      'Pre-set templates: "FOR KYC ONLY", "CONFIDENTIAL"',
      'Applies across all pages with uniform positioning'
    ]
  },
  {
    id: 'pdf-page-number-adder',
    name: 'PDF Page Number Adder (Bates Stamp)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileText',
    description: 'Add neat sequential page numbering (e.g. Page 1 of 15) at bottom-center or top-right for court filings and official dossiers.',
    detailedInstructions: 'Choose position, font style, and starting number. Essential for submitting court affidavits, thesis bundles, and departmental inquiries.',
    keyFeatures: [
      'Formats: "1, 2, 3" or "Page 1 of N"',
      'Positions: Top-right, Bottom-center, Bottom-right',
      'Custom starting page offset for book chapters',
      'Professional serif and sans-serif typography'
    ]
  },
  {
    id: 'pdf-text-header-eraser',
    name: 'PDF Text & Header Eraser',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Eraser',
    description: 'White out irrelevant website headers, promotional URLs, outdated dates, or personal remarks from PDF documents before printing.',
    detailedInstructions: 'Draw white bounding boxes over unwanted sections. Permanently masks irrelevant text while keeping official body text intact.',
    keyFeatures: [
      'Interactive draggable redaction rectangles',
      'Matches background paper color seamlessly',
      'Removes unwanted browser URL headers and footers',
      'Permanent raster burn-in preventing text recovery'
    ]
  },
  {
    id: 'pdf-grayscale-ink-saver',
    name: 'PDF Grayscale & Toner Saver',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Receipt',
    description: 'Convert heavy colored PDFs into clean monochrome black & white to save expensive color printer toner and speed up printing.',
    detailedInstructions: 'Transforms color backgrounds and pictures into optimized grayscale shades with sharp text contrast for laser printers.',
    keyFeatures: [
      'Saves up to 70% color printer ink and toner',
      'High-contrast black text thresholding',
      'Ideal for heavy textbook chapters and brochures',
      'Significantly reduces overall PDF file size'
    ]
  },
  {
    id: 'pdf-ocr-text-extractor',
    name: 'PDF OCR & Text Extractor (Hindi & Eng)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'ScanLine',
    description: 'Extract copyable, searchable Hindi and English text from non-searchable scanned image PDFs and photographed certificates.',
    detailedInstructions: 'Runs in-browser optical character recognition to turn scanned paperwork into editable text ready to paste into online application forms.',
    keyFeatures: [
      'Dual Hindi (Devanagari) and English OCR support',
      'Preserves paragraph breaks and bullet formatting',
      'One-click copy to clipboard or download as .TXT',
      'Fast client-side character recognition'
    ]
  },
  {
    id: 'pdf-form-filler-signer',
    name: 'PDF Form Filler & Digital Signer',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'UserCheck',
    description: 'Type text directly onto scanned PDF application forms, tick checkboxes, and affix your saved signature image without printing first.',
    detailedInstructions: 'Click anywhere on the PDF page to add text, checkmarks, or signatures. Fills government forms completely digitally.',
    keyFeatures: [
      'Interactive click-to-type text placement',
      'Signature image overlay with transparent background',
      'Checkmark (✓) and Cross (✗) stamps',
      'Export high-resolution completed PDF'
    ]
  },
  {
    id: 'word-to-pdf-converter',
    name: 'Word (DOCX) to PDF Converter',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileText',
    description: 'Convert student resumes, rental agreements, and notices created in Microsoft Word or Google Docs into print-ready PDF files.',
    detailedInstructions: 'Upload .docx files. Converts formatting, tables, fonts, and images into standard PDF layout that looks identical on all devices.',
    keyFeatures: [
      'Preserves fonts, tables, margins, and headers',
      'Eliminates layout shifting across different computers',
      'Outputs compliant PDF/A for archiving',
      'Fast client-side document processing'
    ]
  },
  {
    id: 'excel-to-pdf-converter',
    name: 'Excel (XLSX) to PDF Converter',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Grid',
    description: 'Turn spreadsheets, fee ledgers, and rate sheets into properly scaled portrait or landscape PDF pages with fitted column widths.',
    detailedInstructions: 'Fit all columns onto a single A4 page width to eliminate cut-off right-side columns when printing spreadsheets.',
    keyFeatures: [
      'Auto "Fit All Columns on One Page" scaling',
      'Portrait and Landscape orientation presets',
      'Crisp grid lines and cell borders for billing ledgers',
      'Instant print-ready export'
    ]
  },
  {
    id: 'pdf-flatten-tool',
    name: 'PDF Flatten Tool (Lock Form Fields)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'BadgeCheck',
    description: 'Flatten interactive fillable PDF form fields, digital signature boxes, and annotations into immutable vector layers.',
    detailedInstructions: 'Government submission portals frequently fail to display data in fillable form fields. Flattening permanently bakes text into the document.',
    keyFeatures: [
      'Converts fillable AcroForms into permanent static text',
      'Ensures entered data is visible in every browser & mobile app',
      'Locks signature annotations from tampering',
      'Essential for official government and banking uploads'
    ]
  },
  {
    id: 'pdf-margin-border-adjuster',
    name: 'PDF Margin & Staple Border Adjuster',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Maximize2',
    description: 'Add a 15mm staple clearance margin on the left edge so text and serial numbers are not obscured inside office files and ring binders.',
    detailedInstructions: 'Shifts document content slightly or shrinks to 95% scale to leave ample margin for spiral binding, lacing, and stapling.',
    keyFeatures: [
      'Custom 10mm - 25mm left binding clearance',
      'Prevents loss of text under court hole punches and staples',
      'Equal mirror margins for double-sided booklet printing',
      'Retains crisp original resolution'
    ]
  },
  {
    id: 'pdf-booklet-print-formatter',
    name: 'Multiple PDF Booklets Print Formatter',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Layers',
    description: 'Format 2-up saddle-stitch booklet layouts for coaching institute study modules, bylaws, and exam syllabus printouts.',
    detailedInstructions: 'Re-sequences pages into folding pairs (e.g. Page 1 & 16, Page 2 & 15) for double-sided printing and center stapling.',
    keyFeatures: [
      'Automatic 2-up booklet page imposition',
      'Saves 50% paper on multi-page syllabus copies',
      'Folding line indicator along center crease',
      'Single-click ready for duplex printers'
    ]
  },
  {
    id: 'pdf-masked-aadhaar-tool',
    name: 'PDF Masked Aadhaar Tool (KYC Privacy)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'ShieldCheck',
    description: 'Automatically black out the first 8 digits of Aadhaar numbers (showing only XXXX-XXXX-1234) for privacy-compliant KYC.',
    detailedInstructions: 'Mandated by RBI and UIDAI for hotels, SIM card vendors, and financial institutions to prevent identity theft.',
    keyFeatures: [
      'UIDAI compliant masking of first 8 digits',
      'Keeps last 4 digits and photograph clearly visible',
      'Masks embedded QR code if full number is unmasked',
      'Safe for hotel check-ins and SIM KYC'
    ]
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata Cleaner (Privacy Stripper)',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Eraser',
    description: 'Strip hidden author names, computer usernames, scanner IP addresses, and creation timestamps before submitting sensitive files.',
    detailedInstructions: 'Sanitizes PDF file headers to remove digital breadcrumbs for completely anonymous and private document submissions.',
    keyFeatures: [
      'Removes author, creator software, and computer names',
      'Erases scanner hardware serial numbers and timestamps',
      'Strips embedded GPS coordinates from phone captures',
      'Clean 100% sanitized PDF download'
    ]
  },

  // ==========================================
  // CATEGORY 5: IMAGE CONVERTER & UTILITIES (8 Tools)
  // ==========================================
  {
    id: 'perspective-correction-tool',
    name: 'Perspective Correction Tool',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Maximize2',
    description: 'Straighten tilted documents photographed from sharp angles using interactive 4-point quadrilateral warping.',
    detailedInstructions: 'Drag the four corner nodes to match the four corners of your document in the photo. The algorithm rectifies the tilt into a flat rectangle.',
    keyFeatures: [
      'Interactive 4-corner draggable handles',
      'Bilinear perspective transformation',
      'Instant real-time canvas rendering',
      'Preserves original camera resolution'
    ]
  },
  {
    id: 'watermark-remover',
    name: 'Watermark & Stamp Bleed Remover',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Eraser',
    description: 'Remove background ink bleed, rubber stamp smears, and faint watermarks from scanned certificates with interactive threshold filters.',
    detailedInstructions: 'Isolate color channels or apply selective background thresholding to clean up official documents before reprint or archival.',
    keyFeatures: [
      'Color-selective threshold filter (Red, Blue, Gray)',
      'Adjustable background suppression sensitivity',
      'Selective precision touch-up eraser brush',
      'Maintains original signature and stamp integrity'
    ]
  },
  {
    id: 'image-format-converter',
    name: 'Image Format Converter (JPG, PNG, WEBP)',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Camera',
    description: 'Convert between JPG, PNG, WEBP, and BMP formats instantly to satisfy government portal file extension requirements.',
    detailedInstructions: 'Many official portals reject WEBP format downloaded from modern smartphones. Convert to standard JPEG or PNG in one click.',
    keyFeatures: [
      'Converts WEBP from Android/iPhone to standard JPEG',
      'PNG transparency preservation mode',
      'Zero loss in photo quality or color accuracy',
      'Batch conversion support for multiple images'
    ]
  },
  {
    id: 'image-resizer-pixel-dimension',
    name: 'Image Resizer & Pixel Dimension Tool',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Maximize2',
    description: 'Adjust image width and height to exact pixel, millimeter, or inch dimensions required by state application forms.',
    detailedInstructions: 'Set exact width and height in pixels or millimeters. Choose whether to maintain aspect ratio or stretch to strict portal bounds.',
    keyFeatures: [
      'Dimensions in Pixels, Centimeters, Millimeters, and Inches',
      'Optional aspect ratio locking or freeform scaling',
      'High-quality bicubic resampling prevents pixelation',
      'Live preview with instant dimension badge'
    ]
  },
  {
    id: 'kb-size-reducer',
    name: 'KB Size Reducer (Strict 20KB / 50KB)',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Crop',
    description: 'Target-driven image compressor that hits exact file size thresholds (e.g. strict under 50KB or 20KB) for state recruitment portals.',
    detailedInstructions: 'Enter your desired maximum file size in Kilobytes (e.g., 50 KB). The compressor iteratively optimizes quality until it fits.',
    keyFeatures: [
      'Target file size slider (10 KB to 500 KB)',
      'Presets for 20KB, 50KB, 100KB, 200KB limits',
      'Smart adaptive compression preserving sharp text',
      'Displays before and after file weight in real-time'
    ]
  },
  {
    id: 'image-dpi-resolution-scaler',
    name: 'Image DPI & Resolution Scaler (300 DPI)',
    category: 'converter',
    categoryLabel: 'Image & Utilities',
    iconName: 'Camera',
    description: 'Upscale and calibrate image header DPI to 200, 300, or 600 DPI required for official government ID and photo printing.',
    detailedInstructions: 'Many phone photos have 72 DPI metadata. This tool rewrites EXIF and JFIF resolution headers to official 300 DPI standards.',
    keyFeatures: [
      'Sets official 200, 300, or 600 DPI print metadata',
      'Calibrates physical print size in millimeters',
      'Prevents printer software from scaling down photos',
      'Full EXIF and JFIF compliance'
    ]
  },

  // ==========================================
  // CATEGORY 6: CALCULATOR & FINANCE TOOLS (15 Tools)
  // ==========================================
  {
    id: 'age-calculator-govt-exam',
    name: 'Age Calculator for Govt Exams',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'BadgeCheck',
    description: 'Calculate exact age in Years, Months, and Days as of cut-off dates specified in recruitment notifications (e.g. 01/01/2026).',
    detailedInstructions: 'Input Date of Birth and the recruitment notification cut-off date. Displays exact eligibility breakdown and total days lived.',
    keyFeatures: [
      'Exact age in Years, Months, and Days',
      'Total days, total weeks, and total hours lived',
      'Cut-off date selector matching official notifications',
      'Printable Age Verification Slip for cyber cafe customers'
    ]
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator (5%, 12%, 18%, 28%)',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Instant forward (tax addition) and reverse (tax extraction) calculations with automatic CGST and SGST 50:50 split.',
    detailedInstructions: 'Enter base amount or total bill amount. Select GST slab (0%, 5%, 12%, 18%, 28%) to see CGST, SGST, and net totals.',
    keyFeatures: [
      'Forward GST (Add tax) and Reverse GST (Extract tax)',
      'Automatic CGST (Central) & SGST (State) breakdown',
      'One-click slabs: 5%, 12%, 18%, 28%',
      'Copyable breakdown for billing receipts'
    ]
  },
  {
    id: 'cyber-cafe-cost-calculator',
    name: 'Cyber Cafe Print & Service Cost Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Calculate total bill for xerox, color prints, lamination, and form filling with shop profit margin tracking.',
    detailedInstructions: 'Add quantities of black & white copies, photo paper sheets, thermal pouches, and service charges for an instant customer tally.',
    keyFeatures: [
      'Multi-service quick tally counter',
      'Computes ink, paper, and thermal pouch cost',
      'Clear total customer payable display',
      'One-click transfer to Invoice Generator'
    ]
  },
  {
    id: 'discount-percentage-calculator',
    name: 'Discount & Percentage Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Fast calculation of festive discount offers, retail margins, and marks percentages for 10th and 12th board students.',
    detailedInstructions: 'Enter total marks and obtained marks for student percentages, or original MRP and discount percentage for retail savings.',
    keyFeatures: [
      'Student marks percentage & division calculator (1st, 2nd, 3rd)',
      'Retail discount and final payable amount',
      'Percentage increase and decrease comparisons',
      'Fast numeric keypad support'
    ]
  },
  {
    id: 'loan-emi-calculator',
    name: 'Loan EMI Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'CreditCard',
    description: 'Monthly installment, total interest, and amortization schedule for Personal, Vehicle, Home, and Mudra business loans.',
    detailedInstructions: 'Enter loan principal, interest rate per annum, and tenure in months or years. Displays monthly EMI and total interest payable.',
    keyFeatures: [
      'Monthly EMI, Total Interest, and Total Amount breakdown',
      'Interactive sliders for Principal, Rate, and Tenure',
      'Amortization schedule year-by-year',
      'Specialized presets for Mudra loans and bike loans'
    ]
  },
  {
    id: 'ppf-sukanya-calculator',
    name: 'PPF & Sukanya Samriddhi Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'FileBadge',
    description: 'Project maturity value and yearly interest earnings under 15-year PPF and 21-year sovereign Sukanya Samriddhi Yojana.',
    detailedInstructions: 'Enter annual deposit amount. Calculates total deposited capital, compounded tax-free interest, and final maturity payout.',
    keyFeatures: [
      'Updated with latest sovereign interest rates (8.2% SSY / 7.1% PPF)',
      'Year-by-year balance accumulation ledger',
      'Section 80C tax deduction estimate',
      'Printable investment summary for customers'
    ]
  },
  {
    id: 'sip-mutual-fund-calculator',
    name: 'Mutual Fund SIP Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'ScrollText',
    description: 'Compute wealth accumulation from monthly Systematic Investment Plans with compound interest projections.',
    detailedInstructions: 'Enter monthly SIP amount, expected rate of return (e.g. 12%), and duration. Shows invested amount vs total wealth gained.',
    keyFeatures: [
      'Monthly SIP and Lumpsum investment modes',
      'Visual chart of invested capital vs wealth gain',
      'Compound interest projections up to 30 years',
      'Inflation-adjusted purchasing power estimate'
    ]
  },
  {
    id: 'fd-rd-calculator',
    name: 'FD & RD Interest Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'CreditCard',
    description: 'Fixed Deposit and Recurring Deposit quarterly compounding interest and maturity payout estimator for SBI, PNB, and Post Office.',
    detailedInstructions: 'Compare regular citizen vs senior citizen interest rates. Calculates exact maturity amount upon completion of term.',
    keyFeatures: [
      'Fixed Deposit (FD) and Recurring Deposit (RD) tabs',
      'Quarterly compounding matching Indian bank rules',
      'Senior Citizen bonus interest rate toggle (+0.50%)',
      'TDS tax deduction threshold indicator'
    ]
  },
  {
    id: 'currency-note-counter',
    name: 'Currency / Cash Note Counter (Cash Tally)',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Enter counts of ₹500, ₹200, ₹100, ₹50, ₹20, and ₹10 notes for fast end-of-day cash drawer balancing and bank deposit slips.',
    detailedInstructions: 'Type the number of notes in your cash drawer. Automatically computes sub-totals, grand total amount, and generates deposit slips.',
    keyFeatures: [
      'Denominations: ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5, ₹2, ₹1',
      'Total note count and grand total in rupees',
      'Generates Bank Cash Deposit Denomination slip',
      'Amount in words automatic conversion'
    ]
  },
  {
    id: 'salary-hra-calculator',
    name: 'Salary & HRA Exemption Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Break down Gross Salary, Basic, DA, HRA, and compute House Rent Allowance tax deductions under Section 10(13A).',
    detailedInstructions: 'Input basic salary, HRA received, and rent paid in metro vs non-metro cities to calculate minimum exempt HRA.',
    keyFeatures: [
      'Compliant with Income Tax Section 10(13A) rules',
      'Metro (50%) vs Non-Metro (40%) basic salary rules',
      'Net monthly take-home salary calculator',
      'Annual tax saving estimate'
    ]
  },
  {
    id: 'simple-compound-interest',
    name: 'Simple & Compound Interest Calculator',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Receipt',
    description: 'Compare flat rate borrowing versus annual/monthly compounding for village loans, agricultural credit, and personal finances.',
    detailedInstructions: 'Enter principal, interest rate, and time in years or months. Shows side-by-side comparison between simple and compound interest.',
    keyFeatures: [
      'Side-by-side Simple vs Compound Interest comparison',
      'Annual, Semi-annual, and Monthly compounding options',
      'Total interest and final payout amount',
      'Ideal for rural credit and cooperative loans'
    ]
  },
  {
    id: 'income-tax-slab-calculator',
    name: 'Income Tax Slab Calculator (New vs Old)',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'FileText',
    description: 'Side-by-side comparison of tax liabilities under Section 115BAC (New Regime) versus Old Tax Regime with 80C and 80D deductions.',
    detailedInstructions: 'Enter your annual taxable income and eligible deductions. Recommends the regime that yields maximum tax savings.',
    keyFeatures: [
      'Latest FY 2024-25 / AY 2025-26 tax slabs',
      'Section 87A rebate calculation (Zero tax up to ₹7 Lakh in New Regime)',
      'Old vs New regime side-by-side savings verdict',
      'Standard deduction ₹75,000 automatic inclusion'
    ]
  },
  {
    id: 'land-area-converter',
    name: 'Land Area Converter (Bigha, Acre, Gaj)',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Maximize2',
    description: 'Regional Indian land measurement converter for Khasra and Khatauni land records across UP, Bihar, MP, Rajasthan, and Haryana.',
    detailedInstructions: 'Convert between Bigha, Biswa, Kattha, Acre, Hectare, Square Gaj (Yards), and Square Feet based on state land standards.',
    keyFeatures: [
      'State-specific standards (UP Pucca Bigha, Bihar Kattha, etc.)',
      'Converts to standard Square Feet, Square Meters, and Acres',
      'Essential for farmers reviewing Bhulekh / Khasra records',
      'Instant bidirectional calculation'
    ]
  },
  {
    id: 'unit-converter-utilities',
    name: 'Unit Converter (Length, Weight, Data MB/GB)',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'Maximize2',
    description: 'Convert inches to centimeters, kilograms to pounds, and mobile internet megabytes to gigabytes for digital services.',
    detailedInstructions: 'Multi-category converter for physical print sizes, postal parcels, speed test units, and storage card capacities.',
    keyFeatures: [
      'Length: mm, cm, inches, feet, meters',
      'Weight: grams, kilograms, pounds, quintals',
      'Digital data: Bytes, KB, MB, GB, TB',
      'Area: Square inches, sq feet, sq meters'
    ]
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed & Accuracy Test',
    category: 'calculator',
    categoryLabel: 'Calculator & Finance',
    iconName: 'FileText',
    description: 'Practice English and Hindi (Mangal & Kruti Dev) typing speed in WPM for High Court, Civil Court, and SSC clerical examinations.',
    detailedInstructions: 'Take timed 1-minute, 3-minute, or 5-minute typing tests. Measures Net Speed (WPM), Gross Speed, and Accuracy percentage.',
    keyFeatures: [
      '1, 3, and 5-minute official exam simulation tests',
      'Real-time Net Words Per Minute (WPM) & Accuracy calculation',
      'Court and SSC clerical exam paragraphs',
      'Printable Speed & Accuracy certificate'
    ]
  },

  // ==========================================
  // CATEGORY 7: WHATSAPP & QR TOOLS (8 Tools)
  // ==========================================
  {
    id: 'whatsapp-direct-chat-link',
    name: 'WhatsApp Direct Chat Link Generator',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'MessageSquareShare',
    description: 'Open chats directly without saving customer mobile numbers to your phone contacts for instant file and photo sharing.',
    detailedInstructions: 'Enter customer 10-digit mobile number and optional pre-filled greeting. Generates an instant click-to-chat link and QR code.',
    keyFeatures: [
      'No need to clutter phone contacts with temporary walk-in customers',
      'Pre-filled message templates ("Your print is ready")',
      'Generates direct wa.me link and printable QR',
      'Works with WhatsApp Web and mobile app'
    ]
  },
  {
    id: 'instant-upi-qr-generator',
    name: 'Instant UPI Payment QR Code Generator',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'Receipt',
    description: 'Dynamic UPI QR with pre-filled Shop Name, VPA ID, and exact customer bill amount for GPay, PhonePe, and Paytm.',
    detailedInstructions: 'Type your UPI ID and the customer bill amount. The generated QR automatically opens the payment app with exact amount pre-filled.',
    keyFeatures: [
      'Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI',
      'Pre-fills exact bill amount preventing customer underpayment',
      'Custom cyber cafe shop name branding in QR header',
      'Printable payment tent card for counter display'
    ]
  },
  {
    id: 'shop-wifi-qr-generator',
    name: 'Shop WiFi Access QR Code Generator',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'Grid',
    description: 'Printable QR code for customers to connect to cyber cafe guest WiFi in one scan without disclosing router passwords.',
    detailedInstructions: 'Enter your Wi-Fi network name (SSID), security type (WPA/WPA2), and password. Print the QR for customers to scan and join instantly.',
    keyFeatures: [
      'Zero password typing required on customer phones',
      'Works seamlessly on both Android and iPhone cameras',
      'High-contrast framed counter display design',
      '100% private in-browser code generation'
    ]
  },
  {
    id: 'whatsapp-bulk-message-formatter',
    name: 'WhatsApp Bulk Message Formatter',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'MessageSquareShare',
    description: 'Format bold, italics, strikethrough, monospace, and emojis for customer status broadcasts regarding admit cards and pension KYC.',
    detailedInstructions: 'Type or paste announcements. Live preview shows exactly how text and emojis render inside WhatsApp chats.',
    keyFeatures: [
      'Easy buttons for *Bold*, _Italic_, ~Strikethrough~, and `Monospace`',
      'Pre-designed notification templates for Aadhaar, Pension, and Board Results',
      'One-click copy to clipboard ready for WhatsApp Broadcast',
      'Emoji picker for high-engagement notices'
    ]
  },
  {
    id: 'vcard-contact-qr-generator',
    name: 'vCard / Contact QR Code Generator',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'UserCheck',
    description: 'Scannable digital business card QR code for cyber cafe owners so clients can save shop phone, email, and location in 1 scan.',
    detailedInstructions: 'Fill in your name, shop name, mobile number, email, and Google Maps address. Customers scan the QR to save your contact card.',
    keyFeatures: [
      'Saves full contact details directly to customer address book',
      'Eliminates misspelling of shop mobile numbers and names',
      'Print-ready business card and shop door sticker template',
      'Standard universal vCard 3.0 formatting'
    ]
  },
  {
    id: 'website-url-doc-link-qr',
    name: 'Website URL & Document Link QR Maker',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'Layers',
    description: 'Generate high-resolution printable QR codes linking to official government PDF circulars, recruitment notifications, and results.',
    detailedInstructions: 'Paste any government portal URL or result link. Download a high-res vector QR code to paste on your shop noticeboard.',
    keyFeatures: [
      'High-resolution print-ready SVG & PNG download',
      'Error correction level H for reliable scanning even if scratched',
      'Custom center label (e.g. "Scan for Admit Card")',
      'Direct link verification before printing'
    ]
  },
  {
    id: 'whatsapp-document-print-helper',
    name: 'WhatsApp Document Print Helper',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'FileText',
    description: 'Extract and optimize PDF attachments and photographed documents shared via WhatsApp Web for direct spooling to printers.',
    detailedInstructions: 'Compensates for WhatsApp image compression, removes grey shadow backgrounds, and centers documents on A4 sheets for crisp prints.',
    keyFeatures: [
      'Auto-compensates for WhatsApp aggressive compression',
      'Lifts ambient room shadows from photographed forms',
      'Direct fit to A4 portrait or landscape paper',
      'Saves ink and prevents murky xerox prints'
    ]
  },
  {
    id: 'qr-code-scanner-decoder',
    name: 'QR Code Scanner & Decoder (Aadhaar & PAN)',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & QR',
    iconName: 'ScanLine',
    description: 'Scan or upload any Aadhaar, PAN, or invoice QR code using your webcam or photo upload to decode encrypted biometric text payload.',
    detailedInstructions: 'Upload a picture of an Aadhaar or PAN QR code or use webcam. Decodes embedded XML/text data including name, DOB, and masked number.',
    keyFeatures: [
      'Decodes secure Aadhaar QR code data payloads',
      'Decodes NSDL / UTIITSL PAN card verification QR codes',
      'Decodes e-Invoice B2B and UPI transaction QR codes',
      '100% private in-browser decoding with zero data upload'
    ]
  }
];
