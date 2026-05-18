/**
 * Domain — the 56-question consumer symptom questionnaire definition.
 * Pure data + types; no I/O. Question text is referenced by i18n key.
 */
export type QuestionType =
  | "scale"
  | "scale-optional"
  | "multiple-choice"
  | "multi-select"
  | "yes-no"
  | "yes-no-notsure"
  | "number"
  | "measurement"
  | "select";

export type QuestionDomain =
  | "context"
  | "mind-cognition"
  | "mood"
  | "nervous-system"
  | "body"
  | "urogenital"
  | "other"
  | "quality-of-life"
  | "mindset";

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface Question {
  id: number;
  domain: QuestionDomain;
  textKey: string;
  hintKey?: string;
  type: QuestionType;
  options?: QuestionOption[];
  units?: QuestionOption[];
  skipCondition?: (answers: Record<number, unknown>) => boolean;
}

export const DOMAIN_ORDER: QuestionDomain[] = [
  "context",
  "mind-cognition",
  "mood",
  "nervous-system",
  "body",
  "urogenital",
  "other",
  "quality-of-life",
  "mindset",
];

export const questions: Question[] = [
  // ─── CONTEXT (1–5) ───────────────────────────────────────────────
  { id: 1, domain: "context", textKey: "q1.text", type: "number" },
  {
    id: 2,
    domain: "context",
    textKey: "q2.text",
    type: "measurement",
    units: [
      { value: "cm", labelKey: "units.cm" },
      { value: "ftin", labelKey: "units.ftin" },
    ],
  },
  {
    id: 3,
    domain: "context",
    textKey: "q3.text",
    hintKey: "q3.hint",
    type: "measurement",
    units: [
      { value: "kg", labelKey: "units.kg" },
      { value: "lbs", labelKey: "units.lbs" },
    ],
  },
  {
    id: 4,
    domain: "context",
    textKey: "q4.text",
    type: "select",
    options: [
      { value: "still-regular", labelKey: "q4.stillRegular" },
      { value: "becoming-irregular", labelKey: "q4.becomingIrregular" },
      { value: "stopped-less-2-years", labelKey: "q4.stoppedLess2" },
      { value: "stopped-more-2-years", labelKey: "q4.stoppedMore2" },
      { value: "hysterectomy", labelKey: "q4.hysterectomy" },
      { value: "not-sure", labelKey: "q4.notSure" },
    ],
  },
  { id: 5, domain: "context", textKey: "q5.text", type: "yes-no-notsure" },

  // ─── MIND & COGNITION (6–9) ──────────────────────────────────────
  { id: 6, domain: "mind-cognition", textKey: "q6.text", type: "scale" },
  { id: 7, domain: "mind-cognition", textKey: "q7.text", type: "scale" },
  { id: 8, domain: "mind-cognition", textKey: "q8.text", type: "scale" },
  { id: 9, domain: "mind-cognition", textKey: "q9.text", type: "scale" },

  // ─── MOOD (10–17) ────────────────────────────────────────────────
  { id: 10, domain: "mood", textKey: "q10.text", type: "scale" },
  { id: 11, domain: "mood", textKey: "q11.text", type: "scale" },
  { id: 12, domain: "mood", textKey: "q12.text", type: "scale" },
  { id: 13, domain: "mood", textKey: "q13.text", type: "scale" },
  { id: 14, domain: "mood", textKey: "q14.text", type: "scale" },
  { id: 15, domain: "mood", textKey: "q15.text", type: "scale" },
  { id: 16, domain: "mood", textKey: "q16.text", hintKey: "q16.hint", type: "scale" },
  // Q17 — excluded from MenoScore sum, scored separately for selfHarmFlag (≥2)
  { id: 17, domain: "mood", textKey: "q17.text", hintKey: "q17.hint", type: "scale" },

  // ─── NERVOUS SYSTEM (18–25) ──────────────────────────────────────
  { id: 18, domain: "nervous-system", textKey: "q18.text", type: "scale" },
  { id: 19, domain: "nervous-system", textKey: "q19.text", type: "scale" },
  { id: 20, domain: "nervous-system", textKey: "q20.text", type: "scale" },
  { id: 21, domain: "nervous-system", textKey: "q21.text", type: "scale" },
  { id: 22, domain: "nervous-system", textKey: "q22.text", type: "scale" },
  { id: 23, domain: "nervous-system", textKey: "q23.text", type: "scale" },
  { id: 24, domain: "nervous-system", textKey: "q24.text", type: "scale" },
  { id: 25, domain: "nervous-system", textKey: "q25.text", type: "scale" },

  // ─── BODY (26–34) ────────────────────────────────────────────────
  { id: 26, domain: "body", textKey: "q26.text", type: "scale" },
  { id: 27, domain: "body", textKey: "q27.text", type: "scale" },
  { id: 28, domain: "body", textKey: "q28.text", hintKey: "q28.hint", type: "scale" },
  { id: 29, domain: "body", textKey: "q29.text", type: "scale" },
  { id: 30, domain: "body", textKey: "q30.text", type: "scale" },
  { id: 31, domain: "body", textKey: "q31.text", type: "scale" },
  { id: 32, domain: "body", textKey: "q32.text", type: "scale" },
  { id: 33, domain: "body", textKey: "q33.text", type: "scale" },
  { id: 34, domain: "body", textKey: "q34.text", type: "scale" },

  // ─── UROGENITAL (35–40) ──────────────────────────────────────────
  {
    id: 35,
    domain: "urogenital",
    textKey: "q35.text",
    type: "scale",
    skipCondition: (answers) =>
      answers[4] === "stopped-more-2-years" || answers[4] === "hysterectomy",
  },
  { id: 36, domain: "urogenital", textKey: "q36.text", type: "scale" },
  { id: 37, domain: "urogenital", textKey: "q37.text", type: "scale" },
  { id: 38, domain: "urogenital", textKey: "q38.text", type: "scale" },
  { id: 39, domain: "urogenital", textKey: "q39.text", type: "scale" },
  { id: 40, domain: "urogenital", textKey: "q40.text", type: "scale" },

  // ─── OTHER (41–43) ───────────────────────────────────────────────
  { id: 41, domain: "other", textKey: "q41.text", hintKey: "q41.hint", type: "scale" },
  { id: 42, domain: "other", textKey: "q42.text", type: "scale" },
  { id: 43, domain: "other", textKey: "q43.text", hintKey: "q43.hint", type: "scale" },

  // ─── QUALITY OF LIFE (44–48) ────────────────────────────────────
  { id: 44, domain: "quality-of-life", textKey: "q44.text", type: "scale" },
  { id: 45, domain: "quality-of-life", textKey: "q45.text", type: "scale-optional" }, // includes N/A
  { id: 46, domain: "quality-of-life", textKey: "q46.text", type: "scale" },
  { id: 47, domain: "quality-of-life", textKey: "q47.text", type: "scale" },
  { id: 48, domain: "quality-of-life", textKey: "q48.text", type: "scale" },

  // ─── MINDSET (49–56) ─────────────────────────────────────────────
  {
    id: 49,
    domain: "mindset",
    textKey: "q49.text",
    type: "multiple-choice",
    options: [
      { value: "A", labelKey: "q49.a" },
      { value: "B", labelKey: "q49.b" },
      { value: "C", labelKey: "q49.c" },
      { value: "D", labelKey: "q49.d" },
    ],
  },
  {
    id: 50,
    domain: "mindset",
    textKey: "q50.text",
    type: "multiple-choice",
    options: [
      { value: "A", labelKey: "q50.a" },
      { value: "B", labelKey: "q50.b" },
      { value: "C", labelKey: "q50.c" },
      { value: "D", labelKey: "q50.d" },
    ],
  },
  {
    id: 51,
    domain: "mindset",
    textKey: "q51.text",
    type: "multiple-choice",
    options: [
      { value: "A", labelKey: "q51.a" },
      { value: "B", labelKey: "q51.b" },
      { value: "C", labelKey: "q51.c" },
      { value: "D", labelKey: "q51.d" },
    ],
  },
  {
    id: 52,
    domain: "mindset",
    textKey: "q52.text",
    type: "multiple-choice",
    options: [
      { value: "A", labelKey: "q52.a" },
      { value: "B", labelKey: "q52.b" },
      { value: "C", labelKey: "q52.c" },
      { value: "D", labelKey: "q52.d" },
    ],
  },
  { id: 53, domain: "mindset", textKey: "q53.text", type: "yes-no-notsure" },
  {
    id: 54,
    domain: "mindset",
    textKey: "q54.text",
    hintKey: "q54.hint",
    type: "multi-select",
    options: [
      { value: "none", labelKey: "q54.none" },
      { value: "cancer", labelKey: "q54.cancer" },
      { value: "autoimmune", labelKey: "q54.autoimmune" },
      { value: "cardiovascular", labelKey: "q54.cardiovascular" },
      { value: "psychiatric", labelKey: "q54.psychiatric" },
      { value: "not-sure", labelKey: "q54.notSure" },
    ],
  },
  {
    id: 55,
    domain: "mindset",
    textKey: "q55.text",
    type: "multiple-choice",
    options: [
      { value: "A", labelKey: "q55.a" },
      { value: "B", labelKey: "q55.b" },
      { value: "C", labelKey: "q55.c" },
      { value: "D", labelKey: "q55.d" },
      { value: "E", labelKey: "q55.e" },
    ],
  },
  {
    id: 56,
    domain: "mindset",
    textKey: "q56.text",
    hintKey: "q56.hint",
    type: "multiple-choice",
    options: [
      { value: "friend", labelKey: "q56.friend" },
      { value: "kyknet", labelKey: "q56.kyknet" },
      { value: "social", labelKey: "q56.social" },
      { value: "search", labelKey: "q56.search" },
      { value: "doctor", labelKey: "q56.doctor" },
      { value: "other", labelKey: "q56.other" },
    ],
  },
];

export const SCORED_QUESTION_IDS: number[] = [
  6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16,
  // Q17 is deliberately excluded from the MenoScore sum
  18, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 32, 33, 34,
  35, 36, 37, 38, 39, 40,
  41, 42, 43,
  44, 45, 46, 47, 48,
];

export const MAX_RAW_SCORE = SCORED_QUESTION_IDS.length * 3; // 42 × 3 = 126
