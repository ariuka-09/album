"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

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

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
      <circle cx="19" cy="12" r="1" fill="currentColor"/>
      <circle cx="5"  cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

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
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>📷</p>
        <p>Nothing posted yet. Go add some memories!</p>
      </div>
    );
  }

  return (
    <main className="page page-anim">
      <div style={{ maxWidth: 680, margin: "0 auto 36px" }}>
        <div className="page-eyebrow">Newest first · everyone&apos;s posts</div>
        <h1 className="page-title">The <em>Feed</em></h1>
        <p className="page-sub" style={{ maxWidth: "44ch" }}>
          A scroll through everything our class posted lately.
        </p>
      </div>

      <div className="feed">
        {posts.map((p) => {
          const sorted = [...p.photos].sort((a, b) => a.orderIndex - b.orderIndex);
          const cover = sorted[0];
          const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <article key={p.id} className="feed-item">
              <header className="feed-header">
                {p.creatorAvatar ? (
                  <img className="avatar-img" src={p.creatorAvatar} alt={p.creatorName} />
                ) : (
                  <div
                    className="avatar-img"
                    style={{
                      background: "var(--sepia-500)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--cream-50)",
                    }}
                  >
                    {p.creatorName[0]?.toUpperCase()}
                  </div>
                )}
                <div className="who">
                  <div className="who-name">{p.creatorName}</div>
                  <div className="when">
                    <span>posted in </span>
                    {p.albumTitle && p.albumId && (
                      <Link href={`/album/${p.albumId}`} className="album-link">
                        {p.albumTitle}
                      </Link>
                    )}
                    <span className="dot" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <button className="icon-btn" style={{ width: 30, height: 30 }} title="More">
                  <MoreIcon />
                </button>
              </header>

              <Link href={`/post/${p.id}`} style={{ display: "block" }}>
                <div className="feed-cover">
                  {cover ? (
                    <div
                      className="cover-gradient"
                      style={{
                        backgroundImage: `url(${cover.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div
                      className="cover-gradient"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--sepia-500) 0%, var(--ink-surface) 100%)",
                      }}
                    />
                  )}
                  <div className="grain-overlay" />
                  {p.photos.length > 1 && (
                    <div className="feed-photo-count">{p.photos.length} photos</div>
                  )}
                </div>
              </Link>

              {p.description && (
                <p className="feed-caption">
                  <span className="quote-mark">&ldquo;</span>
                  {p.description}
                </p>
              )}

              <div className="feed-actions">
                <button>
                  <HeartIcon /> 12
                </button>
                <button>
                  <CommentIcon /> 3
                </button>
                {p.createdBy === currentUserId && (
                  <button
                    onClick={() => deletePost(p.id)}
                    style={{ color: "var(--text-3)" }}
                  >
                    Delete
                  </button>
                )}
                <Link href={`/post/${p.id}`} className="view-btn">
                  View post <ArrowRightIcon />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
