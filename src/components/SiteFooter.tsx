import Link from "next/link";
import Logo from "./Logo";
import { LifeBuoy } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants";

const SiteFooter = () => (
  <footer className="w-full min-w-0 bg-card border-t border-border">
    <div className="max-w-[1400px] mx-auto px-5 py-12 lg:px-8 lg:py-14">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8 lg:gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xs">
            Built for dads, by dads. Kill the old version of you. Be the stronger dad —
            mentally, physically and as a parent.
          </p>
        </div>

        {/* Platform — slight right nudge on small screens only */}
        <div className="pl-3 sm:pl-4 lg:pl-0">
          <h4 className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-muted-foreground mb-4">
            PLATFORM
          </h4>
          <ul className="space-y-2.5">
            {FOOTER_LINKS.platform.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-muted-foreground mb-4">
            COMPANY
          </h4>
          <ul className="space-y-2.5">
            {FOOTER_LINKS.company.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal — slight right nudge on small screens only */}
        <div className="pl-3 sm:pl-4 lg:pl-0">
          <h4 className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-muted-foreground mb-4">
            LEGAL
          </h4>
          <ul className="space-y-2.5">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase text-muted-foreground mb-2 mt-6">
            SUPPORT
          </h4>
          <a href="mailto:hello@dadhealth.co.uk" className="text-sm text-foreground/70 hover:text-primary transition-colors">
            hello@dadhealth.co.uk
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2025 Dad Health. All rights reserved.</p>
        <a
          href="tel:116123"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <LifeBuoy className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-heading text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            CRISIS SUPPORT — 116 123
          </span>
        </a>
      </div>
    </div>
  </footer>
);

export default SiteFooter;