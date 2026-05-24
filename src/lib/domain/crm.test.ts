/** Unit tests for the CRM segmentation + compliance helpers. */
import { describe, expect, it } from "vitest";
import {
  aggregateCompliance,
  complianceStatus,
  engagementLevel,
  funnelStats,
  segmentByBand,
  segmentByLanguage,
  segmentByPersona,
} from "./crm";
import type {
  CheckinRow,
  QuestionnaireResponseRow,
  SymptomLogRow,
  UserRow,
} from "@/lib/types/database";

const FIXED_NOW = new Date("2026-05-20T12:00:00Z");

function response(
  overrides: Partial<QuestionnaireResponseRow> = {},
): QuestionnaireResponseRow {
  return {
    id: "r1",
    session_id: null,
    user_id: "u1",
    language_code: "en",
    answers: {},
    meno_score: 50,
    score_band: "moderate",
    persona: "olga",
    self_harm_flag: false,
    colleen_flag: false,
    top_domains: [],
    completed_at: "2026-03-01T00:00:00Z",
    ...overrides,
  };
}

function user(id: string, lang = "en"): UserRow {
  return {
    id,
    email: `${id}@x.test`,
    language_code: lang,
    role: "member",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function checkin(type: "6week" | "3month", completed = true): CheckinRow {
  return {
    id: `c-${type}`,
    user_id: "u1",
    type,
    original_response_id: "r1",
    new_response_id: null,
    action_taken: null,
    open_response: null,
    completed_at: completed ? "2026-05-01T00:00:00Z" : null,
  };
}

function log(daysAgo: number, domain: "mood" = "mood"): SymptomLogRow {
  const d = new Date(FIXED_NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const iso = d.toISOString().slice(0, 10);
  return {
    id: `l-${daysAgo}`,
    user_id: "u1",
    logged_date: iso,
    domain,
    score: 2,
    created_at: d.toISOString(),
  };
}

describe("segmentByPersona", () => {
  it("tallies the latest persona per user; ignores nulls", () => {
    const latest = new Map<string, QuestionnaireResponseRow | null>([
      ["u1", response({ persona: "olga" })],
      ["u2", response({ persona: "olga" })],
      ["u3", response({ persona: "colleen" })],
      ["u4", response({ persona: null })],
      ["u5", null],
    ]);
    const seg = segmentByPersona(latest);
    expect(seg.olga).toBe(2);
    expect(seg.colleen).toBe(1);
    expect(seg.sally).toBe(0);
    expect(seg.vicky).toBe(0);
  });
});

describe("segmentByBand", () => {
  it("tallies the latest score_band per user", () => {
    const latest = new Map<string, QuestionnaireResponseRow | null>([
      ["u1", response({ score_band: "mild" })],
      ["u2", response({ score_band: "moderate" })],
      ["u3", response({ score_band: "moderate" })],
      ["u4", response({ score_band: "significant" })],
    ]);
    expect(segmentByBand(latest)).toEqual({ mild: 1, moderate: 2, significant: 1 });
  });
});

describe("segmentByLanguage", () => {
  it("tallies by stored language; null defaults to en", () => {
    const seg = segmentByLanguage([
      user("u1", "xh"),
      user("u2", "xh"),
      user("u3", "zu"),
      { ...user("u4"), language_code: null },
    ]);
    expect(seg.xh).toBe(2);
    expect(seg.zu).toBe(1);
    expect(seg.en).toBe(1);
  });
});

describe("complianceStatus", () => {
  it("returns all false with no questionnaire", () => {
    expect(complianceStatus(null, [], FIXED_NOW)).toEqual({
      sixWeekDone: false,
      threeMonthDone: false,
      sixWeekDue: false,
      threeMonthDue: false,
    });
  });

  it("flags both due and done when checkins exist past 12 weeks", () => {
    const r = response({ completed_at: "2026-01-01T00:00:00Z" }); // ~20 weeks before FIXED_NOW
    const cs = complianceStatus(r, [checkin("6week"), checkin("3month")], FIXED_NOW);
    expect(cs.sixWeekDue).toBe(true);
    expect(cs.threeMonthDue).toBe(true);
    expect(cs.sixWeekDone).toBe(true);
    expect(cs.threeMonthDone).toBe(true);
  });

  it("treats incomplete check-ins as not done", () => {
    const r = response({ completed_at: "2026-01-01T00:00:00Z" });
    const cs = complianceStatus(r, [checkin("6week", false)], FIXED_NOW);
    expect(cs.sixWeekDue).toBe(true);
    expect(cs.sixWeekDone).toBe(false);
  });

  it("not due if questionnaire was recent", () => {
    const recent = new Date(FIXED_NOW.getTime() - 2 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const cs = complianceStatus(response({ completed_at: recent }), [], FIXED_NOW);
    expect(cs.sixWeekDue).toBe(false);
    expect(cs.threeMonthDue).toBe(false);
  });
});

describe("aggregateCompliance", () => {
  it("computes a cohort rate from per-user statuses", () => {
    const olderResp = response({ completed_at: "2026-01-01T00:00:00Z" });
    const recentResp = response({ completed_at: "2026-05-10T00:00:00Z" });
    const result = aggregateCompliance(
      [
        { latest: olderResp, checkins: [checkin("6week")] }, // due, done
        { latest: olderResp, checkins: [] }, // due, not done
        { latest: recentResp, checkins: [] }, // not due
      ],
      FIXED_NOW,
    );
    expect(result.sixWeekDue).toBe(2);
    expect(result.sixWeekDone).toBe(1);
    expect(result.sixWeekRate).toBeCloseTo(0.5);
  });
});

describe("engagementLevel", () => {
  it("classifies by recent log count", () => {
    expect(engagementLevel([], 7, FIXED_NOW)).toBe("inactive");
    expect(engagementLevel([log(1), log(2)], 7, FIXED_NOW)).toBe("light");
    expect(engagementLevel(Array.from({ length: 5 }, (_, i) => log(i)), 7, FIXED_NOW))
      .toBe("active");
    expect(engagementLevel(Array.from({ length: 14 }, (_, i) => log(i % 7)), 7, FIXED_NOW))
      .toBe("engaged");
  });

  it("excludes logs older than the window", () => {
    expect(engagementLevel([log(30), log(45)], 7, FIXED_NOW)).toBe("inactive");
  });
});

describe("funnelStats", () => {
  it("intersects user sets at each funnel stage", () => {
    const users = [user("u1"), user("u2"), user("u3"), user("u4")];
    const result = funnelStats(
      users,
      new Set(["u1", "u2", "u3", "ghost"]), // ghost not in users
      new Set(["u1", "u2"]),
      new Set(["u1"]),
    );
    expect(result).toEqual({
      signedUp: 4,
      answeredQuestionnaire: 3,
      trackedSymptoms: 2,
      completedSixWeek: 1,
    });
  });
});
