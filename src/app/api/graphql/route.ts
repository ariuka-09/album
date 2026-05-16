import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  maskedErrors: false,
  context: async ({ request }) => {
    // Use getToken so we read directly from the request's cookies,
    // bypassing Next.js AsyncLocalStorage which is unavailable inside yoga.
    const token = await getToken({
      req: request as Parameters<typeof getToken>[0]["req"],
      secret: process.env.AUTH_SECRET!,
    });
    const userId = token?.sub ?? null;
    console.log("[graphql] token sub:", userId ?? "none");

    const db = await getDb();

    let currentUser = null;
    if (userId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
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
