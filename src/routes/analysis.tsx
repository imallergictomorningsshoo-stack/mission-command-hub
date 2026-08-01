import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { TelemetryChart } from "@/components/gcs/telemetry-chart";
import { TelemetryTable } from "@/components/gcs/telemetry-table";
import { SummaryStat, DataRow } from "@/components/gcs/summary-card";
import { StatusChip } from "@/components/gcs/status-chip";
import { packets, stats } from "@/lib/telemetry";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Post-Mission Analysis — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Flight summary, packet statistics and pressure trend analysis for the Bhoonidi CanSat flight.",
      },
      { property: "og:title", content: "Post-Mission Analysis — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Engineering review of recorded CanSat flight telemetry.",
      },
    ],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = [...packets].reverse();
    if (!q) return source.slice(0, 25);
    return source
      .filter((p) =>
        [p.id, p.time, p.altitude, p.pressure, p.temperature, p.tilt, p.state]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 25);
  }, [query]);

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Flight 01 · 14:27 – 14:32 UTC</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Post-Mission Analysis</h1>
        </div>
        <StatusChip tone="info">Dataset Archived</StatusChip>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Maximum Altitude"
          value={stats.maxAltitude.toFixed(1)}
          unit="m AGL"
          note="Apogee reached at T+01:36"
        />
        <SummaryStat
          label="Average Temperature"
          value={stats.avgTemperature.toFixed(2)}
          unit="°C"
          note="Range 24.1 – 28.9 °C"
        />
        <SummaryStat
          label="Average Pressure"
          value={stats.avgPressure.toFixed(2)}
          unit="hPa"
          note={`Minimum ${stats.minPressure.toFixed(2)} hPa at apogee`}
        />
        <SummaryStat
          label="Maximum Tilt"
          value={stats.maxTilt.toFixed(1)}
          unit="deg"
          note="Peak oscillation under canopy"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-5 lg:grid-cols-2">
          <TelemetryChart title="Altitude Profile" unit="metres AGL" dataKey="altitude" data={packets} height={220} />
          <TelemetryChart
            title="Pressure Trend"
            unit="hectopascals"
            dataKey="pressure"
            data={packets}
            color="var(--chart-2)"
            height={220}
          />
          <TelemetryChart
            title="Thermal Profile"
            unit="degrees celsius"
            dataKey="temperature"
            data={packets}
            color="var(--chart-4)"
            height={220}
          />
          <TelemetryChart
            title="Attitude Stability"
            unit="degrees"
            dataKey="tilt"
            data={packets}
            color="var(--chart-3)"
            height={220}
          />
        </div>

        <div className="grid gap-5 content-start">
          <Panel>
            <PanelHeader title="Flight Summary" hint="Overview" />
            <div className="px-5 py-2">
              <DataRow label="Mission Duration" value={stats.duration} />
              <DataRow label="Launch Time" value="14:27:48 UTC" />
              <DataRow label="Apogee" value={`${stats.maxAltitude.toFixed(1)} m`} />
              <DataRow label="Descent Rate (avg)" value="6.4 m/s" />
              <DataRow label="Landing State" value="NOMINAL" />
              <DataRow label="Recovery" value="CONFIRMED" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Packet Statistics" hint="Link Quality" />
            <div className="px-5 py-2">
              <DataRow label="Received" value={String(stats.packetsReceived)} />
              <DataRow label="Expected" value={String(stats.packetsExpected)} />
              <DataRow label="Dropped" value="4" />
              <DataRow label="Loss Rate" value="3.2 %" />
              <DataRow label="Mean Interval" value="2.00 s" />
              <DataRow label="Worst RSSI" value="−91 dBm" />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Pressure Trend Analysis" hint="Derived" />
            <div className="space-y-3 px-5 py-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Pressure decreased monotonically through ascent at a mean rate of
                <span className="numeric text-foreground"> 1.19 hPa/s</span>, inverting within
                two packets of apogee. The recovery curve tracks the barometric model to within
                <span className="numeric text-foreground"> ±0.42 hPa</span>, indicating a healthy
                sensor with no saturation events.
              </p>
              <div className="flex flex-wrap gap-2">
                <StatusChip tone="online">Sensor Nominal</StatusChip>
                <StatusChip tone="idle">No Drift</StatusChip>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="mt-5">
        <PanelHeader
          title="Telemetry Records"
          hint={`${rows.length} shown`}
          right={
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search packets…"
                className="numeric h-9 w-64 rounded-lg border border-border bg-panel/50 pr-3 pl-9 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-signal/40 focus:ring-2 focus:ring-ring"
              />
            </div>
          }
        />
        <TelemetryTable rows={rows} />
      </Panel>
    </main>
  );
}