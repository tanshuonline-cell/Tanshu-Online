import assert from 'node:assert/strict';
import { SEVA_SERVICES } from '../src/features/digital-seva/serviceCatalog';
import { AUTO_PAYMENT_QUOTES, getAutoPaymentQuote } from '../src/features/digital-seva/autoPaymentPricing';
import { cashfreeApiBase } from '../functions/api/digital-seva/_cashfree';

const expected = [
  ['pan-new', 300, 107, 193],
  ['pan-correction', 300, 107, 193],
  ['pan-photo-signature', 357, 107, 250],
  ['aadhaar-address-doc', 275, 75, 200],
  ['aadhaar-address-hof', 175, 75, 100],
  ['aadhaar-co', 275, 75, 200],
] as const;

for (const [serviceId, total, governmentFee, tanshuFee] of expected) {
  const service = SEVA_SERVICES.find((item) => item.id === serviceId);
  assert.ok(service, `Service catalogue is missing ${serviceId}`);
  const quote = getAutoPaymentQuote(serviceId);
  assert.ok(quote, `Automatic Cashfree payment is not enabled for ${serviceId}`);
  assert.equal(quote.serviceId, serviceId);
  assert.equal(quote.currency, 'INR');
  assert.equal(quote.totalAmount, total);
  assert.equal(quote.governmentFee, governmentFee);
  assert.equal(quote.tanshuFee, tanshuFee);
  assert.equal(quote.totalAmount, quote.governmentFee + quote.tanshuFee);
  assert.equal(AUTO_PAYMENT_QUOTES[serviceId], quote);
}

assert.equal(
  cashfreeApiBase({ CF_PAGES_BRANCH: 'feature/digital-seva-paid-order-customer-recovery-preview-2026-11-14', CASHFREE_ENVIRONMENT: 'PRODUCTION' }),
  'https://sandbox.cashfree.com/pg',
  'Preview must always use Cashfree Sandbox'
);
assert.equal(
  cashfreeApiBase({ CF_PAGES_BRANCH: 'main', CASHFREE_ENVIRONMENT: 'PRODUCTION' }),
  'https://api.cashfree.com/pg',
  'Production must use the live Cashfree endpoint only when explicitly configured'
);
assert.equal(
  cashfreeApiBase({ CF_PAGES_BRANCH: 'main', CASHFREE_ENVIRONMENT: 'SANDBOX' }),
  'https://sandbox.cashfree.com/pg',
  'Production must remain on Sandbox unless explicitly configured for live payments'
);

console.log('Digital Seva payment configuration passed for all 6 Aadhaar/PAN services.');
