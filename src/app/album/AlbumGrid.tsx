"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlbumCard } from "@/components/AlbumCard";
import { CreateAlbumModal } from "@/components/CreateAlbumModal";

type AlbumRow = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  creatorName: string;
  postCount: number;
};

const MAGAZINE_PATTERN = ["feature", "tall", "wide", "small", "small", "small"] as const;

export function AlbumGrid({ albums }: { albums: AlbumRow[] }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const useMagazine = albums.length >= 4;

  return (
    <>
      <main className="page page-anim">
        <div className="page-head">
          <div>
            <div className="page-eyebrow">Class of &apos;24 · {albums.length} albums</div>
            <h1 className="page-title">Our <em>albums</em></h1>
            <p className="page-sub">
              Everything we made together, all in one place.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="M5 12h14"/>
            </svg>
            New Album
          </button>
        </div>

        {albums.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="14" height="14" rx="2"/>
                <path d="M7 21V9a2 2 0 0 1 2-2h12"/>
              </svg>
            </div>
            <p className="empty-title">No albums yet</p>
            <p className="empty-hint">Create the first one to start collecting memories.</p>
          </div>
        ) : (
          <div
            className={`album-grid ${useMagazine ? "layout-magazine" : "layout-cards"}`}
            data-hover="lift"
          >
            {albums.map((a, i) => (
              <AlbumCard
                key={a.id}
                {...a}
                variant={useMagazine ? MAGAZINE_PATTERN[i % MAGAZINE_PATTERN.length] : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateAlbumModal
          onClose={() => setShowModal(false)}
          onCreated={() => { router.refresh(); }}
        />
      )}
    </>
  );
}
