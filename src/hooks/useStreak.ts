"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_streaks", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase
        .from("user_streaks")
        .select("streak_count")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data?.streak_count ?? 0;
    },
    enabled: !!userId,
  });
}
