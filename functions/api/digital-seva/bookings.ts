import { normalizeIndianMobile, getRequiredCorrectionFieldKeys, getRequiredServiceFieldKeys, isMeaningfulDescription, isValidAddress, isValidEmail, isValidMobile, isValidName, validateFieldByKey } from '../../../src/features/digital-seva/smartValidation';
// Cloudflare Pages Function: POST /api/digital-seva/bookings
// Stores booking metadata in the dedicated Preview D1 and file bytes in private Supabase Storage.
import { deletePrivateDocument, uploadPrivateDocument } from './_storage';
interface Env { DIGITAL_SEVA_DB?: any; SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string; }

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
  const requestContentType = (request.headers.get('Content-Type') || '').toLowerCase();
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 22 * 1024 * 1024) return json({ success: false, error: 'The total upload is too large. Please upload fewer or smaller files.' }, 413);
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

  let body: any = null;
  let uploadInputs: Array<{ documentType: string; file: File }> = [];
  if (requestContentType.includes('application/json')) {
    const rawBody = await request.text();
    if (rawBody.length > 32768) return json({ success: false, error: 'The booking request is too large.' }, 413);
    body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })();
  } else if (requestContentType.includes('multipart/form-data')) {
    let form: FormData;
    try { form = await request.formData(); } catch { return json({ success: false, error: 'The upload form could not be read.' }, 400); }
    const rawPayload = form.get('payload');
    const rawTypes = form.get('documentTypes');
    try {
      body = JSON.parse(String(rawPayload || ''));
      const documentTypes = JSON.parse(String(rawTypes || '[]'));
      const files = form.getAll('documentFile').filter((item): item is File => typeof File !== 'undefined' && item instanceof File && item.size > 0);
      if (!Array.isArray(documentTypes) || documentTypes.length !== files.length) throw new Error('Invalid document list.');
      uploadInputs = files.map((file, index) => ({ documentType: String(documentTypes[index] || ''), file }));
    } catch {
      return json({ success: false, error: 'The application details or uploaded document list is invalid.' }, 400);
    }
  } else {
    return json({ success: false, error: 'A JSON or multipart form request is required.' }, 415);
  }
  if (!body || typeof body !== 'object' || body.consent !== true) return json({ success: false, error: 'Please confirm the contact consent to continue.' }, 400);
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
  if (uploadInputs.length > 8) return json({ success: false, error: 'You can upload up to 8 documents in one request.' }, 400);
  const selectedSet = new Set(selectedDocuments);
  const seenDocumentTypes = new Set<string>();
  let totalUploadBytes = 0;
  for (const item of uploadInputs) {
    totalUploadBytes += item.file.size;
    if (!/^[a-z0-9-]{1,80}$/i.test(item.documentType) || !selectedSet.has(item.documentType) || seenDocumentTypes.has(item.documentType)) {
      return json({ success: false, error: 'Each uploaded file must match one selected document, with no duplicates.' }, 400);
    }
    seenDocumentTypes.add(item.documentType);
    if (item.file.size > 5 * 1024 * 1024) return json({ success: false, error: 'Each document must be 5 MB or smaller.' }, 413);
  }
  if (totalUploadBytes > 20 * 1024 * 1024) return json({ success: false, error: 'The combined document upload limit is 20 MB.' }, 413);
  const applicationDetails = JSON.stringify({ corrections, selectedDocuments, fieldValues, serviceOptions, otherDocumentName, taskDetails });
  const consent = body.consent === true;
  const termsAccepted = body.termsAccepted === true;
  const termsPolicyVersion = String(body.termsPolicyVersion || '');
  const refundPolicyAccepted = body.refundPolicyAccepted === true;
  const refundPolicyVersion = String(body.refundPolicyVersion || '');
  const key = String(body.idempotencyKey || '');
  if (!ALLOWED_SERVICE_IDS.has(serviceId)) return json({ success: false, error: 'Please select a valid service.' }, 400);
  if (serviceId === 'voter-correction' && corrections.length > 4) return json({ success: false, error: 'Form 8 allows a maximum of four correction entries.' }, 400);
  for (const field of getRequiredCorrectionFieldKeys(corrections)) {
    if (!String(fieldValues[field] || '').trim()) return json({ success: false, error: `Required correction detail is missing: ${field}.` }, 400);
  }
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
  if (taskDetails.length > 4000 || !isMeaningfulDescription(taskDetails) || applicationDetails.length > 16000 || otherDocumentName.length > 160) return json({ success: false, error: 'Please provide a clear description of the requested service and valid document selections.' }, 400);
  const requiredServiceFields = getRequiredServiceFieldKeys(serviceId, serviceOptions);
  for (const field of requiredServiceFields) {
    const value = fieldValues[field] ?? serviceOptions[field];
    if (value == null || !String(value).trim()) return json({ success: false, error: `Required service field is missing: ${field}.` }, 400);
  }
  for (const [field, value] of Object.entries(fieldValues)) {
    const issue = validateFieldByKey(field, value);
    if (issue) return json({ success: false, error: `Invalid service field: ${field}. ${issue}` }, 400);
  }
  for (const [field, value] of Object.entries(serviceOptions)) {
    const issue = validateFieldByKey(field, value);
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
    const uploaded: Array<{ id: string; documentType: string; objectKey: string; originalFileName: string; contentType: string; sizeBytes: number; sha256: string }> = [];
    try {
      for (const item of uploadInputs) {
        const bytes = await item.file.arrayBuffer();
        const view = new Uint8Array(bytes);
        let contentType: 'application/pdf' | 'image/jpeg' | 'image/png' | null = null;
        if (view.length >= 5 && String.fromCharCode(...view.slice(0, 5)) === '%PDF-') contentType = 'application/pdf';
        else if (view.length >= 3 && view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff) contentType = 'image/jpeg';
        else if (view.length >= 8 && [137,80,78,71,13,10,26,10].every((value, index) => view[index] === value)) contentType = 'image/png';
        if (!contentType) { await Promise.all(uploaded.map((doc) => deletePrivateDocument(env, doc.objectKey).catch(() => undefined))); return json({ success: false, error: 'Only genuine PDF, JPG and PNG documents are accepted.' }, 400); }
        if (item.file.type && item.file.type !== contentType) { await Promise.all(uploaded.map((doc) => deletePrivateDocument(env, doc.objectKey).catch(() => undefined))); return json({ success: false, error: 'A document file type does not match its actual contents.' }, 400); }
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
        const sha256 = Array.from(digest).map((value) => value.toString(16).padStart(2, '0')).join('');
        const extension = contentType === 'application/pdf' ? 'pdf' : contentType === 'image/jpeg' ? 'jpg' : 'png';
        const objectKey = `digital-seva/${bookingId}/${crypto.randomUUID()}.${extension}`;
        const originalFileName = item.file.name.split(/[\\/]/).pop()?.replace(/[\u0000-\u001f]/g, '').slice(0, 120) || `document.${extension}`;
        await uploadPrivateDocument(env, objectKey, bytes, contentType);
        uploaded.push({ id: crypto.randomUUID(), documentType: item.documentType, objectKey, originalFileName, contentType, sizeBytes: item.file.size, sha256 });
      }
      const statements = [
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
        ).bind(crypto.randomUUID(), bookingId)
      ];
      for (const doc of uploaded) {
        statements.push(env.DIGITAL_SEVA_DB.prepare(
          `INSERT INTO digital_seva_documents (id, booking_id, document_type, object_key, original_file_name, content_type, size_bytes, sha256)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(doc.id, bookingId, doc.documentType, doc.objectKey, doc.originalFileName, doc.contentType, doc.sizeBytes, doc.sha256));
      }
      await env.DIGITAL_SEVA_DB.batch(statements);
      return json({ success: true, bookingReference, status: 'RECEIVED', uploadedDocuments: uploaded.length }, 201);
    } catch (error) {
      await Promise.all(uploaded.map((doc) => deletePrivateDocument(env, doc.objectKey).catch(() => undefined)));
      throw error;
    }
  } catch (error) {
    console.error('Digital Seva booking save failed:', error);
    return json({ success: false, error: 'We could not save this request securely. Please try again later.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
