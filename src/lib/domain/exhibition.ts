/**
 * Domain — the Silwerskermfees exhibition demo: a curated 8-question taste of
 * the full questionnaire. Pure data + logic; no I/O.
 *
 * Curation rules: pure `scale` questions only (single tap, auto-advance),
 * exactly 8 so the quilt renders one complete row (QUILT_COLS = 8), Q46
 * (family relationships) included because the golden easter-egg patch is
 * pinned to it in quilt.ts, Q16/Q17 (sensitive) excluded — a festival
 * stand is not the place for a self-harm screener.
 */
import { questions, type Question, type QuestionDomain } from "./questions";
import type { ScoreBand } from "@/lib/types/database";

export const EXHIBITION_QUESTION_IDS = [8, 18, 20, 25, 28, 30, 41, 46] as const;

export const exhibitionQuestions: Question[] = questions.filter((q) =>
  (EXHIBITION_QUESTION_IDS as readonly number[]).includes(q.id),
);

export interface ExhibitionScoreResult {
  /** Normalised 0–100 over the curated set (denominator = 8 × 3). */
  menoScore: number;
  /** Raw 0–24 sum of the curated answers. */
  rawScore: number;
  scoreBand: ScoreBand;
}

/**
 * Demo-scaled score. `calculateScore` normalises by the full questionnaire's
 * 42-question denominator, which would cap an 8-answer run at 19% ("mild"
 * forever) — so the exhibition uses its own denominator over the curated ids.
 * Band thresholds mirror calculateScore (≤30 mild, ≤60 moderate, else
 * significant).
 */
export function calculateExhibitionScore(
  answers: Record<number, unknown>,
): ExhibitionScoreResult {
  const rawScore = EXHIBITION_QUESTION_IDS.reduce((acc: number, id) => {
    const v = answers[id];
    return typeof v === "number" ? acc + v : acc;
  }, 0);

  const maxRaw = EXHIBITION_QUESTION_IDS.length * 3;
  const menoScore = Math.round((rawScore / maxRaw) * 100);

  let scoreBand: ScoreBand;
  if (menoScore <= 30) scoreBand = "mild";
  else if (menoScore <= 60) scoreBand = "moderate";
  else scoreBand = "significant";

  return { menoScore, rawScore, scoreBand };
}

export interface ExhibitionStoryChapter {
  domain: QuestionDomain;
  /** i18n key suffix for the domain fact: `questionnaire.facts.${domain}` */
  factKey: string;
  questions: { id: number; textKey: string; answer: number }[];
}

/**
 * The scrollable results story: curated questions the visitor actually felt
 * (answer ≥ 1), grouped by domain and ordered by how strongly that domain was
 * felt (sum of answers, desc) so the most-lived area leads. Empty array when
 * nothing was felt — the page shows a warm fallback instead.
 */
export function exhibitionStory(
  answers: Record<number, unknown>,
): ExhibitionStoryChapter[] {
  const byDomain = new Map<QuestionDomain, ExhibitionStoryChapter>();
  for (const q of exhibitionQuestions) {
    const v = answers[q.id];
    if (typeof v !== "number" || v < 1) continue;
    let chapter = byDomain.get(q.domain);
    if (!chapter) {
      chapter = { domain: q.domain, factKey: q.domain, questions: [] };
      byDomain.set(q.domain, chapter);
    }
    chapter.questions.push({ id: q.id, textKey: q.textKey, answer: v });
  }
  const sum = (c: ExhibitionStoryChapter) =>
    c.questions.reduce((acc, q) => acc + q.answer, 0);
  return Array.from(byDomain.values()).sort((a, b) => sum(b) - sum(a));
}
