import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProject } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import { removeProjectFromCache } from "@/modules/projects/utils/optimisticProjectCache";
import { toApiError } from "@/shared/utils/apiErrors";

export function useDeleteProject(options?: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });
      const previous = removeProjectFromCache(queryClient, projectId);
      return { previous, projectId };
    },
    onError: (error, _projectId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.all, context.previous);
      }
      options?.onError?.(toApiError(error).message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      options?.onSuccess?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
