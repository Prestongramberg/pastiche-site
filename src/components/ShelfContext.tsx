"use client";

/**
 * ShelfContext — the state behind the site's live shelf.
 *
 * The shelf is a working depiction of the app: it holds a small stack of clippings,
 * it opens and closes, and it captures what the visitor copies WHILE THEY ARE ON THIS
 * PAGE. It never reads the system clipboard — there is no `navigator.clipboard.read()`
 * anywhere in this module, by design. The only capture sources are:
 *
 *   1. the document `copy` event, whose text comes from `window.getSelection()`
 *   2. an explicit `capture()` call from a <CopyChip /> the visitor clicked
 *
 * Those two must never fire for the same action, so `capture()` arms a short
 * suppression window (~150ms) that the document listener honours. Chips capture
 * themselves; organic selections are captured by the listener.
 *
 * Everything lives in sessionStorage, so it survives a route change and dies with
 * the tab.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ types -- */

export type CapturedItem = {
  kind: "text" | "link" | "color" | "command" | "file";
  content: string;
  label?: string;
};

export type ShelfKind = CapturedItem["kind"];

export type ShelfItem = {
  id: string;
  kind: ShelfKind;
  content: string;
  label?: string;
  /** epoch ms for real captures; null for the seeded sample clippings */
  capturedAt: number | null;
  /** fixed relative-time string, used by the seeded clippings */
  timeLabel?: string;
  /** right-hand fact on the card footer: "52 characters", "github.com", "6 KB" */
  meta: string;
  /** where the clipping came from: the page host, or "sample clipping" */
  source: string;
};

export type FlyOrigin = { x: number; y: number; w: number; h: number };

type Ghost = {
  id: string;
  kind: ShelfKind;
  content: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type ShelfContextValue = {
  items: ShelfItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  capture: (item: CapturedItem) => void;
  remove: (id: string) => void;
  reset: () => void;
  /** increments on every successful capture — the shelf peeks when it changes */
  captureSeq: number;
  announcement: string;
  announce: (message: string) => void;
  fly: (origin: FlyOrigin, item: { kind: ShelfKind; content: string }) => void;
  registerFlyTarget: (el: HTMLElement | null) => void;
  hydrated: boolean;
};

/* --------------------------------------------------------------- constants -- */

const STORAGE_KEY = "pastiche.shelf.v1";
const MAX_ITEMS = 24;
const MAX_STORED_CHARS = 1200;
const SUPPRESS_MS = 150;
const DEDUPE_MS = 900;

const KINDS: ReadonlySet<string> = new Set(["text", "link", "color", "command", "file"]);

/** The rail is never empty: four believable clippings, present on first paint. */
const SEED_ITEMS: ShelfItem[] = [
  {
    id: "seed-command",
    kind: "command",
    content: 'git commit -m "fix: restore focus after paste"',
    capturedAt: null,
    timeLabel: "just now",
    meta: "46 characters",
    source: "sample clipping",
  },
  {
    id: "seed-link",
    kind: "link",
    content: "https://github.com/Prestongramberg/Pastiche",
    capturedAt: null,
    timeLabel: "2 min ago",
    meta: "github.com",
    source: "sample clipping",
  },
  {
    id: "seed-color",
    kind: "color",
    content: "#7C5CFF",
    capturedAt: null,
    timeLabel: "18 min ago",
    meta: "sRGB",
    source: "sample clipping",
  },
  {
    id: "seed-file",
    kind: "file",
    content: "appcast.xml",
    capturedAt: null,
    timeLabel: "1 hr ago",
    meta: "6 KB",
    source: "sample clipping",
  },
];

/* ------------------------------------------------- copy-event suppression -- */

/**
 * Module-level because it has to be readable from a plain DOM listener and from
 * `writeClipboard()`, both of which run outside React's render cycle.
 */
let suppressUntil = 0;

/** Arm the window in which the document `copy` listener ignores events. */
export function suppressCopyEvents(ms: number = SUPPRESS_MS): void {
  suppressUntil = Date.now() + ms;
}

function copyEventSuppressed(): boolean {
  return Date.now() < suppressUntil;
}

/**
 * Write to the clipboard. Uses the async Clipboard API, falling back to a hidden
 * textarea + execCommand on browsers/contexts where it is unavailable. The fallback
 * fires a real `copy` event, which is exactly why suppression is armed first.
 */
export async function writeClipboard(text: string): Promise<boolean> {
  suppressCopyEvents(400);
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- detection -- */

const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const URL_RE = /^(?:https?:\/\/|www\.)[^\s]+$/i;
const NEWLINE_RE = /[\n\r]/;
const WHITESPACE_RUN_RE = /\s+/g;
const SHELL_RE =
  /^(?:\$\s+)?(?:sudo\s+)?(?:git|npm|npx|pnpm|yarn|brew|swift|xcrun|xcodebuild|codesign|hdiutil|defaults|open|cd|ls|mkdir|rm|cp|mv|curl|wget|chmod|ssh|scp|python3?|node|make|echo|cat|grep|killall)\b/;
const FILE_EXT_RE =
  /^[\w .()~/-]+\.(?:xml|json|swift|ts|tsx|js|jsx|md|txt|dmg|zip|pkg|png|jpe?g|gif|webp|pdf|plist|sh|yml|yaml|toml|css|html|csv|sql|log)$/i;

/** Best-effort content typing — the same five types the app tracks. */
export function detectKind(input: string): ShelfKind {
  const text = input.trim();
  if (!text) return "text";
  const singleLine = !NEWLINE_RE.test(text);

  if (singleLine && COLOR_RE.test(text)) return "color";
  if (singleLine && URL_RE.test(text)) return "link";
  if (singleLine && text.length <= 240) {
    if (text.startsWith("./") || SHELL_RE.test(text)) return "command";
    if (text.startsWith("~/") || text.startsWith("/")) return "file";
    if (FILE_EXT_RE.test(text) && !text.includes(" ")) return "file";
  }
  return "text";
}

export function kindLabel(kind: ShelfKind): string {
  switch (kind) {
    case "link":
      return "Link";
    case "color":
      return "Color";
    case "file":
      return "File";
    default:
      // The app files commands under Text, like any other string.
      return "Text";
  }
}

/** Human relative time, in the app's own phrasing. */
export function relativeTime(from: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - from) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "1 hr ago" : `${hours} hrs ago`;
}

export function shortPreview(text: string, max = 56): string {
  const flat = text.replace(WHITESPACE_RUN_RE, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function metaFor(kind: ShelfKind, content: string): string {
  if (kind === "link") {
    try {
      const url = new URL(content.startsWith("www.") ? `https://${content}` : content);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return `${content.length} characters`;
    }
  }
  if (kind === "color") return "sRGB";
  if (kind === "file") {
    const name = content.split("/").filter(Boolean).pop();
    return name && name !== content ? name : `${content.length} characters`;
  }
  const count = content.length;
  return count === 1 ? "1 character" : `${count} characters`;
}

function makeId(): string {
  return `clip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function isShelfItem(value: unknown): value is ShelfItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.kind === "string" &&
    KINDS.has(item.kind) &&
    typeof item.content === "string" &&
    typeof item.meta === "string" &&
    typeof item.source === "string" &&
    (item.capturedAt === null || typeof item.capturedAt === "number")
  );
}

/** True for pale colors, which need dark text on their header strip. */
export function isLightColor(hex: string): boolean {
  const value = hex.trim().replace("#", "");
  if (value.length !== 3 && value.length !== 6 && value.length !== 8) return false;
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function isHexColor(value: string): boolean {
  return COLOR_RE.test(value.trim());
}

/* ----------------------------------------------------------------- context -- */

const noop = () => {};

const FALLBACK: ShelfContextValue = {
  items: SEED_ITEMS,
  isOpen: false,
  open: noop,
  close: noop,
  toggle: noop,
  capture: noop,
  remove: noop,
  reset: noop,
  captureSeq: 0,
  announcement: "",
  announce: noop,
  fly: noop,
  registerFlyTarget: noop,
  hydrated: false,
};

const ShelfCtx = createContext<ShelfContextValue>(FALLBACK);

export function ShelfProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShelfItem[]>(SEED_ITEMS);
  const [isOpen, setIsOpen] = useState(false);
  const [captureSeq, setCaptureSeq] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  const reduceMotion = useReducedMotion() ?? false;
  const flyTargetRef = useRef<HTMLElement | null>(null);
  const lastCaptureRef = useRef<{ content: string; at: number }>({ content: "", at: 0 });

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const announce = useCallback((message: string) => {
    // Re-announce identical text by nudging it with a trailing space.
    setAnnouncement((prev) => (prev === message ? `${message} ` : message));
  }, []);

  const registerFlyTarget = useCallback((el: HTMLElement | null) => {
    flyTargetRef.current = el;
  }, []);

  const removeGhost = useCallback((id: string) => {
    setGhosts((list) => list.filter((g) => g.id !== id));
  }, []);

  /** The shared micro-animation: a small ghost of the clipping flies to the shelf. */
  const fly = useCallback(
    (origin: FlyOrigin, item: { kind: ShelfKind; content: string }) => {
      if (reduceMotion || typeof window === "undefined") return;
      const target = flyTargetRef.current?.getBoundingClientRect();
      const to = target
        ? { x: target.left + target.width / 2 - 42, y: target.top + target.height / 2 - 12 }
        : { x: window.innerWidth / 2 - 42, y: window.innerHeight - 40 };
      const ghost: Ghost = {
        id: makeId(),
        kind: item.kind,
        content: item.content,
        from: { x: origin.x, y: origin.y },
        to,
      };
      setGhosts((list) => [...list.slice(-4), ghost]);
    },
    [reduceMotion],
  );

  const capture = useCallback(
    (input: CapturedItem) => {
      // Chips capture themselves; keep the document listener from doubling up.
      suppressCopyEvents();

      const content = input.content.trim();
      if (!content) return;

      const now = Date.now();
      const last = lastCaptureRef.current;
      if (last.content === content && now - last.at < DEDUPE_MS) return;
      lastCaptureRef.current = { content, at: now };

      const kind = input.kind;
      const source =
        typeof window !== "undefined" ? window.location.hostname || "this page" : "this page";

      const item: ShelfItem = {
        id: makeId(),
        kind,
        content: content.length > 5000 ? `${content.slice(0, 5000)}…` : content,
        label: input.label,
        capturedAt: now,
        meta: metaFor(kind, content),
        source,
      };

      setItems((list) =>
        [item, ...list.filter((existing) => existing.content !== content)].slice(0, MAX_ITEMS),
      );
      setCaptureSeq((n) => n + 1);
      announce(`Copied: ${shortPreview(content)} — captured to shelf`);
    },
    [announce],
  );

  const remove = useCallback((id: string) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems(SEED_ITEMS);
    lastCaptureRef.current = { content: "", at: 0 };
    announce("Shelf cleared");
  }, [announce]);

  /* -------------------------------------------------- real capture, step 1 -- */
  /* The visitor selects something on this page and presses ⌘C. That is all we
     ever see: the selection's own text. No clipboard read, ever.               */
  useEffect(() => {
    const onCopy = () => {
      if (copyEventSuppressed()) return;
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString();
      if (!text.trim()) return;

      let origin: FlyOrigin | null = null;
      try {
        if (selection.rangeCount > 0) {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            origin = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
          }
        }
      } catch {
        origin = null;
      }

      const kind = detectKind(text);
      capture({ kind, content: text });
      if (origin) fly(origin, { kind, content: text });
    };

    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, [capture, fly]);

  /* ------------------------------------------------------------ persistence -- */
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const restored = parsed.filter(isShelfItem).slice(0, MAX_ITEMS);
          if (restored.length > 0) setItems(restored);
        }
      }
    } catch {
      /* private mode, quota, corrupt payload — the seeds are a fine fallback */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = items.map((item) => ({
        ...item,
        content:
          item.content.length > MAX_STORED_CHARS
            ? `${item.content.slice(0, MAX_STORED_CHARS)}…`
            : item.content,
      }));
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* nothing here is worth breaking a render over */
    }
  }, [items, hydrated]);

  const value = useMemo<ShelfContextValue>(
    () => ({
      items,
      isOpen,
      open,
      close,
      toggle,
      capture,
      remove,
      reset,
      captureSeq,
      announcement,
      announce,
      fly,
      registerFlyTarget,
      hydrated,
    }),
    [
      items,
      isOpen,
      open,
      close,
      toggle,
      capture,
      remove,
      reset,
      captureSeq,
      announcement,
      announce,
      fly,
      registerFlyTarget,
      hydrated,
    ],
  );

  return (
    <ShelfCtx.Provider value={value}>
      {children}
      <GhostLayer ghosts={ghosts} onDone={removeGhost} />
    </ShelfCtx.Provider>
  );
}

/* ------------------------------------------------------------------ hooks -- */

/**
 * Public surface, used across the site.
 * Outside a provider this degrades to no-ops rather than throwing, so a stray
 * <CopyChip /> still copies.
 */
export function useShelf(): {
  capture: (item: CapturedItem) => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
} {
  const ctx = useContext(ShelfCtx);
  return useMemo(
    () => ({ capture: ctx.capture, open: ctx.open, close: ctx.close, isOpen: ctx.isOpen }),
    [ctx.capture, ctx.open, ctx.close, ctx.isOpen],
  );
}

/** Everything else — internal to the live-shelf module. */
export function useShelfStore(): ShelfContextValue {
  return useContext(ShelfCtx);
}

/* ------------------------------------------------------------ ghost layer -- */

const GHOST_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GhostLayer({ ghosts, onDone }: { ghosts: Ghost[]; onDone: (id: string) => void }) {
  if (ghosts.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {ghosts.map((ghost) => (
        <motion.span
          key={ghost.id}
          initial={{ x: ghost.from.x, y: ghost.from.y, opacity: 0.95, scale: 1 }}
          animate={{ x: ghost.to.x, y: ghost.to.y, opacity: 0, scale: 0.55 }}
          transition={{ duration: 0.52, ease: GHOST_EASE }}
          onAnimationComplete={() => onDone(ghost.id)}
          className="absolute left-0 top-0 inline-flex max-w-[13rem] items-center gap-1.5 rounded-[6px] border border-rule bg-paper-raised px-2 py-1 font-mono text-[11px] text-ink/80 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {ghost.kind === "color" && isHexColor(ghost.content) ? (
            <span
              className="size-3 shrink-0 rounded-[3px] ring-1 ring-inset ring-ink/15"
              style={{ backgroundColor: ghost.content.trim() }}
            />
          ) : (
            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
          )}
          <span className="truncate">{shortPreview(ghost.content, 22)}</span>
        </motion.span>
      ))}
    </div>
  );
}
