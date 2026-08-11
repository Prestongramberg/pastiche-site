"use client";

/**
 * LiveShelf — the site's navigation and its product demonstration, in one object.
 *
 * Collapsed, it is a slim lip pinned to the bottom of the viewport: glyph, the site's
 * whole nav, the ⇧⌘V hint, and the download block. There is no top navbar.
 *
 * Open, it is the app: ⇧⌘V (or a click on the lip) slides a dark macOS-faithful panel
 * up over the page in 220ms, and it fills with the things the visitor has actually
 * copied on this page.
 *
 * INTENTIONAL EXEMPTION FROM THE PALETTE-TOKEN RULE:
 * everything from `<ShelfPanel>` inward is hard-coded to the app's own values, because
 * it depicts the app — whose panel is always dark, in both of the site's themes.
 * The values mirror the app one-for-one:
 *
 *   panel   #0d0d14 at 90% over a blur, 16px top radius, 1px white/10 hairline
 *   cards   200 × 240 pt (kept in proportion, scaled down), 12px radius, white/10 border
 *   headers #2E2E33 text · #1E6FEB link · #D8D8DC image · #6E56CF file ·
 *           the item's own color for color cards
 *   select  macOS accent blue #0A84FF ring on the selected card
 *   slide   0.22s ease-out (PanelController.swift slideDuration)
 *
 * The lip, the ghost chips and everything else outside the panel use the site's tokens.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronUp,
  Clipboard,
  Clock,
  Compass,
  Download,
  FileCode2,
  Github,
  Info,
  Link2,
  Palette,
  Plus,
  ScrollText,
  Search,
  Terminal,
  Type,
  X,
} from "lucide-react";
import {
  isHexColor,
  isLightColor,
  kindLabel,
  relativeTime,
  shortPreview,
  useShelfStore,
  writeClipboard,
  type ShelfItem,
  type ShelfKind,
} from "./ShelfContext";

/* --------------------------------------------------------------- constants -- */

const REPO_URL = "https://github.com/Prestongramberg/Pastiche";
const RELEASES_URL = `${REPO_URL}/releases`;
const LATEST_URL = `${REPO_URL}/releases/latest`;

/** How long the shelf peeks after a capture before retracting to the lip. */
const PEEK_MS = 1600;
/** Re-check interval while the pointer or focus is still inside during a peek. */
const PEEK_RECHECK_MS = 600;

const PRIVACY_NOTE =
  "captures only what you copy on this page — nothing leaves your browser.";

/** Card header strips, straight from the app. */
const HEADER_BG: Record<ShelfKind, string> = {
  text: "#2E2E33",
  command: "#2E2E33",
  link: "#1E6FEB",
  file: "#6E56CF",
  color: "#2E2E33",
};

const HEADER_ICON_BG: Record<ShelfKind, string> = {
  text: "linear-gradient(140deg,#3d4250,#1b1d24)",
  command: "linear-gradient(140deg,#3d4250,#1b1d24)",
  link: "linear-gradient(140deg,#4aa9ff,#1668e3)",
  file: "linear-gradient(140deg,#8f7bff,#4a3aa8)",
  color: "linear-gradient(140deg,#7c5cff,#22d3ee)",
};

/* ------------------------------------------------------------------ glyph -- */

function Glyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
    >
      <rect
        x="1.75"
        y="5.25"
        width="8"
        height="9"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.45"
      />
      <rect x="6.25" y="1.75" width="8" height="9" rx="2.25" fill="currentColor" />
    </svg>
  );
}

/* --------------------------------------------------------------- lip parts -- */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative z-10 rounded-[5px] px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:px-2 sm:text-[11px]",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      ].join(" ")}
    >
      {children}
      <span
        aria-hidden="true"
        className={`absolute inset-x-1.5 -bottom-0.5 h-px transition-opacity sm:inset-x-2 ${
          active ? "bg-accent opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );
}

function ExternalNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 inline-flex items-center gap-1.5 rounded-[5px] px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:px-2 sm:text-[11px]"
    >
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">{label}</span>
    </a>
  );
}

function PrivacyNote() {
  const tipId = useId();
  return (
    <span className="relative hidden sm:inline-flex">
      <button
        type="button"
        aria-label="How the shelf captures"
        aria-describedby={tipId}
        className="peer grid size-6 place-items-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        <Info size={13} strokeWidth={2} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        id={tipId}
        className="pointer-events-none absolute bottom-[calc(100%_+_0.6rem)] right-0 w-60 rounded-[8px] border border-rule bg-paper-raised px-2.5 py-2 text-left font-mono text-[10.5px] leading-[1.5] text-ink-muted opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100"
      >
        {PRIVACY_NOTE}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------- panel parts -- */

function Tab({
  label,
  active = false,
  dot,
  clock = false,
}: {
  label: string;
  active?: boolean;
  dot?: string;
  clock?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium sm:px-2.5 sm:text-[11.5px]",
        active ? "bg-white/15 text-white/95" : "text-white/55",
      ].join(" ")}
    >
      {clock ? <Clock size={10} strokeWidth={2.5} /> : null}
      {dot ? (
        <span className="size-[7px] rounded-full" style={{ backgroundColor: dot }} />
      ) : null}
      {label}
    </span>
  );
}

function KindIcon({ kind }: { kind: ShelfKind }) {
  const size = 10;
  switch (kind) {
    case "command":
      return <Terminal size={size} className="text-white/85" />;
    case "link":
      return <Compass size={size} className="text-white/90" />;
    case "color":
      return <Palette size={size} className="text-white/90" />;
    case "file":
      return <FileCode2 size={size} className="text-white/90" />;
    default:
      return <Type size={size} className="text-white/85" />;
  }
}

function CardBody({ item }: { item: ShelfItem }) {
  if (item.kind === "color" && isHexColor(item.content)) {
    const hex = item.content.trim();
    return (
      <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: hex }}>
        <span
          className={`pb-4 font-mono text-[11px] font-semibold sm:text-[12.5px] ${
            isLightColor(hex) ? "text-black/75" : "text-white"
          }`}
        >
          {hex.toUpperCase()}
        </span>
      </div>
    );
  }

  if (item.kind === "link") {
    let host = item.content;
    try {
      host = new URL(
        item.content.startsWith("www.") ? `https://${item.content}` : item.content,
      ).hostname.replace(/^www\./, "");
    } catch {
      host = item.content;
    }
    return (
      <div className="p-2 pb-8 sm:p-2.5">
        <div className="flex items-center gap-1.5">
          <Link2 size={10} className="shrink-0 text-[#0a84ff]" strokeWidth={2.5} />
          <span className="truncate text-[11px] font-semibold text-white/90 sm:text-[12px]">
            {host}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-4 break-all text-[9px] leading-[1.5] text-white/55 sm:text-[10px]">
          {item.content}
        </p>
      </div>
    );
  }

  if (item.kind === "file") {
    const name = item.content.split("/").filter(Boolean).pop() ?? item.content;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2 pb-6">
        <FileCode2 size={26} className="text-white/80" strokeWidth={1.4} aria-hidden="true" />
        <span className="max-w-full truncate text-[9.5px] font-medium text-white/90 sm:text-[10.5px]">
          {name}
        </span>
      </div>
    );
  }

  return (
    <p
      className={[
        "line-clamp-6 break-words p-2 pb-8 text-[9.5px] leading-[1.55] text-white/90 sm:p-2.5 sm:text-[10.5px]",
        item.kind === "command" ? "font-mono" : "",
      ].join(" ")}
    >
      {item.content}
    </p>
  );
}

function ShelfCard({
  item,
  index,
  id,
  selected,
  copied,
  timeText,
  onPick,
}: {
  item: ShelfItem;
  index: number;
  id: string;
  selected: boolean;
  copied: boolean;
  timeText: string;
  onPick: () => void;
}) {
  const headerColor =
    item.kind === "color" && isHexColor(item.content)
      ? item.content.trim()
      : HEADER_BG[item.kind];
  const lightHeader = item.kind === "color" && isLightColor(item.content);

  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      data-index={index}
      onClick={onPick}
      className={[
        "relative flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-[12px] bg-[#1d1d20] transition-shadow",
        // 200 × 240 pt in the app, in proportion at every breakpoint.
        "h-[158px] w-[132px] sm:h-[182px] sm:w-[152px] lg:h-[202px] lg:w-[168px]",
        selected
          ? "shadow-[0_10px_26px_rgba(0,0,0,0.55)] ring-2 ring-[#0a84ff]"
          : "shadow-[0_6px_18px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/10",
      ].join(" ")}
    >
      {/* Header strip */}
      <div
        className="flex h-[38px] shrink-0 items-start justify-between gap-1.5 px-2 py-1.5 sm:h-[42px] sm:px-2.5 sm:py-2 lg:h-[46px]"
        style={{ backgroundColor: headerColor }}
      >
        <div className="min-w-0">
          <p
            className={`truncate text-[11px] font-semibold leading-tight lg:text-[12.5px] ${
              lightHeader ? "text-black/80" : "text-white/95"
            }`}
          >
            {kindLabel(item.kind)}
          </p>
          <p
            className={`truncate text-[9px] leading-tight lg:text-[10.5px] ${
              lightHeader ? "text-black/55" : "text-white/65"
            }`}
          >
            {timeText}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="grid size-[16px] shrink-0 place-items-center rounded-[4px] ring-1 ring-inset ring-white/20 sm:size-[19px] sm:rounded-[5px] lg:size-[22px] lg:rounded-[6px]"
          style={{ background: HEADER_ICON_BG[item.kind] }}
        >
          <KindIcon kind={item.kind} />
        </span>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1">
        <CardBody item={item} />
      </div>

      {/* Footer: metadata + quick-paste index chip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-1 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-2 pb-1.5 pt-5">
        <span className="min-w-0 flex-1 truncate text-[9px] text-white/75 lg:text-[10px]">
          {item.meta}
        </span>
        {index < 9 ? (
          <span className="grid h-[15px] w-[17px] shrink-0 place-items-center rounded-[4px] bg-white/15 text-[9px] font-semibold text-white/90 lg:text-[10px]">
            {index + 1}
          </span>
        ) : null}
      </div>

      {copied ? (
        <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/45">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-black">
            <Check size={10} strokeWidth={3} aria-hidden="true" /> copied
          </span>
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ shelf -- */

export default function LiveShelf() {
  const {
    items,
    isOpen,
    open,
    close,
    toggle,
    announcement,
    announce,
    reset,
    remove,
    captureSeq,
    registerFlyTarget,
  } = useShelfStore();

  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const panelId = useId();

  const [selected, setSelected] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [pendingFocus, setPendingFocus] = useState(false);

  const glyphRef = useRef<HTMLSpanElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const retractTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekRef = useRef(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const lastSeqRef = useRef(0);

  const safeSelected = items.length === 0 ? 0 : Math.min(selected, items.length - 1);
  const selectedItem = items[safeSelected];
  const cardId = useCallback((index: number) => `${panelId}-clip-${index}`, [panelId]);

  /* The ghost chips fly here. */
  useEffect(() => {
    registerFlyTarget(glyphRef.current);
    return () => registerFlyTarget(null);
  }, [registerFlyTarget]);

  useEffect(
    () => () => {
      if (retractTimer.current) clearTimeout(retractTimer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );

  /* ------------------------------------------------------- open / close -- */

  const clearRetract = useCallback(() => {
    if (retractTimer.current) {
      clearTimeout(retractTimer.current);
      retractTimer.current = null;
    }
  }, []);

  /** After a peek, retract to the lip — unless the visitor is hovering or focused in. */
  const scheduleRetract = useCallback(
    (delay: number) => {
      clearRetract();
      const tick = () => {
        if (!peekRef.current) return;
        if (hoverRef.current || focusRef.current) {
          retractTimer.current = setTimeout(tick, PEEK_RECHECK_MS);
          return;
        }
        peekRef.current = false;
        close();
      };
      retractTimer.current = setTimeout(tick, delay);
    },
    [clearRetract, close],
  );

  const closeShelf = useCallback(() => {
    peekRef.current = false;
    clearRetract();
    close();
  }, [clearRetract, close]);

  /** Deliberate open/close: takes focus with it, and never auto-retracts. */
  const toggleShelf = useCallback(() => {
    peekRef.current = false;
    clearRetract();
    if (isOpen) {
      close();
      toggleRef.current?.focus();
    } else {
      open();
      setPendingFocus(true);
    }
  }, [clearRetract, close, isOpen, open]);

  useEffect(() => {
    if (!isOpen || !pendingFocus) return;
    railRef.current?.focus();
    setPendingFocus(false);
  }, [isOpen, pendingFocus]);

  /* ⇧⌘V opens the app for real; here it opens the depiction. Esc closes. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isV = event.code === "KeyV" || event.key === "v" || event.key === "V";
      if (isV && event.shiftKey && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleShelf();
        return;
      }
      if (event.key === "Escape" && isOpen) {
        closeShelf();
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeShelf, isOpen, toggleShelf]);

  /* A capture makes the shelf peek, then retract. */
  useEffect(() => {
    if (captureSeq === 0 || captureSeq === lastSeqRef.current) return;
    lastSeqRef.current = captureSeq;
    setSelected(0);
    setNow(Date.now());
    if (!isOpen) {
      peekRef.current = true;
      open();
    }
    if (peekRef.current) scheduleRetract(PEEK_MS);
  }, [captureSeq, isOpen, open, scheduleRetract]);

  /* Leaving the page closes the shelf behind you. */
  useEffect(() => {
    peekRef.current = false;
    clearRetract();
    close();
  }, [pathname, clearRetract, close]);

  /* Relative times stay honest while the panel is open. */
  useEffect(() => {
    if (!isOpen) return;
    setNow(Date.now());
    if (!items.some((item) => item.capturedAt !== null)) return;
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, [isOpen, items]);

  /* Keep the selected card in view. */
  useEffect(() => {
    if (!isOpen) return;
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(`[data-index="${safeSelected}"]`);
    card?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [isOpen, safeSelected, reduceMotion]);

  /* ----------------------------------------------------------- actions -- */

  const copyItem = useCallback(
    async (item: ShelfItem) => {
      const ok = await writeClipboard(item.content);
      if (!ok) return;
      setCopiedId(item.id);
      announce(`Copied ${kindLabel(item.kind).toLowerCase()}: ${shortPreview(item.content)}`);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopiedId(null), 1200);
    },
    [announce],
  );

  const onRailKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (items.length === 0) return;
      const last = items.length - 1;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((index) => Math.min(last, Math.min(index, last) + 1));
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((index) => Math.max(0, Math.min(index, last) - 1));
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setSelected(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setSelected(last);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (selectedItem) void copyItem(selectedItem);
        return;
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        if (selectedItem) {
          remove(selectedItem.id);
          announce("Clipping removed from shelf");
          setSelected((index) => Math.max(0, Math.min(index, last - 1)));
        }
        return;
      }
      if (event.key.length === 1 && event.key >= "1" && event.key <= "9") {
        const index = Number(event.key) - 1;
        const target = items[index];
        if (target) {
          event.preventDefault();
          setSelected(index);
          void copyItem(target);
        }
      }
    },
    [announce, copyItem, items, remove, selectedItem],
  );

  const onPointerEnter = useCallback(() => {
    hoverRef.current = true;
  }, []);
  const onPointerLeave = useCallback(() => {
    hoverRef.current = false;
  }, []);
  const onFocusCapture = useCallback(() => {
    focusRef.current = true;
  }, []);
  const onBlurCapture = useCallback((event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) focusRef.current = false;
  }, []);

  const timeTextFor = useCallback(
    (item: ShelfItem) =>
      item.capturedAt === null
        ? (item.timeLabel ?? "earlier")
        : relativeTime(item.capturedAt, now),
    [now],
  );

  const provenance = useMemo(() => {
    if (!selectedItem) return PRIVACY_NOTE;
    return `${selectedItem.source} · ${timeTextFor(selectedItem)} · ${selectedItem.meta}`;
  }, [selectedItem, timeTextFor]);

  const isSpecimen = pathname === "/";
  const isDocs = pathname?.startsWith("/docs") ?? false;

  /* -------------------------------------------------------------- render -- */

  return (
    <>
      {/* Keeps the end of the page clear of the fixed lip. */}
      <div
        aria-hidden="true"
        className="h-[calc(3.75rem_+_env(safe-area-inset-bottom))] sm:h-[calc(3.5rem_+_env(safe-area-inset-bottom))]"
      />

      <div className="[--lip:3.75rem] sm:[--lip:3.5rem]">
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        {/* ------------------------------------------------------- panel -- */}
        <div
          id={panelId}
          inert={!isOpen}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
          className={[
            "fixed inset-x-0 bottom-0 z-40 pb-[calc(var(--lip)_+_env(safe-area-inset-bottom))]",
            "transition-[transform,opacity] duration-[220ms] [transition-timing-function:var(--ease-shelf,cubic-bezier(0.16,1,0.3,1))]",
            "will-change-transform",
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <section
              aria-label="Pastiche shelf"
              className="relative flex max-h-[74svh] flex-col overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-[#0d0d14]/90 shadow-[0_-2px_40px_rgba(0,0,0,0.35),0_-30px_70px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              {/* Hairline highlight along the top edge, like the real panel */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />

              {/* Header: glyph, search, pinboard tabs — the app's chrome */}
              <div className="flex h-[44px] shrink-0 items-center gap-2.5 px-3 sm:h-[46px] sm:px-3.5">
                <div
                  aria-hidden="true"
                  className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-2.5"
                >
                  <Clipboard size={13} className="shrink-0 text-white/70" strokeWidth={2.25} />
                  <span className="grid size-[26px] shrink-0 place-items-center rounded-full text-white/55">
                    <Search size={13} strokeWidth={2.5} />
                  </span>
                  <div className="flex min-w-0 items-center gap-1 overflow-hidden sm:gap-1.5">
                    <Tab label="Clipboard" active clock />
                    <Tab label="Snippets" dot="#3b82f6" />
                    <Tab label="Work" dot="#ef4444" />
                  </div>
                  <span className="hidden size-6 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/55 sm:grid">
                    <Plus size={11} strokeWidth={3} />
                  </span>
                </div>

                <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 md:inline">
                  {items.length} {items.length === 1 ? "clipping" : "clippings"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    closeShelf();
                    toggleRef.current?.focus();
                  }}
                  aria-label="Close the shelf"
                  className="grid size-7 shrink-0 place-items-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9d85ff]"
                >
                  <X size={14} strokeWidth={2.25} aria-hidden="true" />
                </button>
              </div>

              <div aria-hidden="true" className="h-px shrink-0 bg-white/[0.07]" />

              {/* The rail */}
              {items.length > 0 ? (
                <div
                  ref={railRef}
                  role="listbox"
                  tabIndex={0}
                  aria-label="Captured clippings — arrow keys select, Return copies"
                  aria-activedescendant={selectedItem ? cardId(safeSelected) : undefined}
                  onKeyDown={onRailKeyDown}
                  className="flex min-h-0 flex-1 gap-2 overflow-x-auto overflow-y-hidden px-3 pb-4 pt-3 outline-none [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9d85ff] sm:gap-2.5 sm:px-3.5 sm:pb-5 sm:pt-3.5"
                >
                  {items.map((item, index) => (
                    <ShelfCard
                      key={item.id}
                      id={cardId(index)}
                      item={item}
                      index={index}
                      selected={index === safeSelected}
                      copied={copiedId === item.id}
                      timeText={timeTextFor(item)}
                      onPick={() => {
                        setSelected(index);
                        void copyItem(item);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10">
                  <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
                    the shelf is empty — copy anything on this page
                  </p>
                </div>
              )}

              {/* Provenance of the selected clipping + the honest note */}
              <div className="shrink-0 border-t border-white/[0.07] px-3 py-2 sm:px-3.5">
                <div className="flex items-center gap-2.5">
                  {selectedItem ? (
                    <span className="hidden shrink-0 rounded-[4px] bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/60 sm:inline">
                      {kindLabel(selectedItem.kind)}
                    </span>
                  ) : null}
                  <p className="min-w-0 flex-1 truncate font-mono text-[10px] tracking-[0.06em] text-white/45">
                    {provenance}
                  </p>
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 items-center gap-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/30 lg:flex"
                  >
                    <span>← → select</span>
                    <span>return copy</span>
                    <span>esc close</span>
                  </span>
                  <button
                    type="button"
                    onClick={reset}
                    className="shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9d85ff]"
                  >
                    clear
                  </button>
                </div>
                <p className="mt-1 truncate font-mono text-[9.5px] tracking-[0.04em] text-white/25">
                  {PRIVACY_NOTE}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* --------------------------------------------------------- lip -- */}
        <div
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-paper-raised/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
        >
          <div className="relative mx-auto flex h-[var(--lip)] w-full max-w-[1600px] items-center gap-1 px-2 sm:gap-3 sm:px-5">
            {/* Mouse-only: the whole lip is a handle for the shelf. */}
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={toggleShelf}
              className="absolute inset-0 z-0 cursor-pointer"
            />

            <button
              ref={toggleRef}
              type="button"
              onClick={toggleShelf}
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-label={isOpen ? "Close the shelf" : "Open the shelf — Shift Command V"}
              className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-[7px] px-1 py-1.5 text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:gap-2 sm:px-1.5"
            >
              <span ref={glyphRef} className="grid place-items-center text-accent">
                <Glyph className="size-[18px] sm:size-5" />
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] sm:inline">
                Shelf
              </span>
              <span className="rounded-full border border-rule px-1.5 py-px font-mono text-[10px] tabular-nums text-ink-muted">
                {items.length}
              </span>
              <ChevronUp
                size={13}
                aria-hidden="true"
                className={`hidden text-ink-muted transition-transform duration-200 sm:block ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <nav
              aria-label="Site"
              className="relative z-10 flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1"
            >
              <NavLink href="/" active={isSpecimen}>
                Specimen
              </NavLink>
              <NavLink href="/docs" active={isDocs}>
                Docs
              </NavLink>
              <ExternalNavLink
                href={REPO_URL}
                label="GitHub"
                icon={<Github size={13} strokeWidth={2} />}
              />
              <ExternalNavLink
                href={RELEASES_URL}
                label="Changelog"
                icon={<ScrollText size={13} strokeWidth={2} />}
              />
            </nav>

            <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <PrivacyNote />

              <span
                aria-hidden="true"
                className="hidden items-center gap-1 md:inline-flex"
                title="Open the shelf"
              >
                <kbd className="kbd">⇧</kbd>
                <kbd className="kbd">⌘</kbd>
                <kbd className="kbd">V</kbd>
              </span>

              <a
                href={LATEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-accent px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-paper transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:px-3.5 sm:text-[11px]"
              >
                <Download size={12} strokeWidth={2.25} aria-hidden="true" />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
