import { createFileRoute } from "@tanstack/react-router";
import { AnalysisPage } from "@/pages/AnalysisPage";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Post-Mission Analysis — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Flight summary, packet statistics and pressure trend analysis for the Bhoonidi CanSat flight.",
      },
      { property: "og:title", content: "Post-Mission Analysis — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Engineering review of recorded CanSat flight telemetry.",
      },
    ],
  }),
  component: AnalysisPage,
});
