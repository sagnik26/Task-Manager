import assert from "node:assert/strict";
import { describe, it } from "node:test";

import config from "../../src/shared/config";
import SecurityUtils from "../../src/shared/utils/SecurityUtils";

describe("SecurityUtils.validatePassword", () => {
  const rules = config.password;

  it("rejects empty password", () => {
    const result = SecurityUtils.validatePassword("");

    assert.equal(result.success, false);
    assert.deepEqual(result.errors, ["Password is required"]);
  });

  it("rejects password shorter than configured minimum", () => {
    const shortPassword = "Aa1!".slice(0, Math.max(rules.minLength - 1, 1));
    const result = SecurityUtils.validatePassword(shortPassword);

    assert.equal(result.success, false);
    assert.ok(
      result.errors.some((message) => message.includes("at least")),
    );
  });

  it("enforces enabled complexity rules from config", () => {
    if (rules.requireUppercase) {
      const result = SecurityUtils.validatePassword("password1!");
      assert.equal(result.success, false);
      assert.ok(
        result.errors.some((message) =>
          message.includes("at least one uppercase letter"),
        ),
      );
    }

    if (rules.requireLowercase) {
      const result = SecurityUtils.validatePassword("PASSWORD1!");
      assert.equal(result.success, false);
      assert.ok(
        result.errors.some((message) =>
          message.includes("at least one lowercase letter"),
        ),
      );
    }

    if (rules.requireNumbers) {
      const result = SecurityUtils.validatePassword("Password!");
      assert.equal(result.success, false);
      assert.ok(
        result.errors.some((message) =>
          message.includes("at least one number"),
        ),
      );
    }

    if (rules.requireSymbols) {
      const result = SecurityUtils.validatePassword("Password1");
      assert.equal(result.success, false);
      assert.ok(
        result.errors.some((message) =>
          message.includes("at least one special character"),
        ),
      );
    }
  });

  it("accepts password that satisfies all enabled rules", () => {
    let password = "x".repeat(Math.max(rules.minLength, 8));

    if (rules.requireUppercase) password += "A";
    if (rules.requireLowercase) password += "a";
    if (rules.requireNumbers) password += "1";
    if (rules.requireSymbols) password += "!";

    const result = SecurityUtils.validatePassword(password);

    assert.equal(result.success, true);
    assert.deepEqual(result.errors, []);
  });
});
