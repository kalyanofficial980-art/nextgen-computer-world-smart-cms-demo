import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, database: false },
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

  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  if (error) {
    return NextResponse.json(
      { ok: false, database: false },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, database: true, products: count ?? 0 },
    { headers: { "cache-control": "no-store" } },
  );
}