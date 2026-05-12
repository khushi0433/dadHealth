"use client";

import { useState } from "react";
import { Bookmark, CheckCircle2, Clock, Users, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type CookTogetherRecipe,
  type RecipeDifficulty,
  useCookTogetherRecipes,
} from "@/hooks/useCookTogetherRecipes";

const filterButtonClass =
  "px-3 py-1.5 border font-heading text-[11px] font-bold tracking-wide uppercase cursor-pointer transition-all";

type CookTogetherRecipesProps = {
  className?: string;
};

export default function CookTogetherRecipes({ className = "" }: CookTogetherRecipesProps) {
  const { user, openAuthModal } = useAuth();
  const {
    recipes,
    savedIds,
    completedIds,
    bondScore,
    filters,
    error,
    isLoading,
    setFilters,
    toggleSaved,
    completeRecipe,
  } = useCookTogetherRecipes(user?.id);
  const [activeRecipe, setActiveRecipe] = useState<CookTogetherRecipe | null>(null);

  const requireAuth = (callback: () => void) => {
    if (!user) {
      openAuthModal();
      return;
    }

    callback();
  };

  const setDifficulty = (difficulty: "all" | RecipeDifficulty) => {
    setFilters((current) => ({ ...current, difficulty }));
  };

  const toggleChildAge = (childAge: number) => {
    setFilters((current) => ({
      ...current,
      childAge: current.childAge === childAge ? "all" : childAge,
    }));
  };

  const toggleMaxMins = (maxMins: number) => {
    setFilters((current) => ({
      ...current,
      maxMins: current.maxMins === maxMins ? "all" : maxMins,
    }));
  };

  return (
    <section className={`py-8 border-t border-border w-full ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
        <div>
          <span className="section-label !p-0 mb-3 block">COOK TOGETHER RECIPES</span>
          <h2 className="font-heading text-2xl lg:text-3xl font-extrabold text-foreground uppercase tracking-wide">
          Meals That Matter
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Kid-friendly recipes that build connection and log active minutes when completed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && bondScore !== null ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                Bond score
              </span>
              <span className="font-heading text-lg font-extrabold text-primary leading-none">
                {bondScore}
              </span>
            </div>
          ) : (
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              +20 pts per recipe
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "easy", "medium"] as const).map((difficulty) => (
          <button
            key={difficulty}
            type="button"
            onClick={() => setDifficulty(difficulty)}
            className={`${filterButtonClass} ${
              filters.difficulty === difficulty
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {difficulty === "all" ? "All difficulty" : difficulty}
          </button>
        ))}

        {/* Age filters removed per UX request (show only difficulty + prep minutes) */}
        {/* {[3, 5, 8].map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => toggleChildAge(age)}
            className={`${filterButtonClass} ${
              filters.childAge === age
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            Age {age}+
          </button>
        ))} */}

        {[15, 30, 45].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => toggleMaxMins(mins)}
            className={`${filterButtonClass} ${
              filters.maxMins === mins
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            Under {mins} min
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading cook together recipes...</p>
      ) : error ? (
        <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Cook Together recipes are unavailable.
        </div>
      ) : recipes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No recipes match those filters yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const isSaved = savedIds.has(recipe.id);
            const isCompleted = completedIds.has(recipe.id);

            return (
              <article
                key={recipe.id}
                className={`overflow-hidden rounded-3xl border bg-card transition-all ${
                  isCompleted
                    ? "border-primary/40 bg-primary/[0.03]"
                    : "border-border hover:border-primary/70"
                }`}
              >
                {recipe.image_url ? (
                  <div className="relative">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="h-44 w-full object-cover"
                    />
                    {isCompleted && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`h-28 border-b border-border flex items-center justify-center ${isCompleted ? "bg-primary/10" : "bg-primary/[0.06]"}`}>
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-[0.32em]">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </div>
                    ) : (
                      <span className="font-heading text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
                        Cook Together
                      </span>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-heading text-lg font-extrabold text-foreground uppercase leading-tight">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {recipe.description ?? "A simple recipe to cook with your kids."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => requireAuth(() => toggleSaved.mutate(recipe.id))}
                      disabled={toggleSaved.isPending}
                      className={`shrink-0 rounded-full border p-2 transition-colors disabled:opacity-60 ${
                        isSaved
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                      aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
                    >
                      <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex gap-2 flex-wrap mt-4 text-[11px] font-bold uppercase text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {recipe.prep_mins} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Age {recipe.age_min}+
                    </span>
                    <span className="text-primary">{recipe.difficulty}</span>
                    {isSaved && <span className="text-primary">Saved</span>}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRecipe(recipe)}
                    className={`mt-4 w-full rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                      isCompleted
                        ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                        : "bg-primary text-primary-foreground hover:brightness-110"
                    }`}
                  >
                    {isCompleted ? "Cook Again" : "Start Recipe"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeRecipe ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="section-label !p-0 mb-3 block">STEP-BY-STEP</span>
                <h3 className="font-heading text-3xl font-extrabold uppercase leading-tight text-foreground">
                  {activeRecipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {activeRecipe.prep_mins} minutes · age {activeRecipe.age_min}+ · {activeRecipe.difficulty}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRecipe(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
                aria-label="Close recipe"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[240px_1fr]">
              <div>
                <h4 className="font-heading text-sm font-extrabold uppercase tracking-wide text-foreground">
                  Ingredients
                </h4>
                {activeRecipe.ingredients.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {activeRecipe.ingredients.map((ingredient) => (
                      <li key={ingredient} className="border-b border-border pb-2 last:border-b-0">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Ingredients coming soon.</p>
                )}
              </div>

              <div className="space-y-3">
                {activeRecipe.steps.length > 0 ? (
                  activeRecipe.steps.map((step, index) => (
                    <div key={`${step.title ?? step.instruction}-${index}`} className="rounded-3xl border border-border p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
                        Step {index + 1}
                      </div>
                      {step.title ? (
                        <h4 className="mt-1 font-heading text-base font-extrabold uppercase text-foreground">
                          {step.title}
                        </h4>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.instruction}
                      </p>
                      {step.kid_instruction ? (
                        <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm text-foreground">
                          <span className="font-bold text-primary">Kid job: </span>
                          {step.kid_instruction}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="rounded-3xl border border-border p-4 text-sm text-muted-foreground">
                    Steps coming soon.
                  </p>
                )}
              </div>
            </div>

            {completedIds.has(activeRecipe.id) ? (
              <div className="mt-6 w-full rounded-full bg-primary/10 border border-primary/30 px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed — Cook Again Any Time
              </div>
            ) : (
              <button
                type="button"
                disabled={completeRecipe.isPending}
                onClick={() =>
                  requireAuth(() =>
                    completeRecipe.mutate(activeRecipe, {
                      onSuccess: () => setActiveRecipe(null),
                    })
                  )
                }
                className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                {completeRecipe.isPending ? "Logging..." : "Mark Complete"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
