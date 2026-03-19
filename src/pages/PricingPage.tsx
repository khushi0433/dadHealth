import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import { PRICING_PLANS, TESTIMONIALS, FAQ_ITEMS } from "@/lib/constants";

const PricingPage = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-16 text-center">
          <span className="section-label mb-3 block">PRICING</span>
          <h1 className="font-heading text-[36px] lg:text-[52px] font-extrabold text-foreground uppercase leading-none tracking-wide mb-4">
            KILL THE OLD<br />VERSION OF YOU.
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Unlock every tool we've built to help you be a stronger dad.
          </p>

          {/* Plan toggle */}
          <div className="flex max-w-xs mx-auto mt-8 bg-white/5 border border-border p-1 gap-1">
            {(["monthly", "annual"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setPlan(id)}
                className={`flex-1 py-2.5 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all relative ${
                  plan === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground"
                }`}
              >
                {id === "monthly" ? "MONTHLY" : "ANNUAL"}
                {id === "annual" && (
                  <span className="ml-1.5 bg-primary text-primary-foreground font-heading text-[9px] font-bold px-1.5 py-0.5 tracking-wider">
                    SAVE 40%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PRICING_PLANS.map((p) => {
              const isPopular = "popular" in p && p.popular;
              const hasExcluded = "excluded" in p && p.excluded;
              return (
              <div
                key={p.name}
                className={`border p-6 relative ${
                  isPopular ? "border-primary bg-primary/[0.03]" : "border-border"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-heading text-[9px] font-bold tracking-wider uppercase px-3 py-1">
                    MOST POPULAR
                  </div>
                )}
                <div className="font-heading text-[11px] font-bold tracking-[2px] uppercase text-muted-foreground mb-3">
                  {p.name}
                </div>
                <div className="font-heading text-[42px] font-extrabold text-primary leading-none mb-1">
                  {p.name === "PRO" && plan === "monthly" ? "£6.99" : p.price}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {p.name === "PRO" && plan === "monthly" ? "per month" : p.sub}
                </p>
                {"badge" in p && (p as any).badge && plan === "annual" && (
                  <span className="inline-block bg-primary text-primary-foreground font-heading text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase mt-1 mb-2">
                    {(p as any).badge}
                  </span>
                )}
                <div className="my-5 space-y-2.5">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <span className="feat-tick text-[10px]">✓</span>
                      <span className="text-sm text-foreground/80">{f}</span>
                    </div>
                  ))}
                  {hasExcluded &&
                    (p as any).excluded?.map((f: string) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <span className="feat-cross text-[9px]">—</span>
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </div>
                    ))}
                </div>
                <button
                  className={`w-full py-3 font-heading font-bold text-[13px] tracking-wider uppercase cursor-pointer ${
                    isPopular
                      ? "bg-primary text-primary-foreground border-none"
                      : "bg-transparent text-foreground border border-foreground"
                  }`}
                >
                  {p.cta}
                </button>
                {isPopular && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    No card until trial ends · Cancel anytime
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Locked feature example */}
      <section className="bg-card border-y border-border">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div>
              <span className="section-label !p-0 mb-2 block">EXAMPLE — LOCKED FEATURE</span>
              <h2 className="font-heading text-[22px] font-extrabold text-foreground uppercase tracking-wide mb-4">
                MOOD TREND GRAPHS — PRO FEATURE
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Free users see a lock icon in place of their mood charts. Tapping it opens the
                paywall modal with context — it tells them exactly which feature they tried to
                unlock.
              </p>
              <div className="space-y-2.5">
                {[
                  { feat: "Daily mood check-in", badge: "FREE", included: true },
                  { feat: "Mood trend graphs", badge: "PRO", included: false },
                  { feat: "Sleep correlation insights", badge: "PRO", included: false },
                  { feat: "Dad Health Score breakdown", badge: "PRO", included: false },
                  { feat: "Crisis support", badge: "ALWAYS FREE", included: true },
                ].map((item) => (
                  <div key={item.feat} className="feat-row">
                    <span className={item.included ? "feat-tick" : "feat-cross"}>
                      {item.included ? "✓" : "—"}
                    </span>
                    <span className="text-sm text-foreground/80 flex-1">{item.feat}</span>
                    <span className="font-heading text-[9px] font-bold tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 uppercase">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paywall modal preview */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Logo />
                <span className="tag-pill">PRO</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                "<span className="text-primary font-semibold">mood trend graphs</span>" is a Pro feature
              </p>
              <div className="flex bg-white/5 border border-border p-1 gap-1 mb-6">
                <div className="flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase text-muted-foreground">
                  MONTHLY
                </div>
                <div className="flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase bg-primary text-primary-foreground">
                  ANNUAL
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="font-heading text-[48px] font-extrabold text-primary leading-none">£4.17</div>
                <div className="font-heading text-xs font-bold tracking-wider uppercase text-muted-foreground mt-1">
                  PER MONTH · BILLED £49.99/YEAR
                </div>
              </div>
              <button className="w-full py-3 bg-primary text-primary-foreground font-heading font-extrabold text-sm tracking-wider uppercase cursor-pointer border-none mb-2">
                START ANNUAL PLAN →
              </button>
              <p className="text-[11px] text-muted-foreground text-center">
                7-day free trial · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-primary-foreground/10">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-primary p-6">
                <p className="text-sm italic leading-relaxed opacity-75 mb-4">{t.text}</p>
                <div className="font-heading text-[11px] font-bold tracking-wider uppercase opacity-50">
                  — {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background">
        <div className="max-w-2xl mx-auto px-5 py-16">
          <span className="section-label !p-0 mb-8 block text-center">COMMON QUESTIONS</span>
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="py-6 border-b border-border last:border-b-0">
              <h3 className="font-heading text-base font-extrabold text-foreground mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}

          {/* Final CTA */}
          <div className="text-center mt-12">
            <LimeButton>START 7-DAY FREE TRIAL →</LimeButton>
            <p className="text-[11px] text-muted-foreground mt-3">
              No card until trial ends · Cancel anytime · Full access immediately
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default PricingPage;
