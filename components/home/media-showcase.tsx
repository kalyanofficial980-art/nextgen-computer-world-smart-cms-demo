"use client";

import Image from "next/image";
import type { MediaItem } from "@/lib/cms-types";

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
    }

    const id = parsed.searchParams.get("v");
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;

    const parts = parsed.pathname.split("/").filter(Boolean);
    const shortIndex = parts.findIndex((part) => part === "shorts" || part === "embed");
    if (shortIndex >= 0 && parts[shortIndex + 1]) {
      return `https://www.youtube-nocookie.com/embed/${parts[shortIndex + 1]}`;
    }
  } catch {
    return null;
  }

  return null;
}

function instagramEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("instagram.com")) return null;
    return `${parsed.origin}${parsed.pathname.replace(/\/$/, "")}/embed`;
  } catch {
    return null;
  }
}

function facebookEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "facebook.com" && !host.endsWith(".facebook.com") && host !== "fb.watch") return null;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(parsed.toString())}&show_text=false&width=560`;
  } catch {
    return null;
  }
}

export function MediaShowcase({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const youtube = item.provider === "youtube" ? youtubeEmbed(item.media_url) : null;
        const instagram = item.provider === "instagram" ? instagramEmbed(item.media_url) : null;
        const facebook = item.provider === "facebook" ? facebookEmbed(item.media_url) : null;

        return (
          <article key={item.id} className="surface overflow-hidden rounded-3xl">
            <div className="relative aspect-video bg-slate-950">
              {youtube ? (
                <iframe
                  src={youtube}
                  title={item.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : instagram ? (
                <iframe
                  src={instagram}
                  title={item.title}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : facebook ? (
                <iframe
                  src={facebook}
                  title={item.title}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : item.provider === "uploaded" && /\.(mp4|webm)(\?|$)/i.test(item.media_url) ? (
                <video
                  src={item.media_url}
                  controls
                  preload="metadata"
                  poster={item.thumbnail_url || undefined}
                  className="h-full w-full object-cover"
                />
              ) : item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">
                  Open this {item.provider} post to watch.
                </div>
              )}
            </div>

            <div className="p-5">
              <span className="theme-text text-[10px] font-black tracking-[0.14em] uppercase">
                {item.provider}
              </span>
              <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm text-slate-500">{item.description}</p>}
              {!youtube && !instagram && !facebook && item.provider !== "uploaded" && (
                <a
                  href={item.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="theme-text mt-4 inline-block text-sm font-black"
                >
                  Watch now →
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
