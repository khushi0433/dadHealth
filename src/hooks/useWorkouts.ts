"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useWorkoutSessions(userId: string | undefined) {
  return useQuery({
    queryKey: ["workout_sessions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("performed_at", start.toISOString().slice(0, 10))
        .order("performed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSaveWorkout(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      exercise_name: string;
      duration_minutes?: number;
      calories?: number;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: userId,
          ...params,
          performed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_sessions", userId] });
      queryClient.invalidateQueries({ queryKey: ["dad_score", userId] });
      queryClient.invalidateQueries({ queryKey: ["report_stats", userId] });
    },
  });
}
