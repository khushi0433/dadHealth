"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const posts = data ?? [];
      const postIds = posts.map((p: { id: string }) => p.id);
      if (postIds.length === 0) return posts;
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from("likes").select("post_id").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);
      const likeCounts: Record<string, number> = {};
      (likesRes.data ?? []).forEach((r: { post_id: string }) => {
        likeCounts[r.post_id] = (likeCounts[r.post_id] ?? 0) + 1;
      });
      const commentCounts: Record<string, number> = {};
      (commentsRes.data ?? []).forEach((r: { post_id: string }) => {
        commentCounts[r.post_id] = (commentCounts[r.post_id] ?? 0) + 1;
      });
      return posts.map((p: Record<string, unknown>) => ({
        ...p,
        likes_count: likeCounts[p.id as string] ?? 0,
        replies_count: commentCounts[p.id as string] ?? 0,
      }));
    },
  });
}

export function useCreatePost(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      body,
      tag,
      anonymous,
      author_initials,
      author_name,
      author_meta,
    }: {
      body: string;
      tag: string;
      anonymous: boolean;
      author_initials?: string;
      author_name?: string;
      author_meta?: string;
    }) => {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: anonymous ? null : userId,
          body,
          tag,
          anonymous: !!anonymous,
          author_initials: anonymous ? "?" : author_initials,
          author_name: anonymous ? "Anonymous Dad" : author_name,
          author_meta: author_meta ?? "",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
