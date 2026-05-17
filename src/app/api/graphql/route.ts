import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "@/graphql/builder";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  maskedErrors: false,
});

// Build context in the Next.js route handler where auth() / cookies() work,
// then pass it as serverContext to yoga.
async function buildContext(): Promise<Context> {
  const session = await auth();
  console.log("[graphql] session user id:", session?.user?.id ?? "none");

  const db = await getDb();

  let currentUser = null;
  if (session?.user?.id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));
    console.log("[graphql] db user:", user?.id ?? "not found");
    currentUser = user ?? null;
  }

  return { db, user: currentUser };
}

export async function GET(request: Request) {
  const ctx = await buildContext();
  return yoga.fetch(request, ctx);
}

export async function POST(request: Request) {
  const ctx = await buildContext();
  return yoga.fetch(request, ctx);
}
