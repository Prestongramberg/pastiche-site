"use client";

import { useEffect, useState } from "react";

/** Static fallback — always safe to render, works with JS disabled or the API rate-limited. */
const RELEASES_PAGE = "https://github.com/Prestongramberg/Pastiche/releases/latest";
const RELEASES_API =
  "https://api.github.com/repos/Prestongramberg/Pastiche/releases/latest";

/**
 * Shape shared with the provenance section via `useLatestRelease()`.
 * `dmgUrl` is ALWAYS a usable href — it degrades to the releases page.
 * `publishedAt` is the raw ISO-8601 timestamp from the API; format it at the call site.
 */
export type LatestRelease = {
  version: string | null;
  dmgUrl: string;
  sizeLabel: string | null;
  publishedAt: string | null;
};

const FALLBACK: LatestRelease = {
  version: null,
  dmgUrl: RELEASES_PAGE,
  sizeLabel: null,
  publishedAt: null,
};

type GitHubAsset = {
  name: string;
  size: number;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  published_at: string;
  assets: GitHubAsset[];
};

function formatBytes(bytes: number): string | null {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded =
    unit === 0 || value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit] ?? "B"}`;
}

/** Narrow the untyped API payload without trusting any of it. */
function parseRelease(payload: unknown): LatestRelease | null {
  if (typeof payload !== "object" || payload === null) return null;
  const release = payload as Partial<GitHubRelease>;

  const rawTag = typeof release.tag_name === "string" ? release.tag_name.trim() : "";
  const version = rawTag === "" ? null : rawTag.startsWith("v") ? rawTag : `v${rawTag}`;

  const publishedAt =
    typeof release.published_at === "string" && release.published_at !== ""
      ? release.published_at
      : null;

  const dmg = Array.isArray(release.assets)
    ? release.assets.find(
        (asset): asset is GitHubAsset =>
          typeof asset === "object" &&
          asset !== null &&
          typeof (asset as GitHubAsset).name === "string" &&
          typeof (asset as GitHubAsset).browser_download_url === "string" &&
          (asset as GitHubAsset).name.toLowerCase().endsWith(".dmg"),
      )
    : undefined;

  // A release with no DMG asset is still useful: version + date remain verifiable,
  // and the button falls back to the releases page.
  if (!version && !dmg) return null;

  return {
    version,
    dmgUrl: dmg?.browser_download_url ?? RELEASES_PAGE,
    sizeLabel: dmg ? formatBytes(typeof dmg.size === "number" ? dmg.size : 0) : null,
    publishedAt,
  };
}

/* ---------------------------------------------------------------------------
 * One fetch per page load, shared by every consumer of the hook (the masthead
 * button and the provenance section both call it). The request is aborted when
 * the last subscriber unmounts before it settles.
 * ------------------------------------------------------------------------- */

let cached: LatestRelease | null = null;
let inFlight: Promise<LatestRelease | null> | null = null;
let controller: AbortController | null = null;
let subscribers = 0;

function loadLatestRelease(): Promise<LatestRelease | null> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  const local = new AbortController();
  controller = local;

  inFlight = (async () => {
    try {
      const response = await fetch(RELEASES_API, {
        signal: local.signal,
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) return null;
      const parsed = parseRelease(await response.json());
      if (parsed) cached = parsed;
      return parsed;
    } catch {
      // Offline, rate-limited, aborted, or no release yet — keep the fallback.
      return null;
    } finally {
      if (controller === local) controller = null;
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Live release metadata from the GitHub API. Never suspends, never blocks render:
 * returns the static fallback first and upgrades in place when the fetch lands.
 */
export function useLatestRelease(): LatestRelease {
  const [release, setRelease] = useState<LatestRelease>(FALLBACK);

  useEffect(() => {
    if (cached) {
      setRelease(cached);
      return;
    }

    let active = true;
    subscribers += 1;

    void loadLatestRelease().then((result) => {
      if (active && result) setRelease(result);
    });

    return () => {
      active = false;
      subscribers -= 1;
      if (subscribers <= 0) {
        subscribers = 0;
        controller?.abort();
        controller = null;
        inFlight = null;
      }
    };
  }, []);

  return release;
}

export default function DownloadButton() {
  const { version, dmgUrl, sizeLabel } = useLatestRelease();

  // Architecture and minimum OS are static facts (Apple Silicon builds today), so the
  // metadata line always carries true content — the live version and DMG size only
  // upgrade it. The block never reflows around an empty slot.
  const live = [version, sizeLabel].filter(Boolean);
  const meta = (live.length > 0 ? live : ["macOS 13+"]).concat("arm64").join(" · ");

  return (
    <a
      href={dmgUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        version
          ? `Download Pastiche ${version} for Mac (opens in a new tab)`
          : "Download Pastiche for Mac (opens in a new tab)"
      }
      className="group inline-flex w-full flex-col items-start gap-1 rounded-[3px] bg-accent px-6 py-4 text-paper transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:min-w-[17.5rem]"
    >
      <span className="flex items-baseline gap-2 font-sans text-[1.0625rem] font-semibold tracking-[-0.01em]">
        <span aria-hidden="true" className="font-mono text-[0.875rem]">
          ↓
        </span>
        Download for Mac
      </span>
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-paper/85">
        {meta}
      </span>
    </a>
  );
}
