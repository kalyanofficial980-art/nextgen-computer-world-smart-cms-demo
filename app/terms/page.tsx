import type { Metadata } from "next";
import { LegalContent } from "@/components/legal-content";
import { getLegalPage } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Terms and Conditions" };

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalContent title={page?.title || "Terms and Conditions"} content={page?.content || "Confirm product price, stock, specifications, condition and warranty before purchase."} />;
}
