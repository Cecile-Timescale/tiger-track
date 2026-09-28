import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Server-side gate for API routes.
 *
 * Before this, every /api/* route (level, compare, history, chat, ...)
 * trusted whatever the browser sent with no session check, so anyone who
 * knew the URL could call them directly — bypassing the sign-in screen
 * entirely and running up the ANTHROPIC_API_KEY usage. This blocks any
 * unauthenticated request to those routes at the edge, before it reaches
 * route.ts. /api/auth/* is left open since that's NextAuth's own sign-in
 * machinery.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (pathname.startsWith("/api/") && !isAuthRoute && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
});

export const config = {
  matcher: ["/api/:path*"],
};
