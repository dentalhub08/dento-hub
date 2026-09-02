DENTO HUB — Mobile Header + Course Number Fix

This patch is intentionally non-destructive. It appends a small CSS override to your CURRENT src/app/globals.css rather than replacing the file.

From inside your existing dento-hub-app folder:

1) Extract this ZIP into the current folder.
2) Run:
   powershell -ExecutionPolicy Bypass -File .\apply-mobile-header-fix.ps1
3) Test:
   npm run build
4) If build succeeds:
   git add .
   git commit -m "Fix mobile header and course number badge"
   git push

No Supabase SQL changes are needed.
