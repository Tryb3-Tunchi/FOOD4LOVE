create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('cook', 'buyer');
  end if;
  if not exists (select 1 from pg_type where typname = 'like_status') then
    create type public.like_status as enum ('pending', 'accepted', 'rejected');
  end if;
end $$;

do $$
begin
  begin
    alter type public.user_role add value if not exists 'admin';
  exception
    when undefined_object then null;
  end;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  name text not null,
  nickname text null,
  looking_for text null,
  age int null,
  avatar_url text null,
  phone text null,
  bio text null,
  cuisines text[] null,
  interests text[] null,
  favorite_foods text[] null,
  photos text[] null,
  specialty text null,
  price_min int null,
  price_max int null,
  is_bot boolean not null default false,
  bot_persona text null,
  is_admin boolean not null default false,
  onboarding_completed boolean not null default false,
  kyc_status text not null default 'unverified',
  kyc_full_name text null,
  kyc_country text null,
  kyc_selfie text null,
  kyc_id_doc text null,
  lat double precision null,
  lng double precision null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.profiles add column if not exists phone text null;
alter table if exists public.profiles add column if not exists bio text null;
alter table if exists public.profiles add column if not exists cuisines text[] null;
alter table if exists public.profiles add column if not exists interests text[] null;
alter table if exists public.profiles add column if not exists favorite_foods text[] null;
alter table if exists public.profiles add column if not exists photos text[] null;
alter table if exists public.profiles add column if not exists specialty text null;
alter table if exists public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table if exists public.profiles add column if not exists kyc_status text not null default 'unverified';
alter table if exists public.profiles add column if not exists kyc_full_name text null;
alter table if exists public.profiles add column if not exists kyc_country text null;
alter table if exists public.profiles add column if not exists nickname text null;
alter table if exists public.profiles add column if not exists looking_for text null;
alter table if exists public.profiles add column if not exists age int null;
alter table if exists public.profiles add column if not exists kyc_selfie text null;
alter table if exists public.profiles add column if not exists kyc_id_doc text null;
alter table if exists public.profiles add column if not exists price_min int null;
alter table if exists public.profiles add column if not exists price_max int null;
alter table if exists public.profiles add column if not exists is_bot boolean not null default false;
alter table if exists public.profiles add column if not exists bot_persona text null;
alter table if exists public.profiles add column if not exists is_admin boolean not null default false;
alter table if exists public.profiles add column if not exists wallet_balance int not null default 0;
alter table if exists public.profiles add column if not exists referral_code text unique null;
alter table if exists public.profiles add column if not exists referred_by_id uuid null references public.profiles (id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  -- If role is changing and cuisines have been set (onboarding started), prevent it
  if old.role is distinct from new.role and (old.cuisines is not null or old.onboarding_completed) then
    raise exception 'Cannot change role after onboarding has started';
  end if;
  return new;
end $$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_role_change();

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  image_url text null,
  created_at timestamptz not null default now()
);

create or replace function public.enforce_max_3_dishes()
returns trigger
language plpgsql
as $$
declare
  dish_count int;
begin
  select count(*) into dish_count from public.dishes where cook_id = new.cook_id;
  if dish_count >= 3 then
    raise exception 'cooks can only have up to 3 dishes';
  end if;
  return new;
end $$;

drop trigger if exists dishes_max_three on public.dishes;
create trigger dishes_max_three
before insert on public.dishes
for each row execute function public.enforce_max_3_dishes();

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  cook_id uuid not null references public.profiles (id) on delete cascade,
  status public.like_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (buyer_id, cook_id)
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  direction text not null check (direction in ('like','pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  cook_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (buyer_id, cook_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_status') then
    create type public.service_status as enum ('pending', 'confirmed', 'preparing', 'completed', 'cancelled');
  end if;
end $$;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  cook_id uuid not null references public.profiles (id) on delete cascade,
  status public.service_status not null default 'pending',
  dish_name text not null,
  price int not null,
  scheduled_date timestamptz null,
  location text null,
  notes text null,
  agreed_by_both boolean not null default false,
  agreed_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text null,
  created_at timestamptz not null default now(),
  unique (service_id, reviewer_id)
);

alter table public.messages enable row level security;
alter table public.services enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
on public.profiles
for select
to anon
using (true);

alter table public.profiles add column if not exists available_for_parties boolean not null default false;
alter table public.profiles add column if not exists last_seen_at timestamptz null;
alter table public.profiles add column if not exists referral_code text null;
alter table public.profiles add column if not exists daily_special text null;
alter table public.profiles add column if not exists daily_special_until timestamptz null;

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "dishes_select" on public.dishes;
create policy "dishes_select"
on public.dishes
for select
to authenticated
using (true);

drop policy if exists "dishes_insert" on public.dishes;
create policy "dishes_insert"
on public.dishes
for insert
to authenticated
with check (auth.uid() = cook_id);

drop policy if exists "dishes_update" on public.dishes;
create policy "dishes_update"
on public.dishes
for update
to authenticated
using (auth.uid() = cook_id)
with check (auth.uid() = cook_id);

drop policy if exists "dishes_delete" on public.dishes;
create policy "dishes_delete"
on public.dishes
for delete
to authenticated
using (auth.uid() = cook_id);

drop policy if exists "likes_select" on public.likes;
create policy "likes_select"
on public.likes
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "likes_insert" on public.likes;
create policy "likes_insert"
on public.likes
for insert
to authenticated
with check (auth.uid() = buyer_id);

drop policy if exists "likes_update_by_cook" on public.likes;
create policy "likes_update_by_cook"
on public.likes
for update
to authenticated
using (auth.uid() = cook_id)
with check (auth.uid() = cook_id);

drop policy if exists "likes_admin_update" on public.likes;
create policy "likes_admin_update"
on public.likes
for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "swipes_select" on public.swipes;
create policy "swipes_select"
on public.swipes
for select
to authenticated
using (auth.uid() = swiper_id or auth.uid() = target_id);

drop policy if exists "swipes_insert" on public.swipes;
create policy "swipes_insert"
on public.swipes
for insert
to authenticated
with check (auth.uid() = swiper_id);

drop policy if exists "matches_select" on public.matches;
create policy "matches_select"
on public.matches
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "matches_insert_by_cook" on public.matches;
drop policy if exists "matches_insert_by_participant" on public.matches;
create policy "matches_insert_by_participant"
on public.matches
for insert
to authenticated
with check (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "matches_admin_insert" on public.matches;
create policy "matches_admin_insert"
on public.matches
for insert
to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('private-kyc', 'private-kyc', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public_media_read" on storage.objects;
create policy "public_media_read"
on storage.objects
for select
to public
using (bucket_id = 'public-media');

drop policy if exists "public_media_insert_own" on storage.objects;
create policy "public_media_insert_own"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'public-media' and name like (auth.uid()::text || '/%'));

drop policy if exists "public_media_update_own" on storage.objects;
create policy "public_media_update_own"
on storage.objects
for update
to authenticated
using (bucket_id = 'public-media' and split_part(name, '/', 1) = auth.uid()::text)
with check (bucket_id = 'public-media' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "public_media_delete_own" on storage.objects;
create policy "public_media_delete_own"
on storage.objects
for delete
to authenticated
using (bucket_id = 'public-media' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "private_kyc_read" on storage.objects;
create policy "private_kyc_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'private-kyc'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  )
);

drop policy if exists "private_kyc_write_own" on storage.objects;
create policy "private_kyc_write_own"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'private-kyc' and name like (auth.uid()::text || '/%'));

drop policy if exists "private_kyc_update_own" on storage.objects;
create policy "private_kyc_update_own"
on storage.objects
for update
to authenticated
using (bucket_id = 'private-kyc' and split_part(name, '/', 1) = auth.uid()::text)
with check (bucket_id = 'private-kyc' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "private_kyc_delete_own" on storage.objects;
create policy "private_kyc_delete_own"
on storage.objects
for delete
to authenticated
using (bucket_id = 'private-kyc' and split_part(name, '/', 1) = auth.uid()::text);

alter table public.matches add column if not exists expires_at timestamptz null;

create table if not exists public.cook_stories (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text null,
  menu_items text[] null,
  photo_url text null,
  is_active boolean not null default true,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

alter table public.cook_stories enable row level security;

drop policy if exists "stories_select" on public.cook_stories;
create policy "stories_select"
on public.cook_stories for select to authenticated
using (true);

drop policy if exists "stories_insert" on public.cook_stories;
create policy "stories_insert"
on public.cook_stories for insert to authenticated
with check (auth.uid() = cook_id);

drop policy if exists "stories_update_own" on public.cook_stories;
create policy "stories_update_own"
on public.cook_stories for update to authenticated
using (auth.uid() = cook_id)
with check (auth.uid() = cook_id);

drop policy if exists "stories_delete" on public.cook_stories;
create policy "stories_delete"
on public.cook_stories for delete to authenticated
using (
  auth.uid() = cook_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  current_streak int not null default 1,
  longest_streak int not null default 1,
  last_swipe_date date not null default current_date,
  super_likes_available int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

drop policy if exists "streaks_select_own" on public.user_streaks;
create policy "streaks_select_own"
on public.user_streaks for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "streaks_insert" on public.user_streaks;
create policy "streaks_insert"
on public.user_streaks for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "streaks_update" on public.user_streaks;
create policy "streaks_update"
on public.user_streaks for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "streaks_admin_select" on public.user_streaks;
create policy "streaks_admin_select"
on public.user_streaks for select to authenticated
using (true);

-- Cook Earnings Tracking Table
create table if not exists public.cook_earnings (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  amount_earned int not null,
  platform_fee_percent int not null default 10,
  amount_paid int not null,
  payment_date timestamptz null,
  status text not null default 'unpaid' check (status in ('unpaid', 'processing', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cook_id, service_id)
);

alter table public.cook_earnings enable row level security;

drop policy if exists "earnings_select_own" on public.cook_earnings;
create policy "earnings_select_own"
on public.cook_earnings for select to authenticated
using (auth.uid() = cook_id);

drop policy if exists "earnings_admin_select" on public.cook_earnings;
create policy "earnings_admin_select"
on public.cook_earnings for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "earnings_insert_admin" on public.cook_earnings;
create policy "earnings_insert_admin"
on public.cook_earnings for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Referral Tracking
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_id uuid not null references public.profiles (id) on delete cascade,
  bonus_amount int not null default 700,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz null,
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

drop policy if exists "referrals_select" on public.referrals;
create policy "referrals_select"
on public.referrals for select to authenticated
using (auth.uid() = referrer_id or auth.uid() = referred_id);

drop policy if exists "referrals_insert" on public.referrals;
create policy "referrals_insert"
on public.referrals for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Wallet Transactions
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null,
  type text not null check (type in ('referral', 'payment_received', 'payment_sent', 'admin_credit')),
  description text null,
  reference_id uuid null,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

drop policy if exists "wallet_transactions_select" on public.wallet_transactions;
create policy "wallet_transactions_select"
on public.wallet_transactions for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "wallet_transactions_insert_admin" on public.wallet_transactions;
create policy "wallet_transactions_insert_admin"
on public.wallet_transactions for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "streaks_admin_select" on public.user_streaks;
create policy "streaks_admin_select"
on public.user_streaks for select to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = messages.match_id and (m.buyer_id = auth.uid() or m.cook_id = auth.uid())
  )
);

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_id and exists (
    select 1
    from public.matches m
    where m.id = match_id and (m.buyer_id = auth.uid() or m.cook_id = auth.uid())
  )
);

drop policy if exists "services_select" on public.services;
create policy "services_select"
on public.services
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "services_insert" on public.services;
create policy "services_insert"
on public.services
for insert
to authenticated
with check (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "services_update" on public.services;
create policy "services_update"
on public.services
for update
to authenticated
using (auth.uid() = buyer_id or auth.uid() = cook_id)
with check (auth.uid() = buyer_id or auth.uid() = cook_id);

drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select"
on public.reviews
for select
to authenticated
using (true);

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert"
on public.reviews
for insert
to authenticated
with check (auth.uid() = reviewer_id);
