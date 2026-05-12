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
import { useAuth } from "@/contexts/AuthContext";

const PILLAR_IMAGES = [IMAGES.gym, IMAGES.run, IMAGES.food, IMAGES.bond];

const Index = () => {
  const { loading } = useAuth();

  return (
    <SitePageShell>
      {loading ? (
        <div className="flex min-h-[calc(100dvh-73px)] items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : ( /* public landing only */
        <>
          <HeroSection heroImg={IMAGES.hero} />
          <WhoWeAre gymImg={IMAGES.gym} />
          <DashboardPreview />
          <StatsBar />
          <PillarsSection pillarImages={PILLAR_IMAGES} />
          <DadStrengthSection workoutImg={IMAGES.workout} />
          <SiteFooter />
        </>
      )}
    </SitePageShell>
  );
};

export default Index;
