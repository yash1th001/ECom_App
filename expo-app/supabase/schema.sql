-- Aurum schema. Run this in the Supabase SQL editor.
-- Safe to re-run (drops & recreates policies).

create extension if not exists "pgcrypto";

-- =========================================================================
-- Settings (kill switch)
-- =========================================================================
create table if not exists public.settings (
  id int primary key default 1,
  storefront_paused boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

grant select on public.settings to anon, authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (true);

-- =========================================================================
-- Referral codes (gate for signup)
-- =========================================================================
create table if not exists public.referral_codes (
  code text primary key,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

grant select on public.referral_codes to anon, authenticated;
grant all on public.referral_codes to service_role;
alter table public.referral_codes enable row level security;
drop policy if exists refcodes_read on public.referral_codes;
create policy refcodes_read on public.referral_codes for select using (true);

insert into public.referral_codes (code, note) values
  ('AURUM-2026', 'Seed invite'),
  ('FOUNDER-01', 'Founding member')
on conflict do nothing;

-- =========================================================================
-- Profiles
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  referral_code text references public.referral_codes(code),
  pan_number text,
  gov_id text,
  kyc_submitted_at timestamptz,
  kyc_verified boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_self_write on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id);
create policy profiles_self_write on public.profiles for insert with check (auth.uid() = id);
create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- =========================================================================
-- Products
-- =========================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  purity text not null check (purity in ('18K','22K','24K')),
  weight_g numeric(10,2) not null,
  making_charge_percent numeric(5,2) not null default 8,
  hallmark_id text,
  coa_id text,
  image_url text,
  description text,
  stock int not null default 0,
  rating numeric(3,2) not null default 4.7,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_purity_idx on public.products (purity);

grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (true);

insert into public.products (name, category, purity, weight_g, making_charge_percent, hallmark_id, coa_id, image_url, description, stock)
values
  ('Sovereign 24K Bullion Bar', 'Coins', '24K', 100, 2.5, 'BIS-916-A1', 'COA-24-00871', 'https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=800', 'Investment-grade 100 g fine gold bar. Fully insured escrow.', 25),
  ('Rajwadi 22K Chain', 'Chains', '22K', 42, 9, 'BIS-916-B7', 'COA-22-01204', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'Traditional Rajwadi weave, handcrafted in Jaipur.', 8),
  ('Meenakari 22K Bangle Pair', 'Bracelets', '22K', 58, 12, 'BIS-916-C2', 'COA-22-01331', 'https://images.unsplash.com/photo-1602751584553-b93cb6d5a2a3?w=800', 'Kundan meenakari on 22K base; sold as a pair.', 5),
  ('Solitaire 18K Ring', 'Rings', '18K', 6.8, 15, 'BIS-750-D9', 'COA-18-00442', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', '18K white gold band with certified 0.42ct centre stone.', 12),
  ('Peacock 22K Pendant', 'Pendants', '22K', 14, 11, 'BIS-916-E4', 'COA-22-01502', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800', 'Filigree peacock motif with ruby accents.', 9),
  ('Antique 22K Jhumka', 'Earrings', '22K', 22, 13, 'BIS-916-F1', 'COA-22-01610', 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800', 'Temple-style jhumkas with pearl drops.', 6)
on conflict do nothing;

-- =========================================================================
-- Addresses
-- =========================================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  line1 text not null,
  city text not null,
  pin text not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
drop policy if exists addresses_self on public.addresses;
create policy addresses_self on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- Orders
-- =========================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address_id uuid references public.addresses(id),
  total_inr numeric(14,2) not null,
  total_weight_g numeric(10,2) not null,
  stage text not null default 'placed' check (stage in ('placed','insured_escrow','dispatched','delivered','cancelled')),
  courier text,
  awb_number text,
  eta text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

grant select, insert on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
drop policy if exists orders_self_read on public.orders;
drop policy if exists orders_self_insert on public.orders;
create policy orders_self_read on public.orders for select using (auth.uid() = user_id);
create policy orders_self_insert on public.orders for insert with check (auth.uid() = user_id);

-- Realtime for order stage updates:
alter publication supabase_realtime add table public.orders;