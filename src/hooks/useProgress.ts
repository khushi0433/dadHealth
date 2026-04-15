"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

function calcScore(
  moodAvg: number | null,
  sleepAvg: number | null,
  workoutCount: number,
  journalCount: number
): number | null {
  if (moodAvg == null || sleepAvg == null) return null;
  const moodScore = Math.min(100, (moodAvg / 4) * 30);
  const sleepScore = Math.min(30, (sleepAvg / 8) * 30);
  const workoutScore = Math.min(25, workoutCount * 3);
  const journalScore = Math.min(15, journalCount * 2);
  return Math.round(Math.min(100, moodScore + sleepScore + workoutScore + journalScore));
}

export function useProgress(userId?: string) {
  return useQuery({
    queryKey: ["progress", userId],
    queryFn: async () => {
      if (!userId) {
        return {
          scoreData: null,
          reportStats: null,
          sleepLogs: [],
          moodLogs: [],
          badges: [],
          earnedBadges: [],
        };
      }

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const start = weekAgo.toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = end;

      const [
        moodRes,
        sleepRes,
        workoutRes,
        journalRes,
        workoutMonthRes,
        journalMonthRes,
        milestonesRes,
        sleepMonthRes,
        streakRes,
        moodMonthRes,
        badgesRes,
        earnedBadgesRes,
      ] = await Promise.all([
        supabase.from("mood_logs").select("date, mood_value").eq("user_id", userId).gte("date", start).lte("date", end),
        supabase.from("sleep_logs").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
        supabase
          .from("workout_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("performed_at", start)
          .lte("performed_at", end + "T23:59:59"),
        supabase
          .from("journal_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", start)
          .lte("created_at", end + "T23:59:59"),
        supabase
          .from("workout_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("performed_at", monthStart)
          .lte("performed_at", monthEnd + "T23:59:59"),
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
          .lte("date", monthEnd),
        supabase.from("sleep_logs").select("hours").eq("user_id", userId).gte("date", monthStart).lte("date", monthEnd),
        supabase.from("user_streaks").select("streak_count").eq("user_id", userId).maybeSingle(),
        supabase.from("mood_logs").select("mood_value").eq("user_id", userId).gte("date", monthStart).lte("date", monthEnd),
        supabase.from("badges").select("*"),
        supabase
          .from("earned_badges")
          .select("badge_id, badges(icon, name)")
          .eq("user_id", userId),
      ]);

      const moodAvg =
        moodRes.data?.length && moodRes.data.length > 0
          ? moodRes.data.reduce((a: number, b: { mood_value: number }) => a + b.mood_value, 0) / moodRes.data.length
          : null;
      const sleepAvg =
        sleepRes.data?.length && sleepRes.data.length > 0
          ? sleepRes.data.reduce((a: number, b: { hours: number }) => a + b.hours, 0) / sleepRes.data.length
          : null;
      const workoutCount = workoutRes.count ?? 0;
      const journalCount = journalRes.count ?? 0;
      const score = calcScore(moodAvg, sleepAvg, workoutCount, journalCount);
      const mind = moodAvg == null ? null : Math.round((moodAvg / 4) * 100);
      const body = Math.round(Math.min(100, workoutCount * 15));
      const bond = Math.round(Math.min(100, journalCount * 20));

      const workouts = workoutMonthRes.count ?? 0;
      const journal = journalMonthRes.count ?? 0;
      const dadDates = milestonesRes.count ?? 0;
      const streak = streakRes.data?.streak_count ?? 0;
      const sleepData = sleepMonthRes.data ?? [];
      const avgSleep =
        sleepData.length > 0
          ? sleepData.reduce((a: number, b: { hours: number }) => a + b.hours, 0) / sleepData.length
          : null;
      const moodData = moodMonthRes.data ?? [];
      const moodMonthAvg =
        moodData.length > 0
          ? moodData.reduce((a: number, b: { mood_value: number }) => a + b.mood_value, 0) / moodData.length
          : null;
      const avgMood =
        moodMonthAvg == null
          ? null
          : moodMonthAvg >= 3.5
            ? "Good"
            : moodMonthAvg >= 2.5
              ? "Okay"
              : "Low";

      const earnedBadges = (earnedBadgesRes.data ?? [])
        .map((e: { badge_id: string; badges: { icon: string; name: string } }) => ({
          icon: e.badges?.icon,
          name: e.badges?.name,
        }))
        .filter((b): b is { icon: string; name: string } => Boolean(b.icon && b.name));

      return {
        scoreData: {
          score,
          breakdown: {
            mind: mind == null ? null : Math.min(100, mind),
            body: Math.min(100, body),
            bond: Math.min(100, bond),
          },
        },
        reportStats: {
          workouts,
          journal,
          dadDates,
          avgSleep: avgSleep == null ? null : Math.round(avgSleep * 10) / 10,
          streak,
          avgMood,
        },
        sleepLogs: sleepRes.data ?? [],
        moodLogs: moodRes.data ?? [],
        badges: badgesRes.data ?? [],
        earnedBadges,
      };
    },
    enabled: true,
  });
}
