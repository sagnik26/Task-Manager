export const taskKeys = {
  all: ["tasks"] as const,
  byProject: (projectId: string) => [...taskKeys.all, projectId] as const,
  byAssignee: (projectId: string, userId: string) =>
    [...taskKeys.byProject(projectId), "assignee", userId] as const,
};
