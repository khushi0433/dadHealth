"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useSleepLogs(userId: string | undefined) {
  return useQuery({
    queryKey: ["sleep_logs", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSaveSleepLog(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, hours }: { date: string; hours: number }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("sleep_logs")
        .upsert(
          { user_id: userId, date, hours },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sleep_logs", userId] });
      queryClient.invalidateQueries({ queryKey: ["dad_score", userId] });
      queryClient.invalidateQueries({ queryKey: ["report_stats", userId] });
    },
  });
}
