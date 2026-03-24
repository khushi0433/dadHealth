import { cn } from "@/lib/utils";

interface LogoProps {
  large?: boolean;
  className?: string;
}

const Logo = ({ large, className }: LogoProps) => (
  <div
    className={cn(
      "inline-flex items-center border border-foreground",
      large ? "border-2 py-[7px] px-4" : "border-[1.5px] py-1 px-2.5",
      className
    )}
  >
    <span
      className={cn(
        "font-heading font-extrabold text-primary leading-none tracking-wide",
        large ? "text-[28px]" : "text-[17px]"
      )}
    >
      DAD
    </span>
    <span
      className={cn(
        "font-heading font-extrabold text-foreground leading-none tracking-wide",
        large ? "text-[28px] ml-[7px]" : "text-[17px] ml-1"
      )}
    >
      HEALTH
    </span>
  </div>
);

export default Logo;