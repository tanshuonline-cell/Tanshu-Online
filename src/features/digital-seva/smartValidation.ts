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
  let match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (match) [, day, month, year] = match.map((part, index) => index === 0 ? part : Number(part)) as any;
  else {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!iso) return false;
    year = Number(iso[1]); month = Number(iso[2]); day = Number(iso[3]);
  }
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
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
  if (/(name|applicant|father|mother|relative|ancestor|hof|membername|recordedname)/.test(k)) return 'name';
  if (/(mobile|phone)/.test(k)) return 'mobile';
  if (/(email)/.test(k)) return 'email';
  if (/(pin)$/.test(k) || /pincode/.test(k)) return 'pin';
  if (/(dob|date|issuedate)/.test(k)) return 'date';
  if (/(address|village|mohalla|postoffice|policestation|subdivision|district|block|localbody)/.test(k)) return 'address';
  if (/(amount|count|copies)$/.test(k)) return 'number';
  if (/(link|url)$/.test(k)) return 'url';
  return 'text';
}
