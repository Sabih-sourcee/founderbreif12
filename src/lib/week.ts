import { startOfWeek, format, addWeeks, parseISO } from "date-fns";

// ISO Monday-based week
export function getMonday(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function mondayISO(date: Date = new Date()): string {
  return format(getMonday(date), "yyyy-MM-dd");
}

export function formatWeekLabel(weekStart: string | Date): string {
  const d = typeof weekStart === "string" ? parseISO(weekStart) : weekStart;
  return `Week of ${format(d, "MMM d, yyyy")}`;
}

export function weekRange(weekStart: string | Date) {
  const start = typeof weekStart === "string" ? parseISO(weekStart) : weekStart;
  const end = addWeeks(start, 1);
  return { start, end };
}

export const SECTION_TYPES = [
  "focus",
  "metrics",
  "priorities",
  "wins",
  "blockers",
  "next_week",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_META: Record<
  SectionType,
  { title: string; prompt: string; sort_order: number }
> = {
  focus: { title: "This Week's Focus", prompt: "What is the ONE thing that matters this week?", sort_order: 0 },
  metrics: { title: "Key Metrics", prompt: "Numbers worth tracking. MRR, users, churn, signups.", sort_order: 1 },
  priorities: { title: "Top 3 Priorities", prompt: "What will you ship by Friday?", sort_order: 2 },
  wins: { title: "Wins From Last Week", prompt: "What worked? What did you finish?", sort_order: 3 },
  blockers: { title: "Blockers & Risks", prompt: "What's in the way? What could derail this week?", sort_order: 4 },
  next_week: { title: "Plan for Next Week", prompt: "What's the early signal for next Monday?", sort_order: 5 },
};
