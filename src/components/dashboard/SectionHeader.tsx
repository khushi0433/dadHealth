type SectionHeaderProps = {
  title: string;
  className?: string;
};

export default function SectionHeader({ title, className = "" }: SectionHeaderProps) {
  return <span className={`section-label !p-0 ${className}`}>{title}</span>;
}
