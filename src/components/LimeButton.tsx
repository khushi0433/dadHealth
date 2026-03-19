import { cn } from "@/lib/utils";

interface LimeButtonProps {
  children: React.ReactNode;
  full?: boolean;
  small?: boolean;
  onClick?: () => void;
  className?: string;
}

const LimeButton = ({ children, full, small, onClick, className }: LimeButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "bg-primary text-primary-foreground border-none font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex items-center justify-center gap-1.5",
      small ? "py-2 px-3.5 text-[11px]" : "py-3 px-[22px] text-[13px]",
      full && "w-full",
      className
    )}
  >
    {children}
  </button>
);

export default LimeButton;
