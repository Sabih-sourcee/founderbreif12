import type { BriefAnswers, BriefApiResponse } from "@/types/brief";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  }
}

export async function generateBrief(
  idea: string,
  answers: BriefAnswers,
): Promise<BriefApiResponse> {
  const res = await fetch(`${API_BASE}/api/generate-brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, answers }),
  });
  const data = (await res.json()) as BriefApiResponse & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Generation failed");
  return data;
}
