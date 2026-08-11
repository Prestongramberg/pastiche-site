/**
 * FIG. 03 — The keyboard.
 *
 * The shortcut map typeset as a specimen table: decimal section numbers, hairline rules,
 * dotted leaders running from the action to the combo, and every combo a real <kbd>
 * cluster wrapped in a CopyChip so it can be lifted straight onto the shelf.
 *
 * No hooks, no state — this renders as a server component when the page is a server
 * component, and is equally safe if a client parent pulls it in.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import CopyChip from "./CopyChip";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/** A copyable key cluster: real <kbd> semantics inside the copy chip. */
function Combo({ keys, text }: { keys: string[]; text?: string }) {
  return (
    <CopyChip
      text={text ?? keys.join("")}
      kind="command"
      label={
        <span className="inline-flex items-center gap-1">
          {keys.map((key, i) => (
            <kbd key={`${key}-${i}`} className="kbd">
              {key}
            </kbd>
          ))}
        </span>
      }
    />
  );
}

/** One table row: term, dotted leader, value. */
function Row({ action, note, children }: { action: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b border-rule/70 py-3.5 last:border-b-0">
      <dt className="min-w-0 shrink-0 text-[15.5px] leading-snug text-ink sm:text-[16.5px]">
        {action}
        {note ? (
          <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            {note}
          </span>
        ) : null}
      </dt>
      <span
        aria-hidden="true"
        className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
      />
      <dd className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5 sm:ml-0">{children}</dd>
    </div>
  );
}

function Group({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 first:mt-0 sm:mt-16">
      <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
        <span className={`${LABEL} tabular-nums`}>{number}</span>
        <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

const TOKENS: { token: string; matches: string }[] = [
  { token: "type:text", matches: "Text and rich text clippings" },
  { token: "type:image", matches: "Images" },
  { token: "type:link", matches: "Links" },
  { token: "type:file", matches: "Files" },
  { token: "type:color", matches: "Colors" },
  { token: "app:", matches: "Items from an app whose name or bundle id contains the fragment" },
];

const EXAMPLES: { query: string; reads: string }[] = [
  { query: "type:image", reads: "Every image you have copied, newest first." },
  { query: "app:chrome", reads: "Everything grabbed while Chrome was frontmost." },
  { query: "type:link deploy", reads: "Links whose URL or title mentions “deploy”." },
  { query: "wrld", reads: "Fuzzy — matches world, worldwide, hello-world." },
];

export default function KeyboardSpecimen() {
  return (
    <section
      id="keyboard"
      aria-labelledby="keyboard-title"
      className="relative scroll-mt-8 border-t border-rule px-5 sm:px-8"
    >
      <div className="mx-auto w-full max-w-5xl py-20 sm:py-28 lg:py-32">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className={LABEL}>FIG. 03 — The keyboard</p>
          <p className={`${LABEL} tabular-nums`}>3 groups · 18 combinations</p>
        </header>

        <h2
          id="keyboard-title"
          className="mt-6 max-w-[20ch] font-serif text-[clamp(2rem,5.2vw,3.6rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink"
        >
          The whole shelf, without the mouse.
        </h2>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.62] text-ink/75 sm:text-[18px]">
          The shelf opens over whatever you are doing and closes the moment the clipping
          lands. Every combination below is copyable — click one and it goes onto the shelf
          at the bottom of this page.
        </p>

        <div className="mt-14 sm:mt-16">
          <Group number="3.1" title="The shelf">
            <dl>
              <Row action="Open or close the shelf, from any app" note="global">
                <Combo keys={["⇧", "⌘", "V"]} />
              </Row>
              <Row action="Focus the search field" note="or just start typing">
                <Combo keys={["⌘", "F"]} />
              </Row>
              <Row action="Close the preview, then the search, then the shelf">
                <Combo keys={["Esc"]} />
              </Row>
            </dl>
            <p className="mt-4 text-[14.5px] leading-[1.6] text-ink-muted">
              ⇧⌘V is the default and can be rebound in Settings → General. The shelf opens on
              whichever display the pointer is on.
            </p>
          </Group>

          <Group number="3.2" title="Selection & paste">
            <dl>
              <Row action="Move the selection">
                <Combo keys={["←"]} />
                <Combo keys={["→"]} />
              </Row>
              <Row action="Paste into the app you came from">
                <Combo keys={["Return"]} />
              </Row>
              <Row action="Paste as plain text">
                <Combo keys={["⇧", "Return"]} />
              </Row>
              <Row action="Paste the 1st … 9th visible card">
                <Combo keys={["⌘", "1"]} />
                <span aria-hidden="true" className="px-0.5 font-mono text-[12px] text-ink-muted">
                  …
                </span>
                <Combo keys={["⌘", "9"]} />
              </Row>
              <Row action="Toggle the full-size preview">
                <Combo keys={["Space"]} />
              </Row>
              <Row action="Delete the selected clipping">
                <Combo keys={["Delete"]} />
              </Row>
            </dl>
          </Group>

          <Group number="3.3" title="Search">
            <dl>
              <Row action="Filter as you type" note="fuzzy, ranked best-first">
                <span className="font-mono text-[12.5px] text-ink-muted">any characters</span>
              </Row>
              <Row action="Clear the query without closing the shelf">
                <Combo keys={["Esc"]} />
              </Row>
            </dl>

            <p className="mt-8 text-[16px] leading-[1.62] text-ink/75 sm:text-[17px]">
              Bare words fuzzy-match the clipping text, the URL, the hex code, the file names
              and the app it came from. Two filter tokens narrow the field, and they combine
              with each other and with free text.
            </p>

            {/* Sub-table: filter tokens */}
            <div className="mt-8 overflow-hidden rounded-[3px] border border-rule bg-paper-raised">
              <div className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-3">
                <p className={LABEL}>Filter tokens</p>
                <p className={LABEL}>Matches</p>
              </div>
              <dl className="px-5">
                {TOKENS.map(({ token, matches }) => (
                  <div
                    key={token}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-rule/70 py-3 last:border-b-0"
                  >
                    <dt className="shrink-0">
                      <CopyChip text={token} label={token} kind="text" />
                      {token === "app:" ? (
                        <span className="ml-1 font-mono text-[12.5px] text-ink-muted">
                          &lt;fragment&gt;
                        </span>
                      ) : null}
                    </dt>
                    <span
                      aria-hidden="true"
                      className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
                    />
                    <dd className="min-w-0 text-[14.5px] leading-snug text-ink/75 sm:max-w-[38ch] sm:text-right">
                      {matches}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Sub-table: worked examples */}
            <div className="mt-8">
              <p className={LABEL}>Worked examples</p>
              <dl className="mt-3">
                {EXAMPLES.map(({ query, reads }) => (
                  <div
                    key={query}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-rule/70 py-3.5 last:border-b-0"
                  >
                    <dt className="shrink-0">
                      <CopyChip text={query} label={query} kind="text" />
                    </dt>
                    <span
                      aria-hidden="true"
                      className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
                    />
                    <dd className="min-w-0 text-[14.5px] leading-snug text-ink/75 sm:max-w-[40ch] sm:text-right">
                      {reads}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-6 text-[14.5px] leading-[1.6] text-ink-muted">
              Full syntax and settings are in the{" "}
              <Link
                href="/docs"
                className={`text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent ${FOCUS}`}
              >
                documentation
              </Link>
              .
            </p>
          </Group>
        </div>
      </div>
    </section>
  );
}
