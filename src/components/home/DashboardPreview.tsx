"use client";

import Logo from "@/components/Logo";
import { MOOD_WEEK, DAYS, MEALS, CIRCLES, FEED_POSTS } from "@/lib/constants";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const SIDEBAR_ITEMS = [
  { icon: "🏠", label: "HOME", id: "HOME" as const },
  { icon: "🏋️", label: "FITNESS", id: "FITNESS" as const },
  { icon: "🧠", label: "MIND", id: "MIND" as const },
  { icon: "👨‍👧", label: "BOND", id: "BOND" as const },
  { icon: "👥", label: "COMMUNITY", id: "COMMUNITY" as const },
  { icon: "📊", label: "PROGRESS", id: "PROGRESS" as const },
  { icon: "💎", label: "PRO ★", href: "/pricing" },
];

const SCORE_ITEMS = [
  { label: "MIND", value: 72 },
  { label: "BODY", value: 81 },
  { label: "BOND", value: 68 },
];

const TODAYS_PLAN = [
  { icon: "🧘", name: "5-min breathing reset", time: "MORNING · MENTAL HEALTH", status: "done" as const },
  { icon: "🏃", name: "20-min dad run", time: "12:30PM · FITNESS", status: "start" as const },
  { icon: "📖", name: "Bedtime story with Ella", time: "7:30PM · PARENTING", status: "log" as const },
  { icon: "✍️", name: "Evening journal", time: "9:00PM · REFLECTION", status: "open" as const },
];

const SMART_REMINDERS = [
  "🌅 Morning check-in at 7:30am",
  "📖 Ella's bedtime in 45 mins",
  "🏃 Run window: 12:00–12:45pm",
];

const DEFAULT_GOALS = [
  { icon: "🧘", name: "5-min breathing reset", time: "MORNING · MENTAL HEALTH", status: "done" as const },
  { icon: "🏃", name: "20-min dad run", time: "12:30PM · FITNESS", status: "start" as const },
  { icon: "📖", name: "Bedtime story", time: "7:30PM · PARENTING", status: "log" as const },
  { icon: "✍️", name: "Evening journal", time: "9:00PM · REFLECTION", status: "open" as const },
];

const DEFAULT_DAD_DATES = [
  { icon: "🎮", name: "Gaming night", age_range: "8–14", budget: "Free" },
  { icon: "🏕️", name: "Garden camping", age_range: "5–12", budget: "Free" },
  { icon: "⚽", name: "Park kickabout", age_range: "4+", budget: "Free" },
];

const DashboardPreview = () => {
  const { user } = useAuth();
  const { data: dashboard, loading, dadDates = [], dadsCount, checkIn } = useDashboard(user?.id);
  const [activeScreen, setActiveScreen] = useState<"HOME" | "FITNESS" | "MIND" | "BOND" | "COMMUNITY" | "PROGRESS">("HOME");

  const today = new Date().toISOString().slice(0, 10);
  const moodLogs = dashboard?.mood_logs ?? (dashboard?.mood_value != null ? [{ date: dashboard?.date ?? today, mood_value: dashboard.mood_value }] : []);
  const hasCheckedInToday = moodLogs.some((m: { date: string }) => m.date === today);
  const [cbtMood, setCbtMood] = useState(dashboard?.mood_value ?? 3);
  const [cbtSleep, setCbtSleep] = useState(dashboard?.sleep_hours ?? 7);

  useEffect(() => {
    if (dashboard) {
      if (dashboard.mood_value != null) setCbtMood(dashboard.mood_value);
      if (dashboard.sleep_hours != null) setCbtSleep(dashboard.sleep_hours);
    }
  }, [dashboard?.mood_value, dashboard?.sleep_hours]);

  const score = dashboard?.total_score ?? (user ? 74 : "—");
  const breakdown = user && dashboard
    ? { mind: dashboard.mind_score ?? 72, body: dashboard.body_score ?? 81, bond: dashboard.bond_score ?? 68 }
    : { mind: 0, body: 0, bond: 0 };
  const SCORE_ITEMS = [
    { label: "MIND", value: breakdown.mind },
    { label: "BODY", value: breakdown.body },
    { label: "BOND", value: breakdown.bond },
  ];
  const streak = dashboard?.streak_count ?? 0;
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const moodMap = new Map(moodLogs.map((m: { date: string; mood_value: number }) => [m.date, m.mood_value]));
  const moodWeek = last7.map((d) => moodMap.get(d) ?? 3);
  const displayName = dashboard?.display_name?.split(" ")[0] ?? user?.user_metadata?.display_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? null;
  const tasks = DEFAULT_GOALS;

  const workouts = dashboard?.today_workouts ? [{ count: dashboard.today_workouts }] : [];
  const monthWorkouts = dashboard?.month_workouts ?? 0;
  const dates = dadDates.length > 0 ? dadDates.slice(0, 3) : DEFAULT_DAD_DATES;
  const displayPosts = FEED_POSTS.slice(0, 3);
  const displayCircles = CIRCLES.slice(0, 3);
  const reportStatsList = dashboard?.reportStats
    ? [[String(dashboard.reportStats.workouts), "Workouts"], [String(dashboard.reportStats.journal), "Journal"], [String(dashboard.reportStats.dadDates), "Dad dates"]]
    : [["—", "Workouts"], ["—", "Journal"], ["—", "Dad dates"]];

  return (
  <section className="bg-background pt-16 lg:pt-20 pb-8">
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
      <div className="py-4">
        <span className="section-label">APP DASHBOARD</span>
      </div>
      <div className="pb-6">
        <span className="section-label">YOUR DAILY HUB</span>
        <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3">
          THE DASHBOARD
        </h2>
      </div>

      <div className="bg-primary/20 border border-primary/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-primary/30">
          {/* Sidebar */}
        <div className="bg-card p-5">
          <Logo className="mb-5" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-heading text-sm font-bold text-primary">
              {displayName ? displayName.slice(0, 2).toUpperCase() : "—"}
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-foreground">{displayName ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{user ? `${streak}-day streak 🔥` : "—"}</div>
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
                    <span className="text-base">{item.icon}</span>
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
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content - HOME: two columns; other screens: full content */}
        {activeScreen === "HOME" ? (
          <>
            <div className="bg-card p-5">
              <div className="mb-4">
                <span className="section-label !p-0">GOOD MORNING</span>
                <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1">
                  {(displayName ?? "—").toUpperCase()},<br />{format(new Date(), "EEEE")}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="tag-pill">PRO</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(), "d MMM")}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">{dadsCount > 0 ? dadsCount.toLocaleString() : "—"} dads in community</span>
                </div>
              </div>

              {user && !hasCheckedInToday && (
                <div className="border border-primary/20 p-4 mb-4">
                  <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary mb-2">DAILY CHECK-IN</div>
                  <div className="flex gap-4 flex-wrap">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase">Mood (1-4)</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setCbtMood(v)}
                            className={`w-8 h-8 font-heading text-xs font-bold border cursor-pointer ${
                              cbtMood === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase">Sleep (hrs)</label>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        step={0.5}
                        value={cbtSleep}
                        onChange={(e) => setCbtSleep(parseFloat(e.target.value) || 7)}
                        className="w-16 mt-1 bg-white/[0.04] border border-border p-1.5 text-foreground text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => checkIn.mutate({ mood_value: cbtMood, sleep_hours: cbtSleep })}
                      disabled={checkIn.isPending}
                      className="self-end bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 border-none cursor-pointer hover:bg-primary/90 disabled:opacity-50"
                    >
                      {checkIn.isPending ? "..." : "SAVE"}
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-primary text-primary-foreground p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center shrink-0">
                    <div className="font-heading text-[42px] font-extrabold leading-none">{score}</div>
                    <div className="font-heading text-[9px] font-bold tracking-wider uppercase opacity-50">DAD SCORE</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-[12px] font-extrabold uppercase mb-2">This week's health</div>
                    {SCORE_ITEMS.map((item) => (
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

              <span className="section-label !p-0 mb-2 block">TODAY'S PLAN</span>
              <div className="pb-4">
                {tasks.map((task) => (
                  <div key={task.name} className="flex items-center gap-3 py-3 border-b border-primary/20 last:border-b-0">
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0">
                      {task.icon}
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

            <div className="bg-card p-5">
              <span className="section-label !p-0 mb-3 block">MOOD THIS WEEK</span>
              <div className="flex items-end gap-1.5 h-[80px] mb-2">
                {(user ? moodWeek : MOOD_WEEK).map((v: number, i: number) => {
                  const h = Math.round((v / 4) * 68) + 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full transition-all duration-400 ${v >= 3 ? "bg-primary" : "bg-muted"}`}
                        style={{ height: `${h}px` }}
                      />
                      <span className="font-heading text-[9px] font-bold text-muted-foreground">
                        {DAYS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg mood: <span className="text-primary font-semibold">
                  {user && moodWeek.length > 0
                    ? (() => {
                        const avg = (moodWeek as number[]).reduce((a, b) => a + b, 0) / moodWeek.length;
                        return avg >= 3.5 ? "Great" : avg >= 3 ? "Good" : avg >= 2 ? "Okay" : "Low";
                      })()
                    : "—"}
                </span>
                {user && (moodWeek as number[]).filter((v) => v > 0).length > 0 ? ` (${((moodWeek as number[]).reduce((a, b) => a + b, 0) / moodWeek.length).toFixed(1)}/4)` : ""}
              </p>

              <div className="mt-6">
                <span className="section-label !p-0 mb-3 block">SMART REMINDERS</span>
                {SMART_REMINDERS.map((reminder) => (
                  <div key={reminder} className="text-xs text-muted-foreground py-1.5 border-b border-primary/20 last:border-b-0">
                    {reminder}
                  </div>
                ))}
              </div>

              <div className="mt-6 border border-primary/20 p-4">
                <div className="font-heading text-[10px] font-bold tracking-[2px] uppercase text-primary mb-1">
                  THIS WEEK'S CHALLENGE
                </div>
                <div className="font-heading text-[16px] font-extrabold text-foreground uppercase tracking-wide mb-1">
                  {(dashboard?.challenge as { title?: string })?.title ?? "SCREEN-FREE SUNDAY"}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {(dashboard?.challenge as { participants_count?: number })?.participants_count ?? 847} dads taking part
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
            <div className="bg-card p-5">
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
                      <div key={l} className="bg-card border border-primary/20 rounded-lg p-3">
                        <div className="font-heading text-[18px] font-extrabold text-foreground">{v}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{l}</div>
                      </div>
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
                    🆘 CRISIS SUPPORT — SAMARITANS · CALM · MIND
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
                  {dates.map((d: { icon?: string; name: string; age_range?: string; budget?: string }) => (
                    <div key={d.name} className="flex items-center gap-3 py-2.5 border-b border-primary/20 last:border-b-0">
                      <span className="text-lg">{d.icon}</span>
                      <div className="flex-1">
                        <div className="font-heading text-[12px] font-bold text-foreground">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">Age {d.age_range ?? "—"} · {d.budget ?? "—"}</div>
                      </div>
                    </div>
                  ))}
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
                    DAD FEED
                  </div>
                  <span className="section-label !p-0 mb-2 block">RECENT POSTS</span>
                  {displayPosts.map((p: Record<string, unknown>, i: number) => (
                    <div key={i} className="py-3 border-b border-primary/20 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="tag-pill text-[9px]">{(p.tag ?? "FITNESS") as string}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {(p.author_name ?? p.name ?? "Dad") as string}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground/70 line-clamp-2">{(p.body ?? "") as string}</p>
                    </div>
                  ))}
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
                        <div className="font-heading text-[42px] font-extrabold leading-none">{score}</div>
                        <div className="font-heading text-[9px] font-bold tracking-wider uppercase opacity-50">out of 100</div>
                      </div>
                      <div className="flex-1">
                        {SCORE_ITEMS.map((item) => (
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
                      <div key={l} className="bg-card border border-primary/20 rounded-lg p-2.5">
                        <div className="font-heading text-[16px] font-extrabold text-foreground">{n}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-card p-5">
              {activeScreen === "FITNESS" && (
                <>
                  <span className="section-label !p-0 mb-3 block">BODY THIS WEEK</span>
                  <div className="flex items-end gap-1.5 h-[60px] mb-2">
                    {[3, 4, 3, 4, 4, 3, 4].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={`w-full flex-1 min-h-[8px] ${v >= 3 ? "bg-primary" : "bg-muted"}`} style={{ height: `${(v / 4) * 40}px` }} />
                      </div>
                    ))}
                  </div>
                  <Link href="/fitness" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
                    View full Fitness →
                  </Link>
                </>
              )}
              {activeScreen === "MIND" && (
                <>
                  <span className="section-label !p-0 mb-3 block">MOOD THIS WEEK</span>
                  <div className="flex items-end gap-1.5 h-[80px] mb-2">
                    {(user ? moodWeek : MOOD_WEEK).map((v: number, i: number) => {
                      const h = Math.round((Number(v) / 4) * 68) + 8;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full transition-all ${Number(v) >= 3 ? "bg-primary" : "bg-muted"}`} style={{ height: `${h}px` }} />
                          <span className="font-heading text-[9px] font-bold text-muted-foreground">{DAYS[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Link href="/mind" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
                    View full Mind →
                  </Link>
                </>
              )}
              {activeScreen === "BOND" && (
                <>
                  <span className="section-label !p-0 mb-3 block">MILESTONES</span>
                  {[
                    { date: "12 Mar", text: "Ella said &apos;I love you Dad&apos; unprompted" },
                    { date: "3 Feb", text: "First bike ride without stabilisers" },
                  ].map((m) => (
                    <div key={m.date} className="py-2 border-b border-primary/20 last:border-b-0">
                      <span className="tag-pill text-[9px] mr-1">{m.date}</span>
                      <span className="text-[11px] text-foreground/70">{m.text}</span>
                    </div>
                  ))}
                  <Link href="/bond" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
                    View full Bond →
                  </Link>
                </>
              )}
              {activeScreen === "COMMUNITY" && (
                <>
                  <span className="section-label !p-0 mb-3 block">DAD CIRCLES</span>
                  {displayCircles.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 py-2 border-b border-primary/20 last:border-b-0">
                      <span className="text-lg">{c.icon}</span>
                      <div>
                        <div className="font-heading text-[11px] font-bold text-foreground">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground">{c.members} members</div>
                      </div>
                    </div>
                  ))}
                  <Link href="/community" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
                    View full Community →
                  </Link>
                </>
              )}
              {activeScreen === "PROGRESS" && (
                <>
                  <span className="section-label !p-0 mb-3 block">BADGES</span>
                  <div className="flex gap-2 flex-wrap">
                    {["🔥", "💪", "📖", "👨‍👧"].map((icon, i) => (
                      <div key={i} className="w-10 h-10 border border-primary/20 bg-primary/[0.04] flex items-center justify-center text-lg">
                        {icon}
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