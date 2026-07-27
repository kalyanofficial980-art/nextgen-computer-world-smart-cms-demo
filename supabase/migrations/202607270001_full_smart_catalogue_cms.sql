create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  brand text not null,
  processor text not null default 'Not Applicable',
  ram text not null default 'Not Applicable',
  storage text not null default 'Not Applicable',
  price numeric(12,2) not null check (price >= 0),
  condition text not null check (condition in ('New','Like New','Excellent','Good')),
  stock text not null check (stock in ('In Stock','Out of Stock','Coming Soon','Sold')),
  warranty text not null,
  image_url text not null,
  featured boolean not null default false,
  active boolean not null default true,
  description text not null,
  specs jsonb not null default '{}'::jsonb,
  included text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_type text not null check (enquiry_type in ('repair','exchange','custom PC','general')),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  budget_or_product text not null default '',
  preferred_time text not null default '',
  message text not null check (char_length(message) between 5 and 2000),
  status text not null default 'New' check (status in ('New','Contacted','Interested','Closed','Not Interested')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) = lower('kalayanofficial980@gmail.com')
        then 'admin'
      else 'viewer'
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      role = case
        when lower(excluded.email) = lower('kalayanofficial980@gmail.com')
          then 'admin'
        else public.profiles.role
      end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "profile owner can read" on public.profiles;
create policy "profile owner can read"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "public categories read" on public.categories;
create policy "public categories read"
on public.categories for select to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "admin categories manage" on public.categories;
create policy "admin categories manage"
on public.categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public active products read" on public.products;
create policy "public active products read"
on public.products for select to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "admin products insert" on public.products;
create policy "admin products insert"
on public.products for insert to authenticated
with check (public.is_admin());

drop policy if exists "admin products update" on public.products;
create policy "admin products update"
on public.products for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin products delete" on public.products;
create policy "admin products delete"
on public.products for delete to authenticated
using (public.is_admin());

drop policy if exists "public enquiries insert" on public.enquiries;
create policy "public enquiries insert"
on public.enquiries for insert to anon, authenticated
with check (
  char_length(customer_name) between 2 and 100
  and char_length(phone) between 7 and 30
  and char_length(message) between 5 and 2000
);

drop policy if exists "admin enquiries read" on public.enquiries;
create policy "admin enquiries read"
on public.enquiries for select to authenticated
using (public.is_admin());

drop policy if exists "admin enquiries update" on public.enquiries;
create policy "admin enquiries update"
on public.enquiries for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin enquiries delete" on public.enquiries;
create policy "admin enquiries delete"
on public.enquiries for delete to authenticated
using (public.is_admin());

grant select on public.categories, public.products to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.enquiries, public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public product images read" on storage.objects;
create policy "public product images read"
on storage.objects for select to public
using (bucket_id = 'product-images');

drop policy if exists "admin product images insert" on storage.objects;
create policy "admin product images insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin product images update" on storage.objects;
create policy "admin product images update"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admin product images delete" on storage.objects;
create policy "admin product images delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

insert into public.categories (name, sort_order)
values
  ('Accessories', 1),
  ('Components', 2),
  ('Custom PCs', 3),
  ('Desktops', 4),
  ('Networking', 5),
  ('New Laptops', 6),
  ('Printers', 7),
  ('Refurbished Laptops', 8)
on conflict (name) do update set active = true, sort_order = excluded.sort_order;

insert into public.products (
  slug,name,category,brand,processor,ram,storage,price,condition,stock,warranty,
  image_url,featured,active,description,specs,included
)
values
  ('dell-latitude-5420','Dell Latitude 5420','Refurbished Laptops','Dell','Intel Core i5 11th Gen','16GB','512GB SSD',27999,'Like New','In Stock','6 Months','/products/business-laptop.svg',true,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('dell-latitude-7490','Dell Latitude 7490','Refurbished Laptops','Dell','Intel Core i5 8th Gen','8GB','256GB SSD',19999,'Excellent','In Stock','3 Months','/products/business-laptop.svg',false,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('hp-elitebook-840-g6','HP EliteBook 840 G6','Refurbished Laptops','HP','Intel Core i5 8th Gen','16GB','512GB SSD',25999,'Like New','In Stock','6 Months','/products/business-laptop.svg',true,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('hp-elitebook-850-g7','HP EliteBook 850 G7','Refurbished Laptops','HP','Intel Core i7 10th Gen','16GB','512GB SSD',36999,'Excellent','In Stock','6 Months','/products/business-laptop.svg',false,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('lenovo-thinkpad-t480','Lenovo ThinkPad T480','Refurbished Laptops','Lenovo','Intel Core i5 8th Gen','16GB','512GB SSD',23999,'Excellent','In Stock','6 Months','/products/business-laptop.svg',true,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('lenovo-thinkpad-x1-carbon','Lenovo ThinkPad X1 Carbon','Refurbished Laptops','Lenovo','Intel Core i7 8th Gen','16GB','512GB SSD',32999,'Like New','Sold','3 Months','/products/business-laptop.svg',false,true,'Business-class laptop with verified specifications, clearly stated condition and practical warranty information.','{"Display": "14-inch Full HD", "Graphics": "Integrated graphics", "Operating System": "Windows 11 Pro", "Ports": "USB-C, HDMI, USB-A", "Battery": "Condition based"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('hp-probook-440-g8','HP ProBook 440 G8','New Laptops','HP','Intel Core i5 11th Gen','8GB','512GB SSD',46999,'New','In Stock','1 Year','/products/new-laptop.svg',true,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('lenovo-thinkpad-e14','Lenovo ThinkPad E14','New Laptops','Lenovo','AMD Ryzen 5','16GB','512GB SSD',51999,'New','In Stock','1 Year','/products/new-laptop.svg',false,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('asus-vivobook-15','ASUS VivoBook 15','New Laptops','ASUS','Intel Core i5 12th Gen','16GB','512GB SSD',54999,'New','In Stock','1 Year','/products/new-laptop.svg',true,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('acer-aspire-5','Acer Aspire 5','New Laptops','Acer','Intel Core i5 13th Gen','16GB','512GB SSD',57999,'New','Out of Stock','1 Year','/products/new-laptop.svg',false,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('asus-tuf-gaming-f15','ASUS TUF Gaming F15','New Laptops','ASUS','Intel Core i7 13th Gen','16GB','1TB SSD',89999,'New','In Stock','1 Year','/products/gaming-laptop.svg',true,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('lenovo-loq-15','Lenovo LOQ 15','New Laptops','Lenovo','AMD Ryzen 7','16GB','1TB SSD',94999,'New','Coming Soon','1 Year','/products/gaming-laptop.svg',false,true,'Modern laptop for study, work and everyday productivity with current-generation performance.','{"Display": "15.6-inch Full HD", "Graphics": "Integrated / Dedicated by model", "Operating System": "Windows 11", "Ports": "USB-C, HDMI, USB-A", "Battery": "Manufacturer specification"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('office-desktop-i5','Office Desktop PC','Desktops','NextGen','Intel Core i5 12th Gen','16GB','512GB SSD',38999,'New','In Stock','1 Year','/products/office-desktop.svg',true,true,'Reliable desktop configuration designed for office operations, billing, browsing and business software.','{"Cabinet": "Business airflow cabinet", "Graphics": "Integrated graphics", "Operating System": "Windows 11", "Power Supply": "450W or model specific", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('mini-office-pc','Mini Office PC','Desktops','HP','Intel Core i5 9th Gen','16GB','512GB SSD',28999,'Excellent','Sold','3 Months','/products/office-desktop.svg',false,true,'Reliable desktop configuration designed for office operations, billing, browsing and business software.','{"Cabinet": "Business airflow cabinet", "Graphics": "Integrated graphics", "Operating System": "Windows 11", "Power Supply": "450W or model specific", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('billing-desktop','Billing & POS Desktop','Desktops','NextGen','Intel Core i3 12th Gen','8GB','256GB SSD',27999,'New','In Stock','1 Year','/products/office-desktop.svg',false,true,'Reliable desktop configuration designed for office operations, billing, browsing and business software.','{"Cabinet": "Business airflow cabinet", "Graphics": "Integrated graphics", "Operating System": "Windows 11", "Power Supply": "450W or model specific", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('custom-gaming-pc','Custom Gaming PC','Custom PCs','NextGen','AMD Ryzen 5 7600','32GB','1TB NVMe SSD',84999,'New','In Stock','Component Warranty','/products/gaming-pc.svg',true,true,'Custom-built system planned around performance, upgradeability, cooling and the customer''s workload.','{"Graphics": "Dedicated GPU by configuration", "Cooling": "Performance cooling", "Power Supply": "80+ certified", "Cabinet": "Airflow focused", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('creator-workstation','Creator Workstation PC','Custom PCs','NextGen','Intel Core i7 13th Gen','32GB','1TB NVMe SSD',119999,'New','In Stock','Component Warranty','/products/gaming-pc.svg',true,true,'Custom-built system planned around performance, upgradeability, cooling and the customer''s workload.','{"Graphics": "Dedicated GPU by configuration", "Cooling": "Performance cooling", "Power Supply": "80+ certified", "Cabinet": "Airflow focused", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('architecture-workstation','Architecture Workstation','Custom PCs','NextGen','AMD Ryzen 9','64GB','2TB NVMe SSD',189999,'New','Coming Soon','Component Warranty','/products/gaming-pc.svg',false,true,'Custom-built system planned around performance, upgradeability, cooling and the customer''s workload.','{"Graphics": "Dedicated GPU by configuration", "Cooling": "Performance cooling", "Power Supply": "80+ certified", "Cabinet": "Airflow focused", "Monitor": "Optional"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('canon-pixma-g3010','Canon PIXMA G3010','Printers','Canon','Not Applicable','Not Applicable','Not Applicable',14999,'New','In Stock','1 Year','/products/printer.svg',true,true,'Practical print, scan and copy solution for home, education and small-office requirements.','{"Functions": "Print / Scan / Copy by model", "Connectivity": "USB / Wi-Fi by model", "Paper Size": "Up to A4", "Usage": "Home and small office", "Duplex": "Model dependent"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('epson-l3250','Epson EcoTank L3250','Printers','Epson','Not Applicable','Not Applicable','Not Applicable',16999,'New','In Stock','1 Year','/products/printer.svg',true,true,'Practical print, scan and copy solution for home, education and small-office requirements.','{"Functions": "Print / Scan / Copy by model", "Connectivity": "USB / Wi-Fi by model", "Paper Size": "Up to A4", "Usage": "Home and small office", "Duplex": "Model dependent"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('hp-laser-108w','HP Laser 108w','Printers','HP','Not Applicable','Not Applicable','Not Applicable',13999,'New','Out of Stock','1 Year','/products/printer.svg',false,true,'Practical print, scan and copy solution for home, education and small-office requirements.','{"Functions": "Print / Scan / Copy by model", "Connectivity": "USB / Wi-Fi by model", "Paper Size": "Up to A4", "Usage": "Home and small office", "Duplex": "Model dependent"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('tp-link-archer-c6','TP-Link Archer C6 Router','Networking','TP-Link','Not Applicable','Not Applicable','Not Applicable',2499,'New','In Stock','3 Years','/products/router.svg',false,true,'Reliable networking product for better connectivity across homes, stores and small offices.','{"Connectivity": "Gigabit / Wi-Fi by model", "Management": "Web or app based", "Coverage": "Environment dependent", "Installation": "Available separately", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('mesh-wifi-kit','Mesh Wi-Fi Kit','Networking','TP-Link','Not Applicable','Not Applicable','Not Applicable',6999,'New','Out of Stock','3 Years','/products/router.svg',false,true,'Reliable networking product for better connectivity across homes, stores and small offices.','{"Connectivity": "Gigabit / Wi-Fi by model", "Management": "Web or app based", "Coverage": "Environment dependent", "Installation": "Available separately", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('gigabit-network-switch','8-Port Gigabit Switch','Networking','TP-Link','Not Applicable','Not Applicable','Not Applicable',2299,'New','In Stock','3 Years','/products/router.svg',false,true,'Reliable networking product for better connectivity across homes, stores and small offices.','{"Connectivity": "Gigabit / Wi-Fi by model", "Management": "Web or app based", "Coverage": "Environment dependent", "Installation": "Available separately", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('external-ssd-1tb','1TB Portable SSD','Components','SanDisk','Not Applicable','Not Applicable','1TB SSD',8499,'New','In Stock','3 Years','/products/storage.svg',false,true,'Performance and storage component selected for upgrades, backups and faster workflows.','{"Compatibility": "System dependent", "Installation": "Available separately", "Use": "Upgrade and performance", "Testing": "Basic compatibility check", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('nvme-ssd-1tb','1TB NVMe SSD','Components','Crucial','Not Applicable','Not Applicable','1TB NVMe SSD',6999,'New','In Stock','5 Years','/products/storage.svg',true,true,'Performance and storage component selected for upgrades, backups and faster workflows.','{"Compatibility": "System dependent", "Installation": "Available separately", "Use": "Upgrade and performance", "Testing": "Basic compatibility check", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('ddr4-16gb-ram','16GB DDR4 RAM','Components','Crucial','Not Applicable','16GB','Not Applicable',3299,'New','In Stock','Limited Warranty','/products/storage.svg',false,true,'Performance and storage component selected for upgrades, backups and faster workflows.','{"Compatibility": "System dependent", "Installation": "Available separately", "Use": "Upgrade and performance", "Testing": "Basic compatibility check", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('mechanical-keyboard','Mechanical Keyboard','Accessories','Redragon','Not Applicable','Not Applicable','Not Applicable',2999,'New','In Stock','1 Year','/products/accessory.svg',false,true,'Useful computer accessory for productive work, study, communication and desk setups.','{"Connection": "USB / Wireless by model", "Compatibility": "Windows and supported devices", "Use": "Work, study and communication", "Setup": "Plug and play", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('wireless-combo','Wireless Keyboard & Mouse','Accessories','Logitech','Not Applicable','Not Applicable','Not Applicable',1599,'New','In Stock','1 Year','/products/accessory.svg',true,true,'Useful computer accessory for productive work, study, communication and desk setups.','{"Connection": "USB / Wireless by model", "Compatibility": "Windows and supported devices", "Use": "Work, study and communication", "Setup": "Plug and play", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[]),
  ('full-hd-webcam','Full HD Webcam','Accessories','Logitech','Not Applicable','Not Applicable','Not Applicable',3499,'New','In Stock','1 Year','/products/webcam.svg',false,true,'Useful computer accessory for productive work, study, communication and desk setups.','{"Connection": "USB / Wireless by model", "Compatibility": "Windows and supported devices", "Use": "Work, study and communication", "Setup": "Plug and play", "Warranty": "Brand warranty"}'::jsonb,array['Product or device','Applicable accessories','Basic setup guidance']::text[])
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  brand = excluded.brand,
  processor = excluded.processor,
  ram = excluded.ram,
  storage = excluded.storage,
  price = excluded.price,
  condition = excluded.condition,
  stock = excluded.stock,
  warranty = excluded.warranty,
  image_url = excluded.image_url,
  featured = excluded.featured,
  active = excluded.active,
  description = excluded.description,
  specs = excluded.specs,
  included = excluded.included;
