import { createFileRoute } from "@tanstack/react-router";

import { corsHeaders, generateBriefFromIdea } from "@/lib/brief-generator.server";
import { DEFAULT_BRIEF_ANSWERS, type BriefAnswers } from "@/types/brief";

export const Route = createFileRoute("/api/generate-brief")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            idea?: string;
            answers?: BriefAnswers;
          };

          if (!body.idea?.trim()) {
            return Response.json(
              { error: "Product idea is required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const brief = await generateBriefFromIdea(
            body.idea.trim(),
            body.answers ?? DEFAULT_BRIEF_ANSWERS,
          );

          return Response.json(brief, { headers: corsHeaders() });
        } catch (error) {
          console.error("generate-brief handler error:", error);
          return Response.json(
            { error: "Generation failed." },
            { status: 500, headers: corsHeaders() },
          );
        }
      },
    },
  },
});
