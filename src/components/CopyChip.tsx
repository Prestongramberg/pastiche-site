"use client";

/**
 * CopyChip — the site's smallest working part.
 *
 * Every copyable thing on the site is one of these: shortcut clusters, `type:` filter
 * examples, hex values, install commands, paths. Clicking one writes to the clipboard,
 * hands the clipping to the shelf, and sends a small ghost of it flying down to the
 * shelf lip. The page demonstrates the product's verb hundreds of times.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import {
  detectKind,
  isHexColor,
  useShelfStore,
  writeClipboard,
  type CapturedItem,
} from "./ShelfContext";

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
    <button
      type="button"
      onClick={onClick}
      data-copied={copied ? "" : undefined}
      aria-label={`Copy ${text}`}
      className={[
        "group relative inline-flex max-w-full select-none items-center gap-1.5 align-middle",
        "rounded-[6px] border px-[0.4em] py-[0.15em]",
        "font-mono text-[0.8125em] leading-[1.5] tracking-[0.01em]",
        "transition-[color,border-color,background-color] duration-150",
        "cursor-pointer overflow-hidden",
        copied
          ? "border-accent/60 bg-accent/[0.07] text-accent"
          : "border-rule bg-paper-raised text-ink/85 hover:border-accent/50 hover:text-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
      ].join(" ")}
    >
      {swatch ? (
        <span
          aria-hidden="true"
          className="size-[0.85em] shrink-0 rounded-[2px] ring-1 ring-inset ring-ink/15"
          style={{ backgroundColor: text.trim() }}
        />
      ) : null}

      {/* The label keeps its box; the copied state is an overlay, so nothing reflows. */}
      <span
        className={`min-w-0 truncate transition-opacity duration-150 ${
          copied ? "opacity-0" : "opacity-100"
        }`}
      >
        {label ?? text}
      </span>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-150 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        <Check size={12} strokeWidth={2.75} className="text-accent" />
      </span>
    </button>
  );
}
