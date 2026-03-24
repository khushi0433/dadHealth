import { cn } from "@/lib/utils";

interface DHBadgeProps {
  className?: string;
}

const DHBadge = ({ className }: DHBadgeProps) => (
  <div
    className={cn(
      "w-9 h-9 bg-black border-2 border-white flex items-center justify-center shrink-0",
      className
    )}
  >
    <span className="font-heading text-sm font-extrabold tracking-wide">
      <span className="text-primary">D</span>
      <span className="text-white">H</span>
    </span>
  </div>
);

export default DHBadge;
