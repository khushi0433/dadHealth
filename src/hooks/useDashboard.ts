"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

async function updateStreak(supabaseClient: typeof supabase, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabaseClient
    .from("user_streaks")
    .select("streak_count, last_activity_date")
    .eq("user_id", userId)
    .maybeSingle();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newCount = 1;
  if (existing) {
    if (existing.last_activity_date === today) return;
    if (existing.last_activity_date === yesterdayStr) {
      newCount = (existing.streak_count ?? 0) + 1;
    }
  }

  await supabaseClient
    .from("user_streaks")
    .upsert({ user_id: userId, streak_count: newCount, last_activity_date: today }, { onConflict: "user_id" });
}

async function fetchDashboard(userId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const monthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [dashboardRes, scoreRes, moodRes, workoutsRes, journalRes, milestonesRes, challengeRes, dadDatesRes, profileRes] = await Promise.all([
    supabase.from("dashboard_view").select("*").eq("user_id", userId).single(),
    supabase.from("dad_score_view").select("mind_score, body_score, bond_score").eq("user_id", userId).single(),
    supabase
      .from("mood_logs")
      .select("date, mood_value")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgo.toISOString().slice(0, 10))
      .order("date"),
    supabase
      .from("workout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("performed_at", monthStart)
      .lte("performed_at", monthEnd),
    supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd + "T23:59:59"),
    supabase
      .from("milestones")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", monthStart)
      .lte("date", monthEndDate),
    supabase.from("weekly_challenges").select("*").eq("active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("dad_dates").select("*"),
    supabase.from("user_profile").select("display_name").eq("user_id", userId).maybeSingle(),
  ]);

  const dashboard = dashboardRes.data;
  const profile = profileRes.data;
  const score = scoreRes.data;
  const moodLogs = moodRes.data ?? [];
  const monthWorkouts = workoutsRes.count ?? 0;
  const journalCount = journalRes.count ?? 0;
  const dadDatesCount = milestonesRes.count ?? 0;
  const challenge = challengeRes.data;
  const dadDates = dadDatesRes.data ?? [];

  const mind = score?.mind_score ?? 72;
  const body = score?.body_score ?? 81;
  const bond = score?.bond_score ?? 68;
  const totalScore = Math.round((mind + body + bond) / 3);

  return {
    ...dashboard,
    display_name: profile?.display_name,
    mind_score: mind,
    body_score: body,
    bond_score: bond,
    total_score: totalScore,
    mood_logs: moodLogs,
    month_workouts: monthWorkouts,
    reportStats: {
      workouts: monthWorkouts,
      journal: journalCount,
      dadDates: dadDatesCount,
    },
    challenge,
    dadDates,
    date: new Date().toISOString().slice(0, 10),
  };
}

async function fetchAppStats() {
  const { count: dadsCount } = await supabase
    .from("user_profile")
    .select("id", { count: "exact", head: true });
  return { dadsCount: dadsCount ?? 0 };
}

export function useDashboard(userId?: string) {
  const queryClient = useQueryClient();
  const date = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => fetchDashboard(userId!),
    enabled: !!userId,
  });

  const { data: appStats } = useQuery({
    queryKey: ["app_stats"],
    queryFn: fetchAppStats,
  });

  const checkIn = useMutation({
    mutationFn: async ({ mood_value, sleep_hours }: { mood_value: number; sleep_hours: number }) => {
      if (!userId) throw new Error("Not authenticated");
      await Promise.all([
        supabase.from("mood_logs").upsert({ user_id: userId, date, mood_value }, { onConflict: "user_id,date" }),
        supabase.from("sleep_logs").upsert({ user_id: userId, date, hours: sleep_hours }, { onConflict: "user_id,date" }),
      ]);
      await updateStreak(supabase, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  return {
    data,
    loading: isLoading,
    dadDates: data?.dadDates ?? [],
    dadsCount: appStats?.dadsCount ?? 0,
    checkIn,
  };
}
