# DENTO HUB Validation Notes

## Current validation

- Official approved DENTO HUB logo integrated into storefront header, footer, authentication, admin branding, Open Graph metadata, and compact tooth-mark usage.
- Full-resolution logo master preserved in `branding/DENTO_HUB_FINAL_LOGO.png`.
- Tooth symbol asset preserved in `branding/DENTO_HUB_TOOTH_MARK.png` and exposed at `public/dento-hub-tooth.png`.
- TypeScript/TSX source syntax checked with the TypeScript transpiler: **0 syntax diagnostics** after the logo integration.
- Real catalog seed remains at exactly **119 staged source products**.
- Customer selling prices remain intentionally unpopulated where BEE3/public selling price is missing.

## Full build note

A complete `npm install && npm run build` still depends on fetching project packages. The previous sandbox install attempt timed out before package installation completed. Run the following locally with internet access:

```bash
npm install
npm run build
```

Then connect Supabase using `.env.local` and follow the README deployment checklist.

## 2026-08-31 Location + Excel price update

- Header location selector now contains all 27 Egyptian governorates.
- Alamein International University (AIU) is a dedicated selectable university-delivery option.
- AIU delivery remains 50 EGP.
- Selected delivery location persists in local storage.
- Owner requested current storefront prices to use values from the supplied Excel `TOGARY` column.
- 85 of 119 source products have a usable Excel price and are active in the local catalog/seed.
- 34 source products have no supplied Excel price and remain `Price pending` / draft.
- Pack annotations such as `124(3pcs)` keep 124 EGP as the pack price; they are not divided into per-piece prices.
- TypeScript parser validation: 50 TS/TSX files, 0 parse diagnostics after this update.
- Full `tsc --noEmit` could not be completed because project dependencies are not installed in this sandbox; `npm install` timed out before dependency installation completed.

## Authentication UX upgrade — 2026-08-31
- Rebuilt Sign In and Sign Up as a premium responsive DENTO HUB experience.
- Registration now collects full name, phone, university, academic year, email, password and confirmation.
- University selection reads the seeded Egyptian universities table with search.
- Added password visibility, password-strength feedback, loading states and inline success/error messaging.
- Google OAuth remains available and routes first-time users through the redesigned profile-completion flow.
- Forgot Password is now a functional Supabase recovery request UI.
- Added `/reset-password` to finish recovery securely.
- Added Auth -> Profile trigger to safely persist registration metadata into `profiles`.
- Added own-profile insert RLS fallback for existing authenticated users.
- TypeScript parser validation: 53 TS/TSX files checked, 0 syntax diagnostics.
- CSS brace validation: balanced.

## Pre-Supabase final UX pass - 2026-08-31

Validated changes:

- Public storefront no longer renders any `Price pending`, `Missing in Excel`, or pending-price promotion text.
- `publicProducts` contains only active products with a storefront price.
- Pending catalog rows remain available to Admin only.
- Admin dashboard has a dedicated Pending Prices / Catalog Insights queue.
- Admin Products has a browser-local pre-Supabase editor for price, availability, and course section.
- Admin Ads manager supports create, edit, delete, hide/show, section placement, course targeting, CTA, destination, and supply-image selection.
- Storefront managed ad slots react to browser-local Admin ad edits before Supabase is connected.
- Supabase migration includes `homepage_banners` and its Admin/public RLS policies.
- 110 source image assets were prepared from the owner-provided AIU PDFs; 55 catalog IDs are explicitly mapped to clear source matches.
- Product cards and product pages use mapped AIU PDF supply images; ambiguous items keep a neutral fallback rather than a guessed photo.
- TypeScript parser check after this pass: 56 TS/TSX files, 0 syntax diagnostics.
