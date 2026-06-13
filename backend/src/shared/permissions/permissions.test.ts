import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { UserRole } from "../constants/users";
import { can, permissionFlags } from "./permissions";

describe("permissions", () => {
  it("allows admin to create:project", () => {
    assert.equal(can(UserRole.Admin, "create:project"), true);
  });

  it("denies developer create:project", () => {
    assert.equal(can(UserRole.Developer, "create:project"), false);
  });

  it("denies missing role", () => {
    assert.equal(can(undefined, "create:project"), false);
  });

  it("derives permissionFlags.createProject from can()", () => {
    const adminFlags = permissionFlags(UserRole.Admin);
    const devFlags = permissionFlags(UserRole.Developer);

    assert.equal(adminFlags.can.createProject, can(UserRole.Admin, "create:project"));
    assert.equal(devFlags.can.createProject, can(UserRole.Developer, "create:project"));
    assert.equal(adminFlags.can.createProject, true);
    assert.equal(devFlags.can.createProject, false);
  });
});
