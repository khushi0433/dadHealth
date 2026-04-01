'use client';

import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import { PILLARS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import WhoWeAre from "@/components/home/WhoWeAre";
import PillarsSection from "@/components/home/PillarsSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import DadStrengthSection from "@/components/home/DadStrengthSection";
import { useAuth } from "@/contexts/AuthContext";

const PILLAR_IMAGES = [IMAGES.gym, IMAGES.run, IMAGES.food, IMAGES.bond];

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <SitePageShell>
      <HeroSection heroImg={IMAGES.hero} />
      <WhoWeAre gymImg={IMAGES.gym} />
      {!loading && <DashboardPreview />}
      <StatsBar />
      <PillarsSection pillarImages={PILLAR_IMAGES} />
      <DadStrengthSection workoutImg={IMAGES.workout} />
      <SiteFooter />
    </SitePageShell>
  );
};

export default Index;
