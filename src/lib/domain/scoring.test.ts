import { describe, it, expect } from "vitest";
import { calculateScore } from "./scoring";
import { SCORED_QUESTION_IDS, MAX_RAW_SCORE } from "./questions";

/** Build an answer set with every scored question set to `v`. */
function answersAll(v: number): Record<number, unknown> {
  const a: Record<number, unknown> = {};
  for (const id of SCORED_QUESTION_IDS) a[id] = v;
  return a;
}

describe("calculateScore", () => {
  it("scores an all-zero questionnaire as mild with no flags", () => {
    const r = calculateScore(answersAll(0));
    expect(r.rawScore).toBe(0);
    expect(r.menoScore).toBe(0);
    expect(r.scoreBand).toBe("mild");
    expect(r.selfHarmFlag).toBe(false);
    expect(r.colleenFlag).toBe(false);
  });

  it("scores an all-maximum questionnaire as significant (100)", () => {
    const r = calculateScore(answersAll(3));
    expect(r.rawScore).toBe(MAX_RAW_SCORE);
    expect(r.menoScore).toBe(100);
    expect(r.scoreBand).toBe("significant");
  });

  it("raises the self-harm flag when Q17 >= 2", () => {
    expect(calculateScore({ ...answersAll(0), 17: 2 }).selfHarmFlag).toBe(true);
    expect(calculateScore({ ...answersAll(0), 17: 1 }).selfHarmFlag).toBe(false);
  });

  it("excludes Q17 from the MenoScore sum", () => {
    // Q17 is not in SCORED_QUESTION_IDS, so it must not change the raw score.
    expect(calculateScore({ ...answersAll(0), 17: 3 }).rawScore).toBe(0);
  });

  it("flags Colleen and routes to her persona for a complex condition", () => {
    const r = calculateScore({ ...answersAll(0), 54: ["cancer"] });
    expect(r.colleenFlag).toBe(true);
    expect(r.persona).toBe("colleen");
  });

  it("flags Colleen via a high Q43 score", () => {
    const r = calculateScore({ ...answersAll(0), 43: 2 });
    expect(r.colleenFlag).toBe(true);
    expect(r.persona).toBe("colleen");
  });

  it("resolves the Retha persona when Q53 is yes and no safety flag applies", () => {
    const r = calculateScore({ ...answersAll(0), 53: "yes" });
    expect(r.persona).toBe("retha");
  });

  it("moves book-first to the front of the roadmap for a significant score", () => {
    const r = calculateScore(answersAll(3));
    expect(r.roadmapOrder[0]).toBe("book-first");
  });

  it("returns at most three top domains", () => {
    const r = calculateScore(answersAll(3));
    expect(r.topDomains.length).toBeLessThanOrEqual(3);
    expect(r.topDomains).toContain("body");
  });
});
