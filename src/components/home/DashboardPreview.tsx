import Logo from "@/components/Logo";
import OutlineButton from "@/components/OutlineButton";
import { MOOD_WEEK, DAYS } from "@/lib/constants";

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

const DashboardPreview = () => (
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
              JH
            </div>
            <div>
              <div className="font-heading text-sm font-bold text-foreground">James H.</div>
              <div className="text-xs text-muted-foreground">14-day streak 🔥</div>
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
              JAMES,<br />WEDNESDAY
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag-pill">PRO</span>
              <span className="text-xs text-muted-foreground">18 MARCH</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">2,341 dads online</span>
            </div>
          </div>

          {/* Score card */}
          <div className="bg-primary text-primary-foreground p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center shrink-0">
                <div className="font-heading text-[42px] font-extrabold leading-none">74</div>
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
          {TODAYS_PLAN.map((task) => (
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
            {MOOD_WEEK.map((v, i) => {
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
              SCREEN-FREE SUNDAY
            </div>
            <p className="text-xs text-muted-foreground mb-3">847 dads taking part</p>
            <OutlineButton small>TAKE ACTION</OutlineButton>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardPreview;
