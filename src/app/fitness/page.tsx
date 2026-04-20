"use client";

import { useState, useEffect } from "react";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import PromptModal from "@/components/PromptModal";
import { ProGate, useProStatus } from "@/components/ProProvider";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/contexts/AuthContext";
import { useFitness } from "@/hooks/useFitness";
import { DAD_STRENGTH_MOVES } from "@/lib/dadStrengthProgram";
import { trackEvent } from "@/lib/analytics";

const timerGhostBtn =
  "bg-transparent border py-2.5 px-4 font-heading font-bold text-xs tracking-wider uppercase transition-colors";
const timerGhostBtnMuted = `${timerGhostBtn} text-foreground/40 border-foreground/25`;
const timerGhostBtnActive = `${timerGhostBtn} text-foreground border-foreground/25 hover:border-primary hover:text-primary cursor-pointer`;
const DEFAULT_WEEKLY_MEAL_PLAN = [
  { day: "MON", name: "Chicken & rice bowl", kcal: 520 },
  { day: "TUE", name: "Eggs & avocado toast", kcal: 380 },
  { day: "WED", name: "Salmon stir fry", kcal: 480 },
  { day: "THU", name: "Turkey mince pasta", kcal: 560 },
  { day: "FRI", name: "Dad's chilli", kcal: 490 },
];

const FitnessPage = () => {
  const { user, openAuthModal } = useAuth();
  const { isPro, showPaywall } = useProStatus();
  const { workouts, bodyMetrics, mealPlans, loading: mealsLoading, saveWorkout, saveMealPlans } = useFitness(user?.id);

  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [saveMealPlanPrompt, setSaveMealPlanPrompt] = useState<{
    title: string;
    message: string;
  } | null>(null);

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

  const bestRunMetric = bodyMetrics.find(
    (m: { metric_type: string }) => m.metric_type === "best_run_km" || m.metric_type === "best_run",
  );
  const bestRunDisplay =
    user &&
    bestRunMetric != null &&
    typeof bestRunMetric.value === "number" &&
    Number.isFinite(bestRunMetric.value)
      ? `${Number.isInteger(bestRunMetric.value) ? bestRunMetric.value : Number(bestRunMetric.value).toFixed(1)}km`
      : "—";

  const progressStats = [
    { value: user ? String(monthWorkouts) : "—", label: "WORKOUTS" },
    {
      value: user && prevWeight && latestWeight ? `${prevWeight.value}→${latestWeight.value}kg` : "—",
      label: "WEIGHT",
    },
    { value: bestRunDisplay, label: "BEST RUN" },
    { value: timerSec > 0 ? formatTime(timerSec) : "0 min", label: "ACTIVE TODAY" },
  ];

  const meals = mealPlans;
  const todaysMoves = DAD_STRENGTH_MOVES;
  const latestLogged = workouts[0];
  const currentMove = todaysMoves[currentExerciseIdx] ?? todaysMoves[0];

  const handleSaveMealPlan = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    const mealsToSave = meals.length > 0 ? meals : DEFAULT_WEEKLY_MEAL_PLAN;
    saveMealPlans.mutate(mealsToSave, {
      onSuccess: () => {
        setSaveMealPlanPrompt({
          title: "MEAL PLANNER SAVED",
          message: "Your meal planner has been saved to your account.",
        });
      },
      onError: (error) => {
        setSaveMealPlanPrompt({
          title: "SAVE FAILED",
          message:
            error instanceof Error
              ? error.message
              : "We could not save your meal planner. Please try again.",
        });
      },
    });
  };

  const handleCompleteWorkout = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    const totalMin = Math.max(1, Math.ceil(timerSec / 60));
    trackEvent("workout_completed", {
      workout_name: currentMove?.title ?? "Dad Strength",
      duration_minutes: totalMin,
      workout_type: currentMove?.tag ?? "DAD_STRENGTH",
      exercise_index: currentExerciseIdx + 1,
    });
    saveWorkout.mutate({
      exercise_name: currentMove?.title ?? "Dad Strength",
      duration_minutes: totalMin,
      calories: undefined,
    });
  };

  const canUseNextExercise = Boolean(user && isPro);

  const handleNextExercise = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!isPro) {
      showPaywall("Step-by-step exercises");
      return;
    }
    if (todaysMoves.length === 0) return;
    setCurrentExerciseIdx((i) => {
      const nextIdx = (i + 1) % todaysMoves.length;
      const nextMove = todaysMoves[nextIdx];
      trackEvent("exercise_progressed", {
        exercise_name: nextMove?.title,
        exercise_index: nextIdx + 1,
      });
      return nextIdx;
    });
  };

  const handleToggleTimer = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!timerRunning) {
      trackEvent("workout_started", {
        workout_name: currentMove?.title ?? "Dad Strength",
        workout_type: currentMove?.tag ?? "DAD_STRENGTH",
        planned_moves: todaysMoves.length,
      });
    }
    setTimerRunning((running) => !running);
  };

  return (
    <SitePageShell>
      {/* Hero */}
      <section className="relative w-full min-w-0 h-[320px] lg:h-[400px]">
        <img src={IMAGES.workout} alt="Workout" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 flex flex-col justify-end h-full max-w-[1400px] mx-auto px-5 lg:px-8 pb-8">
          <span className="section-label text-primary mb-1">TODAY'S WORKOUT</span>
          <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold text-foreground uppercase leading-none tracking-wide">
            FITNESS AND NUTRITION
          </h1>
          <p className="text-sm text-foreground/50 mt-2">
            {todaysMoves.length} moves · workout + meal planner hub
            {latestLogged?.performed_at
              ? ` · Last logged ${latestLogged.performed_at.slice(0, 10)}`
              : ""}
          </p>
        </div>
      </section>

      {/* Timer */}
      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-6 flex items-center gap-6">
          <div className="flex-1">
            <div className="font-heading text-[52px] font-extrabold text-foreground leading-none tracking-wide">{formatTime(timerSec)}</div>
            <div className="font-heading text-[10px] font-bold tracking-wider uppercase text-muted-foreground mt-1">
              WORKOUT TIMER · {todaysMoves.length} MOVES
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <LimeButton small onClick={handleToggleTimer}>
              {timerRunning ? "PAUSE" : "START"} →
            </LimeButton>
            <button
              type="button"
              onClick={handleNextExercise}
              title={
                canUseNextExercise
                  ? "Go to the next move in today's list"
                  : !user
                    ? "Sign in to use step-by-step"
                    : "Upgrade to Pro for step-by-step"
              }
              className={
                canUseNextExercise
                  ? timerGhostBtnActive
                  : `${timerGhostBtnMuted} cursor-pointer hover:border-foreground/40`
              }
            >
              NEXT EXERCISE
            </button>
            <button
              type="button"
              onClick={handleCompleteWorkout}
              disabled={!user || saveWorkout.isPending}
              className={
                !user || saveWorkout.isPending
                  ? `${timerGhostBtnMuted} cursor-not-allowed`
                  : timerGhostBtnActive
              }
            >
              {saveWorkout.isPending ? "..." : "LOG SESSION →"}
            </button>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="w-full px-0">
        <div className="bg-card overflow-hidden w-full">
          <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-0">
            {/* Exercise list */}
            <div className="p-5 lg:p-8 min-w-0">
              <span className="section-label !p-0 mb-4 block">TODAY'S MOVES</span>
              {todaysMoves.map((move, i) => (
                <div
                  key={`${move.title}-${i}`}
                  className={`flex items-center gap-3 py-3 border-b border-border last:border-b-0 rounded-sm transition-colors ${
                    canUseNextExercise && currentExerciseIdx === i
                      ? "bg-primary/[0.08] ring-1 ring-primary/25 -mx-1 px-1"
                      : ""
                  }`}
                >
                  <div className="w-7 h-7 bg-primary/10 flex items-center justify-center font-heading font-extrabold text-xs text-primary shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading text-sm font-bold text-foreground tracking-wide">{move.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{move.detail}</div>
                  </div>
                  <span className="tag-pill shrink-0">{move.tag}</span>
                </div>
              ))}
            </div>

            {/* Vertical divider */}
            <div className="hidden lg:block w-px bg-border rounded-full self-stretch shrink-0 min-h-[200px]" />

            {/* Right side */}
            <div className="p-5 lg:p-8 min-w-0">
              {/* Progress */}
              <span className="section-label !p-0 mb-4 block">PROGRESS THIS MONTH</span>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {progressStats.map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-lg p-3.5">
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
              {meals.length > 0 ? meals.map((meal: { day: string; name: string; kcal: number }, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-2.5 border-b border-primary-foreground/10 last:border-b-0"
                >
                  <span className="font-heading text-[10px] font-bold tracking-wider uppercase opacity-60 w-8">{meal.day}</span>
                  <span className="font-heading text-[13px] font-extrabold flex-1">{meal.name}</span>
                  <span className="text-xs opacity-60">{meal.kcal} kcal</span>
                </div>
              )) : (
                <p className="text-sm opacity-60">No meal plan saved yet.</p>
              )}
              <button
                onClick={handleSaveMealPlan}
                disabled={saveMealPlans.isPending || mealsLoading}
                className="mt-4 bg-primary-foreground text-primary font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 border-none cursor-pointer transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.35)] active:scale-[0.97] disabled:opacity-50 disabled:hover:brightness-100 disabled:hover:shadow-none disabled:active:scale-100"
              >
                {saveMealPlans.isPending ? "SAVING..." : "SAVE MEAL PLAN →"}
              </button>
            </div>
          </ProGate>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
      {saveMealPlanPrompt && (
        <PromptModal
          title={saveMealPlanPrompt.title}
          message={saveMealPlanPrompt.message}
          onClose={() => setSaveMealPlanPrompt(null)}
        />
      )}
    </SitePageShell>
  );
};

export default FitnessPage;
