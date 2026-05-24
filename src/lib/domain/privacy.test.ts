import { describe, it, expect } from "vitest";
import { maskEmail } from "./privacy";

describe("maskEmail", () => {
  it("masks a normal address", () => {
    expect(maskEmail("thandi@example.com")).toBe("t****@example.com");
  });

  it("preserves the single-char local part", () => {
    expect(maskEmail("t@example.com")).toBe("t****@example.com");
  });

  it("masks a two-char local part", () => {
    expect(maskEmail("ab@example.com")).toBe("a****@example.com");
  });

  it("returns null for empty / nullish input", () => {
    expect(maskEmail(null)).toBeNull();
    expect(maskEmail(undefined)).toBeNull();
    expect(maskEmail("")).toBeNull();
  });

  it("passes through a value without an @ unchanged", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });

  it("does not leak local-part length (always 4 asterisks)", () => {
    expect(maskEmail("a@x.io")).toBe("a****@x.io");
    expect(maskEmail("longname@x.io")).toBe("l****@x.io");
    expect(maskEmail("extremely-long-local-part@x.io")).toBe("e****@x.io");
  });

  it("preserves the full domain so admins can spot company / provider", () => {
    expect(maskEmail("user@joinmandi.com")).toBe("u****@joinmandi.com");
    expect(maskEmail("user@gmail.com")).toBe("u****@gmail.com");
  });

  it("treats a leading @ as not-an-email (defensive)", () => {
    // indexOf returns 0 — guard with at <= 0
    expect(maskEmail("@example.com")).toBe("@example.com");
  });
});
