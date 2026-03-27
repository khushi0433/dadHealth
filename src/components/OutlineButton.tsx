import { cn } from "@/lib/utils";

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dark?: boolean;
  small?: boolean;
}

const OutlineButton = ({ children, dark, small, className, type = "button", ...props }: OutlineButtonProps) => (
  <button
    type={type}
    className={cn(
      "bg-transparent border-[1.5px] font-heading font-bold tracking-wider uppercase cursor-pointer inline-flex items-center gap-1.5 transition-all duration-200 active:scale-[0.97]",
      dark
        ? "text-primary-foreground border-primary-foreground hover:border-primary-foreground hover:text-primary-foreground hover:bg-primary/35 hover:brightness-110 hover:shadow-[0_0_20px_hsl(78,89%,65%,0.35)]"
        : "text-foreground border-foreground hover:border-primary hover:text-primary",
      small ? "py-2 px-3.5 text-[11px]" : "py-[11px] px-5 text-[13px]",
      className
    )}
    {...props}
  >
    {children} →
  </button>
);

export default OutlineButton;
