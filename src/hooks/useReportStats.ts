"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useReportStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["report_stats", userId],
    queryFn: async () => {
      if (!userId) return { workouts: 0, journal: 0, dadDates: 0, avgSleep: 0, streak: 0, avgMood: "Good" };

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = now.toISOString().slice(0, 10);

      const [
        workoutRes,
        journalRes,
        milestonesRes,
        sleepRes,
        streakRes,
        moodRes,
      ] = await Promise.all([
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
        supabase
          .from("sleep_logs")
          .select("hours")
          .eq("user_id", userId)
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase
          .from("user_streaks")
          .select("streak_count")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("mood_logs")
          .select("mood_value")
          .eq("user_id", userId)
          .gte("date", monthStart)
          .lte("date", monthEnd),
      ]);

      const workouts = workoutRes.count ?? 0;
      const journal = journalRes.count ?? 0;
      const dadDates = milestonesRes.count ?? 0;
      const streak = streakRes.data?.streak_count ?? 0;

      const sleepData = sleepRes.data ?? [];
      const avgSleep =
        sleepData.length > 0
          ? sleepData.reduce((a: number, b: { hours: number }) => a + b.hours, 0) / sleepData.length
          : 6.8;

      const moodData = moodRes.data ?? [];
      const moodAvg =
        moodData.length > 0
          ? moodData.reduce((a: number, b: { mood_value: number }) => a + b.mood_value, 0) / moodData.length
          : 3;
      const avgMood = moodAvg >= 3.5 ? "Good" : moodAvg >= 2.5 ? "Okay" : "Low";

      return {
        workouts,
        journal,
        dadDates,
        avgSleep: Math.round(avgSleep * 10) / 10,
        streak,
        avgMood,
      };
    },
    enabled: !!userId,
  });
}
