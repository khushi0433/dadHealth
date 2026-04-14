"use client";

import { format } from "date-fns";
import Link from "next/link";
import { DashboardIcon } from "@/components/DashboardIcon";
import type { DadDateItem, MilestoneItem } from "./types";

type BondScreenProps = {
  isFullDashboard: boolean;
  dates: DadDateItem[];
  milestones: MilestoneItem[];
};

export default function BondScreen({ isFullDashboard, dates, milestones }: BondScreenProps) {
  return (
    <>
      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0">BOND</span>
        <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
          PARENTING
        </div>
        <span className="section-label !p-0 mb-2 block">DAD DATE IDEAS</span>
        {dates.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No dad dates yet</p>
        ) : (
          dates.map((dateItem) => (
            <div key={dateItem.id ?? dateItem.name} className="flex items-center gap-3 py-2.5 border-b border-primary/20 last:border-b-0">
              <DashboardIcon icon={dateItem.iconKey ?? dateItem.icon ?? "gaming"} size="lg" />
              <div className="flex-1">
                <div className="font-heading text-[12px] font-bold text-foreground">{dateItem.name}</div>
                <div className="text-[10px] text-muted-foreground">Age {dateItem.age_range ?? "—"} · {dateItem.budget ?? "—"}</div>
              </div>
            </div>
          ))
        )}
        <div className="mt-4 border-l-[3px] border-l-primary pl-3 py-2">
          <p className="text-xs text-muted-foreground italic">&quot;What made you laugh the hardest today?&quot;</p>
          <div className="text-[10px] text-muted-foreground mt-0.5">Conversation starter</div>
        </div>
      </div>

      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0 mb-3 block">MILESTONES</span>
        {milestones.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No milestones yet</p>
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="py-2 border-b border-border last:border-b-0">
              <span className="tag-pill text-[9px] mr-1">{format(new Date(milestone.date), "d MMM")}</span>
              <span className="text-[11px] text-foreground/70">{milestone.text}</span>
            </div>
          ))
        )}
        <Link href="/bond" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-3">
          View full Bond →
        </Link>
      </div>
    </>
  );
}
