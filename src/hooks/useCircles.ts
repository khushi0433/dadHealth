"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useCircles() {
  return useQuery({
    queryKey: ["circles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circles")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUserCircles(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_circles", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_circles")
        .select("circle_id")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((r) => r.circle_id);
    },
    enabled: !!userId,
  });
}

export function useJoinCircle(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ circleId, join }: { circleId: string; join: boolean }) => {
      if (!userId) throw new Error("Not authenticated");
      if (join) {
        const { error } = await supabase
          .from("user_circles")
          .insert({ user_id: userId, circle_id: circleId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_circles")
          .delete()
          .eq("user_id", userId)
          .eq("circle_id", circleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_circles", userId] });
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });
}
