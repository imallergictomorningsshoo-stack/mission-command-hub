// Web Serial link to the ESP32 ground station: port selection, frame ingestion, uplink.
import { useSyncExternalStore } from "react";
import { mergeFrame, parseFrame, type Sample } from "@/lib/frames";

export type LinkStatus = "idle" | "connecting" | "connected" | "error";

export type LinkSnapshot = {
  status: LinkStatus;
  portLabel: string | null;
  baudRate: number;
  samples: Sample[];
  frameCounts: { f1: number; f2: number; f3: number };
  raw: string[];
  sent: string[];
  error: string | null;
  lastPacketAt: number | null;
  connectedAt: number | null;
  bytesIn: number;
  malformed: number;
};

const MAX_SAMPLES = 2000;
const MAX_RAW = 400;

let snapshot: LinkSnapshot = {
  status: "idle",
  portLabel: null,
  baudRate: 115200,
  samples: [],
  frameCounts: { f1: 0, f2: 0, f3: 0 },
  raw: [],
  sent: [],
  error: null,
  lastPacketAt: null,
  connectedAt: null,
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

export function clearSession() {
  set({
    samples: [],
    raw: [],
    frameCounts: { f1: 0, f2: 0, f3: 0 },
    bytesIn: 0,
    malformed: 0,
    lastPacketAt: null,
  });
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
    set({
      status: "error",
      error: "Web Serial is unavailable in this browser. Use Chrome or Edge over HTTPS or localhost.",
    });
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
    set({
      status: "connected",
      portLabel: label,
      connectedAt: Date.now(),
      samples: [],
      frameCounts: { f1: 0, f2: 0, f3: 0 },
      raw: [],
      malformed: 0,
      bytesIn: 0,
    });
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

      let samples = snapshot.samples;
      let malformed = snapshot.malformed;
      const counts = { ...snapshot.frameCounts };
      const raw = snapshot.raw.slice();
      let gotFrame = false;

      for (const line of lines) {
        if (!line.trim()) continue;
        raw.push(line.trim());
        const frame = parseFrame(line, samples.length + 1);
        if (frame) {
          samples = mergeFrame(samples, frame, MAX_SAMPLES);
          counts[`f${frame.frame}` as "f1" | "f2" | "f3"] += 1;
          gotFrame = true;
        } else {
          malformed += 1;
        }
      }

      set({
        samples,
        frameCounts: counts,
        raw: raw.slice(-MAX_RAW),
        bytesIn: snapshot.bytesIn + value.byteLength,
        malformed,
        lastPacketAt: gotFrame ? Date.now() : snapshot.lastPacketAt,
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
  set({ status: "idle", portLabel: null, error: null, connectedAt: null });
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
