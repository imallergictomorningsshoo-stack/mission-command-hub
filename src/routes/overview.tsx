import { createFileRoute } from "@tanstack/react-router";
import { Battery, Cpu, HardDrive, Radio, Rocket, Thermometer } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { DataRow } from "@/components/gcs/summary-card";
import { TelemetryChart } from "@/components/gcs/telemetry-chart";
import { Meter, Tile, StageTimeline } from "@/components/gcs/ui-bits";
import { packets, latest, stats } from "@/lib/telemetry";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Mission Overview — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "CanSat status, mission progress, subsystem health and telemetry summary for the Bhoonidi MRCC flight.",
      },
      { property: "og:title", content: "Mission Overview — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Live CanSat status and subsystem health at a glance.",
      },
    ],
  }),
  component: OverviewPage,
});

const health = [
  { label: "Flight Computer", icon: Cpu, value: 98, note: "RP2040 · 42 °C" },
  { label: "Radio Link", icon: Radio, value: 91, note: "LoRa 433 MHz · −64 dBm" },
  { label: "Power Bus", icon: Battery, value: 76, note: `${latest.voltage.toFixed(2)} V · 2S Li-ion` },
  { label: "Storage", icon: HardDrive, value: 34, note: "SD 32 GB · 10.8 GB used" },
  { label: "Thermal", icon: Thermometer, value: 88, note: `Payload ${latest.temperature.toFixed(1)} °C` },
];

const stages = [
  { label: "Pre-Flight", time: "T− 00:20:00" },
  { label: "Launch", time: "T+ 00:00:00" },
  { label: "Apogee", time: "T+ 00:01:38" },
  { label: "Descent", time: "T+ 00:01:41" },
  { label: "Landed", time: "T+ 00:04:18" },
];

function OverviewPage() {
  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Malaysian Rocket Competition 2026 · Team Bhoonidi</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Mission Overview</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info" pulse>
            {latest.state}
          </StatusChip>
          <StatusChip tone="online">Nominal</StatusChip>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Max Altitude" value={stats.maxAltitude.toFixed(1)} unit="m AGL" tone="signal" note="Apogee at T+01:38" />
        <Tile label="Flight Duration" value={stats.duration} note="Launch to touchdown" />
        <Tile label="Packets" value={`${stats.packetsReceived}/${stats.packetsExpected}`} note="3.2 % loss" tone="ok" />
        <Tile label="Battery" value={latest.voltage.toFixed(2)} unit="V" tone="warn" note="Discharge 0.24 V/min" />
      </div>

      <Panel className="mt-4">
        <PanelHeader title="Mission Progress" hint="Timeline" right={<StatusChip tone="online">Complete</StatusChip>} />
        <StageTimeline stages={stages} activeIndex={4} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4 lg:grid-cols-2">
          <TelemetryChart title="Altitude Profile" unit="m AGL" dataKey="altitude" data={packets} />
          <TelemetryChart
            title="Battery Voltage"
            unit="V"
            dataKey="voltage"
            data={packets}
            color="var(--chart-4)"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader title="System Health" hint="Subsystems" />
            <div className="space-y-3.5 px-5 py-4">
              {health.map(({ label, icon: Icon, value, note }) => (
                <div key={label}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-signal" strokeWidth={1.8} />
                    <span className="text-xs font-medium">{label}</span>
                    <span className="numeric ml-auto text-[11px] text-muted-foreground">{value}%</span>
                  </div>
                  <Meter className="mt-2" value={value} tone={value > 70 ? "ok" : value > 45 ? "warn" : "destructive"} />
                  <p className="numeric mt-1 text-[10px] text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="CanSat Status" hint="Payload" right={<Rocket className="size-4 text-signal" strokeWidth={1.6} />} />
            <div className="px-5 py-2">
              <DataRow label="Payload ID" value="CANSAT-BH-01" />
              <DataRow label="Mass" value="342 g" />
              <DataRow label="Recovery" value="PARACHUTE DEPLOYED" />
              <DataRow label="Descent Rate" value="6.4 m/s" />
              <DataRow label="Last Fix" value="3.2058 N, 101.7 E" />
              <DataRow label="Ground Station" value="CONNECTED" />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
