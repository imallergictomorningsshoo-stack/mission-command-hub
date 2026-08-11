import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("gcs-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("gcs-theme", theme);
  }, [theme]);

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-signal/40 hover:text-signal"
    >
      {theme === "dark" ? (
        <Sun className="size-4" strokeWidth={1.8} />
      ) : (
        <Moon className="size-4" strokeWidth={1.8} />
      )}
      <span className="label-caps hidden text-[10px] lg:block">{next}</span>
    </button>
  );
}
