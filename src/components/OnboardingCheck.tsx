"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingCheck() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.id);
  const [dismissed, setDismissed] = useState(false);

  const showOnboarding =
    user?.id &&
    !dismissed &&
    !isLoading &&
    (profile === null || profile?.onboarding_complete === false);

  if (!showOnboarding || !user?.id) return null;

  return (
    <OnboardingModal
      open
      onClose={() => setDismissed(true)}
      userId={user.id}
    />
  );
}
