import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Real authentication for Tiger Track, backed by Google OAuth.
 *
 * The previous "LoginGate" only checked that a user-typed string matched
 * *@tigerdata.com in a client-side regex — it never verified the visitor
 * actually owned that address. This config replaces it with Google OAuth
 * and rejects any account whose verified email isn't on the tigerdata.com
 * domain, in the signIn callback below (this runs server-side and cannot
 * be bypassed from the browser).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase() ?? "";
      const emailVerified = profile?.email_verified ?? false;
      return emailVerified && email.endsWith("@tigerdata.com");
    },
    async session({ session }) {
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
