"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  if (!resolvedTheme) {
    return <div className="h-9 w-9 rounded-full glass" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-transform hover:scale-105 active:scale-95"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
