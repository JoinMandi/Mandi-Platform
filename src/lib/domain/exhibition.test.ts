import { describe, expect, it } from "vitest";
import {
  EXHIBITION_QUESTION_IDS,
  calculateExhibitionScore,
  exhibitionQuestions,
  exhibitionStory,
} from "./exhibition";

function answersWithAll(value: number): Record<number, unknown> {
  return Object.fromEntries(EXHIBITION_QUESTION_IDS.map((id) => [id, value]));
}

describe("exhibitionQuestions", () => {
  it("is exactly 8 questions (one full quilt row)", () => {
    expect(exhibitionQuestions).toHaveLength(8);
  });

  it("are all pure scale questions (only ScaleInput needed)", () => {
    for (const q of exhibitionQuestions) expect(q.type).toBe("scale");
  });

  it("includes Q46 (golden patch + affirmation) and excludes Q16/Q17", () => {
    const ids = exhibitionQuestions.map((q) => q.id);
    expect(ids).toContain(46);
    expect(ids).not.toContain(16);
    expect(ids).not.toContain(17);
  });
});

describe("calculateExhibitionScore", () => {
  it("all zeros → 0, mild", () => {
    const r = calculateExhibitionScore(answersWithAll(0));
    expect(r.menoScore).toBe(0);
    expect(r.rawScore).toBe(0);
    expect(r.scoreBand).toBe("mild");
  });

  it("all threes → 100, significant", () => {
    const r = calculateExhibitionScore(answersWithAll(3));
    expect(r.menoScore).toBe(100);
    expect(r.rawScore).toBe(24);
    expect(r.scoreBand).toBe("significant");
  });

  it("mixed answers normalise over the demo denominator (24)", () => {
    // 8 answers of 1 → raw 8 → 8/24 = 33% → moderate
    const r = calculateExhibitionScore(answersWithAll(1));
    expect(r.rawScore).toBe(8);
    expect(r.menoScore).toBe(33);
    expect(r.scoreBand).toBe("moderate");
  });

  it("ignores missing and non-numeric answers", () => {
    const r = calculateExhibitionScore({ 8: 3, 18: "high", 999: 3 });
    expect(r.rawScore).toBe(3);
    expect(r.menoScore).toBe(13);
    expect(r.scoreBand).toBe("mild");
  });
});

describe("exhibitionStory", () => {
  it("returns empty for no answers or all zeros", () => {
    expect(exhibitionStory({})).toEqual([]);
    expect(exhibitionStory(answersWithAll(0))).toEqual([]);
  });

  it("includes only answers ≥ 1, grouped by domain", () => {
    // Q8 mind-cognition:2, Q18 nervous-system:0 (dropped), Q20 nervous-system:1
    const story = exhibitionStory({ 8: 2, 18: 0, 20: 1 });
    expect(story).toHaveLength(2);
    const domains = story.map((c) => c.domain);
    expect(domains).toContain("mind-cognition");
    expect(domains).toContain("nervous-system");
    const ns = story.find((c) => c.domain === "nervous-system")!;
    expect(ns.questions.map((q) => q.id)).toEqual([20]);
  });

  it("orders domains by felt intensity (sum desc)", () => {
    // nervous-system: 18+20+25 = 3+3+3 = 9; mind-cognition: 8 = 1
    const story = exhibitionStory({ 8: 1, 18: 3, 20: 3, 25: 3 });
    expect(story[0].domain).toBe("nervous-system");
    expect(story[1].domain).toBe("mind-cognition");
  });

  it("carries the answer value and textKey per question", () => {
    const story = exhibitionStory({ 41: 2 });
    expect(story).toHaveLength(1);
    expect(story[0].domain).toBe("other");
    expect(story[0].factKey).toBe("other");
    expect(story[0].questions[0]).toEqual({ id: 41, textKey: "q41.text", answer: 2 });
  });
});
