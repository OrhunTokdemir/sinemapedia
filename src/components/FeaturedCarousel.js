"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const INTERVAL = 6000;
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Steam-style featured carousel: wide backdrop on the left, info panel on the right. */
export default function FeaturedCarousel({ slides }) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchX = useRef(null);

  const go = (i) => setIndex(((i % n) + n) % n);

  // Auto-advance; restarts after every change, pauses on hover/focus, hidden tab, reduced motion.
  useEffect(() => {
    if (n < 2 || hovered || focused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % n);
    }, INTERVAL);
    return () => clearTimeout(t);
  }, [index, n, hovered, focused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="space-y-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <h2 className="sr-only">Featured</h2>
      <div className="card relative grid grid-cols-1 overflow-hidden">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.title}`}
              aria-hidden={!active}
              inert={!active}
              className={`[grid-area:1/1] grid min-w-0 transition-opacity duration-500 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Link
                href={s.href}
                tabIndex={-1}
                className="relative block aspect-video bg-background"
                onPointerDown={(e) => e.pointerType === "touch" && (touchX.current = e.clientX)}
                onPointerUp={(e) => {
                  if (touchX.current === null) return;
                  const dx = e.clientX - touchX.current;
                  touchX.current = null;
                  if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
                }}
              >
                {s.backdrop && (
                  <Image
                    src={s.backdrop}
                    alt={s.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-col gap-3 p-5">
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    <Link href={s.href} className="hover:text-accent-ink">{s.title}</Link>
                    {s.year && <span className="ml-2 font-normal text-muted">({s.year})</span>}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    {s.status === "upcoming" ? (
                      <span className="rounded bg-accent px-2 py-0.5 text-accent-fg">
                        COMING SOON{s.date ? ` · ${dateFmt.format(new Date(`${s.date}T00:00:00Z`))}` : ""}
                      </span>
                    ) : (
                      <span className="rounded border border-border bg-background px-2 py-0.5">POPULAR NOW</span>
                    )}
                    <span className="text-muted">{s.kind === "tv" ? "Series" : "Movie"}</span>
                  </div>
                </div>
                {s.overview && <p className="line-clamp-5 text-sm leading-relaxed text-foreground/85">{s.overview}</p>}
                <div className="mt-auto space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {s.score > 0 && (
                      <span className="mr-1 font-semibold" title="TMDB rating">
                        <span className="text-star">★</span> {s.score.toFixed(1)}
                      </span>
                    )}
                    {s.genres.map((g) => (
                      <span key={g} className="rounded-full border border-border px-2 py-0.5 text-muted">{g}</span>
                    ))}
                  </div>
                  <Link href={s.href} className="btn-primary inline-block text-sm">View details →</Link>
                </div>
              </div>
            </div>
          );
        })}

        {n > 1 && (
          // Overlay matching the image column (full width on mobile, left 2/3 on md+).
          <div className="pointer-events-none absolute left-0 top-0 z-10 flex aspect-video w-full items-center justify-between px-2 md:w-2/3">
            <Arrow dir="prev" onClick={() => go(index - 1)} />
            <Arrow dir="next" onClick={() => go(index + 1)} />
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${s.title}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-2 bg-border hover:bg-muted"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Arrow({ dir, onClick }) {
  const prev = dir === "prev";
  return (
    <button
      type="button"
      aria-label={prev ? "Previous slide" : "Next slide"}
      onClick={onClick}
      className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 pb-0.5 text-3xl leading-none text-white transition hover:bg-black/75"
    >
      {prev ? "‹" : "›"}
    </button>
  );
}
