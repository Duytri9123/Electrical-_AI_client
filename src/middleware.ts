import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("aide_refresh_token");
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/projects",
    "/library",
    "/pricing",
    "/account",
  ];

  const authPaths = [
    "/login",
    "/register",
    "/verify-registration",
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isAuth = authPaths.some(path => pathname.startsWith(path));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/verify-registration",
    "/dashboard/:path*",
    "/projects/:path*",
    "/library/:path*",
    "/pricing/:path*",
    "/account/:path*",
  ],
};
