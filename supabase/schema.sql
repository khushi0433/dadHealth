-- DadHealth Supabase schema (reference - run in Supabase SQL Editor if tables don't exist)

-- mood_logs (1 per user per day)
create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mood_value int not null check (mood_value between 1 and 4),
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- sleep_logs
create table if not exists sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  hours numeric not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- workout_sessions
create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  duration_minutes int,
  calories int,
  performed_at timestamptz not null,
  created_at timestamptz default now()
);

-- user_profile
create table if not exists user_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  goals jsonb default '[]',
  pillar_order jsonb default '[]',
  onboarding_complete boolean default false,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- user_streaks
create table if not exists user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  streak_count int default 0,
  last_activity_date date,
  updated_at timestamptz default now()
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
-- Seed weekly challenge
insert into weekly_challenges (title, description, participants_count, active) 
select 'Screen-free Sunday', '847 dads taking part', 847, true 
where not exists (select 1 from weekly_challenges limit 1);

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
  weight_kg numeric,
  recorded_at timestamptz not null,
  created_at timestamptz default now()
);

-- journal_entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- therapists
create table if not exists therapists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  spec text not null,
  slots text not null,
  price text not null
);

-- milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
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
  time text not null
);

-- age_prompts
create table if not exists age_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  age_range text
);

-- posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  body text not null,
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
