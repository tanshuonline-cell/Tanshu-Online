// High-quality preview image resolver for all 89 tools in Tanshu Online
// Combines realistic photographic captures and high-fidelity SVG graphic previews

import passportImg from '../assets/images/tool_passport_photos_1793211936275.jpg';
import autoCropperImg from '../assets/images/tool_auto_cropper_1793211936700.jpg';
import scannerImg from '../assets/images/tool_doc_scanner_rectifier_1793211938346.jpg';
import pvcCropperImg from '../assets/images/tool_pdf_to_pvc_cropper_1793211938406.jpg';
import idLayoutImg from '../assets/images/tool_id_front_back_layout_1793211939391.jpg';
import invoiceImg from '../assets/images/tool_invoice_generator_1793211940230.jpg';
import rationCardImg from '../assets/images/tool_ration_card_1793212213122.jpg';
import perspectiveImg from '../assets/images/tool_perspective_correct_1793212213486.jpg';
import selfiePassportImg from '../assets/images/tool_selfie_passport_1793212213374.jpg';
import whatsappPrintImg from '../assets/images/tool_whatsapp_print_1793212214216.jpg';
import faceCleanerImg from '../assets/images/tool_face_cleaner_1793212215388.jpg';
import watermarkRemoverImg from '../assets/images/tool_watermark_remover_1793212216608.jpg';
import govtIdPrintImg from '../assets/images/tool_govt_id_print_1793212217163.jpg';
import pvcCoverImg from '../assets/images/tool_pvc_cover_print_1793212217270.jpg';
import pincodeFinderImg from '../assets/images/tool_pincode_finder_1793212217614.jpg';
import multipleIdImg from '../assets/images/tool_multiple_id_print_1793212218938.jpg';
import affidavitMakerImg from '../assets/images/tool_affidavit_maker_1793212220380.jpg';
import pdfOrganizerImg from '../assets/images/tool_pdf_organizer_1793212220914.jpg';

// Helper to convert clean SVG markup to Data URL
function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// Dedicated realistic visual mockups for tools
const SVG_PREVIEWS: Record<string, string> = {
  // --- CSC & Business Tools ---
  'cash-payment-receipt-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="url(#bg)" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4 2"/>
      <rect x="35" y="22" width="170" height="24" rx="3" fill="#b45309"/>
      <text x="120" y="38" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">CASH PAYMENT RECEIPT</text>
      <text x="40" y="60" font-family="monospace" font-size="9" fill="#78350f">NO: TS-2026/8941</text>
      <text x="195" y="60" font-family="monospace" font-size="9" fill="#78350f" text-anchor="end">DATE: 28-OCT-2026</text>
      <line x1="40" y1="66" x2="200" y2="66" stroke="#fbbf24" stroke-width="1"/>
      <text x="40" y="78" font-family="Arial, sans-serif" font-size="9" fill="#1e293b">Received from: Amit Kumar Verma</text>
      <text x="40" y="92" font-family="Arial, sans-serif" font-size="9" fill="#1e293b">For: Online Form + Color Lamination</text>
      <rect x="40" y="99" width="70" height="20" rx="3" fill="#15803d"/>
      <text x="75" y="113" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">PAID ₹ 180.00</text>
      <circle cx="175" cy="108" r="14" fill="none" stroke="#dc2626" stroke-width="1.5"/>
      <text x="175" y="111" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#dc2626" text-anchor="middle">SEAL/SIGN</text>
    </svg>
  `),

  'rate-list-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#0f172a"/>
      <rect x="20" y="10" width="200" height="120" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
      <rect x="20" y="10" width="200" height="26" fill="#0369a1"/>
      <text x="120" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">CYBER CAFE RATE LIST</text>
      <rect x="30" y="44" width="180" height="16" fill="#f0f9ff"/>
      <text x="36" y="55" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a">Black & White Print</text>
      <text x="195" y="55" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="end">₹ 3 / Page</text>
      <rect x="30" y="63" width="180" height="16" fill="#ffffff"/>
      <text x="36" y="74" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a">Color Photo Print (4×6)</text>
      <text x="195" y="74" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="end">₹ 25 / Copy</text>
      <rect x="30" y="82" width="180" height="16" fill="#f0f9ff"/>
      <text x="36" y="93" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a">PVC Smart Card Print</text>
      <text x="195" y="93" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="end">₹ 50 / Card</text>
      <rect x="30" y="101" width="180" height="16" fill="#ffffff"/>
      <text x="36" y="112" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a">A4 Lamination Pouch</text>
      <text x="195" y="112" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="end">₹ 20 / Sheet</text>
    </svg>
  `),

  'cyber-cafe-work-log': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="22" y="14" width="196" height="112" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="22" y="14" width="196" height="24" rx="6" fill="#475569"/>
      <text x="120" y="30" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">DAILY WORK & PRINT REGISTER</text>
      <circle cx="36" cy="52" r="5" fill="#22c55e"/>
      <text x="48" y="55" font-family="Arial, sans-serif" font-size="8.5" fill="#1e293b">Job #102: SSC CGL Online Form (Done)</text>
      <circle cx="36" cy="72" r="5" fill="#eab308"/>
      <text x="48" y="75" font-family="Arial, sans-serif" font-size="8.5" fill="#1e293b">Job #103: PVC Ayushman Card (In Queue)</text>
      <circle cx="36" cy="92" r="5" fill="#3b82f6"/>
      <text x="48" y="95" font-family="Arial, sans-serif" font-size="8.5" fill="#1e293b">Job #104: 32 Passport Photos Print</text>
      <circle cx="36" cy="112" r="5" fill="#22c55e"/>
      <text x="48" y="115" font-family="Arial, sans-serif" font-size="8.5" fill="#1e293b">Job #105: e-District Domicile Apply</text>
    </svg>
  `),

  'money-transfer-slip-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#ecfdf5"/>
      <rect x="24" y="12" width="192" height="116" rx="6" fill="#ffffff" stroke="#059669" stroke-width="1.5"/>
      <rect x="24" y="12" width="192" height="24" rx="6" fill="#047857"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">AEPS & DMT CASH RECEIPT</text>
      <text x="36" y="52" font-family="Arial, sans-serif" font-size="9" fill="#047857" font-weight="bold">STATUS: SUCCESS ✓</text>
      <text x="36" y="68" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">RRN: 429188029141</text>
      <text x="36" y="82" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Bank: State Bank of India (A/c **4192)</text>
      <rect x="36" y="92" width="90" height="24" rx="4" fill="#065f46"/>
      <text x="81" y="108" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">₹ 3,500.00</text>
      <rect x="140" y="92" width="64" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="172" y="107" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">AGENT STAMP</text>
    </svg>
  `),

  'customer-token-queue-slip': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="50" y="10" width="140" height="120" rx="8" fill="#ffffff" stroke="#6366f1" stroke-width="2"/>
      <text x="120" y="30" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#4338ca" text-anchor="middle">TANSHU DIGITAL SEVA</text>
      <text x="120" y="44" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">TOKEN SLIP</text>
      <rect x="70" y="52" width="100" height="42" rx="6" fill="#e0e7ff"/>
      <text x="120" y="83" font-family="monospace" font-size="28" font-weight="bold" fill="#3730a3" text-anchor="middle"># 047</text>
      <text x="120" y="108" font-family="Arial, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">Counter 2 • 3 People Ahead</text>
      <text x="120" y="120" font-family="monospace" font-size="7.5" fill="#94a3b8" text-anchor="middle">Time: 11:42 AM</text>
    </svg>
  `),

  'quotation-estimate-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="22" fill="#1e293b"/>
      <text x="120" y="27" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">ESTIMATE & QUOTATION</text>
      <text x="35" y="48" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a" font-weight="bold">Client: Modern Public School</text>
      <line x1="35" y1="55" x2="205" y2="55" stroke="#e2e8f0"/>
      <text x="35" y="68" font-family="Arial, sans-serif" font-size="8" fill="#334155">1. Student ID Cards (250 Nos) : ₹ 6,250</text>
      <text x="35" y="82" font-family="Arial, sans-serif" font-size="8" fill="#334155">2. Lanyard & Pouch (250 Nos) : ₹ 3,750</text>
      <text x="35" y="96" font-family="Arial, sans-serif" font-size="8" fill="#334155">3. Design & Photography : ₹ 1,500</text>
      <rect x="35" y="103" width="170" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="40" y="115" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#0f172a">Total Estimated:</text>
      <text x="200" y="115" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#059669" text-anchor="end">₹ 11,500.00</text>
    </svg>
  `),

  'delivery-challan-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#0891b2" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="22" fill="#0e7490"/>
      <text x="120" y="27" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">DELIVERY CHALLAN</text>
      <text x="35" y="48" font-family="Arial, sans-serif" font-size="8.5" fill="#155e75">Challan #: DC-841 • Date: Today</text>
      <text x="35" y="62" font-family="Arial, sans-serif" font-size="8" fill="#334155">Dispatch To: Block Education Office</text>
      <rect x="35" y="70" width="170" height="34" rx="3" fill="#ecfeff" stroke="#a5f3fc"/>
      <text x="40" y="83" font-family="Arial, sans-serif" font-size="8" fill="#0e7490">• 100 Printed Flex Banners (6×3 ft)</text>
      <text x="40" y="96" font-family="Arial, sans-serif" font-size="8" fill="#0e7490">• 500 Pamphlets (A5 Art Paper 130 GSM)</text>
      <text x="35" y="118" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b">Receiver's Signature: _______________</text>
    </svg>
  `),

  'shop-notice-signboard-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#fef2f2"/>
      <rect x="30" y="12" width="180" height="116" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2.5"/>
      <rect x="30" y="12" width="180" height="32" fill="#dc2626"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">सूचना / NOTICE</text>
      <text x="120" y="39" font-family="Arial, sans-serif" font-size="8" fill="#fee2e2" text-anchor="middle">IMPORTANT SHOP NOTICE</text>
      <text x="120" y="62" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#991b1b" text-anchor="middle">आधार कार्ड ओरिजिनल साथ लाएं</text>
      <text x="120" y="77" font-family="Arial, sans-serif" font-size="8.5" fill="#334155" text-anchor="middle">BRING ORIGINAL AADHAAR CARD</text>
      <line x1="45" y1="86" x2="195" y2="86" stroke="#fecaca"/>
      <text x="120" y="100" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#15803d" text-anchor="middle">GOOGLE PAY / PHONEPE ACCEPTED</text>
      <text x="120" y="115" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Timing: 9:00 AM to 8:00 PM</text>
    </svg>
  `),

  'biodata-resume-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="35" y="10" width="170" height="120" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="45" y="18" width="28" height="34" rx="2" fill="#e2e8f0" stroke="#94a3b8"/>
      <circle cx="59" cy="29" r="6" fill="#94a3b8"/>
      <path d="M50 48c0-5 4-8 9-8s9 3 9 8" fill="#94a3b8"/>
      <text x="80" y="27" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">CURRICULUM VITAE</text>
      <text x="80" y="38" font-family="Arial, sans-serif" font-size="8" fill="#475569">SURESH PRASAD GUPTA</text>
      <text x="80" y="47" font-family="Arial, sans-serif" font-size="7" fill="#64748b">B.Com | Computer Operator</text>
      <line x1="45" y1="58" x2="195" y2="58" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="45" y="70" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#1e3a8a">EDUCATIONAL QUALIFICATION</text>
      <rect x="45" y="74" width="150" height="14" fill="#f8fafc"/>
      <text x="48" y="84" font-family="Arial, sans-serif" font-size="7" fill="#334155">10th (CBSE) 82% • 12th (Commerce) 78%</text>
      <text x="45" y="98" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#1e3a8a">TECHNICAL SKILLS</text>
      <text x="48" y="108" font-family="Arial, sans-serif" font-size="7" fill="#334155">Tally Prime, MS Office, Typing (Eng 40 WPM)</text>
      <text x="45" y="122" font-family="Arial, sans-serif" font-size="6.5" fill="#94a3b8">Mobile: +91 98765 43210</text>
    </svg>
  `),

  // --- ID Card & Print Tools ---
  'lamination-margin-cutting-guide': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="30" y="18" width="180" height="104" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="1" stroke-dasharray="4 3"/>
      <rect x="42" y="28" width="156" height="84" rx="5" fill="#ffffff" stroke="#0369a1" stroke-width="1.5"/>
      <circle cx="62" cy="56" r="14" fill="#bae6fd"/>
      <line x1="84" y1="46" x2="170" y2="46" stroke="#0284c7" stroke-width="2"/>
      <line x1="84" y1="58" x2="150" y2="58" stroke="#94a3b8" stroke-width="2"/>
      <line x1="84" y1="70" x2="160" y2="70" stroke="#94a3b8" stroke-width="2"/>
      <text x="120" y="98" font-family="monospace" font-size="8" fill="#0369a1" text-anchor="middle">CR-80 SAFE CUTTING MARGIN (2.5mm)</text>
      <text x="120" y="132" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#0284c7" text-anchor="middle">THERMAL POUCH ALIGNMENT GUIDE</text>
    </svg>
  `),

  'student-employee-id-template': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="70" y="10" width="100" height="120" rx="8" fill="#ffffff" stroke="#4338ca" stroke-width="1.5"/>
      <rect x="70" y="10" width="100" height="24" rx="8" fill="#4338ca"/>
      <text x="120" y="26" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">DAV PUBLIC SCHOOL</text>
      <rect x="100" y="38" width="40" height="42" rx="4" fill="#e0e7ff" stroke="#818cf8"/>
      <circle cx="120" cy="52" r="10" fill="#818cf8"/>
      <path d="M106 78c0-7 6-10 14-10s14 3 14 10" fill="#818cf8"/>
      <text x="120" y="92" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#1e1b4b" text-anchor="middle">RAHUL SHARMA</text>
      <text x="120" y="102" font-family="Arial, sans-serif" font-size="7" fill="#4338ca" text-anchor="middle">Class: X-A • Roll: 24</text>
      <rect x="90" y="108" width="60" height="14" fill="#f8fafc"/>
      <line x1="94" y1="110" x2="94" y2="120" stroke="#000" stroke-width="1.5"/>
      <line x1="98" y1="110" x2="98" y2="120" stroke="#000" stroke-width="1"/>
      <line x1="102" y1="110" x2="102" y2="120" stroke="#000" stroke-width="2"/>
      <line x1="108" y1="110" x2="108" y2="120" stroke="#000" stroke-width="1"/>
      <line x1="114" y1="110" x2="114" y2="120" stroke="#000" stroke-width="2"/>
      <line x1="120" y1="110" x2="120" y2="120" stroke="#000" stroke-width="1"/>
      <line x1="126" y1="110" x2="126" y2="120" stroke="#000" stroke-width="1.5"/>
      <line x1="132" y1="110" x2="132" y2="120" stroke="#000" stroke-width="1"/>
      <line x1="138" y1="110" x2="138" y2="120" stroke="#000" stroke-width="2"/>
      <line x1="144" y1="110" x2="144" y2="120" stroke="#000" stroke-width="1"/>
    </svg>
  `),

  // --- Photo & Signature Tools ---
  'exam-photo-cropper': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="75" y="10" width="90" height="116" rx="4" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
      <circle cx="120" cy="50" r="18" fill="#dbeafe" stroke="#93c5fd"/>
      <path d="M96 96c0-14 11-20 24-20s24 6 24 20" fill="#dbeafe"/>
      <rect x="75" y="98" width="90" height="28" fill="#eff6ff" stroke="#bfdbfe"/>
      <text x="120" y="110" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#1e40af" text-anchor="middle">3.5 × 4.5 CM</text>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="7" fill="#2563eb" text-anchor="middle">20 KB - 50 KB JPEG</text>
      <rect x="25" y="30" width="40" height="20" rx="3" fill="#16a34a"/>
      <text x="45" y="43" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">SSC/UPSC</text>
      <rect x="175" y="30" width="45" height="20" rx="3" fill="#ea580c"/>
      <text x="197" y="43" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">NTA/IBPS</text>
    </svg>
  `),

  'photo-signature-joiner': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="70" y="10" width="100" height="120" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="75" y="15" width="90" height="75" fill="#f8fafc" stroke="#cbd5e1"/>
      <circle cx="120" cy="42" r="15" fill="#cbd5e1"/>
      <path d="M100 80c0-10 9-16 20-16s20 6 20 16" fill="#cbd5e1"/>
      <line x1="70" y1="94" x2="170" y2="94" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="75" y="98" width="90" height="28" fill="#ffffff"/>
      <path d="M85 116c8-10 16 4 24-4s12 10 20 0 15 2 24-2" stroke="#1d4ed8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <text x="120" y="124" font-family="Arial, sans-serif" font-size="6.5" fill="#64748b" text-anchor="middle">Candidate Signature</text>
    </svg>
  `),

  'date-name-on-photo-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="75" y="10" width="90" height="120" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.5"/>
      <rect x="75" y="10" width="90" height="86" fill="#e2e8f0"/>
      <circle cx="120" cy="42" r="16" fill="#94a3b8"/>
      <path d="M98 84c0-12 10-18 22-18s22 6 22 18" fill="#94a3b8"/>
      <rect x="75" y="96" width="90" height="34" fill="#ffffff"/>
      <text x="120" y="109" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0f172a" text-anchor="middle">RAKESH KUMAR</text>
      <text x="120" y="122" font-family="monospace" font-size="8" font-weight="bold" fill="#dc2626" text-anchor="middle">DOP: 24/10/2026</text>
    </svg>
  `),

  'signature-clearer-bg-remover': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="18" width="90" height="100" rx="4" fill="#fed7aa" stroke="#fb923c"/>
      <text x="70" y="32" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#c2410c" text-anchor="middle">BEFORE (Shadowed)</text>
      <path d="M35 75c10-8 20 6 30-4s15 10 25-2" stroke="#431407" stroke-width="2" fill="none"/>
      <path d="M120 68l10-8v6h12v4h-12v6z" fill="#3b82f6"/>
      <rect x="145" y="18" width="90" height="100" rx="4" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
      <text x="190" y="32" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#15803d" text-anchor="middle">AFTER (Crisp Pure)</text>
      <path d="M155 75c10-8 20 6 30-4s15 10 25-2" stroke="#1e40af" stroke-width="2.2" fill="none"/>
      <text x="190" y="105" font-family="Arial, sans-serif" font-size="7" fill="#16a34a" text-anchor="middle">100% White BG</text>
    </svg>
  `),

  'stamp-size-photo-maker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="85" y="20" width="70" height="96" rx="3" fill="#ffffff" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="120" cy="54" r="14" fill="#93c5fd"/>
      <path d="M102 96c0-10 8-16 18-16s18 6 18 16" fill="#93c5fd"/>
      <rect x="85" y="98" width="70" height="18" fill="#fee2e2"/>
      <text x="120" y="110" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#991b1b" text-anchor="middle">2.5 × 3.0 CM</text>
    </svg>
  `),

  'bw-to-color-photo-studio': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#0f172a"/>
      <rect x="25" y="15" width="90" height="110" rx="4" fill="#475569"/>
      <circle cx="70" cy="55" r="16" fill="#94a3b8"/>
      <path d="M48 105c0-12 10-18 22-18s22 6 22 18" fill="#94a3b8"/>
      <text x="70" y="120" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#cbd5e1" text-anchor="middle">VINTAGE B&amp;W</text>
      <rect x="125" y="15" width="90" height="110" rx="4" fill="#3b82f6"/>
      <circle cx="170" cy="55" r="16" fill="#fed7aa"/>
      <path d="M148 105c0-12 10-18 22-18s22 6 22 18" fill="#ea580c"/>
      <text x="170" y="120" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">AI COLORIZED</text>
    </svg>
  `),

  'photo-background-changer': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="20" width="55" height="75" rx="3" fill="#ffffff" stroke="#94a3b8"/>
      <circle cx="52" cy="46" r="10" fill="#64748b"/>
      <rect x="25" y="98" width="55" height="18" rx="2" fill="#e2e8f0"/>
      <text x="52" y="110" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#334155" text-anchor="middle">WHITE</text>
      <rect x="92" y="20" width="55" height="75" rx="3" fill="#3b82f6" stroke="#1d4ed8"/>
      <circle cx="119" cy="46" r="10" fill="#ffffff"/>
      <rect x="92" y="98" width="55" height="18" rx="2" fill="#dbeafe"/>
      <text x="119" y="110" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#1e40af" text-anchor="middle">BLUE</text>
      <rect x="160" y="20" width="55" height="75" rx="3" fill="#94a3b8" stroke="#475569"/>
      <circle cx="187" cy="46" r="10" fill="#ffffff"/>
      <rect x="160" y="98" width="55" height="18" rx="2" fill="#f1f5f9"/>
      <text x="187" y="110" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#475569" text-anchor="middle">GREY</text>
    </svg>
  `),

  'photo-paper-4x6-layout': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="30" y="15" width="180" height="110" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
      <text x="120" y="27" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">4 × 6 INCH GLOSSY PHOTO SHEET (8 PHOTOS)</text>
      <g fill="#bae6fd" stroke="#0284c7" stroke-width="0.8">
        <rect x="42" y="34" width="34" height="42" rx="2"/><circle cx="59" cy="48" r="5" fill="#0284c7"/>
        <rect x="82" y="34" width="34" height="42" rx="2"/><circle cx="99" cy="48" r="5" fill="#0284c7"/>
        <rect x="122" y="34" width="34" height="42" rx="2"/><circle cx="139" cy="48" r="5" fill="#0284c7"/>
        <rect x="162" y="34" width="34" height="42" rx="2"/><circle cx="179" cy="48" r="5" fill="#0284c7"/>
        <rect x="42" y="80" width="34" height="40" rx="2"/><circle cx="59" cy="94" r="5" fill="#0284c7"/>
        <rect x="82" y="80" width="34" height="40" rx="2"/><circle cx="99" cy="94" r="5" fill="#0284c7"/>
        <rect x="122" y="80" width="34" height="40" rx="2"/><circle cx="139" cy="94" r="5" fill="#0284c7"/>
        <rect x="162" y="80" width="34" height="40" rx="2"/><circle cx="179" cy="94" r="5" fill="#0284c7"/>
      </g>
    </svg>
  `),

  'photo-paper-a4-layout': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="65" y="8" width="110" height="124" rx="3" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <text x="120" y="20" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#0f172a" text-anchor="middle">A4 BULK GRID (32 PHOTOS)</text>
      <g fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5">
        <rect x="72" y="26" width="20" height="22"/>
        <rect x="96" y="26" width="20" height="22"/>
        <rect x="120" y="26" width="20" height="22"/>
        <rect x="144" y="26" width="20" height="22"/>
        <rect x="72" y="51" width="20" height="22"/>
        <rect x="96" y="51" width="20" height="22"/>
        <rect x="120" y="51" width="20" height="22"/>
        <rect x="144" y="51" width="20" height="22"/>
        <rect x="72" y="76" width="20" height="22"/>
        <rect x="96" y="76" width="20" height="22"/>
        <rect x="120" y="76" width="20" height="22"/>
        <rect x="144" y="76" width="20" height="22"/>
        <rect x="72" y="101" width="20" height="22"/>
        <rect x="96" y="101" width="20" height="22"/>
        <rect x="120" y="101" width="20" height="22"/>
        <rect x="144" y="101" width="20" height="22"/>
      </g>
    </svg>
  `),

  'signature-resizer-compressor': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="35" y="15" width="170" height="70" rx="4" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <path d="M50 55c15-14 30 8 45-6s25 14 40-4 20 6 35-2" stroke="#1e40af" stroke-width="2.2" fill="none"/>
      <rect x="35" y="92" width="170" height="34" rx="4" fill="#15803d"/>
      <text x="120" y="106" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">STRICT PORTAL RANGE: 10 KB - 20 KB</text>
      <text x="120" y="118" font-family="monospace" font-size="8.5" fill="#dcfce7" text-anchor="middle">Current File: 14.2 KB (140 × 60 px) ✓</text>
    </svg>
  `),

  'face-centering-ratio-checker': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="75" y="10" width="90" height="120" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
      <circle cx="120" cy="52" r="24" fill="#dbeafe" stroke="#3b82f6" stroke-dasharray="2 2"/>
      <ellipse cx="120" cy="52" rx="16" ry="20" fill="none" stroke="#16a34a" stroke-width="1.5"/>
      <line x1="75" y1="52" x2="165" y2="52" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="3 2"/>
      <line x1="120" y1="10" x2="120" y2="130" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="3 2"/>
      <rect x="80" y="106" width="80" height="18" rx="2" fill="#15803d"/>
      <text x="120" y="118" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">75% FACE RATIO ✓</text>
    </svg>
  `),

  'blurry-photo-sharpener': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="15" width="90" height="110" rx="4" fill="#cbd5e1" opacity="0.6"/>
      <circle cx="70" cy="55" r="16" fill="#94a3b8" filter="blur(2px)"/>
      <text x="70" y="115" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">BLURRY / NOISY</text>
      <rect x="125" y="15" width="90" height="110" rx="4" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <circle cx="170" cy="55" r="16" fill="#60a5fa" stroke="#1d4ed8" stroke-width="1.5"/>
      <path d="M152 98c0-10 8-15 18-15s18 5 18 15" fill="#3b82f6"/>
      <text x="170" y="115" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#1e40af" text-anchor="middle">CRISP &amp; SHARP</text>
    </svg>
  `),

  'red-eye-flash-glare-remover': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="20" width="70" height="80" rx="4" fill="#ffffff" stroke="#dc2626"/>
      <circle cx="70" cy="60" r="16" fill="#fee2e2"/>
      <circle cx="70" cy="60" r="8" fill="#dc2626"/>
      <text x="70" y="115" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#dc2626" text-anchor="middle">FLASH RED EYE</text>
      <rect x="135" y="20" width="70" height="80" rx="4" fill="#ffffff" stroke="#16a34a"/>
      <circle cx="170" cy="60" r="16" fill="#f0fdf4"/>
      <circle cx="170" cy="60" r="8" fill="#0f172a"/>
      <circle cx="168" cy="58" r="2" fill="#ffffff"/>
      <text x="170" y="115" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#16a34a" text-anchor="middle">NATURAL EYE ✓</text>
    </svg>
  `),

  'biometric-crop-exact-pixels': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="70" y="12" width="100" height="116" rx="4" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>
      <circle cx="120" cy="50" r="16" fill="#ddd6fe"/>
      <path d="M100 92c0-10 9-16 20-16s20 6 20 16" fill="#ddd6fe"/>
      <rect x="70" y="98" width="100" height="30" fill="#6d28d9"/>
      <text x="120" y="111" font-family="monospace" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">200 × 230 PX</text>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="7" fill="#ede9fe" text-anchor="middle">Exact Biometric Bounds</text>
    </svg>
  `),

  // --- PDF Tools ---
  'pdf-merger': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="25" width="50" height="65" rx="3" fill="#fecaca" stroke="#dc2626"/>
      <text x="50" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">PDF 1</text>
      <text x="88" y="62" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#dc2626">+</text>
      <rect x="100" y="25" width="50" height="65" rx="3" fill="#fef08a" stroke="#ca8a04"/>
      <text x="125" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#854d0e" text-anchor="middle">PDF 2</text>
      <path d="M158 57l12-8v5h14v6h-14v5z" fill="#16a34a"/>
      <rect x="188" y="20" width="42" height="75" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
      <text x="209" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#14532d" text-anchor="middle">MERGED</text>
      <rect x="40" y="104" width="160" height="22" rx="4" fill="#dc2626"/>
      <text x="120" y="119" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">COMBINE MULTIPLE PDFS</text>
    </svg>
  `),

  'pdf-splitter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="20" width="60" height="78" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="55" y="58" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#991b1b" text-anchor="middle">10 PAGES</text>
      <path d="M96 55l14-6v4h12v4h-12v4z" fill="#0284c7"/>
      <rect x="130" y="24" width="40" height="50" rx="3" fill="#e0f2fe" stroke="#0284c7"/>
      <text x="150" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">Page 1</text>
      <rect x="178" y="24" width="40" height="50" rx="3" fill="#e0f2fe" stroke="#0284c7"/>
      <text x="198" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">Page 2-5</text>
      <rect x="40" y="106" width="160" height="22" rx="4" fill="#0f172a"/>
      <text x="120" y="120" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">EXTRACT &amp; SPLIT PAGES</text>
    </svg>
  `),

  'pdf-compressor-under-200kb': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="22" width="75" height="70" rx="4" fill="#fee2e2" stroke="#dc2626"/>
      <text x="62" y="52" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">4.2 MB</text>
      <text x="62" y="68" font-family="Arial, sans-serif" font-size="7.5" fill="#7f1d1d" text-anchor="middle">Heavy Scan</text>
      <path d="M110 54l14-7v4h14v6h-14v4z" fill="#16a34a"/>
      <rect x="145" y="22" width="75" height="70" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
      <text x="182" y="52" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#14532d" text-anchor="middle">186 KB</text>
      <text x="182" y="68" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">PASSED GOVT CAP ✓</text>
      <rect x="35" y="104" width="170" height="22" rx="4" fill="#15803d"/>
      <text x="120" y="119" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">TARGET: STRICT UNDER 200 KB</text>
    </svg>
  `),

  'pdf-to-jpg-png': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="35" y="20" width="65" height="80" rx="4" fill="#fee2e2" stroke="#ef4444"/>
      <text x="67" y="62" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">PDF</text>
      <path d="M110 56l12-7v4h14v6h-14v4z" fill="#2563eb"/>
      <rect x="142" y="20" width="65" height="80" rx="4" fill="#dbeafe" stroke="#2563eb"/>
      <text x="174" y="58" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">JPG / PNG</text>
      <text x="174" y="72" font-family="Arial, sans-serif" font-size="8" fill="#1e3a8a" text-anchor="middle">300 DPI</text>
      <rect x="40" y="108" width="160" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">HIGH RES IMAGE RENDER</text>
    </svg>
  `),

  'images-to-single-pdf': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <g stroke="#94a3b8" fill="#e2e8f0">
        <rect x="25" y="30" width="36" height="48" rx="2"/>
        <rect x="40" y="24" width="36" height="48" rx="2" fill="#dbeafe" stroke="#3b82f6"/>
        <rect x="55" y="18" width="36" height="48" rx="2" fill="#fef08a" stroke="#ca8a04"/>
      </g>
      <path d="M106 50l14-7v4h16v6h-16v4z" fill="#dc2626"/>
      <rect x="145" y="15" width="65" height="85" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
      <text x="177" y="54" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">PDF</text>
      <text x="177" y="70" font-family="Arial, sans-serif" font-size="7.5" fill="#7f1d1d" text-anchor="middle">COMBINED FILE</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#dc2626"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">PHOTOS TO SINGLE PDF DOSSIER</text>
    </svg>
  `),

  'pdf-password-remover': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="30" y="20" width="65" height="75" rx="4" fill="#fee2e2" stroke="#dc2626"/>
      <rect x="52" y="45" width="22" height="18" rx="3" fill="#dc2626"/>
      <path d="M57 45v-5a6 6 0 0 1 12 0v5" stroke="#dc2626" stroke-width="2.5" fill="none"/>
      <path d="M106 55l14-7v4h16v6h-16v4z" fill="#16a34a"/>
      <rect x="145" y="20" width="65" height="75" rx="4" fill="#dcfce7" stroke="#16a34a"/>
      <rect x="167" y="45" width="22" height="18" rx="3" fill="#16a34a"/>
      <path d="M172 38a6 6 0 0 1 12 0" stroke="#16a34a" stroke-width="2.5" fill="none"/>
      <rect x="35" y="106" width="170" height="22" rx="4" fill="#15803d"/>
      <text x="120" y="120" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">UNLOCK E-AADHAAR FOR FAST PRINT</text>
    </svg>
  `),

  'pdf-password-protector': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="70" y="14" width="100" height="85" rx="5" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect x="105" y="44" width="30" height="24" rx="4" fill="#0f172a"/>
      <path d="M112 44v-7a8 8 0 0 1 16 0v7" stroke="#0f172a" stroke-width="3" fill="none"/>
      <rect x="35" y="106" width="170" height="22" rx="4" fill="#0f172a"/>
      <text x="120" y="120" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">ENCRYPT WITH 128-BIT AES</text>
    </svg>
  `),

  'pdf-rotate-tool': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <g transform="translate(60, 55) rotate(-30)">
        <rect x="-30" y="-40" width="60" height="80" rx="3" fill="#fee2e2" stroke="#dc2626"/>
      </g>
      <path d="M115 50a30 30 0 0 1 35 15" stroke="#2563eb" stroke-width="3" fill="none" stroke-linecap="round"/>
      <polygon points="152,65 146,55 158,58" fill="#2563eb"/>
      <g transform="translate(180, 55)">
        <rect x="-28" y="-38" width="56" height="76" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      </g>
      <rect x="40" y="108" width="160" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">90° / 180° PERMANENT ROTATION</text>
    </svg>
  `),

  'pdf-watermark-adder': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="50" y="12" width="140" height="90" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <line x1="65" y1="28" x2="175" y2="28" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="65" y1="40" x2="175" y2="40" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="65" y1="52" x2="175" y2="52" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="65" y1="64" x2="175" y2="64" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="65" y1="76" x2="140" y2="76" stroke="#e2e8f0" stroke-width="2"/>
      <g transform="translate(120, 55) rotate(-25)">
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#dc2626" opacity="0.38" text-anchor="middle">CONFIDENTIAL</text>
      </g>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#dc2626"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">CUSTOM WATERMARK STAMP</text>
    </svg>
  `),

  'pdf-page-number-adder': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="60" y="12" width="120" height="90" rx="4" fill="#ffffff" stroke="#64748b"/>
      <line x1="75" y1="30" x2="165" y2="30" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="75" y1="45" x2="165" y2="45" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="75" y1="60" x2="140" y2="60" stroke="#cbd5e1" stroke-width="1.5"/>
      <rect x="95" y="80" width="50" height="14" rx="2" fill="#dbeafe" stroke="#3b82f6"/>
      <text x="120" y="90" font-family="monospace" font-size="8.5" font-weight="bold" fill="#1e40af" text-anchor="middle">Page 1 of 12</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">HEADER / FOOTER PAGINATION</text>
    </svg>
  `),

  'pdf-text-header-eraser': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="50" y="14" width="140" height="88" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <rect x="60" y="24" width="120" height="18" fill="#fee2e2" stroke="#ef4444" stroke-dasharray="3 2"/>
      <text x="120" y="36" font-family="Arial, sans-serif" font-size="8" fill="#991b1b" text-anchor="middle">[ ERASE UNWANTED HEADER ]</text>
      <line x1="65" y1="52" x2="175" y2="52" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="65" y1="66" x2="175" y2="66" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="65" y1="80" x2="150" y2="80" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#ef4444"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">WHITE-OUT UNWANTED TEXT</text>
    </svg>
  `),

  'pdf-grayscale-ink-saver': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="30" y="18" width="80" height="80" rx="4" fill="#fee2e2" stroke="#dc2626"/>
      <circle cx="70" cy="50" r="16" fill="#3b82f6"/>
      <rect x="45" y="72" width="50" height="14" fill="#16a34a"/>
      <text x="70" y="108" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">COLOR (Heavy Ink)</text>
      <path d="M118 56l10-6v4h12v4h-12v4z" fill="#0f172a"/>
      <rect x="145" y="18" width="80" height="80" rx="4" fill="#f8fafc" stroke="#475569"/>
      <circle cx="185" cy="50" r="16" fill="#94a3b8"/>
      <rect x="160" y="72" width="50" height="14" fill="#cbd5e1"/>
      <text x="185" y="108" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#0f172a" text-anchor="middle">GRAYSCALE (Ink Saver)</text>
      <rect x="35" y="116" width="170" height="18" rx="3" fill="#0f172a"/>
      <text x="120" y="128" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SAVE 70% COLOR PRINTER TONER</text>
    </svg>
  `),

  'pdf-ocr-text-extractor': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="18" width="85" height="82" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <line x1="35" y1="32" x2="95" y2="32" stroke="#64748b" stroke-width="1.5"/>
      <line x1="35" y1="44" x2="95" y2="44" stroke="#64748b" stroke-width="1.5"/>
      <line x1="35" y1="56" x2="95" y2="56" stroke="#64748b" stroke-width="1.5"/>
      <path d="M118 56l12-7v4h12v6h-12v4z" fill="#2563eb"/>
      <rect x="145" y="18" width="80" height="82" rx="4" fill="#eff6ff" stroke="#2563eb"/>
      <text x="152" y="36" font-family="monospace" font-size="8" fill="#1e40af">HINDI + ENG</text>
      <text x="152" y="50" font-family="monospace" font-size="7.5" fill="#1e3a8a">Copyable Text</text>
      <text x="152" y="64" font-family="monospace" font-size="7.5" fill="#1e3a8a">100% OCR Acc</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">EXTRACT EDITABLE TEXT FROM SCANS</text>
    </svg>
  `),

  'pdf-form-filler-signer': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="50" y="12" width="140" height="92" rx="4" fill="#ffffff" stroke="#0284c7"/>
      <rect x="62" y="24" width="70" height="14" fill="#f0f9ff" stroke="#bae6fd"/>
      <text x="66" y="34" font-family="Arial, sans-serif" font-size="7.5" fill="#0369a1">Aadhaar: 8491-****</text>
      <rect x="140" y="24" width="40" height="14" fill="#f0f9ff" stroke="#bae6fd"/>
      <text x="144" y="34" font-family="Arial, sans-serif" font-size="7.5" fill="#0369a1">DOB: 1998</text>
      <path d="M70 65c8-6 16 4 24-2s12 6 20 0" stroke="#1d4ed8" stroke-width="1.8" fill="none"/>
      <text x="150" y="68" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#16a34a">✓ SIGNED</text>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#0284c7"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">DIGITAL FORM FILLER &amp; SIGNER</text>
    </svg>
  `),

  'word-to-pdf-converter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="20" width="65" height="78" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <text x="67" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e40af" text-anchor="middle">DOCX</text>
      <text x="67" y="74" font-family="Arial, sans-serif" font-size="8" fill="#1e3a8a" text-anchor="middle">MS Word</text>
      <path d="M110 56l12-7v4h14v6h-14v4z" fill="#dc2626"/>
      <rect x="142" y="20" width="65" height="78" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <text x="174" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">PDF</text>
      <text x="174" y="74" font-family="Arial, sans-serif" font-size="8" fill="#7f1d1d" text-anchor="middle">Print Ready</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#0f172a"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">CONVERT RESUME &amp; DOCS TO PDF</text>
    </svg>
  `),

  'excel-to-pdf-converter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="35" y="20" width="65" height="78" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="67" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#14532d" text-anchor="middle">XLSX</text>
      <text x="67" y="74" font-family="Arial, sans-serif" font-size="8" fill="#166534" text-anchor="middle">Spreadsheet</text>
      <path d="M110 56l12-7v4h14v6h-14v4z" fill="#dc2626"/>
      <rect x="142" y="20" width="65" height="78" rx="4" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <text x="174" y="58" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">PDF</text>
      <text x="174" y="74" font-family="Arial, sans-serif" font-size="8" fill="#7f1d1d" text-anchor="middle">Fitted Tables</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#16a34a"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SCALE SPREADSHEETS TO A4</text>
    </svg>
  `),

  'pdf-flatten-tool': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="65" y="15" width="110" height="85" rx="4" fill="#ffffff" stroke="#475569"/>
      <rect x="75" y="28" width="90" height="14" rx="2" fill="#e2e8f0"/>
      <text x="80" y="38" font-family="Arial, sans-serif" font-size="7.5" fill="#334155">Immutable Vector Layer</text>
      <line x1="75" y1="52" x2="165" y2="52" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="75" y1="64" x2="165" y2="64" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="80" y="74" width="80" height="16" rx="2" fill="#15803d"/>
      <text x="120" y="85" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">LOCKED / FLATTENED</text>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#475569"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">LOCK FILLABLE FORM FIELDS</text>
    </svg>
  `),

  'pdf-margin-border-adjuster': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="55" y="12" width="130" height="92" rx="4" fill="#ffffff" stroke="#0284c7"/>
      <rect x="55" y="12" width="24" height="92" fill="#e0f2fe"/>
      <text x="67" y="60" font-family="monospace" font-size="7" fill="#0369a1" text-anchor="middle" transform="rotate(-90 67 60)">15mm MARGIN</text>
      <line x1="90" y1="30" x2="170" y2="30" stroke="#94a3b8" stroke-width="2"/>
      <line x1="90" y1="46" x2="170" y2="46" stroke="#94a3b8" stroke-width="2"/>
      <line x1="90" y1="62" x2="170" y2="62" stroke="#94a3b8" stroke-width="2"/>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#0284c7"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">STAPLE CLEARANCE BORDER ADJUSTER</text>
    </svg>
  `),

  'pdf-booklet-print-formatter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="15" width="170" height="88" rx="4" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5"/>
      <line x1="120" y1="15" x2="120" y2="103" stroke="#7c3aed" stroke-dasharray="3 2"/>
      <rect x="45" y="25" width="65" height="68" fill="#f5f3ff"/>
      <text x="77" y="62" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">PAGE 4 / 1</text>
      <rect x="130" y="25" width="65" height="68" fill="#f5f3ff"/>
      <text x="162" y="62" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">PAGE 2 / 3</text>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#7c3aed"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">2-UP SADDLE-STITCH BOOKLET</text>
    </svg>
  `),

  'pdf-masked-aadhaar-tool': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#fef2f2"/>
      <rect x="35" y="15" width="170" height="90" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="45" y="24" width="30" height="35" rx="3" fill="#fee2e2"/>
      <text x="85" y="38" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f172a">GOVERNMENT OF INDIA</text>
      <text x="85" y="50" font-family="Arial, sans-serif" font-size="8" fill="#475569">Manoj Kumar Sharma</text>
      <rect x="45" y="70" width="150" height="26" rx="4" fill="#0f172a"/>
      <text x="120" y="87" font-family="monospace" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">XXXX  XXXX  4192</text>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#dc2626"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">MASK 8 DIGITS FOR PRIVACY / KYC</text>
    </svg>
  `),

  'pdf-metadata-cleaner': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="50" y="15" width="140" height="88" rx="4" fill="#ffffff" stroke="#475569"/>
      <text x="60" y="32" font-family="monospace" font-size="8" fill="#dc2626">Author: [STRIPPED]</text>
      <text x="60" y="46" font-family="monospace" font-size="8" fill="#dc2626">Scanner IP: [STRIPPED]</text>
      <text x="60" y="60" font-family="monospace" font-size="8" fill="#dc2626">GPS Location: [REMOVED]</text>
      <text x="60" y="74" font-family="monospace" font-size="8" fill="#dc2626">Timestamp: [CLEARED]</text>
      <rect x="35" y="110" width="170" height="20" rx="3" fill="#15803d"/>
      <text x="120" y="123" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">100% PRIVATE ANONYMOUS PDF</text>
    </svg>
  `),

  // --- Image Converter & Utilities ---
  'image-format-converter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="25" width="55" height="65" rx="4" fill="#dbeafe" stroke="#2563eb"/>
      <text x="52" y="60" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">WEBP</text>
      <path d="M92 56l12-7v4h14v6h-14v4z" fill="#0284c7"/>
      <rect x="128" y="20" width="85" height="75" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="170" y="50" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#14532d" text-anchor="middle">JPG / PNG</text>
      <text x="170" y="66" font-family="Arial, sans-serif" font-size="8" fill="#166534" text-anchor="middle">Govt Supported</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">JPG • PNG • WEBP • BMP</text>
    </svg>
  `),

  'image-resizer-pixel-dimension': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="40" y="15" width="160" height="85" rx="4" fill="#ffffff" stroke="#475569" stroke-dasharray="4 2"/>
      <line x1="40" y1="20" x2="200" y2="20" stroke="#0284c7" stroke-width="1.5"/>
      <text x="120" y="32" font-family="monospace" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="middle">WIDTH: 600 PX</text>
      <line x1="45" y1="15" x2="45" y2="100" stroke="#0284c7" stroke-width="1.5"/>
      <text x="56" y="65" font-family="monospace" font-size="8" font-weight="bold" fill="#0284c7" transform="rotate(-90 56 65)">HEIGHT: 800 PX</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#0284c7"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">EXACT PIXEL &amp; CM RESIZING</text>
    </svg>
  `),

  'kb-size-reducer': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#fef2f2"/>
      <rect x="30" y="20" width="70" height="72" rx="4" fill="#fee2e2" stroke="#dc2626"/>
      <text x="65" y="52" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#991b1b" text-anchor="middle">2.8 MB</text>
      <text x="65" y="68" font-family="Arial, sans-serif" font-size="8" fill="#7f1d1d" text-anchor="middle">Rejected</text>
      <path d="M112 55l12-7v4h14v6h-14v4z" fill="#16a34a"/>
      <rect x="148" y="20" width="65" height="72" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
      <text x="180" y="52" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">48 KB</text>
      <text x="180" y="68" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#15803d" text-anchor="middle">Accepted ✓</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#15803d"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">COMPRESS TO EXACT 20KB / 50KB</text>
    </svg>
  `),

  'image-dpi-resolution-scaler': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="20" width="70" height="75" rx="4" fill="#e2e8f0" stroke="#64748b"/>
      <text x="70" y="54" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155" text-anchor="middle">72 DPI</text>
      <text x="70" y="70" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Web Preview</text>
      <path d="M116 56l12-7v4h14v6h-14v4z" fill="#3b82f6"/>
      <rect x="150" y="16" width="65" height="82" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
      <text x="182" y="52" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">300 DPI</text>
      <text x="182" y="68" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#1d4ed8" text-anchor="middle">Print Quality</text>
      <rect x="35" y="108" width="170" height="20" rx="3" fill="#2563eb"/>
      <text x="120" y="122" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">OFFICIAL DPI METADATA CALIBRATION</text>
    </svg>
  `),

  // --- Calculator & Finance Tools ---
  'age-calculator-govt-exam': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#15803d"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">EXACT AGE ELIGIBILITY CHECKER</text>
      <text x="35" y="52" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">DOB: 15-AUG-2000 • Cut-off: 01-JAN-2026</text>
      <rect x="35" y="60" width="170" height="40" rx="4" fill="#dcfce7" stroke="#86efac"/>
      <text x="120" y="78" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">25 Yrs 4 Mos 17 Days</text>
      <text x="120" y="93" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle">ELIGIBLE FOR UPSC / SSC / POLICE ✓</text>
      <text x="120" y="118" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Total Days: 9,270 • Total Weeks: 1,324</text>
    </svg>
  `),

  'gst-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#eff6ff"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#1d4ed8"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">GST CALCULATOR (18%)</text>
      <text x="35" y="52" font-family="Arial, sans-serif" font-size="9" fill="#0f172a">Base Amount: <tspan font-weight="bold">₹ 1,000.00</tspan></text>
      <line x1="35" y1="60" x2="205" y2="60" stroke="#e2e8f0"/>
      <text x="35" y="74" font-family="Arial, sans-serif" font-size="8.5" fill="#2563eb">CGST (9%): ₹ 90.00</text>
      <text x="125" y="74" font-family="Arial, sans-serif" font-size="8.5" fill="#2563eb">SGST (9%): ₹ 90.00</text>
      <rect x="35" y="85" width="170" height="32" rx="4" fill="#1e40af"/>
      <text x="120" y="105" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">TOTAL: ₹ 1,180.00</text>
    </svg>
  `),

  'cyber-cafe-cost-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#0369a1"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">PRINT JOB COST &amp; PROFIT</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8" fill="#334155">10 Color Prints + 5 Lamination + 1 Form</text>
      <rect x="35" y="58" width="170" height="38" rx="4" fill="#f0f9ff" stroke="#bae6fd"/>
      <text x="45" y="72" font-family="Arial, sans-serif" font-size="8" fill="#0369a1">Cost: ₹ 115.00  •  Selling: ₹ 280.00</text>
      <text x="45" y="87" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#15803d">NET PROFIT: ₹ 165.00 (59%)</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#0f172a"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">CALCULATE PRINTER INK &amp; PAPER COST</text>
    </svg>
  `),

  'discount-percentage-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#fef2f2"/>
      <rect x="30" y="14" width="180" height="112" rx="6" fill="#ffffff" stroke="#e11d48" stroke-width="1.5"/>
      <text x="120" y="36" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#be123c" text-anchor="middle">MRP: ₹ 2,499  •  DISCOUNT: 35%</text>
      <rect x="45" y="48" width="150" height="42" rx="4" fill="#ffe4e6"/>
      <text x="120" y="70" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#9f1239" text-anchor="middle">YOU PAY: ₹ 1,624.35</text>
      <text x="120" y="83" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle">TOTAL SAVINGS: ₹ 874.65 ✓</text>
      <rect x="45" y="98" width="150" height="20" rx="3" fill="#e11d48"/>
      <text x="120" y="111" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">STUDENT MARKS &amp; RETAIL MARGINS</text>
    </svg>
  `),

  'loan-emi-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#4f46e5" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#4338ca"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">LOAN EMI CALCULATOR</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Loan: ₹ 5,00,000 • 9.5% p.a. • 5 Years</text>
      <rect x="35" y="58" width="170" height="38" rx="4" fill="#e0e7ff"/>
      <text x="120" y="76" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#312e81" text-anchor="middle">Monthly EMI: ₹ 10,501</text>
      <text x="120" y="89" font-family="Arial, sans-serif" font-size="8" fill="#4338ca" text-anchor="middle">Total Interest Payable: ₹ 1,30,043</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#4f46e5"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">HOME, CAR &amp; PERSONAL LOAN SCHEDULE</text>
    </svg>
  `),

  'ppf-sukanya-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#ecfdf5"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#059669" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#047857"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SUKANYA &amp; PPF MATURITY</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8" fill="#334155">Yearly Deposit: ₹ 50,000 (8.2% Sovereign Rate)</text>
      <rect x="35" y="58" width="170" height="36" rx="4" fill="#d1fae5"/>
      <text x="120" y="74" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#065f46" text-anchor="middle">Maturity: ₹ 22,71,840</text>
      <text x="120" y="87" font-family="Arial, sans-serif" font-size="7.5" fill="#047857" text-anchor="middle">Invested: ₹ 7.5 Lakh • Interest: ₹ 15.2 Lakh</text>
      <rect x="35" y="100" width="170" height="20" rx="3" fill="#059669"/>
      <text x="120" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">TAX-FREE WEALTH ACCUMULATION</text>
    </svg>
  `),

  'sip-mutual-fund-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#0284c7" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#0284c7"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">MUTUAL FUND SIP CALCULATOR</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Monthly SIP: ₹ 2,500 • 12% Return • 10 Yrs</text>
      <rect x="35" y="58" width="170" height="38" rx="4" fill="#e0f2fe"/>
      <text x="120" y="76" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">₹ 5,80,094</text>
      <text x="120" y="89" font-family="Arial, sans-serif" font-size="7.5" fill="#0284c7" text-anchor="middle">Wealth Gain: ₹ 2,80,094 (Invested: ₹ 3 Lakh)</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#0369a1"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">COMPOUND INTEREST ESTIMATOR</text>
    </svg>
  `),

  'fd-rd-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#d97706"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">BANK FD &amp; RD INTEREST</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Deposit: ₹ 1,00,000 • 7.1% p.a. • 3 Years</text>
      <rect x="35" y="58" width="170" height="36" rx="4" fill="#fef3c7"/>
      <text x="120" y="74" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#92400e" text-anchor="middle">Maturity: ₹ 1,23,508</text>
      <text x="120" y="87" font-family="Arial, sans-serif" font-size="7.5" fill="#b45309" text-anchor="middle">Quarterly Compounding • Senior Citizen: 7.6%</text>
      <rect x="35" y="100" width="170" height="20" rx="3" fill="#b45309"/>
      <text x="120" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">SBI, PNB &amp; POST OFFICE FD RATES</text>
    </svg>
  `),

  'currency-note-counter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#15803d"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">CASH DRAWER NOTE TALLY</text>
      <text x="35" y="48" font-family="monospace" font-size="8.5" fill="#1e293b">₹500 × 24 = ₹12,000</text>
      <text x="135" y="48" font-family="monospace" font-size="8.5" fill="#1e293b">₹200 × 15 = ₹3,000</text>
      <text x="35" y="62" font-family="monospace" font-size="8.5" fill="#1e293b">₹100 × 42 = ₹4,200</text>
      <text x="135" y="62" font-family="monospace" font-size="8.5" fill="#1e293b">₹50 × 20 = ₹1,000</text>
      <rect x="35" y="70" width="170" height="34" rx="4" fill="#14532d"/>
      <text x="120" y="87" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">TOTAL: ₹ 20,200.00</text>
      <text x="120" y="99" font-family="Arial, sans-serif" font-size="7.5" fill="#86efac" text-anchor="middle">Total 101 Notes • Zero Shortage</text>
      <rect x="35" y="108" width="170" height="16" rx="2" fill="#16a34a"/>
      <text x="120" y="119" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">PRINT END-OF-DAY CASH SHEET</text>
    </svg>
  `),

  'salary-hra-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#6366f1" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#4f46e5"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SALARY &amp; HRA EXEMPTION</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8" fill="#334155">Basic: ₹ 35,000 • HRA: ₹ 14,000 • Rent: ₹ 16,000</text>
      <rect x="35" y="58" width="170" height="36" rx="4" fill="#e0e7ff"/>
      <text x="120" y="74" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#312e81" text-anchor="middle">Tax-Exempt HRA: ₹ 12,500 / Mo</text>
      <text x="120" y="87" font-family="Arial, sans-serif" font-size="7.5" fill="#4338ca" text-anchor="middle">Annual Tax Savings: ₹ 45,000 (Section 10(13A))</text>
      <rect x="35" y="100" width="170" height="20" rx="3" fill="#4338ca"/>
      <text x="120" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">MONTHLY SALARY SLIP BREAKUP</text>
    </svg>
  `),

  'simple-compound-interest': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#0891b2" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#0891b2"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">SIMPLE VS COMPOUND INTEREST</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Principal: ₹ 50,000 • 10% • 3 Years</text>
      <rect x="35" y="58" width="80" height="38" rx="3" fill="#cffafe"/>
      <text x="75" y="72" font-family="Arial, sans-serif" font-size="7.5" fill="#155e75" text-anchor="middle">Simple Interest</text>
      <text x="75" y="88" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0891b2" text-anchor="middle">₹ 15,000</text>
      <rect x="125" y="58" width="80" height="38" rx="3" fill="#cffafe"/>
      <text x="165" y="72" font-family="Arial, sans-serif" font-size="7.5" fill="#155e75" text-anchor="middle">Compound Int</text>
      <text x="165" y="88" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0e7490" text-anchor="middle">₹ 16,550</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#0e7490"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">VILLAGE CREDIT &amp; FINANCE CALCULATOR</text>
    </svg>
  `),

  'income-tax-slab-calculator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#1e40af"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">NEW VS OLD TAX REGIME (FY 24-25)</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Annual Income: ₹ 7,50,000</text>
      <rect x="35" y="58" width="80" height="38" rx="3" fill="#dcfce7" stroke="#86efac"/>
      <text x="75" y="72" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d" text-anchor="middle">NEW REGIME</text>
      <text x="75" y="88" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#14532d" text-anchor="middle">₹ 0 (REBATE)</text>
      <rect x="125" y="58" width="80" height="38" rx="3" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="165" y="72" font-family="Arial, sans-serif" font-size="7.5" fill="#991b1b" text-anchor="middle">OLD REGIME</text>
      <text x="165" y="88" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#7f1d1d" text-anchor="middle">₹ 33,800</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#1e40af"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SAVE MAXIMUM TAX WITH 87A REBATE</text>
    </svg>
  `),

  'land-area-converter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#15803d"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">LAND AREA (BHUMI NIKAL)</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8.5" fill="#0f172a" font-weight="bold">Input: 1 Acre (43,560 Sq.Ft)</text>
      <rect x="35" y="58" width="170" height="38" rx="3" fill="#dcfce7"/>
      <text x="45" y="72" font-family="Arial, sans-serif" font-size="8" fill="#14532d">• 1.6 Bigha (UP/Bihar Standard)  •  32 Kattha</text>
      <text x="45" y="86" font-family="Arial, sans-serif" font-size="8" fill="#14532d">• 4,840 Gaj (Square Yards)  •  0.404 Hectare</text>
      <rect x="35" y="102" width="170" height="18" rx="3" fill="#166534"/>
      <text x="120" y="114" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">KHASRA &amp; KHATAUNI REVENUE MEASUREMENTS</text>
    </svg>
  `),

  'unit-converter-utilities': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#334155"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">UNIVERSAL UNIT CONVERTER</text>
      <rect x="35" y="46" width="78" height="26" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="74" y="58" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">1 Inch = 2.54 cm</text>
      <rect x="125" y="46" width="78" height="26" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="164" y="58" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">1 GB = 1024 MB</text>
      <rect x="35" y="78" width="78" height="26" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="74" y="90" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">1 KG = 2.204 Lbs</text>
      <rect x="125" y="78" width="78" height="26" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="164" y="90" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">1 Sq.M = 10.76 Sq.Ft</text>
      <rect x="35" y="110" width="170" height="14" rx="2" fill="#0f172a"/>
      <text x="120" y="120" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">LENGTH • WEIGHT • AREA • DIGITAL DATA</text>
    </svg>
  `),

  'typing-speed-test': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#0f172a"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="120" y="32" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#38bdf8" text-anchor="middle">TYPING SPEED TEST (ENG / HINDI)</text>
      <circle cx="75" cy="72" r="24" fill="#0f172a" stroke="#22c55e" stroke-width="3"/>
      <text x="75" y="72" font-family="monospace" font-size="16" font-weight="bold" fill="#22c55e" text-anchor="middle">48</text>
      <text x="75" y="84" font-family="Arial, sans-serif" font-size="7" fill="#86efac" text-anchor="middle">WPM</text>
      <circle cx="165" cy="72" r="24" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <text x="165" y="72" font-family="monospace" font-size="16" font-weight="bold" fill="#38bdf8" text-anchor="middle">98%</text>
      <text x="165" y="84" font-family="Arial, sans-serif" font-size="7" fill="#bae6fd" text-anchor="middle">ACCURACY</text>
      <rect x="35" y="106" width="170" height="16" rx="2" fill="#0284c7"/>
      <text x="120" y="117" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">GOVT COURT &amp; SSC CLERK EXAM PRACTICE</text>
    </svg>
  `),

  // --- WhatsApp & QR Tools ---
  'whatsapp-direct-chat-link': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="30" y="12" width="180" height="116" rx="6" fill="#ffffff" stroke="#22c55e" stroke-width="1.5"/>
      <rect x="30" y="12" width="180" height="26" fill="#15803d"/>
      <text x="120" y="29" font-family="Arial, sans-serif" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">WHATSAPP DIRECT CHAT</text>
      <text x="45" y="54" font-family="Arial, sans-serif" font-size="8.5" fill="#334155">Chat without saving mobile number:</text>
      <rect x="45" y="60" width="150" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="55" y="75" font-family="monospace" font-size="9" fill="#0f172a">+91 98765 43210</text>
      <rect x="45" y="90" width="150" height="28" rx="4" fill="#22c55e"/>
      <text x="120" y="108" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">OPEN WHATSAPP WEB / APP</text>
    </svg>
  `),

  'instant-upi-qr-generator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#eff6ff"/>
      <rect x="30" y="10" width="180" height="120" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <rect x="40" y="22" width="70" height="70" fill="#0f172a"/>
      <!-- QR mock lines -->
      <rect x="44" y="26" width="22" height="22" fill="#ffffff"/>
      <rect x="48" y="30" width="14" height="14" fill="#0f172a"/>
      <rect x="84" y="26" width="22" height="22" fill="#ffffff"/>
      <rect x="88" y="30" width="14" height="14" fill="#0f172a"/>
      <rect x="44" y="66" width="22" height="22" fill="#ffffff"/>
      <rect x="48" y="70" width="14" height="14" fill="#0f172a"/>
      <rect x="74" y="54" width="8" height="8" fill="#ffffff"/>
      <rect x="90" y="70" width="12" height="12" fill="#ffffff"/>
      <!-- Details -->
      <text x="120" y="34" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#1e40af">SCAN &amp; PAY</text>
      <text x="120" y="48" font-family="Arial, sans-serif" font-size="8" fill="#334155">Tanshu Online Center</text>
      <text x="120" y="60" font-family="monospace" font-size="7.5" fill="#64748b">upi@okhdfcbank</text>
      <rect x="120" y="68" width="80" height="22" rx="3" fill="#15803d"/>
      <text x="160" y="82" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">₹ 150.00</text>
      <text x="120" y="118" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">GPay • PhonePe • Paytm • BHIM</text>
    </svg>
  `),

  'shop-wifi-qr-generator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="10" width="170" height="120" rx="6" fill="#ffffff" stroke="#6366f1" stroke-width="1.5"/>
      <rect x="45" y="24" width="60" height="60" fill="#1e1b4b"/>
      <rect x="48" y="27" width="18" height="18" fill="#ffffff"/><rect x="52" y="31" width="10" height="10" fill="#1e1b4b"/>
      <rect x="83" y="27" width="18" height="18" fill="#ffffff"/><rect x="87" y="31" width="10" height="10" fill="#1e1b4b"/>
      <rect x="48" y="63" width="18" height="18" fill="#ffffff"/><rect x="52" y="67" width="10" height="10" fill="#1e1b4b"/>
      <text x="115" y="38" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#4338ca">GUEST WI-FI</text>
      <text x="115" y="52" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b">SSID: Cyber_Guest_5G</text>
      <text x="115" y="66" font-family="Arial, sans-serif" font-size="7.5" fill="#16a34a">No password needed</text>
      <rect x="45" y="96" width="150" height="24" rx="4" fill="#4338ca"/>
      <text x="120" y="112" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">INSTANT SCAN &amp; CONNECT QR</text>
    </svg>
  `),

  'whatsapp-bulk-message-formatter': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#15803d"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">BULK UPDATE BROADCAST</text>
      <rect x="35" y="44" width="170" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="42" y="58" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0f172a">*Dear Customer*</text>
      <text x="42" y="70" font-family="Arial, sans-serif" font-size="7.5" fill="#334155">Your PVC Ayushman Card is ready for collection.</text>
      <text x="42" y="82" font-family="Arial, sans-serif" font-size="7.5" fill="#16a34a">Timing: Today until 8:00 PM</text>
      <rect x="35" y="100" width="170" height="20" rx="3" fill="#15803d"/>
      <text x="120" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">FORMAT *BOLD*, _ITALIC_ &amp; BULLETS</text>
    </svg>
  `),

  'vcard-contact-qr-generator': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="35" y="10" width="170" height="120" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect x="45" y="22" width="60" height="60" fill="#0f172a"/>
      <rect x="48" y="25" width="18" height="18" fill="#ffffff"/><rect x="52" y="29" width="10" height="10" fill="#0f172a"/>
      <rect x="83" y="25" width="18" height="18" fill="#ffffff"/><rect x="87" y="29" width="10" height="10" fill="#0f172a"/>
      <rect x="48" y="61" width="18" height="18" fill="#ffffff"/><rect x="52" y="65" width="10" height="10" fill="#0f172a"/>
      <text x="115" y="34" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f172a">DIGITAL VCARD</text>
      <text x="115" y="48" font-family="Arial, sans-serif" font-size="7.5" fill="#334155">Tanshu Online Center</text>
      <text x="115" y="60" font-family="Arial, sans-serif" font-size="7.5" fill="#64748b">+91 98765 43210</text>
      <rect x="45" y="94" width="150" height="26" rx="4" fill="#0f172a"/>
      <text x="120" y="110" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SAVE CONTACT IN 1 SCAN</text>
    </svg>
  `),

  'website-url-doc-link-qr': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#eff6ff"/>
      <rect x="35" y="10" width="170" height="120" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.5"/>
      <rect x="45" y="22" width="60" height="60" fill="#1e3a8a"/>
      <rect x="48" y="25" width="18" height="18" fill="#ffffff"/><rect x="52" y="29" width="10" height="10" fill="#1e3a8a"/>
      <rect x="83" y="25" width="18" height="18" fill="#ffffff"/><rect x="87" y="29" width="10" height="10" fill="#1e3a8a"/>
      <rect x="48" y="61" width="18" height="18" fill="#ffffff"/><rect x="52" y="65" width="10" height="10" fill="#1e3a8a"/>
      <text x="115" y="34" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8">PORTAL LINK</text>
      <text x="115" y="48" font-family="Arial, sans-serif" font-size="7.5" fill="#334155">Direct Govt Circular</text>
      <text x="115" y="60" font-family="monospace" font-size="7" fill="#64748b">https://gov.in/...pdf</text>
      <rect x="45" y="94" width="150" height="26" rx="4" fill="#1d4ed8"/>
      <text x="120" y="110" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">PRINTABLE HIGH-RES URL QR</text>
    </svg>
  `),

  'whatsapp-document-print-helper': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f0fdf4"/>
      <rect x="25" y="12" width="190" height="116" rx="6" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/>
      <rect x="25" y="12" width="190" height="24" rx="6" fill="#15803d"/>
      <text x="120" y="28" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">WHATSAPP DOCUMENT PRINTER</text>
      <text x="35" y="50" font-family="Arial, sans-serif" font-size="8" fill="#334155">Auto-extract attachments &amp; receipts from WhatsApp Web</text>
      <rect x="35" y="58" width="170" height="36" rx="4" fill="#dcfce7"/>
      <text x="45" y="72" font-family="Arial, sans-serif" font-size="8" fill="#14532d">• Remove blur &amp; JPEG compression</text>
      <text x="45" y="85" font-family="Arial, sans-serif" font-size="8" fill="#14532d">• Auto-fit to A4 / 4×6 photo paper</text>
      <rect x="35" y="100" width="170" height="20" rx="3" fill="#166534"/>
      <text x="120" y="113" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">DIRECT SPOOL TO EPSON &amp; CANON</text>
    </svg>
  `),

  'qr-code-scanner-decoder': svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f8fafc"/>
      <rect x="30" y="12" width="180" height="116" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.5"/>
      <rect x="42" y="22" width="56" height="56" fill="#0f172a"/>
      <line x1="38" y1="50" x2="102" y2="50" stroke="#ef4444" stroke-width="2"/>
      <text x="110" y="34" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f172a">DECODED DATA</text>
      <text x="110" y="48" font-family="monospace" font-size="7.5" fill="#15803d">Name: RAMESH YADAV</text>
      <text x="110" y="60" font-family="monospace" font-size="7.5" fill="#1e40af">PAN: ABCPY1234F</text>
      <text x="110" y="72" font-family="monospace" font-size="7" fill="#64748b">Verified Govt Signature ✓</text>
      <rect x="42" y="88" width="156" height="28" rx="4" fill="#0f172a"/>
      <text x="120" y="105" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">SCAN AADHAAR, PAN &amp; BILL QR</text>
    </svg>
  `),
};

// Fallback preview generator for any unspecified tool
function generateFallbackSvg(toolName: string, categoryLabel: string): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
      <rect width="240" height="140" fill="#f1f5f9"/>
      <rect x="25" y="15" width="190" height="110" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
      <rect x="25" y="15" width="190" height="26" rx="6" fill="#1e293b"/>
      <text x="120" y="32" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${categoryLabel.toUpperCase()}</text>
      <circle cx="120" cy="65" r="16" fill="#e2e8f0" stroke="#94a3b8"/>
      <path d="M112 65h16M120 57v16" stroke="#2563eb" stroke-width="2"/>
      <text x="120" y="98" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">${toolName.slice(0, 24)}</text>
      <text x="120" y="112" font-family="Arial, sans-serif" font-size="7.5" fill="#16a34a" text-anchor="middle">Verified Client-Side Tool</text>
    </svg>
  `);
}

// Main image getter function
export function getToolPreviewImage(toolId: string, toolName?: string, categoryLabel?: string): string {
  switch (toolId) {
    case 'passport-size-photo-maker':
      return passportImg;
    case 'auto-document-cropper':
      return autoCropperImg;
    case 'document-scanner-image-rectifier':
      return scannerImg;
    case 'pdf-to-pvc-card-auto-cropper':
      return pvcCropperImg;
    case 'id-card-front-back-print-layout-maker':
      return idLayoutImg;
    case 'invoice-generator':
      return invoiceImg;
    case 'new-ration-card':
      return rationCardImg;
    case 'perspective-correction-tool':
      return perspectiveImg;
    case 'ai-selfie-passport-photo-maker':
      return selfiePassportImg;
    case 'whatsapp-photo-print-alignment':
      return whatsappPrintImg;
    case 'ai-face-cleaner':
      return faceCleanerImg;
    case 'watermark-remover':
      return watermarkRemoverImg;
    case 'govt-id-card-print':
      return govtIdPrintImg;
    case 'pvc-cover-print':
      return pvcCoverImg;
    case 'pincode-finder':
      return pincodeFinderImg;
    case 'multiple-id-cards-print':
      return multipleIdImg;
    case 'affidavit-print-maker':
      return affidavitMakerImg;
    case 'pdf-page-organizer':
      return pdfOrganizerImg;
    default:
      if (SVG_PREVIEWS[toolId]) {
        return SVG_PREVIEWS[toolId];
      }
      return generateFallbackSvg(toolName || 'Tanshu Utility', categoryLabel || 'Digital Seva');
  }
}
