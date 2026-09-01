# DENTO HUB — Google Sign-In Setup

The application code is already wired to Supabase Google OAuth. The remaining work is a one-time provider configuration in Google Cloud and Supabase.

## 1) Google Cloud

1. Open Google Cloud Console and select/create a project for DENTO HUB.
2. Open **Google Auth Platform**.
3. Configure Branding / app information:
   - App name: `DENTO HUB`
   - User support email: an email you control
   - Audience: `External` so dental students can use normal Google accounts.
   - Contact email: an email you control.
4. Open **Clients** → **Create client**.
5. Application type: **Web application**.
6. Name: `DENTO HUB Web`.
7. Under **Authorized redirect URIs**, add exactly:

   `https://jpcxdsfmjorgsmzjhvip.supabase.co/auth/v1/callback`

8. Create the client and copy the **Client ID** and **Client Secret**.
9. Keep the Client Secret private.

For development/testing, if the Google app is still in testing mode, add the Google accounts you want to test under the app's Audience/Test users section.

## 2) Supabase

1. Open the DENTO HUB Supabase project.
2. Go to **Authentication → Sign In / Providers → Google**.
3. Enable Google.
4. Paste the Google **Client ID** and **Client Secret**.
5. Save.
6. Go to **Authentication → URL Configuration**.
7. Set Site URL for local development to:

   `http://localhost:3000`

8. Add this Redirect URL:

   `http://localhost:3000/auth/callback`

When DENTO HUB is deployed, also add the production callback URL, for example:

   `https://your-domain.com/auth/callback`

## 3) What the app now does

- Clicking **Continue with Google** starts `signInWithOAuth({ provider: "google" })`.
- Google returns to Supabase, and Supabase returns to `/auth/callback` in DENTO HUB.
- The callback exchanges the PKCE auth code for a cookie-backed Supabase session.
- Existing Admin user → `/admin`.
- Normal customer with completed student profile → requested page/home.
- New Google customer → `/complete-profile` once to add phone, university and academic year.
- After profile completion, the account stays signed in and the normal Supabase-backed cart/wishlist/profile persistence applies.
