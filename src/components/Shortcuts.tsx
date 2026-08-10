"use client";

import { motion } from "framer-motion";
import { Command, CornerUpLeft, Type } from "lucide-react";

type Shortcut = {
  /** Each inner array is one chord; multiple chords are joined by `sep`. */
  combos: string[][];
  sep?: string;
  action: string;
};

const shortcuts: Shortcut[] = [
  {
    combos: [["⇧", "⌘", "V"]],
    action: "Toggle the shelf — works globally, from any app",
  },
  { combos: [["←"], ["→"]], sep: "/", action: "Move the selection" },
  {
    combos: [["Return"]],
    action: "Paste the selected item into the previous app",
  },
  {
    combos: [["⇧", "Return"]],
    action: "Paste the selected item as plain text",
  },
  { combos: [["Space"]], action: "Toggle the large preview" },
  {
    combos: [
      ["⌘", "1"],
      ["⌘", "9"],
    ],
    sep: "…",
    action: "Paste the 1st through 9th visible card",
  },
  { combos: [["⌘", "F"]], action: "Focus the search field" },
  { combos: [["Delete"]], action: "Delete the selected item" },
  {
    combos: [["Esc"]],
    action: "Close the preview, then clear the search, then hide the shelf",
  },
];

const notes = [
  {
    icon: Command,
    title: "Global by default",
    body: "The shelf shortcut fires from any app, and you can re-bind it to whatever you like in Settings.",
  },
  {
    icon: Type,
    title: "Type to search",
    body: "With the shelf open, just start typing — the search field takes focus on the first keystroke.",
  },
  {
    icon: CornerUpLeft,
    title: "Esc backs out",
    body: "One key unwinds the whole stack: preview first, then the search you typed, then the shelf itself.",
  },
];

function Chord({ keys }: { keys: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((key, i) => (
        <kbd key={`${key}-${i}`} className="kbd">
          {key}
        </kbd>
      ))}
    </span>
  );
}

function Row({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex flex-col items-start gap-2.5 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
      <span className="flex shrink-0 items-center gap-2">
        {shortcut.combos.map((combo, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && shortcut.sep ? (
              <span aria-hidden="true" className="text-sm text-foreground/30">
                {shortcut.sep}
              </span>
            ) : null}
            <Chord keys={combo} />
          </span>
        ))}
      </span>
      <span className="text-sm leading-relaxed text-foreground/50 sm:text-right">
        {shortcut.action}
      </span>
    </div>
  );
}

export default function Shortcuts() {
  const left = shortcuts.slice(0, 5);
  const right = shortcuts.slice(5);

  return (
    <section
      id="shortcuts"
      className="relative overflow-hidden py-24 scroll-mt-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-accent/10 blur-[120px]"
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
            Shortcuts
          </span>
          <h2 className="mt-3 mb-4 text-4xl font-black tracking-tight md:text-5xl">
            Built for people who{" "}
            <span className="text-gradient">never touch the mouse</span>
          </h2>
          <p className="leading-relaxed text-foreground/50">
            The entire keyboard map. Nine keys is the whole app — learn three of
            them and you already have your clipboard back.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="grid gap-5 lg:grid-cols-2"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {left.map((shortcut) => (
              <Row key={shortcut.action} shortcut={shortcut} />
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {right.map((shortcut) => (
              <Row key={shortcut.action} shortcut={shortcut} />
            ))}
          </div>
        </motion.div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {notes.map((note, i) => (
            <motion.div
              key={note.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="h-full"
            >
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-dark p-5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <note.icon size={15} aria-hidden="true" className="text-accent" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{note.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-foreground/50">
                    {note.body}
                  </span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
