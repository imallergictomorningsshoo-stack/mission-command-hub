import { Link } from "@tanstack/react-router";
import { Radio, Rocket, BarChart3, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusChip } from "./status-chip";
import navarsLogo from "@/assets/navars-space-lab.png";
import gaudiumLogo from "@/assets/gaudium-school.png";

const tabs = [
  { to: "/", label: "Connection", icon: Radio },
  { to: "/mission", label: "Mission Control", icon: Rocket },
  { to: "/analysis", label: "Post-Mission Analysis", icon: BarChart3 },
  { to: "/export", label: "Export", icon: Download },
] as const;

export function TopNav() {
  const [utc, setUtc] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => setUtc(new Date().toISOString().slice(11, 19));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-8 px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={navarsLogo}
            alt="Navars Space Lab"
            className="h-7 w-auto brightness-150 saturate-150"
          />
          <span className="hidden h-8 w-px bg-border sm:block" />
          <img
            src={gaudiumLogo}
            alt="The Gaudium School"
            className="hidden h-8 w-auto rounded-md bg-foreground px-2 py-1 sm:block"
          />
        </Link>

        <nav className="flex items-center gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-signal"
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute inset-0 rounded-lg border border-signal/30 bg-signal/10 shadow-[0_0_20px_-8px_var(--signal)]" />
                  ) : null}
                  <Icon className="relative size-4" strokeWidth={1.8} />
                  <span className="relative whitespace-nowrap">{label}</span>
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span className="numeric hidden text-xs text-muted-foreground lg:block">
            UTC {utc}
          </span>
          <StatusChip tone="info" pulse>
            GCS v2.4.0
          </StatusChip>
        </div>
      </div>
    </header>
  );
}