"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  InfinityIcon,
  Keyboard,
  Layers,
  Pin,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: ReactNode;
};

const features: Feature[] = [
  {
    icon: InfinityIcon,
    title: "Unlimited history",
    description:
      "The default limit is no limit. Every clipping stays until you delete it — or cap history at 100, 500, 1,000, or 5,000 items if you’d rather keep things small.",
  },
  {
    icon: Zap,
    title: "Instant paste",
    description:
      "Pastiche re-activates the app you came from and sends ⌘V for you. The clipping is in your document before the shelf finishes sliding away.",
    meta: (
      <span className="flex items-center gap-2">
        <kbd className="kbd">Return</kbd>
        <span className="text-foreground/40 text-xs">to paste</span>
      </span>
    ),
  },
  {
    icon: Pin,
    title: "Pinboards",
    description:
      "Group the snippets you paste constantly onto named, colored boards. Copying an item to a board leaves your history exactly as it was.",
  },
  {
    icon: Search,
    title: "Power search",
    description:
      "Fuzzy matching across text, URLs, hex codes, file names, and the source app — narrowed by type: and app: filters that combine with plain terms.",
    meta: (
      <span className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded-md border border-border bg-dark px-2 py-1 text-accent">
          type:image
        </span>
        <span className="rounded-md border border-border bg-dark px-2 py-1 text-accent">
          app:xcode
        </span>
      </span>
    ),
  },
  {
    icon: Layers,
    title: "Every format",
    description:
      "Plain text, rich text with its styling preserved, links, images, files, and colors — each one gets a card layout built for it.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy first",
    description:
      "Clippings marked concealed or transient — what password managers use — are ignored by default. Exclude any app entirely, or pause capture from the menu bar. Nothing ever leaves your Mac.",
  },
  {
    icon: Keyboard,
    title: "Quick paste",
    description:
      "Paste the first through ninth card straight from the keyboard, without moving the selection or reaching for the mouse.",
    meta: (
      <span className="flex items-center gap-1.5">
        <kbd className="kbd">⌘1</kbd>
        <span className="text-foreground/30 text-xs">…</span>
        <kbd className="kbd">⌘9</kbd>
      </span>
    ),
  },
  {
    icon: Eye,
    title: "Space previews",
    description:
      "Quick Look-style previews without leaving the shelf. Tap Space to blow up the selected card, tap it again to drop back.",
    meta: (
      <span className="flex items-center gap-2">
        <kbd className="kbd">Space</kbd>
        <span className="text-foreground/40 text-xs">to preview</span>
      </span>
    ),
  },
  {
    icon: RefreshCw,
    title: "Auto-updates",
    description:
      "Sparkle checks a signed appcast served from the GitHub repo, verifies the EdDSA signature, and installs on relaunch. Turn it off whenever you like.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-24 scroll-mt-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-40 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Features
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Everything a clipboard{" "}
            <span className="text-gradient">should have been</span>
          </h2>
          <p className="leading-relaxed text-foreground/50">
            One shelf, one shortcut, every clipping you have ever made. No
            account, no subscription, no sync — just the thing you copied,
            waiting where you left it.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="h-full"
            >
              <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-24px_var(--color-accent-glow)] md:p-7">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 transition-colors duration-300 group-hover:bg-accent/20">
                  <feature.icon
                    size={20}
                    aria-hidden="true"
                    className="text-accent"
                  />
                </div>

                <h3 className="mb-2.5 text-lg font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/50">
                  {feature.description}
                </p>

                {feature.meta ? (
                  <div className="mt-6 border-t border-border pt-4">
                    {feature.meta}
                  </div>
                ) : null}
              </article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
