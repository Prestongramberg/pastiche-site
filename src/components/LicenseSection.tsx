/**
 * FIG. 05 — The license.
 *
 * Where a commercial product puts its pricing table, the specimen prints the actual
 * licence, typeset as a document: paper-raised panel, hairline border, mono, selectable
 * (so ⌘C over any of it lands on the shelf).
 *
 * The text below is the repository's LICENSE file, byte for byte.
 */

import CopyChip from "./CopyChip";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const LICENSE_URL = "https://github.com/Prestongramberg/Pastiche/blob/main/LICENSE";

const MIT_LICENSE = `MIT License

Copyright (c) 2026 Preston Gramberg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export default function LicenseSection() {
  return (
    <section
      id="license"
      aria-labelledby="license-title"
      className="relative scroll-mt-8 border-t border-rule px-5 sm:px-8"
    >
      <div className="mx-auto w-full max-w-5xl py-20 sm:py-28 lg:py-32">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className={LABEL}>FIG. 05 — The license</p>
          <p className={LABEL}>MIT · 1 page</p>
        </header>

        <h2
          id="license-title"
          className="mt-6 max-w-[22ch] font-serif text-[clamp(2rem,5.2vw,3.6rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink"
        >
          The shelf, free.
        </h2>

        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.62] text-ink/80 sm:text-[18px]">
          The shelf elsewhere costs around $30 a year. The free alternatives are lists.
          Pastiche is the shelf — free, MIT-licensed, and yours to fork. This is the whole
          agreement, in full, in place of a pricing table.
        </p>

        {/* The document */}
        <figure className="mt-12 sm:mt-14">
          <div className="overflow-hidden rounded-[3px] border border-rule bg-paper-raised">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-rule px-5 py-3 sm:px-8">
              <p className={LABEL}>LICENSE</p>
              <p className={LABEL}>Reproduced in full</p>
            </div>

            <div className="px-5 py-8 sm:px-8 sm:py-12 lg:px-14">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12.5px] leading-[1.85] text-ink sm:text-[13.5px] lg:text-[14px]">
                {MIT_LICENSE}
              </pre>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-rule px-5 py-4 sm:px-8">
              <CopyChip text={MIT_LICENSE} label="Copy the license" kind="text" />
              <a
                href={LICENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-mono text-[12.5px] text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent ${FOCUS}`}
              >
                LICENSE in the repository ↗
              </a>
            </div>
          </div>

          <figcaption className="mt-4 max-w-[62ch] text-[14.5px] leading-[1.6] text-ink-muted">
            No accounts, no trial, no upgrade path. If the project ever stops, the source is
            already on your machine and the licence above already says you may keep it going.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
