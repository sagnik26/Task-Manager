import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { UserRole } from "../../src/shared/constants/users";
import {
  PERMISSIONS,
  can,
  permissionFlags,
} from "../../src/shared/permissions/permissions";

describe("RBAC permissions", () => {
  it("grants admins tenant management actions denied to developers", () => {
    assert.equal(can(UserRole.Admin, "create:project"), true);
    assert.equal(can(UserRole.Admin, "delete:project"), true);
    assert.equal(can(UserRole.Admin, "manage:users"), true);
    assert.equal(can(UserRole.Developer, "create:project"), false);
    assert.equal(can(UserRole.Developer, "delete:project"), false);
    assert.equal(can(UserRole.Developer, "manage:users"), false);
  });

  it("denies developers project member management", () => {
    assert.equal(can(UserRole.Admin, "manage:project_members"), true);
    assert.equal(can(UserRole.Developer, "manage:project_members"), false);
  });

  it("allows both roles to create and update tasks in accessible projects", () => {
    assert.equal(can(UserRole.Admin, "create:task"), true);
    assert.equal(can(UserRole.Admin, "update:task"), true);
    assert.equal(can(UserRole.Developer, "create:task"), true);
    assert.equal(can(UserRole.Developer, "update:task"), true);
    assert.equal(can(UserRole.Developer, "delete:task"), true);
  });

  it("allows both roles to view projects and tasks", () => {
    assert.equal(can(UserRole.Admin, "view:project"), true);
    assert.equal(can(UserRole.Developer, "view:project"), true);
    assert.equal(can(UserRole.Admin, "view:task"), true);
    assert.equal(can(UserRole.Developer, "view:task"), true);
  });

  it("denies all permissions and returns empty flags when role is missing", () => {
    assert.equal(can(undefined, "view:project"), false);
    assert.equal(can(undefined, "create:task"), false);

    const flags = permissionFlags(undefined);
    assert.deepEqual(flags.permissions, []);
    assert.equal(flags.can.manageUsers, false);
    assert.equal(flags.can.createProject, false);
  });

  it("maps admin permissionFlags to all granted capabilities", () => {
    const flags = permissionFlags(UserRole.Admin);

    assert.equal(flags.role, UserRole.Admin);
    assert.deepEqual(flags.permissions, [...PERMISSIONS[UserRole.Admin]]);
    assert.equal(flags.can.createProject, true);
    assert.equal(flags.can.manageProjectMembers, true);
    assert.equal(flags.can.manageUsers, true);
    assert.equal(flags.can.deleteTask, true);
  });

  it("maps developer permissionFlags without admin-only capabilities", () => {
    const flags = permissionFlags(UserRole.Developer);

    assert.equal(flags.role, UserRole.Developer);
    assert.equal(flags.can.createProject, false);
    assert.equal(flags.can.manageUsers, false);
    assert.equal(flags.can.createTask, true);
    assert.equal(flags.can.viewProject, true);
  });
});
