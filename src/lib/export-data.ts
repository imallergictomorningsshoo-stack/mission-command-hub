// Client-side file generation for CSV, JSON and printable PDF reports.
import type { Packet } from "@/lib/telemetry";

const FIELDS = [
  "id",
  "met_seconds",
  "met",
  "altitude_m",
  "pressure_hpa",
  "temperature_c",
  "tilt_deg",
  "voltage_v",
  "state",
] as const;

export function toCsv(rows: Packet[]) {
  const lines = [FIELDS.join(",")];
  for (const p of rows) {
    lines.push(
      [p.id, p.t, p.time, p.altitude, p.pressure, p.temperature, p.tilt, p.voltage, p.state].join(","),
    );
  }
  return lines.join("\n");
}

export function toJson(rows: Packet[], meta: Record<string, unknown>) {
  return JSON.stringify({ meta, packetCount: rows.length, packets: rows }, null, 2);
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
  rows: Packet[];
}) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  const summaryRows = opts.summary
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join("");
  const dataRows = opts.rows
    .map(
      (p) =>
        `<tr><td>${p.id}</td><td>${p.time}</td><td>${p.altitude.toFixed(1)}</td><td>${p.pressure.toFixed(
          2,
        )}</td><td>${p.temperature.toFixed(2)}</td><td>${p.tilt.toFixed(1)}</td><td>${p.voltage.toFixed(
          2,
        )}</td><td>${p.state}</td></tr>`,
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
  <table><thead><tr><th>PKT</th><th>MET</th><th>ALT (m)</th><th>PRES (hPa)</th><th>TEMP (°C)</th><th>TILT (°)</th><th>VBAT (V)</th><th>STATE</th></tr></thead><tbody>${dataRows}</tbody></table>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
  return true;
}
