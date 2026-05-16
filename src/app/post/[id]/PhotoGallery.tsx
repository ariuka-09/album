"use client";

import { useState } from "react";

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
    </svg>
  );
}

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="post-stage">
      <div className="post-stage-inner">
        <div className="stage-frame">
          <img
            src={photos[active]}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "var(--radius-xl)",
            }}
          />
          <div className="photo-num">
            {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </div>
          {photos.length > 1 && (
            <>
              <button
                className="stage-nav prev"
                onClick={() => setActive((i) => (i - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
              >
                <ArrowLeftIcon />
              </button>
              <button
                className="stage-nav next"
                onClick={() => setActive((i) => (i + 1) % photos.length)}
                aria-label="Next photo"
              >
                <ArrowRightIcon />
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="thumb-strip">
            {photos.map((url, i) => (
              <button
                key={i}
                className={`thumb ${i === active ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <img
                  src={url}
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
