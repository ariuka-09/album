import Link from "next/link";

type Photo = { url: string; orderIndex: number };

type Props = {
  id: string;
  description?: string | null;
  photos: Photo[];
  creatorName: string;
  creatorAvatar?: string | null;
  albumTitle?: string;
  albumId?: string;
  createdAt: string;
  onDelete?: () => void;
  canDelete?: boolean;
  onSetCover?: (url: string) => void;
};

export function PostCard({
  id,
  description,
  photos,
  creatorName,
  creatorAvatar,
  albumTitle,
  albumId,
  createdAt,
  onDelete,
  canDelete,
  onSetCover,
}: Props) {
  const sorted = [...photos].sort((a, b) => a.orderIndex - b.orderIndex);
  const cover = sorted[0];

  const dateStr = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="post-card">
      <Link href={`/post/${id}`} style={{ display: "block" }}>
        <div className="cover">
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
          {photos.length > 1 && (
            <div className="photo-count">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              {" "}{photos.length}
            </div>
          )}
          <div className="hover-actions">
            {onSetCover && cover && (
              <button
                className="action-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetCover(cover.url);
                }}
              >
                Set cover
              </button>
            )}
            {canDelete && onDelete && (
              <button
                className="action-btn danger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </Link>
      <div className="card-meta">
        {description && <p className="post-caption">{description}</p>}
        <div className="post-byline">
          {creatorAvatar ? (
            <img className="avatar-img" src={creatorAvatar} alt={creatorName} />
          ) : (
            <div
              className="avatar-img"
              style={{
                background: "var(--sepia-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 600,
                color: "var(--cream-50)",
                flexShrink: 0,
              }}
            >
              {creatorName[0]?.toUpperCase()}
            </div>
          )}
          <span className="byline-name">{creatorName}</span>
          {albumTitle && albumId && (
            <>
              <span className="dot" />
              <Link
                href={`/album/${albumId}`}
                style={{ color: "var(--text-3)", fontSize: 12, textDecoration: "none" }}
              >
                {albumTitle}
              </Link>
            </>
          )}
          <span className="dot" />
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
