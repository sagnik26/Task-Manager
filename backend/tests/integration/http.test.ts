import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";

import app from "../../src/app";
import config from "../../src/shared/config";
import { UserRole } from "../../src/shared/constants/users";

const userId = "550e8400-e29b-41d4-a716-446655440001";
const tenantId = "550e8400-e29b-41d4-a716-446655440002";

function adminToken(): string {
  return jwt.sign(
    {
      user_id: userId,
      email: "admin@example.com",
      tenant_id: tenantId,
      role: UserRole.Admin,
    },
    config.jwt.secret,
    { expiresIn: "1h" },
  );
}

describe("HTTP API (supertest)", () => {
  describe("health and routing", () => {
    it("GET /health returns a healthy success envelope", async () => {
      const response = await request(app).get("/health").expect(200);

      assert.equal(response.body.success, true);
      assert.equal(response.body.data.status, "healthy");
      assert.equal(typeof response.body.data.uptime, "number");
      assert.match(response.body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    });

    it("GET /unknown-route returns 404 not found", async () => {
      const response = await request(app).get("/unknown-route").expect(404);

      assert.equal(response.body.error, "not found");
    });
  });

  describe("auth routes", () => {
    it("POST /auth/register rejects invalid email with validation fields", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Ada Lovelace",
          email: "not-an-email",
          password: "password123",
        })
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(response.body.fields.email, "invalid email format");
    });

    it("POST /auth/register rejects missing name", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "",
          email: "ada@example.com",
          password: "password123",
        })
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(response.body.fields.name, "name is required");
    });

    it("POST /auth/login rejects invalid email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "bad-email", password: "password123" })
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(response.body.fields.email, "invalid email format");
    });

    it("GET /auth/profile without credentials returns 401 unauthorized", async () => {
      const response = await request(app).get("/auth/profile").expect(401);

      assert.equal(response.body.error, "unauthorized");
    });

    it("GET /auth/permissions without credentials returns 401 unauthorized", async () => {
      const response = await request(app).get("/auth/permissions").expect(401);

      assert.equal(response.body.error, "unauthorized");
    });

    it("GET /auth/profile rejects malformed bearer token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer not-a-jwt")
        .expect(401);

      assert.equal(response.body.error, "unauthorized");
    });
  });

  describe("protected routes without credentials", () => {
    it("GET /projects returns 401 unauthorized", async () => {
      const response = await request(app).get("/projects").expect(401);
      assert.equal(response.body.error, "unauthorized");
    });

    it("POST /projects returns 401 unauthorized", async () => {
      const response = await request(app)
        .post("/projects")
        .send({ name: "New project" })
        .expect(401);

      assert.equal(response.body.error, "unauthorized");
    });

    it("GET /users returns 401 unauthorized", async () => {
      const response = await request(app).get("/users").expect(401);
      assert.equal(response.body.error, "unauthorized");
    });

    it("GET /projects/:id/tasks returns 401 unauthorized", async () => {
      const response = await request(app)
        .get("/projects/550e8400-e29b-41d4-a716-446655440000/tasks")
        .expect(401);

      assert.equal(response.body.error, "unauthorized");
    });

    it("PATCH /tasks/:id returns 401 unauthorized", async () => {
      const response = await request(app)
        .patch("/tasks/550e8400-e29b-41d4-a716-446655440000")
        .send({ title: "Updated" })
        .expect(401);

      assert.equal(response.body.error, "unauthorized");
    });
  });

  describe("protected routes with validation before database", () => {
    it("POST /projects validates body before hitting controller", async () => {
      const response = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "" })
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(response.body.fields.name, "name is required");
    });

    it("POST /projects/:id/members validates user_id uuid", async () => {
      const response = await request(app)
        .post("/projects/550e8400-e29b-41d4-a716-446655440000/members")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ user_id: "not-a-uuid" })
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(
        response.body.fields.user_id,
        "user_id must be a valid uuid",
      );
    });

    it("PATCH /tasks/:id rejects empty update body", async () => {
      const response = await request(app)
        .patch("/tasks/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({})
        .expect(400);

      assert.equal(response.body.error, "validation failed");
      assert.equal(
        response.body.fields.body,
        "at least one field must be provided",
      );
    });
  });
});
