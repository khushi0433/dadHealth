"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useBodyMetrics(userId: string | undefined) {
  return useQuery({
    queryKey: ["body_metrics", userId],
    queryFn: async () => {
      if (!userId) return [];
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const { data, error } = await supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", userId)
        .gte("recorded_at", start.toISOString().slice(0, 10))
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSaveBodyMetric(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { metric_type: string; value: number; weight_kg?: number }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("body_metrics")
        .insert({
          user_id: userId,
          ...params,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body_metrics", userId] });
      queryClient.invalidateQueries({ queryKey: ["report_stats", userId] });
    },
  });
}
