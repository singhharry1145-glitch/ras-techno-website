import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextValue {
  theme: Theme;            // resolved theme actually applied
  mode: ThemeMode;         // user's chosen mode (auto follows system)
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void; // cycles auto -> light -> dark -> auto
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "ras-theme";

const systemPrefers = (): Theme =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "auto";
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === "light" || saved === "dark" || saved === "auto") return saved;
  return "auto";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemTheme, setSystemTheme] = useState<Theme>(systemPrefers);

  // Track OS-level changes so "auto" follows the device theme live
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "light" : "dark");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const theme: Theme = mode === "auto" ? systemTheme : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, mode);

    const color = theme === "dark" ? "#0a0f1c" : "#f5f8fc";
    const setMeta = (name: string, attr: "name" | "property", content: string) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("theme-color", "name", color);
    setMeta("msapplication-navbutton-color", "name", color);
    setMeta("apple-mobile-web-app-status-bar-style", "name", theme === "dark" ? "black-translucent" : "default");
    setMeta("color-scheme", "name", mode === "auto" ? "light dark" : theme);
    setMeta("og:theme", "property", theme);
  }, [theme, mode]);

  const setTheme = (t: ThemeMode) => setModeState(t);
  // Simple 2-state toggle: flip between light and dark on each click.
  // "auto" remains as the initial value (from storage/system) until the user toggles.
  const toggleTheme = () => setModeState(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
