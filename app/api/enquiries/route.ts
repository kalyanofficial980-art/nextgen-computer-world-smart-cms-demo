import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";

const enquirySchema = z.object({
  enquiryType: z.enum(["repair", "exchange", "custom PC", "general"]),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  budgetOrProduct: z.string().trim().max(150),
  preferredTime: z.string().trim().max(100),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0),
});

export async function POST(request: Request) {
  const supabase = createPublicClient();

  if (!supabase) {
    return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });
  }

  const parsed = enquirySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  }

  const value = parsed.data;
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
    return NextResponse.json({ error: "Unable to save enquiry." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
