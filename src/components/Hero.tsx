"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import DownloadButton from "./DownloadButton";
import ShelfMock from "./ShelfMock";

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden grid-bg pt-28 md:pt-32">
      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-[12%] h-[420px] w-[420px] rounded-full bg-electric/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 text-center md:py-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-accent"
          >
            Clipboard manager for macOS
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
          >
            <h1 className="mb-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              Copy once.
              <br />
              Paste <span className="text-gradient">anything</span>.
              <br />
              Forever.
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-foreground/50 md:text-xl">
              Pastiche keeps everything you have ever copied one shortcut away — text, links,
              images, files, and colors — in a shelf that slides up over whatever you are doing.
              Unlimited history, pinboards, power search, and not a single byte leaves your Mac.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <DownloadButton />
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full max-w-[22rem] items-center justify-center gap-3 rounded-xl border border-border px-8 py-4 text-lg font-medium text-foreground/70 transition-all hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight sm:w-auto sm:max-w-none"
              >
                <Github size={20} className="shrink-0" />
                View on GitHub
              </a>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
            className="mt-6 text-sm tracking-wide text-foreground/35"
          >
            Free &amp; open source · macOS 13+ · Auto-updates built in
          </motion.p>
        </div>
      </div>

      {/* The shelf sits flush against the bottom of the section, the way it sits
          against the bottom of a real screen. */}
      <div className="relative z-10 w-full px-4 sm:px-6">
        <ShelfMock />
      </div>
    </section>
  );
}
