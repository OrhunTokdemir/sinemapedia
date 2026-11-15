"use client";
import { useSyncExternalStore } from "react";

const ORDER = ["system", "light", "dark"];
const ICON = { system: "◐", light: "☀", dark: "☾" };
const NAME = { system: "System", light: "Light", dark: "Dark" };
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

/**
 * Cycles System → Light → Dark. The no-flash script in layout.js applies the saved choice on load.
 * variant "icon": compact header button; variant "menu": full-width row inside the account menu.
 */
export default function ThemeToggle({ variant = "icon", className = "" }) {
  // Server snapshot is "system"; the real value is picked up right after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const label = `Theme: ${NAME[theme]}. Switch to ${NAME[next]}.`;

  if (variant === "menu") {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={() => applyTheme(next)}
        aria-label={label}
        className={`flex items-center justify-between ${className}`}
      >
        <span>Theme</span>
        <span className="text-muted">
          {NAME[theme]} <span aria-hidden>{ICON[theme]}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg text-muted hover:bg-surface hover:text-foreground ${className}`}
      title={label}
      aria-label={label}
    >
      <span aria-hidden>{ICON[theme]}</span>
    </button>
  );
}
