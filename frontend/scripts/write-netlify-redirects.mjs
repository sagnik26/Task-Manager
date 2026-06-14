import { writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(import.meta.dirname, "..", "dist");
const backendUrl = process.env.BACKEND_PROXY_URL?.replace(/\/$/, "");

const lines = [];

if (backendUrl) {
  // Mirror frontend/nginx.conf: /api/* → backend/* (strip /api prefix).
  lines.push(`/api/*  ${backendUrl}/:splat  200`);
  console.log(`[netlify] API proxy → ${backendUrl}`);
} else {
  console.warn(
    "[netlify] BACKEND_PROXY_URL is not set — /api requests will hit the SPA and fail. " +
      "Set BACKEND_PROXY_URL in Netlify (e.g. https://your-api.onrender.com).",
  );
}

lines.push("/*  /index.html  200");

writeFileSync(join(distDir, "_redirects"), `${lines.join("\n")}\n`);
console.log("[netlify] Wrote dist/_redirects");
