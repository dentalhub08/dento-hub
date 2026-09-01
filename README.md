# DENTO HUB 🦷

A production-oriented bilingual dental-supplies e-commerce application for dental students in Egypt.

## Pricing update

The storefront now uses the numeric values in the owner-supplied `TOGARY` Excel column as the current displayed EGP prices, per the owner's latest instruction. Pack annotations such as `124(3pcs)` are displayed as a 124 EGP pack price. Rows with no Excel price remain `Price pending` until Admin enters one.

The header delivery selector now includes all 27 Egyptian governorates plus a dedicated **Alamein International University (AIU)** option. AIU starts at **50 EGP delivery** and the selected location is saved in the browser.


## What is already built

- Premium responsive storefront and mobile UX
- English/Arabic direction-ready storefront shell
- Guest cart persisted in `localStorage`
- Auth gate at checkout
- Email/password + Google auth wiring for Supabase
- Real 119-row uploaded catalog staged in the app and SQL seed
- No invented public selling prices: source `TOGARY` is internal only
- Product detail UX with price-review states
- Wishlist interaction
- Shop/search/filter shell
- Course-first student UX and semester-kit/checklist concept
- Admin dashboard shell with real staged-catalog metrics
- Admin product review table
- Admin delivery settings with editable AIU 50 EGP override
- Orders empty state without fabricated business data
- Supabase/Postgres schema + RLS foundation
- Order/cancellation/delivery data model
- Vercel-ready Next.js project

## Stack

- Next.js 16.3.3 (Active LTS security release at the time this project was generated)
- React 19
- TypeScript
- Tailwind CSS 4 + custom design system CSS
- Supabase Auth / Postgres / Storage
- `@supabase/supabase-js` 2.x

## Start locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The storefront can render without Supabase. Authentication and live database features require the environment variables.

## Supabase setup

1. Create a Supabase project.
2. Add values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to client code)
3. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor/migration pipeline.
4. Run `supabase/seed/001_catalog.sql`.
5. Configure email confirmation URLs and Google OAuth.

## Create the one Admin

**Never share or commit the Admin password.**

1. Create the Admin user manually in Supabase Authentication.
2. Copy that Auth user UUID.
3. Insert it once:

```sql
insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
```

The schema enforces a single row in `admin_users`.

## Pricing safety

Your source spreadsheet contains 119 rows, but public `BEE3`/selling prices were blank. This project therefore imports:

- source name → `source_name`
- `TOGARY` → `source_togary_price_raw` (Admin-only/internal)
- public selling price → `NULL`
- status → `draft`

The database prevents an `active` product from having a null public selling price. Set each customer selling price in Admin before publishing.

## Delivery

Rule priority is designed as:

1. University override
2. City/area rule
3. Governorate rule
4. Default fee

The seed creates **Alamein International University = 50 EGP** as an editable university rule.

## Cancellation behavior to implement in order service/RPC

- 0–60 minutes after order creation, while still `pending`: customer may cancel directly.
- After 60 minutes, while `pending`: customer submits a cancellation request for Admin approval.
- Once `confirmed` or later: website cancellation is locked and customer is directed to support.
- Use server timestamps only.

## Notifications

The schema/UI is prepared for in-app notifications. Wire transactional providers using environment variables for:

- Email
- WhatsApp

Notification provider failure must not crash order creation.

## Support

`dentalhub08@outlook.com`

## Production checklist

Before launch:

- Enter customer selling prices
- Add real product images
- Review Arabic public product names/descriptions
- Confirm product brands/SKUs
- Map source rows to course supply-list items
- Seed complete current Egyptian university list with reviewed Arabic names
- Configure support phone/WhatsApp number
- Configure email + WhatsApp providers
- Create the single Admin account
- Complete transactional order RPC/server action
- Add automated tests for pricing, auth, RLS and cancellation time rules
- Run accessibility + RTL + mobile QA
- Run `npm run build`

## Design principle

DENTO HUB should feel like a specialist student tool, not a generic marketplace: **shop by course, build your semester kit, see university-specific delivery, then checkout only when you are ready.**

## Premium authentication UX
The Sign In and Sign Up screens use the DENTO HUB brand system and are responsive on desktop/mobile. Registration collects full name, Egyptian phone, university, academic year, email and password. The university picker reads the seeded `universities` table, and signup metadata is copied safely into `profiles` by the `handle_new_auth_user()` database trigger.

## Final pre-Supabase storefront rules

- Products without a public selling price are **Admin-only catalog insights**. They are not rendered in public product grids, search results, wishlists, product detail pages, or advertisements.
- `/admin` shows a Pending Prices insight queue.
- `/admin/products` includes a working browser-local pre-Supabase price/course editor so the workflow can be tested before database connection. Once Supabase is connected, replace those local overrides with writes to `products` / `product_courses`.
- `/admin/banners` is now a complete pre-Supabase ads manager: create, edit, hide/show, delete, change placement, and target a promotion to Operative, Endodontics, Fixed Prosthodontics, Removable Prosthodontics, or all courses.
- The migration now includes `homepage_banners` with Admin-only writes and public reads for active banners.
- Supply photography in `public/supply-images/` was extracted/cropped from the owner-provided AIU PDFs. Images are only mapped when the source item match is clear; ambiguous products keep the clean fallback visual.
