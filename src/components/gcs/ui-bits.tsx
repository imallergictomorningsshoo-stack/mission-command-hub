import { Check, CircleDashed, CircleDot, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontal progress meter used across mission pages. */
export function Meter({
  value,
  tone = "signal",
  className,
}: {
  value: number;
  tone?: "signal" | "ok" | "warn" | "destructive";
  className?: string;
}) {
  const bar = {
    signal: "bg-signal",
    ok: "bg-ok",
    warn: "bg-warn",
    destructive: "bg-destructive",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", bar)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export type BuildState = "done" | "partial" | "pending";

const buildTone: Record<BuildState, { label: string; cls: string; Icon: typeof Check }> = {
  done: { label: "Implemented", cls: "border-ok/35 bg-ok/10 text-ok", Icon: Check },
  partial: { label: "Mocked", cls: "border-warn/35 bg-warn/10 text-warn", Icon: CircleDot },
  pending: {
    label: "Not built",
    cls: "border-destructive/30 bg-destructive/10 text-destructive",
    Icon: X,
  },
};

export function BuildBadge({ state, label }: { state: BuildState; label?: string }) {
  const t = buildTone[state];
  const Icon = t.Icon;
  return (
    <span
      className={cn(
        "numeric inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.1em] uppercase",
        t.cls,
      )}
    >
      <Icon className="size-3" strokeWidth={2.4} />
      {label ?? t.label}
    </span>
  );
}

export function CheckRow({
  label,
  detail,
  state = "done",
  value,
}: {
  label: string;
  detail?: string;
  state?: "done" | "warn" | "fail" | "pending";
  value?: string;
}) {
  const map = {
    done: { cls: "text-ok", Icon: Check },
    warn: { cls: "text-warn", Icon: CircleDot },
    fail: { cls: "text-destructive", Icon: X },
    pending: { cls: "text-muted-foreground", Icon: CircleDashed },
  } as const;
  const { cls, Icon } = map[state];
  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-0">
      <Icon className={cn("size-4 shrink-0", cls)} strokeWidth={2.2} />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{label}</p>
        {detail ? <p className="truncate text-[11px] text-muted-foreground">{detail}</p> : null}
      </div>
      <span className={cn("numeric ml-auto text-[11px]", cls)}>
        {value ?? (state === "done" ? "PASS" : state === "fail" ? "FAIL" : state === "warn" ? "CHECK" : "—")}
      </span>
    </div>
  );
}

/** Compact KPI tile used in dense grids. */
export function Tile({
  label,
  value,
  unit,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  tone?: "default" | "signal" | "ok" | "warn" | "destructive";
}) {
  const toneCls = {
    default: "text-foreground",
    signal: "text-signal",
    ok: "text-ok",
    warn: "text-warn",
    destructive: "text-destructive",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-panel px-4 py-3">
      <span className="label-caps text-[9px]">{label}</span>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={cn("numeric text-xl leading-none font-semibold", toneCls)}>{value}</span>
        {unit ? <span className="numeric text-[10px] text-muted-foreground">{unit}</span> : null}
      </div>
      {note ? <p className="mt-1 text-[11px] text-muted-foreground">{note}</p> : null}
    </div>
  );
}

/** Mission stage timeline (Launch → Apogee → Descent → Landed). */
export function StageTimeline({
  stages,
  activeIndex,
}: {
  stages: { label: string; time: string }[];
  activeIndex: number;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-5 py-4">
      {stages.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={s.label} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "status-dot",
                    done ? "bg-ok" : active ? "bg-signal pulse-dot" : "bg-muted-foreground/40",
                  )}
                />
                <span
                  className={cn(
                    "truncate text-xs font-medium",
                    active ? "text-signal" : done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              <p className="numeric mt-1 pl-4 text-[11px] text-muted-foreground">{s.time}</p>
              <Meter
                className="mt-2"
                value={done ? 100 : active ? 55 : 0}
                tone={done ? "ok" : "signal"}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
