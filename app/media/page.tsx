import type { Metadata } from "next";
import { MediaShowcase } from "@/components/home/media-showcase";
import { getPublishedMedia } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videos & Reels",
  description:
    "Product videos, demonstrations, YouTube updates and social-media reels.",
};

export default async function MediaPage() {
  const media = await getPublishedMedia({ homepageOnly: false, limit: 100 });

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="theme-text text-xs font-black tracking-[0.15em] uppercase">
            Videos & Reels
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Product showcases, demonstrations and updates.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Watch published YouTube videos, Instagram reels, Facebook videos and uploaded clips.
          </p>
        </div>

        {media.length ? (
          <div className="mt-12">
            <MediaShowcase items={media} />
          </div>
        ) : (
          <div className="surface mx-auto mt-12 max-w-xl rounded-3xl p-10 text-center text-slate-400">
            Published videos and reels will appear here.
          </div>
        )}
      </div>
    </section>
  );
}
