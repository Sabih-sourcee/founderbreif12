import { createFileRoute } from "@tanstack/react-router";

import {
  corsHeaders,
  deleteAccountByCredentials,
  DeleteAccountError,
} from "@/lib/delete-account.server";

export const Route = createFileRoute("/api/delete-account")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
          };

          const email = body.email?.trim();
          const password = body.password;

          if (!email || !password) {
            return Response.json(
              { error: "Email and password are required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          await deleteAccountByCredentials(email, password);

          return Response.json(
            { success: true, message: "Your account and all associated data have been deleted." },
            { headers: corsHeaders() },
          );
        } catch (error) {
          if (error instanceof DeleteAccountError) {
            return Response.json(
              { error: error.message },
              { status: error.status, headers: corsHeaders() },
            );
          }
          console.error("delete-account handler error:", error);
          return Response.json(
            { error: "Could not delete account. Please try again or contact support." },
            { status: 500, headers: corsHeaders() },
          );
        }
      },
    },
  },
});
