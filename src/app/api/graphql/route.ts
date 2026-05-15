import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  context: async () => {
    const session = await auth();
    const db = await getDb();

    let currentUser = null;
    if (session?.user?.id) {
      const [user] = await db
        .insert(users)
        .values({
          id: session.user.id,
          name: session.user.name ?? "Unknown",
          email: session.user.email ?? "",
          avatar: session.user.image ?? null,
          role: "member",
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: session.user.name ?? "Unknown",
            avatar: session.user.image ?? null,
          },
        })
        .returning();
      currentUser = user;
    }

    return { db, user: currentUser };
  },
});

export const GET = yoga.fetch;
export const POST = yoga.fetch;
