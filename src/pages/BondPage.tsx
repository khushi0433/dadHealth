import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { ProGate } from "@/components/ProProvider";
import parentingImg from "@/assets/parenting.jpg";

const DAD_DATES = [
  { icon: "🎮", name: "Gaming night", age: "8–14", budget: "Free", time: "2 hrs" },
  { icon: "🏕️", name: "Garden camping", age: "5–12", budget: "Free", time: "Evening" },
  { icon: "⚽", name: "Park kickabout", age: "4+", budget: "Free", time: "1 hr" },
  { icon: "🍕", name: "Cook together", age: "6+", budget: "£10", time: "1 hr" },
  { icon: "🎬", name: "Cinema trip", age: "6+", budget: "£25", time: "2 hrs" },
  { icon: "🚴", name: "Bike ride", age: "7+", budget: "Free", time: "1–2 hrs" },
];

const MILESTONES = [
  { date: "12 Mar", text: "Ella said 'I love you Dad' unprompted after school", tag: "BOND" },
  { date: "3 Feb", text: "First bike ride without stabilisers — cried (me, not him)", tag: "MILESTONE" },
  { date: "15 Jan", text: "Bedtime story streak — 14 nights in a row", tag: "STREAK" },
];

const CONVERSATION_STARTERS = [
  "What made you laugh the hardest today?",
  "If you could have any superpower, what would you pick and why?",
  "What's one thing you wish Dad knew about your day?",
];

const BondPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[280px] lg:h-[360px]">
        <img src={parentingImg} alt="Parenting" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/65" />
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1400px] mx-auto px-5 lg:px-8 pb-8">
          <span className="section-label text-primary mb-2">THE BOND</span>
          <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide">
            PARENTING
          </h1>
          <p className="text-sm text-foreground/60 mt-2 max-w-md">
            Built for dads, by dads. Kill the old version of you.
          </p>
        </div>
      </section>

      {/* Present Dad Mode */}
      <section className="bg-primary/[0.06] border-y border-primary/20">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm font-extrabold text-foreground uppercase tracking-wide">Present Dad Mode</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Block distractions for 60 min</p>
          </div>
          <div className="w-11 h-6 rounded-full bg-muted relative cursor-pointer">
            <div className="w-5 h-5 rounded-full bg-foreground absolute top-0.5 left-0.5 transition-transform" />
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        {/* Dad date ideas */}
        <div className="py-8">
          <span className="section-label !p-0 mb-4 block">DAD DATE IDEAS</span>
          <div className="flex gap-2 mb-4 flex-wrap">
            {["All", "Free", "Under £15", "1 hr", "Evening"].map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 border font-heading text-[11px] font-bold tracking-wide uppercase cursor-pointer transition-all ${
                  i === 0
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {DAD_DATES.map((d) => (
              <div
                key={d.name}
                className="border border-border p-3.5 cursor-pointer transition-all hover:border-primary group"
              >
                <div className="text-2xl mb-2">{d.icon}</div>
                <div className="font-heading text-[13px] font-extrabold text-foreground tracking-wide mb-1 group-hover:text-primary transition-colors">{d.name}</div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Age {d.age}</span>
                  <span className="text-[10px] text-primary">· {d.budget}</span>
                  <span className="text-[10px] text-muted-foreground">· {d.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones - Pro gated */}
        <div className="py-8 border-t border-border">
          <span className="section-label !p-0 mb-4 block">MILESTONE TRACKER</span>
          <ProGate featureName="Milestone photo uploads" lockMessage="Words are good. Photos last forever.">
            <div>
              {MILESTONES.map((m) => (
                <div key={m.text} className="flex gap-3 items-start py-3 border-b border-border last:border-b-0">
                  <span className="tag-pill shrink-0">{m.date}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/70 leading-relaxed">{m.text}</p>
                    <span className="tag-pill-dark mt-2 inline-block">{m.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </ProGate>
        </div>

        {/* Conversation starters */}
        <div className="py-8 border-t border-border">
          <span className="section-label !p-0 mb-4 block">CONVERSATION STARTERS</span>
          {CONVERSATION_STARTERS.map((q) => (
            <div key={q} className="py-3 border-b border-border last:border-b-0 pl-3 border-l-[3px] border-l-primary mb-2">
              <p className="text-sm text-foreground/70 leading-relaxed italic">"{q}"</p>
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default BondPage;
