"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!postId,
  });
}

/** Pass `userId` on each `mutate()` so RLS always gets the current user (not a stale hook closure). */
export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      content,
      userId,
    }: {
      postId: string;
      content: string;
      userId: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("comments")
        .insert({ user_id: userId, post_id: postId, content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : String(e) || "Could not post reply");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
      userId,
    }: {
      commentId: string;
      postId: string;
      userId: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : String(e) || "Could not delete reply"),
  });
}
