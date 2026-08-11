"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CopyChip from "@/components/CopyChip";

type Scrap = {
  id: string;
  /** Human descriptor used in the mono caption and the live announcement. */
  label: string;
  /** The actual clipboard content. */
  text: string;
  kind: "text" | "color";
  /** Specimen letter for the caption. */
  mark: string;
};

const SCRAPS: readonly Scrap[] = [
  {
    id: "address",
    label: "an address",
    text: "1400 Hennepin Ave, Minneapolis, MN 55403",
    kind: "text",
    mark: "A",
  },
  {
    id: "hex",
    label: "a hex code",
    text: "#7C5CFF",
    kind: "color",
    mark: "B",
  },
];

/** What the mock single-slot register is currently holding. */
type Held = Scrap & {
  seq: number;
  /** Seconds the incoming scrap waits while the outgoing one is destroyed. */
  enterDelay: number;
};

/* ——— Motion vocabulary. One curve, one spring, shared by every element here. ——— */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** The single spring for physical elements on this page. */
const SPECIMEN_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.9,
};

/**
 * The overwrite, beat by beat (seconds):
 *   0.00 → 0.18  a hard strikethrough is drawn across the outgoing scrap
 *   0.18 → 0.40  the OVERWRITTEN stamp slams down
 *   0.40 → 0.48  it sits there long enough to be read
 *   0.46         the incoming scrap springs into the slot
 *   0.48 → 0.74  the outgoing scrap crumples and is gone
 */
const STRIKE_S = 0.18;
const STAMP_S = 0.22;
const CRUMPLE_AT = 0.48;
const DRAMA_S = 0.74;
const ENTER_DELAY_S = 0.46;

/** How long the outgoing scrap stays mounted, in ms, per motion preference. */
const DRAMA_MS = DRAMA_S * 1000 + 60;
const CALM_MS = 260;

const EMPTY_STATUS = "The register is empty.";

/**
 * FIG. 01 — the one-slot problem. Copying the second scrap visibly strikes through and
 * ejects the first from the mock macOS register, while the LiveShelf (which CopyChip
 * feeds through the normal capture path) keeps both. The drama here is purely local UI:
 * the ghost that flies down to the shelf lip is CopyChip's, unchanged and not duplicated.
 *
 * Styles are component-scoped because globals.css carries only the shared motion
 * primitives; these are specific to this figure.
 */
const styles = `
.os-root {
  --os-ease: var(--ease-shelf, cubic-bezier(0.16, 1, 0.3, 1));
}
.os-title {
  font-size: clamp(2rem, 5.5vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}
/* A rubber stamp: ink on paper, no fill, struck slightly off-square. */
.os-stamp {
  display: inline-block;
  border: 1.5px solid var(--color-accent);
  border-radius: 2px;
  padding: 0.2rem 0.4rem 0.2rem 0.5rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.5rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0.94;
}
@media (min-width: 640px) {
  .os-stamp { font-size: 0.5625rem; }
}
`;

/**
 * The masthead's teaching line, and the only client code on that plate.
 *
 * The page asks the visitor to do one thing — select a sentence and press ⌘C — so the
 * sentence rehearses it: an accent highlight wipes across it and retreats, up to three
 * times a session, roughly every seven seconds. The moment the visitor copies anything
 * at all, the lesson is over for good (recorded in sessionStorage, so a route change
 * does not restart it).
 *
 * It lives in this file rather than its own only because of how the work was split;
 * it is a leaf island with no relationship to FIG. 01 and should be moved out in
 * cleanup. It is imported by Masthead.tsx precisely so that Masthead can stay a server
 * component — the h1 must remain server-rendered text.
 */
const TEACH_LINE = "Select this sentence and press ⌘C.";
const TEACH_KEY = "pastiche.teach.v1";
const TEACH_MAX = 3;
const TEACH_FIRST_MS = 5200;
const TEACH_PERIOD_MS = 7000;
const SWEEP_MS = 1200;

export function SelectionTeacher() {
  const reduce = useReducedMotion() ?? false;
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    // Reduced motion: the sweep is movement with no useful still frame, so it is
    // simply never scheduled. The sentence still says what to do.
    if (reduce) return;

    let done = 0;
    try {
      const raw = window.sessionStorage.getItem(TEACH_KEY);
      const parsed = raw === null ? 0 : Number(raw);
      done = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      done = 0;
    }
    if (done >= TEACH_MAX) return;

    const timers = new Set<number>();
    let stopped = false;

    const remember = (n: number) => {
      try {
        window.sessionStorage.setItem(TEACH_KEY, String(n));
      } catch {
        /* private mode — the lesson just resets on reload */
      }
    };

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      setBurst(0);
    };

    const run = () => {
      if (stopped) return;
      // Never spend one of the three lessons on a hidden tab.
      if (document.hidden) {
        later(run, TEACH_PERIOD_MS);
        return;
      }
      done += 1;
      remember(done);
      setBurst((b) => b + 1);
      later(() => setBurst(0), SWEEP_MS);
      if (done < TEACH_MAX) later(run, TEACH_PERIOD_MS);
    };

    // Any copy anywhere on the page means the visitor has the idea. Stop, permanently.
    const onCopy = () => {
      remember(TEACH_MAX);
      stop();
    };

    document.addEventListener("copy", onCopy);
    later(run, TEACH_FIRST_MS);

    return () => {
      document.removeEventListener("copy", onCopy);
      stop();
    };
  }, [reduce]);

  return (
    <span className="relative inline-block">
      <span className="cursor-text select-all underline decoration-guide decoration-[1.5px] underline-offset-[0.4em]">
        {TEACH_LINE}
      </span>
      {burst > 0 ? (
        // An exact duplicate of the sentence in the same box, so the two wrap
        // identically and the highlight lands on the real glyphs.
        <span key={burst} aria-hidden="true" className="ink-sweep-layer ink-sweep">
          {TEACH_LINE}
        </span>
      ) : null}
    </span>
  );
}

export default function OneSlot() {
  const reduce = useReducedMotion() ?? false;
  const [held, setHeld] = useState<Held | null>(null);
  const [ejected, setEjected] = useState<Held | null>(null);
  const [status, setStatus] = useState(EMPTY_STATUS);
  const seq = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  /**
   * Runs on the capture phase of a click anywhere inside a scrap's wrapper, so the
   * CopyChip itself stays untouched: it writes the clipboard and captures to the shelf
   * exactly as it does everywhere else on the page.
   */
  function record(scrap: Scrap) {
    seq.current += 1;
    const overwrites = held !== null && held.id !== scrap.id;
    const next: Held = {
      ...scrap,
      seq: seq.current,
      enterDelay: overwrites && !reduce ? ENTER_DELAY_S : 0,
    };

    if (held && overwrites) {
      setEjected(held);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => setEjected(null),
        reduce ? CALM_MS : DRAMA_MS,
      );
      setStatus(
        `Overwrote “${held.label}”. The register now holds “${scrap.label}”. Both are on the shelf.`,
      );
    } else if (held) {
      setStatus(`The register still holds “${scrap.label}”.`);
    } else {
      setStatus(`The register holds “${scrap.label}”.`);
    }

    setHeld(next);
  }

  return (
    <section
      id="fig-01"
      aria-labelledby="fig-01-title"
      className="os-root border-b border-rule bg-paper"
    >
      <style href="one-slot-figure" precedence="medium">
        {styles}
      </style>

      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 md:py-28">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
          Fig. 01 — the one-slot problem
        </p>

        <h2 id="fig-01-title" className="os-title mt-5 font-serif text-ink">
          One slot deep.
        </h2>

        <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.6] text-ink-muted md:text-[1.125rem]">
          The system clipboard is a single slot: whatever you copy next overwrites
          whatever was there. Copy both scraps below — the register keeps only the last
          one, and the shelf at the bottom of this page keeps both.
        </p>

        <figure className="mt-10 max-w-3xl md:mt-12">
          <div className="rounded-[3px] border border-rule bg-paper-raised">
            {/* Register header */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-4 py-3 sm:px-5">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                macOS clipboard — capacity: 1
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                slot 01
              </span>
            </div>

            {/* The slot itself — fixed height so nothing shifts as it changes */}
            <div className="relative flex min-h-[5rem] items-center px-4 sm:px-5">
              {held ? (
                <motion.p
                  key={held.seq}
                  className="font-mono text-[0.8125rem] break-words text-ink sm:text-sm"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  transition={
                    reduce
                      ? { duration: 0.2, ease: "linear" }
                      : {
                          ...SPECIMEN_SPRING,
                          delay: held.enterDelay,
                          opacity: {
                            duration: 0.16,
                            delay: held.enterDelay,
                            ease: EASE,
                          },
                        }
                  }
                >
                  {held.text}
                </motion.p>
              ) : (
                <p className="font-mono text-[0.8125rem] tracking-[0.08em] text-ink-muted">
                  — empty —
                </p>
              )}

              {ejected ? (
                <motion.div
                  key={`ejected-${ejected.seq}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center px-4 sm:px-5"
                  style={{ transformOrigin: "18% 50%" }}
                  initial={{ opacity: 1, scale: 1, rotate: 0 }}
                  animate={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: [1, 1, 0],
                          scale: [1, 1, 0.92],
                          rotate: [0, 0, 3],
                        }
                  }
                  transition={
                    reduce
                      ? { duration: CALM_MS / 1000, ease: "linear" }
                      : {
                          duration: DRAMA_S,
                          times: [0, CRUMPLE_AT / DRAMA_S, 1],
                          ease: EASE,
                        }
                  }
                >
                  {/* The strikethrough is drawn across the scrap by revealing a
                      struck-through copy of it left to right. Using clip-path rather
                      than a scaled bar keeps the rule correct when the text wraps. */}
                  <span className="relative min-w-0">
                    <span className="block font-mono text-[0.8125rem] break-words text-ink-muted sm:text-sm">
                      {ejected.text}
                    </span>
                    <motion.span
                      className="absolute inset-0 block font-mono text-[0.8125rem] break-words text-ink-muted line-through decoration-ink/70 decoration-[1.5px] sm:text-sm"
                      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
                      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                      transition={{ duration: reduce ? 0 : STRIKE_S, ease: EASE }}
                    >
                      {ejected.text}
                    </motion.span>
                  </span>

                  {/* OVERWRITTEN, struck down onto the scrap. */}
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center sm:right-5">
                    <motion.span
                      className="os-stamp"
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 1.4, rotate: -2 }
                      }
                      animate={
                        reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: -2 }
                      }
                      transition={{
                        delay: reduce ? 0 : STRIKE_S,
                        duration: reduce ? 0.16 : STAMP_S,
                        ease: EASE,
                      }}
                    >
                      Overwritten
                    </motion.span>
                  </span>
                </motion.div>
              ) : null}
            </div>

            {/* Live state readout */}
            <p
              role="status"
              aria-live="polite"
              className="border-t border-rule px-4 py-3 font-mono text-[0.75rem] leading-[1.5] text-ink-muted sm:px-5"
            >
              {status}
            </p>

            {/* The two scraps */}
            <div className="border-t border-rule px-4 py-5 sm:px-5">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                Scraps — click to copy
              </p>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:gap-8">
                {SCRAPS.map((scrap) => (
                  <div key={scrap.id} className="min-w-0">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
                      {scrap.mark} — {scrap.label}
                    </p>
                    {/* Capture-phase listener: the chip's own behaviour is unchanged,
                        this only mirrors the copy into the local register UI. */}
                    <span
                      className="mt-2 inline-flex max-w-full"
                      onClickCapture={(event) => {
                        // Only mirror activations of the chip itself, never a stray
                        // click landing on the wrapper. Keyboard activation of the
                        // chip dispatches a click too, so this covers both.
                        if (event.target !== event.currentTarget) record(scrap);
                      }}
                    >
                      <CopyChip text={scrap.text} label={scrap.text} kind={scrap.kind} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <figcaption className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
            Fig. 01 — the register holds one item. The shelf holds both.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
