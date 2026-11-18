import { CspEnv, json, readCustomerSession } from '../_auth';
import { cashfreeConfigured, verifyAndActivateCashfreeOrder } from '../_cashfree';
interface Env extends CspEnv { CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_WEBHOOK_SECRET?: string; CASHFREE_ENVIRONMENT?: string; CF_PAGES_BRANCH?: string; }
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET || !cashfreeConfigured(env)) return json({ success: false, error: 'Cashfree verification is not configured.' }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: false, error: 'Please sign in with Gmail again.' }, 401);
  const body = await request.json().catch(() => ({})) as { orderId?: string };
  const orderId = String(body.orderId || '');
  if (!/^csp_[a-z0-9_]{8,60}$/i.test(orderId)) return json({ success: false, error: 'Invalid Cashfree order reference.' }, 400);
  const owned = await env.DB.prepare('SELECT id FROM csp_cashfree_orders WHERE order_id = ? AND customer_id = ?').bind(orderId, session.id).first();
  if (!owned) return json({ success: false, error: 'This payment order does not belong to your account.' }, 403);
  try {
    const result = await verifyAndActivateCashfreeOrder(env, orderId);
    return json({ success: true, paid: result.paid, status: result.status, message: result.paid ? 'Payment verified. Membership activated for 30 days.' : 'Payment is not confirmed yet. Please refresh the payment status shortly.' });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Payment verification failed.' }, 502);
  }
}
