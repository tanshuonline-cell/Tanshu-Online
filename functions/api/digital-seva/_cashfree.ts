/** Shared Cashfree endpoint selection. Live mode is opt-in via an explicit Production environment variable. */
export interface CashfreeEnvironment {
  CASHFREE_ENVIRONMENT?: string;
}
export function cashfreeApiBase(env: CashfreeEnvironment): string {
  return String(env.CASHFREE_ENVIRONMENT || '').trim().toUpperCase() === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}
