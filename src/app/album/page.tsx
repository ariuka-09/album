import { auth } from "@/auth";
import { getDb } from "@/db";
import { albums, posts, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Header } from "@/components/Header";
import { AlbumGrid } from "./AlbumGrid";

export default async function AlbumsPage() {
  const session = await auth();
  const db = await getDb();

  const rows = await db
    .select({
      id: albums.id,
      title: albums.title,
      description: albums.description,
      coverUrl: albums.coverUrl,
      creatorName: users.name,
    })
    .from(albums)
    .leftJoin(users, eq(albums.createdBy, users.id))
    .orderBy(desc(albums.createdAt));

  // Post counts per album
  const counts = await db
    .select({ albumId: posts.albumId, count: sql<number>`count(*)` })
    .from(posts)
    .groupBy(posts.albumId);

  const countMap = Object.fromEntries(counts.map((c) => [c.albumId, c.count]));

  const albumData = rows.map((a) => ({
    ...a,
    creatorName: a.creatorName ?? "Unknown",
    postCount: countMap[a.id] ?? 0,
  }));

  return (
    <div>
      <Header
        userName={session?.user?.name ?? ""}
        userAvatar={session?.user?.image}
      />
      <AlbumGrid albums={albumData} />
    </div>
  );
}
