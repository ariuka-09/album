import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { invites, users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const { env } = await getCloudflareContext({ async: true });
      const db = drizzle(env.DB);

      const [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.email, user.email));
      if (!invite) return false;

      // Upsert user row so pages can query it immediately
      await db
        .insert(users)
        .values({
          id: user.id!,
          name: user.name ?? "Unknown",
          email: user.email,
          avatar: user.image ?? null,
          role: "member",
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { name: user.name ?? "Unknown", avatar: user.image ?? null },
        });

      return true;
    },
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
