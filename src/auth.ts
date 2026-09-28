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
  providers: [
    Google({
      // Auth.js v5's bare `Google` provider reads AUTH_GOOGLE_ID /
      // AUTH_GOOGLE_SECRET by convention. We use GOOGLE_CLIENT_ID /
      // GOOGLE_CLIENT_SECRET instead (matching this org's other apps),
      // so they need to be passed explicitly here.
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
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
