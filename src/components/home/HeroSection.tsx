import Link from "next/link";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import DHBadge from "@/components/DHBadge";

interface HeroSectionProps {
  heroImg: string;
}

const HeroSection = ({ heroImg }: HeroSectionProps) => (
  <section className="relative w-full min-w-0 h-[520px] lg:h-[600px]">
    <img
      src={heroImg}
      alt="Dad with child"
       className="absolute inset-0 w-full h-full object-cover object-[30%_top]"
    />
    <div className="absolute inset-0 bg-black/50" />
    <div className="absolute top-5 right-5 lg:top-8 lg:right-8 z-20">
      <DHBadge />
    </div>
    <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-[1400px] mx-auto px-5 lg:px-8">
      <span className="font-heading text-xs sm:text-sm font-bold tracking-[2.5px] uppercase text-primary mb-3">BUILT FOR DADS, BY DADS</span>
      <h1 className="font-heading text-[52px] sm:text-[56px] lg:text-[80px] font-extrabold leading-[0.95] tracking-tight uppercase mb-6">
        <span className="text-primary">DAD</span>
        <br />
        <span className="text-foreground">HEALTH</span>
      </h1>
      <p className="text-base sm:text-lg text-foreground/80 leading-relaxed max-w-lg mb-8">
        "1 in 8 men in the UK have experienced mental health symptoms. Obesity is now more
        of a global crisis than malnutrition. Be the stronger Dad you aspire to be, both
        mentally and physically."
      </p>
      <div className="flex gap-3">
        <Link href="/pricing">
          <LimeButton>START FREE — 7 DAYS →</LimeButton>
        </Link>
        <Link href="/#what-we-cover">
          <OutlineButton>HOW IT WORKS</OutlineButton>
        </Link>
      </div>
    </div>
  </section>
);

export default HeroSection;