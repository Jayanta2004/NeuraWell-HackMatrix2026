"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

export type ThemeName = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "neurawell-theme";
const listeners = new Set<() => void>();

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): ThemeName {
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    mql.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): ThemeName {
  return getStoredTheme();
}

function getThemeServerSnapshot(): ThemeName {
  return "system";
}

function getResolvedSnapshot(): ResolvedTheme | undefined {
  const t = getStoredTheme();
  return t === "system" ? getSystemTheme() : t;
}

function getResolvedServerSnapshot(): ResolvedTheme | undefined {
  return undefined;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getThemeServerSnapshot);
  const resolvedTheme = useSyncExternalStore(subscribe, getResolvedSnapshot, getResolvedServerSnapshot);

  const setTheme = (next: ThemeName) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    listeners.forEach((l) => l());
  };

  return { theme, resolvedTheme, setTheme };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme) applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}
