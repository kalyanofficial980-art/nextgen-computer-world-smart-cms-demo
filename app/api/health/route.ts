import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, database: false, advancedCms: false },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const [products, settings, offers, reviews, media] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("active", true)
      .is("deleted_at", null),
    supabase.from("site_settings").select("id", { count: "exact", head: true }).eq("id", 1),
    supabase.from("offers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("media_items").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const error =
    products.error || settings.error || offers.error || reviews.error || media.error;

  if (error) {
    return NextResponse.json(
      { ok: false, database: false, advancedCms: false },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      database: true,
      advancedCms: (settings.count ?? 0) === 1,
      products: products.count ?? 0,
      activeOffers: offers.count ?? 0,
      publishedReviews: reviews.count ?? 0,
      publishedMedia: media.count ?? 0,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
