import { createFileRoute } from "@tanstack/react-router";

import indexNowKey from "../../public/332021a187e8d32643c66d9c79f3c394.txt?raw";

// public/<key>.txt is what the CDN serves. This route is the fallback when the
// request reaches the SSR function instead, same as /sitemap.xml.
export const Route = createFileRoute("/332021a187e8d32643c66d9c79f3c394.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(indexNowKey, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600, s-maxage=86400",
          },
        }),
    },
  },
});
