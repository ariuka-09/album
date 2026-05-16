import { createYoga } from "graphql-yoga";
import { schema } from "@/graphql/schema";
import { getToken } from "next-auth/jwt";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "@/graphql/builder";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response, Request, Headers },
  maskedErrors: false,
  logging: true,
});

async function buildContext(request: Request): Promise<Context> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieNames = cookieHeader.split(";").map(c => c.trim().split("=")[0]).filter(Boolean);
  console.log("[graphql] cookies present:", cookieNames.join(", ") || "none");
  console.log("[graphql] AUTH_SECRET set:", !!process.env.AUTH_SECRET);

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  console.log("[graphql] token sub:", token?.sub ?? "none");

  const db = await getDb();

  let currentUser = null;
  if (token?.sub) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, token.sub));
    console.log("[graphql] db user:", user?.id ?? "not found");
    currentUser = user ?? null;
  }

  return { db, user: currentUser };
}

export async function GET(request: Request) {
  const ctx = await buildContext(request);
  return yoga.fetch(request, ctx);
}

export async function POST(request: Request) {
  const ctx = await buildContext(request);
  return yoga.fetch(request, ctx);
}
