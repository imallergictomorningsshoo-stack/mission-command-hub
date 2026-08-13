// Ground-station configuration persisted to the operator's browser.
import { useSyncExternalStore } from "react";

export type GcsConfig = {
  frequency: string;
  spreadingFactor: string;
  txPower: string;
  packetRate: number;
  baudRate: number;
  packetTimeout: string;
  logging: boolean;
  sessionName: string;
  cameraCapture: string;
  weakSignal: string;
  lowBattery: string;
  maxTilt: string;
};

export const defaultConfig: GcsConfig = {
  frequency: "433.000",
  spreadingFactor: "SF9",
  txPower: "20",
  packetRate: 1,
  baudRate: 57600,
  packetTimeout: "4.0",
  logging: true,
  sessionName: "MRCC-2026-FLIGHT-04",
  cameraCapture: "Both cameras",
  weakSignal: "-90",
  lowBattery: "7.20",
  maxTilt: "45",
};

const KEY = "bhoonidi.gcs.config";

let current: GcsConfig = defaultConfig;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function loadConfig(): GcsConfig {
  if (typeof window === "undefined") return defaultConfig;
  if (!hydrated) {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) current = { ...defaultConfig, ...(JSON.parse(raw) as Partial<GcsConfig>) };
    } catch {
      current = defaultConfig;
    }
  }
  return current;
}

export function saveConfig(next: GcsConfig) {
  current = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

export function resetConfig() {
  saveConfig(defaultConfig);
}

export function useConfig(): GcsConfig {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => loadConfig(),
    () => defaultConfig,
  );
}
