import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { invites } from "@/db/schema";

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
      return !!invite;
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
