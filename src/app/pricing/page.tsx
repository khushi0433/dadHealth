"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import { useProStatus } from "@/components/ProProvider";
import { useAuth } from "@/contexts/AuthContext";
import LoginPromptModal from "@/components/LoginPromptModal";
import { PRICING_PLANS, TESTIMONIALS, FAQ_ITEMS } from "@/lib/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";


const PricingPage = () => {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [previewPlan, setPreviewPlan] = useState<"monthly" | "annual">("annual");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user, openAuthModal } = useAuth();
  const { isPro, isSubscribed, startCheckout, refreshSubscription } = useProStatus();
  const isActivePro = !!user && isPro;
  const isActiveSubscribed = !!user && isSubscribed;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Welcome to Dad Health Pro");
      void refreshSubscription();
      window.history.replaceState({}, "", "/pricing");
    }
  }, [refreshSubscription]);

  const handleStartTrial = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    void startCheckout(plan);
  };

  const handleMonthlyClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    void startCheckout("monthly");
  };

  const handleManageBilling = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = (await res.json()) as { error?: string; url?: string };
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Could not open billing portal");
      return;
    }
    if (data.url) window.location.href = data.url;
  };

  return (
    <SitePageShell>
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

          {/* Pro confirmed state - only for paid subscribers */}
          {isActiveSubscribed && (
            <div className="mt-6 border border-primary bg-primary/5 p-6 max-w-sm mx-auto">
              <div className="font-heading text-[22px] font-extrabold text-primary uppercase mb-2">
                You're a Pro Dad.
              </div>
              <p className="text-sm text-muted-foreground">You have full access to every Dad Health feature. Keep showing up.</p>
              <button
                type="button"
                onClick={() => void handleManageBilling()}
                className="mt-4 text-[10px] text-muted-foreground underline cursor-pointer bg-transparent border-none hover:text-foreground transition-colors"
              >
                Manage subscription
              </button>
            </div>
          )}

          {/* Plan toggle */}
          {!isActivePro && (
            <div className="flex max-w-xs mx-auto mt-8 bg-white/5 border border-border p-1 gap-1">
              {(["monthly", "annual"] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setPlan(id)}
                  className={`flex-1 py-2.5 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all relative ${
                    plan === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:text-foreground"
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
          )}
        </div>
      </section>

      {/* Pricing cards */}
      {!isActivePro && (
        <section className="bg-background">
          <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PRICING_PLANS.map((p) => {
                const isPopular = "popular" in p && (p as any).popular;
                const hasExcluded = "excluded" in p && (p as any).excluded;
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
                      {(p as any).name === "PRO" && plan === "monthly" ? "£6.99" : (p as any).price}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {(p as any).name === "PRO" && plan === "monthly" ? "per month" : (p as any).sub}
                    </p>
                    {"badge" in p && (p as any).badge && plan === "annual" && (
                      <span className="inline-block bg-primary text-primary-foreground font-heading text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase mt-1 mb-2">
                        {(p as any).badge}
                      </span>
                    )}
                    <div className="my-5 space-y-2.5">
                      {(p as any).features.map((f: string) => (
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
                      type="button"
                      onClick={() => {
                        if (isPopular) handleStartTrial();
                      }}
                      className={`w-full py-3 font-heading font-bold text-[13px] tracking-wider uppercase cursor-pointer transition-all ${
                        isPopular
                          ? "bg-primary text-primary-foreground border-none hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.3)]"
                          : "bg-transparent text-foreground border border-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {(p as any).cta}
                    </button>
                    {isPopular && (
                      <button
                        type="button"
                        onClick={handleStartTrial}
                        className="block w-full mt-2 text-[11px] text-muted-foreground text-center cursor-pointer bg-transparent border-none hover:text-foreground transition-colors"
                      >
                        No card until trial ends · Cancel anytime
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Locked feature example */}
      <section className="bg-card border-y border-border">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div>
              <span className="section-label !p-0 mb-2 block">Mood trend insights</span>
              <h2 className="font-heading text-[22px] font-extrabold text-foreground uppercase tracking-wide mb-4">
                Track your patterns
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
  Track your mood over time, spot patterns, and understand what actually impacts your mental health. 
  Pro gives you clear visual insights so you can improve how you show up every day.
</p>
              <div className="space-y-2.5">
                {[
                  { feat: "Daily mood check-in", badge: "FREE", included: true },
                  { feat: "See your mood patterns over time", badge: "PRO", included: false },
                  { feat: "Understand how sleep affects your mood", badge: "PRO", included: false },
                  { feat: "Full Dad Health Score insights", badge: "PRO", included: false },
                  { feat: "Crisis support (always available)", badge: "ALWAYS FREE", included: true },
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

            {/* Paywall modal preview - interactive */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Logo />
                <span className="hidden lg:inline-flex font-heading text-[10px] font-bold tracking-wider uppercase text-primary border border-primary px-2 py-0.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200">PRO</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
              <span className="text-primary font-semibold">Mood trends</span> are available on Pro
              </p>
              <div className="flex bg-white/5 border border-border p-1 gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => setPreviewPlan("monthly")}
                  className={`flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all ${
                    previewPlan === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  MONTHLY
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlan("annual")}
                  className={`flex-1 py-2 text-center font-heading text-xs font-bold tracking-wide uppercase cursor-pointer transition-all ${
                    previewPlan === "annual" ? "bg-primary text-primary-foreground hover:brightness-110" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ANNUAL
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="font-heading text-[48px] font-extrabold text-primary leading-none">
                  {previewPlan === "annual" ? "£4.17" : "£6.99"}
                </div>
                <div className="font-heading text-xs font-bold tracking-wider uppercase text-muted-foreground mt-1">
                  {previewPlan === "annual" ? "PER MONTH · BILLED £49.99/YEAR" : "PER MONTH"}
                </div>
              </div>
              <LimeButton
                type="button"
                full
                onClick={previewPlan === "monthly" ? handleMonthlyClick : handleStartTrial}
              >
                START {previewPlan === "annual" ? "ANNUAL" : "MONTHLY"} PLAN →
              </LimeButton>
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
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="font-heading text-base font-extrabold text-foreground py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6 pt-0">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Final CTA */}
          <div className="text-center mt-12">
            <LimeButton type="button" onClick={handleStartTrial}>START 7-DAY FREE TRIAL →</LimeButton>
            <button
              type="button"
              onClick={handleStartTrial}
              className="block w-full mt-3 text-[11px] text-muted-foreground cursor-pointer bg-transparent border-none hover:text-primary transition-colors"
            >
              No card until trial ends · Cancel anytime · Full access immediately
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={openAuthModal}
        />
      )}
    </SitePageShell>
  );
};

export default PricingPage;
