# Pastiche site — build contract

Marketing + docs site for Pastiche (open-source macOS clipboard manager), deployed on Vercel.
Stack: Next.js 16 App Router, React 19, Tailwind 4 (`@theme` tokens in `src/app/globals.css`),
framer-motion, lucide-react. TypeScript strict. No database, no API routes, no auth.

## Already written (read these first — they define the idiom)

- `src/app/globals.css` — brand tokens. Use ONLY these semantic colors via Tailwind classes:
  `bg-midnight`, `bg-dark`, `bg-darker`, `bg-card`, `border-border`, `text-foreground`,
  `text-muted`, `text-accent`, `bg-accent`, `text-electric`, plus utilities `text-gradient`,
  `bg-gradient`, `glow`, `grid-bg`, and `kbd` (keyboard-key chip). Never hardcode hex values.
- `src/app/layout.tsx` — metadata, ThemeProvider + Navbar + Footer wrapping `main`.
- `src/components/ThemeProvider.tsx`, `ThemeToggle.tsx` — dark default, light toggle.

## Design language (mirrors grambergmedia.com — reference: ~/Documents/projects/grambergMedia/src/components, read-only)

- Sections: `max-w-6xl mx-auto px-6`, generous `py-24` rhythm, section heading pattern:
  small uppercase tracking-wide accent label, then `text-4xl md:text-5xl font-black tracking-tight`
  heading with one `text-gradient` word, then a `text-foreground/50` lede.
- framer-motion: `initial={{ opacity: 0, y: 30 }}`, `whileInView={{ opacity: 1, y: 0 }}`,
  `viewport={{ once: true }}`, staggered delays. "use client" on every animated component.
- Cards: `bg-card border border-border rounded-2xl`, hover `hover:border-foreground/20` +
  subtle lift. Gradient orbs: absolutely-positioned `bg-accent/10 rounded-full blur-[120px]`.
- CTAs: primary = `bg-gradient px-8 py-4 rounded-xl font-bold text-white glow` with lucide
  ArrowRight/Download icon; secondary = bordered ghost.
- Keyboard keys render with the `kbd` utility class: `<kbd className="kbd">⌘</kbd>`.

## Facts (source of truth: /Users/prestongramberg/Documents/projects/Pastiche/README.md — READ IT; do not invent)

- Product: Pastiche — free, open-source, local-first clipboard manager for macOS 13+.
- Repo: https://github.com/Prestongramberg/Pastiche (MIT). Releases carry a DMG + zip.
- Core: menu-bar app; global ⇧⌘V opens a slide-up bottom shelf; unlimited history; captures
  text, rich text, links, images, files, colors; pinboards (colored, named collections);
  power search (`type:text|image|link|file|color`, `app:<name>`, fuzzy terms); instant paste
  into the frontmost app (Accessibility permission); paste as plain text (⇧Return); Space
  preview; ⌘1–9 quick paste; drag & drop out of cards; privacy (concealed types ignored,
  per-app exclusions, 100% local storage); launch at login; Sparkle auto-updates (EdDSA-signed).
- Install: download DMG from GitHub Releases → drag to Applications. Unsigned build:
  right-click → Open the first time (or System Settings → Privacy & Security → Open Anyway).
  Grant Accessibility for direct paste.
- Downloads: link to https://github.com/Prestongramberg/Pastiche/releases/latest — the
  DownloadButton component also live-fetches the exact DMG URL from the GitHub API.

## File ownership map (each builder writes ONLY its files)

| module | files |
|---|---|
| chrome | `src/components/Navbar.tsx`, `src/components/Footer.tsx` |
| hero | `src/components/Hero.tsx`, `src/components/ShelfMock.tsx`, `src/components/DownloadButton.tsx` |
| sections | `src/components/Features.tsx`, `src/components/HowItWorks.tsx`, `src/components/Shortcuts.tsx`, `src/components/PowerSearch.tsx`, `src/components/FAQ.tsx`, `src/components/CTA.tsx` |
| pages | `src/app/page.tsx`, `src/app/docs/page.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` |

## Component contracts (all default exports, zero props)

- **Navbar** — client. Fixed top, blur backdrop after scroll (like grambergMedia). Left:
  `/icon-512.png` at 28px + "Pastiche" wordmark. Links: Features (`/#features`), How It Works
  (`/#how-it-works`), Shortcuts (`/#shortcuts`), Docs (`/docs`), GitHub (external,
  lucide Github icon). Right: ThemeToggle + compact Download button (bg-gradient, links to
  GitHub latest release). Mobile hamburger with slide-down menu.
- **Footer** — icon + name + one-liner; columns: Product (Features, Shortcuts, Docs, Changelog →
  GitHub releases), Project (GitHub, Report an Issue → GitHub issues/new, License → LICENSE on
  GitHub); bottom line "MIT licensed. Built by Preston Gramberg." + "All data stays on your Mac."
- **Hero** — full-viewport grid-bg with orbs. H1: "Copy once." / "Paste <text-gradient>anything</text-gradient>." /
  "Forever." Lede: limitless clipboard for macOS pitch. Primary CTA = `<DownloadButton />`,
  secondary = "View on GitHub" ghost. Under CTAs: small line "Free & open source · macOS 13+ ·
  Auto-updates built in". Below, the `<ShelfMock />` rises into view with motion.
- **ShelfMock** — pure JSX/CSS recreation of the app's shelf (this replaces screenshots):
  a dark rounded-2xl panel (always dark regardless of theme — it depicts the app) with a
  header row (search icon; pill tabs: "Clipboard" active with clock icon, "Snippets" with a
  blue dot, "Work" with a red dot, a "+"), then a horizontal row of 4–5 clipboard cards:
  text card (dark header strip "Text · just now", body lorem-ish snippet), link card (blue
  header "Link", URL body), image card (violet/indigo gradient placeholder with "1728 × 1117"
  footer), color card (solid #7C5CFF swatch with hex label), each with tiny index chips 1…4.
  Small floating `kbd` cluster ("⇧⌘V") above it. Staggered framer-motion entrance. Must look
  faithful to a real macOS bottom shelf: translucent dark, 16px top radius, subtle borders.
- **DownloadButton** — client. Renders primary CTA "Download for Mac" + Download icon.
  On mount, fetches `https://api.github.com/repos/Prestongramberg/Pastiche/releases/latest`
  (graceful: try/catch, AbortController, no key), finds the `.dmg` asset → sets href to the
  direct DMG URL and appends the version tag as small text ("v1.0.1 · 2 MB"). Fallback href:
  the releases/latest page. Never blocks render on the fetch.
- **Features** — `id="features"`. Grid (3×3 on lg) of feature cards with lucide icons:
  Unlimited history (Infinity), Instant paste (Zap), Pinboards (Pin), Power search (Search),
  Every format (Layers — text/rich/links/images/files/colors), Privacy first (ShieldCheck),
  Quick paste ⌘1–9 (Keyboard), Space previews (Eye), Auto-updates (RefreshCw).
- **HowItWorks** — `id="how-it-works"`. 3 numbered steps with connecting line: 1 "Copy like
  always" (⌘C anywhere), 2 "Summon the shelf" (⇧⌘V slides up from the bottom), 3 "Paste
  anywhere" (Return pastes into the app you're in — arrows/⌘1–9/search to pick).
- **Shortcuts** — `id="shortcuts"`. Two-column table of the keyboard map using `kbd` chips:
  ⇧⌘V toggle shelf · ← → navigate · Return paste · ⇧Return paste as plain text · Space
  preview · ⌘1–9 paste Nth · ⌘F search · Delete remove · Esc close. Plus a "Power Search"
  aside (see PowerSearch) if not separate.
- **PowerSearch** — terminal-style card showing example queries with explanations:
  `type:image`, `app:chrome`, `type:link deploy`, fuzzy "wrld → world". Copy explaining
  filters combine with fuzzy terms.
- **FAQ** — client accordion (his FAQ pattern): Is it really free? (yes, MIT, no accounts) ·
  Where is my data? (local SQLite + images under ~/Library/Application Support/Pastiche) ·
  Why the Gatekeeper warning? (unsigned open-source build; right-click → Open once; updates
  are EdDSA-verified) · Why Accessibility permission? (to press ⌘V for you; without it items
  are still copied) · Passwords? (concealed-clipboard types ignored by default + per-app
  exclusions) · How do updates work? (Sparkle checks the signed feed on GitHub) · Intel Macs?
  (Apple Silicon builds today; Intel possible via CI universal builds).
- **CTA** — closing band: gradient orbs, "Your clipboard, <text-gradient>remembered</text-gradient>.",
  DownloadButton + GitHub ghost link.

## Pages

- **page.tsx** — server component assembling: Hero, Features, HowItWorks, Shortcuts,
  PowerSearch, FAQ, CTA (no props).
- **docs/page.tsx** — server component, `export const metadata = { title: "Docs" }`. Docs,
  faithful to the README: sticky in-page section nav (simple anchor list, `top-24`); sections:
  Install (steps incl. Gatekeeper + Accessibility, each as numbered cards), Using Pastiche
  (open shelf, pick & paste, pinboards, previews, drag & drop), Power Search (syntax table),
  Settings overview (General/Privacy/Updates tabs summary), Updates (how Sparkle + the signed
  appcast work, checking manually via menu bar), Building from source (git clone, swift build,
  Scripts/build_app.sh — CLT only, no Xcode needed), Uninstall (quit app, delete
  /Applications/Pastiche.app and ~/Library/Application Support/Pastiche), Get help (GitHub
  issues). Code/steps in `bg-darker border border-border rounded-xl` blocks; kbd chips for keys.
- **robots.ts / sitemap.ts** — standard Next metadata routes; base URL from
  `process.env.NEXT_PUBLIC_SITE_URL ?? "https://pastiche-site.vercel.app"`; sitemap lists `/` and `/docs`.

## Hard rules

- TypeScript strict must pass; `next build` must succeed with zero errors.
- Accessible: semantic headings in order, alt text, focus-visible states, aria-labels on
  icon-only buttons, `prefers-reduced-motion` respected (framer-motion default is fine).
- Both themes must look right (the ShelfMock stays dark by design; everything else uses tokens).
- No AI/Claude/Anthropic mentions anywhere. No lorem ipsum in shipped copy (short realistic
  snippet text inside the ShelfMock cards is fine — use believable clipboard content).
- External links: `target="_blank" rel="noopener noreferrer"`.
