import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { ProGate } from "@/components/ProProvider";
import { EXERCISES, MEALS, PROGRESS_STATS } from "@/lib/constants";
import workoutImg from "@/assets/workout.jpg";

const FitnessPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[320px] lg:h-[400px]">
        <img src={workoutImg} alt="Workout" className="absolute inset-0 w-full h-full object-cover" />
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
            <div className="font-heading text-[52px] font-extrabold text-foreground leading-none tracking-wide">00:00</div>
            <div className="font-heading text-[10px] font-bold tracking-wider uppercase text-muted-foreground mt-1">
              WORKOUT TIMER · 6 EXERCISES
            </div>
          </div>
          <div className="flex gap-3">
            <LimeButton small>START →</LimeButton>
            <button className="bg-transparent text-foreground border border-foreground py-2.5 px-4 font-heading font-bold text-xs tracking-wider uppercase cursor-pointer hover:border-primary hover:text-primary transition-colors">
              NEXT EXERCISE
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
            {PROGRESS_STATS.map((stat) => (
              <div key={stat.label} className="card-dark p-3.5">
                <div className="font-heading text-xl font-extrabold text-primary leading-none">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Meals - Pro gated */}
          <span className="section-label !p-0 mb-4 block">THIS WEEK'S MEALS</span>
          <ProGate featureName="Meal planner" lockMessage="The hardest part of eating well is deciding what to eat. We've done that for you.">
            <div className="bg-primary text-primary-foreground p-5">
              <h3 className="font-heading text-lg font-extrabold uppercase mb-4">MEAL PLANNER</h3>
              {MEALS.map((meal, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 border-b border-primary-foreground/10 last:border-b-0">
                  <span className="font-heading text-[10px] font-bold tracking-wider uppercase opacity-60 w-8">{meal.day}</span>
                  <span className="font-heading text-[13px] font-extrabold flex-1">{meal.name}</span>
                  <span className="text-xs opacity-60">{meal.kcal} kcal</span>
                </div>
              ))}
              <button className="mt-4 bg-primary-foreground text-primary font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity">
                GENERATE GROCERY LIST →
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
