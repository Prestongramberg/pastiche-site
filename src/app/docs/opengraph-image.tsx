import { ImageResponse } from "next/og";

/** Build-time fetch of the display face is more reliable on the Node runtime. */
export const runtime = "nodejs";

export const alt = "Pastiche documentation — install, shortcuts, power search, and updates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* The specimen palette, in literal hex — an image has no access to the theme tokens. */
const PAPER = "#F5F1EA";
const INK = "#16130E";
const INK_MUTED = "#6E675C";
const RULE = "#D9D2C4";
const ACCENT = "#4F33E4";

/**
 * Instrument Serif italic, subset to the glyphs on the plate.
 *
 * Google's CSS endpoint returns TrueType sources when the request carries no
 * modern browser User-Agent, which is exactly what satori can parse. Any failure
 * (offline build, rate limit, upstream change) returns null and the plate falls
 * back to the bundled face — the image always renders.
 */
async function loadSerifItalic(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&text=${encodeURIComponent(text)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!cssResponse.ok) return null;

    const css = await cssResponse.text();
    const source = /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css);
    if (!source?.[1]) return null;

    const fontResponse = await fetch(source[1], { signal: AbortSignal.timeout(5000) });
    if (!fontResponse.ok) return null;

    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function DocsOpengraphImage() {
  const serif = await loadSerifItalic("PasticheDocumentation");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          color: INK,
          padding: "64px 72px",
        }}
      >
        {/* Over-line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 21, letterSpacing: 3, color: INK_MUTED }}>
            PASTICHE — DOCUMENTATION · MACOS 13+ · MIT
          </div>
          {/* Registration mark */}
          <div style={{ display: "flex", width: 16, height: 16, backgroundColor: ACCENT }} />
        </div>

        {/* The plate */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: 214,
              lineHeight: 0.9,
              letterSpacing: -6,
              color: INK,
            }}
          >
            Pastiche
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: 58,
              lineHeight: 1.1,
              letterSpacing: -1,
              color: INK_MUTED,
              marginTop: 14,
            }}
          >
            Documentation
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: RULE,
              marginTop: 36,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 26,
            }}
          >
            <div style={{ display: "flex", width: 640, fontSize: 22, color: INK_MUTED }}>
              INSTALL · SHORTCUTS · POWER SEARCH · SETTINGS · UPDATES · BUILDING FROM SOURCE
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontSize: 17,
                letterSpacing: 2.4,
                color: INK_MUTED,
              }}
            >
              <div style={{ display: "flex" }}>PASTICHE.GRAMBERGMEDIA.COM/DOCS</div>
              <div style={{ display: "flex", marginTop: 8 }}>FREE · OPEN SOURCE · LOCAL</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [{ name: "Instrument Serif", data: serif, style: "italic", weight: 400 }]
        : [],
    },
  );
}
