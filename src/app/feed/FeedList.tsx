"use client";

import { useState, useRef } from "react";
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

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function FeedCard({
  post,
  currentUserId,
  onDelete,
}: {
  post: PostRow;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const sorted = [...post.photos].sort((a, b) => a.orderIndex - b.orderIndex);
  const hasMany = sorted.length > 1;

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  function goPrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }

  function goNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % sorted.length);
  }

  function goTo(e: React.MouseEvent, i: number) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(i);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setActiveIndex((i) => (i + 1) % sorted.length);
    else setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }

  return (
    <article className="feed-item">
      <header className="feed-header">
        {post.creatorAvatar ? (
          <img className="avatar-img" src={post.creatorAvatar} alt={post.creatorName} />
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
            {post.creatorName[0]?.toUpperCase()}
          </div>
        )}
        <div className="who">
          <div className="who-name">{post.creatorName}</div>
          <div className="when">
            <span>posted in </span>
            {post.albumTitle && post.albumId && (
              <Link href={`/album/${post.albumId}`} className="album-link">
                {post.albumTitle}
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

      <Link href={`/post/${post.id}`} style={{ display: "block" }}>
        <div
          className="feed-cover"
          onTouchStart={hasMany ? handleTouchStart : undefined}
          onTouchEnd={hasMany ? handleTouchEnd : undefined}
        >
          {sorted.length > 0 ? (
            sorted.map((photo, i) => (
              <img
                key={photo.url}
                src={photo.url}
                alt=""
                className={`feed-carousel-img${i === activeIndex ? " active" : ""}`}
              />
            ))
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, var(--sepia-500) 0%, var(--ink-surface) 100%)",
              }}
            />
          )}

          <div className="grain-overlay" />

          {hasMany && (
            <>
              <button
                className="feed-nav prev"
                onClick={goPrev}
                aria-label="Previous photo"
              >
                <ChevronLeftIcon />
              </button>
              <button
                className="feed-nav next"
                onClick={goNext}
                aria-label="Next photo"
              >
                <ChevronRightIcon />
              </button>
              <div className="feed-dots">
                {sorted.map((_, i) => (
                  <button
                    key={i}
                    className={`feed-dot${i === activeIndex ? " active" : ""}`}
                    onClick={(e) => goTo(e, i)}
                    aria-label={`Photo ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>

      {post.description && (
        <p className="feed-caption">
          <span className="quote-mark">&ldquo;</span>
          {post.description}
        </p>
      )}

      <div className="feed-actions">
        <button className="feed-action-btn">
          <HeartIcon /> 12
        </button>
        <button className="feed-action-btn">
          <CommentIcon /> 3
        </button>
        {post.createdBy === currentUserId && (
          <button
            className="feed-action-btn danger"
            onClick={() => onDelete(post.id)}
          >
            Delete
          </button>
        )}
        <Link href={`/post/${post.id}`} className="view-btn">
          View post <ArrowRightIcon />
        </Link>
      </div>
    </article>
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
      <div className="empty-state">
        <div className="empty-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h10" />
          </svg>
        </div>
        <p className="empty-title">Nothing posted yet</p>
        <p className="empty-hint">Go add some memories to get the feed started.</p>
      </div>
    );
  }

  return (
    <main className="page page-anim">
      <div style={{ maxWidth: 680, margin: "0 auto 36px" }}>
        <div className="page-eyebrow">Newest first · everyone&apos;s posts</div>
        <h1 className="page-title">
          The <em>Feed</em>
        </h1>
        <p className="page-sub" style={{ maxWidth: "44ch" }}>
          A scroll through everything our class posted lately.
        </p>
      </div>

      <div className="feed" data-hover="lift">
        {posts.map((p) => (
          <FeedCard
            key={p.id}
            post={p}
            currentUserId={currentUserId}
            onDelete={deletePost}
          />
        ))}
      </div>
    </main>
  );
}
