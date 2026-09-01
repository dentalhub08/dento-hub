# DENTO HUB — Email OTP Registration Setup

The app now uses this registration flow:

1. Student completes the registration form.
2. The frontend calls the Supabase `check_registration_uniqueness` RPC.
3. Supabase checks `auth.users` for the email and `profiles` for the normalized phone number.
4. If either is already registered, registration stops with a field-specific error message.
5. If both are unique, Supabase Auth creates the pending account and sends the signup confirmation email.
6. The student enters the email OTP inside DENTO HUB.
7. `verifyOtp` verifies the email and creates the signed-in session automatically.

## Required Supabase configuration

### 1. Run migration 004

Open Supabase -> SQL Editor -> New query and run:

`supabase/migrations/004_registration_email_otp_uniqueness.sql`

This migration adds the backend duplicate check and normalized unique phone enforcement.

### 2. Keep email confirmation enabled

Open Supabase -> Authentication -> Sign In / Providers -> Email.

Make sure **Confirm email** is enabled. The OTP signup flow depends on confirmation being required.

### 3. Change the Confirm signup email from a link to an OTP

Open Supabase -> Authentication -> Email Templates -> Confirm signup.

The template must contain `{{ .Token }}`. Do not rely only on `{{ .ConfirmationURL }}`.

A simple body can be:

```html
<h2>Verify your DENTO HUB account</h2>
<p>Your verification code is:</p>
<h1>{{ .Token }}</h1>
<p>Enter this code in DENTO HUB to finish creating your account.</p>
```

Supabase then sends the one-time code instead of requiring the customer to leave DENTO HUB and click a verification link.

### 4. Test

- Register with a brand-new email and phone -> code screen should open.
- Enter the code -> user should be signed in automatically.
- Try the same email again -> "This email is already registered."
- Try another email with the same phone -> "This phone number is already registered."
