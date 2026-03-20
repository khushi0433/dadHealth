import { STATS } from "@/lib/constants";

const StatsBar = () => (
  <section className="bg-card border-y border-border">
    <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.value}
          className="px-5 py-6 lg:px-8 lg:py-8 border-r border-border last:border-r-0"
        >
          <div className="font-heading text-[28px] lg:text-[36px] font-extrabold text-primary leading-none italic">
            {stat.value}
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
