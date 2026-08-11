import DownloadButton from "@/components/DownloadButton";

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";

/**
 * The specimen plate. The word "Pastiche" IS the hero image — text LCP, painted at
 * full opacity on the first frame and settled with a transform-only CSS animation so
 * there is no layout shift and no framer-motion on the critical path.
 *
 * Styles live in a component-scoped <style> (React hoists it into <head> via
 * precedence) because globals.css belongs to the foundation module.
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
  animation: mh-settle 760ms var(--mh-ease) both;
}
.mh-lede {
  font-size: clamp(1.375rem, 2.6vw, 1.875rem);
  line-height: 1.35;
}
.mh-in {
  animation: mh-in calc(var(--mh-dur) * 1.6) var(--mh-ease) both;
}
.mh-d1 { animation-delay: 0ms; }
.mh-d2 { animation-delay: 140ms; }
.mh-d3 { animation-delay: 220ms; }
.mh-d4 { animation-delay: 300ms; }
.mh-d5 { animation-delay: 380ms; }
.mh-mark {
  position: absolute;
  width: 0.875rem;
  height: 0.875rem;
  border: 0 solid var(--color-guide);
  opacity: 0.85;
}
.mh-mark-tl { top: -0.625rem; left: -0.375rem; border-top-width: 1px; border-left-width: 1px; }
.mh-mark-br { right: -0.375rem; bottom: -0.625rem; border-right-width: 1px; border-bottom-width: 1px; }

/* Transform-only: the word is painted immediately, so it can be the LCP element. */
@keyframes mh-settle {
  from { transform: translate3d(0, 0.11em, 0); }
  to   { transform: translate3d(0, 0, 0); }
}
@keyframes mh-in {
  from { opacity: 0; transform: translate3d(0, 0.625rem, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes mh-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .mh-word { animation: mh-fade 240ms linear both; }
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
        {/* Over-line — the specimen sheet's catalogue row */}
        <div className="mh-in mh-d1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-rule pb-4">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted">
            Pastiche — a clipboard revival · macOS 13+ · MIT
          </p>
          <p className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-muted sm:block">
            Specimen sheet
          </p>
        </div>

        {/* The plate: the word itself is the hero image */}
        <div className="relative mt-10 md:mt-14">
          <span aria-hidden="true" className="mh-mark mh-mark-tl hidden md:block" />
          <span aria-hidden="true" className="mh-mark mh-mark-br hidden md:block" />
          <h1
            id="masthead-title"
            className="mh-word font-serif italic text-ink [text-wrap:nowrap]"
          >
            Pastiche
          </h1>
        </div>

        {/* Dictionary entry */}
        <div className="mh-in mh-d2 mt-8 border-t border-rule pt-6 md:mt-10">
          <p className="mh-lede max-w-[46ch] font-serif italic text-ink">
            <span className="underline decoration-guide decoration-[1.5px] underline-offset-[0.28em]">
              pas·tiche
            </span>{" "}
            <span className="text-ink-muted">(n.)</span> — a work that imitates the style
            of another, openly and with admiration.
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

        {/* The hero demo: an organic selection the shelf catches for itself */}
        <p className="mh-in mh-d5 mt-12 font-mono text-[0.75rem] tracking-[0.06em] text-ink-muted md:mt-14">
          <span className="cursor-text select-all underline decoration-guide decoration-[1.5px] underline-offset-[0.4em]">
            Select this sentence and press ⌘C.
          </span>
        </p>
      </div>
    </section>
  );
}
