export function AttitudeDial({
  label,
  angle,
  unit = "°",
  max = 90,
}: {
  label: string;
  angle: number;
  unit?: string;
  max?: number;
}) {
  const clamped = Math.max(-max, Math.min(max, angle));
  const pct = (clamped + max) / (2 * max);
  const sweep = 240; // degrees of arc
  const start = 150;
  const deg = start + pct * sweep;
  const r = 34;
  const cx = 50;
  const cy = 50;
  const rad = (deg * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  return (
    <div className="rounded-xl border border-border bg-panel px-3 py-3 text-center">
      <span className="label-caps text-[9px]">{label}</span>
      <svg viewBox="0 0 100 78" className="mx-auto mt-1 w-full max-w-[132px]">
        <path
          d="M 20.6 67 A 34 34 0 1 1 79.4 67"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 20.6 67 A 34 34 0 1 1 79.4 67"
          fill="none"
          stroke="var(--signal)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${pct * 142} 400`}
          opacity="0.85"
        />
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="2.6" fill="var(--signal)" />
      </svg>
      <p className="numeric -mt-2 text-lg font-semibold">
        {angle.toFixed(1)}
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
