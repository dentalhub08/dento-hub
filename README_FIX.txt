DENTO HUB stability fix

This patch intentionally does not touch Supabase SQL or Cloudflare settings.
It hardens the client bootstrap so live Supabase/network problems cannot blank the storefront,
and disables caching of the root HTML document to avoid stale chunk mismatches after deployments.
