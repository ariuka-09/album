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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Albums</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          + New Album
        </button>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-4xl mb-3">🖼</p>
          <p>No albums yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((a) => (
            <AlbumCard key={a.id} {...a} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateAlbumModal
          onClose={() => setShowModal(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}
