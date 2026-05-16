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

export function AlbumGrid({ albums }: { albums: AlbumRow[] }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

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
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🖼</p>
            <p>No albums yet. Create the first one!</p>
          </div>
        ) : (
          <div className="album-grid layout-cards">
            {albums.map((a) => (
              <AlbumCard key={a.id} {...a} />
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
