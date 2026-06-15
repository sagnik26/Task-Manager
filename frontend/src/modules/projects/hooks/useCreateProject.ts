import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProject } from "@/modules/projects/api/projects.api";
import { projectKeys } from "@/modules/projects/api/query-keys";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
