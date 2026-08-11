"use client";

/**
 * FIG. 02 — The clippings.
 *
 * The one scroll-pinned scene on the specimen. Six large clipping cards are printed
 * on paper (not the dark app UI — these are specimen plates OF the UI) and stacked in
 * a single sticky column: as you scroll, each sheet settles into the plate area and the
 * one before it peels back. Only `transform` and `opacity` are animated, so the whole
 * scene stays on the compositor.
 *
 * Accessibility: every sheet stays in the DOM and in the tab order. Focusing a control
 * inside an off-stage sheet scrolls that sheet onto the plate (see `goTo`), and the
 * plate index at the top doubles as a set of jump buttons. Under
 * `prefers-reduced-motion` the utility `motion-reduce:transform-none!` neutralises the
 * inline transforms framer writes, leaving a plain cross-fade — never invisible content.
 */

import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import CopyChip from "./CopyChip";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const CARD_COUNT = 6;
/** Viewport heights of scroll travel per card. Runway = 100svh + (n - 1) × STEP. */
const STEP_VH = 80;

/* ------------------------------------------------------------------ card ---- */

function SpecimenCard({
  kind,
  timeAgo,
  meta,
  index,
  keyClassName,
  caption,
  children,
}: {
  kind: string;
  timeAgo: string;
  meta: string;
  index: number;
  /** Type key: the 3px rule across the top of the plate. Palette tokens only. */
  keyClassName: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="mx-auto w-full max-w-[30rem] overflow-hidden rounded-[3px] border border-rule bg-paper-raised lg:mx-0">
      <div aria-hidden="true" className={`h-[3px] w-full ${keyClassName}`} />
      <div className="flex items-baseline justify-between gap-3 border-b border-rule px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/70">
          {kind}
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.08em] text-ink-muted">
          {timeAgo}
        </span>
      </div>

      <div className="px-4 py-5 sm:px-5 sm:py-6">{children}</div>

      <div className="flex items-center justify-between gap-3 border-t border-rule px-4 py-2 font-mono text-[10.5px] tracking-[0.06em] text-ink-muted sm:px-5">
        <span className="min-w-0 truncate">{meta}</span>
        <span className="shrink-0">⌘{index}</span>
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/* ----------------------------------------------------------- card bodies ---- */

function CodeBody() {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12.5px] leading-[1.7] text-ink sm:text-[13.5px]">
      {`swift build -c release
bash Scripts/build_app.sh --universal`}
    </pre>
  );
}

function LinkBody() {
  return (
    <div>
      <p className="text-[15px] font-medium leading-snug text-ink">Deploy · Pastiche</p>
      <p className="mt-2 break-all font-mono text-[12px] leading-[1.6] text-ink-muted sm:text-[12.5px]">
        https://github.com/Prestongramberg/Pastiche/actions/workflows/deploy.yml
      </p>
    </div>
  );
}

function ImageBody() {
  return (
    <div className="relative aspect-[16/10] w-full border border-rule bg-ink/[0.03]">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        className="h-full w-full text-rule"
      >
        <line
          x1="0"
          y1="0"
          x2="320"
          y2="200"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="320"
          y1="0"
          x2="0"
          y2="200"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Registration mark — the one place guide-blue appears on this plate. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-guide"
      >
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

function ColorBody() {
  return (
    <div className="flex items-center gap-4">
      {/*
        Hex exemption, narrowly: this square IS the clipping — a colour specimen has to
        print the colour it specifies. Nothing else on this plate leaves the palette.
      */}
      <span
        aria-hidden="true"
        className="size-16 shrink-0 rounded-[2px] border border-rule bg-[#7C5CFF] sm:size-[4.5rem]"
      />
      <div className="min-w-0">
        <CopyChip text="#7C5CFF" label="#7C5CFF" kind="color" />
        <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-ink-muted">
          sRGB 124 · 92 · 255
        </p>
      </div>
    </div>
  );
}

function FileBody() {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className="grid size-14 shrink-0 place-items-center rounded-[2px] border border-rule bg-ink/[0.04] font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted"
      >
        xml
      </span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-ink">appcast.xml</p>
        <p className="mt-1.5 truncate font-mono text-[11.5px] text-ink-muted">
          ~/Developer/Pastiche/appcast.xml
        </p>
      </div>
    </div>
  );
}

function TextBody() {
  return (
    <p className="text-[14.5px] leading-[1.65] text-ink sm:text-[15.5px]">
      Thanks for the report — the focus bug is fixed in{" "}
      <strong className="font-semibold">v1.0.1</strong>. Update from the menu bar and it
      will stick.
    </p>
  );
}

/* ------------------------------------------------------------------ data ---- */

type Clipping = {
  n: string;
  kind: string;
  timeAgo: string;
  meta: string;
  index: number;
  keyClassName: string;
  claim: string;
  note: ReactNode;
  chips?: ReactNode;
  body: ReactNode;
  alt: string;
};

const CLIPPINGS: Clipping[] = [
  {
    n: "2.1",
    kind: "Text",
    timeAgo: "just now",
    meta: "2 lines · 60 characters · Terminal",
    index: 1,
    keyClassName: "bg-ink",
    claim: "Everything you have copied, still there.",
    note: (
      <>
        The default history limit is no limit. If you would rather it stayed small, cap it
        at 100, 500, 1,000 or 5,000 items in Settings — the choice is yours, and it is the
        only thing about the history that is ever capped.
      </>
    ),
    body: <CodeBody />,
    alt: "A text clipping holding two shell commands.",
  },
  {
    n: "2.2",
    kind: "Link",
    timeAgo: "4 min ago",
    meta: "github.com · Safari",
    index: 2,
    keyClassName: "bg-accent",
    claim: "Two tokens and a half-remembered word.",
    note: (
      <>
        Bare words fuzzy-match the text, the URL, the hex code, the file name and the app a
        clipping came from. The <span className="font-mono text-[0.95em]">type:</span> and{" "}
        <span className="font-mono text-[0.95em]">app:</span> filters narrow the field, and
        they combine with each other and with free text.
      </>
    ),
    chips: <CopyChip text="type:link deploy" label="type:link deploy" kind="text" />,
    body: <LinkBody />,
    alt: "A link clipping pointing at a deploy workflow on github.com.",
  },
  {
    n: "2.3",
    kind: "Image",
    timeAgo: "18 min ago",
    meta: "2048 × 1280 · PNG · 1.4 MB",
    index: 3,
    keyClassName: "bg-guide",
    claim: "Six kinds of clipping, six kinds of card.",
    note: (
      <>
        Plain text, rich text with its styling intact, links, images, files and colours.
        Each type is stored as itself and drawn with a card built for it — an image is a
        thumbnail you can preview with Space, not a filename you have to trust.
      </>
    ),
    body: <ImageBody />,
    alt: "An image clipping, printed here as a crop box with a registration mark.",
  },
  {
    n: "2.4",
    kind: "Color",
    timeAgo: "1 hr ago",
    meta: "Pinboard · Brand",
    index: 4,
    keyClassName: "bg-[#7C5CFF]",
    claim: "The things you paste every day, on their own board.",
    note: (
      <>
        Pinboards are named, coloured collections for the snippets you reach for
        constantly. Copying an item onto a board leaves your history exactly as it was —
        boards are a second shelf, not a filing cabinet you have to maintain.
      </>
    ),
    chips: <CopyChip text="#7C5CFF" label="#7C5CFF" kind="color" />,
    body: <ColorBody />,
    alt: "A colour clipping holding the hex value #7C5CFF.",
  },
  {
    n: "2.5",
    kind: "File",
    timeAgo: "2 hrs ago",
    meta: "6 KB · Finder",
    index: 5,
    keyClassName: "bg-accent/70",
    claim: "Drag it out, or paste it by number.",
    note: (
      <>
        Any card drags straight out of the shelf and into another app. When your hands are
        already on the keyboard, ⌘1 through ⌘9 paste the numbered cards without moving the
        selection at all.
      </>
    ),
    chips: (
      <>
        <CopyChip text="⌘1" label="⌘1" kind="command" />
        <CopyChip text="⌘9" label="⌘9" kind="command" />
      </>
    ),
    body: <FileBody />,
    alt: "A file clipping for appcast.xml.",
  },
  {
    n: "2.6",
    kind: "Rich text",
    timeAgo: "yesterday",
    meta: "100 characters · Mail",
    index: 6,
    keyClassName: "bg-ink/55",
    claim: "It lands before the panel finishes closing.",
    note: (
      <>
        Return pastes into the app you came from: Pastiche re-activates it and sends ⌘V for
        you. ⇧Return does the same thing with the styling stripped off, for when the
        formatting belongs to the page you took it from.
      </>
    ),
    chips: (
      <>
        <CopyChip text="Return" label="Return" kind="command" />
        <CopyChip text="⇧Return" label="⇧Return" kind="command" />
      </>
    ),
    body: <TextBody />,
    alt: "A rich-text clipping from an email reply.",
  },
];

/* ----------------------------------------------------------------- sheet ---- */

function Sheet({
  item,
  i,
  t,
  isActive,
  onRequestFocusScroll,
}: {
  item: Clipping;
  i: number;
  t: MotionValue<number>;
  isActive: boolean;
  onRequestFocusScroll: (index: number) => void;
}) {
  const opacity = useTransform(t, [i - 1, i - 0.45, i, i + 0.5, i + 1], [0, 0.2, 1, 0.22, 0]);
  const y = useTransform(t, [i - 1, i, i + 1], [64, 0, -40]);
  const scale = useTransform(t, [i - 1, i, i + 1], [0.96, 1, 0.94]);
  const rotate = useTransform(t, [i - 1, i, i + 1], [0.7, 0, -1]);

  // `motion-reduce:transform-none!` outranks framer's inline transform, so a visitor who
  // asks for reduced motion gets a plain cross-fade instead of the peel.
  return (
    <motion.div
      style={{ opacity, y, scale, rotate, zIndex: i, pointerEvents: isActive ? "auto" : "none" }}
      onFocusCapture={() => {
        if (!isActive) onRequestFocusScroll(i);
      }}
      className="absolute inset-0 flex items-center motion-reduce:transform-none!"
    >
      <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        {/* Margin annotation */}
        <div className="flex gap-4 sm:gap-6">
          <p className={`${LABEL} w-9 shrink-0 pt-1 tabular-nums`}>{item.n}</p>
          <div className="min-w-0">
            <h3 className="font-serif text-[clamp(1.5rem,3.4vw,2.35rem)] font-normal leading-[1.12] tracking-[-0.02em] text-ink">
              {item.claim}
            </h3>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.6] text-ink/75 sm:text-[16px]">
              {item.note}
            </p>
            {item.chips ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">{item.chips}</div>
            ) : null}
          </div>
        </div>

        {/* The plate */}
        <SpecimenCard
          kind={item.kind}
          timeAgo={item.timeAgo}
          meta={item.meta}
          index={item.index}
          keyClassName={item.keyClassName}
          caption={item.alt}
        >
          {item.body}
        </SpecimenCard>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- section ---- */

export default function Clippings() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });
  const t = useTransform(scrollYProgress, [0, 1], [0, CARD_COUNT - 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(CARD_COUNT - 1, Math.max(0, Math.round(v * (CARD_COUNT - 1))));
    setActive((prev) => (prev === next ? prev : next));
  });

  const goTo = useCallback((index: number) => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    if (!runway || !stage) return;
    const travel = runway.offsetHeight - stage.offsetHeight;
    if (travel <= 0) return;
    const top = runway.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.round(top + (travel * index) / (CARD_COUNT - 1)),
      behavior: "auto",
    });
  }, []);

  return (
    <section
      id="clippings"
      aria-labelledby="clippings-title"
      className="relative scroll-mt-8 border-t border-rule"
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-20 sm:px-8 sm:pt-28 lg:pt-32">
        <p className={LABEL}>FIG. 02 — The clippings</p>
        <h2
          id="clippings-title"
          className="mt-6 max-w-[18ch] font-serif text-[clamp(2rem,5.2vw,3.6rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink"
        >
          Six clippings, pulled off a working shelf.
        </h2>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.62] text-ink/75 sm:text-[18px]">
          Every card the app draws, printed flat and{" "}
          <span className="underline decoration-guide decoration-2 underline-offset-[6px]">
            annotated in the margin
          </span>
          . Scroll to advance the stack.
        </p>
      </div>

      {/* Scroll runway — the sticky stage lives inside it. */}
      <div
        ref={runwayRef}
        className="relative mt-10 sm:mt-14"
        style={{ height: `calc(100svh + ${(CARD_COUNT - 1) * STEP_VH}svh)` }}
      >
        <div
          ref={stageRef}
          className="sticky top-0 flex h-[100svh] flex-col px-5 pb-24 pt-6 sm:px-8 sm:pb-28"
        >
          {/* Running head + plate index */}
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-b border-rule pb-3">
            <p className={LABEL}>The clippings</p>

            <div className="flex items-center gap-1.5">
              {CLIPPINGS.map((item, i) => (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show clipping ${item.n} — ${item.claim}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group grid h-6 w-4 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-3 w-px transition-[background-color,height] duration-200 group-hover:bg-ink ${
                      i === active ? "h-5 bg-accent" : "bg-rule"
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className={`${LABEL} tabular-nums`}>
              {CLIPPINGS[active]?.n ?? "2.1"} / 2.{CARD_COUNT}
            </p>
          </div>

          {/* Plate area */}
          <div className="relative mx-auto w-full max-w-6xl flex-1">
            {CLIPPINGS.map((item, i) => (
              <Sheet
                key={item.n}
                item={item}
                i={i}
                t={t}
                isActive={i === active}
                onRequestFocusScroll={goTo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
