/**
 * Shared Digital Seva validation rules.
 * Keep these rules usable by both the browser form and the Pages Function.
 */
export type ValidationKind = 'name' | 'mobile' | 'email' | 'address' | 'pin' | 'date' | 'number' | 'url' | 'text';

export function normalizeIndianMobile(value: unknown): string {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isValidName(value: unknown): boolean {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (text.length < 2 || text.length > 80) return false;
  // Unicode letters/marks allow Hindi and other Indian scripts as well as English.
  if (!/^[\p{L}\p{M}]+(?:[ .’'-][\p{L}\p{M}]+)*$/u.test(text)) return false;
  const letters = Array.from(text.replace(/[ .’'-]/g, ''));
  if (letters.length < 2) return false;
  // Catch obvious repeated-character filler without rejecting ordinary names.
  if (/(.)\1{3,}/u.test(letters.join(''))) return false;
  return true;
}

export function isValidMobile(value: unknown): boolean {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
}

export function isValidEmail(value: unknown): boolean {
  const text = String(value ?? '').trim();
  return text.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
}

export function isValidAddress(value: unknown): boolean {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (text.length < 5 || text.length > 500) return false;
  if (!/[\p{L}]/u.test(text)) return false;
  if (/^(.)\1{4,}$/u.test(text.replace(/\s/g, ''))) return false;
  return true;
}

export function isValidPin(value: unknown): boolean {
  return /^[1-9]\d{5}$/.test(String(value ?? '').trim());
}

export function isValidDate(value: unknown): boolean {
  const text = String(value ?? '').trim();
  let year = 0, month = 0, day = 0;
  const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (local) { day = Number(local[1]); month = Number(local[2]); year = Number(local[3]); }
  else {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!iso) return false;
    year = Number(iso[1]); month = Number(iso[2]); day = Number(iso[3]);
  }
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
  const today = new Date(); today.setHours(23, 59, 59, 999);
  return date <= today;
}
export function validateByKind(kind: ValidationKind, value: unknown): string | null {
  const text = String(value ?? '').trim();
  if (!text) return null;
  switch (kind) {
    case 'name': return isValidName(text) ? null : 'नाम में हिंदी/अंग्रेज़ी अक्षर और उचित स्पेस/चिह्न लिखें।';
    case 'mobile': return isValidMobile(text) ? null : '10 अंकों का सही भारतीय मोबाइल नंबर लिखें।';
    case 'email': return isValidEmail(text) ? null : 'सही ईमेल आईडी लिखें।';
    case 'address': return isValidAddress(text) ? null : 'पूरा पता कम-से-कम 5 अक्षरों में लिखें।';
    case 'pin': return isValidPin(text) ? null : 'सही 6 अंकों का PIN कोड लिखें।';
    case 'date': return isValidDate(text) ? null : 'सही तारीख DD/MM/YYYY प्रारूप में लिखें। भविष्य की तारीख स्वीकार नहीं है।';
    case 'number': return /^\d+(?:\.\d{1,2})?$/.test(text) ? null : 'केवल सही संख्या लिखें।';
    case 'url': try { const url = new URL(text); return ['http:', 'https:'].includes(url.protocol) ? null : 'सही वेबसाइट लिंक लिखें।'; } catch { return 'सही वेबसाइट लिंक लिखें।'; }
    default: return text.length <= 1000 ? null : 'यह विवरण बहुत लंबा है।';
  }
}

export function validationKindForField(key: string): ValidationKind {
  const k = key.toLowerCase();
  if (k === 'familymembernames') return 'text';
  if (/(name|applicant|father|mother|relative|ancestor|hof|membername|recordedname)/.test(k)) return 'name';
  if (/(mobile|phone)/.test(k)) return 'mobile';
  if (/(email)/.test(k)) return 'email';
  if (/(pin)$/.test(k) || /pincode/.test(k)) return 'pin';
  if (/(dob|date|issuedate)/.test(k)) return 'date';
  if (/(address)$/.test(k) || k === 'centeraddress' || k === 'agencyaddress') return 'address';
  if (/(amount|count|copies)$/.test(k)) return 'number';
  if (/(link|url)$/.test(k)) return 'url';
  return 'text';
}

export function getRequiredServiceFieldKeys(serviceId: string, options: Record<string, unknown> = {}): string[] {
  const required: Record<string, string[]> = {
    'pan-new': ['panApplicantName', 'panDob', 'panAddress'],
    'aadhaar-mobile': ['newMobile'],
    'aadhaar-email': ['newEmail'],
    'certificate-income': ['incomeFatherName', 'certificateDistrict', 'certificateSubdivision', 'certificateBlock', 'certificateVillage', 'certificatePin', 'level'],
    'certificate-caste': ['casteFatherName', 'casteCategory', 'casteName', 'certificateDistrict', 'certificateSubdivision', 'certificateBlock', 'certificateVillage', 'certificatePin', 'level'],
    'certificate-residence': ['certificatePurpose', 'residenceDistrict', 'residenceSubdivision', 'residenceBlock', 'residenceVillageWard', 'residencePin', 'level', 'residenceType'],
    'voter-new': ['voterDob', 'voterAddress', 'voterRelativeName'],
    'ration-new': ['familyMemberCount', 'familyMemberNames', 'rationDistrict', 'rationBlock', 'rationVillageWard', 'rationPin'],
    'aadhaar-address-doc': ['docRelation', 'docRelationName'],
    'aadhaar-address-hof': ['hofRelation', 'hofName', 'aadhaarHouse', 'aadhaarVillage', 'aadhaarDistrict', 'aadhaarState', 'aadhaarPin', 'aadhaarArea'],
    'aadhaar-co': ['coRelation', 'requestedCo'],
    'certificate-correction': ['certificateNumber', 'issuingOffice', 'issueDate'],
    'scheme-check': ['schemeName'],
    'online-form': ['formName'],
    'website-services': ['websiteScope'],
    'ration-update': ['rationAction']
  };
  const fields = [...(required[serviceId] || [])];
  if (serviceId === 'aadhaar-address-doc') {
    fields.push('addressChoice');
    if (options.addressChoice === 'NEW') fields.push('aadhaarHouse', 'aadhaarVillage', 'aadhaarDistrict', 'aadhaarState', 'aadhaarPin', 'aadhaarArea');
  }
  if (serviceId === 'ration-update' && ['ADD_MEMBER', 'REMOVE_MEMBER', 'CORRECT_MEMBER', 'ADDRESS'].includes(String(options.rationAction))) fields.push('memberName');
  if (serviceId === 'ration-update' && options.rationAction === 'ADD_MEMBER') fields.push('memberRelation');
  return fields;
}

export function validateServiceFieldValue(key: string, value: unknown): string | null {
  return validateByKind(validationKindForField(key), value);
}

export function getRequiredCorrectionFieldKeys(corrections: string[]): string[] {
  const textCorrections = new Set(['name', 'father-name', 'mother-name', 'date-of-birth', 'gender', 'address', 'care-of', 'relation-type', 'relation-name', 'mobile', 'category', 'other', 'add-member', 'remove-member', 'member-correction', 'head-change']);
  return corrections.filter((id) => textCorrections.has(id)).flatMap((id) => [`${id}-current`, `${id}-correct`]);
}

export function isMeaningfulDescription(value: unknown): boolean {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ');
  if (text.length < 10 || !/[\p{L}]{3,}/u.test(text)) return false;
  if (/(.)\1{4,}/u.test(text.replace(/\s/g, ''))) return false;
  const words = text.split(' ').filter((word) => word.length >= 2);
  return words.length >= 2 || /\d/.test(text);
}



/** Convert English words in names/addresses to readable Title Case; preserve Indian scripts and known acronyms. */
export function formatEnglishTitleCase(value: unknown): string {
  const acronyms = new Set(['PIN', 'PAN', 'UIDAI', 'CSC', 'PSU', 'SDO', 'DM', 'CO', 'C/O', 'PO']);
  return String(value ?? '').replace(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)?/gu, (word) => {
    if (!/[A-Za-z]/.test(word) || acronyms.has(word.toUpperCase())) return word;
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

export function containsForbiddenAadhaarAddressInstruction(value: unknown): boolean {
  const normalized = String(value ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu, '');
  return [
    'yeaddnahihonachahiyekahibhii',
    'yeaddnahihonachahiyekahibhi',
    'addnahihonachahiye',
    'addnow'
  ].some((phrase) => normalized.includes(phrase));
}

export function validateFieldByKey(key: string, value: unknown): string | null {
  const text = String(value ?? '').trim();
  if (!text) return null;
  const field = key.toLowerCase();
  if (field === 'pagerange') return /^\d+(?:\s*[-,]\s*\d+)*$/.test(text) ? null : 'पेज नंबर / रेंज सही लिखें, जैसे 1-3 या 1,3,5।';
  if (field === 'targetsize') return /^\d+(?:\.\d+)?\s*(?:kb|mb|px|cm|mm|in|inch)?(?:\s*[x×]\s*\d+(?:\.\d+)?\s*(?:px|cm|mm|in|inch)?)?$/i.test(text) ? null : 'लक्ष्य साइज सही लिखें, जैसे 50 KB या 3x4 inch।';
  if (field === 'familymembernames') {
    const names = text.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
    return names.length && names.every(isValidName) ? null : 'हर परिवार सदस्य का सही नाम अलग-अलग पंक्ति में लिखें।';
  }
  if (/^income(government|agriculture|business|other|amount)$/.test(field)) {
    return /^(?:₹\s*)?\d[\d,]*(?:\.\d{1,2})?$|^(?:nil|none|n\/a)$/i.test(text) ? null : 'आय की राशि सही अंकों में लिखें।';
  }
  return validateByKind(validationKindForField(key), text);
}
