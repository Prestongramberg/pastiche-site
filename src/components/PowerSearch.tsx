"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";

type Example = {
  query: ReactNode;
  explanation: string;
};

function Token({ children }: { children: ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

const examples: Example[] = [
  {
    query: (
      <>
        <Token>type:</Token>image
      </>
    ),
    explanation:
      "Every image you have copied, newest first. Swap in text, link, file, or color for the rest.",
  },
  {
    query: (
      <>
        <Token>app:</Token>chrome
      </>
    ),
    explanation:
      "Everything grabbed from Chrome. The fragment matches the app name or its bundle id, so app:com.apple.Safari works too.",
  },
  {
    query: (
      <>
        <Token>type:</Token>link deploy
      </>
    ),
    explanation:
      "Filters and free text combine: links mentioning “deploy” and nothing else.",
  },
  {
    query: <>wrld</>,
    explanation:
      "Bare words fuzzy-match, so a typo still finds “world”. Matching runs across text, URLs, hex codes, file names, and the source app, ranked best-first.",
  },
];

const tokens: { token: string; matches: string }[] = [
  { token: "type:text", matches: "Text and rich text clippings" },
  { token: "type:image", matches: "Images" },
  { token: "type:link", matches: "Links" },
  { token: "type:file", matches: "Files" },
  { token: "type:color", matches: "Colors" },
  { token: "app:<fragment>", matches: "Items copied from a matching app" },
];

export default function PowerSearch() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-darker py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/4 h-[24rem] w-[24rem] rounded-full bg-accent/10 blur-[120px]"
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
            Power Search
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Find it the way you{" "}
            <span className="text-gradient">remember it</span>
          </h2>
          <p className="leading-relaxed text-foreground/50">
            You rarely remember the words — you remember that it was an image,
            or that it came out of Xcode. Filters narrow the pile, fuzzy terms
            rank what is left, and the two work together.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span aria-hidden="true" className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                </span>
                <span className="ml-2 flex items-center gap-1.5 text-xs text-foreground/40">
                  <Search size={12} aria-hidden="true" />
                  Search the shelf
                </span>
              </div>

              <div className="space-y-6 overflow-x-auto p-5 sm:p-6">
                {examples.map((example, i) => (
                  <motion.div
                    key={example.explanation}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <p className="whitespace-nowrap font-mono text-sm">
                      <span aria-hidden="true" className="mr-2 select-none text-foreground/25">
                        ›
                      </span>
                      {example.query}
                    </p>
                    <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-foreground/50">
                      {example.explanation}
                    </p>
                  </motion.div>
                ))}

                <p aria-hidden="true" className="font-mono text-sm">
                  <span className="mr-2 select-none text-foreground/25">›</span>
                  <motion.span
                    className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-accent"
                    animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 1.1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }
                    }
                  />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="lg:col-span-2"
          >
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">
                Filter tokens
              </h3>
              <ul className="mt-5 space-y-3">
                {tokens.map((entry) => (
                  <li
                    key={entry.token}
                    className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <code className="shrink-0 font-mono text-[13px] text-accent">
                      {entry.token}
                    </code>
                    <span className="text-[13px] leading-relaxed text-foreground/50 sm:text-right">
                      {entry.matches}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-5 text-sm leading-relaxed text-foreground/50">
                Tokens stack with each other and with plain words.{" "}
                <code className="font-mono text-[13px] text-foreground/70">
                  app:xcode type:text
                </code>{" "}
                returns only the text you copied out of Xcode.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
