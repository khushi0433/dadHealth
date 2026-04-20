"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import { trackEvent } from "@/lib/analytics";

export function useMind(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mind", userId],
    queryFn: async () => {
      const [moodRes, therapistsRes, promptsRes] = await Promise.all([
        userId
          ? supabase
              .from("mood_logs")
              .select("*")
              .eq("user_id", userId)
              .order("date", { ascending: false })
              .limit(30)
          : { data: [] },
        supabase.from("therapists").select("*"),
        supabase.from("journal_prompts").select("text").order("created_at", { ascending: false }).limit(8),
      ]);
      const therapists = (therapistsRes.data ?? []).map((t: { name: string; spec?: string; availability?: string; price_per_hour?: number }) => ({
        ...t,
        slots: t.availability ?? "—",
        price: t.price_per_hour != null ? `£${t.price_per_hour}/hr` : "—",
      }));
      const journalPrompts = promptsRes.error
        ? []
        : (promptsRes.data ?? [])
            .map((p: { text?: string }) => p.text?.trim() ?? "")
            .filter((text): text is string => text.length > 0);
      return {
        moodLogs: moodRes.data ?? [],
        therapists,
        journalPrompts,
      };
    },
    enabled: true,
  });

  const saveJournal = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ user_id: userId, content })
        .select()
        .single();
      if (error) throw error;
      trackEvent("journal_entry_created", {
        content_length: content.length,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  return {
    moodLogs: data?.moodLogs ?? [],
    therapists: data?.therapists ?? [],
    journalPrompts: data?.journalPrompts ?? [],
    loading: isLoading,
    saveJournal,
  };
}
