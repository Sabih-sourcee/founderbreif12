import { createFileRoute } from "@tanstack/react-router";

import { generateDocumentFromIdea } from "@/lib/generate-document.server";
import { corsHeaders } from "@/lib/brief-generator.server";
import { DEFAULT_ANSWERS, type BriefAnswers, type DocumentOutputType, type SpokenLanguage } from "@/app/types";

function normalizeAnswers(answers?: Partial<BriefAnswers>): BriefAnswers {
  if (!answers) return DEFAULT_ANSWERS;
  return {
    ...DEFAULT_ANSWERS,
    ...answers,
    calibration: Array.isArray(answers.calibration) ? answers.calibration : undefined,
  };
}

export const Route = createFileRoute("/api/generate-brief")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            idea?: string;
            answers?: Partial<BriefAnswers>;
            documentType?: DocumentOutputType;
            spokenLanguage?: SpokenLanguage;
            deviceId?: string;
          };

          if (!body.idea?.trim()) {
            return Response.json(
              { error: "Product idea is required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const documentType = body.documentType ?? "PRD";
          const spokenLanguage = body.spokenLanguage ?? "English";
          const brief = await generateDocumentFromIdea(
            body.idea.trim(),
            normalizeAnswers(body.answers),
            documentType,
            spokenLanguage,
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
