import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "../../src/modules/auth/schemas/auth.schemas";

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing or invalid fields", () => {
    expect(loginSchema.safeParse({ email: "", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "bad", password: "secret" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid register input", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords and invalid email", () => {
    const shortPassword = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "12345",
    });
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0]?.message).toBe(
        "Password must be at least 6 characters",
      );
    }

    expect(
      registerSchema.safeParse({
        name: "",
        email: "jane@example.com",
        password: "secret1",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        name: "Jane",
        email: "not-email",
        password: "secret1",
      }).success,
    ).toBe(false);
  });
});
