import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTask } from "@/modules/tasks/api/tasks.api";
import { taskKeys } from "@/modules/tasks/api/query-keys";
import {
  invalidateTaskRelatedQueries,
  removeTaskFromCache,
} from "@/modules/tasks/utils/optimisticTaskCache";
import { toApiError } from "@/shared/utils/apiErrors";

export function useDeleteTask(
  projectId: string,
  options?: { onError?: (message: string) => void },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });
      const previous = removeTaskFromCache(queryClient, projectId, taskId);
      return { previous };
    },
    onError: (error, _taskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskKeys.byProject(projectId),
          context.previous,
        );
      }
      const apiError = toApiError(error);
      options?.onError?.(
        apiError.kind === "forbidden"
          ? "You don’t have permission to delete this task."
          : apiError.message,
      );
    },
    onSettled: async () => {
      await invalidateTaskRelatedQueries(queryClient, projectId);
    },
  });
}
