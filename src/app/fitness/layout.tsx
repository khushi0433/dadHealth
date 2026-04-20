import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness and nutrition",
  description: "Dad Strength workouts, nutrition articles, meal planner, progress tracking.",
};

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
