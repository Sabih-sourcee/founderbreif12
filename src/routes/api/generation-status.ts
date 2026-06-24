import { createFileRoute } from "@tanstack/react-router";

import { verifyAdminToken, tokenFromRequest } from "@/lib/auth.server";
import { corsHeaders } from "@/lib/brief-generator.server";

export const Route = createFileRoute("/api/generation-status")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      GET: ({ request }) => {
        const session = verifyAdminToken(tokenFromRequest(request));
        const isAdmin = !!session;

        return Response.json(
          {
            isAdmin,
            used: 0,
            limit: isAdmin ? null : 1,
            remaining: isAdmin ? null : 1,
          },
          { headers: corsHeaders() },
        );
      },
    },
  },
});
