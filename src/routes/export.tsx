import { createFileRoute } from "@tanstack/react-router";
<<<<<<< HEAD
import { ExportPage } from "@/pages/ExportPage";
=======
import { useMemo, useState } from "react";
import { FileJson, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { GcsButton } from "@/components/gcs/gcs-button";
import { StatusChip } from "@/components/gcs/status-chip";
import { DataRow } from "@/components/gcs/summary-card";
import { packets as demoPackets, stats } from "@/lib/telemetry";
import { useLink } from "@/lib/serial-link";
import { useConfig } from "@/lib/gcs-config";
import { toCsv, toJson, download, estimateSize, printReport } from "@/lib/export-data";
>>>>>>> origin/main

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export Mission Data — Bhoonidi GCS" },
      {
        name: "description",
        content: "Export recorded CanSat telemetry as CSV, JSON or a formatted PDF mission report.",
      },
      { property: "og:title", content: "Export Mission Data — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Download the Bhoonidi CanSat flight dataset and mission report.",
      },
    ],
  }),
  component: ExportPage,
});
<<<<<<< HEAD
=======

function ExportPage() {
  const link = useLink();
  const config = useConfig();
  const [last, setLast] = useState<string | null>(null);

  const isLive = link.packets.length > 0;
  const rows = isLive ? link.packets : demoPackets;

  const csv = useMemo(() => toCsv(rows), [rows]);
  const meta = useMemo(
    () => ({
      mission: "MRCC-BH-F01",
      team: "Bhoonidi",
      session: config.sessionName,
      source: isLive ? "live serial downlink" : "recorded demo dataset",
      exportedAt: new Date().toISOString(),
      radio: { frequency: config.frequency, spreadingFactor: config.spreadingFactor },
    }),
    [config, isLive],
  );
  const json = useMemo(() => toJson(rows, meta), [rows, meta]);

  const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const options = [
    {
      icon: FileSpreadsheet,
      title: "Export CSV",
      detail: `Full packet log with all telemetry fields · ${estimateSize(csv)}`,
      action: "Download CSV",
      run: () => {
        download(`${config.sessionName}-${stamp()}.csv`, csv, "text/csv;charset=utf-8");
        setLast("CSV file generated.");
      },
    },
    {
      icon: FileJson,
      title: "Export JSON",
      detail: `Structured dataset including mission metadata · ${estimateSize(json)}`,
      action: "Download JSON",
      run: () => {
        download(`${config.sessionName}-${stamp()}.json`, json, "application/json");
        setLast("JSON file generated.");
      },
    },
    {
      icon: FileText,
      title: "Export PDF Report",
      detail: "Formatted mission report — opens the print dialog, choose “Save as PDF”",
      action: "Generate PDF",
      run: () => {
        const ok = printReport({
          title: `Mission Report — ${config.sessionName}`,
          summary: [
            ["Mission ID", "MRCC-BH-F01"],
            ["Data source", isLive ? "Live serial downlink" : "Recorded dataset"],
            ["Packets", String(rows.length)],
            ["Max altitude", `${Math.max(...rows.map((p) => p.altitude)).toFixed(1)} m`],
            ["Duration", stats.duration],
          ],
          rows,
        });
        setLast(ok ? "Report opened in a new tab." : "Pop-up blocked — allow pop-ups to print.");
      },
    },
  ];

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Flight 01 · CANSAT-BH-01</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Export</h1>
        </div>
        <StatusChip tone={isLive ? "online" : "idle"}>
          {isLive ? `Live capture · ${rows.length} packets` : "Recorded dataset"}
        </StatusChip>
      </div>

      <Panel className="mt-6">
        <PanelHeader title="Mission Summary" hint="Bhoonidi · MRCC" />
        <div className="grid gap-x-10 px-5 py-2 sm:grid-cols-2">
          <div>
            <DataRow label="Mission ID" value="MRCC-BH-F01" />
            <DataRow label="Session" value={config.sessionName} />
            <DataRow label="Duration" value={stats.duration} />
            <DataRow label="Packets" value={`${rows.length}`} />
          </div>
          <div>
            <DataRow
              label="Max Altitude"
              value={`${Math.max(...rows.map((p) => p.altitude)).toFixed(1)} m`}
            />
            <DataRow label="Avg Temperature" value={`${stats.avgTemperature.toFixed(2)} °C`} />
            <DataRow label="Avg Pressure" value={`${stats.avgPressure.toFixed(2)} hPa`} />
            <DataRow label="Malformed Frames" value={`${link.malformed}`} />
          </div>
        </div>
      </Panel>

      <div className="mt-5 grid gap-4">
        {options.map(({ icon: Icon, title, detail, action, run }) => (
          <Panel key={title} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl border border-signal/30 bg-signal/10">
                <Icon className="size-5 text-signal" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
              </div>
            </div>
            <GcsButton variant="primary" size="sm" onClick={run}>
              <Download />
              {action}
            </GcsButton>
          </Panel>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {last ?? "Exports contain raw downlinked telemetry with no post-processing applied."}
      </p>
    </main>
  );
}
>>>>>>> origin/main
