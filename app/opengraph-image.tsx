import { ImageResponse } from "next/og";
import { getBusinessSettings, getPublicBusinessStats } from "@/lib/cms-repository";

export const alt = "Business catalogue, products and technical support";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [settings, stats] = await Promise.all([
    getBusinessSettings(),
    getPublicBusinessStats(),
  ]);

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
          background: `linear-gradient(135deg,${settings.background_color},${settings.secondary_color})`,
          color: settings.text_color,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              background: settings.primary_color,
              color: settings.background_color,
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            {settings.short_name || "NG"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, color: settings.primary_color, fontWeight: 800 }}>
              {settings.hero_badge.toUpperCase()}
            </div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 18, color: "#cbd5e1" }}>
              {settings.address_line}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", maxWidth: 1050, fontSize: 74, fontWeight: 900, lineHeight: 1, letterSpacing: "-3px" }}>
            {settings.business_name}
          </div>
          <div style={{ display: "flex", marginTop: 24, maxWidth: 1000, fontSize: 31, color: "#cbd5e1" }}>
            {settings.tagline}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: settings.accent_color, fontWeight: 800 }}>
          <div style={{ display: "flex" }}>{stats.total_products} products • {stats.total_units_sold} units sold</div>
          <div style={{ display: "flex" }}>{settings.phone_display}</div>
        </div>
      </div>
    ),
    size,
  );
}
