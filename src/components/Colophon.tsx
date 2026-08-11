/**
 * The colophon — set the way a book ends: what it was made of, who made it, and where.
 *
 * Three mono columns over a hairline, the homage credit stated plainly, and enough
 * bottom clearance that the LiveShelf lip never sits on top of the last line.
 */

import Link from "next/link";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
const LINK = `text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent ${FOCUS}`;

const REPO = "https://github.com/Prestongramberg/Pastiche";

const TYPE_CREDITS: { face: string; role: string; by: string }[] = [
  { face: "Instrument Serif", role: "display", by: "Rodrigo Fuenzalida" },
  { face: "Instrument Sans", role: "text", by: "Rodrigo Fuenzalida, Jordan Egstad" },
  { face: "Geist Mono", role: "metadata", by: "Vercel" },
];

const PROJECT_LINKS: { label: string; href: string; external: boolean }[] = [
  { label: "Source on GitHub", href: REPO, external: true },
  { label: "Report an issue", href: `${REPO}/issues/new`, external: true },
  { label: "Changelog", href: `${REPO}/releases`, external: true },
  { label: "Documentation", href: "/docs", external: false },
];

export default function Colophon() {
  return (
    <footer className="relative border-t border-rule px-5 sm:px-8">
      <div className="mx-auto w-full max-w-6xl pb-28 pt-16 sm:pb-32 sm:pt-20 lg:pt-24">
        {/* Imprint line */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-rule pb-8">
          <p className="font-serif text-[clamp(2.25rem,7vw,4rem)] font-normal italic leading-[0.9] tracking-[-0.03em] text-ink">
            Pastiche
          </p>
          <p className={`${LABEL} pb-1`}>Colophon</p>
        </div>

        <div className="grid gap-12 pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Type */}
          <section aria-labelledby="colophon-type">
            <h2 id="colophon-type" className={LABEL}>
              Set in
            </h2>
            <ul className="mt-5 space-y-4">
              {TYPE_CREDITS.map(({ face, role, by }) => (
                <li key={face} className="text-[14px] leading-snug">
                  <span className="text-ink">{face}</span>
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                    {role}
                  </span>
                  <span className="mt-1 block font-mono text-[11.5px] text-ink-muted">{by}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[34ch] text-[13.5px] leading-[1.6] text-ink-muted">
              Built with Next.js and Tailwind CSS. The shelf at the bottom of this page is
              written in the browser, not screenshotted.
            </p>
          </section>

          {/* The project */}
          <section aria-labelledby="colophon-project">
            <h2 id="colophon-project" className={LABEL}>
              The project
            </h2>
            <ul className="mt-5 space-y-3.5">
              {PROJECT_LINKS.map(({ label, href, external }) => (
                <li key={label} className="text-[14.5px] leading-snug">
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {label} ↗
                    </a>
                  ) : (
                    <Link href={href} className={LINK}>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink-muted">
              macOS 13+ · MIT · Free
            </p>
          </section>

          {/* The credit */}
          <section aria-labelledby="colophon-credit" className="sm:col-span-2 lg:col-span-1">
            <h2 id="colophon-credit" className={LABEL}>
              Credit where it is owed
            </h2>
            <p className="mt-5 max-w-[42ch] font-serif text-[19px] leading-[1.45] text-ink sm:text-[20px]">
              Pastiche is an open-source homage to the shelf-style clipboard managers that
              came before it.
            </p>
            <p className="mt-4 max-w-[40ch] text-[13.5px] leading-[1.6] text-ink-muted">
              A pastiche imitates openly and with admiration. The name is the disclosure: the
              idea is borrowed, the code is not.
            </p>
          </section>
        </div>

        {/* Imprint */}
        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-rule pt-6 sm:mt-16">
          <p className="font-mono text-[11.5px] tracking-[0.06em] text-ink-muted">
            Designed &amp; built by Preston Gramberg · Minnesota
          </p>
          <p className="font-mono text-[11.5px] tracking-[0.06em] text-ink">
            All data stays on your Mac.
          </p>
        </div>
      </div>
    </footer>
  );
}
