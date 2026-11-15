"use client";
import { useSyncExternalStore } from "react";

// Language comes from the URL hash (#en / #tr), so links can point at either version.
function subscribe(cb) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const getLang = () => (window.location.hash === "#en" ? "en" : "tr");
const getServerLang = () => "tr";

/** TR / EN slider that shows one of two server-rendered versions of the notice. */
export default function KvkkLanguageSwitch({ tr, en }) {
  const lang = useSyncExternalStore(subscribe, getLang, getServerLang);
  const isEn = lang === "en";
  const toggle = () => {
    window.location.hash = isEn ? "tr" : "en";
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-end gap-2 text-xs font-semibold">
        <span className={isEn ? "text-muted" : "text-foreground"}>TR</span>
        <button
          type="button"
          role="switch"
          aria-checked={isEn}
          aria-label="Language / Dil: English"
          onClick={toggle}
          className={`relative h-6 w-11 rounded-full border border-border transition-colors ${isEn ? "bg-accent" : "bg-surface"}`}
        >
          <span
            aria-hidden
            className={`absolute top-0.5 left-0.5 h-4.5 w-4.5 rounded-full shadow transition-transform ${
              isEn ? "translate-x-5 bg-accent-fg" : "translate-x-0 bg-muted"
            }`}
          />
        </button>
        <span className={isEn ? "text-foreground" : "text-muted"}>EN</span>
      </div>
      <div lang="tr" hidden={isEn}>{tr}</div>
      <div lang="en" hidden={!isEn}>{en}</div>
    </div>
  );
}
