-- ─────────────────────────────────────────────────────────────
-- EZ Calorie Premium — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- USERS
create table if not exists users (
  id                 uuid primary key default gen_random_uuid(),
  clerk_id           text unique not null,
  email              text,
  is_premium         boolean default false,
  stripe_customer_id text,
  calorie_goal       integer,
  created_at         timestamptz default now()
);

-- FOOD LOGS
create table if not exists food_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  date_key     text not null,
  logged_at    timestamptz default now(),
  food_name    text,
  emoji        text,
  calories     integer default 0,
  protein      integer default 0,
  carbs        integer default 0,
  fat          integer default 0,
  fiber        integer default 0,
  serving_size text,
  time_label   text
);

-- REMINDERS
create table if not exists reminders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references users(id) on delete cascade,
  label             text,
  time_of_day       time,
  enabled           boolean default true,
  push_subscription jsonb
);

-- INDEXES for fast queries
create index if not exists idx_food_logs_user_date on food_logs(user_id, date_key);
create index if not exists idx_users_clerk on users(clerk_id);
create index if not exists idx_users_stripe on users(stripe_customer_id);

-- ROW LEVEL SECURITY (recommended)
alter table users    enable row level security;
alter table food_logs enable row level security;
alter table reminders enable row level security;

-- Service role bypasses RLS (our backend uses service role key)
-- so no extra policies needed for server-side queries
