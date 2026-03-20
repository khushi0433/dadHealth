import Link from "next/link";
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
      className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
    />
    <div className="absolute inset-0 bg-black/50" />
    <div className="absolute top-5 right-5 lg:top-8 lg:right-8 z-20">
      <div className="w-10 h-10 border-2 border-white flex items-center justify-center bg-black">
        <span className="font-heading text-sm font-extrabold text-white tracking-wide">DH</span>
      </div>
    </div>
    <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-[1400px] mx-auto px-5 lg:px-8">
      <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-primary mb-3">BUILT FOR DADS, BY DADS</span>
      <h1 className="font-heading text-[48px] lg:text-[72px] font-extrabold leading-[0.95] tracking-tight uppercase mb-6">
        <span className="text-primary">DAD</span>
        <br />
        <span className="text-foreground">HEALTH</span>
      </h1>
      <p className="text-sm text-foreground/70 leading-relaxed max-w-md mb-8">
        "1 in 8 men in the UK have experienced mental health symptoms. Obesity is now more
        of a global crisis than malnutrition. Be the stronger Dad you aspire to be, both
        mentally and physically."
      </p>
      <div className="flex gap-3">
        <Link href="/pricing">
          <LimeButton>START FREE — 7 DAYS →</LimeButton>
        </Link>
        <OutlineButton>HOW IT WORKS</OutlineButton>
      </div>
    </div>
  </section>
);

export default HeroSection;
