import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";
import { GcsButton } from "@/components/gcs/gcs-button";
import { CameraFeed } from "@/components/gcs/camera-feed";
import { CheckRow, Meter, Tile } from "@/components/gcs/ui-bits";

export const Route = createFileRoute("/pre-flight")({
  head: () => ({
    meta: [
      { title: "Pre-Flight Verification — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Sensor self-tests, camera verification, recovery system arming and the go/no-go checklist before CanSat launch.",
      },
      { property: "og:title", content: "Pre-Flight Verification — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Go/no-go checklist and subsystem self-tests before launch.",
      },
    ],
  }),
  component: PreFlightPage,
});

const sensors = [
  { label: "BMP390 Barometer", detail: "1013.18 hPa · 28.4 °C", state: "done" as const },
  { label: "MPU6050 IMU", detail: "Gyro bias 0.02 °/s", state: "done" as const },
  { label: "Magnetometer", detail: "Hard-iron calibrated", state: "warn" as const, value: "DRIFT" },
  { label: "GPS (NEO-6M)", detail: "9 satellites · HDOP 1.1", state: "done" as const },
  { label: "Thermistor Array", detail: "4 channels nominal", state: "done" as const },
  { label: "Battery Monitor", detail: "8.38 V · 2S pack", state: "done" as const },
];

const recovery = [
  { label: "Parachute Bay", detail: "Packed and pinned", state: "done" as const },
  { label: "Nichrome Cutter", detail: "Continuity 1.8 Ω", state: "done" as const },
  { label: "Deployment Altitude", detail: "Armed at 400 m descent", state: "done" as const },
  { label: "Backup Timer", detail: "T+ 95 s failsafe", state: "warn" as const, value: "MANUAL" },
  { label: "Buzzer Beacon", detail: "Not yet enabled", state: "pending" as const },
];

const checklist = [
  "Ground station link verified",
  "Telemetry rate set to 1 Hz",
  "SD card formatted and mounted",
  "Camera lenses cleaned",
  "Battery charged above 8.2 V",
  "Payload sealed and mass verified",
  "Launch rail fit check",
];

function PreFlightPage() {
  const [ticked, setTicked] = useState<string[]>(checklist.slice(0, 5));
  const pct = Math.round((ticked.length / checklist.length) * 100);

  return (
    <main className="mx-auto w-full max-w-[1700px] px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label-caps">Verification · T− 00:20:00</span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Pre-Flight Systems Check</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={pct === 100 ? "online" : "warn"} pulse={pct !== 100}>
            {pct === 100 ? "Go for launch" : "Hold"}
          </StatusChip>
          <GcsButton variant="outline" size="sm">
            <RefreshCcw />
            Re-run Self-Test
          </GcsButton>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Sensors Passing" value="5 / 6" tone="warn" note="Magnetometer drift" />
        <Tile label="Cameras Online" value="2 / 2" tone="ok" note="NIR + Grayscale" />
        <Tile label="Recovery Armed" value="ARMED" tone="ok" note="Backup timer manual" />
        <Tile label="Checklist" value={`${pct}`} unit="%" tone={pct === 100 ? "ok" : "warn"} note={`${ticked.length} of ${checklist.length} items`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHeader title="Sensor Self-Test" hint="Avionics" right={<StatusChip tone="warn">1 Warning</StatusChip>} />
              <div className="px-5 py-2">
                {sensors.map((s) => (
                  <CheckRow key={s.label} {...s} />
                ))}
              </div>
            </Panel>
            <Panel>
              <PanelHeader title="Recovery System" hint="Descent" right={<ShieldCheck className="size-4 text-ok" strokeWidth={1.8} />} />
              <div className="px-5 py-2">
                {recovery.map((s) => (
                  <CheckRow key={s.label} {...s} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CameraFeed title="Camera A Check" hint="Near-Infrared" mode="nir" resolution="1280×720" fps="12 fps" />
            <CameraFeed title="Camera B Check" hint="Grayscale" mode="gray" resolution="1280×720" fps="15 fps" />
          </div>
        </div>

        <Panel className="h-fit">
          <PanelHeader
            title="Launch Checklist"
            hint="Operator"
            right={<ClipboardCheck className="size-4 text-signal" strokeWidth={1.8} />}
          />
          <div className="px-5 py-4">
            <Meter value={pct} tone={pct === 100 ? "ok" : "warn"} />
            <div className="mt-4 space-y-1">
              {checklist.map((item) => {
                const on = ticked.includes(item);
                return (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-xs transition-colors hover:bg-secondary"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setTicked((prev) =>
                          prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
                        )
                      }
                      className="size-4 accent-[var(--signal)]"
                    />
                    <span className={on ? "text-muted-foreground line-through" : ""}>{item}</span>
                  </label>
                );
              })}
            </div>
            <GcsButton className="mt-4 w-full" disabled={pct !== 100}>
              Declare Go For Launch
            </GcsButton>
          </div>
        </Panel>
      </div>
    </main>
  );
}
