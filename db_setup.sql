-- ------------------------------------------------------------------
-- RESELL TRACKER DATABASE SETUP
-- ------------------------------------------------------------------
-- Copy and paste this ENTIRE file into the Supabase SQL Editor.
-- Click "Run" to set up your database.
-- ------------------------------------------------------------------

-- 1. Create Tables (if they don't exist yet)
-- We use quotes "..." to ensure the column names match our React code exactly (camelCase).

create table if not exists purchases (
  "id" text primary key,
  "date" text not null,
  "supplier" text not null,
  "itemName" text not null,
  "quantity" numeric not null,
  "costPerUnit" numeric not null,
  "shippingFees" numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists sales (
  "id" text primary key,
  "purchaseId" text not null, 
  "date" text not null,
  "platform" text not null,
  "quantitySold" numeric not null,
  "salePricePerUnit" numeric not null,
  "buyerPostagePaid" numeric not null,
  "actualPostageCost" numeric not null,
  "platformFees" numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Security (Row Level Security)
alter table purchases enable row level security;
alter table sales enable row level security;

-- 3. Create Access Policies
-- We first DROP existing policies to prevent "policy already exists" errors if you run this twice.

drop policy if exists "Public Access Purchases" on purchases;
create policy "Public Access Purchases" on purchases for all using (true) with check (true);

drop policy if exists "Public Access Sales" on sales;
create policy "Public Access Sales" on sales for all using (true) with check (true);

-- 4. Confirmation
select 'Database setup completed successfully' as result;