import { verifyToken } from "@/lib/auth/token";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

const ROLE_PATHS = {
  ADMIN: ["/Admin"],
  STAFF: ["/staff"],
  CUSTOMER: ["/customer"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((path) =>
      pathname.toLowerCase().startsWith(path.toLowerCase())
    )
  ) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  const token =
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token
    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userRole = decoded.role;
    const roleId = Number(userRole);

    // Check if user has access to the requested path
    if (pathname.startsWith("/admin") && roleId !== 1) {
      return NextResponse.redirect(
        new URL(getHomeRouteForRole(roleId), request.url)
      );
    }

    if (pathname.startsWith("/staff") && roleId !== 2) {
      return NextResponse.redirect(
        new URL(getHomeRouteForRole(roleId), request.url)
      );
    }

    if (pathname.startsWith("/customer") && roleId !== 3) {
      return NextResponse.redirect(
        new URL(getHomeRouteForRole(roleId), request.url)
      );
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.sub);
    requestHeaders.set("x-user-role", String(decoded.role)); // Convert role number to string explicitly

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
