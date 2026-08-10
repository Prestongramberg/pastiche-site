import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Accessibility,
  ArrowUpRight,
  BookOpen,
  Download,
  Eye,
  Github,
  Hammer,
  Info,
  Keyboard,
  Layers,
  MessageCircle,
  Move,
  Pause,
  Pin,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  Terminal,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How to install and use Pastiche: the shelf, pinboards, previews, power search, settings, updates, building from source, and uninstalling.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Pastiche Docs",
    description:
      "How to install and use Pastiche — the shelf, pinboards, previews, power search, settings, updates, and building from source.",
    url: "/docs",
    type: "article",
  },
};

const REPO = "https://github.com/Prestongramberg/Pastiche";
const RELEASES = `${REPO}/releases/latest`;
const ISSUES = `${REPO}/issues/new`;
const CHANGELOG = `${REPO}/blob/main/CHANGELOG.md`;

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

type NavItem = { id: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { id: "install", label: "Install", icon: Download },
  { id: "using", label: "Using Pastiche", icon: Zap },
  { id: "power-search", label: "Power search", icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "updates", label: "Updates", icon: RefreshCw },
  { id: "build", label: "Build from source", icon: Hammer },
  { id: "uninstall", label: "Uninstall", icon: Trash2 },
  { id: "help", label: "Get help", icon: MessageCircle },
];

type Shortcut = { chords: string[][]; separator?: string; action: string };

const SHORTCUTS: Shortcut[] = [
  {
    chords: [["⇧", "⌘", "V"]],
    action: "Toggle the shelf — works anywhere, and is re-bindable in Settings",
  },
  { chords: [["←"], ["→"]], separator: "/", action: "Move the selection" },
  { chords: [["Return"]], action: "Paste the selected item into the app you came from" },
  { chords: [["⇧", "Return"]], action: "Paste the selected item as plain text" },
  { chords: [["Space"]], action: "Toggle the large preview" },
  { chords: [["⌘", "1"], ["⌘", "9"]], separator: "…", action: "Paste the 1st … 9th visible card" },
  { chords: [["⌘", "F"]], action: "Focus the search field — typing anywhere also focuses it" },
  { chords: [["Delete"]], action: "Delete the selected item" },
  { chords: [["Esc"]], action: "Close the preview → clear the search → hide the shelf" },
];

type Token = { token: string; matches: string };

const SEARCH_TOKENS: Token[] = [
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

const CAPTURED = ["Plain text", "Rich text", "Links", "Images", "Files", "Colors"];

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {keys.map((key, index) => (
        <kbd key={`${key}-${index}`} className="kbd">
          {key}
        </kbd>
      ))}
    </span>
  );
}

function Chords({ chords, separator }: { chords: string[][]; separator?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {chords.map((chord, index) => (
        <span key={index} className="inline-flex items-center gap-1.5">
          {index > 0 && separator ? (
            <span className="text-foreground/35 text-sm">{separator}</span>
          ) : null}
          <Keys keys={chord} />
        </span>
      ))}
    </span>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="bg-darker border-border text-foreground/85 rounded-md border px-1.5 py-0.5 font-mono text-[0.85em] break-words">
      {children}
    </code>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="border-border bg-darker overflow-hidden rounded-xl border">
      <div className="border-border flex items-center gap-2 border-b px-4 py-2.5">
        <Terminal size={13} className="text-accent shrink-0" aria-hidden="true" />
        <span className="text-foreground/50 text-xs font-semibold tracking-wide">{label}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">
        <code className="text-foreground/85 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function Section({
  id,
  label,
  title,
  lede,
  children,
}: {
  id: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <p className="text-accent text-xs font-bold tracking-[0.2em] uppercase">{label}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{title}</h2>
      {lede ? (
        <p className="text-foreground/50 mt-4 max-w-2xl leading-relaxed">{lede}</p>
      ) : null}
      <div className="mt-8 space-y-5">{children}</div>
    </section>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-card border-border hover:border-foreground/20 rounded-2xl border p-5 transition-colors md:p-6">
      <div className="flex items-center gap-3">
        <span className="bg-accent/10 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon size={17} aria-hidden="true" />
        </span>
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
      </div>
      <div className="text-foreground/60 mt-4 space-y-3 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="bg-card border-border hover:border-foreground/20 flex gap-4 rounded-2xl border p-5 transition-colors md:p-6">
      <span className="bg-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
        <div className="text-foreground/60 mt-2 space-y-2 text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </li>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="border-accent bg-accent/5 flex gap-3 rounded-r-xl border-l-2 px-4 py-3">
      <Info size={15} className="text-accent mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-foreground/60 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function NavList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "grid grid-cols-1 gap-1 sm:grid-cols-2" : "space-y-0.5"}>
      {NAV.map(({ id, label, icon: Icon }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="text-foreground/55 hover:text-foreground hover:bg-card focus-visible:ring-accent/60 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Icon size={14} className="text-accent/70 shrink-0" aria-hidden="true" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function DocsPage() {
  return (
    <div id="top">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ---------------------------------------------------------------- */}
      <header className="border-border grid-bg relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="bg-accent/10 pointer-events-none absolute -top-40 left-1/4 h-80 w-80 rounded-full blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="bg-electric/10 pointer-events-none absolute -right-20 -bottom-40 h-80 w-80 rounded-full blur-[120px]"
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-16 md:pt-40 md:pb-20">
          <span className="border-border bg-card text-foreground/60 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
            <BookOpen size={13} className="text-accent" aria-hidden="true" />
            Documentation
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Everything Pastiche <span className="text-gradient">can do</span>.
          </h1>

          <p className="text-foreground/50 mt-6 max-w-2xl text-lg leading-relaxed">
            Install it in about a minute, learn nine keystrokes, and your clipboard stops
            forgetting. Every command, path, and permission step below matches the shipping app.
          </p>

          <div className="text-foreground/40 mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium">
            <span>macOS 13 or later</span>
            <span aria-hidden="true">·</span>
            <span>Free &amp; open source (MIT)</span>
            <span aria-hidden="true">·</span>
            <span>Everything stays on your Mac</span>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={RELEASES}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient glow focus-visible:ring-accent inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-bold text-white transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
            >
              <Download size={18} aria-hidden="true" />
              Download for Mac
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 focus-visible:ring-accent inline-flex items-center justify-center gap-2 rounded-xl border px-7 py-3.5 font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Github size={18} aria-hidden="true" />
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Body                                                              */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24">
              <p className="text-foreground/35 px-3 text-xs font-bold tracking-[0.2em] uppercase">
                On this page
              </p>
              <div className="mt-4">
                <NavList />
              </div>
              <a
                href={RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border-border hover:border-accent/50 focus-visible:ring-accent mt-8 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Download size={14} className="text-accent shrink-0" aria-hidden="true" />
                Download the DMG
              </a>
            </nav>
          </aside>

          {/* Sidebar — mobile */}
          <nav
            aria-label="On this page"
            className="bg-card border-border mb-14 rounded-2xl border p-4 lg:hidden"
          >
            <p className="text-foreground/35 px-3 pb-3 text-xs font-bold tracking-[0.2em] uppercase">
              On this page
            </p>
            <NavList compact />
          </nav>

          {/* Content */}
          <div className="min-w-0 space-y-20 md:space-y-24">
            {/* ============================ INSTALL ======================= */}
            <Section
              id="install"
              label="Install"
              title={
                <>
                  From download to <span className="text-gradient">first paste</span>
                </>
              }
              lede="Pastiche ships as a disk image on GitHub Releases. There is no installer, no account, and no license key — drag it in and press the hotkey."
            >
              <ol className="space-y-4">
                <Step number={1} title="Download the disk image">
                  <p>
                    Grab the latest <Code>Pastiche-&lt;version&gt;.dmg</Code> from{" "}
                    <a
                      href={RELEASES}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-electric font-semibold transition-colors"
                    >
                      GitHub Releases
                    </a>
                    . Every release also carries a <Code>.zip</Code> of the same build — that one is
                    what the auto-updater downloads.
                  </p>
                </Step>
                <Step number={2} title="Drag Pastiche into Applications">
                  <p>
                    Open the DMG and drag <strong className="text-foreground/80">Pastiche</strong>{" "}
                    onto the <strong className="text-foreground/80">Applications</strong> shortcut
                    inside the window. Then eject the disk image.
                  </p>
                </Step>
                <Step number={3} title="Launch it and press the hotkey">
                  <p>
                    Pastiche is a menu-bar app — there is no Dock icon and no main window. A
                    clipboard glyph appears in the menu bar; press{" "}
                    <Keys keys={["⇧", "⌘", "V"]} /> and the shelf slides up from the bottom of
                    whichever screen your mouse is on.
                  </p>
                </Step>
              </ol>

              <Card icon={ShieldAlert} title="Gatekeeper on first launch">
                <p>
                  Release builds are ad-hoc signed rather than Developer ID notarized, so macOS
                  refuses the first double-click with{" "}
                  <em className="text-foreground/75 not-italic">
                    “Pastiche cannot be opened because the developer cannot be verified.”
                  </em>{" "}
                  Do either of these once:
                </p>
                <ul className="list-disc space-y-2 pl-5 marker:text-accent/60">
                  <li>
                    Right-click (or Control-click){" "}
                    <strong className="text-foreground/80">Pastiche.app</strong> →{" "}
                    <strong className="text-foreground/80">Open</strong> →{" "}
                    <strong className="text-foreground/80">Open</strong> in the dialog, or
                  </li>
                  <li>
                    open <strong className="text-foreground/80">System Settings</strong> →{" "}
                    <strong className="text-foreground/80">Privacy &amp; Security</strong>, scroll
                    to the message about Pastiche, and click{" "}
                    <strong className="text-foreground/80">Open Anyway</strong>.
                  </li>
                </ul>
                <p>You only need to do this once per installed version.</p>
              </Card>

              <Card icon={Accessibility} title="Accessibility permission">
                <p>
                  Pastiche pastes by synthesizing a <Keys keys={["⌘", "V"]} /> keystroke into the
                  app you were last using, and macOS only lets trusted apps post keyboard events. On
                  first launch Pastiche asks for Accessibility access — approve it in{" "}
                  <strong className="text-foreground/80">System Settings</strong> →{" "}
                  <strong className="text-foreground/80">Privacy &amp; Security</strong> →{" "}
                  <strong className="text-foreground/80">Accessibility</strong>.
                </p>
                <p>
                  Without it Pastiche still works: selecting a card copies it to the system
                  clipboard, you just press <Keys keys={["⌘", "V"]} /> yourself. Nothing else in the
                  app reads other applications’ contents.
                </p>
                <Note>
                  Declined the prompt by accident? The request re-arms — flip Pastiche off and on in
                  the Accessibility list, or trigger a paste again, and direct paste recovers.
                </Note>
              </Card>
            </Section>

            {/* ============================ USING ========================= */}
            <Section
              id="using"
              label="Using Pastiche"
              title={
                <>
                  The shelf, <span className="text-gradient">end to end</span>
                </>
              }
              lede="Copy the way you always have. Pastiche records every clipping in the background and hands it back when you summon the shelf."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Card icon={Zap} title="Open the shelf">
                  <p>
                    Press <Keys keys={["⇧", "⌘", "V"]} /> from any app, or choose{" "}
                    <strong className="text-foreground/80">Open Pastiche</strong> from the menu-bar
                    icon. The panel appears on the screen holding the mouse and closes again with
                    the same hotkey, <Keys keys={["Esc"]} />, or by switching apps.
                  </p>
                </Card>

                <Card icon={Keyboard} title="Pick and paste">
                  <p>
                    Move with <Keys keys={["←"]} /> <Keys keys={["→"]} />, then{" "}
                    <Keys keys={["Return"]} /> to paste into the app you came from.{" "}
                    <Keys keys={["⇧", "Return"]} /> pastes as plain text, and{" "}
                    <Keys keys={["⌘", "1"]} />–<Keys keys={["⌘", "9"]} /> fire the numbered cards
                    without moving the selection.
                  </p>
                  <p>
                    Right-click any card for{" "}
                    <strong className="text-foreground/80">Paste</strong>,{" "}
                    <strong className="text-foreground/80">Paste as Plain Text</strong>,{" "}
                    <strong className="text-foreground/80">Copy</strong>,{" "}
                    <strong className="text-foreground/80">Add to Pinboard</strong>, and{" "}
                    <strong className="text-foreground/80">Delete</strong>.
                  </p>
                </Card>

                <Card icon={Pin} title="Pinboards">
                  <p>
                    The tabs across the top of the shelf are{" "}
                    <strong className="text-foreground/80">Clipboard</strong> plus your pinboards —
                    named, color-coded boards for the snippets you reuse. Hit{" "}
                    <strong className="text-foreground/80">+</strong> to create one, then drag a
                    card onto a tab, or use{" "}
                    <strong className="text-foreground/80">Add to Pinboard</strong>.
                  </p>
                  <p>
                    Adding an item to a board saves a copy, so your history is untouched. Right-click
                    a tab to rename, recolor, or delete it — deleting a board removes only the
                    copies saved on it.
                  </p>
                </Card>

                <Card icon={Eye} title="Previews">
                  <p>
                    Press <Keys keys={["Space"]} /> to toggle the large preview of the selected card:
                    full text, images fitted to the panel, openable links, file lists, and color
                    swatches. <Keys keys={["Space"]} /> or <Keys keys={["Esc"]} /> closes it again.
                  </p>
                </Card>

                <Card icon={Move} title="Drag and drop">
                  <p>
                    Drag any card straight out of the shelf and into another app — a document, a
                    Finder window, a chat box. Files and images carry their real contents, not just
                    a text stand-in.
                  </p>
                </Card>

                <Card icon={Pause} title="Pause capture">
                  <p>
                    Choose{" "}
                    <strong className="text-foreground/80">Pause Clipboard History</strong> from the
                    menu-bar icon to stop recording entirely until you turn it back on — useful when
                    you are about to move something you would rather not keep.
                  </p>
                </Card>
              </div>

              <Card icon={Layers} title="What Pastiche captures">
                <p>
                  Each kind of clipping gets its own card layout, a source-app badge, and a relative
                  timestamp. Rich text keeps its RTF and HTML styling; images are stored as PNGs
                  with thumbnails alongside.
                </p>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {CAPTURED.map((kind) => (
                    <li
                      key={kind}
                      className="border-border bg-darker text-foreground/70 rounded-lg border px-2.5 py-1 text-xs font-semibold"
                    >
                      {kind}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Keyboard reference */}
              <div className="pt-4">
                <h3 className="text-xl font-black tracking-tight">Keyboard reference</h3>
                <p className="text-foreground/50 mt-2 text-[15px] leading-relaxed">
                  Everything below works while the shelf is open, except the global toggle.
                </p>
                <div className="border-border bg-card mt-5 overflow-hidden rounded-2xl border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[26rem] text-left text-sm">
                      <caption className="sr-only">Pastiche keyboard shortcuts</caption>
                      <thead>
                        <tr className="border-border bg-darker border-b">
                          <th
                            scope="col"
                            className="text-foreground/40 px-5 py-3 text-xs font-bold tracking-[0.15em] uppercase"
                          >
                            Shortcut
                          </th>
                          <th
                            scope="col"
                            className="text-foreground/40 px-5 py-3 text-xs font-bold tracking-[0.15em] uppercase"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SHORTCUTS.map((row) => (
                          <tr
                            key={row.action}
                            className="border-border/70 border-b last:border-b-0"
                          >
                            <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                              <Chords chords={row.chords} separator={row.separator} />
                            </td>
                            <td className="text-foreground/60 px-5 py-3.5 align-middle leading-relaxed">
                              {row.action}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Section>

            {/* ========================= POWER SEARCH ===================== */}
            <Section
              id="power-search"
              label="Power search"
              title={
                <>
                  Find it <span className="text-gradient">faster than you copied it</span>
                </>
              }
              lede="Start typing with the shelf open — the search field takes focus automatically. Bare words fuzzy-match item text, URLs, hex codes, file names, and the app a clipping came from, ranked best-first."
            >
              <div className="border-border bg-card overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[26rem] text-left text-sm">
                    <caption className="sr-only">Power search filter tokens</caption>
                    <thead>
                      <tr className="border-border bg-darker border-b">
                        <th
                          scope="col"
                          className="text-foreground/40 px-5 py-3 text-xs font-bold tracking-[0.15em] uppercase"
                        >
                          Token
                        </th>
                        <th
                          scope="col"
                          className="text-foreground/40 px-5 py-3 text-xs font-bold tracking-[0.15em] uppercase"
                        >
                          Matches
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEARCH_TOKENS.map((row) => (
                        <tr key={row.token} className="border-border/70 border-b last:border-b-0">
                          <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                            <span className="text-accent font-mono text-[13px] font-semibold">
                              {row.token}
                            </span>
                          </td>
                          <td className="text-foreground/60 px-5 py-3.5 align-middle leading-relaxed">
                            {row.matches}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-foreground/60 text-[15px] leading-relaxed">
                Tokens combine with each other and with free text:
              </p>

              <CodeBlock
                label="Search examples"
                code={`type:link github          links mentioning "github"
app:xcode type:text       text copied out of Xcode
app:com.apple.Safari      everything grabbed from Safari
#ff                       colors (and anything else) containing "#ff"`}
              />

              <Note>
                Fuzzy matching is forgiving about typos — searching{" "}
                <Code>wrld</Code> still surfaces the clipping containing “world”. Press{" "}
                <Keys keys={["⌘", "F"]} /> to jump back to the field, and{" "}
                <Keys keys={["Esc"]} /> to clear it.
              </Note>
            </Section>

            {/* =========================== SETTINGS ======================= */}
            <Section
              id="settings"
              label="Settings"
              title={
                <>
                  Four tabs, <span className="text-gradient">no surprises</span>
                </>
              }
              lede="Open Settings… from the menu-bar icon in the top-right of the screen. Every preference is stored locally, alongside your history."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Card icon={Settings} title="General">
                  <ul className="list-disc space-y-2 pl-5 marker:text-accent/60">
                    <li>
                      <strong className="text-foreground/80">Launch Pastiche at login</strong> —
                      backed by <Code>SMAppService</Code>; the toggle verifies the real system state
                      and reverts if registration fails.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Global shortcut</strong> — record a new
                      combination for the shelf. It needs at least one of{" "}
                      <Keys keys={["⌘"]} /> <Keys keys={["⌃"]} /> <Keys keys={["⌥"]} />; a
                      combination the system rejects reverts to the previous one.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Keep history</strong> — Unlimited (the
                      default), or cap at 100 / 500 / 1,000 / 5,000 items. Lowering the cap prunes
                      immediately.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Paste as plain text by default</strong>{" "}
                      — flips the meaning of <Keys keys={["Return"]} /> and{" "}
                      <Keys keys={["⇧", "Return"]} />.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Panel height</strong> — 280 pt to 520
                      pt.
                    </li>
                  </ul>
                </Card>

                <Card icon={ShieldAlert} title="Privacy">
                  <ul className="list-disc space-y-2 pl-5 marker:text-accent/60">
                    <li>
                      <strong className="text-foreground/80">
                        Ignore concealed and transient clipboard content
                      </strong>{" "}
                      — on by default. Password managers mark their copies as concealed, and
                      Pastiche never records them.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Ignored Apps</strong> — anything copied
                      while one of these apps is frontmost is skipped entirely.
                    </li>
                    <li>
                      <strong className="text-foreground/80">Clear History</strong> — removes every
                      item from the Clipboard tab and scrubs the content from the database file on
                      disk. Pinboards are left untouched.
                    </li>
                  </ul>
                </Card>

                <Card icon={RefreshCw} title="Updates">
                  <p>
                    <strong className="text-foreground/80">Automatically check for updates</strong>{" "}
                    reflects Sparkle’s real setting, and{" "}
                    <strong className="text-foreground/80">Check Now</strong> runs a check on
                    demand. The current version is listed underneath.
                  </p>
                </Card>

                <Card icon={Info} title="About">
                  <p>
                    Version, license, and links back to the repository — plus the only promise the
                    app makes: everything you copy stays on this Mac.
                  </p>
                </Card>
              </div>

              <Card icon={Layers} title="Where your data lives">
                <p>
                  Clippings live only on your Mac, in{" "}
                  <Code>~/Library/Application Support/Pastiche</Code> —{" "}
                  <Code>pastiche.sqlite3</Code> plus an <Code>Images/</Code> folder. Nothing is
                  uploaded anywhere, and deleting an item deletes its row and any image files it
                  owned.
                </p>
                <p>
                  The only network request Pastiche makes is fetching <Code>appcast.xml</Code> to
                  check for updates.
                </p>
              </Card>
            </Section>

            {/* =========================== UPDATES ======================== */}
            <Section
              id="updates"
              label="Updates"
              title={
                <>
                  Signed updates, <span className="text-gradient">straight from the repo</span>
                </>
              }
              lede="Pastiche ships with Sparkle 2. Each release is a .zip of the app signed with an EdDSA (Ed25519) key that never leaves the maintainer’s machine; the matching public key is baked into the app’s Info.plist."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Card icon={RefreshCw} title="How a check works">
                  <p>
                    The app fetches <Code>appcast.xml</Code> from the repository in the background,
                    verifies the signature on the archive, and installs the update on relaunch. The
                    feed is the same file you can read on GitHub — nothing is served from a private
                    endpoint.
                  </p>
                </Card>

                <Card icon={Download} title="Checking manually">
                  <p>
                    Choose <strong className="text-foreground/80">Check for Updates…</strong> from
                    the menu-bar icon, or open{" "}
                    <strong className="text-foreground/80">Settings → Updates</strong> and press{" "}
                    <strong className="text-foreground/80">Check Now</strong>. Automatic checks can
                    be turned off in the same place.
                  </p>
                </Card>
              </div>

              <Note>
                Updates are only available in the packaged <Code>Pastiche.app</Code>. A binary run
                with <Code>swift run</Code> has no bundle identifier, so Sparkle and launch-at-login
                are both disabled there.
              </Note>

              <p className="text-foreground/60 text-[15px] leading-relaxed">
                Every release is written up in the{" "}
                <a
                  href={CHANGELOG}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-electric inline-flex items-center gap-1 font-semibold transition-colors"
                >
                  changelog
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                .
              </p>
            </Section>

            {/* ============================ BUILD ========================= */}
            <Section
              id="build"
              label="Building from source"
              title={
                <>
                  A plain <span className="text-gradient">SwiftPM package</span>
                </>
              }
              lede="Requirements: macOS 13 or later and the Xcode Command Line Tools (xcode-select --install). A full Xcode install is not needed."
            >
              <CodeBlock
                label="Clone and build"
                code={`git clone https://github.com/Prestongramberg/Pastiche.git
cd Pastiche

# Debug build / run straight out of the package
swift build

# Build the real, signed .app bundle (icon, Info.plist, Sparkle framework)
bash Scripts/build_app.sh            # add --universal for arm64 + x86_64`}
              />

              <Card icon={Hammer} title="What you get">
                <p>
                  The finished bundle lands at <Code>dist/Pastiche.app</Code>. Drag it to{" "}
                  <Code>/Applications</Code> and launch it as usual — the same Gatekeeper step
                  applies the first time.
                </p>
                <p>
                  Running the binary directly with <Code>swift run</Code> works for quick iteration,
                  but there is no bundle identifier in that mode, so updates and launch-at-login are
                  disabled.
                </p>
              </Card>

              <Note>
                Packaging a disk image of your own build is one more command:{" "}
                <Code>bash Scripts/make_dmg.sh &lt;version&gt;</Code>, which writes{" "}
                <Code>dist/Pastiche-&lt;version&gt;.dmg</Code>.
              </Note>
            </Section>

            {/* =========================== UNINSTALL ====================== */}
            <Section
              id="uninstall"
              label="Uninstall"
              title={
                <>
                  Two paths, <span className="text-gradient">both complete</span>
                </>
              }
              lede="Pastiche installs nothing outside the app bundle and its own support folder — no daemons, no kernel extensions, no receipts."
            >
              <ol className="space-y-4">
                <Step number={1} title="Quit the app">
                  <p>
                    Click the menu-bar icon and choose{" "}
                    <strong className="text-foreground/80">Quit Pastiche</strong> (
                    <Keys keys={["⌘", "Q"]} />
                    ). If you had launch-at-login on, turn it off in{" "}
                    <strong className="text-foreground/80">Settings → General</strong> before
                    quitting so the login-item registration is cleaned up.
                  </p>
                </Step>
                <Step number={2} title="Remove the app, and optionally the data">
                  <p>
                    Deleting <Code>Pastiche.app</Code> alone leaves your history and pinboards in
                    place, so reinstalling picks up where you left off. Delete the support folder
                    too for a clean slate.
                  </p>
                </Step>
              </ol>

              <CodeBlock
                label="Terminal"
                code={`# Remove the app
rm -rf /Applications/Pastiche.app

# Remove clipboard history, pinboards, and cached images
rm -rf "$HOME/Library/Application Support/Pastiche"

# Optional: forget the app's preferences
defaults delete com.prestongramberg.pastiche`}
              />

              <Note>
                The second command is permanent — it deletes <Code>pastiche.sqlite3</Code> and the{" "}
                <Code>Images/</Code> folder with it. Finally, remove the stale entry under{" "}
                <strong className="text-foreground/80">
                  System Settings → Privacy &amp; Security → Accessibility
                </strong>{" "}
                by selecting Pastiche and clicking the minus button.
              </Note>
            </Section>

            {/* ============================= HELP ========================= */}
            <Section
              id="help"
              label="Get help"
              title={
                <>
                  Something <span className="text-gradient">off</span>?
                </>
              }
              lede="Pastiche is a one-person open-source project. Bug reports with the macOS version and a short repro are genuinely useful."
            >
              <div className="grid gap-5 md:grid-cols-3">
                <a
                  href={ISSUES}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border-border hover:border-accent/50 focus-visible:ring-accent group rounded-2xl border p-6 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <MessageCircle size={20} className="text-accent" aria-hidden="true" />
                  <h3 className="mt-4 flex items-center gap-1 text-base font-bold tracking-tight">
                    Report an issue
                    <ArrowUpRight
                      size={15}
                      className="text-foreground/30 group-hover:text-accent transition-colors"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="text-foreground/60 mt-2 text-[15px] leading-relaxed">
                    Open a ticket on GitHub — bugs, rough edges, and feature ideas all land in the
                    same place.
                  </p>
                </a>

                <a
                  href={REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border-border hover:border-accent/50 focus-visible:ring-accent group rounded-2xl border p-6 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Github size={20} className="text-accent" aria-hidden="true" />
                  <h3 className="mt-4 flex items-center gap-1 text-base font-bold tracking-tight">
                    Read the source
                    <ArrowUpRight
                      size={15}
                      className="text-foreground/30 group-hover:text-accent transition-colors"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="text-foreground/60 mt-2 text-[15px] leading-relaxed">
                    MIT licensed, Swift, no dependencies beyond Sparkle. Pull requests welcome.
                  </p>
                </a>

                <a
                  href={CHANGELOG}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border-border hover:border-accent/50 focus-visible:ring-accent group rounded-2xl border p-6 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <RefreshCw size={20} className="text-accent" aria-hidden="true" />
                  <h3 className="mt-4 flex items-center gap-1 text-base font-bold tracking-tight">
                    Changelog
                    <ArrowUpRight
                      size={15}
                      className="text-foreground/30 group-hover:text-accent transition-colors"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="text-foreground/60 mt-2 text-[15px] leading-relaxed">
                    What changed in each release, written for humans rather than commit logs.
                  </p>
                </a>
              </div>

              <div className="border-border bg-card relative mt-6 overflow-hidden rounded-2xl border p-8 text-center md:p-10">
                <div
                  aria-hidden="true"
                  className="bg-accent/10 pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-[100px]"
                />
                <div className="relative">
                  <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                    Ready to stop losing what you copied?
                  </h3>
                  <p className="text-foreground/50 mx-auto mt-3 max-w-md leading-relaxed">
                    Free, open source, and entirely local. macOS 13 or later.
                  </p>
                  <a
                    href={RELEASES}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient glow focus-visible:ring-accent mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-bold text-white transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Download size={18} aria-hidden="true" />
                    Download for Mac
                  </a>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
