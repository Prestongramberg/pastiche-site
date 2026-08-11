"use client";

/**
 * FIG. 04 — Provenance.
 *
 * Proof rather than social proof. Three live plates read from the GitHub Releases API
 * (via `useLatestRelease`, owned by DownloadButton) sit above a static specification of
 * things that are true whether or not the fetch succeeds, and then the candid
 * "Before you install" block.
 *
 * The live plates reserve their own height so a late-arriving fetch never shifts layout.
 */

import CopyChip from "./CopyChip";
import { useLatestRelease } from "./DownloadButton";

const LABEL = "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
const LINK = `text-ink underline decoration-rule underline-offset-4 transition-colors hover:decoration-accent ${FOCUS}`;

const REPO = "https://github.com/Prestongramberg/Pastiche";
const RELEASES = `${REPO}/releases`;
const STORAGE_PATH = "~/Library/Application Support/Pastiche";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** One live plate. Height is fixed so the fetch can never move the page. */
function Plate({ label, value, pending }: { label: string; value: string | null; pending: string }) {
  return (
    <div className="bg-paper-raised px-5 py-5 sm:px-6 sm:py-6">
      <p className={LABEL}>{label}</p>
      <p className="mt-3 flex h-8 items-baseline font-mono text-[19px] tabular-nums leading-8 tracking-[-0.01em] text-ink sm:text-[21px]">
        {value ?? <span className="text-ink-muted">{pending}</span>}
      </p>
    </div>
  );
}

/** A specification row with a dotted leader, matching FIG. 03's table. */
function Spec({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 border-b border-rule/70 py-3.5 last:border-b-0">
      <dt className="min-w-0 shrink-0 text-[15.5px] leading-snug text-ink sm:text-[16.5px]">
        {term}
      </dt>
      <span
        aria-hidden="true"
        className="hidden min-w-8 flex-1 border-b border-dotted border-rule sm:block"
      />
      <dd className="ml-auto flex min-w-0 shrink flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[14.5px] leading-snug text-ink/75 sm:ml-0 sm:text-right sm:text-[15.5px]">
        {children}
      </dd>
    </div>
  );
}

const CAVEATS: { n: string; head: string; body: React.ReactNode }[] = [
  {
    n: "4.3.1",
    head: "The build is ad-hoc signed, not notarized.",
    body: (
      <>
        macOS will refuse the first double-click and tell you the developer cannot be
        verified. Right-click Pastiche.app → Open → Open, or approve it in System Settings →
        Privacy &amp; Security. Once per installed version, then it never asks again. I would
        rather tell you that here than have you meet it in a dialog.
      </>
    ),
  },
  {
    n: "4.3.2",
    head: "Direct paste needs Accessibility permission.",
    body: (
      <>
        That permission is how Pastiche presses ⌘V for you in the app you came from — macOS
        only lets trusted apps post keyboard events. Say no and everything still works:
        picking a card puts it on the system clipboard and you paste it yourself. Nothing in
        the app reads other applications&apos; contents.
      </>
    ),
  },
  {
    n: "4.3.3",
    head: "Today's release is Apple Silicon.",
    body: (
      <>
        The build script takes a{" "}
        <span className="font-mono text-[0.94em]">--universal</span> flag, so an Intel build
        is a release away rather than a rewrite — but the DMG on the releases page right now
        is arm64. If that is your Mac, say so on the issue tracker.
      </>
    ),
  },
];

export default function Provenance() {
  const { version, dmgUrl, sizeLabel, publishedAt } = useLatestRelease();
  const published = formatDate(publishedAt);

  return (
    <section
      id="provenance"
      aria-labelledby="provenance-title"
      className="relative scroll-mt-8 border-t border-rule px-5 sm:px-8"
    >
      <div className="mx-auto w-full max-w-5xl py-20 sm:py-28 lg:py-32">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <p className={LABEL}>FIG. 04 — Provenance</p>
          <p className={LABEL}>Checked against the release feed</p>
        </header>

        <h2
          id="provenance-title"
          className="mt-6 max-w-[20ch] font-serif text-[clamp(2rem,5.2vw,3.6rem)] font-normal leading-[1.04] tracking-[-0.025em] text-ink"
        >
          Numbers you can check yourself.
        </h2>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.62] text-ink/75 sm:text-[18px]">
          No testimonials, no logo wall. The figures below come from the same release feed
          the app updates from, and everything under them is verifiable in the repository.
        </p>

        {/* 4.1 — live plates */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.1</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              The current release
            </h3>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[3px] border border-rule bg-rule sm:grid-cols-3">
            <Plate label="Version" value={version} pending="—" />
            <Plate label="Published" value={published} pending="—" />
            <Plate label="Disk image" value={sizeLabel} pending="~2 MB" />
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14.5px] leading-[1.6] text-ink-muted">
            <span>Read from the GitHub Releases API when this page loaded.</span>
            <a href={RELEASES} target="_blank" rel="noopener noreferrer" className={LINK}>
              Verify on GitHub ↗
            </a>
            <a href={dmgUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
              Direct disk image ↗
            </a>
          </p>
        </div>

        {/* 4.2 — the specification */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.2</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              The specification
            </h3>
          </div>

          <dl className="mt-2">
            <Spec term="Download">
              <span className="font-mono text-[13.5px] text-ink">
                {sizeLabel ?? "about 2 MB"}
              </span>
              <span>disk image</span>
            </Spec>
            <Spec term="Requires">macOS 13 or later, Apple Silicon</Spec>
            <Spec term="Network requests the app makes">
              <span>exactly one — the signed update check</span>
            </Spec>
            <Spec term="Accounts, sync, telemetry, analytics">none</Spec>
            <Spec term="Where your clippings live">
              <CopyChip text={STORAGE_PATH} label={STORAGE_PATH} kind="file" />
            </Spec>
            <Spec term="What is in there">
              <span className="font-mono text-[13.5px] text-ink">pastiche.sqlite3</span>
              <span>and an</span>
              <span className="font-mono text-[13.5px] text-ink">Images/</span>
              <span>folder</span>
            </Spec>
            <Spec term="Update feed">
              <a href={`${REPO}/blob/main/appcast.xml`} target="_blank" rel="noopener noreferrer" className={LINK}>
                appcast.xml ↗
              </a>
              <span>, Ed25519-signed</span>
            </Spec>
            <Spec term="License">
              <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className={LINK}>
                MIT ↗
              </a>
            </Spec>
            <Spec term="Source">
              <a href={REPO} target="_blank" rel="noopener noreferrer" className={LINK}>
                github.com/Prestongramberg/Pastiche ↗
              </a>
            </Spec>
          </dl>

          <p className="mt-5 max-w-[62ch] text-[14.5px] leading-[1.6] text-ink-muted">
            Clippings that arrive marked concealed or transient — what password managers use —
            are never recorded, and any app can be excluded outright in Settings → Privacy.
          </p>
        </div>

        {/* 4.3 — before you install */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-baseline gap-4 border-b border-ink/25 pb-2.5">
            <span className={`${LABEL} tabular-nums`}>4.3</span>
            <h3 className="font-serif text-[clamp(1.35rem,2.6vw,1.85rem)] font-normal leading-tight tracking-[-0.015em] text-ink">
              <span className="underline decoration-guide decoration-2 underline-offset-[6px]">
                Before you install
              </span>
            </h3>
          </div>

          <ol className="mt-2">
            {CAVEATS.map(({ n, head, body }) => (
              <li
                key={n}
                className="flex gap-4 border-b border-rule/70 py-6 last:border-b-0 sm:gap-6"
              >
                <span className={`${LABEL} w-12 shrink-0 pt-1 tabular-nums`}>{n}</span>
                <div className="min-w-0">
                  <p className="text-[16.5px] font-medium leading-snug text-ink sm:text-[17.5px]">
                    {head}
                  </p>
                  <p className="mt-2.5 max-w-[62ch] text-[15px] leading-[1.62] text-ink/75 sm:text-[16px]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
