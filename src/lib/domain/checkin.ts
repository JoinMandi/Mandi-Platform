/** Pure check-in comparison logic. No I/O. */

export interface CheckinComparison {
  previousScore: number | null;
  latestScore: number | null;
  /** previous minus latest; positive means the score fell, which is better. */
  delta: number | null;
  /** Count of answers that are lower (better) than the previous run. */
  improved: number;
}

interface ResponseLike {
  meno_score: number | null;
  answers: unknown;
}

export function compareResponses(
  previous: ResponseLike | null,
  latest: ResponseLike,
): CheckinComparison {
  const delta =
    previous?.meno_score != null && latest.meno_score != null
      ? previous.meno_score - latest.meno_score
      : null;

  const a = (latest.answers as Record<string, unknown> | null) ?? {};
  const b = (previous?.answers as Record<string, unknown> | null) ?? {};
  let improved = 0;
  for (const key of Object.keys(a)) {
    const now = Number(a[key]);
    const before = Number(b[key]);
    if (!Number.isNaN(now) && !Number.isNaN(before) && now < before) improved += 1;
  }

  return {
    previousScore: previous?.meno_score ?? null,
    latestScore: latest.meno_score ?? null,
    delta,
    improved,
  };
}
