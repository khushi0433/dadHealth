import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PILLARS } from "@/lib/constants";
import { IMAGES } from "@/lib/images";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import WhoWeAre from "@/components/home/WhoWeAre";
import PillarsSection from "@/components/home/PillarsSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import DadStrengthSection from "@/components/home/DadStrengthSection";

const PILLAR_IMAGES = [IMAGES.gym, IMAGES.run, IMAGES.food, IMAGES.bond];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <HeroSection heroImg={IMAGES.hero} />
      <WhoWeAre gymImg={IMAGES.gym} />
      <StatsBar />
      <PillarsSection pillarImages={PILLAR_IMAGES} />
      <DashboardPreview />
      <DadStrengthSection workoutImg={IMAGES.workout} />
      <SiteFooter />
    </div>
  );
};

export default Index;

