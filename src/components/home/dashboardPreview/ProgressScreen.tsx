"use client";

import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import type { ScoreItem } from "./types";

type ProgressScreenProps = {
  isFullDashboard: boolean;
  score: number | null;
  scoreItems: ScoreItem[];
  reportStatsList: readonly (readonly [string, string])[];
  badges: Array<{ icon: string; name: string }>;
  reportMonthLabel: string;
};

export default function ProgressScreen({
  isFullDashboard,
  score,
  scoreItems,
  reportStatsList,
  badges,
  reportMonthLabel,
}: ProgressScreenProps) {
  return (
    <>
      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0">PROGRESS</span>
        <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
          YOUR DAD HEALTH SCORE
        </div>
        <div className="bg-primary text-primary-foreground p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center shrink-0">
              <div className="font-heading text-[42px] font-extrabold leading-none">{score ?? "—"}</div>
              <div className="font-heading text-[9px] font-bold tracking-wider uppercase opacity-50">out of 100</div>
            </div>
            <div className="flex-1">
              {scoreItems.map((item) => (
                <div key={item.label} className="mb-1.5">
                  <div className="flex justify-between font-heading text-[9px] font-bold uppercase opacity-60 mb-0.5">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1 bg-primary-foreground/20">
                    <div className="h-1 bg-primary-foreground transition-all" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className="section-label !p-0 mb-2 block">{reportMonthLabel} REPORT</span>
        <div className="grid grid-cols-3 gap-2">
          {reportStatsList.map(([value, label]) => (
            <StatCard key={label} value={value} label={label} compact />
          ))}
        </div>
      </div>

      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0 mb-3 block">BADGES</span>
        {badges.length === 0 ? (
          <p className="text-xs text-muted-foreground">Earn badges by logging workouts, moods, and milestones.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className="w-10 h-10 border border-primary/20 bg-primary/[0.04] flex items-center justify-center"
                title={badge.name}
              >
                <span aria-hidden="true">{badge.icon}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/progress" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
          View full Progress →
        </Link>
      </div>
    </>
  );
}
