import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Gauge, Mountain, Thermometer, Compass, Send, Power, CircleStop, Camera } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { TelemetryCard } from "@/components/gcs/telemetry-card";
import { TelemetryTable } from "@/components/gcs/telemetry-table";
import { AlertPopup, type AlertKind } from "@/components/gcs/alert-popup";
import { CameraFeed } from "@/components/gcs/camera-feed";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { AttitudeDial } from "@/components/gcs/attitude-dial";
import { StageTimeline } from "@/components/gcs/ui-bits";
import { packets as demoPackets } from "@/lib/telemetry";
import { useLink, sendCommand } from "@/lib/serial-link";
import { useConfig } from "@/lib/gcs-config";

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
  { label: "Deploy Recovery", cmd: "CMD:DEPLOY", icon: Send, tone: "primary" as const },
  { label: "Capture Frame", cmd: "CMD:CAPTURE", icon: Camera, tone: "outline" as const },
  { label: "Reset Telemetry", cmd: "CMD:RESET", icon: Power, tone: "outline" as const },
  { label: "Abort Sequence", cmd: "CMD:ABORT", icon: CircleStop, tone: "danger" as const },
];

function met(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function FlightOperations() {
  const link = useLink();
  const config = useConfig();
  const [alert, setAlert] = useState<{ kind: AlertKind; detail: string; timestamp: string } | null>(
    null,
  );
  const lostRef = useRef(false);

  const isLive = link.status === "connected" && link.packets.length > 0;
  const source = isLive ? link.packets : demoPackets;
  const latest = source[source.length - 1]!;
  const prev = source[source.length - 2] ?? latest;
  const recent = [...source].slice(-12).reverse();

  // Telemetry-lost watchdog driven by the configured packet timeout.
  useEffect(() => {
    if (link.status !== "connected") return;
    const timeoutMs = (Number(config.packetTimeout) || 4) * 1000;
    const id = window.setInterval(() => {
      const last = link.lastPacketAt;
      const gap = last ? Date.now() - last : Infinity;
      if (gap > timeoutMs && !lostRef.current) {
        lostRef.current = true;
        setAlert({
          kind: "telemetry-lost",
          detail: `No packets received for ${(gap / 1000).toFixed(1)} s on ${link.portLabel ?? "the serial link"}.`,
          timestamp: new Date().toISOString().slice(11, 19),
        });
      } else if (gap <= timeoutMs) {
        lostRef.current = false;
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [link.status, link.lastPacketAt, link.portLabel, config.packetTimeout]);

  // Weak-signal warning derived from the battery/link health of the latest packet.
  useEffect(() => {
    if (!isLive) return;
    if (latest.voltage && latest.voltage < Number(config.lowBattery)) {
      setAlert({
        kind: "weak-signal",
        detail: `Payload battery at ${latest.voltage.toFixed(2)} V — below the ${config.lowBattery} V threshold.`,
        timestamp: new Date().toISOString().slice(11, 19),
      });
    }
  }, [isLive, latest.voltage, config.lowBattery]);

  return (
    <main className="flex h-full min-h-0 w-full flex-col gap-2.5 overflow-hidden px-4 py-3">
      {alert ? (
        <AlertPopup
          kind={alert.kind}
          detail={alert.detail}
          timestamp={alert.timestamp}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Flight Operations</h1>
          <span className="label-caps">CANSAT-BH-01</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="info" pulse>
            {latest.state}
          </StatusChip>
          <StatusChip tone={isLive ? "online" : "idle"}>
            {isLive ? `Live · ${link.packets.length} pkt` : "Demo Data"}
          </StatusChip>
          <StatusChip tone="idle">{config.packetRate.toFixed(1)} Hz Downlink</StatusChip>
        </div>
      </div>

      {/* Flight phase */}
      <Panel className="shrink-0">
        <PanelHeader
          title="Flight Phase"
          hint="Sequence"
          right={<span className="numeric text-xs text-signal">MET {met(latest.t)}</span>}
        />
        <StageTimeline stages={stages} activeIndex={4} />
      </Panel>

      {/* Telemetry directly under the flight phase */}
      <div className="grid shrink-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Fills the remaining viewport height */}
      <div className="grid min-h-0 flex-1 gap-2.5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-h-0 gap-2.5 lg:grid-cols-2 lg:grid-rows-2">
          <CameraFeed title="Payload Camera A" hint="Near-Infrared" mode="nir" compact />
          <CameraFeed title="Payload Camera B" hint="Grayscale" mode="gray" compact />

          <Panel className="flex min-h-0 flex-col overflow-hidden">
            <PanelHeader title="Attitude & Rates" hint="IMU" />
            <div className="grid min-h-0 flex-1 grid-cols-3 items-center gap-2 px-3 py-2">
              <AttitudeDial label="Pitch" angle={latest.tilt * 0.6} />
              <AttitudeDial label="Roll" angle={-latest.tilt * 0.4} />
              <AttitudeDial label="Yaw Rate" angle={12.4} unit="°/s" max={180} />
            </div>
          </Panel>

          <Panel className="flex min-h-0 flex-col overflow-hidden">
            <PanelHeader
              title="Telemetry Log"
              hint={isLive ? "Live Stream" : "Recorded"}
              right={
                <StatusChip tone={isLive ? "online" : "idle"} pulse={isLive}>
                  {isLive ? "Receiving" : "Static"}
                </StatusChip>
              }
            />
            <div className="min-h-0 flex-1 overflow-auto">
              <TelemetryTable rows={recent} />
            </div>
          </Panel>
        </div>

        <div className="flex min-h-0 flex-col gap-2.5">
          <Panel className="shrink-0">
            <PanelHeader title="Mission Information" hint="Status" />
            <div className="px-4 py-4">
              <div className="rounded-xl border border-signal/25 bg-signal/5 px-4 py-4 text-center">
                <span className="label-caps">Mission Elapsed Time</span>
                <p className="numeric mt-2 text-3xl font-semibold text-signal">{met(latest.t)}</p>
              </div>
            </div>
          </Panel>

          <Panel className="flex min-h-0 flex-1 flex-col">
            <PanelHeader
              title="Command Panel"
              hint="Uplink"
              right={
                <StatusChip tone={link.status === "connected" ? "online" : "warn"}>
                  {link.status === "connected" ? "Armed" : "No Link"}
                </StatusChip>
              }
            />
            <div className="grid gap-2 px-4 py-3">
              {commands.map(({ label, cmd, icon: Icon, tone }) => (
                <GcsButton
                  key={label}
                  variant={tone}
                  size="sm"
                  className="justify-start"
                  onClick={() => void sendCommand(cmd)}
                >
                  <Icon />
                  {label}
                </GcsButton>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-auto border-t border-border/60 px-4 py-2">
              <span className="label-caps text-[9px]">Uplink Log</span>
              {link.sent.length === 0 ? (
                <p className="mt-1 text-[11px] text-muted-foreground">No commands transmitted.</p>
              ) : (
                [...link.sent].reverse().map((c, i) => (
                  <p key={`${c}-${i}`} className="numeric mt-1 text-[11px] text-muted-foreground">
                    → {c}
                  </p>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
