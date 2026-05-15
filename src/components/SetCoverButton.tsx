"use client";

import { useState } from "react";

type Props = {
  albumId: string;
  photoUrl: string;
  onUpdated?: () => void;
};

export function SetCoverButton({ albumId, photoUrl, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);

  async function setCover() {
    setLoading(true);
    await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation UpdateAlbumCover($id: String!, $coverUrl: String!) {
            updateAlbumCover(id: $id, coverUrl: $coverUrl) { id }
          }
        `,
        variables: { id: albumId, coverUrl: photoUrl },
      }),
    });
    setLoading(false);
    onUpdated?.();
  }

  return (
    <button
      onClick={setCover}
      disabled={loading}
      className="text-xs bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      {loading ? "…" : "Set cover"}
    </button>
  );
}
