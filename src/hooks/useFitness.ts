"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useFitness(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fitness", userId],
    queryFn: async () => {
      if (!userId) {
        return {
          workouts: [],
          bodyMetrics: [],
          mealPlans: [],
          activeMealPlan: null,
        };
      }

      const start = new Date();
      start.setMonth(start.getMonth() - 1);

      const [workoutsRes, bodyRes, mealsRes] = await Promise.all([
        supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", userId)
          .gte("performed_at", start.toISOString().slice(0, 10))
          .order("performed_at", { ascending: false }),
        supabase
          .from("body_metrics")
          .select("*")
          .eq("user_id", userId)
          .gte("recorded_at", start.toISOString().slice(0, 10))
          .order("recorded_at", { ascending: false }),
        supabase.from("meal_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      const plans = mealsRes.data ?? [];
      const latestPlan =
        plans
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ??
        null;

      return {
        workouts: workoutsRes.data ?? [],
        bodyMetrics: bodyRes.data ?? [],
        mealPlans: plans,
        activeMealPlan: latestPlan,
      };
    },
    enabled: !!userId,
  });

  const saveWorkout = useMutation({
    mutationFn: async (params: { exercise_name: string; duration_minutes?: number; calories?: number }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({ user_id: userId, ...params, performed_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  const saveBodyMetric = useMutation({
    mutationFn: async (params: { metric_type: string; value: number; weight_kg?: number }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("body_metrics")
        .insert({ user_id: userId, ...params, recorded_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  const saveMealPlans = useMutation({
    mutationFn: async (meals: { day: string; name: string; kcal: number }[]) => {
      if (!userId) throw new Error("Not authenticated");
      const rows = meals.map((m) => ({ user_id: userId, ...m }));
      const { error } = await supabase.from("meal_plans").upsert(rows, { onConflict: "user_id,day" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", userId] });
    },
  });

 return {
  workouts: data?.workouts ?? [],
  bodyMetrics: data?.bodyMetrics ?? [],
  mealPlans: data?.mealPlans ?? [],
  activeMealPlan: data?.activeMealPlan ?? null,
  loading: isLoading,
  saveWorkout,
  saveBodyMetric,
  saveMealPlans,
}
}
