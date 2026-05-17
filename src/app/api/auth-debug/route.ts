import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieNames = cookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);

  const session = await auth();
  let dbUser = null;
  if (session?.user?.id) {
    const db = await getDb();
    const [u] = await db.select().from(users).where(eq(users.id, session.user.id));
    dbUser = u ?? null;
  }

  return Response.json({
    cookiesPresent: cookieNames,
    sessionUserId: session?.user?.id ?? null,
    sessionUserEmail: session?.user?.email ?? null,
    dbUserFound: !!dbUser,
    dbUserId: dbUser?.id ?? null,
  });
}
