import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NextGen Computer World Smart Catalogue CMS Demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 70,
          background:
            "radial-gradient(circle at 80% 10%, rgba(34,211,238,.28), transparent 35%), linear-gradient(135deg,#050b14,#0b1f3a)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ color: "#67e8f9", fontSize: 26, fontWeight: 800 }}>
          SMART CATALOGUE CMS DEMO
        </div>
        <div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>
            NextGen Computer World
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#cbd5e1" }}>
            Next.js • React • TypeScript • Tailwind CSS • Supabase-ready
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#86efac", fontWeight: 800 }}>
          Founder launch offer ₹15,000 • Regular KWS price ₹25,000
        </div>
      </div>
    ),
    size,
  );
}
