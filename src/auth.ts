import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { invites, users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      // providerAccountId is the stable Google sub — same as token.sub
      const userId = account?.providerAccountId ?? user.id!;

      try {
        const { env } = await getCloudflareContext({ async: true });
        const db = drizzle(env.DB);

        const [invite] = await db
          .select()
          .from(invites)
          .where(sql`lower(${invites.email}) = ${email}`);

        if (!invite) {
          console.log(`[auth] sign-in rejected: ${email} not on invite list`);
          return false;
        }

        await db
          .insert(users)
          .values({
            id: userId,
            name: user.name ?? "Unknown",
            email,
            avatar: user.image ?? null,
            role: "member",
            createdAt: new Date(),
          })
          .onConflictDoUpdate({
            target: users.id,
            set: { name: user.name ?? "Unknown", avatar: user.image ?? null },
          });

        return true;
      } catch (err) {
        console.error("[auth] signIn callback error:", err);
        return false;
      }
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
