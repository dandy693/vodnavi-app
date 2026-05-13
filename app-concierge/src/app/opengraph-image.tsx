import { ImageResponse } from "next/og";

export const alt = "VODNAVI — 今夜の極上に、最短ルートで";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(ellipse at top, #1a1a1a 0%, #000000 70%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: 12,
              color: "#fbbf24",
              fontWeight: 600,
            }}
          >
            PREMIUM VOD NAVIGATION
          </div>
        </div>
        <div
          style={{
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: 8,
            background:
              "linear-gradient(90deg, #fbbf24 0%, #fde68a 50%, #fbbf24 100%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          VODNAVI
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 36,
            color: "#fafafa",
            fontWeight: 500,
          }}
        >
          今夜の極上に、最短ルートで。
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 22,
            color: "#a1a1aa",
          }}
        >
          FANZA 厳選作品をワンタップで・AI コンシェルジュ搭載
        </div>
      </div>
    ),
    { ...size },
  );
}
