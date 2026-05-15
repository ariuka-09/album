import { auth } from "@/auth";
import { getDb } from "@/db";
import { invites, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  return user?.role === "admin" ? db : null;
}

export async function POST(req: Request) {
  const db = await assertAdmin();
  if (!db) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  await db.insert(invites).values({ email: email.toLowerCase() }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const db = await assertAdmin();
  if (!db) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json() as { email: string };
  await db.delete(invites).where(eq(invites.email, email));
  return NextResponse.json({ ok: true });
}
