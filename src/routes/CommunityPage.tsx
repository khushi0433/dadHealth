"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { CIRCLES, FEED_POSTS, EXPERTS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts, useCreatePost } from "@/hooks/usePosts";
import { useToggleLike } from "@/hooks/useLikes";
import { useUserLikes } from "@/hooks/useUserLikes";
import { useCircles, useUserCircles, useJoinCircle } from "@/hooks/useCircles";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";

const CommunityPage = () => {
  const { user } = useAuth();
  const { data: posts = [] } = usePosts();
  const createPost = useCreatePost(user?.id);
  const toggleLike = useToggleLike(user?.id);
  const { data: userLikedIds = new Set<string>() } = useUserLikes(user?.id);
  const { data: circles = [] } = useCircles();
  const { data: userCircleIds = [] } = useUserCircles(user?.id);
  const joinCircle = useJoinCircle(user?.id);

  const [postBody, setPostBody] = useState("");
  const [postTag, setPostTag] = useState("FITNESS");
  const [postAnon, setPostAnon] = useState(false);

  useRealtimePosts();

  const displayCircles = circles.length > 0 ? circles : CIRCLES.map((c, i) => ({
    id: String(i),
    icon: c.icon,
    name: c.name,
    members_count: c.members,
  }));
  const displayPosts = posts.length > 0 ? posts : FEED_POSTS.map((p, i) => ({
    id: String(i),
    ...p,
    author_initials: (p as { initials?: string }).initials,
    author_name: (p as { name?: string }).name,
    author_meta: (p as { meta?: string }).meta,
    tag: (p as { tag?: string }).tag,
    body: (p as { body?: string }).body,
    anonymous: !!(p as { anon?: boolean }).anon,
    likes_count: (p as { respect?: number }).respect ?? 0,
    replies_count: (p as { replies?: number }).replies ?? 0,
  }));

  const handlePost = () => {
    if (!postBody.trim()) return;
    const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";
    const name = user?.user_metadata?.display_name ?? "Dad";
    createPost.mutate({
      body: postBody.trim(),
      tag: postTag,
      anonymous: postAnon,
      author_initials: postAnon ? "?" : initials,
      author_name: postAnon ? "Anonymous Dad" : name,
      author_meta: postAnon ? "Anonymous · " : `Dad · `,
    });
    setPostBody("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase opacity-60 mb-2 block">
            DAD HEALTH COMMUNITY
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold uppercase leading-none tracking-wide">
              DAD FEED
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              <span className="font-heading text-[11px] font-bold tracking-wider uppercase opacity-70">
                2,341 DADS ONLINE RIGHT NOW
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left - Circles */}
        <div className="px-5 lg:px-8 py-8 border-r border-border">
          <span className="section-label !p-0 mb-4 block">DAD CIRCLES</span>
          <div className="space-y-3">
            {displayCircles.map((c: { id: string; icon: string; name: string; members_count?: number }) => {
              const joined = user && userCircleIds.includes(c.id);
              return (
                <div key={c.id} className="circle-card">
                  <div className="text-xl mb-2">{c.icon}</div>
                  <div className="font-heading text-xs font-extrabold text-foreground tracking-wide mb-1">
                    {c.name}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">
                      {(c.members_count ?? 0).toLocaleString()} members
                    </span>
                    {user && (
                      <button
                        onClick={() => joinCircle.mutate({ circleId: c.id, join: !joined })}
                        disabled={joinCircle.isPending}
                        className="font-heading text-[9px] font-bold text-primary uppercase tracking-wider cursor-pointer bg-transparent border-none"
                      >
                        {joined ? "JOINED ✓" : "JOIN"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center - Feed */}
        <div className="border-r border-border">
          {/* Compose */}
          <div className="px-5 py-4 border-b border-border">
            <textarea
              placeholder="What's on your mind, dad?"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              className="w-full bg-white/[0.04] border border-border p-3 text-foreground text-sm resize-none h-[60px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40 mb-2"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {["FITNESS", "MIND", "BOND"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPostTag(t)}
                    className={`tag-pill cursor-pointer ${postTag === t ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {t}
                  </button>
                ))}
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postAnon}
                    onChange={(e) => setPostAnon(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-[10px] uppercase">Anon</span>
                </label>
              </div>
              <LimeButton
                small
                onClick={handlePost}
                disabled={!user || !postBody.trim() || createPost.isPending}
              >
                {createPost.isPending ? "..." : "POST"}
              </LimeButton>
            </div>
          </div>

          {/* Posts */}
          {displayPosts.map((p: Record<string, unknown>) => {
            const isAnon = p.anonymous === true;
            return (
              <div key={String(p.id)} className="px-5 py-4 border-b border-border last:border-b-0">
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
                  <div className="flex-1">
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
                  <span className="tag-pill">{(p.tag ?? "FITNESS") as string}</span>
                </div>
                <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">{(p.body ?? "") as string}</p>
                <div className="flex gap-3.5">
                  <button
                    onClick={() => {
                      if (user && typeof p.id === "string") {
                        const liked = userLikedIds.has(p.id);
                        toggleLike.mutate({ postId: p.id, liked });
                      }
                    }}
                    disabled={!user || toggleLike.isPending}
                    className="post-action"
                  >
                    👊 {(p.likes_count ?? p.respect ?? 0) as number} RESPECT
                  </button>
                  <button className="post-action">💬 {(p.replies_count ?? p.replies ?? 0) as number} REPLIES</button>
                  <button className="post-action">🔖 SAVE</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right - Expert Q&A */}
        <div className="px-5 lg:px-8 py-8">
          <span className="section-label !p-0 mb-4 block">EXPERT Q&A THIS WEEK</span>
          {EXPERTS.map((e) => (
            <div key={e.name} className="border border-border p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-card border border-border flex items-center justify-center font-heading text-sm font-extrabold text-primary shrink-0">
                  {e.initials}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-[13px] font-extrabold text-foreground tracking-wide">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">{e.role}</div>
                  <p className="text-xs text-foreground/60 mt-1">{e.topic}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-heading text-[11px] font-bold text-primary">{e.time}</span>
                <button className="bg-background text-foreground border border-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 cursor-pointer">
                  BOOK SESSION
                </button>
              </div>
            </div>
          ))}

          {/* Trending */}
          <div className="mt-6">
            <span className="section-label !p-0 mb-3 block">TRENDING</span>
            {[
              { tag: "#ScreenFreeSunday", count: 847 },
              { tag: "#DadRun", count: 412 },
              { tag: "#MindfulDad", count: 289 },
            ].map((t) => (
              <div key={t.tag} className="py-1.5">
                <span className="text-sm text-primary font-medium">{t.tag}</span>
                <span className="text-xs text-muted-foreground ml-2">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default CommunityPage;

