import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf, Search, Crosshair } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { TelemetryChart } from "@/components/gcs/telemetry-chart";
import { TelemetryTable } from "@/components/gcs/telemetry-table";
import { DataRow } from "@/components/gcs/summary-card";
import { Meter, Tile } from "@/components/gcs/ui-bits";
import { packets, stats } from "@/lib/telemetry";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Data Analysis — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "NIR vegetation index mapping, field-of-view geometry and searchable telemetry for the Bhoonidi CanSat payload.",
      },
      { property: "og:title", content: "Data Analysis — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Post-flight NIR analysis and telemetry data exploration.",
      },
    ],
  }),
  component: AnalysisPage,
});

const vegetation = [
  { zone: "Zone A — Paddy", ndvi: 0.78, area: "1.42 ha", tone: "ok" as const },
  { zone: "Zone B — Scrub", ndvi: 0.46, area: "0.88 ha", tone: "warn" as const },
  { zone: "Zone C — Bare Soil", ndvi: 0.14, area: "0.61 ha", tone: "destructive" as const },
  { zone: "Zone D — Tree Line", ndvi: 0.82, area: "0.35 ha", tone: "ok" as const },
];

function AnalysisPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const list = [...packets].reverse();
    if (!q) return list.slice(0, 40);
    return list
      .filter((p) =>
        `${p.id} ${p.time} ${p.state} ${p.altitude} ${p.pressure} ${p.temperature}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
      .slice(0, 40);
  }, [q]);

  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Science Payload · Flight 04</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Data Analysis</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info">3,412 NIR frames</StatusChip>
          <StatusChip tone="idle">120 packets</StatusChip>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Mean NDVI" value="0.55" tone="ok" note="Across 3.26 ha" />
        <Tile label="Max Altitude" value={stats.maxAltitude.toFixed(1)} unit="m" tone="signal" />
        <Tile label="Avg Pressure" value={stats.avgPressure.toFixed(1)} unit="hPa" />
        <Tile label="Avg Temperature" value={stats.avgTemperature.toFixed(1)} unit="°C" tone="warn" />
        <Tile label="Ground Sample" value="18.4" unit="cm/px" note="At apogee" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader
              title="NIR Vegetation Map"
              hint="NDVI"
              right={<Leaf className="size-4 text-ok" strokeWidth={1.8} />}
            />
            <div className="p-4">
              <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-border bg-[radial-gradient(120%_120%_at_30%_20%,color-mix(in_oklab,var(--ok)_45%,transparent),color-mix(in_oklab,var(--warn)_35%,transparent)_55%,color-mix(in_oklab,var(--destructive)_30%,transparent))]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, var(--grid) 0px, var(--grid) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(90deg, var(--grid) 0px, var(--grid) 1px, transparent 1px, transparent 26px)",
                  }}
                />
                <span className="absolute top-3 left-3 rounded-md border border-border bg-panel/85 px-2 py-1">
                  <span className="numeric text-[10px]">NDVI 0.14 – 0.82</span>
                </span>
                <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-md border border-border bg-panel/85 px-2 py-1">
                  <span className="numeric text-[10px] text-muted-foreground">LOW</span>
                  <span className="h-2 w-24 rounded-full bg-[linear-gradient(90deg,var(--destructive),var(--warn),var(--ok))]" />
                  <span className="numeric text-[10px] text-muted-foreground">HIGH</span>
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <TelemetryChart title="Pressure Trend" unit="hPa" dataKey="pressure" data={packets} color="var(--chart-2)" />
            <TelemetryChart title="Temperature Trend" unit="°C" dataKey="temperature" data={packets} color="var(--chart-4)" />
          </div>

          <Panel>
            <PanelHeader
              title="Telemetry Explorer"
              hint="Searchable"
              right={
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search packets…"
                    className="w-52 rounded-lg border border-input bg-panel py-1.5 pr-2 pl-8 text-xs outline-none focus:border-signal/60 focus:ring-2 focus:ring-ring"
                  />
                </div>
              }
            />
            <div className="max-h-[420px] overflow-y-auto">
              <TelemetryTable rows={rows} />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader title="Vegetation Index" hint="By zone" />
            <div className="space-y-4 px-5 py-4">
              {vegetation.map((v) => (
                <div key={v.zone}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{v.zone}</span>
                    <span className="numeric ml-auto text-[11px]">{v.ndvi.toFixed(2)}</span>
                  </div>
                  <Meter className="mt-2" value={v.ndvi * 100} tone={v.tone} />
                  <p className="numeric mt-1 text-[10px] text-muted-foreground">{v.area}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Field of View" hint="Optics" right={<Crosshair className="size-4 text-signal" strokeWidth={1.8} />} />
            <div className="px-5 py-2">
              <DataRow label="Sensor" value="OV5640 · 1/4″" />
              <DataRow label="Focal Length" value="3.6 mm" />
              <DataRow label="HFOV" value="62.2°" />
              <DataRow label="Swath @ 742 m" value="894 m" />
              <DataRow label="GSD @ 742 m" value="18.4 cm/px" />
              <DataRow label="Overlap" value="72 %" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Data Sources" hint="Post-flight" />
            <div className="px-5 py-2">
              <DataRow label="Telemetry CSV" value="120 rows" />
              <DataRow label="NIR Frames" value="3,412" />
              <DataRow label="Grayscale Frames" value="3,408" />
              <DataRow label="Onboard Log" value="10.8 GB" />
              <DataRow label="Integrity" value="CHECKSUM OK" />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
