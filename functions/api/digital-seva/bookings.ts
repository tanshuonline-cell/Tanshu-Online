import { normalizeIndianMobile, getRequiredServiceFieldKeys, isValidAddress, isValidEmail, isValidMobile, isValidName, validateByKind, validationKindForField } from '../../../src/features/digital-seva/smartValidation';
// Cloudflare Pages Function: POST /api/digital-seva/bookings
// Stores only a minimal booking request. Customer documents and payments are deliberately out of scope.
interface Env { DIGITAL_SEVA_DB?: any; }

const ALLOWED_SERVICE_IDS = new Set(["pan-new","pan-correction","pan-photo-signature","aadhaar-address-doc","aadhaar-address-hof","aadhaar-co","aadhaar-mobile","aadhaar-email","aadhaar-lost","aadhaar-download","certificate-income","certificate-caste","certificate-residence","certificate-correction","voter-new","voter-correction","ration-new","ration-update","scheme-check","online-form","website-services","pdf-text-edit","pdf-compress","pdf-merge","pdf-split","pdf-jpg","pdf-word","pdf-edit","image-compress","signature-resize","scan-clean","typing-format","aadhaar-pvc-assistance","bw-print","colour-print"]);
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

function normalizePhone(value: unknown): string { return normalizeIndianMobile(value); }

function makeReference(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `DS-${date}-${suffix}`;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Digital Seva booking is not enabled yet. The dedicated Preview database must be connected first.' }, 503);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = attempts.get(ip);
  if (attempts.size > 1000) {
    for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  }
  if (current && current.resetAt > now && current.count >= 5) {
    return json({ success: false, error: 'Too many requests. Please wait a few minutes and try again.' }, 429);
  }
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });

  const rawBody = await request.text();
  if (rawBody.length > 32768) return json({ success: false, error: 'The booking request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  if (!body || body.consent !== true) return json({ success: false, error: 'Please confirm the contact consent to continue.' }, 400);
  const serviceId = String(body.serviceId || '');
  const name = String(body.customerName || '').trim().replace(/\s+/g, ' ');
  const phone = normalizePhone(body.customerPhone);
  const email = body.customerEmail == null ? '' : String(body.customerEmail).trim();
  const requesterType = String(body.requesterType || '');
  const applicationFor = String(body.applicationFor || '');
  const operator = body.operator && typeof body.operator === 'object' ? body.operator : null;
  const operatorName = operator ? String(operator.name || '').trim().replace(/\s+/g, ' ') : '';
  const operatorPhone = operator ? normalizePhone(operator.phone) : '';
  const operatorEmail = operator ? String(operator.email || '').trim() : '';
  const centerName = operator ? String(operator.centerName || '').trim() : '';
  const centerAddress = operator ? String(operator.centerAddress || '').trim() : '';
  const agencyName = operator ? String(operator.agencyName || '').trim() : '';
  const agencyAddress = operator ? String(operator.agencyAddress || '').trim() : '';
  const taskDetails = String(body.taskDetails || '').trim();
  const corrections = Array.isArray(body.corrections) ? body.corrections.filter((x: unknown) => typeof x === 'string').slice(0, 20) : [];
  const selectedDocuments = Array.isArray(body.selectedDocuments) ? body.selectedDocuments.filter((x: unknown) => typeof x === 'string').slice(0, 40) : [];
  const fieldValues = body.fieldValues && typeof body.fieldValues === 'object' && !Array.isArray(body.fieldValues) ? body.fieldValues : {};
  const serviceOptions = body.serviceOptions && typeof body.serviceOptions === 'object' && !Array.isArray(body.serviceOptions) ? body.serviceOptions : {};
  const otherDocumentName = String(body.otherDocumentName || '').trim();
  const applicationDetails = JSON.stringify({ corrections, selectedDocuments, fieldValues, serviceOptions, otherDocumentName, taskDetails });
  const consent = body.consent === true;
  const termsAccepted = body.termsAccepted === true;
  const termsPolicyVersion = String(body.termsPolicyVersion || '');
  const refundPolicyAccepted = body.refundPolicyAccepted === true;
  const refundPolicyVersion = String(body.refundPolicyVersion || '');
  const key = String(body.idempotencyKey || '');
  if (!ALLOWED_SERVICE_IDS.has(serviceId)) return json({ success: false, error: 'Please select a valid service.' }, 400);
  if (serviceId === 'voter-correction' && corrections.length > 4) return json({ success: false, error: 'Form 8 allows a maximum of four correction entries.' }, 400);
  if (!['DIRECT_CUSTOMER', 'CYBER_CAFE', 'CSC_CENTER', 'INDEPENDENT_AGENT'].includes(requesterType)) return json({ success: false, error: 'Please select a valid submitting-party type.' }, 400);
  if (!['SELF', 'CUSTOMER'].includes(applicationFor) || (requesterType === 'DIRECT_CUSTOMER' && applicationFor !== 'SELF')) return json({ success: false, error: 'Please select whose work is being requested.' }, 400);
  if (!isValidName(name)) return json({ success: false, error: 'Please enter a valid applicant name using Hindi or English letters.' }, 400);
  if (!isValidMobile(phone)) return json({ success: false, error: 'Please enter a valid 10-digit Indian applicant mobile number.' }, 400);
  if (!isValidEmail(email)) return json({ success: false, error: 'Please enter a valid applicant email address.' }, 400);
  if (requesterType !== 'DIRECT_CUSTOMER') {
    if (!operator || !isValidName(operatorName) || !isValidMobile(operatorPhone) || !isValidEmail(operatorEmail)) return json({ success: false, error: 'Please enter the operator/agent name, valid mobile and email.' }, 400);
    if (['CYBER_CAFE', 'CSC_CENTER'].includes(requesterType) && (!centerName || centerName.length > 120 || !isValidAddress(centerAddress))) return json({ success: false, error: 'Centre name and full address are required.' }, 400);
    if (requesterType === 'INDEPENDENT_AGENT' && (!agencyName || agencyName.length > 120 || (agencyAddress && !isValidAddress(agencyAddress)))) return json({ success: false, error: 'Agent/business name is required.' }, 400);
    if (centerName.length > 120 || centerAddress.length > 500 || agencyName.length > 120 || agencyAddress.length > 500) return json({ success: false, error: 'Operator or centre details are too long.' }, 400);
    if (applicationFor === 'SELF' && (name !== operatorName || phone !== operatorPhone || email.toLowerCase() !== operatorEmail.toLowerCase())) return json({ success: false, error: 'For own work, applicant contact details must match the operator profile.' }, 400);
  } else if (operator) {
    return json({ success: false, error: 'Direct customer requests must not include an operator profile.' }, 400);
  }
  if (taskDetails.length < 10 || taskDetails.length > 4000 || !/[\\p{L}]{3,}/u.test(taskDetails) || applicationDetails.length > 16000 || otherDocumentName.length > 160) return json({ success: false, error: 'Please provide a clear description of the requested service and valid document selections.' }, 400);
  const requiredServiceFields = getRequiredServiceFieldKeys(serviceId, serviceOptions);
  for (const field of requiredServiceFields) {
    const value = fieldValues[field] ?? serviceOptions[field];
    if (value == null || !String(value).trim()) return json({ success: false, error: `Required service field is missing: ${field}.` }, 400);
  }
  for (const [field, value] of Object.entries(fieldValues)) {
    const issue = validateByKind(validationKindForField(field), value);
    if (issue) return json({ success: false, error: `Invalid service field: ${field}. ${issue}` }, 400);
  }
  for (const [field, value] of Object.entries(serviceOptions)) {
    const issue = validateByKind(validationKindForField(field), value);
    if (issue) return json({ success: false, error: `Invalid service option: ${field}. ${issue}` }, 400);
  }
  if (!consent) return json({ success: false, error: 'Please confirm that TANSHU ONLINE may contact you about this request.' }, 400);
  if (!termsAccepted || termsPolicyVersion !== 'terms-2026-11-07-v1') return json({ success: false, error: 'Please read and accept the current Terms & Conditions.' }, 400);
  if (!refundPolicyAccepted || refundPolicyVersion !== 'refund-2026-11-07-v2') return json({ success: false, error: 'Please read and accept the current Refund Policy separately.' }, 400);
  if (!/^[0-9a-f-]{36}$/i.test(key)) return json({ success: false, error: 'The booking session expired. Please reopen the form.' }, 400);

  try {
    const prior = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT booking_reference FROM digital_seva_bookings WHERE idempotency_key = ?'
    ).bind(key).first();
    if (prior?.booking_reference) return json({ success: true, bookingReference: prior.booking_reference, existing: true });

    const bookingId = crypto.randomUUID();
    const bookingReference = makeReference();
    await env.DIGITAL_SEVA_DB.batch([
      env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_bookings
         (id, booking_reference, idempotency_key, service_id, customer_name, customer_phone, customer_email,
          requester_type, application_for, operator_name, operator_phone, operator_email, centre_name, centre_address,
          agency_name, agency_address, application_details_json,
          status, consent_at, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?)`
      ).bind(bookingId, bookingReference, key, serviceId, name, phone, email,
        requesterType, applicationFor, operatorName || null, operatorPhone || null, operatorEmail || null,
        centerName || null, centerAddress || null, agencyName || null, agencyAddress || null, applicationDetails,
        termsPolicyVersion, refundPolicyVersion),
      env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_booking_events (id, booking_id, old_status, new_status, actor, note)
         VALUES (?, ?, NULL, 'RECEIVED', 'customer', 'Booking request submitted')`
      ).bind(crypto.randomUUID(), bookingId),
    ]);
    return json({ success: true, bookingReference, status: 'RECEIVED' }, 201);
  } catch (error) {
    console.error('Digital Seva booking save failed:', error);
    return json({ success: false, error: 'We could not save this request securely. Please try again later.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
