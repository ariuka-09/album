import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  // Expose real errors so we can debug (will harden after root cause is found)
  maskedErrors: false,
  context: async () => {
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
  },
});

// Named async functions so Next.js fully initialises the route-handler
// context (headers, cookies) before graphql-yoga runs.
export async function GET(request: Request) {
  return yoga.fetch(request);
}

export async function POST(request: Request) {
  return yoga.fetch(request);
}
