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
    async signIn({ user, account }) {
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      // providerAccountId is the stable Google sub — use it as the user id
      const userId = account?.providerAccountId ?? user.id!;
      console.log("[auth] signIn attempt:", email, "userId:", userId);

      try {
        const { env } = await getCloudflareContext({ async: true });
        const db = drizzle(env.DB);

        // Use simple eq — emails are stored and compared as lowercase
        const [invite] = await db
          .select()
          .from(invites)
          .where(eq(invites.email, email));

        console.log("[auth] invite found:", !!invite);

        if (!invite) {
          console.log(`[auth] sign-in rejected: ${email} not on invite list`);
          return false;
        }

        // Upsert: if a stale row exists with same email but different id
        // (e.g. old UUID), update it to the correct Google sub.
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email))
          .get();

        console.log("[auth] existing user:", existing?.id ?? "none");

        if (existing && existing.id !== userId) {
          await db
            .update(users)
            .set({ id: userId, name: user.name ?? "Unknown", avatar: user.image ?? null })
            .where(eq(users.email, email));
        } else {
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
        }

        return true;
      } catch (err) {
        console.error("[auth] signIn callback error:", err);
        return false;
      }
    },
    jwt({ token, account }) {
      // Pin token.sub to the Google sub so it matches what we store in the
      // users table. Without this, next-auth may use an internal UUID instead.
      if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
