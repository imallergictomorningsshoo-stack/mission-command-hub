import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { Tile } from "@/components/gcs/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "System Logs — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Ground station event log: serial link events, telemetry warnings and recovery notices for the CanSat mission.",
      },
      { property: "og:title", content: "System Logs — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Searchable ground station event and warning log.",
      },
    ],
  }),
  component: LogsPage,
});

type Level = "INFO" | "WARN" | "ERROR" | "DEBUG";

const entries: { t: string; level: Level; source: string; message: string }[] = [
  { t: "14:27:41", level: "INFO", source: "serial", message: "Opened COM3 at 57600 baud" },
  { t: "14:27:42", level: "INFO", source: "link", message: "Handshake complete — CANSAT-BH-01" },
  { t: "14:27:43", level: "DEBUG", source: "sensors", message: "BMP390 self-test OK (1013.18 hPa)" },
  { t: "14:27:44", level: "WARN", source: "sensors", message: "Magnetometer hard-iron drift 3.4 µT" },
  { t: "14:28:00", level: "INFO", source: "mission", message: "Mission armed by operator" },
  { t: "14:28:12", level: "INFO", source: "flight", message: "Launch detected — 4.2 g" },
  { t: "14:29:50", level: "INFO", source: "flight", message: "Apogee 742.0 m AGL" },
  { t: "14:29:53", level: "INFO", source: "recovery", message: "Nichrome cut fired — parachute deployed" },
  { t: "14:30:47", level: "WARN", source: "radio", message: "RSSI −91 dBm — weak signal" },
  { t: "14:30:51", level: "ERROR", source: "radio", message: "Telemetry lost for 4.0 s" },
  { t: "14:30:55", level: "INFO", source: "radio", message: "Connection restored — 3 packets dropped" },
  { t: "14:32:06", level: "INFO", source: "flight", message: "Touchdown — descent rate 6.4 m/s" },
  { t: "14:38:50", level: "INFO", source: "mission", message: "Payload recovered — 412 m bearing 067°" },
  { t: "14:39:02", level: "DEBUG", source: "storage", message: "Flushed 120 packets to session CSV" },
];

const levelCls: Record<Level, string> = {
  INFO: "text-signal",
  WARN: "text-warn",
  ERROR: "text-destructive",
  DEBUG: "text-muted-foreground",
};

function LogsPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"ALL" | Level>("ALL");

  const rows = entries.filter(
    (e) =>
      (level === "ALL" || e.level === level) &&
      (q === "" ||
        `${e.source} ${e.message}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">System · Session MRCC-2026-FLIGHT-04</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">System Logs</h1>
        </div>
        <GcsButton variant="outline" size="sm">
          <Download />
          Download Log
        </GcsButton>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Entries" value={String(entries.length)} />
        <Tile label="Warnings" value="2" tone="warn" />
        <Tile label="Errors" value="1" tone="destructive" />
        <Tile label="Session Uptime" value="00:12:43" tone="signal" />
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Event Stream"
          hint="Chronological"
          right={<StatusChip tone="online" pulse>Streaming</StatusChip>}
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-5 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter events…"
              className="w-full rounded-lg border border-input bg-panel py-2 pr-3 pl-8 text-xs outline-none focus:border-signal/60 focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1">
            {(["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "numeric rounded-lg border px-2.5 py-1.5 text-[10px] tracking-wider transition-colors",
                  level === l
                    ? "border-signal/40 bg-signal/10 text-signal"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {rows.map((e, i) => (
            <div
              key={`${e.t}-${i}`}
              className="flex items-start gap-4 border-b border-border/40 px-5 py-2 last:border-0 hover:bg-secondary/60"
            >
              <span className="numeric shrink-0 text-[11px] text-muted-foreground">{e.t}</span>
              <span className={cn("numeric w-14 shrink-0 text-[10px] tracking-wider", levelCls[e.level])}>
                {e.level}
              </span>
              <span className="numeric w-20 shrink-0 text-[11px] text-muted-foreground">{e.source}</span>
              <span className="text-xs">{e.message}</span>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted-foreground">No matching events.</p>
          ) : null}
        </div>
      </Panel>
    </main>
  );
}
