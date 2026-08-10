"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import DownloadButton from "./DownloadButton";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 h-[24rem] w-[24rem] translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center md:px-16 md:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-bg opacity-70"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient"
          />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              Your clipboard,{" "}
              <span className="text-gradient">remembered</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/50 md:text-lg">
              Install it once and stop losing things. Unlimited history,
              pinboards, and instant paste — free, open source, and entirely on
              your Mac.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <DownloadButton />
              <a
                href="https://github.com/Prestongramberg/Pastiche"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 font-bold text-foreground transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
              >
                <Github size={18} aria-hidden="true" />
                View on GitHub
              </a>
            </div>

            <p className="mt-8 text-xs text-foreground/40 sm:text-sm">
              Free &amp; open source · macOS 13 or later · MIT licensed ·
              Auto-updates built in
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
