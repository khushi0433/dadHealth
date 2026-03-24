-- DadHealth Supabase schema (run in Supabase SQL Editor if tables don't exist)

-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- TABLES
-- =========================

-- mood_logs
create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mood_value int not null check (mood_value between 0 and 4),
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- sleep_logs
create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  hours numeric not null,
  quality int check (quality between 1 and 5),
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- workout_sessions
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  duration_minutes int not null,
  calories int not null,
  exercises_completed int,
  performed_at timestamptz not null,
  created_at timestamptz default now()
);

-- clients (brand config per organization) - must exist before user_profile
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  -- Brand colours as HSL values (same format as CSS vars: "H S% L%")
  brand_config jsonb default '{
    "primary": "78 89% 65%",
    "primaryForeground": "0 0% 4%",
    "accent": "78 89% 65%",
    "lime": "78 89% 65%",
    "ring": "78 89% 65%",
    "sidebarPrimary": "78 89% 65%",
    "sidebarRing": "78 89% 65%"
  }'::jsonb,
  created_at timestamptz default now()
);

-- Seed default Dad Health client
insert into clients (id, slug, name, brand_config) values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'dadhealth',
  'Dad Health',
  '{"primary":"78 89% 65%","primaryForeground":"0 0% 4%","accent":"78 89% 65%","lime":"78 89% 65%","ring":"78 89% 65%","sidebarPrimary":"78 89% 65%","sidebarRing":"78 89% 65%"}'
) on conflict (id) do nothing;

-- user_profile
create table if not exists user_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  client_id uuid references clients(id) on delete set null,
  goals jsonb default '[]',
  pillar_order jsonb default '[]',
  onboarding_complete boolean default false,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- For existing DBs: add client_id if missing, backfill
alter table user_profile add column if not exists client_id uuid references clients(id) on delete set null;
update user_profile set client_id = '00000000-0000-0000-0000-000000000001'::uuid where client_id is null;

-- user_streaks
create table if not exists user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  streak_count int default 0,
  last_activity_date date,
  updated_at timestamptz default now()
);

-- daily_tasks
create table if not exists daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text,
  status text default 'open',
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, title, date)
);

-- weekly_challenges
create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  participants_count int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

insert into weekly_challenges (title, description, participants_count, active) 
select 'Screen-free Sunday', '847 dads taking part', 847, true 
where not exists (select 1 from weekly_challenges);

-- meal_plans
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  day text not null,
  name text not null,
  kcal int not null,
  created_at timestamptz default now(),
  unique(user_id, day)
);

-- body_metrics
create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  metric_type text not null,
  value numeric not null,
  weight_kg numeric not null,
  recorded_at timestamptz not null,
  created_at timestamptz default now()
);

-- journal_entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  mood_value int not null,
  tag text,
  created_at timestamptz default now()
);

-- therapists
create table if not exists therapists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  spec text,
  availability text,
  price_per_hour numeric not null
);

-- milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  text text not null,
  tag text not null,
  created_at timestamptz default now()
);

-- dad_dates
create table if not exists dad_dates (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  name text not null,
  age_range text not null,
  budget text not null,
  duration_minutes int not null,
  time_of_day text
);

-- posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  tag text not null,
  anonymous boolean default false,
  author_initials text,
  author_name text,
  author_meta text,
  created_at timestamptz default now()
);

-- likes
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  content text not null,
  anonymous boolean default false,
  created_at timestamptz default now()
);

-- circles
create table if not exists circles (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  name text not null,
  members_count int default 0
);

-- user_circles
create table if not exists user_circles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  circle_id uuid references circles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(user_id, circle_id)
);

-- badges
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  name text not null
);

-- earned_badges
create table if not exists earned_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- =========================
-- FUNCTIONS
-- =========================

-- streak logic
create or replace function update_streak(p_user_id uuid)
returns void
language plpgsql
as $$
declare
  last_date date;
begin
  select last_activity_date into last_date
  from user_streaks
  where user_id = p_user_id;

  if last_date = current_date then return; end if;

  if last_date = current_date - interval '1 day' then
    update user_streaks
    set streak_count = streak_count + 1,
        last_activity_date = current_date,
        updated_at = now()
    where user_id = p_user_id;
  else
    update user_streaks
    set streak_count = 1,
        last_activity_date = current_date,
        updated_at = now()
    where user_id = p_user_id;
  end if;
end;
$$;

-- check-in logic
create or replace function handle_daily_checkin(
  p_user_id uuid,
  p_mood int,
  p_sleep numeric
)
returns void
language plpgsql
as $$
begin
  insert into mood_logs (user_id, date, mood_value)
  values (p_user_id, current_date, p_mood)
  on conflict (user_id, date)
  do update set mood_value = excluded.mood_value;

  insert into sleep_logs (user_id, date, hours)
  values (p_user_id, current_date, p_sleep)
  on conflict (user_id, date)
  do update set hours = excluded.hours;

  perform update_streak(p_user_id);
end;
$$;

-- complete task
create or replace function complete_task(
  p_user_id uuid,
  p_title text
)
returns void
language plpgsql
as $$
begin
  insert into daily_tasks (user_id, title, date, status)
  values (p_user_id, p_title, current_date, 'done')
  on conflict (user_id, title, date)
  do update set status = 'done';
end;
$$;

-- =========================
-- VIEWS
-- =========================

create or replace view dad_score_view as
select 
  u.id as user_id,

  coalesce((
    select avg(mood_value) * 25
    from mood_logs m
    where m.user_id = u.id
    and m.date >= current_date - 7
  ), 0) as mind_score,

  least((
    select count(*) * 20
    from workout_sessions w
    where w.user_id = u.id
    and w.performed_at >= now() - interval '7 days'
  ), 100) as body_score,

  least((
    select count(*) * 15
    from journal_entries j
    where j.user_id = u.id
    and j.created_at >= now() - interval '7 days'
  ), 100) as bond_score

from auth.users u;

create or replace view dashboard_view as
select 
  u.id as user_id,
  m.mood_value,
  s.hours as sleep_hours,
  st.streak_count,
  (
    select count(*) 
    from workout_sessions w 
    where w.user_id = u.id 
    and w.performed_at::date = current_date
  ) as today_workouts
from auth.users u
left join mood_logs m on m.user_id = u.id and m.date = current_date
left join sleep_logs s on s.user_id = u.id and s.date = current_date
left join user_streaks st on st.user_id = u.id;

-- =========================
-- TRIGGERS
-- =========================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  default_client_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  signup_client_id uuid;
  final_client_id uuid;
begin
  -- Resolve client_id: from signup metadata, or default if it exists, else null
  signup_client_id := (new.raw_user_meta_data->>'client_id')::uuid;
  if signup_client_id is not null then
    final_client_id := signup_client_id;
  else
    select id into final_client_id from public.clients where id = default_client_id limit 1;
  end if;

  insert into public.user_profile (user_id, client_id) values (new.id, final_client_id);
  insert into public.user_streaks (user_id, streak_count) values (new.id, 0);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_mood_user_date on mood_logs(user_id, date);
create index if not exists idx_sleep_user_date on sleep_logs(user_id, date);
create index if not exists idx_workout_user on workout_sessions(user_id);
create index if not exists idx_tasks_user_date on daily_tasks(user_id, date);

create unique index if not exists limit_posts_per_hour
on posts(user_id, date_trunc('hour', created_at AT TIME ZONE 'UTC'));

-- =========================
-- LEGACY REPAIR (idempotent — run if signup failed before clients existed)
-- =========================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand_config jsonb default '{}',
  created_at timestamptz default now()
);

alter table user_profile add column if not exists client_id uuid references clients(id) on delete set null;

insert into clients (id, slug, name, brand_config) values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'dadhealth',
  'Dad Health',
  '{"primary":"78 89% 65%","primaryForeground":"0 0% 4%","accent":"78 89% 65%","lime":"78 89% 65%","ring":"78 89% 65%","sidebarPrimary":"78 89% 65%","sidebarRing":"78 89% 65%"}'
) on conflict (id) do nothing;

update user_profile set client_id = '00000000-0000-0000-0000-000000000001'::uuid where client_id is null;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  default_client_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  signup_client_id uuid;
  final_client_id uuid;
begin
  signup_client_id := (new.raw_user_meta_data->>'client_id')::uuid;
  if signup_client_id is not null then
    final_client_id := signup_client_id;
  else
    select id into final_client_id from public.clients where id = default_client_id limit 1;
  end if;

  insert into public.user_profile (user_id, client_id) values (new.id, final_client_id);
  insert into public.user_streaks (user_id, streak_count) values (new.id, 0);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();