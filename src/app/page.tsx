'use client';

import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import DashboardPreview from "@/components/home/DashboardPreview";
import { IMAGES } from "@/lib/images";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import WhoWeAre from "@/components/home/WhoWeAre";
import PillarsSection from "@/components/home/PillarsSection";
import DadStrengthSection from "@/components/home/DadStrengthSection";

// Removed: useAuth + loading guard.
// The public landing page has no auth-dependent content — it renders the same
// for logged-in and logged-out visitors. Blocking the entire page behind
// auth.loading caused a 300–800ms spinner on every first load because the
// Supabase session check hadn't resolved yet.
// The header handles the sign-in/avatar state independently and does not
// block page render.

const PILLAR_IMAGES = [IMAGES.gym, IMAGES.run, IMAGES.food, IMAGES.bond];

const Index = () => {
  return (
    <SitePageShell>
      <HeroSection heroImg={IMAGES.hero} />
      <WhoWeAre gymImg={IMAGES.gym} />
      <DashboardPreview />
      <StatsBar />
      <PillarsSection pillarImages={PILLAR_IMAGES} />
      <DadStrengthSection workoutImg={IMAGES.workout} />
      <SiteFooter />
    </SitePageShell>
  );
};

export default Index;