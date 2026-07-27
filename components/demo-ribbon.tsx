import { siteConfig } from "@/lib/site";

export function DemoRibbon() {
  return (
    <div className="border-b border-cyan-400/15 bg-[#030812] px-4 py-2 text-center text-[11px] text-slate-400">
      <strong className="text-cyan-300">SMART CATALOGUE CMS DEMO</strong>
      <span className="mx-2">•</span>
      Regular KWS price {siteConfig.regularPrice}
      <span className="mx-2">•</span>
      <strong className="text-emerald-300">
        Founder launch offer {siteConfig.founderPrice} • first 3 clients
      </strong>
      <span className="mx-2">•</span>
      30 initial products
      <span className="mx-2">•</span>
      Secure owner dashboard
    </div>
  );
}
