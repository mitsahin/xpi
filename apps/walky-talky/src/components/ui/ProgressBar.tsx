type Props = {
  value: number;
  max?: number;
  className?: string;
};

export function ProgressBar({ value, max = 100, className = "" }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`h-3 w-full overflow-hidden rounded-full bg-emerald-100 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-linear-to-r from-wt-primary to-emerald-400 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
