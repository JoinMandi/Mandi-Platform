"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { getSessionUser } from "@/server/auth";
import { all, one, run } from "@/server/db/sql";
import { withService } from "@/server/db/withUser";

/** Fixed version row seeded by db/seeds/public-content.sql. */
const VERSION_ID = "00000000-0000-4000-8000-000000000001";

/**
 * Starts a resumable questionnaire run and returns its bearer token.
 * The token is the only secret needed to load it on another device.
 */
export async function startRun(): Promise<string | null> {
  const user = await getSessionUser();
  try {
    return await withService(async (db) => {
      const token = randomBytes(24).toString("base64url");
      await run(
        db,
        `insert into web.questionnaire_runs
           (id, user_id, version_id, idempotency_key)
         values ($1,$2,$3,$4)`,
        [randomUUID(), user?.id ?? null, VERSION_ID, token],
      );
      return token;
    });
  } catch {
    return null;
  }
}

/** Upserts one answer. Best-effort: local progress remains authoritative. */
export async function saveRunAnswer(
  token: string,
  questionKey: string,
  answer: unknown,
): Promise<void> {
  if (!token) return;
  try {
    await withService(async (db) => {
      const questionnaireRun = await one<{ id: string; status: string }>(
        db,
        `select id, status from web.questionnaire_runs where idempotency_key = $1`,
        [token],
      );
      if (!questionnaireRun || questionnaireRun.status !== "in_progress") return;
      await run(
        db,
        `insert into web.questionnaire_items (run_id, question_key, answer)
         values ($1,$2,$3)
         on conflict (run_id, question_key) do update set
           answer = excluded.answer,
           answered_at = now()`,
        [questionnaireRun.id, questionKey, answer],
      );
    });
  } catch {
    /* best-effort — never block her answering */
  }
}

/** Loads a run by token, or null when missing/submitted. */
export async function loadRun(
  token: string,
): Promise<{ answers: Record<string, unknown> } | null> {
  if (!token) return null;
  try {
    return await withService(async (db) => {
      const questionnaireRun = await one<{ id: string; status: string }>(
        db,
        `select id, status from web.questionnaire_runs where idempotency_key = $1`,
        [token],
      );
      if (!questionnaireRun || questionnaireRun.status !== "in_progress") {
        return null;
      }
      const items = await all<{ question_key: string; answer: unknown }>(
        db,
        `select question_key, answer from web.questionnaire_items where run_id = $1`,
        [questionnaireRun.id],
      );
      const answers: Record<string, unknown> = {};
      for (const item of items) answers[item.question_key] = item.answer;
      return { answers };
    });
  } catch {
    return null;
  }
}

/** Marks a run submitted so its link no longer resumes. */
export async function completeRun(token: string): Promise<void> {
  if (!token) return;
  try {
    await withService((db) =>
      run(
        db,
        `update web.questionnaire_runs
         set status = 'submitted', submitted_at = now()
         where idempotency_key = $1 and status = 'in_progress'`,
        [token],
      ),
    );
  } catch {
    /* best-effort */
  }
}
