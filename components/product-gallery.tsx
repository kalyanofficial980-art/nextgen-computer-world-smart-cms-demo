"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: ProductImage[];
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div>
      <div className="relative h-[420px] overflow-hidden rounded-3xl bg-slate-950">
        <Image
          src={current.image_url}
          alt={current.alt_text || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={`${image.image_url}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              className={`relative h-20 overflow-hidden rounded-xl border ${
                selected === index ? "theme-border" : "border-slate-700"
              }`}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || `${name} image ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
