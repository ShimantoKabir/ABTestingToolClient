import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export function middleware(request: NextRequest) {
  const pathname: string = request.nextUrl.pathname;
  const protectedRoutes: string[] = ["/dashboard", "/profile"];
  const unProtectedRoutes: string[] = ["/", "/login", "/registration"];

  console.log("Route middleware executed...!");

  const accessTokenCookie: RequestCookie | undefined =
    request.cookies.get("access-token");

  const unProtectedRoute = unProtectedRoutes.find(
    (p: string) => p === pathname
  );

  const protectedRoute = protectedRoutes.find((p: string) => p === pathname);

  if (accessTokenCookie && accessTokenCookie.value && unProtectedRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!accessTokenCookie && protectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/registration", "/profile"],
};
