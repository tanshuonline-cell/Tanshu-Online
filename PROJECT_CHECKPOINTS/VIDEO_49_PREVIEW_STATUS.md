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
- Code and copy-accuracy fixes are committed after the initial `78ba1a4` checkpoint; use the current branch head as the latest source of truth.
- Preview URL: https://67bd5244.tanshu-online.pages.dev
- Video page: https://67bd5244.tanshu-online.pages.dev/video/video_1793562264012
- Video: Aadhaar Card Father Name Update - Complete Step-by-Step Guide
- Price: INR 49, one-time
- Preview Cashfree environment was confirmed as SANDBOX by the user. Never ask for or store secret values.

## Verified in the latest Preview session (2026-11-06)
- Cashfree Checkout opened in SANDBOX and displayed INR 49.
- Cashfree Simulator accepted test OTP `111000` with Simulation Status `SUCCESS`.
- User saw “Payment verified successfully. Your video is unlocked.”
- User confirmed the video playback worked.
- User refreshed the page and confirmed access remained unlocked.
- In Incognito, the page found the previous purchase; the user supplied the same mobile number and Cashfree order reference and confirmed Restore opened the video.
- Restore did not create a new payment.
- These are user-observed end-to-end Sandbox results for the current Preview session, including server verification, entitlement, playback, and restore.
- Cashfree hosted checkout still displayed generic “B / Business Name”; the brand display request was awaiting approval.

## Code review and accuracy correction (2026-11-06)
- Compared this isolated branch with safe baseline `223f000fc53b9a9b03edc52c39af6e35982ab8a4`: only the video/payment routes, video UI/player, and a payment-return effect in `src/App.tsx` are changed. No homepage component files or unrelated tools are in the comparison.
- The video uses the user's chosen YouTube Unlisted source; no Cloudflare Stream purchase or migration is intended.
- Corrected visible playback claims that incorrectly said Cloudflare Stream token-signed playback and dynamic watermarking. The player now describes verified purchase access and the licensed mobile number overlay accurately.
- YouTube Unlisted links can still be opened outside the site if shared; this is the user's knowingly accepted hosting tradeoff.

## Production release blockers — do not deploy yet
- Production D1 binding named exactly `DB` and the required tables/video row have not been independently verified. Preview D1 was verified.
- Production Cashfree credentials must be confirmed as the real Production App ID/Secret, with `CASHFREE_ENVIRONMENT=PRODUCTION`; secret values must never be pasted into chat.
- Confirm the Production video row is active/premium at INR 49 and has the correct YouTube URL.
- Confirm a successful build/deployment of the current branch and re-check the corrected visible labels on Preview.
- Do not merge to `main`, change Production settings, or accept real customer payments until the user explicitly approves the release and the Production checks above are complete.

## Latest investigation — Cashfree brand name (2026-11-06)
- Audited the Preview `create-order.ts` payload. It sends order/customer details and order note, but no merchant checkout brand-name field; Cashfree's hosted checkout header brand is configured in the Cashfree Merchant Dashboard, not by adding a guessed field to this order payload.
- Cashfree's current guidance says to use Merchant Dashboard → Visual Customization → Header, choose the logo display type, upload the suitable logo, enter the Display Brand Name, and submit it for verification. The approved display name may require Cashfree verification before it appears on checkout.
- Target display brand: `TANSHU ONLINE`.
- Official Cashfree guidance: https://www.cashfree.com/blog/trust-at-checkout-now-easier-to-build/

## Next work — Preview only
1. In Cashfree Merchant Dashboard, open Visual Customization → Header and submit `TANSHU ONLINE` as Display Brand Name (and matching logo if desired); wait for Cashfree verification/approval.
2. Reopen the Preview checkout and confirm the approved full brand name appears instead of the single-letter `B` / generic label.
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
- `src/components/video/PremiumVideoPlayer.tsx`

This file is a progress log, not proof that all payment, database, playback, or Production checks have passed. Update it after every verified milestone and preserve previous completed checkpoints in Git history.
