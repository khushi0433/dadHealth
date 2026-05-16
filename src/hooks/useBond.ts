"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import { trackEvent } from "@/lib/analytics";
import { MILESTONE_PHOTO_BUCKET } from "@/lib/milestonePhotos";

type MilestoneInput = {
  date: string;
  text: string;
  tag: string;
};

type PhotoUploadResult = {
  photo_url: string;
};

export function useBond(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bond", userId],
    queryFn: async () => {
      const [dadDatesRes, milestonesRes, promptsRes, storageRes] = await Promise.all([
        supabase.from("dad_dates").select("*"),
        userId
          ? supabase
              .from("milestones")
              .select("*")
              .eq("user_id", userId)
              .order("date", { ascending: false })
          : { data: [] },
        supabase.from("age_prompts").select("*"),
        userId
          ? supabase.storage.from(MILESTONE_PHOTO_BUCKET).list(userId, { limit: 1000 })
          : { data: [] },
      ]);
      const storageBytes = (storageRes.data ?? []).reduce((sum: number, item: { metadata?: { size?: number } | null }) => {
        return sum + (Number(item.metadata?.size) || 0);
      }, 0);

      return {
        dadDates: dadDatesRes.data ?? [],
        milestones: milestonesRes.data ?? [],
        prompts: promptsRes.data ?? [],
        milestoneStorageBytes: storageBytes,
      };
    },
    enabled: true,
  });

  const saveMilestone = useMutation({
    mutationFn: async (params: MilestoneInput) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("milestones")
        .insert({ user_id: userId, ...params })
        .select()
        .single();
      if (error) throw error;
      trackEvent("milestone_logged", {
        tag: params.tag,
        date: params.date,
        text_length: params.text.length,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bond", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
  });

  const uploadMilestonePhoto = useMutation({
    mutationFn: async ({ milestoneId, file }: { milestoneId: string; file: File }) => {
      if (!userId) throw new Error("Not authenticated");

      const form = new FormData();
      form.append("photo", file);

      const res = await fetch(`/api/milestones/${milestoneId}/photo`, {
        method: "POST",
        body: form,
      });
      const body = (await res.json()) as Partial<PhotoUploadResult> & { error?: string };
      if (!res.ok || !body.photo_url) {
        throw new Error(body.error || "Unable to upload milestone photo");
      }

      trackEvent("milestone_photo_uploaded", { milestone_id: milestoneId });
      return body.photo_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bond", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  const deleteMilestonePhoto = useMutation({
    mutationFn: async (milestoneId: string) => {
      if (!userId) throw new Error("Not authenticated");

      const res = await fetch(`/api/milestones/${milestoneId}/photo`, {
        method: "DELETE",
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Unable to delete milestone photo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bond", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  return {
    dadDates: data?.dadDates ?? [],
    milestones: data?.milestones ?? [],
    prompts: data?.prompts ?? [],
    milestoneStorageBytes: data?.milestoneStorageBytes ?? 0,
    loading: isLoading,
    saveMilestone,
    uploadMilestonePhoto,
    deleteMilestonePhoto,
  };
}
