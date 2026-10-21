// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Nitro's Vercel preset writes the server to .vercel/output, not dist/server/server.js.
// TanStack's preview middleware then throws ERR_MODULE_NOT_FOUND and Vite turns that
// into HTTP 500 before the static sitemap can be served. Answer /sitemap.xml first.
function servePublicFilesInPreview(): Plugin {
  const files: Record<string, { path: string; type: string }> = {
    "/sitemap.xml": {
      path: resolve(process.cwd(), "public/sitemap.xml"),
      type: "application/xml; charset=utf-8",
    },
    "/332021a187e8d32643c66d9c79f3c394.txt": {
      path: resolve(process.cwd(), "public/332021a187e8d32643c66d9c79f3c394.txt"),
      type: "text/plain; charset=utf-8",
    },
  };
  return {
    name: "serve-public-files-preview",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        const file = files[pathname];
        if (!file) return next();
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        const body = readFileSync(file.path);
        res.statusCode = 200;
        res.setHeader("Content-Type", file.type);
        res.setHeader("Content-Length", String(body.length));
        res.end(req.method === "HEAD" ? undefined : body);
      });
    },
  };
}

export default defineConfig({
  // Required for Vercel (and other non-Lovable hosts). Nitro auto-detects Vercel at build time.
  nitro: true,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [servePublicFilesInPreview()],
  },
});
