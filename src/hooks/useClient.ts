"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import type { Client } from "@/types/database";

export function useClient(clientId: string | undefined): ReturnType<typeof useQuery<Client | null>> {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();
      if (error) throw error;
      return data as Client;
    },
    enabled: !!clientId,
  });
}

export function useClientBySlug(slug: string | undefined): ReturnType<typeof useQuery<Client | null>> {
  return useQuery({
    queryKey: ["client", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(`slug.eq.${slug},subdomain.eq.${slug}`)
        .maybeSingle();
      if (error) throw error;
      return data as Client | null;
    },
    enabled: !!slug,
  });
}
