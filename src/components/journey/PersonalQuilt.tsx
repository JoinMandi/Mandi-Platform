"use client";

/**
 * Phase 21 — her completed Mandi Blanket, rendered on /my-journey.
 *
 * The quilt itself is deterministic (Phase 1–3: `buildQuilt` is seeded
 * `0x4d414e44`), so every user gets a stable unique blanket from the
 * 56 questions. She saw it once on /roadmap right after finishing the
 * questionnaire; this brings it back as a hero on her journey home.
 *
 * Decorative-only for MVP — no clickable patches. (Interactive
 * patches that reveal the underlying question + her answer are a
 * post-launch nice-to-have.)
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Quilt from "@/components/ui/Quilt";
import { questions } from "@/lib/domain/questions";
import { buildQuilt } from "@/lib/domain/quilt";

interface Props {
  /** Saved answers JSON from her latest questionnaire response.
   *  Determines which questions were visible (skip-conditions resolved)
   *  so the patch count matches what she stitched. */
  answers: Record<number, unknown> | null;
}

export default function PersonalQuilt({ answers }: Props) {
  const { t } = useTranslation("common");

  const patches = useMemo(() => {
    // No answers (legacy response without `answers` JSON, or new user) —
    // fall back to the full canonical question set so the blanket still
    // shows. Skip-conditions would normally trim it; without answers we
    // accept the full 56 patches.
    const visible = answers
      ? questions.filter((q) => !q.skipCondition || !q.skipCondition(answers))
      : questions;
    return buildQuilt(visible);
  }, [answers]);

  if (patches.length === 0) return null;

  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-7 sm:p-9 text-center">
      <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
        {t("journey.quilt.eyebrow")}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl text-brown mt-2">
        {t("journey.quilt.title")}
      </h2>
      <div className="mt-6">
        <Quilt
          patches={patches}
          answered={patches.length}
          variant="full"
          reveal
          className="mx-auto"
        />
      </div>
      <p className="mt-5 text-sm text-brown/65 max-w-md mx-auto leading-relaxed">
        {t("journey.quilt.caption")}
      </p>
    </section>
  );
}
