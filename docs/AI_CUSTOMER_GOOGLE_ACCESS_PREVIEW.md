# TANSHU ONLINE — Customer Google AI access (Preview)

This feature is intentionally isolated from public tools and Production.

## Intended behavior
- Public tools remain usable without signing in.
- The AI photo workspace can require Google/Gmail sign-in.
- Each authenticated account receives five one-time free AI photo credits.
- Credit consumption is enforced by a Supabase Postgres function, not a browser counter.
- No OpenAI/ChatGPT API is called by this free-credit foundation.

## Required Preview configuration
1. In the Supabase project intended for Preview, enable Authentication → Providers → Google.
2. Create a Google OAuth Web client in Google Cloud Console. Add the Supabase callback URL shown by Supabase to the Google OAuth client's authorized redirect URIs.
3. Put the Google client ID and client secret into the Supabase Google provider settings. Do not commit either value.
4. In Supabase Authentication → URL Configuration, allow the exact Cloudflare Preview origin and set the site URL appropriately.
5. Add these public build variables to the Cloudflare Pages Preview environment only:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY (or the project's publishable key)
6. Apply `supabase/migrations/20261112_ai_photo_free_credits.sql` in the Preview Supabase project's SQL Editor.
7. Never put a Supabase service-role key, Google client secret, or OpenAI API key in a VITE_ variable or browser code.

## Important limitations
- A Gmail login does not grant free ChatGPT/API access.
- This foundation tracks five successful credit-consumption requests per account. The AI model itself must be integrated separately and must only consume a credit at the intended point in the workflow.
- Multiple Gmail accounts can receive separate allowances; this is not a substitute for device-level abuse controls.
- Do not enable this on Production until Preview sign-in, callback URLs, RLS/RPC behavior, and credit limits are verified.
