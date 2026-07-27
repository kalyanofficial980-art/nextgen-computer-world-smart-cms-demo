# NextGen Computer World — Advanced Business CMS

A production-oriented Next.js and Supabase catalogue, sales and website-management system for a computer retail and technical-support business.

## Owner CMS modules

- Dashboard overview and automatic activity history
- Product catalogue, SKU, inventory quantity, pricing, timed offers and SEO
- Product primary-image and multi-image gallery uploads
- Product archive and restore
- Customer enquiries and status workflow
- Product categories
- Business contact details and service areas
- Logo, favicon, hero image and website colour controls
- Announcement bar and homepage section ordering
- Offers with dates, coupon codes and uploaded artwork
- Customer reviews with ratings, approval and image upload
- YouTube, Instagram, Facebook and uploaded-video management
- Customers and CSV export
- Sales and sold history with database-controlled inventory adjustment
- Legal policies, FAQs and analytics identifiers

## Public website

- Dynamic branding and theme
- Product search, filters, comparison and galleries
- Offers, reviews, videos and reels pages
- Optional business activity and anonymised recent-sales sections
- Editable privacy, terms, refund, warranty and delivery policies
- WhatsApp and enquiry conversion paths
- Dynamic metadata, sitemap, robots rules and security headers

## Required environment variables

Copy `.env.example` to `.env.local` and provide the project values.

```dotenv
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_CONTACT_EMAIL=kalyanofficial980@gmail.com
NEXT_PUBLIC_OWNER_EMAIL=kalyanofficial980@gmail.com
SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
```

`SUPABASE_SECRET_KEY` is server-only. Never expose it in browser components or commit it to Git.

## Local quality checks

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run typecheck
npm run lint
npm run build
```

## Database migrations

Apply migrations in order:

1. `202607270001_full_smart_catalogue_cms.sql`
2. `202607270002_client_ready_security.sql`
3. `202607270003_phase3a_branding_cms.sql`
4. `202607270004_phase3b_offers_phase3c_reviews.sql`
5. `202607270005_phase3d_phase3e_phase3f_advanced_business.sql`

The Phase 3 migrations create the advanced CMS tables, storage buckets, RLS policies, public-safe statistics functions, inventory triggers and activity logging.

## Important operating notes

- Only the authenticated owner/admin can manage private customers, sales and CMS content.
- Public sales sections expose product, quantity, date, city and public notes only. They do not expose customer contacts or private notes.
- Reviews should be published only with the customer’s permission.
- Legal-page seed content is a starting template and should be reviewed for the actual business.
- Sales marked `Part Paid` or `Paid` adjust product inventory automatically at the database level.
