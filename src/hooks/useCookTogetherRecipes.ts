"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/utils/supabaseClient";

export type RecipeDifficulty = "easy" | "medium";

export type RecipeStep = {
  title?: string;
  instruction: string;
  kid_instruction?: string;
};

export type CookTogetherRecipe = {
  id: string;
  title: string;
  description: string | null;
  difficulty: RecipeDifficulty;
  age_min: number;
  prep_mins: number;
  ingredients: string[];
  steps: RecipeStep[];
  cook_together: boolean;
  image_url: string | null;
};

type RecipeFilters = {
  difficulty: "all" | RecipeDifficulty;
  childAge: "all" | number;
  maxMins: "all" | number;
};

type SavedRecipeRow = {
  recipe_id: string;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const normalizeSteps = (value: unknown): RecipeStep[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((step) => {
      if (typeof step === "string") {
        return { instruction: step };
      }

      if (!step || typeof step !== "object") {
        return null;
      }

      const row = step as Record<string, unknown>;
      const instruction = typeof row.instruction === "string" ? row.instruction : "";

      if (!instruction) {
        return null;
      }

      return {
        title: typeof row.title === "string" ? row.title : undefined,
        instruction,
        kid_instruction: typeof row.kid_instruction === "string" ? row.kid_instruction : undefined,
      };
    })
    .filter((step): step is RecipeStep => Boolean(step));
};

const normalizeRecipe = (row: Record<string, unknown>): CookTogetherRecipe => ({
  id: String(row.id),
  title: String(row.title ?? "Untitled recipe"),
  description: typeof row.description === "string" ? row.description : null,
  difficulty: row.difficulty === "medium" ? "medium" : "easy",
  age_min: Number(row.age_min ?? 0),
  prep_mins: Number(row.prep_mins ?? 0),
  ingredients: normalizeStringArray(row.ingredients),
  steps: normalizeSteps(row.steps),
  cook_together: row.cook_together !== false,
  image_url: typeof row.image_url === "string" ? row.image_url : null,
});

export function useCookTogetherRecipes(userId?: string) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<RecipeFilters>({
    difficulty: "all",
    childAge: "all",
    maxMins: "all",
  });

  const { data, error, isLoading } = useQuery({
    queryKey: ["cook-together-recipes", userId],
    queryFn: async () => {
      const recipesQuery = supabase
        .from("recipes")
        .select("*")
        .eq("cook_together", true)
        .order("prep_mins", { ascending: true });

      const savedQuery = userId
        ? supabase.from("user_saved_recipes").select("recipe_id").eq("user_id", userId)
        : Promise.resolve({ data: [] as SavedRecipeRow[], error: null });

      const [recipesRes, savedRes] = await Promise.all([recipesQuery, savedQuery]);

      if (recipesRes.error) throw recipesRes.error;
      if (savedRes.error) throw savedRes.error;

      return {
        recipes: ((recipesRes.data ?? []) as Record<string, unknown>[]).map(normalizeRecipe),
        savedIds: new Set((savedRes.data ?? []).map((row) => row.recipe_id)),
      };
    },
  });

  const recipes = useMemo(() => {
    return (data?.recipes ?? []).filter((recipe) => {
      if (filters.difficulty !== "all" && recipe.difficulty !== filters.difficulty) {
        return false;
      }

      if (filters.childAge !== "all" && recipe.age_min > filters.childAge) {
        return false;
      }

      if (filters.maxMins !== "all" && recipe.prep_mins > filters.maxMins) {
        return false;
      }

      return true;
    });
  }, [data?.recipes, filters]);

  const toggleSaved = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!userId) throw new Error("Not authenticated");

      if (data?.savedIds.has(recipeId)) {
        const { error } = await supabase
          .from("user_saved_recipes")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId);

        if (error) throw error;
        trackEvent("cook_together_recipe_unsaved", { recipe_id: recipeId });
        return;
      }

      const { error } = await supabase
        .from("user_saved_recipes")
        .insert({ user_id: userId, recipe_id: recipeId });

      if (error) throw error;
      trackEvent("cook_together_recipe_saved", { recipe_id: recipeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cook-together-recipes", userId] });
    },
    onError: () => {
      toast.error("Could not update saved recipe");
    },
  });

  const completeRecipe = useMutation({
    mutationFn: async (recipe: CookTogetherRecipe) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("complete_cook_together_recipe", {
        p_recipe_id: recipe.id,
      });

      if (error) throw error;

      trackEvent("cook_together_recipe_completed", {
        recipe_id: recipe.id,
        difficulty: recipe.difficulty,
        prep_mins: recipe.prep_mins,
      });
    },
    onSuccess: () => {
      toast.success("Recipe complete. Bond points and active minutes logged.");
      queryClient.invalidateQueries({ queryKey: ["cook-together-recipes", userId] });
      queryClient.invalidateQueries({ queryKey: ["bond", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["fitness", userId] });
      queryClient.invalidateQueries({ queryKey: ["progress", userId] });
    },
    onError: () => {
      toast.error("Could not complete recipe");
    },
  });

  return {
    recipes,
    savedIds: data?.savedIds ?? new Set<string>(),
    filters,
    error,
    isLoading,
    setFilters,
    toggleSaved,
    completeRecipe,
  };
}
