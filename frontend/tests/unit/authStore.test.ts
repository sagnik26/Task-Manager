import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "../../src/store";
import type { PermissionFlags, User } from "../../src/types/auth";

const sampleUser: User = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  tenantId: "tenant-1",
  role: "admin",
  isActive: true,
};

const samplePermissions: PermissionFlags = {
  role: "admin",
  permissions: ["create:project"],
  can: {
    createProject: true,
    deleteProject: false,
    updateProject: true,
    viewProject: true,
    manageProjectMembers: true,
    manageUsers: true,
    createTask: true,
    updateTask: true,
    viewTask: true,
    deleteTask: true,
  },
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, permissions: null });
  });

  it("sets and clears user session state", () => {
    useAuthStore.getState().setUser(sampleUser);
    expect(useAuthStore.getState().user).toEqual(sampleUser);

    useAuthStore.getState().clear();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().permissions).toBeNull();
  });

  it("sets permissions independently of user", () => {
    useAuthStore.getState().setPermissions(samplePermissions);
    expect(useAuthStore.getState().permissions).toEqual(samplePermissions);
  });
});
