import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { taskKeys } from "@/modules/tasks/api/query-keys";
import type { Task } from "@/modules/tasks/types/tasks.types";
import {
  appendTaskToCache,
  patchTaskInCache,
  removeTaskFromCache,
  replaceTaskInCache,
} from "@/modules/tasks/utils/optimisticTaskCache";

const projectId = "project-1";

const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "First",
    status: "todo",
    priority: "medium",
    assigneeId: null,
    dueDate: null,
    projectId,
  },
  {
    id: "task-2",
    title: "Second",
    status: "in_progress",
    priority: "high",
    assigneeId: "user-1",
    dueDate: "2026-06-15",
    projectId,
  },
];

function createClientWithTasks(): QueryClient {
  const client = new QueryClient();
  client.setQueryData(taskKeys.byProject(projectId), sampleTasks);
  return client;
}

describe("optimisticTaskCache", () => {
  it("patches a task in the project cache", () => {
    const client = createClientWithTasks();
    const previous = patchTaskInCache(client, projectId, "task-1", {
      title: "Updated",
    });

    expect(previous).toEqual(sampleTasks);
    expect(client.getQueryData<Task[]>(taskKeys.byProject(projectId))).toEqual([
      { ...sampleTasks[0], title: "Updated" },
      sampleTasks[1],
    ]);
  });

  it("removes a task from the project cache", () => {
    const client = createClientWithTasks();
    const previous = removeTaskFromCache(client, projectId, "task-1");

    expect(previous).toEqual(sampleTasks);
    expect(client.getQueryData<Task[]>(taskKeys.byProject(projectId))).toEqual([
      sampleTasks[1],
    ]);
  });

  it("appends a task to the project cache", () => {
    const client = createClientWithTasks();
    const newTask: Task = {
      id: "task-3",
      title: "Third",
      status: "todo",
      priority: "low",
      assigneeId: null,
      dueDate: null,
      projectId,
    };
    const previous = appendTaskToCache(client, projectId, newTask);

    expect(previous).toEqual(sampleTasks);
    expect(client.getQueryData<Task[]>(taskKeys.byProject(projectId))).toEqual([
      ...sampleTasks,
      newTask,
    ]);
  });

  it("replaces a temp task with the server task", () => {
    const client = createClientWithTasks();
    const tempTask: Task = {
      id: "temp-id",
      title: "Draft",
      status: "todo",
      priority: "medium",
      assigneeId: null,
      dueDate: null,
      projectId,
    };
    appendTaskToCache(client, projectId, tempTask);

    const serverTask: Task = {
      ...tempTask,
      id: "task-real",
    };
    replaceTaskInCache(client, projectId, "temp-id", serverTask);

    expect(client.getQueryData<Task[]>(taskKeys.byProject(projectId))).toEqual([
      ...sampleTasks,
      serverTask,
    ]);
  });
});
