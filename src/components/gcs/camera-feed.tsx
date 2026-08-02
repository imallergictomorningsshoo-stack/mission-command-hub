import { cn } from "@/lib/utils";
import { Panel, PanelHeader } from "@/components/gcs/panel";
import { StatusChip } from "@/components/gcs/status-chip";

export function CameraFeed({
  title,
  hint,
  mode,
  resolution,
  fps,
  online = true,
}: {
  title: string;
  hint?: string | undefined;
  mode: "nir" | "gray";
  resolution: string;
  fps: string;
  online?: boolean;
}) {
  return (
    <Panel>
      <PanelHeader
        title={title}
        {...(hint ? { hint } : {})}
        right={
          <StatusChip tone={online ? "online" : "idle"} pulse={online}>
            {online ? "Streaming" : "Standby"}
          </StatusChip>
        }
      />
      <div className="p-4">
        <div
          className={cn(
            "relative aspect-video overflow-hidden rounded-xl border border-border/70",
            mode === "nir"
              ? "bg-[radial-gradient(120%_90%_at_50%_10%,var(--panel-2),var(--background))]"
              : "bg-[linear-gradient(160deg,var(--panel-2),var(--background))]",
          )}
        >
          {/* scanline / noise texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, var(--grid) 0px, var(--grid) 1px, transparent 1px, transparent 4px)",
            }}
          />
          {mode === "nir" ? (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_35%_45%,var(--ok),transparent_70%)] opacity-25" />
          ) : null}
          <div className="pointer-events-none absolute inset-0 sweep-line" />

          {/* reticle */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-24 rounded-full border border-signal/30" />
            <div className="absolute h-px w-16 bg-signal/30" />
            <div className="absolute h-16 w-px bg-signal/30" />
          </div>

          {/* corner brackets */}
          <span className="absolute top-2 left-2 size-4 border-t border-l border-signal/50" />
          <span className="absolute top-2 right-2 size-4 border-t border-r border-signal/50" />
          <span className="absolute bottom-2 left-2 size-4 border-b border-l border-signal/50" />
          <span className="absolute right-2 bottom-2 size-4 border-r border-b border-signal/50" />

          <div className="absolute top-2.5 left-8 flex items-center gap-2">
            <span className="numeric text-[0.65rem] text-signal">
              {mode === "nir" ? "NIR · 850nm" : "MONO · 8-BIT"}
            </span>
          </div>
          <div className="numeric absolute right-8 bottom-2.5 text-[0.65rem] text-muted-foreground">
            {resolution} · {fps}
          </div>
          {!online ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="label-caps">No Signal</span>
            </div>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border/70 px-2 py-2">
            <span className="label-caps text-[0.6rem]">Frames</span>
            <p className="numeric mt-1 text-sm">{mode === "nir" ? "3,412" : "3,408"}</p>
          </div>
          <div className="rounded-lg border border-border/70 px-2 py-2">
            <span className="label-caps text-[0.6rem]">Dropped</span>
            <p className="numeric mt-1 text-sm text-warn">{mode === "nir" ? "12" : "7"}</p>
          </div>
          <div className="rounded-lg border border-border/70 px-2 py-2">
            <span className="label-caps text-[0.6rem]">Bitrate</span>
            <p className="numeric mt-1 text-sm">{mode === "nir" ? "1.8 Mb/s" : "1.2 Mb/s"}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}