"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

/** Static fallback — always safe to render, works with JS disabled or the API rate-limited. */
const RELEASES_PAGE = "https://github.com/Prestongramberg/Pastiche/releases/latest";
const RELEASES_API =
  "https://api.github.com/repos/Prestongramberg/Pastiche/releases/latest";

type ReleaseMeta = {
  /** Direct download URL for the .dmg asset. */
  href: string;
  /** Release tag, e.g. "v1.0.1". */
  version: string;
  /** Human-readable asset size, e.g. "2 MB". Empty when GitHub reports no size. */
  size: string;
};

type GitHubAsset = {
  name: string;
  size: number;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  assets: GitHubAsset[];
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = unit === 0 || value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit] ?? "B"}`;
}

/** Narrow the untyped API payload without trusting any of it. */
function parseRelease(payload: unknown): ReleaseMeta | null {
  if (typeof payload !== "object" || payload === null) return null;
  const release = payload as Partial<GitHubRelease>;
  if (!Array.isArray(release.assets)) return null;

  const dmg = release.assets.find(
    (asset): asset is GitHubAsset =>
      typeof asset === "object" &&
      asset !== null &&
      typeof (asset as GitHubAsset).name === "string" &&
      typeof (asset as GitHubAsset).browser_download_url === "string" &&
      (asset as GitHubAsset).name.toLowerCase().endsWith(".dmg"),
  );
  if (!dmg) return null;

  const version = typeof release.tag_name === "string" ? release.tag_name : "";
  return {
    href: dmg.browser_download_url,
    version: version.startsWith("v") || version === "" ? version : `v${version}`,
    size: formatBytes(typeof dmg.size === "number" ? dmg.size : 0),
  };
}

export default function DownloadButton() {
  // Starts null so the button renders instantly with the fallback href; the fetch
  // only ever upgrades it, never blocks or replaces the render.
  const [release, setRelease] = useState<ReleaseMeta | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(RELEASES_API, {
          signal: controller.signal,
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) return;
        const parsed = parseRelease(await response.json());
        if (parsed && !controller.signal.aborted) setRelease(parsed);
      } catch {
        // Offline, rate-limited, aborted, or no release yet — keep the fallback.
      }
    })();

    return () => controller.abort();
  }, []);

  const meta = [release?.version, release?.size].filter(Boolean).join(" · ");

  return (
    <a
      href={release?.href ?? RELEASES_PAGE}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        release?.version
          ? `Download Pastiche ${release.version} for Mac`
          : "Download Pastiche for Mac"
      }
      className="group bg-gradient inline-flex w-full max-w-[22rem] items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90 glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-midnight sm:w-auto sm:max-w-none"
    >
      <Download size={20} className="shrink-0 transition-transform group-hover:translate-y-0.5" />
      <span>Download for Mac</span>
      {meta ? (
        <span className="hidden sm:inline text-xs font-semibold text-white/70 border-l border-white/25 pl-3">
          {meta}
        </span>
      ) : null}
    </a>
  );
}
