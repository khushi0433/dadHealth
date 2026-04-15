"use client";

import Link from "next/link";
import MiniBarChart from "@/components/dashboard/MiniBarChart";
import SectionHeader from "@/components/dashboard/SectionHeader";
import StatCard from "@/components/dashboard/StatCard";

type FitnessScreenProps = {
  isFullDashboard: boolean;
  hasUser: boolean;
  monthWorkouts: number;
  weightDisplay?: string;
  activeTodayMin?: number;
  bodyWeekSeries: number[];
  featuredWorkoutTitle: string;
  featuredWorkoutMeta: string;
  meals: Array<{ day: string; name: string; kcal: number }>;
};

export default function FitnessScreen({
  isFullDashboard,
  hasUser,
  monthWorkouts,
  weightDisplay,
  activeTodayMin,
  bodyWeekSeries,
  featuredWorkoutTitle,
  featuredWorkoutMeta,
  meals,
}: FitnessScreenProps) {
  return (
    <>
      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <span className="section-label !p-0">FITNESS</span>
        <div className="font-heading text-[24px] font-extrabold text-foreground uppercase leading-tight mt-1 mb-4">
          TODAY&apos;S WORKOUT
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            [hasUser ? String(monthWorkouts) : "—", "WORKOUTS"],
            [weightDisplay ?? "—", "WEIGHT"],
            [featuredWorkoutMeta || "—", "LAST SESSION"],
            [hasUser && (activeTodayMin ?? 0) > 0 ? `${activeTodayMin} min` : "—", "ACTIVE"],
          ].map(([value, label]) => (
            <StatCard key={String(label)} value={String(value)} label={String(label)} />
          ))}
        </div>
        {featuredWorkoutTitle ? (
          <div className="border border-primary/20 p-3 mb-4">
            <div className="font-heading text-[13px] font-bold text-foreground mb-1">{featuredWorkoutTitle}</div>
            <p className="text-[10px] text-muted-foreground mb-2">{featuredWorkoutMeta || "Latest logged workout"}</p>
            <Link href="/fitness" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline">
              START WORKOUT →
            </Link>
          </div>
        ) : (
          <div className="border border-primary/20 p-3 mb-4 text-xs text-muted-foreground">
            Log your first workout to populate this card.
          </div>
        )}
        <span className="section-label !p-0 mb-2 block">MEAL PLAN</span>
        {meals.length === 0 ? (
          <p className="text-[11px] text-muted-foreground py-2">No meal plan saved yet.</p>
        ) : (
          meals.slice(0, 3).map((meal) => (
            <div key={`${meal.day}-${meal.name}`} className="flex justify-between py-2 border-b border-primary/20 last:border-b-0 text-[11px]">
              <span className="text-foreground">{meal.day} {meal.name}</span>
              <span className="text-muted-foreground">{meal.kcal} kcal</span>
            </div>
          ))
        )}
      </div>

      <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
        <SectionHeader title="BODY THIS WEEK" className="mb-3 block" />
        <MiniBarChart values={bodyWeekSeries} maxValue={4} heightClass="h-[60px]" dense />
        <Link href="/fitness" className="font-heading font-bold text-[10px] tracking-wider uppercase text-primary hover:underline inline-block mt-2">
          View full Fitness →
        </Link>
      </div>
    </>
  );
}
