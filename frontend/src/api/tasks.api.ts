import { apiClient } from "../shared/http/client";
import { normalizeDueDate } from "../shared/utils/dates";
import { extractResponseData } from "../shared/utils/apiResponse";
import type { Task, TaskPriority, TaskStatus } from "../types";

function normalizeTask(task: Task): Task {
  return {
    ...task,
    dueDate: normalizeDueDate(task.dueDate),
  };
}

function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map(normalizeTask);
}

export type ListTasksFilters = {
  status?: TaskStatus;
  assignee?: string;
};

export async function listTasks(
  projectId: string,
  filters: ListTasksFilters = {},
): Promise<Task[]> {
  const res = await apiClient.get(`/projects/${projectId}/tasks`, {
    params: {
      status: filters.status,
      assignee: filters.assignee,
    },
  });
  return normalizeTasks(extractResponseData<Task[]>(res.data));
}

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null; // YYYY-MM-DD
};

type BackendCreateOrUpdateTaskBody = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
};

function toBackendTaskBody(
  payload: CreateTaskPayload | UpdateTaskPayload,
): BackendCreateOrUpdateTaskBody {
  return {
    title: payload.title,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    assignee_id: payload.assigneeId,
    due_date: payload.dueDate,
  };
}

export async function createTask(
  projectId: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  const res = await apiClient.post(`/projects/${projectId}/tasks`, toBackendTaskBody(payload));
  return normalizeTask(extractResponseData<Task>(res.data));
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const res = await apiClient.patch(`/tasks/${taskId}`, toBackendTaskBody(payload));
  return normalizeTask(extractResponseData<Task>(res.data));
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}

