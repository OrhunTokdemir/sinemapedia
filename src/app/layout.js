import { Suspense } from "react";
import Link from "next/link";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import UserMenu from "@/components/UserMenu";
import SearchBox from "@/components/SearchBox";
import Logo from "@/components/Logo";
import { SITE, formatDate } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bebas = Bebas_Neue({ variable: "--font-bebas", weight: "400", subsets: ["latin", "latin-ext"] });

export const metadata = {
  title: { default: "Sinemapedia", template: "%s · Sinemapedia" },
  description: "Track series, rate movies, and follow what your friends watch.",
  authors: [{ name: SITE.author, url: SITE.authorUrl }],
  creator: SITE.author,
};

// Applies the saved theme (cookie) to <html> before first paint, so there is no flash.
// Read in the browser, not via cookies(), so pages stay statically prerenderable.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebas.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          {/* Full width: logo at the left edge, search centered on screen, account at the right edge. */}
          <nav className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 md:grid md:grid-cols-[1fr_minmax(0,42rem)_1fr] md:gap-6 lg:px-8">
            <div className="shrink-0 md:justify-self-start">
              <Logo />
            </div>
            <div className="min-w-0 flex-1 md:w-full">
              <Suspense fallback={<div className="input h-9" />}>
                <SearchBox />
              </Suspense>
            </div>
            <div className="shrink-0 md:justify-self-end">
              <Suspense fallback={<div className="h-9 w-9 rounded-full bg-surface" />}>
                <UserMenu />
              </Suspense>
            </div>
          </nav>
        </header>
        <div className="site-column mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <main className="w-full flex-1 px-4 py-6">{children}</main>
          <footer className="space-y-2 border-t border-border px-4 py-6 text-center text-xs text-muted">
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>© {SITE.createdAt.slice(0, 4)} {SITE.name}</span>
              <span aria-hidden>·</span>
              <span>
                Created by{" "}
                <a href={SITE.authorUrl} className="font-semibold text-foreground hover:text-accent-ink" rel="author">
                  {SITE.author}
                </a>
              </span>
              <span aria-hidden>·</span>
              <span>
                Since <time dateTime={SITE.createdAt}>{formatDate(SITE.createdAt)}</time>
              </span>
              <span aria-hidden>·</span>
              <span>
                Source code:{" "}
                <a href={SITE.licenseUrl} className="hover:text-accent-ink" rel="license">
                  {SITE.license} License
                </a>
              </span>
              <span aria-hidden>·</span>
              <Link href="/kvkk" className="hover:text-accent-ink">KVKK Aydınlatma Metni</Link>
            </p>
            <p>
              Data and images from{" "}
              <a href="https://www.themoviedb.org" className="font-semibold text-foreground underline">
                TMDB
              </a>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
