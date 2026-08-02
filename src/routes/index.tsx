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
import { useTelemetry } from "@/context/TelemetryContext";
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

const ports = [
  { id: "COM3", desc: "SiLabs CP2102 · 57600 baud" },
  { id: "COM5", desc: "FTDI FT232R · 115200 baud" },
  { id: "/dev/ttyUSB0", desc: "XBee Pro S2C · 9600 baud" },
];

const stationStats = [
  { icon: ShieldCheck, label: "System Health", value: "100", unit: "%", tone: "text-ok" },
  { icon: SignalHigh, label: "Signal Strength", value: "−63", unit: "dBm", tone: "text-signal" },
  { icon: BarChart3, label: "Packet Loss", value: "0", unit: "%", tone: "text-ok" },
  { icon: Clock, label: "Uptime", value: "00:12:43", unit: "", tone: "text-foreground" },
  { icon: ArrowDownUp, label: "Data Rate", value: "57", unit: "pkt/s", tone: "text-foreground" },
] as const;

const checks = [
  "IMU",
  "Pressure Sensor",
  "Temperature Sensor",
  "NIR Camera",
  "Grayscale Camera",
  "LoRa Link",
  "Battery",
] as const;

const linkReadouts = [
  { label: "Downlink", value: "433.000", unit: "MHz" },
  { label: "Baud Rate", value: "57600", unit: "bps" },
  { label: "Telemetry Rate", value: "1.0", unit: "Hz" },
  { label: "Battery", value: "4.08", unit: "V" },
  { label: "RSSI (LoRa)", value: "−63", unit: "dBm" },
] as const;

function ConnectionPage() {
  const navigate = useNavigate();
  const { connection, setConnection } = useTelemetry();
  const [port, setPort] = useState(ports[0]!.id);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  useEffect(() => {
    if (connection === "Receiving") {
      navigate({ to: "/mission" });
    }
  }, [connection, navigate]);

  const connected = status === "connected" || connection === "Receiving";
  const activePort = ports.find((p) => p.id === port)!;

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
            <PanelHeader title="Link Timer" hint="Handshake" />
            <div className="flex items-center gap-4 px-5 py-5">
              <div>
                <p className="numeric text-3xl font-semibold text-signal">
                  {connected ? "T− 00:42" : "T− --:--"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {connected ? "To mission arm" : "Awaiting link"}
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
                  {connected ? "LINKED" : status === "connecting" ? "SYNC…" : "T− 00:42"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {connected
                    ? `Telemetry stream locked · ${activePort.id} · 1 Hz`
                    : "Checking systems…"}
                </p>
                <div className="mx-auto mt-5 grid max-w-sm gap-1.5 text-left">
                  {checks.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-xs">
                      <Check className="size-3.5 text-ok" strokeWidth={2.4} />
                      <span className="text-muted-foreground">{c}</span>
                      <span className="numeric ml-auto text-[11px] text-ok">OK</span>
                    </div>
                  ))}
                </div>
                <p className="label-caps mt-5 text-ok">All systems nominal</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-caps" htmlFor="port">
                Serial Port
              </label>
              <div className="grid gap-2">
                {ports.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPort(p.id)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      port === p.id
                        ? "border-signal/40 bg-signal/10 shadow-[0_0_24px_-12px_var(--signal)]"
                        : "border-border bg-panel/40 hover:border-signal/25 hover:bg-signal/5"
                    }`}
                  >
                    <span>
                      <span className="numeric block text-sm">{p.id}</span>
                      <span className="block text-xs text-muted-foreground">{p.desc}</span>
                    </span>
                    <Cable
                      className={`size-4 ${port === p.id ? "text-signal" : "text-muted-foreground"}`}
                      strokeWidth={1.7}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GcsButton
                onClick={() => {
                  setStatus("connecting");
                  setTimeout(() => setStatus("connected"), 1400);
                }}
                disabled={status !== "idle"}
              >
                {status === "connecting" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Cable />
                )}
                {connected ? "Link Established" : "Connect"}
              </GcsButton>
              <GcsButton variant="outline" onClick={() => setStatus("idle")}>
                Reset Link
              </GcsButton>
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
