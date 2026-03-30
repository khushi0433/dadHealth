"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { initialsFromDisplayName, resolveDisplayName } from "@/lib/userDisplay";

const SiteHeader = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, openAuthModal } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  const resolvedName = resolveDisplayName(profile, user);
  const avatarInitials = initialsFromDisplayName(resolvedName, user?.email);

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 bg-black border-b border-white/10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-heading text-[11px] font-bold tracking-[1.5px] uppercase transition-colors duration-200",
                pathname === link.href
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
            href="/pricing"
            className="hidden lg:inline-flex font-heading text-[10px] font-bold tracking-wider uppercase text-primary border border-primary px-2 py-0.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            PRO
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/progress"
                className="w-9 h-9 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-heading text-sm font-bold text-primary"
              >
                {avatarInitials}
              </Link>
              <button
                onClick={() => signOut()}
                className="font-heading text-[10px] font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="bg-primary text-primary-foreground font-heading font-bold text-[11px] tracking-wider uppercase px-4 py-2.5 hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.3)] transition-all duration-200"
            >
              START FREE — 7 DAYS
            </button>
          )}

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
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block font-heading text-[12px] font-bold tracking-[1.5px] uppercase py-2 transition-colors",
                pathname === link.href
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
