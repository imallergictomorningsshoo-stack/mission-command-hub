import { FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { GcsButton } from "@/components/gcs/gcs-button";
import { StatusChip } from "@/components/gcs/status-chip";
import { DataRow } from "@/components/gcs/summary-card";
import { stats } from "@/lib/telemetry";

const options = [
  { icon: FileSpreadsheet, title: "Export CSV", detail: "Full packet log with all telemetry fields · ~18 KB", action: "Download CSV", ready: true },
  { icon: FileJson, title: "Export JSON", detail: "Structured dataset including mission metadata", action: "Coming Soon", ready: false },
  { icon: FileText, title: "Export PDF Report", detail: "Formatted mission report with charts and summary", action: "Coming Soon", ready: false },
];

export function ExportPage() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Flight 01 · CANSAT-BH-01</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Export</h1>
        </div>
        <StatusChip tone="online">Dataset Ready</StatusChip>
      </div>

      <Panel className="mt-6">
        <PanelHeader title="Mission Summary" hint="Bhoonidi · MRCC" />
        <div className="grid gap-x-10 px-5 py-2 sm:grid-cols-2">
          <div>
            <DataRow label="Mission ID" value="MRCC-BH-F01" />
            <DataRow label="Date" value="2026-08-01" />
            <DataRow label="Duration" value={stats.duration} />
            <DataRow label="Packets" value={`${stats.packetsReceived} / ${stats.packetsExpected}`} />
          </div>
          <div>
            <DataRow label="Max Altitude" value={`${stats.maxAltitude.toFixed(1)} m`} />
            <DataRow label="Avg Temperature" value={`${stats.avgTemperature.toFixed(2)} °C`} />
            <DataRow label="Avg Pressure" value={`${stats.avgPressure.toFixed(2)} hPa`} />
            <DataRow label="Max Tilt" value={`${stats.maxTilt.toFixed(1)}°`} />
          </div>
        </div>
      </Panel>

      <div className="mt-5 grid gap-4">
        {options.map(({ icon: Icon, title, detail, action, ready }) => (
          <Panel key={title} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className={`grid size-11 place-items-center rounded-xl border ${ready ? "border-signal/30 bg-signal/10" : "border-border bg-panel/50"}`}>
                <Icon className={`size-5 ${ready ? "text-signal" : "text-muted-foreground"}`} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
              </div>
            </div>
            <GcsButton variant={ready ? "primary" : "outline"} size="sm" disabled={!ready}>
              {action}
            </GcsButton>
          </Panel>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">Exports contain raw downlinked telemetry with no post-processing applied.</p>
    </main>
  );
}
