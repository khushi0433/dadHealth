type MiniBarChartProps = {
  values: number[];
  labels?: string[];
  maxValue: number;
  heightClass?: string;
  highlightedThreshold?: number;
  dense?: boolean;
};

export default function MiniBarChart({
  values,
  labels,
  maxValue,
  heightClass = "h-[80px]",
  highlightedThreshold = 3,
  dense = false,
}: MiniBarChartProps) {
  return (
    <div className={`flex items-end gap-1.5 mb-2 ${heightClass}`}>
      {values.map((value, i) => {
        const normalizedHeight = Math.round((Number(value) / maxValue) * (dense ? 40 : 68)) + (dense ? 0 : 8);
        return (
          <div key={`${i}-${value}`} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full transition-all ${Number(value) >= highlightedThreshold ? "bg-primary" : "bg-muted"} ${dense ? "flex-1 min-h-[8px]" : ""}`}
              style={{ height: dense ? `${Math.max(normalizedHeight, 8)}px` : `${normalizedHeight}px` }}
            />
            {labels?.[i] && <span className="font-heading text-[9px] font-bold text-muted-foreground">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}
