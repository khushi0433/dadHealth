"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useMealPlans(userId: string | undefined) {
  return useQuery({
    queryKey: ["meal_plans", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .order("day");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useSaveMealPlans(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (meals: { day: string; name: string; kcal: number }[]) => {
      if (!userId) throw new Error("Not authenticated");
      const rows = meals.map((m) => ({ user_id: userId, ...m }));
      const { error } = await supabase.from("meal_plans").upsert(rows, {
        onConflict: "user_id,day",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal_plans", userId] });
    },
  });
}
