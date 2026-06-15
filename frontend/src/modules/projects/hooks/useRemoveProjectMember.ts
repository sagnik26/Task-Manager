import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeProjectMember } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import { removeMemberFromCache } from "@/modules/projects/utils/optimisticProjectCache";
import { toApiError } from "@/shared/utils/apiErrors";

export function useRemoveProjectMember(
  projectId: string,
  options?: { onError?: (message: string) => void },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId, userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.members(projectId),
      });
      const previous = removeMemberFromCache(queryClient, projectId, userId);
      return { previous };
    },
    onError: (error, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.members(projectId),
          context.previous,
        );
      }
      options?.onError?.(toApiError(error).message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
