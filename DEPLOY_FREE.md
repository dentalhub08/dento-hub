# DENTO HUB — Free Launch Checklist

## 1) Supabase auth setting
In Supabase Dashboard:
Authentication → Sign In / Providers → Email
- Keep Email provider enabled.
- Turn **Confirm email** OFF.

Registration then works as:
1. Check email + phone uniqueness through `check_registration_uniqueness`.
2. If either exists, show an error.
3. If both are unique, create the Supabase Auth user.
4. Supabase returns a session immediately and the customer is signed in.

Migration `004_registration_email_otp_uniqueness.sql` must already be applied because it provides the backend email/phone duplicate check and normalized-phone protection.

## 2) Free Vercel deployment
Create/import the project on Vercel and use the repository root that contains `package.json`.

Add these Environment Variables in Vercel Project Settings:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Use the same values as local `.env.local`.
Do not expose `SUPABASE_SERVICE_ROLE_KEY` as a NEXT_PUBLIC variable.

Deploy. Vercel provides a free `*.vercel.app` project domain.

## 3) Update Supabase URL configuration after deployment
In Supabase Dashboard:
Authentication → URL Configuration
- Site URL: set it to the final Vercel URL, for example `https://dento-hub.vercel.app`
- Add the same production URL to Redirect URLs if you use password-reset callbacks or other redirects.
- Keep localhost redirects while local development is still needed.
