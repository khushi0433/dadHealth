import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OutlineButton from "@/components/OutlineButton";
import { MOOD_WEEK, DAYS } from "@/lib/constants";

const SLEEP_DATA = [
  { day: "Mon", hrs: 6.5 },
  { day: "Tue", hrs: 7.2 },
  { day: "Wed", hrs: 5.8 },
  { day: "Thu", hrs: 6.9 },
  { day: "Fri", hrs: 7.5 },
  { day: "Sat", hrs: 8.1 },
  { day: "Sun", hrs: 6.2 },
];

const BADGES = [
  { icon: "🔥", name: "14-day streak" },
  { icon: "💪", name: "First workout" },
  { icon: "📖", name: "Journal starter" },
  { icon: "👨‍👧", name: "Dad date king" },
  { icon: "🧠", name: "Mind check" },
];

const ProgressPage = () => {
  const dadScore = 74;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Score */}
      <section className="bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10">
          <span className="section-label !p-0 mb-4 block">YOUR DAD HEALTH SCORE</span>
          <div className="flex gap-8 items-center">
            <div className="w-[100px] h-[100px] border-4 border-primary rounded-full flex flex-col items-center justify-center shrink-0">
              <div className="font-heading text-[36px] font-extrabold text-primary leading-none">{dadScore}</div>
              <div className="font-heading text-[9px] font-bold tracking-wider uppercase text-muted-foreground">out of 100</div>
            </div>
            <div className="flex-1 max-w-sm">
              {[
                { label: "Mind", value: 72 },
                { label: "Body", value: 81 },
                { label: "Bond", value: 68 },
              ].map((item) => (
                <div key={item.label} className="mb-2.5">
                  <div className="flex justify-between font-heading text-[11px] font-bold uppercase text-muted-foreground tracking-wide mb-1">
                    <span>{item.label}</span>
                    <span className="text-primary">{item.value}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Report card */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-10">
          <h2 className="font-heading text-[22px] font-extrabold uppercase tracking-wide mb-4">March report card</h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[
              ["12", "Workouts"],
              ["8", "Journal entries"],
              ["3", "Dad dates"],
              ["6.8hrs", "Avg sleep"],
              ["14", "Day streak"],
              ["Good", "Avg mood"],
            ].map(([n, l]) => (
              <div key={l} className="bg-primary-foreground/[0.07] p-3.5">
                <div className="font-heading text-[22px] font-extrabold leading-none">{n}</div>
                <div className="text-[10px] opacity-55 mt-1.5 uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <OutlineButton dark>Share report card</OutlineButton>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        {/* Badges */}
        <div className="py-8">
          <span className="section-label !p-0 mb-4 block">DH BADGES EARNED</span>
          <div className="flex gap-3 flex-wrap">
            {BADGES.map((b) => (
              <div key={b.name} className="flex flex-col items-center gap-1.5 p-2.5 border border-primary/20 bg-primary/[0.04] min-w-[60px]">
                <span className="text-2xl">{b.icon}</span>
                <span className="font-heading text-[9px] font-bold text-primary uppercase tracking-wide text-center leading-tight">
                  {b.name}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1.5 p-2.5 border border-dashed border-border min-w-[60px] opacity-40">
              <span className="text-2xl">🏆</span>
              <span className="font-heading text-[9px] font-bold text-muted-foreground uppercase tracking-wide text-center leading-tight">
                30-day lock
              </span>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="py-8 border-t border-border">
          <span className="section-label !p-0 mb-4 block">SLEEP QUALITY THIS WEEK</span>
          <div className="flex items-end gap-1.5 h-[80px] mb-3">
            {SLEEP_DATA.map((s, i) => {
              const h = Math.round((s.hrs / 10) * 70) + 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${h}px`,
                      backgroundColor:
                        s.hrs >= 7
                          ? "hsl(78, 89%, 65%)"
                          : s.hrs >= 6
                          ? "hsl(78, 89%, 65%, 0.4)"
                          : "hsl(0, 0%, 20%)",
                    }}
                  />
                  <span className="font-heading text-[9px] font-bold text-muted-foreground">{s.day}</span>
                </div>
              );
            })}
          </div>
          <div className="p-3 bg-primary/[0.06] border border-primary/15 text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-semibold">Pattern spotted:</span> Your mood is 40% higher on days after 7+ hours sleep.
          </div>
        </div>

        {/* Mood correlation */}
        <div className="py-8 border-t border-border">
          <div className="bg-primary text-primary-foreground p-5">
            <h3 className="font-heading text-lg font-extrabold uppercase tracking-wide mb-3">Mood correlation</h3>
            <div className="flex gap-3 mb-3">
              {SLEEP_DATA.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-10 bg-primary-foreground/[0.08] relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary-foreground/60"
                      style={{ height: `${Math.round((s.hrs / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="w-full h-10 bg-primary-foreground/[0.08] relative">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary-foreground/35"
                      style={{ height: `${Math.round((MOOD_WEEK[i] / 4) * 100)}%` }}
                    />
                  </div>
                  <span className="font-heading text-[9px] font-bold opacity-50">{s.day}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-[11px] opacity-50">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary-foreground/60" /> Sleep
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-primary-foreground/35" /> Mood
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default ProgressPage;
