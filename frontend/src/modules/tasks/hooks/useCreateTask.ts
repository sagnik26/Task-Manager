import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask } from "@/modules/tasks/api/tasks.api";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import type { Task } from "@/modules/tasks/types/tasks.types";
import {
  appendTaskToCache,
  invalidateTaskRelatedQueries,
  removeTaskFromCache,
  replaceTaskInCache,
} from "@/modules/tasks/utils/optimisticTaskCache";
import { toApiError } from "@/shared/utils/apiErrors";

type CreateTaskVariables = Omit<Task, "id"> & { tempId: string };

export function useCreateTask(
  projectId: string,
  options?: { onError?: (message: string) => void },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tempId: _tempId, ...payload }: CreateTaskVariables) => {
      if (!projectId) throw new Error("projectId is required");
      return createTask(projectId, {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        assigneeId: payload.assigneeId,
        dueDate: payload.dueDate,
      });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });
      const optimisticTask: Task = {
        id: payload.tempId,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        assigneeId: payload.assigneeId,
        dueDate: payload.dueDate,
        projectId,
      };
      const previous = appendTaskToCache(
        queryClient,
        projectId,
        optimisticTask,
      );
      return { previous, tempId: payload.tempId };
    },
    onSuccess: (task, _vars, context) => {
      if (context?.tempId) {
        replaceTaskInCache(queryClient, projectId, context.tempId, task);
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskKeys.byProject(projectId),
          context.previous,
        );
      } else if (context?.tempId) {
        removeTaskFromCache(queryClient, projectId, context.tempId);
      }
      const apiError = toApiError(error);
      options?.onError?.(
        apiError.kind === "forbidden"
          ? "You don’t have permission to create this task."
          : apiError.message,
      );
    },
    onSettled: async () => {
      await invalidateTaskRelatedQueries(queryClient, projectId);
    },
  });
}

export function buildOptimisticTaskPayload(
  payload: Omit<Task, "id">,
): CreateTaskVariables {
  return {
    ...payload,
    tempId: crypto.randomUUID(),
  };
}
