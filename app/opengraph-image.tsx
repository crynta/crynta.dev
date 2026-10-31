import { ImageResponse } from "next/og";

export const alt = "Crynta — software & AI engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the bell curve, the name, and what it's all about. */
export default function OpengraphImage() {
  const points = Array.from({ length: 61 }, (_, i) => {
    const x = (i / 60) * 6 - 3;
    return `${100 + (i / 60) * 1000},${470 - Math.exp(-(x * x) / 2) * 300}`;
  }).join(" ");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#050506", color: "#f2efe8", padding: 72 }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", inset: 0 }}>
          <polyline points={points} fill="none" stroke="#f2efe8" strokeOpacity="0.35" strokeWidth="2" />
          <circle cx="600" cy="170" r="7" fill="#ff5b1f" />
        </svg>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "rgba(242,239,232,0.55)" }}>CRYNTA.DEV</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 168, fontWeight: 700, letterSpacing: -10, lineHeight: 1 }}>Crynta</div>
          <div style={{ fontSize: 34, color: "rgba(242,239,232,0.7)", marginTop: 18 }}>
            Software & AI engineer. Building Terax and Zephium.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
