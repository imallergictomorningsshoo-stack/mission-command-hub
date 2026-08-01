import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Cable, Loader2, Rocket, Satellite } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { DataRow } from "@/components/gcs/summary-card";

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

function ConnectionPage() {
  const navigate = useNavigate();
  const [port, setPort] = useState(ports[0]!.id);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  const connected = status === "connected";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1120px] flex-col items-center justify-center px-6 py-14">
      <div className="flex flex-col items-center text-center">
        <div className="relative grid size-16 place-items-center rounded-2xl border border-signal/25 bg-signal/10 glow-signal">
          <Satellite className="size-7 text-signal" strokeWidth={1.6} />
        </div>
        <span className="label-caps mt-6">Malaysian Rocket Competition 2026</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Bhoonidi Ground Control Station
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          CanSat telemetry downlink · Team Bhoonidi, India. Establish the serial link before
          arming the mission clock.
        </p>
      </div>

      <div className="mt-12 grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel>
          <PanelHeader
            title="Ground Station Link"
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

            <div className="relative overflow-hidden rounded-xl border border-border bg-panel/40 px-4 py-3">
              {!connected ? (
                <span className="sweep-line pointer-events-none absolute inset-0 opacity-60" />
              ) : null}
              <div className="relative flex items-center gap-3">
                <span
                  className={`size-1.5 rounded-full ${connected ? "bg-ok" : "bg-warn"} pulse-dot`}
                />
                <span className="numeric text-xs text-muted-foreground">
                  {connected
                    ? "Telemetry stream locked · 1 Hz · RSSI −64 dBm"
                    : "Waiting for telemetry…"}
                </span>
              </div>
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

        <Panel className="h-fit">
          <PanelHeader title="Station Profile" hint="Config" />
          <div className="px-5 py-2">
            <DataRow label="Team" value="BHOONIDI" />
            <DataRow label="Country" value="INDIA" />
            <DataRow label="Payload ID" value="CANSAT-BH-01" />
            <DataRow label="Downlink" value="433.000 MHz" />
            <DataRow label="Baud Rate" value="57600" />
            <DataRow label="Telemetry Rate" value="1 Hz" />
            <DataRow label="Software" value="GCS v2.4.0" />
          </div>
        </Panel>
      </div>
    </main>
  );
}
