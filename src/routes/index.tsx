import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cable,
  Loader2,
  Rocket,
  Satellite,
  ShieldCheck,
  SignalHigh,
  BarChart3,
  Clock,
  ArrowDownUp,
  Check,
  Plug,

} from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { DataRow } from "@/components/gcs/summary-card";
import {
  useLink,
  connectSerial,
  disconnectSerial,
  isSerialSupported,
} from "@/lib/serial-link";
import { useConfig } from "@/lib/gcs-config";
import navarsLogo from "@/assets/navars-space-lab.png";
import gaudiumLogo from "@/assets/gaudium-school.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ground Station Connection — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Establish the serial link between the Bhoonidi ground station and the CanSat telemetry downlink.",
      },
      { property: "og:title", content: "Ground Station Connection — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Serial link setup and telemetry handshake for the MRCC CanSat mission.",
      },
    ],
  }),
  component: ConnectionPage,
});

const checks = [
  "IMU",
  "Pressure Sensor",
  "Temperature Sensor",
  "NIR Camera",
  "Grayscale Camera",
  "LoRa Link",
  "Battery",
] as const;

function ConnectionPage() {
  const navigate = useNavigate();
  const link = useLink();
  const config = useConfig();
  const [supported, setSupported] = useState(true);
  const [uptime, setUptime] = useState(0);

  useEffect(() => setSupported(isSerialSupported()), []);

  const status = link.status;
  const connected = status === "connected";

  useEffect(() => {
    if (!connected) {
      setUptime(0);
      return;
    }
    const id = window.setInterval(() => setUptime((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [connected]);

  const pkt = link.packets[link.packets.length - 1];
  const total = link.packets.length + link.malformed;
  const loss = total ? ((link.malformed / total) * 100).toFixed(1) : "0";
  const hhmmss = `${Math.floor(uptime / 3600).toString().padStart(2, "0")}:${Math.floor((uptime % 3600) / 60).toString().padStart(2, "0")}:${(uptime % 60).toString().padStart(2, "0")}`;

  const stationStats = [
    { icon: ShieldCheck, label: "System Health", value: connected ? "100" : "—", unit: "%", tone: "text-ok" },
    { icon: SignalHigh, label: "Data In", value: (link.bytesIn / 1024).toFixed(1), unit: "KB", tone: "text-signal" },
    { icon: BarChart3, label: "Malformed Frames", value: loss, unit: "%", tone: link.malformed ? "text-warn" : "text-ok" },
    { icon: Clock, label: "Link Uptime", value: hhmmss, unit: "", tone: "text-foreground" },
    { icon: ArrowDownUp, label: "Packets", value: String(link.packets.length), unit: "rx", tone: "text-foreground" },
  ] as const;

  const linkReadouts = [
    { label: "Downlink", value: config.frequency, unit: "MHz" },
    { label: "Baud Rate", value: String(config.baudRate), unit: "bps" },
    { label: "Telemetry Rate", value: config.packetRate.toFixed(1), unit: "Hz" },
    { label: "Battery", value: pkt ? pkt.voltage.toFixed(2) : "—", unit: "V" },
    { label: "Spreading Factor", value: config.spreadingFactor, unit: "" },
  ] as const;

  const activePort = { id: link.portLabel ?? "Not selected" };

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Malaysian Rocket Competition 2026 · Team Bhoonidi</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Ground Station Connection</h1>
        </div>
        <div className="flex items-center gap-5">
          <img src={navarsLogo} alt="Navars Space Lab" className="h-8 w-auto brightness-150" />
          <span className="h-9 w-px bg-border" />
          <img src={gaudiumLogo} alt="The Gaudium School" className="h-11 w-auto rounded-md bg-foreground px-2 py-1" />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        {/* LEFT — station status */}
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader
              title="Station Status"
              hint="Ground"
              right={
                <StatusChip tone={connected ? "online" : "idle"}>
                  {connected ? "Ready" : "Standby"}
                </StatusChip>
              }
            />
            <div className="p-4">
              {stationStats.map(({ icon: Icon, label, value, unit, tone }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-b border-border/40 py-2.5 last:border-0"
                >
                  <span className="grid size-8 place-items-center rounded-lg border border-border bg-panel-2/60">
                    <Icon className="size-4 text-signal" strokeWidth={1.7} />
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`numeric ml-auto text-sm font-semibold ${tone}`}>
                    {value}
                    {unit ? (
                      <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Link Timer" hint="Session" />
            <div className="flex items-center gap-4 px-5 py-5">
              <div>
                <p className="numeric text-3xl font-semibold text-signal">
                  {connected ? hhmmss : "--:--:--"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {connected ? "Link uptime" : "Awaiting link"}
                </p>
              </div>
              <Rocket className="ml-auto size-9 text-signal/70" strokeWidth={1.3} />
            </div>
          </Panel>

        </div>


        {/* CENTER — connection console */}
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Serial Link Console"
            hint="Serial"
            right={
              <StatusChip
                tone={connected ? "online" : status === "connecting" ? "warn" : "idle"}
                pulse={status !== "idle"}
              >
                {connected ? "Connected" : status === "connecting" ? "Handshaking" : "Disconnected"}
              </StatusChip>
            }
          />
          <div className="space-y-6 p-6">
            <div className="relative overflow-hidden rounded-2xl border border-signal/25 bg-signal/5 px-6 py-7 text-center">
              {!connected ? (
                <span className="sweep-line pointer-events-none absolute inset-0 opacity-60" />
              ) : null}
              <div className="relative">
                <span className="label-caps">Downlink Handshake</span>
                <p className="numeric mt-3 text-5xl font-semibold text-signal">
                  {connected ? "LINKED" : status === "connecting" ? "SYNC…" : "STANDBY"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {connected
                    ? `Telemetry stream locked · ${activePort.id}`
                    : supported
                      ? "Select the ground-station serial adapter to begin."
                      : "Web Serial needs Chrome or Edge over HTTPS."}
                </p>
                <div className="mx-auto mt-5 grid max-w-sm gap-1.5 text-left">
                  {checks.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-xs">
                      <Check className="size-3.5 text-ok" strokeWidth={2.4} />
                      <span className="text-muted-foreground">{c}</span>
                      <span className="numeric ml-auto text-[11px] text-ok">
                        {connected ? "OK" : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="label-caps mt-5 text-ok">
                  {connected ? "All systems nominal" : "Awaiting downlink"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GcsButton
                onClick={() => void connectSerial(config.baudRate)}
                disabled={status === "connecting" || connected || !supported}
              >
                {status === "connecting" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Cable />
                )}
                {connected ? "Link Established" : "Select Serial Port"}
              </GcsButton>
              <GcsButton variant="outline" onClick={() => void disconnectSerial()}>
                Disconnect
              </GcsButton>
              {link.error ? (
                <span className="text-xs text-warn">{link.error}</span>
              ) : null}
            </div>

            <GcsButton
              size="lg"
              className="w-full"
              disabled={!connected}
              onClick={() => navigate({ to: "/mission" })}
            >
              <Rocket />
              Start Mission
            </GcsButton>
          </div>
        </Panel>

        {/* RIGHT — link readouts + profile */}
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader
              title="Link Readouts"
              hint="Radio"
              right={
                <StatusChip tone={connected ? "online" : "idle"} pulse={connected}>
                  {connected ? "Live" : "Idle"}
                </StatusChip>
              }
            />
            <div className="grid gap-3 p-4">
              {linkReadouts.map((r) => (
                <div
                  key={r.label}
                  className="rounded-xl border border-border bg-panel-2/50 px-4 py-3"
                >
                  <span className="label-caps text-[10px]">{r.label}</span>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="numeric text-2xl leading-none font-semibold">{r.value}</span>
                    <span className="numeric text-[11px] text-muted-foreground">{r.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="h-fit">
            <PanelHeader title="Station Profile" hint="Config" />
            <div className="px-5 py-2">
              <DataRow label="Team" value="BHOONIDI" />
              <DataRow label="Country" value="INDIA" />
              <DataRow label="Payload ID" value="CANSAT-BH-01" />
              <DataRow label="Port" value={activePort.id} />
              <DataRow label="Software" value="GCS v2.4.0" />
            </div>
          </Panel>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-panel/40 px-4 py-3">
            <Plug className="size-4 text-signal" strokeWidth={1.7} />
            <span className="numeric text-[11px] text-muted-foreground">
              {connected ? "Serial handshake complete" : "Awaiting operator action"}
            </span>
            <Satellite className="ml-auto size-4 text-muted-foreground" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </main>
  );
}
