-- =========================================================
-- SHUB — Initial Finance Schema
-- =========================================================

create schema if not exists private;

revoke all on schema private from public;


-- =========================================================
-- PROFILES
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,

  base_currency_code text not null default 'KZT'
    check (
      char_length(base_currency_code) = 3
      and base_currency_code = upper(base_currency_code)
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- CATEGORIES
-- =========================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (char_length(btrim(name)) > 0),

  icon text,
  accent_color text,

  is_default boolean not null default false,

  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name)
);


-- =========================================================
-- TRANSACTIONS
-- =========================================================

create table public.transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  category_id uuid
    references public.categories(id)
    on delete set null,

  type text not null
    check (
      type in (
        'expense',
        'income',
        'transfer'
      )
    ),

  amount numeric(14, 2) not null
    check (amount > 0),

  currency_code text not null default 'KZT'
    check (
      char_length(currency_code) = 3
      and currency_code = upper(currency_code)
    ),

  exchange_rate numeric(18, 8) not null default 1
    check (exchange_rate > 0),

  base_amount numeric(14, 2) not null
    check (base_amount > 0),

  store_name text,
  product_name text,
  note text,

  transaction_date date not null default current_date,

  transaction_time time,

  scope text not null default 'personal'
    check (
      scope in (
        'personal',
        'family'
      )
    ),

  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- BUDGETS
-- =========================================================

create table public.budgets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  category_id uuid
    references public.categories(id)
    on delete cascade,

  period text not null default 'monthly',

  amount numeric(14, 2) not null
    check (amount > 0),

  currency_code text not null default 'KZT'
    check (
      char_length(currency_code) = 3
      and currency_code = upper(currency_code)
    ),

  start_date date not null,
  end_date date not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_date >= start_date)
);


-- One global budget per period.
create unique index budgets_global_period_unique
on public.budgets (
  user_id,
  start_date,
  end_date
)
where category_id is null;


-- One budget per category per period.
create unique index budgets_category_period_unique
on public.budgets (
  user_id,
  category_id,
  start_date,
  end_date
)
where category_id is not null;


-- =========================================================
-- PLANNED EXPENSES
-- =========================================================

create table public.planned_expenses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  category_id uuid
    references public.categories(id)
    on delete set null,

  name text not null
    check (char_length(btrim(name)) > 0),

  amount numeric(14, 2) not null
    check (amount > 0),

  currency_code text not null default 'KZT'
    check (
      char_length(currency_code) = 3
      and currency_code = upper(currency_code)
    ),

  due_date date not null,

  recurring boolean not null default false,

  is_mandatory boolean not null default true,

  note text,

  status text not null default 'upcoming'
    check (
      status in (
        'upcoming',
        'paid',
        'overdue',
        'cancelled'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();


create trigger transactions_set_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();


create trigger budgets_set_updated_at
before update on public.budgets
for each row
execute function public.set_updated_at();


create trigger planned_expenses_set_updated_at
before update on public.planned_expenses
for each row
execute function public.set_updated_at();


-- =========================================================
-- NEW USER SETUP
-- Creates profile + default categories
-- =========================================================

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;


  insert into public.categories (
    user_id,
    name,
    icon,
    is_default
  )
  values
    (new.id, 'Housing', 'house', true),
    (new.id, 'Food', 'utensils', true),
    (new.id, 'Transport', 'car', true),
    (new.id, 'Health', 'heart-pulse', true),
    (new.id, 'Sport', 'dumbbell', true),
    (new.id, 'Entertainment', 'gamepad-2', true),
    (new.id, 'Education', 'graduation-cap', true),
    (new.id, 'Shopping', 'shopping-bag', true),
    (new.id, 'Subscriptions', 'repeat', true),
    (new.id, 'Travel', 'plane', true),
    (new.id, 'Children / Family', 'users', true),
    (new.id, 'Gifts', 'gift', true),
    (new.id, 'Other', 'circle-ellipsis', true)
  on conflict (user_id, name) do nothing;


  return new;

end;
$$;


revoke all
on function private.handle_new_user()
from public;

revoke all
on function private.handle_new_user()
from anon;

revoke all
on function private.handle_new_user()
from authenticated;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();


-- =========================================================
-- BACKFILL EXISTING AUTH USERS
-- Important if you already created an account while testing Auth
-- =========================================================

insert into public.profiles (
  id,
  full_name
)
select
  id,
  raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;


insert into public.categories (
  user_id,
  name,
  icon,
  is_default
)
select
  u.id,
  c.name,
  c.icon,
  true
from auth.users u
cross join (
  values
    ('Housing', 'house'),
    ('Food', 'utensils'),
    ('Transport', 'car'),
    ('Health', 'heart-pulse'),
    ('Sport', 'dumbbell'),
    ('Entertainment', 'gamepad-2'),
    ('Education', 'graduation-cap'),
    ('Shopping', 'shopping-bag'),
    ('Subscriptions', 'repeat'),
    ('Travel', 'plane'),
    ('Children / Family', 'users'),
    ('Gifts', 'gift'),
    ('Other', 'circle-ellipsis')
) as c(name, icon)
on conflict (user_id, name) do nothing;


-- =========================================================
-- INDEXES
-- =========================================================

create index categories_user_id_idx
on public.categories(user_id);


create index transactions_user_date_idx
on public.transactions(
  user_id,
  transaction_date desc
);


create index transactions_user_category_idx
on public.transactions(
  user_id,
  category_id
);


create index budgets_user_id_idx
on public.budgets(user_id);


create index planned_expenses_user_due_date_idx
on public.planned_expenses(
  user_id,
  due_date
);


-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles
enable row level security;

alter table public.categories
enable row level security;

alter table public.transactions
enable row level security;

alter table public.budgets
enable row level security;

alter table public.planned_expenses
enable row level security;


-- =========================================================
-- TABLE PRIVILEGES
-- =========================================================

revoke all
on table public.profiles
from anon, authenticated;

revoke all
on table public.categories
from anon, authenticated;

revoke all
on table public.transactions
from anon, authenticated;

revoke all
on table public.budgets
from anon, authenticated;

revoke all
on table public.planned_expenses
from anon, authenticated;


grant select, update
on table public.profiles
to authenticated;


grant select, insert, update, delete
on table public.categories
to authenticated;


grant select, insert, update, delete
on table public.transactions
to authenticated;


grant select, insert, update, delete
on table public.budgets
to authenticated;


grant select, insert, update, delete
on table public.planned_expenses
to authenticated;


-- =========================================================
-- PROFILES POLICIES
-- =========================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) is not null
  and id = (select auth.uid())
);


create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) is not null
  and id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);


-- =========================================================
-- CATEGORIES POLICIES
-- =========================================================

create policy "Users can view own categories"
on public.categories
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);


create policy "Users can create own categories"
on public.categories
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);


create policy "Users can update own categories"
on public.categories
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);


create policy "Users can delete own categories"
on public.categories
for delete
to authenticated
using (
  user_id = (select auth.uid())
);


-- =========================================================
-- TRANSACTIONS POLICIES
-- =========================================================

create policy "Users can view own transactions"
on public.transactions
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);


create policy "Users can create own transactions"
on public.transactions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can update own transactions"
on public.transactions
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can delete own transactions"
on public.transactions
for delete
to authenticated
using (
  user_id = (select auth.uid())
);


-- =========================================================
-- BUDGETS POLICIES
-- =========================================================

create policy "Users can view own budgets"
on public.budgets
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);


create policy "Users can create own budgets"
on public.budgets
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can update own budgets"
on public.budgets
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can delete own budgets"
on public.budgets
for delete
to authenticated
using (
  user_id = (select auth.uid())
);


-- =========================================================
-- PLANNED EXPENSES POLICIES
-- =========================================================

create policy "Users can view own planned expenses"
on public.planned_expenses
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);


create policy "Users can create own planned expenses"
on public.planned_expenses
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can update own planned expenses"
on public.planned_expenses
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
  and (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = category_id
        and c.user_id = (select auth.uid())
    )
  )
);


create policy "Users can delete own planned expenses"
on public.planned_expenses
for delete
to authenticated
using (
  user_id = (select auth.uid())
);