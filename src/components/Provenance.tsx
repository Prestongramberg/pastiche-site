"use client";

/**
 * FIG. 04 — Provenance.
 *
 * Proof rather than social proof. Three live plates read from the GitHub Releases API
 * (via `useLatestRelease`, owned by DownloadButton) sit above a static specification of
 * things that are true whether or not the fetch succeeds, and then the candid
 * "Before you install" block.
 *
 * The live plates reserve their own height so a late-arriving fetch never shifts layout.
 *
 * Motion: the measured figures roll up once, over 600ms, when they are first on screen —
 * mono, tabular, in a container sized to the finished string so not a pixel moves while
 * the digits run. The version string and the publication date are never counted: they
 * are identifiers, not quantities. The specification rules itself in row by row like
 * FIG. 03, and the one word worth pausing on — "exactly ONE network request" — is
 * underlined by a guide-blue stroke drawn 300ms after its row lands.
 */

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import type { RefObject } from "react";
import CopyChip from "./CopyChip";
import { useLatestRelease } from "./DownloadButton";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
const LINK = `text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent ${FOCUS}`;

const REPO = "https://github.com/Prestongramberg/Pastiche";
const RELEASES = `${REPO}/releases`;
const STORAGE_PATH = "~/Library/Application Support/Pastiche";

/** The page curve. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** The one spring for physical elements in this section. */
const SPECIMEN_SPRING = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/* --------------------------------------------------------------- count-up ---- */

/** "2.1 MB", "~2 MB", "512 KB" — an optional symbol, a number, then a unit. */
const MEASURE = /^([~≈<>]?\s*)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Rolls a measured value up to itself, once, the first time it is seen. Anything that
 * does not parse as a measurement is printed verbatim, so the component is safe to wrap
 * around a fallback string. The box is sized in `ch` off the finished string and the
 * digits are tabular, so the roll cannot move a single glyph.
 */
function CountUp({ value, className }: { value: string; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });
  const counted = useRef<string | null>(null);

  const match = MEASURE.exec(value);
  const target = match ? Number(match[2]) : Number.NaN;
  const decimals = match ? (match[2].split(".")[1]?.length ?? 0) : 0;
  const countable = match !== null && Number.isFinite(target);

  const figure = useMotionValue(countable ? target : 0);
  const text = useTransform(figure, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!countable || !inView || counted.current === value) return;
    counted.current = value;
    if (reduced) {
      figure.set(target);
      return;
    }
    figure.set(0);
    const controls = animate(figure, target, { duration: 0.6, ease: EASE });
    return () => controls.stop();
  }, [countable, inView, value, target, reduced, figure]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", minWidth: `${value.length}ch` }}
    >
      {countable ? (
        <>
          {match[1]}
          <motion.span>{text}</motion.span>
          {match[3]}
        </>
      ) : (
        value
      )}
    </span>
  );
}

/* ------------------------------------------------------------- ruled table ---- */

const list = (reduced: boolean): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: reduced ? 0 : 0.04 } },
});

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
 * A `delay` inside a child variant REPLACES the stagger offset handed down by the list,
 * so the leader's wait is expressed as a keyframe hold instead.
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

const value = (reduced: boolean): Variants => ({
  hidden: { y: reduced ? 0 : 4 },
  shown: { y: 0, transition: reduced ? { duration: 0 } : SPECIMEN_SPRING },
});

/** A specification row with a dotted leader, matching FIG. 03's table. */
function Spec({ term, children }: { term: string; children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      variants={ROW}
      className="group relative flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b border-rule/25 py-3.5 last:border-b-0"
    >
      <dt className="min-w-0 shrink-0 text-[15.5px] leading-snug text-ink sm:text-[16.5px]">
        {term}
      </dt>
      <motion.span
        aria-hidden="true"
        variants={leader(reduced)}
        className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
      />
      <motion.dd
        variants={value(reduced)}
        className="ml-auto flex min-w-0 shrink flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[14.5px] leading-snug text-ink/75 sm:ml-0 sm:text-right sm:text-[15.5px]"
      >
        {children}
      </motion.dd>
      <motion.span
        aria-hidden="true"
        variants={rule(reduced)}
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-rule/70 group-last:hidden"
      />
    </motion.div>
  );
}

/**
 * A guide-blue stroke ruled under a single word, a beat after its row has landed. The
 * non-photo blue is the annotation colour of the specimen and appears nowhere else on
 * this plate.
 */
function GuideStroke({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });

  return (
    <span ref={ref} className="relative inline-block">
      {children}
      <motion.span
        aria-hidden="true"
        className="absolute bottom-[-0.18em] left-0 h-[2px] w-full origin-left bg-guide"
        initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
        animate={
          inView
            ? reduced
              ? { opacity: 1 }
              : { scaleX: 1 }
            : reduced
              ? { opacity: 0 }
              : { scaleX: 0 }
        }
        transition={{ duration: reduced ? 0.2 : 0.36, delay: reduced ? 0 : 0.3, ease: EASE }}
      />
    </span>
  );
}

/* ------------------------------------------------------------- marginalia ---- */

/**
 * The figure number set enormous and nearly invisible in the outer margin, drifting a
 * whisper against the scroll. Wide screens only, decoration only.
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

/* ------------------------------------------------------------------ plate ---- */

/** One live plate. Height is fixed so the fetch can never move the page. */
function Plate({
  label,
  value: figure,
  pending,
  count = false,
}: {
  label: string;
  value: string | null;
  pending: string;
  /** Measured quantities roll up; identifiers and dates do not. */
  count?: boolean;
}) {
  return (
    <div className="bg-paper-raised px-5 py-5 sm:px-6 sm:py-6">
      <p className={LABEL}>{label}</p>
      <p className="mt-3 flex h-8 items-baseline font-mono text-[19px] tabular-nums leading-8 tracking-[-0.01em] text-ink sm:text-[21px]">
        {figure === null ? (
          <span className="text-ink-muted">{pending}</span>
        ) : count ? (
          <CountUp value={figure} />
        ) : (
          figure
        )}
      </p>
    </div>
  );
}

const CAVEATS: { n: string; head: string; body: React.ReactNode }[] = [
  {
    n: "4.3.1",
    head: "The build is ad-hoc signed, not notarized.",
    body: (
      <>
        macOS will refuse the first double-click and tell you the developer cannot be
        verified. Right-click Pastiche.app → Open → Open, or approve it in System Settings →
        Privacy &amp; Security. Once per installed version, then it never asks again. I would
        rather tell you that here than have you meet it in a dialog.
      </>
    ),
  },
  {
    n: "4.3.2",
    head: "Direct paste needs Accessibility permission.",
    body: (
      <>
        That permission is how Pastiche presses ⌘V for you in the app you came from — macOS
        only lets trusted apps post keyboard events. Say no and everything still works:
        picking a card puts it on the system clipboard and you paste it yourself. Nothing in
        the app reads other applications&apos; contents.
      </>
    ),
  },
  {
    n: "4.3.3",
    head: "Today's release is Apple Silicon.",
    body: (
      <>
        The build script takes a{" "}
        <span className="font-mono text-[0.94em]">--universal</span> flag, so an Intel build
        is a release away rather than a rewrite — but the DMG on the releases page right now
        is arm64. If that is your Mac, say so on the issue tracker.
      </>
    ),
  },
];

export default function Provenance() {
  const { version, dmgUrl, sizeLabel, publishedAt } = useLatestRelease();
  const published = formatDate(publishedAt);
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      id="provenance"
      aria-labelledby="provenance-title"
      className="relative scroll-mt-8 border-t border-rule px-5 sm:px-8"
    >
      <div className="relative mx-auto w-full max-w-5xl py-20 sm:py-28 lg:py-32">
        <Marginalia figure="04" target={sectionRef} />

        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className={LABEL}>FIG. 04 — Provenance</p>
          <p className={LABEL}>Checked against the release feed</p>
        </header>

        <h2
          id="provenance-title"
          className="mt-6 max-w-[20ch] font-serif text-[clamp(2rem,5.2vw,3.6rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink"
        >
          Numbers you can check yourself.
        </h2>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.62] text-ink/75 sm:text-[18px]">
          No testimonials, no logo wall. The figures below come from the same release feed
          the app updates from, and everything under them is verifiable in the repository.
        </p>

        {/* 4.1 — live plates */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.1</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              The current release
            </h3>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[3px] border border-rule bg-rule sm:grid-cols-3">
            <Plate label="Version" value={version} pending="—" />
            <Plate label="Published" value={published} pending="—" />
            <Plate label="Disk image" value={sizeLabel} pending="~2 MB" count />
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14.5px] leading-[1.6] text-ink-muted">
            <span>Read from the GitHub Releases API when this page loaded.</span>
            <a href={RELEASES} target="_blank" rel="noopener noreferrer" className={LINK}>
              Verify on GitHub ↗
            </a>
            <a href={dmgUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
              Direct disk image ↗
            </a>
          </p>
        </div>

        {/* 4.2 — the specification */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.2</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              The specification
            </h3>
          </div>

          <motion.dl
            className="mt-2"
            variants={list(reduced)}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.15 }}
          >
            <Spec term="Download">
              <CountUp
                value={sizeLabel ?? "about 2 MB"}
                className="font-mono text-[13.5px] tabular-nums text-ink"
              />
              <span>disk image</span>
            </Spec>
            <Spec term="Requires">macOS 13 or later, Apple Silicon</Spec>
            <Spec term="Network requests the app makes">
              <span>
                exactly <GuideStroke>one</GuideStroke> — the signed update check
              </span>
            </Spec>
            <Spec term="Accounts, sync, telemetry, analytics">none</Spec>
            <Spec term="Where your clippings live">
              <CopyChip text={STORAGE_PATH} label={STORAGE_PATH} kind="file" />
            </Spec>
            <Spec term="What is in there">
              <span className="font-mono text-[13.5px] text-ink">pastiche.sqlite3</span>
              <span>and an</span>
              <span className="font-mono text-[13.5px] text-ink">Images/</span>
              <span>folder</span>
            </Spec>
            <Spec term="Update feed">
              <a href={`${REPO}/blob/main/appcast.xml`} target="_blank" rel="noopener noreferrer" className={LINK}>
                appcast.xml ↗
              </a>
              <span>, Ed25519-signed</span>
            </Spec>
            <Spec term="License">
              <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className={LINK}>
                MIT ↗
              </a>
            </Spec>
            <Spec term="Source">
              <a href={REPO} target="_blank" rel="noopener noreferrer" className={LINK}>
                github.com/Prestongramberg/Pastiche ↗
              </a>
            </Spec>
          </motion.dl>

          <p className="mt-5 max-w-[62ch] text-[14.5px] leading-[1.6] text-ink-muted">
            Clippings that arrive marked concealed or transient — what password managers use —
            are never recorded, and any app can be excluded outright in Settings → Privacy.
          </p>
        </div>

        {/* 4.3 — before you install */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.3</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              <span className="underline decoration-guide decoration-2 underline-offset-[6px]">
                Before you install
              </span>
            </h3>
          </div>

          <ol className="mt-2">
            {CAVEATS.map(({ n, head, body }) => (
              <li
                key={n}
                className="flex gap-4 border-b border-rule/70 py-6 last:border-b-0 sm:gap-6"
              >
                <span className={`${LABEL} w-12 shrink-0 pt-1 tabular-nums`}>{n}</span>
                <div className="min-w-0">
                  <p className="text-[16.5px] font-medium leading-snug text-ink sm:text-[17.5px]">
                    {head}
                  </p>
                  <p className="mt-2.5 max-w-[62ch] text-[15px] leading-[1.62] text-ink/75 sm:text-[16px]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
