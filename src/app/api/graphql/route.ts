import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";

// Use AsyncLocalStorage so the session obtained at the route-handler boundary
// is available inside graphql-yoga's context factory without relying on
// Next.js's headers() AsyncLocalStorage (which yoga may not inherit).
import { AsyncLocalStorage } from "node:async_hooks";

const sessionStore = new AsyncLocalStorage<Session | null>();

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  context: async () => {
    const session = sessionStore.getStore() ?? null;
    const db = await getDb();

    let currentUser = null;
    if (session?.user?.id) {
      // User was created/updated in the signIn callback; just SELECT here.
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id));
      currentUser = user ?? null;
    }

    return { db, user: currentUser };
  },
});

async function handle(request: Request): Promise<Response> {
  // auth() is guaranteed to work here since we are inside a Next.js route handler.
  const session = await auth();
  // Run yoga inside the ALS context so the session is accessible in the
  // context factory no matter how yoga schedules the async work.
  return sessionStore.run(session, () => yoga.fetch(request));
}

export const GET = handle;
export const POST = handle;
