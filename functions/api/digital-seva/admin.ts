// Cloudflare Pages Function: /api/digital-seva/admin
// Admin-only booking and private document operations. Uses the existing signed superadmin session cookie.
import { createPrivateDocumentUrl, deletePrivateDocument } from './_storage';
import { cashfreeApiBase } from './_cashfree';
interface Env { DIGITAL_SEVA_DB?: any; ADMIN_SECRET_TOKEN?: string; DIGITAL_SEVA_PII_SECRET?: string; SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string; CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const ALLOWED_STATUSES = new Set(['RECEIVED', 'IN_REVIEW', 'WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function adminUser(request: Request, env: Env): Promise<string | null> {
  const secret = env.ADMIN_SECRET_TOKEN;
  if (!secret || secret.includes('YOUR_')) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const token = match?.[1];
  if (!token || token.length > 4096) return null;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !constantTimeEqual(await hmac(payload, secret), signature)) return null;
    const decoded = JSON.parse(atob(payload));
    if (decoded.role !== 'superadmin' || !decoded.exp || decoded.exp < Date.now()) return null;
    return String(decoded.u || 'superadmin');
  } catch { return null; }
}


function fromBase64(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer as ArrayBuffer;
}

async function decryptIdentifier(value: string, secrets: string[]): Promise<string> {
  const parts = value.split(':');
  if (parts.length !== 4 || parts[0] !== 'enc' || parts[1] !== 'v1') {
    throw new Error('Encrypted Digital Seva identifier has an invalid format.');
  }
  let lastError: unknown = null;
  for (const secret of secrets) {
    if (secret.length < 32) continue;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`TANSHU-ONLINE-DIGITAL-SEVA-PII-v1:${secret}`));
      const key = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['decrypt']);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(parts[2]) }, key, fromBase64(parts[3]));
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      // A failed AES-GCM authentication means this ciphertext belongs to another configured key.
      lastError = error;
    }
  }
  throw new Error('Could not decrypt a Digital Seva identifier with the configured current or legacy keys.', { cause: lastError });
}

async function revealApplicationDetails(raw: string | null, secrets: string[]): Promise<string | null> {
  if (!raw) return raw;
  let details: any;
  try { details = JSON.parse(raw); } catch { return raw; }
  if (!details || typeof details !== 'object' || Array.isArray(details)) return raw;
  const sensitiveKey = /^(aadhaarnumber|hofaadhaarnumber|aadhaarno|existingpannumber|pannumber)$/i;
  const encryptedValues = [details.fieldValues, details.serviceOptions].some((collection) =>
    collection && typeof collection === 'object' && Object.entries(collection).some(([key, value]) => sensitiveKey.test(key) && typeof value === 'string' && value.startsWith('enc:v1:'))
  );
  if (!encryptedValues) return raw;
  if (!secrets.some((secret) => secret.length >= 32)) throw new Error('Digital Seva PII decryption secret is missing or too short.');
  for (const collection of [details.fieldValues, details.serviceOptions]) {
    if (!collection || typeof collection !== 'object') continue;
    for (const [field, value] of Object.entries(collection)) {
      if (!sensitiveKey.test(field) || typeof value !== 'string' || !value.startsWith('enc:v1:')) continue;
      collection[field] = await decryptIdentifier(value, secrets);
    }
  }
  return JSON.stringify(details);
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  try {
    let result: any;
    try {
      result = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT b.id, b.booking_reference, b.service_id, b.customer_name, b.customer_phone, b.customer_email, b.requester_type, b.application_for, b.operator_name, b.operator_phone, b.operator_email, b.centre_name, b.centre_address, b.agency_name, b.agency_address, b.application_details_json, b.status, b.estimated_completion_at, b.consent_at, b.terms_accepted_at, b.terms_policy_version, b.refund_policy_accepted_at, b.refund_policy_version,
          b.government_fee, b.tanshu_service_fee, b.government_payment_status, b.government_payment_reference, b.government_paid_at, b.created_at, b.updated_at,
          COALESCE(
            (SELECT p.amount FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1),
            (SELECT o.amount FROM digital_seva_checkout_orders o WHERE o.order_id = b.checkout_order_id)
          ) AS payment_amount,
          CASE WHEN b.checkout_order_id IS NOT NULL
            THEN (SELECT CASE WHEN o.status = 'CLAIMED' THEN 'PAID' ELSE o.status END FROM digital_seva_checkout_orders o WHERE o.order_id = b.checkout_order_id)
            ELSE (SELECT p.status FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1)
          END AS payment_status,
          (SELECT p.link_url FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS payment_link_url,
          (SELECT p.cashfree_link_id FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS cashfree_link_id,
          COALESCE(
            (SELECT p.paid_at FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1),
            (SELECT o.paid_at FROM digital_seva_checkout_orders o WHERE o.order_id = b.checkout_order_id)
          ) AS payment_paid_at
         FROM digital_seva_bookings b ORDER BY b.created_at DESC LIMIT 200`
      ).all();
    } catch {
      // Keep the existing Admin Panel usable until migration 0008 is applied to Preview D1.
      result = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT id, booking_reference, service_id, customer_name, customer_phone, customer_email, requester_type, application_for, operator_name, operator_phone, operator_email, centre_name, centre_address, agency_name, agency_address, application_details_json, status, estimated_completion_at, consent_at, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version, created_at, updated_at
         FROM digital_seva_bookings ORDER BY created_at DESC LIMIT 200`
      ).all();
    }
    const evidenceIds = new Map<string, string>();
    try {
      const evidenceResult = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT booking_id, id FROM digital_seva_government_deposit_evidence ORDER BY created_at DESC`
      ).all();
      for (const evidence of evidenceResult.results || []) { const key = String(evidence.booking_id); if (!evidenceIds.has(key)) evidenceIds.set(key, String(evidence.id)); }
    } catch {
      // Preview migration 0013 may not have been applied yet.
    }
    const documentResult = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT id, booking_id, document_type, original_file_name, content_type, size_bytes, created_at
       FROM digital_seva_documents ORDER BY created_at DESC`
    ).all();
    const grouped = new Map<string, any[]>();
    for (const doc of documentResult.results || []) {
      const list = grouped.get(doc.booking_id) || [];
      list.push({ id: doc.id, documentType: doc.document_type, fileName: doc.original_file_name, contentType: doc.content_type, sizeBytes: doc.size_bytes, createdAt: doc.created_at });
      grouped.set(doc.booking_id, list);
    }
    const bookings = await Promise.all((result.results || []).map(async (booking: any) => ({
      ...booking,
      government_evidence_id: evidenceIds.get(String(booking.id)) || null,
      application_details_json: await revealApplicationDetails(booking.application_details_json, [env.DIGITAL_SEVA_PII_SECRET || '', env.ADMIN_SECRET_TOKEN || ''].filter((secret, index, all) => Boolean(secret) && all.indexOf(secret) === index)),
      documents: grouped.get(booking.id) || []
    })));
    // Reconcile a small bounded set of recent PENDING orders directly with Cashfree.
    // This catches successful payments when a webhook delivery was delayed or missed.
    if (env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY) {
      const pendingResult = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT order_id, amount, currency FROM digital_seva_checkout_orders
         WHERE status = 'PENDING'
         ORDER BY created_at DESC LIMIT 25`
      ).all();
      await Promise.all((pendingResult.results || []).map(async (order: any) => {
        try {
          const response = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(String(order.order_id))}`, {
            headers: { 'x-client-id': env.CASHFREE_APP_ID!, 'x-client-secret': env.CASHFREE_SECRET_KEY!, 'x-api-version': '2022-09-01' }
          });
          if (!response.ok) return;
          const verified = await response.json() as any;
          if (String(verified.order_id || '') !== String(order.order_id) ||
              String(verified.order_currency || '').toUpperCase() !== String(order.currency || 'INR').toUpperCase() ||
              Math.round(Number(verified.order_amount) * 100) !== Math.round(Number(order.amount) * 100)) return;
          const status = String(verified.order_status || '').toUpperCase();
          if (status === 'PAID') {
            await env.DIGITAL_SEVA_DB.prepare(
              `UPDATE digital_seva_checkout_orders
               SET status = 'PAID', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
               WHERE order_id = ? AND status = 'PENDING'`
            ).bind(String(order.order_id)).run();
          } else if (['EXPIRED', 'TERMINATED'].includes(status)) {
            await env.DIGITAL_SEVA_DB.prepare(
              `UPDATE digital_seva_checkout_orders SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
               WHERE order_id = ? AND status = 'PENDING'`
            ).bind(String(order.order_id)).run();
          }
        } catch {
          // A temporary Cashfree lookup failure must not block the Admin Panel.
        }
      }));
    }

    const recoveryResult = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT order_id, service_id, customer_phone, amount, currency, status, paid_at, created_at
       FROM digital_seva_checkout_orders
       WHERE status = 'PAID' AND booking_id IS NULL
       ORDER BY COALESCE(paid_at, created_at) DESC
       LIMIT 25`
    ).all();
    const orphanedPayments = await Promise.all((recoveryResult.results || []).map(async (order: any) => {
      let cashfreeCustomer: any = {};
      if (env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY) {
        try {
          const response = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(String(order.order_id))}`, {
            headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
          });
          if (response.ok) {
            const verified = await response.json() as any;
            if (String(verified.order_id || '') === String(order.order_id) && String(verified.order_status || '').toUpperCase() === 'PAID') {
              cashfreeCustomer = verified.customer_details || {};
            }
          }
        } catch (error) {
          console.error('Could not enrich paid checkout order for admin recovery view.');
        }
      }
      return {
        order_id: String(order.order_id),
        service_id: String(order.service_id),
        customer_phone: String(order.customer_phone || cashfreeCustomer.customer_phone || ''),
        customer_name: String(cashfreeCustomer.customer_name || ''),
        customer_email: String(cashfreeCustomer.customer_email || ''),
        amount: Number(order.amount),
        currency: String(order.currency || 'INR'),
        status: String(order.status),
        paid_at: order.paid_at || null,
        created_at: String(order.created_at || '')
      };
    }));
    let paymentHistory: any[] = [];
    try {
      const historyResult = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT o.order_id, o.service_id, o.customer_phone, o.amount, o.currency, o.status, o.paid_at, o.created_at, o.booking_id, b.booking_reference
         FROM digital_seva_checkout_orders o
         LEFT JOIN digital_seva_bookings b ON b.checkout_order_id = o.order_id
         ORDER BY COALESCE(o.paid_at, o.created_at) DESC
         LIMIT 100`
      ).all();
      const historyOrders = historyResult.results || [];
      const historyIds = historyOrders.map((order: any) => String(order.order_id));
      const eventGroups = new Map<string, any[]>();
      if (historyIds.length) {
        const placeholders = historyIds.map(() => '?').join(',');
        const eventResult = await env.DIGITAL_SEVA_DB.prepare(
          `SELECT order_id, event_type, payment_status, cf_payment_id, payment_message, payment_amount, payment_currency, event_time, created_at
           FROM digital_seva_checkout_payment_events
           WHERE order_id IN (${placeholders})
           ORDER BY COALESCE(event_time, created_at) DESC`
        ).bind(...historyIds).all();
        for (const event of eventResult.results || []) {
          const key = String(event.order_id);
          const list = eventGroups.get(key) || [];
          list.push({
            eventType: String(event.event_type || ''),
            paymentStatus: String(event.payment_status || ''),
            paymentId: event.cf_payment_id ? String(event.cf_payment_id) : null,
            message: event.payment_message ? String(event.payment_message) : null,
            amount: event.payment_amount == null ? null : Number(event.payment_amount),
            currency: String(event.payment_currency || 'INR'),
            eventTime: event.event_time || event.created_at || null
          });
          eventGroups.set(key, list);
        }
      }
      paymentHistory = historyOrders.map((order: any) => ({
        orderId: String(order.order_id),
        serviceId: String(order.service_id),
        customerPhone: String(order.customer_phone || ''),
        amount: Number(order.amount),
        currency: String(order.currency || 'INR'),
        status: String(order.status || ''),
        paidAt: order.paid_at || null,
        createdAt: String(order.created_at || ''),
        bookingId: order.booking_id ? String(order.booking_id) : null,
        bookingReference: order.booking_reference ? String(order.booking_reference) : null,
        events: eventGroups.get(String(order.order_id)) || [],
        refunds: []
      }));
      try {
        const refundRows = await env.DIGITAL_SEVA_DB.prepare(
          `SELECT order_id, refund_id, amount, status, cashfree_refund_id, created_at
           FROM digital_seva_refunds ORDER BY created_at DESC LIMIT 200`
        ).all();
        const refundGroups = new Map<string, any[]>();
        for (const row of refundRows.results || []) {
          const key = String(row.order_id);
          const list = refundGroups.get(key) || [];
          list.push({ refundId: String(row.refund_id), amount: Number(row.amount), status: String(row.status), cashfreeRefundId: row.cashfree_refund_id ? String(row.cashfree_refund_id) : null, createdAt: String(row.created_at || '') });
          refundGroups.set(key, list);
        }
        paymentHistory = paymentHistory.map((order) => ({ ...order, refunds: refundGroups.get(order.orderId) || [] }));
      } catch {
        console.error('Digital Seva refund ledger is not available yet; apply Preview migration 0013.');
      }
    } catch (historyError) {
      // Keep the existing booking and paid-recovery panels usable before migration 0011 is applied.
      console.error('Digital Seva payment history is not available yet; apply migration 0011.');
    }
    return json({ success: true, bookings, orphanedPayments, paymentHistory });
  } catch (error) {
    console.error('Digital Seva admin list failed:', error);
    return json({ success: false, error: 'Could not load booking records. Confirm the Preview migration has been applied.' }, 503);
  }
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 4096) return json({ success: false, error: 'The status update is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  if (body?.action === 'REQUEST_CASHFREE_REFUND') {
    const orderId = String(body?.orderId || '');
    const amount = Number(body?.amount);
    const note = String(body?.note || 'TANSHU ONLINE service refund').trim().slice(0, 200);
    if (!/^ds_[0-9a-f]{32}$/i.test(orderId) || !Number.isFinite(amount) || amount <= 0 || Math.round(amount * 100) !== amount * 100) {
      return json({ success: false, error: 'Enter a valid paid checkout order and refund amount (up to 2 decimal places).' }, 400);
    }
    if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false, error: 'Cashfree credentials are not configured for this Preview environment.' }, 503);
    try {
      const order = await env.DIGITAL_SEVA_DB.prepare(
        'SELECT order_id, amount, currency, status FROM digital_seva_checkout_orders WHERE order_id = ?'
      ).bind(orderId).first();
      if (!order || !['PAID','CLAIMED'].includes(String(order.status))) return json({ success: false, error: 'Only a Cashfree-verified paid order can be refunded.' }, 409);
      const verifiedResponse = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(orderId)}`, {
        headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
      });
      const verified = await verifiedResponse.json().catch(() => ({})) as any;
      if (!verifiedResponse.ok || String(verified.order_id || '') !== orderId ||
          String(verified.order_status || '').toUpperCase() !== 'PAID' ||
          String(verified.order_currency || '').toUpperCase() !== 'INR' ||
          Math.round(Number(verified.order_amount) * 100) !== Math.round(Number(order.amount) * 100)) {
        return json({ success: false, error: 'Cashfree could not independently verify this paid order and amount. No refund was sent.' }, 409);
      }
      const existing = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM digital_seva_refunds
         WHERE order_id = ? AND status IN ('PENDING','SUCCESS','UNKNOWN')`
      ).bind(orderId).first();
      const remaining = Math.round((Number(order.amount) - Number(existing?.total || 0)) * 100) / 100;
      if (amount > remaining || remaining <= 0) return json({ success: false, error: `Refund exceeds the remaining refundable amount ₹${Math.max(0, remaining).toFixed(2)}.` }, 409);
      const unresolved = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT id FROM digital_seva_refunds WHERE order_id = ? AND status IN ('PENDING','UNKNOWN') LIMIT 1`
      ).bind(orderId).first();
      if (unresolved) return json({ success: false, error: 'A previous refund is pending or has an unknown gateway result. Reconcile it in Cashfree before creating another refund.' }, 409);
      const refundId = `dsr_${crypto.randomUUID().replace(/-/g, '')}`;
      const localId = crypto.randomUUID();
      await env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_refunds (id, order_id, refund_id, amount, currency, status, refund_note, created_by)
         VALUES (?, ?, ?, ?, 'INR', 'PENDING', ?, ?)`
      ).bind(localId, orderId, refundId, amount, note, actor).run();
      let gatewayResponse: Response;
      try {
        gatewayResponse = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(orderId)}/refunds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01', 'x-idempotency-key': refundId },
          body: JSON.stringify({ refund_amount: amount, refund_id: refundId, refund_note: note, refund_speed: 'STANDARD' })
        });
      } catch {
        await env.DIGITAL_SEVA_DB.prepare(`UPDATE digital_seva_refunds SET status = 'UNKNOWN', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(localId).run();
        return json({ success: false, refundId, status: 'UNKNOWN', error: 'Cashfree response was interrupted. Do not retry until this refund is reconciled in the Cashfree dashboard.' }, 502);
      }
      const gateway = await gatewayResponse.json().catch(() => ({})) as any;
      if (!gatewayResponse.ok) {
        const knownRejection = gatewayResponse.status >= 400 && gatewayResponse.status < 500;
        const state = knownRejection ? 'FAILED' : 'UNKNOWN';
        await env.DIGITAL_SEVA_DB.prepare(`UPDATE digital_seva_refunds SET status = ?, cashfree_refund_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .bind(state, gateway.cf_refund_id ? String(gateway.cf_refund_id) : null, localId).run();
        return json({ success: false, refundId, status: state, error: knownRejection ? 'Cashfree rejected the refund request. Review the reason before taking another action.' : 'Cashfree returned an uncertain result. Reconcile the refund in Cashfree before retrying.' }, 502);
      }
      const rawStatus = String(gateway.refund_status || 'PENDING').toUpperCase();
      const state = rawStatus === 'SUCCESS' ? 'SUCCESS' : rawStatus === 'FAILED' ? 'FAILED' : 'PENDING';
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_refunds SET status = ?, cashfree_refund_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(state, gateway.cf_refund_id ? String(gateway.cf_refund_id) : null, localId).run();
      return json({ success: true, refundId, cashfreeRefundId: gateway.cf_refund_id || null, status: state, amount, currency: 'INR' }, 201);
    } catch (error) {
      console.error('Cashfree refund request failed:', error);
      return json({ success: false, error: 'Refund request could not be safely completed. Check the refund ledger and Cashfree dashboard before retrying.' }, 503);
    }
  }
  if (body?.action === 'MARK_GOVERNMENT_FEE_PAID') {
    return json({ success: false, error: 'A private official receipt upload is now required. Use the Government Deposit Evidence upload control; a typed reference alone cannot mark the fee as paid.' }, 409);
    const bookingId = String(body?.bookingId || '');
    const reference = String(body?.governmentPaymentReference || '').trim().slice(0, 120);
    if (!bookingId || bookingId.length > 64 || reference.length < 6) return json({ success: false, error: 'Enter the genuine official government receipt/reference (at least 6 characters). Do not use an amount or placeholder.' }, 400);
    try {
      const booking = await env.DIGITAL_SEVA_DB.prepare(
        `SELECT b.government_fee, b.government_payment_status, b.checkout_order_id,
          (SELECT o.status FROM digital_seva_checkout_orders o WHERE o.order_id = b.checkout_order_id) AS checkout_status,
          (SELECT p.status FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS link_status
         FROM digital_seva_bookings b WHERE b.id = ?`
      ).bind(bookingId).first();
      if (!booking) return json({ success: false, error: 'Booking not found.' }, 404);
      if (Number(booking.government_fee || 0) <= 0) return json({ success: false, error: 'This booking has no government fee to deposit.' }, 409);
      if (booking.checkout_status !== 'CLAIMED' && booking.link_status !== 'PAID') return json({ success: false, error: 'The customer payment is not confirmed as PAID. Do not mark the government fee as deposited yet.' }, 409);
      if (booking.government_payment_status === 'PAID') return json({ success: true, unchanged: true });
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_bookings
         SET government_payment_status = 'PAID', government_payment_reference = ?,
             government_paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND government_payment_status IN ('PENDING','UNVERIFIED')`
      ).bind(reference, bookingId).run();
      return json({ success: true, bookingId, governmentPaymentStatus: 'PAID' });
    } catch (error) {
      console.error('Digital Seva government fee reconciliation failed:', error);
      return json({ success: false, error: 'Could not record the official payment receipt. Confirm Preview migration 0012 is applied.' }, 503);
    }
  }
  const id = String(body?.bookingId || '');
  const nextStatus = String(body?.status || '');
  const note = String(body?.note || '').trim().slice(0, 500);
  const estimateInput = String(body?.estimatedCompletionAt || '').trim();
  let estimatedCompletionAt: string | null = null;
  if (estimateInput) {
    const estimateDate = new Date(estimateInput);
    if (!Number.isFinite(estimateDate.getTime())) return json({ success: false, error: 'Enter a valid estimated completion time.' }, 400);
    estimatedCompletionAt = estimateDate.toISOString();
  }
  if (!id || id.length > 64 || !ALLOWED_STATUSES.has(nextStatus)) {
    return json({ success: false, error: 'Invalid booking or status.' }, 400);
  }
  try {
    const current = await env.DIGITAL_SEVA_DB.prepare('SELECT status, estimated_completion_at FROM digital_seva_bookings WHERE id = ?').bind(id).first();
    if (!current) return json({ success: false, error: 'Booking not found.' }, 404);
    if (current.status === nextStatus && (current.estimated_completion_at || null) === estimatedCompletionAt && !note) return json({ success: true, unchanged: true });
    await env.DIGITAL_SEVA_DB.batch([
      env.DIGITAL_SEVA_DB.prepare('UPDATE digital_seva_bookings SET status = ?, estimated_completion_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(nextStatus, estimatedCompletionAt, id),
      env.DIGITAL_SEVA_DB.prepare(
        'INSERT INTO digital_seva_booking_events (id, booking_id, old_status, new_status, actor, note) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), id, current.status, nextStatus, actor, note || null),
    ]);
    return json({ success: true, bookingId: id, status: nextStatus, estimatedCompletionAt });
  } catch (error) {
    console.error('Digital Seva status update failed:', error);
    return json({ success: false, error: 'Could not update this booking. Confirm migration 0007 is applied, then retry.' }, 503);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 2048) return json({ success: false, error: 'The document request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const documentId = String(body?.documentId || '');
  if (!documentId || documentId.length > 64) return json({ success: false, error: 'Invalid document.' }, 400);
  try {
    const doc = await env.DIGITAL_SEVA_DB.prepare('SELECT object_key FROM digital_seva_documents WHERE id = ?').bind(documentId).first();
    if (!doc?.object_key) return json({ success: false, error: 'Document not found.' }, 404);
    const downloadName = typeof body?.download === 'string' ? body.download.slice(0, 120) : undefined;
    const url = await createPrivateDocumentUrl(env, String(doc.object_key), 60, downloadName);
    return json({ success: true, url, expiresIn: 60 });
  } catch (error) {
    console.error('Digital Seva secure document link failed:', error);
    return json({ success: false, error: 'Could not create a secure document link.' }, 503);
  }
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 2048) return json({ success: false, error: 'The document request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const documentId = String(body?.documentId || '');
  if (!documentId || documentId.length > 64) return json({ success: false, error: 'Invalid document.' }, 400);
  try {
    const doc = await env.DIGITAL_SEVA_DB.prepare('SELECT object_key FROM digital_seva_documents WHERE id = ?').bind(documentId).first();
    if (!doc?.object_key) return json({ success: false, error: 'Document not found.' }, 404);
    await deletePrivateDocument(env, String(doc.object_key));
    await env.DIGITAL_SEVA_DB.prepare('DELETE FROM digital_seva_documents WHERE id = ?').bind(documentId).run();
    return json({ success: true, documentId });
  } catch (error) {
    console.error('Digital Seva document deletion failed:', error);
    return json({ success: false, error: 'Could not delete this document. Please retry.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, PATCH, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
