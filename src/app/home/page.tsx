"use client";

import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";
import { IMAGES } from "@/lib/images";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import WhoWeAre from "@/components/home/WhoWeAre";
import PillarsSection from "@/components/home/PillarsSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import DadStrengthSection from "@/components/home/DadStrengthSection";

const PILLAR_IMAGES = [IMAGES.gym, IMAGES.run, IMAGES.food, IMAGES.bond];

const HomePage = () => {
  return (
    <SitePageShell>
      <DashboardPreview variant="full" />
    </SitePageShell>
  );
};

export default HomePage;
