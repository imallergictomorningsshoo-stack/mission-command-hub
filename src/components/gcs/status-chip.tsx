import { cn } from "@/lib/utils";

type Tone = "online" | "offline" | "warn" | "idle" | "info";

const tones: Record<Tone, { dot: string; text: string; ring: string }> = {
  online: { dot: "bg-signal", text: "text-signal", ring: "border-signal/30 bg-signal/10" },
  offline: { dot: "bg-muted-foreground", text: "text-muted-foreground", ring: "border-border bg-muted/40" },
  warn: { dot: "bg-signal", text: "text-signal", ring: "border-signal/30 bg-signal/10" },
  idle: { dot: "bg-muted-foreground", text: "text-muted-foreground", ring: "border-border bg-muted/40" },
  info: { dot: "bg-signal", text: "text-signal", ring: "border-signal/30 bg-signal/10" },
};

export function StatusChip({
  tone = "idle",
  children,
  pulse = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 numeric text-[11px] tracking-[0.12em] uppercase",
        t.ring,
        t.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot, pulse && "pulse-dot")} />
      {children}
    </span>
  );
}