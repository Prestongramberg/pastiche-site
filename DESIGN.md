# Pastiche site redesign — "The Revival Specimen"

This document is the BINDING design contract for the rebuild. It supersedes SITE.md's design
language entirely; SITE.md remains authoritative ONLY for product facts (the "Facts" section)
and the hard rules (accessibility, honesty, no AI mentions, external-link handling).

## Thesis

Pastiche is, by name and by nature, a pastiche — an artwork that openly imitates a style.
The site presents it the way a type foundry presents a digital revival of a classic face:
a specimen. The imitation is the thesis, stated proudly, with a colophon credit to the
original. No SaaS gradients, no glow, no orbs, no feature-grid. Paper and ink.

## Why (from live research — these are measured, not vibes)

- Every clipboard-manager site is a dark/neutral SaaS page with the same hero formulas.
  An editorial paper specimen is unoccupied territory in the entire category.
- Premium tells measured on Linear/Raycast/Paste: display type at weight 400-600 (never
  800/900), line-height ~1.0 at display sizes, tracking ≈ -0.02em, near-monochrome palettes
  where hierarchy is carried by VALUE, not color.
- The current site's fatal flaw: the hero never shows the product. The new hero IS the product.

## Type system (self-host via next/font/google, latin subset, display swap)

- Display serif: **Instrument Serif** (400 + italic). The voice of the specimen.
  Display scale: `clamp(3rem, 13vw, 15rem)`, line-height 0.9, letter-spacing -0.03em.
  Wordmark "Pastiche" is Instrument Serif *italic*.
- Body/UI sans: **Instrument Sans** (variable). Body 17-18px, line-height 1.6, max measure 68ch.
  UI weights 500/600 only. NEVER 800/900 anywhere on the site.
- Metadata mono: **Geist Mono**. The credibility layer: ALL labels, timestamps, figure tags,
  section numbers, shortcut chips, spec values. 11px, uppercase, letter-spacing 0.12em,
  ~55-60% ink opacity. Figure labels like `FIG. 01 — THE SHELF` accompany every visual.
- Scale contrast is the mechanism of authority: ~10:1 between display and label sizes.

Expose as CSS vars from layout.tsx: `--font-serif`, `--font-sans`, `--font-mono`.

## Palette (Tailwind 4 @theme tokens — REPLACE the old ones wholesale)

Light ("paper", the DEFAULT theme):
- `--color-paper: #F5F1EA`  (warm paper ground)
- `--color-paper-raised: #FBF8F3` (cards/panels)
- `--color-ink: #16130E`    (text)
- `--color-ink-muted: #6E675C`
- `--color-rule: #D9D2C4`   (hairlines/borders)
- `--color-accent: #4F33E4` (violet ink — ties to the app icon; darker than the app's
  #7C5CFF for 4.5:1+ on paper)
- `--color-guide: #9FD8E8`  (non-photo blue; RARE — annotation underlines, registration marks)

Dark ("ink edition", via `:root[data-theme="dark"]`):
- paper → `#121014`, paper-raised → `#1A171E`, ink → `#F2EEE6`, ink-muted → `#8D8798`,
  rule → `#2C2833`, accent → `#9D85FF`, guide → `#5E8996`.

The theme toggle stays (moon/sun), default is PAPER (light). `::selection`: accent background,
paper text — selection is the product's trigger verb, style it deliberately.
Texture: exactly ONE — an inline SVG feTurbulence grain data-URI (<1KB), fixed, 2-3% opacity,
pointer-events-none, mix-blend multiply (light) / screen (dark). No grid. No noise PNG.
Scrollbar: `scrollbar-width: thin; scrollbar-color: var(--color-rule) transparent`.

BANNED (grep-able): linear-gradient hero fills, `glow`, blur orbs, `grid-bg`, gradient text
except NOWHERE, indigo→cyan anything, weight 900, uniform whileInView y-30 stagger on every
section. The old `text-gradient`/`bg-gradient`/`glow`/`grid-bg` utilities get DELETED from
globals.css.

## Motion

- One curve, one duration family, as CSS vars: `--ease-shelf: cubic-bezier(0.16, 1, 0.3, 1)`,
  `--dur-shelf: 320ms` (page-scale), 220ms for the shelf slide (matches the real app's
  0.22s easeOut — cite: PanelController.swift slideDuration).
- Hero first paint animates with plain CSS (no framer on the critical path); framer-motion
  hydrates scroll choreography afterward.
- `prefers-reduced-motion`: transforms become opacity-only. Never invisible content.
- Micro-interaction language: when something is copied on the page, a small ghost of it
  flies toward the shelf (single shared component). No cursor followers.

## THE device — a real, working shelf in the browser (`LiveShelf`)

Bottom-anchored, persistent across ALL routes (rendered in layout.tsx), and functional:

1. Collapsed state: a slim shelf lip pinned to the viewport bottom — Pastiche glyph,
   nav links (Specimen `/`, Docs `/docs`, GitHub, Changelog), a mono hint chip `⇧⌘V`,
   and the Download CTA (accent, solid — the ONE always-visible accent block). This lip IS
   the site's navigation; there is no top navbar. Top corners of the page keep only the
   tiny wordmark (left) and theme toggle (right), floating, unboxed.
2. Open state: pressing ⇧⌘V (preventDefault) or clicking the lip slides the full shelf up
   (220ms, --ease-shelf): a dark macOS-faithful panel (ALWAYS dark, both themes — it depicts
   the app; hex-exempt like the old ShelfMock, cite real app values from Theme.swift) with
   the tab row and a horizontal card rail. Esc closes. Body gets bottom padding so the lip
   never overlaps content.
3. IT CAPTURES REAL COPIES: a document `copy` listener — when the visitor copies anything
   on the page (⌘C on selected text, or any click-to-copy chip), the shelf captures it as
   a real typed card (text/link/color/command detected by content) with source metadata
   ("pastiche.grambergmedia.com · just now"), auto-opens briefly (~1.6s peek then retracts
   to the lip unless hovered/focused). Seed the rail with 4 believable pre-existing cards
   (git command, the repo URL, #7C5CFF swatch, appcast.xml file card) so it is never empty.
   State in sessionStorage. NO reading of the visitor's actual clipboard — never call
   navigator.clipboard.read; only the copy event's selection text. Privacy note in a tooltip:
   "captures only what you copy on this page — nothing leaves your browser."
4. Keyboard + a11y: the shelf is fully keyboard-operable (arrows move card selection, Esc
   closes, Tab reaches every control), `aria-live=polite` announces "Copied: … captured to
   shelf", focus ring per the floor rules. On touch/mobile: the lip stays as bottom nav;
   capture still works via the copy chips; ⇧⌘V hint hidden; safe-area-inset respected.

`CopyChip` primitive (shared): every copyable thing site-wide — shortcut chips, `type:`
filter examples, hexes, install commands, paths — is a real click-to-copy element rendered
in mono, with the ghost-fly-to-shelf feedback and a brief "copied" state in-place. The page
demonstrates the product's verb hundreds of times.

## Page structure — `/` (the specimen)

1. **Masthead**: mono smallcaps over-line `PASTICHE — A CLIPBOARD REVIVAL · MACOS 13+ · MIT`;
   then the giant Instrument Serif italic word **Pastiche** at clamp(3rem,13vw,15rem) —
   the word itself is the hero image, typeset like a specimen plate; beneath it the
   definition, set like a dictionary entry:
   *pas·tiche (n.) — a work that imitates the style of another, openly and with admiration.*
   Then one first-person sentence (voice of the README): "The Mac's best clipboard manager
   costs $30 a year. I rebuilt the idea — the shelf, the search, the pinboards — free,
   open-source, and entirely on your machine." Then the DownloadButton (live version + size
   from the GitHub API — keep that mechanic, restyle: solid accent block, mono metadata) and
   a quiet `View source ↗` link. Last line, small mono with a guide-blue underline:
   "Select this sentence and press ⌘C." → the LiveShelf catches it. That moment is the hero
   demo. NO product screenshot needed above the fold — the real shelf at the viewport bottom
   is the product depiction.
2. **FIG. 01 — The one-slot problem**: an interlude that dramatizes clipboard loss instead of
   asserting it. A small staged demo panel: two copyable scraps ("an address", "a hex code");
   copying the second visibly strikes through/destroys the first in a mock single-slot
   "macOS clipboard" register — while the shelf below visibly catches both. Two sentences of
   copy. This replaces every competitor's "never lose a copy again" line by making the
   visitor feel it.
3. **FIG. 02 — The clippings** (the feature tour): NOT a grid. A single-column
   reverse-chronological stack of six large typed specimen cards, each one a real clipping
   annotated in the margin (mono figure labels left, serif claim + short sans body right):
   a code snippet card → unlimited local history; a link card → power search with live
   `type:link deploy` CopyChip; an image card → every format; a color card (#7C5CFF) →
   pinboards; a file card → drag & drop + ⌘1-9; a text card → instant paste + ⇧Return plain.
   Sticky-scroll choreography: the cards stack/peel with scroll progress (framer
   useScroll), the ONE scroll-pinned scene on the page.
4. **FIG. 03 — The keyboard**: the shortcut map as a specimen table — hairline rules, dotted
   leaders, decimal section numbers (3.1, 3.2…), every combo a CopyChip kbd cluster. Power
   search syntax sits here as a sub-table with copyable examples.
5. **FIG. 04 — Provenance** (proof, not social proof): live verifiable numbers from the
   GitHub API (latest version + date + DMG size; falls back gracefully), and static true
   facts set as a spec list: binary size ~2 MB, network requests the app makes: exactly one —
   the signed update check; storage: ~/Library/Application Support/Pastiche (CopyChip);
   license: MIT. Then **Before you install** — the candid caveats block: ad-hoc signed
   (right-click → Open once), Accessibility permission for direct paste (works without it,
   you just press ⌘V yourself), Apple Silicon today.
6. **FIG. 05 — The license**: where every competitor puts the pricing table, typeset the
   actual MIT license text as a document (paper-raised panel, mono, comfortable size), with
   the one-line position claim above it: "The shelf elsewhere is $29.99 a year. The lists are
   free. Pastiche is the shelf, free." (verify phrasing stays true — no competitor names.)
7. **Colophon** (footer): set like a book colophon, three short columns in mono — the type
   credits (Instrument Serif, Instrument Sans, Geist Mono), the credit line "Pastiche is an
   open-source homage to the shelf-style clipboard managers that came before it.", built-by
   line "Designed & built by Preston Gramberg · Minnesota", GitHub / Issues / Changelog /
   Docs links, "All data stays on your Mac." NO "Your clipboard, remembered" (competitor's
   live headline). The LiveShelf lip sits below/over it as always.

## `/docs`

Keep the content architecture (it is good and accurate) but fully restyle to the specimen
system: paper ground, serif section headings (~clamp 2-3rem), mono sidebar nav and labels,
CopyChip on every command/path/shortcut, hairline rules, no cards-with-shadows. Same
LiveShelf chrome. Docs hero much smaller than the specimen masthead.

## Copy rules

Kill on sight (live on competitor sites): "Copy once. Paste anything. Forever.",
"Your clipboard, remembered.", "never lose a copy again", "supercharged", "find it
instantly", "boost your productivity", "reimagined". Voice: first-person where it is
Preston speaking, mechanical and specific everywhere else. Numbers over adjectives.
The word "pastiche" is used, defined, and owned. Credit to the original genre is explicit
and classy — never name-calling, never a comparison table.

## Metadata / share craft

- Titles: `Pastiche — the clipboard shelf, free and open-source` (home);
  template `%s · Pastiche`.
- Dynamic OG via `opengraph-image.tsx` (next/og ImageResponse) at least for `/` and `/docs`:
  render the specimen masthead (paper ground, serif "Pastiche", mono metadata line) — not a
  screenshot. 1200×630.
- SVG favicon with an embedded `prefers-color-scheme` media query (ink glyph on transparent),
  keep the existing PNG fallbacks + apple-touch-icon.
- metadataBase from NEXT_PUBLIC_SITE_URL (already set to https://pastiche.grambergmedia.com).

## Accessibility floor (blocking)

Body text ≥4.5:1 over the TEXTURED ground; focus-visible ring: 2px accent, 2px offset,
on every interactive element including CopyChips; real `<kbd>` semantics; LiveShelf fully
keyboard-operable with aria-live capture announcements; complete honest mobile layout
(shelf lip = bottom nav, no viewport-locked tricks); `prefers-reduced-motion` respected.

## Engineering rules

Stack unchanged: Next 16 App Router, Tailwind 4, framer-motion, TS strict, static output.
No new runtime deps without need (next/og is built in). `npm run build` must pass clean.
Both themes correct. Lighthouse-conscious: fonts subset via next/font, LCP is the masthead
word (text!), no layout shift on the display type (next/font metric fallbacks).
