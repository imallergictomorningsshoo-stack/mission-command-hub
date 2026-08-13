import { AlertTriangle, SignalLow, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertKind = "telemetry-lost" | "weak-signal";

const config = {
  "telemetry-lost": {
    icon: AlertTriangle,
    title: "Telemetry Lost",
    tone: "border-destructive/40 bg-destructive/10",
    text: "text-destructive",
  },
  "weak-signal": {
    icon: SignalLow,
    title: "Weak Signal",
    tone: "border-warn/40 bg-warn/10",
    text: "text-warn",
  },
} as const;

export function AlertPopup({
  kind,
  detail,
  timestamp,
  onDismiss,
}: {
  kind: AlertKind;
  detail: string;
  timestamp: string;
  onDismiss: () => void;
}) {
  const c = config[kind];
  const Icon = c.icon;
  return (
    <div className="fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
      <div
        role="alertdialog"
        aria-live="assertive"
        className={cn(
          "glass flex w-full max-w-lg items-start gap-3 rounded-2xl border px-5 py-4 shadow-lg",
          c.tone,
        )}
      >
        <Icon className={cn("mt-0.5 size-5 shrink-0 pulse-dot", c.text)} strokeWidth={1.9} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className={cn("text-sm font-semibold", c.text)}>{c.title}</p>
            <span className="numeric ml-auto text-[11px] text-muted-foreground">{timestamp}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export function AlertBanner({
  level,
  title,
  detail,
  timestamp,
}: {
  level: "critical" | "warning" | "resolved";
  title: string;
  detail: string;
  timestamp: string;
}) {
  const toneMap = {
    critical: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-warn/30 bg-warn/10 text-warn",
    resolved: "border-ok/30 bg-ok/10 text-ok",
  };

  return (
    <div className={cn("rounded-xl border p-2.5 text-xs", toneMap[level])}>
      <div className="flex items-center justify-between font-semibold">
        <span>{title}</span>
        <span className="text-[10px] opacity-75">{timestamp}</span>
      </div>
      <p className="mt-0.5 text-[11px] opacity-90">{detail}</p>
    </div>
  );
}
