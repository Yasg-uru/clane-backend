import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/routes.config";

const PUBLIC_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.auth.login,
  ROUTES.auth.registerBrand,
  ROUTES.auth.registerCreator,
  ROUTES.auth.verifyEmail,
  ROUTES.auth.forgotPassword,
  ROUTES.auth.resetPassword,
]);

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback/") ||
    pathname.startsWith("/auth/complete-profile/") ||
    pathname.startsWith("/auth/instagram-email/");

  const hasRefreshCookie = request.cookies.has("refreshToken");

  if (!isPublic && !hasRefreshCookie) {
    const loginUrl = new URL(ROUTES.auth.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
