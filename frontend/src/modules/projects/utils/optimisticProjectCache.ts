import type { QueryClient } from "@tanstack/react-query";

import { projectKeys } from "@/modules/projects/api/query-keys";
import type { Project, ProjectMember } from "@/modules/projects/types/projects.types";

export function getProjects(queryClient: QueryClient): Project[] | undefined {
  return queryClient.getQueryData<Project[]>(projectKeys.all);
}

export function setProjects(queryClient: QueryClient, projects: Project[]): void {
  queryClient.setQueryData(projectKeys.all, projects);
}

export function removeProjectFromCache(
  queryClient: QueryClient,
  projectId: string,
): Project[] | undefined {
  const previous = getProjects(queryClient);
  if (!previous) return undefined;
  setProjects(
    queryClient,
    previous.filter((p) => p.id !== projectId),
  );
  return previous;
}

export function prependProjectToCache(
  queryClient: QueryClient,
  project: Project,
): Project[] | undefined {
  const previous = getProjects(queryClient);
  if (!previous) return undefined;
  setProjects(queryClient, [project, ...previous]);
  return previous;
}

export function replaceProjectInCache(
  queryClient: QueryClient,
  tempId: string,
  project: Project,
): void {
  const previous = getProjects(queryClient);
  if (!previous) return;
  setProjects(
    queryClient,
    previous.map((p) => (p.id === tempId ? project : p)),
  );
}

export function getProjectMembers(
  queryClient: QueryClient,
  projectId: string,
): ProjectMember[] | undefined {
  return queryClient.getQueryData<ProjectMember[]>(
    projectKeys.members(projectId),
  );
}

export function setProjectMembers(
  queryClient: QueryClient,
  projectId: string,
  members: ProjectMember[],
): void {
  queryClient.setQueryData(projectKeys.members(projectId), members);
}

export function removeMemberFromCache(
  queryClient: QueryClient,
  projectId: string,
  userId: string,
): ProjectMember[] | undefined {
  const previous = getProjectMembers(queryClient, projectId);
  if (!previous) return undefined;
  const next = previous.filter((m) => m.userId !== userId);
  setProjectMembers(queryClient, projectId, next);
  return previous;
}

export function appendMemberToCache(
  queryClient: QueryClient,
  projectId: string,
  member: ProjectMember,
): ProjectMember[] | undefined {
  const previous = getProjectMembers(queryClient, projectId);
  if (!previous) return undefined;
  setProjectMembers(queryClient, projectId, [...previous, member]);
  return previous;
}
