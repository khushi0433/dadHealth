"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useMilestones(userId: string | undefined) {
  return useQuery({
    queryKey: ["milestones", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSaveMilestone(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { date: string; text: string; tag: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("milestones")
        .insert({ user_id: userId, ...params })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", userId] });
    },
  });
}
