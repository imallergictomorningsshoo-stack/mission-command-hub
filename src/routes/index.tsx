import { createFileRoute } from "@tanstack/react-router";
import { MissionControlPage } from "@/pages/MissionControlPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Operations — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Live CanSat telemetry monitoring, dual camera feeds, telemetry logs, and mission control for Team Bhoonidi.",
      },
      { property: "og:title", content: "Flight Operations — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Live CanSat telemetry monitoring for MRCC.",
      },
    ],
  }),
  component: MissionControlPage,
});

