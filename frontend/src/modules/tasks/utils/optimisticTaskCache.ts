import type { QueryClient } from "@tanstack/react-query";

import { projectKeys } from "@/modules/projects/api/query-keys";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import type { Task } from "@/modules/tasks/types/tasks.types";

export function getProjectTasks(
  queryClient: QueryClient,
  projectId: string,
): Task[] | undefined {
  return queryClient.getQueryData<Task[]>(taskKeys.byProject(projectId));
}

export function setProjectTasks(
  queryClient: QueryClient,
  projectId: string,
  tasks: Task[],
): void {
  queryClient.setQueryData(taskKeys.byProject(projectId), tasks);
}

export function patchTaskInCache(
  queryClient: QueryClient,
  projectId: string,
  taskId: string,
  patch: Partial<Omit<Task, "id">>,
): Task[] | undefined {
  const previous = getProjectTasks(queryClient, projectId);
  if (!previous) return undefined;
  const next = previous.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
  setProjectTasks(queryClient, projectId, next);
  return previous;
}

export function removeTaskFromCache(
  queryClient: QueryClient,
  projectId: string,
  taskId: string,
): Task[] | undefined {
  const previous = getProjectTasks(queryClient, projectId);
  if (!previous) return undefined;
  const next = previous.filter((t) => t.id !== taskId);
  setProjectTasks(queryClient, projectId, next);
  return previous;
}

export function appendTaskToCache(
  queryClient: QueryClient,
  projectId: string,
  task: Task,
): Task[] | undefined {
  const previous = getProjectTasks(queryClient, projectId);
  if (!previous) return undefined;
  const next = [...previous, task];
  setProjectTasks(queryClient, projectId, next);
  return previous;
}

export function replaceTaskInCache(
  queryClient: QueryClient,
  projectId: string,
  tempId: string,
  task: Task,
): void {
  const previous = getProjectTasks(queryClient, projectId);
  if (!previous) return;
  setProjectTasks(
    queryClient,
    projectId,
    previous.map((t) => (t.id === tempId ? task : t)),
  );
}

export async function invalidateTaskRelatedQueries(
  queryClient: QueryClient,
  projectId: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
  await queryClient.invalidateQueries({ queryKey: taskKeys.all });
  await queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
  await queryClient.invalidateQueries({ queryKey: projectKeys.stats(projectId) });
}
