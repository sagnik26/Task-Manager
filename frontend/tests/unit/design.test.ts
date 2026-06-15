import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  avatarColor,
  formatDueDate,
  formatRelativeTime,
  initialsFromName,
  projectVisuals,
  sortTasks,
} from "../../src/shared/theme/design";
import type { TaskPriority } from "@/modules/tasks/types/tasks.types";

describe("initialsFromName", () => {
  it("derives initials from one or more name parts", () => {
    expect(initialsFromName("Ada Lovelace")).toBe("AL");
    expect(initialsFromName("Plato")).toBe("PL");
    expect(initialsFromName("  ")).toBe("?");
    expect(initialsFromName("Jean Luc Picard")).toBe("JP");
  });
});

describe("avatarColor", () => {
  it("returns a stable color for the same seed", () => {
    const first = avatarColor("user-1");
    const second = avatarColor("user-1");
    expect(first).toBe(second);
    expect(first.startsWith("#")).toBe(true);
  });
});

describe("projectVisuals", () => {
  it("cycles through the project palette", () => {
    const first = projectVisuals(0);
    const wrapped = projectVisuals(6);
    expect(first).toEqual({ color: "#0073EA", emoji: "🌐" });
    expect(wrapped).toEqual(first);
  });
});

describe("formatDueDate", () => {
  it("formats normalized due dates for display", () => {
    expect(formatDueDate("2026-06-15")).toBe("Jun 15");
    expect(formatDueDate("2026-06-15T00:00:00.000Z")).toBe("Jun 15");
    expect(formatDueDate(null)).toBe("");
    expect(formatDueDate("invalid")).toBe("");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats minutes, hours, days, and weeks ago", () => {
    expect(formatRelativeTime("2026-06-15T11:30:00.000Z")).toBe("30m ago");
    expect(formatRelativeTime("2026-06-15T10:00:00.000Z")).toBe("2h ago");
    expect(formatRelativeTime("2026-06-14T12:00:00.000Z")).toBe("Yesterday");
    expect(formatRelativeTime("2026-06-12T12:00:00.000Z")).toBe("3 days ago");
    expect(formatRelativeTime("2026-06-01T12:00:00.000Z")).toBe("2 weeks ago");
    expect(formatRelativeTime("2026-06-08T12:00:00.000Z")).toBe("1 week ago");
  });
});

describe("sortTasks", () => {
  const tasks = [
    { title: "Beta", priority: "low" as TaskPriority, dueDate: "2026-06-20", createdAt: "2026-06-02" },
    { title: "Alpha", priority: "high" as TaskPriority, dueDate: null, createdAt: "2026-06-01" },
    { title: "Gamma", priority: "medium" as TaskPriority, dueDate: "2026-06-10", createdAt: "2026-06-03" },
  ];

  it("sorts by title", () => {
    const sorted = sortTasks(tasks, "title", "asc");
    expect(sorted.map((task) => task.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by priority descending", () => {
    const sorted = sortTasks(tasks, "priority", "desc");
    expect(sorted.map((task) => task.priority)).toEqual(["low", "medium", "high"]);
  });

  it("sorts by created date ascending", () => {
    const sorted = sortTasks(tasks, "created", "asc");
    expect(sorted.map((task) => task.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("does not mutate the original array", () => {
    const copy = [...tasks];
    sortTasks(tasks, "title", "asc");
    expect(tasks).toEqual(copy);
  });
});
