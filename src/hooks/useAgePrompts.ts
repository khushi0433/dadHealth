"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useAgePrompts() {
  return useQuery({
    queryKey: ["age_prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("age_prompts")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
