// Static demo telemetry used purely to render the interface design.
export type Packet = {
  id: number;
  t: number; // seconds since launch
  time: string;
  altitude: number;
  pressure: number;
  temperature: number;
  tilt: number;
  voltage: number;
  state: "IDLE" | "ASCENT" | "APOGEE" | "DESCENT" | "LANDED";
};

function clock(t: number) {
  const m = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `T+${m}:${s}`;
}

export const packets: Packet[] = Array.from({ length: 120 }, (_, i) => {
  const t = i * 2;
  const apogee = 118;
  const x = i / 119;
  const altitude = Math.max(
    0,
    Math.round(
      (x < 0.42
        ? 742 * Math.sin((x / 0.42) * (Math.PI / 2))
        : 742 * Math.cos(((x - 0.42) / 0.58) * (Math.PI / 2) * 0.98)) *
        10 +
        Math.sin(i / 3) * 12,
    ) / 10,
  );
  const pressure = +(1013.2 - altitude * 0.1128 + Math.sin(i / 5) * 0.35).toFixed(2);
  const temperature = +(28.4 - altitude * 0.0061 + Math.cos(i / 7) * 0.4).toFixed(2);
  const tilt = +(
    (x < 0.42 ? 4 + x * 18 : 12 + Math.abs(Math.sin(i / 4)) * 26) +
    Math.sin(i / 2) * 2.2
  ).toFixed(1);
  const state: Packet["state"] =
    i === 0 ? "IDLE" : x < 0.4 ? "ASCENT" : Math.abs(i - apogee * 0.42) < 3 ? "APOGEE" : x < 0.97 ? "DESCENT" : "LANDED";
  return {
    id: i + 1,
    t,
    time: clock(t),
    altitude,
    pressure,
    temperature,
    tilt,
    voltage: +(8.4 - i * 0.004).toFixed(2),
    state,
  };
});

export const latest = packets[packets.length - 1]!;

export const stats = {
  maxAltitude: Math.max(...packets.map((p) => p.altitude)),
  avgTemperature: +(packets.reduce((a, p) => a + p.temperature, 0) / packets.length).toFixed(2),
  avgPressure: +(packets.reduce((a, p) => a + p.pressure, 0) / packets.length).toFixed(2),
  maxTilt: Math.max(...packets.map((p) => p.tilt)),
  minPressure: Math.min(...packets.map((p) => p.pressure)),
  packetsReceived: packets.length,
  packetsExpected: 124,
  duration: "00:04:18",
};