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

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <path d="M7 10l5 5 5-5"/>
      <path d="M12 15V3"/>
    </svg>
  );
}

/**
 * Convert a photo URL into a download URL that forces the browser to save
 * the file rather than navigate to it. For URLs served by our /api/photos
 * handler, append ?download=<filename>. For any other absolute URL, fall back
 * to the original (browsers will still respect `<a download>` when same-origin).
 */
function toDownloadHref(url: string, index: number): { href: string; filename: string } {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const last = parsed.pathname.split("/").filter(Boolean).pop() ?? `photo-${index + 1}`;
    // Ensure there's an extension so the OS picks the right viewer
    const filename = /\.[a-z0-9]+$/i.test(last) ? last : `${last}.jpg`;
    parsed.searchParams.set("download", filename);
    return { href: parsed.pathname + parsed.search, filename };
  } catch {
    return { href: url, filename: `photo-${index + 1}.jpg` };
  }
}

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) return null;

  const { href: downloadHref, filename: downloadName } = toDownloadHref(photos[active], active);

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
          <a
            className="stage-download"
            href={downloadHref}
            download={downloadName}
            aria-label="Download photo"
            title="Download photo"
          >
            <DownloadIcon />
            <span>Download</span>
          </a>
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
