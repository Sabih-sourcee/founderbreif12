const DEMO_KEY = "founderbrief_demo_used";

export function hasUsedFreeDemo(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "1";
}

export function markDemoUsed(): void {
  localStorage.setItem(DEMO_KEY, "1");
}

export function canGenerateBrief(isAdmin: boolean, isPro: boolean): boolean {
  if (isAdmin || isPro) return true;
  return !hasUsedFreeDemo();
}
