import { auth } from "@/auth";
import { getDb } from "@/db";
import { invites, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { InviteManager } from "./InviteManager";

export default async function AdminPage() {
  const session = await auth();
  const db = await getDb();

  // Only admins can access this page
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id ?? ""));

  if (!currentUser || currentUser.role !== "admin") redirect("/album");

  const allInvites = await db.select().from(invites).orderBy(invites.email);

  return (
    <div>
      <Header userName={currentUser.name} userAvatar={currentUser.avatar} />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-white mb-6">Manage Invites</h1>
        <InviteManager invites={allInvites.map((i) => i.email)} />
      </main>
    </div>
  );
}
