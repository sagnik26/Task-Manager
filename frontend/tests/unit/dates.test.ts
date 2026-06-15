import { describe, expect, it } from "vitest";

import { normalizeDueDate, toDateInputValue } from "../../src/shared/utils/dates";

describe("normalizeDueDate", () => {
  it("returns null for empty values", () => {
    expect(normalizeDueDate(null)).toBeNull();
    expect(normalizeDueDate(undefined)).toBeNull();
    expect(normalizeDueDate("")).toBeNull();
    expect(normalizeDueDate("   ")).toBeNull();
  });

  it("returns YYYY-MM-DD strings unchanged", () => {
    expect(normalizeDueDate("2026-06-15")).toBe("2026-06-15");
    expect(normalizeDueDate(" 2026-06-15 ")).toBe("2026-06-15");
  });

  it("extracts date prefix from ISO timestamps", () => {
    expect(normalizeDueDate("2026-06-15T12:34:56.000Z")).toBe("2026-06-15");
  });

  it("parses other date strings to YYYY-MM-DD", () => {
    expect(normalizeDueDate("June 15, 2026")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns null for unparseable values", () => {
    expect(normalizeDueDate("not-a-date")).toBeNull();
  });
});

describe("toDateInputValue", () => {
  it("returns empty string when date is missing", () => {
    expect(toDateInputValue(null)).toBe("");
    expect(toDateInputValue(undefined)).toBe("");
  });

  it("returns normalized date for inputs", () => {
    expect(toDateInputValue("2026-06-15T00:00:00.000Z")).toBe("2026-06-15");
  });
});
