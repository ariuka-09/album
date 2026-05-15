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
}: Props) {
  const sorted = [...photos].sort((a, b) => a.orderIndex - b.orderIndex);
  const cover = sorted[0];

  return (
    <div className="bg-zinc-800 rounded-xl overflow-hidden">
      {cover && (
        <Link href={`/post/${id}`}>
          <div className="aspect-video bg-zinc-700 overflow-hidden relative">
            <img
              src={cover.url}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {photos.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                +{photos.length - 1}
              </div>
            )}
          </div>
        </Link>
      )}
      <div className="p-4">
        {description && (
          <p className="text-zinc-200 text-sm mb-3 line-clamp-3">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs text-white font-bold">
                {creatorName[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-zinc-400 text-xs">{creatorName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            {albumTitle && albumId && (
              <Link
                href={`/album/${albumId}`}
                className="hover:text-zinc-300 transition-colors"
              >
                {albumTitle}
              </Link>
            )}
            <span>{new Date(createdAt).toLocaleDateString()}</span>
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
