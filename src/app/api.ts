import {
  BriefAnswers,
  BriefApiResponse,
  DocumentOutputType,
  SpokenLanguage,
} from "./types";
import { getDeviceId } from "./storage";

function apiHeaders(authToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Id": getDeviceId(),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; email: string; isAdmin: boolean; name: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

export async function getGenerationStatus(authToken?: string): Promise<{
  isAdmin: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}> {
  const res = await fetch("/api/generation-status", { headers: apiHeaders(authToken) });
  if (!res.ok) return { isAdmin: false, used: 0, limit: 3, remaining: 3 };
  return res.json();
}

export async function generateFounderBrief(
  idea: string,
  answers: BriefAnswers,
  options?: {
    prefetch?: boolean;
    authToken?: string;
    documentType?: DocumentOutputType;
    spokenLanguage?: SpokenLanguage;
  },
): Promise<BriefApiResponse> {
  const response = await fetch("/api/generate-brief", {
    method: "POST",
    headers: apiHeaders(options?.authToken),
    body: JSON.stringify({
      idea,
      answers,
      deviceId: getDeviceId(),
      prefetch: !!options?.prefetch,
      documentType: options?.documentType ?? "PRD",
      spokenLanguage: options?.spokenLanguage ?? "English",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function transcribeVoiceRecording(blob: Blob): Promise<string> {
  const audioBase64 = await blobToBase64(blob);
  const response = await fetch("/api/transcribe-voice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioBase64,
      mimeType: blob.type || "audio/webm",
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Transcription failed (${response.status})`);
  }
  return data.text as string;
}
