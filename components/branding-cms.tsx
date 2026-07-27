
"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/client";
import { fallbackSiteSettings, normalizeSiteSettings, type SiteSettings } from "@/lib/site";

type EditableSiteSettings = Omit<SiteSettings, "updated_at">;

const colorFields = [
  ["primary_color", "Primary colour"],
  ["secondary_color", "Secondary colour"],
  ["accent_color", "WhatsApp / CTA colour"],
  ["background_color", "Website background"],
  ["panel_color", "Card / panel colour"],
  ["text_color", "Main text colour"],
] as const;

function fileNameFromUrl(url: string) {
  if (!url) return "Not uploaded";

  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.split("/").pop() || "Uploaded image");
  } catch {
    return "Uploaded image";
  }
}

function Field({
  label,
  children,
  help,
}: {
  label: string;
  children: ReactNode;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-slate-300">
        {label}
      </span>
      {children}
      {help && <span className="mt-1.5 block text-[11px] text-slate-500">{help}</span>}
    </label>
  );
}

export function BrandingCms() {
  const supabase = useMemo(() => createClient(), []);
  const [settings, setSettings] = useState<EditableSiteSettings>(fallbackSiteSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading branding settings…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("singleton_key", "main")
      .maybeSingle();

    if (error && !error.message.toLowerCase().includes("does not exist")) {
      setMessage(error.message);
      return;
    }

    setSettings(normalizeSiteSettings(data as Partial<SiteSettings> | null));
    setMessage("Branding CMS ready. Change logo, colours, business details and homepage hero here.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  function update<K extends keyof EditableSiteSettings>(key: K, value: EditableSiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateFile(kind: "logo" | "favicon" | "hero") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      if (kind === "logo") setLogoFile(file);
      if (kind === "favicon") setFaviconFile(file);
      if (kind === "hero") setHeroFile(file);
    };
  }

  async function uploadBrandAsset(file: File | null, folder: string) {
    if (!file) return "";

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/x-icon"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Upload JPG, PNG, WebP or ICO files only.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Uploaded image must be below 5 MB.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("brand-assets")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("Saving branding settings…");

    try {
      const [logoUrl, faviconUrl, heroUrl] = await Promise.all([
        uploadBrandAsset(logoFile, "logos"),
        uploadBrandAsset(faviconFile, "favicons"),
        uploadBrandAsset(heroFile, "hero"),
      ]);

      const payload: EditableSiteSettings = {
        ...settings,
        singleton_key: "main",
        logo_url: logoUrl || settings.logo_url,
        favicon_url: faviconUrl || settings.favicon_url,
        hero_image_url: heroUrl || settings.hero_image_url,
        business_name: settings.business_name.trim(),
        tagline: settings.tagline.trim(),
        short_tagline: settings.short_tagline.trim(),
        phone_display: settings.phone_display.trim(),
        phone_link: settings.phone_link.trim(),
        whatsapp_number: settings.whatsapp_number.replace(/[^0-9]/g, ""),
        email: settings.email.trim(),
        owner_email: settings.owner_email.trim(),
        location: settings.location.trim(),
        maps_url: settings.maps_url.trim(),
        working_hours: settings.working_hours.trim(),
        announcement_text: settings.announcement_text.trim(),
        hero_eyebrow: settings.hero_eyebrow.trim(),
        hero_title: settings.hero_title.trim(),
        hero_highlight: settings.hero_highlight.trim(),
        hero_description: settings.hero_description.trim(),
        hero_cta_label: settings.hero_cta_label.trim(),
        hero_cta_href: settings.hero_cta_href.trim(),
        hero_secondary_label: settings.hero_secondary_label.trim(),
        hero_secondary_href: settings.hero_secondary_href.trim(),
      };

      if (!payload.business_name || !payload.phone_display || !payload.whatsapp_number || !payload.email) {
        throw new Error("Business name, phone, WhatsApp number and email are required.");
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "singleton_key" });

      if (error) throw error;

      setSettings(payload);
      setLogoFile(null);
      setFaviconFile(null);
      setHeroFile(null);
      setMessage("Branding saved. Refresh the website to see the updated logo, colours and homepage banner.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save branding settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <section className="surface rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <Icon name="upload" className="mt-1 size-6 text-cyan-300" />
            <div>
              <h2 className="text-2xl font-black text-white">Logo and brand assets</h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload images directly. No image URL is required for logo, favicon or homepage hero.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
              <div className="grid h-24 place-items-center rounded-xl bg-white/95 p-3">
                {settings.logo_url ? (
                  <Image src={settings.logo_url} alt="Current logo" width={120} height={80} className="max-h-20 w-auto object-contain" />
                ) : (
                  <span className="text-sm font-black text-slate-700">No logo</span>
                )}
              </div>
              <p className="mt-3 truncate text-xs text-slate-500">{fileNameFromUrl(settings.logo_url)}</p>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={updateFile("logo")} className="mt-3 w-full text-xs text-slate-400" />
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
              <div className="grid h-24 place-items-center rounded-xl bg-white/95 p-3">
                {settings.favicon_url ? (
                  <Image src={settings.favicon_url} alt="Current favicon" width={64} height={64} className="max-h-16 w-auto object-contain" />
                ) : (
                  <span className="text-sm font-black text-slate-700">No favicon</span>
                )}
              </div>
              <p className="mt-3 truncate text-xs text-slate-500">{fileNameFromUrl(settings.favicon_url)}</p>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/x-icon" onChange={updateFile("favicon")} className="mt-3 w-full text-xs text-slate-400" />
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
              <div className="relative h-24 overflow-hidden rounded-xl bg-slate-900">
                {settings.hero_image_url ? (
                  <Image src={settings.hero_image_url} alt="Homepage hero" fill sizes="220px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center text-sm font-black text-slate-500">No hero</span>
                )}
              </div>
              <p className="mt-3 truncate text-xs text-slate-500">{fileNameFromUrl(settings.hero_image_url)}</p>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={updateFile("hero")} className="mt-3 w-full text-xs text-slate-400" />
            </div>
          </div>
        </section>

        <section className="surface rounded-3xl p-6">
          <h2 className="text-2xl font-black text-white">Theme colour editor</h2>
          <p className="mt-1 text-sm text-slate-500">
            These colours control the website background, panels, buttons, announcement bar and hero accents.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {colorFields.map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60">
                  <input
                    type="color"
                    value={settings[key]}
                    onChange={(event) => update(key, event.target.value)}
                    className="h-12 w-14 border-0 bg-transparent p-1"
                  />
                  <input
                    value={settings[key]}
                    onChange={(event) => update(key, event.target.value)}
                    className="min-h-12 flex-1 bg-transparent px-3 text-sm text-white"
                  />
                </div>
              </Field>
            ))}
          </div>
        </section>
      </div>

      <section className="surface rounded-3xl p-6">
        <h2 className="text-2xl font-black text-white">Business details editor</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Business name">
            <input required value={settings.business_name} onChange={(event) => update("business_name", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Tagline">
            <input value={settings.tagline} onChange={(event) => update("tagline", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Short header tagline">
            <input value={settings.short_tagline} onChange={(event) => update("short_tagline", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Phone display">
            <input required value={settings.phone_display} onChange={(event) => update("phone_display", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Phone link" help="Example: +918328571256">
            <input value={settings.phone_link} onChange={(event) => update("phone_link", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="WhatsApp number" help="Numbers only with country code.">
            <input required value={settings.whatsapp_number} onChange={(event) => update("whatsapp_number", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Public email">
            <input required type="email" value={settings.email} onChange={(event) => update("email", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Owner email" help="Displayed in settings. Security still uses the protected owner role.">
            <input type="email" value={settings.owner_email} onChange={(event) => update("owner_email", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Working hours">
            <input value={settings.working_hours} onChange={(event) => update("working_hours", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Location">
            <input value={settings.location} onChange={(event) => update("location", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Google Maps URL">
            <input value={settings.maps_url} onChange={(event) => update("maps_url", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
        </div>
      </section>

      <section className="surface rounded-3xl p-6">
        <h2 className="text-2xl font-black text-white">Homepage banner editor</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Hero eyebrow">
            <input value={settings.hero_eyebrow} onChange={(event) => update("hero_eyebrow", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Hero title">
            <input value={settings.hero_title} onChange={(event) => update("hero_title", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Hero highlighted words">
            <input value={settings.hero_highlight} onChange={(event) => update("hero_highlight", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Primary button label">
            <input value={settings.hero_cta_label} onChange={(event) => update("hero_cta_label", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Primary button link">
            <input value={settings.hero_cta_href} onChange={(event) => update("hero_cta_href", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Secondary button label">
            <input value={settings.hero_secondary_label} onChange={(event) => update("hero_secondary_label", event.target.value)} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
          </Field>
          <Field label="Hero description">
            <textarea value={settings.hero_description} onChange={(event) => update("hero_description", event.target.value)} rows={4} className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-white" />
          </Field>
          <Field label="Announcement bar text">
            <textarea value={settings.announcement_text} onChange={(event) => update("announcement_text", event.target.value)} rows={4} className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-white" />
          </Field>
          <label className="flex items-center gap-3 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={settings.announcement_enabled} onChange={(event) => update("announcement_enabled", event.target.checked)} className="size-4 accent-cyan-300" />
            Show announcement bar on homepage/header
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-cyan-300/20 bg-slate-950/90 p-4 shadow-2xl backdrop-blur">
        <p className="text-sm text-cyan-100" aria-live="polite">{message}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button disabled={saving} type="submit" className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-5 font-black text-slate-950 disabled:opacity-50">
            {saving ? "Saving…" : "Save Phase 3A settings"}
          </button>
          <button type="button" onClick={() => void load()} className="focus-ring min-h-12 rounded-xl border border-slate-700 px-5 font-black text-white">
            Reload settings
          </button>
        </div>
      </div>
    </form>
  );
}
