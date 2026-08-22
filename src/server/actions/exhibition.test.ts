import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above imports, so the mocks it references must be too.
const { insert, send } = vi.hoisted(() => ({
  insert: vi.fn<(db: unknown, row: Record<string, unknown>) => Promise<string | null>>(
    async () => "id-1",
  ),
  send: vi.fn<(args: unknown) => Promise<boolean>>(async () => true),
}));

vi.mock("@/server/supabase/server", () => ({ createActionClient: () => ({}) }));
vi.mock("@/server/data/exhibition-signups", () => ({ insertExhibitionSignup: insert }));
vi.mock("@/server/email", () => ({ sendExhibitionResultsEmail: send }));

import { submitExhibitionSignup } from "./exhibition";

const base = {
  email: "her@example.com",
  languageCode: "af",
  menoScore: 57,
  scoreBand: "moderate" as const,
  // 1 and 2 are curated exhibition questions; 99 is not.
  answers: { "1": 3, "2": 2, "99": 1 },
  consent: true,
};

beforeEach(() => {
  insert.mockClear();
  send.mockClear();
});

describe("submitExhibitionSignup", () => {
  it("roadmap: keeps the full blanket, tags the source, sends no email", async () => {
    const res = await submitExhibitionSignup({ ...base, source: "roadmap" });
    expect(res).toEqual({ saved: true, emailed: false });
    const row = insert.mock.calls[0][1];
    expect(row.source).toBe("roadmap");
    expect(row.answers).toEqual(base.answers);
    expect(send).not.toHaveBeenCalled();
  });

  it("exhibition (default): curated answers only, email sent", async () => {
    const res = await submitExhibitionSignup(base);
    expect(res).toEqual({ saved: true, emailed: true });
    const row = insert.mock.calls[0][1];
    expect(row.source).toBe("exhibition");
    expect(Object.keys(row.answers as object)).not.toContain("99");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("no consent: stores nothing", async () => {
    const res = await submitExhibitionSignup({ ...base, consent: false, source: "roadmap" });
    expect(res).toEqual({ saved: false, emailed: false });
    expect(insert).not.toHaveBeenCalled();
  });
});
