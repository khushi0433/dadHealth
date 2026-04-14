"use client";

import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import MiniBarChart from "@/components/dashboard/MiniBarChart";
import SectionHeader from "@/components/dashboard/SectionHeader";

type MindScreenProps = {
  isFullDashboard: boolean;
  moodWeek: number[];
  moodLabels: string[];
};

export default function MindScreen({ isFullDashboard, moodWeek, moodLabels }: MindScreenProps) {
  return (
    <>
      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
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
          <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />CRISIS SUPPORT — SAMARITANS · CALM · MIND</span>
        </a>
      </div>

      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <SectionHeader title="MOOD THIS WEEK" className="mb-3 block" />
        <MiniBarChart values={moodWeek} labels={moodLabels} maxValue={4} />
        <Link href="/mind" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
          View full Mind →
        </Link>
      </div>
    </>
  );
}
