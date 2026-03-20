"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useUserLikes(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_likes", userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", userId);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.post_id));
    },
    enabled: !!userId,
  });
}
