# Phase 2 — Supabase CMS Implementation Plan

This public website intentionally uses local typed product data first. The next phase will connect the owner-managed CMS.

## Recommended Stack
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- `@supabase/supabase-js`
- `@supabase/ssr`
- Next.js Server Components
- Server Actions or Route Handlers for secure mutations

Do not use the deprecated Auth Helpers package together with `@supabase/ssr`.

## Planned Tables

### profiles
- id
- email
- full_name
- role
- created_at

### categories
- id
- name
- slug
- sort_order
- active

### products
- id
- name
- slug
- category_id
- brand
- processor
- ram
- storage
- price
- condition
- stock_status
- warranty
- description
- specifications jsonb
- featured
- active
- created_at
- updated_at

### product_images
- id
- product_id
- storage_path
- alt_text
- sort_order

### offers
- id
- title
- description
- start_at
- end_at
- active

### enquiries
- id
- enquiry_type
- product_id
- customer_name
- phone
- email
- message
- status
- created_at

### business_settings
- id
- phone
- whatsapp
- email
- address
- map_url
- timings
- social_links jsonb

## Security
- Public users receive read access only to active products and categories.
- Only authenticated owner/admin users can insert, update or delete catalogue records.
- Storage upload policies must restrict product-image writes to authorised users.
- Supabase secret keys must only be used in server-only code and never exposed to the browser.
- Use Row Level Security on every exposed table.

## Migration Strategy
1. Create Supabase project.
2. Add environment variables from `.env.example`.
3. Install `@supabase/supabase-js` and `@supabase/ssr`.
4. Create database schema and RLS policies.
5. Create server/browser Supabase clients.
6. Replace `lib/product-repository.ts` with Supabase queries.
7. Protect `/admin`.
8. Connect admin forms to secure server mutations.
9. Add Storage image uploads.
10. Test auth, permissions, validation, failure states and backups.
