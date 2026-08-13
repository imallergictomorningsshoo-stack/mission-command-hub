import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";

type Mode = "nir" | "gray";

export function CameraFeed({
  title,
  hint,
  mode,
  compact = false,
}: {
  title: string;
  hint?: string | undefined;
  mode: Mode;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ res: string; fps: string }>({ res: "—", fps: "—" });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
    setMeta({ res: "—", fps: "—" });
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera capture is not available in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      const settings = stream.getVideoTracks()[0]?.getSettings();
      setMeta({
        res: settings?.width && settings?.height ? `${settings.width}×${settings.height}` : "—",
        fps: settings?.frameRate ? `${Math.round(settings.frameRate)} fps` : "—",
      });
      setLive(true);
      const list = (await navigator.mediaDevices.enumerateDevices()).filter(
        (d) => d.kind === "videoinput",
      );
      setDevices(list);
      if (!deviceId && settings?.deviceId) setDeviceId(settings.deviceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera access denied.");
    }
  }, [deviceId]);

  return (
    <Panel className="flex min-h-0 flex-col">
      <PanelHeader
        title={title}
        {...(hint ? { hint } : {})}
        right={
          <StatusChip tone={live ? "online" : "idle"} pulse={live}>
            {live ? "Streaming" : "Standby"}
          </StatusChip>
        }
      />
      <div className={cn("flex min-h-0 flex-1 flex-col", compact ? "gap-2 p-2.5" : "gap-3 p-4")}>
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70",
            compact ? "" : "aspect-video",
            mode === "nir"
              ? "bg-[radial-gradient(120%_90%_at_50%_10%,var(--panel-2),var(--background))]"
              : "bg-[linear-gradient(160deg,var(--panel-2),var(--background))]",
          )}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            className={cn(
              "size-full object-cover transition-opacity duration-300",
              live ? "opacity-100" : "opacity-0",
              mode === "nir"
                ? "[filter:grayscale(1)_sepia(1)_hue-rotate(120deg)_saturate(2.4)_contrast(1.15)]"
                : "[filter:grayscale(1)_contrast(1.1)]",
            )}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, var(--grid) 0px, var(--grid) 1px, transparent 1px, transparent 4px)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 sweep-line" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-20 rounded-full border border-signal/30" />
            <div className="absolute h-px w-14 bg-signal/30" />
            <div className="absolute h-14 w-px bg-signal/30" />
          </div>
          <span className="absolute top-2 left-2 size-4 border-t border-l border-signal/50" />
          <span className="absolute top-2 right-2 size-4 border-t border-r border-signal/50" />
          <span className="absolute bottom-2 left-2 size-4 border-b border-l border-signal/50" />
          <span className="absolute right-2 bottom-2 size-4 border-r border-b border-signal/50" />

          <div className="absolute top-2.5 left-8 flex items-center gap-2">
            <span className="numeric text-[0.6rem] text-signal">
              {mode === "nir" ? "NIR · 850nm" : "MONO · 8-BIT"}
            </span>
          </div>
          <div className="numeric absolute right-8 bottom-2.5 text-[0.6rem] text-muted-foreground">
            {meta.res} · {meta.fps}
          </div>

          {!live ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="label-caps">{error ? "Camera Error" : "No Signal"}</span>
              {error ? (
                <p className="max-w-[80%] text-center text-[10px] text-warn">{error}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="numeric min-w-0 flex-1 truncate rounded-lg border border-input bg-panel px-2 py-1 text-[11px] outline-none focus:border-signal/60"
          >
            <option value="">Default capture device</option>
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => (live ? stop() : void start())}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/10 px-2.5 py-1 text-[11px] font-medium text-signal transition-colors hover:bg-signal/20"
          >
            {live ? <CameraOff className="size-3.5" /> : <Camera className="size-3.5" />}
            {live ? "Stop" : "Attach"}
          </button>
        </div>
      </div>
    </Panel>
  );
}
