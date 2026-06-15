import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { projectKeys } from "@/modules/projects/api/query-keys";
import { listProjects } from "@/modules/projects/api/projects.api";
import { listTasks } from "@/modules/tasks/api/tasks.api";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import type { AssignedTask } from "@/modules/tasks/types/tasks.types";

export function useMyTasks(userId: string | undefined) {
  const projectsQuery = useQuery({
    queryKey: projectKeys.all,
    queryFn: listProjects,
    enabled: Boolean(userId),
  });

  const projects = projectsQuery.data ?? [];

  const taskQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: taskKeys.byAssignee(project.id, userId ?? ""),
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
