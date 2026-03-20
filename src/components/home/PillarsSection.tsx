import Link from "next/link";
import { PILLARS } from "@/lib/constants";

interface PillarsSectionProps {
  pillarImages: string[];
}

const PillarsSection = ({ pillarImages }: PillarsSectionProps) => (
  <section id="what-we-cover" className="bg-background pt-16 lg:pt-20 pb-16 lg:pb-20">
    <div className="max-w-[1400px] mx-auto">
      <div className="px-5 pb-4 lg:px-8">
        <span className="section-label">THE PILLARS OF OUR HEALTH</span>
        <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3">
          WHAT WE COVER
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar, i) => (
          <Link
            key={pillar.tag}
            href={pillar.href}
            className="block border-r border-b border-border last:border-r-0 [&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r hover-lime group"
          >
            <div className="h-[140px] lg:h-[200px] overflow-hidden">
              <img
                src={pillarImages[i]}
                alt={pillar.tag}
                className="w-full h-full object-cover brightness-[0.6] group-hover:brightness-75 transition-all duration-300"
              />
            </div>
            <div className="p-3 lg:p-4">
              <h3 className="font-heading text-[13px] font-extrabold tracking-wider text-foreground mb-1 uppercase">
                {pillar.tag}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                {pillar.description}
              </p>
              <span className="tag-pill">LEARN MORE</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default PillarsSection;
