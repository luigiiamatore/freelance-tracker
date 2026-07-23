-- Freelance Income & Tax Tracker schema
-- Run this in the Supabase SQL editor.

-- Mirrors auth.users so the app can read profile info without hitting the auth schema.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_id text,
  client text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists income_user_id_idx on public.income (user_id);
create index if not exists income_date_idx on public.income (date);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  category text not null check (category in ('Software', 'Travel', 'Office', 'Other')),
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_id_idx on public.expenses (user_id);
create index if not exists expenses_date_idx on public.expenses (date);

alter table public.profiles enable row level security;
alter table public.income enable row level security;
alter table public.expenses enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can view own income" on public.income
  for select using (auth.uid() = user_id);
create policy "Users can insert own income" on public.income
  for insert with check (auth.uid() = user_id);
create policy "Users can update own income" on public.income
  for update using (auth.uid() = user_id);
create policy "Users can delete own income" on public.income
  for delete using (auth.uid() = user_id);

create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);

-- Attachments (receipts/invoices) linked to either an income or an expense row.
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  income_id uuid references public.income (id) on delete cascade,
  expense_id uuid references public.expenses (id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  content_type text,
  created_at timestamptz not null default now(),
  constraint attachments_exactly_one_parent check (
    (income_id is not null and expense_id is null) or
    (income_id is null and expense_id is not null)
  )
);

create index if not exists attachments_income_id_idx on public.attachments (income_id);
create index if not exists attachments_expense_id_idx on public.attachments (expense_id);

alter table public.attachments enable row level security;

create policy "Users can view own attachments" on public.attachments
  for select using (auth.uid() = user_id);
create policy "Users can insert own attachments" on public.attachments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own attachments" on public.attachments
  for delete using (auth.uid() = user_id);

-- Private storage bucket for attachment files, one folder per user (`{user_id}/...`).
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "Users can upload to own attachment folder" on storage.objects
  for insert with check (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users can view own attachment files" on storage.objects
  for select using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users can delete own attachment files" on storage.objects
  for delete using (
    bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text
  );
