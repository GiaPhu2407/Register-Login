import { verifyToken } from "@/lib/auth/token";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

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

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.sub as string);
    requestHeaders.set("x-user-role", decoded.role as string);

    // Continue with modified headers
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
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
