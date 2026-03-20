"use client";

import Logo from "@/components/Logo";
import OutlineButton from "@/components/OutlineButton";
import { MOOD_WEEK, DAYS } from "@/lib/constants";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useDadScore } from "@/hooks/useDadScore";
import { useMoodLogs } from "@/hooks/useMoodLogs";
import { useStreak } from "@/hooks/useStreak";
import { useWeeklyChallenge } from "@/hooks/useWeeklyChallenge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCbtCheckIn } from "@/hooks/useCbtCheckIn";
import { useState } from "react";
import { format } from "date-fns";

const SIDEBAR_ITEMS = [
  { icon: "🏠", label: "HOME", active: true },
  { icon: "🏋️", label: "FITNESS" },
  { icon: "🧠", label: "MIND" },
  { icon: "👨‍👧", label: "BOND" },
  { icon: "👥", label: "COMMUNITY" },
  { icon: "📊", label: "PROGRESS" },
  { icon: "💎", label: "PRO ★" },
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

const DashboardPreview = () => {
  const { user } = useAuth();
  const { data: scoreData } = useDadScore(user?.id);
  const { data: moodLogs } = useMoodLogs(user?.id);
  const { data: streak = 0 } = useStreak(user?.id);
  const { data: challenge } = useWeeklyChallenge();
  const { data: profile } = useUserProfile(user?.id);
  const cbtMutation = useCbtCheckIn(user?.id);

  const today = new Date().toISOString().slice(0, 10);
  const hasCheckedInToday = moodLogs?.some((m: { date: string }) => m.date === today);
  const [cbtMood, setCbtMood] = useState(3);
  const [cbtSleep, setCbtSleep] = useState(7);

  const score = scoreData?.score ?? 74;
  const breakdown = scoreData?.breakdown ?? { mind: 72, body: 81, bond: 68 };
  const SCORE_ITEMS = [
    { label: "MIND", value: breakdown.mind },
    { label: "BODY", value: breakdown.body },
    { label: "BOND", value: breakdown.bond },
  ];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const moodMap = new Map((moodLogs ?? []).map((m: { date: string; mood_value: number }) => [m.date, m.mood_value]));
  const moodWeek = last7.map((d) => moodMap.get(d) ?? 3);
  const displayName = user?.user_metadata?.display_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "James";
  const tasks = (profile?.goals ?? []).length > 0
    ? (profile.goals as string[]).map((g, i) => ({
        icon: DEFAULT_GOALS[i % DEFAULT_GOALS.length]?.icon ?? "✓",
        name: g,
        time: "TODAY",
        status: "open" as const,
      }))
    : DEFAULT_GOALS;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border">
        {/* Sidebar */}
        <div className="bg-card p-5">
          <Logo className="mb-5" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-heading text-sm font-bold text-primary">
              {user ? (displayName.slice(0, 2).toUpperCase()) : "JH"}
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-foreground">{user ? displayName : "James H."}</div>
              <div className="text-xs text-muted-foreground">{streak}-day streak 🔥</div>
            </div>
          </div>
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-bold tracking-wider uppercase ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="bg-card p-5">
          <div className="mb-4">
            <span className="section-label !p-0">GOOD MORNING</span>
            <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1">
              {displayName.toUpperCase()},<br />{format(new Date(), "EEEE")}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag-pill">PRO</span>
              <span className="text-xs text-muted-foreground">{format(new Date(), "d MMM")}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">2,341 dads online</span>
            </div>
          </div>

          {/* CBT Daily check-in - when logged in and not done today */}
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
                  onClick={() => cbtMutation.mutate({ mood_value: cbtMood, sleep_hours: cbtSleep })}
                  disabled={cbtMutation.isPending}
                  className="self-end bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 border-none cursor-pointer hover:bg-primary/90 disabled:opacity-50"
                >
                  {cbtMutation.isPending ? "..." : "SAVE"}
                </button>
              </div>
            </div>
          )}

          {/* Score card */}
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

          {/* Upgrade to Pro strip */}
          <div className="border border-primary/20 p-3 mb-4">
            <div className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary mb-0.5">
              UPGRADE TO PRO
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">Unlock full score, graphs & more</p>
            <button className="bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 w-full cursor-pointer border-none hover:bg-primary/90 transition-colors">
              7-day free trial
            </button>
          </div>

          {/* Today's plan */}
          <span className="section-label !p-0 mb-2 block">TODAY'S PLAN</span>
          <div className="pb-4">
          {tasks.map((task) => (
            <div key={task.name} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
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

        {/* Right column */}
        <div className="bg-card p-5">
          {/* Mood chart */}
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
            Avg mood: <span className="text-primary font-semibold">Good</span> · vs last week:{" "}
            <span className="text-primary">↑ 12%</span>
          </p>

          {/* Smart reminders */}
          <div className="mt-6">
            <span className="section-label !p-0 mb-3 block">SMART REMINDERS</span>
            {SMART_REMINDERS.map((reminder) => (
              <div key={reminder} className="text-xs text-muted-foreground py-1.5 border-b border-border last:border-b-0">
                {reminder}
              </div>
            ))}
          </div>

          {/* Challenge */}
          <div className="mt-6 border border-primary/20 p-4">
            <div className="font-heading text-[10px] font-bold tracking-[2px] uppercase text-primary mb-1">
              THIS WEEK'S CHALLENGE
            </div>
            <div className="font-heading text-[16px] font-extrabold text-foreground uppercase tracking-wide mb-1">
              {(challenge as { title?: string })?.title ?? "SCREEN-FREE SUNDAY"}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {(challenge as { participants_count?: number })?.participants_count ?? 847} dads taking part
            </p>
            <Link href="/progress">
              <span className="bg-transparent border-[1.5px] font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex gap-1.5 py-2 px-3.5 text-[11px] text-foreground border-foreground hover:border-primary hover:text-primary transition-all duration-200">
                TAKE ACTION →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

export default DashboardPreview;
