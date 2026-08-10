"use client";

/**
 * ShelfMock — a pure JSX/CSS recreation of the Pastiche shelf. It stands in for a
 * screenshot of the macOS app.
 *
 * INTENTIONAL EXEMPTION FROM THE "NEVER HARDCODE HEX" RULE:
 * this component depicts the app itself, whose panel is always dark and whose card
 * header strips are fixed colors baked into the app (see Theme.swift). It has to look
 * identical in the site's light and dark themes, so it deliberately does not use the
 * site's theme tokens. The values below mirror the app one-for-one:
 *   panel   #0d0d14 at 90% over a blur, 16px top radius, 1px white/10 hairline
 *   cards   200 × 240 pt (kept in proportion here), 12px radius, white/10 border
 *   headers #2E2E33 text · #1E6FEB link · #D8D8DC image · #6E56CF file ·
 *           the item's own color for color cards
 *   select  macOS accent blue #0A84FF ring on the selected card
 * Everything outside the panel (the ⇧⌘V caption, the ambient glow) uses theme tokens.
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Clipboard,
  Clock,
  Compass,
  FileCode2,
  Link2,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Shapes,
  Terminal,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Card frame: header strip + body + gradient footer with the ⌘-index chip. */
function ShelfCard({
  title,
  time,
  meta,
  index,
  headerClassName,
  iconClassName,
  icon,
  lightHeader = false,
  selected = false,
  delay,
  reduce,
  children,
}: {
  title: string;
  time: string;
  meta: string;
  index: number;
  headerClassName: string;
  iconClassName: string;
  icon: ReactNode;
  lightHeader?: boolean;
  selected?: boolean;
  delay: number;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: reduce ? 0 : delay, ease: EASE }}
      className={[
        "relative flex shrink-0 flex-col overflow-hidden rounded-[12px] bg-[#1d1d20]",
        // 200 × 240 pt in the app, kept in proportion at every breakpoint.
        "w-[128px] h-[154px] sm:w-[150px] sm:h-[180px] md:w-[158px] md:h-[190px] lg:w-[168px] lg:h-[202px]",
        selected
          ? "ring-2 ring-[#0a84ff] shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
          : "ring-1 ring-inset ring-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.45)]",
      ].join(" ")}
    >
      {/* Header strip */}
      <div
        className={`flex h-[34px] shrink-0 items-start justify-between gap-1.5 px-2 py-1.5 sm:h-10 sm:px-2.5 sm:py-2 md:h-[42px] lg:h-[46px] ${headerClassName}`}
      >
        <div className="min-w-0">
          <p
            className={`truncate text-[10.5px] font-semibold leading-tight sm:text-[12px] lg:text-[13px] ${
              lightHeader ? "text-black/80" : "text-white/95"
            }`}
          >
            {title}
          </p>
          <p
            className={`truncate text-[8.5px] leading-tight sm:text-[10px] lg:text-[11px] ${
              lightHeader ? "text-black/55" : "text-white/65"
            }`}
          >
            {time}
          </p>
        </div>
        {/* Tiny source-app icon, exactly where the app draws it */}
        <span
          className={`grid size-[15px] shrink-0 place-items-center rounded-[4px] ring-1 ring-inset ring-white/20 sm:size-[18px] sm:rounded-[5px] lg:size-[22px] lg:rounded-[6px] ${iconClassName}`}
        >
          {icon}
        </span>
      </div>

      {/* Body */}
      <div className="relative min-h-0 flex-1">{children}</div>

      {/* Footer: metadata + quick-paste index chip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-1 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-2 pb-1.5 pt-5">
        <span className="min-w-0 flex-1 truncate text-[8.5px] text-white/75 sm:text-[9.5px] lg:text-[10.5px]">
          {meta}
        </span>
        <span className="grid h-[14px] w-[16px] shrink-0 place-items-center rounded-[4px] bg-white/15 text-[8.5px] font-semibold text-white/90 sm:h-4 sm:w-[18px] sm:text-[9.5px] lg:text-[10px]">
          {index}
        </span>
      </div>
    </motion.div>
  );
}

/** A pill in the shelf's tab strip. */
function Tab({
  label,
  active = false,
  dotClassName,
  clock = false,
}: {
  label: string;
  active?: boolean;
  dotClassName?: string;
  clock?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium sm:px-2.5 sm:text-[11.5px]",
        active ? "bg-white/15 text-white/95" : "text-white/55",
      ].join(" ")}
    >
      {clock ? <Clock size={10} strokeWidth={2.5} /> : null}
      {dotClassName ? <span className={`size-[7px] rounded-full ${dotClassName}`} /> : null}
      {label}
    </span>
  );
}

export default function ShelfMock() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Floating shortcut caption — theme-aware, lives outside the app panel */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:mb-7"
      >
        <span className="flex items-center gap-1">
          <kbd className="kbd">⇧</kbd>
          <kbd className="kbd">⌘</kbd>
          <kbd className="kbd">V</kbd>
        </span>
        <span className="text-sm text-foreground/40">from anywhere — the shelf slides up</span>
      </motion.div>

      {/* Ambient glow that lifts the panel off the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 top-16 rounded-full bg-accent/20 blur-[90px]"
      />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: EASE }}
        role="img"
        aria-label="The Pastiche shelf: a translucent dark panel across the bottom of the screen with Clipboard, Snippets and Work tabs above a row of clipboard cards — a copied git command, a github.com link, an image, a violet color swatch and a file."
        className="relative select-none overflow-hidden rounded-t-2xl border border-b-0 border-white/10 bg-[#0d0d14]/90 shadow-[0_-2px_40px_rgba(0,0,0,0.35),0_30px_70px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        {/* Hairline highlight along the top edge, like the real panel */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Header: glyph, search, tab strip, add pinboard, overflow */}
        <div className="flex h-[42px] items-center gap-2 px-3 sm:h-[46px] sm:gap-2.5 sm:px-3.5">
          <Clipboard size={12} className="shrink-0 text-white/70" strokeWidth={2.25} />
          <span className="grid size-[22px] shrink-0 place-items-center rounded-full text-white/60 sm:size-[26px]">
            <Search size={12} strokeWidth={2.5} />
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden sm:gap-1.5">
            <Tab label="Clipboard" active clock />
            <Tab label="Snippets" dotClassName="bg-[#3b82f6]" />
            <Tab label="Work" dotClassName="bg-[#ef4444]" />
          </div>
          <span className="grid size-[20px] shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/55 sm:size-6">
            <Plus size={11} strokeWidth={3} />
          </span>
          <MoreHorizontal size={14} className="hidden shrink-0 text-white/55 sm:block" />
        </div>

        <div className="h-px bg-white/[0.07]" />

        {/* Card rail */}
        <div className="flex gap-2 px-3 pb-4 pt-3 sm:gap-2.5 sm:px-3.5 sm:pb-5 sm:pt-4">
          {/* 1 — copied terminal command, selected */}
          <ShelfCard
            index={1}
            title="Text"
            time="just now"
            meta="52 characters"
            headerClassName="bg-[#2e2e33]"
            iconClassName="bg-[linear-gradient(140deg,#3d4250,#1b1d24)]"
            icon={<Terminal size={10} className="text-white/80" />}
            selected
            delay={0.1}
            reduce={reduce}
          >
            <p className="break-words p-2 pb-7 font-mono text-[9px] leading-[1.55] text-white/90 sm:p-2.5 sm:pb-8 sm:text-[10px] lg:text-[11px]">
              git commit -m &quot;fix: restore focus after paste&quot;
            </p>
          </ShelfCard>

          {/* 2 — link */}
          <ShelfCard
            index={2}
            title="Link"
            time="2 min ago"
            meta="github.com"
            headerClassName="bg-[#1e6feb]"
            iconClassName="bg-[linear-gradient(140deg,#4aa9ff,#1668e3)]"
            icon={<Compass size={10} className="text-white/90" />}
            delay={0.18}
            reduce={reduce}
          >
            <div className="p-2 pb-7 sm:p-2.5 sm:pb-8">
              <div className="flex items-center gap-1.5">
                <Link2 size={10} className="shrink-0 text-[#0a84ff]" strokeWidth={2.5} />
                <span className="truncate text-[10px] font-semibold text-white/90 sm:text-[11.5px] lg:text-[12.5px]">
                  github.com
                </span>
              </div>
              <p className="mt-1.5 break-all text-[8.5px] leading-[1.5] text-white/55 sm:text-[9.5px] lg:text-[10.5px]">
                https://github.com/Prestongramberg/Pastiche
              </p>
            </div>
          </ShelfCard>

          {/* 3 — image */}
          <ShelfCard
            index={3}
            title="Image"
            time="12 min ago"
            meta="1728 × 1117"
            headerClassName="bg-[#d8d8dc]"
            iconClassName="bg-[linear-gradient(140deg,#ff8f6b,#a259ff)]"
            icon={<Shapes size={10} className="text-white/90" />}
            lightHeader
            delay={0.26}
            reduce={reduce}
          >
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#9b7bff_0%,#6144e0_42%,#2b1f74_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_18%_12%,rgba(255,255,255,0.32),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_88%_92%,rgba(34,211,238,0.38),transparent_62%)]" />
            </div>
          </ShelfCard>

          {/* 4 — color */}
          <ShelfCard
            index={4}
            title="Color"
            time="1 hr ago"
            meta="#7C5CFF"
            headerClassName="bg-[#7c5cff]"
            iconClassName="bg-[linear-gradient(140deg,#7c5cff,#22d3ee)]"
            icon={<Palette size={10} className="text-white/90" />}
            delay={0.34}
            reduce={reduce}
          >
            <div className="absolute inset-0 grid place-items-center bg-[#7c5cff]">
              <span className="pb-3 font-mono text-[10px] font-semibold text-white sm:text-[11.5px] lg:text-[13px]">
                #7C5CFF
              </span>
            </div>
          </ShelfCard>

          {/* 5 — file */}
          <ShelfCard
            index={5}
            title="File"
            time="3 hrs ago"
            meta="6 KB"
            headerClassName="bg-[#6e56cf]"
            iconClassName="bg-[linear-gradient(140deg,#8f7bff,#4a3aa8)]"
            icon={<FileCode2 size={10} className="text-white/90" />}
            delay={0.42}
            reduce={reduce}
          >
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2 pb-6">
              <FileCode2 size={26} className="text-white/80" strokeWidth={1.4} />
              <span className="max-w-full truncate text-[9px] font-medium text-white/90 sm:text-[10px] lg:text-[11.5px]">
                appcast.xml
              </span>
            </div>
          </ShelfCard>
        </div>

        {/* Right-edge fade — the rail continues past the panel, like the real shelf */}
        <span className="pointer-events-none absolute bottom-0 right-0 top-[43px] w-10 bg-gradient-to-l from-[#0d0d14]/85 to-transparent sm:top-[47px] sm:w-14" />
      </motion.div>
    </div>
  );
}
