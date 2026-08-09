import { cn } from "@/lib/utils";

export function SummaryStat({
  label,
  value,
  unit,
  note,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("glass rounded-2xl p-5 transition-colors hover:border-signal/25", className)}
    >
      <span className="label-caps">{label}</span>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="numeric text-3xl leading-none font-semibold">{value}</span>
        {unit ? <span className="numeric text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {note ? <p className="mt-2 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="numeric text-xs">{value}</span>
    </div>
  );
}
