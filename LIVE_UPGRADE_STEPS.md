# DENTO HUB — Live Account & Admin Upgrade

1. Replace the project files with this version (or apply the patch ZIP).
2. Keep the existing `.env.local`; do not overwrite it.
3. Open Supabase → SQL Editor → New query.
4. Open `supabase/migrations/002_live_accounts_admin_controls.sql` in VS Code, copy all, paste into Supabase, and Run once.
5. Restart the local site: `Ctrl+C`, then `npm run dev`.
6. Test a normal registration, sign in, add cart/wishlist items, sign out and back in.
7. Test Admin → Products, Ads & Banners, and Delivery. Changes are stored in Supabase.
