const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

// Deliberately fail closed until the owner approves recurring-mandate testing
// and the membership release gates (consent, account, entitlement and webhook
// verification) have been completed. This endpoint must not contact Cashfree.
export async function onRequestPost() {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Membership checkout is temporarily locked while recurring-billing safety checks are completed. No subscription or mandate was created.',
    }),
    { status: 503, headers: HEADERS },
  );
}
