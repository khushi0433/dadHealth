"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function useDadDates() {
  return useQuery({
    queryKey: ["dad_dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dad_dates")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
