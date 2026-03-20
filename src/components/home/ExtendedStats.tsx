import { STATS_EXTENDED } from "@/lib/constants";

const ExtendedStats = () => (
  <section className="bg-card border-y border-border">
    <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
      {STATS_EXTENDED.map((stat, i) => (
        <div
          key={i}
          className="px-5 py-8 lg:px-8 lg:py-10 border-r border-border last:border-r-0 bg-primary text-primary-foreground"
        >
          <div className="font-heading text-[36px] lg:text-[44px] font-extrabold leading-none italic text-primary-foreground">
            {stat.value}
          </div>
          {stat.sub && (
            <div className="font-heading text-[28px] lg:text-[36px] font-extrabold leading-none uppercase text-primary-foreground">
              {stat.sub}
            </div>
          )}
          <p className="text-xs mt-2 leading-relaxed text-primary-foreground/65">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default ExtendedStats;
