"use client";

import Logo from "@/components/Logo";
import { DashboardIcon } from "@/components/DashboardIcon";
import { Flame } from "lucide-react";
import Link from "next/link";
import { initialsFromDisplayName } from "@/lib/userDisplay";
import type { User } from "@supabase/supabase-js";
import type { DashboardScreen } from "./types";

type SidebarItem =
  | { iconKey: string; label: string; href: string }
  | { iconKey: string; label: string; id: DashboardScreen };

type SidebarProps = {
  user: User | null;
  greetingName: string;
  streak: number;
  activeScreen: DashboardScreen;
  setActiveScreen: (screen: DashboardScreen) => void;
  items: SidebarItem[];
  isFullDashboard: boolean;
};

export default function Sidebar({
  user,
  greetingName,
  streak,
  activeScreen,
  setActiveScreen,
  items,
  isFullDashboard,
}: SidebarProps) {
  return (
    <div className={`bg-card p-5 ${isFullDashboard ? "min-h-full" : ""}`}>
      <Logo className="mb-5" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-heading text-sm font-bold text-primary">
          {user ? initialsFromDisplayName(greetingName, user.email) : "—"}
        </div>
        <div>
          <div className="font-heading text-sm font-bold text-foreground">{user ? greetingName : "—"}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {user ? (
              <>
                <Flame className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {streak}-day streak
              </>
            ) : "—"}
          </div>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          if ("href" in item) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-bold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
              >
                <DashboardIcon icon={item.iconKey} size="md" />
                {item.label}
              </Link>
            );
          }

          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-heading text-[11px] font-bold tracking-wider uppercase transition-colors text-left ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DashboardIcon icon={item.iconKey} size="md" active={isActive} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
