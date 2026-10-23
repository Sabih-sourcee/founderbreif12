import {
  DEFAULT_PREFERENCES,
  ProjectBrief,
  SessionDraft,
  UserPreferences,
  UserProfile,
} from "./types";
import { normalizeBrief } from "./normalizeBrief";

const BRIEFS_KEY = "founder_brief_archives";
const PROFILE_KEY = "founder_brief_user_profile";
const SESSION_KEY = "founder_brief_session_draft";
const DEVICE_ID_KEY = "founder_brief_device_id";
const PREFS_KEY = "founder_brief_preferences";
const RECENT_VOICES_KEY = "founder_brief_recent_voices";
export const PROFILE_PROMPTED_KEY = "founderbrief_profile_prompted_v1";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage full or private mode */
  }
}

export function loadBriefs(): ProjectBrief[] {
  try {
    const raw = read(BRIEFS_KEY);
    const parsed: Partial<ProjectBrief>[] = raw ? JSON.parse(raw) : [];
    return parsed.map((b) => normalizeBrief(b));
  } catch {
    return [];
  }
}

export function saveBriefs(briefs: ProjectBrief[]): void {
  write(BRIEFS_KEY, JSON.stringify(briefs));
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = read(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile | null): void {
  write(PROFILE_KEY, profile ? JSON.stringify(profile) : null);
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = read(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  write(PREFS_KEY, JSON.stringify(prefs));
}

export function loadRecentVoiceIds(): string[] {
  try {
    const raw = read(RECENT_VOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentVoiceIds(ids: string[]): void {
  write(RECENT_VOICES_KEY, JSON.stringify(ids));
}

export function loadSessionDraft(): SessionDraft | null {
  try {
    const raw = read(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.calibrationAnswers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSessionDraft(draft: SessionDraft | null): void {
  write(SESSION_KEY, draft ? JSON.stringify(draft) : null);
}

export function getDeviceId(): string {
  let id = read(DEVICE_ID_KEY);
  if (!id) {
    id = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    write(DEVICE_ID_KEY, id);
  }
  return id;
}

export function loadPromptedProfile(): boolean {
  return read(PROFILE_PROMPTED_KEY) === "1";
}

export function savePromptedProfile(): void {
  write(PROFILE_PROMPTED_KEY, "1");
}

export function clearPromptedProfile(): void {
  write(PROFILE_PROMPTED_KEY, null);
}
