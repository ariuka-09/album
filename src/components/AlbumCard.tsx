import Link from "next/link";

type Props = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  creatorName: string;
  postCount?: number;
};

export function AlbumCard({
  id,
  title,
  description,
  coverUrl,
  creatorName,
  postCount,
}: Props) {
  return (
    <Link href={`/album/${id}`} className="album-card" style={{ textDecoration: "none" }}>
      <div className="cover">
        <div
          className="cover-gradient"
          style={
            coverUrl
              ? {
                  backgroundImage: `url(${coverUrl})`,
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
        <div className="cover-meta">
          <div
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--cream-50)",
            }}
          >
            {postCount != null && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                {postCount}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="card-meta">
        <h3 className="card-title">{title}</h3>
        <div className="card-sub">
          <span className="by">{creatorName}</span>
          {description && (
            <>
              <span className="dot" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {description}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
