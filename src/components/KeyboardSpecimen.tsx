"use client";

/**
 * FIG. 03 — The keyboard.
 *
 * The shortcut map typeset as a specimen table: decimal section numbers, hairline rules,
 * dotted leaders running from the action to the combo, and every combo a real <kbd>
 * cluster wrapped in a CopyChip so it can be lifted straight onto the shelf.
 *
 * Motion: the tables are RULED, not faded. When a table enters the viewport each row's
 * bottom hairline is drawn left-to-right (scaleX, 40ms apart), the dotted leader fades in
 * behind its own rule, and the key cluster settles down four pixels on the specimen
 * spring. Once per mount — `viewport={{ once: true }}` — because a rule that redraws
 * every time you scroll past it is a gimmick, not a specimen.
 *
 * Text never animates: every term, value and key cap is at full opacity in the server
 * HTML and stays there. Only decoration (rules, leaders) and a four-pixel settle move,
 * so a visitor with JS disabled loses nothing but the drawing.
 *
 * This is a client component solely for that choreography; it holds no state and takes
 * no props.
 */

import { useRef, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import CopyChip from "./CopyChip";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/** The page curve. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** The one spring for physical elements in this section. */
const SPECIMEN_SPRING = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;

/* ---------------------------------------------------------------- variants ---- */

const table = (reduced: boolean): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: reduced ? 0 : 0.04 } },
});

/** Rows carry nothing themselves — they exist to hand the label to their parts. */
const ROW: Variants = { hidden: {}, shown: {} };

const rule = (reduced: boolean): Variants => ({
  hidden: { scaleX: reduced ? 1 : 0, opacity: reduced ? 0 : 1 },
  shown: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: reduced ? 0.2 : 0.42, ease: EASE },
  },
});

/**
 * The leader waits for its own rule before fading in. That wait is expressed as a
 * keyframe hold rather than a `delay`, deliberately: a `delay` in a child's variant
 * REPLACES the stagger offset framer hands down from the table, which would fire every
 * leader at once. Keyframes leave the inherited offset intact.
 */
const leader = (reduced: boolean): Variants => ({
  hidden: { opacity: 0 },
  shown: {
    opacity: reduced ? 1 : [0, 0, 1],
    transition: reduced
      ? { duration: 0.2, ease: EASE }
      : { duration: 0.52, times: [0, 0.45, 1], ease: EASE },
  },
});

/** Same rule about `delay` applies here — the spring runs on the inherited offset. */
const cluster = (reduced: boolean): Variants => ({
  hidden: { y: reduced ? 0 : 4 },
  shown: {
    y: 0,
    transition: reduced ? { duration: 0 } : SPECIMEN_SPRING,
  },
});

/* -------------------------------------------------------------- primitives ---- */

/** A `<dl>` that rules its rows in, once, when it comes into view. */
function Table({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.dl
      className={className}
      variants={table(reduced)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.dl>
  );
}

/**
 * One ruled row. The resting hairline stays in the markup at a quarter strength so a
 * table without JS still reads as a table; the animated rule is drawn on top of it.
 */
function RuledRow({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      variants={ROW}
      className={`group relative border-b border-rule/25 last:border-b-0 ${className ?? ""}`}
    >
      {children}
      <motion.span
        aria-hidden="true"
        variants={rule(reduced)}
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-rule/70 group-last:hidden"
      />
    </motion.div>
  );
}

/** The dotted leader between term and value — fades in behind its own rule. */
function Leader() {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.span
      aria-hidden="true"
      variants={leader(reduced)}
      className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
    />
  );
}

/** The value cell: settles four pixels onto the rule. */
function Value({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.dd variants={cluster(reduced)} className={className}>
      {children}
    </motion.dd>
  );
}

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
    <RuledRow className="flex flex-wrap items-baseline gap-x-3 gap-y-2 py-3.5">
      <dt className="min-w-0 shrink-0 text-[15.5px] leading-snug text-ink sm:text-[16.5px]">
        {action}
        {note ? (
          <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
            {note}
          </span>
        ) : null}
      </dt>
      <Leader />
      <Value className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5 sm:ml-0">
        {children}
      </Value>
    </RuledRow>
  );
}

/** The rule under a group heading, ruled in the same direction as the rows below it. */
function GroupRule() {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-px origin-left bg-ink/25"
      initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={reduced ? { opacity: 1 } : { scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: reduced ? 0.2 : 0.55, ease: EASE }}
    />
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
      <div className="relative flex items-baseline gap-4 border-b border-ink/[0.08] pb-2.5">
        <span className={`${LABEL} tabular-nums`}>{number}</span>
        <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
          {title}
        </h3>
        <GroupRule />
      </div>
      {children}
    </section>
  );
}

/**
 * Marginalia: the figure number set enormous and nearly invisible in the outer margin,
 * drifting a whisper against the scroll. Wide screens only, decoration only.
 */
function Marginalia({
  figure,
  target,
}: {
  figure: string;
  target: RefObject<HTMLElement | null>;
}) {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <motion.span
      aria-hidden="true"
      style={reduced ? undefined : { y }}
      className="pointer-events-none absolute -right-24 top-24 -z-10 hidden select-none font-serif text-[150px] italic leading-none text-ink/[0.045] xl:block 2xl:-right-40 2xl:text-[180px]"
    >
      {figure}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ data ---- */

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

/* --------------------------------------------------------------- section ---- */

export default function KeyboardSpecimen() {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      id="keyboard"
      aria-labelledby="keyboard-title"
      className="relative scroll-mt-8 border-t border-rule px-5 sm:px-8"
    >
      <div className="relative mx-auto w-full max-w-5xl py-20 sm:py-28 lg:py-32">
        <Marginalia figure="03" target={sectionRef} />

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
            <Table>
              <Row action="Open or close the shelf, from any app" note="global">
                <Combo keys={["⇧", "⌘", "V"]} />
              </Row>
              <Row action="Focus the search field" note="or just start typing">
                <Combo keys={["⌘", "F"]} />
              </Row>
              <Row action="Close the preview, then the search, then the shelf">
                <Combo keys={["Esc"]} />
              </Row>
            </Table>
            <p className="mt-4 text-[14.5px] leading-[1.6] text-ink-muted">
              ⇧⌘V is the default and can be rebound in Settings → General. The shelf opens on
              whichever display the pointer is on.
            </p>
          </Group>

          <Group number="3.2" title="Selection & paste">
            <Table>
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
            </Table>
          </Group>

          <Group number="3.3" title="Search">
            <Table>
              <Row action="Filter as you type" note="fuzzy, ranked best-first">
                <span className="font-mono text-[12.5px] text-ink-muted">any characters</span>
              </Row>
              <Row action="Clear the query without closing the shelf">
                <Combo keys={["Esc"]} />
              </Row>
            </Table>

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
              <Table className="px-5">
                {TOKENS.map(({ token, matches }) => (
                  <RuledRow
                    key={token}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-3"
                  >
                    <dt className="shrink-0">
                      <CopyChip text={token} label={token} kind="text" />
                      {token === "app:" ? (
                        <span className="ml-1 font-mono text-[12.5px] text-ink-muted">
                          &lt;fragment&gt;
                        </span>
                      ) : null}
                    </dt>
                    <Leader />
                    <Value className="min-w-0 text-[14.5px] leading-snug text-ink/75 sm:max-w-[38ch] sm:text-right">
                      {matches}
                    </Value>
                  </RuledRow>
                ))}
              </Table>
            </div>

            {/* Sub-table: worked examples */}
            <div className="mt-8">
              <p className={LABEL}>Worked examples</p>
              <Table className="mt-3">
                {EXAMPLES.map(({ query, reads }) => (
                  <RuledRow
                    key={query}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-3.5"
                  >
                    <dt className="shrink-0">
                      <CopyChip text={query} label={query} kind="text" />
                    </dt>
                    <Leader />
                    <Value className="min-w-0 text-[14.5px] leading-snug text-ink/75 sm:max-w-[40ch] sm:text-right">
                      {reads}
                    </Value>
                  </RuledRow>
                ))}
              </Table>
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
