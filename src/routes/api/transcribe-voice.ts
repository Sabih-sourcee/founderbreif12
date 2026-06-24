import { createFileRoute } from "@tanstack/react-router";

import { corsHeaders, transcribeAudio } from "@/lib/brief-generator.server";

export const Route = createFileRoute("/api/transcribe-voice")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { audioBase64?: string; mimeType?: string };
          if (!body.audioBase64 || typeof body.audioBase64 !== "string") {
            return Response.json(
              { error: "audioBase64 is required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const text = await transcribeAudio(body.audioBase64, body.mimeType || "audio/mp4");
          return Response.json({ text }, { headers: corsHeaders() });
        } catch (error) {
          console.error("transcribe-voice error:", error);
          const message = error instanceof Error ? error.message : "Transcription failed.";
          return Response.json({ error: message }, { status: 500, headers: corsHeaders() });
        }
      },
    },
  },
});
