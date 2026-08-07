import { createFileRoute } from "@tanstack/react-router";
import { MissionControlPage } from "@/pages/MissionControlPage";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Mission Control — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Live CanSat telemetry: altitude, pressure, temperature and tilt with real-time charts and packet log.",
      },
      { property: "og:title", content: "Mission Control — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Real-time CanSat flight telemetry for the MRCC mission.",
      },
    ],
  }),
  component: MissionControlPage,
});
