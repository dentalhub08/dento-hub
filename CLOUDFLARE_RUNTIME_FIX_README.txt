DENTO HUB - Cloudflare runtime fix

1) Extract this ZIP into the dento-hub-app root and overwrite package.json.
2) Run: npm install
3) Run: npm run build:cloudflare
4) If successful, commit and push:
   git add .
   git commit -m "Fix Cloudflare Next.js runtime"
   git push
5) In Cloudflare Worker > Settings > Builds set:
   Build command: npm run build:cloudflare
   Deploy command: npm run deploy:cloudflare
6) Keep NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in BOTH Build variables and Runtime variables.
7) Trigger/retry a build.
