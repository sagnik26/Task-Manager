import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  loginBodySchema,
  registerBodySchema,
} from "../../src/modules/auth/validators/auth.validator";
import {
  addProjectMemberBodySchema,
  createProjectBodySchema,
  updateProjectBodySchema,
} from "../../src/modules/projects/validators/projects.validator";
import {
  createTaskBodySchema,
  updateTaskBodySchema,
} from "../../src/modules/tasks/validators/tasks.validator";
import { updateUserBodySchema } from "../../src/modules/users/validators/users.validator";
import { ProjectStatus } from "../../src/shared/constants/projects";
import { TaskPriority, TaskStatus } from "../../src/shared/constants/tasks";
import { UserRole } from "../../src/shared/constants/users";

describe("auth validators", () => {
  it("accepts valid register and login payloads", () => {
    const register = registerBodySchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });
    assert.equal(register.success, true);

    const login = loginBodySchema.safeParse({
      email: "ada@example.com",
      password: "password123",
    });
    assert.equal(login.success, true);
  });

  it("rejects register with empty name", () => {
    const result = registerBodySchema.safeParse({
      name: "",
      email: "ada@example.com",
      password: "password123",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "name is required");
    }
  });

  it("rejects login with invalid email", () => {
    const result = loginBodySchema.safeParse({
      email: "bad-email",
      password: "password123",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "invalid email format");
    }
  });

  it("rejects login with empty password", () => {
    const result = loginBodySchema.safeParse({
      email: "ada@example.com",
      password: "",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "password is required");
    }
  });
});

describe("users validators", () => {
  it("accepts role-only and is_active-only updates", () => {
    const roleUpdate = updateUserBodySchema.safeParse({
      role: UserRole.Admin,
    });
    assert.equal(roleUpdate.success, true);

    const activeUpdate = updateUserBodySchema.safeParse({ is_active: false });
    assert.equal(activeUpdate.success, true);
  });

  it("rejects empty user update body", () => {
    const result = updateUserBodySchema.safeParse({});

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(
        result.error.issues[0]?.message,
        "at least one of role or is_active is required",
      );
    }
  });

  it("rejects invalid role value", () => {
    const result = updateUserBodySchema.safeParse({ role: "superadmin" });

    assert.equal(result.success, false);
  });
});

describe("projects validators", () => {
  it("rejects create project without name", () => {
    const result = createProjectBodySchema.safeParse({ name: "" });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "name is required");
    }
  });

  it("accepts project update with status only", () => {
    const result = updateProjectBodySchema.safeParse({
      status: ProjectStatus.Archived,
    });

    assert.equal(result.success, true);
  });

  it("rejects project update with no fields", () => {
    const result = updateProjectBodySchema.safeParse({});

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(
        result.error.issues[0]?.message,
        "at least one of name, description, or status is required",
      );
    }
  });

  it("rejects add member with invalid user_id uuid", () => {
    const result = addProjectMemberBodySchema.safeParse({
      user_id: "not-a-uuid",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "user_id must be a valid uuid");
    }
  });
});

describe("tasks validators", () => {
  it("accepts minimal valid create task payload", () => {
    const result = createTaskBodySchema.safeParse({
      title: "Write tests",
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
    });

    assert.equal(result.success, true);
  });

  it("rejects create task with invalid assignee_id", () => {
    const result = createTaskBodySchema.safeParse({
      title: "Write tests",
      assignee_id: "not-a-uuid",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.issues[0]?.message, "Invalid UUID");
    }
  });

  it("rejects create task with invalid due_date format", () => {
    const result = createTaskBodySchema.safeParse({
      title: "Write tests",
      due_date: "2026/06/15",
    });

    assert.equal(result.success, false);
    if (!result.success) {
      assert.match(result.error.issues[0]?.message ?? "", /YYYY-MM-DD/);
    }
  });

  it("accepts task update with a single field", () => {
    const result = updateTaskBodySchema.safeParse({ title: "Updated title" });
    assert.equal(result.success, true);
  });

  it("rejects task update with no fields", () => {
    const result = updateTaskBodySchema.safeParse({});

    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(
        result.error.issues[0]?.message,
        "at least one field must be provided",
      );
    }
  });
});
