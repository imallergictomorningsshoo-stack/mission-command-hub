import type { PacketEntry } from "./telemetryData";

export type LoRaSerialStatus = "idle" | "connecting" | "connected" | "error";

export type LoRaSerialOptions = {
  onPacket: (packet: PacketEntry) => void;
  onStatusChange?: (status: LoRaSerialStatus, message?: string) => void;
};

type SerialPortLike = {
  readable: ReadableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};

type SerialNavigatorLike = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPortLike>;
  };
};

export const isLoRaSerialSupported = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const serialNavigator = navigator as SerialNavigatorLike;
  return typeof serialNavigator.serial?.requestPort === "function";
};

const parseNumeric = (value: string | undefined): number | null => {
  if (value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export class LoraSerial {
  private port: SerialPortLike | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private buffer = "";
  private status: LoRaSerialStatus = "idle";
  private readonly options: LoRaSerialOptions;

  constructor(options: LoRaSerialOptions) {
    this.options = options;
  }

  getStatus(): LoRaSerialStatus {
    return this.status;
  }

  async connect(): Promise<void> {
    if (!isLoRaSerialSupported()) {
      throw new Error("Web Serial is not supported in this browser.");
    }

    this.setStatus("connecting", "Requesting LoRa serial port...");

    try {
      const serialNavigator = navigator as SerialNavigatorLike;
      const port = await serialNavigator.serial?.requestPort();
      if (!port) {
        throw new Error("No serial port was selected.");
      }
      await port.open({ baudRate: 115200 });

      this.port = port;
      this.setStatus("connected", "LoRa serial connected.");
      void this.readLoop();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open serial port.";
      this.setStatus("error", message);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // Ignore cancellation errors during disconnect.
      }
      this.reader.releaseLock();
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignore close errors if the port is already closed.
      }
      this.port = null;
    }

    this.buffer = "";
    this.setStatus("idle", "LoRa serial disconnected.");
  }

  private setStatus(status: LoRaSerialStatus, message?: string) {
    this.status = status;
    this.options.onStatusChange?.(status, message);
  }

  private async readLoop() {
    if (!this.port?.readable) {
      return;
    }

    const reader = this.port.readable.getReader();
    this.reader = reader;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        this.buffer += this.decoder.decode(value, { stream: true });
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() ?? "";

        for (const line of lines) {
          const packet = this.parseLine(line);
          if (packet) {
            this.options.onPacket(packet);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Serial read failed.";
      this.setStatus("error", message);
    } finally {
      reader.releaseLock();
      this.reader = null;
      this.buffer = "";
    }
  }

  private parseLine(line: string): PacketEntry | null {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }

    const keyValues = new Map<string, string>();
    const csvValues = trimmed
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (trimmed.includes("=")) {
      for (const segment of trimmed.split(/[;,]/)) {
        const index = segment.indexOf("=");
        if (index > 0) {
          const key = segment.slice(0, index).trim().toLowerCase();
          const value = segment.slice(index + 1).trim();
          if (key && value) {
            keyValues.set(key, value);
          }
        }
      }
    }

    if (keyValues.size === 0 && csvValues.length < 4) {
      return null;
    }

    const packet = parseNumeric(keyValues.get("packet") ?? keyValues.get("seq") ?? csvValues[0]) ?? 1;
    const temperature = parseNumeric(keyValues.get("temperature") ?? csvValues[1]) ?? 0;
    const pressure = parseNumeric(keyValues.get("pressure") ?? csvValues[2]) ?? 0;
    const altitude = parseNumeric(keyValues.get("altitude") ?? keyValues.get("alt") ?? csvValues[3]) ?? 0;
    const battery = parseNumeric(keyValues.get("battery") ?? csvValues[4]) ?? 3.9;
    const rssi = parseNumeric(keyValues.get("rssi") ?? csvValues[5]) ?? 80;
    const humidity = parseNumeric(keyValues.get("humidity") ?? csvValues[6]) ?? 45;
    const light = parseNumeric(keyValues.get("light") ?? csvValues[7]) ?? 120;
    const pitch = parseNumeric(keyValues.get("pitch") ?? csvValues[8]) ?? 0;
    const roll = parseNumeric(keyValues.get("roll") ?? csvValues[9]) ?? 0;

    return {
      id: packet,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      packet,
      temperature,
      pressure,
      altitude,
      battery,
      rssi,
      humidity,
      light,
      pitch,
      roll,
      packetLoss: 0,
      gpsLock: true,
      sdLogging: true,
      flightMode: "Telemetry",
    };
  }
}
