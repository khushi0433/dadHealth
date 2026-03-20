"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

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
    mutationFn: async (updates: { goals?: string[]; pillar_order?: string[]; onboarding_complete?: boolean }) => {
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
