import type { Packet } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

const stateTone: Record<Packet["state"], string> = {
  IDLE: "text-muted-foreground",
  ASCENT: "text-signal",
  APOGEE: "text-warn",
  DESCENT: "text-accent",
  LANDED: "text-ok",
};

export function TelemetryTable({ rows }: { rows: Packet[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border/70">
            {[
              "PKT",
              "MET",
              "ALT (m)",
              "PRES (hPa)",
              "TEMP (°C)",
              "TILT (°)",
              "VBAT (V)",
              "STATE",
            ].map((h) => (
              <th key={h} className="label-caps px-5 py-2.5 font-normal whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.id}
              className="border-b border-border/40 transition-colors last:border-0 hover:bg-signal/5"
            >
              <td className="numeric px-5 py-2.5 text-xs text-muted-foreground">
                {p.id.toString().padStart(4, "0")}
              </td>
              <td className="numeric px-5 py-2.5 text-xs">{p.time}</td>
              <td className="numeric px-5 py-2.5 text-xs">{p.altitude.toFixed(1)}</td>
              <td className="numeric px-5 py-2.5 text-xs">{p.pressure.toFixed(2)}</td>
              <td className="numeric px-5 py-2.5 text-xs">{p.temperature.toFixed(2)}</td>
              <td className="numeric px-5 py-2.5 text-xs">{p.tilt.toFixed(1)}</td>
              <td className="numeric px-5 py-2.5 text-xs">{p.voltage.toFixed(2)}</td>
              <td
                className={cn(
                  "numeric px-5 py-2.5 text-[11px] tracking-widest",
                  stateTone[p.state],
                )}
              >
                {p.state}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
