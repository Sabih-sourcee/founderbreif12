import {
  DEFAULT_BRIEF_ANSWERS,
  DEMO_SESSION_KEY,
  type BriefAnswers,
  type DemoSession,
  type ProjectBrief,
} from "@/types/brief";

export function loadDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed.idea && parsed.step === "idea") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDemoSession(session: Partial<DemoSession> & { step: DemoSession["step"] }): void {
  if (typeof window === "undefined") return;
  const existing = loadDemoSession();
  const merged: DemoSession = {
    step: session.step,
    idea: session.idea ?? existing?.idea ?? "",
    answers: session.answers ?? existing?.answers ?? { ...DEFAULT_BRIEF_ANSWERS },
    questionIndex: session.questionIndex ?? existing?.questionIndex ?? 0,
    brief: session.brief !== undefined ? session.brief : (existing?.brief ?? null),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(merged));
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function updateDemoAnswers(answers: BriefAnswers, questionIndex: number): void {
  const existing = loadDemoSession();
  saveDemoSession({
    step: "questions",
    idea: existing?.idea ?? "",
    answers,
    questionIndex,
    brief: existing?.brief ?? null,
  });
}

export function saveDemoBrief(brief: ProjectBrief): void {
  saveDemoSession({
    step: "result",
    idea: brief.originalIdea,
    answers: brief.answers,
    brief,
    questionIndex: 0,
  });
}
