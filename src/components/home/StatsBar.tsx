import { STATS_EXTENDED } from "@/lib/constants";

const StatsBar = () => (
  <section className="bg-primary py-10 lg:py-12">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-black/20">
        {STATS_EXTENDED.map((stat, i) => (
          <div key={i} className="px-5 py-6 lg:px-8 lg:py-10">
            <div className="font-heading text-[28px] lg:text-[40px] font-extrabold text-primary-foreground leading-none italic">
              {stat.value}
            </div>
            {stat.sub && (
              <div className="font-heading text-[22px] lg:text-[28px] font-extrabold leading-none uppercase text-primary-foreground">
                {stat.sub}
              </div>
            )}
            <p className="text-xs text-primary-foreground/80 mt-2 leading-relaxed">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-black/20" />
      <div className="px-5 py-5 lg:px-8 lg:py-6">
        <p className="font-heading text-[11px] font-bold tracking-wider uppercase text-primary-foreground leading-relaxed text-center">
          THESE FIGURES ARE ON THE RISE. HELP REGAIN CONTROL, AND BE THE BETTER VERSION OF YOU,
          FOR YOURSELF AND YOUR FAMILY.
        </p>
      </div>
    </div>
  </section>
);

export default StatsBar;
