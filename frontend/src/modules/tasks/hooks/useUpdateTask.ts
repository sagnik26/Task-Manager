import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTask } from "@/modules/tasks/api/tasks.api";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import type { Task } from "@/modules/tasks/types/tasks.types";
import {
  invalidateTaskRelatedQueries,
  patchTaskInCache,
} from "@/modules/tasks/utils/optimisticTaskCache";
import { toApiError } from "@/shared/utils/apiErrors";

type UpdateTaskVariables = {
  taskId: string;
  patch: Partial<Omit<Task, "id">>;
};

export function useUpdateTask(
  projectId: string,
  options?: { onError?: (message: string) => void },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, patch }: UpdateTaskVariables) =>
      updateTask(taskId, patch),
    onMutate: async ({ taskId, patch }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });
      const previous = patchTaskInCache(queryClient, projectId, taskId, patch);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskKeys.byProject(projectId),
          context.previous,
        );
      }
      const apiError = toApiError(error);
      options?.onError?.(
        apiError.kind === "forbidden"
          ? "You don’t have permission to update this task."
          : apiError.message,
      );
    },
    onSettled: async () => {
      await invalidateTaskRelatedQueries(queryClient, projectId);
    },
  });
}
