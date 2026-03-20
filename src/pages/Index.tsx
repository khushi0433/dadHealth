import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { STATS, STATS_EXTENDED, PILLARS, MOOD_WEEK, DAYS, FAQ_ITEMS } from "@/lib/constants";
import heroImg from "@/assets/hero-dad.jpg";
import gymImg from "@/assets/gym-weights.jpg";
import runnersImg from "@/assets/runners.jpg";
import nutritionImg from "@/assets/nutrition.jpg";
import parentingImg from "@/assets/parenting.jpg";
import workoutImg from "@/assets/workout.jpg";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import WhoWeAre from "@/components/home/WhoWeAre";
import ExtendedStats from "@/components/home/ExtendedStats";
import PillarsSection from "@/components/home/PillarsSection";
import DashboardPreview from "@/components/home/DashboardPreview";
import DadStrengthSection from "@/components/home/DadStrengthSection";

const PILLAR_IMAGES = [gymImg, runnersImg, nutritionImg, parentingImg];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <HeroSection heroImg={heroImg} />
      <StatsBar />
      <WhoWeAre gymImg={gymImg} />
      <ExtendedStats />

      {/* ── CTA BANNER ── */}
      <section className="bg-primary">
        <div className="max-w-[1400px] mx-auto px-5 py-5 lg:px-8">
          <p className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary-foreground/80 leading-relaxed">
            THESE FIGURES ARE ON THE RISE. HELP REGAIN CONTROL, AND BE THE BETTER VERSION OF YOU,
            FOR YOURSELF AND YOUR FAMILY.
          </p>
        </div>
      </section>

      <PillarsSection pillarImages={PILLAR_IMAGES} />
      <DashboardPreview />
      <DadStrengthSection workoutImg={workoutImg} />
      <SiteFooter />
    </div>
  );
};

export default Index;
