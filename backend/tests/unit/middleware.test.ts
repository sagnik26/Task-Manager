import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { z } from "zod";

import config from "../../src/shared/config";
import { UserRole } from "../../src/shared/constants/users";
import authenticate from "../../src/shared/middlewares/authenticate";
import authorize from "../../src/shared/middlewares/authorize";
import errorHandler from "../../src/shared/middlewares/errorHandler";
import validate from "../../src/shared/middlewares/validate";
import { AppError } from "../../src/shared/utils/AppError";
import {
  asResponse,
  createMockNext,
  createMockRequest,
  createMockResponse,
} from "../helpers/expressMocks";

const userId = "550e8400-e29b-41d4-a716-446655440001";
const tenantId = "550e8400-e29b-41d4-a716-446655440002";

function signToken(
  payload: Record<string, unknown>,
  options?: jwt.SignOptions,
): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: "1h",
    ...options,
  });
}

describe("validate middleware", () => {
  const schema = z.object({
    email: z.string().email("invalid email format"),
  });

  it("calls next and replaces req.body when validation succeeds", () => {
    const req = createMockRequest({ body: { email: "user@example.com" } });
    const res = createMockResponse();
    const next = createMockNext();

    validate(schema)(req, asResponse(res), next);

    assert.equal(next.calls, 1);
    assert.deepEqual(req.body, { email: "user@example.com" });
  });

  it("returns 400 with field errors when validation fails", () => {
    const req = createMockRequest({ body: { email: "bad" } });
    const res = createMockResponse();
    const next = createMockNext();

    validate(schema)(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      error: "validation failed",
      fields: { email: "invalid email format" },
    });
  });

  it("passes through when schema is null or undefined", () => {
    const req = createMockRequest({ body: { any: "value" } });
    const res = createMockResponse();
    const next = createMockNext();

    validate(null)(req, asResponse(res), next);
    assert.equal(next.calls, 1);

    validate(undefined)(req, asResponse(res), next);
    assert.equal(next.calls, 2);
  });

  it("returns 500 when schema is not a Zod schema", () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();
    const next = createMockNext();

    validate({} as never)(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: "internal server error" });
  });
});

describe("authenticate middleware", () => {
  it("returns 401 when no token is provided", () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "unauthorized" });
  });

  it("attaches req.user for a valid Bearer token", () => {
    const token = signToken({
      user_id: userId,
      email: "admin@example.com",
      tenant_id: tenantId,
      role: UserRole.Admin,
    });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, asResponse(res), next);

    assert.equal(next.calls, 1);
    assert.deepEqual(req.user, {
      userId,
      email: "admin@example.com",
      tenantId,
      role: UserRole.Admin,
    });
  });

  it("reads token from authToken cookie", () => {
    const token = signToken({
      user_id: userId,
      email: "dev@example.com",
      tenant_id: tenantId,
      role: UserRole.Developer,
    });
    const req = createMockRequest({
      cookies: { authToken: token },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, asResponse(res), next);

    assert.equal(next.calls, 1);
    assert.equal(req.user?.role, UserRole.Developer);
  });

  it("returns 401 for expired tokens", () => {
    const token = signToken(
      {
        user_id: userId,
        email: "admin@example.com",
        tenant_id: tenantId,
        role: UserRole.Admin,
      },
      { expiresIn: "-1s" },
    );
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 401);
  });

  it("returns 401 when token payload is missing required claims", () => {
    const token = signToken({ email: "admin@example.com" });
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 401);
  });
});

describe("authorize middleware", () => {
  it("returns 401 when req.user is missing", () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    authorize("create:project")(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 401);
  });

  it("returns 403 when role lacks permission", () => {
    const req = createMockRequest({
      user: {
        userId,
        email: "dev@example.com",
        tenantId,
        role: UserRole.Developer,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authorize("create:project")(req, asResponse(res), next);

    assert.equal(next.calls, 0);
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, {
      error: "forbidden",
      message: "Requires permission: create:project",
    });
  });

  it("calls next when role has permission", () => {
    const req = createMockRequest({
      user: {
        userId,
        email: "admin@example.com",
        tenantId,
        role: UserRole.Admin,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    authorize("manage:users")(req, asResponse(res), next);

    assert.equal(next.calls, 1);
  });
});

describe("errorHandler middleware", () => {
  it("maps AppError validation failures to 400 field responses", () => {
    const req = createMockRequest({ path: "/auth/register", method: "POST" });
    const res = createMockResponse();
    const next = createMockNext();
    const error = new AppError("Validation failed", 400, {
      email: "already registered",
    });

    errorHandler(error, req, asResponse(res), next);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      error: "validation failed",
      fields: { email: "already registered" },
    });
  });

  it("maps operational AppError status codes", () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(new AppError("Missing", 404), req, asResponse(res), next);
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { error: "not found" });

    const forbiddenRes = createMockResponse();
    errorHandler(new AppError("Denied", 403), req, asResponse(forbiddenRes), next);
    assert.equal(forbiddenRes.statusCode, 403);
    assert.deepEqual(forbiddenRes.body, { error: "forbidden" });
  });

  it("returns 500 for unexpected errors", () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(new Error("boom"), req, asResponse(res), next);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: "internal server error" });
  });
});
