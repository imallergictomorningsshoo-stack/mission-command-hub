import { createFileRoute } from "@tanstack/react-router";
import { ExportPage } from "@/pages/ExportPage";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export Mission Data — Bhoonidi GCS" },
      {
        name: "description",
        content: "Export recorded CanSat telemetry as CSV, JSON or a formatted PDF mission report.",
      },
      { property: "og:title", content: "Export Mission Data — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Download the Bhoonidi CanSat flight dataset and mission report.",
      },
    ],
  }),
  component: ExportPage,
});
