import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

const SiteHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 py-3 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "font-heading text-[11px] font-bold tracking-[1.5px] uppercase transition-colors duration-200",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="hidden lg:inline-flex font-heading text-[10px] font-bold tracking-wider uppercase text-primary border border-primary px-2 py-0.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            PRO
          </Link>
          <Link
            to="/pricing"
            className="bg-primary text-primary-foreground font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.3)] transition-all duration-200"
          >
            START FREE — 7 DAYS
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-1 cursor-pointer bg-transparent border-none"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-5 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block font-heading text-[12px] font-bold tracking-[1.5px] uppercase py-2 transition-colors",
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
