import { Suspense } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import UserMenu from "@/components/UserMenu";
import SearchBox from "@/components/SearchBox";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: { default: "Sinemapedia", template: "%s · Sinemapedia" },
  description: "Track series, rate movies, and follow what your friends watch.",
};

// Applies the saved theme (cookie) to <html> before first paint, so there is no flash.
// Read in the browser, not via cookies(), so pages stay statically prerenderable.
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link href="/" className="rounded bg-brand px-2 py-0.5 text-lg font-black text-brand-fg">
              Sinemapedia
            </Link>
            <div className="flex-1">
              <Suspense fallback={<div className="input h-9" />}>
                <SearchBox />
              </Suspense>
            </div>
            <ThemeToggle />
            <Suspense fallback={<div className="h-8 w-24" />}>
              <UserMenu />
            </Suspense>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          <p>
            Data and images from{" "}
            <a href="https://www.themoviedb.org" className="font-semibold text-foreground underline">
              TMDB
            </a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </footer>
      </body>
    </html>
  );
}
