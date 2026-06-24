"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

// Loose shape of a row in public.user_profile. Only the fields we read in the
// client are listed; `select("*")` returns the full row so unlisted fields are
// still available via casts where needed.
export type UserProfileRow = {
  user_id: string;
  client_id?: string | null;
  timezone?: string | null;
  push_notifications_enabled?: boolean | null;
  goals?: string[] | null;
  pillar_order?: string[] | null;
  onboarding_complete?: boolean | null;
  // Phase 1 fields
  display_name?: string | null;
  parent_type?: string | null;
  pronouns?: string | null;
  custody_arrangement?: string | null;
  kids_ages?: string[] | null;
  // Phase gating flags
  phase2_complete?: boolean | null;
  phase3_complete?: boolean | null;
};

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: {
      goals?: string[];
      pillar_order?: string[];
      onboarding_complete?: boolean;
      timezone?: string;
      push_notifications_enabled?: boolean;
      display_name?: string;
      parent_type?: string;
      pronouns?: string | null;
      custody_arrangement?: string;
      kids_ages?: string[];
    }) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_profile")
        .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profile", userId] });
    },
  });
}