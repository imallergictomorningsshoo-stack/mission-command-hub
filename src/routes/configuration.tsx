import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { DataRow } from "@/components/gcs/summary-card";
import { Meter } from "@/components/gcs/ui-bits";
import { useConfig, saveConfig, resetConfig, defaultConfig, type GcsConfig } from "@/lib/gcs-config";

export const Route = createFileRoute("/configuration")({
  head: () => ({
    meta: [
      { title: "Ground Station Configuration — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Radio, telemetry, camera and logging configuration for the Bhoonidi CanSat ground station.",
      },
      { property: "og:title", content: "Ground Station Configuration — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Tune radio, telemetry and logging parameters for the CanSat link.",
      },
    ],
  }),
  component: ConfigurationPage,
});

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label-caps text-[9px]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

const inputCls =
  "numeric w-full rounded-lg border border-input bg-panel px-3 py-2 text-sm outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-ring";

function ConfigurationPage() {
  const saved = useConfig();
  const [draft, setDraft] = useState<GcsConfig>(saved);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => setDraft(saved), [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = <K extends keyof GcsConfig>(key: K, value: GcsConfig[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">System · Local Profile</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Configuration</h1>
        </div>
        <div className="flex items-center gap-2">
          <GcsButton
            variant="outline"
            size="sm"
            onClick={() => {
              resetConfig();
              setDraft(defaultConfig);
              setSavedAt("Defaults restored");
            }}
          >
            <RotateCcw />
            Reset Defaults
          </GcsButton>
          <GcsButton
            size="sm"
            onClick={() => {
              saveConfig(draft);
              setSavedAt(`Saved ${new Date().toLocaleTimeString()}`);
            }}
          >
            <Save />
            Save Profile
          </GcsButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="Radio Link" hint="LoRa" right={<StatusChip tone="online">Active</StatusChip>} />
          <div className="space-y-4 px-5 py-4">
            <Field label="Frequency (MHz)" hint="433.000 – 434.790 permitted band">
              <input
                className={inputCls}
                value={draft.frequency}
                onChange={(e) => set("frequency", e.target.value)}
              />
            </Field>
            <Field label="Spreading Factor">
              <select
                className={inputCls}
                value={draft.spreadingFactor}
                onChange={(e) => set("spreadingFactor", e.target.value)}
              >
                {["SF7", "SF8", "SF9", "SF10", "SF11"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Transmit Power (dBm)">
              <input
                className={inputCls}
                value={draft.txPower}
                onChange={(e) => set("txPower", e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Telemetry" hint="Downlink" />
          <div className="space-y-4 px-5 py-4">
            <Field label={`Packet Rate — ${draft.packetRate.toFixed(1)} Hz`}>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={draft.packetRate}
                onChange={(e) => set("packetRate", Number(e.target.value))}
                className="w-full accent-[var(--signal)]"
              />
            </Field>
            <Meter value={(draft.packetRate / 5) * 100} />
            <Field label="Serial Baud Rate" hint="Applied on the next serial connect">
              <select
                className={inputCls}
                value={String(draft.baudRate)}
                onChange={(e) => set("baudRate", Number(e.target.value))}
              >
                {["9600", "19200", "57600", "115200"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Packet Timeout (s)" hint="Triggers the telemetry-lost popup">
              <input
                className={inputCls}
                value={draft.packetTimeout}
                onChange={(e) => set("packetTimeout", e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Recording"
            hint="Storage"
            right={
              <StatusChip tone={draft.logging ? "online" : "idle"}>
                {draft.logging ? "Logging" : "Paused"}
              </StatusChip>
            }
          />
          <div className="space-y-4 px-5 py-4">
            <label className="flex items-center gap-3 text-xs">
              <input
                type="checkbox"
                checked={draft.logging}
                onChange={() => set("logging", !draft.logging)}
                className="size-4 accent-[var(--signal)]"
              />
              Write every packet to local CSV
            </label>
            <Field label="Session Name">
              <input
                className={inputCls}
                value={draft.sessionName}
                onChange={(e) => set("sessionName", e.target.value)}
              />
            </Field>
            <Field label="Camera Capture">
              <select
                className={inputCls}
                value={draft.cameraCapture}
                onChange={(e) => set("cameraCapture", e.target.value)}
              >
                {["Both cameras", "NIR only", "Grayscale only", "Disabled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <Panel className="lg:col-span-2">
          <PanelHeader title="Alert Thresholds" hint="Warnings" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
            <Field label="Weak Signal (dBm)">
              <input
                className={inputCls}
                value={draft.weakSignal}
                onChange={(e) => set("weakSignal", e.target.value)}
              />
            </Field>
            <Field label="Low Battery (V)">
              <input
                className={inputCls}
                value={draft.lowBattery}
                onChange={(e) => set("lowBattery", e.target.value)}
              />
            </Field>
            <Field label="Max Tilt (°)">
              <input
                className={inputCls}
                value={draft.maxTilt}
                onChange={(e) => set("maxTilt", e.target.value)}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Station Profile" hint="Read-only" />
          <div className="px-5 py-2">
            <DataRow label="Team" value="BHOONIDI" />
            <DataRow label="Country" value="INDIA" />
            <DataRow label="Payload ID" value="CANSAT-BH-01" />
            <DataRow label="Software" value="GCS v2.4.0" />
            <DataRow label="Profile" value={dirty ? "LOCAL / UNSAVED" : "LOCAL / SAVED"} />
            <DataRow label="Last Save" value={savedAt ?? "—"} />
          </div>
        </Panel>
      </div>
    </main>
  );
}
