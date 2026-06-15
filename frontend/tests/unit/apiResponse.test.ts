import { describe, expect, it } from "vitest";

import { extractResponseData } from "../../src/shared/utils/apiResponse";

describe("extractResponseData", () => {
  it("unwraps the backend success envelope", () => {
    const payload = {
      success: true,
      message: "ok",
      data: { id: "task-1", title: "Write tests" },
      statusCode: 200,
      timestamp: "2026-06-15T12:00:00.000Z",
    };

    expect(extractResponseData(payload)).toEqual({
      id: "task-1",
      title: "Write tests",
    });
  });

  it("returns raw payload when envelope is absent", () => {
    const raw = { id: "task-2", title: "Ship feature" };
    expect(extractResponseData(raw)).toBe(raw);
  });

  it("returns raw payload when success flag is false", () => {
    const payload = {
      success: false,
      data: { id: "ignored" },
    };
    expect(extractResponseData(payload)).toBe(payload);
  });

  it("returns primitives unchanged", () => {
    expect(extractResponseData("ok")).toBe("ok");
    expect(extractResponseData(42)).toBe(42);
    expect(extractResponseData(null)).toBe(null);
  });
});
