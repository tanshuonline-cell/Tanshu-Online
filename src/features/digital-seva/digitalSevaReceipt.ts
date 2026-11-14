export interface DigitalSevaReceiptView {
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceName: string;
  status: string;
  estimatedCompletionAt?: string | null;
  contactConsentAt?: string | null;
  submittedAt?: string | null;
  termsAcceptedAt?: string | null;
  termsPolicyVersion?: string | null;
  refundPolicyAcceptedAt?: string | null;
  refundPolicyVersion?: string | null;
  fieldValues?: Record<string, unknown>;
  serviceOptions?: Record<string, unknown>;
  selectedWork?: string[];
  documents?: string[];
  customerInstructions?: string;
  paymentReference?: string | null;
  feeBreakdown?: { governmentFee: number; tanshuFee: number; totalAmount: number; estimatedCustomerTotal?: number; paymentStatus: string } | null;
}

const ENGLISH_LABELS: Record<string, string> = {
  docRelationName: "Father's name", aadhaarNumber: 'Aadhaar number', hofAadhaarNumber: 'Head of Family Aadhaar number',
  existingPanNumber: 'Existing PAN number', panApplicantName: 'Applicant name', panFatherName: "Father's name",
  panMotherName: "Mother's name", panDob: 'Date of birth', panParentPrint: 'Parent name to print',
  aadhaarHouse: 'House / Building / Apartment', aadhaarStreet: 'Street / Road / Lane',
  aadhaarArea: 'Area / Locality / Mohalla', aadhaarLandmark: 'Landmark', aadhaarVillage: 'Village / Town / City',
  aadhaarBlock: 'Block', aadhaarSubdivision: 'Sub-division', aadhaarDistrict: 'District',
  aadhaarPoliceStation: 'Police Station', aadhaarPostOffice: 'Post Office', aadhaarState: 'State',
  aadhaarPin: 'PIN Code', hofName: 'Head of Family name', hofRelation: 'Relationship to Head of Family',
  newMobile: 'New mobile number', newEmail: 'New email address', voterDob: 'Date of birth',
  voterAddress: 'Address', voterRelativeName: "Relative's name", certificateDistrict: 'District',
  certificateSubdivision: 'Sub-division', certificateBlock: 'Block', certificateVillage: 'Village / Mohalla',
  certificatePin: 'PIN Code', otherDocumentName: 'Other document name', addressChoice: 'Address choice'
};

const HINDI_LABELS: Record<string, string> = {
  docRelationName: 'पिता का नाम', aadhaarNumber: 'आधार नंबर', hofAadhaarNumber: 'मुखिया का आधार नंबर',
  existingPanNumber: 'मौजूदा PAN नंबर', panApplicantName: 'आवेदक का नाम', panFatherName: 'पिता का नाम',
  panMotherName: 'माता का नाम', panDob: 'जन्म तिथि', panParentPrint: 'प्रिंट होने वाला अभिभावक का नाम',
  aadhaarHouse: 'मकान / भवन / अपार्टमेंट', aadhaarStreet: 'गली / सड़क / लेन',
  aadhaarArea: 'क्षेत्र / मोहल्ला', aadhaarLandmark: 'पहचान की जगह', aadhaarVillage: 'गाँव / कस्बा / शहर',
  aadhaarBlock: 'प्रखंड / ब्लॉक', aadhaarSubdivision: 'अनुमंडल', aadhaarDistrict: 'जिला',
  aadhaarPoliceStation: 'थाना', aadhaarPostOffice: 'डाकघर', aadhaarState: 'राज्य',
  aadhaarPin: 'पिन कोड', hofName: 'परिवार के मुखिया का नाम', hofRelation: 'मुखिया से संबंध',
  newMobile: 'नया मोबाइल नंबर', newEmail: 'नया ईमेल', voterDob: 'जन्म तिथि',
  voterAddress: 'पता', voterRelativeName: 'रिश्तेदार का नाम', certificateDistrict: 'जिला',
  certificateSubdivision: 'अनुमंडल', certificateBlock: 'प्रखंड', certificateVillage: 'गाँव / मोहल्ला',
  certificatePin: 'पिन कोड', otherDocumentName: 'अन्य दस्तावेज़ का नाम', addressChoice: 'चुना गया पता'
};

const ADDRESS_ORDER = [
  'aadhaarHouse', 'aadhaarStreet', 'aadhaarArea', 'aadhaarLandmark', 'aadhaarVillage',
  'aadhaarBlock', 'aadhaarSubdivision', 'aadhaarDistrict', 'aadhaarPoliceStation',
  'aadhaarPostOffice', 'aadhaarState', 'aadhaarPin'
];

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char] || char));
}

function humanize(key: string): string {
  return ENGLISH_LABELS[key] || key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function maskValue(key: string, value: unknown): string {
  const text = String(value ?? '').trim();
  const digits = text.replace(/\D/g, '');
  if (/aadhaar|uid/i.test(key)) return digits.length >= 4 ? `XXXX XXXX ${digits.slice(-4)}` : (text.startsWith('enc:v1:') ? 'Protected' : text);
  if (/pan(number|no)?$/i.test(key) || /existingpan/i.test(key)) return text.length >= 4 ? `XXXXXX${text.slice(-4)}` : text;
  if (/mobile|phone/i.test(key)) return digits.length >= 4 ? `${digits.slice(0, 2)}XXXXXX${digits.slice(-2)}` : text;
  return text.startsWith('enc:v1:') ? 'Protected' : text;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Not recorded / दर्ज नहीं';
  const normalized = value.endsWith('Z') ? value : `${value.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short'
  });
}

function detailCard(key: string, values: Record<string, unknown>): string {
  const hindiKey = `${key}Hindi`;
  const english = String(values[key] ?? '').trim();
  const hindi = String(values[hindiKey] ?? '').trim();
  const labelEn = humanize(key);
  const labelHi = HINDI_LABELS[key];
  const valueParts = [
    english ? `<div><small>EN</small><b>${escapeHtml(maskValue(key, english))}</b></div>` : '',
    hindi ? `<div><small>हिंदी</small><b>${escapeHtml(hindi)}</b></div>` : ''
  ].filter(Boolean).join('');
  return `<article class="detail-item"><div class="detail-label"><b>${escapeHtml(labelEn)}</b>${labelHi ? `<small>${escapeHtml(labelHi)}</small>` : ''}</div><div class="detail-values">${valueParts || '<b>—</b>'}</div></article>`;
}

export function buildDigitalSevaReceiptHtml(data: DigitalSevaReceiptView): string {
  const values = { ...(data.fieldValues || {}), ...(data.serviceOptions || {}) };
  const keys = Array.from(new Set(Object.keys(values).map((key) => key.endsWith('Hindi') ? key.slice(0, -5) : key)))
    .filter((key) => String(values[key] ?? '').trim() || String(values[`${key}Hindi`] ?? '').trim());
  keys.sort((a, b) => {
    const ai = ADDRESS_ORDER.indexOf(a), bi = ADDRESS_ORDER.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
  const detailHtml = keys.map((key) => detailCard(key, values)).join('');
  const workHtml = data.selectedWork?.length
    ? `<section class="compact-section"><h2>Selected Work / चुना गया कार्य</h2><p>${data.selectedWork.map(escapeHtml).join(' · ')}</p></section>` : '';
  const docsHtml = data.documents?.length
    ? `<section class="compact-section"><h2>Documents Submitted / जमा दस्तावेज़</h2><p>${data.documents.map(escapeHtml).join(' · ')}</p></section>` : '';
  const instructionsHtml = data.customerInstructions?.trim()
    ? `<section class="compact-section"><h2>Customer Instructions / ग्राहक के निर्देश</h2><p class="preserve">${escapeHtml(data.customerInstructions)}</p></section>` : '';
  const feeHtml = data.feeBreakdown
    ? `<section><h2>03. Fee &amp; Payment Details / शुल्क और भुगतान विवरण</h2><div class="fee-grid">
      <div class="fee-item"><small>Government / Provider Fee (included in Cashfree; TANSHU ONLINE deposits it) · सरकारी शुल्क (Cashfree में शामिल; TANSHU जमा करेगा)</small><b>₹${escapeHtml(data.feeBreakdown.governmentFee)}</b></div>
      <div class="fee-item"><small>TANSHU ONLINE Service Fee · सेवा शुल्क</small><b>₹${escapeHtml(data.feeBreakdown.tanshuFee)}</b></div>
      <div class="fee-item fee-total"><small>Cashfree Payment to TANSHU ONLINE · Cashfree भुगतान</small><b>₹${escapeHtml(data.feeBreakdown.totalAmount)}</b></div>
      <p class="fee-note">A zero or blank fixed official-fee amount does not mean every authority service is free. Any applicable fee not included above must be checked on the selected official portal and paid directly to that authority; keep its receipt. / सरकारी शुल्क की राशि शून्य या खाली होने का अर्थ यह नहीं कि हर विभागीय सेवा निःशुल्क है। लागू अतिरिक्त शुल्क संबंधित आधिकारिक पोर्टल पर जाँचकर सीधे जमा करें और उसकी रसीद रखें।</p>
      <div class="fee-item"><small>Payment Status · भुगतान स्थिति</small><b>${escapeHtml(data.feeBreakdown.paymentStatus)}</b></div>${data.paymentReference ? `<div class="fee-item"><small>Cashfree Order Reference · भुगतान संदर्भ</small><b>${escapeHtml(data.paymentReference)}</b></div>` : ''}
    </div></section>` : null;
  const mobileDigits = String(data.customerPhone || '').replace(/\D/g, '');
  const mobile = mobileDigits.length >= 4 ? `${mobileDigits.slice(0, 2)}XXXXXX${mobileDigits.slice(-2)}` : '—';
  const audit = [
    ['Contact Consent / संपर्क सहमति', formatDate(data.contactConsentAt)],
    ['Terms & Conditions / नियम एवं शर्तें', `${data.termsAcceptedAt ? 'Accepted / स्वीकार किया' : 'Not recorded / दर्ज नहीं'} · ${formatDate(data.termsAcceptedAt)} · ${data.termsPolicyVersion || 'Version not recorded'}`],
    ['Refund Policy / रिफंड नीति', `${data.refundPolicyAcceptedAt ? 'Accepted / स्वीकार किया' : 'Not recorded / दर्ज नहीं'} · ${formatDate(data.refundPolicyAcceptedAt)} · ${data.refundPolicyVersion || 'Version not recorded'}`],
    ['Application Submitted / आवेदन जमा', formatDate(data.submittedAt)]
  ];
  const auditHtml = audit.map(([label, value]) => `<div class="audit-item"><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`).join('');
  const estimate = data.estimatedCompletionAt
    ? formatDate(data.estimatedCompletionAt)
    : 'Not recorded / अभी तय नहीं';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(data.bookingReference)} - TANSHU ONLINE</title><style>
    *{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#202124;font-family:"Noto Sans Devanagari","Nirmala UI",Mangal,Arial,sans-serif;font-size:9px;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .sheet{width:100%;max-width:190mm;margin:0 auto;padding:0}.brand{text-align:center;border-bottom:2px solid #a51f32;padding:0 0 5px}.brand h1{margin:0;color:#a51f32;font-size:19px;letter-spacing:1.2px;line-height:1.2}.brand p{margin:2px 0 0;color:#555;font-size:8px;letter-spacing:.35px}
    .heading{text-align:center;margin:7px 0 6px}.heading h2{margin:0;font-size:12px;letter-spacing:.25px}.heading p{margin:2px 0 0;color:#555;font-size:9px}
    .ref{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 7px;margin-bottom:6px;background:#fff7f7;border:1px solid #eadada}.ref b{color:#a51f32;font-size:10px;letter-spacing:.25px}
    section{margin-top:6px;break-inside:auto}.section-title,section h2{margin:0 0 4px;padding:4px 6px;background:#f8eeee;border-left:3px solid #a51f32;color:#84202e;font-size:9px;line-height:1.25}
    .customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}.customer-cell{border:1px solid #e2e2e2;padding:4px 6px;min-width:0;break-inside:avoid}.customer-cell small{display:block;color:#686868;font-size:7px;font-weight:700;margin-bottom:1px}.customer-cell b{font-size:9px;overflow-wrap:anywhere}
    .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 5px}.detail-item{display:grid;grid-template-columns:minmax(29%,.9fr) 1.1fr;gap:4px;align-items:start;border:1px solid #e5e5e5;padding:3px 5px;min-width:0;break-inside:avoid}.detail-label{display:grid;gap:1px;min-width:0}.detail-label b{font-size:8px;line-height:1.25}.detail-label small{font-size:7px;color:#696969;line-height:1.2}.detail-values{display:grid;grid-template-columns:1fr 1fr;gap:4px;min-width:0}.detail-values>div{display:grid;gap:1px;min-width:0}.detail-values small{font-size:6px;color:#777;font-weight:700}.detail-values b{font-size:8px;line-height:1.25;overflow-wrap:anywhere;font-weight:650}.detail-values> b{font-size:8px}
    .compact-section p{margin:0;padding:3px 5px;border:1px solid #e5e5e5;line-height:1.35;overflow-wrap:anywhere}.preserve{white-space:pre-wrap}
    .fee-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 5px}.fee-note{grid-column:1/-1;margin:0;padding:4px 6px;border:1px solid #e5e5e5;color:#555;font-size:7px;line-height:1.35}.fee-item{display:grid;gap:2px;border:1px solid #e2e2e2;padding:5px 6px}.fee-item small{font-size:7px;color:#666;font-weight:700}.fee-item b{font-size:10px}.fee-total{background:#fff7f7;border-color:#e8cfd2}.fee-total b{color:#922331;font-size:12px}.status-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px solid #e3e3e3;padding:4px 6px}.status{display:inline-block;padding:2px 6px;border-radius:10px;background:#e8f4ec;color:#21663b;font-weight:750;font-size:8px}.estimate{font-size:8px}
    .audit-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 5px}.audit-item{display:grid;grid-template-columns:37% 1fr;gap:4px;border:1px solid #e5e5e5;padding:3px 5px;min-width:0;break-inside:avoid}.audit-item b{font-size:7px;line-height:1.25}.audit-item span{font-size:7px;line-height:1.25;overflow-wrap:anywhere}
    .foot{text-align:center;border-top:1px solid #ddd;margin-top:6px;padding-top:4px;color:#555;font-size:7px;line-height:1.35}.actions{display:flex;justify-content:center;margin:9px auto}.actions button{border:0;border-radius:6px;padding:7px 12px;background:#922331;color:#fff;font-weight:700;cursor:pointer}
    @page{size:A4 portrait;margin:7mm}@media print{html,body{width:auto;background:#fff}.sheet{max-width:none;margin:0}.actions{display:none}section{break-inside:auto}.detail-item,.customer-cell,.audit-item{break-inside:avoid}}
    @media screen{body{background:#f2f2f2;padding:12px}.sheet{max-width:190mm;background:#fff;padding:8mm;box-shadow:0 2px 16px #00000012}.actions button{font-size:12px}}
  </style></head><body><main class="sheet"><header class="brand"><h1>TANSHU ONLINE</h1><p>RELIABLE • SECURE • PROFESSIONAL SERVICE</p></header>
    <div class="heading"><h2>DIGITAL SEVA APPLICATION RECEIPT</h2><p>डिजिटल सेवा आवेदन एवं अनुरोध रसीद</p></div>
    <div class="ref"><span>Booking Reference / बुकिंग संदर्भ</span><b>${escapeHtml(data.bookingReference)}</b></div>
    <section><h2>01. Customer Details / ग्राहक की जानकारी</h2><div class="customer-grid">
      <div class="customer-cell"><small>CUSTOMER NAME / ग्राहक का नाम</small><b>${escapeHtml(data.customerName)}</b></div>
      <div class="customer-cell"><small>MOBILE NUMBER / मोबाइल नंबर</small><b>${escapeHtml(mobile)}</b></div>
      <div class="customer-cell"><small>SERVICE / सेवा</small><b>${escapeHtml(data.serviceName)}</b></div>
      <div class="customer-cell"><small>EMAIL / ईमेल</small><b>${escapeHtml(data.customerEmail || '—')}</b></div>
    </div></section>
    <section><h2>02. Application Details / आवेदन का विवरण</h2><div class="detail-grid">${detailHtml || '<div class="detail-item"><b>No additional details recorded / कोई अतिरिक्त विवरण दर्ज नहीं</b></div>'}</div></section>
    ${workHtml}${docsHtml}${instructionsHtml}${feeHtml || ''}
    <section><h2>04. Application Status / आवेदन की स्थिति</h2><div class="status-line"><span class="status">${escapeHtml(data.status.replaceAll('_', ' '))}</span><span class="estimate"><b>Estimated completion / अनुमानित पूरा होने का समय:</b> ${escapeHtml(estimate)}</span></div></section>
    <section><h2>05. Legal Consent &amp; Submission / कानूनी सहमति एवं जमा विवरण</h2><div class="audit-grid">${auditHtml}</div></section>
    <footer class="foot">This is a TANSHU ONLINE service request receipt, not proof that a government application has been filed.<br>यह TANSHU ONLINE की सेवा अनुरोध रसीद है, सरकारी आवेदन जमा होने का प्रमाण नहीं।</footer>
  </main><div class="actions"><button onclick="window.print()">Download / Save as PDF / Print</button></div></body></html>`;
}
