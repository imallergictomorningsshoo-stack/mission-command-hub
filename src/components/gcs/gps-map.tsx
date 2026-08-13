import { useEffect, useRef, useState } from "react";

export type TrackPoint = { lat: number; lon: number; label?: string };

/** OpenStreetMap tile map. Leaflet is imported after mount so SSR stays clean. */
export function GpsMap({
  track,
  className = "h-[280px] w-full",
}: {
  track: TrackPoint[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.setAttribute("data-leaflet", "true");
        document.head.appendChild(link);
      }
      const L = await import("leaflet");
      if (cancelled || !ref.current || track.length === 0) return;

      map = L.map(ref.current, { zoomControl: true, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const latlngs = track.map((p) => [p.lat, p.lon] as [number, number]);
      L.polyline(latlngs, { color: "#0ea5e9", weight: 3, opacity: 0.9 }).addTo(map);

      const first = track[0]!;
      const last = track[track.length - 1]!;
      L.circleMarker([first.lat, first.lon], {
        radius: 6,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(first.label ?? "Launch");
      L.circleMarker([last.lat, last.lon], {
        radius: 6,
        color: "#f97316",
        fillColor: "#f97316",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(last.label ?? "Landing");

      map.fitBounds(L.latLngBounds(latlngs).pad(0.35));
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [track]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border/70 ${className}`}>
      <div ref={ref} className="size-full" />
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-panel-2/60">
          <span className="label-caps">Loading map tiles…</span>
        </div>
      ) : null}
    </div>
  );
}
