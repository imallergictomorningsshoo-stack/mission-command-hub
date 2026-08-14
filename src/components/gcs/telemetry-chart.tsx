import { cn } from "@/lib/utils";

/** Lightweight SVG sparkline/area chart driven by live sensor values. */
export function TelemetryChart({
  values,
  label,
  unit,
  tone = "signal",
  height = 120,
  className,
}: {
  values: number[];
  label: string;
  unit?: string;
  tone?: "signal" | "ok" | "warn" | "accent";
  height?: number;
  className?: string;
}) {
  const stroke = {
    signal: "var(--signal)",
    ok: "var(--ok)",
    warn: "var(--warn)",
    accent: "var(--signal)",
  }[tone];

  const clean = values.filter((v) => Number.isFinite(v));
  const min = clean.length ? Math.min(...clean) : 0;
  const max = clean.length ? Math.max(...clean) : 1;
  const span = max - min || 1;
  const w = 100;
  const points = clean.map((v, i) => {
    const x = clean.length === 1 ? 0 : (i / (clean.length - 1)) * w;
    const y = 100 - ((v - min) / span) * 100;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <div className={cn("px-4 py-3", className)}>
      <div className="flex items-baseline justify-between">
        <span className="label-caps">{label}</span>
        <span className="numeric text-xs text-muted-foreground">
          {clean.length ? `${clean[clean.length - 1]!.toFixed(2)} ${unit ?? ""}` : "no data"}
        </span>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height }}
        className="mt-2 w-full"
        role="img"
        aria-label={`${label} trend`}
      >
        {clean.length > 1 ? (
          <>
            <polyline
              points={`0,100 ${points.join(" ")} 100,100`}
              fill={stroke}
              opacity={0.12}
              stroke="none"
            />
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke={stroke}
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </>
        ) : null}
      </svg>
      <div className="numeric mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>min {clean.length ? min.toFixed(2) : "—"}</span>
        <span>max {clean.length ? max.toFixed(2) : "—"}</span>
      </div>
    </div>
  );
}
