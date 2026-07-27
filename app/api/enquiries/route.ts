import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const enquirySchema = z.object({
  enquiryType: z.enum(["repair", "exchange", "custom PC", "general"]),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+()\s-]{7,20}$/),
  budgetOrProduct: z.string().trim().max(150),
  preferredTime: z.string().trim().max(100),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0),
});

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    return errorResponse("Enquiry service is temporarily unavailable.", 503);
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  const parsed = enquirySchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("Please check the enquiry details and try again.", 400);
  }

  const value = parsed.data;
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const fingerprint = createHash("sha256")
    .update(`${ip}:${value.phone.toLowerCase()}`)
    .digest("hex");

  const supabase = createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: allowed, error: rateError } = await supabase.rpc(
    "allow_enquiry_attempt",
    { p_fingerprint: fingerprint },
  );

  if (rateError) {
    console.error("Enquiry rate-limit error:", rateError.message);
    return errorResponse("Unable to process the enquiry.", 500);
  }

  if (!allowed) {
    return errorResponse("Too many requests. Please try again in 15 minutes.", 429);
  }

  const { error } = await supabase.from("enquiries").insert({
    enquiry_type: value.enquiryType,
    customer_name: value.customerName,
    phone: value.phone,
    budget_or_product: value.budgetOrProduct,
    preferred_time: value.preferredTime,
    message: value.message,
  });

  if (error) {
    console.error("Enquiry insert error:", error.message);
    return errorResponse("Unable to save the enquiry.", 500);
  }

  return NextResponse.json(
    { ok: true },
    {
      status: 201,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}