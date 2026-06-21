import { createFileRoute } from "@tanstack/react-router";

import { corsHeaders } from "@/lib/brief-generator.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      GET: () =>
        Response.json({ status: "ok" }, { headers: corsHeaders() }),
    },
  },
});
