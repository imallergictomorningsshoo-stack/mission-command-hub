// Real Web Serial link: port selection, packet ingestion, uplink commands.
import { useSyncExternalStore } from "react";
import type { Packet } from "@/lib/telemetry";

export type LinkStatus = "idle" | "connecting" | "connected" | "error";

export type LinkSnapshot = {
  status: LinkStatus;
  portLabel: string | null;
  baudRate: number;
  packets: Packet[];
  raw: string[];
  sent: string[];
  error: string | null;
  lastPacketAt: number | null;
  bytesIn: number;
  malformed: number;
};

const MAX_PACKETS = 2000;
const MAX_RAW = 300;

let snapshot: LinkSnapshot = {
  status: "idle",
  portLabel: null,
  baudRate: 57600,
  packets: [],
  raw: [],
  sent: [],
  error: null,
  lastPacketAt: null,
  bytesIn: 0,
  malformed: 0,
};

const listeners = new Set<() => void>();

function set(patch: Partial<LinkSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeLink(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getLink() {
  return snapshot;
}

export function useLink(): LinkSnapshot {
  return useSyncExternalStore(subscribeLink, getLink, getLink);
}

export function isSerialSupported() {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

function clock(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `T+${m}:${s}`;
}

const STATES: Packet["state"][] = ["IDLE", "ASCENT", "APOGEE", "DESCENT", "LANDED"];

/**
 * Accepts either a JSON object per line or a CSV frame:
 * id,met_seconds,altitude,pressure,temperature,tilt,voltage,state
 */
export function parsePacket(line: string, fallbackId: number): Packet | null {
  const text = line.trim().replace(/^[\s>*$]+/, "");
  if (!text) return null;

  let f: Record<string, unknown> | null = null;
  if (text.startsWith("{")) {
    try {
      f = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  let id: number, t: number, altitude: number, pressure: number;
  let temperature: number, tilt: number, voltage: number, state: string;

  if (f) {
    id = num(f["id"] ?? f["packet"]) ?? fallbackId;
    t = num(f["t"] ?? f["met"] ?? f["time"]) ?? 0;
    altitude = num(f["altitude"] ?? f["alt"]) ?? 0;
    pressure = num(f["pressure"] ?? f["pres"]) ?? 0;
    temperature = num(f["temperature"] ?? f["temp"]) ?? 0;
    tilt = num(f["tilt"]) ?? 0;
    voltage = num(f["voltage"] ?? f["vbat"]) ?? 0;
    state = String(f["state"] ?? "IDLE").toUpperCase();
  } else {
    const c = text.split(/[,;\t]/).map((s) => s.trim());
    if (c.length < 7) return null;
    const vals = c.slice(0, 7).map(num);
    if (vals.some((v) => v === null)) return null;
    const v = vals as number[];
    id = v[0]!;
    t = v[1]!;
    altitude = v[2]!;
    pressure = v[3]!;
    temperature = v[4]!;
    tilt = v[5]!;
    voltage = v[6]!;
    state = (c[7] ?? "IDLE").toUpperCase();
  }

  return {
    id,
    t,
    time: clock(t),
    altitude,
    pressure,
    temperature,
    tilt,
    voltage,
    state: (STATES.includes(state as Packet["state"]) ? state : "IDLE") as Packet["state"],
  };
}

type SerialLike = {
  open: (o: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  getInfo?: () => { usbVendorId?: number; usbProductId?: number };
};

let port: SerialLike | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let keepReading = false;

export async function connectSerial(baudRate = snapshot.baudRate) {
  if (!isSerialSupported()) {
    set({ status: "error", error: "Web Serial is unavailable in this browser. Use Chrome or Edge over HTTPS." });
    return;
  }
  try {
    set({ status: "connecting", error: null, baudRate });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requested = (await (navigator as any).serial.requestPort()) as SerialLike;
    await requested.open({ baudRate });
    port = requested;
    const info = requested.getInfo?.() ?? {};
    const label = info.usbVendorId
      ? `USB ${info.usbVendorId.toString(16)}:${(info.usbProductId ?? 0).toString(16)} · ${baudRate} baud`
      : `Serial device · ${baudRate} baud`;
    set({ status: "connected", portLabel: label, packets: [], raw: [], malformed: 0, bytesIn: 0 });
    keepReading = true;
    void readLoop();
  } catch (e) {
    set({
      status: "error",
      error: e instanceof Error ? e.message : "Could not open the serial port.",
    });
  }
}

async function readLoop() {
  if (!port?.readable) return;
  const decoder = new TextDecoder();
  let buffer = "";
  reader = port.readable.getReader();
  try {
    while (keepReading) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      const bytes = snapshot.bytesIn + value.byteLength;
      let malformed = snapshot.malformed;
      const nextPackets = snapshot.packets.slice();
      const nextRaw = snapshot.raw.slice();
      for (const line of lines) {
        if (!line.trim()) continue;
        nextRaw.push(line.trim());
        const p = parsePacket(line, nextPackets.length + 1);
        if (p) nextPackets.push(p);
        else malformed += 1;
      }
      set({
        packets: nextPackets.slice(-MAX_PACKETS),
        raw: nextRaw.slice(-MAX_RAW),
        bytesIn: bytes,
        malformed,
        lastPacketAt: nextPackets.length ? Date.now() : snapshot.lastPacketAt,
      });
    }
  } catch (e) {
    set({ status: "error", error: e instanceof Error ? e.message : "Serial read failed." });
  } finally {
    try {
      reader?.releaseLock();
    } catch {
      /* noop */
    }
    reader = null;
  }
}

export async function disconnectSerial() {
  keepReading = false;
  try {
    await reader?.cancel();
  } catch {
    /* noop */
  }
  try {
    await port?.close();
  } catch {
    /* noop */
  }
  port = null;
  set({ status: "idle", portLabel: null, error: null });
}

export async function sendCommand(command: string) {
  const line = `${command}\n`;
  if (!port?.writable) {
    set({ sent: [...snapshot.sent, `${command}  (no link — not transmitted)`].slice(-50) });
    return false;
  }
  const writer = port.writable.getWriter();
  try {
    await writer.write(new TextEncoder().encode(line));
    set({ sent: [...snapshot.sent, command].slice(-50) });
    return true;
  } catch (e) {
    set({ error: e instanceof Error ? e.message : "Uplink write failed." });
    return false;
  } finally {
    writer.releaseLock();
  }
}
