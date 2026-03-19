import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STATS, STATS_EXTENDED, PILLARS, MOOD_WEEK, DAYS, FAQ_ITEMS } from "@/lib/constants";
import heroImg from "@/assets/hero-dad.jpg";
import gymImg from "@/assets/gym-weights.jpg";
import runnersImg from "@/assets/runners.jpg";
import nutritionImg from "@/assets/nutrition.jpg";
import parentingImg from "@/assets/parenting.jpg";

const PILLAR_IMAGES = [gymImg, runnersImg, nutritionImg, parentingImg];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="relative h-[520px] lg:h-[600px]">
        <img
          src={heroImg}
          alt="Dad with child"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/[0.72]" />
        <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-[1400px] mx-auto px-5 lg:px-8">
          <span className="section-label mb-3">BUILT FOR DADS, BY DADS</span>
          <h1 className="font-heading text-[48px] lg:text-[72px] font-extrabold text-foreground leading-[0.95] tracking-tight uppercase mb-6">
            DAD<br />HEALTH
          </h1>
          <p className="text-sm text-foreground/70 leading-relaxed max-w-md mb-8">
            "1 in 8 men in the UK have experienced mental health symptoms. Obesity is now more
            of a global crisis than malnutrition. Be the stronger Dad you aspire to be, both
            mentally and physically."
          </p>
          <div className="flex gap-3">
            <Link to="/pricing">
              <LimeButton>START FREE — 7 DAYS →</LimeButton>
            </Link>
            <OutlineButton>HOW IT WORKS</OutlineButton>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-card border-y border-border">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.value}
              className="px-5 py-6 lg:px-8 lg:py-8 border-r border-border last:border-r-0"
            >
              <div className="font-heading text-[28px] lg:text-[36px] font-extrabold text-primary leading-none italic">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="h-[300px] lg:h-auto">
            <img
              src={gymImg}
              alt="Gym weights"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-5 py-12 lg:px-16 lg:py-20">
            <span className="section-label">WHO WE ARE</span>
            <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3 mb-6">
              WHO WE ARE
            </h2>
            <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
              Dad Health is helping to get men talking about their mental health — the stigmas
              attached to it, the anxiety of being a parent, the stresses we all encounter. What
              we go through, what we worry about, and how can we combat it together.
            </p>
            <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
              Through real-life experiences, Dad Health will offer both exercise and nutrition
              guidance, the necessary accountability checks and motivation needed to "kill the old
              version" of you in search of the best version for your family.
            </p>
            <p className="text-sm text-muted-foreground leading-[1.75] mb-8">
              Lastly, Dad Health, being a community based around being a parent, will offer tips
              for fun days with the kids, recipes to cook together, takeaway alternatives and any
              other snippets we wish we knew sooner.
            </p>
            <OutlineButton>TAKE ACTION</OutlineButton>
          </div>
        </div>
      </section>

      {/* ── EXTENDED STATS ── */}
      <section className="bg-card border-y border-border">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {STATS_EXTENDED.map((stat, i) => (
            <div
              key={i}
              className={`px-5 py-8 lg:px-8 lg:py-10 border-r border-border last:border-r-0 ${
                i >= 2 ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div
                className={`font-heading text-[36px] lg:text-[44px] font-extrabold leading-none italic ${
                  i >= 2 ? "text-primary-foreground" : "text-primary"
                }`}
              >
                {stat.value}
              </div>
              {stat.sub && (
                <div
                  className={`font-heading text-[28px] lg:text-[36px] font-extrabold leading-none uppercase ${
                    i >= 2 ? "text-primary-foreground" : "text-primary"
                  }`}
                >
                  {stat.sub}
                </div>
              )}
              <p
                className={`text-xs mt-2 leading-relaxed ${
                  i >= 2 ? "text-primary-foreground/65" : "text-muted-foreground"
                }`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-primary">
        <div className="max-w-[1400px] mx-auto px-5 py-5 lg:px-8">
          <p className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary-foreground/80 leading-relaxed">
            THESE FIGURES ARE ON THE RISE. HELP REGAIN CONTROL, AND BE THE BETTER VERSION OF YOU,
            FOR YOURSELF AND YOUR FAMILY.
          </p>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-5 py-4 lg:px-8">
            <span className="section-label">THE PILLARS OF OUR HEALTH</span>
          </div>
          <div className="px-5 pb-4 lg:px-8">
            <span className="section-label">THE PILLARS OF OUR HEALTH</span>
            <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3">
              WHAT WE COVER
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-border">
            {PILLARS.map((pillar, i) => (
              <Link
                key={pillar.tag}
                to={pillar.href}
                className="block border-r border-b border-border last:border-r-0 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r hover-lime group"
              >
                <div className="h-[140px] lg:h-[200px] overflow-hidden">
                  <img
                    src={PILLAR_IMAGES[i]}
                    alt={pillar.tag}
                    className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-75 transition-all duration-300"
                  />
                </div>
                <div className="p-3 lg:p-4">
                  <h3 className="font-heading text-[13px] font-extrabold tracking-wider text-foreground mb-1 uppercase">
                    {pillar.tag}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    {pillar.description}
                  </p>
                  <span className="tag-pill">LEARN MORE</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="bg-background border-t border-border">
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

          {/* Dashboard mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border mb-12">
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
                {[
                  { icon: "🏠", label: "HOME", active: true },
                  { icon: "🏋️", label: "FITNESS" },
                  { icon: "🧠", label: "MIND" },
                  { icon: "👨‍👧", label: "BOND" },
                  { icon: "👥", label: "COMMUNITY" },
                  { icon: "📊", label: "PROGRESS" },
                  { icon: "💎", label: "PRO ★" },
                ].map((item) => (
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
                    {[
                      { label: "MIND", value: 72 },
                      { label: "BODY", value: 81 },
                      { label: "BOND", value: 68 },
                    ].map((item) => (
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

              {/* Today's plan */}
              <span className="section-label !p-0 mb-2 block">TODAY'S PLAN</span>
              {[
                { icon: "🧘", name: "5-min breathing reset", time: "MORNING · MENTAL HEALTH", done: true },
                { icon: "🏃", name: "20-min dad run", time: "12:30PM · FITNESS", done: false },
              ].map((task) => (
                <div key={task.name} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                  <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-base shrink-0">
                    {task.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-heading text-[13px] font-bold tracking-wide text-foreground">{task.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{task.time}</div>
                  </div>
                  <span
                    className={`font-heading font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 border ${
                      task.done
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-primary border-primary"
                    }`}
                  >
                    {task.done ? "Done ✓" : "Start"}
                  </span>
                </div>
              ))}
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
                        className="w-full transition-all duration-400"
                        style={{
                          height: `${h}px`,
                          backgroundColor: v >= 3 ? "hsl(78, 89%, 65%)" : "hsl(0, 0%, 20%)",
                        }}
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
                {[
                  "🌅 Morning check-in at 7:30am",
                  "📖 Ella's bedtime in 45 mins",
                  "🏃 Run window: 12:00–12:45pm",
                ].map((reminder) => (
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

      <SiteFooter />
    </div>
  );
};

export default Index;
