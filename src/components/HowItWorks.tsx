"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy, CornerDownLeft, PanelBottom, type LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  keys: ReactNode;
};

const steps: Step[] = [
  {
    number: "01",
    icon: ClipboardCopy,
    title: "Copy like always",
    description:
      "Nothing to learn. Keep hitting ⌘C anywhere on your Mac — Pastiche sits in the menu bar and files every clipping away with the app it came from, whether it’s text, a link, an image, a file, or a color.",
    keys: (
      <>
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">C</kbd>
      </>
    ),
  },
  {
    number: "02",
    icon: PanelBottom,
    title: "Summon the shelf",
    description:
      "One global shortcut slides the shelf up from the bottom of whichever screen your mouse is on, right over whatever you were doing. Arrow through the cards, or just start typing to search.",
    keys: (
      <>
        <kbd className="kbd">⇧</kbd>
        <kbd className="kbd">⌘</kbd>
        <kbd className="kbd">V</kbd>
      </>
    ),
  },
  {
    number: "03",
    icon: CornerDownLeft,
    title: "Paste anywhere",
    description:
      "Return drops the selected card into the app you were just in — Pastiche re-activates it and presses ⌘V for you. Skip the arrows entirely with ⌘1 through ⌘9, or strip formatting with ⇧Return.",
    keys: (
      <>
        <kbd className="kbd">Return</kbd>
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-darker py-24 scroll-mt-24 md:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-bg" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-[24rem] w-[24rem] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            How It Works
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Three keys, <span className="text-gradient">start to finish</span>
          </h2>
          <p className="leading-relaxed text-foreground/50">
            The whole app is one shortcut away and one keystroke deep. You never
            leave the keyboard, and you never leave the app you’re working in.
          </p>
        </motion.div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              {i < steps.length - 1 ? (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-7 top-16 -bottom-10 w-px bg-gradient-to-b from-accent/40 to-transparent md:hidden"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-28 right-0 top-7 -mr-10 hidden h-px bg-gradient-to-r from-accent/40 to-transparent md:block"
                  />
                </>
              ) : null}

              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient text-base font-black text-white shadow-[0_10px_30px_-12px_var(--color-accent-glow)]">
                  {step.number}
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
                  <step.icon size={18} aria-hidden="true" className="text-accent" />
                </span>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/50">
                  {step.description}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {step.keys}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
