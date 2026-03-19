import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}

const SectionLabel = ({ children, dark, className }: SectionLabelProps) => (
  <div
    className={cn(
      "section-label py-3.5 px-5",
      dark && "text-primary-foreground/45",
      className
    )}
  >
    {children}
  </div>
);

export default SectionLabel;
