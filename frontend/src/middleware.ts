import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies /api/* to the backend when BACKEND_PROXY_URL is set (e.g. on Vercel).
 * Local dev uses next.config.ts rewrites instead.
 */
export const config = {
  matcher: "/api/:path*",
};

export async function middleware(request: NextRequest) {
  const backend = process.env.BACKEND_PROXY_URL?.replace(/\/$/, "");
  if (!backend) {
    return NextResponse.next();
  }

  const url = request.nextUrl;
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const target = `${backend}${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const response = await fetch(target, {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
  });

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
