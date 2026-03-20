import { cn } from "@/lib/utils";

interface OutlineButtonProps {
  children: React.ReactNode;
  dark?: boolean;
  small?: boolean;
  onClick?: () => void;
  className?: string;
}

const OutlineButton = ({ children, dark, small, onClick, className }: OutlineButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "bg-transparent border-[1.5px] font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex items-center gap-1.5 transition-all duration-200 hover:border-primary hover:text-primary active:scale-[0.97]",
      dark
        ? "text-primary-foreground border-primary-foreground hover:border-primary hover:text-primary"
        : "text-foreground border-foreground",
      small ? "py-2 px-3.5 text-[11px]" : "py-[11px] px-5 text-[13px]",
      className
    )}
  >
    {children} →
  </button>
);

export default OutlineButton;
