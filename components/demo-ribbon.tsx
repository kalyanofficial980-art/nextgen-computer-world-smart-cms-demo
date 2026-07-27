import { siteConfig } from "@/lib/site";

export function DemoRibbon() {
  return (
    <div className="border-b border-cyan-400/15 bg-[#030812] px-4 py-2 text-center text-[11px] text-slate-400">
      <strong className="text-cyan-300">SMART CATALOGUE CMS DEMO</strong>
      <span className="mx-2">•</span>
      Regular KWS price {siteConfig.regularPrice}
      <span className="mx-2">•</span>
      <strong className="text-emerald-300">
        Founder launch offer {siteConfig.founderPrice}
      </strong>
      <span className="mx-2">•</span>
      Public website ready
      <span className="mx-2">•</span>
      Supabase CMS connection is Phase 2
    </div>
  );
}
