/// <reference types="node" />

/**
 * Proxies /api/* to the backend when BACKEND_PROXY_URL is set in Vercel.
 * Mirrors frontend/nginx.conf.
 *
 * When this env var is set, it takes precedence over the static rewrite in vercel.json.
 */
export const config = {
  matcher: "/api/:path*",
};

export default async function middleware(
  request: Request,
): Promise<Response | undefined> {
  const backend = process.env.BACKEND_PROXY_URL?.replace(/\/$/, "");
  if (!backend) {
    // Fall through to the static /api rewrite in vercel.json.
    return;
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const target = `${backend}${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  return fetch(target, {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
  });
}
