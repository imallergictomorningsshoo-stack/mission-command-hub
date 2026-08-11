import { Link } from "@tanstack/react-router";
import {
  Radio,
  LayoutDashboard,
  ClipboardCheck,
  Rocket,
  Wind,
  Leaf,
  Download,
  Terminal,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import navarsLogo from "@/assets/navars-space-lab.png";
import gaudiumLogo from "@/assets/gaudium-school.png";

export type NavItem = { to: string; label: string; code: string; icon: LucideIcon };

export const navSections: { group: string; items: NavItem[] }[] = [
  {
    group: "Link",
    items: [{ to: "/", label: "Connection", code: "CON", icon: Radio }],
  },
  {
    group: "Mission",
    items: [
      { to: "/overview", label: "Mission Overview", code: "OVW", icon: LayoutDashboard },
      { to: "/pre-flight", label: "Pre-Flight", code: "PRE", icon: ClipboardCheck },
      { to: "/mission", label: "Flight Operations", code: "OPS", icon: Rocket },
      { to: "/post-flight", label: "Post-Flight", code: "PST", icon: Wind },
    ],
  },
  {
    group: "Science",
    items: [
      { to: "/analysis", label: "Data Analysis", code: "NIR", icon: Leaf },
      { to: "/export", label: "Export", code: "EXP", icon: Download },
    ],
  },
  {
    group: "System",
    items: [
      { to: "/configuration", label: "Configuration", code: "CFG", icon: SlidersHorizontal },
      { to: "/logs", label: "System Logs", code: "LOG", icon: Terminal },
    ],
  },
];

export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <img src={navarsLogo} alt="Navars Space Lab" className="h-7 w-auto brightness-150" />
        <span className="h-8 w-px bg-sidebar-border" />
        <img
          src={gaudiumLogo}
          alt="The Gaudium School"
          className="h-8 w-auto rounded bg-white/95 px-1.5 py-1"
        />
      </div>

      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="label-caps text-[10px] text-sidebar-foreground/50">Ground Station</p>
        <p className="font-display mt-1 text-sm font-semibold tracking-tight">BHOONIDI GCS</p>
        <p className="numeric mt-1 text-[11px] text-sidebar-foreground/50">CANSAT-BH-01 · MRCC 2026</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.group} className="mb-5 last:mb-0">
            <p className="label-caps px-2 pb-2 text-[9px] text-sidebar-foreground/40">
              {section.group}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, code, icon: Icon }) => (
                <Link
                  key={to}
                  to={to as "/"}
                  activeOptions={{ exact: to === "/" }}
                  className="group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={
                          isActive
                            ? "h-5 w-0.5 rounded-full bg-sidebar-primary"
                            : "h-5 w-0.5 rounded-full bg-transparent"
                        }
                      />
                      <Icon className="size-4" strokeWidth={1.7} />
                      <span className="truncate">{label}</span>
                      <span className="numeric ml-auto text-[9px] text-sidebar-foreground/35">
                        {code}
                      </span>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3">
        <p className="numeric text-[10px] text-sidebar-foreground/45">GCS v2.4.0 · BUILD 2026.08</p>
      </div>
    </aside>
  );
}
