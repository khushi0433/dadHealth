import { Link } from "react-router-dom";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";

interface HeroSectionProps {
  heroImg: string;
}

const HeroSection = ({ heroImg }: HeroSectionProps) => (
  <section className="relative h-[520px] lg:h-[600px]">
    <img
      src={heroImg}
      alt="Dad with child"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-background/[0.72]" />
    <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-[1400px] mx-auto px-5 lg:px-8">
      <span className="section-label mb-3">BUILT FOR DADS, BY DADS</span>
      <h1 className="font-heading text-[48px] lg:text-[72px] font-extrabold text-foreground leading-[0.95] tracking-tight uppercase mb-6">
        DAD<br />HEALTH
      </h1>
      <p className="text-sm text-foreground/70 leading-relaxed max-w-md mb-8">
        "1 in 8 men in the UK have experienced mental health symptoms. Obesity is now more
        of a global crisis than malnutrition. Be the stronger Dad you aspire to be, both
        mentally and physically."
      </p>
      <div className="flex gap-3">
        <Link to="/pricing">
          <LimeButton>START FREE — 7 DAYS →</LimeButton>
        </Link>
        <OutlineButton>HOW IT WORKS</OutlineButton>
      </div>
    </div>
  </section>
);

export default HeroSection;
