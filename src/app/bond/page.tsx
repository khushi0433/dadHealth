"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Lock } from "lucide-react";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import { useProStatus } from "@/components/ProProvider";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/contexts/AuthContext";
import { useBond } from "@/hooks/useBond";
import { trackEvent } from "@/lib/analytics";

type DadDateRow = {
  icon?: string;
  name: string;
  age_range?: string;
  age?: string;
  budget?: string;
  duration_minutes?: number;
  time_of_day?: string;
};

type DadDateDisplay = DadDateRow & { time: string };

const BondPage = () => {
  const { user } = useAuth();
  const { isPro, showPaywall } = useProStatus();
  const { dadDates, milestones, prompts, saveMilestone } = useBond(user?.id);

  const [presentMode, setPresentMode] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");

  const dates: DadDateDisplay[] = (dadDates as DadDateRow[]).map((d) => ({
    ...d,
    time: d.time_of_day ?? (d.duration_minutes != null
      ? (d.duration_minutes >= 60 ? `${Math.floor(d.duration_minutes / 60)} hr` : `${d.duration_minutes} min`)
      : "—"),
  }));
  const filters = useMemo(() => {
    const options: Array<{ id: string; label: string }> = [{ id: "all", label: "All" }];
    if (dates.some((d) => d.budget?.toLowerCase() === "free")) {
      options.push({ id: "free", label: "Free" });
    }
    if (dates.some((d) => d.budget?.includes("£") && Number.parseInt(d.budget, 10) <= 15)) {
      options.push({ id: "under-15", label: "Under £15" });
    }
    if (dates.some((d) => d.duration_minutes != null && d.duration_minutes >= 60) || dates.some((d) => d.time.includes("hr"))) {
      options.push({ id: "one-hour", label: "1 hr" });
    }
    if (
      dates.some((d) => d.time_of_day?.toLowerCase().includes("evening")) ||
      dates.some((d) => d.time.toLowerCase().includes("evening"))
    ) {
      options.push({ id: "evening", label: "Evening" });
    }
    return options;
  }, [dates]);
  const filteredDates = dates.filter((d) => {
    if (dateFilter === "all") return true;
    if (dateFilter === "free") return d.budget?.toLowerCase() === "free";
    if (dateFilter === "under-15") return d.budget?.includes("£") && Number.parseInt(d.budget, 10) <= 15;
    if (dateFilter === "one-hour") return d.time?.includes("1 hr");
    if (dateFilter === "evening") return d.time?.toLowerCase().includes("evening");
    return true;
  });

  const displayMilestones = milestones;
  const conversationStarters = prompts.map((p: { prompt: string }) => p.prompt);

  const handlePresentModeToggle = () => {
    const nextValue = !presentMode;
    setPresentMode(nextValue);
    trackEvent("present_dad_mode_toggled", {
      enabled: nextValue,
    });
  };

  return (
    <SitePageShell>
      {/* Hero */}
      <section className="relative w-full min-w-0 h-[320px] lg:h-[400px]">
      <img
  src={IMAGES.bond}
  alt="Parenting"
  className="absolute inset-0 w-full h-full object-cover object-[50%_35%]"
/>
        <div className="absolute inset-0 bg-background/65" />
        <div className="relative z-10 flex flex-col justify-center items-start h-full w-full max-w-[1400px] mx-auto px-5 lg:px-8 min-w-0">
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
        <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 py-4 flex items-center justify-between min-w-0">
          <div>
            <h3 className="font-heading text-sm font-extrabold text-foreground uppercase tracking-wide">Present Dad Mode</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Block distractions for 60 min</p>
          </div>
          <button
            onClick={handlePresentModeToggle}
            className="w-11 h-6 rounded-full bg-muted relative cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${
                presentMode ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14 lg:items-start">
          {/* Dad date ideas */}
          <div className="pt-8 pb-6 lg:col-span-7 lg:pb-10 min-w-0">
            <span className="section-label !p-0 mb-4 block">DAD DATE IDEAS</span>
            <div className="flex gap-2 mb-4 flex-wrap">
              {filters.map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setDateFilter(filterOption.id)}
                  className={`px-3 py-1.5 border font-heading text-[11px] font-bold tracking-wide uppercase cursor-pointer transition-all ${
                    dateFilter === filterOption.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
              {filteredDates.length > 0 ? filteredDates.map((d) => (
                <div
                  key={d.name}
                  onClick={() =>
                    trackEvent("dad_date_clicked", {
                      name: d.name,
                      age_range: d.age_range ?? d.age ?? null,
                      budget: d.budget ?? null,
                    })
                  }
                  className="border border-border p-3.5 cursor-pointer transition-all hover:border-primary group min-w-0"
                >
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <div className="font-heading text-[13px] font-extrabold text-foreground tracking-wide mb-1 group-hover:text-primary transition-colors">
                    {d.name}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Age {d.age_range ?? d.age ?? "—"}</span>
                    <span className="text-[10px] text-primary">· {d.budget ?? "—"}</span>
                    <span className="text-[10px] text-muted-foreground">· {d.time ?? "—"}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground col-span-full">No dad date ideas yet.</p>
              )}
            </div>
          </div>

          {/* Milestones - Pro gated */}
          <div className="py-8 border-t border-border lg:border-t-0 lg:border-l lg:border-border lg:pl-10 xl:pl-14 lg:col-span-5 lg:pt-10 min-w-0">
            <span className="section-label !p-0 mb-12 block">MILESTONE TRACKER</span>
            {isPro ? (
              <div className="w-full">
                {displayMilestones.length > 0 ? displayMilestones.map((m: { date: string; text: string; tag: string }) => (
                  <div key={m.text} className="flex gap-3 items-start py-3 border-b border-border last:border-b-0">
                    <span className="tag-pill shrink-0">{m.date ? format(new Date(m.date), "d MMM") : "—"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/70 leading-relaxed">{m.text}</p>
                      <span className="tag-pill-dark mt-2 inline-block">{m.tag}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No milestones yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center p-6 lg:p-8 bg-background/50 border border-border rounded-lg text-center gap-2 w-full">
                <Lock className="h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-xs font-bold text-foreground">Pro Feature</p>
                <p className="text-[10px] text-muted-foreground max-w-sm">Words are good. Photos last forever.</p>
                <button
                  type="button"
                  onClick={() => showPaywall("Milestone photo uploads")}
                  className="px-3 py-1 text-[10px] bg-primary text-primary-foreground font-bold uppercase rounded cursor-pointer hover:brightness-110"
                >
                  Unlock →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conversation starters */}
        <div className="py-8 border-t border-border w-full">
          <span className="section-label !p-0 mb-4 block">CONVERSATION STARTERS</span>
          {conversationStarters.length > 0 ? conversationStarters.map((q: string) => (
            <div
              key={q}
              className="py-3 border-b border-border last:border-b-0 pl-3 border-l-[3px] border-l-primary mb-2"
            >
              <p className="text-sm text-foreground/70 leading-relaxed italic">"{q}"</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No conversation starters yet.</p>
          )}
        </div>
      </div>

      <SiteFooter />
    </SitePageShell>
  );
};

export default BondPage;
