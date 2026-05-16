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
      <main className="page page-anim">
        <Link href="/album" className="album-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
          Albums
        </Link>

        {/* Cinematic banner */}
        <section className="album-banner">
          <div
            className="cover-gradient"
            style={
              album.coverUrl
                ? {
                    backgroundImage: `url(${album.coverUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    background:
                      "linear-gradient(135deg, var(--sepia-500) 0%, var(--ink-surface) 100%)",
                  }
            }
          />
          <div className="grain-overlay" />
          <div className="banner-overlay" />
          <div className="banner-content">
            <div>
              <div className="banner-eyebrow">curated by {album.creatorName}</div>
              <h1 className="banner-title">{album.title}</h1>
              {album.description && (
                <p className="banner-desc">{album.description}</p>
              )}
            </div>
            <div className="banner-stat">
              <div className="stat-v">{posts.length}</div>
              <div className="stat-l">posts</div>
            </div>
          </div>
        </section>

        {/* Post count + add button row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "8px 0 24px",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span className="page-eyebrow" style={{ margin: 0 }}>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="M5 12h14"/>
            </svg>
            Add Post
          </button>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📷</p>
            <p>No posts yet. Be the first to add one!</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                id={p.id}
                description={p.description}
                photos={p.photos}
                creatorName={p.creatorName}
                creatorAvatar={p.creatorAvatar}
                createdAt={p.createdAt}
                canDelete={p.createdBy === currentUserId}
                onDelete={() => deletePost(p.id)}
                onSetCover={(url) => setCover(url)}
              />
            ))}
          </div>
        )}
      </main>

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
