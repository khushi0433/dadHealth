"use client";

import { useState } from "react";
import {
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import type { User } from "@supabase/supabase-js";
import LimeButton from "@/components/LimeButton";

type FeedPost = Record<string, unknown>;

type ToggleLikeMutation = {
  mutate: (args: { postId: string; liked: boolean }) => void;
  isPending: boolean;
  variables?: { postId: string; liked: boolean };
};

type ToggleSaveMutation = {
  mutate: (args: { postId: string; saved: boolean }) => void;
  isPending: boolean;
  variables?: { postId: string; saved: boolean };
};

interface CommunityFeedPostProps {
  p: FeedPost;
  user: User | null;
  userLikedIds: Set<string>;
  userSavedIds: Set<string>;
  toggleLike: ToggleLikeMutation;
  toggleSave: ToggleSaveMutation;
  deletePost: { mutate: (id: string) => void; isPending: boolean };
  openAuthModal: () => void;
}
/** Supabase / JSON may return `id` as string or another serializable type — avoid strict typeof === "string" only. */
function resolvePostId(p: FeedPost): string | null {
  const raw = p.id;
  if (raw == null || raw === "") {
    return null;
  }
  const s = String(raw);
  if (s.length === 0 || s === "[object Object]" || s === "undefined" || s === "null") return null;
  return s;
}

export default function CommunityFeedPost({
  p,
  user,
  userLikedIds,
  userSavedIds,
  toggleLike,
  toggleSave,
  deletePost,
  openAuthModal,
}: CommunityFeedPostProps) {
  const postId = resolvePostId(p);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");

  const { data: comments = [], isLoading: commentsLoading } = useComments(expanded ? postId : null);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const isAnon = p.anonymous === true;
  const liked = postId ? userLikedIds.has(postId) : false;
  const saved = postId ? userSavedIds.has(postId) : false;
  const authorUserId = p.user_id != null ? String(p.user_id) : null;
  const isOwner = !!(user?.id && authorUserId && authorUserId === String(user.id));

  const likeBusy = toggleLike.isPending && toggleLike.variables?.postId === postId;

  const handleReplyClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!postId) {
      return;
    }
    setExpanded((e) => !e);
  };

  const handleSubmitComment = () => {
    if (!postId) {
      return;
    }
    if (!user?.id) {
      openAuthModal();
      return;
    }
    if (!draft.trim()) return;
    addComment.mutate(
      { postId, content: draft.trim(), userId: user.id },
      { onSuccess: () => setDraft("") }
    );
  };

  return (
    <div className="relative isolate px-5 py-4 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className={`w-9 h-9 flex items-center justify-center font-heading text-xs font-extrabold shrink-0 ${
            isAnon
              ? "bg-white/[0.08] border border-white/15 text-muted-foreground"
              : "bg-primary/10 border border-primary text-primary"
          }`}
        >
          {(p.author_initials ?? p.initials ?? "?") as string}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading text-[13px] font-bold text-foreground tracking-wide flex items-center gap-1.5">
            {(p.author_name ?? p.name ?? "Dad") as string}
            {isAnon && (
              <span className="bg-white/[0.08] border border-white/10 font-heading text-[9px] font-bold tracking-wider text-muted-foreground px-1.5 py-0.5 uppercase">
                ANON
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {(p.author_meta ?? p.meta ?? "") as string}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="tag-pill">{(p.tag ?? "FITNESS") as string}</span>
          {isOwner && postId && (
            <button
              type="button"
              onClick={() => deletePost.mutate(postId)}
              disabled={deletePost.isPending}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-sm"
              aria-label="Delete post"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">{(p.body ?? p.content ?? "") as string}</p>
      <div className="relative z-[60] flex flex-wrap gap-2 items-center pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            if (!user) {
              openAuthModal();
              return;
            }
            if (!postId) {
              return;
            }
            toggleLike.mutate({ postId, liked });
          }}
          disabled={likeBusy}
          className={`post-action inline-flex items-center gap-1.5 min-h-9 ${liked ? "text-primary" : ""} ${!postId ? "opacity-50" : ""}`}
        >
          <HandThumbUpIcon className="w-4 h-4 shrink-0" aria-hidden />
          <span>
            {(p.likes_count ?? p.respect ?? 0) as number} RESPECT
          </span>
        </button>
        <button
          type="button"
          onClick={handleReplyClick}
          className={`post-action inline-flex items-center gap-1.5 min-h-9 ${expanded ? "text-primary" : ""} ${!postId ? "opacity-50" : ""}`}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 shrink-0" aria-hidden />
          <span>
            {(p.replies_count ?? p.replies ?? 0) as number} REPLIES
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              openAuthModal();
              return;
            }
            if (!postId) {
              return;
            }
            toggleSave.mutate({ postId, saved });
          }}
          className={`post-action inline-flex items-center gap-1.5 min-h-9 ${saved ? "text-primary" : ""} ${!postId ? "opacity-50" : ""}`}
        >
          {saved ? (
            <BookmarkSolidIcon className="w-4 h-4 shrink-0" aria-hidden />
          ) : (
            <BookmarkIcon className="w-4 h-4 shrink-0" aria-hidden />
          )}
          <span>SAVE</span>
        </button>
      </div>

      {expanded && postId && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {commentsLoading ? (
            <p className="text-xs text-muted-foreground">Loading replies…</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c: { id: string; user_id: string; content: string }) => (
                <li key={c.id} className="flex gap-2 justify-between text-[12px] text-foreground/80">
                  <span className="flex-1">
                    <span className="font-heading font-bold text-foreground/90 mr-2">
                      {c.user_id === user?.id ? "You" : "Dad"}
                    </span>
                    {c.content}
                  </span>
                  {user?.id === c.user_id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user?.id) return;
                        deleteComment.mutate({ commentId: c.id, postId, userId: user.id });
                      }}
                      disabled={deleteComment.isPending}
                      className="shrink-0 p-1 text-muted-foreground hover:text-destructive rounded-sm"
                      aria-label="Delete comment"
                    >
                      <TrashIcon className="w-3.5 h-3.5" aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {user && (
            <div className="flex flex-col gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="w-full bg-white/[0.04] border border-border p-2 text-foreground text-xs resize-none outline-none focus:border-primary placeholder:text-muted-foreground/40"
              />
              <LimeButton small type="button" onClick={handleSubmitComment} disabled={!draft.trim() || addComment.isPending}>
                {addComment.isPending ? "..." : "REPLY"}
              </LimeButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
