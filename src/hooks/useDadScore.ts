"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

function calcScore(
  moodAvg: number,
  sleepAvg: number,
  workoutCount: number,
  journalCount: number
): number {
  const moodScore = Math.min(100, (moodAvg / 4) * 30);
  const sleepScore = Math.min(30, (sleepAvg / 8) * 30);
  const workoutScore = Math.min(25, workoutCount * 3);
  const journalScore = Math.min(15, journalCount * 2);
  return Math.round(Math.min(100, moodScore + sleepScore + workoutScore + journalScore));
}

export function useDadScore(userId: string | undefined) {
  return useQuery({
    queryKey: ["dad_score", userId],
    queryFn: async () => {
      if (!userId) return { score: 0, breakdown: { mind: 0, body: 0, bond: 0 } };

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const start = weekAgo.toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);

      const [moodRes, sleepRes, workoutRes, journalRes] = await Promise.all([
        supabase
          .from("mood_logs")
          .select("mood_value")
          .eq("user_id", userId)
          .gte("date", start)
          .lte("date", end),
        supabase
          .from("sleep_logs")
          .select("hours")
          .eq("user_id", userId)
          .gte("date", start)
          .lte("date", end),
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
      ]);

      const moodAvg =
        moodRes.data?.length && moodRes.data.length > 0
          ? moodRes.data.reduce((a: number, b: { mood_value: number }) => a + b.mood_value, 0) / moodRes.data.length
          : 2.5;
      const sleepAvg =
        sleepRes.data?.length && sleepRes.data.length > 0
          ? sleepRes.data.reduce((a: number, b: { hours: number }) => a + b.hours, 0) / sleepRes.data.length
          : 6;
      const workoutCount = workoutRes.count ?? 0;
      const journalCount = journalRes.count ?? 0;

      const score = calcScore(moodAvg, sleepAvg, workoutCount, journalCount);
      const mind = Math.round((moodAvg / 4) * 100);
      const body = Math.round(Math.min(100, workoutCount * 15 + 40));
      const bond = Math.round(Math.min(100, journalCount * 20 + 40));

      return {
        score,
        breakdown: { mind: Math.min(100, mind), body: Math.min(100, body), bond: Math.min(100, bond) },
      };
    },
    enabled: !!userId,
  });
}
