import Link from "next/link";

/** Clapperboard mark: body with stripes + slate line; the stick opens at -20° and claps shut on hover. */
export function LogoMark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M6 13h20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V15a2 2 0 0 1 2-2z M8.5 14.5h3l-2.5 3.5h-3z M14.5 14.5h3l-2.5 3.5h-3z M20.5 14.5h3l-2.5 3.5h-3z M7 22h12v1.6H7z"
      />
      <path
        fillRule="evenodd"
        className="origin-[4px_12px] -rotate-20 [transform-box:view-box] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out group-hover:rotate-0 group-focus-visible:rotate-0"
        d="M5 8h22a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M9 8.8h3l-2.2 2.4h-3z M15 8.8h3l-2.2 2.4h-3z M21 8.8h3l-2.2 2.4h-3z"
      />
      <circle cx="5.6" cy="12" r="1.1" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Sinemapedia home"
      className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand bg-linear-to-b from-white/15 to-transparent py-1 pr-1.5 pl-1.5 text-brand-fg shadow-sm ring-1 ring-white/15 ring-inset sm:pr-3"
    >
      <LogoMark />
      <span className="hidden text-lg leading-none font-black tracking-tight sm:inline">
        Sinema<span className="opacity-80">pedia</span>
      </span>
    </Link>
  );
}
