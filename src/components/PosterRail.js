"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Horizontal poster slider: items flow into a fixed number of rows (default 2) and the
 * rest is reached with the ‹ › arrows (or swipe/trackpad). Columns per view: 3 / 4 / 6.
 */
export default function PosterRail({ children, rows = 2, label, heading }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  const page = (dir) => {
    const el = ref.current;
    el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: "smooth" });
  };

  const scrollable = !(edges.start && edges.end);

  return (
    <div>
      {/* Section title on the left, ‹ › controls on the right of the same line. */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">{heading}</div>
        <div className={`flex shrink-0 gap-2 ${scrollable ? "" : "invisible"}`}>
          <RailArrow dir={-1} disabled={edges.start} onClick={() => page(-1)} />
          <RailArrow dir={1} disabled={edges.end} onClick={() => page(1)} />
        </div>
      </div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        style={{ gridTemplateRows: `repeat(${rows}, auto)` }}
        className="grid snap-x snap-mandatory auto-cols-[calc((100%-2rem)/3)] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] focus-visible:outline-none sm:auto-cols-[calc((100%-3rem)/4)] md:auto-cols-[calc((100%-5rem)/6)] [&::-webkit-scrollbar]:hidden [&>*]:snap-start"
      >
        {children}
      </div>
    </div>
  );
}

function RailArrow({ dir, disabled, onClick }) {
  const prev = dir < 0;
  return (
    <button
      type="button"
      aria-label={prev ? "Previous" : "Next"}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface pb-0.5 text-xl leading-none transition hover:border-accent hover:bg-accent hover:text-accent-fg disabled:pointer-events-none disabled:opacity-35"
    >
      {prev ? "‹" : "›"}
    </button>
  );
}
