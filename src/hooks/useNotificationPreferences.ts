"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import type { NotificationPreference, NotificationType } from "@/types/database";

export function useNotificationPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ["notification_preferences", userId],
    queryFn: async () => {
      if (!userId) return [] as NotificationPreference[];
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []) as NotificationPreference[];
    },
    enabled: !!userId,
  });
}

export function useUpsertNotificationPreference(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pref: { notification_type: NotificationType; enabled: boolean; send_time?: string | null }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: userId,
            notification_type: pref.notification_type,
            enabled: pref.enabled,
            send_time: pref.send_time ?? null,
          },
          { onConflict: "user_id,notification_type" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as NotificationPreference;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification_preferences", userId] });
    },
  });
}

