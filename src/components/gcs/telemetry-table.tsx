import type { Sample } from "@/lib/frames";
import { fmt } from "@/lib/frames";

const HEADS = [
  "PKT",
  "TIME",
  "P (hPa)",
  "T (°C)",
  "RH (%)",
  "ρ (kg/m³)",
  "ROLL",
  "PITCH",
  "YAW",
  "A (m/s²)",
  "V (m/s)",
];

export function TelemetryTable({ rows }: { rows: Sample[] }) {
  if (!rows.length) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        No packets received yet — connect the ground station to start logging.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 bg-panel/95 backdrop-blur">
          <tr className="border-b border-border/70">
            {HEADS.map((h) => (
              <th key={h} className="label-caps px-4 py-2.5 font-normal whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.packet}
              className="border-b border-border/40 transition-colors last:border-0 hover:bg-signal/5"
            >
              <td className="numeric px-4 py-2 text-xs text-muted-foreground">
                {s.packet.toString().padStart(4, "0")}
              </td>
              <td className="numeric px-4 py-2 text-xs">{s.timestamp || "—"}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.pressure)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.temperature)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.humidity, 1)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.density, 4)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.roll, 1)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.pitch, 1)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.yaw, 1)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.acceleration)}</td>
              <td className="numeric px-4 py-2 text-xs">{fmt(s.velocity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
