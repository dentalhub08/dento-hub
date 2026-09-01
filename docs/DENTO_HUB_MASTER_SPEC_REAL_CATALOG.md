# DENTO HUB 🦷 — Master Product & Engineering Specification

> **Tagline:** Your Dental Supply Hub  
> **Target market:** Dental students in Egypt  
> **Primary storefront languages:** English + Arabic  
> **Admin dashboard language:** English only  
> **Currency:** EGP  
> **Initial payment method:** Cash on Delivery (COD)  
> **Support email:** dentalhub08@outlook.com  
> **Deployment target:** Production-ready web application

---

## 0. Instructions for Codex

Build this project as a real, deployable e-commerce application, not as a static mockup.

Priorities:

1. Correct business behavior.
2. Security and protected admin access.
3. Clean responsive UI.
4. Proper Arabic/English support.
5. Reliable guest-cart-to-account checkout flow.
6. Maintainable database design.
7. Simple, understandable implementation over unnecessary complexity.

Do not invent major business rules that conflict with this document.

If a minor implementation detail is unspecified, choose the simplest production-safe option and document it in the README.

Build in phases and keep the application working at the end of every phase.

---

# 1. Product Vision

DENTO HUB is an Egypt-focused e-commerce platform dedicated to dental students.

The concept is similar to a specialized Amazon for dental supplies, but it must have its own visual identity and student-focused shopping experience.

Customers can:

- Browse without an account.
- Search in Arabic or English.
- View dental products, variations, bundles, courses, and academic-year recommendations.
- Add items to cart without an account.
- Keep the guest cart if the browser is closed and reopened.
- Register or sign in only when they need to place/confirm an order.
- Sign in with email/password or Google.
- Maintain a wishlist after signing in.
- Save multiple delivery addresses.
- Place COD orders.
- Receive order notifications on the website, by email, and by WhatsApp.
- Track orders and request cancellations according to the cancellation rules.

The website is not a marketplace at launch. DENTO HUB is the seller.

The architecture should not unnecessarily block future marketplace expansion, but marketplace/seller functionality is **not** part of Version 1.

---

# 2. Brand

## 2.1 Name

**DENTO HUB 🦷**

## 2.2 Tagline

**Your Dental Supply Hub**

## 2.3 Brand direction

The visual identity should be:

- Clean
- Modern
- Premium
- Student-friendly
- Dental/medical without looking like a hospital
- Light theme only

Recommended visual direction:

- White background
- Dental turquoise / blue accent
- Dark navy text
- Soft neutral gray surfaces
- Rounded cards
- Clear spacing
- High-quality product imagery
- Subtle transitions/animations
- Strong mobile usability

The tooth emoji/icon can be used initially in the wordmark, but build the logo as a replaceable component so a custom SVG/logo can be swapped in later without redesigning the header.

Do **not** clone Amazon's exact layout or styling.

---

# 3. User Types

There are only two application access types:

## 3.1 Customer

A normal registered student/customer.

Can:

- Register
- Sign in
- Sign in with Google
- Sign out
- Reset password
- Manage profile
- Select university
- Select academic year
- Save multiple addresses
- Browse products
- Search/filter/sort
- Add to cart
- Manage cart
- Use wishlist
- Checkout
- Place COD orders
- View order history
- View order details
- Track order status
- Cancel or request cancellation according to the cancellation policy
- Receive notifications
- Contact support

## 3.2 Single Admin

There must be **one Admin account only**.

Rules:

- There is no public Admin registration page.
- The Admin is created manually in Supabase/Auth.
- Admin authorization must be assigned in the database.
- Never identify Admin access only by frontend checks.
- Never allow a customer to modify their own role.
- Never expose admin-service credentials to the browser.
- Do not hardcode a real Admin password anywhere.
- Do not include a real Admin password in `.env.example`.
- The Admin email can be configured later.
- `dentalhub08@outlook.com` is the support email and must **not** automatically be treated as the Admin login unless explicitly configured by the owner.

Recommended authorization design:

- Supabase Auth stores all authenticated users.
- Create an `admin_users` table.
- `admin_users` contains the authorized Admin `user_id`.
- Enforce a maximum of one Admin row.
- Admin checks must be server-side and protected by Supabase RLS/policies.
- Admin routes must redirect unauthorized users.

Example conceptual structure:

```text
admin_users
-----------
user_id UUID PK -> auth.users.id
singleton_key BOOLEAN UNIQUE DEFAULT TRUE CHECK(singleton_key = TRUE)
created_at
```

This makes it impossible to add multiple Admin rows accidentally.

---

# 4. Authentication

## 4.1 Guest browsing

Authentication is NOT required to:

- Browse
- Search
- Filter
- Open products
- Add products to cart
- Modify cart
- Remove cart items

## 4.2 Authentication gate

Authentication becomes mandatory only when the customer tries to continue into order confirmation/checkout.

Flow:

```text
Guest
  ↓
Browse
  ↓
Add to Cart
  ↓
Proceed to Checkout
  ↓
Authenticated?
  ├── YES → Checkout
  └── NO  → Sign In / Register
               ↓
          Successful Auth
               ↓
          Merge/Restore Guest Cart
               ↓
          Return to Checkout
```

The guest cart must never disappear merely because the customer signs in or registers.

## 4.3 Registration fields

Required:

- Full name
- Email
- Phone number
- Password
- Confirm password
- University
- Academic year

Academic year options:

- Year 1
- Year 2
- Year 3
- Year 4
- Year 5

No Internship option.

## 4.4 Email/password authentication

Support:

- Sign up
- Sign in
- Sign out
- Email verification
- Forgot password
- Password reset
- Resend verification email

A customer may browse while unverified, but email/password users must have a verified email before successfully placing an order.

## 4.5 Google authentication

Add **Continue with Google**.

On first Google sign-in:

- Obtain name/email from Google when available.
- If phone, university, or academic year is missing, send user to a required **Complete Your Profile** screen.
- User may browse before profile completion.
- User may not place an order until profile is complete.

---

# 5. Internationalization

## 5.1 Languages

Customer website:

- English
- Arabic

Admin dashboard:

- English only

## 5.2 Header language control

Always display a clear language toggle such as:

```text
EN | عربي
```

Persist language preference in a cookie/local setting.

## 5.3 Direction

English:

```text
dir="ltr"
```

Arabic:

```text
dir="rtl"
```

Arabic must flip the customer-facing layout properly, including:

- Header
- Navigation
- Product grids
- Filters
- Product pages
- Cart
- Checkout
- Account pages
- Notifications
- Footer

Do not simply translate text while leaving an LTR layout.

## 5.4 Bilingual content

Store translatable business content separately:

```text
name_en
name_ar
description_en
description_ar
```

Apply this pattern where needed for:

- Products
- Categories
- Courses
- Bundles
- Banners
- Promotions
- Static CMS-like sections

Search must support both Arabic and English product data.

---

# 6. Storefront Header

Desktop header should contain:

- DENTO HUB 🦷 logo/wordmark
- Search bar
- Arabic/English toggle
- Account
- Wishlist
- Cart

Recommended desktop concept:

```text
DENTO HUB 🦷   [ Search dental supplies... ]   EN | عربي   Account   Wishlist   Cart
```

Mobile header:

```text
☰        DENTO HUB 🦷        Cart
          [ Search... ]
```

A compact mobile bottom navigation is allowed:

- Home
- Categories
- Search
- Wishlist
- Account

---

# 7. Homepage

Homepage must contain all of these sections:

1. Hero section
2. Shop by Category
3. Featured Products
4. New Arrivals
5. Best Sellers
6. Student Essentials
7. Student Kits / Bundles
8. Special Offers
9. Shop by Course
10. Shop by Academic Year
11. Popular/Featured Brands display
12. Why DENTO HUB
13. Contact/support CTA
14. Footer

Even though there is no dedicated Brands page, homepage may visually show featured brand names/logos.

## 7.1 Hero

Example content:

```text
DENTO HUB 🦷
Your Dental Supply Hub

Everything a dental student needs,
all in one place.

[ Shop Now ]
```

Admin should be able to change homepage promotional banners later from the dashboard.

---

# 8. Product Categories

Initial dental-focused categories can include:

- Dental Instruments
- Restorative Materials
- Impression Materials
- Endodontics
- Prosthodontics
- Orthodontics
- Periodontics
- Oral Surgery
- Pediatric Dentistry
- Dental Materials
- Dental Burs
- Handpieces
- Infection Control
- PPE
- Disposable Supplies
- Dental Models
- Student Kits
- Accessories

Categories must be database-managed, not permanently hardcoded.

Admin can:

- Create
- Edit
- Reorder
- Activate/deactivate

Use bilingual category names.

---

# 9. Courses

Initial courses include:

- Operative Dentistry
- Endodontics
- Prosthodontics
- Orthodontics
- Periodontics
- Oral Surgery
- Pediatric Dentistry
- Dental Materials

A product can belong to **multiple courses**.

Courses must be database-managed and bilingual.

---

# 10. Academic-Year Shopping

Customer can browse recommended products by:

- Year 1
- Year 2
- Year 3
- Year 4
- Year 5

A product may be associated with one or multiple academic years.

No Internship category.

Example routes:

```text
/academic-year/year-1
/academic-year/year-2
...
```

---

# 11. Products

## 11.1 Product fields

Required core fields:

- ID
- Slug
- Name EN
- Name AR
- Short description EN
- Short description AR
- Main category
- Optional additional categories
- Brand
- Base/starting price if needed for display
- Product images
- SKU or internal reference
- Is active
- Is featured
- Created at
- Updated at

Relationships:

- Courses (many-to-many)
- Academic years (many-to-many)
- Variations
- Images
- Bundles that contain the product

## 11.2 Product images

Support multiple images.

One image must be designated as the primary image.

Admin must be able to:

- Upload
- Reorder
- Set primary image
- Delete image

Use Supabase Storage or an equivalent production-safe image store.

## 11.3 Brands

Products must contain a Brand field.

Users can:

- Search by brand
- Filter by brand

There is **no dedicated public Brands page** in Version 1.

---

# 12. Product Variations

Dental products often have different shades, sizes, or types.

Examples:

```text
Composite:
- A1
- A2
- A3

Gloves:
- Small
- Medium
- Large
```

Each variation has its own:

- ID
- Display name EN/AR when necessary
- Attributes
- Price
- SKU/reference
- Availability boolean

There is **no numeric stock quantity system** in Version 1.

Example:

```text
A1 — 500 EGP — Available
A2 — 525 EGP — Available
A3 — 510 EGP — Unavailable
```

Use a flexible variation attribute design, e.g. JSONB:

```json
{
  "shade": "A2",
  "size": null,
  "type": "Syringe"
}
```

Do not require every product to have the same variation dimensions.

---

# 13. Availability / Inventory Rules

DENTO HUB does **not** track exact stock quantities.

Do not implement:

```text
17 items left
stock_quantity = 17
```

Instead use:

```text
is_available = true / false
```

Availability can exist at:

- Product level
- Variation level
- Bundle level

Admin manually marks items/variations Available or Unavailable.

If a product has variations, the product is purchasable when at least one active variation is available.

Unavailable selections must:

- Display `Out of Stock` / Arabic equivalent
- Disable Add to Cart
- Remain visible unless Admin deactivates the product

Admin dashboard should show:

- Unavailable products
- Unavailable variations

Do not show "Low Stock" because exact inventory quantities do not exist.

---

# 14. Product Page

Keep the product page clean/simple.

Show:

- Breadcrumb
- Image gallery
- Product name
- Brand
- Category
- Price
- Discounted price if applicable
- Variation selector
- Availability
- Quantity selector
- Add to Cart
- Wishlist
- Short description
- Key specifications
- Related products

Do not add:

- Reviews
- Star ratings
- Review count

Reviews are completely out of scope for Version 1.

---

# 15. Search

Search must support:

- English product names
- Arabic product names
- Brand
- Category
- Course
- Keywords
- SKU/reference

Examples:

```text
composite
3M
mirror
كومبوزيت
مراية أسنان
```

Search should be case-insensitive where applicable.

Use bilingual keywords/synonyms when practical so Arabic searches can find relevant products even when the common commercial term is English.

Optional but recommended:

- Search suggestions/autocomplete
- Recent searches stored locally

Do not make search dependent on an expensive external search provider for Version 1.

PostgreSQL/Supabase search is sufficient initially.

---

# 16. Filters and Sorting

Product listing/search pages must support filters:

- Category
- Brand
- Price range
- Course
- Academic year
- Available only
- Discounted only

Do NOT include a rating filter.

Sorting:

- Featured
- Newest
- Price: Low to High
- Price: High to Low
- Best Sellers

Best Sellers should be calculated from real non-cancelled order data, not manually faked.

---

# 17. Guest Cart

Guests can add to cart without an account.

Persist guest cart locally so it survives:

- Page refresh
- Browser close/reopen

Cart item must store enough data to recover:

- Product ID
- Variation ID if applicable
- Bundle ID if applicable
- Quantity

Never trust prices stored in local storage at checkout.

At checkout, retrieve current prices from the server/database.

## 17.1 Cart merge after authentication

When guest signs in/registers:

- Preserve guest items.
- Merge with authenticated cart.
- Avoid duplicate rows where same product + same variation exists.
- Combine quantities where appropriate.
- Remove/flag products that are no longer active/available.
- Return customer to checkout.

---

# 18. Wishlist

Wishlist requires an account.

Guest clicking Wishlist should be prompted to sign in/register.

Wishlist supports:

- Add
- Remove
- View saved products
- Add saved product to cart

No guest wishlist is required.

---

# 19. Bundles / Student Kits

Individual products remain purchasable separately.

Admin can create bundles such as:

```text
Third-Year Operative Kit
```

A bundle contains multiple existing products/variations.

Example:

```text
Individual total: 2,000 EGP
Bundle price:     1,750 EGP
You save:           250 EGP
```

Bundle fields:

- Name EN
- Name AR
- Description EN
- Description AR
- Slug
- Images
- Included items
- Bundle price
- Is available
- Is active
- Is featured
- Academic year relationships
- Course relationships

Rules:

- Bundle price is independent from the individual item total.
- Admin controls bundle price.
- Individual items can still be bought separately.
- If a required included item/variation becomes unavailable, the bundle should not be purchasable until it becomes available again or Admin changes bundle contents.
- No quantity-stock deduction logic is required.

---

# 20. Discounts and Promotions

Coupon codes are **NOT** included in Version 1.

Admin can create product/promotional discounts using:

- Percentage discount
- Fixed EGP discount

Examples:

```text
20% off
150 EGP off
```

Recommended fields:

- Discount type
- Discount value
- Start date/time optional
- End date/time optional
- Active boolean
- Applicable product(s)/category/bundle
- Display label EN/AR

Never allow a calculated selling price below 0.

Admin may also manually mark items as Featured.

---

# 21. New Arrivals

Use product creation/publish date.

Default:

- Products published in the previous 30 days can appear in New Arrivals.

Admin may optionally override/hide a product from this section.

---

# 22. Best Sellers

Calculate automatically from order items.

Exclude:

- Cancelled orders
- Rejected orders if implemented

Use a reasonable time window or all-time count.

Keep implementation simple.

---

# 23. Egyptian Universities

University is required for every customer account.

## 23.1 Data model

Create a database table:

```text
universities
------------
id
name_en
name_ar
category
governorate optional
city optional
is_active
created_at
updated_at
```

Do **not** hardcode the university list directly in frontend components.

The registration/profile UI should use a searchable dropdown.

Admin should be able to:

- Add a university
- Edit a university
- Activate/deactivate a university

## 23.2 Seed requirement

At deployment, seed the table with the current recognized Egyptian university ecosystem using the current official Egyptian higher-education lists.

The current official sources in 2026 report a large and changing system, including public, private, national/non-profit, technological, foreign-branch, and special/international institutions. Because this list changes over time, keep it as seed data + admin-manageable database content instead of immutable application code.

At minimum, the seed must include the full current public, private, and national/non-profit university lists and all major recognized international/framework universities commonly attended by Egyptian students.

Important examples that must exist:

- Cairo University
- Alexandria University
- Ain Shams University
- Assiut University
- Tanta University
- Mansoura University
- Zagazig University
- Capital University / Helwan
- Minya University
- Menoufia University
- Suez Canal University
- Qena / South Valley
- Benha University
- Fayoum University
- Beni Suef University
- Kafr El-Sheikh University
- Sohag University
- Port Said University
- Damanhour University
- Damietta University
- Aswan University
- Suez University
- University of Sadat City
- Arish University
- Matrouh University
- New Valley University
- Luxor University
- Hurghada University
- 6th of October University
- Misr University for Science and Technology
- October University for Modern Sciences and Arts (MSA)
- Misr International University
- German University in Cairo
- Modern University for Technology and Information
- Ahram Canadian University
- British University in Egypt
- Sinai University
- Future University in Egypt
- Pharos University in Alexandria
- Nahda University
- Egyptian Russian University
- Delta University for Science and Technology
- Heliopolis University
- Deraya University
- Badr University in Cairo
- New Giza University
- Horus University
- Egyptian Chinese University
- Al Salam University
- New Salhia University
- Sphinx University
- Badr University in Assiut
- Merit University
- May University in Cairo
- Innovation University
- Al Riyada University for Science and Technology
- City University in Cairo
- Al Hayat University
- Lotus University in Minya
- Nile Valley University in Fayoum
- Badya University
- Obour University for Science and Technology
- Egyptian University in Alamein
- Rashid University
- East Capital University
- Memphis University
- Misr El Gedida University
- Galala University
- King Salman International University
- **Alamein International University**
- New Mansoura University
- Alexandria National University
- Helwan National University
- Benha National University
- Mansoura National University
- Zagazig National University
- Menoufia National University
- Minya National University
- Beni Suef National University
- New Ismailia National University
- Assiut National University
- East Port Said National University
- South Valley National University
- Nile National University
- Egyptian E-Learning University
- French University in Egypt
- Egypt University of Informatics
- Suez National University
- Tanta National University
- Damietta National University
- Damanhour National University
- Cairo National University
- Ain Shams National University
- Sohag National University
- Kafr El-Sheikh National University
- New Valley National University
- Fayoum National University
- Luxor National University
- Sadat City National University
- The American University in Cairo
- Egyptian-Japanese University of Science and Technology
- German International University
- ESLSCA University
- Arab Academy for Science, Technology and Maritime Transport
- Arab Open University
- Zewail City / University of Science and Technology

Store Arabic equivalents in the seed data.

If an official source has updated names since this specification was written, use the current official name but retain a searchable alias for the old/common name.

---

# 24. Customer Profile

Required profile information:

- Full name
- Email
- Phone
- University
- Academic year

Customer can edit:

- Name
- Phone
- University
- Academic year

Email changes should use a secure re-verification flow.

Never display or store plain-text passwords.

---

# 25. Saved Addresses

Users can save multiple addresses.

Address fields:

- Address label, e.g. Home / University / Other
- Recipient full name
- Phone
- Governorate
- City / Area
- Street
- Building
- Floor
- Apartment
- Landmark optional
- Delivery notes optional
- Optional linked university for campus delivery
- Is default

Support all 27 Egyptian governorates.

---

# 26. Delivery Pricing

Delivery is controlled by Admin.

Do not hardcode delivery fees in frontend components.

Create a delivery-rule system.

Admin can configure:

- Default delivery fee
- Governorate-specific fee
- Optional city/area-specific fee
- University-specific fee/override
- Free-delivery order threshold
- Rule activation/deactivation

Recommended priority:

```text
University-specific rule
        ↓
City/area rule
        ↓
Governorate rule
        ↓
Default fee
```

## 26.1 Mandatory initial rule

**Delivery to Alamein International University = 50 EGP**

This must be seeded as an editable delivery rule.

It must NOT be permanently hardcoded.

Admin can later change it from the Admin dashboard.

## 26.2 Free delivery

Admin can set a configurable:

```text
Free delivery above X EGP
```

If enabled and the merchandise subtotal meets the threshold, shipping fee becomes 0 unless a future business rule explicitly overrides it.

---

# 27. Checkout

Checkout requires:

- Authenticated customer
- Complete profile
- Valid delivery address
- At least one available cart item

Flow:

```text
1. Contact/Profile Check
2. Delivery Address
3. Delivery Fee
4. Payment Method
5. Review Order
6. Place Order
7. Confirmation
```

## 27.1 Payment

Version 1:

**Cash on Delivery only**

Display clearly:

```text
Payment Method: Cash on Delivery
```

Do not implement real card payments in Version 1.

Design the database so a future payment provider can be added without replacing the order model.

---

# 28. Order Creation

When order is placed:

1. Validate the user/profile.
2. Validate products and variations are still active/available.
3. Re-read all current prices server-side.
4. Calculate item subtotal.
5. Calculate discounts.
6. Calculate delivery fee from delivery rules.
7. Calculate final total.
8. Create order and order-item snapshots transactionally.
9. Generate readable order number.
10. Set status = `pending`.
11. Create customer notification.
12. Create admin notification.
13. Trigger email.
14. Trigger WhatsApp notification.
15. Clear purchased cart items.
16. Show confirmation screen.

Since exact stock quantities are not tracked, do not decrement inventory quantities.

---

# 29. Order Price Snapshots

Past orders must never change when a product is edited.

Each `order_item` must snapshot:

- Product name EN/AR
- Variation label/attributes
- Unit price
- Discount
- Final unit price
- Quantity
- Product image reference if useful
- SKU/reference
- Bundle information if applicable

Order must snapshot:

- Delivery address
- Delivery fee
- Subtotal
- Discount total
- Grand total
- Payment method

---

# 30. Order Status

Use these statuses:

```text
pending
confirmed
preparing
shipped
out_for_delivery
delivered
cancelled
```

Optional:

```text
rejected
```

Admin controls status transitions.

Recommended normal flow:

```text
Pending
  ↓
Confirmed
  ↓
Preparing
  ↓
Shipped
  ↓
Out for Delivery
  ↓
Delivered
```

Cancellation is a separate terminal outcome.

Store status timestamps/history.

---

# 31. Cancellation Rules

These rules are mandatory.

## 31.1 First hour

For the first **60 minutes after order creation**:

- Customer can directly cancel the order themselves.
- Direct cancellation is allowed only if the order has not already been confirmed by Admin.
- Status becomes `cancelled`.
- Notify Admin.
- Notify customer.

## 31.2 After one hour

After 60 minutes:

If order is still `pending`:

- Customer cannot directly cancel.
- Customer can submit a **Cancellation Request**.
- Order remains pending unless Admin acts.
- Admin receives a prominent notification.
- Admin can Approve or Reject the request.

If approved:

```text
status = cancelled
```

If rejected:

- Order continues normally.
- Customer is notified.

## 31.3 After Admin confirmation

Once order is `confirmed` or later:

- Website cancellation controls are disabled.
- Customer is instructed to contact DENTO HUB support.
- Display support email and WhatsApp action.

Support email:

**dentalhub08@outlook.com**

Do not allow client-side clock manipulation to bypass the one-hour rule.

Calculate the 60-minute window on the server using the order creation timestamp.

---

# 32. Orders — Customer Area

Routes:

```text
/account/orders
/account/orders/[id]
```

Order list shows:

- Order number
- Date
- Total
- Status

Order detail shows:

- Items
- Variations
- Quantities
- Item totals
- Delivery fee
- Grand total
- Delivery address
- Payment method
- Status timeline
- Cancellation action/request where allowed
- Contact support action where cancellation is locked

---

# 33. Notifications

Use three customer channels:

1. In-app / website notifications
2. Email
3. WhatsApp

## 33.1 Customer notification events

At minimum:

- Order placed
- Order confirmed
- Order preparing
- Order shipped
- Out for delivery
- Delivered
- Order cancelled
- Cancellation request approved
- Cancellation request rejected

Avoid sending unnecessary duplicate spam; notification preferences can be expanded later.

## 33.2 Admin notifications

Admin must be notified when:

- New order is placed
- Cancellation request is submitted
- Important delivery/contact failure occurs if implemented

Admin notification surfaces:

- Admin dashboard notification center
- Email
- WhatsApp

## 33.3 Notification providers

Implement provider abstractions.

Do not commit credentials.

Suggested interfaces:

```text
EmailProvider
WhatsAppProvider
```

Provider credentials must be environment variables.

The support email is:

```text
SUPPORT_EMAIL=dentalhub08@outlook.com
```

The sending email service does not have to use the Outlook password directly. Use a proper transactional-email integration in production.

WhatsApp phone/API credentials will be supplied later.

If WhatsApp credentials are not configured in development:

- Do not crash order creation.
- Log/record notification as pending/failed.
- Continue order workflow.
- Make provider setup clear in README.

---

# 34. Contact & Support

Create:

```text
/contact
```

Show:

- Support email: **dentalhub08@outlook.com**
- WhatsApp button
- Phone number
- Contact form if desired

Phone/WhatsApp numbers must be configurable through Admin settings or environment configuration until real values are supplied.

Add a floating WhatsApp support button on the customer storefront when a WhatsApp number is configured.

Also create:

```text
/about
```

with editable/static brand information.

---

# 35. Admin Dashboard

Route:

```text
/admin
```

English only.

Normal users must never see Admin navigation.

## 35.1 Dashboard KPIs

Show:

- Total orders
- Pending orders
- Confirmed/in-progress orders
- Delivered orders
- Cancelled orders
- Total delivered revenue
- Current non-cancelled order value if useful
- Total customers
- Total active products
- Total bundles
- Unavailable products/variations
- Recent orders
- Pending cancellation requests

Do not show a "Low Stock" metric because quantity-based stock does not exist.

---

# 36. Admin Navigation

Admin menu:

```text
Dashboard
Orders
Products
Categories
Courses
Bundles
Promotions
Banners
Delivery
Universities
Customers
Notifications
Settings
```

---

# 37. Admin — Orders

Admin order table shows:

- Order number
- Customer
- Phone
- Date
- Total
- Payment method
- Status
- Cancellation request indicator

Admin can open order details and:

- View customer information
- View delivery address
- View products/variations
- View totals
- Change order status
- Approve/reject cancellation request
- Add optional internal note
- Contact customer through configured communication actions

Admin must not see customer passwords.

---

# 38. Admin — Products

Admin can:

- Add product
- Edit product
- Activate/deactivate product
- Manage images
- Change category
- Change brand
- Assign courses
- Assign academic years
- Create/edit variations
- Set variation price
- Mark variation available/unavailable
- Mark featured
- Apply/manage discount
- Manage bilingual content

Prefer soft-deactivation over destructive deletion.

Historical order data must survive product deletion/deactivation.

---

# 39. Admin — Categories & Courses

Admin can CRUD:

- Categories
- Courses

Both support:

- English name
- Arabic name
- Slug
- Active state
- Sort order

---

# 40. Admin — Bundles

Admin can:

- Create bundle
- Edit bundle
- Add/remove included products/variations
- Set bundle price
- Assign courses
- Assign academic years
- Set availability
- Set featured
- Activate/deactivate

Show calculated normal individual total and customer savings.

---

# 41. Admin — Promotions

Admin can:

- Create percentage discounts
- Create fixed-value discounts
- Assign promotion to products/categories/bundles
- Configure start/end dates
- Activate/deactivate
- Add bilingual display label

No coupon-code entry field in Version 1.

---

# 42. Admin — Homepage Banners

Admin can manage banners:

- Title EN
- Title AR
- Subtitle EN
- Subtitle AR
- Image
- CTA text EN
- CTA text AR
- Destination URL/path
- Start/end optional
- Active state
- Sort order

---

# 43. Admin — Delivery

Admin delivery page must allow:

- Change default shipping fee
- Configure all Egyptian governorates
- Add/edit city/area rules
- Add/edit university-specific rules
- Configure free-delivery threshold
- Enable/disable rules

Initial seed:

```text
Alamein International University campus delivery: 50 EGP
```

---

# 44. Admin — Universities

Admin can:

- Search universities
- Add
- Edit
- Activate/deactivate
- Update English name
- Update Arabic name
- Set category
- Set governorate/city where useful

This allows the list to remain correct as new Egyptian universities open or names change.

---

# 45. Admin — Customers

Admin can:

- Search customers
- View name
- Email
- Phone
- University
- Academic year
- Saved addresses
- Order history

Admin cannot:

- View password
- Reset password manually to a visible value
- Turn a customer into Admin through the normal customer UI

---

# 46. Admin — Settings

Settings can include:

- Store name
- Tagline
- Support email
- Support phone
- WhatsApp number
- Free-shipping threshold
- Default delivery fee
- Social links
- Default locale
- Basic storefront settings

Initial support email:

```text
dentalhub08@outlook.com
```

---

# 47. Database Model

Use PostgreSQL via Supabase.

Recommended tables:

```text
profiles
admin_users
universities
addresses

categories
brands
courses
academic_years

products
product_images
product_variations

product_categories
product_courses
product_academic_years

wishlists
wishlist_items

carts
cart_items

bundles
bundle_items
bundle_courses
bundle_academic_years

promotions
promotion_targets

delivery_rules

orders
order_items
order_status_history
cancellation_requests

notifications
notification_deliveries

homepage_banners
store_settings
```

Simplify where practical, but do not combine unrelated responsibilities into one giant table.

---

# 48. Key Schema Guidance

## 48.1 Profiles

```text
id UUID PK -> auth.users.id
full_name
phone
university_id
academic_year
preferred_language
created_at
updated_at
```

Email remains primarily managed by Supabase Auth.

## 48.2 Products

```text
id
slug UNIQUE
name_en
name_ar
description_en
description_ar
brand_id or brand string
is_active
is_featured
created_at
updated_at
```

## 48.3 Variations

```text
id
product_id
sku
attributes JSONB
name_en optional
name_ar optional
price NUMERIC
is_available BOOLEAN
is_active BOOLEAN
```

## 48.4 Orders

```text
id UUID
order_number UNIQUE
user_id
status
payment_method
payment_status
subtotal
discount_total
delivery_fee
grand_total
currency = EGP
delivery_address_snapshot JSONB
created_at
confirmed_at
delivered_at
cancelled_at
```

## 48.5 Cancellation requests

```text
id
order_id
user_id
reason optional
status: pending/approved/rejected
requested_at
reviewed_at
reviewed_by
admin_note optional
```

## 48.6 Delivery rules

```text
id
rule_type: default/governorate/city/university
governorate optional
city optional
university_id optional
fee
priority
is_active
created_at
updated_at
```

---

# 49. Security / Supabase RLS

Enable RLS on customer/admin-sensitive tables.

Principles:

- Public can read only active storefront products/categories/etc.
- Customer can read/update only their own profile.
- Customer can read/write only their own addresses.
- Customer can read/write only their own wishlist/cart.
- Customer can read only their own orders.
- Customer cannot directly edit order price/status fields.
- Order creation must be server-controlled.
- Cancellation policy must be server-controlled.
- Admin-only operations require server-side admin authorization.
- Service-role keys must never be sent to the browser.
- Product/admin writes must require Admin.
- Customer cannot insert themselves into `admin_users`.
- Protect storage uploads: only Admin can upload product/banner images.

Validate all mutations server-side.

---

# 50. Pricing Integrity

Never trust:

- Browser-submitted price
- Local-storage price
- Client-calculated discount
- Client-calculated delivery fee
- Client-calculated order total

The server must calculate final totals from database values.

Use decimal-safe monetary handling.

Store currency as EGP.

---

# 51. Recommended Technical Stack

Keep the stack straightforward:

## Frontend / application

- Next.js
- TypeScript
- App Router
- Tailwind CSS

## Backend / data

- Next.js Server Actions and/or Route Handlers
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

## Validation

- Zod or equivalent

## Deployment

- Vercel
- Supabase

Avoid adding a separate Node/Express backend unless a concrete requirement makes it necessary.

---

# 52. Routes

Customer:

```text
/
/products
/products/[slug]
/categories
/category/[slug]
/course/[slug]
/academic-year/[slug]
/search

/cart
/checkout

/login
/register
/forgot-password
/reset-password
/complete-profile

/wishlist

/account
/account/profile
/account/addresses
/account/orders
/account/orders/[id]
/account/notifications

/about
/contact
```

Admin:

```text
/admin
/admin/orders
/admin/orders/[id]
/admin/products
/admin/products/new
/admin/products/[id]
/admin/categories
/admin/courses
/admin/bundles
/admin/promotions
/admin/banners
/admin/delivery
/admin/universities
/admin/customers
/admin/customers/[id]
/admin/notifications
/admin/settings
```

---

# 53. Mobile Responsiveness

Mobile is a first-class requirement.

Test at minimum:

- Small phone
- Large phone
- Tablet
- Laptop
- Desktop

No horizontal scrolling.

Product cards should remain readable.

Checkout forms should be easy to complete on a phone.

Arabic RTL mobile behavior must be tested separately.

---

# 54. Accessibility

Use:

- Semantic HTML
- Keyboard-accessible controls
- Labels for all form fields
- Visible focus states
- Proper button elements
- Meaningful alt text
- Adequate contrast
- Accessible dialogs/drawers
- ARIA only where necessary

Language switch should correctly set page `lang` and direction.

---

# 55. Error / Empty / Loading States

Create polished states for:

- Loading products
- No search results
- Empty cart
- Empty wishlist
- Empty order history
- Failed checkout
- Auth error
- Network error
- Product unavailable after being added to cart
- Admin table empty state
- Notification-provider failure

Do not leave raw framework errors visible to users.

---

# 56. SEO

Customer-facing pages should include:

- Proper titles
- Meta descriptions
- Product metadata
- Canonical URLs where applicable
- Open Graph data
- Sitemap
- Robots configuration

Do not index:

- Checkout
- Account
- Admin
- Auth pages

---

# 57. Analytics Readiness

Structure the app so analytics can be added later.

Useful future events:

- Search
- Product view
- Add to cart
- Remove from cart
- Begin checkout
- Purchase
- Bundle view
- Wishlist add

Do not make a paid analytics provider mandatory for Version 1.

---

# 58. Out of Scope for Version 1

Do NOT build unless explicitly added later:

- Third-party sellers
- Public seller registration
- Multiple Admin accounts
- Product reviews
- Star ratings
- Coupon codes
- Online card payment
- InstaPay payment integration
- Exact inventory quantities
- Low-stock alerts
- Internship academic-year option
- Dedicated Brands page
- Dark mode
- Mobile native app

Keep the architecture extensible but do not overbuild future features.

---

# 59. Environment Variables

Create `.env.example` containing placeholders only.

Example:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

APP_URL=

ADMIN_EMAIL=

SUPPORT_EMAIL=dentalhub08@outlook.com
SUPPORT_PHONE=
SUPPORT_WHATSAPP_NUMBER=

EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=

WHATSAPP_PROVIDER_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

Never commit real secrets.

Do not put Admin password in environment files used by the app unless a specific secure provisioning process requires it.

Preferred Admin setup:

1. Create user manually in Supabase Auth.
2. Insert the Auth user ID into `admin_users`.
3. Verify only one Admin exists.

---

# 60. Seed Data

Provide database seed scripts for:

- Academic years
- Initial dental categories
- Initial courses
- Egyptian governorates if a lookup table is used
- Egyptian universities
- Alamein International University delivery rule = 50 EGP
- Basic store settings
- Support email
- Optional demo products for local development only

Production seed must not create fake customer orders.

Do not seed a real Admin password.

---

# 61. Development Phases

## Phase 1 — Foundation

Build:

- Next.js app
- TypeScript
- Tailwind
- Supabase connection
- Database migrations
- RLS foundation
- English/Arabic infrastructure
- RTL
- Layout
- Header
- Footer
- Auth

Acceptance:

- App runs locally.
- English/Arabic switch works.
- Customer registration works.
- Google auth integration is wired.
- Admin authorization structure exists.

## Phase 2 — Catalog

Build:

- Categories
- Courses
- Academic years
- Universities
- Products
- Variations
- Images
- Search
- Filters
- Sorting
- Product page

Acceptance:

- Admin-created products appear publicly.
- Variation prices/availability work.
- Arabic product content renders correctly.

## Phase 3 — Cart & Wishlist

Build:

- Guest cart
- Persistent local cart
- Logged-in cart
- Cart merge
- Wishlist

Acceptance:

- Guest can add items.
- Guest cart survives refresh/reopen.
- Login does not lose cart.
- Wishlist requires auth.

## Phase 4 — Checkout & Orders

Build:

- Address management
- Delivery rules
- AIU 50 EGP rule
- COD
- Server-side price calculation
- Order creation
- Customer order history

Acceptance:

- Guest is asked to authenticate at checkout.
- Auth returns them to checkout.
- Order is created as pending.
- Totals are protected server-side.

## Phase 5 — Cancellation

Build:

- One-hour direct cancellation
- Post-one-hour cancellation requests
- Admin approval/rejection
- Confirmed-order lock

Acceptance:

- Server timestamp controls cancellation eligibility.
- Admin confirmation prevents website cancellation.
- Notifications are generated correctly.

## Phase 6 — Bundles & Promotions

Build:

- Bundles
- Bundle pricing
- Homepage student kits
- Discounts
- Banners
- Best sellers
- New arrivals
- Featured products

## Phase 7 — Admin

Complete:

- Dashboard
- Orders
- Products
- Categories
- Courses
- Bundles
- Promotions
- Delivery
- Universities
- Customers
- Notifications
- Settings

## Phase 8 — Notifications

Build:

- In-app notifications
- Email provider
- WhatsApp provider abstraction
- Failure handling
- Notification logs

## Phase 9 — Production Polish

Complete:

- Responsive testing
- RTL testing
- Accessibility
- SEO
- Error handling
- Security review
- RLS verification
- Build checks
- Deployment documentation

---

# 62. Critical Acceptance Tests

Codex should create tests or at minimum a documented manual QA checklist for these.

## Auth

- Guest can browse.
- Guest can add to cart.
- Guest cannot place order.
- Login redirects back to checkout.
- Register redirects back to checkout.
- Google user with incomplete profile cannot place order.
- Normal customer cannot open `/admin`.

## Cart

- Guest cart persists.
- Guest cart survives login.
- Same item merges correctly.
- Unavailable item blocks checkout.

## Pricing

- Changing client-side displayed price cannot change server order price.
- Delivery is server calculated.
- Discount is server calculated.

## Delivery

- AIU campus rule returns 50 EGP when applicable.
- Admin can change AIU fee.
- Changed fee takes effect without code deployment.
- Governorate rule works.
- Free shipping threshold works.

## Orders

- New order status is pending.
- Order snapshots do not change after product edits.
- Admin can progress status.

## Cancellation

- At 30 minutes and still pending: direct cancel works.
- At 61 minutes and still pending: direct cancel is blocked.
- At 61 minutes: cancellation request works.
- Admin can approve.
- Admin can reject.
- Confirmed order cannot be cancelled from site.

## Availability

- No numeric inventory is displayed.
- Admin can mark variation unavailable.
- Unavailable variation cannot be added.
- Bundle with required unavailable item cannot be purchased.

## Internationalization

- Arabic switches to RTL.
- Arabic product/category names display.
- English returns to LTR.
- Admin remains English.

## Security

- Customer cannot write product data.
- Customer cannot update another user's profile/order.
- Customer cannot become Admin.
- Admin service secret never appears client-side.

---

# 63. README Requirements

Create a high-quality README containing:

- What DENTO HUB is
- Tech stack
- Local prerequisites
- Supabase project setup
- Environment variable setup
- Migration instructions
- Seed instructions
- Google OAuth setup
- How to create the one Admin account
- Email provider setup
- WhatsApp provider setup
- How delivery rules work
- How to deploy to Vercel
- Production checklist
- Known future features

Admin setup instructions must explicitly say:

**Never share or commit the Admin password.**

---

# 64. Definition of Done

DENTO HUB Version 1 is complete when:

- Customer storefront is polished and responsive.
- English and Arabic both work correctly.
- Arabic uses RTL.
- Guest shopping cart works without an account.
- Account is required to complete checkout.
- Guest cart survives authentication.
- Email/password and Google sign-in work.
- Required student profile fields work.
- University selection is searchable and database-managed.
- Academic years 1–5 work.
- Products, variations, categories, courses, bundles, discounts, and banners are manageable by Admin.
- Product variation prices are independent.
- Availability uses boolean status, not numeric stock.
- COD checkout works.
- Delivery rules are admin-managed.
- AIU delivery starts at 50 EGP and is editable.
- Orders start Pending.
- One-hour cancellation policy works server-side.
- Post-hour cancellation requests work.
- Admin order status workflow works.
- In-app, email, and WhatsApp notification architecture works.
- Support email is shown correctly.
- Only the single Admin can access Admin pages.
- Normal users cannot gain Admin access.
- RLS/security policies are in place.
- Production build succeeds.
- Vercel/Supabase deployment steps are documented.

---

# 65. Final Product Summary

**DENTO HUB 🦷 — Your Dental Supply Hub** is a bilingual Egyptian dental-supplies e-commerce platform built specifically around the needs of dental students.

Its defining features are:

- Dental-specific catalog
- Shop by course
- Shop by academic year
- Student kits/bundles
- Arabic + English
- Guest cart with authentication only at checkout
- University-based customer profiles
- Egypt-focused delivery
- Admin-adjustable university/governorate delivery fees
- 50 EGP initial Alamein International University delivery
- COD
- Website + email + WhatsApp order communication
- Single secured Admin account
- Production-ready Supabase/Vercel architecture

Build this as a real application that can be operated, maintained, and expanded—not as a visual prototype.


---

# 66. REAL UPLOADED CATALOG & AIU COURSE SUPPLY DATA

This section replaces placeholder-only catalog assumptions with the real source material supplied by the DENTO HUB owner.

## 66.1 Uploaded source files

The current source bundle contains:

1. `alamein list 2.xlsx`
2. `Instruments List For Operative Dentistry (From I to VI).pdf`
3. `Endo 2 supplies.pdf`
4. `Removable 3 INSTRUMENTS .pdf`
5. `Fixed 3 instrument.pdf`

Treat these as owner-supplied source data.

The PDFs are Alamein International University (AIU) course/instrument references. The spreadsheet is a price/source list.

---

# 67. PRICE IMPORT RULES

The spreadsheet contains three columns:

```text
NAME
TOGARY
BEE3
```

There are **119 product rows**.

At the time this specification was updated:

- `NAME` contains the source product name.
- `TOGARY` contains a price/value for many products.
- `BEE3` is blank throughout the supplied sheet.

## 67.1 Critical pricing safety rule

Do **not** automatically show the `TOGARY` value to customers as the website selling price.

Preserve the source data exactly and import it into an Admin-only/internal field such as:

```text
source_togary_price_raw
```

or, only if the owner later confirms the meaning:

```text
cost_price_egp
```

Map `BEE3` to the public/customer selling-price field only after the owner enters a value.

Recommended product pricing fields:

```text
source_togary_price_raw TEXT NULL
cost_price_egp NUMERIC NULL
selling_price_egp NUMERIC NULL
price_note TEXT NULL
```

Until a valid public `selling_price_egp` is entered:

- Keep the product as `draft` / not purchasable.
- The Admin may still view/edit it.
- Do not expose a guessed selling price.
- Do not derive a markup automatically unless the owner explicitly adds a markup rule later.

## 67.2 Pack-price notes

Some source values contain quantity notes, for example:

```text
124(3pcs)
65(2pcs)
```

Preserve the raw value and split the note if useful:

```text
raw = "124(3pcs)"
numeric_value = 124
pack_note = "3 pcs"
```

Do **not** assume whether the numeric value is per-piece or for the whole pack unless the owner confirms it.

---

# 68. RAW PRICE SHEET DATA

The following table is the current source data from `alamein list 2.xlsx`.

| # | Source product name | TOGARY | BEE3 |
|---:|---|---:|---:|
| 1 | MIRROR | 32 |  |
| 2 | probe | 24 |  |
| 3 | tweezer | 40 |  |
| 4 | disposable tray | 13 |  |
| 5 | cheeck rertractor | 13 |  |
| 6 | dental photography mirror |  |  |
| 7 | four holes high handpiece |  |  |
| 8 | low speed handpiece |  |  |
| 9 | handpiece oil | 130 |  |
| 10 | 245 bur | 42 |  |
| 11 | straight fissure bur | 42 |  |
| 12 | round bur | 42 |  |
| 13 | 169 bur | 42 |  |
| 14 | bur holder | 26.5 |  |
| 15 | low speed round bur  | 47 |  |
| 16 | chisel | 124(3pcs) |  |
| 17 | enamel hatchet | 24 |  |
| 18 | cervical edge trimmer |  |  |
| 19 | spoon excavator | 24 |  |
| 20 | discoid excavator | 24 |  |
| 21 | zinc polycarboxylate cement | 79 |  |
| 22 | glass ionomer cement |  |  |
| 23 | calcium hydroxide |  |  |
| 24 | MTA | 37 |  |
| 25 | varnish |  |  |
| 26 | glass ionomer capsule | 78.75 |  |
| 27 | glass slab |  |  |
| 28 | cement spatula | 24 |  |
| 29 | smooth condenser | 24 |  |
| 30 | GIC capsule applicator | 892 |  |
| 31 | calcium hydroxide applicator |  |  |
| 32 | MTA applicator | 750 |  |
| 33 | microbrush | 42 |  |
| 34 | amalgam capsules |  |  |
| 35 | amalgam carrier | 80 |  |
| 36 | serrated condenser | 24 |  |
| 37 | egg shaped burnisher | 24 |  |
| 38 | hollenbeck carver | 24 |  |
| 39 | cotton rolls | 15.5 |  |
| 40 | tofflemire retainer | 75 |  |
| 41 | wedges |  |  |
| 42 | scissors | 40 |  |
| 43 | flame shaped bur | 8.5 |  |
| 44 | rubber dam kit | 950 |  |
| 45 | phosporic acid etching gel | 31.5 |  |
| 46 | bonding agent | 446 |  |
| 47 | packable composite resin restoration shade A1,A2&A3 | 210 |  |
| 48 | LIGHT CURE | 1420 |  |
| 49 | PUTTY index | 997 |  |
| 50 | scalpel | 24 |  |
| 51 | blade | 24 |  |
| 52 | compsoite brown stain |  |  |
| 53 | glycerin gel |  |  |
| 54 | celluloid matrices |  |  |
| 55 | 2 bioclear matrices |  |  |
| 56 | paddle shape plastic filling |  |  |
| 57 | PK thomas carver | 24 |  |
| 58 | anatomical burnisher | 24 |  |
| 59 | composite brush | 42 |  |
| 60 | stainless steel tray |  |  |
| 61 | adhesive tip(holding tip) |  |  |
| 62 | heavy putty | 997 |  |
| 63 | self cure composite resin |  |  |
| 64 | depth cutting bur |  |  |
| 65 | disposable three way air water syringe |  |  |
| 66 | saliva ejector | 105 |  |
| 67 | cups | 12 |  |
| 68 | towel holder |  |  |
| 69 | cotton holder | 68 |  |
| 70 | cotton roll dispenser |  |  |
| 71 | autoclavable cotton holder | 65(2pcs) |  |
| 72 | topical anesthesia | 36 |  |
| 73 | anesthesia sygringe |  |  |
| 74 | over gloves | 7 |  |
| 75 | temporary filling material | 84 |  |
| 76 | light senstive mixing well |  |  |
| 77 | retraction cord |  |  |
| 78 | hemostatic liquid | 68 |  |
| 79 | retraction cord applicator |  |  |
| 80 | over shoes |  |  |
| 81 | vinyl polysiloxane |  |  |
| 82 | alginate | 150 |  |
| 83 | rubber bowl | 15.5 |  |
| 84 | alginate mixing spatula | 15.5 |  |
| 85 | hydro fluoric acid | 178 |  |
| 86 | silane | 210 |  |
| 87 | zirconia primer | 240 |  |
| 88 | dual cure resin cement |  |  |
| 89 | oxygen inhibiting gel |  |  |
| 90 | bleaching kit | 997.5 |  |
| 91 | ivory teeth | 10 |  |
| 92 | sticky wax | 10 |  |
| 93 | dispensing gun | 470 |  |
| 94 | die silicon material |  |  |
| 95 | rag wheel | 37 |  |
| 96 | white acrylic resin | 380 |  |
| 97 | gutta percha | 99 |  |
| 98 | spreaders | 99 |  |
| 99 | paper point | 99 |  |
| 100 | EDTA | 42 |  |
| 101 | chlorohexidine | 31.5 |  |
| 102 | sodium hypochlorite | 31.5 |  |
| 103 | side vented needle | 360 |  |
| 104 | endo file holder | 26 |  |
| 105 | endo ruler | 52.5 |  |
| 106 | endo files | 89 |  |
| 107 | acrylic bur | 52.5 |  |
| 108 | acrylic finishing bur | 52 |  |
| 109 | diamond finishing disc | 36 |  |
| 110 | wax knife | 24 |  |
| 111 | carver | 24 |  |
| 112 | base plate wax | 17 |  |
| 113 | stock tray | 13 |  |
| 114 | spatula | 24 |  |
| 115 | wide blade spatula | 26 |  |
| 116 | 118 peeso collar plier |  |  |
| 117 | cutting plier | 450 |  |
| 118 | ss wire | 68 |  |
| 119 | vaseline |  |  |

---

# 69. AIU ENDODONTICS 2 SUPPLY LIST

Source: `Endo 2 supplies.pdf`

Course shown in the source:

```text
Alamein International University
Faculty of Dentistry
Conservative Dentistry Department
Endodontics Division
Endodontics 2 (CDD322)
```

Store this source/course association so products can later be browsed or grouped by course.

Do not infer the student's academic year from the course number alone.

Required/mentioned supplies and instruments:

- Non-surgical gloves (Nitrile / Latex / Vinyl)
- Over gloves
- Mask
- Eye goggles
- Grey scrub
- White lab coat
- Wrapping film
- Disposable towels
- Disposable tray
- Surface disinfectant / disinfectant
- Hand soap
- Blue wax
- Torch
- Wax knife
- Small sterilization pouches
- Thin permanent marker (1 mm)
- Pencil
- Plastic tray with high sides
- Cotton pliers
- Sharp explorer / Endodontic explorer
- Four-hole high-speed handpiece
- Round carbide burs or diamond stones — sizes #1, #2, #4, #6
- Tapered carbide fissure bur
- Safe-ended tapered diamond stones — different sizes
- Endo-Z bur
- Bur holder
- K-Files 25 mm — size #8
- K-Files 25 mm — size #10
- K-Files 25 mm — sizes #15–#40
- K-Files 25 mm — sizes #45–#80
- H-Files 25 mm — sizes #15–#40
- H-Files 25 mm — sizes #45–#80
- Endobloc / Endodontic ruler
- 70% ethyl alcohol
- Gauze swabs
- Endodontic file holder
- Luer-lock syringe
- Side-vented irrigation needle tips
- 5.25% sodium hypochlorite
- Plastic cups
- EDTA paste or gel
- 17% EDTA solution
- 2% chlorhexidine
- Standardized gutta-percha points — sizes #15–#40
- Standardized gutta-percha points — sizes #45–#80
- Absorbent paper points — sizes #15–#40
- Absorbent paper points — sizes #45–#80
- Eugenol-based sealer
- Cement spatula
- Paper pads
- Sharp scissors
- Finger spreaders
- Hand plugger

### Non-retail course requirement note

The PDF also instructs students to collect suitable extracted permanent teeth and explains infection-control handling.

Do **not** automatically create a normal e-commerce product for human extracted teeth. This is a course requirement, not a standard retail SKU.

---

# 70. AIU FIXED PROSTHODONTICS 3 / PDD323 LIST

Source: `Fixed 3 instrument.pdf`

Course code shown:

```text
PDD323
```

Supplies/instruments:

- Towel
- Surface disinfectant spray
- Diagnostic set — Mirror, Probe and Tweezer
- Model with full set of typodont teeth — Maxillary + Mandibular
- High-speed handpiece
- Tapered round-end diamond stone #10, #11, #12, #13 — green or blue grit
- Tapered round-end diamond finishing stone #11, #12, #13 — red or yellow grit
- Tapered flat-end diamond stone #12, #13 — green or blue grit
- Straight handpiece + low-speed turbine
- Diamond finishing disc for acrylic resin
- Acrylic bur
- Acrylic finishing stones
- Rag wheel
- Bur holder
- Putty impression material
- Light-body impression material
- Stainless-steel trays — different sizes
- Impression mixing spatula
- Glass slab
- Scalpel handle
- Blade #11
- White acrylic resin (powder/monomer) OR bis-acrylic temporary crown material
- Glass Dappen dish
- Dental carver

Keep `"OR"` choices as alternatives rather than assuming the student must buy both.

Example:

```text
White acrylic resin (powder/monomer)
OR
Bis-acrylic temporary crown material
```

---

# 71. AIU REMOVABLE PROSTHODONTICS III LIST

Source: `Removable 3 INSTRUMENTS .pdf`

Source heading:

```text
Faculty of Dentistry
Prosthodontic Department
Removable Prosthodontics III
PDD 313
```

Supplies/instruments:

- Wax knife
- Carver
- Rubber bowl
- Scissors & cutter
- Spatula
- Two glass slabs
- Alginate
- Green self-cure acrylic
- Small glass cup
- Stock trays — Partial No. 2 and No. 3
- Clay
- Base plate wax
- Wide-blade spatula
- Torch
- Gas lighter refill
- Acrylic bur
- Vaseline
- 118 Peeso collar pliers
- Cutting pliers
- Colored pencils — red, blue, brown, black
- Low-speed handpiece
- Tapered round bur — size 13 (for low-speed handpiece)
- Inverted cone bur — diameter 2 (for low-speed handpiece)
- Round bur — diameter 1.5 (for low-speed handpiece)
- Ivory teeth — upper/lower first molar, upper/lower premolars, maxillary canines
- Dental stainless-steel wire — size 0.7, 2–3 meters

---

# 72. AIU OPERATIVE DENTISTRY SUPPLY LIST

Source: `Instruments List For Operative Dentistry (From I to VI).pdf`

The supplied PDF pages include AIU Operative Dentistry material covering rubber dam isolation and direct composite restoration.

Do not infer academic year from the file title alone.

Supplies/instruments visible in the supplied pages:

- Rubber dam sheets — medium
- Rubber dam template (R.D template)
- Winged and wingless rubber dam clamps — anterior, premolar, molar
- Rubber dam clamp forceps
- Rubber dam punch
- Rubber dam metal frame
- Glycerin
- Brush
- Dental floss
- Elastic wedges
- Teflon
- Liquid dam (Liquidam)
- 37% phosphoric acid etching gel
- Bonding agent
- Microbrush
- Packable composite resin restoration — shades A1, A2, A3 (Composite Kit)
- Composite compules — E1, D1, D3
- Compule gun
- Flowable composite resin restoration — shade A3
- Light curing device — control modes/time; caries-detector mode optional
- Heavy putty and light-body impression material
- Scalpel + blade
- Composite stain — brown/white/blue (optional)
- Glycerin gel
- Celluloid strips
- Bioclear matrices for anterior
- Sectional matrices — different sizes + V-shape ring + diamond wedges
- Saddle matrix
- 360° matrix
- Paddle-shape plastic filling instrument / composite application kit
- Small ball burnisher
- Composite condenser
- PK Thomas carver
- Anatomical burnisher
- Fork-type tight contact tool
- Composite modeling brush (hair or silicon) + modeling resin (optional)
- Flame-shape finishing bur / composite finishing burs kit
- TR 11, 12, 13 finishing burs
- Finishing discs kit
- Finishing strips
- Polishing burs kit — rubber cups / wheels / points
- Polishing paste

Optional items in the source must be tagged as optional where applicable, rather than shown as mandatory.

---

# 73. CATALOG NORMALIZATION RULES

The source files contain spelling variations, abbreviations, and informal naming.

Examples include:

```text
sygringe
compsoite
phosporic
senstive
cheeck rertractor
R.D
PUTTY index
LIGHT CURE
```

The public catalog should use clean professional names, while preserving source aliases for matching/search/import.

Recommended fields:

```text
canonical_name_en
canonical_name_ar
source_name
search_aliases
```

Example:

```text
canonical_name_en: "Phosphoric Acid Etching Gel 37%"
source_name: "phosporic acid etching gel"
search_aliases:
  - phosphoric acid
  - etching gel
  - etch
  - phosporic acid etching gel
```

Do not silently discard the original source name.

---

# 74. COURSE-SUPPLY RELATIONSHIPS

A product can belong to multiple course supply lists.

Add a relationship model such as:

```text
course_supply_lists
course_supply_list_items
```

Recommended:

```text
course_supply_lists
-------------------
id
university_id
course_id
title_en
title_ar
source_reference
is_active

course_supply_list_items
------------------------
id
supply_list_id
product_id nullable
source_item_name
is_required
is_optional
notes
sort_order
```

Why `product_id` may initially be null:

- Some PDF items may not yet exist in the DENTO HUB price/catalog sheet.
- Admin should be able to map a source requirement to a real store product later.
- The source list must remain visible internally even if a product has not yet been sourced.

This prevents Codex from inventing products or prices.

---

# 75. AIU COURSE SHOPPING EXPERIENCE

Because the supplied catalog is based on real AIU course lists, DENTO HUB should support a useful course-list experience without forcing everything into a discounted bundle.

Recommended customer flow:

```text
Shop by Course
    ↓
Select course
    ↓
See required supplies
    ↓
Available DENTO HUB products are purchasable
    ↓
Missing/unavailable products are clearly marked
```

For an AIU student, the website can show:

```text
Alamein International University
Endodontics 2 (CDD322)
```

and list mapped supplies.

Important distinction:

### Supply List

Represents the university/course requirements.

- Items remain individually selectable.
- May contain optional items.
- May contain alternatives.
- Does not require one fixed price.

### Bundle / Student Kit

A commercial DENTO HUB offer.

- Created by Admin.
- Contains selected store products.
- Has its own bundle price.
- May be based on a course supply list.
- Does not have to contain every requirement.

Never automatically convert every PDF list into a paid bundle.

---

# 76. PRODUCT IMPORT STATUS

When importing the 119 spreadsheet rows:

1. Create or stage normalized product records.
2. Preserve the original source name.
3. Preserve `TOGARY` raw value.
4. Leave customer selling price empty because `BEE3` is empty.
5. Default product visibility/purchasability to draft/off until:
   - product name is reviewed,
   - category/course is assigned,
   - image is added when required,
   - public selling price is set,
   - availability is confirmed.
6. Admin can activate products one by one or in bulk later.

This is essential: **do not make the store publicly sell products using uncertain source pricing.**

---

# 77. ADMIN PRICE MANAGEMENT UPDATE

Add a dedicated Admin-friendly pricing workflow.

On Admin Product edit page show:

```text
Source Name
Source TOGARY Value        [Admin only]
Cost/Internal Price        [optional]
Selling Price (EGP)        [required before publish]
Discount
Final Customer Price
Availability
Publish Status
```

Admin dashboard should also provide a filter:

```text
Products Missing Selling Price
```

and show the count.

Suggested statuses:

```text
Draft
Ready
Published
Inactive
```

A product cannot become `Published` if:

- selling price is missing/invalid, or
- no active purchasable variation has a valid selling price.

---

# 78. VARIATION IMPORT GUIDANCE FROM REAL DATA

Some supplied items should naturally become variations rather than unrelated products.

Examples:

### Packable Composite Resin

```text
A1
A2
A3
```

### Endodontic Files

```text
K-File:
#8
#10
#15-#40
#45-#80

H-File:
#15-#40
#45-#80
```

### Gutta-Percha / Paper Points

```text
#15-#40
#45-#80
```

### Gloves

```text
Nitrile
Latex
Vinyl
```

and optionally size variants if DENTO HUB later sells them by size.

### Diamond Stones / Burs

Use size/type/grit attributes where the source specifies them.

Each variation can have an independent public selling price and availability, consistent with the previously agreed DENTO HUB rules.

Do not automatically assume the single `TOGARY` source value applies to every variation when the source is ambiguous.

---

# 79. SOURCE-TO-CATALOG MATCHING

Codex should not use naive exact-string matching only.

Use normalization for import/admin suggestions:

- lowercase
- trim whitespace
- normalize repeated spaces
- remove harmless punctuation differences
- retain numbers and dental identifiers
- maintain alias table

However, **do not automatically merge uncertain items**.

Examples that may be related but require owner/Admin review:

```text
spatula
cement spatula
alginate mixing spatula
wide blade spatula

round bur
low speed round bur
tapered round bur

carver
dental carver
PK Thomas carver
Hollenback carver
```

These are not automatically interchangeable SKUs.

When match confidence is uncertain, create an Admin review state.

---

# 80. REAL-DATA ACCEPTANCE TESTS

Add these tests to the project QA checklist.

## Spreadsheet import

- All 119 source rows can be imported/staged.
- Source names are preserved.
- Blank `BEE3` does not create a customer selling price.
- `124(3pcs)` and `65(2pcs)` are not misparsed as clean per-item customer prices.
- Products with missing selling price cannot be purchased.

## Course lists

- Endodontics 2 source list can be stored.
- Fixed 3/PDD323 source list can be stored.
- Removable Prosthodontics III/PDD313 source list can be stored.
- Operative Dentistry source list can be stored.
- One catalog product may map to multiple course lists.
- A source-list item can exist without a mapped store product.
- Optional/alternative items can be represented.

## AIU

- AIU course lists are linked to Alamein International University.
- AIU remains selectable in the customer university field.
- The previously defined AIU delivery rule remains 50 EGP unless Admin edits it.

---

# 81. CURRENT DATA GAPS — DO NOT GUESS

The supplied data still does **not** provide:

- Customer selling prices in `BEE3`.
- Product photos for the actual inventory.
- Confirmed brands for every item.
- Confirmed SKU codes for every item.
- Exact customer-facing Arabic translations for every product.
- Confirmed academic-year assignment for each supplied course list.
- Confirmed pack interpretation for every packed-price note.
- Exact WhatsApp support number.
- Exact support phone number.
- Admin login email.

Codex must leave these configurable or incomplete rather than inventing values.

---

# 82. UPDATED DEFINITION OF DATA READINESS

The product catalog is ready for public launch only when Admin has reviewed imported/staged products and supplied:

- canonical product name,
- public selling price,
- availability,
- category,
- relevant variations,
- product image(s) where appropriate,
- course mappings,
- optional Arabic customer-facing name/description review.

The existing `TOGARY` values are useful source data but are **not sufficient by themselves to launch customer pricing**.

---

# 83. FINAL CODEX DATA INSTRUCTION

When building DENTO HUB from this specification:

- Build the schema and Admin import workflow to support the uploaded real catalog.
- Seed the 119 spreadsheet source rows as draft/staged source products or import fixtures.
- Seed the four AIU course supply lists above.
- Do not invent missing `BEE3` prices.
- Do not expose `TOGARY` as customer price.
- Do not invent product brands.
- Do not infer academic year solely from course codes.
- Do not treat every course list as a bundle.
- Preserve source names and aliases while presenting cleaned catalog names.
- Keep all real prices and product availability editable by the single Admin.

