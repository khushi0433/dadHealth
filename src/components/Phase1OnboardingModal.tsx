"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import LimeButton from "@/components/LimeButton";
import { useUpdateProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import type { UserProfileRow } from "@/hooks/useUserProfile";

// Values per onboarding spec § 5 (Phase 1).
const PARENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "dad", label: "Dad" },
  { value: "stepdad", label: "Stepdad" },
  { value: "granddad", label: "Granddad" },
  { value: "co_parent", label: "Co-parent" },
  { value: "same_sex_parent", label: "Same-sex parent" },
  { value: "non_binary_parent", label: "Non-binary parent" },
  { value: "other", label: "Other" },
];

const PRONOUN_OPTIONS: { value: string; label: string }[] = [
  { value: "he_him", label: "He / Him" },
  { value: "she_her", label: "She / Her" },
  { value: "they_them", label: "They / Them" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const CUSTODY_OPTIONS: { value: string; label: string; hint?: string }[] = [
  { value: "daily", label: "Every day", hint: "I live with my kids full-time" },
  { value: "most_days", label: "Most days" },
  { value: "alternate_weeks", label: "Alternate weeks" },
  { value: "occasional", label: "Occasionally", hint: "Weekends or specific days" },
  { value: "flexible", label: "Flexible / it varies" },
];

const KIDS_AGES_OPTIONS: { value: string; label: string }[] = [
  { value: "toddler_0_4", label: "Toddler (0–4)" },
  { value: "primary_5_11", label: "Primary (5–11)" },
  { value: "teen_12_plus", label: "Teen (12+)" },
  { value: "adult_18_plus", label: "Adult (18+)" },
];

const TOTAL_STEPS = 5;

type Props = {
  open: boolean;
  userId: string;
  profile: UserProfileRow | null | undefined;
};

export default function Phase1OnboardingModal({ open, userId, profile }: Props) {
  const updateProfile = useUpdateProfile(userId);

  // Resume from wherever the dad left off — first unanswered required question.
  const initialStep = useMemo(() => computeInitialStep(profile), [profile]);
  const [step, setStep] = useState(initialStep);

  // Local working copies. Each one is hydrated from the profile so the dad can
  // see what he already entered if he comes back.
  const [displayName, setDisplayName] = useState<string>(profile?.display_name ?? "");
  const [parentType, setParentType] = useState<string>(profile?.parent_type ?? "");
  const [pronouns, setPronouns] = useState<string>(profile?.pronouns ?? "");
  const [custody, setCustody] = useState<string>(profile?.custody_arrangement ?? "");
  const [kidsAges, setKidsAges] = useState<string[]>(
    Array.isArray(profile?.kids_ages) ? (profile?.kids_ages as string[]) : []
  );

  const [error, setError] = useState<string | null>(null);

  // If the modal is mounted while the profile loads, sync the resume step once
  // the data arrives.
  useEffect(() => {
    setStep(computeInitialStep(profile));
    setDisplayName(profile?.display_name ?? "");
    setParentType(profile?.parent_type ?? "");
    setPronouns(profile?.pronouns ?? "");
    setCustody(profile?.custody_arrangement ?? "");
    setKidsAges(Array.isArray(profile?.kids_ages) ? (profile?.kids_ages as string[]) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user_id]);

  const toggleKidsAge = (value: string) => {
    setKidsAges((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Incremental save — write only the field belonging to the current step.
  // Spec § "CRITICAL — INCREMENTAL SAVING".
  const saveStep = async (
    payload: Parameters<typeof updateProfile.mutateAsync>[0],
    next: number
  ) => {
    setError(null);
    try {
      await updateProfile.mutateAsync(payload);
      setStep(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save. Please try again.";
      setError(msg);
    }
  };

  const handleContinueName = () => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    void saveStep({ display_name: trimmed }, 2);
  };

  const handleContinueParentType = () => {
    if (!parentType) return;
    void saveStep({ parent_type: parentType }, 3);
  };

  const handleContinuePronouns = () => {
    // Q3 is the only Phase 1 question that is optional / skippable.
    void saveStep({ pronouns: pronouns || null }, 4);
  };

  const handleSkipPronouns = () => {
    void saveStep({ pronouns: null }, 4);
  };

  const handleContinueCustody = () => {
    if (!custody) return;
    void saveStep({ custody_arrangement: custody }, 5);
  };

  const handleFinish = () => {
    if (kidsAges.length === 0) return;
    // Final save — the modal will auto-close once profile is refetched and
    // OnboardingCheck sees Phase 1 is complete.
    void saveStep({ kids_ages: kidsAges }, 5);
  };

  return (
    <Dialog open={open}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          // Prevent dismissal — Phase 1 must complete before the home screen
          // is accessible. Esc / outside click / X are all suppressed.
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Dad Health — phase 1 onboarding
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Five quick questions to personalise Dad Health before you start.
          </DialogPrimitive.Description>

          <PhaseHeader step={step} total={TOTAL_STEPS} />

          <div className="space-y-3 mt-2">
            {step === 1 && (
              <StepName
                value={displayName}
                onChange={setDisplayName}
                onContinue={handleContinueName}
                saving={updateProfile.isPending}
              />
            )}

            {step === 2 && (
              <StepSingleSelect
                title="What type of parent are you?"
                helper="We use this to surface the right Dad Circles and content for you."
                options={PARENT_TYPE_OPTIONS}
                value={parentType}
                onChange={setParentType}
                onContinue={handleContinueParentType}
                saving={updateProfile.isPending}
              />
            )}

            {step === 3 && (
              <StepSingleSelect
                title="What are your pronouns?"
                helper="Used to personalise notifications. Optional — you can skip."
                options={PRONOUN_OPTIONS}
                value={pronouns}
                onChange={setPronouns}
                onContinue={handleContinuePronouns}
                onSkip={handleSkipPronouns}
                saving={updateProfile.isPending}
                allowSkip
              />
            )}

            {step === 4 && (
              <StepSingleSelect
                title="How often do you see your children?"
                helper="This shapes how your Bond score is calculated — pick the closest fit."
                options={CUSTODY_OPTIONS}
                value={custody}
                onChange={setCustody}
                onContinue={handleContinueCustody}
                saving={updateProfile.isPending}
              />
            )}

            {step === 5 && (
              <StepChips
                title="How old are your children?"
                helper="Select all that apply."
                options={KIDS_AGES_OPTIONS}
                values={kidsAges}
                onToggle={toggleKidsAge}
                onContinue={handleFinish}
                saving={updateProfile.isPending}
              />
            )}

            {error && (
              <p className="text-sm text-destructive mt-2" role="alert">
                {error}
              </p>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function PhaseHeader({ step, total }: { step: number; total: number }) {
  return (
    <div>
      <p className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
        Phase 1 of 3 · Who you are
      </p>
      <div className="mt-2 flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function StepName({
  value,
  onChange,
  onContinue,
  saving,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const disabled = saving || !value.trim();
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-extrabold uppercase tracking-wide">
        What should we call you?
      </h2>
      <p className="text-sm text-muted-foreground">
        First name is fine. We'll use it in your check-ins and reminders.
      </p>
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) onContinue();
        }}
        maxLength={40}
        placeholder="Your name"
        className="w-full px-4 py-3 border border-border bg-background font-heading text-sm font-bold tracking-wide focus:outline-none focus:border-primary"
      />
      <LimeButton full type="button" onClick={onContinue} disabled={disabled}>
        {saving ? "SAVING…" : "CONTINUE →"}
      </LimeButton>
    </div>
  );
}

function StepSingleSelect({
  title,
  helper,
  options,
  value,
  onChange,
  onContinue,
  onSkip,
  saving,
  allowSkip = false,
}: {
  title: string;
  helper?: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  onSkip?: () => void;
  saving: boolean;
  allowSkip?: boolean;
}) {
  const disabled = saving || (!allowSkip && !value);
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-extrabold uppercase tracking-wide">{title}</h2>
      {helper && <p className="text-sm text-muted-foreground">{helper}</p>}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "w-full text-left px-4 py-3 border font-heading text-sm font-bold tracking-wide transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              <span>{opt.label}</span>
              {opt.hint && (
                <span className="block mt-1 font-normal text-[11px] tracking-normal normal-case text-muted-foreground">
                  {opt.hint}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <LimeButton full type="button" onClick={onContinue} disabled={disabled}>
          {saving ? "SAVING…" : "CONTINUE →"}
        </LimeButton>
        {allowSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2 disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function StepChips({
  title,
  helper,
  options,
  values,
  onToggle,
  onContinue,
  saving,
}: {
  title: string;
  helper?: string;
  options: { value: string; label: string }[];
  values: string[];
  onToggle: (v: string) => void;
  onContinue: () => void;
  saving: boolean;
}) {
  const disabled = saving || values.length === 0;
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-extrabold uppercase tracking-wide">{title}</h2>
      {helper && <p className="text-sm text-muted-foreground">{helper}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={cn(
                "px-4 py-2 border font-heading text-xs font-bold tracking-wide uppercase transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <LimeButton full type="button" onClick={onContinue} disabled={disabled}>
        {saving ? "SAVING…" : "FINISH →"}
      </LimeButton>
    </div>
  );
}

// Compute the first step that still needs an answer so re-opening the app
// resumes mid-flow instead of repeating completed questions.
function computeInitialStep(profile: UserProfileRow | null | undefined): number {
  if (!profile) return 1;
  if (!profile.display_name || !profile.display_name.trim()) return 1;
  if (!profile.parent_type) return 2;
  // Pronouns is optional — the modal treats it as answered once any other
  // post-pronouns field is set, OR once the dad reaches Q4 explicitly. We
  // can't tell "skipped" from "not yet shown", so we only skip ahead if a
  // later required field has already been saved.
  if (profile.custody_arrangement) {
    if (!Array.isArray(profile.kids_ages) || (profile.kids_ages as string[]).length === 0) {
      return 5;
    }
    // All required fields present — but the modal is open, so default to last
    // step. OnboardingCheck will unmount us on the next render.
    return 5;
  }
  // Show pronouns if not yet captured (and we haven't moved past it).
  if (profile.pronouns === null || profile.pronouns === undefined || profile.pronouns === "") {
    return 3;
  }
  return 4;
}
