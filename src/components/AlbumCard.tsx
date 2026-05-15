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
    <Link
      href={`/album/${id}`}
      className="group block bg-zinc-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-white/20 transition-all"
    >
      <div className="aspect-video bg-zinc-700 relative overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-4xl">
            🖼
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{title}</h3>
        {description && (
          <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
          <span>by {creatorName}</span>
          {postCount != null && (
            <span>
              {postCount} {postCount === 1 ? "post" : "posts"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
