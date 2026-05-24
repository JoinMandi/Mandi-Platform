/**
 * Domain — the generative Mandi Blanket layout.
 *
 * A deterministic, seeded patchwork: each answered question stitches one patch,
 * and the 9 question domains form contiguous bands. The brand's blanket is
 * different *fabrics* — shweshwe, lace, floral, African print — stitched
 * together; each patch is a generative fabric swatch. Pure, no I/O.
 */
import { DOMAIN_ORDER, type QuestionDomain, type Question } from "./questions";

export const QUILT_COLS = 8;

/** The fabric "weaves" — every patch is one of these, drawn generatively. */
export type Weave = "shweshwe" | "floral" | "geometric" | "lace" | "woven";

export interface QuiltPatch {
  index: number;
  questionId: number;
  domain: QuestionDomain;
  domainIndex: number;
  /** Which fabric this patch is cut from. */
  weave: Weave;
  /** Base cloth colour. */
  ground: string;
  /** Print / motif colour. */
  ink: string;
  /** 0–3 — rotation + sub-pattern variation within a weave. */
  variant: number;
  /** Motif grid count per side — kept low so prints read at ~38px. */
  scale: 2 | 3;
  isGolden: boolean;
}

/** Deterministic PRNG so the quilt looks designed, not noisy. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface FabricFamily {
  /** Weighted — a repeated weave appears more often in that band. */
  weaves: Weave[];
  grounds: string[];
  inks: string[];
}

/**
 * A fabric family per domain. Each family fixes one contrast polarity —
 * light cloth + dark print, OR dark cloth + cream print — so every
 * ground×ink pairing stays legible at a ~38px patch. Bands alternate
 * polarity for visual rhythm. shweshwe is reinterpreted warm (never blue).
 */
const FAMILIES: Record<QuestionDomain, FabricFamily> = {
  // light cloth, dark print
  context: {
    weaves: ["woven", "geometric", "shweshwe"],
    grounds: ["#FDF6EC", "#F4E3C4", "#EADFD1"],
    inks: ["#C94A2B", "#A83A20"],
  },
  "mind-cognition": {
    weaves: ["geometric", "shweshwe", "geometric"],
    grounds: ["#F2C14E", "#FBE7CF", "#F4E3C4"],
    inks: ["#C94A2B", "#A83A20", "#2C1810"],
  },
  // dark cloth, cream print
  mood: {
    weaves: ["floral", "lace", "floral"],
    grounds: ["#E66C84", "#F07B54", "#C94A2B"],
    inks: ["#FDF6EC", "#FBE7CF"],
  },
  // light cloth, dark print
  "nervous-system": {
    weaves: ["shweshwe", "geometric", "woven"],
    grounds: ["#F5A623", "#F4E3C4", "#FBE7CF"],
    inks: ["#C94A2B", "#A83A20", "#2C1810"],
  },
  // dark cloth, cream print
  body: {
    weaves: ["geometric", "shweshwe", "geometric"],
    grounds: ["#E8632A", "#C94A2B", "#F07B54"],
    inks: ["#FDF6EC", "#FBE7CF"],
  },
  // light cloth, dark print
  urogenital: {
    weaves: ["floral", "lace", "shweshwe"],
    grounds: ["#FBE7CF", "#F4E3C4", "#F2C14E"],
    inks: ["#C94A2B", "#E8632A", "#A83A20"],
  },
  // dark cloth, cream print
  other: {
    weaves: ["geometric", "woven", "shweshwe"],
    grounds: ["#F07B54", "#E8632A", "#C94A2B"],
    inks: ["#FDF6EC", "#FBE7CF"],
  },
  // light cloth, dark print
  "quality-of-life": {
    weaves: ["floral", "geometric", "lace"],
    grounds: ["#F2C14E", "#FBE7CF", "#F4E3C4"],
    inks: ["#C94A2B", "#A83A20", "#2C1810"],
  },
  // dark cloth, cream print
  mindset: {
    weaves: ["shweshwe", "geometric", "floral"],
    grounds: ["#C94A2B", "#A83A20", "#E66C84"],
    inks: ["#FDF6EC", "#FBE7CF"],
  },
};

const GOLDEN_GROUND = "#FFD66B";
const GOLDEN_INK = "#C94A2B";

// The sensitive questions (Q16 "not feeling like herself", Q17 self-harm)
// stitch in plainly — a quiet woven calico, no celebratory print.
const SENSITIVE_IDS = new Set([16, 17]);
const SENSITIVE_GROUND = "#EADFD1";
const SENSITIVE_INK = "#A89274";

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Builds the quilt layout for the given visible questions. */
export function buildQuilt(visible: Question[]): QuiltPatch[] {
  const rand = mulberry32(0x4d414e44); // seed: "MAND"

  // The golden easter-egg patch — Q46 (a calm, non-sensitive question).
  const goldenId = visible.some((q) => q.id === 46) ? 46 : -1;

  const patches: QuiltPatch[] = [];

  visible.forEach((q, i) => {
    const fam = FAMILIES[q.domain];

    // Always draw the full set, in a frozen order, so the PRNG stream
    // advances identically every run regardless of any override below.
    let weave = pick(rand, fam.weaves);
    let ground = pick(rand, fam.grounds);
    let ink = pick(rand, fam.inks);
    const variant = Math.floor(rand() * 4);
    const scale: 2 | 3 = rand() < 0.5 ? 2 : 3;

    const isGolden = q.id === goldenId;

    if (isGolden) {
      weave = "shweshwe";
      ground = GOLDEN_GROUND;
      ink = GOLDEN_INK;
    } else if (SENSITIVE_IDS.has(q.id)) {
      weave = "woven";
      ground = SENSITIVE_GROUND;
      ink = SENSITIVE_INK;
    } else {
      // Adjacency de-dup — no patch shares a colourway with the patch to
      // its left (same row) or directly above it.
      const left = i % QUILT_COLS !== 0 ? patches[i - 1] : undefined;
      const top = i >= QUILT_COLS ? patches[i - QUILT_COLS] : undefined;
      const key = (w: Weave, g: string, k: string) => `${w}|${g}|${k}`;
      const clashes = (w: Weave, g: string, k: string) => {
        const c = key(w, g, k);
        return (
          (left !== undefined && c === key(left.weave, left.ground, left.ink)) ||
          (top !== undefined && c === key(top.weave, top.ground, top.ink))
        );
      };

      // Reject-and-redraw from the same (deterministic) stream.
      for (let attempt = 0; attempt < 8 && clashes(weave, ground, ink); attempt++) {
        weave = pick(rand, fam.weaves);
        ground = pick(rand, fam.grounds);
        ink = pick(rand, fam.inks);
      }
      // Guaranteed fallback — scan the family for any non-clashing combo
      // (a family always has far more combos than the ≤2 forbidden ones).
      if (clashes(weave, ground, ink)) {
        outer: for (const w of fam.weaves) {
          for (const g of fam.grounds) {
            for (const k of fam.inks) {
              if (!clashes(w, g, k)) {
                weave = w;
                ground = g;
                ink = k;
                break outer;
              }
            }
          }
        }
      }
    }

    patches.push({
      index: i,
      questionId: q.id,
      domain: q.domain,
      domainIndex: DOMAIN_ORDER.indexOf(q.domain),
      weave,
      ground,
      ink,
      variant,
      scale,
      isGolden,
    });
  });

  return patches;
}
