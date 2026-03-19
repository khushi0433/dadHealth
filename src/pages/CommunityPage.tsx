import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LimeButton from "@/components/LimeButton";
import { CIRCLES, FEED_POSTS, EXPERTS } from "@/lib/constants";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase opacity-60 mb-2 block">
            DAD HEALTH COMMUNITY
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold uppercase leading-none tracking-wide">
              DAD FEED
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              <span className="font-heading text-[11px] font-bold tracking-wider uppercase opacity-70">
                2,341 DADS ONLINE RIGHT NOW
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left - Circles */}
        <div className="px-5 lg:px-8 py-8 border-r border-border">
          <span className="section-label !p-0 mb-4 block">DAD CIRCLES</span>
          <div className="space-y-3">
            {CIRCLES.map((c, i) => (
              <div key={c.name} className="circle-card">
                <div className="text-xl mb-2">{c.icon}</div>
                <div className="font-heading text-xs font-extrabold text-foreground tracking-wide mb-1">{c.name}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">{c.members.toLocaleString()} members</span>
                  <span className="font-heading text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    {i === 0 ? "JOINED ✓" : "JOIN"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Feed */}
        <div className="border-r border-border">
          {/* Compose */}
          <div className="px-5 py-4 border-b border-border">
            <textarea
              placeholder="What's on your mind, dad?"
              className="w-full bg-white/[0.04] border border-border p-3 text-foreground text-sm resize-none h-[60px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40 mb-2"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {["FITNESS", "MIND", "BOND"].map((t) => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
              <LimeButton small>POST</LimeButton>
            </div>
          </div>

          {/* Posts */}
          {FEED_POSTS.map((p, i) => {
            const isAnon = "anon" in p && p.anon;
            return (
            <div key={i} className="px-5 py-4 border-b border-border last:border-b-0">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className={`w-9 h-9 flex items-center justify-center font-heading text-xs font-extrabold shrink-0 ${
                    isAnon
                      ? "bg-white/[0.08] border border-white/15 text-muted-foreground"
                      : "bg-primary/10 border border-primary text-primary"
                  }`}
                >
                  {p.initials}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-[13px] font-bold text-foreground tracking-wide flex items-center gap-1.5">
                    {p.name}
                    {isAnon && (
                      <span className="bg-white/[0.08] border border-white/10 font-heading text-[9px] font-bold tracking-wider text-muted-foreground px-1.5 py-0.5 uppercase">
                        ANON
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{p.meta}</div>
                </div>
                <span className="tag-pill">{p.tag}</span>
              </div>
              <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">{p.body}</p>
              <div className="flex gap-3.5">
                <button className="post-action">👊 {p.respect} RESPECT</button>
                <button className="post-action">💬 {p.replies} REPLIES</button>
                <button className="post-action">🔖 SAVE</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right - Expert Q&A */}
        <div className="px-5 lg:px-8 py-8">
          <span className="section-label !p-0 mb-4 block">EXPERT Q&A THIS WEEK</span>
          {EXPERTS.map((e) => (
            <div key={e.name} className="border border-border p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-card border border-border flex items-center justify-center font-heading text-sm font-extrabold text-primary shrink-0">
                  {e.initials}
                </div>
                <div className="flex-1">
                  <div className="font-heading text-[13px] font-extrabold text-foreground tracking-wide">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">{e.role}</div>
                  <p className="text-xs text-foreground/60 mt-1">{e.topic}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="font-heading text-[11px] font-bold text-primary">{e.time}</span>
                <button className="bg-background text-foreground border border-foreground font-heading font-bold text-[10px] tracking-wider uppercase px-3 py-1.5 cursor-pointer">
                  BOOK SESSION
                </button>
              </div>
            </div>
          ))}

          {/* Trending */}
          <div className="mt-6">
            <span className="section-label !p-0 mb-3 block">TRENDING</span>
            {[
              { tag: "#ScreenFreeSunday", count: 847 },
              { tag: "#DadRun", count: 412 },
              { tag: "#MindfulDad", count: 289 },
            ].map((t) => (
              <div key={t.tag} className="py-1.5">
                <span className="text-sm text-primary font-medium">{t.tag}</span>
                <span className="text-xs text-muted-foreground ml-2">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default CommunityPage;
