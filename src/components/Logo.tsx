import { cn } from "@/lib/utils";

interface LogoProps {
  large?: boolean;
  className?: string;
}

const Logo = ({ large, className }: LogoProps) => (
  <div
    className={cn("inline-flex items-center relative", className)}
    style={{
      padding: large ? "7px 16px" : "4px 10px",
    }}
  >
    {/* Top border */}
    <span className="absolute top-0 left-0 right-0 border-t-2 border-foreground" />
    {/* Left border */}
    <span className="absolute top-0 bottom-0 left-0 border-l-2 border-foreground" />
    {/* Right border */}
    <span className="absolute top-0 bottom-0 right-0 border-r-2 border-foreground" />
    {/* Bottom border — two segments with a gap in the middle */}
    <span className="absolute bottom-0 left-0 w-[30%] border-b-2 border-foreground" />
    <span className="absolute bottom-0 right-0 w-[30%] border-b-2 border-foreground" />

    <span className={cn("font-heading font-extrabold text-primary leading-none tracking-wide", large ? "text-[28px]" : "text-[17px]")}>
      DAD
    </span>
    <span className={cn("font-heading font-extrabold text-foreground leading-none tracking-wide", large ? "text-[28px] ml-[7px]" : "text-[17px] ml-1")}>
      HEALTH
    </span>
  </div>
);

export default Logo;
