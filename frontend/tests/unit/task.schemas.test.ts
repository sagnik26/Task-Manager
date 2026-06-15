import { describe, expect, it } from "vitest";

import { taskUpsertSchema } from "@/modules/tasks/schemas/task.schemas";

const validTask = {
  title: "Review PR",
  status: "in_progress" as const,
  priority: "high" as const,
  assigneeId: null,
  dueDate: "2026-06-15",
};

describe("taskUpsertSchema", () => {
  it("accepts valid task modal input", () => {
    expect(taskUpsertSchema.safeParse(validTask).success).toBe(true);
    expect(
      taskUpsertSchema.safeParse({
        ...validTask,
        description: "  Notes here  ",
      }).success,
    ).toBe(true);
    expect(
      taskUpsertSchema.safeParse({
        ...validTask,
        assigneeId: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid task modal input", () => {
    const emptyTitle = taskUpsertSchema.safeParse({
      title: "",
      status: "todo",
      priority: "medium",
      assigneeId: null,
      dueDate: null,
    });
    expect(emptyTitle.success).toBe(false);

    const badDueDate = taskUpsertSchema.safeParse({
      title: "Review PR",
      status: "in_progress",
      priority: "high",
      assigneeId: null,
      dueDate: "06/15/2026",
    });
    expect(badDueDate.success).toBe(false);
    if (!badDueDate.success) {
      expect(badDueDate.error.issues[0]?.message).toBe(
        "Due date must be YYYY-MM-DD",
      );
    }
  });

  it("rejects invalid status, priority, and assignee id", () => {
    expect(
      taskUpsertSchema.safeParse({ ...validTask, status: "blocked" }).success,
    ).toBe(false);
    expect(
      taskUpsertSchema.safeParse({ ...validTask, priority: "urgent" }).success,
    ).toBe(false);
    expect(
      taskUpsertSchema.safeParse({ ...validTask, assigneeId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("rejects overly long descriptions", () => {
    const result = taskUpsertSchema.safeParse({
      ...validTask,
      description: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Description is too long");
    }
  });
});
