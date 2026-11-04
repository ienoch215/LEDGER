-- ==============================================================================
-- Ledger Database Schema & Security (100% Idempotent)
-- Migration: 20261104000000_init_ledger.sql
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. MONTHS TABLE
create table if not exists public.months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month date not null,
  salary numeric(14,2) not null check (salary > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_month_is_first_day check (extract(day from month) = 1),
  constraint unique_user_month unique (user_id, month)
);

drop trigger if exists tr_months_updated_at on public.months;
create trigger tr_months_updated_at
  before update on public.months
  for each row execute function public.set_updated_at();

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0 and length(trim(name)) <= 50),
  created_at timestamptz not null default now()
);

-- Case-insensitive unique name per user
create unique index if not exists idx_categories_user_name_lower 
  on public.categories (user_id, lower(trim(name)));

-- 4. STARTER CATEGORIES SEED TRIGGER ON AUTH.USERS
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name)
  values
    (new.id, 'Groceries'),
    (new.id, 'Utilities'),
    (new.id, 'Food & Dining'),
    (new.id, 'Housing'),
    (new.id, 'Transport')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_categories();

-- On-demand fallback helper to ensure default categories exist
create or replace function public.ensure_user_categories()
returns void
language plpgsql
security definer
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;

  if not exists (select 1 from public.categories where user_id = uid) then
    insert into public.categories (user_id, name)
    values
      (uid, 'Groceries'),
      (uid, 'Utilities'),
      (uid, 'Food & Dining'),
      (uid, 'Housing'),
      (uid, 'Transport')
    on conflict do nothing;
  end if;
end;
$$;

-- 5. ENTRIES TABLE
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null,
  kind text not null check (kind in ('spending', 'saving')),
  category_id uuid references public.categories(id) on delete restrict,
  saving_type text check (saving_type in ('gold', 'stocks', 'bonds', 'crypto')),
  amount numeric(14,2) not null check (amount > 0),
  memo text check (memo is null or length(memo) <= 120),
  client_request_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_kind_fields check (
    (kind = 'spending' and category_id is not null and saving_type is null) or
    (kind = 'saving' and saving_type is not null and category_id is null)
  ),
  constraint unique_user_client_request unique (user_id, client_request_id)
);

drop trigger if exists tr_entries_updated_at on public.entries;
create trigger tr_entries_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- Indexes for fast query sorting and filtering
create index if not exists idx_entries_user_date on public.entries (user_id, entry_date desc, created_at desc);
create index if not exists idx_months_user_month on public.months (user_id, month desc);

-- 6. MONTH SUMMARY VIEW (security_invoker = true)
create or replace view public.month_summary
with (security_invoker = true)
as
with all_user_months as (
  select user_id, month from public.months
  union
  select user_id, date_trunc('month', entry_date)::date as month from public.entries
),
aggregated_entries as (
  select
    user_id,
    date_trunc('month', entry_date)::date as month,
    count(*)::integer as total_entries_count,
    count(*) filter (where kind = 'spending')::integer as spending_entries_count,
    count(*) filter (where kind = 'saving')::integer as saving_entries_count,
    coalesce(sum(amount) filter (where kind = 'spending'), 0)::numeric(14,2) as total_spent,
    coalesce(sum(amount) filter (where kind = 'saving'), 0)::numeric(14,2) as total_saved,
    coalesce(sum(amount) filter (where kind = 'saving' and saving_type = 'stocks'), 0)::numeric(14,2) as saved_stocks,
    coalesce(sum(amount) filter (where kind = 'saving' and saving_type = 'gold'), 0)::numeric(14,2) as saved_gold,
    coalesce(sum(amount) filter (where kind = 'saving' and saving_type = 'bonds'), 0)::numeric(14,2) as saved_bonds,
    coalesce(sum(amount) filter (where kind = 'saving' and saving_type = 'crypto'), 0)::numeric(14,2) as saved_crypto
  from public.entries
  group by user_id, date_trunc('month', entry_date)::date
)
select
  aum.user_id,
  aum.month,
  m.id as month_id,
  m.salary,
  coalesce(ae.total_spent, 0)::numeric(14,2) as total_spent,
  coalesce(ae.total_saved, 0)::numeric(14,2) as total_saved,
  case
    when m.salary is not null then (m.salary - coalesce(ae.total_spent, 0) - coalesce(ae.total_saved, 0))::numeric(14,2)
    else null
  end as remaining,
  coalesce(ae.total_entries_count, 0)::integer as total_entries_count,
  coalesce(ae.spending_entries_count, 0)::integer as spending_entries_count,
  coalesce(ae.saving_entries_count, 0)::integer as saving_entries_count,
  coalesce(ae.saved_stocks, 0)::numeric(14,2) as saved_stocks,
  coalesce(ae.saved_gold, 0)::numeric(14,2) as saved_gold,
  coalesce(ae.saved_bonds, 0)::numeric(14,2) as saved_bonds,
  coalesce(ae.saved_crypto, 0)::numeric(14,2) as saved_crypto,
  m.created_at as salary_created_at,
  m.updated_at as salary_updated_at
from all_user_months aum
left join public.months m on m.user_id = aum.user_id and m.month = aum.month
left join aggregated_entries ae on ae.user_id = aum.user_id and ae.month = aum.month;

-- 7. ROW LEVEL SECURITY POLICIES (RLS)
alter table public.months enable row level security;
alter table public.categories enable row level security;
alter table public.entries enable row level security;

-- Drop existing policies so script can safely run repeatedly
drop policy if exists "Users can view their own months" on public.months;
drop policy if exists "Users can insert their own months" on public.months;
drop policy if exists "Users can update their own months" on public.months;
drop policy if exists "Users can delete their own months" on public.months;

drop policy if exists "Users can view their own categories" on public.categories;
drop policy if exists "Users can insert their own categories" on public.categories;
drop policy if exists "Users can update their own categories" on public.categories;
drop policy if exists "Users can delete their own categories" on public.categories;

drop policy if exists "Users can view their own entries" on public.entries;
drop policy if exists "Users can insert their own entries" on public.entries;
drop policy if exists "Users can update their own entries" on public.entries;
drop policy if exists "Users can delete their own entries" on public.entries;

-- Months Policies
create policy "Users can view their own months"
  on public.months for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own months"
  on public.months for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own months"
  on public.months for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own months"
  on public.months for delete to authenticated
  using (auth.uid() = user_id);

-- Categories Policies
create policy "Users can view their own categories"
  on public.categories for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete to authenticated
  using (auth.uid() = user_id);

-- Entries Policies
create policy "Users can view their own entries"
  on public.entries for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.entries for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.entries for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.entries for delete to authenticated
  using (auth.uid() = user_id);
