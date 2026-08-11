import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { ShelfProvider } from "@/components/ShelfContext";
import LiveShelf from "@/components/LiveShelf";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pastiche.grambergmedia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pastiche — the clipboard shelf, free and open-source",
    template: "%s · Pastiche",
  },
  description:
    "A clipboard manager for macOS 13+. Press ⇧⌘V and a shelf slides up with everything you have copied — text, links, images, files, colors. Unlimited local history, pinboards, filtered search. MIT-licensed; nothing leaves your Mac.",
  applicationName: "Pastiche",
  authors: [{ name: "Preston Gramberg", url: "https://github.com/Prestongramberg" }],
  creator: "Preston Gramberg",
  keywords: [
    "clipboard manager",
    "macOS clipboard history",
    "clipboard shelf",
    "open source macOS app",
    "pinboards",
    "paste history",
    "menu bar app",
    "Pastiche",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Pastiche",
    locale: "en_US",
    title: "Pastiche — the clipboard shelf, free and open-source",
    description:
      "A shelf for everything you copy on macOS: unlimited local history, pinboards, filtered search, instant paste. Open source under MIT, and entirely on your machine.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pastiche — the clipboard shelf, free and open-source",
    description:
      "A shelf for everything you copy on macOS: unlimited local history, pinboards, filtered search, instant paste. Open source under MIT, and entirely on your machine.",
  },
};

export const viewport: Viewport = {
  // The site leads with the ink edition regardless of OS theme.
  themeColor: "#121014",
};

/**
 * Applied before first paint so a stored preference never flashes the wrong
 * edition. Default is ink — the site leads dark; paper is one toggle away.
 */
const themeBootstrap = `(function(){try{var s=localStorage.getItem("theme");var t=(s==="dark"||s==="light")?s:"dark";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ShelfProvider>
            <a
              href="#main"
              className="sr-only font-mono text-[11px] uppercase tracking-[0.14em] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:border focus:border-rule focus:bg-paper-raised focus:px-3 focus:py-2 focus:text-ink"
            >
              Skip to content
            </a>

            {/* Floating corner chrome — unboxed, no bar. The shelf lip is the navigation. */}
            <Link
              href="/"
              aria-label="Pastiche — home"
              className="fixed left-[max(1.125rem,env(safe-area-inset-left))] top-[calc(0.875rem_+_env(safe-area-inset-top,0px))] z-[120] font-serif text-[1.0625rem] italic leading-none text-ink/75 transition-colors duration-200 ease-shelf hover:text-ink sm:left-8 sm:top-6 sm:text-[1.1875rem]"
            >
              Pastiche
            </Link>
            <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[calc(0.75rem_+_env(safe-area-inset-top,0px))] z-[120] sm:right-7 sm:top-5">
              <ThemeToggle />
            </div>

            <main id="main">{children}</main>

            <LiveShelf />
          </ShelfProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
