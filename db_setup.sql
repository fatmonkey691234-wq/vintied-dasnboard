-- ------------------------------------------------------------------
-- RESELL TRACKER DATABASE SETUP (SAFE MODE)
-- ------------------------------------------------------------------
-- Copy and paste this ENTIRE file into the Supabase SQL Editor.
-- Click "Run" to set up your database.
-- ------------------------------------------------------------------

-- 1. Create Tables (if they don't exist)
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

-- 2. Enable Security
alter table purchases enable row level security;
alter table sales enable row level security;

-- 3. Create Access Policies (Safely)
-- We use a DO block to check if policies exist before creating them.
-- This prevents the "policy already exists" error.

do $$
begin
  -- Policy for Purchases
  if not exists (select from pg_policies where policyname = 'Public Access Purchases' and tablename = 'purchases') then
    create policy "Public Access Purchases" on purchases for all using (true) with check (true);
  end if;

  -- Policy for Sales
  if not exists (select from pg_policies where policyname = 'Public Access Sales' and tablename = 'sales') then
    create policy "Public Access Sales" on sales for all using (true) with check (true);
  end if;
end $$;

-- 4. Verify
select 'Database setup completed successfully' as result;