import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl transition-all duration-300 hover:border-signal/25",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-3.5">
      <div className="flex items-baseline gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {hint ? <span className="label-caps">{hint}</span> : null}
      </div>
      {right}
    </div>
  );
}