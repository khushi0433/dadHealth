"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LimeButton from "@/components/LimeButton";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserProfile";

const GOAL_OPTIONS = [
  "5-min breathing reset",
  "20-min dad run",
  "Bedtime story",
  "Evening journal",
  "Mood check-in",
  "Screen-free hour",
];

const PILLARS = ["FITNESS", "MIND", "BOND", "NUTRITION"];

export default function OnboardingModal({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
}) {
  const { data: profile } = useUserProfile(userId);
  const updateProfile = useUpdateProfile(userId);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? []);
  const [pillarOrder, setPillarOrder] = useState<string[]>(
    (profile?.pillar_order as string[]) ?? [...PILLARS]
  );

  const toggleGoal = (g: string) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleComplete = async () => {
    await updateProfile.mutateAsync({
      goals,
      pillar_order: pillarOrder,
      onboarding_complete: true,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold uppercase tracking-wide">
            {step === 1 ? "PICK YOUR GOALS" : "PRIORITISE YOUR PILLARS"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose your goals and pillar order to personalise Dad Health.
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">Select what matters most to you.</p>
            {GOAL_OPTIONS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => toggleGoal(g)}
                className={`w-full text-left px-4 py-3 border font-heading text-sm font-bold tracking-wide transition-colors ${
                  goals.includes(g)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {g}
              </button>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <LimeButton full type="button" onClick={() => setStep(2)}>
                NEXT →
              </LimeButton>
              <button
                type="button"
                onClick={onClose}
                className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2"
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">Drag to reorder (1 = highest priority).</p>
            {pillarOrder.map((p, i) => (
              <div
                key={p}
                className="flex items-center gap-3 px-4 py-2 border border-border"
              >
                <span className="font-heading text-xs font-bold text-muted-foreground w-6">
                  {i + 1}
                </span>
                <span className="font-heading text-sm font-bold">{p}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 font-heading text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer"
                >
                  BACK
                </button>
                <LimeButton full type="button" onClick={handleComplete} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "..." : "COMPLETE"}
                </LimeButton>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
