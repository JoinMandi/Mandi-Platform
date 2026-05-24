import { describe, it, expect } from "vitest";
import { buildQuilt, QUILT_COLS, type QuiltPatch } from "./quilt";
import { questions } from "./questions";

const colourKey = (p: QuiltPatch) => `${p.weave}|${p.ground}|${p.ink}`;

describe("buildQuilt", () => {
  const patches = buildQuilt(questions);

  it("produces one patch per question, in order", () => {
    expect(patches).toHaveLength(questions.length);
    patches.forEach((p, i) => {
      expect(p.index).toBe(i);
      expect(p.questionId).toBe(questions[i].id);
    });
  });

  it("is deterministic across calls", () => {
    expect(buildQuilt(questions)).toEqual(buildQuilt(questions));
  });

  it("places exactly one golden patch, on Q46", () => {
    const golden = patches.filter((p) => p.isGolden);
    expect(golden).toHaveLength(1);
    expect(golden[0].questionId).toBe(46);
    expect(golden[0].ground).toBe("#FFD66B");
    expect(golden[0].weave).toBe("shweshwe");
  });

  it("keeps the sensitive questions (Q16, Q17) plain and woven", () => {
    for (const id of [16, 17]) {
      const p = patches.find((x) => x.questionId === id)!;
      expect(p.weave).toBe("woven");
      expect(p.isGolden).toBe(false);
    }
  });

  it("never repeats a colourway in horizontally/vertically adjacent patches", () => {
    patches.forEach((p, i) => {
      if (i % QUILT_COLS !== 0) {
        expect(colourKey(p)).not.toBe(colourKey(patches[i - 1]));
      }
      if (i >= QUILT_COLS) {
        expect(colourKey(p)).not.toBe(colourKey(patches[i - QUILT_COLS]));
      }
    });
  });

  it("uses only warm-palette colours — no blue-dominant hex", () => {
    for (const p of patches) {
      for (const hex of [p.ground, p.ink]) {
        expect(hex).toMatch(/^#[0-9A-F]{6}$/i);
        const n = parseInt(hex.slice(1), 16);
        const red = (n >> 16) & 0xff;
        const green = (n >> 8) & 0xff;
        const blue = n & 0xff;
        expect(blue).toBeLessThanOrEqual(Math.max(red, green));
      }
    }
  });

  it("keeps motif grids small (2–3) and variants bounded (0–3)", () => {
    for (const p of patches) {
      expect([2, 3]).toContain(p.scale);
      expect(p.variant).toBeGreaterThanOrEqual(0);
      expect(p.variant).toBeLessThanOrEqual(3);
    }
  });
});
