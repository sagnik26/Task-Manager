import assert from "node:assert/strict";
import { describe, it } from "node:test";

import ResponseFormatter from "../../src/shared/utils/responseFormatter";

describe("ResponseFormatter", () => {
  it("formats success responses with defaults", () => {
    const response = ResponseFormatter.success();

    assert.equal(response.success, true);
    assert.equal(response.message, "Success");
    assert.equal(response.statusCode, 200);
    assert.equal(response.data, null);
    assert.match(response.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  });

  it("formats success responses with custom data and message", () => {
    const response = ResponseFormatter.success(
      { id: "task-1", title: "Write tests" },
      "Task created",
      201,
    );

    assert.equal(response.success, true);
    assert.equal(response.message, "Task created");
    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.data, { id: "task-1", title: "Write tests" });
  });

  it("formats error responses", () => {
    const response = ResponseFormatter.error("Bad request", 400, {
      email: "taken",
    });

    assert.equal(response.success, false);
    assert.equal(response.message, "Bad request");
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.error, { email: "taken" });
    assert.match(response.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  });

  it("formats paginated responses with total pages", () => {
    const response = ResponseFormatter.paginated([{ id: 1 }], 1, 10, 25);

    assert.equal(response.success, true);
    assert.deepEqual(response.data, [{ id: 1 }]);
    assert.deepEqual(response.pagination, {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it("formats paginated responses with zero total", () => {
    const response = ResponseFormatter.paginated([], 1, 10, 0);

    assert.deepEqual(response.pagination, {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });
});
