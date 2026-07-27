import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalContent } from "@/components/legal-content";
import { getLegalPage } from "@/lib/cms-repository";
import type { LegalPage } from "@/lib/cms-types";

export const dynamic = "force-dynamic";

const allowed: LegalPage["page_key"][] = ["refund", "warranty", "delivery"];

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  if (!allowed.includes(key as LegalPage["page_key"])) return { title: "Policy not found" };
  const page = await getLegalPage(key as LegalPage["page_key"]);
  return { title: page?.title || "Business Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!allowed.includes(key as LegalPage["page_key"])) notFound();
  const page = await getLegalPage(key as LegalPage["page_key"]);
  if (!page) notFound();
  return <LegalContent title={page.title} content={page.content} />;
}
