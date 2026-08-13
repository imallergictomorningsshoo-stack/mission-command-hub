import { createFileRoute } from "@tanstack/react-router";
import { AnalysisPage } from "@/pages/AnalysisPage";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Data Analysis — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "NIR vegetation index mapping, field-of-view geometry and searchable telemetry for the Bhoonidi CanSat payload.",
      },
      { property: "og:title", content: "Data Analysis — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Post-flight NIR analysis and telemetry data exploration.",
      },
    ],
  }),
  component: AnalysisPage,
});
