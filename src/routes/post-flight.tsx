import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Play } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { CameraFeed } from "@/components/gcs/camera-feed";
import { TelemetryChart } from "@/components/gcs/telemetry-chart";
import { DataRow } from "@/components/gcs/summary-card";
import { GcsButton } from "@/components/gcs/gcs-button";
import { Tile } from "@/components/gcs/ui-bits";
import { packets, stats } from "@/lib/telemetry";

export const Route = createFileRoute("/post-flight")({
  head: () => ({
    meta: [
      { title: "Post-Flight Summary — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Recovery timeline, mission outcomes and camera replay for the Bhoonidi CanSat flight at MRCC 2026.",
      },
      { property: "og:title", content: "Post-Flight Summary — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Recovery timeline and mission outcomes after touchdown.",
      },
    ],
  }),
  component: PostFlightPage,
});

const outcomes = [
  { label: "Telemetry downlink maintained", ok: true },
  { label: "Apogee above 700 m target", ok: true },
  { label: "Parachute deployed at set altitude", ok: true },
  { label: "Both camera feeds recorded", ok: true },
  { label: "Payload recovered intact", ok: true },
  { label: "Continuous GPS lock", ok: false },
];

const timeline = [
  { t: "T+ 00:00:00", label: "Launch detected", note: "Accelerometer trigger 4.2 g" },
  { t: "T+ 00:00:12", label: "Motor burnout", note: "Velocity 132 m/s" },
  { t: "T+ 00:01:38", label: "Apogee", note: `${stats.maxAltitude.toFixed(1)} m AGL` },
  { t: "T+ 00:01:41", label: "Parachute deploy", note: "Nichrome cut confirmed" },
  { t: "T+ 00:02:55", label: "Telemetry gap", note: "4.0 s dropout, auto-recovered" },
  { t: "T+ 00:04:18", label: "Touchdown", note: "Descent rate 6.4 m/s" },
  { t: "T+ 00:11:02", label: "Payload recovered", note: "412 m from launch pad" },
];

function PostFlightPage() {
  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Flight 04 · Recovered</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Post-Flight Analysis</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="online">Mission Success</StatusChip>
          <GcsButton variant="outline" size="sm">
            <Play />
            Replay Flight
          </GcsButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Max Altitude" value={stats.maxAltitude.toFixed(1)} unit="m" tone="signal" />
        <Tile label="Flight Time" value={stats.duration} />
        <Tile label="Max Tilt" value={stats.maxTilt.toFixed(1)} unit="°" tone="warn" />
        <Tile label="Avg Temp" value={stats.avgTemperature.toFixed(1)} unit="°C" />
        <Tile label="Recovery Distance" value="412" unit="m" tone="online" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <CameraFeed title="Camera A Replay" hint="NIR · 3,412 frames" mode="nir" resolution="1280×720" fps="12 fps" />
            <CameraFeed title="Camera B Replay" hint="Grayscale · 3,408 frames" mode="gray" resolution="1280×720" fps="15 fps" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TelemetryChart title="Altitude vs Time" unit="m AGL" dataKey="altitude" data={packets} />
            <TelemetryChart title="Tilt vs Time" unit="deg" dataKey="tilt" data={packets} color="var(--chart-3)" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader title="Mission Outcomes" hint="Objectives" right={<StatusChip tone="online">5 / 6</StatusChip>} />
            <div className="px-5 py-3">
              {outcomes.map((o) => (
                <div key={o.label} className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-0">
                  <CheckCircle2
                    className={o.ok ? "size-4 shrink-0 text-ok" : "size-4 shrink-0 text-muted-foreground/50"}
                    strokeWidth={2}
                  />
                  <span className={o.ok ? "text-xs" : "text-xs text-muted-foreground line-through"}>
                    {o.label}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Recovery Timeline" hint="Events" right={<MapPin className="size-4 text-signal" strokeWidth={1.8} />} />
            <div className="px-5 py-4">
              {timeline.map((e, i) => (
                <div key={e.t} className="relative pl-6 pb-4 last:pb-0">
                  <span className="absolute top-1 left-0 size-2.5 rounded-full border-2 border-signal bg-background" />
                  {i < timeline.length - 1 ? (
                    <span className="absolute top-4 left-[4.5px] h-full w-px bg-border" />
                  ) : null}
                  <p className="numeric text-[10px] text-muted-foreground">{e.t}</p>
                  <p className="text-xs font-medium">{e.label}</p>
                  <p className="text-[11px] text-muted-foreground">{e.note}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Landing Site" hint="GPS" />
            <div className="px-5 py-2">
              <DataRow label="Latitude" value="3.20581 N" />
              <DataRow label="Longitude" value="101.70443 E" />
              <DataRow label="Bearing" value="067° NE" />
              <DataRow label="Terrain" value="Grass field" />
              <DataRow label="Recovery Team" value="TEAM B · 11 min" />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
