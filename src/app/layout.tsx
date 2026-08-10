import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pastiche-site.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Pastiche — A Limitless Clipboard for macOS",
    template: "%s | Pastiche",
  },
  description:
    "Pastiche is a free, open-source clipboard manager for macOS. A slide-up shelf with unlimited history, pinboards, power search, and instant paste — everything stays on your Mac.",
  keywords: [
    "clipboard manager",
    "macOS",
    "clipboard history",
    "paste",
    "pinboards",
    "open source",
    "productivity",
    "menu bar app",
  ],
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pastiche — A Limitless Clipboard for macOS",
    description:
      "Free, open-source clipboard manager for macOS. Unlimited history, pinboards, power search, instant paste — all local.",
    url: siteUrl,
    siteName: "Pastiche",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pastiche — A Limitless Clipboard for macOS",
    description:
      "Free, open-source clipboard manager for macOS. Unlimited history, pinboards, power search, instant paste — all local.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
