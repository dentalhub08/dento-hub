DENTO HUB TypeScript build fix

Run from inside dento-hub-app:
  node .\\fix-dento-typecheck.mjs
  npm run build:cloudflare

If build succeeds:
  git add .
  git commit -m "Fix TypeScript production build"
  git push
