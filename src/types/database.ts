export interface BrandConfig {
  primary?: string;
  primaryForeground?: string;
  accent?: string;
  lime?: string;
  ring?: string;
  sidebarPrimary?: string;
  sidebarRing?: string;
}

export interface Client {
  id: string;
  slug: string;
  name: string;
  brand_config: BrandConfig;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  client_id?: string | null;
  goals?: string[] | null;
  pillar_order?: string[] | null;
  onboarding_complete?: boolean;
  display_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  date: string;
  mood_value: number;
  created_at?: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  created_at?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  exercise_name: string;
  duration_minutes?: number;
  calories?: number;
  performed_at: string;
  created_at?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_count: number;
  last_activity_date: string;
  updated_at?: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description?: string;
  participants_count?: number;
  active: boolean;
  created_at?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  day: string;
  name: string;
  kcal: number;
  created_at?: string;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  weight_kg?: number;
  metric_type: string;
  value: number;
  recorded_at: string;
  created_at?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  created_at?: string;
}

export interface Therapist {
  id: string;
  name: string;
  spec: string;
  slots: string;
  price: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  date: string;
  text: string;
  tag: string;
  created_at?: string;
}

export interface DadDate {
  id: string;
  icon: string;
  name: string;
  age_range: string;
  budget: string;
  time: string;
}

export interface AgePrompt {
  id: string;
  prompt: string;
  age_range?: string;
}

export interface Post {
  id: string;
  user_id: string | null;
  body: string;
  tag: string;
  anonymous: boolean;
  author_initials?: string;
  author_name?: string;
  author_meta?: string;
  created_at?: string;
  likes_count?: number;
  replies_count?: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at?: string;
}

export interface Circle {
  id: string;
  icon: string;
  name: string;
  members_count: number;
}

export interface UserCircle {
  id: string;
  user_id: string;
  circle_id: string;
  joined_at?: string;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
}

export interface EarnedBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at?: string;
}
