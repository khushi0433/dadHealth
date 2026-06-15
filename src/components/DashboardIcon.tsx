"use client";

import {
  Home,
  Dumbbell,
  Brain,
  Heart,
  Users,
  BarChart2,
  Gem,
  Wind,
  Footprints,
  BookOpen,
  PenLine,
  Gamepad2,
  Tent,
  CircleDot,
  Flame,
  Sun,
  CheckCircle,
} from "lucide-react";

// Lucide icons are typed with `strokeWidth` as `string | number`.
// Keep the icon map type flexible to avoid TS assignment errors.
type IconComponentType = React.ComponentType<{
  className?: string;
  strokeWidth?: string | number;
  "aria-hidden"?: string | boolean;
}>;

const ICON_MAP: Record<string, IconComponentType> = {
  home: Home,
  fitness: Dumbbell,
  mind: Brain,
  bond: Heart,
  community: Users,
  progress: BarChart2,
  pro: Gem,
  breathing: Wind,
  run: Footprints,
  story: BookOpen,
  journal: PenLine,
  gaming: Gamepad2,
  camping: Tent,
  kickabout: CircleDot,
  flame: Flame,
  sunrise: Sun,
  baby: Users,
  grad: BookOpen,
  "check-circle": CheckCircle,
};

interface DashboardIconProps {
  icon: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function DashboardIcon({ icon, className = "", size = "md", active = false }: DashboardIconProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const colorClass = active ? "text-primary-foreground" : "text-primary";
  const IconComponent = ICON_MAP[icon];
  if (IconComponent) {
    return <IconComponent className={`${sizeClass} ${colorClass} shrink-0 ${className}`} strokeWidth={1.5} aria-hidden="true" />;
  }
  // Unknown icon key: never render raw iconKey as visible text.
  // Use a safe default icon so UI doesn't go blank.
  const SafeIconComponent = ICON_MAP["check-circle"];
  return SafeIconComponent ? (
    <SafeIconComponent
      className={`${sizeClass} ${colorClass} shrink-0 ${className}`}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  ) : null;
}
