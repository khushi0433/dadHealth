import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness",
  description: "Dad Strength workouts, meal planner, progress tracking.",
};

export default function FitnessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
