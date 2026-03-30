"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";
import { communityQueryKey } from "@/lib/communityQueryKey";
import { ANONYMOUS_AUTHOR_NAME, DEFAULT_DISPLAY_FALLBACK } from "@/lib/userDisplay";

export type EnrichedComment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  anonymous?: boolean;
  created_at?: string;
  /** null = top-level; set = reply to that comment (max depth 1 in UI) */
  parent_id?: string | null;
  /** display_name from user_profile, or anonymous label when anonymous */
  author_label: string;
};

function byCreatedAt(a: EnrichedComment, b: EnrichedComment) {
  return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
}

function isTopLevelComment(c: EnrichedComment) {
  const p = c.parent_id;
  if (p == null || p === "") return true;
  if (typeof p === "string" && p.trim() === "") return true;
  return false;
}

/** Stable key for matching parent_id ↔ comment id (Supabase UUID string casing). */
export function threadIdKey(id: unknown): string {
  return String(id ?? "")
    .trim()
    .toLowerCase();
}

/** Split flat list into roots + replies grouped by parent (1 level). */
export function groupCommentThreads(flat: EnrichedComment[]) {
  const roots = flat.filter(isTopLevelComment).sort(byCreatedAt);
  const repliesByParentId = new Map<string, EnrichedComment[]>();
  flat
    .filter((c) => !isTopLevelComment(c))
    .forEach((c) => {
      const pid = threadIdKey(c.parent_id);
      if (!pid || pid === "null" || pid === "undefined") return;
      const list = repliesByParentId.get(pid) ?? [];
      list.push(c);
      repliesByParentId.set(pid, list);
    });
  repliesByParentId.forEach((arr) => arr.sort(byCreatedAt));
  return { roots, repliesByParentId };
}

export function useComments(postId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
          queryClient.invalidateQueries({ queryKey: ["community"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<EnrichedComment[]> => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as Array<{
        id: string;
        user_id: string;
        post_id: string;
        content: string;
        anonymous?: boolean;
        created_at?: string;
        parent_id?: string | null;
      }>;
      const ids = [...new Set(rows.map((r) => String(r.user_id)))];
      let profileByUser = new Map<string, string | null>();
      if (ids.length > 0) {
        const { data: profiles, error: pErr } = await supabase
          .from("user_profile")
          .select("user_id, display_name")
          .in("user_id", ids);
        // RLS only returns the current user's row for others' ids — never fail the whole thread
        if (!pErr && profiles) {
          profileByUser = new Map(
            (profiles as { user_id: string; display_name: string | null }[]).map((p) => [
              threadIdKey(p.user_id),
              p.display_name,
            ])
          );
        }
      }
      return rows.map((r) => {
        const anon = r.anonymous === true;
        const fromProfile = profileByUser.get(threadIdKey(r.user_id));
        const author_label = anon ? ANONYMOUS_AUTHOR_NAME : (fromProfile?.trim() || DEFAULT_DISPLAY_FALLBACK);
        const rawParent = r.parent_id;
        const normalizedParent =
          rawParent != null && String(rawParent).trim() !== "" && String(rawParent) !== "undefined"
            ? String(rawParent).trim()
            : null;
        return { ...r, parent_id: normalizedParent, author_label };
      });
    },
    enabled: !!postId,
  });
}

/** Pass `sessionUserId` so optimistic updates hit the same React Query cache as `communityQueryKey(userId)`. */
export function useAddComment(sessionUserId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      content,
      userId,
      parentId,
    }: {
      postId: string;
      content: string;
      userId: string;
      /** If set, must reference a top-level comment on the same post (depth 1 only). */
      parentId?: string | null;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const parent_id: string | null =
        parentId != null && String(parentId).trim() !== "" && String(parentId) !== "undefined"
          ? String(parentId).trim()
          : null;
      if (parent_id) {
        const { data: parent, error: pErr } = await supabase
          .from("comments")
          .select("id, post_id, parent_id")
          .eq("id", parent_id)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!parent) throw new Error("Comment not found");
        if (String(parent.post_id) !== postId) throw new Error("Invalid thread");
        if (parent.parent_id != null) throw new Error("You can only reply to a top-level comment");
      }
      const insertRow: {
        user_id: string;
        post_id: string;
        content: string;
        parent_id: string | null;
      } = {
        user_id: userId,
        post_id: postId,
        content,
        parent_id,
      };
      const { data, error } = await supabase.from("comments").insert(insertRow).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ postId, content, userId, parentId }) => {
      const pid = String(postId);
      const ck = communityQueryKey(sessionUserId);
      await queryClient.cancelQueries({ queryKey: ["comments", pid] });
      await queryClient.cancelQueries({ queryKey: ck });
      const prevComments = queryClient.getQueryData<EnrichedComment[]>(["comments", pid]);
      const prevCommunity = queryClient.getQueryData<Record<string, unknown>[]>(ck);
      const optimisticParent =
        parentId != null && String(parentId).trim() !== "" ? String(parentId).trim() : null;
      const optimistic: EnrichedComment = {
        id: `optimistic-${Date.now()}`,
        user_id: userId,
        post_id: pid,
        content,
        parent_id: optimisticParent,
        created_at: new Date().toISOString(),
        author_label: "You",
      };
      queryClient.setQueryData<EnrichedComment[]>(["comments", pid], [...(prevComments ?? []), optimistic]);
      queryClient.setQueryData<Record<string, unknown>[]>(ck, (old) => {
        if (!old) return old;
        return old.map((row) => {
          if (String(row.id) !== pid) return row;
          return { ...row, replies_count: Number(row.replies_count ?? 0) + 1 };
        });
      });
      return { prevComments, prevCommunity, pid };
    },
    onError: (e, variables, ctx) => {
      const key = String(variables.postId);
      const ck = communityQueryKey(sessionUserId);
      if (ctx?.prevComments !== undefined) queryClient.setQueryData(["comments", key], ctx.prevComments);
      if (ctx?.prevCommunity !== undefined) queryClient.setQueryData(ck, ctx.prevCommunity);
      toast.error(e instanceof Error ? e.message : String(e) || "Could not post reply");
    },
    onSettled: (_d, _e, variables) => {
      if (!variables) return;
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
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
