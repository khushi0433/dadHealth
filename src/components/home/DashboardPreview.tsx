"use client";

import Logo from "@/components/Logo";
import { Flame, LifeBuoy } from "lucide-react";
import { DashboardIcon } from "@/components/DashboardIcon";
import { BLOCKED_CHECKIN_MOODS, DAYS, MEALS } from "@/lib/constants";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useCommunity } from "@/hooks/useCommunity";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { DEFAULT_DISPLAY_FALLBACK, greetingDisplayName, initialsFromDisplayName } from "@/lib/userDisplay";
import { getDashboardScore, getLastSevenDayKeys, getMoodSummary, getMoodWeek, getReportStatsList, getScoreBreakdown } from "@/lib/dashboard.utils";
import SectionHeader from "@/components/dashboard/SectionHeader";
import StatCard from "@/components/dashboard/StatCard";
import MiniBarChart from "@/components/dashboard/MiniBarChart";

const SIDEBAR_ITEMS = [
  { iconKey: "home", label: "HOME", id: "HOME" as const },
  { iconKey: "fitness", label: "FITNESS", id: "FITNESS" as const },
  { iconKey: "mind", label: "MIND", id: "MIND" as const },
  { iconKey: "bond", label: "BOND", id: "BOND" as const },
  { iconKey: "community", label: "COMMUNITY", id: "COMMUNITY" as const },
  { iconKey: "progress", label: "PROGRESS", id: "PROGRESS" as const },
  { iconKey: "pro", label: "PRO ★", href: "/pricing" },
];

const DEFAULT_GOALS = [
  { iconKey: "breathing", name: "5-min breathing reset", time: "MORNING · MENTAL HEALTH", status: "done" as const },
  { iconKey: "run", name: "20-min dad run", time: "12:30PM · FITNESS", status: "start" as const },
  { iconKey: "story", name: "Bedtime story", time: "7:30PM · PARENTING", status: "log" as const },
  { iconKey: "journal", name: "Evening journal", time: "9:00PM · REFLECTION", status: "open" as const },
];

type DashboardPreviewProps = {
  variant?: "preview" | "full";
};

const DashboardPreview = ({ variant = "preview" }: DashboardPreviewProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { data: dashboard, dadsCount, checkIn } = useDashboard(user?.id);
  const { posts: communityPosts = [], loading: communityLoading } = useCommunity(user?.id);
  const [activeScreen, setActiveScreen] = useState<"HOME" | "FITNESS" | "MIND" | "BOND" | "COMMUNITY" | "PROGRESS">("HOME");
  const isFullDashboard = variant === "full";
  const hasUser = Boolean(user);

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const moodLogs = useMemo(
    () => dashboard?.mood_logs ?? (dashboard?.mood_value != null ? [{ date: dashboard?.date ?? today, mood_value: dashboard.mood_value }] : []),
    [dashboard?.mood_logs, dashboard?.mood_value, dashboard?.date, today],
  );
  const hasCheckedInToday = useMemo(() => moodLogs.some((m: { date: string }) => m.date === today), [moodLogs, today]);
  const [cbtMood, setCbtMood] = useState(dashboard?.mood_value ?? 3);
  const [cbtSleep, setCbtSleep] = useState(dashboard?.sleep_hours ?? 7);

  useEffect(() => {
    if (!dashboard) return;
    if (dashboard.mood_value != null) setCbtMood(dashboard.mood_value);
    if (dashboard.sleep_hours != null) setCbtSleep(dashboard.sleep_hours);
  }, [dashboard]);

  const score = useMemo(() => getDashboardScore(dashboard, hasUser), [dashboard, hasUser]);
  const breakdown = useMemo(() => getScoreBreakdown(dashboard, hasUser), [dashboard, hasUser]);
  const scoreItems = useMemo(() => [
    { label: "MIND", value: breakdown.mind },
    { label: "BODY", value: breakdown.body },
    { label: "BOND", value: breakdown.bond },
  ], [breakdown]);
  const streak = dashboard?.streak_count ?? 0;
  const last7 = useMemo(() => getLastSevenDayKeys(), []);
  const moodWeek = useMemo(() => getMoodWeek(moodLogs, last7), [moodLogs, last7]);
  const moodSummary = useMemo(() => getMoodSummary(moodWeek, hasUser), [moodWeek, hasUser]);
  const greetingName = greetingDisplayName(
    { display_name: profile?.display_name ?? dashboard?.display_name },
    user
  );
  const displayNameShort = useMemo(() => greetingName.split(/\s+/)[0] ?? greetingName, [greetingName]);
  const tasks = DEFAULT_GOALS;

  const monthWorkouts = dashboard?.month_workouts ?? 0;
  const dates = useMemo(() => ((dashboard?.dad_dates as Array<{ id?: string; icon?: string; iconKey?: string; name: string; age_range?: string; budget?: string }> | undefined) ?? []).slice(0, 3), [dashboard?.dad_dates]);
  const reminders = useMemo(() => ((dashboard?.reminders as Array<{ id: string; type?: string; text: string }> | undefined) ?? []).slice(0, 5), [dashboard?.reminders]);
  const circles = useMemo(() => ((dashboard?.circles as Array<{ id: string; icon?: string; name: string; members_count?: number }> | undefined) ?? []).slice(0, 3), [dashboard?.circles]);
  const milestones = useMemo(() => ((dashboard?.milestones as Array<{ id: string; date: string; text: string }> | undefined) ?? []).slice(0, 6), [dashboard?.milestones]);
  const bodyWeekSeries = useMemo(() => {
    const values = (dashboard?.body_week_series as number[] | undefined) ?? [];
    if (values.length === 7) return values;
    return Array.from({ length: 7 }, () => 0);
  }, [dashboard?.body_week_series]);
  const displayPosts = communityPosts.slice(0, 3) as Record<string, unknown>[];
  const reportStatsList = useMemo(() => getReportStatsList(dashboard?.reportStats), [dashboard?.reportStats]);
  const isCheckinBlocked = BLOCKED_CHECKIN_MOODS.includes(cbtMood as (typeof BLOCKED_CHECKIN_MOODS)[number]);

  const handleMoodSelect = (value: number) => {
    setCbtMood(value);
  };

  const handleDailyCheckIn = () => {
    if (isCheckinBlocked) {
      return;
    }
    checkIn.mutate({ mood_value: cbtMood, sleep_hours: cbtSleep });
  };

  if (authLoading) {
    return (
      <section className={`bg-background flex flex-col gap-4 items-center justify-center ${isFullDashboard ? "min-h-[calc(100dvh-73px)]" : "pt-16 lg:pt-20 pb-8 min-h-[600px]"}`}>
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-primary font-heading text-[11px] font-bold tracking-widest uppercase">
          Loading Preview...
        </p>
      </section>
    );
  }

  return (
  <section className={`bg-background ${isFullDashboard ? "min-h-[calc(100dvh-73px)]" : "pt-16 lg:pt-20 pb-8"}`}>
    <div className={`${isFullDashboard ? "w-full min-h-screen flex flex-col" : "max-w-[1400px] mx-auto px-5 lg:px-8"}`}>
      {!isFullDashboard && (
        <>
          <div className="py-4">
            <span className="section-label">APP DASHBOARD</span>
          </div>
          <div className="pb-6">
            <span className="section-label">YOUR DAILY HUB</span>
            <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3">
              THE DASHBOARD
            </h2>
          </div>
        </>
      )}

      <div className={`bg-card border border-border overflow-visible ${isFullDashboard ? "rounded-none flex-1" : "rounded-xl"}`}>
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-px bg-border ${isFullDashboard ? "min-h-full" : ""}`}>
          {/* Sidebar */}
        <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
          <Logo className="mb-5" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-heading text-sm font-bold text-primary">
              {user
                ? initialsFromDisplayName(greetingName, user.email)
                : "—"}
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-foreground">{user ? greetingName : "—"}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                {user ? (
                  <>
                    <Flame className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {streak}-day streak
                  </>
                ) : "—"}
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              if ("href" in item) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-bold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <DashboardIcon icon={(item as { iconKey: string }).iconKey} size="md" />
                    {item.label}
                  </Link>
                );
              }
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-bold tracking-wider uppercase transition-colors text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <DashboardIcon icon={(item as { iconKey: string }).iconKey} size="md" active={isActive} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content - HOME: two columns; other screens: full content */}
        {activeScreen === "HOME" ? (
          <>
            <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
              <div className="mb-4">
                <span className="block text-[10px] font-heading font-bold tracking-[2px] text-muted-foreground uppercase !p-0">
                  good morning dads
                </span>
                <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1">
                  {(user ? displayNameShort : "—").toUpperCase()}
                  <br />
                  {format(now, "EEEE")}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="tag-pill">PRO</span>
                  <span className="text-xs text-muted-foreground">{format(now, "d MMM")}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">{dadsCount > 0 ? dadsCount.toLocaleString() : "—"} dads in community</span>
                </div>
              </div>

              {user && !hasCheckedInToday && (
                <div className="border border-primary/20 p-4 mb-4">
                  <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary mb-3">DAILY CHECK-IN</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-muted-foreground uppercase mb-1.5">Mood (1-4)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 4].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleMoodSelect(v)}
                            aria-label={`Set mood to ${v}`}
                            className={`min-w-[2rem] h-8 px-2 font-heading text-xs font-bold border cursor-pointer ${
                              cbtMood === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                      <div className="min-w-0 shrink-0">
                        <label htmlFor="checkin-sleep" className="block text-[10px] text-muted-foreground uppercase mb-1.5">
                          Sleep (hrs)
                        </label>
                        <input
                          id="checkin-sleep"
                          type="number"
                          min={0}
                          max={12}
                          step={0.5}
                          value={cbtSleep}
                          onChange={(e) => setCbtSleep(parseFloat(e.target.value) || 7)}
                          className="w-[4.5rem] box-border bg-white/[0.04] border border-border px-2 py-2 text-foreground text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleDailyCheckIn}
                        disabled={checkIn.isPending || isCheckinBlocked}
                        aria-label="Save daily check-in"
                        className="bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-4 py-2 border-none cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {checkIn.isPending ? "..." : "SAVE"}
                      </button>
                    </div>
                    {isCheckinBlocked && (
                      <p className="text-[10px] text-muted-foreground">
                        Mood 1, 2, and 4 are view-only in this dashboard check-in.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-primary text-primary-foreground p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center shrink-0">
                    <div className="font-heading text-[42px] font-extrabold leading-none">{score ?? "—"}</div>
                    <div className="font-heading text-[9px] font-bold tracking-wider uppercase opacity-50">DAD SCORE</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-[12px] font-extrabold uppercase mb-2">This week's health</div>
                    {scoreItems.map((item) => (
                      <div key={item.label} className="mb-1.5">
                        <div className="flex justify-between font-heading text-[9px] font-bold uppercase opacity-60 mb-0.5">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-1 bg-primary-foreground/20">
                          <div
                            className="h-1 bg-primary-foreground transition-all duration-500"
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-primary/20 p-3 mb-4">
                <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary mb-0.5">
                  UPGRADE TO PRO
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">Unlock full score, graphs & more</p>
                <button type="button" className="bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 w-full cursor-pointer border-none hover:bg-primary/90 transition-colors">
                  7-day free trial
                </button>
              </div>

              <SectionHeader title="TODAY'S PLAN" className="mb-2 block" />
              <div className="pb-4">
                {tasks.map((task) => (
                  <div key={task.name} className="flex items-center gap-3 py-3 border-b border-primary/20 last:border-b-0">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <DashboardIcon icon={(task as { iconKey: string }).iconKey} size="md" />
                    </div>
                    <div className="flex-1">
                      <div className="font-heading text-[13px] font-bold tracking-wide text-foreground">{task.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{task.time}</div>
                    </div>
                    <span
                      className={`font-heading font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 border cursor-pointer transition-colors ${
                        task.status === "done"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                      }`}
                    >
                      {task.status === "done" ? "Done ✓" : task.status === "start" ? "Start" : task.status === "log" ? "Log" : "Open"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
              <SectionHeader title="MOOD THIS WEEK" className="mb-3 block" />
              <MiniBarChart values={moodWeek} labels={DAYS} maxValue={4} />
              <p className="text-xs text-muted-foreground">
                Avg mood: <span className="text-primary font-semibold">
                  {moodSummary.label}
                </span>
                {moodSummary.scoreText}
              </p>

              <div className="mt-6">
                <SectionHeader title="SMART REMINDERS" className="mb-3 block" />
                {reminders.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No reminders yet</p>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="text-xs text-muted-foreground py-1.5 border-b border-border last:border-b-0 flex items-center gap-2">
                      <DashboardIcon icon={reminder.type || "bell"} size="sm" />
                      {reminder.text}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 border border-primary/20 p-4">
                <div className="font-heading text-[10px] font-bold tracking-[2px] uppercase text-primary mb-1">
                  THIS WEEK'S CHALLENGE
                </div>
                <div className="font-heading text-[16px] font-extrabold text-foreground uppercase tracking-wide mb-1">
                  {(dashboard?.challenge as { title?: string })?.title ?? "NO ACTIVE CHALLENGE"}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {(dashboard?.challenge as { participants_count?: number })?.participants_count ?? 0} dads taking part
                </p>
                <button
                  type="button"
                  onClick={() => setActiveScreen("PROGRESS")}
                  className="bg-transparent border-[1.5px] font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex gap-1.5 py-2 px-3.5 text-[11px] text-foreground border-foreground hover:border-primary hover:text-primary transition-all duration-200"
                >
                  TAKE ACTION →
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
              {activeScreen === "FITNESS" && (
                <>
                  <span className="section-label !p-0">FITNESS</span>
                  <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
                    TODAY&apos;S WORKOUT
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      [user ? String(monthWorkouts) : "—", "WORKOUTS"],
                      [dashboard?.weightDisplay ?? "—", "WEIGHT"],
                      ["—", "BEST RUN"],
                      [user && (dashboard?.activeTodayMin ?? 0) > 0 ? `${dashboard?.activeTodayMin} min` : "—", "ACTIVE"],
                    ].map(([v, l]) => (
                      <StatCard key={l} value={String(v)} label={String(l)} />
                    ))}
                  </div>
                  <div className="border border-primary/20 p-3 mb-4">
                    <div className="font-heading text-[13px] font-bold text-foreground mb-1">Dad Strength</div>
                    <p className="text-[10px] text-muted-foreground mb-2">22 min · 6 exercises · 280 kcal</p>
                    <Link href="/fitness" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline">
                      START WORKOUT →
                    </Link>
                  </div>
                  <span className="section-label !p-0 mb-2 block">MEAL PLAN</span>
                  {MEALS.slice(0, 3).map((m) => (
                    <div key={m.day} className="flex justify-between py-2 border-b border-primary/20 last:border-b-0 text-[11px]">
                      <span className="text-foreground">{m.day} {m.name}</span>
                      <span className="text-muted-foreground">{m.kcal} kcal</span>
                    </div>
                  ))}
                </>
              )}
              {activeScreen === "MIND" && (
                <>
                  <span className="section-label !p-0">MIND</span>
                  <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
                    MENTAL HEALTH
                  </div>
                  <div className="border border-primary/20 p-4 mb-4">
                    <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary mb-2">4-4-4 BREATHING</div>
                    <p className="text-xs text-muted-foreground mb-2">Inhale 4 · Hold 4 · Exhale 4. Reduces cortisol.</p>
                    <Link href="/mind" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline">
                      BEGIN SESSION →
                    </Link>
                  </div>
                  <div className="border border-border p-3 mb-4">
                    <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground mb-1">Evening journal</div>
                    <p className="text-[10px] text-muted-foreground mb-2">&quot;What&apos;s one moment today where you were the dad you want to be?&quot;</p>
                    <Link href="/mind" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline">
                      WRITE ENTRY →
                    </Link>
                  </div>
                  <a href="https://www.samaritans.org" target="_blank" rel="noopener noreferrer" className="block border border-destructive/30 bg-destructive/10 p-3 text-[10px] text-foreground hover:bg-destructive/20 transition-colors">
                    <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />CRISIS SUPPORT — SAMARITANS · CALM · MIND</span>
                  </a>
                </>
              )}
              {activeScreen === "BOND" && (
                <>
                  <span className="section-label !p-0">BOND</span>
                  <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
                    PARENTING
                  </div>
                  <span className="section-label !p-0 mb-2 block">DAD DATE IDEAS</span>
                  {dates.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No dad dates yet</p>
                  ) : (
                    dates.map((d) => (
                      <div key={d.id ?? d.name} className="flex items-center gap-3 py-2.5 border-b border-primary/20 last:border-b-0">
                        <DashboardIcon icon={d.iconKey ?? d.icon ?? "gaming"} size="lg" />
                        <div className="flex-1">
                          <div className="font-heading text-[12px] font-bold text-foreground">{d.name}</div>
                          <div className="text-[10px] text-muted-foreground">Age {d.age_range ?? "—"} · {d.budget ?? "—"}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="mt-4 border-l-[3px] border-l-primary pl-3 py-2">
                    <p className="text-xs text-muted-foreground italic">&quot;What made you laugh the hardest today?&quot;</p>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Conversation starter</div>
                  </div>
                </>
              )}
              {activeScreen === "COMMUNITY" && (
                <>
                  <span className="section-label !p-0">COMMUNITY</span>
                  <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
                    COMMUNITY FEED
                  </div>
                  <SectionHeader title="RECENT POSTS" className="mb-2 block" />
                  {communityLoading ? (
                    <p className="text-[11px] text-muted-foreground py-2">Loading…</p>
                  ) : displayPosts.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground py-2">
                      {user ? (
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
                    displayPosts.map((p: Record<string, unknown>, i: number) => (
                      <div key={String(p.id ?? i)} className="py-3 border-b border-primary/20 last:border-b-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="tag-pill text-[9px]">{(p.tag ?? "FITNESS") as string}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {String(p.author_name ?? p.name ?? "").trim() || DEFAULT_DISPLAY_FALLBACK}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/70 line-clamp-2">{(p.body ?? p.content ?? "") as string}</p>
                      </div>
                    ))
                  )}
                </>
              )}
              {activeScreen === "PROGRESS" && (
                <>
                  <span className="section-label !p-0">PROGRESS</span>
                  <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
                    YOUR DAD HEALTH SCORE
                  </div>
                  <div className="bg-primary text-primary-foreground p-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0">
                        <div className="font-heading text-[42px] font-extrabold leading-none">{score ?? "—"}</div>
                        <div className="font-heading text-[9px] font-bold tracking-wider uppercase opacity-50">out of 100</div>
                      </div>
                      <div className="flex-1">
                        {scoreItems.map((item) => (
                          <div key={item.label} className="mb-1.5">
                            <div className="flex justify-between font-heading text-[9px] font-bold uppercase opacity-60 mb-0.5">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <div className="h-1 bg-primary-foreground/20">
                              <div className="h-1 bg-primary-foreground transition-all" style={{ width: `${item.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="section-label !p-0 mb-2 block">MARCH REPORT</span>
                  <div className="grid grid-cols-3 gap-2">
                    {reportStatsList.map(([n, l]) => (
                      <StatCard key={l} value={n} label={l} compact />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
              {activeScreen === "FITNESS" && (
                <>
                  <SectionHeader title="BODY THIS WEEK" className="mb-3 block" />
                  <MiniBarChart values={bodyWeekSeries} maxValue={4} heightClass="h-[60px]" dense />
                  <Link href="/fitness" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
                    View full Fitness →
                  </Link>
                </>
              )}
              {activeScreen === "MIND" && (
                <>
                  <SectionHeader title="MOOD THIS WEEK" className="mb-3 block" />
                  <MiniBarChart values={moodWeek} labels={DAYS} maxValue={4} />
                  <Link href="/mind" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
                    View full Mind →
                  </Link>
                </>
              )}
              {activeScreen === "BOND" && (
                <>
                  <span className="section-label !p-0 mb-3 block">MILESTONES</span>
                  {milestones.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No milestones yet</p>
                  ) : (
                    milestones.map((m) => (
                      <div key={m.id} className="py-2 border-b border-border last:border-b-0">
                        <span className="tag-pill text-[9px] mr-1">{format(new Date(m.date), "d MMM")}</span>
                        <span className="text-[11px] text-foreground/70">{m.text}</span>
                      </div>
                    ))
                  )}
                  <Link href="/bond" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
                    View full Bond →
                  </Link>
                </>
              )}
              {activeScreen === "COMMUNITY" && (
                <>
                  <span className="section-label !p-0 mb-3 block">DAD CIRCLES</span>
                  {circles.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No circles yet</p>
                  ) : (
                    circles.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 py-2 border-b border-border last:border-b-0">
                        <DashboardIcon icon={c.icon || "community"} size="lg" />
                        <div>
                          <div className="font-heading text-[11px] font-bold text-foreground">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.members_count ?? 0} members</div>
                        </div>
                      </div>
                    ))
                  )}
                  <Link href="/community" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
                    View full Community →
                  </Link>
                </>
              )}
              {activeScreen === "PROGRESS" && (
                <>
                  <span className="section-label !p-0 mb-3 block">BADGES</span>
                  <div className="flex gap-2 flex-wrap">
                    {["flame", "fitness", "story", "bond"].map((iconKey, i) => (
                      <div key={i} className="w-10 h-10 border border-primary/20 bg-primary/[0.04] flex items-center justify-center">
                        <DashboardIcon icon={iconKey} size="lg" />
                      </div>
                    ))}
                  </div>
                  <Link href="/progress" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
                    View full Progress →
                  </Link>
                </>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  </section>
  );
};

export default DashboardPreview;