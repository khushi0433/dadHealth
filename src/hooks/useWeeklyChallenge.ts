"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useWeeklyChallenge() {
  return useQuery({
    queryKey: ["weekly_challenge"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? { title: "Screen-free Sunday", description: "847 dads taking part", participants_count: 847 };
    },
  });
}
