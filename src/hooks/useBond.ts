"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import { trackEvent } from "@/lib/analytics";

export function useBond(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bond", userId],
    queryFn: async () => {
      const [dadDatesRes, milestonesRes, promptsRes] = await Promise.all([
        supabase.from("dad_dates").select("*"),
        userId
          ? supabase
              .from("milestones")
              .select("*")
              .eq("user_id", userId)
              .order("date", { ascending: false })
          : { data: [] },
        supabase.from("age_prompts").select("*"),
      ]);
      return {
        dadDates: dadDatesRes.data ?? [],
        milestones: milestonesRes.data ?? [],
        prompts: promptsRes.data ?? [],
      };
    },
    enabled: true,
  });

  const saveMilestone = useMutation({
    mutationFn: async (params: { date: string; text: string; tag: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("milestones")
        .insert({ user_id: userId, ...params })
        .select()
        .single();
      if (error) throw error;
      trackEvent("milestone_logged", {
        tag: params.tag,
        date: params.date,
        text_length: params.text.length,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bond", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  return {
    dadDates: data?.dadDates ?? [],
    milestones: data?.milestones ?? [],
    prompts: data?.prompts ?? [],
    loading: isLoading,
    saveMilestone,
  };
}
