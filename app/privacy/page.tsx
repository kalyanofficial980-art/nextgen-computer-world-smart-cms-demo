import type { Metadata } from "next";
import { LegalContent } from "@/components/legal-content";
import { getBusinessSettings, getLegalPage } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const [page, settings] = await Promise.all([getLegalPage("privacy"), getBusinessSettings()]);
  return <LegalContent title={page?.title || "Privacy Policy"} content={page?.content || `${settings.business_name} uses submitted contact details only to respond to enquiries and maintain business records.`} />;
}
