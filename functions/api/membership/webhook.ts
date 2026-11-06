interface Env {
  DB: any;
  CASHFREE_APP_ID: string;
  CASHFREE_SECRET_KEY: string;
  CASHFREE_ENVIRONMENT: string;
}

const reply = (status = 200) =>
  new Response('ok', {
    status,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  });

const equal = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)),
  );
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

async function sha256(value: string) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
  );
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function mapSubscriptionStatus(subscriptionStatus: string, authorizationStatus: string) {
  const status = subscriptionStatus.toUpperCase();
  const authorization = authorizationStatus.toUpperCase();

  // An active mandate is not proof that a recurring membership charge succeeded.
  // Entitlement is granted only after a verified CHARGE webhook below.
  if (status === 'ACTIVE' && authorization === 'ACTIVE') return 'pending';
  if (['EXPIRED', 'COMPLETED', 'LINK_EXPIRED'].includes(status)) return 'expired';
  if (['CUSTOMER_CANCELLED', 'CANCELLED'].includes(status)) return 'cancelled';
  if (['ON_HOLD', 'PAUSED', 'CUSTOMER_PAUSED'].includes(status)) return 'suspended';
  if (status === 'FAILED') return 'payment_failed';
  return 'pending';
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  if (
    !env.DB ||
    !env.CASHFREE_APP_ID ||
    !env.CASHFREE_SECRET_KEY ||
    String(env.CASHFREE_ENVIRONMENT).toUpperCase() !== 'SANDBOX'
  ) {
    console.error('Cashfree membership webhook is missing required Preview configuration.');
    return reply(503);
  }

  // Cashfree signs the exact raw body with the Cashfree Client Secret Key.
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';

  if (!signature || !timestamp) return reply(401);

  const expectedSignature = await hmac(env.CASHFREE_SECRET_KEY, timestamp + rawBody);
  if (!equal(expectedSignature, signature)) return reply(401);

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return reply(400);
  }

  const eventType = String(event.type || event.event_type || 'UNKNOWN').toUpperCase();
  const data = event.data || {};
  const subscriptionId = String(
    data.subscription_details?.subscription_id ||
    data.subscription_id ||
    event.subscription_id ||
    '',
  );

  const eventId = await sha256(rawBody);
  try {
    const inserted = await env.DB.prepare(
      "INSERT OR IGNORE INTO membership_webhook_events (id,gateway,gateway_event_id,event_type,payload_sha256,processing_status,received_at) VALUES (?,'cashfree',?,?,?,'received',CURRENT_TIMESTAMP)",
    )
      .bind('wh_' + crypto.randomUUID(), eventId, eventType, eventId)
      .run();

    // Claim new or failed events atomically. processed_at is used as a short-lived
    // processing lease so concurrent duplicate deliveries cannot process the same event.
    // A stale lease can be reclaimed if an invocation crashes before completing.
    const claimed = await env.DB.prepare(
      "UPDATE membership_webhook_events SET processing_status='received',processed_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_event_id=? AND ((processing_status IN ('received','failed') AND processed_at IS NULL) OR (processing_status='received' AND processed_at < datetime('now','-5 minutes')) OR (processing_status='failed' AND processed_at < datetime('now','-5 minutes')))",
    )
      .bind(eventId)
      .run();

    // A processed/ignored event, or one currently being handled, is an idempotent no-op.
    if (!claimed.meta?.changes) return reply(200);

    if (!subscriptionId) {
      await env.DB.prepare(
        "UPDATE membership_webhook_events SET processing_status='ignored',processed_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_event_id=?",
      )
        .bind(eventId)
        .run();
      return reply(200);
    }

    // This handler is deployed from the isolated Preview branch only.
    // Never allow a Preview secret/configuration value to redirect requests
    // to Cashfree Production. Production billing must use a separately reviewed
    // production-only implementation and credentials.
    const baseUrl = 'https://sandbox.cashfree.com/pg';

    // Always obtain subscription state from Cashfree; never trust webhook/redirect status alone.
    const statusResponse = await fetch(
      baseUrl + '/subscriptions/' + encodeURIComponent(subscriptionId),
      {
        headers: {
          'x-api-version': '2026-01-01',
          'x-client-id': env.CASHFREE_APP_ID,
          'x-client-secret': env.CASHFREE_SECRET_KEY,
        },
      },
    );
    const subscription: any = await statusResponse.json().catch(() => ({}));
    if (!statusResponse.ok) throw new Error('Cashfree subscription lookup failed');

    const subscriptionStatus = String(subscription.subscription_status || '');
    const authorizationStatus = String(
      subscription.authorization_details?.authorization_status ||
      subscription.authorisation_details?.authorization_status ||
      '',
    );
    const localStatus = mapSubscriptionStatus(subscriptionStatus, authorizationStatus);

    if (localStatus === 'cancelled') {
      const existingSubscription = await env.DB.prepare(
        "SELECT id,status,current_period_end FROM membership_subscriptions WHERE gateway='cashfree' AND gateway_subscription_id=? LIMIT 1",
      ).bind(subscriptionId).first();
      const paidThrough = existingSubscription?.current_period_end ? new Date(existingSubscription.current_period_end) : null;
      if (existingSubscription?.status === 'active' && paidThrough && !Number.isNaN(paidThrough.getTime()) && paidThrough.getTime() > Date.now()) {
        await env.DB.prepare(
          "UPDATE membership_subscriptions SET cancel_at_period_end=1,cancelled_at=COALESCE(cancelled_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE id=?",
        ).bind(existingSubscription.id).run();
      } else {
        await env.DB.prepare(
          "UPDATE membership_subscriptions SET status='cancelled',cancel_at_period_end=1,cancelled_at=COALESCE(cancelled_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_subscription_id=?",
        ).bind(subscriptionId).run();
      }
    } else if (localStatus !== 'pending') {
      await env.DB.prepare(
        "UPDATE membership_subscriptions SET status=?,updated_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_subscription_id=?",
      ).bind(localStatus, subscriptionId).run();
    }

    // AUTH is only mandate authorisation (often a small refundable verification amount).
    // Record only real recurring CHARGE events in the membership payment ledger.
    const paymentType = String(data.payment_type || '').toUpperCase();
    const isPaymentEvent = [
      'SUBSCRIPTION_PAYMENT_SUCCESS',
      'SUBSCRIPTION_PAYMENT_FAILED',
      'SUBSCRIPTION_PAYMENT_CANCELLED',
    ].includes(eventType);

    if (isPaymentEvent && paymentType === 'CHARGE') {
      const paymentStatus =
        eventType === 'SUBSCRIPTION_PAYMENT_SUCCESS' &&
        String(data.payment_status || '').toUpperCase() === 'SUCCESS'
          ? 'success'
          : 'failed';

      const gatewayPaymentId = String(
        data.cf_payment_id ||
        data.payment_gateway_details?.gateway_payment_id ||
        data.payment_id ||
        '',
      );
      const amount = Number(data.payment_amount);
      const amountPaise = Number.isFinite(amount) ? Math.round(amount * 100) : 0;
      const currency = String(data.payment_currency || 'INR').toUpperCase();

      const localSubscription = await env.DB.prepare(
        'SELECT s.id AS subscription_id,s.customer_id,s.plan_id,s.current_period_end,p.monthly_amount_paise FROM membership_subscriptions s JOIN membership_plans p ON p.id=s.plan_id WHERE s.gateway=? AND s.gateway_subscription_id=? LIMIT 1',
      )
        .bind('cashfree', subscriptionId)
        .first();

      if (
        !localSubscription ||
        !gatewayPaymentId ||
        amountPaise <= 0 ||
        currency !== 'INR' ||
        amountPaise !== Number(localSubscription.monthly_amount_paise)
      ) {
        throw new Error('Recurring payment did not match the expected local subscription and plan amount.');
      }

      const gatewayOrderId = String(data.cf_order_id || '').trim() || null;
      const paidAt =
        paymentStatus === 'success'
          ? String(event.event_time || data.payment_initiated_date || new Date().toISOString())
          : null;

      await env.DB.prepare(
        "INSERT OR IGNORE INTO membership_payments (id,customer_id,subscription_id,plan_id,gateway,gateway_order_id,gateway_payment_id,amount_paise,currency,status,paid_at,created_at,updated_at) VALUES (?,?,?,?, 'cashfree',?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)",
      )
        .bind(
          'pay_' + crypto.randomUUID(),
          localSubscription.customer_id,
          localSubscription.subscription_id,
          localSubscription.plan_id,
          gatewayOrderId,
          gatewayPaymentId,
          amountPaise,
          'INR',
          paymentStatus,
          paidAt,
        )
        .run();

      // Only a verified successful recurring charge grants membership access.
      // Track the paid-through month so a later cancellation can stop future debits
      // while preserving access until the already-paid period ends.
      if (paymentStatus === 'success') {
        const now = new Date();
        const previousEnd = localSubscription.current_period_end ? new Date(localSubscription.current_period_end) : null;
        const periodStart = previousEnd && !Number.isNaN(previousEnd.getTime()) && previousEnd > now
          ? previousEnd
          : new Date(paidAt || now.toISOString());
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await env.DB.prepare(
          "UPDATE membership_subscriptions SET status='active',current_period_start=?,current_period_end=?,updated_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_subscription_id=?",
        ).bind(periodStart.toISOString(), periodEnd.toISOString(), subscriptionId).run();
      } else {
        await env.DB.prepare(
          "UPDATE membership_subscriptions SET status='payment_failed',updated_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_subscription_id=?",
        ).bind(subscriptionId).run();
      }
    }

    await env.DB.prepare(
      "UPDATE membership_webhook_events SET processing_status='processed',processed_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_event_id=?",
    )
      .bind(eventId)
      .run();

    return reply(200);
  } catch (error) {
    console.error('Cashfree membership webhook processing failed:', error);
    await env.DB.prepare(
      "UPDATE membership_webhook_events SET processing_status='failed',processed_at=NULL WHERE gateway='cashfree' AND gateway_event_id=?",
    )
      .bind(eventId)
      .run()
      .catch(() => {});
    return reply(503);
  }
}
