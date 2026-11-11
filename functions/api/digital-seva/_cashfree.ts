/** Shared Cashfree endpoint selection. Live mode is opt-in via an explicit Production environment variable. */
export interface CashfreeEnvironment {
  CASHFREE_ENVIRONMENT?: string;
  CF_PAGES_BRANCH?: string;
}
export function cashfreeApiBase(env: CashfreeEnvironment): string {
  return String(env.CF_PAGES_BRANCH || '').toLowerCase() === 'main' &&
    String(env.CASHFREE_ENVIRONMENT || '').trim().toUpperCase() === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

export interface CashfreeWebhookEnvironment extends CashfreeEnvironment {
  CASHFREE_SECRET_KEY?: string;
}
export function cashfreeWebhookSecret(env: CashfreeWebhookEnvironment): string {
  return String(env.CASHFREE_SECRET_KEY || '').trim();
}
