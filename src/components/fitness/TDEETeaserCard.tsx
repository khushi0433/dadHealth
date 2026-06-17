"use client";

import Link from "next/link";

/**
 * TDEETeaserCard
 * A lightweight CTA placed in the Home dashboard FITNESS section.
 * Matches the existing dashboard card style (border-primary/20, font-heading, etc.)
 */
const TDEETeaserCard = () => (
  <div className="border border-primary/20 p-4 mt-4">
    <div className="font-heading text-[11px] font-bold tracking-[2px] uppercase text-primary mb-1">
      KNOW YOUR DAILY CALORIES
    </div>
    <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
      Calculate your TDEE and discover the exact calories you need to maintain, lose, or gain weight — built for busy dads.
    </p>
    <Link
      href="/fitness#tdee"
      className="bg-primary text-primary-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 inline-block border-none cursor-pointer hover:brightness-110 transition-all duration-200"
    >
      CALCULATE TDEE →
    </Link>
  </div>
);

export default TDEETeaserCard;