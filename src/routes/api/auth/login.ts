import { createFileRoute } from "@tanstack/react-router";

import { createAdminToken, loginAdmin } from "@/lib/auth.server";
import { corsHeaders } from "@/lib/brief-generator.server";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: string; password?: string };
          if (!body.email?.trim() || !body.password) {
            return Response.json(
              { error: "Email and password are required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const session = loginAdmin(body.email, body.password);
          if (!session) {
            return Response.json(
              { error: "Invalid email or password." },
              { status: 401, headers: corsHeaders() },
            );
          }

          const token = createAdminToken(session.email);
          return Response.json(
            {
              token,
              email: session.email,
              isAdmin: true,
              name: session.name,
            },
            { headers: corsHeaders() },
          );
        } catch (error) {
          console.error("auth/login error:", error);
          return Response.json(
            { error: "Login failed." },
            { status: 500, headers: corsHeaders() },
          );
        }
      },
    },
  },
});
