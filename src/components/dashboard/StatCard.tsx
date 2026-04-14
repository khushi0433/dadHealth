type StatCardProps = {
  value: string;
  label: string;
  compact?: boolean;
};

export default function StatCard({ value, label, compact = false }: StatCardProps) {
  return (
    <div className={`bg-card border border-primary/20 rounded-lg ${compact ? "p-2.5" : "p-3"}`}>
      <div className={`font-heading font-extrabold text-foreground ${compact ? "text-[16px]" : "text-[18px]"}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
    </div>
  );
}
