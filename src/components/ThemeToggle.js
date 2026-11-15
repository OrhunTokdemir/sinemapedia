"use client";
import { useSyncExternalStore } from "react";

const ORDER = ["system", "light", "dark"];
const LABEL = { system: "◐ System", light: "☀ Light", dark: "☾ Dark" };
const listeners = new Set();

function readTheme() {
  const m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);
  return m ? m[1] : "system";
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") {
    delete root.dataset.theme;
    document.cookie = "theme=; path=/; max-age=0; SameSite=Lax";
  } else {
    root.dataset.theme = theme;
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }
  listeners.forEach((cb) => cb());
}

/** Cycles System → Light → Dark. The no-flash script in layout.js applies the saved choice on load. */
export default function ThemeToggle() {
  // Server snapshot is "system"; the real value is picked up right after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      className="whitespace-nowrap rounded-md px-2 py-1 text-sm text-muted hover:text-foreground"
      title={`Theme: ${theme} (click for ${next})`}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
    >
      {LABEL[theme]}
    </button>
  );
}
