"use client";

import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { ProGate } from "@/components/ProProvider";
import { EXERCISES, MEALS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutSessions, useSaveWorkout } from "@/hooks/useWorkouts";
import { useBodyMetrics, useSaveBodyMetric } from "@/hooks/useBodyMetrics";
import { useMealPlans, useSaveMealPlans } from "@/hooks/useMealPlans";

const FITNESS_DURATION = 22 * 60;

const FitnessPage = () => {
  const { user } = useAuth();
  const { data: workouts = [] } = useWorkoutSessions(user?.id);
  const saveWorkout = useSaveWorkout(user?.id);
  const { data: bodyMetrics = [] } = useBodyMetrics(user?.id);
  const saveBodyMetric = useSaveBodyMetric(user?.id);
  const { data: mealPlans = [], isLoading: mealsLoading } = useMealPlans(user?.id);
  const saveMealPlans = useSaveMealPlans(user?.id);

  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentEx, setCurrentEx] = useState(0);

  useEffect(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("dadHealth_workout_timer") : null;
    if (stored) {
      const { sec, date } = JSON.parse(stored);
      if (date === new Date().toISOString().slice(0, 10)) setTimerSec(sec);
    }
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSec((s) => {
        const next = s + 1;
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("dadHealth_workout_timer", JSON.stringify({
            sec: next,
            date: new Date().toISOString().slice(0, 10),
          }));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const monthWorkouts = workouts.filter((w: { performed_at: string }) => {
    const d = new Date(w.performed_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const weightMetrics = bodyMetrics.filter((m: { metric_type: string }) => m.metric_type === "weight");
  const latestWeight = weightMetrics[0];
  const prevWeight = weightMetrics[1];

  const progressStats = [
    { value: String(monthWorkouts), label: "WORKOUTS" },
    {
      value: prevWeight && latestWeight ? `${prevWeight.value}→${latestWeight.value}kg` : "—",
      label: "WEIGHT",
    },
    { value: "7.2km", label: "BEST RUN" },
    { value: timerSec > 0 ? formatTime(timerSec) : "0 min", label: "ACTIVE TODAY" },
  ];

  const meals = mealPlans.length > 0
    ? mealPlans
    : MEALS.map((m) => ({ day: m.day, name: m.name, kcal: m.kcal }));

  const handleCompleteWorkout = () => {
    const totalMin = Math.ceil(timerSec / 60) || 22;
    saveWorkout.mutate({
      exercise_name: "Dad Strength",
      duration_minutes: totalMin,
      calories: 280,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[320px] lg:h-[400px]">
        <img src={IMAGES.workout} alt="Workout" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1400px] mx-auto px-5 lg:px-8 pb-8">
          <span className="section-label text-primary mb-1">TODAY'S WORKOUT</span>
          <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide">
            DAD STRENGTH
          </h1>
          <p className="text-sm text-foreground/50 mt-2">No gym needed · 22 minutes · 6 exercises · 280 kcal</p>
        </div>
      </section>

      {/* Timer */}
      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6 flex items-center gap-6">
          <div className="flex-1">
            <div className="font-heading text-[52px] font-extrabold text-foreground leading-none tracking-wide">{formatTime(timerSec)}</div>
            <div className="font-heading text-[10px] font-bold tracking-wider uppercase text-muted-foreground mt-1">
              WORKOUT TIMER · 6 EXERCISES
            </div>
          </div>
          <div className="flex gap-3">
            <LimeButton small onClick={() => setTimerRunning(!timerRunning)}>
              {timerRunning ? "PAUSE" : "START"} →
            </LimeButton>
            <button
              onClick={() => {
                if (currentEx < EXERCISES.length - 1) setCurrentEx((c) => c + 1);
                else handleCompleteWorkout();
              }}
              className="bg-transparent text-foreground border border-foreground py-2.5 px-4 font-heading font-bold text-xs tracking-wider uppercase cursor-pointer hover:border-primary hover:text-primary transition-colors"
            >
              {currentEx >= EXERCISES.length - 1 ? "COMPLETE" : "NEXT EXERCISE"}
            </button>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Exercise list */}
        <div className="px-5 lg:px-8 py-8">
          <span className="section-label !p-0 mb-4 block">TODAY'S MOVES</span>
          {EXERCISES.map((ex, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
              <div className="w-7 h-7 bg-primary/10 flex items-center justify-center font-heading font-extrabold text-xs text-primary shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-heading text-sm font-bold text-foreground tracking-wide">{ex.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{ex.sets} · {ex.detail}</div>
              </div>
              <span className="tag-pill">{ex.muscle}</span>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="px-5 lg:px-8 py-8 border-l border-border">
          {/* Progress */}
          <span className="section-label !p-0 mb-4 block">PROGRESS THIS MONTH</span>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {progressStats.map((stat) => (
              <div key={stat.label} className="card-dark p-3.5">
                <div className="font-heading text-xl font-extrabold text-primary leading-none">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Meals - Pro gated */}
          <span className="section-label !p-0 mb-4 block">THIS WEEK'S MEALS</span>
          <ProGate
            featureName="Meal planner"
            lockMessage="The hardest part of eating well is deciding what to eat. We've done that for you."
          >
            <div className="bg-primary text-primary-foreground p-5">
              <h3 className="font-heading text-lg font-extrabold uppercase mb-4">MEAL PLANNER</h3>
              {meals.map((meal: { day: string; name: string; kcal: number }, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-2.5 border-b border-primary-foreground/10 last:border-b-0"
                >
                  <span className="font-heading text-[10px] font-bold tracking-wider uppercase opacity-60 w-8">{meal.day}</span>
                  <span className="font-heading text-[13px] font-extrabold flex-1">{meal.name}</span>
                  <span className="text-xs opacity-60">{meal.kcal} kcal</span>
                </div>
              ))}
              <button
                onClick={() => saveMealPlans.mutate(meals)}
                disabled={!user || saveMealPlans.isPending || mealsLoading}
                className="mt-4 bg-primary-foreground text-primary font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                SAVE MEAL PLAN →
              </button>
            </div>
          </ProGate>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default FitnessPage;

