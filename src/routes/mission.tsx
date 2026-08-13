import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gauge, Mountain, Thermometer, Compass, Send, Power, CircleStop, Camera } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { TelemetryCard } from "@/components/gcs/telemetry-card";
import { TelemetryTable } from "@/components/gcs/telemetry-table";
import { AlertPopup, type AlertKind } from "@/components/gcs/alert-popup";
import { CameraFeed } from "@/components/gcs/camera-feed";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { DataRow } from "@/components/gcs/summary-card";
import { AttitudeDial } from "@/components/gcs/attitude-dial";
import { StageTimeline, Tile } from "@/components/gcs/ui-bits";
import { packets, latest } from "@/lib/telemetry";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Flight Operations — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Live CanSat flight operations: telemetry cards, attitude, dual camera feeds, command panel and packet log.",
      },
      { property: "og:title", content: "Flight Operations — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Real-time CanSat flight operations console for the MRCC mission.",
      },
    ],
  }),
  component: FlightOperations,
});

const stages = [
  { label: "Launch", time: "T+ 00:00:00" },
  { label: "Burnout", time: "T+ 00:00:12" },
  { label: "Apogee", time: "T+ 00:01:38" },
  { label: "Descent", time: "T+ 00:01:41" },
  { label: "Landed", time: "T+ 00:04:18" },
];

const commands = [
  { label: "Deploy Recovery", icon: Send, tone: "primary" as const },
  { label: "Capture Frame", icon: Camera, tone: "outline" as const },
  { label: "Reset Telemetry", icon: Power, tone: "outline" as const },
  { label: "Abort Sequence", icon: CircleStop, tone: "danger" as const },
];

function FlightOperations() {
  const prev = packets[packets.length - 2]!;
  const recent = [...packets].slice(-14).reverse();
  const [alert, setAlert] = useState<{ kind: AlertKind; detail: string; timestamp: string } | null>(
    null,
  );

  // Raise a popup only for telemetry loss or weak-signal conditions.
  useEffect(() => {
    const stamp = () => new Date().toISOString().slice(11, 19);
    const t1 = setTimeout(
      () =>
        setAlert({
          kind: "weak-signal",
          detail: "RSSI dropped to −91 dBm. Check antenna alignment.",
          timestamp: stamp(),
        }),
      4000,
    );
    const t2 = setTimeout(
      () =>
        setAlert({
          kind: "telemetry-lost",
          detail: "No packets received for 4.0 s — downlink gap during descent.",
          timestamp: stamp(),
        }),
      12000,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      {alert ? (
        <AlertPopup
          kind={alert.kind}
          detail={alert.detail}
          timestamp={alert.timestamp}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Live Flight · CANSAT-BH-01</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Flight Operations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info" pulse>
            {latest.state}
          </StatusChip>
          <StatusChip tone="online">RSSI −64 dBm</StatusChip>
          <StatusChip tone="idle">1 Hz Downlink</StatusChip>
        </div>
      </div>

      <Panel className="mt-5">
        <PanelHeader
          title="Flight Phase"
          hint="Sequence"
          right={<span className="numeric text-xs text-signal">MET 00:04:18</span>}
        />
        <StageTimeline stages={stages} activeIndex={4} />
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="grid gap-4 lg:grid-cols-2">
            <CameraFeed title="Payload Camera A" hint="Near-Infrared" mode="nir" />
            <CameraFeed title="Payload Camera B" hint="Grayscale" mode="gray" />
          </div>

          <Panel>
            <PanelHeader title="Attitude & Rates" hint="IMU" right={<StatusChip tone="online" pulse>Live</StatusChip>} />
            <div className="grid gap-3 px-5 py-4 sm:grid-cols-4">
              <AttitudeDial label="Pitch" angle={latest.tilt * 0.6} />
              <AttitudeDial label="Roll" angle={-latest.tilt * 0.4} />
              <AttitudeDial label="Yaw Rate" angle={12.4} unit="°/s" max={180} />
              <div className="grid gap-2">
                <Tile label="Descent Rate" value="6.4" unit="m/s" tone="signal" />
                <Tile label="G-Load" value="1.02" unit="g" />
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
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
            <PanelHeader title="Command Panel" hint="Uplink" right={<StatusChip tone="warn">Armed</StatusChip>} />
            <div className="grid gap-2 px-5 py-4">
              {commands.map(({ label, icon: Icon, tone }) => (
                <GcsButton key={label} variant={tone} size="sm" className="justify-start">
                  <Icon />
                  {label}
                </GcsButton>
              ))}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Uplink commands are staged in the UI only — no radio transmit is wired yet.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="mt-4">
        <PanelHeader
          title="Telemetry Log"
          hint="Live Stream"
          right={
            <StatusChip tone="online" pulse>
              Receiving
            </StatusChip>
          }
        />
        <TelemetryTable rows={recent} />
      </Panel>
    </main>
  );
}
