import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Signal } from "lucide-react";
import { StatusChip } from "./status-chip";
import { ThemeToggle } from "./theme-toggle";
import { navSections } from "./side-nav";

const titles: Record<string, { title: string; sub: string }> = Object.fromEntries(
  navSections.flatMap((s) =>
    s.items.map((i) => [i.to, { title: i.label, sub: `${s.group} · ${i.code}` }]),
  ),
);

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [utc, setUtc] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setUtc(new Date().toISOString().slice(11, 19));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const meta = titles[pathname] ?? { title: "Bhoonidi GCS", sub: "Ground Station" };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-6">
        <div className="min-w-0">
          <p className="label-caps text-[9px]">{meta.sub}</p>
          <h2 className="truncate text-sm font-semibold tracking-tight">{meta.title}</h2>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="numeric hidden text-xs text-muted-foreground xl:block">UTC {utc}</span>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Signal className="size-3.5 text-ok" strokeWidth={1.9} />
            <span className="numeric">−64 dBm</span>
          </span>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
            <Activity className="size-3.5 text-signal" strokeWidth={1.9} />
            <span className="numeric">1 Hz</span>
          </span>
          <ThemeToggle />
          <StatusChip tone="online" pulse>
            Link Live
          </StatusChip>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
        {navSections.flatMap((s) => s.items).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to as "/"}
            activeOptions={{ exact: to === "/" }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap text-muted-foreground transition-colors data-[status=active]:bg-signal/10 data-[status=active]:text-signal"
          >
            <Icon className="size-3.5" strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
