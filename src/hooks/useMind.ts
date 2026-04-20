"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_JOURNAL_PROMPTS = [
  "What felt heavy today, and why?",
  "What went better than expected today?",
  "What do I want to do differently tomorrow?",
  "What am I grateful for right now?",
];

export function useMind(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mind", userId],
    queryFn: async () => {
      const [moodRes, therapistsRes] = await Promise.all([
        userId
          ? supabase
              .from("mood_logs")
              .select("*")
              .eq("user_id", userId)
              .order("date", { ascending: false })
              .limit(30)
          : { data: [] },
        supabase.from("therapists").select("*"),
      ]);
      const therapists = (therapistsRes.data ?? []).map((t: { name: string; spec?: string; availability?: string; price_per_hour?: number }) => ({
        ...t,
        slots: t.availability ?? "—",
        price: t.price_per_hour != null ? `£${t.price_per_hour}/hr` : "—",
      }));
      return {
        moodLogs: moodRes.data ?? [],
        therapists,
        journalPrompts: DEFAULT_JOURNAL_PROMPTS,
      };
    },
    enabled: true,
  });

  const saveJournal = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          content,
          mood_value: 3,
          tag: "EVENING_JOURNAL",
        })
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
