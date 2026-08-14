// Client-side file generation for CSV, JSON and printable PDF reports.
import type { Sample } from "@/lib/frames";

const FIELDS = [
  "packet",
  "timestamp",
  "pressure_hpa",
  "temperature_c",
  "humidity_pct",
  "density_kgm3",
  "altitude_m",
  "x",
  "y",
  "z",
  "roll_deg",
  "pitch_deg",
  "yaw_deg",
  "ax",
  "ay",
  "az",
  "acceleration_ms2",
  "velocity_ms",
] as const;

const cell = (v: number | null | string | undefined) =>
  v === null || v === undefined ? "" : String(v);

export function toCsv(rows: Sample[]) {
  const lines = [FIELDS.join(",")];
  for (const s of rows) {
    lines.push(
      [
        s.packet,
        s.timestamp,
        s.pressure,
        s.temperature,
        s.humidity,
        s.density,
        s.altitude,
        s.x,
        s.y,
        s.z,
        s.roll,
        s.pitch,
        s.yaw,
        s.ax,
        s.ay,
        s.az,
        s.acceleration,
        s.velocity,
      ]
        .map(cell)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function toJson(rows: Sample[], meta: Record<string, unknown>) {
  return JSON.stringify({ meta, sampleCount: rows.length, samples: rows }, null, 2);
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function estimateSize(content: string) {
  const kb = new Blob([content]).size / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
}

/** Opens a print-ready report window; the browser's print dialog saves it as PDF. */
export function printReport(opts: {
  title: string;
  summary: Array<[string, string]>;
  rows: Sample[];
}) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  const summaryRows = opts.summary
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join("");
  const n = (v: number | null, d = 2) => (v === null ? "—" : v.toFixed(d));
  const dataRows = opts.rows
    .map(
      (s) =>
        `<tr><td>${s.packet}</td><td>${s.timestamp}</td><td>${n(s.pressure)}</td><td>${n(
          s.temperature,
        )}</td><td>${n(s.humidity)}</td><td>${n(s.density, 4)}</td><td>${n(s.roll, 1)}</td><td>${n(
          s.pitch,
          1,
        )}</td><td>${n(s.yaw, 1)}</td><td>${n(s.acceleration)}</td><td>${n(s.velocity)}</td></tr>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${opts.title}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,sans-serif;color:#0b1220;margin:32px}
    h1{font-size:20px;margin:0 0 4px}
    p.sub{color:#5b6478;font-size:12px;margin:0 0 20px}
    table{border-collapse:collapse;width:100%;font-size:11px;margin-bottom:24px}
    th,td{border:1px solid #d8dee9;padding:4px 6px;text-align:left}
    th{background:#f2f5fa}
    tbody tr:nth-child(even){background:#fafbfd}
  </style></head><body>
  <h1>${opts.title}</h1>
  <p class="sub">Team Bhoonidi · Malaysian Rocket Competition 2026 · generated ${new Date().toUTCString()}</p>
  <table><tbody>${summaryRows}</tbody></table>
  <table><thead><tr><th>PKT</th><th>TIME</th><th>P (hPa)</th><th>T (°C)</th><th>RH (%)</th><th>ρ (kg/m³)</th><th>ROLL</th><th>PITCH</th><th>YAW</th><th>A (m/s²)</th><th>V (m/s)</th></tr></thead><tbody>${dataRows}</tbody></table>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
  return true;
}
