import { AlertTriangle, SignalLow, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Level = "critical" | "warning" | "resolved";

const config = {
  critical: {
    icon: AlertTriangle,
    ring: "border-destructive/35 bg-destructive/10",
    text: "text-destructive",
  },
  warning: { icon: SignalLow, ring: "border-warn/35 bg-warn/10", text: "text-warn" },
  resolved: { icon: ShieldCheck, ring: "border-ok/35 bg-ok/10", text: "text-ok" },
} as const;

export function AlertBanner({
  level,
  title,
  detail,
  timestamp,
}: {
  level: Level;
  title: string;
  detail: string;
  timestamp: string;
}) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors duration-300",
        c.ring,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", c.text)} strokeWidth={1.9} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-sm font-medium", c.text)}>{title}</p>
          <span className="numeric text-[11px] text-muted-foreground">{timestamp}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}