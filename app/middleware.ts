// import { verifyToken } from "@/lib/auth/token";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   // Public paths
//   const publicPaths = ["/", "/Login", "/Register"];
//   const isPublicPath = publicPaths.some(path =>
//     request.nextUrl.pathname.startsWith(path)
//   );

//   if (isPublicPath) {
//     return NextResponse.next();
//   }

//   // Get token
//   const token = request.headers.get("Authorization")?.replace("Bearer ", "") ||
//                 request.cookies.get("token")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/Login", request.url));
//   }

//   // Verify token
//   const decoded = verifyToken(token);
//   if (!decoded) {
//     return NextResponse.redirect(new URL("/Login", request.url));
//   }

//   // Admin route protection
//   if (request.nextUrl.pathname.startsWith("/Admin") && decoded.role !== 1) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const key = new TextEncoder().encode(JWT_SECRET);

const IGNORE_PATHS = [
  "/api/auth/register",
  "/api/auth/login",
  "/Login",
  "/Register",
];

async function verifyAuth(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function middleware(req: NextRequest) {
  // Allow public paths
  if (IGNORE_PATHS.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get token from header or cookie
  const token =
    req.headers.get("Authorization")?.split(" ")[1] ||
    req.cookies.get("token")?.value;

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  try {
    // Verify token
    const decoded = await verifyAuth(token);

    // Add user info to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-User-Id", decoded.userId);
    requestHeaders.set("X-User-Role", decoded.role);

    // Continue with added headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Redirect to login on invalid token
    return NextResponse.redirect(new URL("/Login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*", "/profile/:path*"],
};
