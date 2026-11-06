# TANSHU ONLINE — ₹49 Premium Video Checkpoint

Last updated: 2026-11-06

## Safety rules
- Work only on the isolated branch `fix/video49-clean-from-223-preview`.
- Safe homepage baseline: `223f000fc53b9a9b03edc52c39af6e35982ab8a4`.
- Do not merge PR #11 or this branch into `main` without explicit user approval.
- Do not deploy to Production or change Production settings without explicit user approval.
- Preserve existing homepage behavior and all unrelated tools.

## Current preview
- Branch: `fix/video49-clean-from-223-preview`
- Last known code commit before this checkpoint document: `78ba1a44ecef622e4669145f76b8a2fc62e509ac`
- Preview URL: https://67bd5244.tanshu-online.pages.dev
- Video page: https://67bd5244.tanshu-online.pages.dev/video/video_1793562264012
- Video: Aadhaar Card Father Name Update - Complete Step-by-Step Guide
- Price: INR 49, one-time
- Preview Cashfree environment was confirmed as SANDBOX by the user. Never ask for or store secret values.

## Verified in the latest preview session (2026-11-06)
- Video page rendered and showed the checkout form.
- User entered a new mobile number and clicked the payment button.
- Cashfree checkout opened successfully.
- Checkout displayed amount ₹49.
- Checkout displayed payment methods: UPI QR, card, wallets, net banking, and Pay Later.
- The entered mobile number appeared at the top of checkout.
- Business name area displayed only a single letter "B" / the generic Business Name label, not the full brand name TANSHU ONLINE.
- User was instructed not to complete this checkout payment. No payment was made in this latest test.

## Earlier test history (do not confuse with latest commit)
- On an earlier Preview build, the user reported a successful Sandbox payment and video playback.
- The user also reported that repeat access and "Already Purchased? Restore" worked for the same phone.
- That earlier result does not by itself prove the current `78ba1a4` build, D1 setup, webhook, or Production setup is correct.

## Next work — Preview only
1. Investigate why Cashfree checkout displays only "B" / generic Business Name instead of TANSHU ONLINE. Check the checkout request payload and Cashfree merchant/display-name configuration; do not expose secrets.
2. Fix and verify the business display name in Preview only.
3. Verify Preview Pages D1 binding is named exactly `DB`, and confirm the required schema and active premium video row exist.
4. Verify Cloudflare Stream account/token configuration and the video stream UID needed for signed playback.
5. Re-test order creation, payment verification/return handling, playback, repeat access, and restore flow in Sandbox on the latest Preview.
6. Before any live release, separately audit Production D1 binding, schema/data, Stream configuration, and Cashfree Production configuration. Do not make a real ₹49 payment without explicit user approval.

## Relevant code files in the isolated branch
- `functions/api/video/create-order.ts`
- `functions/api/video/verify-payment.ts`
- `functions/api/video/restore-access.ts`
- `functions/api/video/stream-token.ts`
- `functions/api/video/webhook.ts`
- `src/App.tsx`
- `src/components/video/CashfreeCheckoutModal.tsx`
- `src/components/video/VideoDetailPage.tsx`

This file is a progress log, not proof that all payment, database, playback, or Production checks have passed. Update it after every verified milestone and preserve previous completed checkpoints in Git history.
