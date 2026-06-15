import { describe, expect, it } from "vitest";

import { toApiError } from "../../src/shared/utils/apiErrors";

function axiosError(status: number, data?: unknown, message = "Request failed") {
  return {
    isAxiosError: true,
    message,
    response: { status, data },
  };
}

function networkError(message = "Network Error") {
  return {
    isAxiosError: true,
    message,
    response: undefined,
  };
}

describe("toApiError", () => {
  it("maps 401 and 403 responses to auth error kinds", () => {
    expect(toApiError(axiosError(401))).toEqual({
      kind: "unauthorized",
      status: 401,
      message: "unauthorized",
    });
    expect(toApiError(axiosError(403))).toEqual({
      kind: "forbidden",
      status: 403,
      message: "forbidden",
    });
  });

  it("maps 404 responses to not_found", () => {
    expect(toApiError(axiosError(404))).toEqual({
      kind: "not_found",
      status: 404,
      message: "not found",
    });
  });

  it("maps validation failed responses with field errors", () => {
    expect(
      toApiError(
        axiosError(400, {
          error: "validation failed",
          fields: { email: "invalid email format" },
        }),
      ),
    ).toEqual({
      kind: "validation",
      status: 400,
      message: "validation failed",
      fields: { email: "invalid email format" },
    });
  });

  it("maps validation failed without fields to empty field map", () => {
    expect(
      toApiError(axiosError(400, { error: "validation failed" })),
    ).toEqual({
      kind: "validation",
      status: 400,
      message: "validation failed",
      fields: {},
    });
  });

  it("treats 400 with non-validation body as generic http error", () => {
    expect(toApiError(axiosError(400, { error: "bad request" }))).toEqual({
      kind: "http",
      status: 400,
      message: "bad request",
    });
  });

  it("maps axios network errors without a response", () => {
    expect(toApiError(networkError())).toEqual({
      kind: "network",
      message: "Network Error",
    });
    expect(toApiError(networkError(""))).toEqual({
      kind: "network",
      message: "network error",
    });
  });

  it("maps other http statuses using backend error message", () => {
    expect(toApiError(axiosError(409, { error: "email already exists" }))).toEqual({
      kind: "http",
      status: 409,
      message: "email already exists",
    });
    expect(toApiError(axiosError(500))).toEqual({
      kind: "http",
      status: 500,
      message: "Request failed",
    });
  });

  it("returns unknown for non-axios errors", () => {
    expect(toApiError(new Error("boom"))).toEqual({
      kind: "unknown",
      message: "unknown error",
    });
    expect(toApiError(null)).toEqual({
      kind: "unknown",
      message: "unknown error",
    });
  });
});
