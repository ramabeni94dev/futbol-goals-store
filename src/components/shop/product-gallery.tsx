"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="relative h-[380px] overflow-hidden rounded-[28px] border border-line bg-white/70 sm:h-[500px]">
        <Image src={selectedImage} alt={alt} fill className="object-cover" sizes="100vw" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={cn(
              "relative h-28 overflow-hidden rounded-[22px] border bg-white/70 transition",
              selectedImage === image ? "border-brand" : "border-line",
            )}
          >
            <Image src={image} alt={alt} fill className="object-cover" sizes="25vw" />
          </button>
        ))}
      </div>
    </div>
  );
}
