/** Default "Dad Strength" session: structured moves (sets/reps/duration + body area). */
export type DadStrengthMove = {
  title: string;
  /** e.g. "3 sets · 45 sec" */
  detail: string;
  /** Short label for the tag pill (Chest, Legs, …) */
  tag: string;
};

export const DAD_STRENGTH_MOVES: DadStrengthMove[] = [
  { title: "Press-up hold", detail: "3 sets · 45 sec", tag: "Chest" },
  { title: "Goblet squat", detail: "3 sets · 12 reps", tag: "Legs" },
  { title: "Dead bug", detail: "2 sets · 10 reps", tag: "Core" },
  { title: "Hip hinge", detail: "3 sets · 15 reps", tag: "Back" },
  { title: "Press-up", detail: "3 sets · 10 reps", tag: "Chest" },
  { title: "Plank", detail: "3 sets · 45 sec", tag: "Core" },
];
