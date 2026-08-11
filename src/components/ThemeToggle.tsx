"use client";

import { useTheme } from "./ThemeProvider";

/**
 * Paper ⇄ ink edition switch.
 *
 * The glyph and label are swapped in CSS (`.theme-paper-only` /
 * `.theme-ink-only` keyed off `:root[data-theme]`), not from React state, so the
 * control is already correct on first paint and can never hydrate mismatched.
 * The accessible name is therefore deliberately static.
 */
export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch color theme between the paper and ink editions"
      title="Paper / ink edition"
      className="group relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-rule bg-transparent px-2.5 text-ink-muted transition-colors duration-200 ease-shelf before:absolute before:-inset-1.5 before:content-[''] hover:border-ink/30 hover:text-ink"
    >
      {/* Moon → go to the ink edition (shown while on paper) */}
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="theme-paper-only shrink-0"
      >
        <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.6 6.6 0 0 0 10.7 10.7Z" />
      </svg>

      {/* Sun → go back to paper (shown while on ink) */}
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="theme-ink-only shrink-0"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M6 18l-1.4 1.4M19.4 4.6L18 6" />
      </svg>

      <span
        aria-hidden="true"
        className="hidden font-mono text-[10px] font-medium uppercase leading-none tracking-[0.14em] sm:inline"
      >
        <span className="theme-paper-only">Ink</span>
        <span className="theme-ink-only">Paper</span>
      </span>
    </button>
  );
}
