"use client";

/**
 * CopyChip — the site's smallest working part.
 *
 * Every copyable thing on the site is one of these: shortcut clusters, `type:` filter
 * examples, hex values, install commands, paths. Clicking one writes to the clipboard,
 * hands the clipping to the shelf, and sends a small ghost of it flying down to the
 * shelf lip. The page demonstrates the product's verb hundreds of times.
 *
 * Motion: the chip presses like a key (one spring, 2-3% of travel), and the copied
 * state arrives as an ink wash wiped across the chip with clip-path — a stamp landing,
 * not a colour fade. Both are transform/opacity/clip-path only, and both collapse to
 * a plain state change under `prefers-reduced-motion`.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import {
  detectKind,
  isHexColor,
  useShelfStore,
  writeClipboard,
  type CapturedItem,
} from "./ShelfContext";

/** The one spring for physical elements on this site. */
const SPECIMEN_SPRING = {
  type: "spring",
  stiffness: 340,
  damping: 30,
  mass: 0.9,
} as const;

const EASE_SHELF: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Wiped in from the left; parked collapsed against the left edge when idle. */
const WASH_HIDDEN = "inset(0% 100% 0% 0%)";
const WASH_SHOWN = "inset(0% 0% 0% 0%)";

export default function CopyChip({
  text,
  label,
  kind,
}: {
  text: string;
  label?: ReactNode;
  kind?: CapturedItem["kind"];
}) {
  const { capture, fly } = useShelfStore();
  const reduceMotion = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const onClick = useCallback(
    async (event: ReactMouseEvent<HTMLButtonElement>) => {
      // Read the geometry before awaiting — currentTarget is gone after the tick.
      const rect = event.currentTarget.getBoundingClientRect();
      const resolvedKind = kind ?? detectKind(text);

      const ok = await writeClipboard(text);
      if (!ok) return;

      capture({
        kind: resolvedKind,
        content: text,
        label: typeof label === "string" ? label : undefined,
      });
      fly(
        { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
        { kind: resolvedKind, content: text },
      );

      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1300);
    },
    [capture, fly, kind, label, text],
  );

  const swatch = isHexColor(text) && (kind === undefined || kind === "color");

  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-copied={copied ? "" : undefined}
      aria-label={`Copy ${text}`}
      whileTap={reduceMotion ? undefined : { scale: 0.965 }}
      transition={SPECIMEN_SPRING}
      className={[
        "group relative inline-flex max-w-full select-none items-center gap-1.5 align-middle",
        "rounded-[6px] border px-[0.4em] py-[0.15em]",
        "font-mono text-[0.8125em] leading-[1.5] tracking-[0.01em]",
        "transition-[color,border-color] duration-150",
        "cursor-pointer overflow-hidden",
        copied
          ? "border-accent/60 text-accent"
          : "border-rule bg-paper-raised text-ink/85 hover:border-accent/50 hover:text-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      ].join(" ")}
    >
      {/* The ink wash: wiped across on copy, faded out on release. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-accent/[0.09]"
        initial={false}
        animate={
          copied
            ? { clipPath: WASH_SHOWN, opacity: 1 }
            : { clipPath: WASH_HIDDEN, opacity: 0 }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : copied
              ? {
                  clipPath: { duration: 0.26, ease: EASE_SHELF },
                  opacity: { duration: 0.08 },
                }
              : {
                  clipPath: { duration: 0, delay: 0.2 },
                  opacity: { duration: 0.2, ease: EASE_SHELF },
                }
        }
      />

      {swatch ? (
        <span
          aria-hidden="true"
          className="relative z-10 size-[0.85em] shrink-0 rounded-[2px] ring-1 ring-inset ring-ink/15"
          style={{ backgroundColor: text.trim() }}
        />
      ) : null}

      {/* The label keeps its box; the copied state is an overlay, so nothing reflows. */}
      <span
        className={`relative z-10 min-w-0 truncate transition-opacity duration-150 ${
          copied ? "opacity-0" : "opacity-100"
        }`}
      >
        {label ?? text}
      </span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        initial={false}
        animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0.72 }}
        transition={
          reduceMotion ? { duration: 0 } : { ...SPECIMEN_SPRING, opacity: { duration: 0.12 } }
        }
      >
        <Check size={12} strokeWidth={2.75} className="text-accent" />
      </motion.span>
    </motion.button>
  );
}
