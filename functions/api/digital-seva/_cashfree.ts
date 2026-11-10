/** Shared Cashfree endpoint selection. Live mode is opt-in via an explicit Production environment variable. */
export interface CashfreeEnvironment {
  CASHFREE_ENVIRONMENT?: string;
}
export function cashfreeApiBase(env: CashfreeEnvironment): string {
  return String(env.CASHFREE_ENVIRONMENT || '').trim().toUpperCase() === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

export interface CashfreeWebhookEnvironment extends CashfreeEnvironment {
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
}
export function cashfreeWebhookSecret(env: CashfreeWebhookEnvironment): string {
  const configured = String(env.CASHFREE_WEBHOOK_SECRET || '').trim();
  if (configured) return configured;
  if (String(env.CASHFREE_ENVIRONMENT || '').trim().toUpperCase() === 'PRODUCTION') return '';
  return String(env.CASHFREE_SECRET_KEY || '');
}
