"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { CreatePostModal } from "@/components/CreatePostModal";

type Photo = { url: string; orderIndex: number };
type PostRow = {
  id: string;
  description: string | null;
  createdAt: string;
  creatorName: string;
  creatorAvatar: string | null | undefined;
  createdBy: string;
  photos: Photo[];
};

type AlbumInfo = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  creatorName: string;
};

type Props = {
  album: AlbumInfo;
  posts: PostRow[];
  currentUserId: string;
};

export function AlbumDetail({ album, posts, currentUserId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation DeletePost($id: String!) { deletePost(id: $id) }`,
        variables: { id: postId },
      }),
    });
    router.refresh();
  }

  async function setCover(url: string) {
    await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation UpdateAlbumCover($id: String!, $coverUrl: String!) {
          updateAlbumCover(id: $id, coverUrl: $coverUrl) { id }
        }`,
        variables: { id: album.id, coverUrl: url },
      }),
    });
    router.refresh();
  }

  return (
    <>
      {/* Album header */}
      <div className="mb-8">
        <Link href="/album" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Albums
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{album.title}</h1>
            {album.description && (
              <p className="text-zinc-400 text-sm mt-1">{album.description}</p>
            )}
            <p className="text-zinc-500 text-xs mt-1">by {album.creatorName}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors shrink-0"
          >
            + Add Post
          </button>
        </div>

        {album.coverUrl && (
          <div className="mt-4 rounded-xl overflow-hidden h-48 bg-zinc-800">
            <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-4xl mb-3">📷</p>
          <p>No posts yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="group relative">
              <PostCard
                id={p.id}
                description={p.description}
                photos={p.photos}
                creatorName={p.creatorName}
                creatorAvatar={p.creatorAvatar}
                createdAt={p.createdAt}
                canDelete={p.createdBy === currentUserId}
                onDelete={() => deletePost(p.id)}
              />
              {p.photos[0] && (
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setCover(p.photos[0].url)}
                    className="text-xs bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded transition-colors"
                  >
                    Set cover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreatePostModal
          albumId={album.id}
          onClose={() => setShowModal(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}
