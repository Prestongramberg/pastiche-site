import type { CSSProperties } from "react";
import DownloadButton from "@/components/DownloadButton";
import { SelectionTeacher } from "@/components/OneSlot";

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";

/** The wordmark, split for the letterpress. The h1 carries the plain word as its label. */
const WORDMARK = "Pastiche";

/**
 * The specimen plate. The word "Pastiche" IS the hero image — text LCP, painted at
 * full opacity on the first frame and settled with a transform-only CSS animation so
 * there is no layout shift and no framer-motion on the critical path.
 *
 * The overture — letterpress, ruled hairlines, registration ticks, the inked
 * definition — lives in the KEYFRAMES section of globals.css (prefix `ink-`), where
 * the whole timeline can be read in one place. What stays here is only what is
 * specific to this plate: type scale and the staged entrance of the copy blocks.
 *
 * This file is a server component and must stay one: the h1 ships as real text in the
 * HTML document. The only client code on the plate is <SelectionTeacher>, a leaf island.
 */
const styles = `
.mh-root {
  --mh-ease: var(--ease-shelf, cubic-bezier(0.16, 1, 0.3, 1));
  --mh-dur: var(--dur-shelf, 320ms);
}
.mh-word {
  font-size: clamp(3rem, 13vw, 15rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
}
.mh-lede {
  font-size: clamp(1.375rem, 2.6vw, 1.875rem);
  line-height: 1.35;
}
.mh-in {
  animation: mh-in calc(var(--mh-dur) * 1.6) var(--mh-ease) both;
}
/* The copy blocks arrive top-to-bottom underneath the settling wordmark. */
.mh-d1 { animation-delay: 0ms; }
.mh-d2 { animation-delay: 380ms; }
.mh-d3 { animation-delay: 520ms; }
.mh-d4 { animation-delay: 640ms; }
.mh-d5 { animation-delay: 760ms; }

@keyframes mh-in {
  from { opacity: 0; transform: translate3d(0, 0.625rem, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes mh-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .mh-in { animation: mh-fade 240ms linear both; }
}
`;

export default function Masthead() {
  return (
    <section
      aria-labelledby="masthead-title"
      className="mh-root relative isolate border-b border-rule bg-paper"
    >
      <style href="masthead-specimen" precedence="medium">
        {styles}
      </style>

      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20 sm:px-8 md:pt-36 md:pb-28">
        {/* Over-line — the specimen sheet's catalogue row. Its hairline is ruled in. */}
        <div className="ink-rule ink-rule-b mh-in mh-d1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-transparent pb-4">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
            Pastiche — a clipboard revival · macOS 13+ · MIT
          </p>
          <p className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted sm:block">
            Specimen sheet
          </p>
        </div>

        {/* The plate: the word itself is the hero image, pressed into the paper glyph
            by glyph. Every span is aria-hidden; the h1 is labelled with the plain
            word, so assistive tech and the clipboard both get "Pastiche". */}
        <div className="relative mt-10 md:mt-14">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="ink-tick ink-tick-tl hidden md:block"
          >
            <path d="M16 0.5 H0.5 V16" pathLength="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="ink-tick ink-tick-br hidden md:block"
          >
            <path d="M0 15.5 H15.5 V0" pathLength="1" vectorEffect="non-scaling-stroke" />
          </svg>

          <h1
            id="masthead-title"
            aria-label={WORDMARK}
            className="mh-word ink-word font-serif italic text-ink [text-wrap:nowrap]"
          >
            {WORDMARK.split("").map((glyph, i) => (
              <span
                key={`${glyph}-${i}`}
                aria-hidden="true"
                className="ink-letter"
                style={{ "--i": i } as CSSProperties}
              >
                <span className="ink-glyph">{glyph}</span>
              </span>
            ))}
          </h1>
        </div>

        {/* Dictionary entry — the guide-blue underline is ruled in, then the
            part-of-speech is inked. */}
        <div className="ink-rule ink-rule-t ink-rule-late mh-in mh-d2 mt-8 border-t border-transparent pt-6 md:mt-10">
          <p className="mh-lede max-w-[46ch] font-serif italic text-ink">
            <span className="ink-underline">pas·tiche</span>{" "}
            <span className="ink-pos text-ink-muted">(n.)</span> — a work that imitates
            the style of another, openly and with admiration.
          </p>
        </div>

        {/* The first-person sentence — the README's voice */}
        <p className="mh-in mh-d3 mt-8 max-w-[54ch] text-[1.0625rem] leading-[1.6] text-ink md:text-[1.125rem]">
          The Mac&rsquo;s best clipboard manager costs $30 a year. I rebuilt the idea —
          the shelf, the search, the pinboards — free, open-source, and entirely on your
          machine.
        </p>

        {/* Actions */}
        <div className="mh-in mh-d4 mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
          <DownloadButton />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[2px] text-[0.9375rem] font-medium text-ink-muted underline decoration-rule underline-offset-[0.35em] transition-colors duration-200 hover:text-ink hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            View source{" "}
            <span aria-hidden="true" className="font-mono">
              ↗
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        {/* The hero demo: an organic selection the shelf catches for itself. The
            teacher rehearses the gesture a few times until the visitor performs it. */}
        <p className="mh-in mh-d5 mt-12 font-mono text-[0.75rem] tracking-[0.06em] text-ink-muted md:mt-14">
          <SelectionTeacher />
        </p>
      </div>
    </section>
  );
}
