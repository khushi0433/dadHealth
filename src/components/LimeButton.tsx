import { cn } from "@/lib/utils";

interface LimeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  full?: boolean;
  small?: boolean;
  className?: string;
}

const LimeButton = ({ children, full, small, className, ...props }: LimeButtonProps) => (
  <button
    {...props}
    className={cn(
      "bg-primary text-primary-foreground border-none font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.3)] active:scale-[0.97]",
      small ? "py-2 px-3.5 text-[11px]" : "py-3 px-[22px] text-[13px]",
      full && "w-full",
      className
    )}
  >
    {children}
  </button>
);

export default LimeButton;
