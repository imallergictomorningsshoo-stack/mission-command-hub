import { createFileRoute } from "@tanstack/react-router";
import { ConnectionPage } from "@/pages/ConnectionPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ground Station Connection — Bhoonidi GCS" },
      {
        name: "description",
        content:
          "Establish the serial link between the Bhoonidi ground station and the CanSat telemetry downlink.",
      },
      { property: "og:title", content: "Ground Station Connection — Bhoonidi GCS" },
      {
        property: "og:description",
        content: "Serial link setup and telemetry handshake for the MRCC CanSat mission.",
      },
    ],
  }),
  component: ConnectionPage,
});
