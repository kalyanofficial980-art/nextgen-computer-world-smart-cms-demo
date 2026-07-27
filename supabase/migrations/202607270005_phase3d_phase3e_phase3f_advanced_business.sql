-- NextGen Phase 3D + 3E + 3F compatibility upgrade.
-- Adds media, customers, sales, advanced inventory, homepage controls,
-- FAQs, legal CMS and activity logs on top of Phase 3A/3B/3C.

create extension if not exists pgcrypto;

alter table public.products
  add column if not exists sku text,
  add column if not exists stock_quantity integer not null default 0 check (stock_quantity >= 0),
  add column if not exists cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  add column if not exists regular_price numeric(12,2) check (regular_price is null or regular_price >= 0),
  add column if not exists offer_price numeric(12,2) check (offer_price is null or offer_price >= 0),
  add column if not exists offer_starts_at timestamptz,
  add column if not exists offer_ends_at timestamptz,
  add column if not exists best_seller boolean not null default false,
  add column if not exists new_arrival boolean not null default false,
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists deleted_at timestamptz;

create unique index if not exists products_sku_unique
  on public.products (lower(sku))
  where sku is not null and btrim(sku) <> '';

update public.products
set regular_price = coalesce(regular_price, price),
    stock_quantity = case
      when stock = 'In Stock' and stock_quantity = 0 then 1
      else stock_quantity
    end;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Phase 3A already created site_settings with singleton_key as the primary key.
-- Add the advanced columns and a stable id=1 unique key without replacing existing settings.
alter table public.site_settings
  add column if not exists id integer default 1,
  add column if not exists short_name text not null default 'NG',
  add column if not exists description text not null default 'Computers, laptops, upgrades, networking products and practical technical support.',
  add column if not exists contact_email text not null default 'kalyanofficial980@gmail.com',
  add column if not exists address_line text not null default 'Nellore City, Andhra Pradesh',
  add column if not exists map_url text not null default 'https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh',
  add column if not exists gst_number text not null default '',
  add column if not exists registration_number text not null default '',
  add column if not exists service_areas text[] not null default array['Nellore']::text[],
  add column if not exists logo_dark_url text not null default '',
  add column if not exists hero_badge text not null default 'Computers • Laptops • Upgrades • Support',
  add column if not exists announcement_active boolean not null default false,
  add column if not exists announcement_link text not null default '',
  add column if not exists youtube_url text not null default '',
  add column if not exists instagram_url text not null default '',
  add column if not exists facebook_url text not null default '',
  add column if not exists google_business_url text not null default '',
  add column if not exists google_analytics_id text not null default '',
  add column if not exists meta_pixel_id text not null default '',
  add column if not exists search_console_verification text not null default '',
  add column if not exists show_public_sales_stats boolean not null default true,
  add column if not exists show_recent_sales boolean not null default true;

update public.site_settings
set id = 1
where id is null;

alter table public.site_settings
  alter column id set default 1,
  alter column id set not null;

create unique index if not exists site_settings_single_id_unique
  on public.site_settings (id);

-- Preserve the values already entered through Phase 3A.
update public.site_settings
set
  short_name = case
    when btrim(short_name) = '' then 'NG'
    else short_name
  end,
  description = case
    when description = 'Computers, laptops, upgrades, networking products and practical technical support.'
      then tagline
    else description
  end,
  contact_email = email,
  address_line = location,
  map_url = maps_url,
  hero_badge = hero_eyebrow,
  hero_title = case
    when btrim(hero_highlight) <> ''
      and position(lower(hero_highlight) in lower(hero_title)) = 0
      then btrim(hero_title || ' ' || hero_highlight)
    else hero_title
  end,
  announcement_active = announcement_enabled
where singleton_key = 'main';

create table if not exists public.homepage_sections (
  section_key text primary key,
  title text not null,
  subtitle text not null default '',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
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
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_city text not null default '',
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 10 and 2000),
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

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  provider text not null check (provider in ('youtube','instagram','facebook','uploaded')),
  media_url text not null,
  thumbnail_url text not null default '',
  show_on_homepage boolean not null default true,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  address text not null default '',
  notes text not null default '',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  product_name text not null,
  sku text not null default '',
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  cost_amount numeric(12,2) check (cost_amount is null or cost_amount >= 0),
  payment_status text not null default 'Paid' check (payment_status in ('Pending','Part Paid','Paid','Refunded','Cancelled')),
  payment_method text not null default '',
  invoice_reference text not null default '',
  warranty_until date,
  customer_city text not null default '',
  public_note text not null default '',
  private_note text not null default '',
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep inventory and sold history consistent at the database level.
create or replace function public.sale_affects_inventory(p_status text)
returns boolean
language sql
immutable
as $$
  select coalesce(p_status, '') in ('Part Paid', 'Paid');
$$;

create or replace function public.apply_sale_inventory_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if tg_op in ('UPDATE', 'DELETE')
     and old.product_id is not null
     and public.sale_affects_inventory(old.payment_status) then
    update public.products
    set stock_quantity = stock_quantity + old.quantity,
        stock = 'In Stock'
    where id = old.product_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE')
     and new.product_id is not null
     and public.sale_affects_inventory(new.payment_status) then
    update public.products
    set stock_quantity = stock_quantity - new.quantity,
        stock = case when stock_quantity - new.quantity > 0 then 'In Stock' else 'Sold' end
    where id = new.product_id
      and stock_quantity >= new.quantity
    returning stock_quantity into remaining;

    if not found then
      raise exception 'Insufficient product stock for this sale.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists apply_sale_inventory_change on public.sales;
create trigger apply_sale_inventory_change
before insert or update or delete on public.sales
for each row execute procedure public.apply_sale_inventory_change();

create table if not exists public.legal_pages (
  page_key text primary key check (page_key in ('privacy','terms','refund','warranty','delivery')),
  title text not null,
  content text not null,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Updated-at triggers.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings','homepage_sections','offers','reviews','media_items',
    'customers','sales','legal_pages','faqs'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

-- Public-safe sales functions: no customer IDs, phones, emails or private notes.
create or replace function public.get_public_business_stats()
returns table (
  total_products bigint,
  total_units_sold bigint,
  total_reviews bigint,
  average_rating numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.products where active = true and deleted_at is null),
    (select coalesce(sum(quantity), 0)::bigint from public.sales where payment_status = 'Paid'),
    (select count(*) from public.reviews where published = true),
    (select coalesce(round(avg(rating)::numeric, 1), 0) from public.reviews where published = true);
$$;

create or replace function public.get_recent_public_sales(p_limit integer default 6)
returns table (
  product_name text,
  customer_city text,
  quantity integer,
  sold_at timestamptz,
  public_note text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.product_name, s.customer_city, s.quantity, s.sold_at, s.public_note
  from public.sales s
  where s.payment_status = 'Paid'
  order by s.sold_at desc
  limit greatest(1, least(coalesce(p_limit, 6), 20));
$$;

revoke all on function public.get_public_business_stats() from public;
revoke all on function public.get_recent_public_sales(integer) from public;
grant execute on function public.get_public_business_stats() to anon, authenticated;
grant execute on function public.get_recent_public_sales(integer) to anon, authenticated;

-- RLS.
alter table public.product_images enable row level security;
alter table public.site_settings enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.offers enable row level security;
alter table public.reviews enable row level security;
alter table public.media_items enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.legal_pages enable row level security;
alter table public.faqs enable row level security;
alter table public.activity_logs enable row level security;

-- Product gallery.
drop policy if exists "public product gallery read" on public.product_images;
create policy "public product gallery read" on public.product_images
for select to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id
      and (p.active = true or public.is_admin())
      and (p.deleted_at is null or public.is_admin())
  )
);

drop policy if exists "admin product gallery manage" on public.product_images;
create policy "admin product gallery manage" on public.product_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Site settings.
drop policy if exists "public site settings read" on public.site_settings;
create policy "public site settings read" on public.site_settings
for select to anon, authenticated using (id = 1);

drop policy if exists "admin site settings manage" on public.site_settings;
create policy "admin site settings manage" on public.site_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Homepage sections.
drop policy if exists "public homepage sections read" on public.homepage_sections;
create policy "public homepage sections read" on public.homepage_sections
for select to anon, authenticated using (enabled = true or public.is_admin());

drop policy if exists "admin homepage sections manage" on public.homepage_sections;
create policy "admin homepage sections manage" on public.homepage_sections
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Offers.
drop policy if exists "public active offers read" on public.offers;
create policy "public active offers read" on public.offers
for select to anon, authenticated
using (
  public.is_admin()
  or (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  )
);

drop policy if exists "admin offers manage" on public.offers;
create policy "admin offers manage" on public.offers
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Reviews.
drop policy if exists "public published reviews read" on public.reviews;
create policy "public published reviews read" on public.reviews
for select to anon, authenticated using (published = true or public.is_admin());

drop policy if exists "admin reviews manage" on public.reviews;
create policy "admin reviews manage" on public.reviews
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Media.
drop policy if exists "public published media read" on public.media_items;
create policy "public published media read" on public.media_items
for select to anon, authenticated using (published = true or public.is_admin());

drop policy if exists "admin media manage" on public.media_items;
create policy "admin media manage" on public.media_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Private business records.
drop policy if exists "admin customers manage" on public.customers;
create policy "admin customers manage" on public.customers
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin sales manage" on public.sales;
create policy "admin sales manage" on public.sales
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Legal and FAQs.
drop policy if exists "public legal pages read" on public.legal_pages;
create policy "public legal pages read" on public.legal_pages
for select to anon, authenticated using (published = true or public.is_admin());

drop policy if exists "admin legal pages manage" on public.legal_pages;
create policy "admin legal pages manage" on public.legal_pages
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public active faqs read" on public.faqs;
create policy "public active faqs read" on public.faqs
for select to anon, authenticated using (active = true or public.is_admin());

drop policy if exists "admin faqs manage" on public.faqs;
create policy "admin faqs manage" on public.faqs
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Activity logs are admin-only.
drop policy if exists "admin activity logs read" on public.activity_logs;
create policy "admin activity logs read" on public.activity_logs
for select to authenticated using (public.is_admin());

drop policy if exists "admin activity logs insert" on public.activity_logs;
create policy "admin activity logs insert" on public.activity_logs
for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

-- Update product public policy to hide soft-deleted records.
drop policy if exists "public active products read" on public.products;
create policy "public active products read" on public.products
for select to anon, authenticated
using ((active = true and deleted_at is null) or public.is_admin());

-- Grants.
grant select on public.product_images, public.site_settings, public.homepage_sections,
  public.offers, public.reviews, public.media_items, public.legal_pages, public.faqs
  to anon, authenticated;

grant select, insert, update, delete on public.product_images, public.site_settings,
  public.homepage_sections, public.offers, public.reviews, public.media_items,
  public.customers, public.sales, public.legal_pages, public.faqs, public.activity_logs
  to authenticated;

-- Storage buckets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets','brand-assets',true,5242880,array['image/jpeg','image/png','image/webp','image/x-icon']),
  ('offer-images','offer-images',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('review-images','review-images',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('media-assets','media-assets',true,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies use a single policy per action for all managed public buckets.
drop policy if exists "public advanced assets read" on storage.objects;
create policy "public advanced assets read" on storage.objects
for select to public
using (bucket_id in ('brand-assets','offer-images','review-images','media-assets'));

drop policy if exists "admin advanced assets insert" on storage.objects;
create policy "admin advanced assets insert" on storage.objects
for insert to authenticated
with check (bucket_id in ('brand-assets','offer-images','review-images','media-assets') and public.is_admin());

drop policy if exists "admin advanced assets update" on storage.objects;
create policy "admin advanced assets update" on storage.objects
for update to authenticated
using (bucket_id in ('brand-assets','offer-images','review-images','media-assets') and public.is_admin())
with check (bucket_id in ('brand-assets','offer-images','review-images','media-assets') and public.is_admin());

drop policy if exists "admin advanced assets delete" on storage.objects;
create policy "admin advanced assets delete" on storage.objects
for delete to authenticated
using (bucket_id in ('brand-assets','offer-images','review-images','media-assets') and public.is_admin());

-- Defaults.
insert into public.site_settings (singleton_key, id)
values ('main', 1)
on conflict (singleton_key) do update set id = excluded.id;

insert into public.homepage_sections (section_key, title, subtitle, enabled, sort_order)
values
  ('hero','Technology for work, study and business','Browse current products and get direct guidance.',true,10),
  ('offers','Current offers','Limited-time promotions and value bundles.',true,30),
  ('categories','Shop by category','Find the right product faster.',true,40),
  ('featured_products','Featured products','Popular options worth comparing.',true,50),
  ('new_arrivals','New arrivals','Recently added products and configurations.',true,60),
  ('best_sellers','Best sellers','Frequently selected products.',true,70),
  ('media','Videos and reels','Product showcases, setup tips and updates.',true,80),
  ('reviews','Customer reviews','Feedback from customers we have served.',true,90),
  ('sales_stats','Business activity','Products and customers served.',true,100),
  ('recent_sales','Recently sold','Recent anonymised sales activity.',true,110),
  ('services','Technical services','Product sales backed by practical support.',true,120),
  ('faq','Frequently asked questions','Helpful answers before you contact us.',true,130),
  ('contact_cta','Need help choosing?','Share your budget and intended use.',true,140)
on conflict (section_key) do nothing;

insert into public.offers (
  title, slug, description, discount_label, coupon_code, image_url,
  button_label, button_link, starts_at, ends_at, featured, active, sort_order
)
values (
  'Free Product Consultation',
  'free-product-consultation',
  'Share your budget and intended use. We will help you shortlist suitable computers, laptops, upgrades or accessories.',
  'Free guidance',
  '',
  '',
  'Send requirement',
  '/contact',
  null,
  null,
  true,
  true,
  10
)
on conflict (slug) do nothing;

insert into public.legal_pages (page_key, title, content, published)
values
  ('privacy','Privacy Policy','NextGen Computer World collects the name, phone number and enquiry details that customers voluntarily submit. This information is used to respond to product and service requests, maintain customer and warranty records, and improve support. Customer information is not sold to advertisers. Customers may request correction or deletion by contacting the business. External services such as WhatsApp, YouTube, Instagram and Google Maps are governed by their own privacy practices.',true),
  ('terms','Terms and Conditions','Product prices, stock, specifications, condition and warranty information may change. Customers should confirm all details before purchase. Images may be representative. Repair, upgrade, data-recovery and networking outcomes depend on inspection, compatibility and device condition. Final commercial terms are those shown on the invoice or written confirmation.',true),
  ('refund','Refund and Cancellation Policy','Refund and cancellation eligibility depends on product condition, supplier terms and the final invoice. Custom-built systems, installed software, activated licenses and specially ordered products may not be returnable. Contact the business promptly with the invoice reference for assessment.',true),
  ('warranty','Warranty Policy','Warranty coverage, duration and exclusions vary by product. Physical damage, liquid damage, misuse, unauthorised repair and software-related issues may be excluded. Keep the invoice and confirm the warranty terms before purchase.',true),
  ('delivery','Delivery Policy','Delivery availability, charges and timelines depend on location, product stock and order value. Confirm delivery details before payment. The customer should inspect the package and report visible damage immediately.',true)
on conflict (page_key) do nothing;

insert into public.faqs (question, answer, category, active, sort_order)
values
  ('Can you help me choose a laptop or desktop?','Yes. Share your budget, intended use and preferred specifications through WhatsApp or the enquiry form.','Products',true,10),
  ('Are prices and stock always current?','The catalogue is updated regularly, but final price and stock should be confirmed before purchase.','Products',true,20),
  ('Do you provide upgrades and technical support?','Yes. Compatibility and final service scope are confirmed after reviewing the device or requirement.','Services',true,30)
on conflict do nothing;

-- Automatic audit history for owner CMS changes.
create or replace function public.log_cms_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_data jsonb;
  record_id text;
  record_label text;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  record_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  record_id := coalesce(
    record_data ->> 'id',
    record_data ->> 'page_key',
    record_data ->> 'section_key',
    ''
  );
  record_label := coalesce(
    record_data ->> 'name',
    record_data ->> 'title',
    record_data ->> 'question',
    record_data ->> 'product_name',
    record_data ->> 'business_name',
    record_data ->> 'page_key',
    record_data ->> 'section_key',
    record_id
  );

  insert into public.activity_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    details
  ) values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    record_id,
    jsonb_build_object('label', record_label)
  );

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'products','categories','site_settings','homepage_sections','offers',
    'reviews','media_items','customers','sales','legal_pages','faqs'
  ] loop
    execute format('drop trigger if exists log_%I_activity on public.%I', table_name, table_name);
    execute format(
      'create trigger log_%I_activity after insert or update or delete on public.%I for each row execute procedure public.log_cms_activity()',
      table_name,
      table_name
    );
  end loop;
end $$;
