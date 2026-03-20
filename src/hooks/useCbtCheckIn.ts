"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useCbtCheckIn(userId: string | undefined) {
  const queryClient = useQueryClient();
  const date = new Date().toISOString().slice(0, 10);

  return useMutation({
    mutationFn: async ({ mood_value, sleep_hours }: { mood_value: number; sleep_hours: number }) => {
      if (!userId) throw new Error("Not authenticated");
      await Promise.all([
        supabase
          .from("mood_logs")
          .upsert({ user_id: userId, date, mood_value }, { onConflict: "user_id,date" }),
        supabase
          .from("sleep_logs")
          .upsert({ user_id: userId, date, hours: sleep_hours }, { onConflict: "user_id,date" }),
      ]);
      await updateStreak(supabase, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood_logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["sleep_logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["user_streaks", userId] });
      queryClient.invalidateQueries({ queryKey: ["dad_score", userId] });
      queryClient.invalidateQueries({ queryKey: ["report_stats", userId] });
    },
  });
}

async function updateStreak(supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
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

  await supabase
    .from("user_streaks")
    .upsert(
      { user_id: userId, streak_count: newCount, last_activity_date: today },
      { onConflict: "user_id" }
    );
}
