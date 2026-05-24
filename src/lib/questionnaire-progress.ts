/**
 * Save & resume — the questionnaire's progress is persisted on every answer so
 * a woman can close the browser and pick up exactly where she left off.
 * (Client-side localStorage; the brief asks only for same-device resume.)
 */

const KEY = "mandi-questionnaire-progress";

export interface SavedProgress {
  answers: Record<number, unknown>;
  currentIndex: number;
  savedAt: number;
}

export function saveProgress(answers: Record<number, unknown>, currentIndex: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ answers, currentIndex, savedAt: Date.now() }),
    );
  } catch {
    /* storage unavailable — progress simply isn't saved */
  }
}

export function loadProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedProgress;
    if (!parsed.answers || typeof parsed.currentIndex !== "number") return null;
    if (Object.keys(parsed.answers).length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
