"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold uppercase tracking-wide">
            {step === 1 ? "PICK YOUR GOALS" : "PRIORITISE YOUR PILLARS"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">Select what matters most to you.</p>
            {GOAL_OPTIONS.map((g) => (
              <button
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
            <LimeButton full onClick={() => setStep(2)} className="mt-4">
              NEXT →
            </LimeButton>
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
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 font-heading text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground"
              >
                BACK
              </button>
              <LimeButton full onClick={handleComplete} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "..." : "COMPLETE"}
              </LimeButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
