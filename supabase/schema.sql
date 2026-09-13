-- ============================================================
-- FinanceFlow — Esquema de base de datos y políticas RLS
-- Ejecuta este script completo en el SQL Editor de tu proyecto
-- de Supabase (Project > SQL Editor > New query).
-- ============================================================

-- Extensión necesaria para generar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: categories (categorías y subcategorías de presupuesto)
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_id uuid references public.categories(id) on delete cascade,
  monthly_budget numeric(14,2) not null default 0,
  color text not null default '#10B981',
  created_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- ------------------------------------------------------------
-- Tabla: transactions (ingresos y gastos)
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  payment_method text not null check (payment_method in ('cash', 'card', 'transfer')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date);
create index if not exists transactions_category_id_idx on public.transactions(category_id);

-- ------------------------------------------------------------
-- Tabla: debts (deudas — método bola de nieve)
-- ------------------------------------------------------------
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_balance numeric(14,2) not null default 0,
  original_balance numeric(14,2) not null default 0,
  min_payment numeric(14,2) not null default 0,
  interest_rate numeric(6,3) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists debts_user_id_idx on public.debts(user_id);

-- ------------------------------------------------------------
-- Tabla: pots (huchas / metas de ahorro)
-- ------------------------------------------------------------
create table if not exists public.pots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null default 0,
  current_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pots_user_id_idx on public.pots(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario únicamente puede leer/escribir sus propios datos.
-- ============================================================

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;
alter table public.pots enable row level security;

-- categories
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- transactions
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- debts
drop policy if exists "debts_select_own" on public.debts;
create policy "debts_select_own" on public.debts
  for select using (auth.uid() = user_id);

drop policy if exists "debts_insert_own" on public.debts;
create policy "debts_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);

drop policy if exists "debts_update_own" on public.debts;
create policy "debts_update_own" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "debts_delete_own" on public.debts;
create policy "debts_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

-- pots
drop policy if exists "pots_select_own" on public.pots;
create policy "pots_select_own" on public.pots
  for select using (auth.uid() = user_id);

drop policy if exists "pots_insert_own" on public.pots;
create policy "pots_insert_own" on public.pots
  for insert with check (auth.uid() = user_id);

drop policy if exists "pots_update_own" on public.pots;
create policy "pots_update_own" on public.pots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pots_delete_own" on public.pots;
create policy "pots_delete_own" on public.pots
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Nota importante sobre el estado inicial "en cero":
-- Este script NO inserta ninguna fila de datos de ejemplo.
-- Cada usuario nuevo comienza sin categorías, transacciones,
-- deudas ni metas — todo listo para que las cree desde la app.
-- ============================================================
