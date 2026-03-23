-- DadHealth RLS policies (run in Supabase SQL Editor after schema.sql)

-- Enable RLS
alter table clients enable row level security;
alter table mood_logs enable row level security;
alter table sleep_logs enable row level security;
alter table workout_sessions enable row level security;
alter table user_profile enable row level security;
alter table user_streaks enable row level security;
alter table meal_plans enable row level security;
alter table body_metrics enable row level security;
alter table journal_entries enable row level security;
alter table milestones enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table user_circles enable row level security;
alter table earned_badges enable row level security;

-- Policies
create policy "Anyone can read clients" on clients for select using (true);
create policy "Users can CRUD own mood_logs" on mood_logs for all using (auth.uid() = user_id);
create policy "Users can CRUD own sleep_logs" on sleep_logs for all using (auth.uid() = user_id);
create policy "Users can CRUD own workout_sessions" on workout_sessions for all using (auth.uid() = user_id);
create policy "Users can CRUD own user_profile" on user_profile for all using (auth.uid() = user_id);
create policy "Users can CRUD own user_streaks" on user_streaks for all using (auth.uid() = user_id);
create policy "Users can CRUD own meal_plans" on meal_plans for all using (auth.uid() = user_id);
create policy "Users can CRUD own body_metrics" on body_metrics for all using (auth.uid() = user_id);
create policy "Users can CRUD own journal_entries" on journal_entries for all using (auth.uid() = user_id);
create policy "Users can CRUD own milestones" on milestones for all using (auth.uid() = user_id);

create policy "Allow read posts" on posts for select using (true);
create policy "Auth can insert posts" on posts for insert with check (true);

create policy "Allow read likes" on likes for select using (true);
create policy "Users can insert own likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);

create policy "Allow read comments" on comments for select using (true);
create policy "Users can insert own comments" on comments for insert with check (auth.uid() = user_id);

create policy "Users can CRUD own user_circles" on user_circles for all using (auth.uid() = user_id);
create policy "Users can CRUD own earned_badges" on earned_badges for all using (auth.uid() = user_id);
