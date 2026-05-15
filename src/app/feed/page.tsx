import { auth } from "@/auth";
import { getDb } from "@/db";
import { posts, postPhotos, users, albums } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Header } from "@/components/Header";
import { FeedList } from "./FeedList";

export default async function FeedPage() {
  const session = await auth();
  const db = await getDb();

  const postRows = await db
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
    .orderBy(desc(posts.createdAt))
    .limit(50);

  const allPhotos =
    postRows.length > 0
      ? await db.select().from(postPhotos).orderBy(postPhotos.orderIndex)
      : [];

  const photosByPost: Record<string, { url: string; orderIndex: number }[]> = {};
  for (const p of allPhotos) {
    if (!photosByPost[p.postId]) photosByPost[p.postId] = [];
    photosByPost[p.postId].push({ url: p.url, orderIndex: p.orderIndex });
  }

  const feedData = postRows.map((p) => ({
    id: p.id,
    description: p.description,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy: p.createdBy,
    creatorName: p.creatorName ?? "Unknown",
    creatorAvatar: p.creatorAvatar,
    albumId: p.albumId,
    albumTitle: p.albumTitle ?? undefined,
    photos: photosByPost[p.id] ?? [],
  }));

  return (
    <div>
      <Header
        userName={session?.user?.name ?? ""}
        userAvatar={session?.user?.image}
      />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-white mb-6">Feed</h1>
        <FeedList posts={feedData} currentUserId={session?.user?.id ?? ""} />
      </main>
    </div>
  );
}
