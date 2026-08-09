import { createFileRoute } from "@tanstack/react-router";
import navarsLogo from "@/assets/navars-space-lab.png";
import gaudiumLogo from "@/assets/gaudium-school.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Navars Space Lab — Gaudium School" },
      {
        name: "description",
        content: "Brand identity for Navars Space Lab and The Gaudium School.",
      },
      { property: "og:title", content: "Navars Space Lab — Gaudium School" },
      {
        property: "og:description",
        content: "Black background logo treatment inspired by the provided reference artwork.",
      },
    ],
  }),
  component: ConnectionPage,
});

function ConnectionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-black px-2 py-6 sm:px-6">
      <div className="w-full max-w-[1800px]">
        <div className="flex flex-col items-center justify-center">
          <img
            src={navarsLogo}
            alt="NAVARS SPACE LAB"
            className="w-full max-w-[1800px] select-none object-contain"
          />
          <img
            src={gaudiumLogo}
            alt="THE GAUDIUM SCHOOL"
            className="mt-4 w-full max-w-[1600px] select-none object-contain"
          />
        </div>
      </div>
    </main>
  );
}
