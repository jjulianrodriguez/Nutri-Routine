"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  setTheme: (theme: Theme) => void;
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeListeners = new Set<() => void>();

function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function getPreferredTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
  }
}

function emitThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const documentTheme = document.documentElement.dataset.theme;

  return isTheme(documentTheme) ? documentTheme : getPreferredTheme();
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeTheme(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  themeListeners.add(listener);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function handleSystemThemeChange() {
    if (getStoredTheme()) {
      return;
    }

    applyTheme(getSystemTheme());
    emitThemeChange();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }

    applyTheme(getPreferredTheme());
    emitThemeChange();
  }

  applyTheme(getPreferredTheme());
  mediaQuery.addEventListener("change", handleSystemThemeChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    themeListeners.delete(listener);
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const setTheme = useCallback((nextTheme: Theme) => {
    persistTheme(nextTheme);
    applyTheme(nextTheme);
    emitThemeChange();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({
      setTheme,
      theme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
