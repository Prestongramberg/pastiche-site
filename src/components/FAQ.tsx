"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: "Is it really free?",
    answer: (
      <>
        Yes. Pastiche is MIT-licensed and open source — no subscription, no
        trial, no accounts. Download the DMG, drag it to Applications, and it is
        yours. The source is on GitHub if you would rather build it yourself.
      </>
    ),
  },
  {
    question: "Where is my data?",
    answer: (
      <>
        On your Mac, and only on your Mac. Everything lives in{" "}
        <code className="rounded-md border border-border bg-dark px-1.5 py-0.5 font-mono text-[13px] text-foreground/80">
          ~/Library/Application Support/Pastiche
        </code>{" "}
        — a SQLite database plus an{" "}
        <code className="rounded-md border border-border bg-dark px-1.5 py-0.5 font-mono text-[13px] text-foreground/80">
          Images
        </code>{" "}
        folder. There is no account and no sync service. The only network
        request Pastiche ever makes is fetching the update feed.
      </>
    ),
  },
  {
    question: "Why does macOS warn me the first time I open it?",
    answer: (
      <>
        Release builds are ad-hoc signed rather than Developer ID notarized, so
        Gatekeeper blocks the first double-click. Right-click (or Control-click){" "}
        <strong className="font-semibold text-foreground/80">Pastiche.app</strong>{" "}
        → <strong className="font-semibold text-foreground/80">Open</strong> →{" "}
        <strong className="font-semibold text-foreground/80">Open</strong>, or
        go to System Settings → Privacy &amp; Security and click{" "}
        <strong className="font-semibold text-foreground/80">Open Anyway</strong>
        . Once per installed version and never again. Updates themselves are
        EdDSA-signed and verified before they install.
      </>
    ),
  },
  {
    question: "Why does it need Accessibility permission?",
    answer: (
      <>
        To press <kbd className="kbd">⌘</kbd> <kbd className="kbd">V</kbd> for
        you. macOS only lets trusted apps post keyboard events, and that is how
        a card lands in the app you were just in. Decline it and Pastiche still
        works — selecting a card copies it to the system clipboard, you just
        paste it yourself. Nothing else in the app reads other applications’
        contents.
      </>
    ),
  },
  {
    question: "What happens to my passwords?",
    answer: (
      <>
        They are never recorded. Clippings flagged concealed, transient, or
        auto-generated — the flags password managers set — are ignored by
        default. On top of that you can exclude any app outright in Settings →
        Privacy, so nothing copied while it is frontmost is captured, or pause
        clipboard history entirely from the menu bar.
      </>
    ),
  },
  {
    question: "How do updates work?",
    answer: (
      <>
        Pastiche ships with Sparkle 2. Each release is signed with an EdDSA key
        and published to GitHub Releases, and the appcast is served straight out
        of the repository — the same file you can read on GitHub. The app checks
        in the background, verifies the signature, and installs on relaunch. You
        can turn automatic checks off or check on demand from Settings → Updates
        or the menu-bar menu.
      </>
    ),
  },
  {
    question: "Does it run on Intel Macs?",
    answer: (
      <>
        The builds published today target Apple Silicon. The build script can
        produce a universal arm64 + x86_64 binary, so an Intel release is a CI
        change away — and in the meantime you can build one yourself from source
        with the Xcode Command Line Tools. Pastiche requires macOS 13 or later
        either way.
      </>
    ),
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            FAQ
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Questions, <span className="text-gradient">answered</span>
          </h2>
          <p className="leading-relaxed text-foreground/50">
            What people ask before they install it — permissions, privacy, and
            what the app is actually doing on your machine.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i, 4) * 0.06 }}
              >
                <div
                  className={`overflow-hidden rounded-2xl border bg-card transition-colors duration-300 ${
                    isOpen ? "border-accent/40" : "border-border hover:border-foreground/20"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:px-6"
                    >
                      <span className="text-base font-semibold tracking-tight">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-foreground/40 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-accent" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="panel"
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/50 sm:px-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-10 max-w-3xl text-center text-sm text-foreground/50"
        >
          Still curious?{" "}
          <Link
            href="/docs"
            className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm"
          >
            Read the docs
          </Link>{" "}
          or{" "}
          <a
            href="https://github.com/Prestongramberg/Pastiche/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight rounded-sm"
          >
            open an issue on GitHub
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
}
