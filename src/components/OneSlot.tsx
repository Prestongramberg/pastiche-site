"use client";

import { useEffect, useRef, useState } from "react";
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
type Held = Scrap & { seq: number };

const EJECT_MS = 300;
const EMPTY_STATUS = "The register is empty.";

/**
 * FIG. 01 — the one-slot problem. Copying the second scrap visibly strikes through and
 * ejects the first from the mock macOS register, while the LiveShelf (which CopyChip
 * feeds through the normal capture path) keeps both. The drama here is purely local UI.
 *
 * Styles are component-scoped because globals.css belongs to the foundation module.
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
.os-land {
  animation: os-land 300ms var(--os-ease) both;
}
.os-eject {
  animation: os-eject ${EJECT_MS}ms var(--os-ease) both;
}
@keyframes os-land {
  from { opacity: 0; transform: translate3d(0, 0.4rem, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes os-eject {
  from { opacity: 1; transform: translate3d(0, 0, 0); }
  to   { opacity: 0; transform: translate3d(0, -0.9rem, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .os-land { animation: os-fade-in 200ms linear both; }
  .os-eject { animation: os-fade-out ${EJECT_MS}ms linear both; }
}
@keyframes os-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes os-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
`;

export default function OneSlot() {
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
    const next: Held = { ...scrap, seq: seq.current };

    if (held && held.id !== scrap.id) {
      setEjected(held);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setEjected(null), EJECT_MS + 40);
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
                <p
                  key={held.seq}
                  className="os-land font-mono text-[0.8125rem] break-words text-ink sm:text-sm"
                >
                  {held.text}
                </p>
              ) : (
                <p className="font-mono text-[0.8125rem] tracking-[0.08em] text-ink-muted">
                  — empty —
                </p>
              )}

              {ejected ? (
                <div
                  key={`ejected-${ejected.seq}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center px-4 sm:px-5"
                >
                  <p className="os-eject font-mono text-[0.8125rem] break-words text-ink-muted line-through decoration-[1.5px] sm:text-sm">
                    {ejected.text}
                  </p>
                </div>
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
