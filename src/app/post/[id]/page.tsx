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

  return (
    <div>
      <Header
        userName={session?.user?.name ?? ""}
        userAvatar={session?.user?.image}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href={`/album/${post.albumId}`}
          className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          ← {post.albumTitle ?? "Album"}
        </Link>

        <div className="mt-6">
          <PhotoGallery photos={photos.map((p) => p.url)} />

          <div className="mt-6 flex items-center gap-3">
            {post.creatorAvatar ? (
              <img
                src={post.creatorAvatar}
                alt={post.creatorName ?? ""}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold">
                {post.creatorName?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-medium">
                {post.creatorName ?? "Unknown"}
              </p>
              <p className="text-zinc-500 text-xs">
                {post.createdAt?.toLocaleDateString()}
              </p>
            </div>
          </div>

          {post.description && (
            <p className="text-zinc-200 text-sm mt-4 leading-relaxed">
              {post.description}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
