import { createFileRoute } from "@tanstack/react-router";

import sitemapXml from "../../public/sitemap.xml?raw";

// public/sitemap.xml is the file Vercel serves from the CDN. This route is the
// fallback when the request reaches the SSR function instead: an unmatched .xml
// path is not an HTML page, and TanStack answers that with an error rather than
// the file.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600, s-maxage=86400",
          },
        }),
    },
  },
});
