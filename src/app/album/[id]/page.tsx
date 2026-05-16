import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { albums, posts, postPhotos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Header } from "@/components/Header";
import { AlbumDetail } from "./AlbumDetail";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const db = await getDb();

  const [album] = await db
    .select({
      id: albums.id,
      title: albums.title,
      description: albums.description,
      coverUrl: albums.coverUrl,
      createdBy: albums.createdBy,
      creatorName: users.name,
    })
    .from(albums)
    .leftJoin(users, eq(albums.createdBy, users.id))
    .where(eq(albums.id, id));

  if (!album) notFound();

  const postRows = await db
    .select({
      id: posts.id,
      description: posts.description,
      createdBy: posts.createdBy,
      createdAt: posts.createdAt,
      creatorName: users.name,
      creatorAvatar: users.avatar,
    })
    .from(posts)
    .leftJoin(users, eq(posts.createdBy, users.id))
    .where(eq(posts.albumId, id))
    .orderBy(desc(posts.createdAt));

  const photoRows = await db
    .select()
    .from(postPhotos)
    .where(
      postRows.length > 0
        ? eq(postPhotos.postId, postRows[0].id) // initial seed; below we fetch all
        : eq(postPhotos.postId, "")
    );

  // Fetch all photos for all posts in one query
  const allPhotos =
    postRows.length > 0
      ? await db
          .select()
          .from(postPhotos)
          .orderBy(postPhotos.orderIndex)
      : [];

  const photosByPost: Record<string, typeof allPhotos> = {};
  for (const p of allPhotos) {
    if (!photosByPost[p.postId]) photosByPost[p.postId] = [];
    photosByPost[p.postId].push(p);
  }

  const postsData = postRows.map((p) => ({
    id: p.id,
    description: p.description,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    creatorName: p.creatorName ?? "Unknown",
    creatorAvatar: p.creatorAvatar,
    createdBy: p.createdBy,
    photos: (photosByPost[p.id] ?? []).map((ph) => ({
      url: ph.url,
      orderIndex: ph.orderIndex,
    })),
  }));

  return (
    <div>
      <Header
        userName={session?.user?.name ?? ""}
        userAvatar={session?.user?.image}
      />
      <AlbumDetail
        album={{
          id: album.id,
          title: album.title,
          description: album.description,
          coverUrl: album.coverUrl,
          creatorName: album.creatorName ?? "Unknown",
        }}
        posts={postsData}
        currentUserId={session?.user?.id ?? ""}
      />
    </div>
  );
}
