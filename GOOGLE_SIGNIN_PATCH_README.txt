DENTO HUB GOOGLE SIGN-IN PATCH

Apply this ZIP from the root of your existing dento-hub-app folder with:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_GOOGLE_SIGNIN_PATCH.zip" -DestinationPath "." -Force

No SQL migration is required for this patch.

Then follow GOOGLE_SIGN_IN_SETUP.md to enable the Google provider in Google Cloud and Supabase.
Restart the app after configuration:
Ctrl + C
npm run dev
