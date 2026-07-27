-- Phase 3B + 3C: offers, customer reviews and direct image uploads.

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 2 and 160),
  slug text not null unique,
  description text not null default '',
  discount_label text not null default '',
  coupon_code text not null default '',
  image_url text not null default '',
  button_label text not null default 'View offer',
  button_link text not null default '/catalogue',
  starts_at timestamptz,
  ends_at timestamptz,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_valid_window check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(btrim(customer_name)) between 1 and 120),
  customer_city text not null default '',
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(btrim(review_text)) between 10 and 2000),
  product_or_service text not null default '',
  image_url text not null default '',
  verified_customer boolean not null default false,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  review_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_public_order_idx
on public.offers (active, featured desc, sort_order, created_at desc);

create index if not exists reviews_public_order_idx
on public.reviews (published, featured desc, sort_order, review_date desc);

alter table public.offers enable row level security;
alter table public.reviews enable row level security;

drop trigger if exists set_offers_updated_at on public.offers;
create trigger set_offers_updated_at
before update on public.offers
for each row execute procedure public.set_updated_at();

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute procedure public.set_updated_at();

drop policy if exists "public active offers read" on public.offers;
create policy "public active offers read"
on public.offers for select to anon, authenticated
using (
  active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
  or public.is_admin()
);

drop policy if exists "admin offers insert" on public.offers;
create policy "admin offers insert"
on public.offers for insert to authenticated
with check (public.is_admin());

drop policy if exists "admin offers update" on public.offers;
create policy "admin offers update"
on public.offers for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin offers delete" on public.offers;
create policy "admin offers delete"
on public.offers for delete to authenticated
using (public.is_admin());

drop policy if exists "public published reviews read" on public.reviews;
create policy "public published reviews read"
on public.reviews for select to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "admin reviews insert" on public.reviews;
create policy "admin reviews insert"
on public.reviews for insert to authenticated
with check (public.is_admin());

drop policy if exists "admin reviews update" on public.reviews;
create policy "admin reviews update"
on public.reviews for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin reviews delete" on public.reviews;
create policy "admin reviews delete"
on public.reviews for delete to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'offer-images',
    'offer-images',
    true,
    5242880,
    array['image/jpeg','image/png','image/webp']
  ),
  (
    'review-images',
    'review-images',
    true,
    5242880,
    array['image/jpeg','image/png','image/webp']
  )
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public offer images read" on storage.objects;
create policy "public offer images read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'offer-images');

drop policy if exists "admin offer images insert" on storage.objects;
create policy "admin offer images insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'offer-images' and public.is_admin());

drop policy if exists "admin offer images update" on storage.objects;
create policy "admin offer images update"
on storage.objects for update to authenticated
using (bucket_id = 'offer-images' and public.is_admin())
with check (bucket_id = 'offer-images' and public.is_admin());

drop policy if exists "admin offer images delete" on storage.objects;
create policy "admin offer images delete"
on storage.objects for delete to authenticated
using (bucket_id = 'offer-images' and public.is_admin());

drop policy if exists "public review images read" on storage.objects;
create policy "public review images read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'review-images');

drop policy if exists "admin review images insert" on storage.objects;
create policy "admin review images insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'review-images' and public.is_admin());

drop policy if exists "admin review images update" on storage.objects;
create policy "admin review images update"
on storage.objects for update to authenticated
using (bucket_id = 'review-images' and public.is_admin())
with check (bucket_id = 'review-images' and public.is_admin());

drop policy if exists "admin review images delete" on storage.objects;
create policy "admin review images delete"
on storage.objects for delete to authenticated
using (bucket_id = 'review-images' and public.is_admin());

-- A useful, truthful default offer gives the new public section content immediately.
insert into public.offers (
  title,
  slug,
  description,
  discount_label,
  button_label,
  button_link,
  featured,
  active,
  sort_order
)
values (
  'Ask for current product pricing',
  'current-product-pricing',
  'Tell us the product or configuration you need. We will confirm current availability, suitable alternatives and the latest price.',
  'Current pricing',
  'Send an enquiry',
  '/contact',
  true,
  true,
  10
)
on conflict (slug) do nothing;
