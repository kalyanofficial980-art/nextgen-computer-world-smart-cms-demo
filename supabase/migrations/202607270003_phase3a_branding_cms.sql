-- Phase 3A: branding CMS, logo uploads, theme colours, business details and homepage banner settings.

create table if not exists public.site_settings (
  singleton_key text primary key default 'main' check (singleton_key = 'main'),
  business_name text not null default 'NextGen Computer World',
  tagline text not null default 'Computers, upgrades and technical support you can trust.',
  short_tagline text not null default 'Computers • Upgrades • Support',
  logo_url text not null default '',
  favicon_url text not null default '',
  primary_color text not null default '#22d3ee',
  secondary_color text not null default '#2563eb',
  accent_color text not null default '#22c55e',
  background_color text not null default '#050b14',
  panel_color text not null default '#0b1728',
  text_color text not null default '#eff6ff',
  hero_eyebrow text not null default 'Computers • Laptops • Upgrades • Support',
  hero_title text not null default 'Technology that fits your',
  hero_highlight text not null default 'work, study and budget.',
  hero_description text not null default 'Browse current products, compare key specifications and contact us for availability, recommendations, upgrades and technical support.',
  hero_image_url text not null default '/products/gaming-pc.svg',
  hero_cta_label text not null default 'Browse products',
  hero_cta_href text not null default '/catalogue',
  hero_secondary_label text not null default 'Ask on WhatsApp',
  hero_secondary_href text not null default 'whatsapp',
  announcement_enabled boolean not null default true,
  announcement_text text not null default 'New stock, upgrades and service enquiries are open now.',
  phone_display text not null default '+91 83285 71256',
  phone_link text not null default '+918328571256',
  whatsapp_number text not null default '918328571256',
  email text not null default 'kalyanofficial980@gmail.com',
  owner_email text not null default 'kalyanofficial980@gmail.com',
  location text not null default 'Nellore City, Andhra Pradesh',
  maps_url text not null default 'https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh',
  working_hours text not null default 'Monday to Saturday, 10:00 AM – 8:00 PM',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute procedure public.set_updated_at();

drop policy if exists "public site settings read" on public.site_settings;
create policy "public site settings read"
on public.site_settings for select to anon, authenticated
using (singleton_key = 'main');

drop policy if exists "admin site settings insert" on public.site_settings;
create policy "admin site settings insert"
on public.site_settings for insert to authenticated
with check (public.is_admin() and singleton_key = 'main');

drop policy if exists "admin site settings update" on public.site_settings;
create policy "admin site settings update"
on public.site_settings for update to authenticated
using (public.is_admin() and singleton_key = 'main')
with check (public.is_admin() and singleton_key = 'main');

drop policy if exists "admin site settings delete" on public.site_settings;
create policy "admin site settings delete"
on public.site_settings for delete to authenticated
using (public.is_admin() and singleton_key = 'main');

insert into public.site_settings (singleton_key)
values ('main')
on conflict (singleton_key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/x-icon']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public brand assets read" on storage.objects;
create policy "public brand assets read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'brand-assets');

drop policy if exists "admin brand assets insert" on storage.objects;
create policy "admin brand assets insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'brand-assets' and public.is_admin());

drop policy if exists "admin brand assets update" on storage.objects;
create policy "admin brand assets update"
on storage.objects for update to authenticated
using (bucket_id = 'brand-assets' and public.is_admin())
with check (bucket_id = 'brand-assets' and public.is_admin());

drop policy if exists "admin brand assets delete" on storage.objects;
create policy "admin brand assets delete"
on storage.objects for delete to authenticated
using (bucket_id = 'brand-assets' and public.is_admin());
