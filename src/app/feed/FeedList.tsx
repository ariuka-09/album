"use client";

import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";

type Photo = { url: string; orderIndex: number };
type PostRow = {
  id: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string | null | undefined;
  albumId: string;
  albumTitle?: string;
  photos: Photo[];
};

export function FeedList({
  posts,
  currentUserId,
}: {
  posts: PostRow[];
  currentUserId: string;
}) {
  const router = useRouter();

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation DeletePost($id: String!) { deletePost(id: $id) }`,
        variables: { id },
      }),
    });
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <p className="text-4xl mb-3">📷</p>
        <p>Nothing posted yet. Go add some memories!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          id={p.id}
          description={p.description}
          photos={p.photos}
          creatorName={p.creatorName}
          creatorAvatar={p.creatorAvatar}
          albumTitle={p.albumTitle}
          albumId={p.albumId}
          createdAt={p.createdAt}
          canDelete={p.createdBy === currentUserId}
          onDelete={() => deletePost(p.id)}
        />
      ))}
    </div>
  );
}
