DENTO HUB HARD AUTH FIX

This fix is based on the current GitHub main branch.

What it changes:
- Browser Supabase config is generated as literal TypeScript DURING the build.
- Login no longer depends on process.env or window runtime injection.
- Registration universities use the same fixed Supabase browser client.
- The generated file is gitignored, so your key is not committed by `git add .`.

Apply from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_HARD_AUTH_UNIVERSITY_FIX.zip" -DestinationPath "." -Force

Then run:
npm run build:cloudflare

You MUST see this line during the build:
DENTO HUB: public Supabase browser config generated successfully.

If build succeeds:
git add .
git commit -m "Fix Supabase login and university loading"
git push

Do NOT run any older auth patch after this.
Do NOT change Cloudflare build commands.
