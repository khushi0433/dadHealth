"use client";

import Link from "next/link";
import LimeButton from "@/components/LimeButton";
import { useAuth } from "@/contexts/AuthContext";
import { useFitness } from "@/hooks/useFitness";

interface DadStrengthSectionProps {
  workoutImg: string;
}

const DadStrengthSection = ({ workoutImg }: DadStrengthSectionProps) => {
  const { user } = useAuth();
  const { workouts, bodyMetrics } = useFitness(user?.id);

  const monthWorkouts = workouts.filter((w: { performed_at: string }) => {
    const d = new Date(w.performed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const weightMetrics = bodyMetrics.filter((m: { metric_type: string }) => m.metric_type === "weight");
  const latestWeight = weightMetrics[0];
  const prevWeight = weightMetrics[1];
  const weightDisplay = user && prevWeight && latestWeight
    ? `${prevWeight.value}→${latestWeight.value}kg`
    : user && latestWeight
      ? `${latestWeight.value}kg`
      : "—";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayWorkouts = workouts.filter((w: { performed_at: string }) => {
    const d = new Date(w.performed_at);
    return d >= todayStart && d <= todayEnd;
  });
  const activeTodayMin = todayWorkouts.reduce((sum: number, w: { duration_minutes?: number }) => sum + (w.duration_minutes ?? 0), 0);
  const activeDisplay = user && activeTodayMin > 0
    ? `${activeTodayMin} min`
    : "—";
  const recentWorkouts = workouts
    .slice(0, 6)
    .map((workout: { exercise_name?: string; duration_minutes?: number; performed_at?: string }) => ({
      name: workout.exercise_name?.trim() || "Workout session",
      duration: workout.duration_minutes,
      performedAt: workout.performed_at,
    }));
  const latestWorkout = recentWorkouts[0] ?? null;

  const progressStats = [
    { value: user ? String(monthWorkouts) : "—", label: "WORKOUTS" },
    { value: weightDisplay, label: "WEIGHT" },
    { value: latestWorkout?.name ?? "—", label: "LATEST SESSION" },
    { value: activeDisplay, label: "ACTIVE TODAY" },
  ];

  return (
  <section className="bg-background pt-8 pb-16 lg:pb-20">
    {/* Hero banner */}
   <div className="relative w-full min-w-0 h-[400px] lg:h-[480px]"> 
    <img src={workoutImg} alt="Dad Strength Workout" 
    className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 flex flex-col justify-end h-full max-w-[1400px] mx-auto px-5 lg:px-8 pb-8">
        <span className="section-label text-primary mb-1">TODAY'S WORKOUT</span>
        <h2 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide">
          {latestWorkout?.name ?? "TODAY'S WORKOUT"}
        </h2>
        <p className="text-sm text-foreground/50 mt-2">
          {latestWorkout?.duration ? `${latestWorkout.duration} min` : "Log a workout to track duration"}
          {latestWorkout?.performedAt ? ` · Last logged ${latestWorkout.performedAt.slice(0, 10)}` : ""}
        </p>
      </div>
    </div>

    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Timer + Exercises */}
      <div className="px-5 lg:px-8 py-8">
        {/* Timer */}
        <div className="mb-6">
          <div className="font-heading text-[52px] font-extrabold text-foreground leading-none tracking-wide">00:00</div>
          <div className="font-heading text-[10px] font-bold tracking-wider uppercase text-muted-foreground mt-1">
            WORKOUT TIMER · {Math.max(recentWorkouts.length, 1)} SESSIONS
          </div>
          <div className="flex gap-3 mt-4">
            <Link href="/fitness">
              <LimeButton small>START →</LimeButton>
            </Link>
            <Link href="/fitness">
              <button className="bg-transparent text-foreground border border-foreground py-2 px-3.5 font-heading font-bold text-[11px] tracking-wider uppercase cursor-pointer hover:border-primary hover:text-primary transition-colors">
                NEXT EXERCISE
              </button>
            </Link>
          </div>
        </div>

        {/* Exercise list */}
        <span className="section-label !p-0 mb-4 block">RECENT SESSIONS</span>
        {recentWorkouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workout sessions logged yet.</p>
        ) : (
          recentWorkouts.map((workout, i) => (
            <div key={`${workout.name}-${workout.performedAt ?? i}`} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
              <div className="w-7 h-7 bg-primary/10 flex items-center justify-center font-heading font-extrabold text-xs text-primary shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold text-foreground tracking-wide">{workout.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {workout.duration != null ? `${workout.duration} min` : "Duration not set"}
                  {workout.performedAt ? ` · ${workout.performedAt.slice(0, 10)}` : ""}
                </div>
              </div>
              <span className="tag-pill">SESSION</span>
            </div>
          ))
        )}
      </div>

      {/* Progress */}
      <div className="px-5 lg:px-8 py-8 border-l border-border">
        <span className="section-label !p-0 mb-4 block">PROGRESS THIS MONTH</span>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {progressStats.map((stat) => (
            <div key={stat.label} className="card-dark p-3.5">
              <div className="font-heading text-xl font-extrabold text-primary leading-none">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
        <Link href="/fitness">
          <LimeButton>VIEW FULL FITNESS →</LimeButton>
        </Link>
      </div>
    </div>
  </section>
  );
};

export default DadStrengthSection;