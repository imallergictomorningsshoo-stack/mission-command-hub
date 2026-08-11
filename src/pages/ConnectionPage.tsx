import { useEffect, useState } from "react";
import { Cable, Loader2, Rocket, ShieldCheck, SignalHigh, BarChart3, Clock, ArrowDownUp, Check, Plug } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { useTelemetry } from "@/context/TelemetryContext";
import navarsLogo from "@/assets/navars-space-lab.png";
import gaudiumLogo from "@/assets/gaudium-school.png";
import { useNavigate } from "@tanstack/react-router";

const stationStats = [
  { icon: ShieldCheck, label: "System Health", value: "100", unit: "%", tone: "text-ok" },
  { icon: SignalHigh, label: "Signal Strength", value: "−63", unit: "dBm", tone: "text-signal" },
  { icon: BarChart3, label: "Packet Loss", value: "0", unit: "%", tone: "text-ok" },
  { icon: Clock, label: "Uptime", value: "00:12:43", unit: "", tone: "text-foreground" },
  { icon: ArrowDownUp, label: "Data Rate", value: "57", unit: "pkt/s", tone: "text-foreground" },
] as const;

const checks = ["IMU", "Pressure Sensor", "Temperature Sensor", "NIR Camera", "Grayscale Camera", "LoRa Link", "Battery"] as const;

const linkReadouts = [
  { label: "Downlink", value: "433.000", unit: "MHz" },
  { label: "Baud Rate", value: "57600", unit: "bps" },
  { label: "Telemetry Rate", value: "1.0", unit: "Hz" },
  { label: "Battery", value: "4.08", unit: "V" },
  { label: "RSSI (LoRa)", value: "−63", unit: "dBm" },
] as const;

export function ConnectionPage() {
  const navigate = useNavigate();
  const { connection, setConnection } = useTelemetry();
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  useEffect(() => {
    if (connection === "Receiving") {
      navigate({ to: "/mission" });
    }
  }, [connection, navigate]);

  const connected = status === "connected" || connection === "Receiving";

  const handleConnect = () => {
    setStatus("connecting");
    setConnection("Receiving");

    window.setTimeout(() => {
      setStatus("connected");
      setConnection("Receiving");
    }, 1200);
  };

  const handleReset = () => {
    setStatus("idle");
    setConnection("Disconnected");
  };

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Malaysian Rocket Competition 2026 · Team Bhoonidi</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Ground Station Connection</h1>
        </div>
        <div className="flex items-center gap-5">
          <img src={gaudiumLogo} alt="The Gaudium School" className="h-12 w-auto rounded-md bg-foreground px-2 py-1" />
          <span className="h-9 w-px bg-border" />
          <img src={navarsLogo} alt="Navars Space Lab" className="h-8 w-auto brightness-150" />
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader
              title="Station Status"
              hint="Ground"
              right={<StatusChip tone={connected ? "online" : "idle"}>{connected ? "Ready" : "Standby"}</StatusChip>}
            />
            <div className="p-4">
              {stationStats.map(({ icon: Icon, label, value, unit, tone }) => (
                <div key={label} className="flex items-center gap-3 border-b border-border/40 py-2.5 last:border-0">
                  <span className="grid size-8 place-items-center rounded-lg border border-border bg-panel-2/60">
                    <Icon className="size-4 text-signal" strokeWidth={1.7} />
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`numeric ml-auto text-sm font-semibold ${tone}`}>
                    {value}
                    {unit ? <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Link Timer" hint="Handshake" />
            <div className="flex items-center gap-4 px-5 py-5">
              <div>
                <p className="numeric text-3xl font-semibold text-signal">{connected ? "T− 00:42" : "T− --:--"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{connected ? "To mission arm" : "Awaiting link"}</p>
              </div>
              <Rocket className="ml-auto size-9 text-signal/70" strokeWidth={1.3} />
            </div>
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <PanelHeader
            title="Serial Link Console"
            hint="Serial"
            right={<StatusChip tone={connected ? "online" : status === "connecting" ? "warn" : "idle"} pulse={status !== "idle"}>{connected ? "Connected" : status === "connecting" ? "Handshaking" : "Disconnected"}</StatusChip>}
          />
          <div className="space-y-6 p-6">
            <div className="relative overflow-hidden rounded-2xl border border-signal/25 bg-signal/5 px-6 py-7 text-center">
              {!connected ? <span className="sweep-line pointer-events-none absolute inset-0 opacity-60" /> : null}
              <div className="relative">
                <span className="label-caps">Downlink Handshake</span>
                <p className="numeric mt-3 text-5xl font-semibold text-signal">{connected ? "LINKED" : status === "connecting" ? "SYNC…" : "T− 00:42"}</p>
                <p className="mt-3 text-xs text-muted-foreground">{connected ? "Telemetry stream locked · 1 Hz" : "Checking systems…"}</p>
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

            <div className="flex flex-wrap items-center gap-3">
              <GcsButton onClick={handleConnect} disabled={status !== "idle"}>
                {status === "connecting" ? <Loader2 className="animate-spin" /> : <Cable />}
                {connected ? "Link Established" : "Connect"}
              </GcsButton>
              <GcsButton variant="outline" onClick={handleReset}>
                Reset Link
              </GcsButton>
            </div>

            <GcsButton size="lg" className="w-full" disabled={!connected} onClick={() => navigate({ to: "/mission" })}>
              <Rocket />
              Start Mission
            </GcsButton>
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="Link Readouts" hint="Telemetry" />
            <div className="space-y-1 p-4">
              {linkReadouts.map(({ label, value, unit }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border/40 bg-panel/40 px-3 py-2.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="numeric text-sm font-semibold">
                    {value}
                    <span className="ml-1 text-[10px] text-muted-foreground">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Support" hint="Ops" />
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-border/60 bg-panel/50 px-3 py-3">
                <div className="flex items-center gap-2">
                  <Plug className="size-4 text-signal" strokeWidth={1.7} />
                  <span className="text-sm font-medium">Ground console online</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Ground console is ready to begin the mission handshake.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
