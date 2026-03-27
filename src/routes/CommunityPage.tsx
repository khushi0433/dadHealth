"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { EXPERTS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useUserProfile } from "@/hooks/useUserProfile";

const CommunityPage = () => {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { posts, dadsCount, trendingTags, userLikedIds, circles, userCircleIds, createPost, toggleLike, joinCircle } = useCommunity(user?.id);

  const [postBody, setPostBody] = useState("");
  const [postTag, setPostTag] = useState("FITNESS");
  const [postAnon, setPostAnon] = useState(false);

  const displayCircles = circles;
  const displayPosts = posts;

  const handlePost = () => {
    if (!postBody.trim()) return;
    const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";
    const name = profile?.display_name ?? user?.user_metadata?.display_name ?? "Dad";
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
    <SitePageShell>
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
                {dadsCount > 0 ? dadsCount.toLocaleString() : "—"} DADS IN COMMUNITY
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
            {displayCircles.length > 0 ? displayCircles.map((c: { id: string; icon?: string; name: string; members_count?: number }) => {
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
            }) : (
              <p className="text-sm text-muted-foreground">No circles yet.</p>
            )}
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
          {displayPosts.length > 0 ? displayPosts.map((p: Record<string, unknown>) => {
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
                <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">{(p.body ?? p.content ?? "") as string}</p>
                <div className="flex gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) { openAuthModal(); return; }
                      if (typeof p.id === "string") {
                        const liked = userLikedIds.has(p.id);
                        toggleLike.mutate({ postId: p.id, liked });
                      }
                    }}
                    disabled={toggleLike.isPending}
                    className="post-action"
                  >
                    👊 {(p.likes_count ?? p.respect ?? 0) as number} RESPECT
                  </button>
                  <button
                    type="button"
                    onClick={() => !user && openAuthModal()}
                    className="post-action"
                  >
                    💬 {(p.replies_count ?? p.replies ?? 0) as number} REPLIES
                  </button>
                  <button
                    type="button"
                    onClick={() => !user && openAuthModal()}
                    className="post-action"
                  >
                    🔖 SAVE
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          )}
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
                <button
                  type="button"
                  onClick={() => router.push("/pricing")}
                  className="bg-background text-foreground border border-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  BOOK SESSION
                </button>
              </div>
            </div>
          ))}

          {/* Trending */}
          <div className="mt-6">
            <span className="section-label !p-0 mb-3 block">TRENDING</span>
            {trendingTags.length > 0 ? trendingTags.map((t: { tag: string; count: number }) => (
              <div key={t.tag} className="py-1.5">
                <span className="text-sm text-primary font-medium">{t.tag}</span>
                <span className="text-xs text-muted-foreground ml-2">{t.count}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No trending tags yet.</p>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </SitePageShell>
  );
};

export default CommunityPage;

