import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProjectMember } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import type { ProjectMember } from "@/modules/projects/types/projects.types";
import { appendMemberToCache } from "@/modules/projects/utils/optimisticProjectCache";
import { toApiError } from "@/shared/utils/apiErrors";

type AddMemberVariables = {
  userId: string;
  member: ProjectMember;
};

export function useAddProjectMember(
  projectId: string,
  options?: {
    onSuccess?: () => void;
    onError?: (message: string) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: AddMemberVariables) =>
      addProjectMember(projectId, userId),
    onMutate: async ({ member }) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.members(projectId),
      });
      const previous = appendMemberToCache(queryClient, projectId, member);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.members(projectId),
          context.previous,
        );
      }
      options?.onError?.(toApiError(error).message);
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
