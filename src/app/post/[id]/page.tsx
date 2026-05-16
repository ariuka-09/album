import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { posts, postPhotos, users, albums } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Header } from "@/components/Header";
import Link from "next/link";
import { PhotoGallery } from "./PhotoGallery";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const db = await getDb();

  const [post] = await db
    .select({
      id: posts.id,
      description: posts.description,
      createdAt: posts.createdAt,
      createdBy: posts.createdBy,
      albumId: posts.albumId,
      creatorName: users.name,
      creatorAvatar: users.avatar,
      albumTitle: albums.title,
    })
    .from(posts)
    .leftJoin(users, eq(posts.createdBy, users.id))
    .leftJoin(albums, eq(posts.albumId, albums.id))
    .where(eq(posts.id, id));

  if (!post) notFound();

  const photos = await db
    .select()
    .from(postPhotos)
    .where(eq(postPhotos.postId, id))
    .orderBy(postPhotos.orderIndex);

  const dateStr = post.createdAt?.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const since = post.createdAt
    ? (() => {
        const diff = Date.now() - new Date(post.createdAt).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return "today";
        if (days === 1) return "yesterday";
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
      })()
    : "";

  return (
    <div>
      <Header
        userName={session?.user?.name ?? ""}
        userAvatar={session?.user?.image}
      />

      <main className="post-detail page-anim">
        {/* Cinematic photo stage */}
        <PhotoGallery photos={photos.map((p) => p.url)} />

        {/* Post metadata section */}
        <section className="post-meta-section">
          <Link href={`/album/${post.albumId}`} className="album-back" style={{ display: "inline-flex", marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            {post.albumTitle ?? "Album"}
          </Link>

          <div className="post-meta-row">
            {post.creatorAvatar ? (
              <img className="avatar-img" src={post.creatorAvatar} alt={post.creatorName ?? ""} />
            ) : (
              <div
                className="avatar-img"
                style={{
                  background: "var(--sepia-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--cream-50)",
                }}
              >
                {post.creatorName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="meta-who">
              <div className="meta-name">{post.creatorName ?? "Unknown"}</div>
              <div className="meta-when">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                {" "}{dateStr} · {since}
              </div>
            </div>
            <Link href={`/album/${post.albumId}`} className="album-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 21V9a2 2 0 0 1 2-2h12"/>
              </svg>
              {" "}{post.albumTitle}
            </Link>
          </div>

          {post.description && (
            <p className="post-body-caption">{post.description}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32, color: "var(--text-3)", fontSize: 13 }}>
            <button className="btn btn-subtle btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Like
            </button>
            <button className="btn btn-subtle btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              Comment
            </button>
            <button className="btn btn-subtle btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>
              </svg>
              Download
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
