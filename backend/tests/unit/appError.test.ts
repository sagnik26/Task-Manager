import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AppError } from "../../src/shared/utils/AppError";

describe("AppError", () => {
  it("sets default status code and operational flag", () => {
    const error = new AppError("Something failed");

    assert.equal(error.name, "AppError");
    assert.equal(error.message, "Something failed");
    assert.equal(error.statusCode, 500);
    assert.equal(error.isOperational, true);
    assert.equal(error.errors, null);
  });

  it("preserves custom status code and field errors", () => {
    const error = new AppError("Validation failed", 400, {
      email: "already registered",
    });

    assert.equal(error.statusCode, 400);
    assert.deepEqual(error.errors, { email: "already registered" });
  });

  it("is an instance of Error", () => {
    const error = new AppError("Not found", 404);
    assert.ok(error instanceof Error);
    assert.ok(error instanceof AppError);
  });
});
