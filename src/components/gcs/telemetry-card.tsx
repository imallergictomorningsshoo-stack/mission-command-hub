import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function TelemetryCard({
  label,
  value,
  unit,
  icon: Icon,
  delta,
  trend,
  accent = "signal",
}: {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  delta?: string;
  trend?: "up" | "down" | "flat";
  accent?: "signal" | "accent" | "warn" | "ok";
}) {
  const accentText = {
    signal: "text-signal",
    accent: "text-signal",
    warn: "text-signal",
    ok: "text-signal",
  }[accent];

  return (
    <div className="group glass relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/30">
      <div
        className={cn(
          "pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40",
          "bg-signal",
        )}
      />
      <div className="flex items-center justify-between">
        <span className="label-caps">{label}</span>
        <Icon className={cn("size-4 opacity-70", accentText)} strokeWidth={1.75} />
      </div>
      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="numeric text-4xl leading-none font-semibold tracking-tight">{value}</span>
        <span className="numeric text-sm text-muted-foreground">{unit}</span>
      </div>
      {delta ? (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "numeric text-xs",
              trend === "down" ? "text-warn" : trend === "up" ? "text-ok" : "text-muted-foreground",
            )}
          >
            {trend === "down" ? "▼" : trend === "up" ? "▲" : "■"} {delta}
          </span>
          <span className="text-xs text-muted-foreground">vs last packet</span>
        </div>
      ) : null}
    </div>
  );
}