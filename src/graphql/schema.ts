import { eq, desc } from "drizzle-orm";
import { builder } from "./builder";
import { albums, posts, postPhotos, users } from "@/db/schema";

// ── Declare refs first so circular references work ─────────────────────────

type UserShape = { id: string; name: string; email: string; avatar: string | null; role: string };
type PostPhotoShape = { id: string; postId: string; url: string; orderIndex: number };
type PostShape = { id: string; description: string | null; albumId: string; createdBy: string; createdAt: Date };
type AlbumShape = { id: string; title: string; description: string | null; coverUrl: string | null; createdBy: string; createdAt: Date };

const UserType = builder.objectRef<UserShape>("User");
const PostPhotoType = builder.objectRef<PostPhotoShape>("PostPhoto");
const PostType = builder.objectRef<PostShape>("Post");
const AlbumType = builder.objectRef<AlbumShape>("Album");

// ── Implement types ────────────────────────────────────────────────────────

UserType.implement({
  fields: (t) => ({
    id: t.exposeString("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    avatar: t.exposeString("avatar", { nullable: true }),
    role: t.exposeString("role"),
  }),
});

PostPhotoType.implement({
  fields: (t) => ({
    id: t.exposeString("id"),
    url: t.exposeString("url"),
    orderIndex: t.exposeInt("orderIndex"),
  }),
});

PostType.implement({
  fields: (t) => ({
    id: t.exposeString("id"),
    description: t.exposeString("description", { nullable: true }),
    createdAt: t.string({ resolve: (p) => p.createdAt.toISOString() }),
    photos: t.field({
      type: [PostPhotoType],
      resolve: async (post, _args, ctx) =>
        ctx.db.select().from(postPhotos).where(eq(postPhotos.postId, post.id)).orderBy(postPhotos.orderIndex),
    }),
    createdBy: t.field({
      type: UserType,
      resolve: async (post, _args, ctx) => {
        const [user] = await ctx.db.select().from(users).where(eq(users.id, post.createdBy));
        return user;
      },
    }),
    album: t.field({
      type: AlbumType,
      resolve: async (post, _args, ctx) => {
        const [album] = await ctx.db.select().from(albums).where(eq(albums.id, post.albumId));
        return album;
      },
    }),
  }),
});

AlbumType.implement({
  fields: (t) => ({
    id: t.exposeString("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    coverUrl: t.exposeString("coverUrl", { nullable: true }),
    createdAt: t.string({ resolve: (a) => a.createdAt.toISOString() }),
    createdBy: t.field({
      type: UserType,
      resolve: async (album, _args, ctx) => {
        const [user] = await ctx.db.select().from(users).where(eq(users.id, album.createdBy));
        return user;
      },
    }),
    posts: t.field({
      type: [PostType],
      resolve: async (album, _args, ctx) =>
        ctx.db.select().from(posts).where(eq(posts.albumId, album.id)).orderBy(desc(posts.createdAt)),
    }),
  }),
});

// ── Query ──────────────────────────────────────────────────────────────────

builder.queryType({
  fields: (t) => ({
    albums: t.field({
      type: [AlbumType],
      resolve: async (_root, _args, ctx) =>
        ctx.db.select().from(albums).orderBy(desc(albums.createdAt)),
    }),

    album: t.field({
      type: AlbumType,
      nullable: true,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const [album] = await ctx.db.select().from(albums).where(eq(albums.id, args.id));
        return album ?? null;
      },
    }),

    feed: t.field({
      type: [PostType],
      args: {
        limit: t.arg.int({ defaultValue: 20 }),
        offset: t.arg.int({ defaultValue: 0 }),
      },
      resolve: async (_root, args, ctx) =>
        ctx.db
          .select()
          .from(posts)
          .orderBy(desc(posts.createdAt))
          .limit(args.limit ?? 20)
          .offset(args.offset ?? 0),
    }),

    post: t.field({
      type: PostType,
      nullable: true,
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        const [post] = await ctx.db.select().from(posts).where(eq(posts.id, args.id));
        return post ?? null;
      },
    }),
  }),
});

// ── Mutation ───────────────────────────────────────────────────────────────

builder.mutationType({
  fields: (t) => ({
    createAlbum: t.field({
      type: AlbumType,
      args: {
        title: t.arg.string({ required: true }),
        description: t.arg.string(),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.user) throw new Error("Unauthenticated");
        const [album] = await ctx.db
          .insert(albums)
          .values({ title: args.title, description: args.description ?? null, createdBy: ctx.user.id })
          .returning();
        return album;
      },
    }),

    deleteAlbum: t.field({
      type: "Boolean",
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        if (!ctx.user) throw new Error("Unauthenticated");
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        await ctx.db.delete(albums).where(eq(albums.id, args.id));
        return true;
      },
    }),

    updateAlbumCover: t.field({
      type: AlbumType,
      args: {
        id: t.arg.string({ required: true }),
        coverUrl: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.user) throw new Error("Unauthenticated");
        const [album] = await ctx.db
          .update(albums)
          .set({ coverUrl: args.coverUrl })
          .where(eq(albums.id, args.id))
          .returning();
        return album;
      },
    }),

    createPost: t.field({
      type: PostType,
      args: {
        albumId: t.arg.string({ required: true }),
        description: t.arg.string(),
        photoUrls: t.arg.stringList({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        if (!ctx.user) throw new Error("Unauthenticated");
        const [post] = await ctx.db
          .insert(posts)
          .values({ albumId: args.albumId, description: args.description ?? null, createdBy: ctx.user.id })
          .returning();

        if (args.photoUrls.length > 0) {
          await ctx.db.insert(postPhotos).values(
            args.photoUrls.map((url, i) => ({ postId: post.id, url, orderIndex: i }))
          );
        }

        return post;
      },
    }),

    deletePost: t.field({
      type: "Boolean",
      args: { id: t.arg.string({ required: true }) },
      resolve: async (_root, args, ctx) => {
        if (!ctx.user) throw new Error("Unauthenticated");
        const [post] = await ctx.db.select().from(posts).where(eq(posts.id, args.id));
        if (!post) throw new Error("Not found");
        if (post.createdBy !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Forbidden");
        await ctx.db.delete(posts).where(eq(posts.id, args.id));
        return true;
      },
    }),
  }),
});

export const schema = builder.toSchema();
