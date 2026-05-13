"use client";

import Image from "next/image";
import Link from "next/link";
const heroBg = "/hero-bg.jpg";
import {
  Activity,
  Apple,
  Brain,
  Dumbbell,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import LimeButton from "@/components/LimeButton";
import OutlineButton from "@/components/OutlineButton";
import SectionHeader from "@/components/dashboard/SectionHeader";
import StatCard from "@/components/dashboard/StatCard";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Goal = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Stat = {
  value: string;
  label: string;
};

type Pillar = {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

const GOALS: ReadonlyArray<Goal> = [
  {
    icon: Brain,
    title: "BREAK THE STIGMA",
    description:
      "Open up the conversation around men's mental health and the pressure modern dads carry every day.",
  },
  {
    icon: Dumbbell,
    title: "BUILD STRONGER BODIES",
    description:
      "Practical fitness, nutrition and recovery guidance designed for busy fathers — not gym influencers.",
  },
  {
    icon: HeartHandshake,
    title: "DEEPEN FAMILY BONDS",
    description:
      "Tools, prompts and ideas to help you show up for your kids and partner with intention.",
  },
  {
    icon: Scale,
    title: "REGAIN BALANCE",
    description:
      "Accountability check-ins that hold you steady between work, parenting and your own wellbeing.",
  },
];

const STATS: ReadonlyArray<Stat> = [
  { value: "1 IN 8", label: "UK MEN HAVE EXPERIENCED MENTAL HEALTH SYMPTOMS" },
  { value: "76%", label: "OF SUICIDES IN THE UK ARE MEN" },
  { value: "40%", label: "OF DADS REPORT FEELING ISOLATED IN PARENTHOOD" },
  { value: "100%", label: "OF DADS DESERVE BETTER SUPPORT" },
];

const PILLARS: ReadonlyArray<Pillar> = [
  {
    icon: Brain,
    tag: "MIND",
    title: "MENTAL HEALTH",
    description:
      "Daily check-ins, breathing tools and reflection prompts built around the realities of fatherhood.",
  },
  {
    icon: Activity,
    tag: "FITNESS",
    title: "MOVEMENT",
    description:
      "Strength, mobility and conditioning sessions you can fit around the school run.",
  },
  {
    icon: Apple,
    tag: "FUEL",
    title: "NUTRITION",
    description:
      "Real food, family meals and healthier takeaway swaps — no extreme diets, ever.",
  },
  {
    icon: Users,
    tag: "BOND",
    title: "PARENTING",
    description:
      "Cook-togethers, dad dates and shared moments that turn time into connection.",
  },
  {
    icon: HeartHandshake,
    tag: "COMMUNITY",
    title: "BROTHERHOOD",
    description:
      "A private space where dads talk honestly — without judgement, without performance.",
  },
  {
    icon: ShieldCheck,
    tag: "TRUST",
    title: "PRIVATE BY DESIGN",
    description:
      "Your data stays yours. No ads, no tracking, no noise — just tools that work.",
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable wrappers                                                  */
/* ------------------------------------------------------------------ */

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

const Section = ({ children, className = "", id, ariaLabel }: SectionProps) => (
  <section
    id={id}
    aria-label={ariaLabel}
    className={`w-full border-b border-border ${className}`}
  >
    <div className="max-w-[1400px] mx-auto px-5 lg:px-8">{children}</div>
  </section>
);

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */

const HeroSection = () => (
  <section
    aria-label="About Dad Health"
    className="relative w-full overflow-hidden border-b border-border isolate"
  >
    {/* Background image */}
   <Image
  src={heroBg}
  alt=""
  priority
  sizes="100vw"
  fill
  className="absolute inset-0 -z-20 object-cover object-center"
/>
    {/* Layered overlays for legibility + brand mood */}
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-gradient-to-b from-background/85 via-background/55 to-background/95"
    />
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_75%)]"
    />

    <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8">
      <div className="py-24 lg:py-36 text-center flex flex-col items-center">
        <SectionHeader title="ABOUT DAD HEALTH" className="mb-4 inline-block" />
        <h1 className="font-heading text-[44px] sm:text-[64px] lg:text-[88px] font-extrabold text-foreground uppercase leading-[0.95] tracking-tight mb-6 drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
          BUILT FOR DADS,
          <br />
          <span className="text-primary">BY DADS.</span>
        </h1>
        <p className="text-base sm:text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-10">
          Dad Health exists to help men show up stronger — for themselves, their
          partners and their kids. Mental health, fitness, nutrition and
          connection in one honest place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/pricing" aria-label="Start your free 7 day trial">
            <LimeButton>START FREE — 7 DAYS →</LimeButton>
          </Link>
          <Link href="/#what-we-cover" aria-label="See what Dad Health covers">
            <OutlineButton>WHAT WE COVER</OutlineButton>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const GoalsSection = () => (
  <Section className="bg-background" ariaLabel="Our goals">
    <div className="py-16 lg:py-20">
      <SectionHeader title="WHY WE EXIST" className="mb-3 block" />
      <h2 className="font-heading text-[32px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mb-10 lg:mb-14">
        OUR GOALS
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
        {GOALS.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="bg-background p-6 lg:p-8 flex flex-col gap-4"
          >
            <Icon
              className="h-8 w-8 text-primary shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h3 className="font-heading text-[18px] lg:text-[22px] font-extrabold text-foreground uppercase tracking-wide leading-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </Section>
);

const StatsSection = () => (
  <Section className="bg-primary border-b-0" ariaLabel="The numbers behind Dad Health">
    <div className="py-12 lg:py-16">
      <p className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-primary-foreground/80 mb-3">
        THE NUMBERS
      </p>
      <h2 className="font-heading text-[28px] lg:text-[40px] font-extrabold text-primary-foreground uppercase leading-none mb-8 lg:mb-12 max-w-2xl">
        WHY THIS MATTERS NOW.
      </h2>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-primary-foreground/10">
        {STATS.map(({ value, label }) => (
          <li key={label} className="bg-primary p-5 lg:p-6">
            <div className="font-heading text-[28px] lg:text-[40px] font-extrabold italic text-primary-foreground leading-none">
              {value}
            </div>
            <p className="font-heading text-[10px] lg:text-[11px] font-bold tracking-wider uppercase text-primary-foreground/80 mt-3 leading-relaxed">
              {label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </Section>
);

const PillarSection = () => (
  <Section className="bg-background" id="what-we-cover" ariaLabel="Our pillars">
    <div className="py-16 lg:py-20">
      <SectionHeader title="THE PILLARS OF OUR HEALTH" className="mb-3 block" />
      <h2 className="font-heading text-[32px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mb-10 lg:mb-14">
        WHAT WE STAND ON.
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {PILLARS.map(({ icon: Icon, tag, title, description }) => (
          <li
            key={title}
            className="bg-background p-6 lg:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between gap-3">
              <Icon
                className="h-7 w-7 text-primary shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-heading text-[10px] font-bold tracking-[2px] uppercase text-primary border border-primary/30 px-2 py-1">
                {tag}
              </span>
            </div>
            <h3 className="font-heading text-[18px] lg:text-[22px] font-extrabold text-foreground uppercase tracking-wide leading-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
    </div>
  </Section>
);

const CTASection = () => (
  <Section className="bg-background border-b-0" ariaLabel="Join Dad Health">
    <div className="py-16 lg:py-24 text-center">
      <SectionHeader title="JOIN US" className="mb-3 inline-block" />
      <h2 className="font-heading text-[32px] sm:text-[44px] lg:text-[64px] font-extrabold text-foreground uppercase leading-[0.95] tracking-tight mb-5">
        KILL THE OLD VERSION
        <br />
        <span className="text-primary">OF YOU.</span>
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
        Every tool, every check-in, every honest conversation — all in one
        place. Built for the dad you want to become.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/pricing" aria-label="Start your free 7 day trial">
          <LimeButton>START FREE — 7 DAYS →</LimeButton>
        </Link>
        <Link href="/home" aria-label="See the dashboard">
          <OutlineButton>SEE THE DASHBOARD</OutlineButton>
        </Link>
      </div>
    </div>
  </Section>
);

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function AboutScreen() {
  return (
    <div className="flex flex-col w-full min-w-0">
      <HeroSection />
      <GoalsSection />
      <StatsSection />
      <PillarSection />
      <CTASection />
    </div>
  );
}
