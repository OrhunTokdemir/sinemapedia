"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

/** Account dropdown opened from the user's profile picture. */
export default function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();

  // Close when the route changes (state is tied to the path it was opened on).
  const isOpen = open && openedAt === pathname;

  function close(focusTrigger = false) {
    setOpen(false);
    if (focusTrigger) buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    // Focus the first item when opening.
    rootRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isOpen]);

  function onKeyDown(e) {
    if (!isOpen) return;
    const items = [...rootRef.current.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const item = "block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-background focus:bg-background focus:outline-none";

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Account menu for @${user.username}`}
        onClick={() => {
          setOpen(!isOpen);
          setOpenedAt(pathname);
        }}
        className={`block rounded-full ring-2 ring-offset-2 ring-offset-background transition hover:ring-accent focus-visible:ring-accent focus-visible:outline-none ${
          isOpen ? "ring-accent" : "ring-transparent"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.image} alt="" width={36} height={36} className="h-9 w-9 rounded-full bg-surface object-cover" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="card absolute right-0 z-30 mt-2 w-60 p-1.5 shadow-xl"
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-background object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{user.name}</p>
              <p className="truncate text-sm text-muted">@{user.username}</p>
            </div>
          </div>
          <div className="my-1 border-t border-border" />
          <Link role="menuitem" href={`/u/${user.username}`} className={item} onClick={() => close()}>Profile</Link>
          <Link role="menuitem" href="/feed" className={item} onClick={() => close()}>Feed</Link>
          <Link role="menuitem" href="/tracking" className={item} onClick={() => close()}>Tracking</Link>
          <Link role="menuitem" href="/settings" className={item} onClick={() => close()}>Settings</Link>
          <div className="my-1 border-t border-border" />
          <ThemeToggle variant="menu" className={item} />
          <button
            role="menuitem"
            type="button"
            className={`${item} text-accent-ink`}
            onClick={async () => {
              close();
              await signOut();
              router.push("/");
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
