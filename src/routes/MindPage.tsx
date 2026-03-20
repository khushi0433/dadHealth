import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { ProGate } from "@/components/ProProvider";
import { THERAPISTS, MOOD_WEEK, DAYS } from "@/lib/constants";

const MindPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-background max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="section-label mb-2 block">MENTAL HEALTH</span>
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide mb-6">
              MENTAL HEALTH
            </h1>
            <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
              Listen chaps, mental health is just as important for men as it is for women. Opening
              up about feelings and seeking help is not a sign of weakness, but of strength.
            </p>
            <p className="text-sm text-muted-foreground leading-[1.75] mb-8">
              It's okay to not be okay; reaching out for help is a vital step in maintaining mental
              wellness. Inhale 4 · Hold 4 · Exhale 4. Reduces cortisol.
            </p>
            <button className="w-full lg:w-auto bg-destructive/10 text-foreground border border-destructive/30 px-4 py-3 font-heading font-bold text-xs tracking-wider uppercase cursor-pointer flex items-center justify-between hover:bg-destructive/20 transition-colors">
              <span>🆘 CRISIS SUPPORT — SAMARITANS · CALM · MIND</span>
            </button>
          </div>

          {/* Breathing circle */}
          <div className="flex flex-col items-center">
            <div className="w-[200px] h-[200px] border-4 border-primary rounded-full flex flex-col items-center justify-center">
              <span className="font-heading text-lg font-extrabold text-primary uppercase tracking-wide">INHALE</span>
              <span className="font-heading text-[56px] font-extrabold text-primary leading-none">4</span>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Inhale 4 · Hold 4 · Exhale 4.<br />Reduces cortisol.
            </p>
            <button className="mt-6 bg-background text-foreground border-2 border-foreground px-8 py-3 font-heading font-extrabold text-sm tracking-wider uppercase cursor-pointer hover:border-primary hover:text-primary transition-colors">
              BEGIN
            </button>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-card border-t border-border">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {/* Journal */}
          <div className="bg-card p-6">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="font-heading text-lg font-extrabold text-foreground uppercase tracking-wide mb-2">
              EVENING JOURNAL
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              "What's one moment today where you were the dad you want to be?" Write freely — this is just for you.
            </p>
            <textarea
              placeholder="Write freely..."
              className="w-full bg-white/[0.04] border border-border p-3 text-foreground text-sm resize-none h-[80px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
            />
            <LimeButton small className="mt-3">SAVE ENTRY →</LimeButton>
          </div>

          {/* Mood Trend - Pro gated */}
          <ProGate featureName="Mood trend graphs" lockMessage="Your mood today is one data point. Your mood over 30 days is a pattern. Patterns change lives.">
            <div className="bg-card p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-heading text-lg font-extrabold text-foreground uppercase tracking-wide mb-2">
                MOOD TREND
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Your 7-day mood pattern — tracked daily and correlated with sleep data to spot what's affecting you.
              </p>
              <div className="flex items-end gap-1.5 h-[80px] mb-2">
                {MOOD_WEEK.map((v, i) => {
                  const h = Math.round((v / 4) * 68) + 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full transition-all ${v >= 3 ? "bg-primary" : "bg-muted"}`}
                        style={{ height: `${h}px` }}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: <span className="text-primary font-semibold">Good</span> · vs last week:{" "}
                <span className="text-primary">↑ 12%</span>
              </p>
            </div>
          </ProGate>

          {/* Find a Therapist - Pro gated */}
          <ProGate featureName="Therapist booking" lockMessage="The gap between 'I should talk to someone' and actually doing it is where most men get stuck. We close that gap.">
            <div className="bg-card p-6">
              <div className="text-3xl mb-3">🩺</div>
              <h3 className="font-heading text-lg font-extrabold text-foreground uppercase tracking-wide mb-2">
                FIND A THERAPIST
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Filtered for dad-friendly sessions, evening & weekend slots. Verified by the Dad Health community.
              </p>
              {THERAPISTS.map((t) => (
                <div key={t.name} className="therapist-card mb-2 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-heading text-sm font-extrabold text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {t.spec} · {t.slots} · {t.price}
                    </div>
                  </div>
                  <button className="bg-transparent text-foreground border border-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 cursor-pointer shrink-0 hover:border-primary hover:text-primary transition-colors">
                    Book
                  </button>
                </div>
              ))}
            </div>
          </ProGate>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default MindPage;

