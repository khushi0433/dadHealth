"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEarnedBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["earned_badges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("earned_badges")
        .select("badge_id, badges(icon, name)")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((e: { badge_id: string; badges: { icon: string; name: string } }) => ({
        icon: e.badges?.icon ?? "🏆",
        name: e.badges?.name ?? "Badge",
      }));
    },
    enabled: !!userId,
  });
}
