import { ImageResponse } from "next/og";

export const alt =
  "NextGen Computer World | Computers, Laptops, Upgrades and Support";
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
          padding: 68,
          background:
            "radial-gradient(circle at 82% 12%, rgba(34,211,238,.25), transparent 34%), linear-gradient(135deg,#040914,#0b1f3a)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: "linear-gradient(135deg,#67e8f9,#2563eb)",
              color: "#020617",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            NG
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: "#67e8f9", fontWeight: 800 }}>
              COMPUTERS • LAPTOPS • UPGRADES • SUPPORT
            </div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 18, color: "#94a3b8" }}>
              Nellore City, Andhra Pradesh
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: 1000,
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-3px",
            }}
          >
            NextGen Computer World
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 980,
              fontSize: 32,
              color: "#cbd5e1",
            }}
          >
            Products, clear comparisons and practical technical support.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#86efac",
            fontWeight: 800,
          }}
        >
          <div style={{ display: "flex" }}>30 products across 8 categories</div>
          <div style={{ display: "flex" }}>+91 83285 71256</div>
        </div>
      </div>
    ),
    size,
  );
}