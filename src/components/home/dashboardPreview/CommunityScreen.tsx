"use client";

import Link from "next/link";
import { DashboardIcon } from "@/components/DashboardIcon";
import SectionHeader from "@/components/dashboard/SectionHeader";
import { DEFAULT_DISPLAY_FALLBACK } from "@/lib/userDisplay";
import type { CircleItem } from "./types";

type CommunityScreenProps = {
  isFullDashboard: boolean;
  hasUser: boolean;
  loading: boolean;
  posts: Record<string, unknown>[];
  circles: CircleItem[];
};

export default function CommunityScreen({
  isFullDashboard,
  hasUser,
  loading,
  posts,
  circles,
}: CommunityScreenProps) {
  return (
    <>
      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0">COMMUNITY</span>
        <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
          COMMUNITY FEED
        </div>
        <SectionHeader title="RECENT POSTS" className="mb-2 block" />
        {loading ? (
          <p className="text-[11px] text-muted-foreground py-2">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-2">
            {hasUser ? (
              <>
                No posts yet.{" "}
                <Link href="/community" className="text-primary hover:underline">
                  Be the first to post
                </Link>
                .
              </>
            ) : "Sign in to see the live feed."}
          </p>
        ) : (
          posts.map((post, index) => (
            <div key={String(post.id ?? index)} className="py-3 border-b border-primary/20 last:border-b-0">
              <div className="flex items-center gap-2 mb-1">
                {String(post.tag ?? "").trim() && <span className="tag-pill text-[9px]">{String(post.tag)}</span>}
                <span className="text-[10px] text-muted-foreground">
                  {String(post.author_name ?? post.name ?? "").trim() || DEFAULT_DISPLAY_FALLBACK}
                </span>
              </div>
              <p className="text-[11px] text-foreground/70 line-clamp-2">{(post.body ?? post.content ?? "") as string}</p>
            </div>
          ))
        )}
      </div>

      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0 mb-3 block">DAD CIRCLES</span>
        {circles.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No circles yet</p>
        ) : (
          circles.map((circle) => (
            <div key={circle.id} className="flex items-center gap-2 py-2 border-b border-border last:border-b-0">
              <DashboardIcon icon={circle.icon || "community"} size="lg" />
              <div>
                <div className="font-heading text-[11px] font-bold text-foreground">{circle.name}</div>
                <div className="text-[10px] text-muted-foreground">{circle.members_count ?? 0} members</div>
              </div>
            </div>
          ))
        )}
        <Link href="/community" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
          View full Community →
        </Link>
      </div>
    </>
  );
}
