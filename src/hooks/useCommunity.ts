"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

async function fetchPosts() {
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
    body: p.content ?? p.body,
    likes_count: likeCounts[p.id as string] ?? 0,
    replies_count: commentCounts[p.id as string] ?? 0,
  }));
}

async function fetchCommunityStats(posts: { tag?: string }[]) {
  const tagCounts: Record<string, number> = {};
  posts.forEach((p) => {
    const tag = p.tag ? `#${p.tag}` : "#FITNESS";
    tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  });
  const trendingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const { count: dadsCount, error } = await supabase
    .from("user_profile")
    .select("id", { count: "exact", head: true });

  return { dadsCount: error ? 0 : (dadsCount ?? 0), trendingTags };
}

export function useCommunity(userId?: string) {
  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community"],
    queryFn: fetchPosts,
  });

  const { data: communityStats } = useQuery({
    queryKey: ["community_stats", postsData?.length],
    queryFn: () => fetchCommunityStats(postsData ?? []),
    enabled: postsData !== undefined,
  });

  const userLikesQuery = useQuery({
    queryKey: ["user_likes", userId],
    queryFn: async () => {
      if (!userId) return new Set<string>();
      const { data, error } = await supabase.from("likes").select("post_id").eq("user_id", userId);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.post_id));
    },
    enabled: !!userId,
  });

  const circlesQuery = useQuery({
    queryKey: ["circles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("circles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const userCirclesQuery = useQuery({
    queryKey: ["user_circles", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from("user_circles").select("circle_id").eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map((r) => r.circle_id);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    const channel = supabase
      .channel("community-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community"] });
        queryClient.invalidateQueries({ queryKey: ["user_likes", userId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const createPost = useMutation({
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
          content: body,
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
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (!userId) throw new Error("Not authenticated");
      if (liked) {
        const { error } = await supabase.from("likes").delete().eq("user_id", userId).eq("post_id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ user_id: userId, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["user_likes", userId] });
    },
  });

  const joinCircle = useMutation({
    mutationFn: async ({ circleId, join }: { circleId: string; join: boolean }) => {
      if (!userId) throw new Error("Not authenticated");
      if (join) {
        const { error } = await supabase.from("user_circles").insert({ user_id: userId, circle_id: circleId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_circles").delete().eq("user_id", userId).eq("circle_id", circleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_circles", userId] });
      queryClient.invalidateQueries({ queryKey: ["circles"] });
    },
  });

  return {
    posts: postsData ?? [],
    dadsCount: communityStats?.dadsCount ?? 0,
    trendingTags: communityStats?.trendingTags ?? [],
    userLikedIds: userLikesQuery.data ?? new Set<string>(),
    circles: circlesQuery.data ?? [],
    userCircleIds: userCirclesQuery.data ?? [],
    loading: isLoading,
    createPost,
    toggleLike,
    joinCircle,
  };
}
