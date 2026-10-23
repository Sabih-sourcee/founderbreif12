import { createFileRoute } from "@tanstack/react-router";

import { corsHeaders, transcribeAudio } from "@/lib/brief-generator.server";

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = Buffer.from(await blob.arrayBuffer());
  return buf.toString("base64");
}

export const Route = createFileRoute("/api/transcribe-voice")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders() }),
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") ?? "";
          let audioBase64 = "";
          let mimeType = "audio/webm";

          if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            const audio = form.get("audio");
            if (audio instanceof Blob) {
              audioBase64 = await blobToBase64(audio);
              mimeType = audio.type || "audio/webm";
            }
          } else {
            const body = (await request.json()) as { audioBase64?: string; mimeType?: string };
            audioBase64 = body.audioBase64 ?? "";
            mimeType = body.mimeType || "audio/webm";
          }

          if (!audioBase64) {
            return Response.json(
              { error: "audio is required." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const text = await transcribeAudio(audioBase64, mimeType);
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
