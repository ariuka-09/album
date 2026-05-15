"use client";

import { useState } from "react";

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div>
      <div className="rounded-xl overflow-hidden bg-zinc-800 aspect-video">
        <img
          src={photos[active]}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-white" : "border-transparent"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
