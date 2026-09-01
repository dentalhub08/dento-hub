DENTO HUB — REMOVE GOOGLE SIGN-IN PATCH

Apply from the dento-hub-app folder:
Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_REMOVE_GOOGLE_SIGNIN_PATCH.zip" -DestinationPath "." -Force

No SQL migration is required.
Restart the development server after applying:
Ctrl+C
npm run dev

This removes the Google sign-in option and OAuth trigger from the login/register UX. Email/password authentication remains unchanged.
