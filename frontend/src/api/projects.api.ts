import { apiClient } from "../shared/http/client";
import { extractResponseData } from "../shared/utils/apiResponse";
import type { Project, Task } from "../types";

export type CreateProjectPayload = {
  name: string;
  description?: string | null;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string | null;
};

// The backend may return extra fields; we only rely on the subset in `Project`.
export async function listProjects(): Promise<Project[]> {
  const res = await apiClient.get("/projects");
  return extractResponseData<Project[]>(res.data);
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<Project> {
  const res = await apiClient.post("/projects", payload);
  return extractResponseData<Project>(res.data);
}

export type ProjectDetail = Project & {
  tasks?: Task[];
};

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const res = await apiClient.get(`/projects/${projectId}`);
  return extractResponseData<ProjectDetail>(res.data);
}

export async function updateProject(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const res = await apiClient.patch(`/projects/${projectId}`, payload);
  return extractResponseData<Project>(res.data);
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}

export type ProjectStats = unknown;

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const res = await apiClient.get(`/projects/${projectId}/stats`);
  return extractResponseData<ProjectStats>(res.data);
}

