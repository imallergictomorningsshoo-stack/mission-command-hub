import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Gauge, Mountain, Thermometer, Compass } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { TelemetryCard } from "@/components/gcs/telemetry-card";
import { TelemetryChart } from "@/components/gcs/telemetry-chart";
import { TelemetryTable } from "@/components/gcs/telemetry-table";
import { AlertBanner } from "@/components/gcs/alert-banner";
import { CameraFeed } from "@/components/gcs/camera-feed";
import { StatusChip } from "@/components/gcs/status-chip";
import { DataRow } from "@/components/gcs/summary-card";
import { useTelemetry } from "@/context/TelemetryContext";

const mapFlightModeToState = (mode: string) => {
  switch (mode.toLowerCase()) {
    case "ascent":
      return "ASCENT"
    case "apogee":
      return "APOGEE"
    case "descent":
      return "DESCENT"
    case "landed":
      return "LANDED"
    default:
      return "IDLE"
  }
}

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Mission Control — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Live CanSat telemetry: altitude, pressure, temperature and tilt with real-time charts and packet log.",
      },
      { property: "og:title", content: "Mission Control — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Real-time CanSat flight telemetry for the MRCC mission.",
      },
    ],
  }),
  component: MissionControl,
});

function MissionControl() {
  const { telemetry, history, connection, flightMode } = useTelemetry();

  const recent = useMemo(() => {
    return history.map((entry) => ({
      id: entry.id,
      time: entry.time,
      altitude: entry.altitude,
      pressure: entry.pressure,
      temperature: entry.temperature,
      tilt: Math.sqrt(entry.pitch ** 2 + entry.roll ** 2),
      voltage: entry.battery,
      state: mapFlightModeToState(entry.flightMode),
    }))
  }, [history]);

  const latest = recent[0] ?? {
    id: 0,
    time: "--:--",
    altitude: 0,
    pressure: 0,
    temperature: 0,
    tilt: 0,
    voltage: telemetry.battery,
    state: mapFlightModeToState(telemetry.flightMode),
  };

  const prev = recent[1] ?? latest;

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Live Flight · CANSAT-BH-01</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Mission Control</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info" pulse>
            {latest.state}
          </StatusChip>
          <StatusChip tone="online">RSSI −64 dBm</StatusChip>
          <StatusChip tone="idle">1 Hz Downlink</StatusChip>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <TelemetryCard
            label="Altitude"
            value={latest.altitude.toFixed(1)}
            unit="m AGL"
            icon={Mountain}
            delta={`${Math.abs(latest.altitude - prev.altitude).toFixed(1)} m`}
            trend={latest.altitude >= prev.altitude ? "up" : "down"}
          />
          <TelemetryCard
            label="Pressure"
            value={latest.pressure.toFixed(2)}
            unit="hPa"
            icon={Gauge}
            accent="accent"
            delta={`${Math.abs(latest.pressure - prev.pressure).toFixed(2)} hPa`}
            trend={latest.pressure >= prev.pressure ? "up" : "down"}
          />
          <TelemetryCard
            label="Temperature"
            value={latest.temperature.toFixed(2)}
            unit="°C"
            icon={Thermometer}
            accent="warn"
            delta={`${Math.abs(latest.temperature - prev.temperature).toFixed(2)} °C`}
            trend={latest.temperature >= prev.temperature ? "up" : "down"}
          />
          <TelemetryCard
            label="Tilt"
            value={latest.tilt.toFixed(1)}
            unit="deg"
            icon={Compass}
            accent="ok"
            delta={`${Math.abs(latest.tilt - prev.tilt).toFixed(1)}°`}
            trend={latest.tilt >= prev.tilt ? "up" : "down"}
          />
        </div>

        <Panel className="xl:row-span-2">
          <PanelHeader title="Mission Information" hint="Status" />
          <div className="px-5 py-4">
            <div className="rounded-xl border border-signal/25 bg-signal/5 px-4 py-4 text-center">
              <span className="label-caps">Mission Elapsed Time</span>
              <p className="numeric mt-2 text-3xl font-semibold text-signal">00:04:18</p>
            </div>
            <div className="mt-3">
              <DataRow label="Packets Received" value="120" />
              <DataRow label="Packets Expected" value="124" />
              <DataRow label="Packet Loss" value="3.2 %" />
              <DataRow label="Last Packet" value="14:32:06 UTC" />
              <DataRow label="Ground Station" value="CONNECTED" />
              <DataRow label="Serial Port" value="COM3 · 57600" />
              <DataRow label="Battery" value={`${latest.voltage.toFixed(2)} V`} />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Alerts" hint="Event Log" right={<StatusChip tone="warn">2 Active</StatusChip>} />
          <div className="space-y-2.5 p-4">
            <AlertBanner
              level="critical"
              title="Telemetry Lost"
              detail="No packets received for 4.0 s — downlink gap during descent."
              timestamp="14:31:22"
            />
            <AlertBanner
              level="warning"
              title="Weak Signal"
              detail="RSSI dropped to −91 dBm. Check antenna alignment."
              timestamp="14:31:48"
            />
            <AlertBanner
              level="resolved"
              title="Connection Restored"
              detail="Link re-acquired. Packet sequence resynchronised at #0114."
              timestamp="14:31:56"
            />
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <CameraFeed
          title="Payload Camera A"
          hint="Near-Infrared"
          mode="nir"
          resolution="1280×720"
          fps="12 fps"
        />
        <CameraFeed
          title="Payload Camera B"
          hint="Grayscale"
          mode="gray"
          resolution="1280×720"
          fps="15 fps"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <TelemetryChart title="Altitude vs Time" unit="metres AGL" dataKey="altitude" data={recent} />
        <TelemetryChart
          title="Pressure vs Time"
          unit="hectopascals"
          dataKey="pressure"
          data={recent}
          color="var(--chart-2)"
        />
        <TelemetryChart
          title="Temperature vs Time"
          unit="degrees celsius"
          dataKey="temperature"
          data={recent}
          color="var(--chart-4)"
        />
        <TelemetryChart
          title="Tilt vs Time"
          unit="degrees"
          dataKey="tilt"
          data={recent}
          color="var(--chart-3)"
        />
      </div>

      <Panel className="mt-5">
        <PanelHeader
          title="Telemetry Log"
          hint="Live Stream"
          right={<StatusChip tone="online" pulse>Receiving</StatusChip>}
        />
        <TelemetryTable rows={recent} />
      </Panel>
    </main>
  );
}