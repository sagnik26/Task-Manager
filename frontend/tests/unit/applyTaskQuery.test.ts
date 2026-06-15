import { describe, expect, it } from "vitest";

import { DEFAULT_SORT } from "../../src/modules/tasks/components/SortPanel";
import {
  applyTaskFilters,
  applyTaskQuery,
  countActiveFilters,
  DEFAULT_TASK_QUERY,
  isQueryActive,
  isSortActive,
} from "../../src/modules/tasks/utils/applyTaskQuery";
import type { Task } from "../../src/types/tasks";

const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "My task",
    status: "todo",
    priority: "low",
    assigneeId: "user-1",
    dueDate: "2026-06-10",
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "task-2",
    title: "Done task",
    status: "done",
    priority: "high",
    assigneeId: null,
    dueDate: null,
    createdAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "task-3",
    title: "Alpha task",
    status: "in_progress",
    priority: "medium",
    assigneeId: "user-2",
    dueDate: "2026-06-20",
    createdAt: "2026-06-02T10:00:00.000Z",
  },
];

const emptyFilters = {
  filterStatus: [],
  filterPriority: [],
  filterAssignee: [],
  dueFrom: "",
  dueTo: "",
};

const context = { currentUserId: "user-1" };

describe("applyTaskFilters", () => {
  it("filters kanban tasks by status, assignee, and due date range", () => {
    const byStatus = applyTaskFilters(sampleTasks, { ...emptyFilters, filterStatus: ["todo"] }, context);
    expect(byStatus.map((task) => task.id)).toEqual(["task-1"]);

    const byAssignee = applyTaskFilters(sampleTasks, { ...emptyFilters, filterAssignee: ["me"] }, context);
    expect(byAssignee.map((task) => task.id)).toEqual(["task-1"]);

    const byDueDate = applyTaskFilters(
      sampleTasks,
      { ...emptyFilters, dueFrom: "2026-06-01", dueTo: "2026-06-15" },
      context,
    );
    expect(byDueDate.map((task) => task.id)).toEqual(["task-1"]);
  });

  it("filters by priority and unassigned assignee", () => {
    const byPriority = applyTaskFilters(
      sampleTasks,
      { ...emptyFilters, filterPriority: ["high"] },
      context,
    );
    expect(byPriority.map((task) => task.id)).toEqual(["task-2"]);

    const unassigned = applyTaskFilters(
      sampleTasks,
      { ...emptyFilters, filterAssignee: ["unassigned"] },
      context,
    );
    expect(unassigned.map((task) => task.id)).toEqual(["task-2"]);
  });

  it("filters by specific member assignee id", () => {
    const byMember = applyTaskFilters(
      sampleTasks,
      { ...emptyFilters, filterAssignee: ["user-2"] },
      context,
    );
    expect(byMember.map((task) => task.id)).toEqual(["task-3"]);
  });

  it("excludes tasks without due dates when a due range is set", () => {
    const filtered = applyTaskFilters(
      sampleTasks,
      { ...emptyFilters, dueFrom: "2026-06-01" },
      context,
    );
    expect(filtered.map((task) => task.id)).toEqual(["task-1", "task-3"]);
  });

  it("returns all tasks when no filters are active", () => {
    expect(applyTaskFilters(sampleTasks, emptyFilters, context)).toHaveLength(3);
  });
});

describe("applyTaskQuery", () => {
  it("sorts filtered tasks by title ascending", () => {
    const result = applyTaskQuery(
      sampleTasks,
      { ...emptyFilters, sortBy: "title", sortDir: "asc" },
      context,
    );
    expect(result.map((task) => task.title)).toEqual([
      "Alpha task",
      "Done task",
      "My task",
    ]);
  });

  it("sorts by priority descending", () => {
    const result = applyTaskQuery(
      sampleTasks,
      { ...emptyFilters, sortBy: "priority", sortDir: "desc" },
      context,
    );
    expect(result.map((task) => task.priority)).toEqual(["low", "medium", "high"]);
  });

  it("sorts by due date with nulls last in ascending order", () => {
    const result = applyTaskQuery(
      sampleTasks,
      { ...emptyFilters, sortBy: "dueDate", sortDir: "asc" },
      context,
    );
    expect(result.map((task) => task.id)).toEqual(["task-1", "task-3", "task-2"]);
  });
});

describe("query helpers", () => {
  it("counts active filters", () => {
    expect(countActiveFilters(emptyFilters)).toBe(0);
    expect(
      countActiveFilters({
        filterStatus: ["todo"],
        filterPriority: ["high", "low"],
        filterAssignee: ["me"],
        dueFrom: "2026-06-01",
        dueTo: "",
      }),
    ).toBe(5);
  });

  it("detects active sort state", () => {
    expect(isSortActive(DEFAULT_SORT)).toBe(false);
    expect(isSortActive({ sortBy: "title", sortDir: "asc" })).toBe(true);
    expect(isSortActive({ ...DEFAULT_SORT, sortDir: "desc" })).toBe(true);
  });

  it("detects active query state", () => {
    expect(isQueryActive(emptyFilters, DEFAULT_SORT)).toBe(false);
    expect(isQueryActive({ ...emptyFilters, filterStatus: ["done"] }, DEFAULT_SORT)).toBe(true);
    expect(isQueryActive(emptyFilters, { sortBy: "title", sortDir: "asc" })).toBe(true);
  });

  it("exposes default task query state", () => {
    expect(DEFAULT_TASK_QUERY).toMatchObject({
      ...emptyFilters,
      ...DEFAULT_SORT,
    });
  });
});
