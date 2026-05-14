-- DadHealth RLS policies (run in Supabase SQL Editor after schema.sql)

-- Enable RLS
alter table clients enable row level security;
alter table mood_logs enable row level security;
alter table sleep_logs enable row level security;
alter table workout_sessions enable row level security;
alter table workouts enable row level security;
alter table workout_completions enable row level security;
alter table user_profile enable row level security;
alter table user_streaks enable row level security;
alter table meal_plans enable row level security;
alter table body_metrics enable row level security;
alter table journal_entries enable row level security;
alter table milestones enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table saved_posts enable row level security;
alter table user_circles enable row level security;
alter table earned_badges enable row level security;
alter table recipes enable row level security;
alter table user_saved_recipes enable row level security;
alter table bond_logs enable row level security;
alter table dad_day_searches enable row level security;

-- Policies
drop policy if exists "Anyone can read clients" on clients;
create policy "Anyone can read clients" on clients for select using (true);

drop policy if exists "Users can CRUD own mood_logs" on mood_logs;
create policy "Users can CRUD own mood_logs" on mood_logs for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own sleep_logs" on sleep_logs;
create policy "Users can CRUD own sleep_logs" on sleep_logs for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own workout_sessions" on workout_sessions;
create policy "Users can CRUD own workout_sessions" on workout_sessions for all using (auth.uid() = user_id);

drop policy if exists "Users can read admin and own workouts" on workouts;
create policy "Users can read admin and own workouts"
on workouts for select
using (source = 'admin' or auth.uid() = user_id);

drop policy if exists "Users can insert own ai workouts" on workouts;
create policy "Users can insert own ai workouts"
on workouts for insert
with check (auth.uid() = user_id and source = 'ai_generated');

drop policy if exists "Users can update own ai workouts" on workouts;
create policy "Users can update own ai workouts"
on workouts for update
using (auth.uid() = user_id and source = 'ai_generated')
with check (auth.uid() = user_id and source = 'ai_generated');

drop policy if exists "Users can delete own ai workouts" on workouts;
create policy "Users can delete own ai workouts"
on workouts for delete
using (auth.uid() = user_id and source = 'ai_generated');

drop policy if exists "Users can CRUD own workout_completions" on workout_completions;
create policy "Users can CRUD own workout_completions"
on workout_completions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own user_profile" on user_profile;
create policy "Users can CRUD own user_profile" on user_profile for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own user_streaks" on user_streaks;
create policy "Users can CRUD own user_streaks" on user_streaks for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own meal_plans" on meal_plans;
create policy "Users can CRUD own meal_plans" on meal_plans for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own body_metrics" on body_metrics;
create policy "Users can CRUD own body_metrics" on body_metrics for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own journal_entries" on journal_entries;
create policy "Users can CRUD own journal_entries" on journal_entries for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own milestones" on milestones;
create policy "Users can CRUD own milestones" on milestones for all using (auth.uid() = user_id);

drop policy if exists "Allow read posts" on posts;
create policy "Allow read posts" on posts for select using (true);

drop policy if exists "Auth can insert posts" on posts;
create policy "Auth can insert posts" on posts for insert with check (true);

drop policy if exists "Users can delete own posts" on posts;
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

drop policy if exists "Allow read likes" on likes;
create policy "Allow read likes" on likes for select using (true);

drop policy if exists "Users can insert own likes" on likes;
create policy "Users can insert own likes" on likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on likes;
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);

drop policy if exists "Allow read comments" on comments;
create policy "Allow read comments" on comments for select using (true);

drop policy if exists "Users can insert own comments" on comments;
create policy "Users can insert own comments" on comments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on comments;
create policy "Users can delete own comments" on comments for delete using (auth.uid() = user_id);

drop policy if exists "Allow read saved_posts" on saved_posts;
create policy "Allow read saved_posts" on saved_posts for select using (true);

drop policy if exists "Users can insert own saves" on saved_posts;
create policy "Users can insert own saves" on saved_posts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saves" on saved_posts;
create policy "Users can delete own saves" on saved_posts for delete using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own user_circles" on user_circles;
create policy "Users can CRUD own user_circles" on user_circles for all using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own earned_badges" on earned_badges;
create policy "Users can CRUD own earned_badges" on earned_badges for all using (auth.uid() = user_id);

drop policy if exists "Anyone can read cook together recipes" on recipes;
create policy "Anyone can read cook together recipes"
on recipes for select
using (cook_together = true);

drop policy if exists "Users can CRUD own saved recipes" on user_saved_recipes;
create policy "Users can CRUD own saved recipes"
on user_saved_recipes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own bond logs" on bond_logs;
create policy "Users can CRUD own bond logs"
on bond_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Expert events: public read, no user writes (admin via service role only)
alter table expert_events enable row level security;
drop policy if exists "Anyone can read active expert events" on expert_events;
create policy "Anyone can read active expert events"
on expert_events for select
using (active = true);

create policy "Users can view own dad day searches"
on dad_day_searches
for select
using (auth.uid() = user_id);

create policy "Users can insert own dad day searches"
on dad_day_searches
for insert
with check (auth.uid() = user_id);