/**
 * Domain — MenoScore + persona + roadmap resolution. Pure functions, no I/O.
 */
import { SCORED_QUESTION_IDS, MAX_RAW_SCORE } from "./questions";
import type { ScoreBand, Persona } from "@/lib/types/database";

export type { ScoreBand, Persona };

export type RoadmapSlot =
  | "book-first"
  | "education-first"
  | "normalise-first"
  | "options-first"
  | "clinic-first"
  | "download-first";

export interface ScoreResult {
  menoScore: number;
  rawScore: number;
  scoreBand: ScoreBand;
  persona: Persona;
  roadmapOrder: RoadmapSlot[];
  selfHarmFlag: boolean;
  colleenFlag: boolean;
  topDomains: string[];
}

const COMPLEX_CONDITIONS = ["cancer", "autoimmune", "psychiatric"] as const;

function resolvePersona(answers: Record<number, unknown>): Persona {
  const q49 = answers[49];
  const q50 = answers[50];
  const q51 = answers[51];
  const q52 = answers[52];
  const q53 = answers[53];
  const q54 = answers[54];
  const q43 = typeof answers[43] === "number" ? (answers[43] as number) : 0;

  const q54Arr = Array.isArray(q54) ? (q54 as string[]) : [];
  const hasComplex = q54Arr.some((c) =>
    (COMPLEX_CONDITIONS as readonly string[]).includes(c),
  );

  // Persona precedence: Colleen (safety-first) > Retha > Nina > Nelly > Vicky > Olga > Sally
  if (hasComplex || q43 >= 2) return "colleen";
  if (q53 === "yes") return "retha";
  if (q50 === "B") return "nina";
  if (q49 === "D" || q51 === "C") return "nelly";
  if (q49 === "C" || q51 === "B") return "vicky";
  if (q49 === "B" || q52 === "A" || q52 === "B") return "olga";
  if (q49 === "A" || q51 === "D") return "sally";

  return "sally";
}

// independent of persona — Colleen safety content must surface even if she routes elsewhere
function resolveColleenFlag(answers: Record<number, unknown>): boolean {
  const q43 = typeof answers[43] === "number" ? (answers[43] as number) : 0;
  const q54 = answers[54];
  const q54Arr = Array.isArray(q54) ? (q54 as string[]) : [];
  const hasComplex = q54Arr.some((c) =>
    (COMPLEX_CONDITIONS as readonly string[]).includes(c),
  );
  return hasComplex || q43 >= 2;
}

function moveBookFirst(order: RoadmapSlot[]): RoadmapSlot[] {
  return ["book-first", ...order.filter((s) => s !== "book-first")];
}

function resolveRoadmapOrder(
  answers: Record<number, unknown>,
  scoreBand: ScoreBand,
): RoadmapSlot[] {
  const q55 = answers[55];
  let base: RoadmapSlot[];
  switch (q55) {
    case "A":
      base = ["education-first", "normalise-first", "options-first", "clinic-first", "download-first", "book-first"];
      break;
    case "B":
      base = ["normalise-first", "education-first", "options-first", "clinic-first", "download-first", "book-first"];
      break;
    case "C":
      base = ["options-first", "education-first", "normalise-first", "clinic-first", "download-first", "book-first"];
      break;
    case "D":
      base = ["clinic-first", "book-first", "options-first", "education-first", "normalise-first", "download-first"];
      break;
    case "E":
      base = ["download-first", "education-first", "normalise-first", "options-first", "clinic-first", "book-first"];
      break;
    default:
      base = ["education-first", "normalise-first", "options-first", "clinic-first", "download-first", "book-first"];
  }

  if (scoreBand === "significant") return moveBookFirst(base);
  return base;
}

// helper — which symptom domain scored highest, so the roadmap can personalise content
const DOMAIN_Q_IDS: Record<string, number[]> = {
  "mind-cognition": [6, 7, 8, 9],
  "mood": [10, 11, 12, 13, 14, 15, 16],
  "nervous-system": [18, 19, 20, 21, 22, 23, 24, 25],
  "body": [26, 27, 28, 29, 30, 31, 32, 33, 34],
  "urogenital": [35, 36, 37, 38, 39, 40],
  "other": [41, 42, 43],
  "quality-of-life": [44, 45, 46, 47, 48],
};

function resolveTopDomains(answers: Record<number, unknown>): string[] {
  const totals: Array<[string, number]> = Object.entries(DOMAIN_Q_IDS).map(
    ([domain, ids]) => {
      const sum = ids.reduce((acc, id) => {
        const v = answers[id];
        return typeof v === "number" ? acc + v : acc;
      }, 0);
      return [domain, sum];
    },
  );
  return totals
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, 3)
    .map(([d]) => d);
}

export function calculateScore(answers: Record<number, unknown>): ScoreResult {
  const selfHarmFlag =
    typeof answers[17] === "number" && (answers[17] as number) >= 2;

  const rawScore = SCORED_QUESTION_IDS.reduce((acc, id) => {
    const v = answers[id];
    return typeof v === "number" ? acc + v : acc;
  }, 0);

  const menoScore = Math.round((rawScore / MAX_RAW_SCORE) * 100);

  let scoreBand: ScoreBand;
  if (menoScore <= 30) scoreBand = "mild";
  else if (menoScore <= 60) scoreBand = "moderate";
  else scoreBand = "significant";

  const persona = resolvePersona(answers);
  const colleenFlag = resolveColleenFlag(answers);
  const roadmapOrder = resolveRoadmapOrder(answers, scoreBand);
  const topDomains = resolveTopDomains(answers);

  return {
    menoScore,
    rawScore,
    scoreBand,
    persona,
    roadmapOrder,
    selfHarmFlag,
    colleenFlag,
    topDomains,
  };
}
