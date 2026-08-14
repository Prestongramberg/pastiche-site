# pastiche.grambergmedia.com

The marketing and documentation site for [Pastiche](https://github.com/Prestongramberg/Pastiche) —
a free, open-source clipboard manager for macOS.

**Live:** [pastiche.grambergmedia.com](https://pastiche.grambergmedia.com)

## The idea

Pastiche is a revival of the shelf-style clipboard manager, so the site is built as a **type
specimen** — the way a foundry presents a revival of a classic typeface. Paper and ink, an
editorial serif masthead, mono metadata, hairline rules. No gradients, no feature-card grid.

The signature device is a **working clipboard shelf docked to the bottom of the browser.** It is
the site's navigation, and it actually works: select any text on the page and press
<kbd>⌘</kbd><kbd>C</kbd> and the shelf catches your clipping as a real card. <kbd>⇧</kbd><kbd>⌘</kbd><kbd>V</kbd>
opens it, arrow keys move between cards, <kbd>Esc</kbd> closes it. It only ever sees what you copy
on the page — nothing is read from your system clipboard and nothing leaves the browser.

A few other deliberate choices: the MIT license is typeset where a commercial product would put its
pricing table, the download button reads the real version and file size from the GitHub Releases
API, and the install caveats (ad-hoc signing, Accessibility permission) are stated plainly instead
of hidden.

## Stack

- **Next.js 16** (App Router, fully static export) + **React 19**
- **Tailwind CSS 4** — design tokens live in `src/app/globals.css`
- **framer-motion** for the scroll choreography and shelf physics
- **Instrument Serif / Instrument Sans / Geist Mono** via `next/font`
- Deployed on **Vercel**

Two editions ship: **ink** (dark, the default) and **paper** (light), toggled in the top-right.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Layout

```
src/app/          routes: / and /docs, dynamic OG images, sitemap, robots
src/components/   LiveShelf + ShelfContext (the shelf), CopyChip, and the specimen sections
DESIGN.md         the binding design spec for the specimen art direction
SITE.md           product facts and content contract
```

`DESIGN.md` is worth reading before changing anything visual — it documents the palette, the type
scale, the motion vocabulary, and the rules the design holds itself to.

## Notes

- `globals.css` uses `@theme static`. The `static` keyword is load-bearing: without it Tailwind 4
  prunes theme variables that no compiled utility happens to reference, which silently breaks
  anything reading a token through a raw `var(--…)`.
- The shelf panel's interior is the one place hex values are allowed — it depicts the macOS app, so
  it matches the app's real colors in both editions.

## License

MIT © 2026 Preston Gramberg

Designed and built by [Gramberg Media](https://grambergmedia.com).
