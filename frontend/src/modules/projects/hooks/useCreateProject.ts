import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  type CreateProjectPayload,
} from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";
import type { Project } from "@/modules/projects/types/projects.types";
import {
  prependProjectToCache,
  replaceProjectInCache,
} from "@/modules/projects/utils/optimisticProjectCache";

import { toApiError } from "@/shared/utils/apiErrors";

type CreateProjectVariables = CreateProjectPayload & { tempId: string };

export function useCreateProject(options?: {
  onError?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tempId: _tempId, ...payload }: CreateProjectVariables) =>
      createProject(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });
      const optimistic: Project = {
        id: payload.tempId,
        name: payload.name,
        description: payload.description,
      };
      const previous = prependProjectToCache(queryClient, optimistic);
      return { previous, tempId: payload.tempId };
    },
    onSuccess: (project, _vars, context) => {
      if (context?.tempId) {
        replaceProjectInCache(queryClient, context.tempId, project);
      }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(projectKeys.all, context.previous);
      }
      options?.onError?.(toApiError(error).message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function buildOptimisticProjectPayload(
  payload: CreateProjectPayload,
): CreateProjectVariables {
  return {
    ...payload,
    tempId: crypto.randomUUID(),
  };
}
