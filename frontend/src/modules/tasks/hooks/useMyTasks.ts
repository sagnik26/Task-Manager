import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { listProjects } from "../../../api/projects.api";
import { listTasks } from "../../../api/tasks.api";
import type { AssignedTask } from "../../../types/tasks";

export function useMyTasks(userId: string | undefined) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
    enabled: Boolean(userId),
  });

  const projects = projectsQuery.data ?? [];

  const taskQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["tasks", project.id, "assignee", userId],
      queryFn: () => listTasks(project.id, { assignee: userId }),
      enabled: Boolean(userId),
    })),
  });

  const tasks = useMemo((): AssignedTask[] => {
    return projects.flatMap((project, index) => {
      const projectTasks = taskQueries[index]?.data ?? [];
      return projectTasks.map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }));
    });
  }, [projects, taskQueries]);

  const isLoading =
    projectsQuery.isLoading || taskQueries.some((query) => query.isLoading);

  const isError =
    projectsQuery.isError || taskQueries.some((query) => query.isError);

  const error = projectsQuery.error ?? taskQueries.find((q) => q.error)?.error;

  return { tasks, isLoading, isError, error, refetch: projectsQuery.refetch };
}
