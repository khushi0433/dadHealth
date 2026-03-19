import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SiteHeader = () => {
  const location = useLocation();

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
          <span className="hidden lg:inline-flex font-heading text-[10px] font-bold tracking-wider uppercase text-primary border border-primary px-2 py-0.5">
            PRO
          </span>
          <Link
            to="/pricing"
            className="bg-primary text-primary-foreground font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            START FREE — 7 DAYS
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
