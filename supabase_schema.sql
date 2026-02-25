-- Financeiro AI - Supabase Schema

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Categories table
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null,
  color text not null,
  type text check (type in ('income', 'expense')) not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Create Accounts table
create table accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('bank', 'cash', 'credit', 'investment')) not null,
  balance numeric(15, 2) default 0,
  currency text default 'BRL',
  color text not null,
  icon text not null,
  created_at timestamp with time zone default now()
);

-- 4. Create Transactions table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  account_id uuid references accounts(id) on delete cascade not null,
  category_id uuid references categories(id) not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric(15, 2) not null,
  currency text default 'BRL',
  description text not null,
  date timestamp with time zone not null,
  notes text,
  is_recurring boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Enable Row Level Security (RLS)
alter table categories enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;

-- 6. Create RLS Policies (Ensure users only see their own data)
create policy "Users can only access their own categories" on categories
  for all using (auth.uid() = user_id);

create policy "Users can only access their own accounts" on accounts
  for all using (auth.uid() = user_id);

create policy "Users can only access their own transactions" on transactions
  for all using (auth.uid() = user_id);

-- 7. Add sample categories function
-- This will be used when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.categories (user_id, name, icon, color, type, is_default)
  values
    (new.id, 'Salário', 'Banknote', '#10B981', 'income', true),
    (new.id, 'Freelance', 'Laptop', '#14B8A6', 'income', true),
    (new.id, 'Alimentação', 'UtensilsCrossed', '#F97316', 'expense', true),
    (new.id, 'Transporte', 'Car', '#3B82F6', 'expense', true),
    (new.id, 'Lazer', 'Gamepad2', '#EC4899', 'expense', true);
    
  insert into public.accounts (user_id, name, type, balance, color, icon)
  values
    (new.id, 'Carteira', 'cash', 0, '#10B981', 'Wallet'),
    (new.id, 'Conta Corrente', 'bank', 0, '#3B82F6', 'Building2');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create initial data for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
