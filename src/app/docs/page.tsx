import type { Metadata } from "next";
import type { ReactNode } from "react";

import CopyChip from "@/components/CopyChip";
import DownloadButton from "@/components/DownloadButton";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install Pastiche, learn the nine keystrokes, read the power-search syntax, and see exactly where the data lives — every command, path, and permission step as the app ships them.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentation",
    description:
      "Install, shortcuts, power search, settings, updates, building from source, and uninstalling — matched to the shipping app.",
    url: "/docs",
    type: "article",
  },
};

const REPO = "https://github.com/Prestongramberg/Pastiche";
const RELEASES = `${REPO}/releases/latest`;
const ISSUES = `${REPO}/issues/new`;
const CHANGELOG = `${REPO}/blob/main/CHANGELOG.md`;
const APPCAST = `${REPO}/blob/main/appcast.xml`;

/* -------------------------------------------------------------------------- */
/*  Shared type treatments                                                     */
/* -------------------------------------------------------------------------- */

/** The credibility layer: 11px mono, uppercase, wide tracking. */
const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

type NavItem = { n: string; id: string; label: string };

const NAV: NavItem[] = [
  { n: "01", id: "install", label: "Install" },
  { n: "02", id: "using", label: "Using Pastiche" },
  { n: "03", id: "power-search", label: "Power search" },
  { n: "04", id: "settings", label: "Settings" },
  { n: "05", id: "updates", label: "Updates" },
  { n: "06", id: "build", label: "Build from source" },
  { n: "07", id: "uninstall", label: "Uninstall" },
  { n: "08", id: "help", label: "Get help" },
];

type Shortcut = { keys: string[][]; separator?: string; action: string };

const SHORTCUTS: Shortcut[] = [
  {
    keys: [["⇧", "⌘", "V"]],
    action: "Toggle the shelf — works anywhere, and is re-bindable in Settings",
  },
  { keys: [["←"], ["→"]], separator: "/", action: "Move the selection" },
  { keys: [["Return"]], action: "Paste the selected item into the app you came from" },
  { keys: [["⇧", "Return"]], action: "Paste the selected item as plain text" },
  { keys: [["Space"]], action: "Toggle the large preview" },
  {
    keys: [
      ["⌘", "1"],
      ["⌘", "9"],
    ],
    separator: "…",
    action: "Paste the 1st … 9th visible card",
  },
  { keys: [["⌘", "F"]], action: "Focus the search field — typing anywhere also focuses it" },
  { keys: [["Delete"]], action: "Delete the selected item" },
  { keys: [["Esc"]], action: "Close the preview → clear the search → hide the shelf" },
];

const SEARCH_TOKENS: { token: string; matches: string }[] = [
  { token: "type:text", matches: "Text and rich-text clippings" },
  { token: "type:image", matches: "Images" },
  { token: "type:link", matches: "Links" },
  { token: "type:file", matches: "Files" },
  { token: "type:color", matches: "Colors" },
  {
    token: "app:<fragment>",
    matches: "Items copied from an app whose name or bundle id contains the fragment",
  },
];

const SEARCH_EXAMPLES: { query: string; means: string }[] = [
  { query: "type:link github", means: 'links mentioning "github"' },
  { query: "app:xcode type:text", means: "text copied out of Xcode" },
  { query: "app:com.apple.Safari", means: "everything grabbed from Safari" },
  { query: "#ff", means: 'colors (and anything else) containing "#ff"' },
];

const CAPTURED = ["Plain text", "Rich text", "Links", "Images", "Files", "Colors"];

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                            */
/* -------------------------------------------------------------------------- */

/** A copyable keystroke cluster: real <kbd> semantics inside a CopyChip. */
function Combo({ keys }: { keys: string[] }) {
  const spaced = keys.some((key) => key.length > 1);
  return (
    <CopyChip
      text={keys.join(spaced ? " " : "")}
      kind="text"
      label={
        <span className="inline-flex items-center gap-1">
          {keys.map((key, index) => (
            <kbd key={`${key}-${index}`} className="kbd">
              {key}
            </kbd>
          ))}
        </span>
      }
    />
  );
}

function Combos({ keys, separator }: { keys: string[][]; separator?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {keys.map((chord, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 && separator ? (
            <span aria-hidden="true" className="text-ink-muted text-sm">
              {separator}
            </span>
          ) : null}
          <Combo keys={chord} />
        </span>
      ))}
    </span>
  );
}

/** Inline mono for identifiers that are not worth copying (API names, file suffixes). */
function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="border-rule text-ink border-b border-dotted font-mono text-[0.88em] break-words">
      {children}
    </code>
  );
}

/** Emphasis inside body copy — value, not weight. Never above 600. */
function UI({ children }: { children: ReactNode }) {
  return <strong className="text-ink font-medium">{children}</strong>;
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent decoration-accent/35 hover:decoration-accent focus-visible:outline-accent rounded-xs underline decoration-1 underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

function Section({
  n,
  id,
  label,
  title,
  lede,
  children,
}: {
  n: string;
  id: string;
  label: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="border-rule flex items-baseline gap-4 border-b pb-3">
        <span className={LABEL}>§ {n}</span>
        <span className={LABEL}>{label}</span>
      </div>
      <h2 className="font-serif text-ink mt-7 text-[clamp(2rem,4.5vw,3rem)] leading-[1.04] tracking-[-0.025em]">
        {title}
      </h2>
      {lede ? (
        <p className="text-ink-muted mt-5 max-w-[62ch] text-[17px] leading-[1.6]">{lede}</p>
      ) : null}
      <div className="mt-10 space-y-9">{children}</div>
    </section>
  );
}

/**
 * The specimen annotation block: mono label in the margin, serif claim + sans body
 * in the column. Hairline top rule instead of a shadowed card.
 */
function Block({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <div className="border-rule grid gap-x-8 gap-y-3 border-t pt-6 md:grid-cols-[9rem_minmax(0,1fr)]">
      <p className={`${LABEL} md:pt-2`}>{label}</p>
      <div className="min-w-0">
        <h3 className="font-serif text-ink text-[1.45rem] leading-snug tracking-[-0.015em]">
          {title}
        </h3>
        <div className="text-ink-muted mt-3 space-y-3 text-[16px] leading-[1.65]">{children}</div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <li className="border-rule grid gap-x-8 gap-y-3 border-t pt-6 md:grid-cols-[9rem_minmax(0,1fr)]">
      <p className={`${LABEL} md:pt-2`}>Step {n}</p>
      <div className="min-w-0">
        <h3 className="font-serif text-ink text-[1.45rem] leading-snug tracking-[-0.015em]">
          {title}
        </h3>
        <div className="text-ink-muted mt-3 space-y-3 text-[16px] leading-[1.65]">{children}</div>
      </div>
    </li>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-guide text-ink-muted border-l-2 py-1 pl-4 text-[15px] leading-[1.65]">
      {children}
    </p>
  );
}

/** A terminal transcript where every line is individually copyable. */
function CommandBlock({
  label,
  lines,
}: {
  label: string;
  lines: { comment?: string; command: string }[];
}) {
  return (
    <div className="border-rule bg-paper-raised border">
      <div className="border-rule border-b px-4 py-2.5">
        <span className={LABEL}>{label}</span>
      </div>
      <div className="space-y-4 p-4">
        {lines.map((line) => (
          <div key={line.command} className="space-y-1.5">
            {line.comment ? (
              <p className="text-ink-muted font-mono text-[12px] leading-relaxed">
                # {line.comment}
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <CopyChip text={line.command} kind="command" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavList({ layout = "column" }: { layout?: "column" | "grid" }) {
  return (
    <ol className={layout === "grid" ? "grid grid-cols-1 gap-px sm:grid-cols-2" : "space-y-px"}>
      {NAV.map(({ n, id, label }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="text-ink-muted hover:text-ink focus-visible:outline-accent group flex items-baseline gap-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span className="font-mono text-[11px] tracking-[0.12em] tabular-nums">{n}</span>
            <span className="group-hover:decoration-ink/30 text-[13px] underline decoration-transparent decoration-1 underline-offset-4 transition-colors">
              {label}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DocsPage() {
  return (
    <div id="top">
      {/* ------------------------------------------------------------------ */}
      {/* Masthead — deliberately a fraction of the specimen plate on "/"     */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-rule border-b">
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-14 md:pt-28 md:pb-16">
          <p className={LABEL}>Pastiche — Documentation · macOS 13+ · MIT</p>

          <h1 className="font-serif text-ink mt-6 text-[clamp(2.75rem,8vw,5rem)] leading-[0.95] tracking-[-0.03em]">
            Documentation
          </h1>

          <p className="text-ink-muted mt-6 max-w-[58ch] text-[17px] leading-[1.6]">
            Install takes about a minute and the whole app is nine keystrokes. Every command, path,
            and permission step below matches the shipping build — and every one of them is
            click-to-copy.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <DownloadButton />
            <Link href={REPO}>View source</Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-16">
              <p className={`${LABEL} border-rule border-b pb-3`}>Contents</p>
              <div className="mt-4">
                <NavList />
              </div>
            </nav>
          </aside>

          {/* Sidebar — mobile */}
          <nav aria-label="On this page" className="border-rule mb-16 border-y py-4 lg:hidden">
            <p className={`${LABEL} pb-2`}>Contents</p>
            <NavList layout="grid" />
          </nav>

          {/* Content */}
          <div className="min-w-0 space-y-24 md:space-y-28">
            {/* ========================= 01 · INSTALL ====================== */}
            <Section
              n="01"
              id="install"
              label="Install"
              title="From download to first paste"
              lede="Pastiche ships as a disk image on GitHub Releases. There is no installer, no account, and no license key — drag it in and press the hotkey."
            >
              <ol className="space-y-9">
                <Step n="1" title="Download the disk image">
                  <p>
                    Grab the latest <Mono>Pastiche-&lt;version&gt;.dmg</Mono> from{" "}
                    <Link href={RELEASES}>GitHub Releases</Link>. Every release also carries a{" "}
                    <Mono>.zip</Mono> of the same build — that one is what the auto-updater
                    downloads.
                  </p>
                </Step>
                <Step n="2" title="Drag Pastiche into Applications">
                  <p>
                    Open the DMG and drag <UI>Pastiche</UI> onto the <UI>Applications</UI> shortcut
                    inside the window. Then eject the disk image.
                  </p>
                </Step>
                <Step n="3" title="Launch it and press the hotkey">
                  <p>
                    Pastiche is a menu-bar app — no Dock icon, no main window. A clipboard glyph
                    appears in the menu bar; press <Combo keys={["⇧", "⌘", "V"]} /> and the shelf
                    slides up from the bottom of whichever screen your mouse is on.
                  </p>
                </Step>
              </ol>

              <Block label="First launch" title="Gatekeeper">
                <p>
                  Release builds are ad-hoc signed rather than Developer ID notarized, so macOS
                  refuses the first double-click with{" "}
                  <em className="text-ink not-italic">
                    “Pastiche cannot be opened because the developer cannot be verified.”
                  </em>{" "}
                  Do either of these once:
                </p>
                <ul className="marker:text-accent/60 list-disc space-y-2 pl-5">
                  <li>
                    Right-click (or Control-click) <UI>Pastiche.app</UI> → <UI>Open</UI> →{" "}
                    <UI>Open</UI> in the dialog, or
                  </li>
                  <li>
                    open <UI>System Settings</UI> → <UI>Privacy &amp; Security</UI>, scroll to the
                    message about Pastiche, and click <UI>Open Anyway</UI>.
                  </li>
                </ul>
                <p>You only need to do this once per installed version.</p>
              </Block>

              <Block label="Permission" title="Accessibility">
                <p>
                  Pastiche pastes by synthesizing a <Combo keys={["⌘", "V"]} /> keystroke into the
                  app you were last using, and macOS only lets trusted apps post keyboard events. On
                  first launch Pastiche asks for Accessibility access — approve it in{" "}
                  <UI>System Settings</UI> → <UI>Privacy &amp; Security</UI> → <UI>Accessibility</UI>
                  .
                </p>
                <p>
                  Without it Pastiche still works: selecting a card copies it to the system
                  clipboard, you just press <Combo keys={["⌘", "V"]} /> yourself. Nothing else in
                  the app reads other applications’ contents.
                </p>
                <Note>
                  Declined the prompt by accident? The request re-arms — flip Pastiche off and on in
                  the Accessibility list, or trigger a paste again, and direct paste recovers.
                </Note>
              </Block>
            </Section>

            {/* ========================== 02 · USING ======================= */}
            <Section
              n="02"
              id="using"
              label="Using Pastiche"
              title="The shelf, end to end"
              lede="Copy the way you always have. Pastiche records every clipping in the background and hands it back when you summon the shelf."
            >
              <Block label="2.1" title="Open the shelf">
                <p>
                  Press <Combo keys={["⇧", "⌘", "V"]} /> from any app, or choose{" "}
                  <UI>Open Pastiche</UI> from the menu-bar icon. The panel appears on the screen
                  holding the mouse and closes again with the same hotkey,{" "}
                  <Combo keys={["Esc"]} />, or by switching apps.
                </p>
              </Block>

              <Block label="2.2" title="Pick and paste">
                <p>
                  Move with <Combo keys={["←"]} /> <Combo keys={["→"]} />, then{" "}
                  <Combo keys={["Return"]} /> to paste into the app you came from.{" "}
                  <Combo keys={["⇧", "Return"]} /> pastes as plain text, and{" "}
                  <Combo keys={["⌘", "1"]} />–<Combo keys={["⌘", "9"]} /> fire the numbered cards
                  without moving the selection.
                </p>
                <p>
                  Right-click any card for <UI>Paste</UI>, <UI>Paste as Plain Text</UI>,{" "}
                  <UI>Copy</UI>, <UI>Add to Pinboard</UI>, and <UI>Delete</UI>.
                </p>
              </Block>

              <Block label="2.3" title="Pinboards">
                <p>
                  The tabs across the top of the shelf are <UI>Clipboard</UI> plus your pinboards —
                  named, color-coded boards for the snippets you reuse. Hit <UI>+</UI> to create
                  one, then drag a card onto a tab, or use <UI>Add to Pinboard</UI>.
                </p>
                <p>
                  Adding an item to a board saves a copy, so your history is untouched. Right-click
                  a tab to rename, recolor, or delete it — deleting a board removes only the copies
                  saved on it.
                </p>
              </Block>

              <Block label="2.4" title="Previews">
                <p>
                  Press <Combo keys={["Space"]} /> to toggle the large preview of the selected card:
                  full text, images fitted to the panel, openable links, file lists, and color
                  swatches. <Combo keys={["Space"]} /> or <Combo keys={["Esc"]} /> closes it again.
                </p>
              </Block>

              <Block label="2.5" title="Drag and drop">
                <p>
                  Drag any card straight out of the shelf and into another app — a document, a
                  Finder window, a chat box. Files and images carry their real contents, not just a
                  text stand-in.
                </p>
              </Block>

              <Block label="2.6" title="Pause capture">
                <p>
                  Choose <UI>Pause Clipboard History</UI> from the menu-bar icon to stop recording
                  entirely until you turn it back on — useful when you are about to move something
                  you would rather not keep.
                </p>
              </Block>

              <Block label="2.7" title="What Pastiche captures">
                <p>
                  Each kind of clipping gets its own card layout, a source-app badge, and a relative
                  timestamp. Rich text keeps its RTF and HTML styling; images are stored as PNGs
                  with thumbnails alongside.
                </p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  {CAPTURED.map((kind) => (
                    <li key={kind} className={LABEL}>
                      {kind}
                    </li>
                  ))}
                </ul>
              </Block>

              {/* Keyboard reference */}
              <div className="border-rule border-t pt-6">
                <p className={LABEL}>2.8 — Keyboard reference</p>
                <h3 className="font-serif text-ink mt-3 text-[1.45rem] leading-snug tracking-[-0.015em]">
                  Nine keystrokes, whole app
                </h3>
                <p className="text-ink-muted mt-3 max-w-[58ch] text-[16px] leading-[1.65]">
                  Everything below works while the shelf is open, except the global toggle. Click
                  any combination to copy it.
                </p>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[26rem] border-collapse text-left">
                    <caption className="sr-only">Pastiche keyboard shortcuts</caption>
                    <thead>
                      <tr className="border-rule border-b">
                        <th scope="col" className={`${LABEL} py-2.5 pr-6 font-normal`}>
                          Shortcut
                        </th>
                        <th scope="col" className={`${LABEL} py-2.5 font-normal`}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHORTCUTS.map((row) => (
                        <tr key={row.action} className="border-rule/70 border-b last:border-b-0">
                          <th
                            scope="row"
                            className="py-3.5 pr-6 align-baseline font-normal whitespace-nowrap"
                          >
                            <Combos keys={row.keys} separator={row.separator} />
                          </th>
                          <td className="text-ink-muted py-3.5 align-baseline text-[15px] leading-[1.6]">
                            {row.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            {/* ======================= 03 · POWER SEARCH =================== */}
            <Section
              n="03"
              id="power-search"
              label="Power search"
              title="Two filter tokens and fuzzy text"
              lede="Start typing with the shelf open — the search field takes focus automatically. Bare words fuzzy-match item text, URLs, hex codes, file names, and the app a clipping came from, ranked best-first."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[26rem] border-collapse text-left">
                  <caption className="sr-only">Power search filter tokens</caption>
                  <thead>
                    <tr className="border-rule border-b">
                      <th scope="col" className={`${LABEL} py-2.5 pr-6 font-normal`}>
                        Token
                      </th>
                      <th scope="col" className={`${LABEL} py-2.5 font-normal`}>
                        Matches
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SEARCH_TOKENS.map((row) => (
                      <tr key={row.token} className="border-rule/70 border-b last:border-b-0">
                        <th
                          scope="row"
                          className="py-3.5 pr-6 align-baseline font-normal whitespace-nowrap"
                        >
                          <CopyChip text={row.token} kind="command" />
                        </th>
                        <td className="text-ink-muted py-3.5 align-baseline text-[15px] leading-[1.6]">
                          {row.matches}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-rule border-t pt-6">
                <p className={LABEL}>3.1 — Combining</p>
                <h3 className="font-serif text-ink mt-3 text-[1.45rem] leading-snug tracking-[-0.015em]">
                  Tokens stack with each other and with free text
                </h3>
                <ul className="mt-5 space-y-4">
                  {SEARCH_EXAMPLES.map((example) => (
                    <li
                      key={example.query}
                      className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5"
                    >
                      <span className="shrink-0">
                        <CopyChip text={example.query} kind="command" />
                      </span>
                      <span className="text-ink-muted text-[15px] leading-[1.6]">
                        {example.means}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Note>
                Fuzzy matching is forgiving about typos — searching <Mono>wrld</Mono> still surfaces
                the clipping containing “world”. Press <Combo keys={["⌘", "F"]} /> to jump back to
                the field, and <Combo keys={["Esc"]} /> to clear it.
              </Note>
            </Section>

            {/* ========================= 04 · SETTINGS ===================== */}
            <Section
              n="04"
              id="settings"
              label="Settings"
              title="Four tabs, stored locally"
              lede="Open Settings… from the menu-bar icon in the top-right of the screen. Every preference is stored on this Mac, alongside your history."
            >
              <Block label="4.1" title="General">
                <ul className="marker:text-accent/60 list-disc space-y-2 pl-5">
                  <li>
                    <UI>Launch Pastiche at login</UI> — backed by <Mono>SMAppService</Mono>; the
                    toggle verifies the real system state and reverts if registration fails.
                  </li>
                  <li>
                    <UI>Global shortcut</UI> — record a new combination for the shelf. It needs at
                    least one of <Combo keys={["⌘"]} /> <Combo keys={["⌃"]} /> <Combo keys={["⌥"]} />
                    ; a combination the system rejects reverts to the previous one.
                  </li>
                  <li>
                    <UI>Keep history</UI> — Unlimited (the default), or cap at 100 / 500 / 1,000 /
                    5,000 items. Lowering the cap prunes immediately.
                  </li>
                  <li>
                    <UI>Paste as plain text by default</UI> — flips the meaning of{" "}
                    <Combo keys={["Return"]} /> and <Combo keys={["⇧", "Return"]} />.
                  </li>
                  <li>
                    <UI>Panel height</UI> — 280 pt to 520 pt.
                  </li>
                </ul>
              </Block>

              <Block label="4.2" title="Privacy">
                <ul className="marker:text-accent/60 list-disc space-y-2 pl-5">
                  <li>
                    <UI>Ignore concealed and transient clipboard content</UI> — on by default.
                    Password managers mark their copies as concealed, and Pastiche never records
                    them.
                  </li>
                  <li>
                    <UI>Ignored Apps</UI> — anything copied while one of these apps is frontmost is
                    skipped entirely.
                  </li>
                  <li>
                    <UI>Clear History</UI> — removes every item from the Clipboard tab and scrubs
                    the content from the database file on disk. Pinboards are left untouched.
                  </li>
                </ul>
              </Block>

              <Block label="4.3" title="Updates">
                <p>
                  <UI>Automatically check for updates</UI> reflects Sparkle’s real setting, and{" "}
                  <UI>Check Now</UI> runs a check on demand. The current version is listed
                  underneath.
                </p>
              </Block>

              <Block label="4.4" title="About">
                <p>
                  Version, license, and links back to the repository — plus the only promise the app
                  makes: everything you copy stays on this Mac.
                </p>
              </Block>

              <Block label="4.5" title="Where your data lives">
                <p>Clippings live only on your Mac, in this folder:</p>
                <div className="overflow-x-auto py-1">
                  <CopyChip text="~/Library/Application Support/Pastiche" kind="file" />
                </div>
                <p>
                  Inside it: <Mono>pastiche.sqlite3</Mono> plus an <Mono>Images/</Mono> folder.
                  Nothing is uploaded anywhere, and deleting an item deletes its row and any image
                  files it owned.
                </p>
                <p>
                  The only network request Pastiche makes is fetching <Mono>appcast.xml</Mono> to
                  check for updates.
                </p>
              </Block>
            </Section>

            {/* ========================= 05 · UPDATES ====================== */}
            <Section
              n="05"
              id="updates"
              label="Updates"
              title="Signed updates, straight from the repo"
              lede="Pastiche ships with Sparkle 2. Each release is a .zip of the app signed with an EdDSA (Ed25519) key that never leaves the maintainer’s machine; the matching public key is baked into the app’s Info.plist."
            >
              <Block label="5.1" title="How a check works">
                <p>
                  The app fetches <Mono>appcast.xml</Mono> from the repository in the background,
                  verifies the signature on the archive, and installs the update on relaunch. The
                  feed is the same file you can <Link href={APPCAST}>read on GitHub</Link> — nothing
                  is served from a private endpoint.
                </p>
              </Block>

              <Block label="5.2" title="Checking manually">
                <p>
                  Choose <UI>Check for Updates…</UI> from the menu-bar icon, or open{" "}
                  <UI>Settings → Updates</UI> and press <UI>Check Now</UI>. Automatic checks can be
                  turned off in the same place.
                </p>
                <Note>
                  Updates are only available in the packaged <Mono>Pastiche.app</Mono>. A binary run
                  with <Mono>swift run</Mono> has no bundle identifier, so Sparkle and
                  launch-at-login are both disabled there.
                </Note>
              </Block>

              <p className="text-ink-muted text-[16px] leading-[1.65]">
                Every release is written up in the <Link href={CHANGELOG}>changelog</Link>.
              </p>
            </Section>

            {/* ========================== 06 · BUILD ======================= */}
            <Section
              n="06"
              id="build"
              label="Building from source"
              title="A plain SwiftPM package"
              lede="Requirements: macOS 13 or later and the Xcode Command Line Tools. A full Xcode install is not needed."
            >
              <CommandBlock
                label="Prerequisite"
                lines={[{ command: "xcode-select --install" }]}
              />

              <CommandBlock
                label="Clone and build"
                lines={[
                  { command: "git clone https://github.com/Prestongramberg/Pastiche.git" },
                  { command: "cd Pastiche" },
                  {
                    comment: "Debug build / run straight out of the package",
                    command: "swift build",
                  },
                  {
                    comment:
                      "Build the real, signed .app bundle (icon, Info.plist, Sparkle framework)",
                    command: "bash Scripts/build_app.sh",
                  },
                  {
                    comment: "Same script, arm64 + x86_64",
                    command: "bash Scripts/build_app.sh --universal",
                  },
                ]}
              />

              <Block label="6.1" title="What you get">
                <p>
                  The finished bundle lands at <Mono>dist/Pastiche.app</Mono>. Drag it to{" "}
                  <Mono>/Applications</Mono> and launch it as usual — the same Gatekeeper step
                  applies the first time.
                </p>
                <p>
                  Running the binary directly with <Mono>swift run</Mono> works for quick iteration,
                  but there is no bundle identifier in that mode, so updates and launch-at-login are
                  disabled.
                </p>
              </Block>

              <Block label="6.2" title="Packaging your own disk image">
                <p>
                  One more command writes <Mono>dist/Pastiche-&lt;version&gt;.dmg</Mono>:
                </p>
                <div className="overflow-x-auto py-1">
                  <CopyChip text="bash Scripts/make_dmg.sh <version>" kind="command" />
                </div>
              </Block>
            </Section>

            {/* ======================== 07 · UNINSTALL ===================== */}
            <Section
              n="07"
              id="uninstall"
              label="Uninstall"
              title="Two paths, both complete"
              lede="Pastiche installs nothing outside the app bundle and its own support folder — no daemons, no kernel extensions, no receipts."
            >
              <ol className="space-y-9">
                <Step n="1" title="Quit the app">
                  <p>
                    Click the menu-bar icon and choose <UI>Quit Pastiche</UI> (
                    <Combo keys={["⌘", "Q"]} />
                    ). If you had launch-at-login on, turn it off in <UI>Settings → General</UI>{" "}
                    before quitting so the login-item registration is cleaned up.
                  </p>
                </Step>
                <Step n="2" title="Remove the app, and optionally the data">
                  <p>
                    Deleting <Mono>Pastiche.app</Mono> alone leaves your history and pinboards in
                    place, so reinstalling picks up where you left off. Delete the support folder
                    too for a clean slate.
                  </p>
                </Step>
              </ol>

              <CommandBlock
                label="Terminal"
                lines={[
                  { comment: "Remove the app", command: "rm -rf /Applications/Pastiche.app" },
                  {
                    comment: "Remove clipboard history, pinboards, and cached images",
                    command: 'rm -rf "$HOME/Library/Application Support/Pastiche"',
                  },
                  {
                    comment: "Optional: forget the app's preferences",
                    command: "defaults delete com.prestongramberg.pastiche",
                  },
                ]}
              />

              <Note>
                The second command is permanent — it deletes <Mono>pastiche.sqlite3</Mono> and the{" "}
                <Mono>Images/</Mono> folder with it. Finally, remove the stale entry under{" "}
                <UI>System Settings → Privacy &amp; Security → Accessibility</UI> by selecting
                Pastiche and clicking the minus button.
              </Note>
            </Section>

            {/* ========================== 08 · HELP ======================== */}
            <Section
              n="08"
              id="help"
              label="Get help"
              title="Something off?"
              lede="Pastiche is a one-person open-source project. Bug reports with the macOS version and a short repro are genuinely useful."
            >
              <dl className="border-rule border-t">
                <div className="border-rule grid gap-x-8 gap-y-2 border-b py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                  <dt className={`${LABEL} md:pt-1`}>Issues</dt>
                  <dd className="text-ink-muted text-[16px] leading-[1.65]">
                    <Link href={ISSUES}>Open a ticket on GitHub</Link> — bugs, rough edges, and
                    feature ideas all land in the same place.
                  </dd>
                </div>
                <div className="border-rule grid gap-x-8 gap-y-2 border-b py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                  <dt className={`${LABEL} md:pt-1`}>Source</dt>
                  <dd className="text-ink-muted text-[16px] leading-[1.65]">
                    <Link href={REPO}>Read the source</Link> — MIT licensed, Swift, no dependencies
                    beyond Sparkle. Pull requests welcome.
                  </dd>
                </div>
                <div className="border-rule grid gap-x-8 gap-y-2 border-b py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                  <dt className={`${LABEL} md:pt-1`}>Changelog</dt>
                  <dd className="text-ink-muted text-[16px] leading-[1.65]">
                    <Link href={CHANGELOG}>What changed in each release</Link>, written for humans
                    rather than commit logs.
                  </dd>
                </div>
              </dl>

              <div className="pt-2">
                <p className="text-ink font-serif max-w-[30ch] text-[clamp(1.6rem,3.5vw,2.25rem)] leading-[1.1] tracking-[-0.02em]">
                  Free, open source, and entirely local. macOS 13 or later.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                  <DownloadButton />
                  <Link href={RELEASES}>All releases</Link>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
