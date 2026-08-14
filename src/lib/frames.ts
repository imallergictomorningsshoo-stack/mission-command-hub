// Frame protocol shared by the CanSat payload firmware and this ground station.
//
//   F1,<pkt>,<timestamp>,<pressure hPa>,<temp C>,<humidity %>,<density kg/m3>,<altitude m>
//   F2,<pkt>,<x>,<y>,<z>,<roll>,<pitch>,<yaw>
//   F3,<pkt>,<ax>,<ay>,<az>,<accel m/s2>,<velocity m/s>
//
// JSON lines of the shape { "f": 1, "pkt": 12, ... } are also accepted.

export type Sample = {
  packet: number;
  receivedAt: number;
  timestamp: string;
  frames: { f1: boolean; f2: boolean; f3: boolean };
  pressure: number | null;
  temperature: number | null;
  humidity: number | null;
  density: number | null;
  altitude: number | null;
  x: number | null;
  y: number | null;
  z: number | null;
  roll: number | null;
  pitch: number | null;
  yaw: number | null;
  ax: number | null;
  ay: number | null;
  az: number | null;
  acceleration: number | null;
  velocity: number | null;
};

export function emptySample(packet: number): Sample {
  return {
    packet,
    receivedAt: Date.now(),
    timestamp: "",
    frames: { f1: false, f2: false, f3: false },
    pressure: null,
    temperature: null,
    humidity: null,
    density: null,
    altitude: null,
    x: null,
    y: null,
    z: null,
    roll: null,
    pitch: null,
    yaw: null,
    ax: null,
    ay: null,
    az: null,
    acceleration: null,
    velocity: null,
  };
}

const num = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export type ParsedFrame = { frame: 1 | 2 | 3; packet: number; patch: Partial<Sample> };

export function parseFrame(line: string, fallbackPacket: number): ParsedFrame | null {
  const text = line.trim().replace(/^[>*$\s]+/, "");
  if (!text) return null;

  if (text.startsWith("{")) {
    let o: Record<string, unknown>;
    try {
      o = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return null;
    }
    const f = Number(o["f"] ?? o["frame"]);
    if (![1, 2, 3].includes(f)) return null;
    const packet = num(o["pkt"] ?? o["packet"] ?? o["id"]) ?? fallbackPacket;
    const pick = (...keys: string[]) => {
      for (const k of keys) if (o[k] !== undefined) return num(o[k]);
      return null;
    };
    if (f === 1) {
      return {
        frame: 1,
        packet,
        patch: {
          timestamp: String(o["ts"] ?? o["time"] ?? o["timestamp"] ?? ""),
          pressure: pick("p", "pressure"),
          temperature: pick("t", "temp", "temperature"),
          humidity: pick("h", "hum", "humidity"),
          density: pick("d", "density"),
          altitude: pick("alt", "altitude"),
        },
      };
    }
    if (f === 2) {
      return {
        frame: 2,
        packet,
        patch: {
          x: pick("x"),
          y: pick("y"),
          z: pick("z"),
          roll: pick("roll", "r"),
          pitch: pick("pitch"),
          yaw: pick("yaw"),
        },
      };
    }
    return {
      frame: 3,
      packet,
      patch: {
        ax: pick("ax"),
        ay: pick("ay"),
        az: pick("az"),
        acceleration: pick("a", "accel", "acceleration"),
        velocity: pick("v", "vel", "velocity"),
      },
    };
  }

  const c = text.split(/[,;\t]/).map((s) => s.trim());
  const tag = (c[0] ?? "").toUpperCase();
  if (!["F1", "F2", "F3"].includes(tag)) return null;
  const packet = num(c[1]) ?? fallbackPacket;

  if (tag === "F1") {
    return {
      frame: 1,
      packet,
      patch: {
        timestamp: c[2] ?? "",
        pressure: num(c[3]),
        temperature: num(c[4]),
        humidity: num(c[5]),
        density: num(c[6]),
        altitude: num(c[7]),
      },
    };
  }
  if (tag === "F2") {
    return {
      frame: 2,
      packet,
      patch: {
        x: num(c[2]),
        y: num(c[3]),
        z: num(c[4]),
        roll: num(c[5]),
        pitch: num(c[6]),
        yaw: num(c[7]),
      },
    };
  }
  return {
    frame: 3,
    packet,
    patch: {
      ax: num(c[2]),
      ay: num(c[3]),
      az: num(c[4]),
      acceleration: num(c[5]),
      velocity: num(c[6]),
    },
  };
}

/** Merges a parsed frame into the rolling sample list (newest last). */
export function mergeFrame(samples: Sample[], parsed: ParsedFrame, max = 2000): Sample[] {
  const next = samples.slice();
  let index = -1;
  for (let i = next.length - 1; i >= 0 && i > next.length - 12; i -= 1) {
    if (next[i]!.packet === parsed.packet) {
      index = i;
      break;
    }
  }
  const base = index >= 0 ? next[index]! : emptySample(parsed.packet);
  const merged: Sample = {
    ...base,
    ...parsed.patch,
    packet: parsed.packet,
    receivedAt: Date.now(),
    timestamp: parsed.patch.timestamp || base.timestamp,
    frames: {
      f1: base.frames.f1 || parsed.frame === 1,
      f2: base.frames.f2 || parsed.frame === 2,
      f3: base.frames.f3 || parsed.frame === 3,
    },
  };
  if (index >= 0) next[index] = merged;
  else next.push(merged);
  return next.slice(-max);
}

export const fmt = (v: number | null, digits = 2) =>
  v === null || v === undefined ? "—" : v.toFixed(digits);
